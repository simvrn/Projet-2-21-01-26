import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type {
  Objective,
  TimeEntry,
  Expense,
  Income,
  ExpenseCategory,
  Dish,
  Person,
  PersonCategory,
  Routine,
  RoutineCompletion,
  Challenge,
  CalendarEvent,
  Stock,
  Asset,
  CashAccount,
} from '@/types';

// === OBJECTIVES STORE ===
interface ObjectivesState {
  objectives: Objective[];
  timeEntries: TimeEntry[];
  addObjective: (objective: Objective) => void;
  removeObjective: (id: string) => void;
  addTimeEntry: (entry: TimeEntry) => void;
  removeTimeEntry: (id: string) => void;
  updateTimeEntry: (id: string, entry: Partial<TimeEntry>) => void;
}

export const useObjectivesStore = create<ObjectivesState>()(
  persist(
    (set) => ({
      objectives: [],
      timeEntries: [],
      addObjective: (objective) =>
        set((state) => ({ objectives: [...state.objectives, objective] })),
      removeObjective: (id) =>
        set((state) => ({
          objectives: state.objectives.filter((o) => o.id !== id),
          timeEntries: state.timeEntries.filter((e) => e.objectiveId !== id),
        })),
      addTimeEntry: (entry) =>
        set((state) => ({ timeEntries: [...state.timeEntries, entry] })),
      removeTimeEntry: (id) =>
        set((state) => ({
          timeEntries: state.timeEntries.filter((e) => e.id !== id),
        })),
      updateTimeEntry: (id, updates) =>
        set((state) => ({
          timeEntries: state.timeEntries.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),
    }),
    { name: 'objectives-storage' }
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

// === FOOD STORE ===
interface FoodState {
  dishes: Dish[];
  addDish: (dish: Dish) => void;
  updateDish: (id: string, dish: Partial<Dish>) => void;
  removeDish: (id: string) => void;
}

export const useFoodStore = create<FoodState>()(
  persist(
    (set) => ({
      dishes: [],
      addDish: (dish) => set((state) => ({ dishes: [...state.dishes, dish] })),
      updateDish: (id, updates) =>
        set((state) => ({
          dishes: state.dishes.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        })),
      removeDish: (id) =>
        set((state) => ({ dishes: state.dishes.filter((d) => d.id !== id) })),
    }),
    { name: 'food-storage' }
  )
);

// === PERSONS STORE (BIOGRAPHIE) ===
interface PersonsState {
  persons: Person[];
  categories: PersonCategory[];
  addPerson: (person: Person) => void;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  removePerson: (id: string) => void;
  addCategory: (category: PersonCategory) => void;
  removeCategory: (id: string) => void;
  updateCategory: (id: string, updates: Partial<PersonCategory>) => void;
}

export const usePersonsStore = create<PersonsState>()(
  persist(
    (set) => ({
      persons: [],
      categories: [
        { id: '1', name: 'Entrepreneur', color: '#06b6d4' },
        { id: '2', name: 'Philosophe', color: '#a855f7' },
        { id: '3', name: 'Artiste', color: '#ec4899' },
        { id: '4', name: 'Scientifique', color: '#22c55e' },
        { id: '5', name: 'Athlète', color: '#f59e0b' },
      ],
      addPerson: (person) =>
        set((state) => ({ persons: [...state.persons, person] })),
      updatePerson: (id, updates) =>
        set((state) => ({
          persons: state.persons.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      removePerson: (id) =>
        set((state) => ({
          persons: state.persons.filter((p) => p.id !== id),
        })),
      addCategory: (category) =>
        set((state) => ({ categories: [...state.categories, category] })),
      removeCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          // Optionally reassign persons with this category
        })),
      updateCategory: (id, updates) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
    }),
    { name: 'persons-storage' }
  )
);

// === ROUTINES STORE ===
interface RoutinesState {
  routines: Routine[];
  completions: RoutineCompletion[];
  addRoutine: (routine: Routine) => void;
  removeRoutine: (id: string) => void;
  updateRoutine: (id: string, updates: Partial<Routine>) => void;
  toggleCompletion: (routineId: string, date: string) => void;
}

export const useRoutinesStore = create<RoutinesState>()(
  persist(
    (set) => ({
      routines: [],
      completions: [],
      addRoutine: (routine) =>
        set((state) => ({ routines: [...state.routines, routine] })),
      removeRoutine: (id) =>
        set((state) => ({
          routines: state.routines.filter((r) => r.id !== id),
          completions: state.completions.filter((c) => c.routineId !== id),
        })),
      updateRoutine: (id, updates) =>
        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),
      toggleCompletion: (routineId, date) =>
        set((state) => {
          const existing = state.completions.find(
            (c) => c.routineId === routineId && c.date === date
          );
          if (existing) {
            return {
              completions: state.completions.map((c) =>
                c.id === existing.id ? { ...c, completed: !c.completed } : c
              ),
            };
          }
          return {
            completions: [
              ...state.completions,
              {
                id: crypto.randomUUID(),
                routineId,
                date,
                completed: true,
              },
            ],
          };
        }),
    }),
    { name: 'routines-storage' }
  )
);

// === CHALLENGES STORE ===
interface ChallengesState {
  challenges: Challenge[];
  updateChallenge: (month: string, content: string) => void;
}

export const useChallengesStore = create<ChallengesState>()(
  persist(
    (set) => ({
      challenges: [],
      updateChallenge: (month, content) =>
        set((state) => {
          const existing = state.challenges.find((c) => c.month === month);
          if (existing) {
            return {
              challenges: state.challenges.map((c) =>
                c.month === month ? { ...c, content } : c
              ),
            };
          }
          return {
            challenges: [...state.challenges, { month, content }],
          };
        }),
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
  // Cash
  fetchCashAccounts: () => Promise<void>;
  addCashAccount: (account: CashAccount) => Promise<void>;
  updateCashAccount: (id: string, updates: Partial<CashAccount>) => Promise<void>;
  removeCashAccount: (id: string) => Promise<void>;
}

// Fonction pour récupérer le prix d'une action via Yahoo Finance
async function fetchYahooPrice(ticker: string): Promise<number | null> {
  try {
    // Utilisation d'un proxy CORS gratuit pour Yahoo Finance
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`
    );
    if (!response.ok) return null;
    const data = await response.json();
    const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
    return price ? Math.round(price * 100) : null; // Convertir en centimes
  } catch {
    return null;
  }
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      stocks: [],
      assets: [],
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
            purchaseDate: row.purchase_date,
            currentPrice: row.current_price,
            lastUpdated: row.last_updated,
            createdAt: row.created_at,
          }));
          set({ stocks, loading: false });
        } else {
          set({ loading: false });
        }
      },

      addStock: async (stock) => {
        const { error } = await supabase.from('stocks').insert({
          id: stock.id,
          ticker: stock.ticker,
          name: stock.name,
          quantity: stock.quantity,
          purchase_price: stock.purchasePrice,
          purchase_date: stock.purchaseDate,
          current_price: stock.currentPrice,
          last_updated: stock.lastUpdated,
          created_at: stock.createdAt,
        });
        if (!error) {
          set((state) => ({ stocks: [...state.stocks, stock] }));
        }
      },

      updateStock: async (id, updates) => {
        const dbUpdates: Record<string, unknown> = {};
        if (updates.ticker !== undefined) dbUpdates.ticker = updates.ticker;
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
        if (updates.purchasePrice !== undefined) dbUpdates.purchase_price = updates.purchasePrice;
        if (updates.purchaseDate !== undefined) dbUpdates.purchase_date = updates.purchaseDate;
        if (updates.currentPrice !== undefined) dbUpdates.current_price = updates.currentPrice;
        if (updates.lastUpdated !== undefined) dbUpdates.last_updated = updates.lastUpdated;

        const { error } = await supabase.from('stocks').update(dbUpdates).eq('id', id);
        if (!error) {
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
        const stocks = get().stocks;
        for (const stock of stocks) {
          const price = await fetchYahooPrice(stock.ticker);
          if (price !== null) {
            await get().updateStockPrice(stock.id, price);
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
            createdAt: row.created_at,
          }));
          set({ assets, loading: false });
        } else {
          set({ loading: false });
        }
      },

      addAsset: async (asset) => {
        const { error } = await supabase.from('assets').insert({
          id: asset.id,
          name: asset.name,
          description: asset.description,
          purchase_price: asset.purchasePrice,
          current_value: asset.currentValue,
          purchase_date: asset.purchaseDate,
          category: asset.category,
          created_at: asset.createdAt,
        });
        if (!error) {
          set((state) => ({ assets: [...state.assets, asset] }));
        }
      },

      updateAsset: async (id, updates) => {
        const dbUpdates: Record<string, unknown> = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.purchasePrice !== undefined) dbUpdates.purchase_price = updates.purchasePrice;
        if (updates.currentValue !== undefined) dbUpdates.current_value = updates.currentValue;
        if (updates.purchaseDate !== undefined) dbUpdates.purchase_date = updates.purchaseDate;
        if (updates.category !== undefined) dbUpdates.category = updates.category;

        const { error } = await supabase.from('assets').update(dbUpdates).eq('id', id);
        if (!error) {
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
