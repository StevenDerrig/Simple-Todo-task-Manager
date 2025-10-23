// ====================================
// STATE MANAGEMENT
// ====================================
let tasks = [];
let history = [];
let saveTimeout = null;
let countdownUpdateInterval = null;


// ====================================
// PERFORMANCE OPTIMIZED SAVE
// ====================================
function saveTasks() {
    // Debounce saves - wait 300ms before actually saving
    // This batches multiple rapid changes into one save
    clearTimeout(saveTimeout);

    saveTimeout = setTimeout(() => {
        try {
            localStorage.setItem('tasks', JSON.stringify(tasks));
            localStorage.setItem('history', JSON.stringify(history));
            console.log('Tasks saved successfully');
        } catch (error) {
            console.error('Error saving tasks:', error);
            alert('Unable to save tasks. Storage might be full.');
        }
    }, 300);
}


// ====================================
// LOAD TASKS
// ====================================
function loadTasks() {
    try {
        const savedTasks = localStorage.getItem('tasks');
        const savedHistory = localStorage.getItem('history');

        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        }

        if (savedHistory) {
            history = JSON.parse(savedHistory);
        }

        renderTasks();
        renderHistory();
    } catch (error) {
        console.error('Error loading tasks:', error);
        alert('Unable to load tasks. Data might be corrupted.');
    }
}


// ====================================
// TAB MANAGEMENT WITH EVENT DELEGATION
// ====================================
function initializeTabs() {
    const tabContainer = document.querySelector('.tabs');

    tabContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
            const tabName = e.target.dataset.tab;
            showTab(tabName);
        }
    });
}


function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));

    if (tabName === 'active') {
        tabs[0].classList.add('active');
        document.getElementById('activeTab').classList.add('active');
    } else {
        tabs[1].classList.add('active');
        document.getElementById('historyTab').classList.add('active');
    }
}


// ====================================
// TASK MANAGEMENT
// ====================================
function addTask() {
    const input = document.getElementById('taskInput');
    const dueDateInput = document.getElementById('dueDateInput');

    if (!input.value.trim()) {
        alert('Please enter a task name');
        return;
    }

    if (!dueDateInput.value) {
        alert('Please select a due date');
        return;
    }

    const task = {
        id: Date.now(),
        title: input.value.trim(),
        dueDate: dueDateInput.value,
        note: '',
        subtasks: []
    };

    tasks.push(task);
    saveTasks();
    renderTasks();

    input.value = '';
    dueDateInput.value = '';
}


function completeTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const completedTask = {
        ...task,
        completedDate: new Date().toISOString()
    };

    history.unshift(completedTask);
    tasks = tasks.filter(t => t.id !== taskId);

    saveTasks();
    renderTasks();
    renderHistory();
}


function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
    renderTasks();
}


function restoreTask(taskId) {
    const task = history.find(t => t.id === taskId);
    if (!task) return;

    const restoredTask = {
        id: Date.now(),
        title: task.title,
        dueDate: task.dueDate,
        note: task.note,
        subtasks: task.subtasks.map(st => ({
            ...st,
            id: Date.now() + Math.random(),
            completed: false
        }))
    };

    tasks.push(restoredTask);
    saveTasks();
    renderTasks();
    showTab('active');
}


function deleteFromHistory(taskId) {
    if (!confirm('Are you sure you want to permanently delete this task?')) return;

    history = history.filter(t => t.id !== taskId);
    saveTasks();
    renderHistory();
}


// ====================================
// TASK NOTE MANAGEMENT
// ====================================
function updateTaskNote(taskId) {
    const noteInput = document.getElementById(`task-note-${taskId}`);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    task.note = noteInput.value.trim();
    saveTasks();

    // Re-render to show the updated note properly
    renderTasks();
}


function showTaskNoteEditor(taskId) {
    const displayDiv = document.getElementById(`task-note-display-${taskId}`);
    const editorDiv = document.getElementById(`task-note-editor-${taskId}`);
    const textarea = document.getElementById(`task-note-${taskId}`);

    if (displayDiv) displayDiv.style.display = 'none';
    if (editorDiv) editorDiv.style.display = 'block';
    if (textarea) textarea.focus();
}


function hideTaskNoteEditor(taskId) {
    updateTaskNote(taskId);
    // Re-render will handle showing/hiding properly
}


