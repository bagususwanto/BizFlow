# Deployment Specifications

## Option A: Desktop App (Electron)

```yaml
# apps/desktop/electron-builder.yml
appId: id.bizflow.app
productName: BizFlow
copyright: Copyright © 2024 BizFlow

directories:
  output: dist
  buildResources: resources

files:
  - dist/**/*
  - resources/**/*
  - node_modules/**/*
  - "!node_modules/**/test/**"

win:
  target:
    - target: nsis
      arch: [x64]
  icon: resources/icon.ico

nsis:
  oneClick: false
  perMachine: true
  allowToChangeInstallationDirectory: true
  installerIcon: resources/icon.ico
  license: resources/license.txt

mac:
  target:
    - target: dmg
      arch: [x64, arm64]
  icon: resources/icon.icns
  category: public.app-category.business

linux:
  target:
    - target: AppImage
      arch: [x64]
  icon: resources/icon.png
  category: Office

extraResources:
  - from: ./server
    to: bin/server
  - from: ./public
    to: public
```

---

## Option B: Docker Compose (Cloud)

```yaml
# docker-compose.yml
version: "3.8"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://bizflow:${DB_PASSWORD}@db:5432/bizflow
      - REDIS_URL=redis://redis:6379
      - JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
    depends_on:
      - db
      - redis
    restart: always

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=bizflow
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=bizflow
    restart: always

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - app
    restart: always

volumes:
  postgres_data:
  redis_data:
```

---

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL=file:./data/bizflow.db  # SQLite (Option A)
# DATABASE_URL=postgresql://user:pass@host:5432/bizflow  # PostgreSQL (Option B)

# JWT
JWT_ACCESS_SECRET=your-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# Redis (Option B only)
REDIS_URL=redis://localhost:6379

# License
LICENSE_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n..."

# App
APP_PORT=3000
APP_ENV=production
APP_URL=http://localhost:3000

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/bizflow.log

# Backup
BACKUP_DIR=./backups
BACKUP_RETENTION_DAYS=7
```
