/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TaskItem, FocusSession, DailyCheckIn, ThemeId } from '../types';
import { INITIAL_TASKS } from './constants';

const KEYS = {
  TASKS: 'focus_assistant_tasks',
  SESSIONS: 'focus_assistant_sessions',
  THEME: 'focus_assistant_theme',
  CUSTOM_PRESETS: 'focus_assistant_custom_presets',
};

export const getTasks = (): TaskItem[] => {
  const data = localStorage.getItem(KEYS.TASKS);
  if (!data) {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
    return INITIAL_TASKS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_TASKS;
  }
};

export const saveTasks = (tasks: TaskItem[]): void => {
  localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
};

export const getSessions = (): FocusSession[] => {
  const data = localStorage.getItem(KEYS.SESSIONS);
  if (!data) {
    // Return empty list
    return [];
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const saveSessions = (sessions: FocusSession[]): void => {
  localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
};

export const getActiveTheme = (): ThemeId => {
  const data = localStorage.getItem(KEYS.THEME);
  return (data as ThemeId) || 'blue';
};

export const saveActiveTheme = (theme: ThemeId): void => {
  localStorage.setItem(KEYS.THEME, theme);
};

export interface CustomPresets {
  focusDuration: number;
  breakDuration: number;
}

export const getCustomPresets = (): CustomPresets => {
  const data = localStorage.getItem(KEYS.CUSTOM_PRESETS);
  if (!data) {
    return { focusDuration: 25, breakDuration: 5 };
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return { focusDuration: 25, breakDuration: 5 };
  }
};

export const saveCustomPresets = (presets: CustomPresets): void => {
  localStorage.setItem(KEYS.CUSTOM_PRESETS, JSON.stringify(presets));
};

// Statistics Calculations
export interface FocusStats {
  todayMinutes: number;
  weekMinutes: number;
  monthMinutes: number;
  todayTomatoCount: number;
  weekTomatoCount: number;
  monthTomatoCount: number;
  streakDays: number;
  completedTasksCount: number;
}

// Check if two dates are the same calendar day (local time)
export const isSameDay = (d1: Date, d2: Date): boolean => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

// Start of Day Date (00:00:00)
export const getStartOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Start of Week Date (Monday)
export const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when Sunday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

// Start of Month Date (1st of month)
export const getStartOfMonth = (date: Date): Date => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
};

export const computeStats = (sessions: FocusSession[], tasks: TaskItem[]): FocusStats => {
  const now = new Date();
  const todayStart = getStartOfDay(now).getTime();
  const weekStart = getStartOfWeek(now).getTime();
  const monthStart = getStartOfMonth(now).getTime();

  let todaySeconds = 0;
  let weekSeconds = 0;
  let monthSeconds = 0;

  let todayTomatos = 0;
  let weekTomatos = 0;
  let monthTomatos = 0;

  // Filter sessions
  sessions.forEach((s) => {
    // We ignore break sessions when counting actual focused time
    if (s.isBreakComplete) return;

    const sessionTime = new Date(s.timestamp).getTime();
    const duration = s.duration; // in seconds

    if (sessionTime >= todayStart) {
      todaySeconds += duration;
      if (s.isCompletedTomato) todayTomatos++;
    }
    if (sessionTime >= weekStart) {
      weekSeconds += duration;
      if (s.isCompletedTomato) weekTomatos++;
    }
    if (sessionTime >= monthStart) {
      monthSeconds += duration;
      if (s.isCompletedTomato) monthTomatos++;
    }
  });

  // Calculate Streak
  const checkInDates = new Set<string>();
  sessions.forEach((s) => {
    // Only count day check-ins if there's at least one finished focus or tomato
    if (s.isBreakComplete) return;
    const sDate = s.timestamp.substring(0, 10); // YYYY-MM-DD
    checkInDates.add(sDate);
  });

  const sortedDates = Array.from(checkInDates).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  let currentStreak = 0;
  if (sortedDates.length > 0) {
    const todayStr = now.toISOString().substring(0, 10);
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().substring(0, 10);

    // If latest record is today or yesterday, streak is active
    if (sortedDates[0] === todayStr || sortedDates[0] === yesterdayStr) {
      currentStreak = 1;
      let checkDate = new Date(sortedDates[0]);
      
      // Look backwards day by day
      while (true) {
        checkDate.setDate(checkDate.getDate() - 1);
        const nextCheckStr = checkDate.toISOString().substring(0, 10);
        if (checkInDates.has(nextCheckStr)) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }

  const completedTasks = tasks.filter((t) => t.completed).length;

  return {
    todayMinutes: Math.round(todaySeconds / 60),
    weekMinutes: Math.round(weekSeconds / 60),
    monthMinutes: Math.round(monthSeconds / 60),
    todayTomatoCount: todayTomatos,
    weekTomatoCount: weekTomatos,
    monthTomatoCount: monthTomatos,
    streakDays: currentStreak,
    completedTasksCount: completedTasks,
  };
};

export const getDailyCheckInMap = (sessions: FocusSession[]): DailyCheckIn[] => {
  // Aggregate focus on daily level
  const agg: Record<string, { count: number; totalDuration: number }> = {};
  
  sessions.forEach((s) => {
    if (s.isBreakComplete) return;
    const dateStr = s.timestamp.substring(0, 10); // YYYY-MM-DD
    if (!agg[dateStr]) {
      agg[dateStr] = { count: 0, totalDuration: 0 };
    }
    agg[dateStr].totalDuration += s.duration;
    if (s.isCompletedTomato) {
      agg[dateStr].count += 1;
    }
  });

  return Object.entries(agg).map(([date, data]) => ({
    date,
    count: data.count,
    totalDuration: data.totalDuration,
  }));
};
