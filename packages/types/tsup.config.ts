import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'entities/index': 'src/entities/index.ts',
    'api/index': 'src/api/index.ts',
    'enums/index': 'src/enums/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
});
