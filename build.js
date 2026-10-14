/**
 * PPT Tracker production frontend build.
 * Compiles the ordered frontend source manifest into public/app.js.
 */
const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const { SOURCE_FILES, readFrontendSource } = require('./scripts/frontend-source');

const DEST = path.join(__dirname, 'public', 'app.js');

const jsxCode = readFrontendSource(__dirname);
let result;
try {
  result = babel.transformSync(jsxCode, {
    presets: [
      ['@babel/preset-react', { runtime: 'classic' }],
      ['@babel/preset-env', {
        targets: { chrome: '80', firefox: '78', safari: '14' },
        modules: false,
        useBuiltIns: false,
      }],
    ],
    filename: 'src/frontend-bundle.jsx',
    compact: false,
    comments: false,
  });
} catch (e) {
  console.error('\nFrontend build failed:');
  console.error(e && e.stack ? e.stack : e);
  process.exit(1);
}

fs.writeFileSync(DEST, result.code + '\n', 'utf8');
console.log('Built public/app.js');
console.log(`Sources: ${SOURCE_FILES.length}; JSX: ${Math.round(jsxCode.length / 1024)} KB -> JS: ${Math.round(result.code.length / 1024)} KB`);
