// === OBJECTIVES ===
export interface TimeEntry {
  id: string;
  date: string; // ISO date "YYYY-MM-DD"
  objectiveId: string;
  minutes: number;
}

export interface Objective {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

// === EXPENSES ===
export interface Expense {
  id: string;
  date: string;
  categoryId: string;
  amount: number; // En centimes
  description?: string;
}

export interface Income {
  id: string;
  month: string; // "YYYY-MM"
  amount: number; // En centimes
  description?: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
}

// === FOOD ===
export interface Dish {
  id: string;
  name: string;
  details: string;
  images: string[]; // Base64 URLs
  status: 'done' | 'todo';
  createdAt: string;
}

// === BIOGRAPHY (PERSONNES INSPIRANTES) ===
export interface PersonCategory {
  id: string;
  name: string; // "Entrepreneur", "Philosophe", "Artiste", etc.
  color: string;
}

export interface Person {
  id: string;
  name: string;
  image: string | null;
  categoryId: string;
  description: string; // Texte libre
  qualities: string[]; // Liste de qualités/caractéristiques
  createdAt: string;
}

// === ROUTINES ===
export interface Routine {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly';
  weekDay?: number; // 0-6 si weekly
  createdAt: string;
  active: boolean;
}

export interface RoutineCompletion {
  id: string;
  routineId: string;
  date: string;
  completed: boolean;
}

// === CHALLENGES ===
export interface Challenge {
  month: string; // "2025-01"
  content: string;
}

// === NAVIGATION ===
export interface NavItem {
  path: string;
  label: string;
  icon: string;
}
