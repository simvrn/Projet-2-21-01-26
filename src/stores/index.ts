import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type {
  Goal,
  Expense,
  Income,
  ExpenseCategory,
  Routine,
  RoutineCompletion,
  Challenge,
  CalendarEvent,
  Stock,
  Asset,
  CashAccount,
  Crypto,
  ChronicleSection,
  ChronicleSubTheme,
  ChronicleEntry,
} from '@/types';

// === EXCHANGE RATES STORE ===
interface ExchangeRatesState {
  rates: Record<string, number>; // currency -> EUR rate (ex: USD -> 0.92)
  lastUpdated: string | null;
  loading: boolean;
  warning: string | null;
  fetchRates: () => Promise<void>;
  convertToEUR: (amount: number, fromCurrency: string) => number;
  getRate: (currency: string) => number | null;
}

export const useExchangeRatesStore = create<ExchangeRatesState>()(
  persist(
    (set, get) => ({
      rates: {
        EUR: 1,
        USD: 0.92,
        GBP: 1.17,
        CHF: 1.05,
        JPY: 0.0062,
      },
      lastUpdated: null,
      loading: false,
      warning: null,

      fetchRates: async () => {
        set({ loading: true, warning: null });
        try {
          const apiUrl = import.meta.env.DEV
            ? 'http://localhost:3001/api/exchange-rates?from=EUR'
            : '/api/exchange-rates?from=EUR';

          console.log('Fetching exchange rates from:', apiUrl);
          const response = await fetch(apiUrl);
          const data = await response.json();

          if (data.success && data.rates) {
            // Convertir les taux: API retourne EUR->X, on veut X->EUR
            const eurRates: Record<string, number> = { EUR: 1 };
            for (const [currency, info] of Object.entries(data.rates)) {
              if (currency !== 'EUR' && typeof info === 'object' && info !== null && 'rate' in info) {
                // Si EUR->USD = 1.08, alors USD->EUR = 1/1.08 = 0.926
                eurRates[currency] = 1 / (info as { rate: number }).rate;
              }
            }
            console.log('Exchange rates (to EUR):', eurRates);
            set({
              rates: eurRates,
              lastUpdated: data.date || new Date().toISOString(),
              loading: false,
              warning: data.warning || null,
            });
          } else {
            set({ loading: false, warning: 'Failed to fetch rates' });
          }
        } catch (error) {
          console.error('Error fetching exchange rates:', error);
          set({ loading: false, warning: 'Network error - using cached rates' });
        }
      },

      convertToEUR: (amount: number, fromCurrency: string) => {
        const rates = get().rates;
        const currency = fromCurrency?.toUpperCase() || 'EUR';

        if (currency === 'EUR') return amount;

        const rate = rates[currency];
        if (rate === undefined || rate === null) {
          console.warn(`No exchange rate for ${currency}, returning original amount`);
          return amount;
        }

        return Math.round(amount * rate);
      },

      getRate: (currency: string) => {
        const rates = get().rates;
        const cur = currency?.toUpperCase() || 'EUR';
        return rates[cur] ?? null;
      },
    }),
    { name: 'exchange-rates-storage' }
  )
);

// === GOALS STORE (avec Supabase) ===
interface GoalsState {
  goals: Goal[];
  loading: boolean;
  fetchGoals: () => Promise<void>;
  addGoal: (goal: Goal) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
}

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set) => ({
      goals: [],
      loading: false,

      fetchGoals: async () => {
        set({ loading: true });
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .order('start_date', { ascending: false });
        if (!error && data) {
          const goals: Goal[] = data.map((row) => ({
            id: row.id,
            name: row.name,
            description: row.description,
            image: row.image,
            color: row.color,
            startDate: row.start_date,
            endDate: row.end_date,
            durationDays: row.duration_days,
            status: row.status,
            createdAt: row.created_at,
          }));
          set({ goals, loading: false });
        } else {
          set({ loading: false });
        }
      },

      addGoal: async (goal) => {
        const { error } = await supabase.from('goals').insert({
          id: goal.id,
          name: goal.name,
          description: goal.description,
          image: goal.image,
          color: goal.color,
          start_date: goal.startDate,
          end_date: goal.endDate,
          duration_days: goal.durationDays,
          status: goal.status,
          created_at: goal.createdAt,
        });
        if (!error) {
          set((state) => ({ goals: [...state.goals, goal] }));
        }
      },

      updateGoal: async (id, updates) => {
        const dbUpdates: Record<string, unknown> = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.image !== undefined) dbUpdates.image = updates.image;
        if (updates.color !== undefined) dbUpdates.color = updates.color;
        if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
        if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
        if (updates.durationDays !== undefined) dbUpdates.duration_days = updates.durationDays;
        if (updates.status !== undefined) dbUpdates.status = updates.status;

        const { error } = await supabase.from('goals').update(dbUpdates).eq('id', id);
        if (!error) {
          set((state) => ({
            goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
          }));
        }
      },

      removeGoal: async (id) => {
        const { error } = await supabase.from('goals').delete().eq('id', id);
        if (!error) {
          set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
        }
      },
    }),
    { name: 'goals-storage' }
  )
);