// ====================================
// SUBTASK NOTE MANAGEMENT  
// ====================================
function updateSubtaskNote(taskId, subtaskId) {
    const noteInput = document.getElementById(`subtask-note-${taskId}-${subtaskId}`);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const subtask = task.subtasks.find(s => s.id === subtaskId);
    if (!subtask) return;

    subtask.note = noteInput.value.trim();
    saveTasks();

    // Re-render to show the updated note properly
    renderTasks();
}


function showSubtaskNoteEditor(taskId, subtaskId) {
    const displayDiv = document.getElementById(`subtask-note-display-${taskId}-${subtaskId}`);
    const editorDiv = document.getElementById(`subtask-note-editor-${taskId}-${subtaskId}`);
    const textarea = document.getElementById(`subtask-note-${taskId}-${subtaskId}`);

    if (displayDiv) displayDiv.style.display = 'none';
    if (editorDiv) editorDiv.style.display = 'block';
    if (textarea) textarea.focus();
}


function hideSubtaskNoteEditor(taskId, subtaskId) {
    updateSubtaskNote(taskId, subtaskId);
    // Re-render will handle showing/hiding properly
}


// ====================================
// SUBTASK MANAGEMENT
// ====================================
function addSubtask(taskId) {
    const input = document.getElementById(`subtask-${taskId}`);
    if (!input || !input.value.trim()) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    task.subtasks.push({
        id: Date.now(),
        text: input.value.trim(),
        note: '',
        completed: false
    });

    saveTasks();
    renderTasks();
    input.value = '';
}


function toggleSubtask(taskId, subtaskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const subtask = task.subtasks.find(s => s.id === subtaskId);
    if (!subtask) return;

    subtask.completed = !subtask.completed;
    saveTasks();

    // Performance optimization: Only update this subtask and progress bar
    updateSubtaskDisplay(taskId, subtaskId);
    updateProgressBar(taskId);
}


function deleteSubtask(taskId, subtaskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    task.subtasks = task.subtasks.filter(s => s.id !== subtaskId);
    saveTasks();
    renderTasks();
}


function updateSubtaskNote(taskId, subtaskId) {
    const noteInput = document.getElementById(`subtask-note-${taskId}-${subtaskId}`);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const subtask = task.subtasks.find(s => s.id === subtaskId);
    if (!subtask) return;

    subtask.note = noteInput.value.trim();
    saveTasks();
}


function showSubtaskNoteEditor(taskId, subtaskId) {
    const displayDiv = document.getElementById(`subtask-note-display-${taskId}-${subtaskId}`);
    const editorDiv = document.getElementById(`subtask-note-editor-${taskId}-${subtaskId}`);
    const textarea = document.getElementById(`subtask-note-${taskId}-${subtaskId}`);

    if (displayDiv) displayDiv.style.display = 'none';
    if (editorDiv) editorDiv.style.display = 'block';
    if (textarea) textarea.focus();
}


function hideSubtaskNoteEditor(taskId, subtaskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const subtask = task.subtasks.find(s => s.id === subtaskId);
    if (!subtask) return;

    const displayDiv = document.getElementById(`subtask-note-display-${taskId}-${subtaskId}`);
    const editorDiv = document.getElementById(`subtask-note-editor-${taskId}-${subtaskId}`);

    updateSubtaskNote(taskId, subtaskId);

    if (subtask.note) {
        if (displayDiv) displayDiv.style.display = 'block';
        if (editorDiv) editorDiv.style.display = 'none';
    }
}


// ====================================
// PERFORMANCE OPTIMIZATION: PARTIAL UPDATES
// ====================================
function updateSubtaskDisplay(taskId, subtaskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const subtask = task.subtasks.find(s => s.id === subtaskId);
    if (!subtask) return;

    const subtaskElement = document.querySelector(`[data-subtask-id="${taskId}-${subtaskId}"]`);
    if (subtaskElement) {
        if (subtask.completed) {
            subtaskElement.classList.add('completed');
        } else {
            subtaskElement.classList.remove('completed');
        }
    }
}


function updateProgressBar(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const progress = calculateProgress(task.subtasks);
    const progressBar = document.querySelector(`[data-progress-id="${taskId}"]`);

    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.textContent = `${progress}%`;
    }
}


