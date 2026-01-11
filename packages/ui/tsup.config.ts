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
    'components/accordion': 'src/components/accordion.tsx',
    'components/checkbox': 'src/components/checkbox.tsx',
    'components/label': 'src/components/label.tsx',
    'components/form': 'src/components/form.tsx',
    'components/dropdown-menu': 'src/components/dropdown-menu.tsx',
    'components/alert-dialog': 'src/components/alert-dialog.tsx',
    'components/sheet': 'src/components/sheet.tsx',
    'components/avatar': 'src/components/avatar.tsx',

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
