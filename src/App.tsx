/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TaskItem, FocusSession, ThemeId, FocusModeId, ColorTheme } from './types';
import { COLOR_THEMES, FOCUS_MODES } from './lib/constants';
import {
  getTasks,
  saveTasks,
  getSessions,
  saveSessions,
  getActiveTheme,
  saveActiveTheme,
  getCustomPresets,
  saveCustomPresets,
  computeStats,
} from './lib/storage';
import LucideIcon from './components/LucideIcon';
import TimerSection from './components/TimerSection';
import TaskSection from './components/TaskSection';
import CalendarSection from './components/CalendarSection';
import StatisticsSection from './components/StatisticsSection';
import NoiseSection from './components/NoiseSection';
import SettlementModal from './components/SettlementModal';

type ActivePage = 'focus' | 'tasks' | 'calendar' | 'stats';

export default function App() {
  // Navigation
  const [activePage, setActivePage] = useState<ActivePage>('focus');

  // Core Persisted state variables
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [themeId, setThemeId] = useState<ThemeId>('blue');
  const [customPresets, setCustomPresets] = useState({ focusDuration: 25, breakDuration: 5 });

  // Transient interactive state variables
  const [activeModeId, setActiveModeId] = useState<FocusModeId>('study');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  // Settlement modal states
  const [showSettlement, setShowSettlement] = useState(false);
  const [lastFinishedMinutes, setLastFinishedMinutes] = useState(0);

  // Load initial dataset from localStorage
  useEffect(() => {
    setTasks(getTasks());
    setSessions(getSessions());
    setThemeId(getActiveTheme());
    setCustomPresets(getCustomPresets());
  }, []);

  // Compute active theme details dynamically
  const currentTheme = COLOR_THEMES.find((t) => t.id === themeId) || COLOR_THEMES[0];

  // Handler events for state alterations
  const handleThemeChange = (id: ThemeId) => {
    setThemeId(id);
    saveActiveTheme(id);
  };

  const handleUpdateCustomPresets = (focus: number, b: number) => {
    const next = { focusDuration: focus, breakDuration: b };
    setCustomPresets(next);
    saveCustomPresets(next);
  };

  const handleAddTask = (name: string, modeId: string) => {
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      name,
      modeId,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
      totalDurationComplete: 0,
    };
    const nextTasks = [newTask, ...tasks];
    setTasks(nextTasks);
    saveTasks(nextTasks);
  };

  const handleToggleTaskComplete = (taskId: string) => {
    const nextTasks = tasks.map((t) => {
      if (t.id === taskId) {
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : null,
        };
      }
      return t;
    });
    setTasks(nextTasks);
    saveTasks(nextTasks);

    // If active selected task completed, auto toggle off selection
    if (taskId === selectedTaskId) {
      setSelectedTaskId(null);
    }
  };

  const handleUpdateTaskName = (taskId: string, newName: string) => {
    const nextTasks = tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, name: newName };
      }
      return t;
    });
    setTasks(nextTasks);
    saveTasks(nextTasks);
  };

  const handleDeleteTask = (taskId: string) => {
    const nextTasks = tasks.filter((t) => t.id !== taskId);
    setTasks(nextTasks);
    saveTasks(nextTasks);
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
  };

  // Add recorded focus session on completion
  const handleAddSession = (
    durationMin: number,
    targetMin: number,
    isTomato: boolean,
    isBreak: boolean
  ) => {
    const isActuallyBreak = isBreak && durationMin === 0;

    const newSession: FocusSession = {
      id: `session-${Date.now()}`,
      taskId: isActuallyBreak ? null : selectedTaskId,
      modeId: activeModeId,
      duration: durationMin * 60, // save in seconds
      targetDuration: targetMin * 60,
      isCompletedTomato: isTomato,
      isBreakComplete: isActuallyBreak,
      timestamp: new Date().toISOString(),
    };

    const nextSessions = [newSession, ...sessions];
    setSessions(nextSessions);
    saveSessions(nextSessions);

    // Accumulate duration to corresponding active task
    if (selectedTaskId && !isActuallyBreak) {
      const nextTasks = tasks.map((t) => {
        if (t.id === selectedTaskId) {
          return {
            ...t,
            totalDurationComplete: t.totalDurationComplete + durationMin * 60,
          };
        }
        return t;
      });
      setTasks(nextTasks);
      saveTasks(nextTasks);
    }

    // Trigger visual settlement popup if focused >= 1 min and not break
    if (durationMin > 0 && !isActuallyBreak) {
      setLastFinishedMinutes(durationMin);
      setShowSettlement(true);
    }
  };

  // Compute calculated metrics
  const stats = computeStats(sessions, tasks);
  const activeFocusMode = FOCUS_MODES.find((m) => m.id === activeModeId) || FOCUS_MODES[0];

  return (
    <div 
      className="flex flex-col md:flex-row min-h-screen text-slate-900 font-sans overflow-hidden transition-all duration-300"
      style={{ backgroundColor: currentTheme.bgHero }}
    >
      {/* 1. Sidebar Navigation (Left column on Desktop) */}
      <aside 
        className="w-64 border-r hidden md:flex flex-col transition-all duration-300"
        style={{ 
          backgroundColor: currentTheme.bgCard, 
          borderColor: currentTheme.borderThemed 
        }}
      >
        {/* Brand/Logo Section */}
        <div className="p-8 flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-mono font-bold text-sm tracking-tight transition-transform duration-200 hover:rotate-6 shadow-sm"
            style={{ backgroundColor: currentTheme.primary }}
          >
            <div className="w-2.5 h-4 bg-white/90 rounded-full"></div>
          </div>
          <span 
            className="font-bold text-lg tracking-tight transition-all duration-300"
            style={{ color: currentTheme.textDarkThemed }}
          >
            专注助手
          </span>
        </div>

        {/* Navigation links list */}
        <nav className="flex-1 px-4 space-y-1">
          {([
            { id: 'focus', label: '我的专注', icon: 'Clock' },
            { id: 'tasks', label: '待办清单', icon: 'CheckCircle2' },
            { id: 'calendar', label: '自律历程', icon: 'Calendar' },
            { id: 'stats', label: '成效大观', icon: 'BarChart3' },
          ] as const).map((tab) => {
            const isSelected = activePage === tab.id;
            return (
              <button
                id={`nav-aside-${tab.id}`}
                key={tab.id}
                onClick={() => setActivePage(tab.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-xs leading-none border"
                style={{
                  backgroundColor: isSelected ? currentTheme.bgLightGrey : 'transparent',
                  borderColor: isSelected ? currentTheme.borderThemed : 'transparent',
                  color: isSelected ? currentTheme.primary : currentTheme.textMutedThemed,
                  fontWeight: isSelected ? 600 : 500,
                }}
              >
                <LucideIcon name={tab.icon} size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Daily Goal card on sidebar base */}
        <div className="p-6 mt-auto">
          <div 
            className="rounded-2xl p-4 shadow-sm border transition-all duration-300"
            style={{ 
              backgroundColor: currentTheme.bgLightGrey,
              borderColor: currentTheme.borderThemed 
            }}
          >
            <p 
              className="text-[9px] font-bold uppercase tracking-wider mb-2"
              style={{ color: currentTheme.textMutedThemed }}
            >
              今日奋斗目标
            </p>
            <div className="flex justify-between items-end mb-1.5">
              <span 
                className="text-xl font-bold font-mono"
                style={{ color: currentTheme.textDarkThemed }}
              >
                {stats.todayTomatoCount}/8
              </span>
              <span 
                className="text-[10px] font-medium"
                style={{ color: currentTheme.textMutedThemed }}
              >
                个番茄钟
              </span>
            </div>
            <div 
              className="w-full h-1 rounded-full overflow-hidden"
              style={{ backgroundColor: currentTheme.borderThemed }}
            >
              <div 
                className="h-full rounded-full transition-all duration-500" 
                style={{ 
                  backgroundColor: currentTheme.primary,
                  width: `${Math.min(100, (stats.todayTomatoCount / 8) * 100)}%` 
                }}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Content View Area (Right column) */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto pb-20 md:pb-0">
        {/* Top Header Row Panel */}
        <header 
          className="h-16 border-b flex items-center justify-between px-6 md:px-10 backdrop-blur-md sticky top-0 z-10 shadow-sm transition-all duration-300"
          style={{ 
            backgroundColor: `${currentTheme.bgCard}cc`, 
            borderColor: currentTheme.borderThemed 
          }}
        >
          <div>
            <h2 
              className="text-sm md:text-base font-bold tracking-tight leading-none mb-1 transition-all duration-300"
              style={{ color: currentTheme.textDarkThemed }}
            >
              {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h2>
            <p 
              className="text-[10px] font-medium transition-all duration-300"
              style={{ color: currentTheme.textMutedThemed }}
            >
              在自律节拍中，寻找内心的专注与安宁。
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Global interactive Theme selecting controls */}
            <div 
              className="flex items-center gap-1.5 rounded-full p-1.5 border transition-all duration-300"
              style={{ 
                backgroundColor: currentTheme.bgLightGrey, 
                borderColor: currentTheme.borderThemed 
              }}
            >
              {COLOR_THEMES.map((t) => {
                const isSelected = themeId === t.id;
                return (
                  <button
                    id={`header-theme-select-${t.id}`}
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    title={t.name}
                    className={`w-4.5 h-4.5 rounded-full transition-all duration-250 cursor-pointer ${
                      isSelected ? 'ring-2 ring-slate-800 ring-offset-2 scale-110' : 'hover:scale-105 opacity-80'
                    }`}
                    style={{ backgroundColor: t.primary }}
                  />
                );
              })}
            </div>

            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 overflow-hidden border border-slate-200/50 shadow-sm flex items-center justify-center">
              <div 
                className="w-6 h-6 rounded-full bg-gradient-to-tr animate-pulse" 
                style={{ backgroundImage: `linear-gradient(to top right, ${currentTheme.primary}, ${currentTheme.secondary})` }}
              />
            </div>
          </div>
        </header>

        {/* Inner Content panels workspace layout */}
        <div className="p-6 md:p-10 flex-grow flex flex-col justify-start">
          {activePage === 'focus' && (
            /* Focus Workspace Layout (Dual column grid) */
            <div id="page-focus" className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 items-stretch max-w-5xl w-full mx-auto">
              {/* Left Column: Center Focus countdown board */}
              <div className="lg:col-span-3 flex flex-col">
                <TimerSection
                  modes={FOCUS_MODES}
                  activeModeId={activeModeId}
                  onSelectMode={(id) => {
                    setActiveModeId(id);
                    // Match suggested mode background with theme
                    const found = FOCUS_MODES.find((m) => m.id === id);
                    if (found && found.colorTheme) {
                      handleThemeChange(found.colorTheme as ThemeId);
                    }
                  }}
                  selectedTaskId={selectedTaskId}
                  tasks={tasks}
                  onCancelTaskSelection={() => setSelectedTaskId(null)}
                  onAddSession={handleAddSession}
                  theme={currentTheme}
                  customPresets={customPresets}
                  onUpdateCustomPresets={handleUpdateCustomPresets}
                />
              </div>

              {/* Right Column: Mini checklist binders & noise player widgets */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                {/* Custom binding task checklist switcher */}
                <section 
                  className="rounded-3xl p-6 border shadow-sm flex flex-col justify-between transition-all duration-300"
                  style={{ 
                    backgroundColor: currentTheme.bgCard,
                    borderColor: currentTheme.borderThemed
                  }}
                >
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 
                        className="font-bold text-xs tracking-tight flex items-center gap-1.5"
                        style={{ color: currentTheme.textDarkThemed }}
                      >
                        <LucideIcon name="Briefcase" className="opacity-70" size={15} />
                        选择关联聚焦待办
                      </h3>
                      <button 
                        onClick={() => setActivePage('tasks')} 
                        className="text-[10px] font-bold hover:underline cursor-pointer"
                        style={{ color: currentTheme.primary }}
                      >
                        管理清单
                      </button>
                    </div>
                    
                    {/* Compact list widgets */}
                    <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-0.5">
                      {tasks.filter((t) => !t.completed).length === 0 ? (
                        <div 
                          className="text-center py-6 border border-dashed rounded-2xl"
                          style={{ borderColor: currentTheme.borderThemed, backgroundColor: currentTheme.bgLightGrey }}
                        >
                          <p 
                            className="text-[10px] font-sans"
                            style={{ color: currentTheme.textMutedThemed }}
                          >
                            目前暂无待办，去清单添加些新目标吧
                          </p>
                        </div>
                      ) : (
                        tasks.filter((t) => !t.completed).map((t) => {
                          const isSelect = selectedTaskId === t.id;
                          return (
                            <button
                              id={`focus-select-task-${t.id}`}
                              key={t.id}
                              onClick={() => setSelectedTaskId(isSelect ? null : t.id)}
                              className="w-full p-2.5 text-left text-[11px] font-semibold rounded-xl border flex items-center justify-between transition-all duration-200 cursor-pointer"
                              style={{
                                backgroundColor: isSelect ? currentTheme.bgLightGrey : currentTheme.bgCard,
                                borderColor: isSelect ? currentTheme.primary : currentTheme.borderThemed,
                                color: isSelect ? currentTheme.textDarkThemed : currentTheme.textMutedThemed,
                                fontWeight: isSelect ? 700 : 600,
                              }}
                            >
                              <span className="truncate max-w-[190px]">{t.name}</span>
                              {isSelect ? (
                                <span style={{ color: currentTheme.primary }}><LucideIcon name="Check" size={12} /></span>
                              ) : (
                                <div 
                                  className="w-3.5 h-3.5 rounded-full border transition-all" 
                                  style={{ borderColor: currentTheme.borderThemed }}
                                />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div 
                    className="mt-4 pt-3.5 border-t flex items-center justify-between text-[9px]"
                    style={{ borderTopColor: currentTheme.borderThemed, color: currentTheme.textMutedThemed }}
                  >
                    <span>绑定任务后，专注打卡将累积至该对应的目标中</span>
                    <span className="font-semibold">智联空间</span>
                  </div>
                </section>

                {/* White ambient noises */}
                <div className="flex-1">
                  <NoiseSection theme={currentTheme} />
                </div>
              </div>
            </div>
          )}

          {activePage === 'tasks' && (
            /* Tasks view panel wrapper */
            <div id="page-tasks" className="max-w-2xl w-full mx-auto">
              <TaskSection
                tasks={tasks}
                currentTaskId={selectedTaskId}
                onSelectTask={setSelectedTaskId}
                onAddTask={handleAddTask}
                onToggleTaskComplete={handleToggleTaskComplete}
                onUpdateTaskName={handleUpdateTaskName}
                onDeleteTask={handleDeleteTask}
                theme={currentTheme}
              />
            </div>
          )}

          {activePage === 'calendar' && (
            /* Calendar view panel wrapper */
            <div id="page-calendar" className="max-w-xl w-full mx-auto">
              <CalendarSection
                sessions={sessions}
                theme={currentTheme}
              />
            </div>
          )}

          {activePage === 'stats' && (
            /* Stats statistics card */
            <div 
              id="page-stats" 
              className="max-w-md w-full mx-auto rounded-3xl p-6 border shadow-sm transition-all duration-300"
              style={{ 
                backgroundColor: currentTheme.bgCard,
                borderColor: currentTheme.borderThemed
              }}
            >
              <div 
                className="flex items-center justify-between mb-4 pb-3 border-b"
                style={{ borderBottomColor: currentTheme.borderThemed }}
              >
                <div>
                  <h3 
                    className="font-bold text-sm tracking-tight flex items-center gap-1.5"
                    style={{ color: currentTheme.textDarkThemed }}
                  >
                    <LucideIcon name="BarChart3" className="opacity-75" size={16} />
                    专注数据大观
                  </h3>
                  <p 
                    className="text-[10px] mt-0.5 font-medium"
                    style={{ color: currentTheme.textMutedThemed }}
                  >
                    全方位分析你近期自律奋斗的时光
                  </p>
                </div>

                <div 
                  className="p-2.5 rounded-xl flex items-center gap-1 font-bold border transition-all"
                  style={{ 
                    backgroundColor: currentTheme.bgLightGrey, 
                    borderColor: currentTheme.borderThemed,
                    color: currentTheme.primary
                  }}
                >
                  <LucideIcon name="Trophy" size={15} />
                  <span className="text-[10px] font-bold font-mono">{stats.streakDays}天连击</span>
                </div>
              </div>

              <StatisticsSection
                sessions={sessions}
                tasks={tasks}
                theme={currentTheme}
              />
            </div>
          )}
        </div>
      </main>

      {/* 3. Mobile Navigation Tab Bar (Only visible at small viewport widths) */}
      <div 
        className="md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-md border-t px-6 py-2.5 flex items-center justify-around z-40 shadow-lg transition-all duration-300"
        style={{ 
          backgroundColor: `${currentTheme.bgCard}f2`, 
          borderTopColor: currentTheme.borderThemed 
        }}
      >
        {([
          { id: 'focus', label: '专注', icon: 'Clock' },
          { id: 'tasks', label: '待办', icon: 'CheckCircle2' },
          { id: 'calendar', label: '历程', icon: 'Calendar' },
          { id: 'stats', label: '成效', icon: 'BarChart3' },
        ] as const).map((tab) => {
          const isSelected = activePage === tab.id;
          return (
            <button
              id={`nav-mobile-${tab.id}`}
              key={tab.id}
              onClick={() => setActivePage(tab.id)}
              className="flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all cursor-pointer"
              style={{
                backgroundColor: isSelected ? currentTheme.bgLightGrey : 'transparent',
                color: isSelected ? currentTheme.primary : currentTheme.textMutedThemed,
              }}
            >
              <LucideIcon name={tab.icon} size={17} />
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Settlement Modal Popover */}
      <SettlementModal
        isOpen={showSettlement}
        onClose={() => setShowSettlement(false)}
        focusedMinutes={lastFinishedMinutes}
        focusedMode={activeFocusMode}
        todayTomatoCount={stats.todayTomatoCount}
        weekTomatoCount={stats.weekTomatoCount}
        monthTomatoCount={stats.monthTomatoCount}
        streakDays={stats.streakDays}
        theme={currentTheme}
      />
    </div>
  );
}
