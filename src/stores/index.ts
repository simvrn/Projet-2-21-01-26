import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

// === EXPENSES STORE ===
interface ExpensesState {
  expenses: Expense[];
  incomes: Income[];
  categories: ExpenseCategory[];
  addExpense: (expense: Expense) => void;
  removeExpense: (id: string) => void;
  addIncome: (income: Income) => void;
  removeIncome: (id: string) => void;
  updateIncome: (id: string, updates: Partial<Income>) => void;
  addCategory: (category: ExpenseCategory) => void;
  removeCategory: (id: string) => void;
}

export const useExpensesStore = create<ExpensesState>()(
  persist(
    (set) => ({
      expenses: [],
      incomes: [],
      categories: [
        { id: '1', name: 'Soirée', color: '#ef4444' },
        { id: '2', name: 'Nourriture', color: '#22c55e' },
        { id: '3', name: 'Application', color: '#3b82f6' },
        { id: '4', name: 'Business', color: '#8b5cf6' },
        { id: '5', name: 'Bourse', color: '#f59e0b' },
      ],
      addExpense: (expense) =>
        set((state) => ({ expenses: [...state.expenses, expense] })),
      removeExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),
      addIncome: (income) =>
        set((state) => ({ incomes: [...state.incomes, income] })),
      removeIncome: (id) =>
        set((state) => ({
          incomes: state.incomes.filter((i) => i.id !== id),
        })),
      updateIncome: (id, updates) =>
        set((state) => ({
          incomes: state.incomes.map((i) =>
            i.id === id ? { ...i, ...updates } : i
          ),
        })),
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
