// === GOALS (Objectifs) ===
export type GoalStatus = 'active' | 'completed' | 'paused';

export interface Goal {
  id: string;
  name: string;
  description?: string;
  image?: string; // Base64 ou URL
  color: string;
  startDate: string; // "YYYY-MM-DD"
  endDate?: string; // "YYYY-MM-DD" - calculé si durationDays fourni
  durationDays?: number; // Durée en jours - calculé si endDate fourni
  status: GoalStatus;
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

// === CHRONIQUES (Structure hierarchique extensible) ===
// Niveau 1 : Section (ex: Chroniques, ou sections ajoutees dynamiquement)
export interface ChronicleSection {
  id: string;
  name: string;
  image?: string; // Base64 ou URL
  order: number;
  createdAt: string;
}

// Niveau 2 : Sous-theme (a l'interieur d'une section)
export interface ChronicleSubTheme {
  id: string;
  sectionId: string;
  name: string;
  image?: string;
  description?: string;
  order: number;
  createdAt: string;
}

// Niveau 3 : Entree (sous-sous-theme - contenu principal)
export interface ChronicleEntry {
  id: string;
  subThemeId: string;
  name: string;
  image?: string;
  category?: string;
  description?: string;
  annexe?: string; // Contenu complementaire libre
  order: number;
  createdAt: string;
}

// === ROUTINES ===
export interface Routine {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly';
  weekDay?: number; // 0-6 si weekly
  startDate?: string; // "YYYY-MM-DD" - date de début (optionnel)
  endDate?: string; // "YYYY-MM-DD" - date de fin (optionnel)
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
  id: string;
  month: string; // "2025-01"
  content: string;
  completed: boolean;
}

// === CALENDAR ===
export type CalendarEventType = 'task' | 'event' | 'meeting';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: CalendarEventType;
  date: string; // "YYYY-MM-DD"
  startTime?: string; // "HH:mm"
  endTime?: string; // "HH:mm"
  allDay: boolean;
  color: string;
  completed?: boolean; // Pour les tâches
  createdAt: string;
}

// === FINANCE ===
export interface Stock {
  id: string;
  ticker: string; // Ex: "AAPL", "MSFT"
  name: string;
  quantity: number;
  purchasePrice: number; // Prix unitaire en centimes
  purchaseDate: string;
  currentPrice?: number; // Prix actuel en centimes (API ou manuel)
  lastUpdated?: string;
  // Vente
  sold?: boolean;
  salePrice?: number; // Prix de vente unitaire en centimes
  saleDate?: string;
  createdAt: string;
}

export interface Asset {
  id: string;
  name: string;
  description?: string;
  purchasePrice: number; // En centimes
  currentValue: number; // Valeur estimée en centimes
  purchaseDate?: string;
  category?: string; // "Montre", "Voiture", "Art", etc.
  // Vente
  sold?: boolean;
  salePrice?: number; // Prix de vente en centimes
  saleDate?: string;
  createdAt: string;
}

export interface CashAccount {
  id: string;
  name: string; // "Compte courant", "Livret A", etc.
  balance: number; // En centimes
  currency: string; // "EUR", "USD"
  createdAt: string;
}

export interface Crypto {
  id: string;
  symbol: string; // Ex: "BTC", "ETH"
  name: string;
  quantity: number;
  purchasePrice: number; // Prix unitaire en centimes
  purchaseDate: string;
  currentPrice?: number;
  lastUpdated?: string;
  // Vente
  sold?: boolean;
  salePrice?: number;
  saleDate?: string;
  createdAt: string;
}

// === NAVIGATION ===
export interface NavItem {
  path: string;
  label: string;
  icon: string;
}
