/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ColorTheme, FocusMode } from '../types';
import { ENCOURAGEMENT_QUOTES } from '../lib/constants';
import LucideIcon from './LucideIcon';

interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  focusedMinutes: number;
  focusedMode: FocusMode;
  todayTomatoCount: number;
  weekTomatoCount: number;
  monthTomatoCount: number;
  streakDays: number;
  theme: ColorTheme;
}

export default function SettlementModal({
  isOpen,
  onClose,
  focusedMinutes,
  focusedMode,
  todayTomatoCount,
  weekTomatoCount,
  monthTomatoCount,
  streakDays,
  theme,
}: SettlementModalProps) {
  const [quote, setQuote] = useState('');

  // Random quote of encouragement when modal opens
  useEffect(() => {
    if (isOpen) {
      const idx = Math.floor(Math.random() * ENCOURAGEMENT_QUOTES.length);
      setQuote(ENCOURAGEMENT_QUOTES[idx]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div id="settlement-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Heavy Blur Dynamic Backdrop */}
      <div 
        id="settlement-backdrop"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Exquisite Bookmark card layout */}
      <div
        id="settlement-card"
        className="relative w-full max-w-sm glass-panel rounded-3xl border border-white/60 p-7 text-center shadow-mac-lg hover:scale-[1.01] transition-transform duration-300 flex flex-col items-center bg-white"
        style={{
          boxShadow: `0 20px 50px -12px rgba(15,23,42,0.12), 0 0 1px ${theme.primary}20`
        }}
      >
        {/* Absolute Ribbon Accent */}
        <div 
          className="absolute top-0 left-12 w-8 h-10 rounded-b-xl"
          style={{ backgroundColor: theme.primary }}
        />

        {/* Header Icon */}
        <div 
          className="p-4 rounded-2xl mb-4 mt-2"
          style={{ backgroundColor: `${theme.primary}12`, color: theme.primary }}
        >
          <LucideIcon name="Award" size={32} />
        </div>

        {/* Encouraging Headline */}
        <h3 className="font-display font-semibold text-lg text-slate-800 tracking-tight leading-6">
          专注达标
        </h3>
        
        <p className="text-sm font-medium mt-1 leading-relaxed" style={{ color: theme.secondary }}>
          {focusedMode.name}
        </p>

        {/* Main session stat */}
        <div className="my-5 py-3 px-6 bg-slate-50 border border-slate-100 rounded-2xl w-full">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-0.5">本次积累</span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-display font-medium text-slate-800 tracking-tight">
              {focusedMinutes}
            </span>
            <span className="text-xs text-slate-500">分钟</span>
          </div>
        </div>

        {/* Minimal Quote of Zen */}
        <div className="px-2 mb-6 min-h-[3.5rem] flex items-center justify-center">
          <p className="text-xs text-slate-500 italic leading-relaxed">
            “ {quote} ”
          </p>
        </div>

        {/* Periodic overview boxes */}
        <div className="grid grid-cols-2 gap-2.5 w-full mb-6">
          <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-slate-500 mb-0.5">
              <LucideIcon name="Flame" size={13} className="text-orange-500 animate-pulse" />
              <span className="text-[10px] font-medium text-slate-400">连续专注</span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-slate-800">
              {streakDays} <span className="text-[10px] font-normal text-slate-500">天</span>
            </span>
          </div>

          <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-slate-500 mb-0.5">
              <span style={{ color: theme.secondary }} className="flex items-center">
                <LucideIcon name="CheckCircle2" size={13} />
              </span>
              <span className="text-[10px] font-medium text-slate-400">今日打卡</span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-slate-800">
              {todayTomatoCount} <span className="text-[10px] font-normal text-slate-500">次</span>
            </span>
          </div>
        </div>

        {/* Aggregates footer details */}
        <div className="w-full flex justify-between px-3 text-[10px] font-mono text-slate-400 border-t border-slate-100 pt-3.5 mb-6">
          <span>本周打卡: {weekTomatoCount} 次</span>
          <span>本月打卡: {monthTomatoCount} 次</span>
        </div>

        {/* Main Action Button */}
        <button
          id="settlement-close-btn"
          onClick={onClose}
          className="w-full py-3 px-6 rounded-xl font-medium text-sm text-white shadow-sm transition-all duration-200 hover:opacity-95 active:scale-[0.99] cursor-pointer"
          style={{ backgroundColor: theme.primary }}
        >
          收下书签 并继续
        </button>
      </div>
    </div>
  );
}
