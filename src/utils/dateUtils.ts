import { MaintenanceItem, Weekday, MaintenanceStatus } from '../types';

export const calculateNextDueDate = (item: Omit<MaintenanceItem, 'id' | 'nextDueDate'>): string => {
  const lastDate = new Date(item.lastMaintenanceDate);
  let nextDate = new Date(lastDate);

  if (item.intervalType === 'days') {
    nextDate.setDate(lastDate.getDate() + item.intervalValue);
  } else if (item.intervalType === 'weeks') {
    nextDate.setDate(lastDate.getDate() + (item.intervalValue * 7));
    if (item.specificWeekday !== undefined) {
      const currentDay = nextDate.getDay();
      const targetDay = item.specificWeekday;
      const diff = (targetDay - currentDay + 7) % 7;
      nextDate.setDate(nextDate.getDate() + diff);
    }
  } else if (item.intervalType === 'months') {
    nextDate.setMonth(lastDate.getMonth() + item.intervalValue);
    if (item.specificDayOfMonth !== undefined) {
      nextDate.setDate(item.specificDayOfMonth);
    }
  } else if (item.intervalType === 'years') {
    nextDate.setFullYear(lastDate.getFullYear() + item.intervalValue);
    if (item.specificMonth !== undefined && item.specificDayOfMonth !== undefined) {
      nextDate.setMonth(item.specificMonth);
      nextDate.setDate(item.specificDayOfMonth);
    }
  }

  return nextDate.toISOString();
};

export const getStatus = (nextDueDate: string): MaintenanceStatus => {
  const now = new Date();
  const due = new Date(nextDueDate);
  
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDate = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays <= 3) return 'due-soon';
  return 'safe';
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export const getWeekdayName = (day: Weekday): string => {
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][day];
};

export const getMonthName = (month: number): string => {
  return ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'][month];
};
