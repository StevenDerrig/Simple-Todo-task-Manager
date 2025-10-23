import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

let currentNotificationId = null;

// Check if we're running on a native platform
const isNative = Capacitor.isNativePlatform();

// Request notification permissions
export const requestNotificationPermission = async () => {
  if (!isNative) {
    console.log('Not running on native platform, skipping notification permission');
    return false;
  }

  try {
    const permission = await LocalNotifications.requestPermissions();
    return permission.display === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Show persistent notification for active task
export const showTaskNotification = async (task) => {
  if (!isNative) {
    console.log('Not running on native platform, skipping notification');
    return;
  }

  try {
    // Cancel previous notification if exists
    if (currentNotificationId !== null) {
      await LocalNotifications.cancel({ notifications: [{ id: currentNotificationId }] });
    }

    const notificationId = task.id;
    currentNotificationId = notificationId;

    // Calculate progress
    const progress = task.subtasks.length > 0
      ? Math.round((task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100)
      : 0;

    // Format due date countdown
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const diff = dueDate - now;
    
    let countdownText = '';
    if (diff < 0) {
      countdownText = 'Overdue!';
    } else {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        countdownText = `${days}d ${hours}h remaining`;
      } else if (hours > 0) {
        countdownText = `${hours}h ${minutes}m remaining`;
      } else {
        countdownText = `${minutes}m remaining`;
      }
    }

    const body = task.subtasks.length > 0
      ? `${progress}% complete • ${countdownText}`
      : countdownText;

    await LocalNotifications.schedule({
      notifications: [
        {
          id: notificationId,
          title: `📋 ${task.title}`,
          body: body,
          ongoing: true, // Makes it persistent
          autoCancel: false,
          smallIcon: 'ic_stat_task',
          extra: {
            taskId: task.id,
            action: 'show'
          }
        }
      ]
    });

    console.log('Task notification shown:', task.title);
  } catch (error) {
    console.error('Error showing task notification:', error);
  }
};

// Update existing notification
export const updateTaskNotification = async (task) => {
  if (!isNative) return;
  
  // Just show the notification again with updated content
  await showTaskNotification(task);
};

// Clear task notification
export const clearTaskNotification = async () => {
  if (!isNative) return;

  try {
    if (currentNotificationId !== null) {
      await LocalNotifications.cancel({ notifications: [{ id: currentNotificationId }] });
      currentNotificationId = null;
      console.log('Task notification cleared');
    }
  } catch (error) {
    console.error('Error clearing task notification:', error);
  }
};

// Handle notification actions
export const setupNotificationListeners = (onActionReceived) => {
  if (!isNative) return;

  LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
    const { notification: notif, actionId } = notification;
    
    if (onActionReceived) {
      onActionReceived({
        taskId: notif.extra?.taskId,
        action: actionId || 'tap'
      });
    }
  });
};

// Remove all listeners
export const removeNotificationListeners = () => {
  if (!isNative) return;
  
  LocalNotifications.removeAllListeners();
};
