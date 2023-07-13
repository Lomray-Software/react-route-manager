import typescript from 'rollup-plugin-ts';
import ttypescript from 'ttypescript';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

export default {
  input: [
    'src/index.ts',
  ],
  output: {
    dir: 'lib',
    format: 'cjs',
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: 'src',
    exports: 'auto',
  },
  external: ['react-router'],
  plugins: [
    typescript({
      typescript: ttypescript,
      tsconfig: resolvedConfig => ({
        ...resolvedConfig,
        declaration: true,
      }),
    }),
    terser(),
    copy({
      targets: [
        { src: 'package.json', dest: 'lib' },
      ]
    })
  ],
};
