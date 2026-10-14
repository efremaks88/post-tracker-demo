/**
 * PPT Tracker production frontend build.
 * Compiles src/index.jsx into public/app.js so browsers do not run Babel standalone.
 */
const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const SRC = path.join(__dirname, 'src', 'index.jsx');
const DEST = path.join(__dirname, 'public', 'app.js');

if (!fs.existsSync(SRC)) {
  console.error('Missing src/index.jsx');
  process.exit(1);
}

const jsxCode = fs.readFileSync(SRC, 'utf8');
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
    filename: 'src/index.jsx',
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
console.log(`JSX source: ${Math.round(jsxCode.length / 1024)} KB -> JS: ${Math.round(result.code.length / 1024)} KB`);
