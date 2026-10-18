import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  CheckCircle, 
  Circle, 
  Trash2, 
  CalendarCheck, 
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Calendar,
  Clock,
  Target
} from 'lucide-react';

export default function StudyPlannerDrawer({
  isOpen,
  onClose,
  tasks = [],
  onToggleTask,
  onAddTask,
  onDeleteTask
}) {
  const formatYMD = (d) => {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };

  const todayStr = formatYMD(new Date());

  const [currentDate, setCurrentDate] = useState(new Date());
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Accounting');
  const [newPriority, setNewPriority] = useState('high');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  const currentStr = formatYMD(currentDate);

  const handlePrevDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleTodayReset = () => {
    setCurrentDate(new Date());
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      id: 'task_' + Date.now(),
      title: newTitle.trim(),
      subject: newSubject,
      priority: newPriority,
      completed: false,
      startDate: startDate || todayStr,
      endDate: endDate || startDate || todayStr
    });

    setNewTitle('');
  };

  if (!isOpen) return null;

  // Date Label Helper
  let dateLabel = currentStr;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (currentStr === todayStr) {
    dateLabel = 'Today (අද)';
  } else if (currentStr === formatYMD(yesterday)) {
    dateLabel = 'Yesterday (ඊයේ)';
  } else if (currentStr === formatYMD(tomorrow)) {
    dateLabel = 'Tomorrow (හෙට)';
  }

  // 1. Overdue Tasks: Any incomplete task whose endDate is in the past!
  // "අපි වැඩ ගොඩ ගහගෙන් හිටියොත් ඒවා අදල දින පහු වුනත් ස්ක්‍රීන් එකෙ තියෙන්න ඔන"
  const overdueTasks = tasks.filter(t => {
    if (t.completed) return false;
    const taskEnd = t.endDate || t.date;
    if (!taskEnd || taskEnd === 'Today' || taskEnd === 'Tomorrow' || taskEnd === 'This Week') return false;
    return taskEnd < todayStr;
  });

  // 2. Tasks for the currently selected date
  const scheduledTasks = tasks.filter(t => {
    // If it's already an overdue task, keep it in the overdue section so it doesn't duplicate
    if (overdueTasks.some(ot => ot.id === t.id)) return false;

    const taskStart = t.startDate || t.endDate || todayStr;
    const taskEnd = t.endDate || t.startDate || todayStr;

    if (t.date === 'Today' && currentStr === todayStr) return true;
    if (t.date === 'Tomorrow' && currentStr === formatYMD(tomorrow)) return true;

    return (taskStart <= currentStr && taskEnd >= currentStr) || taskEnd === currentStr;
  });

  const totalAllTasks = tasks.length;
  const completedAllTasks = tasks.filter(t => t.completed).length;
  const progressPercent = totalAllTasks > 0 ? Math.round((completedAllTasks / totalAllTasks) * 100) : 0;

  return (
    <div className="ptm-drawer-backdrop" onClick={onClose}>
      <div className="ptm-planner-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-row">
            <div className="planner-avatar-box">
              <CalendarCheck size={22} color="#ffffff" />
            </div>
            <div>
              <h3 className="planner-name">Study Planner & Task Tracker</h3>
              <p className="planner-status">{completedAllTasks} of {totalAllTasks} Tasks Completed ({progressPercent}%)</p>
            </div>
          </div>

          <button className="btn-drawer-close" onClick={onClose} title="Close Planner">
            <X size={20} />
          </button>
        </div>

        {/* Date Navigator Bar */}
        <div className="planner-date-nav-bar">
          <button 
            type="button" 
            className="planner-date-nav-btn" 
            onClick={handlePrevDay} 
            title="Previous Day"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="planner-date-center" onClick={handleTodayReset} title="Click to jump to Today">
            <Calendar size={14} className="text-emerald-400" />
            <span className="planner-date-title">{dateLabel}</span>
            <span className="planner-date-sub">{currentStr}</span>
          </div>

          <button 
            type="button" 
            className="planner-date-nav-btn" 
            onClick={handleNextDay} 
            title="Next Day"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="planner-progress-box">
          <div className="progress-info-row">
            <span>Overall Plan Completion</span>
            <span className="progress-num">{progressPercent}%</span>
          </div>
          <div className="progress-track">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Add New Task Form (With Start Date & End Date) */}
        <form className="add-task-form modern-planner-form" onSubmit={handleFormSubmit}>
          <input 
            type="text" 
            className="task-input" 
            placeholder="Add new study goal (e.g. Complete Unit 02 Past Papers)..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          <div className="task-form-controls">
            <select 
              value={newSubject} 
              onChange={(e) => setNewSubject(e.target.value)}
              className="task-select"
            >
              <option value="Accounting">Accounting (ගිණුම්කරණය)</option>
              <option value="Business Studies">Business Studies (ව්‍යාපාර අධ්‍යයනය)</option>
              <option value="Economics">Economics (ආර්ථික විද්‍යාව)</option>
              <option value="General">General Revision</option>
            </select>

            <select 
              value={newPriority} 
              onChange={(e) => setNewPriority(e.target.value)}
              className="task-select"
            >
              <option value="high">High Priority (ඉහළ ප්‍රමුඛතාව)</option>
              <option value="medium">Medium Priority (සාමාන්‍ය)</option>
              <option value="low">Low Priority (අවම)</option>
            </select>
          </div>

          {/* Start Date & End Date Row */}
          <div className="task-date-range-row">
            <div className="date-field-group">
              <label className="date-field-label">
                <Clock size={12} /> පටන් ගන්නා දිනය (Start Date)
              </label>
              <input 
                type="date" 
                className="task-date-input"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (endDate < e.target.value) {
                    setEndDate(e.target.value);
                  }
                }}
              />
            </div>

            <div className="date-field-group">
              <label className="date-field-label">
                <CalendarCheck size={12} /> අවසන් කරන දිනය (End / Due Date)
              </label>
              <input 
                type="date" 
                className="task-date-input"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-add-task">
              <Plus size={16} /> Add Task
            </button>
          </div>
        </form>

        {/* Tasks List Body */}
        <div className="tasks-list-body">
          {/* ========================================================
              PERSISTENT OVERDUE TASKS SECTION
              "අපි වැඩ ගොඩ ගහගෙන් හිටියොත් ඒවා අදල දින පහු වුනත් ස්ක්‍රීන් එකෙ තියෙන්න ඔන"
          ======================================================== */}
          {overdueTasks.length > 0 && (
            <div className="planner-overdue-section">
              <div className="planner-section-title overdue">
                <AlertTriangle size={15} className="text-rose-500" />
                <span>කල් ඉකුත් වූ වැඩ (Overdue Tasks) — {overdueTasks.length}</span>
                <span className="overdue-count-pill">{overdueTasks.length} Overdue</span>
              </div>

              <div className="overdue-task-cards">
                {overdueTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="task-row overdue-card"
                    onClick={() => onToggleTask(task.id)}
                  >
                    <button 
                      type="button"
                      className="task-check-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTask(task.id);
                      }}
                      title="Mark as completed to clear from overdue"
                    >
                      <Circle size={20} className="text-rose-400 hover:text-emerald-400" />
                    </button>

                    <div className="task-details">
                      <div className="task-title-row">
                        <span className="task-title-text font-bold text-rose-100">
                          {task.title}
                        </span>
                      </div>
                      
                      <div className="task-meta-row">
                        <span className="task-badge badge-overdue-alert">
                          ⚠️ Overdue: Due by {task.endDate || task.date}
                        </span>
                        <span className={`task-badge badge-${task.subject?.toLowerCase().replace(/\s+/g, '-') || 'general'}`}>
                          {task.subject}
                        </span>
                        <span className={`task-priority-badge ${task.priority}`}>
                          {task.priority?.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <button 
                      type="button"
                      className="btn-delete-task"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTask(task.id);
                      }}
                      title="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              SCHEDULED TASKS FOR SELECTED DATE
          ======================================================== */}
          <div className="planner-section-title scheduled-title">
            <Calendar size={14} className="text-indigo-400" />
            <span>Tasks for {dateLabel}</span>
            <span className="section-count-tag">({scheduledTasks.length})</span>
          </div>

          {scheduledTasks.map((task) => (
            <div 
              key={task.id} 
              className={`task-row ${task.completed ? 'completed' : ''}`}
              onClick={() => onToggleTask(task.id)}
            >
              <button 
                type="button"
                className="task-check-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleTask(task.id);
                }}
              >
                {task.completed ? (
                  <CheckCircle size={20} className="text-emerald-500" />
                ) : (
                  <Circle size={20} className="text-gray-400" />
                )}
              </button>

              <div className="task-details">
                <span className={`task-title-text ${task.completed ? 'line-through text-gray-500' : ''}`}>
                  {task.title}
                </span>
                
                <div className="task-meta-row">
                  <span className={`task-badge badge-${task.subject?.toLowerCase().replace(/\s+/g, '-') || 'general'}`}>
                    {task.subject}
                  </span>
                  <span className={`task-priority-badge ${task.priority}`}>
                    {task.priority?.toUpperCase()}
                  </span>
                  {(task.startDate || task.endDate) && (
                    <span className="task-date-range-badge">
                      {task.startDate} ➔ {task.endDate}
                    </span>
                  )}
                </div>
              </div>

              <button 
                type="button"
                className="btn-delete-task"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTask(task.id);
                }}
                title="Delete goal"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {scheduledTasks.length === 0 && overdueTasks.length === 0 && (
            <div className="empty-tasks-card">
              <Target size={40} className="text-gray-400" />
              <p>No study tasks scheduled for this day. Plan your study session above!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
