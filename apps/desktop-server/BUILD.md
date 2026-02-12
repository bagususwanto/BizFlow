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

3. **Desktop server is built:**
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

- `release/BizFlow Server-{version}-arm64.dmg` (Apple Silicon)
- `release/BizFlow Server-{version}-x64.dmg` (Intel)
- `release/BizFlow Server-{version}-arm64-mac.zip`
- `release/BizFlow Server-{version}-mac.zip`

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

- `release/BizFlow Server Setup {version}.exe` (Installer)
- `release/BizFlow Server {version}.exe` (Portable)

**Requirements:**

- Windows 7+ or Wine on macOS/Linux
- Code signing certificate (optional, for distribution)

### Linux

Build AppImage, DEB, and RPM packages:

```bash
cd apps/desktop-server
pnpm package:linux
```

**Output:**

- `release/BizFlow Server-{version}.AppImage`
- `release/bizflow-server_{version}_amd64.deb`
- `release/bizflow-server-{version}.x86_64.rpm`

**Requirements:**

- Linux with `fuse` for AppImage
- `dpkg` for DEB
- `rpm` for RPM

### All Platforms

Build for all platforms (requires appropriate OS or CI):

```bash
cd apps/desktop-server
pnpm package
```

## Distribution

### File Structure

The built application includes:

```
BizFlow Server.app/
├── Contents/
│   ├── MacOS/
│   │   └── BizFlow Server (executable)
│   ├── Resources/
│   │   ├── app.asar (main app)
│   │   ├── api/ (NestJS API)
│   │   ├── web/ (Next.js app)
│   │   └── database/ (Prisma schema)
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

## First Run

On first launch:

1. **Splash screen** shows server startup progress
2. **Servers start automatically** (API on port 3000, Web on port 3001)
3. **System tray icon** appears (running state)
4. **Main window** opens with server status

## Configuration

User data is stored in:

- **macOS:** `~/Library/Application Support/desktop-server/`
- **Windows:** `%APPDATA%/desktop-server/`
- **Linux:** `~/.config/desktop-server/`

Files:

- `config.json` - Application settings
- `license.json` - License information
- `logs/` - Application logs
- `backups/` - Database backups

## Code Signing (Optional)

### macOS

1. Get Apple Developer certificate
2. Add to build config:
   ```json
   "mac": {
     "identity": "Developer ID Application: Your Name (TEAM_ID)"
   }
   ```

### Windows

1. Get code signing certificate (.pfx)
2. Set environment variables:
   ```bash
   export CSC_LINK=/path/to/certificate.pfx
   export CSC_KEY_PASSWORD=your_password
   ```

## Troubleshooting

### Build fails with "Cannot find module"

Ensure all dependencies are built:

```bash
pnpm build
```

### macOS: "App is damaged and can't be opened"

App is not code signed. Right-click → Open, or disable Gatekeeper:

```bash
sudo spctl --master-disable
```

### Windows: Antivirus blocks installation

Add exception for the installer or sign the executable.

### Linux: AppImage won't run

Install FUSE:

```bash
sudo apt install fuse  # Debian/Ubuntu
sudo yum install fuse  # RHEL/CentOS
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build Installers

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm build

      - name: Build Installer
        run: |
          cd apps/desktop-server
          pnpm package

      - uses: actions/upload-artifact@v3
        with:
          name: installer-${{ matrix.os }}
          path: apps/desktop-server/release/*
```

## Version Management

Update version in `package.json`:

```json
{
  "version": "1.0.0"
}
```

Version is automatically included in installer filename and app metadata.

## Support

For issues or questions:

- GitHub Issues: [repository URL]
- Email: support@bizflow.com
- Documentation: [docs URL]
