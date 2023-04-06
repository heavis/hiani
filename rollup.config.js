import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/hiani.min.js',
      format: 'iife',
      name: 'MyLibrary',
      sourcemap: true,
    },
    {
      file: 'dist/hiani.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    {
      file: 'dist/hiani.cjs.js',
      format: 'cjs',
      sourcemap: true,
    },
  ],
  plugins: [
    typescript({
      tsconfig: 'tsconfig.json',
    }),
    nodeResolve(),
    commonjs(),
    production && terser() // minify, but only in production
  ]
};