/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FocusSession, ColorTheme, DailyCheckIn } from '../types';
import { getDailyCheckInMap } from '../lib/storage';
import LucideIcon from './LucideIcon';

interface CalendarSectionProps {
  sessions: FocusSession[];
  theme: ColorTheme;
}

export default function CalendarSection({ sessions, theme }: CalendarSectionProps) {
  // Navigation states
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Compute check ins
  const checkIns = getDailyCheckInMap(sessions);
  const checkInMap = new Map<string, DailyCheckIn>();
  checkIns.forEach((item) => {
    checkInMap.set(item.date, item);
  });

  // Calculate grid properties
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // Sunday=0
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  // Handle month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const resetToToday = () => {
    setCurrentDate(new Date());
  };

  // Weekdays header
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  // Months label
  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  // Helper inside loop to get custom shading
  const getShadingStyles = (dateStr: string) => {
    const log = checkInMap.get(dateStr);
    if (!log || log.count === 0) {
      return {
        bg: 'hover:brightness-95 text-slate-500',
        customBg: theme.bgLightGrey,
        label: '未打卡',
        stats: '0次 0分钟'
      };
    }

    const { count, totalDuration } = log;
    const durMin = Math.round(totalDuration / 60);
    const statsStr = `${count}次打卡 • ${durMin}分钟`;

    if (count === 1) {
      return {
        bg: 'text-white border-transparent hover:brightness-95',
        customBg: `${theme.primary}25`, // 15% opacity tint
        textColor: theme.primary,
        fontWeight: 'font-semibold',
        label: '轻量专注',
        stats: statsStr
      };
    } else if (count >= 2 && count <= 3) {
      return {
        bg: 'text-white border-transparent hover:brightness-90',
        customBg: `${theme.primary}65`, // 40% opacity mid tone
        textColor: '#ffffff',
        fontWeight: 'font-semibold',
        label: '中度硬核',
        stats: statsStr
      };
    } else {
      return {
        bg: 'text-white border-transparent hover:brightness-90',
        customBg: theme.primary, // 100% core tone
        textColor: '#ffffff',
        fontWeight: 'font-bold font-mono tracking-wide',
        label: '深度爆发',
        stats: statsStr
      };
    }
  };

  // Generate calendar days
  const daysArray: (number | null)[] = [];
  // Fill leading empty padding days
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysArray.push(null);
  }
  // Fill calendar days
  for (let i = 1; i <= totalDaysInMonth; i++) {
    daysArray.push(i);
  }

  return (
    <div 
      id="calendar-widget" 
      className="glass-panel rounded-2xl border p-5 shadow-mac-card h-full flex flex-col transition-all duration-300"
      style={{
        backgroundColor: theme.bgCard,
        borderColor: theme.borderThemed
      }}
    >
      {/* Header element */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div>
          <h3 
            className="font-display font-bold text-sm tracking-tight flex items-center gap-1.5"
            style={{ color: theme.textDarkThemed }}
          >
            <LucideIcon name="Calendar" className="opacity-75" size={18} />
            打卡律动历
          </h3>
          <p 
            className="text-xs mt-0.5"
            style={{ color: theme.textMutedThemed }}
          >
            连续专注与日均坚持反馈
          </p>
        </div>

        {/* Navigation block */}
        <div className="flex items-center gap-1.5">
          <button
            id="prev-month-btn"
            onClick={prevMonth}
            className="p-1 px-1.5 rounded-lg border transition text-xs font-bold hover:scale-[1.01] cursor-pointer"
            style={{
              backgroundColor: theme.bgLightGrey,
              borderColor: theme.borderThemed,
              color: theme.textDarkThemed
            }}
          >
            <LucideIcon name="ChevronLeft" size={13} />
          </button>
          
          <button
            id="today-reset-btn"
            onClick={resetToToday}
            className="text-[10px] font-bold p-1 px-2.5 rounded-lg border transition cursor-pointer"
            style={{
              backgroundColor: theme.bgLightGrey,
              borderColor: theme.borderThemed,
              color: theme.textDarkThemed
            }}
          >
            本月
          </button>

          <button
            id="next-month-btn"
            onClick={nextMonth}
            className="p-1 px-1.5 rounded-lg border transition text-xs font-bold hover:scale-[1.01] cursor-pointer"
            style={{
              backgroundColor: theme.bgLightGrey,
              borderColor: theme.borderThemed,
              color: theme.textDarkThemed
            }}
          >
            <LucideIcon name="ChevronRight" size={13} />
          </button>
        </div>
      </div>

      {/* Date Indicator Title */}
      <div 
        className="text-center font-display font-bold text-sm mb-4 tracking-tight"
        style={{ color: theme.textDarkThemed }}
      >
        {year}年 {monthNames[month]}
      </div>

      {/* Month Days Grid Container */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Week Day Titles */}
        <div 
          className="grid grid-cols-7 text-center text-[10px] font-bold mb-2 uppercase"
          style={{ color: theme.textMutedThemed }}
        >
          {weekdays.map((day, dIdx) => (
            <div key={dIdx} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid layout */}
        <div className="grid grid-cols-7 gap-1 flex-1 relative min-h-[210px] align-content-start">
          {daysArray.map((dayNum, i) => {
            if (dayNum === null) {
              return <div key={`empty-${i}`} className="p-0.5" />;
            }

            // Construct local ISO date format
            const monthStr = String(month + 1).padStart(2, '0');
            const dayStr = String(dayNum).padStart(2, '0');
            const fullDateStr = `${year}-${monthStr}-${dayStr}`;

            const shading = getShadingStyles(fullDateStr);
            const isToday = 
              new Date().getFullYear() === year &&
              new Date().getMonth() === month &&
              new Date().getDate() === dayNum;

            return (
              <div
                id={`calendar-cell-${fullDateStr}`}
                key={`day-${dayNum}`}
                className="relative group p-0.5 flex items-center justify-center animate-fade-in"
              >
                {/* Day core bubble */}
                <div
                  className={`w-8 h-8 rounded-full flex flex-col items-center justify-center text-xs transition-all duration-150 relative cursor-default ${
                    isToday ? 'ring-2 ring-slate-800 ring-offset-1' : ''
                  }`}
                  style={{
                    backgroundColor: shading.customBg,
                    color: shading.textColor || theme.textDarkThemed,
                    border: isToday ? `1px solid ${theme.primary}` : undefined
                  }}
                >
                  <span className={`${shading.fontWeight || 'font-semibold'}`}>
                    {dayNum}
                  </span>
                </div>

                {/* Micro Hover Floating Tooltip on cell focus/hover */}
                <div className="absolute bottom-[110%] left-1/2 transform -translate-x-1/2 hidden group-hover:block z-25 bg-slate-800 text-white text-[10px] py-1 px-2.5 rounded-lg shadow-mac-lg whitespace-nowrap leading-none border border-slate-700/50 pointer-events-none transition-all">
                  <div className="font-semibold text-center mb-0.5 tracking-tight font-sans">
                    {dayNum}日 ({shading.label})
                  </div>
                  <div className="font-mono text-center text-white/80">
                    {shading.stats}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Indicator intensity explanations footer */}
      <div 
        className="mt-4 pt-3 border-t flex items-center justify-between text-[10px] transition-all"
        style={{ borderTopColor: theme.borderThemed, color: theme.textMutedThemed }}
      >
        <span className="font-bold">专注强度说明：</span>
        <div className="flex items-center gap-1.5 flex-row">
          <div className="flex items-center gap-1">
            <div 
              className="w-2.5 h-2.5 rounded-full border" 
              style={{ backgroundColor: theme.bgLightGrey, borderColor: theme.borderThemed }}
            />
            <span>无打卡</span>
          </div>
          <div className="flex items-center gap-1">
            <div 
              className="w-2.5 h-2.5 rounded-full border" 
              style={{ backgroundColor: `${theme.primary}25`, borderColor: theme.borderThemed }}
            />
            <span>1次轻量</span>
          </div>
          <div className="flex items-center gap-1">
            <div 
              className="w-2.5 h-2.5 rounded-full border animate-pulse" 
              style={{ backgroundColor: `${theme.primary}65`, borderColor: theme.borderThemed }}
            />
            <span>2-3次中等</span>
          </div>
          <div className="flex items-center gap-1">
            <div 
              className="w-2.5 h-2.5 rounded-full border" 
              style={{ backgroundColor: theme.primary, borderColor: 'transparent' }}
            />
            <span>4次+深度</span>
          </div>
        </div>
      </div>
    </div>
  );
}
