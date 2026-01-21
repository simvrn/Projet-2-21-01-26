import { subDays, isBefore, isAfter, parseISO } from 'date-fns';
import type { TimeEntry, Objective } from '@/types';
import { toISODateString } from './dates';

const MINUTES_PER_DAY = 24 * 60; // 1440
const WINDOW_DAYS = 90;
const TARGET_PERCENTAGE = 10;

interface ProgressResult {
  percentage: number;
  isValid: boolean;
  minutesSpent: number;
  minutesRequired: number;
  hoursSpent: number;
  hoursRequired: number;
}

export function calculateObjectiveProgress(
  objectiveId: string,
  timeEntries: TimeEntry[],
  objective: Objective,
  referenceDate: Date = new Date()
): ProgressResult {
  // Déterminer le début de la fenêtre
  const objectiveCreatedAt = parseISO(objective.createdAt);
  const windowStartCandidate = subDays(referenceDate, WINDOW_DAYS);

  // La fenêtre commence soit 90 jours avant, soit à la création de l'objectif
  const windowStart = isAfter(windowStartCandidate, objectiveCreatedAt)
    ? windowStartCandidate
    : objectiveCreatedAt;

  const windowEnd = referenceDate;

  // Calculer le nombre de jours effectifs dans la fenêtre
  const effectiveDays = Math.ceil(
    (windowEnd.getTime() - windowStart.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  // Temps total disponible dans la fenêtre
  const totalMinutesInWindow = effectiveDays * MINUTES_PER_DAY;

  // Filtrer les entrées dans la fenêtre
  const entriesInWindow = timeEntries.filter((entry) => {
    if (entry.objectiveId !== objectiveId) return false;
    const entryDate = parseISO(entry.date);
    return (
      !isBefore(entryDate, windowStart) && !isAfter(entryDate, windowEnd)
    );
  });

  // Sommer le temps consacré
  const totalMinutesSpent = entriesInWindow.reduce(
    (sum, entry) => sum + entry.minutes,
    0
  );

  // Calculer le pourcentage
  const percentage = (totalMinutesSpent / totalMinutesInWindow) * 100;

  // Minutes requises pour atteindre 10%
  const minutesRequired = totalMinutesInWindow * (TARGET_PERCENTAGE / 100);

  return {
    percentage: Math.round(percentage * 100) / 100,
    isValid: percentage >= TARGET_PERCENTAGE,
    minutesSpent: totalMinutesSpent,
    minutesRequired: Math.round(minutesRequired),
    hoursSpent: Math.round(totalMinutesSpent / 60),
    hoursRequired: Math.round(minutesRequired / 60),
  };
}

export function getEntriesForDate(
  date: string,
  timeEntries: TimeEntry[]
): TimeEntry[] {
  return timeEntries.filter((entry) => entry.date === date);
}

export function getTotalMinutesForDate(
  date: string,
  timeEntries: TimeEntry[]
): number {
  return getEntriesForDate(date, timeEntries).reduce(
    (sum, entry) => sum + entry.minutes,
    0
  );
}
