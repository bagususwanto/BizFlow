/**
 * prepare-package.js
 *
 * Bundles all standalone resources for the desktop app:
 * 1. API: pnpm deploy + workspace dist + Prisma client/engine
 * 2. Web: Next.js standalone + static assets + public files
 *
 * Output: .tmp-package/
 *   ├── api/          (API dist + node_modules + prisma)
 *   └── web/          (Next.js standalone server + static + public)
 *
 * Usage: node scripts/prepare-package.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DESKTOP_DIR = path.resolve(__dirname, '..');
const ROOT_DIR = path.resolve(DESKTOP_DIR, '../..');
const TMP_DIR = path.join(DESKTOP_DIR, '.tmp-package');

function log(msg) {
  console.log(`[prepare-package] ${msg}`);
}

function cleanTmp() {
  if (fs.existsSync(TMP_DIR)) {
    log('Cleaning previous .tmp-package...');
    fs.rmSync(TMP_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

// ─── API ────────────────────────────────────────────

function prepareApi() {
  log('');
  log('=== Preparing API ===');

  const apiOut = path.join(TMP_DIR, 'api');
  fs.mkdirSync(apiOut, { recursive: true });

  // 1. Copy API compiled dist
  const apiDist = path.join(ROOT_DIR, 'apps/api/dist');
  if (!fs.existsSync(apiDist)) {
    throw new Error('API dist not found. Run "pnpm --filter api build" first.');
  }
  log('Copying API dist...');
  copyDirSync(apiDist, apiOut);

  // 2. Deploy node_modules via pnpm deploy
  const deployDir = path.join(TMP_DIR, '_api-deploy');
  log('Deploying API dependencies (pnpm deploy)...');
  execSync(`pnpm --filter=api deploy --prod "${deployDir}"`, {
    cwd: ROOT_DIR,
    stdio: 'inherit',
  });

  // Flatten pnpm node_modules into npm-style flat structure.
  // pnpm uses a .pnpm virtual store with internal symlinks for transitive
  // dependency resolution. This structure breaks when packaged for distribution
  // (symlinks become broken files on Windows). Instead, we walk every package
  // inside .pnpm/*/node_modules/ and hoist them to a flat top-level node_modules.
  const deployedModules = path.join(deployDir, 'node_modules');
  const apiModules = path.join(apiOut, 'node_modules');
  log('Flattening pnpm node_modules to npm-style flat structure...');
  flattenPnpmModules(deployedModules, apiModules);

  // 3. Copy workspace package dist (@bizflow/database)
  log('Copying workspace package builds...');
  const dbDistSrc = path.join(ROOT_DIR, 'packages/database/dist');
  const dbDistDest = path.join(apiModules, '@bizflow/database/dist');
  if (fs.existsSync(dbDistSrc)) {
    copyDirSync(dbDistSrc, dbDistDest);
    log(`  @bizflow/database/dist: ${fs.readdirSync(dbDistDest).length} files`);
  } else {
    log('  WARNING: @bizflow/database/dist not found!');
  }

  // 4. Copy Prisma generated client + engine from monorepo
  log('Copying Prisma client + engine...');
  const monoPnpmDir = path.join(ROOT_DIR, 'node_modules', '.pnpm');
  const pnpmEntries = fs.readdirSync(monoPnpmDir);
  for (const entry of pnpmEntries) {
    if (entry.startsWith('@prisma+client@')) {
      const src = path.join(
        monoPnpmDir,
        entry,
        'node_modules',
        '.prisma',
        'client',
      );
      if (fs.existsSync(src)) {
        const dest = path.join(apiModules, '.prisma', 'client');
        fs.mkdirSync(dest, { recursive: true });
        copyDirSync(src, dest);
        const engineFiles = fs
          .readdirSync(dest)
          .filter((f) => f.endsWith('.node'));
        log(`  .prisma/client: ${engineFiles.length} engine binaries`);
        engineFiles.forEach((f) => log(`    ${f}`));
      }

      // Also hoist @prisma/client if not present
      const prismaClientDest = path.join(apiModules, '@prisma', 'client');
      if (!fs.existsSync(prismaClientDest)) {
        const prismaClientSrc = path.join(
          monoPnpmDir,
          entry,
          'node_modules',
          '@prisma',
          'client',
        );
        if (fs.existsSync(prismaClientSrc)) {
          log('  Hoisting @prisma/client...');
          fs.mkdirSync(prismaClientDest, { recursive: true });
          copyDirSync(prismaClientSrc, prismaClientDest);
        }
      }
      break;
    }
  }

  // 5. Copy Prisma schema
  const prismaSrc = path.join(ROOT_DIR, 'packages/database/prisma');
  const prismaDest = path.join(apiOut, 'prisma');
  if (fs.existsSync(prismaSrc)) {
    log('Copying Prisma schema...');
    copyDirSync(prismaSrc, prismaDest);
  }

  // Cleanup temp deploy dir
  fs.rmSync(deployDir, { recursive: true, force: true });

  const size = execSync(`du -sh "${apiOut}"`, { encoding: 'utf-8' }).trim();
  log(`API bundle: ${size}`);
}

