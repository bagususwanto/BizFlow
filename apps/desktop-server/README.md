# BizFlow Desktop Server

Electron wrapper untuk deployment on-premise BizFlow ERP. Aplikasi ini menjalankan API (NestJS) dan Web (Next.js) sebagai embedded server, lalu menyediakan UI kontrol untuk management.

## Features

- ✅ Electron wrapper dengan embedded server
- ✅ Automatic port discovery
- ✅ Health check untuk API & Web server
- ✅ Splash screen dengan progress indicator
- ✅ Main control panel dengan status monitoring
- ✅ Minimize to system tray (Phase 2)
- ⏳ Logs viewer (Phase 4)
- ⏳ Backup/Restore (Phase 5)
- ⏳ License activation (Phase 6)
- ⏳ One-click installer (Phase 7)

## Development

```bash
# Install dependencies
pnpm install

# Build TypeScript
pnpm build

# Run in development mode
pnpm dev
```

## Build for Production

```bash
# Build all apps first
cd ../..
pnpm --filter api build
pnpm --filter web build
pnpm --filter desktop-server build

# Package for current platform
cd apps/desktop-server
pnpm package

# Or specific platform
pnpm package:win   # Windows
pnpm package:mac   # macOS
pnpm package:linux # Linux
```

## Architecture

```
desktop-server/
├── src/
│   ├── main/
│   │   ├── index.ts           # Main Electron entry point
│   │   ├── server-manager.ts  # Server lifecycle management
│   │   └── windows.ts         # Window management
│   ├── preload/
│   │   └── index.ts           # IPC bridge
│   └── renderer/
│       ├── splash.html        # Splash screen
│       ├── main.html          # Main control panel
│       ├── main.css           # Styles (using global.css tokens)
│       └── main.js            # UI logic
├── package.json
├── tsconfig.json
└── electron-builder.yml
```

## How It Works

1. User double-click `BizFlow.exe`
2. Electron starts → show splash screen
3. Spawn NestJS API server (port 3000)
4. Spawn Next.js Web server (port 3001)
5. Health check loop until both servers ready
6. Show main control panel
7. User can:
   - Open web app in browser
   - View server status
   - Stop/restart servers
   - Minimize to tray

## Environment Variables

Server manager automatically sets:

- `PORT` - API server port (default: 3000)
- `DATABASE_URL` - SQLite database path
- `JWT_ACCESS_SECRET` - JWT access token secret
- `JWT_REFRESH_SECRET` - JWT refresh token secret
- `CORS_ORIGIN` - Web app URL
- `NEXT_PUBLIC_API_URL` - API URL for Next.js

## Notes

- In development: loads API/Web from monorepo `dist` folders
- In production: loads from bundled resources in `app.asar`
- Database location:
  - Dev: `packages/database/prisma/dev.db`
  - Prod: `userData/data/bizflow.db`
