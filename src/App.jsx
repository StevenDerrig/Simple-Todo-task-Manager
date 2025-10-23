import { useState, useEffect, useCallback } from 'react';
import './styles/App.css';
import TaskList from './components/TaskList';
import HistoryList from './components/HistoryList';
import AddTaskForm from './components/AddTaskForm';
import {
  initDatabase,
  getAllTasks,
  getAllHistory,
  addTask as dbAddTask,
  deleteTask as dbDeleteTask,
  moveTaskToHistory,
  deleteFromHistory as dbDeleteFromHistory,
  restoreFromHistory as dbRestoreFromHistory,
  addSubtask as dbAddSubtask,
  updateSubtask as dbUpdateSubtask,
  deleteSubtask as dbDeleteSubtask,
  updateTask as dbUpdateTask,
  migrateFromLocalStorage
} from './utils/database';
import {
  requestNotificationPermission,
  showTaskNotification,
  clearTaskNotification,
  setupNotificationListeners,
  removeNotificationListeners
} from './utils/notifications';

function App() {
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [selectedTaskForNotification, setSelectedTaskForNotification] = useState(null);
  const [dbReady, setDbReady] = useState(false);

  // Initialize database and load data
  useEffect(() => {
    const init = async () => {
      const success = await initDatabase();
      if (success) {
        // Try to migrate from old localStorage
        migrateFromLocalStorage();
        
        // Load data
        loadTasks();
        loadHistory();
        setDbReady(true);
        
        // Request notification permission
        await requestNotificationPermission();
      }
    };
    
    init();
  }, []);

  // Setup notification listeners
  useEffect(() => {
    setupNotificationListeners((data) => {
      // When notification is tapped, open the app and show the task
      console.log('Notification action received:', data);
    });
    
    return () => {
      removeNotificationListeners();
    };
  }, []);

  const loadTasks = useCallback(() => {
    const loadedTasks = getAllTasks();
    setTasks(loadedTasks);
  }, []);

  const loadHistory = useCallback(() => {
    const loadedHistory = getAllHistory();
    setHistory(loadedHistory);
  }, []);

  const handleAddTask = (taskData) => {
    const newTask = {
      id: Date.now(),
      title: taskData.title,
      dueDate: taskData.dueDate,
      note: '',
      subtasks: []
    };
    
    dbAddTask(newTask);
    loadTasks();
  };

  const handleCompleteTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      moveTaskToHistory(task);
      loadTasks();
      loadHistory();
      
      // Clear notification if this task was selected
      if (selectedTaskForNotification === taskId) {
        clearTaskNotification();
        setSelectedTaskForNotification(null);
      }
    }
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dbDeleteTask(taskId);
      loadTasks();
      
      // Clear notification if this task was selected
      if (selectedTaskForNotification === taskId) {
        clearTaskNotification();
        setSelectedTaskForNotification(null);
      }
    }
  };

  const handleRestoreTask = (historyId) => {
    const historyItem = history.find(h => h.id === historyId);
    if (historyItem) {
      dbRestoreFromHistory(historyItem);
      loadTasks();
      loadHistory();
      setActiveTab('active');
    }
  };

  const handleDeleteFromHistory = (historyId) => {
    if (window.confirm('Are you sure you want to permanently delete this task?')) {
      dbDeleteFromHistory(historyId);
      loadHistory();
    }
  };

  const handleAddSubtask = (taskId, subtaskText) => {
    const subtask = {
      id: Date.now(),
      taskId,
      text: subtaskText,
      note: '',
      completed: false
    };
    
    dbAddSubtask(subtask);
    loadTasks();
    
    // Update notification if this task is selected
    if (selectedTaskForNotification === taskId) {
      const updatedTask = getAllTasks().find(t => t.id === taskId);
      if (updatedTask) {
        showTaskNotification(updatedTask);
      }
    }
  };

  const handleToggleSubtask = (taskId, subtaskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const subtask = task.subtasks.find(s => s.id === subtaskId);
      if (subtask) {
        dbUpdateSubtask(subtaskId, {
          text: subtask.text,
          note: subtask.note,
          completed: !subtask.completed
        });
        loadTasks();
        
        // Update notification if this task is selected
        if (selectedTaskForNotification === taskId) {
          const updatedTask = getAllTasks().find(t => t.id === taskId);
          if (updatedTask) {
            showTaskNotification(updatedTask);
          }
        }
      }
    }
  };

  const handleDeleteSubtask = (taskId, subtaskId) => {
    dbDeleteSubtask(subtaskId);
    loadTasks();
    
    // Update notification if this task is selected
    if (selectedTaskForNotification === taskId) {
      const updatedTask = getAllTasks().find(t => t.id === taskId);
      if (updatedTask) {
        showTaskNotification(updatedTask);
      }
    }
  };

  const handleUpdateTaskNote = (taskId, note) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      dbUpdateTask(taskId, {
        title: task.title,
        dueDate: task.dueDate,
        note
      });
      loadTasks();
    }
  };

  const handleUpdateSubtaskNote = (taskId, subtaskId, note) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const subtask = task.subtasks.find(s => s.id === subtaskId);
      if (subtask) {
        dbUpdateSubtask(subtaskId, {
          text: subtask.text,
          note,
          completed: subtask.completed
        });
        loadTasks();
      }
    }
  };

  const handleSelectTaskForNotification = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await showTaskNotification(task);
      setSelectedTaskForNotification(taskId);
    }
  };

  const handleClearNotification = async () => {
    await clearTaskNotification();
    setSelectedTaskForNotification(null);
  };

  if (!dbReady) {
    return (
      <div className="loading-overlay" style={{ display: 'flex' }}>
        <div className="loading-spinner">Initializing Database...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>📋 Task Checklist</h1>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Tasks
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Task History
        </button>
      </div>

      {activeTab === 'active' ? (
        <div className="tab-content active">
          <AddTaskForm onAddTask={handleAddTask} />
          
          <TaskList
            tasks={tasks}
            onCompleteTask={handleCompleteTask}
            onDeleteTask={handleDeleteTask}
            onAddSubtask={handleAddSubtask}
            onToggleSubtask={handleToggleSubtask}
            onDeleteSubtask={handleDeleteSubtask}
            onUpdateTaskNote={handleUpdateTaskNote}
            onUpdateSubtaskNote={handleUpdateSubtaskNote}
            onSelectForNotification={handleSelectTaskForNotification}
            onClearNotification={handleClearNotification}
            selectedTaskForNotification={selectedTaskForNotification}
          />
        </div>
      ) : (
        <div className="tab-content active">
          <HistoryList
            history={history}
            onRestoreTask={handleRestoreTask}
            onDeleteFromHistory={handleDeleteFromHistory}
          />
        </div>
      )}
    </div>
  );
}

export default App;