// === EXPENSES STORE (avec Supabase) ===
interface ExpensesState {
  expenses: Expense[];
  incomes: Income[];
  categories: ExpenseCategory[];
  loading: boolean;
  fetchExpenses: () => Promise<void>;
  fetchIncomes: () => Promise<void>;
  addExpense: (expense: Expense) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  addIncome: (income: Income) => Promise<void>;
  removeIncome: (id: string) => Promise<void>;
  updateIncome: (id: string, updates: Partial<Income>) => Promise<void>;
  addCategory: (category: ExpenseCategory) => void;
  removeCategory: (id: string) => void;
}

export const useExpensesStore = create<ExpensesState>()(
  persist(
    (set) => ({
      expenses: [],
      incomes: [],
      loading: false,
      categories: [
        { id: '1', name: 'Soirée', color: '#ef4444' },
        { id: '2', name: 'Nourriture', color: '#22c55e' },
        { id: '3', name: 'Application', color: '#3b82f6' },
        { id: '4', name: 'Business', color: '#8b5cf6' },
        { id: '5', name: 'Bourse', color: '#f59e0b' },
      ],

      fetchExpenses: async () => {
        set({ loading: true });
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .order('date', { ascending: false });
        if (!error && data) {
          const expenses: Expense[] = data.map((row) => ({
            id: row.id,
            date: row.date,
            categoryId: row.category_id,
            amount: row.amount,
            description: row.description,
          }));
          set({ expenses, loading: false });
        } else {
          set({ loading: false });
        }
      },

      fetchIncomes: async () => {
        set({ loading: true });
        const { data, error } = await supabase
          .from('incomes')
          .select('*')
          .order('month', { ascending: false });
        if (!error && data) {
          const incomes: Income[] = data.map((row) => ({
            id: row.id,
            month: row.month,
            amount: row.amount,
            description: row.description,
          }));
          set({ incomes, loading: false });
        } else {
          set({ loading: false });
        }
      },

      addExpense: async (expense) => {
        const { error } = await supabase.from('expenses').insert({
          id: expense.id,
          date: expense.date,
          category_id: expense.categoryId,
          amount: expense.amount,
          description: expense.description,
        });
        if (!error) {
          set((state) => ({ expenses: [...state.expenses, expense] }));
        }
      },

      removeExpense: async (id) => {
        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (!error) {
          set((state) => ({
            expenses: state.expenses.filter((e) => e.id !== id),
          }));
        }
      },

      addIncome: async (income) => {
        const { error } = await supabase.from('incomes').insert({
          id: income.id,
          month: income.month,
          amount: income.amount,
          description: income.description,
        });
        if (!error) {
          set((state) => ({ incomes: [...state.incomes, income] }));
        }
      },

      removeIncome: async (id) => {
        const { error } = await supabase.from('incomes').delete().eq('id', id);
        if (!error) {
          set((state) => ({
            incomes: state.incomes.filter((i) => i.id !== id),
          }));
        }
      },

      updateIncome: async (id, updates) => {
        const dbUpdates: Record<string, unknown> = {};
        if (updates.month !== undefined) dbUpdates.month = updates.month;
        if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
        if (updates.description !== undefined) dbUpdates.description = updates.description;

        const { error } = await supabase
          .from('incomes')
          .update(dbUpdates)
          .eq('id', id);
        if (!error) {
          set((state) => ({
            incomes: state.incomes.map((i) =>
              i.id === id ? { ...i, ...updates } : i
            ),
          }));
        }
      },

      addCategory: (category) =>
        set((state) => ({ categories: [...state.categories, category] })),
      removeCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),
    }),
    { name: 'expenses-storage' }
  )
);

// === ROUTINES STORE (avec Supabase) ===
interface RoutinesState {
  routines: Routine[];
  completions: RoutineCompletion[];
  loading: boolean;
  fetchRoutines: () => Promise<void>;
  fetchCompletions: () => Promise<void>;
  addRoutine: (routine: Routine) => Promise<void>;
  removeRoutine: (id: string) => Promise<void>;
  updateRoutine: (id: string, updates: Partial<Routine>) => Promise<void>;
  toggleCompletion: (routineId: string, date: string) => Promise<void>;
}

