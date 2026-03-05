export type IntervalType = 'days' | 'weeks' | 'months' | 'years';

export enum Weekday {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

export interface MaintenanceItem {
  id: string;
  name: string;
  lastMaintenanceDate: string; // ISO string
  intervalType: IntervalType;
  intervalValue: number;
  specificWeekday?: Weekday;
  specificDayOfMonth?: number; // 1-31
  specificMonth?: number; // 0-11
  nextDueDate: string; // ISO string (calculated)
}

export type MaintenanceStatus = 'overdue' | 'due-soon' | 'safe';
