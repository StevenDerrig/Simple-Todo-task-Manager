import initSqlJs from 'sql.js';

let db = null;
let SQL = null;

// Initialize the database
export const initDatabase = async () => {
  try {
    // Initialize SQL.js
    SQL = await initSqlJs({
      locateFile: file => `https://sql.js.org/dist/${file}`
    });

    // Try to load existing database from localStorage
    const savedDb = localStorage.getItem('taskDatabase');
    
    if (savedDb) {
      // Load from saved binary data
      const arr = new Uint8Array(JSON.parse(savedDb));
      db = new SQL.Database(arr);
    } else {
      // Create new database
      db = new SQL.Database();
      
      // Create tables
      db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY,
          title TEXT NOT NULL,
          dueDate TEXT NOT NULL,
          note TEXT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      db.run(`
        CREATE TABLE IF NOT EXISTS subtasks (
          id INTEGER PRIMARY KEY,
          taskId INTEGER NOT NULL,
          text TEXT NOT NULL,
          note TEXT,
          completed INTEGER DEFAULT 0,
          FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
        );
      `);
      
      db.run(`
        CREATE TABLE IF NOT EXISTS history (
          id INTEGER PRIMARY KEY,
          title TEXT NOT NULL,
          dueDate TEXT NOT NULL,
          note TEXT,
          completedDate TEXT NOT NULL
        );
      `);
      
      db.run(`
        CREATE TABLE IF NOT EXISTS history_subtasks (
          id INTEGER PRIMARY KEY,
          historyId INTEGER NOT NULL,
          text TEXT NOT NULL,
          note TEXT,
          completed INTEGER DEFAULT 0,
          FOREIGN KEY (historyId) REFERENCES history(id) ON DELETE CASCADE
        );
      `);
    }
    
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

// Save database to localStorage
export const saveDatabase = () => {
  if (db) {
    const data = db.export();
    const buffer = Array.from(data);
    localStorage.setItem('taskDatabase', JSON.stringify(buffer));
  }
};

// Tasks CRUD operations
export const getAllTasks = () => {
  if (!db) return [];
  
  const tasksResult = db.exec('SELECT * FROM tasks ORDER BY dueDate ASC');
  if (tasksResult.length === 0) return [];
  
  const tasks = tasksResult[0].values.map(row => {
    const [id, title, dueDate, note] = row;
    
    // Get subtasks for this task
    const subtasksResult = db.exec('SELECT * FROM subtasks WHERE taskId = ?', [id]);
    const subtasks = subtasksResult.length > 0 
      ? subtasksResult[0].values.map(st => ({
          id: st[0],
          taskId: st[1],
          text: st[2],
          note: st[3] || '',
          completed: Boolean(st[4])
        }))
      : [];
    
    return {
      id,
      title,
      dueDate,
      note: note || '',
      subtasks
    };
  });
  
  return tasks;
};

export const addTask = (task) => {
  if (!db) return null;
  
  db.run(
    'INSERT INTO tasks (id, title, dueDate, note) VALUES (?, ?, ?, ?)',
    [task.id, task.title, task.dueDate, task.note || '']
  );
  
  saveDatabase();
  return task.id;
};

export const updateTask = (taskId, updates) => {
  if (!db) return false;
  
  const { title, dueDate, note } = updates;
  db.run(
    'UPDATE tasks SET title = ?, dueDate = ?, note = ? WHERE id = ?',
    [title, dueDate, note || '', taskId]
  );
  
  saveDatabase();
  return true;
};

export const deleteTask = (taskId) => {
  if (!db) return false;
  
  db.run('DELETE FROM tasks WHERE id = ?', [taskId]);
  db.run('DELETE FROM subtasks WHERE taskId = ?', [taskId]);
  
  saveDatabase();
  return true;
};

// Subtasks CRUD operations
export const addSubtask = (subtask) => {
  if (!db) return null;
  
  db.run(
    'INSERT INTO subtasks (id, taskId, text, note, completed) VALUES (?, ?, ?, ?, ?)',
    [subtask.id, subtask.taskId, subtask.text, subtask.note || '', subtask.completed ? 1 : 0]
  );
  
  saveDatabase();
  return subtask.id;
};

export const updateSubtask = (subtaskId, updates) => {
  if (!db) return false;
  
  const { text, note, completed } = updates;
  db.run(
    'UPDATE subtasks SET text = ?, note = ?, completed = ? WHERE id = ?',
    [text, note || '', completed ? 1 : 0, subtaskId]
  );
  
  saveDatabase();
  return true;
};

export const deleteSubtask = (subtaskId) => {
  if (!db) return false;
  
  db.run('DELETE FROM subtasks WHERE id = ?', [subtaskId]);
  
  saveDatabase();
  return true;
};

// History operations
export const getAllHistory = () => {
  if (!db) return [];
  
  const historyResult = db.exec('SELECT * FROM history ORDER BY completedDate DESC');
  if (historyResult.length === 0) return [];
  
  const history = historyResult[0].values.map(row => {
    const [id, title, dueDate, note, completedDate] = row;
    
    // Get subtasks for this history item
    const subtasksResult = db.exec('SELECT * FROM history_subtasks WHERE historyId = ?', [id]);
    const subtasks = subtasksResult.length > 0 
      ? subtasksResult[0].values.map(st => ({
          id: st[0],
          text: st[2],
          note: st[3] || '',
          completed: Boolean(st[4])
        }))
      : [];
    
    return {
      id,
      title,
      dueDate,
      note: note || '',
      completedDate,
      subtasks
    };
  });
  
  return history;
};

export const moveTaskToHistory = (task) => {
  if (!db) return false;
  
  const completedDate = new Date().toISOString();
  
  // Add to history
  db.run(
    'INSERT INTO history (id, title, dueDate, note, completedDate) VALUES (?, ?, ?, ?, ?)',
    [task.id, task.title, task.dueDate, task.note || '', completedDate]
  );
  
  // Move subtasks to history
  if (task.subtasks && task.subtasks.length > 0) {
    task.subtasks.forEach(subtask => {
      db.run(
        'INSERT INTO history_subtasks (id, historyId, text, note, completed) VALUES (?, ?, ?, ?, ?)',
        [subtask.id, task.id, subtask.text, subtask.note || '', subtask.completed ? 1 : 0]
      );
    });
  }
  
  // Delete from tasks
  deleteTask(task.id);
  
  saveDatabase();
  return true;
};

export const deleteFromHistory = (historyId) => {
  if (!db) return false;
  
  db.run('DELETE FROM history WHERE id = ?', [historyId]);
  db.run('DELETE FROM history_subtasks WHERE historyId = ?', [historyId]);
  
  saveDatabase();
  return true;
};

export const restoreFromHistory = (historyItem) => {
  if (!db) return null;
  
  const newId = Date.now();
  
  // Add back to tasks
  db.run(
    'INSERT INTO tasks (id, title, dueDate, note) VALUES (?, ?, ?, ?)',
    [newId, historyItem.title, historyItem.dueDate, historyItem.note || '']
  );
  
  // Restore subtasks
  if (historyItem.subtasks && historyItem.subtasks.length > 0) {
    historyItem.subtasks.forEach(subtask => {
      const newSubtaskId = Date.now() + Math.random();
      db.run(
        'INSERT INTO subtasks (id, taskId, text, note, completed) VALUES (?, ?, ?, ?, ?)',
        [newSubtaskId, newId, subtask.text, subtask.note || '', 0] // Reset completed status
      );
    });
  }
  
  // Delete from history
  deleteFromHistory(historyItem.id);
  
  saveDatabase();
  return newId;
};

// Migrate from localStorage to SQLite
export const migrateFromLocalStorage = () => {
  if (!db) return false;
  
  try {
    const oldTasks = localStorage.getItem('tasks');
    const oldHistory = localStorage.getItem('history');
    
    if (oldTasks) {
      const tasks = JSON.parse(oldTasks);
      tasks.forEach(task => {
        addTask(task);
        
        if (task.subtasks && task.subtasks.length > 0) {
          task.subtasks.forEach(subtask => {
            addSubtask({
              ...subtask,
              taskId: task.id
            });
          });
        }
      });
    }
    
    if (oldHistory) {
      const history = JSON.parse(oldHistory);
      history.forEach(item => {
        db.run(
          'INSERT INTO history (id, title, dueDate, note, completedDate) VALUES (?, ?, ?, ?, ?)',
          [item.id, item.title, item.dueDate, item.note || '', item.completedDate]
        );
        
        if (item.subtasks && item.subtasks.length > 0) {
          item.subtasks.forEach(subtask => {
            db.run(
              'INSERT INTO history_subtasks (id, historyId, text, note, completed) VALUES (?, ?, ?, ?, ?)',
              [subtask.id, item.id, subtask.text, subtask.note || '', subtask.completed ? 1 : 0]
            );
          });
        }
      });
    }
    
    saveDatabase();
    
    // Clean up old localStorage
    localStorage.removeItem('tasks');
    localStorage.removeItem('history');
    
    console.log('Migration from localStorage completed');
    return true;
  } catch (error) {
    console.error('Error migrating from localStorage:', error);
    return false;
  }
};
