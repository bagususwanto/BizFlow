import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'components/button': 'src/components/button.tsx',
    'components/input': 'src/components/input.tsx',
    'components/card': 'src/components/card.tsx',
    'components/dialog': 'src/components/dialog.tsx',
    'components/table': 'src/components/table.tsx',
    'components/badge': 'src/components/badge.tsx',
    'lib/utils': 'src/lib/utils.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['react', 'react-dom'],
  banner: {
    js: '"use client";',
  },
});
