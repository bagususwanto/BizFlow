# BizFlow Server - Desktop Application

Desktop server application for BizFlow POS system. Provides a one-click installer for on-premise deployment with embedded API (NestJS) and Web (Next.js) servers, managed by a robust Electron wrapper.

## Features

✅ **Embedded Servers**: Runs API and Web servers locally as child processes  
✅ **System Tray Integration**: Background operation with tray icon and context menu  
✅ **Server Lifecycle Management**: Auto-start, auto-restart on crash, port management  
✅ **Logs Viewer**: Real-time logs with filtering, search, and export capabilities  
✅ **Backup/Restore**: Manual and scheduled database backups with retention policy  
✅ **License Activation**: Device-bound license verification with expiry tracking  
✅ **One-click Installer**: Native installers for Windows (NSIS/Portable), macOS (DMG/ZIP), and Linux (AppImage/DEB)

## Project Structure

The project follows a modular architecture separating the Main (Electron/Node.js) and Renderer (UI) processes.

```
src/
├── main/                 # Electron Main Process (Node.js)
│   ├── index.ts          # Application entry point & lifecycle
│   ├── config.ts         # Configuration management
│   ├── tray.ts           # System tray integration
│   ├── windows.ts        # Window management factory
│   ├── paths.ts          # Centralized path resolution (Dev vs Prod)
│   │
│   ├── ipc/              # Inter-Process Communication Handlers
│   │   ├── server.ipc.ts  # Start/Stop/Restart commands
│   │   ├── config.ipc.ts  # Get/Set/Update config
│   │   ├── logs.ipc.ts    # Read/Filter/Export logs
│   │   ├── backup.ipc.ts  # Create/Restore/List backups
│   │   └── license.ipc.ts # Activate/Check license
│   │
│   ├── managers/         # Domain Logic & State Management
│   │   ├── server-manager.ts  # Process spawning & monitoring
│   │   ├── log-manager.ts     # Log aggregation & file rotation
│   │   ├── backup-manager.ts  # Database file operations
│   │   └── license-manager.ts # Key validation & crypto
│   │
│   └── i18n/             # Internationalization
│       └── translations.ts    # Tray menu translations
│
├── preload/              # Preload Scripts
│   └── index.ts          # Exposes safe API to Renderer via contextBridge
│
└── renderer/             # Electron Renderer Process (HTML/CSS/JS)
    ├── main.*            # Server status dashboard
    ├── logs.*            # Log viewer interface
    ├── settings.*        # Configuration UI
    ├── license.*         # License activation UI
    └── splash.html       # Loading screen
```

## Quick Start

### Development

```bash
# Install dependencies
pnpm install

# Build all apps
pnpm build

# Run in development mode
cd apps/desktop-server
pnpm dev
```

### Building Installers

See [BUILD.md](./BUILD.md) for detailed packaging instructions.

```bash
# Build for current platform
pnpm package

# Platform-specific builds
pnpm package:mac    # macOS
pnpm package:win    # Windows
pnpm package:linux  # Linux
```

## IPC API

The application exposes a structured IPC API to the renderer process via `window.electronAPI`:

- **Server**: `server.start()`, `server.stop()`, `server.restart()`, `server.getStatus()`
- **Config**: `config.get()`, `config.set(key, value)`, `config.update(obj)`
- **Logs**: `logs.getAll()`, `logs.filter(opts)`, `logs.export()`, `logs.openFile()`
- **Backup**: `backup.create()`, `backup.restore(file)`, `backup.list()`
- **License**: `license.activate(key)`, `license.getStatus()`
- **App**: `app.openBrowser(url)`, `app.openLogs()`, `app.openSettings()`

## Configuration

User data is stored in the OS-specific application directory:

- **macOS**: `~/Library/Application Support/desktop-server/`
- **Windows**: `%APPDATA%/desktop-server/`
- **Linux**: `~/.config/desktop-server/`

Key files:

- `config.json`: User preferences (ports, theme, language)
- `license.json`: Encrypted license data
- `logs/`: Log files (rotated daily)
- `backups/`: SQLite database backups

## License

This project is licensed under the MIT License.
