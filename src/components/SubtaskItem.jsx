import { useState, useEffect } from 'react';

function SubtaskItem({ subtask, taskId, onToggle, onDelete, onUpdateNote }) {
  const [note, setNote] = useState(subtask.note);
  const [isEditingNote, setIsEditingNote] = useState(!subtask.note);

  useEffect(() => {
    setNote(subtask.note);
    setIsEditingNote(!subtask.note);
  }, [subtask.note]);

  const handleNoteBlur = () => {
    if (note !== subtask.note) {
      onUpdateNote(taskId, subtask.id, note);
    }
    if (note) {
      setIsEditingNote(false);
    }
  };

  return (
    <div className={`subtask-item ${subtask.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={subtask.completed}
        onChange={() => onToggle(taskId, subtask.id)}
      />
      <div className="subtask-content">
        <div className="subtask-text">
          <span>{subtask.text}</span>
        </div>
        
        {!isEditingNote && subtask.note ? (
          <div
            className="subtask-note"
            onClick={() => setIsEditingNote(true)}
            style={{ cursor: 'pointer' }}
          >
            📝 {subtask.note}{' '}
            <span style={{ fontSize: '10px', opacity: 0.7 }}>(click to edit)</span>
          </div>
        ) : (
          <div style={{ marginTop: '8px' }}>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={handleNoteBlur}
              placeholder="Add note for this subtask..."
              style={{ width: '100%', fontSize: '12px' }}
            />
          </div>
        )}
      </div>
      <button
        className="subtask-delete"
        onClick={() => onDelete(taskId, subtask.id)}
      >
        ×
      </button>
    </div>
  );
}

export default SubtaskItem;
