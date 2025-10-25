import { useState, useEffect } from 'react';
import SubtaskItem from './SubtaskItem';

function TaskCard({
  task,
  onComplete,
  onDelete,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onUpdateTaskNote,
  onUpdateSubtaskNote,
  onSelectForNotification,
  onClearNotification,
  isSelectedForNotification
}) {
  const [subtaskInput, setSubtaskInput] = useState('');
  const [showNotes, setShowNotes] = useState(!!task.note);
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [taskNote, setTaskNote] = useState(task.note);
  const [isEditingNote, setIsEditingNote] = useState(!task.note);
  const [countdown, setCountdown] = useState({ text: '', urgent: false });

  // Calculate countdown
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const due = new Date(task.dueDate);
      const diff = due - now;

      if (diff < 0) {
        setCountdown({ text: 'Overdue!', urgent: true });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
          setCountdown({ text: `${days}d ${hours}h remaining`, urgent: days < 2 });
        } else if (hours > 0) {
          setCountdown({ text: `${hours}h ${minutes}m remaining`, urgent: true });
        } else {
          setCountdown({ text: `${minutes}m remaining`, urgent: true });
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [task.dueDate]);

  // Update task note state when task changes
  useEffect(() => {
    setTaskNote(task.note);
    setIsEditingNote(!task.note);
  }, [task.note]);

  const handleAddSubtask = () => {
    if (subtaskInput.trim()) {
      onAddSubtask(task.id, subtaskInput.trim());
      setSubtaskInput('');
    }
  };

  const handleNoteBlur = () => {
    if (taskNote !== task.note) {
      onUpdateTaskNote(task.id, taskNote);
    }
    if (taskNote) {
      setIsEditingNote(false);
    }
  };

  const calculateProgress = () => {
    if (task.subtasks.length === 0) return 0;
    const completed = task.subtasks.filter(s => s.completed).length;
    return Math.round((completed / task.subtasks.length) * 100);
  };

  const progress = calculateProgress();
  const dueDate = new Date(task.dueDate).toLocaleString();

  return (
    <div className="task-card">
      <div className="task-main-content">
        <div className="task-header">
          <div className="task-title">{task.title}</div>
          <div className="task-actions">
            {isSelectedForNotification ? (
              <button
                className="restore-btn"
                onClick={() => onClearNotification()}
              >
                Clear Notification
              </button>
            ) : (
              <button
                className="restore-btn"
                onClick={() => onSelectForNotification(task.id)}
              >
                Pin to Notification
              </button>
            )}
            <button className="complete-btn" onClick={() => onComplete(task.id)}>
              Complete
            </button>
            <button className="delete-btn" onClick={() => onDelete(task.id)}>
              Delete
            </button>
          </div>
        </div>

        <div className="task-info">
          <div className="due-date">📅 Due: {dueDate}</div>
          <div className={`countdown ${countdown.urgent ? 'urgent' : ''}`}>
            ⏰ {countdown.text}
          </div>
        </div>

        {task.subtasks.length > 0 && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}>
              {progress}%
            </div>
          </div>
        )}
      </div>

      <div className="task-section-toggles">
        <button
          className="toggle-btn"
          onClick={() => setShowNotes(!showNotes)}
        >
          {showNotes ? '▼' : '▶'} Notes {task.note ? '✓' : ''}
        </button>
        <button
          className="toggle-btn"
          onClick={() => setShowSubtasks(!showSubtasks)}
        >
          {showSubtasks ? '▼' : '▶'} Subtasks ({task.subtasks.length})
        </button>
      </div>

      {showNotes && (
        <div className="collapsible-section">
          {!isEditingNote && task.note ? (
            <div
              className="task-note"
              onClick={() => setIsEditingNote(true)}
              style={{ cursor: 'pointer' }}
            >
              <div className="task-note-label">
                📝 Note: <span style={{ fontSize: '11px', opacity: 0.7 }}>(click to edit)</span>
              </div>
              {task.note}
            </div>
          ) : (
            <div className="note-section">
              <textarea
                value={taskNote}
                onChange={(e) => setTaskNote(e.target.value)}
                onBlur={handleNoteBlur}
                placeholder="Add notes for this task..."
                autoFocus={isEditingNote}
              />
            </div>
          )}
        </div>
      )}

      {showSubtasks && (
        <div className="collapsible-section">
          <div className="subtasks">
            <h3 className="subtasks-header">✅ Subtasks</h3>
            <div className="subtask-input">
              <input
                type="text"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                placeholder="Add a subtask..."
              />
              <button onClick={handleAddSubtask}>Add</button>
            </div>

            {task.subtasks.map(subtask => (
              <SubtaskItem
                key={subtask.id}
                subtask={subtask}
                taskId={task.id}
                onToggle={onToggleSubtask}
                onDelete={onDeleteSubtask}
                onUpdateNote={onUpdateSubtaskNote}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskCard;
