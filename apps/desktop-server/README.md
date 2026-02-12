# BizFlow Server - Desktop Application

Desktop server application for BizFlow POS system. Provides a one-click installer for on-premise deployment with embedded API and Web servers.

## Features

✅ **Embedded Servers**: Runs API (NestJS) and Web (Next.js) servers locally  
✅ **System Tray Integration**: Background operation with tray icon  
✅ **Server Lifecycle Management**: Auto-start, auto-restart on crash, port management  
✅ **Logs Viewer**: Real-time logs with filtering, search, and export  
✅ **Backup/Restore**: Manual and scheduled database backups with retention policy  
✅ **License Activation**: Device-bound license with expiry tracking  
✅ **One-click Installer**: Native installers for Windows, macOS, and Linux

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

```bash
# Build for current platform
cd apps/desktop-server
pnpm package

# Platform-specific
pnpm package:mac    # macOS DMG + ZIP
pnpm package:win    # Windows NSIS + Portable
pnpm package:linux  # Linux AppImage + DEB + RPM
```

See [BUILD.md](./BUILD.md) for detailed build instructions.

## Architecture

```
BizFlow Server
├── Main Process (Electron)
│   ├── Server Manager (API + Web)
│   ├── Config Manager
│   ├── Log Manager
│   ├── Backup Manager
│   └── License Manager
├── Renderer Process
│   ├── Splash Screen
│   ├── Main Window
│   ├── Logs Viewer
│   └── License Activation
└── System Tray
    ├── Server Status
    ├── Quick Actions
    └── Context Menu
```

## User Data

Configuration and data are stored in:

- **macOS**: `~/Library/Application Support/desktop-server/`
- **Windows**: `%APPDATA%/desktop-server/`
- **Linux**: `~/.config/desktop-server/`

Files:

- `config.json` - Application settings
- `license.json` - License information
- `logs/` - Application logs (daily rotation)
- `backups/` - Database backups (auto-cleanup)

## Configuration

Edit `config.json` to customize:

```json
{
  "apiPort": 3000,
  "webPort": 3001,
  "autoStart": true,
  "autoBackup": true,
  "backupInterval": 24,
  "backupRetention": 7,
  "backupDir": "/path/to/backups"
}
```

## License

This project is licensed under the MIT License.

## Support

For issues or questions:

- GitHub Issues: [repository URL]
- Email: support@bizflow.com
- Documentation: [docs URL]
