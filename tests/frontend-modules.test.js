const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { SOURCE_FILES, readFrontendSource } = require('../scripts/frontend-source');

const root = path.join(__dirname, '..');

test('frontend manifest contains unique existing modules and keeps the entry point last', () => {
  assert.equal(new Set(SOURCE_FILES).size, SOURCE_FILES.length);
  assert.equal(SOURCE_FILES.at(-1), 'src/index.jsx');
  assert.ok(SOURCE_FILES.length >= 20);
  for (const relativePath of SOURCE_FILES) {
    assert.equal(fs.existsSync(path.join(root, relativePath)), true, relativePath);
  }
});

test('index.jsx is only the browser entry point', () => {
  const entry = fs.readFileSync(path.join(root, 'src', 'index.jsx'), 'utf8').trim();
  assert.equal(entry, 'ReactDOM.createRoot(document.getElementById("root")).render(<App/>);');
});

test('key screens and application concerns live in their own source modules', () => {
  const expected = new Map([
    ['src/features/post/projects.jsx', 'function ProjectsView('],
    ['src/features/post/calendar.jsx', 'function CalendarView('],
    ['src/features/post/gantt.jsx', 'function GanttView('],
    ['src/features/post/people.jsx', 'function PeopleView('],
    ['src/features/post/analytics.jsx', 'function AnalyticsView('],
    ['src/features/post/project-card.jsx', 'function ProjectCard('],
    ['src/features/post/series-card.jsx', 'function SeriesCard('],
    ['src/features/auth/index.jsx', 'async function doLogin('],
    ['src/features/mobile/index.jsx', 'function MobileWorkspace('],
    ['src/features/producer/index.jsx', 'function ProducerWorkspace('],
    ['src/app/App.jsx', 'function App('],
  ]);
  for (const [relativePath, signature] of expected) {
    const moduleSource = fs.readFileSync(path.join(root, relativePath), 'utf8');
    assert.ok(moduleSource.includes(signature), relativePath + ' should contain ' + signature);
  }
  const completeSource = readFrontendSource(root);
  for (const signature of expected.values()) {
    assert.equal(completeSource.split(signature).length - 1, 1, signature);
  }
});

test('producer dashboard exposes the personal hierarchy and direct warning navigation', () => {
  const source = fs.readFileSync(path.join(root, 'src', 'features', 'producer', 'index.jsx'), 'utf8');
  assert.ok(source.includes('Проекты в работе'));
  assert.ok(source.includes('Требует внимания'));
  assert.ok(source.includes('function ProducerCalendarPage('));
  assert.ok(source.includes('function ProducerHistoryPage('));
  assert.ok(source.includes('function ProducerTeamPage('));
  assert.ok(source.includes('Показать, чем занят'));
  assert.ok(source.includes('aria-expanded={expanded}'));
  assert.ok(source.includes('function ProducerPersonPage('));
  assert.ok(source.includes('function ProducerAnalyticsPage('));
  assert.ok(source.includes('function ProducerControlPage('));
  assert.ok(source.includes('Ближайшие сроки'));
  assert.ok(source.includes('function ProducerProjectControlCompact('));
  assert.ok(source.includes('Фильтр истории по автору'));
  assert.ok(source.includes('Внутренний комментарий'));
  assert.ok(source.includes('onDoubleClick={()=>go("project",project.id)}'));
  assert.ok(source.includes('producer-calendar-day'));
  assert.ok(source.includes('producer-calendar-hover-card'));
  assert.ok(source.includes('Открыть второй проект рядом'));
  assert.ok(source.includes('function ProducerCompareProject('));
  assert.ok(source.includes('target.scrollIntoView'));
  assert.ok(source.includes('ProducerAvatar'));
  assert.ok(source.includes('function ProducerCreateProjectModal('));
  assert.ok(source.includes('＋ Создать проект'));
  assert.ok(source.includes('producer-task-marker'));
  assert.equal(source.includes('<span className="producer-paper-check">✓</span>'), false);
  assert.equal(source.includes('Проектная полка'), false);
  assert.equal(source.includes('Проект целиком'), false);
});
