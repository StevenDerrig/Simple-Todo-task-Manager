function HistoryList({ history, onRestoreTask, onDeleteFromHistory }) {
  if (history.length === 0) {
    return (
      <div className="empty-state">
        No completed tasks yet.
      </div>
    );
  }

  return (
    <div id="historyList">
      {history.map(task => {
        const completedDate = new Date(task.completedDate).toLocaleString();
        const dueDate = new Date(task.dueDate).toLocaleString();

        return (
          <div key={task.id} className="history-card">
            <div className="history-header">
              <div className="task-title">{task.title}</div>
              <div className="task-actions">
                <button
                  className="restore-btn"
                  onClick={() => onRestoreTask(task.id)}
                >
                  Restore
                </button>
                <button
                  className="delete-btn"
                  onClick={() => onDeleteFromHistory(task.id)}
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="completed-date">✅ Completed: {completedDate}</div>
            <div className="task-info">
              <div className="due-date">📅 Was Due: {dueDate}</div>
            </div>

            {task.note && (
              <div className="task-note">
                <div className="task-note-label">📝 Note:</div>
                {task.note}
              </div>
            )}

            {task.subtasks.length > 0 && (
              <div className="subtasks">
                <div style={{ fontWeight: 600, marginBottom: '10px' }}>
                  Subtasks:
                </div>
                {task.subtasks.map(subtask => (
                  <div
                    key={subtask.id}
                    className={`subtask-item ${subtask.completed ? 'completed' : ''}`}
                  >
                    <input type="checkbox" checked={subtask.completed} disabled />
                    <div className="subtask-content">
                      <div className="subtask-text">
                        <span>{subtask.text}</span>
                      </div>
                      {subtask.note && (
                        <div className="subtask-note">📝 {subtask.note}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default HistoryList;
