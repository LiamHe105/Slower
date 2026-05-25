/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ColorTheme, FocusMode, TaskItem } from '../types';

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'blue',
    name: '冷静蓝',
    primary: '#1a73e8', // Google Blue
    secondary: '#1b66c9', // Google Blue dark
    bgHero: '#eef3fc', // Very fresh light blue, 1:1 replica of Google Chrome classic blue home theme
    bgCard: '#f6f9fe', // Fresh light blue-white
    bgLightGrey: '#e3edfd', // Slightly blue-tinted grey instead of standard grey
    borderThemed: '#cbdcfc', // Beautiful soft bluish border
    textDarkThemed: '#185abc', // Elegant header blue
    textMutedThemed: '#5f6368', // Chrome style muted text
    badgeActive: 'bg-[#e3edfd] text-[#1a73e8] border-[#cbdcfc]',
    progressFill: 'from-[#1a73e8] to-[#1b66c9]',
    sliderThumb: 'bg-[#1a73e8] focus:ring-[#1a73e8]',
    glow: 'shadow-[0_0_20px_rgba(26,115,232,0.1)]',
  },
  {
    id: 'green',
    name: '自然绿',
    primary: '#006a5a', // Google Chrome Custom Deep Teal Green from image 1
    secondary: '#0b574f', // Deep pine green
    bgHero: '#edf7f4', // Very fresh light white-green bottom layout color
    bgCard: '#f5faf8', // Lighter minty white-green instead of pure white
    bgLightGrey: '#def2ed', // Slightly greener than standard grey, 1:1 tab color in Chrome
    borderThemed: '#aadcd1', // Soft teal-greenish border
    textDarkThemed: '#0b574f', // Rich dark forest-teal
    textMutedThemed: '#4a7870', // Gentle muted minty-gray text
    badgeActive: 'bg-[#def2ed] text-[#006a5a] border-[#aadcd1]',
    progressFill: 'from-[#006a5a] to-[#0b574f]',
    sliderThumb: 'bg-[#006a5a] focus:ring-[#006a5a]',
    glow: 'shadow-[0_0_20px_rgba(0,106,90,0.1)]',
  },
  {
    id: 'orange',
    name: '活力橙',
    primary: '#b54708', // Chrome warm sand orange
    secondary: '#9e3a00',
    bgHero: '#faf3ee', // Very fresh light warm peach-white bottom/outer color
    bgCard: '#fdfaf7', // Beautiful light white-peach
    bgLightGrey: '#fbefe5', // Warm orange/peach tinted grey instead of pure grey
    borderThemed: '#f2dac8', // Soft warm peachy border
    textDarkThemed: '#7a2e00', // Rich dark core amber/peach
    textMutedThemed: '#7a6252', // Warm earthy-grey text
    badgeActive: 'bg-[#fbefe5] text-[#b54708] border-[#f2dac8]',
    progressFill: 'from-[#b54708] to-[#9e3a00]',
    sliderThumb: 'bg-[#b54708] focus:ring-[#b54708]',
    glow: 'shadow-[0_0_20px_rgba(181,71,8,0.1)]',
  },
  {
    id: 'purple',
    name: '创意紫',
    primary: '#5c2d91', // Google Chrome custom Lavender-Purple from image 2
    secondary: '#492075',
    bgHero: '#f6f3fc', // Soft lavender white bottom color
    bgCard: '#faf9fe', // Softest purplish white
    bgLightGrey: '#eedbff', // Slightly purpler grey instead of standard grey
    borderThemed: '#e1ccff', // Elegant soft lavender border
    textDarkThemed: '#3d1a66', // Deep lavender main text
    textMutedThemed: '#655280', // Muted lavender-gray text
    badgeActive: 'bg-[#eedbff] text-[#5c2d91] border-[#e1ccff]',
    progressFill: 'from-[#5c2d91] to-[#492075]',
    sliderThumb: 'bg-[#5c2d91] focus:ring-[#5c2d91]',
    glow: 'shadow-[0_0_20px_rgba(92,45,145,0.1)]',
  },
  {
    id: 'slate',
    name: '曜石黑',
    primary: '#202124', // Chrome custom dark mineral charcoal
    secondary: '#3c4043',
    bgHero: '#f1f3f4', // Classic Chrome Neutral Light Grey
    bgCard: '#f8f9fa', // Elegant white-grey
    bgLightGrey: '#e8eaed', // Slightly darker mineral grey
    borderThemed: '#dadce0', // Chrome classic border color
    textDarkThemed: '#202124', // Mineral dark
    textMutedThemed: '#5f6368', // Mineral muted grey
    badgeActive: 'bg-[#e8eaed] text-[#202124] border-[#dadce0]',
    progressFill: 'from-[#202124] to-[#3c4043]',
    sliderThumb: 'bg-[#202124] focus:ring-[#202124]',
    glow: 'shadow-[0_0_20px_rgba(32,33,36,0.1)]',
  },
];

