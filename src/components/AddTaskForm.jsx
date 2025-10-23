import { useState } from 'react';

function AddTaskForm({ onAddTask }) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a task name');
      return;
    }
    
    if (!dueDate) {
      alert('Please select a due date');
      return;
    }
    
    onAddTask({ title: title.trim(), dueDate });
    setTitle('');
    setDueDate('');
  };

  return (
    <div className="add-task-section">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task name..."
          />
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <button type="submit">Add Task</button>
        </div>
      </form>
    </div>
  );
}

export default AddTaskForm;
