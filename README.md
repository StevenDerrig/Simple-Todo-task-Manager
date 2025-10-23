# Task Checklist - React PWA for Android

A fully functional React-based Progressive Web App (PWA) task manager specifically designed for Android, featuring persistent notifications and SQLite storage.

## Features

- **React-based Architecture**: Modern React components with hooks
- **Frutiger Aero Design**: Maintains the original beautiful gradient UI style
- **Persistent Notifications**: Pin tasks to Android notifications to track progress
- **SQLite Storage**: Robust local database using SQL.js
- **Subtask Management**: Break down tasks into smaller steps
- **Progress Tracking**: Visual progress bars for task completion
- **Task History**: Review completed tasks with full details
- **Countdown Timers**: Real-time countdown to due dates
- **Notes**: Add detailed notes to tasks and subtasks
- **Android-Ready**: Built with Capacitor for native Android deployment

## Tech Stack

- React 18
- Vite (build tool)
- SQL.js (SQLite for the browser)
- Capacitor 7 (Android native bridge)
- Capacitor Local Notifications

## Development

### Prerequisites

- Node.js 20+ and npm
- For Android: Android Studio and JDK 17+

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Android Deployment

### Build and Sync

```bash
npm run build
npx cap sync
```

### Open in Android Studio

```bash
npx cap open android
```

Or use the convenience script:

```bash
npm run android
```

### Configure Notification Icon

The app uses a custom notification icon `ic_stat_task`. To add your own icon:

1. Place your icon in `android/app/src/main/res/drawable/`
2. Use Android Asset Studio for proper sizing
3. Update `capacitor.config.json` if you change the icon name

## Architecture

### Database (SQLite)

The app uses SQL.js for client-side SQLite database with the following tables:

- `tasks`: Main task information
- `subtasks`: Sub-items for each task
- `history`: Completed tasks
- `history_subtasks`: Sub-items for completed tasks

Data is automatically synced to localStorage for persistence.

### Components

- `App.jsx`: Main application component
- `TaskList.jsx`: Displays active tasks
- `TaskCard.jsx`: Individual task with all features
- `SubtaskItem.jsx`: Individual subtask component
- `HistoryList.jsx`: Shows completed tasks
- `AddTaskForm.jsx`: Form to create new tasks

### Utilities

- `database.js`: SQLite operations and data management
- `notifications.js`: Android notification handling

## Notifications

The app supports persistent notifications on Android. When you "Pin to Notification" a task:

- Task title and progress appear in the notification tray
- Notifications are persistent (ongoing) until cleared
- Shows real-time countdown to due date
- Updates automatically when task progress changes
- Tap notification to open the app

## Storage Migration

The app automatically migrates data from the old localStorage format to SQLite on first run. This ensures a seamless transition from the vanilla JavaScript version.

## Security

- Input sanitization for XSS prevention
- No external API dependencies (runs fully offline)
- Secure local storage with SQLite
- CodeQL scanning for vulnerability detection

## Performance

- Optimized React rendering with proper hooks usage
- Debounced database saves
- Lazy loading for large task lists
- Efficient countdown updates (1-minute intervals)
- Service Worker caching for offline support

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Any modern Android browser (for web version)
- Android 7.0+ (for native app)

## License

ISC

## Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