export const FOCUS_MODES: FocusMode[] = [
  {
    id: 'study',
    name: '学习模式',
    defaultFocusDuration: 25,
    defaultBreakDuration: 5,
    colorTheme: 'blue',
    icon: 'GraduationCap',
    description: '最经典的番茄学时律。适合课业学习、外语背诵及严肃阅读。',
  },
  {
    id: 'work',
    name: '工作模式',
    defaultFocusDuration: 45,
    defaultBreakDuration: 10,
    colorTheme: 'slate',
    icon: 'Briefcase',
    description: '专注更长阶的时间。适合编写代码、进行方案规划或文字创作。',
  },
  {
    id: 'reading',
    name: '深度阅读',
    defaultFocusDuration: 30,
    defaultBreakDuration: 5,
    colorTheme: 'purple',
    icon: 'BookOpen',
    description: '沉浸书香的世界。适合小说阅读、文献研习或思想沉淀。',
  },
  {
    id: 'creation',
    name: '创意构思',
    defaultFocusDuration: 60,
    defaultBreakDuration: 15,
    colorTheme: 'orange',
    icon: 'Palette',
    description: '深度唤醒灵感。适合设计构图、艺术绘制或灵光碰撞。',
  },
  {
    id: 'light',
    name: '轻专注',
    defaultFocusDuration: 15,
    defaultBreakDuration: 3,
    colorTheme: 'green',
    icon: 'Coffee',
    description: '处理琐屑小事。适合回复邮件、梳理备忘或日常杂务清扫。',
  },
  {
    id: 'custom',
    name: '自定义模式',
    defaultFocusDuration: 25,
    defaultBreakDuration: 5,
    colorTheme: 'blue',
    icon: 'Sliders',
    description: '打破预设限制。在这里随心调配专属你的专注与休憩节奏。',
  },
];

export const NOISE_OPTIONS = [
  { id: 'white_noise', name: '白噪音', description: '隔离周遭喧嚣的宁静低鸣', icon: 'Volume2' },
  { id: 'rain', name: '极简雨声', description: '窗外淅淅沥沥的细腻温润', icon: 'CloudRain' },
  { id: 'ocean', name: '海浪波涛', description: '潮起潮落的海阔天空呼吸', icon: 'Waves' },
  { id: 'forest', name: '森林微风', description: '清幽树吟与灵动雀跃的鸟鸣', icon: 'Wind' },
  { id: 'cafe', name: '午后咖啡馆', description: '餐具微碰与人群慵懒的低吟', icon: 'Coffee' },
] as const;

export const ENCOURAGEMENT_QUOTES = [
  "你完成了今天的一小段推进。",
  "保持节奏，比追求完美更重要。",
  "今天的 25 分钟已被你拿下。",
  "慢慢来，但不要停。",
  "专注是心灵的自我洗礼，你做得很好。",
  "在极简的时光里，你给出了充实的一页。",
  "踏踏实实。又积蓄了一点改变的力量。",
  "完成了，做回时间的掌舵者。"
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    name: '阅读技术文档或一章新书',
    modeId: 'reading',
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
    totalDurationComplete: 0,
  },
  {
    id: 'task-2',
    name: '整理今天的工作备忘清单',
    modeId: 'light',
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
    totalDurationComplete: 0,
  },
  {
    id: 'task-3',
    name: '沉浸专注式编程与框架搭建',
    modeId: 'work',
    completed: true,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    totalDurationComplete: 1500, // Pre-populated 25m focus
  }
];
