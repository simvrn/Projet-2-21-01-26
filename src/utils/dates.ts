import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  subDays,
  differenceInDays,
  isAfter,
  isBefore,
  isToday,
  getDay,
} from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (date: Date | string, formatStr: string = 'dd/MM/yyyy'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr, { locale: fr });
};

export const formatMonth = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMMM yyyy', { locale: fr });
};

export const toISODateString = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const getDaysInMonth = (year: number, month: number): Date[] => {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(new Date(year, month));
  return eachDayOfInterval({ start, end });
};

export const getDateRange = (startDate: Date, endDate: Date): Date[] => {
  return eachDayOfInterval({ start: startDate, end: endDate });
};

// Période: aujourd'hui -> 1er janvier 2027
export const TARGET_END_DATE = new Date(2027, 0, 1);

export const getDaysUntilTarget = (): number => {
  return differenceInDays(TARGET_END_DATE, new Date());
};

export const getAllDaysUntilTarget = (): Date[] => {
  const today = new Date();
  if (isAfter(today, TARGET_END_DATE)) return [];
  return eachDayOfInterval({ start: today, end: TARGET_END_DATE });
};

export { isToday, isBefore, isAfter, getDay, subDays, parseISO };