export const useRoutinesStore = create<RoutinesState>()(
  persist(
    (set, get) => ({
      routines: [],
      completions: [],
      loading: false,

      fetchRoutines: async () => {
        set({ loading: true });
        const { data, error } = await supabase
          .from('routines')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          const routines: Routine[] = data.map((row) => ({
            id: row.id,
            name: row.name,
            frequency: row.frequency,
            weekDay: row.week_day,
            startDate: row.start_date,
            endDate: row.end_date,
            createdAt: row.created_at,
            active: row.active,
          }));
          set({ routines, loading: false });
        } else {
          set({ loading: false });
        }
      },

      fetchCompletions: async () => {
        const { data, error } = await supabase
          .from('routine_completions')
          .select('*');
        if (!error && data) {
          const completions: RoutineCompletion[] = data.map((row) => ({
            id: row.id,
            routineId: row.routine_id,
            date: row.date,
            completed: row.completed,
          }));
          set({ completions });
        }
      },

      addRoutine: async (routine) => {
        const { error } = await supabase.from('routines').insert({
          id: routine.id,
          name: routine.name,
          frequency: routine.frequency,
          week_day: routine.weekDay,
          start_date: routine.startDate,
          end_date: routine.endDate,
          created_at: routine.createdAt,
          active: routine.active,
        });
        if (!error) {
          set((state) => ({ routines: [...state.routines, routine] }));
        }
      },

      removeRoutine: async (id) => {
        const { error } = await supabase.from('routines').delete().eq('id', id);
        if (!error) {
          // Also delete completions for this routine
          await supabase.from('routine_completions').delete().eq('routine_id', id);
          set((state) => ({
            routines: state.routines.filter((r) => r.id !== id),
            completions: state.completions.filter((c) => c.routineId !== id),
          }));
        }
      },

      updateRoutine: async (id, updates) => {
        const dbUpdates: Record<string, unknown> = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
        if (updates.weekDay !== undefined) dbUpdates.week_day = updates.weekDay;
        if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
        if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
        if (updates.active !== undefined) dbUpdates.active = updates.active;

        const { error } = await supabase.from('routines').update(dbUpdates).eq('id', id);
        if (!error) {
          set((state) => ({
            routines: state.routines.map((r) =>
              r.id === id ? { ...r, ...updates } : r
            ),
          }));
        }
      },

      toggleCompletion: async (routineId, date) => {
        const existing = get().completions.find(
          (c) => c.routineId === routineId && c.date === date
        );

        if (existing) {
          // Update existing completion
          const { error } = await supabase
            .from('routine_completions')
            .update({ completed: !existing.completed })
            .eq('id', existing.id);
          if (!error) {
            set((state) => ({
              completions: state.completions.map((c) =>
                c.id === existing.id ? { ...c, completed: !c.completed } : c
              ),
            }));
          }
        } else {
          // Create new completion
          const newCompletion: RoutineCompletion = {
            id: crypto.randomUUID(),
            routineId,
            date,
            completed: true,
          };
          const { error } = await supabase.from('routine_completions').insert({
            id: newCompletion.id,
            routine_id: newCompletion.routineId,
            date: newCompletion.date,
            completed: newCompletion.completed,
          });
          if (!error) {
            set((state) => ({
              completions: [...state.completions, newCompletion],
            }));
          }
        }
      },
    }),
    { name: 'routines-storage' }
  )
);

// === CHALLENGES STORE ===
interface ChallengesState {
  challenges: Challenge[];
  addChallenge: (month: string, content: string) => void;
  removeChallenge: (id: string) => void;
  toggleChallengeComplete: (id: string) => void;
  updateChallengeContent: (id: string, content: string) => void;
}

export const useChallengesStore = create<ChallengesState>()(
  persist(
    (set) => ({
      challenges: [],
      addChallenge: (month, content) =>
        set((state) => ({
          challenges: [
            ...state.challenges,
            {
              id: crypto.randomUUID(),
              month,
              content,
              completed: false,
            },
          ],
        })),
      removeChallenge: (id) =>
        set((state) => ({
          challenges: state.challenges.filter((c) => c.id !== id),
        })),
      toggleChallengeComplete: (id) =>
        set((state) => ({
          challenges: state.challenges.map((c) =>
            c.id === id ? { ...c, completed: !c.completed } : c
          ),
        })),
      updateChallengeContent: (id, content) =>
        set((state) => ({
          challenges: state.challenges.map((c) =>
            c.id === id ? { ...c, content } : c
          ),
        })),
    }),
    { name: 'challenges-storage' }
  )
);

// === CALENDAR STORE (avec Supabase) ===
interface CalendarState {
  events: CalendarEvent[];
  loading: boolean;
  fetchEvents: () => Promise<void>;
  addEvent: (event: CalendarEvent) => Promise<void>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  removeEvent: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: [],
      loading: false,

      fetchEvents: async () => {
        set({ loading: true });
        const { data, error } = await supabase
          .from('calendar_events')
          .select('*')
          .order('date', { ascending: true });
        if (!error && data) {
          const events: CalendarEvent[] = data.map((row) => ({
            id: row.id,
            title: row.title,
            description: row.description,
            type: row.type,
            date: row.date,
            startTime: row.start_time,
            endTime: row.end_time,
            allDay: row.all_day,
            color: row.color,
            completed: row.completed,
            createdAt: row.created_at,
          }));
          set({ events, loading: false });
        } else {
          set({ loading: false });
        }
      },

      addEvent: async (event) => {
        const { error } = await supabase.from('calendar_events').insert({
          id: event.id,
          title: event.title,
          description: event.description,
          type: event.type,
          date: event.date,
          start_time: event.startTime,
          end_time: event.endTime,
          all_day: event.allDay,
          color: event.color,
          completed: event.completed,
          created_at: event.createdAt,
        });
        if (!error) {
          set((state) => ({ events: [...state.events, event] }));
        }
      },