// ====================================
// COUNTDOWN AND PROGRESS CALCULATIONS
// ====================================
function calculateProgress(subtasks) {
    if (subtasks.length === 0) return 0;
    const completed = subtasks.filter(s => s.completed).length;
    return Math.round((completed / subtasks.length) * 100);
}


function getCountdown(dueDate) {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;

    if (diff < 0) {
        return { text: 'Overdue!', urgent: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
        return { text: `${days}d ${hours}h remaining`, urgent: days < 2 };
    } else if (hours > 0) {
        return { text: `${hours}h ${minutes}m remaining`, urgent: true };
    } else {
        return { text: `${minutes}m remaining`, urgent: true };
    }
}


// ====================================
// PERFORMANCE OPTIMIZATION: UPDATE ONLY COUNTDOWNS
// ====================================
function updateAllCountdowns() {
    tasks.forEach(task => {
        const countdown = getCountdown(task.dueDate);
        const countdownElement = document.querySelector(`[data-countdown-id="${task.id}"]`);

        if (countdownElement) {
            countdownElement.textContent = `⏰ ${countdown.text}`;
            countdownElement.className = `countdown ${countdown.urgent ? 'urgent' : ''}`;
        }
    });
}


function startCountdownUpdater() {
    // Clear existing interval if any
    if (countdownUpdateInterval) {
        clearInterval(countdownUpdateInterval);
    }

    // Update countdowns every minute WITHOUT re-rendering entire DOM
    countdownUpdateInterval = setInterval(() => {
        updateAllCountdowns();
    }, 60000);
}


// ====================================
// COLLAPSIBLE SECTIONS
// ====================================
function toggleTaskSection(taskId, section) {
    const element = document.getElementById(`${section}-${taskId}`);
    const button = document.querySelector(`[data-toggle="${taskId}-${section}"]`);

    if (!element || !button) return;

    if (element.style.display === 'none') {
        element.style.display = 'block';
        button.textContent = button.textContent.replace('▶', '▼');
    } else {
        element.style.display = 'none';
        button.textContent = button.textContent.replace('▼', '▶');
    }
}


// ====================================
// RENDER FUNCTIONS
// ====================================
function renderTasks() {
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');

    if (tasks.length === 0) {
        taskList.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    // Show loading for large task lists
    if (tasks.length > 50) {
        showLoading();
        setTimeout(() => {
            renderTasksContent(taskList);
            hideLoading();
        }, 0);
    } else {
        renderTasksContent(taskList);
    }
}


function renderTasksContent(taskList) {
    taskList.innerHTML = tasks.map(task => {
        const progress = calculateProgress(task.subtasks);
        const countdown = getCountdown(task.dueDate);
        const dueDate = new Date(task.dueDate).toLocaleString();

        return `
            <div class="task-card">
                <div class="task-main-content">
                    <div class="task-header">
                        <div class="task-title">${escapeHtml(task.title)}</div>
                        <div class="task-actions">
                            <button class="complete-btn" data-action="complete" data-task-id="${task.id}">Complete</button>
                            <button class="delete-btn" data-action="delete" data-task-id="${task.id}">Delete</button>
                        </div>
                    </div>

                    <div class="task-info">
                        <div class="due-date">📅 Due: ${dueDate}</div>
                        <div class="countdown ${countdown.urgent ? 'urgent' : ''}" data-countdown-id="${task.id}">⏰ ${countdown.text}</div>
                    </div>

                    ${task.subtasks.length > 0 ? `
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%" data-progress-id="${task.id}">
                                ${progress}%
                            </div>
                        </div>
                    ` : ''}
                </div>

                <div class="task-section-toggles">
                    <button class="toggle-btn" data-toggle="${task.id}-notes" data-action="toggle-section" data-task-id="${task.id}" data-section="notes">
                        ${task.note ? '▼' : '▶'} Notes ${task.note ? '✓' : ''}
                    </button>
                    <button class="toggle-btn" data-toggle="${task.id}-subtasks" data-action="toggle-section" data-task-id="${task.id}" data-section="subtasks">
                        ▼ Subtasks (${task.subtasks.length})
                    </button>
                </div>

                <div id="notes-${task.id}" class="collapsible-section" style="display: ${task.note ? 'block' : 'none'};">
                    ${task.note ? `
                        <div id="task-note-display-${task.id}" class="task-note" data-action="edit-note" data-task-id="${task.id}" style="cursor: pointer;">
                            <div class="task-note-label">📝 Note: <span style="font-size: 11px; opacity: 0.7;">(click to edit)</span></div>
                            ${escapeHtml(task.note)}
                        </div>
                        <div id="task-note-editor-${task.id}" class="note-section" style="display: none;">
                            <textarea id="task-note-${task.id}" placeholder="Add notes for this task..." onblur="hideTaskNoteEditor(${task.id})">${escapeHtml(task.note)}</textarea>
                        </div>
                    ` : `
                        <div id="task-note-display-${task.id}" style="display: none;"></div>
                        <div id="task-note-editor-${task.id}" class="note-section">
                            <textarea id="task-note-${task.id}" placeholder="Add notes for this task..." onblur="hideTaskNoteEditor(${task.id})"></textarea>
                        </div>
                    `}
                </div>

                <div id="subtasks-${task.id}" class="collapsible-section">
                    <div class="subtasks">
                        <div class="subtask-input">
                            <input type="text" id="subtask-${task.id}" placeholder="Add a subtask...">
                            <button data-action="add-subtask" data-task-id="${task.id}">Add</button>
                        </div>

                        ${task.subtasks.map(subtask => `
                            <div class="subtask-item ${subtask.completed ? 'completed' : ''}" data-subtask-id="${task.id}-${subtask.id}">
                                <input type="checkbox" 
                                       ${subtask.completed ? 'checked' : ''} 
                                       data-action="toggle-subtask"
                                       data-task-id="${task.id}"
                                       data-subtask-id="${subtask.id}">
                                <div class="subtask-content">
                                    <div class="subtask-text">
                                        <span>${escapeHtml(subtask.text)}</span>
                                    </div>
                                    ${subtask.note ? `
                                        <div id="subtask-note-display-${task.id}-${subtask.id}" class="subtask-note" data-action="edit-subtask-note" data-task-id="${task.id}" data-subtask-id="${subtask.id}" style="cursor: pointer;">
                                            📝 ${escapeHtml(subtask.note)} <span style="font-size: 10px; opacity: 0.7;">(click to edit)</span>
                                        </div>
                                        <div id="subtask-note-editor-${task.id}-${subtask.id}" style="display: none; margin-top: 8px;">
                                            <textarea id="subtask-note-${task.id}-${subtask.id}" 
                                                      placeholder="Add note for this subtask..." 
                                                      onblur="hideSubtaskNoteEditor(${task.id}, ${subtask.id})"
                                                      style="width: 100%; font-size: 12px;">${escapeHtml(subtask.note)}</textarea>
                                        </div>
                                    ` : `
                                        <div id="subtask-note-display-${task.id}-${subtask.id}" style="display: none;"></div>
                                        <div id="subtask-note-editor-${task.id}-${subtask.id}" style="margin-top: 8px;">
                                            <textarea id="subtask-note-${task.id}-${subtask.id}" 
                                                      placeholder="Add note for this subtask..." 
                                                      onblur="hideSubtaskNoteEditor(${task.id}, ${subtask.id})"
                                                      style="width: 100%; font-size: 12px;"></textarea>
                                        </div>
                                    `}
                                </div>
                                <button class="subtask-delete" data-action="delete-subtask" data-task-id="${task.id}" data-subtask-id="${subtask.id}">×</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}


function renderHistory() {
    const historyList = document.getElementById('historyList');
    const historyEmptyState = document.getElementById('historyEmptyState');

    if (history.length === 0) {
        historyList.innerHTML = '';
        historyEmptyState.style.display = 'block';
        return;
    }

    historyEmptyState.style.display = 'none';

    historyList.innerHTML = history.map(task => {
        const completedDate = new Date(task.completedDate).toLocaleString();
        const dueDate = new Date(task.dueDate).toLocaleString();

        return `
            <div class="history-card">
                <div class="history-header">
                    <div class="task-title">${escapeHtml(task.title)}</div>
                    <div class="task-actions">
                        <button class="restore-btn" data-action="restore" data-task-id="${task.id}">Restore</button>
                        <button class="delete-btn" data-action="delete-history" data-task-id="${task.id}">Delete</button>
                    </div>
                </div>

                <div class="completed-date">✅ Completed: ${completedDate}</div>
                <div class="task-info">
                    <div class="due-date">📅 Was Due: ${dueDate}</div>
                </div>

                ${task.note ? `<div class="task-note"><div class="task-note-label">📝 Note:</div>${escapeHtml(task.note)}</div>` : ''}

                ${task.subtasks.length > 0 ? `
                    <div class="subtasks">
                        <div style="font-weight: 600; margin-bottom: 10px;">Subtasks:</div>
                        ${task.subtasks.map(subtask => `
                            <div class="subtask-item ${subtask.completed ? 'completed' : ''}">
                                <input type="checkbox" ${subtask.completed ? 'checked' : ''} disabled>
                                <div class="subtask-content">
                                    <div class="subtask-text">
                                        <span>${escapeHtml(subtask.text)}</span>
                                    </div>
                                    ${subtask.note ? `<div class="subtask-note">📝 ${escapeHtml(subtask.note)}</div>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}


// ====================================
// SECURITY: ESCAPE HTML
// ====================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


// ====================================
// LOADING INDICATORS
// ====================================
function showLoading() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }
}


function hideLoading() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}


// ====================================
// EVENT DELEGATION FOR PERFORMANCE
// ====================================
function initializeEventDelegation() {
    // Delegate all clicks on task list
    const taskList = document.getElementById('taskList');
    taskList.addEventListener('click', handleTaskListClick);

    // Delegate all clicks on history list
    const historyList = document.getElementById('historyList');
    historyList.addEventListener('click', handleHistoryListClick);

    // Delegate checkbox changes
    taskList.addEventListener('change', handleTaskListChange);

    // Add task button
    const addTaskBtn = document.getElementById('addTaskBtn');
    addTaskBtn.addEventListener('click', addTask);

    // Enter key for adding tasks
    const taskInput = document.getElementById('taskInput');
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
}


function handleTaskListClick(e) {
    const action = e.target.dataset.action;
    const taskId = parseInt(e.target.dataset.taskId);
    const subtaskId = parseInt(e.target.dataset.subtaskId);
    const section = e.target.dataset.section;

    switch (action) {
        case 'complete':
            completeTask(taskId);
            break;
        case 'delete':
            deleteTask(taskId);
            break;
        case 'add-subtask':
            addSubtask(taskId);
            break;
        case 'delete-subtask':
            deleteSubtask(taskId, subtaskId);
            break;
        case 'toggle-section':
            toggleTaskSection(taskId, section);
            break;
        case 'edit-note':
            showTaskNoteEditor(taskId);
            break;
        case 'edit-subtask-note':
            showSubtaskNoteEditor(taskId, subtaskId);
            break;
    }
}


function handleHistoryListClick(e) {
    const action = e.target.dataset.action;
    const taskId = parseInt(e.target.dataset.taskId);

    switch (action) {
        case 'restore':
            restoreTask(taskId);
            break;
        case 'delete-history':
            deleteFromHistory(taskId);
            break;
    }
}


function handleTaskListChange(e) {
    const action = e.target.dataset.action;
    const taskId = parseInt(e.target.dataset.taskId);
    const subtaskId = parseInt(e.target.dataset.subtaskId);

    if (action === 'toggle-subtask') {
        toggleSubtask(taskId, subtaskId);
    }
}


// ====================================
// SERVICE WORKER REGISTRATION (PWA)
// ====================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('✅ Service Worker registered successfully:', registration.scope);
            })
            .catch(error => {
                console.log('❌ Service Worker registration failed:', error);
            });
    });
}


// ====================================
// INITIALIZATION
// ====================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Task Checklist App Starting...');

    // Load saved data
    loadTasks();

    // Initialize event delegation
    initializeEventDelegation();

    // Initialize tabs
    initializeTabs();

    // Start countdown updater
    startCountdownUpdater();

    console.log('✅ App initialized successfully!');
});


// ====================================
// CLEANUP ON PAGE UNLOAD
// ====================================
window.addEventListener('beforeunload', () => {
    // Force save any pending changes
    if (saveTimeout) {
        clearTimeout(saveTimeout);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('history', JSON.stringify(history));
    }

    // Clear interval
    if (countdownUpdateInterval) {
        clearInterval(countdownUpdateInterval);
    }
});