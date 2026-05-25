/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TaskItem, FocusSession, ColorTheme } from '../types';
import { computeStats } from '../lib/storage';
import LucideIcon from './LucideIcon';

interface StatisticsSectionProps {
  sessions: FocusSession[];
  tasks: TaskItem[];
  theme: ColorTheme;
}

export default function StatisticsSection({ sessions, tasks, theme }: StatisticsSectionProps) {
  const stats = computeStats(sessions, tasks);

  return (
    <div id="stats-dashboard" className="space-y-4">
      {/* Visual greeting or key summary banner */}
      <div 
        className="p-5 rounded-2xl border relative overflow-hidden flex items-center justify-between shadow-sm transition-all duration-300"
        style={{ 
          backgroundColor: theme.bgLightGrey,
          borderColor: theme.borderThemed
        }}
      >
        <div className="space-y-1">
          <h4 
            className="font-display font-bold text-sm tracking-tight flex items-center gap-1.5"
            style={{ color: theme.textDarkThemed }}
          >
            <LucideIcon name="Sparkles" className="text-yellow-500 animate-bounce" size={16} />
            时间的朋友
          </h4>
          <p 
            className="text-xs leading-relaxed max-w-[240px] font-semibold"
            style={{ color: theme.textMutedThemed }}
          >
            连续打卡 <span className="font-bold font-mono text-slate-800" style={{ color: theme.primary }}>{stats.streakDays}</span> 天。保持节奏，比追求完美更重要。
          </p>
        </div>

        {/* Dynamic streak award circle */}
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm tracking-tighter"
          style={{ 
            backgroundColor: stats.streakDays > 0 ? theme.primary : theme.bgCard,
            borderColor: theme.borderThemed,
            borderWidth: '1px',
            color: stats.streakDays > 0 ? '#ffffff' : theme.textMutedThemed,
            boxShadow: stats.streakDays > 0 ? `0 4px 14px ${theme.primary}25` : undefined
          }}
        >
          {stats.streakDays}D
        </div>
      </div>

      {/* Bento-style metrics columns */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Today Focused Time */}
        <div 
          className="rounded-xl border p-4 shadow-sm flex flex-col justify-between min-h-[95px] hover:translate-y-[-0.5px] transition-all"
          style={{
            backgroundColor: theme.bgCard,
            borderColor: theme.borderThemed
          }}
        >
          <div className="flex items-center gap-1" style={{ color: theme.textMutedThemed }}>
            <LucideIcon name="Clock" size={13} />
            <span className="text-[10px] font-bold tracking-tight">今日专注时长</span>
          </div>
          <div className="mt-2 flex items-baseline gap-0.5">
            <span 
              className="text-2xl font-display font-bold tracking-tight leading-none"
              style={{ color: theme.textDarkThemed }}
            >
              {stats.todayMinutes}
            </span>
            <span className="text-[10px] font-bold" style={{ color: theme.textMutedThemed }}>分钟</span>
          </div>
        </div>

        {/* Card 2: Today Completed Pomodoros */}
        <div 
          className="rounded-xl border p-4 shadow-sm flex flex-col justify-between min-h-[95px] hover:translate-y-[-0.5px] transition-all"
          style={{
            backgroundColor: theme.bgCard,
            borderColor: theme.borderThemed
          }}
        >
          <div className="flex items-center gap-1" style={{ color: theme.textMutedThemed }}>
            <span style={{ color: theme.secondary }} className="flex items-center">
              <LucideIcon name="CheckCircle2" size={13} />
            </span>
            <span className="text-[10px] font-bold tracking-tight font-sans">今日打卡次数</span>
          </div>
          <div className="mt-2 flex items-baseline gap-0.5">
            <span 
              className="text-2xl font-display font-bold tracking-tight leading-none"
              style={{ color: theme.textDarkThemed }}
            >
              {stats.todayTomatoCount}
            </span>
            <span className="text-[10px] font-bold" style={{ color: theme.textMutedThemed }}>次</span>
          </div>
        </div>

        {/* Card 3: Week Focused Time */}
        <div 
          className="rounded-xl border p-4 shadow-sm flex flex-col justify-between min-h-[95px] hover:translate-y-[-0.5px] transition-all"
          style={{
            backgroundColor: theme.bgCard,
            borderColor: theme.borderThemed
          }}
        >
          <div className="flex items-center gap-1" style={{ color: theme.textMutedThemed }}>
            <LucideIcon name="Calendar" size={13} />
            <span className="text-[10px] font-bold tracking-tight font-sans">本周累计时长</span>
          </div>
          <div className="mt-2 flex items-baseline gap-0.5">
            <span 
              className="text-2xl font-display font-bold tracking-tight leading-none"
              style={{ color: theme.textDarkThemed }}
            >
              {stats.weekMinutes}
            </span>
            <span className="text-[10px] font-bold" style={{ color: theme.textMutedThemed }}>分钟</span>
          </div>
        </div>

        {/* Card 4: Monthly Focused Time */}
        <div 
          className="rounded-xl border p-4 shadow-sm flex flex-col justify-between min-h-[95px] hover:translate-y-[-0.5px] transition-all"
          style={{
            backgroundColor: theme.bgCard,
            borderColor: theme.borderThemed
          }}
        >
          <div className="flex items-center gap-1" style={{ color: theme.textMutedThemed }}>
            <LucideIcon name="Trophy" size={13} className="text-amber-500" />
            <span className="text-[10px] font-bold tracking-tight font-sans">本月累计时长</span>
          </div>
          <div className="mt-2 flex items-baseline gap-0.5">
            <span 
              className="text-2xl font-display font-bold tracking-tight leading-none"
              style={{ color: theme.textDarkThemed }}
            >
              {stats.monthMinutes}
            </span>
            <span className="text-[10px] font-bold" style={{ color: theme.textMutedThemed }}>分钟</span>
          </div>
        </div>
      </div>

      {/* Aggregate secondary list stats */}
      <div 
        className="border p-4 rounded-xl space-y-2.5 transition-all duration-300"
        style={{
          backgroundColor: theme.bgLightGrey,
          borderColor: theme.borderThemed
        }}
      >
        <h5 
          className="text-[10px] font-bold uppercase tracking-widest font-sans mb-1"
          style={{ color: theme.textMutedThemed }}
        >
          深度统计明细
        </h5>
        
        <div className="flex justify-between items-center text-xs font-semibold">
          <span style={{ color: theme.textMutedThemed }}>完成任务总计</span>
          <span style={{ color: theme.textDarkThemed }}>{stats.completedTasksCount} 个</span>
        </div>

        <div 
          className="flex justify-between items-center text-xs font-semibold border-t pt-2"
          style={{ borderTopColor: theme.borderThemed }}
        >
          <span style={{ color: theme.textMutedThemed }}>本周打卡量 (达标25m+)</span>
          <span style={{ color: theme.textDarkThemed }}>{stats.weekTomatoCount} 次</span>
        </div>

        <div 
          className="flex justify-between items-center text-xs font-semibold border-t pt-2"
          style={{ borderTopColor: theme.borderThemed }}
        >
          <span style={{ color: theme.textMutedThemed }}>本月打卡量 (达标25m+)</span>
          <span style={{ color: theme.textDarkThemed }}>{stats.monthTomatoCount} 次</span>
        </div>

        <div 
          className="flex justify-between items-center text-xs font-semibold border-t pt-2"
          style={{ borderTopColor: theme.borderThemed }}
        >
          <span style={{ color: theme.textMutedThemed }}>单周最稳频率</span>
          <span style={{ color: theme.primary }}>良好</span>
        </div>
      </div>
    </div>
  );
}
