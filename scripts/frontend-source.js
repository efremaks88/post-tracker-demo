const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const manifestPath = path.join(root, 'src', 'source-files.json');
const SOURCE_FILES = Object.freeze(JSON.parse(fs.readFileSync(manifestPath, 'utf8')));

function readFrontendSource(projectRoot = root) {
  return SOURCE_FILES.map(function(relativePath) {
    const absolutePath = path.join(projectRoot, relativePath);
    if (!fs.existsSync(absolutePath)) throw new Error('Missing frontend source: ' + relativePath);
    return '\n/* SOURCE: ' + relativePath + ' */\n' + fs.readFileSync(absolutePath, 'utf8');
  }).join('\n');
}

module.exports = { SOURCE_FILES, readFrontendSource };
