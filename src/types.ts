/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TaskItem {
  id: string;
  name: string;
  modeId: string; // The focus mode ID this task belongs to
  completed: boolean;
  createdAt: string; // ISO String
  completedAt: string | null; // ISO String or null
  totalDurationComplete: number; // Accumulated focused seconds on this task
}

export type FocusModeId = 'study' | 'work' | 'reading' | 'creation' | 'light' | 'custom';

export interface FocusMode {
  id: FocusModeId;
  name: string;
  defaultFocusDuration: number; // in minutes
  defaultBreakDuration: number; // in minutes
  colorTheme: string;
  icon: string; // lucide icon name
  description: string;
}

export interface FocusSession {
  id: string;
  taskId: string | null;
  modeId: FocusModeId;
  duration: number; // focused seconds
  targetDuration: number; // countdown target seconds
  isCompletedTomato: boolean; // True if focused >= 25 minutes (1500 seconds), or 25-min tomato completed
  isBreakComplete: boolean; // Was this session actually a complete break?
  timestamp: string; // ISO String (start or end of focus)
}

export interface DailyCheckIn {
  date: string; // YYYY-MM-DD
  count: number; // Completed focus sessions >= 25m or designated tomato
  totalDuration: number; // Focused seconds
}

export type ThemeId = 'blue' | 'green' | 'orange' | 'purple' | 'slate';

export interface ColorTheme {
  id: ThemeId;
  name: string;
  primary: string;       // Tailwind text and bg active color
  secondary: string;     // Secondary details
  bgHero: string;        // Soft layout elements
  bgCard: string;        // Themed surface color (e.g. "浅白绿" instead of pure white)
  bgLightGrey: string;   // Themed light grey (e.g. "稍微绿一点点的颜色" instead of plain grey)
  borderThemed: string;  // Themed border or divider
  textDarkThemed: string;// Themed dark main text
  textMutedThemed: string;// Themed muted text
  badgeActive: string;   // Active mode badges
  progressFill: string;  // Active meter fills
  sliderThumb: string;   // Custom slider knob colors
  glow: string;          // Glow effect
}