// ─── WEB ────────────────────────────────────────────

function prepareWeb() {
  log('');
  log('=== Preparing Web ===');

  const webOut = path.join(TMP_DIR, 'web');
  fs.mkdirSync(webOut, { recursive: true });

  // Next.js standalone preserves monorepo structure:
  //   .next/standalone/apps/web/server.js
  //   .next/standalone/node_modules/...
  const standaloneBase = path.join(ROOT_DIR, 'apps/web/.next/standalone');
  if (!fs.existsSync(standaloneBase)) {
    throw new Error(
      'Web standalone not found. Run "pnpm --filter web build" first.',
    );
  }

  // 1. Copy entire standalone output (includes server.js + node_modules)
  //    Use manual dereference to properly resolve pnpm symlinks
  log('Copying Next.js standalone (dereferencing symlinks)...');
  copyDirDereferenceSync(standaloneBase, webOut);

  // 1b. Flatten any pnpm .pnpm dirs in web's node_modules
  //     Next.js standalone may include pnpm-style node_modules with .pnpm stores.
  //     We need to flatten them so transitive deps (e.g. styled-jsx) are resolvable.
  const webNodeModulesDirs = [
    path.join(webOut, 'node_modules'),
    path.join(webOut, 'apps', 'web', 'node_modules'),
  ];
  for (const nmDir of webNodeModulesDirs) {
    const pnpmDir = path.join(nmDir, '.pnpm');
    if (fs.existsSync(pnpmDir)) {
      log(`Flattening pnpm modules in ${path.relative(webOut, nmDir)}...`);
      flattenPnpmModules(nmDir, nmDir);
    }
  }

  // 2. Copy static assets (.next/static)
  const staticSrc = path.join(ROOT_DIR, 'apps/web/.next/static');
  // Static goes into the web app's .next/static within standalone
  const staticDest = path.join(webOut, 'apps/web/.next/static');
  if (fs.existsSync(staticSrc)) {
    log('Copying static assets...');
    copyDirSync(staticSrc, staticDest);
  }

  // 3. Copy public files
  const publicSrc = path.join(ROOT_DIR, 'apps/web/public');
  const publicDest = path.join(webOut, 'apps/web/public');
  if (fs.existsSync(publicSrc)) {
    log('Copying public files...');
    copyDirSync(publicSrc, publicDest);
  }

  const size = execSync(`du -sh "${webOut}"`, { encoding: 'utf-8' }).trim();
  log(`Web bundle: ${size}`);
}

// ─── Utils ──────────────────────────────────────────

/**
 * Flatten pnpm's .pnpm virtual store into a standard npm-style flat node_modules.
 *
 * pnpm places real package contents in:
 *   node_modules/.pnpm/<pkg-name>@<version>/node_modules/<pkg-name>/
 *
 * We walk each entry in .pnpm/ and copy all packages from their
 * node_modules/ subdirectory into the top-level dest.
 * This ensures transitive dependencies are properly resolvable
 * without pnpm's symlink magic.
 */
