# BizFlow Contribution Guide

## Git Branch Strategy

```
main        ← Production-ready code
  └── develop    ← Integration branch
        ├── feature/xxx  ← New features
        ├── fix/xxx      ← Bug fixes
        └── chore/xxx    ← Maintenance
```

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

### Scopes

- `api`: Backend API
- `web`: Web frontend
- `desktop`: Electron app
- `ui`: UI components
- `database`: Database/Prisma
- `types`: TypeScript types

### Examples

```
feat(api): add user authentication endpoint
fix(pos): resolve barcode scanner issue
docs(readme): update installation guide
```

## Pull Request Process

1. Create branch from `develop`
2. Make changes and commit
3. Push and create PR to `develop`
4. Wait for CI checks to pass
5. Request review from team
6. Merge after approval

## Development Workflow

```bash
# Start development
pnpm dev

# Run tests
pnpm test:unit
pnpm test:e2e

# Check types
pnpm turbo run typecheck

# Lint code
pnpm lint

# Build all
pnpm build
```
