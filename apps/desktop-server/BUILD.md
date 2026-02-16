# BizFlow Desktop Server - Build & Distribution Guide

## Prerequisites

Before building the installer, ensure:

1. **All dependencies are built:**

   ```bash
   # From project root
   pnpm install
   pnpm build
   ```

2. **API and Web apps are built:**

   ```bash
   # Build API
   cd apps/api
   pnpm build

   # Build Web
   cd apps/web
   pnpm build
   ```

3. **Desktop server is compiled:**
   The desktop server is written in TypeScript and needs to be compiled before packaging.

   ```bash
   cd apps/desktop-server
   pnpm build
   ```

## Building Installers

### macOS

Build DMG and ZIP for both Intel and Apple Silicon:

```bash
cd apps/desktop-server
pnpm package:mac
```

**Output:**

- `release/BizFlow-Server-{version}-arm64.dmg`
- `release/BizFlow-Server-{version}-x64.dmg`
- `release/BizFlow-Server-{version}-arm64-mac.zip`
- `release/BizFlow-Server-{version}-x64-mac.zip`

**Requirements:**

- macOS 10.13+ for building
- Code signing certificate (optional, for distribution)

### Windows

Build NSIS installer and portable executable:

```bash
cd apps/desktop-server
pnpm package:win
```

**Output:**

- `release/BizFlow-Server-Setup-{version}-x64.exe`
- `release/BizFlow-Server-Setup-{version}-ia32.exe`
- `release/BizFlow-Server-{version}-x64-portable.exe`

**Requirements:**

- Windows 7+ or Wine (on macOS/Linux builds)
- Code signing certificate (optional, to avoid "Unknown Publisher" warnings)

### Linux

Build AppImage, DEB, and RPM packages:

```bash
cd apps/desktop-server
pnpm package:linux
```

**Output:**

- `release/desktop-server-{version}-x64.AppImage`
- `release/desktop-server-{version}-x64.deb`
- `release/desktop-server-{version}-x64.rpm`

**Requirements:**

- Linux environment (or Docker)
- `fuse` for running AppImages locally
- `dpkg` for building DEB
- `rpm` for building RPM

### All Platforms

Build for all platforms (requires appropriate OS or CI environment):

```bash
cd apps/desktop-server
pnpm package
```

### Clean Build

To remove previous build artifacts and start fresh:

```bash
cd apps/desktop-server
pnpm clean
```

## Distribution

### File Structure

The built application includes:

```
BizFlow Server.app/ (macOS example)
├── Contents/
│   ├── MacOS/
│   │   └── BizFlow Server (executable)
│   ├── Resources/
│   │   ├── app.asar (desktop server code)
│   │   ├── api/ (Embedded NestJS API)
│   │   ├── web/ (Embedded Next.js app)
│   │   └── database/ (Prisma schema & migrations)
│   └── Info.plist
```

### Installation

**macOS:**

1. Open DMG file
2. Drag "BizFlow Server" to Applications folder
3. Launch from Applications or Launchpad

**Windows:**

1. Run installer `.exe`
2. Follow installation wizard
3. Choose installation directory
4. Launch from Start Menu or Desktop shortcut

**Linux:**

- **AppImage:** Make executable and run: `chmod +x BizFlow*.AppImage && ./BizFlow*.AppImage`
- **DEB:** Install: `sudo dpkg -i bizflow-server_*.deb`
- **RPM:** Install: `sudo rpm -i bizflow-server-*.rpm`

## First Run Lifecycle

On first launch, the `server-manager` initiates the following sequence:

1. **Checks Paths**: Verifies existence of API and Web server binaries (dev vs prod paths).
2. **Finds Ports**: Scans for available ports starting at 3000 (API) and 3001 (Web).
3. **Database Check**: Ensures SQLite database exists or creates a new one.
4. **Server Startup**: Spawns API and Web processes as child processes.
5. **Health Checks**: Polls `/health` endpoints until servers are ready.
6. **Splash Screen**: Closes splash screen and opens main dashboard only when all services are green.

## Configuration

User data is stored in the OS-specific application directory:

- **macOS:** `~/Library/Application Support/desktop-server/`
- **Windows:** `%APPDATA%/desktop-server/`
- **Linux:** `~/.config/desktop-server/`

## Code Signing (Optional)

### macOS

1. Get Apple Developer certificate
2. Add to `package.json` build config:
   ```json
   "mac": {
     "identity": "Developer ID Application: Your Name (TEAM_ID)"
   }
   ```
3. Notarize the app (requires `electron-notarize` setup)

### Windows

1. Get code signing certificate (.pfx)
2. Set environment variables:
   ```bash
   export CSC_LINK=/path/to/certificate.pfx
   export CSC_KEY_PASSWORD=your_password
   ```

## Troubleshooting

### Build fails with "Cannot find module"

Ensure `pnpm build` has been run in `apps/api` and `apps/web`. The packager expects `dist/` and `.next/standalone` folders to exist.

### macOS: "App is damaged and can't be opened"

App is not code signed/notarized. Right-click → Open, or disable Gatekeeper:

```bash
sudo spctl --master-disable
```

### Windows: Antivirus blocks installation

Add exception for the installer or sign the executable with a trusted certificate.

### Linux: AppImage won't run

Install FUSE:

```bash
sudo apt install fuse  # Debian/Ubuntu
sudo yum install fuse  # RHEL/CentOS
```