      updateEvent: async (id, updates) => {
        const dbUpdates: Record<string, unknown> = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.type !== undefined) dbUpdates.type = updates.type;
        if (updates.date !== undefined) dbUpdates.date = updates.date;
        if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
        if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;
        if (updates.allDay !== undefined) dbUpdates.all_day = updates.allDay;
        if (updates.color !== undefined) dbUpdates.color = updates.color;
        if (updates.completed !== undefined) dbUpdates.completed = updates.completed;

        const { error } = await supabase
          .from('calendar_events')
          .update(dbUpdates)
          .eq('id', id);
        if (!error) {
          set((state) => ({
            events: state.events.map((e) =>
              e.id === id ? { ...e, ...updates } : e
            ),
          }));
        }
      },

      removeEvent: async (id) => {
        const { error } = await supabase.from('calendar_events').delete().eq('id', id);
        if (!error) {
          set((state) => ({
            events: state.events.filter((e) => e.id !== id),
          }));
        }
      },

      toggleTaskComplete: async (id) => {
        const event = get().events.find((e) => e.id === id);
        if (event) {
          await get().updateEvent(id, { completed: !event.completed });
        }
      },
    }),
    { name: 'calendar-storage' }
  )
);

// === FINANCE STORE (avec Supabase) ===
interface FinanceState {
  stocks: Stock[];
  assets: Asset[];
  cryptos: Crypto[];
  cashAccounts: CashAccount[];
  loading: boolean;
  // Stocks
  fetchStocks: () => Promise<void>;
  addStock: (stock: Stock) => Promise<void>;
  updateStock: (id: string, updates: Partial<Stock>) => Promise<void>;
  removeStock: (id: string) => Promise<void>;
  updateStockPrice: (id: string, price: number) => Promise<void>;
  fetchStockPrices: () => Promise<void>;
  // Assets
  fetchAssets: () => Promise<void>;
  addAsset: (asset: Asset) => Promise<void>;
  updateAsset: (id: string, updates: Partial<Asset>) => Promise<void>;
  removeAsset: (id: string) => Promise<void>;
  // Cryptos
  fetchCryptos: () => Promise<void>;
  addCrypto: (crypto: Crypto) => Promise<void>;
  updateCrypto: (id: string, updates: Partial<Crypto>) => Promise<void>;
  removeCrypto: (id: string) => Promise<void>;
  // Cash
  fetchCashAccounts: () => Promise<void>;
  addCashAccount: (account: CashAccount) => Promise<void>;
  updateCashAccount: (id: string, updates: Partial<CashAccount>) => Promise<void>;
  removeCashAccount: (id: string) => Promise<void>;
}

