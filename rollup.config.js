import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

const dest = 'lib';

export default {
  input: ['src/index.ts'],
  output: {
    dir: dest,
    format: 'es',
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: 'src',
    exports: 'auto',
  },
  external: ['react-router'],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      noEmit: false,
      declaration: true,
      declarationDir: dest,
      rootDir: 'src',
      include: ['src/**/*'],
      filterRoot: '.',
      allowJs: false,
      noEmitOnError: true,
      importHelpers: true,
    }),
    terser(),
    copy({
      targets: [
        { src: 'package.json', dest: dest },
        { src: 'README.md', dest: dest },
        { src: 'LICENSE', dest: dest },
      ],
    }),
  ],
};
