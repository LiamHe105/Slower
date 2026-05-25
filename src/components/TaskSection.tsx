/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TaskItem, ColorTheme, FocusMode } from '../types';
import { FOCUS_MODES } from '../lib/constants';
import LucideIcon from './LucideIcon';

interface TaskSectionProps {
  tasks: TaskItem[];
  currentTaskId: string | null;
  onSelectTask: (taskId: string | null) => void;
  onAddTask: (name: string, modeId: string) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onUpdateTaskName: (taskId: string, newName: string) => void;
  onDeleteTask: (taskId: string) => void;
  theme: ColorTheme;
}

export default function TaskSection({
  tasks,
  currentTaskId,
  onSelectTask,
  onAddTask,
  onToggleTaskComplete,
  onUpdateTaskName,
  onDeleteTask,
  theme,
}: TaskSectionProps) {
  const [newTaskName, setNewTaskName] = useState('');
  const [selectedModeId, setSelectedModeId] = useState<string>('study');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    onAddTask(newTaskName.trim(), selectedModeId);
    setNewTaskName('');
  };

  const handleStartEditing = (task: TaskItem) => {
    setEditingTaskId(task.id);
    setEditingName(task.name);
  };

  const handleSaveEdit = (taskId: string) => {
    if (editingName.trim()) {
      onUpdateTaskName(taskId, editingName.trim());
    }
    setEditingTaskId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, taskId: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(taskId);
    } else if (e.key === 'Escape') {
      setEditingTaskId(null);
    }
  };

  return (
    <div 
      id="tasks-panel" 
      className="glass-panel rounded-2xl border p-5 shadow-mac-card h-full flex flex-col transition-all duration-300"
      style={{
        backgroundColor: theme.bgCard,
        borderColor: theme.borderThemed
      }}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 
            className="font-display font-bold text-sm tracking-tight flex items-center gap-1.5"
            style={{ color: theme.textDarkThemed }}
          >
            <LucideIcon name="CheckCircle2" className="opacity-75" size={18} />
            今日任务清单
          </h3>
          <p 
            className="text-xs mt-0.5"
            style={{ color: theme.textMutedThemed }}
          >
            创建并绑定对应的计时器模式
          </p>
        </div>

        {/* Counter tag */}
        <span 
          className="text-[11px] font-semibold border rounded-full py-0.5 px-2.5 font-mono transition-all"
          style={{ 
            backgroundColor: theme.bgLightGrey, 
            borderColor: theme.borderThemed,
            color: theme.textDarkThemed
          }}
        >
          待办 {activeTasks.length} / 已成 {completedTasks.length}
        </span>
      </div>

      {/* Dynamic Task Quick Filters */}
      <div 
        className="flex p-0.5 rounded-lg border text-xs font-semibold mb-4 transition-all"
        style={{
          backgroundColor: theme.bgLightGrey,
          borderColor: theme.borderThemed
        }}
      >
        <button
          id="filter-active-tasks"
          onClick={() => setFilter('active')}
          className="flex-1 py-1.5 text-center rounded-md cursor-pointer transition-all duration-150"
          style={{
            backgroundColor: filter === 'active' ? theme.bgCard : 'transparent',
            color: filter === 'active' ? theme.textDarkThemed : theme.textMutedThemed,
            boxShadow: filter === 'active' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
          }}
        >
          待完成 ({activeTasks.length})
        </button>
        <button
          id="filter-completed-tasks"
          onClick={() => setFilter('completed')}
          className="flex-1 py-1.5 text-center rounded-md cursor-pointer transition-all duration-150"
          style={{
            backgroundColor: filter === 'completed' ? theme.bgCard : 'transparent',
            color: filter === 'completed' ? theme.textDarkThemed : theme.textMutedThemed,
            boxShadow: filter === 'completed' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
          }}
        >
          已完成 ({completedTasks.length})
        </button>
        <button
          id="filter-all-tasks"
          onClick={() => setFilter('all')}
          className="flex-1 py-1.5 text-center rounded-md cursor-pointer transition-all duration-150"
          style={{
            backgroundColor: filter === 'all' ? theme.bgCard : 'transparent',
            color: filter === 'all' ? theme.textDarkThemed : theme.textMutedThemed,
            boxShadow: filter === 'all' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
          }}
        >
          全部 ({tasks.length})
        </button>
      </div>

      {/* Add Task Quick Form */}
      <form 
        onSubmit={handleCreateTask} 
        className="flex flex-col gap-2 mb-4 p-2.5 rounded-xl border transition-all"
        style={{
          backgroundColor: theme.bgLightGrey,
          borderColor: theme.borderThemed
        }}
      >
        <div className="relative flex items-center">
          <input
            id="add-task-input"
            type="text"
            placeholder="今天打算专注于做什么？"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            className="w-full text-xs bg-white border rounded-xl py-2 pl-3 pr-9 outline-none focus:ring-2 focus:ring-slate-100 transition-all font-sans font-semibold text-slate-800"
            style={{ borderColor: theme.borderThemed }}
          />
          <button
            type="submit"
            id="add-task-submit-btn"
            disabled={!newTaskName.trim()}
            className={`absolute right-1.5 p-1.5 rounded-lg transition-all ${
              newTaskName.trim()
                ? 'text-white cursor-pointer hover:scale-[1.03]'
                : 'text-slate-300 cursor-not-allowed'
            }`}
            style={{
              backgroundColor: newTaskName.trim() ? theme.primary : 'transparent',
            }}
          >
            <LucideIcon name="Plus" size={14} />
          </button>
        </div>

        {/* Quick select associated mode list */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 whitespace-nowrap text-[10px] scrollbar-none">
          <span style={{ color: theme.textMutedThemed }} className="font-semibold">绑定模式：</span>
          {FOCUS_MODES.map((m) => (
            <button
              id={`quick-add-mode-${m.id}`}
              type="button"
              key={m.id}
              onClick={() => setSelectedModeId(m.id)}
              className="py-0.5 px-2 rounded-full border transition-all cursor-pointer font-semibold"
              style={{
                backgroundColor: selectedModeId === m.id ? theme.primary : theme.bgCard,
                borderColor: selectedModeId === m.id ? 'transparent' : theme.borderThemed,
                color: selectedModeId === m.id ? '#ffffff' : theme.textMutedThemed,
              }}
            >
              {m.name.replace('模式', '')}
            </button>
          ))}
        </div>
      </form>

      {/* Task List Scroll */}
      <div className="flex-1 overflow-y-auto pr-1 max-h-[310px] space-y-2">
        {filteredTasks.length === 0 ? (
          <div 
            className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed transition-all"
            style={{ borderColor: theme.borderThemed, backgroundColor: theme.bgLightGrey }}
          >
            <LucideIcon name="CheckCircle2" className="text-slate-300 mb-2" size={24} />
            <span 
              className="text-xs font-semibold font-sans"
              style={{ color: theme.textMutedThemed }}
            >
              {filter === 'completed' ? '暂无已完成的任务' : '没有待办，快去新增一个吧！'}
            </span>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isAnchored = currentTaskId === task.id;
            const associatedMode = FOCUS_MODES.find((m) => m.id === task.modeId);
            
            return (
              <div
                id={`task-card-${task.id}`}
                key={task.id}
                className="flex gap-3 items-start p-3 rounded-xl border transition-all duration-200 group text-left shadow-sm"
                style={{
                  backgroundColor: isAnchored 
                    ? theme.bgLightGrey 
                    : task.completed
                    ? 'rgba(255, 255, 255, 0.4)'
                    : theme.bgCard,
                  borderColor: isAnchored ? theme.primary : theme.borderThemed,
                  opacity: task.completed ? 0.6 : 1
                }}
              >
                {/* Complete checkbox bubble */}
                <button
                  id={`checked-toggle-${task.id}`}
                  onClick={() => onToggleTaskComplete(task.id)}
                  className={`mt-0.5 rounded-full w-5 h-5 border flex items-center justify-center transition-all cursor-pointer ${
                    task.completed
                      ? 'text-white border-transparent'
                      : 'hover:border-slate-400 bg-white'
                  }`}
                  style={{
                    backgroundColor: task.completed ? theme.primary : undefined,
                    borderColor: task.completed ? 'transparent' : theme.borderThemed
                  }}
                >
                  {task.completed && <LucideIcon name="Check" size={11} />}
                </button>

                {/* Task core column */}
                <div className="flex-1 min-w-0">
                  {editingTaskId === task.id ? (
                    <input
                      id={`edit-task-input-${task.id}`}
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => handleSaveEdit(task.id)}
                      onKeyDown={(e) => handleKeyDown(e, task.id)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-1 outline-none focus:border-slate-400 font-sans"
                      autoFocus
                    />
                  ) : (
                    <div className="flex flex-col">
                      <span
                        className="text-xs font-sans font-bold break-words leading-relaxed"
                        style={{
                          color: task.completed ? theme.textMutedThemed : theme.textDarkThemed,
                          textDecoration: task.completed ? 'line-through' : 'none'
                        }}
                      >
                        {task.name}
                      </span>

                      {/* Info accents row */}
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {associatedMode && (
                          <span 
                            className="text-[9px] font-bold leading-none py-0.5 px-1.5 rounded border transition-all"
                            style={{ 
                              backgroundColor: theme.bgLightGrey, 
                              borderColor: theme.borderThemed, 
                              color: theme.textMutedThemed 
                            }}
                          >
                            {associatedMode.name}
                          </span>
                        )}
                        {task.totalDurationComplete > 0 && (
                          <span 
                            className="text-[9px] font-mono leading-none py-0.5 px-1.5 rounded border transition-all flex items-center gap-0.5"
                            style={{ 
                              backgroundColor: theme.bgLightGrey, 
                              borderColor: theme.borderThemed, 
                              color: theme.primary 
                            }}
                          >
                            <LucideIcon name="Clock" size={8} />
                            累计 {Math.round(task.totalDurationComplete / 60)} 分钟
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action buttons (right rail) */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap self-center">
                  {/* Select task for focus button */}
                  {!task.completed && (
                    <button
                      id={`select-task-btn-${task.id}`}
                      onClick={() => onSelectTask(isAnchored ? null : task.id)}
                      title={isAnchored ? "取消选定" : "选作当前专注任务"}
                      className="p-1 rounded cursor-pointer transition-colors"
                      style={{
                        backgroundColor: isAnchored ? theme.bgLightGrey : 'transparent',
                        color: isAnchored ? theme.primary : theme.textMutedThemed
                      }}
                    >
                      <LucideIcon name="Target" size={13} />
                    </button>
                  )}

                  {/* Edit label button */}
                  <button
                    id={`edit-task-btn-${task.id}`}
                    onClick={() => handleStartEditing(task)}
                    className="p-1 rounded cursor-pointer transition-colors"
                    style={{ color: theme.textMutedThemed }}
                  >
                    <LucideIcon name="Edit2" size={13} />
                  </button>

                  {/* Delete button */}
                  <button
                    id={`delete-task-btn-${task.id}`}
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1 rounded hover:bg-rose-50 cursor-pointer transition-colors"
                    style={{ color: theme.textMutedThemed }}
                  >
                    <LucideIcon name="Trash2" size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
