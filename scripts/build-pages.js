const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const FIXTURE_DIR = path.join(ROOT, 'pages-fixtures');
const OUTPUT_DIR = path.join(ROOT, 'dist-pages');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

function readJsonDirectory(directory) {
  const result = {};
  if (!fs.existsSync(directory)) return result;
  for (const entry of fs.readdirSync(directory, {withFileTypes:true})) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
    result[path.basename(entry.name, '.json')] = readJson(path.join(directory, entry.name));
  }
  return result;
}

function buildSeed() {
  return {
    runtime: readJson(path.join(FIXTURE_DIR, 'runtime.json')),
    me: readJson(path.join(FIXTURE_DIR, 'me.json')),
    data: readJson(path.join(FIXTURE_DIR, 'data.json')),
    dashboard: readJson(path.join(FIXTURE_DIR, 'dashboard.json')),
    myWork: readJson(path.join(FIXTURE_DIR, 'my_work.json')),
    control: readJson(path.join(FIXTURE_DIR, 'control.json')),
    team: readJson(path.join(FIXTURE_DIR, 'team.json')),
    analytics: readJson(path.join(FIXTURE_DIR, 'analytics.json')),
    history: readJson(path.join(FIXTURE_DIR, 'history.json')),
    projects: readJsonDirectory(path.join(FIXTURE_DIR, 'projects')),
    blocks: readJsonDirectory(path.join(FIXTURE_DIR, 'blocks')),
    tasks: readJsonDirectory(path.join(FIXTURE_DIR, 'tasks')),
    people: readJsonDirectory(path.join(FIXTURE_DIR, 'people')),
  };
}

function makeIndex() {
  let html = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'), 'utf8');
  html = html
    .replaceAll('href="/app.css"', 'href="./app.css"')
    .replaceAll('src="/vendor/', 'src="./vendor/')
    .replaceAll(
      '<script src="/runtime-config.js"></script>',
      '<script src="./runtime-config.js"></script>\n<script src="./pages-data.js"></script>\n<script src="./pages-demo.js"></script>',
    )
    .replaceAll('src="/app.js"', 'src="./app.js"');
  return html;
}

fs.rmSync(OUTPUT_DIR, {recursive:true, force:true});
fs.cpSync(PUBLIC_DIR, OUTPUT_DIR, {recursive:true});

const appPath = path.join(OUTPUT_DIR, 'app.js');
const app = fs.readFileSync(appPath, 'utf8').replaceAll('url("/demo/', 'url("./demo/');
fs.writeFileSync(appPath, app, 'utf8');
fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), makeIndex(), 'utf8');
fs.writeFileSync(path.join(OUTPUT_DIR, '404.html'), makeIndex(), 'utf8');
fs.writeFileSync(path.join(OUTPUT_DIR, '.nojekyll'), '', 'utf8');
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'runtime-config.js'),
  'window.__TRACKER_RUNTIME__={mode:"github-pages-demo",label:"ДЕМО · GitHub Pages"};\n' +
    'if(!window.location.hash)window.location.hash="producer";\n',
  'utf8',
);
fs.writeFileSync(
  path.join(OUTPUT_DIR, 'pages-data.js'),
  'window.__POST_TRACKER_PAGES_SEED__=' + JSON.stringify(buildSeed()) + ';\n',
  'utf8',
);
fs.copyFileSync(path.join(__dirname, 'pages-demo.js'), path.join(OUTPUT_DIR, 'pages-demo.js'));

console.log(`Built GitHub Pages demo in ${path.relative(ROOT, OUTPUT_DIR)}`);