function flattenPnpmModules(pnpmNodeModules, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const pnpmDir = path.join(pnpmNodeModules, '.pnpm');
  if (!fs.existsSync(pnpmDir)) {
    log('  WARNING: No .pnpm directory found, falling back to direct copy');
    copyDirDereferenceSync(pnpmNodeModules, dest);
    return;
  }

  // Walk each versioned package entry in .pnpm/
  const pnpmEntries = fs.readdirSync(pnpmDir);
  let hoistedCount = 0;

  for (const entry of pnpmEntries) {
    // Skip non-directories and special entries
    if (entry === 'node_modules' || entry === 'lock.yaml') continue;

    const entryNodeModules = path.join(pnpmDir, entry, 'node_modules');
    if (!fs.existsSync(entryNodeModules)) continue;

    const stat = fs.lstatSync(path.join(pnpmDir, entry));
    if (!stat.isDirectory()) continue;

    // Walk packages inside this entry's node_modules/
    const packages = fs.readdirSync(entryNodeModules, { withFileTypes: true });
    for (const pkg of packages) {
      // Skip special dirs
      if (pkg.name === '.pnpm' || pkg.name === '.bin') continue;

      const pkgSrcPath = path.join(entryNodeModules, pkg.name);

      // Handle scoped packages (e.g., @nestjs)
      if (pkg.name.startsWith('@')) {
        // It's a scope directory, walk into it
        let realScopePath;
        try {
          realScopePath = fs.realpathSync(pkgSrcPath);
        } catch {
          continue;
        }

        if (!fs.statSync(realScopePath).isDirectory()) continue;

        const scopedPkgs = fs.readdirSync(realScopePath, {
          withFileTypes: true,
        });
        for (const scopedPkg of scopedPkgs) {
          const scopedSrcPath = path.join(realScopePath, scopedPkg.name);
          const scopedDestPath = path.join(dest, pkg.name, scopedPkg.name);

          // Skip if already hoisted (first version wins)
          if (fs.existsSync(scopedDestPath)) continue;

          let realPath;
          try {
            realPath = fs.realpathSync(scopedSrcPath);
          } catch {
            continue;
          }

          const scopedStat = fs.statSync(realPath);
          if (scopedStat.isDirectory()) {
            copyDirDereferenceSync(realPath, scopedDestPath);
            hoistedCount++;
          } else if (scopedStat.isFile()) {
            fs.mkdirSync(path.dirname(scopedDestPath), { recursive: true });
            fs.copyFileSync(realPath, scopedDestPath);
          }
        }
      } else {
        // Non-scoped package
        const destPath = path.join(dest, pkg.name);

        // Skip if already hoisted (first version wins)
        if (fs.existsSync(destPath)) continue;

        let realPath;
        try {
          realPath = fs.realpathSync(pkgSrcPath);
        } catch {
          continue;
        }

        const pkgStat = fs.statSync(realPath);
        if (pkgStat.isDirectory()) {
          copyDirDereferenceSync(realPath, destPath);
          hoistedCount++;
        } else if (pkgStat.isFile()) {
          fs.copyFileSync(realPath, destPath);
        }
      }
    }
  }

  // Also copy any non-symlink top-level entries (like .bin, .prisma)
  const topEntries = fs.readdirSync(pnpmNodeModules, { withFileTypes: true });
  for (const entry of topEntries) {
    if (entry.name === '.pnpm') continue;

    const srcPath = path.join(pnpmNodeModules, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip if already hoisted
    if (fs.existsSync(destPath)) continue;

    let realPath;
    try {
      realPath = fs.realpathSync(srcPath);
    } catch {
      continue; // broken symlink
    }

    const stat = fs.statSync(realPath);
    if (stat.isDirectory()) {
      copyDirDereferenceSync(realPath, destPath);
      hoistedCount++;
    } else if (stat.isFile()) {
      fs.copyFileSync(realPath, destPath);
    }
  }

  log(`  Hoisted ${hoistedCount} packages to flat node_modules`);
}

/**
 * Recursively copy a directory, resolving ALL symlinks to their real targets.
 * Unlike fs.cpSync with dereference:true, this properly handles pnpm's
 * symlinks-to-directories by resolving them before recursing.
 */
function copyDirDereferenceSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip unwanted files/dirs
    if (entry.name === '__pycache__') continue;
    if (entry.name.endsWith('.db') || entry.name.endsWith('.db-journal'))
      continue;
    if (entry.name === 'node_modules' && src.includes('prisma')) continue;

    // Resolve the real path (follows symlinks)
    let realPath;
    try {
      realPath = fs.realpathSync(srcPath);
    } catch {
      // Broken symlink — skip
      log(`  WARNING: Skipping broken symlink: ${srcPath}`);
      continue;
    }

    const stat = fs.statSync(realPath);
    if (stat.isDirectory()) {
      copyDirDereferenceSync(realPath, destPath);
    } else if (stat.isFile()) {
      fs.copyFileSync(realPath, destPath);
    }
  }
}

function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' && src.includes('prisma')) continue;
      if (entry.name === '__pycache__') continue;
      copyDirSync(srcPath, destPath);
    } else {
      if (entry.name.endsWith('.db') || entry.name.endsWith('.db-journal'))
        continue;
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ─── Main ───────────────────────────────────────────

function main() {
  log('Starting package preparation...');
  log(`Root: ${ROOT_DIR}`);
  log(`Output: ${TMP_DIR}`);

  cleanTmp();
  prepareApi();
  prepareWeb();

  log('');
  log('=== All resources bundled! ===');
  log('Output structure:');
  log('  .tmp-package/api/    - API server + node_modules');
  log('  .tmp-package/web/    - Next.js standalone server');
}

main();
