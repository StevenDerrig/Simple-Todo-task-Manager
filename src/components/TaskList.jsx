import TaskCard from './TaskCard';

function TaskList({
  tasks,
  onCompleteTask,
  onDeleteTask,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onUpdateTaskNote,
  onUpdateSubtaskNote,
  onSelectForNotification,
  onClearNotification,
  selectedTaskForNotification
}) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        No tasks yet. Add one to get started!
      </div>
    );
  }

  return (
    <div id="taskList">
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onComplete={onCompleteTask}
          onDelete={onDeleteTask}
          onAddSubtask={onAddSubtask}
          onToggleSubtask={onToggleSubtask}
          onDeleteSubtask={onDeleteSubtask}
          onUpdateTaskNote={onUpdateTaskNote}
          onUpdateSubtaskNote={onUpdateSubtaskNote}
          onSelectForNotification={onSelectForNotification}
          onClearNotification={onClearNotification}
          isSelectedForNotification={selectedTaskForNotification === task.id}
        />
      ))}
    </div>
  );
}

export default TaskList;
