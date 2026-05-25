/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { FocusMode, ColorTheme, TaskItem, FocusModeId } from '../types';
import { FOCUS_MODES } from '../lib/constants';
import LucideIcon from './LucideIcon';

interface TimerSectionProps {
  modes: FocusMode[];
  activeModeId: FocusModeId;
  onSelectMode: (modeId: FocusModeId) => void;
  selectedTaskId: string | null;
  tasks: TaskItem[];
  onCancelTaskSelection: () => void;
  onAddSession: (durationMinutes: number, targetMinutes: number, isTomato: boolean, isBreak: boolean) => void;
  theme: ColorTheme;
  customPresets: { focusDuration: number; breakDuration: number };
  onUpdateCustomPresets: (focus: number, b: number) => void;
}

export default function TimerSection({
  modes,
  activeModeId,
  onSelectMode,
  selectedTaskId,
  tasks,
  onCancelTaskSelection,
  onAddSession,
  theme,
  customPresets,
  onUpdateCustomPresets,
}: TimerSectionProps) {
  const activeMode = modes.find((m) => m.id === activeModeId) || modes[0];
  const activeTask = tasks.find((t) => t.id === selectedTaskId);

  // Focus Timer States
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [durationSetting, setDurationSetting] = useState<number>(activeMode.defaultFocusDuration);
  const [secondsLeft, setSecondsLeft] = useState<number>(activeMode.defaultFocusDuration * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Slider inputs for custom mode
  const [customFocusInput, setCustomFocusInput] = useState<number>(customPresets.focusDuration);
  const [customBreakInput, setCustomBreakInput] = useState<number>(customPresets.breakDuration);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextReadyRef = useRef<boolean>(false);

  // Sync default duration when mode shifts (or custom presets inputs change)
  useEffect(() => {
    setIsRunning(false);
    setIsBreak(false);

    if (activeModeId === 'custom') {
      setDurationSetting(customPresets.focusDuration);
      setSecondsLeft(customPresets.focusDuration * 60);
    } else {
      setDurationSetting(activeMode.defaultFocusDuration);
      setSecondsLeft(activeMode.defaultFocusDuration * 60);
    }
  }, [activeModeId, customPresets, activeMode.defaultFocusDuration]);

  // Clean timer interval on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Standard alarm notification sound utilizing standard oscillator syntax (browser audio)
  const triggerAlarmTone = (freq: number, duration: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      // Fade out
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context blocked by policy. Click required to play sounds.");
    }
  };

  // Timer run loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleTimerFinished();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isBreak, durationSetting, secondsLeft]);

  const handleTimerFinished = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (!isBreak) {
      // Focus completed
      const totalElapsedMin = durationSetting;
      const satisfiesTomato = totalElapsedMin >= 25; // 25m check-in criteria

      // Dual system tone for completion
      triggerAlarmTone(523.25, 0.4); // C5 note
      setTimeout(() => triggerAlarmTone(659.25, 0.5), 250); // E5 note

      // Record focus record
      onAddSession(totalElapsedMin, durationSetting, satisfiesTomato, false);

      // Offer auto transitions to break mode
      const defaultBreak = activeModeId === 'custom' ? customPresets.breakDuration : activeMode.defaultBreakDuration;
      setIsBreak(true);
      setDurationSetting(defaultBreak);
      setSecondsLeft(defaultBreak * 60);
    } else {
      // Break completed
      triggerAlarmTone(440, 0.5); // A4 note

      // Focus session record
      onAddSession(0, durationSetting, false, true);

      // Offer transition back to focus mode
      const defaultFocus = activeModeId === 'custom' ? customPresets.focusDuration : activeMode.defaultFocusDuration;
      setIsBreak(false);
      setDurationSetting(defaultFocus);
      setSecondsLeft(defaultFocus * 60);
    }
  };

  // Buttons UI Action Triggerers
  const handleTogglePlay = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (isBreak) {
      const defaultBreak = activeModeId === 'custom' ? customPresets.breakDuration : activeMode.defaultBreakDuration;
      setSecondsLeft(defaultBreak * 60);
    } else {
      const defaultFocus = activeModeId === 'custom' ? customPresets.focusDuration : activeMode.defaultFocusDuration;
      setSecondsLeft(defaultFocus * 60);
    }
  };

  const handlePresetSelect = (mins: number, isCustMode: boolean = false) => {
    setIsRunning(false);
    setIsBreak(false);
    if (isCustMode) {
      onSelectMode('custom');
      // Sync break matching ratios
      let bMin = 5;
      if (mins === 15) bMin = 3;
      if (mins === 45) bMin = 10;
      if (mins === 60) bMin = 15;
      onUpdateCustomPresets(mins, bMin);
    } else {
      // Set to custom with focus
      onSelectMode('custom');
      onUpdateCustomPresets(mins, customPresets.breakDuration);
    }
  };

  const handleCustomSlidersSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRunning(false);
    setIsBreak(false);
    onUpdateCustomPresets(customFocusInput, customBreakInput);
    setDurationSetting(customFocusInput);
    setSecondsLeft(customFocusInput * 60);
  };

  const minutesStr = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secondsStr = String(secondsLeft % 60).padStart(2, '0');

  // Circuler Progress Ring SVG Coordinates
  const maxSec = durationSetting * 60 || 1;
  const progressRatio = Math.max(0, Math.min(1, secondsLeft / maxSec));
  const r = 90;
  const circumference = 2 * Math.PI * r;
  const strokeOffset = circumference - progressRatio * circumference;

  return (
    <div 
      id="countdown-block" 
      className="flex flex-col items-center justify-between h-full rounded-3xl p-6 border shadow-mac-lg relative overflow-hidden transition-all duration-300"
      style={{
        backgroundColor: theme.bgCard,
        borderColor: theme.borderThemed
      }}
    >
      
      {/* Mode Capsule selector */}
      <div 
        className="flex border rounded-full p-1 max-w-full overflow-x-auto whitespace-nowrap scrollbar-none gap-0.5 leading-none mb-4 transition-all"
        style={{
          backgroundColor: theme.bgLightGrey,
          borderColor: theme.borderThemed
        }}
      >
        {modes.map((m) => {
          const isSelected = activeModeId === m.id;
          return (
            <button
              id={`mode-tab-${m.id}`}
              key={m.id}
              onClick={() => onSelectMode(m.id)}
              className={`py-1.5 px-3 rounded-full text-xs font-semibold cursor-pointer transition-all duration-250 ${
                isSelected
                  ? 'text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              style={{
                backgroundColor: isSelected ? theme.primary : 'transparent',
              }}
            >
              {m.name.replace('模式', '')}
            </button>
          );
        })}
      </div>

      {/* Target focus selection info display */}
      <div className="text-center min-h-[30px] flex items-center justify-center mb-2 px-4 w-full">
        {activeTask ? (
          <div 
            className="inline-flex items-center gap-1.5 border py-1 px-3.5 rounded-full max-w-full transition-all"
            style={{
              backgroundColor: theme.bgLightGrey,
              borderColor: theme.borderThemed
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-ping" />
            <span 
              className="text-[11px] font-sans font-semibold truncate max-w-[200px]"
              style={{ color: theme.textDarkThemed }}
            >
              {activeTask.name}
            </span>
            <button
              id="cancel-associated-task"
              onClick={onCancelTaskSelection}
              className="p-0.5 text-slate-400 hover:text-rose-500 rounded cursor-pointer leading-none transition-colors"
              title="取消关联"
            >
              <LucideIcon name="X" size={12} />
            </button>
          </div>
        ) : (
          <span 
            className="text-[11px] font-medium font-sans tracking-tight"
            style={{ color: theme.textMutedThemed }}
          >
            当前未绑定特定任务，将在打卡模式下结算
          </span>
        )}
      </div>

      {/* Primary Apple-Style Rounded Countdown Timer */}
      <div className="relative w-56 h-56 flex items-center justify-center my-4 select-none">
        {/* Soft atmospheric background pulse glow when running */}
        {isRunning && (
          <div 
            className="absolute inset-0 rounded-full opacity-10 pulsing-glow filter blur-lg transition animate-pulse"
            style={{ backgroundColor: theme.primary }}
          />
        )}

        {/* Circular SVG Ring */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          {/* Background Ring track */}
          <circle
            cx="112"
            cy="112"
            r={r}
            className="fill-none"
            strokeWidth="6"
            style={{ stroke: theme.bgLightGrey }}
          />
          {/* Active fill ring progress */}
          <circle
            cx="112"
            cy="112"
            r={r}
            className="fill-none transition-all duration-300 ease-out"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            style={{
              stroke: isBreak ? '#10b981' : theme.primary // Greenfield colors if break
            }}
          />
        </svg>

        {/* Inner Labels & Counters */}
        <div className="flex flex-col items-center">
          {/* Mode Badge Status */}
          <span 
            className="text-[11px] font-semibold tracking-wider uppercase mb-1.5 py-0.5 px-2.5 rounded-full text-white transition-colors h-5 leading-none flex items-center shadow-sm"
            style={{ backgroundColor: isBreak ? '#10b981' : theme.primary }}
          >
            {isBreak ? '休息时间' : activeMode.name.replace('模式', '')}
          </span>

          {/* Core numerical display */}
          <span 
            className="text-4xl font-display font-bold tracking-tighter leading-none mb-1 transition-all"
            style={{ color: theme.textDarkThemed }}
          >
            {minutesStr}:{secondsStr}
          </span>

          {/* Running State description tag */}
          <span 
            className="text-[10px] font-semibold"
            style={{ color: theme.textMutedThemed }}
          >
            {isRunning ? '专注中' : '暂停中'}
          </span>
        </div>
      </div>

      {/* Control Actions Row (Play/Pause/Restart) */}
      <div className="flex items-center gap-3.5 my-3">
        {/* Reset Button */}
        <button
          id="reset-timer-btn"
          onClick={handleReset}
          title="重置"
          className="p-3 text-slate-500 rounded-full hover:scale-[1.04] transition active:scale-[0.98] cursor-pointer"
          style={{ backgroundColor: theme.bgLightGrey }}
        >
          <LucideIcon name="RotateCcw" size={17} />
        </button>

        {/* Core Big Play/Pause Button */}
        <button
          id="toggle-timer-play-btn"
          onClick={handleTogglePlay}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white transition hover:scale-[1.04] active:scale-[0.98] shadow-md cursor-pointer"
          style={{
            background: isBreak 
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
            boxShadow: `0 8px 24px -6px ${isBreak ? '#10b981' : theme.primary}50`
          }}
        >
          <LucideIcon name={isRunning ? "Pause" : "Play"} size={22} className={!isRunning ? "pl-0.5" : ""} />
        </button>

        {/* Open quick Settings / Custom popup toggle button */}
        <div className="p-3 opacity-0 cursor-default">
          <LucideIcon name="Settings" size={17} />
        </div>
      </div>

      {/* Bottom Auxiliary sliders & selectors (Dynamic depending on Custom mode vs Standard) */}
      <div 
        className="w-full mt-4 border-t pt-4 px-3 transition-all"
        style={{ borderTopColor: theme.borderThemed }}
      >
        {activeModeId === 'custom' ? (
          /* Custom interactive slide adjustment panels */
          <form onSubmit={handleCustomSlidersSave} className="space-y-3.5">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span style={{ color: theme.textMutedThemed }}>专注时长</span>
                <span className="font-mono" style={{ color: theme.textDarkThemed }}>{customFocusInput} 分钟</span>
              </div>
              <input
                id="custom-focus-length-slider"
                type="range"
                min="1"
                max="120"
                value={customFocusInput}
                onChange={(e) => setCustomFocusInput(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                style={{ accentColor: theme.primary }}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span style={{ color: theme.textMutedThemed }}>休整时长</span>
                <span className="font-mono" style={{ color: theme.textDarkThemed }}>{customBreakInput} 分钟</span>
              </div>
              <input
                id="custom-break-length-slider"
                type="range"
                min="1"
                max="30"
                value={customBreakInput}
                onChange={(e) => setCustomBreakInput(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                style={{ accentColor: theme.primary }}
              />
            </div>

            <button
              id="save-custom-sliders-btn"
              type="submit"
              className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs rounded-xl transition cursor-pointer"
            >
              应用自定义时长
            </button>
          </form>
        ) : (
          /* Standard Mode Preset Capsules */
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold mb-1">
              <span style={{ color: theme.textMutedThemed }}>预设时间间隔 (专注/休息)</span>
              <span 
                className="text-[10px] font-semibold border py-0.5 px-2 rounded-full font-sans transition-all"
                style={{ borderColor: theme.borderThemed, color: theme.textMutedThemed }}
              >
                本地标准
              </span>
            </div>
            
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: '15 Min', focus: 15, break: 3 },
                { label: '25 Min', focus: 25, break: 5 },
                { label: '45 Min', focus: 45, break: 10 },
                { label: '60 Min', focus: 60, break: 10 },
              ].map((preset, pIdx) => {
                const isMatching = durationSetting === preset.focus && !isBreak;
                return (
                  <button
                    id={`select-preset-${preset.focus}`}
                    key={pIdx}
                    onClick={() => handlePresetSelect(preset.focus, true)}
                    className="py-1.5 rounded-lg text-[10px] font-semibold border transition cursor-pointer text-center"
                    style={{
                      backgroundColor: isMatching ? theme.primary : theme.bgLightGrey,
                      borderColor: isMatching ? 'transparent' : theme.borderThemed,
                      color: isMatching ? '#ffffff' : theme.textDarkThemed
                    }}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
