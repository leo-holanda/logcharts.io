import * as esbuild from 'esbuild';
import { copy } from 'esbuild-plugin-copy';

let ctx = await esbuild.context({
  entryPoints: [
    'src/scripts/index.js',
    'src/stylesheets/main.css',
    'src/stylesheets/guide.css',
    'assets/example.csv',
    'assets/images/initial_screen.png',
    'assets/images/sensor_status.png',
  ],
  bundle: true,
  minify: true,
  outdir: 'dist',
  loader: {
    '.woff': 'dataurl',
    '.woff2': 'dataurl',
    '.csv': 'copy',
    '.png': 'copy',
  },
  plugins: [
    copy({
      assets: {
        from: ['index.html'],
        to: ['index.html'],
      },
    }),
    copy({
      assets: {
        from: ['guide.html'],
        to: ['guide.html'],
      },
    }),
    copy({
      assets: {
        from: ['src/scripts/vendors/d3.min.js'],
        to: ['src/scripts/vendors/d3.min.js'],
      },
    }),
    copy({
      assets: {
        from: ['src/scripts/vendors/papaparse.min.js'],
        to: ['src/scripts/vendors/papaparse.min.js'],
      },
    }),
  ],
});

await ctx.watch();