// Fonction pour récupérer les prix des actions via notre API Vercel
async function fetchStockPricesFromAPI(tickers: string[]): Promise<Record<string, { price: number; currency: string; change: number; changePercent: number } | null>> {
  try {
    const apiUrl = import.meta.env.DEV
      ? `http://localhost:3001/api/stock-price?symbols=${tickers.join(',')}`
      : `/api/stock-price?symbols=${tickers.join(',')}`;

    console.log('Fetching stock prices from:', apiUrl);
    const response = await fetch(apiUrl);
    console.log('Response status:', response.status);

    if (!response.ok) {
      console.error('API response not OK:', response.status);
      return {};
    }

    const data = await response.json();
    console.log('API response data:', data);

    if (!data.success) {
      console.error('API returned success: false');
      return {};
    }

    const results: Record<string, { price: number; currency: string; change: number; changePercent: number } | null> = {};
    for (const [symbol, info] of Object.entries(data.data)) {
      if (info && typeof info === 'object' && 'price' in info) {
        const stockInfo = info as { price: number; currency: string; change: number; changePercent: number };
        results[symbol] = {
          price: Math.round(stockInfo.price * 100), // Convertir en centimes
          currency: stockInfo.currency || 'USD',
          change: stockInfo.change,
          changePercent: stockInfo.changePercent,
        };
      } else {
        results[symbol] = null;
      }
    }
    console.log('Processed prices:', results);
    return results;
  } catch (error) {
    console.error('Error fetching stock prices:', error);
    return {};
  }
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      stocks: [],
      assets: [],
      cryptos: [],
      cashAccounts: [],
      loading: false,

      // === STOCKS ===
      fetchStocks: async () => {
        set({ loading: true });
        const { data, error } = await supabase
          .from('stocks')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          const stocks: Stock[] = data.map((row) => ({
            id: row.id,
            ticker: row.ticker,
            name: row.name,
            quantity: row.quantity,
            purchasePrice: row.purchase_price,
            purchaseCurrency: row.purchase_currency || 'EUR',
            purchaseDate: row.purchase_date,
            currentPrice: row.current_price,
            currentPriceCurrency: row.current_price_currency,
            lastUpdated: row.last_updated,
            sold: row.sold || false,
            salePrice: row.sale_price,
            saleCurrency: row.sale_currency,
            saleDate: row.sale_date,
            createdAt: row.created_at,
          }));
          set({ stocks, loading: false });
        } else {
          set({ loading: false });
        }
      },

      addStock: async (stock) => {
        console.log('Adding stock:', stock);
        const { error } = await supabase.from('stocks').insert({
          id: stock.id,
          ticker: stock.ticker,
          name: stock.name,
          quantity: stock.quantity,
          purchase_price: stock.purchasePrice,
          purchase_currency: stock.purchaseCurrency || 'EUR',
          purchase_date: stock.purchaseDate,
          current_price: stock.currentPrice,
          current_price_currency: stock.currentPriceCurrency,
          last_updated: stock.lastUpdated,
          sold: stock.sold || false,
          sale_price: stock.salePrice,
          sale_currency: stock.saleCurrency,
          sale_date: stock.saleDate,
          created_at: stock.createdAt,
        });
        if (error) {
          console.error('Error adding stock:', error);
        } else {
          set((state) => ({ stocks: [...state.stocks, stock] }));
        }
      },

      updateStock: async (id, updates) => {
        console.log('Updating stock:', id, updates);
        const dbUpdates: Record<string, unknown> = {};
        if (updates.ticker !== undefined) dbUpdates.ticker = updates.ticker;
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
        if (updates.purchasePrice !== undefined) dbUpdates.purchase_price = updates.purchasePrice;
        if (updates.purchaseCurrency !== undefined) dbUpdates.purchase_currency = updates.purchaseCurrency;
        if (updates.purchaseDate !== undefined) dbUpdates.purchase_date = updates.purchaseDate;
        if (updates.currentPrice !== undefined) dbUpdates.current_price = updates.currentPrice;
        if (updates.currentPriceCurrency !== undefined) dbUpdates.current_price_currency = updates.currentPriceCurrency;
        if (updates.lastUpdated !== undefined) dbUpdates.last_updated = updates.lastUpdated;
        if (updates.sold !== undefined) dbUpdates.sold = updates.sold;
        if (updates.salePrice !== undefined) dbUpdates.sale_price = updates.salePrice;
        if (updates.saleCurrency !== undefined) dbUpdates.sale_currency = updates.saleCurrency;
        if (updates.saleDate !== undefined) dbUpdates.sale_date = updates.saleDate;

        const { error } = await supabase.from('stocks').update(dbUpdates).eq('id', id);
        if (error) {
          console.error('Error updating stock:', error);
        } else {
          set((state) => ({
            stocks: state.stocks.map((s) => (s.id === id ? { ...s, ...updates } : s)),
          }));
        }
      },

      removeStock: async (id) => {
        const { error } = await supabase.from('stocks').delete().eq('id', id);
        if (!error) {
          set((state) => ({ stocks: state.stocks.filter((s) => s.id !== id) }));
        }
      },

      updateStockPrice: async (id, price) => {
        await get().updateStock(id, {
          currentPrice: price,
          lastUpdated: new Date().toISOString(),
        });
      },

      fetchStockPrices: async () => {
        const stocks = get().stocks.filter(s => !s.sold);
        if (stocks.length === 0) return;

        const tickers = stocks.map((s) => s.ticker);
        const prices = await fetchStockPricesFromAPI(tickers);

        for (const stock of stocks) {
          const priceInfo = prices[stock.ticker];
          if (priceInfo !== null && priceInfo !== undefined) {
            await get().updateStock(stock.id, {
              currentPrice: priceInfo.price,
              currentPriceCurrency: priceInfo.currency || 'USD',
              lastUpdated: new Date().toISOString(),
            });
          }
        }
      },

      // === ASSETS ===
      fetchAssets: async () => {
        set({ loading: true });
        const { data, error } = await supabase
          .from('assets')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          const assets: Asset[] = data.map((row) => ({
            id: row.id,
            name: row.name,
            description: row.description,
            purchasePrice: row.purchase_price,
            currentValue: row.current_value,
            purchaseDate: row.purchase_date,
            category: row.category,
            sold: row.sold || false,
            salePrice: row.sale_price,
            saleDate: row.sale_date,
            createdAt: row.created_at,
          }));
          set({ assets, loading: false });
        } else {
          set({ loading: false });
        }
      },

      addAsset: async (asset) => {
        console.log('Adding asset:', asset);
        const { error } = await supabase.from('assets').insert({
          id: asset.id,
          name: asset.name,
          description: asset.description,
          purchase_price: asset.purchasePrice,
          current_value: asset.currentValue,
          purchase_date: asset.purchaseDate,
          category: asset.category,
          sold: asset.sold || false,
          sale_price: asset.salePrice,
          sale_date: asset.saleDate,
          created_at: asset.createdAt,
        });
        if (error) {
          console.error('Error adding asset:', error);
        } else {
          set((state) => ({ assets: [...state.assets, asset] }));
        }
      },

      updateAsset: async (id, updates) => {
        console.log('Updating asset:', id, updates);
        const dbUpdates: Record<string, unknown> = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.purchasePrice !== undefined) dbUpdates.purchase_price = updates.purchasePrice;
        if (updates.currentValue !== undefined) dbUpdates.current_value = updates.currentValue;
        if (updates.purchaseDate !== undefined) dbUpdates.purchase_date = updates.purchaseDate;
        if (updates.category !== undefined) dbUpdates.category = updates.category;
        if (updates.sold !== undefined) dbUpdates.sold = updates.sold;
        if (updates.salePrice !== undefined) dbUpdates.sale_price = updates.salePrice;
        if (updates.saleDate !== undefined) dbUpdates.sale_date = updates.saleDate;

        const { error } = await supabase.from('assets').update(dbUpdates).eq('id', id);
        if (error) {
          console.error('Error updating asset:', error);
        } else {
          set((state) => ({
            assets: state.assets.map((a) => (a.id === id ? { ...a, ...updates } : a)),
          }));
        }
      },

      removeAsset: async (id) => {
        const { error } = await supabase.from('assets').delete().eq('id', id);
        if (!error) {
          set((state) => ({ assets: state.assets.filter((a) => a.id !== id) }));
        }
      },

      // === CRYPTOS ===
      fetchCryptos: async () => {
        set({ loading: true });
        const { data, error } = await supabase
          .from('cryptos')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          const cryptos: Crypto[] = data.map((row) => ({
            id: row.id,
            symbol: row.symbol,
            name: row.name,
            quantity: row.quantity,
            purchasePrice: row.purchase_price,
            purchaseCurrency: row.purchase_currency || 'EUR',
            purchaseDate: row.purchase_date,
            currentPrice: row.current_price,
            currentPriceCurrency: row.current_price_currency,
            lastUpdated: row.last_updated,
            sold: row.sold || false,
            salePrice: row.sale_price,
            saleCurrency: row.sale_currency,
            saleDate: row.sale_date,
            createdAt: row.created_at,
          }));
          set({ cryptos, loading: false });
        } else {
          set({ loading: false });
        }
      },

      addCrypto: async (crypto) => {
        console.log('Adding crypto:', crypto);
        const { error } = await supabase.from('cryptos').insert({
          id: crypto.id,
          symbol: crypto.symbol,
          name: crypto.name,
          quantity: crypto.quantity,
          purchase_price: crypto.purchasePrice,
          purchase_currency: crypto.purchaseCurrency || 'EUR',
          purchase_date: crypto.purchaseDate,
          current_price: crypto.currentPrice,
          current_price_currency: crypto.currentPriceCurrency,
          last_updated: crypto.lastUpdated,
          sold: crypto.sold || false,
          sale_price: crypto.salePrice,
          sale_currency: crypto.saleCurrency,
          sale_date: crypto.saleDate,
          created_at: crypto.createdAt,
        });
        if (error) {
          console.error('Error adding crypto:', error);
        } else {
          set((state) => ({ cryptos: [...state.cryptos, crypto] }));
        }
      },

      updateCrypto: async (id, updates) => {
        console.log('Updating crypto:', id, updates);
        const dbUpdates: Record<string, unknown> = {};
        if (updates.symbol !== undefined) dbUpdates.symbol = updates.symbol;
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
        if (updates.purchasePrice !== undefined) dbUpdates.purchase_price = updates.purchasePrice;
        if (updates.purchaseCurrency !== undefined) dbUpdates.purchase_currency = updates.purchaseCurrency;
        if (updates.purchaseDate !== undefined) dbUpdates.purchase_date = updates.purchaseDate;
        if (updates.currentPrice !== undefined) dbUpdates.current_price = updates.currentPrice;
        if (updates.currentPriceCurrency !== undefined) dbUpdates.current_price_currency = updates.currentPriceCurrency;
        if (updates.lastUpdated !== undefined) dbUpdates.last_updated = updates.lastUpdated;
        if (updates.sold !== undefined) dbUpdates.sold = updates.sold;
        if (updates.salePrice !== undefined) dbUpdates.sale_price = updates.salePrice;
        if (updates.saleCurrency !== undefined) dbUpdates.sale_currency = updates.saleCurrency;
        if (updates.saleDate !== undefined) dbUpdates.sale_date = updates.saleDate;

        const { error } = await supabase.from('cryptos').update(dbUpdates).eq('id', id);
        if (error) {
          console.error('Error updating crypto:', error);
        } else {
          set((state) => ({
            cryptos: state.cryptos.map((c) => (c.id === id ? { ...c, ...updates } : c)),
          }));
        }
      },

      removeCrypto: async (id) => {
        const { error } = await supabase.from('cryptos').delete().eq('id', id);
        if (!error) {
          set((state) => ({ cryptos: state.cryptos.filter((c) => c.id !== id) }));
        }
      },

      // === CASH ACCOUNTS ===
      fetchCashAccounts: async () => {
        set({ loading: true });
        const { data, error } = await supabase
          .from('cash_accounts')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          const cashAccounts: CashAccount[] = data.map((row) => ({
            id: row.id,
            name: row.name,
            balance: row.balance,
            currency: row.currency,
            createdAt: row.created_at,
          }));
          set({ cashAccounts, loading: false });
        } else {
          set({ loading: false });
        }
      },

      addCashAccount: async (account) => {
        const { error } = await supabase.from('cash_accounts').insert({
          id: account.id,
          name: account.name,
          balance: account.balance,
          currency: account.currency,
          created_at: account.createdAt,
        });
        if (!error) {
          set((state) => ({ cashAccounts: [...state.cashAccounts, account] }));
        }
      },

      updateCashAccount: async (id, updates) => {
        const dbUpdates: Record<string, unknown> = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.balance !== undefined) dbUpdates.balance = updates.balance;
        if (updates.currency !== undefined) dbUpdates.currency = updates.currency;

        const { error } = await supabase.from('cash_accounts').update(dbUpdates).eq('id', id);
        if (!error) {
          set((state) => ({
            cashAccounts: state.cashAccounts.map((c) =>
              c.id === id ? { ...c, ...updates } : c
            ),
          }));
        }
      },

      removeCashAccount: async (id) => {
        const { error } = await supabase.from('cash_accounts').delete().eq('id', id);
        if (!error) {
          set((state) => ({ cashAccounts: state.cashAccounts.filter((c) => c.id !== id) }));
        }
      },
    }),
    { name: 'finance-storage' }
  )
);

// === CHRONICLES STORE (Structure hierarchique extensible avec Supabase) ===
interface ChroniclesState {
  sections: ChronicleSection[];
  subThemes: ChronicleSubTheme[];
  entries: ChronicleEntry[];
  loading: boolean;
  // Sections
  fetchSections: () => Promise<void>;
  addSection: (section: ChronicleSection) => Promise<void>;
  updateSection: (id: string, updates: Partial<ChronicleSection>) => Promise<void>;
  removeSection: (id: string) => Promise<void>;
  // SubThemes
  fetchSubThemes: () => Promise<void>;
  addSubTheme: (subTheme: ChronicleSubTheme) => Promise<void>;
  updateSubTheme: (id: string, updates: Partial<ChronicleSubTheme>) => Promise<void>;
  removeSubTheme: (id: string) => Promise<void>;
  // Entries
  fetchEntries: () => Promise<void>;
  addEntry: (entry: ChronicleEntry) => Promise<void>;
  updateEntry: (id: string, updates: Partial<ChronicleEntry>) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
}

export const useChroniclesStore = create<ChroniclesState>()(
  persist(
    (set) => ({
      sections: [],
      subThemes: [],
      entries: [],
      loading: false,

      // === SECTIONS ===
      fetchSections: async () => {
        set({ loading: true });
        const { data, error } = await supabase
          .from('chronicle_sections')
          .select('*')
          .order('order', { ascending: true });
        console.log('fetchSections:', { data, error });
        if (!error && data) {
          const sections: ChronicleSection[] = data.map((row) => ({
            id: row.id,
            name: row.name,
            image: row.image,
            order: row.order,
            createdAt: row.created_at,
          }));
          set({ sections, loading: false });
        } else {
          console.error('fetchSections error:', error);
          set({ loading: false });
        }
      },

      addSection: async (section) => {
        console.log('Adding section:', section);
        const { data, error } = await supabase.from('chronicle_sections').insert({
          id: section.id,
          name: section.name,
          image: section.image,
          order: section.order,
          created_at: section.createdAt,
        }).select();

        if (error) {
          console.error('Supabase error (section):', error);
          alert(`Erreur sauvegarde section: ${error.message}\nCode: ${error.code}\nDetails: ${error.details || 'N/A'}`);
        } else {
          console.log('Section saved:', data);
          // Refetch pour synchroniser avec la base
          const { data: freshData } = await supabase
            .from('chronicle_sections')
            .select('*')
            .order('order', { ascending: true });
          if (freshData) {
            const sections: ChronicleSection[] = freshData.map((row) => ({
              id: row.id,
              name: row.name,
              image: row.image,
              order: row.order,
              createdAt: row.created_at,
            }));
            set({ sections });
          }
        }
      },

      updateSection: async (id, updates) => {
        // Mettre a jour localement d'abord
        set((state) => ({
          sections: state.sections.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }));

        const dbUpdates: Record<string, unknown> = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.image !== undefined) dbUpdates.image = updates.image;
        if (updates.order !== undefined) dbUpdates.order = updates.order;

        const { error } = await supabase.from('chronicle_sections').update(dbUpdates).eq('id', id);
        if (error) {
          console.warn('Supabase error (updateSection):', error.message);
        }
      },

      removeSection: async (id) => {
        // Supprimer localement d'abord
        set((state) => ({
          sections: state.sections.filter((s) => s.id !== id),
          subThemes: state.subThemes.filter((st) => st.sectionId !== id),
          entries: state.entries.filter((e) => {
            const subTheme = state.subThemes.find((st) => st.id === e.subThemeId);
            return subTheme?.sectionId !== id;
          }),
        }));

        const { error } = await supabase.from('chronicle_sections').delete().eq('id', id);
        if (error) {
          console.warn('Supabase error (removeSection):', error.message);
        }
      },

      // === SUB-THEMES ===
      fetchSubThemes: async () => {
        const { data, error } = await supabase
          .from('chronicle_subthemes')
          .select('*')
          .order('order', { ascending: true });
        if (!error && data) {
          const subThemes: ChronicleSubTheme[] = data.map((row) => ({
            id: row.id,
            sectionId: row.section_id,
            name: row.name,
            image: row.image,
            description: row.description,
            order: row.order,
            createdAt: row.created_at,
          }));
          set({ subThemes });
        }
      },

      addSubTheme: async (subTheme) => {
        console.log('Adding subTheme:', subTheme);
        const { data, error } = await supabase.from('chronicle_subthemes').insert({
          id: subTheme.id,
          section_id: subTheme.sectionId,
          name: subTheme.name,
          image: subTheme.image,
          description: subTheme.description,
          order: subTheme.order,
          created_at: subTheme.createdAt,
        }).select();

        if (error) {
          console.error('Supabase error (subTheme):', error);
          alert(`Erreur sauvegarde sous-thème: ${error.message}\nCode: ${error.code}\nDetails: ${error.details || 'N/A'}`);
        } else {
          console.log('SubTheme saved:', data);
          // Refetch pour synchroniser avec la base
          const { data: freshData } = await supabase
            .from('chronicle_subthemes')
            .select('*')
            .order('order', { ascending: true });
          if (freshData) {
            const subThemes: ChronicleSubTheme[] = freshData.map((row) => ({
              id: row.id,
              sectionId: row.section_id,
              name: row.name,
              image: row.image,
              description: row.description,
              order: row.order,
              createdAt: row.created_at,
            }));
            set({ subThemes });
          }
        }
      },

      updateSubTheme: async (id, updates) => {
        // Mettre a jour localement d'abord
        set((state) => ({
          subThemes: state.subThemes.map((st) => (st.id === id ? { ...st, ...updates } : st)),
        }));

        const dbUpdates: Record<string, unknown> = {};
        if (updates.sectionId !== undefined) dbUpdates.section_id = updates.sectionId;
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.image !== undefined) dbUpdates.image = updates.image;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.order !== undefined) dbUpdates.order = updates.order;

        const { error } = await supabase.from('chronicle_subthemes').update(dbUpdates).eq('id', id);
        if (error) {
          console.warn('Supabase error (updateSubTheme):', error.message);
        }
      },

      removeSubTheme: async (id) => {
        // Supprimer localement d'abord
        set((state) => ({
          subThemes: state.subThemes.filter((st) => st.id !== id),
          entries: state.entries.filter((e) => e.subThemeId !== id),
        }));

        const { error } = await supabase.from('chronicle_subthemes').delete().eq('id', id);
        if (error) {
          console.warn('Supabase error (removeSubTheme):', error.message);
        }
      },

      // === ENTRIES ===
      fetchEntries: async () => {
        const { data, error } = await supabase
          .from('chronicle_entries')
          .select('*')
          .order('order', { ascending: true });
        if (!error && data) {
          const entries: ChronicleEntry[] = data.map((row) => ({
            id: row.id,
            subThemeId: row.subtheme_id,
            name: row.name,
            image: row.image,
            category: row.category,
            description: row.description,
            annexe: row.annexe,
            order: row.order,
            createdAt: row.created_at,
          }));
          set({ entries });
        }
      },

      addEntry: async (entry) => {
        console.log('Adding entry:', entry);
        const { data, error } = await supabase.from('chronicle_entries').insert({
          id: entry.id,
          subtheme_id: entry.subThemeId,
          name: entry.name,
          image: entry.image,
          category: entry.category,
          description: entry.description,
          annexe: entry.annexe,
          order: entry.order,
          created_at: entry.createdAt,
        }).select();

        if (error) {
          console.error('Supabase error (entry):', error);
          alert(`Erreur sauvegarde entrée: ${error.message}\nCode: ${error.code}\nDetails: ${error.details || 'N/A'}`);
        } else {
          console.log('Entry saved:', data);
          // Refetch pour synchroniser avec la base
          const { data: freshData } = await supabase
            .from('chronicle_entries')
            .select('*')
            .order('order', { ascending: true });
          if (freshData) {
            const entries: ChronicleEntry[] = freshData.map((row) => ({
              id: row.id,
              subThemeId: row.subtheme_id,
              name: row.name,
              image: row.image,
              category: row.category,
              description: row.description,
              annexe: row.annexe,
              order: row.order,
              createdAt: row.created_at,
            }));
            set({ entries });
          }
        }
      },

      updateEntry: async (id, updates) => {
        // Mettre a jour localement d'abord
        set((state) => ({
          entries: state.entries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        }));

        const dbUpdates: Record<string, unknown> = {};
        if (updates.subThemeId !== undefined) dbUpdates.subtheme_id = updates.subThemeId;
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.image !== undefined) dbUpdates.image = updates.image;
        if (updates.category !== undefined) dbUpdates.category = updates.category;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.annexe !== undefined) dbUpdates.annexe = updates.annexe;
        if (updates.order !== undefined) dbUpdates.order = updates.order;

        const { error } = await supabase.from('chronicle_entries').update(dbUpdates).eq('id', id);
        if (error) {
          console.warn('Supabase error (updateEntry):', error.message);
        }
      },

      removeEntry: async (id) => {
        // Supprimer localement d'abord
        set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }));

        const { error } = await supabase.from('chronicle_entries').delete().eq('id', id);
        if (error) {
          console.warn('Supabase error (removeEntry):', error.message);
        }
      },
    }),
    { name: 'chronicles-storage' }
  )
);
