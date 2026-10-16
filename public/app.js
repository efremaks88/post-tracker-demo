function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
const _React = React,
  useState = _React.useState,
  useEffect = _React.useEffect,
  useMemo = _React.useMemo,
  useCallback = _React.useCallback,
  useRef = _React.useRef,
  useContext = _React.useContext;
const StagesCtx = React.createContext({
  stageMap: {},
  sorted: [],
  stageGroups: [],
  groupMap: {}
});
const HolidaysCtx = React.createContext([]);
const DEFAULT_STAGES = [{
  id: "съемки",
  label: "Съемки",
  color: "#f97316",
  order: 1,
  groupId: "sg1",
  rolesRequired: [],
  needsExecutor: false
}, {
  id: "приход_мат",
  label: "Приход материала",
  color: "#ec4899",
  order: 2,
  groupId: "sg2",
  rolesRequired: ["инжест"],
  needsExecutor: true
}, {
  id: "синхра",
  label: "Синхра",
  color: "#ec4899",
  order: 3,
  groupId: "sg2",
  rolesRequired: ["инжест", "монтаж"],
  needsExecutor: true
}, {
  id: "редактура",
  label: "Редактура",
  color: "#a78bfa",
  order: 4,
  groupId: "sg3",
  rolesRequired: ["монтаж"],
  needsExecutor: true
}, {
  id: "рыба",
  label: "Получение рыбы",
  color: "#a78bfa",
  order: 5,
  groupId: "sg3",
  rolesRequired: ["выпуск"],
  needsExecutor: true
}, {
  id: "монтаж",
  label: "Монтаж",
  color: "#6366f1",
  order: 6,
  groupId: "sg4",
  rolesRequired: ["монтаж"],
  needsExecutor: true
}, {
  id: "отсмотр_вып",
  label: "Отсмотр выпускающего",
  color: "#6366f1",
  order: 7,
  groupId: "sg4",
  rolesRequired: ["выпуск"],
  needsExecutor: true
}, {
  id: "внутр_отсмотр",
  label: "Внутренний отсмотр",
  color: "#3b82f6",
  order: 8,
  groupId: "sg5",
  rolesRequired: ["выпуск", "продюсер"],
  needsExecutor: true
}, {
  id: "просмотр_заказ",
  label: "Просмотр заказчиков",
  color: "#3b82f6",
  order: 9,
  groupId: "sg5",
  rolesRequired: ["продюсер"],
  needsExecutor: true
}, {
  id: "отсмотр_канал",
  label: "Отсмотр на канале",
  color: "#8b5cf6",
  order: 10,
  groupId: "sg6",
  rolesRequired: ["выпуск"],
  needsExecutor: true
}, {
  id: "правки_предотк",
  label: "Правки предОТК",
  color: "#0ea5e9",
  order: 11,
  groupId: "sg7",
  rolesRequired: ["монтаж", "цвет", "звук"],
  needsExecutor: true
}, {
  id: "высчет",
  label: "Высчет на цвет/звук",
  color: "#0ea5e9",
  order: 12,
  groupId: "sg7",
  rolesRequired: ["цвет", "звук"],
  needsExecutor: true
}, {
  id: "цветокор",
  label: "Цветокор",
  color: "#f59e0b",
  order: 13,
  groupId: "sg7",
  rolesRequired: ["цвет"],
  needsExecutor: true
}, {
  id: "сведение_звука",
  label: "Сведение звука",
  color: "#14b8a6",
  order: 14,
  groupId: "sg7",
  rolesRequired: ["звук"],
  needsExecutor: true
}, {
  id: "отсмотр_маст",
  label: "Отсмотр мастеринга",
  color: "#0ea5e9",
  order: 15,
  groupId: "sg7",
  rolesRequired: ["выпуск"],
  needsExecutor: true
}, {
  id: "правки_маст",
  label: "Правки на цвет/звук",
  color: "#0ea5e9",
  order: 16,
  groupId: "sg7",
  rolesRequired: ["цвет", "звук"],
  needsExecutor: true
}, {
  id: "отсмотр_маст_прод",
  label: "Отсмотр мастеринга прод.",
  color: "#0ea5e9",
  order: 17,
  groupId: "sg7",
  rolesRequired: ["продюсер"],
  needsExecutor: true
}, {
  id: "выгон_отк",
  label: "Выгон на ОТК",
  color: "#22c55e",
  order: 18,
  groupId: "sg8",
  rolesRequired: ["выпуск"],
  needsExecutor: true
}, {
  id: "правки_отк",
  label: "Правки ОТК",
  color: "#22c55e",
  order: 19,
  groupId: "sg8",
  rolesRequired: ["монтаж", "цвет", "звук"],
  needsExecutor: true
}, {
  id: "выгон_заплаток",
  label: "Выгон заплаток",
  color: "#22c55e",
  order: 20,
  groupId: "sg8",
  rolesRequired: ["выпуск"],
  needsExecutor: true
}, {
  id: "сдача_отк",
  label: "Сдача ОТК",
  color: "#22c55e",
  order: 21,
  groupId: "sg8",
  rolesRequired: ["выпуск", "продюсер"],
  needsExecutor: true
}, {
  id: "безрек",
  label: "БезРЕК",
  color: "#f59e0b",
  order: 22,
  groupId: "sg9",
  rolesRequired: ["монтаж"],
  needsExecutor: true
}, {
  id: "выгон_развед",
  label: "Выгон разведенки",
  color: "#64748b",
  order: 23,
  groupId: "sg10",
  rolesRequired: ["инжест"],
  needsExecutor: true
}, {
  id: "подготовка_архива",
  label: "Подготовка архива",
  color: "#64748b",
  order: 24,
  groupId: "sg10",
  rolesRequired: ["инжест"],
  needsExecutor: true
}, {
  id: "графика",
  label: "Графика",
  color: "#06b6d4",
  order: 25,
  groupId: "",
  rolesRequired: [],
  needsExecutor: true
}, {
  id: "промо",
  label: "Промо",
  color: "#f43f5e",
  order: 26,
  groupId: "",
  rolesRequired: [],
  needsExecutor: false
}, {
  id: "блюр",
  label: "Блюр",
  color: "#94a3b8",
  order: 27,
  groupId: "",
  rolesRequired: [],
  needsExecutor: false
}, {
  id: "титры",
  label: "Титры",
  color: "#94a3b8",
  order: 28,
  groupId: "",
  rolesRequired: [],
  needsExecutor: false
}, {
  id: "правки",
  label: "Правки",
  color: "#f97316",
  order: 29,
  groupId: "",
  rolesRequired: [],
  needsExecutor: false
}, {
  id: "заплатки_цвет",
  label: "Заплатки цвет",
  color: "#f59e0b",
  order: 30,
  groupId: "",
  rolesRequired: ["цвет"],
  needsExecutor: true
}, {
  id: "заплатки_звук",
  label: "Заплатки звук",
  color: "#14b8a6",
  order: 31,
  groupId: "",
  rolesRequired: ["звук"],
  needsExecutor: true
}];
const DEFAULT_HOLIDAYS = ["01.01.2025", "02.01.2025", "03.01.2025", "06.01.2025", "07.01.2025", "08.01.2025", "23.02.2025", "24.02.2025", "08.03.2025", "09.03.2025", "01.05.2025", "02.05.2025", "08.05.2025", "09.05.2025", "12.06.2025", "13.06.2025", "03.11.2025", "04.11.2025", "31.12.2025", "01.01.2026", "02.01.2026", "08.01.2026", "09.01.2026", "23.02.2026", "09.03.2026", "01.05.2026", "11.05.2026", "09.06.2026", "03.11.2026", "04.11.2026"];
const PALETTE = ["#3b82f6", "#2563eb", "#0ea5e9", "#06b6d4", "#14b8a6", "#22c55e", "#84cc16", "#eab308", "#f59e0b", "#f97316", "#ef4444", "#f43f5e", "#ec4899", "#a855f7", "#8b5cf6", "#6366f1", "#64748b", "#94a3b8", "#38bdf8", "#34d399", "#facc15", "#fb7185", "#c084fc", "#2dd4bf"];
const DEFAULT_ACHIEVEMENTS = [{
  "id": "shift_1",
  "title": "Мы рады видеть!",
  "description": "Первая смена",
  "icon": "1",
  "color": "#38bdf8",
  "ruleType": "shifts_count",
  "threshold": 1,
  "stageId": "",
  "enabled": true
}, {
  "id": "shifts_10",
  "title": "Разогрев",
  "description": "10 смен",
  "icon": "10",
  "color": "#38bdf8",
  "ruleType": "shifts_count",
  "threshold": 10,
  "stageId": "",
  "enabled": true
}, {
  "id": "shifts_50",
  "title": "Постоянный",
  "description": "Отработал 50 смен",
  "icon": "50",
  "color": "#38bdf8",
  "ruleType": "shifts_count",
  "threshold": 50,
  "stageId": "",
  "enabled": true
}, {
  "id": "shifts_100",
  "title": "Сотня",
  "description": "100 смен в трекере",
  "icon": "100",
  "color": "#60a5fa",
  "ruleType": "shifts_count",
  "threshold": 100,
  "stageId": "",
  "enabled": true
}, {
  "id": "shifts_250",
  "title": "Ветеран",
  "description": "250 смен",
  "icon": "250",
  "color": "#818cf8",
  "ruleType": "shifts_count",
  "threshold": 250,
  "stageId": "",
  "enabled": true
}, {
  "id": "shifts_500",
  "title": "Титан смен",
  "description": "500 смен",
  "icon": "500",
  "color": "#a78bfa",
  "ruleType": "shifts_count",
  "threshold": 500,
  "stageId": "",
  "enabled": true
}, {
  "id": "shifts_1001",
  "title": "Тысяча и одна смена",
  "description": "1001 смена",
  "icon": "1001",
  "color": "#f59e0b",
  "ruleType": "shifts_count",
  "threshold": 1001,
  "stageId": "",
  "enabled": true
}, {
  "id": "hours_500",
  "title": "Наработка",
  "description": "500 часов работы",
  "icon": "500",
  "color": "#14b8a6",
  "ruleType": "hours_count",
  "threshold": 500,
  "stageId": "",
  "enabled": true
}, {
  "id": "projects_1",
  "title": "Новый проект, новый опыт",
  "description": "Поработал на первом проекте",
  "icon": "1P",
  "color": "#60a5fa",
  "ruleType": "projects_count",
  "threshold": 1,
  "stageId": "",
  "enabled": true
}, {
  "id": "projects_10",
  "title": "Проектный человек",
  "description": "Поработал на 10 проектах",
  "icon": "10P",
  "color": "#a78bfa",
  "ruleType": "projects_count",
  "threshold": 10,
  "stageId": "",
  "enabled": true
}, {
  "id": "projects_20",
  "title": "Видел продакшн мир",
  "description": "Поработал на 20 проектах",
  "icon": "20P",
  "color": "#c084fc",
  "ruleType": "projects_count",
  "threshold": 20,
  "stageId": "",
  "enabled": true
}, {
  "id": "series_10",
  "title": "Серийный специалист",
  "description": "Поработал над 10 сериями",
  "icon": "10S",
  "color": "#22c55e",
  "ruleType": "series_count",
  "threshold": 10,
  "stageId": "",
  "enabled": true
}, {
  "id": "series_50",
  "title": "Сериалити",
  "description": "50 серий опыта",
  "icon": "50S",
  "color": "#22c55e",
  "ruleType": "series_count",
  "threshold": 50,
  "stageId": "",
  "enabled": true
}, {
  "id": "full_project_5",
  "title": "Полный круг",
  "description": "Поработал над каждой серией проекта, где минимум 5 серий",
  "icon": "ALL5",
  "color": "#34d399",
  "ruleType": "full_project_series",
  "threshold": 5,
  "stageId": "",
  "enabled": true
}, {
  "id": "project_loyalty_50",
  "title": "Верность проекту",
  "description": "50 смен на одном проекте",
  "icon": "50P",
  "color": "#facc15",
  "ruleType": "project_shifts_count",
  "threshold": 50,
  "stageId": "",
  "enabled": true
}, {
  "id": "projects_day_2",
  "title": "Двойной заход",
  "description": "Два проекта за один день",
  "icon": "2D",
  "color": "#f97316",
  "ruleType": "projects_one_day",
  "threshold": 2,
  "stageId": "",
  "enabled": true
}, {
  "id": "projects_day_3",
  "title": "Тройной заход",
  "description": "Три проекта за один день",
  "icon": "3D",
  "color": "#f59e0b",
  "ruleType": "projects_one_day",
  "threshold": 3,
  "stageId": "",
  "enabled": true
}, {
  "id": "projects_day_5",
  "title": "Продакшн серфинг",
  "description": "5 проектов за один день",
  "icon": "5D",
  "color": "#ef4444",
  "ruleType": "projects_one_day",
  "threshold": 5,
  "stageId": "",
  "enabled": true
}, {
  "id": "stages_day_3",
  "title": "Широкий профиль",
  "description": "Три разных этапа за день",
  "icon": "3E",
  "color": "#8b5cf6",
  "ruleType": "stages_one_day",
  "threshold": 3,
  "stageId": "",
  "enabled": true
}, {
  "id": "tasks_day_5",
  "title": "Всё под контролем",
  "description": "Пять заданий за день",
  "icon": "5T",
  "color": "#ec4899",
  "ruleType": "tasks_one_day",
  "threshold": 5,
  "stageId": "",
  "enabled": true
}, {
  "id": "series_week_5",
  "title": "Спринтер",
  "description": "За неделю поработал над пятью сериями",
  "icon": "5W",
  "color": "#06b6d4",
  "ruleType": "series_week",
  "threshold": 5,
  "stageId": "",
  "enabled": true
}, {
  "id": "same_project_series_day_3",
  "title": "Марафон",
  "description": "Три серии одного проекта за день",
  "icon": "3S",
  "color": "#f97316",
  "ruleType": "same_project_series_one_day",
  "threshold": 3,
  "stageId": "",
  "enabled": true
}, {
  "id": "pro_roles_3",
  "title": "Универсальный боец",
  "description": "Работал в трёх разных профессиональных ролях",
  "icon": "3R",
  "color": "#94a3b8",
  "ruleType": "professional_roles_count",
  "threshold": 3,
  "stageId": "",
  "enabled": true
}, {
  "id": "material_first",
  "title": "Принял материал",
  "description": "Первая задача по приходу материала",
  "icon": "IN",
  "color": "#ec4899",
  "ruleType": "stage_task_count",
  "threshold": 1,
  "stageId": "приход_мат",
  "enabled": true
}, {
  "id": "sync_25",
  "title": "Синхронавт",
  "description": "25 задач синхры",
  "icon": "25",
  "color": "#ec4899",
  "ruleType": "stage_task_count",
  "threshold": 25,
  "stageId": "синхра",
  "enabled": true
}, {
  "id": "sync_100",
  "title": "Синхра, камера, мотор!",
  "description": "100 задач синхры",
  "icon": "100",
  "color": "#ec4899",
  "ruleType": "stage_task_count",
  "threshold": 100,
  "stageId": "синхра",
  "enabled": true
}, {
  "id": "fresh_eye_25",
  "title": "Свежий взгляд",
  "description": "25 отсмотров",
  "icon": "25",
  "color": "#3b82f6",
  "ruleType": "stage_group_task_count",
  "threshold": 25,
  "stageId": "sg5",
  "enabled": true
}, {
  "id": "client_view_20",
  "title": "Заказчик доволен",
  "description": "20 просмотров у заказчика",
  "icon": "20",
  "color": "#3b82f6",
  "ruleType": "stage_task_count",
  "threshold": 20,
  "stageId": "просмотр_заказ",
  "enabled": true
}, {
  "id": "channel_view_20",
  "title": "Через сито канала",
  "description": "20 отсмотров на канале",
  "icon": "20",
  "color": "#8b5cf6",
  "ruleType": "stage_task_count",
  "threshold": 20,
  "stageId": "отсмотр_канал",
  "enabled": true
}, {
  "id": "masters_25",
  "title": "Мастерская рука",
  "description": "25 задач мастеринга",
  "icon": "M25",
  "color": "#22c55e",
  "ruleType": "masters_count",
  "threshold": 25,
  "stageId": "",
  "enabled": true
}, {
  "id": "color_25",
  "title": "Цвет настроения",
  "description": "25 цветокоров",
  "icon": "C25",
  "color": "#f59e0b",
  "ruleType": "stage_task_count",
  "threshold": 25,
  "stageId": "цветокор",
  "enabled": true
}, {
  "id": "sound_25",
  "title": "Всё звучит",
  "description": "25 задач сведения звука",
  "icon": "S25",
  "color": "#14b8a6",
  "ruleType": "stage_task_count",
  "threshold": 25,
  "stageId": "сведение_звука",
  "enabled": true
}, {
  "id": "otk_25",
  "title": "ОТКшник",
  "description": "25 задач, связанных с ОТК",
  "icon": "ОТК",
  "color": "#22c55e",
  "ruleType": "stage_group_task_count",
  "threshold": 25,
  "stageId": "sg8",
  "enabled": true
}, {
  "id": "fixes_50",
  "title": "Повелитель правок",
  "description": "50 задач правок",
  "icon": "FIX",
  "color": "#f97316",
  "ruleType": "stage_task_count",
  "threshold": 50,
  "stageId": "правки",
  "enabled": true
}, {
  "id": "patches_50",
  "title": "Заплаточник",
  "description": "50 задач с заплатками",
  "icon": "PATCH",
  "color": "#22c55e",
  "ruleType": "stage_task_count",
  "threshold": 50,
  "stageId": "выгон_заплаток",
  "enabled": true
}, {
  "id": "bezrek_50",
  "title": "Безрековый",
  "description": "50 задач БезРЕК",
  "icon": "BR",
  "color": "#f59e0b",
  "ruleType": "stage_task_count",
  "threshold": 50,
  "stageId": "безрек",
  "enabled": true
}, {
  "id": "archive_50",
  "title": "Архивариус",
  "description": "50 подготовленных архивов",
  "icon": "AR",
  "color": "#64748b",
  "ruleType": "stage_task_count",
  "threshold": 50,
  "stageId": "подготовка_архива",
  "enabled": true
}, {
  "id": "blur_10",
  "title": "Блюролог",
  "description": "10 задач с блюром",
  "icon": "BL",
  "color": "#94a3b8",
  "ruleType": "stage_task_count",
  "threshold": 10,
  "stageId": "блюр",
  "enabled": true
}, {
  "id": "promo_20",
  "title": "Промоходец",
  "description": "20 промо-задач",
  "icon": "PR",
  "color": "#f43f5e",
  "ruleType": "stage_task_count",
  "threshold": 20,
  "stageId": "промо",
  "enabled": true
}, {
  "id": "holiday_shift_1",
  "title": "Праздничный герой",
  "description": "Смена 31 декабря или в новогодние праздники",
  "icon": "NY",
  "color": "#60a5fa",
  "ruleType": "holiday_shift_count",
  "threshold": 1,
  "stageId": "",
  "enabled": true
}, {
  "id": "early_shift_1",
  "title": "Ранний старт",
  "description": "Смена началась до 07:00",
  "icon": "07",
  "color": "#facc15",
  "ruleType": "early_shift_count",
  "threshold": 1,
  "stageId": "",
  "enabled": true
}, {
  "id": "comeback_30",
  "title": "Камбэк",
  "description": "Вернулся после перерыва больше месяца",
  "icon": "CB",
  "color": "#a78bfa",
  "ruleType": "comeback_gap_days",
  "threshold": 30,
  "stageId": "",
  "enabled": true
}, {
  "id": "fixes_series_5",
  "title": "Эта серия прошла многое",
  "description": "Пять задач правок на одной серии",
  "icon": "V5",
  "color": "#f97316",
  "ruleType": "same_series_stage_count",
  "threshold": 5,
  "stageId": "правки",
  "enabled": true
}, {
  "id": "office_10",
  "title": "На связи",
  "description": "Работал 10 дней в трекере",
  "icon": "10D",
  "color": "#64748b",
  "ruleType": "work_days_count",
  "threshold": 10,
  "stageId": "",
  "enabled": true
}, {
  "id": "sound_role_10",
  "title": "Человек с ухом",
  "description": "10 задач в роли звука",
  "icon": "S10",
  "color": "#14b8a6",
  "ruleType": "role_task_count",
  "threshold": 10,
  "stageId": "звук",
  "enabled": true
}, {
  "id": "color_role_10",
  "title": "Глаз в цвете",
  "description": "10 задач в роли цветокора",
  "icon": "C10",
  "color": "#f59e0b",
  "ruleType": "role_task_count",
  "threshold": 10,
  "stageId": "цвет",
  "enabled": true
}, {
  "id": "ingest_role_10",
  "title": "Входной контроль",
  "description": "10 задач в роли инжеста",
  "icon": "I10",
  "color": "#ec4899",
  "ruleType": "role_task_count",
  "threshold": 10,
  "stageId": "инжест",
  "enabled": true
}, {
  "id": "editor_role_50",
  "title": "Монтажная смена",
  "description": "50 задач в роли монтажа",
  "icon": "E50",
  "color": "#6366f1",
  "ruleType": "role_task_count",
  "threshold": 50,
  "stageId": "монтаж",
  "enabled": true
}];
const ACHIEVEMENT_RULES = [{
  "id": "shifts_count",
  "label": "Всего смен",
  "unit": "смен"
}, {
  "id": "hours_count",
  "label": "Часы работы",
  "unit": "ч"
}, {
  "id": "work_days_count",
  "label": "Дни в трекере",
  "unit": "дней"
}, {
  "id": "series_count",
  "label": "Разные серии",
  "unit": "серий"
}, {
  "id": "projects_count",
  "label": "Проекты",
  "unit": "проектов"
}, {
  "id": "project_shifts_count",
  "label": "Смен на одном проекте",
  "unit": "смен"
}, {
  "id": "projects_one_day",
  "label": "Проектов за день",
  "unit": "проектов"
}, {
  "id": "series_one_day",
  "label": "Серий за день",
  "unit": "серий"
}, {
  "id": "same_project_series_one_day",
  "label": "Серий одного проекта за день",
  "unit": "серий"
}, {
  "id": "stages_one_day",
  "label": "Этапов за день",
  "unit": "этапов"
}, {
  "id": "tasks_one_day",
  "label": "Задач за день",
  "unit": "задач"
}, {
  "id": "series_week",
  "label": "Серий за неделю",
  "unit": "серий"
}, {
  "id": "full_project_series",
  "label": "Все серии проекта",
  "unit": "серий в проекте"
}, {
  "id": "masters_count",
  "label": "Задач по мастерингу",
  "unit": "задач"
}, {
  "id": "stage_task_count",
  "label": "Задач на этапе",
  "unit": "задач",
  "needsStage": true
}, {
  "id": "stage_group_task_count",
  "label": "Задач в группе этапов",
  "unit": "задач",
  "needsGroup": true
}, {
  "id": "same_series_stage_count",
  "label": "Задач этапа на одной серии",
  "unit": "задач",
  "needsStage": true
}, {
  "id": "role_task_count",
  "label": "Задач по роли этапа",
  "unit": "задач",
  "needsRole": true
}, {
  "id": "professional_roles_count",
  "label": "Профессиональные роли",
  "unit": "ролей"
}, {
  "id": "early_shift_count",
  "label": "Ранние смены",
  "unit": "смен"
}, {
  "id": "holiday_shift_count",
  "label": "Праздничные смены",
  "unit": "смен"
}, {
  "id": "comeback_gap_days",
  "label": "Перерыв перед сменой",
  "unit": "дней"
}];
function normalizeAchievement(a) {
  const src = a || {};
  return {
    id: String(src.id || "ach_" + Date.now()).trim(),
    title: String(src.title || "").trim(),
    description: String(src.description || ""),
    icon: String(src.icon || ""),
    image: String(src.image || ""),
    color: src.color || "#38bdf8",
    ruleType: src.ruleType || "shifts_count",
    threshold: Math.max(1, Number(src.threshold) || 1),
    stageId: src.stageId || "",
    enabled: src.enabled !== false
  };
}
function achievementList(data) {
  if (Array.isArray(data === null || data === void 0 ? void 0 : data.achievements)) return data.achievements.map(normalizeAchievement);
  return DEFAULT_ACHIEVEMENTS.map(normalizeAchievement);
}
function achievementRuleLabel(type) {
  var _ACHIEVEMENT_RULES$fi;
  return ((_ACHIEVEMENT_RULES$fi = ACHIEVEMENT_RULES.find(r => r.id === type)) === null || _ACHIEVEMENT_RULES$fi === void 0 ? void 0 : _ACHIEVEMENT_RULES$fi.label) || type;
}
function buildAchievementMetrics(tasks, projectStats, stageMap, data, person) {
  const done = (tasks || []).filter(t => !t.deleted && !t.cancelled);
  const stageCounts = {};
  const groupCounts = {};
  const roleCounts = {};
  const byDay = {};
  const seriesByDay = {};
  const stagesByDay = {};
  const sameProjectSeriesByDay = {};
  const seriesByWeek = {};
  const seriesSet = new Set();
  const workDays = new Set();
  const shiftsByProject = {};
  const seriesStageCounts = {};
  const professionalRoles = new Set();
  const holidays = new Set([...((data === null || data === void 0 ? void 0 : data.holidays) || []), ...DEFAULT_HOLIDAYS]);
  let masterCount = 0;
  let hours = 0;
  let early = 0;
  let holiday = 0;
  const seriesKey = t => String(t.seriesId || (t.project || "") + "|" + (t.series || ""));
  done.forEach(t => {
    const st = (stageMap === null || stageMap === void 0 ? void 0 : stageMap[t.status]) || {};
    const key = seriesKey(t);
    if (key && key !== "|") seriesSet.add(key);
    if (t.day) workDays.add(t.day);
    stageCounts[t.status] = (stageCounts[t.status] || 0) + 1;
    if (st.groupId) groupCounts[st.groupId] = (groupCounts[st.groupId] || 0) + 1;
    (st.rolesRequired || []).forEach(r => {
      roleCounts[r] = (roleCounts[r] || 0) + 1;
      professionalRoles.add(r);
    });
    hours += Math.max(0, Number(t.to) - Number(t.from));
    if (String(t.status || "").toLowerCase().includes("\u043c\u0430\u0441\u0442\u0435\u0440") || String((st === null || st === void 0 ? void 0 : st.label) || "").toLowerCase().includes("\u043c\u0430\u0441\u0442\u0435\u0440")) masterCount++;
    if (Number(t.from) < 7) early++;
    if (t.day && (holidays.has(t.day) || /^31\.12\./.test(t.day) || /^0[1-8]\.01\./.test(t.day))) holiday++;
    if (t.project) shiftsByProject[t.project] = (shiftsByProject[t.project] || 0) + 1;
    if (t.day) {
      if (!byDay[t.day]) byDay[t.day] = new Set();
      if (!seriesByDay[t.day]) seriesByDay[t.day] = new Set();
      if (!stagesByDay[t.day]) stagesByDay[t.day] = new Set();
      if (t.project) byDay[t.day].add(t.project);
      if (key) seriesByDay[t.day].add(key);
      if (t.status) stagesByDay[t.day].add(t.status);
      const psKey = (t.project || "") + "|" + t.day;
      if (!sameProjectSeriesByDay[psKey]) sameProjectSeriesByDay[psKey] = new Set();
      if (key) sameProjectSeriesByDay[psKey].add(key);
      const wk = weekKey(t.day);
      if (wk) {
        if (!seriesByWeek[wk]) seriesByWeek[wk] = new Set();
        if (key) seriesByWeek[wk].add(key);
      }
    }
    const ssKey = key + "|" + (t.status || "");
    seriesStageCounts[ssKey] = (seriesStageCounts[ssKey] || 0) + 1;
  });
  const dates = [...workDays].sort((a, b) => daySort(a).localeCompare(daySort(b)));
  let maxGap = 0;
  for (let i = 1; i < dates.length; i++) {
    const a = parseDate(dates[i - 1]),
      b = parseDate(dates[i]);
    if (a && b) maxGap = Math.max(maxGap, Math.round((b - a) / 86400000));
  }
  let fullProjectMax = 0;
  ((data === null || data === void 0 ? void 0 : data.projects) || []).forEach(p => {
    const pSeries = ((data === null || data === void 0 ? void 0 : data.series) || []).filter(s => !s.deleted && s.projectId === p.id);
    if (!pSeries.length) return;
    const pDone = new Set(done.filter(t => t.project === p.id).map(seriesKey));
    const allDone = pSeries.every(s => pDone.has(String(s.id)) || pDone.has(p.id + "|" + s.name));
    if (allDone) fullProjectMax = Math.max(fullProjectMax, pSeries.length);
  });
  const maxNumber = obj => Object.values(obj || {}).reduce((m, n) => Math.max(m, Number(n) || 0), 0);
  const maxSetSize = obj => Object.values(obj || {}).reduce((m, set) => Math.max(m, (set === null || set === void 0 ? void 0 : set.size) || 0), 0);
  return {
    shifts_count: done.length,
    hours_count: Math.round(hours),
    work_days_count: workDays.size,
    masters_count: masterCount,
    projects_count: (projectStats || []).length,
    series_count: seriesSet.size,
    project_shifts_count: maxNumber(shiftsByProject),
    projects_one_day: maxSetSize(byDay),
    series_one_day: maxSetSize(seriesByDay),
    same_project_series_one_day: maxSetSize(sameProjectSeriesByDay),
    stages_one_day: maxSetSize(stagesByDay),
    tasks_one_day: dates.reduce((m, d) => Math.max(m, done.filter(t => t.day === d).length), 0),
    series_week: maxSetSize(seriesByWeek),
    full_project_series: fullProjectMax,
    professional_roles_count: professionalRoles.size,
    early_shift_count: early,
    holiday_shift_count: holiday,
    comeback_gap_days: maxGap,
    stageCounts,
    groupCounts,
    roleCounts,
    seriesStageCounts
  };
}
function achievementValue(a, metrics) {
  var _metrics$stageCounts, _metrics$groupCounts, _metrics$roleCounts;
  if (a.ruleType === "stage_task_count") return ((_metrics$stageCounts = metrics.stageCounts) === null || _metrics$stageCounts === void 0 ? void 0 : _metrics$stageCounts[a.stageId]) || 0;
  if (a.ruleType === "stage_group_task_count") return ((_metrics$groupCounts = metrics.groupCounts) === null || _metrics$groupCounts === void 0 ? void 0 : _metrics$groupCounts[a.stageId]) || 0;
  if (a.ruleType === "role_task_count") return ((_metrics$roleCounts = metrics.roleCounts) === null || _metrics$roleCounts === void 0 ? void 0 : _metrics$roleCounts[a.stageId]) || 0;
  if (a.ruleType === "same_series_stage_count") {
    const suffix = "|" + (a.stageId || "");
    return Object.entries(metrics.seriesStageCounts || {}).reduce((m, _ref) => {
      let _ref2 = _slicedToArray(_ref, 2),
        k = _ref2[0],
        v = _ref2[1];
      return k.endsWith(suffix) ? Math.max(m, v) : m;
    }, 0);
  }
  return metrics[a.ruleType] || 0;
}
function earnedAchievements(data, metrics) {
  return achievementList(data).map(a => ({
    ...a,
    value: achievementValue(a, metrics)
  })).filter(a => a.enabled !== false && a.value >= a.threshold);
}
const ASSET_STAGES = [{
  id: "ingest",
  label: "Инжест",
  color: "#64748b"
}, {
  id: "sync",
  label: "Синхра",
  color: "#ec4899"
}, {
  id: "edit",
  label: "Редактура",
  color: "#a855f7"
}, {
  id: "montage",
  label: "Монтаж",
  color: "#3b82f6"
}, {
  id: "color",
  label: "Цвет",
  color: "#f59e0b"
}, {
  id: "sound",
  label: "Звук",
  color: "#06b6d4"
}, {
  id: "master",
  label: "Мастер",
  color: "#22c55e"
}, {
  id: "delivered",
  label: "Сдан",
  color: "#10b981"
}];
function makeAsset(id) {
  return {
    id,
    label: "",
    stage: "ingest",
    paths: {
      ingest: "",
      sync: "",
      project: "",
      master: "",
      delivery: ""
    },
    history: [],
    timings: {
      ingestAt: "",
      syncAt: "",
      editAt: "",
      colorAt: "",
      soundAt: "",
      masterAt: "",
      deliveredAt: ""
    },
    thumb: "",
    qc: {
      status: null,
      checks: []
    },
    ai: {
      estimatedDays: null,
      deadlineRisk: null,
      diskWarning: null,
      suggestedNextStep: null,
      notes: ""
    }
  };
}
const SERIES_MILESTONES = [{
  key: "sendDate",
  label: "\u041e\u0442\u043f\u0440\u0430\u0432\u043a\u0430 \u0437\u0430\u043a\u0430\u0437\u0447\u0438\u043a\u0443",
  abbr: "\u0417\u0430\u043a\u0430\u0437",
  color: "#a855f7"
}, {
  key: "preOtkDate",
  label: "ПредОТК",
  abbr: "пОТК",
  color: "#0ea5e9",
  configurable: true
}, {
  key: "otkDate",
  label: "ОТК",
  abbr: "ОТК",
  color: "#22c55e",
  configurable: true
}, {
  key: "airDate",
  label: "Эфир",
  abbr: "Эфир",
  color: "#ef4444"
}];
const MILESTONE_ICON = "◆";
const CUSTOM_MILESTONE_LIMIT = 10;
function getProjectMilestoneMeta(project, key, base) {
  var _project$dossier;
  const meta = ((project === null || project === void 0 || (_project$dossier = project.dossier) === null || _project$dossier === void 0 ? void 0 : _project$dossier.milestoneMeta) || {})[key] || {};
  return {
    ...base,
    label: meta.label || base.label,
    abbr: meta.abbr || meta.label || base.abbr || base.label,
    color: meta.color || base.color
  };
}
function getProjectCustomMilestones(project) {
  var _project$dossier2;
  return ((project === null || project === void 0 || (_project$dossier2 = project.dossier) === null || _project$dossier2 === void 0 ? void 0 : _project$dossier2.customMilestones) || []).slice(0, CUSTOM_MILESTONE_LIMIT).filter(m => m && m.id);
}
function getProjectMilestoneDefinitions(project) {
  const fixed = SERIES_MILESTONES.map(base => {
    const m = base.configurable ? getProjectMilestoneMeta(project, base.key, base) : base;
    return {
      ...m,
      key: base.key,
      field: base.key,
      custom: false
    };
  });
  const custom = getProjectCustomMilestones(project).map(def => ({
    key: def.id,
    field: def.id,
    label: def.label || "\u041a\u043e\u043d\u0442\u0440\u043e\u043b\u044c\u043d\u0430\u044f \u0442\u043e\u0447\u043a\u0430",
    abbr: def.label || "\u041a\u0422",
    color: def.color || "#f59e0b",
    custom: true,
    icon: MILESTONE_ICON
  }));
  return [...fixed, ...custom];
}
function getSeriesMilestoneValue(series, def) {
  if (!series || !def) return "";
  if (def.custom) {
    const row = (series.customMilestones || []).find(v => v.id === def.key) || {};
    return row.date || "";
  }
  return series[def.field || def.key] || "";
}
function seriesMilestonePatch(series, def, date) {
  if (!def) return {};
  if (def.custom) {
    const items = [...(series.customMilestones || [])];
    const idx = items.findIndex(v => v.id === def.key);
    if (idx >= 0) items[idx] = {
      ...items[idx],
      id: def.key,
      date
    };else items.push({
      id: def.key,
      date
    });
    return {
      customMilestones: items
    };
  }
  return {
    [def.field || def.key]: date
  };
}
function getSeriesGroupTaskRange(series, group, stages, tasks) {
  if (!series || !group) return {
    from: "",
    to: "",
    count: 0
  };
  const stageIds = new Set((stages || []).filter(s => s.groupId === group.id).map(s => s.id));
  if (!stageIds.size) return {
    from: "",
    to: "",
    count: 0
  };
  const rows = (tasks || []).filter(t => !t.deleted && !t.cancelled && t.project === series.projectId && (t.seriesId === series.id || !t.seriesId && t.series === series.name) && stageIds.has(t.status) && t.day).sort((a, b) => daySort(a.day).localeCompare(daySort(b.day)));
  if (!rows.length) return {
    from: "",
    to: "",
    count: 0
  };
  return {
    from: rows[0].day,
    to: rows[rows.length - 1].day,
    count: rows.length
  };
}
function getSeriesMilestoneEvents(series, project) {
  const fixed = SERIES_MILESTONES.map(base => {
    const m = base.configurable ? getProjectMilestoneMeta(project, base.key, base) : base;
    return {
      ...m,
      date: (series === null || series === void 0 ? void 0 : series[base.key]) || "",
      icon: MILESTONE_ICON
    };
  }).filter(m => m.date);
  const values = (series === null || series === void 0 ? void 0 : series.customMilestones) || [];
  const custom = getProjectCustomMilestones(project).map(def => {
    const row = values.find(v => v.id === def.id) || {};
    return {
      key: def.id,
      label: def.label || "Контрольная точка",
      abbr: def.label || "КТ",
      color: def.color || "#f59e0b",
      date: row.date || "",
      icon: MILESTONE_ICON,
      custom: true
    };
  }).filter(m => m.date);
  return [...fixed, ...custom];
}
const GANTT_TEMPLATES = [{
  status: "\u0441\u0438\u043d\u0445\u0440\u0430",
  label: "\u0421\u0438\u043d\u0445\u0440\u0430"
}, {
  status: "\u043c\u043e\u043d\u0442\u0430\u0436",
  label: "\u041c\u043e\u043d\u0442\u0430\u0436"
}, {
  status: "\u0432\u043d\u0443\u0442\u0440_\u043e\u0442\u0441\u043c\u043e\u0442\u0440",
  label: "\u0412\u043d\u0443\u0442\u0440. \u043e\u0442\u0441\u043c\u043e\u0442\u0440"
}, {
  status: "\u0446\u0432\u0435\u0442\u043e\u043a\u043e\u0440",
  label: "\u0426\u0432\u0435\u0442\u043e\u043a\u043e\u0440"
}, {
  status: "\u0441\u0432\u0435\u0434\u0435\u043d\u0438\u0435_\u0437\u0432\u0443\u043a\u0430",
  label: "\u0421\u0432\u0435\u0434\u0435\u043d\u0438\u0435 \u0437\u0432\u0443\u043a\u0430"
}, {
  status: "\u043f\u0440\u0430\u0432\u043a\u0438",
  label: "\u041f\u0440\u0430\u0432\u043a\u0438"
}];
const TIME_PRESETS = [{
  f: 10,
  t: 19
}, {
  f: 11,
  t: 20
}, {
  f: 10,
  t: 14
}, {
  f: 14,
  t: 19
}, {
  f: 10,
  t: 22
}, {
  f: 9,
  t: 18
}];
const WDAYS = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
const WDAYS_LONG = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
const MONTHS = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
const PROJECT_STATUSES = ["в работе", "ожидаем", "на паузе", "сдан", "архив"];
const DEFAULT_STAGE_GROUPS = [{
  id: "sg1",
  label: "Съемка",
  order: 1
}, {
  id: "sg2",
  label: "Синхра",
  order: 2
}, {
  id: "sg3",
  label: "Редактура",
  order: 3
}, {
  id: "sg4",
  label: "Монтаж",
  order: 4
}, {
  id: "sg5",
  label: "Внутренний отсмотр",
  order: 5
}, {
  id: "sg6",
  label: "Отсмотр на канале",
  order: 6
}, {
  id: "sg7",
  label: "Мастеринг",
  order: 7
}, {
  id: "sg8",
  label: "ОТК",
  order: 8
}, {
  id: "sg9",
  label: "БезРЕК",
  order: 9
}, {
  id: "sg10",
  label: "Архив",
  order: 10
}];
function daySort(s) {
  return s ? s.split('.').reverse().join('') : '';
}
function fmtHour(h) {
  const n = Number(h) || 0;
  return `${Math.floor(n)}:${n % 1 >= 0.5 ? "30" : "00"}`;
}
function fmtDur(f, t) {
  const d = Number(t) - Number(f);
  if (d <= 0) return "";
  const h = Math.floor(d);
  return d % 1 >= 0.5 ? `${h}ч 30мин` : `${h}ч`;
}
const DEMO_ROLES = [{
  id: "монтаж",
  label: "Монтажёр",
  color: "#6366f1"
}, {
  id: "цвет",
  label: "Цветокор",
  color: "#f59e0b"
}, {
  id: "звук",
  label: "Звукорежиссёр",
  color: "#14b8a6"
}, {
  id: "инжест",
  label: "Инжест",
  color: "#ec4899"
}, {
  id: "выпуск",
  label: "Выпускающий",
  color: "#22c55e"
}, {
  id: "продюсер",
  label: "Продюсер",
  color: "#3b82f6"
}];
const DEMO_PEOPLE = [{
  id: "p1",
  name: "Захаров",
  roles: ["выпуск", "продюсер"],
  active: true
}, {
  id: "p2",
  name: "Громов",
  roles: ["цвет"],
  active: true
}, {
  id: "p3",
  name: "Ильин",
  roles: ["звук"],
  active: true
}, {
  id: "p4",
  name: "Романов",
  roles: ["монтаж"],
  active: true
}, {
  id: "p5",
  name: "Белов",
  roles: ["монтаж", "звук"],
  active: true
}, {
  id: "p6",
  name: "Крылова",
  roles: ["монтаж"],
  active: true
}, {
  id: "p7",
  name: "Титов",
  roles: ["инжест", "монтаж"],
  active: true
}, {
  id: "p8",
  name: "Соколова",
  roles: ["выпуск"],
  active: true
}, {
  id: "p9",
  name: "Соколов",
  roles: ["монтаж"],
  active: true
}, {
  id: "p10",
  name: "Фёдоров",
  roles: ["монтаж"],
  active: true
}, {
  id: "p11",
  name: "Зайцева",
  roles: ["монтаж"],
  active: true
}, {
  id: "p12",
  name: "Нилов",
  roles: ["цвет"],
  active: true
}, {
  id: "p13",
  name: "Сидоров",
  roles: ["звук"],
  active: true
}, {
  id: "p14",
  name: "Петров",
  roles: ["инжест"],
  active: true
}, {
  id: "p15",
  name: "Орлов",
  roles: ["монтаж"],
  active: true
}, {
  id: "p16",
  name: "Волков",
  roles: ["монтаж"],
  active: true
}, {
  id: "p17",
  name: "Смирнова",
  roles: ["монтаж"],
  active: true
}, {
  id: "p18",
  name: "Козлов",
  roles: ["монтаж"],
  active: true
}, {
  id: "p19",
  name: "Морозов",
  roles: ["монтаж"],
  active: true
}, {
  id: "p20",
  name: "Лебедева",
  roles: ["выпуск"],
  active: true
}, {
  id: "p21",
  name: "Кириллов",
  roles: ["выпуск"],
  active: true
}, {
  id: "p22",
  name: "Новиков",
  roles: ["монтаж"],
  active: true
}, {
  id: "p23",
  name: "Попов",
  roles: ["монтаж"],
  active: true
}, {
  id: "p24",
  name: "Кузнецова",
  roles: ["монтаж"],
  active: true
}, {
  id: "p25",
  name: "Быков",
  roles: ["инжест"],
  active: true
}, {
  id: "p26",
  name: "Дорохов",
  roles: ["цвет"],
  active: true
}, {
  id: "p27",
  name: "Степанов",
  roles: ["звук"],
  active: true
}];
const NAME_TO_ID = {
  "Северный Ветер": "sv",
  "Большой Город": "bg",
  "Дикая Природа": "dp",
  "Звёздный Путь": "zp",
  "Морской Берег": "mb"
};
const DEMO_PROJECTS = [{
  id: "sv",
  name: "Северный Ветер",
  abbr: "СВ",
  description: "Документальный сериал, 5 серий",
  color: "#3b82f6",
  status: "в работе"
}, {
  id: "bg",
  name: "Большой Город",
  abbr: "БГ",
  description: "Городской репортажный сериал, 4 серии",
  color: "#a855f7",
  status: "в работе"
}, {
  id: "dp",
  name: "Дикая Природа",
  abbr: "ДП",
  description: "Природный документальный сериал",
  color: "#22c55e",
  status: "в работе"
}, {
  id: "zp",
  name: "Звёздный Путь",
  abbr: "ЗП",
  description: "Научно-популярный сериал",
  color: "#f59e0b",
  status: "в работе"
}, {
  id: "mb",
  name: "Морской Берег",
  abbr: "МБ",
  description: "Приключенческий сериал",
  color: "#ec4899",
  status: "в работе"
}];
const DEMO_SERIES = [{
  id: "sv-s01",
  projectId: "sv",
  name: "С01",
  order: 0,
  shootStart: "01.02.2026",
  shootEnd: "10.02.2026",
  editStart: "01.03.2026",
  preOtkDate: "05.04.2026",
  otkDate: "10.04.2026",
  airDate: "",
  airMode: "weekly",
  airDay: 1,
  airTime: "21:00"
}, {
  id: "sv-s02",
  projectId: "sv",
  name: "С02",
  order: 1,
  shootStart: "10.02.2026",
  shootEnd: "17.02.2026",
  editStart: "10.03.2026",
  preOtkDate: "05.04.2026",
  otkDate: "10.04.2026",
  airDate: "",
  airMode: "weekly",
  airDay: 1,
  airTime: "21:00"
}, {
  id: "sv-s03",
  projectId: "sv",
  name: "С03",
  order: 2,
  shootStart: "17.02.2026",
  shootEnd: "22.02.2026",
  editStart: "17.03.2026",
  preOtkDate: "05.04.2026",
  otkDate: "10.04.2026",
  airDate: "",
  airMode: "weekly",
  airDay: 1,
  airTime: "21:00"
}, {
  id: "sv-s04",
  projectId: "sv",
  name: "С04",
  order: 3,
  shootStart: "22.02.2026",
  shootEnd: "25.02.2026",
  editStart: "22.03.2026",
  preOtkDate: "05.04.2026",
  otkDate: "10.04.2026",
  airDate: "",
  airMode: "weekly",
  airDay: 1,
  airTime: "21:00"
}, {
  id: "sv-s05",
  projectId: "sv",
  name: "С05",
  order: 4,
  shootStart: "25.02.2026",
  shootEnd: "28.02.2026",
  editStart: "28.03.2026",
  preOtkDate: "05.04.2026",
  otkDate: "10.04.2026",
  airDate: "",
  airMode: "weekly",
  airDay: 1,
  airTime: "21:00"
}, {
  id: "bg-s01",
  projectId: "bg",
  name: "С01",
  order: 0,
  shootStart: "10.02.2026",
  shootEnd: "18.02.2026",
  editStart: "06.03.2026",
  preOtkDate: "10.04.2026",
  otkDate: "15.04.2026",
  airDate: "",
  airMode: "weekly",
  airDay: 3,
  airTime: "20:00"
}, {
  id: "bg-s02",
  projectId: "bg",
  name: "С02",
  order: 1,
  shootStart: "18.02.2026",
  shootEnd: "24.02.2026",
  editStart: "12.03.2026",
  preOtkDate: "10.04.2026",
  otkDate: "15.04.2026",
  airDate: "",
  airMode: "weekly",
  airDay: 3,
  airTime: "20:00"
}, {
  id: "bg-s03",
  projectId: "bg",
  name: "С03",
  order: 2,
  shootStart: "24.02.2026",
  shootEnd: "01.03.2026",
  editStart: "18.03.2026",
  preOtkDate: "10.04.2026",
  otkDate: "15.04.2026",
  airDate: "",
  airMode: "weekly",
  airDay: 3,
  airTime: "20:00"
}, {
  id: "bg-s04",
  projectId: "bg",
  name: "С04",
  order: 3,
  shootStart: "01.03.2026",
  shootEnd: "05.03.2026",
  editStart: "24.03.2026",
  preOtkDate: "10.04.2026",
  otkDate: "15.04.2026",
  airDate: "",
  airMode: "weekly",
  airDay: 3,
  airTime: "20:00"
}, {
  id: "dp-s01",
  projectId: "dp",
  name: "С01",
  order: 0,
  shootStart: "05.02.2026",
  shootEnd: "15.02.2026",
  editStart: "01.03.2026",
  preOtkDate: "15.04.2026",
  otkDate: "20.04.2026",
  airDate: "",
  airMode: "weekly",
  airDay: 5,
  airTime: "20:30"
}, {
  id: "dp-s02",
  projectId: "dp",
  name: "С02",
  order: 1,
  shootStart: "15.02.2026",
  shootEnd: "25.02.2026",
  editStart: "20.03.2026",
  preOtkDate: "15.04.2026",
  otkDate: "20.04.2026",
  airDate: "",
  airMode: "weekly",
  airDay: 5,
  airTime: "20:30"
}, {
  id: "zp-s01",
  projectId: "zp",
  name: "С01",
  order: 0,
  shootStart: "01.02.2026",
  shootEnd: "08.02.2026",
  editStart: "20.02.2026",
  preOtkDate: "20.03.2026",
  otkDate: "25.03.2026",
  airDate: "",
  airMode: "weekly",
  airDay: 2,
  airTime: "21:30"
}, {
  id: "zp-s02",
  projectId: "zp",
  name: "С02",
  order: 1,
  shootStart: "08.02.2026",
  shootEnd: "14.02.2026",
  editStart: "02.03.2026",
  preOtkDate: "20.03.2026",
  otkDate: "25.03.2026",
  airDate: "",
  airMode: "weekly",
  airDay: 2,
  airTime: "21:30"
}, {
  id: "zp-s03",
  projectId: "zp",
  name: "С03",
  order: 2,
  shootStart: "14.02.2026",
  shootEnd: "20.02.2026",
  editStart: "10.03.2026",
  preOtkDate: "20.03.2026",
  otkDate: "25.03.2026",
  airDate: "",
  airMode: "weekly",
  airDay: 2,
  airTime: "21:30"
}, {
  id: "mb-s01",
  projectId: "mb",
  name: "С01",
  order: 0,
  shootStart: "01.02.2026",
  shootEnd: "04.02.2026",
  editStart: "10.02.2026",
  preOtkDate: "10.04.2026",
  otkDate: "15.04.2026",
  airDate: "",
  airMode: "weekly",
  airDay: 6,
  airTime: "21:00"
}, {
  id: "mb-s02",
  projectId: "mb",
  name: "С02",
  order: 1,
  shootStart: "04.02.2026",
  shootEnd: "07.02.2026",
  editStart: "24.02.2026",
  preOtkDate: "10.04.2026",
  otkDate: "15.04.2026",
  airDate: "",
  airMode: "weekly",
  airDay: 6,
  airTime: "21:00"
}, {
  id: "mb-s03",
  projectId: "mb",
  name: "С03",
  order: 2,
  shootStart: "07.02.2026",
  shootEnd: "09.02.2026",
  editStart: "10.03.2026",
  preOtkDate: "10.04.2026",
  otkDate: "15.04.2026",
  airDate: "",
  airMode: "weekly",
  airDay: 6,
  airTime: "21:00"
}, {
  id: "mb-s04",
  projectId: "mb",
  name: "С04",
  order: 3,
  shootStart: "09.02.2026",
  shootEnd: "10.02.2026",
  editStart: "24.03.2026",
  preOtkDate: "10.04.2026",
  otkDate: "15.04.2026",
  airDate: "",
  airMode: "weekly",
  airDay: 6,
  airTime: "21:00"
}];
const DEMO_CSV = `проект,серия,статус,кто,день,с,до,заметка / факт
Северный Ветер,С01,сдача,Захаров,16.03.2026,10,15,принято каналом
Северный Ветер,С02,мастеринг,Громов,16.03.2026,10,18,финальная сборка
Северный Ветер,С02,мастеринг,Ильин,16.03.2026,10,18,сведение звука
Северный Ветер,С03,правки,Романов,16.03.2026,10,18,правки по монтажу
Северный Ветер,С03,правки,Белов,16.03.2026,14,18,правки по звуку
Северный Ветер,С04,монтаж,Крылова,16.03.2026,10,18,
Северный Ветер,С04,синхра,Титов,16.03.2026,10,14,синхра завершена
Северный Ветер,С05,синхра,Титов,16.03.2026,14,18,
Северный Ветер,С02,сдача,Захаров,17.03.2026,10,13,финальная сдача
Северный Ветер,С03,правки,Романов,17.03.2026,10,18,
Северный Ветер,С04,монтаж,Крылова,17.03.2026,10,18,
Северный Ветер,С05,синхра,Титов,17.03.2026,10,16,
Северный Ветер,С03,отсмотр,Захаров,18.03.2026,11,14,отсмотр с заказчиком
Северный Ветер,С04,монтаж,Крылова,18.03.2026,10,18,
Северный Ветер,С04,монтаж,Белов,18.03.2026,10,18,параллельный монтаж
Северный Ветер,С05,монтаж,Романов,18.03.2026,10,18,
Северный Ветер,С04,монтаж,Крылова,19.03.2026,10,18,
Северный Ветер,С04,монтаж,Белов,19.03.2026,10,18,
Северный Ветер,С05,монтаж,Романов,19.03.2026,10,18,
Северный Ветер,С03,правки,Романов,20.03.2026,10,14,финальные правки
Северный Ветер,С04,цвет/звук,Громов,20.03.2026,10,18,цвет
Северный Ветер,С04,цвет/звук,Ильин,20.03.2026,10,18,звук
Северный Ветер,С05,монтаж,Романов,20.03.2026,10,18,
Северный Ветер,С04,цвет/звук,Громов,21.03.2026,10,18,
Северный Ветер,С05,монтаж,Крылова,21.03.2026,10,18,
Северный Ветер,С04,предотк,Захаров,23.03.2026,10,13,
Северный Ветер,С05,монтаж,Белов,23.03.2026,10,18,
Северный Ветер,С05,монтаж,Крылова,23.03.2026,10,18,
Северный Ветер,С04,отсмотр,Захаров,24.03.2026,12,15,
Северный Ветер,С05,цвет/звук,Громов,24.03.2026,10,18,
Северный Ветер,С05,цвет/звук,Ильин,24.03.2026,10,18,
Большой Город,С01,сдача,Соколова,16.03.2026,10,14,сдан
Большой Город,С02,отсмотр,Соколова,16.03.2026,15,18,замечания переданы
Большой Город,С02,правки,Соколов,17.03.2026,10,18,
Большой Город,С02,правки,Фёдоров,17.03.2026,10,15,
Большой Город,С03,монтаж,Зайцева,17.03.2026,10,18,
Большой Город,С03,синхра,Петров,17.03.2026,10,14,
Большой Город,С02,правки,Соколов,18.03.2026,10,15,финальные правки
Большой Город,С03,монтаж,Зайцева,18.03.2026,10,18,
Большой Город,С03,монтаж,Фёдоров,18.03.2026,10,18,
Большой Город,С02,мастеринг,Нилов,19.03.2026,10,18,цвет и мастер
Большой Город,С02,мастеринг,Сидоров,19.03.2026,10,18,финальный звук
Большой Город,С03,монтаж,Зайцева,19.03.2026,10,18,
Большой Город,С03,монтаж,Фёдоров,19.03.2026,10,18,
Большой Город,С02,сдача,Соколова,20.03.2026,10,13,
Большой Город,С03,монтаж,Соколов,20.03.2026,10,18,
Большой Город,С04,синхра,Петров,20.03.2026,10,18,
Большой Город,С03,цвет/звук,Нилов,23.03.2026,10,18,
Большой Город,С03,цвет/звук,Сидоров,23.03.2026,10,18,
Большой Город,С04,монтаж,Фёдоров,23.03.2026,10,18,
Большой Город,С04,монтаж,Зайцева,23.03.2026,10,18,
Большой Город,С03,предотк,Соколова,24.03.2026,10,13,
Большой Город,С04,монтаж,Соколов,24.03.2026,10,18,
Большой Город,С04,монтаж,Фёдоров,24.03.2026,10,18,
Дикая Природа,С01,монтаж,Орлов,16.03.2026,10,18,
Дикая Природа,С01,монтаж,Волков,16.03.2026,10,18,
Дикая Природа,С01,синхра,Захаров,16.03.2026,10,16,материал с экспедиции
Дикая Природа,С01,монтаж,Орлов,17.03.2026,10,18,
Дикая Природа,С01,монтаж,Волков,17.03.2026,10,18,
Дикая Природа,С02,синхра,Захаров,17.03.2026,10,18,
Дикая Природа,С01,монтаж,Смирнова,18.03.2026,10,18,
Дикая Природа,С02,синхра,Захаров,18.03.2026,10,14,
Дикая Природа,С01,монтаж,Орлов,19.03.2026,10,18,сложная сцена
Дикая Природа,С01,монтаж,Смирнова,19.03.2026,10,18,
Дикая Природа,С02,монтаж,Волков,19.03.2026,10,18,
Дикая Природа,С01,цвет/звук,Нилов,20.03.2026,10,18,цвет природы
Дикая Природа,С01,цвет/звук,Сидоров,20.03.2026,10,18,
Дикая Природа,С02,монтаж,Волков,20.03.2026,10,18,
Дикая Природа,С02,монтаж,Смирнова,20.03.2026,10,18,
Дикая Природа,С01,цвет/звук,Нилов,21.03.2026,10,18,
Дикая Природа,С02,монтаж,Орлов,21.03.2026,10,18,
Дикая Природа,С01,предотк,Титов,23.03.2026,10,13,
Дикая Природа,С02,монтаж,Волков,23.03.2026,10,18,
Дикая Природа,С02,монтаж,Смирнова,23.03.2026,10,18,
Дикая Природа,С01,отсмотр,Титов,24.03.2026,11,15,
Дикая Природа,С02,цвет/звук,Нилов,24.03.2026,10,18,
Дикая Природа,С02,цвет/звук,Сидоров,24.03.2026,10,18,
Звёздный Путь,С01,цвет/звук,Громов,16.03.2026,10,18,
Звёздный Путь,С01,цвет/звук,Ильин,16.03.2026,10,18,
Звёздный Путь,С02,монтаж,Козлов,16.03.2026,10,18,
Звёздный Путь,С02,монтаж,Морозов,16.03.2026,10,18,
Звёздный Путь,С03,синхра,Петров,16.03.2026,10,18,
Звёздный Путь,С01,предотк,Лебедева,17.03.2026,10,13,внутренний просмотр
Звёздный Путь,С02,монтаж,Козлов,17.03.2026,10,18,
Звёздный Путь,С02,монтаж,Лебедева,17.03.2026,10,18,
Звёздный Путь,С03,монтаж,Морозов,17.03.2026,10,18,
Звёздный Путь,С01,отсмотр,Лебедева,18.03.2026,14,17,
Звёздный Путь,С02,монтаж,Козлов,18.03.2026,10,18,
Звёздный Путь,С03,монтаж,Морозов,18.03.2026,10,18,
Звёздный Путь,С03,монтаж,Лебедева,18.03.2026,10,18,
Звёздный Путь,С01,правки,Козлов,19.03.2026,10,15,правки после отсмотра
Звёздный Путь,С02,цвет/звук,Громов,19.03.2026,10,18,
Звёздный Путь,С02,цвет/звук,Ильин,19.03.2026,10,18,
Звёздный Путь,С03,монтаж,Морозов,19.03.2026,10,18,
Звёздный Путь,С01,мастеринг,Громов,20.03.2026,10,18,
Звёздный Путь,С02,предотк,Лебедева,20.03.2026,10,13,
Звёздный Путь,С03,монтаж,Козлов,20.03.2026,10,18,
Звёздный Путь,С01,сдача,Лебедева,21.03.2026,10,14,сдан продюсеру
Звёздный Путь,С02,отсмотр,Лебедева,21.03.2026,15,18,
Звёздный Путь,С03,цвет/звук,Громов,23.03.2026,10,18,
Звёздный Путь,С03,цвет/звук,Ильин,23.03.2026,10,18,
Звёздный Путь,С02,правки,Морозов,23.03.2026,10,18,
Звёздный Путь,С03,предотк,Лебедева,24.03.2026,10,13,
Звёздный Путь,С02,мастеринг,Громов,24.03.2026,10,18,
Морской Берег,С01,предотк,Кириллов,16.03.2026,10,14,
Морской Берег,С02,монтаж,Новиков,16.03.2026,10,18,
Морской Берег,С02,монтаж,Попов,16.03.2026,10,18,
Морской Берег,С03,синхра,Быков,16.03.2026,10,18,приехал материал
Морской Берег,С01,отсмотр,Кириллов,17.03.2026,12,15,с продюсером
Морской Берег,С02,монтаж,Кузнецова,17.03.2026,10,18,
Морской Берег,С03,синхра,Быков,17.03.2026,10,15,
Морской Берег,С03,монтаж,Новиков,17.03.2026,10,18,
Морской Берег,С01,правки,Попов,18.03.2026,10,18,
Морской Берег,С02,монтаж,Кузнецова,18.03.2026,10,18,
Морской Берег,С03,монтаж,Новиков,18.03.2026,10,18,
Морской Берег,С01,правки,Попов,19.03.2026,10,15,финальные правки
Морской Берег,С02,цвет/звук,Дорохов,19.03.2026,10,18,
Морской Берег,С02,цвет/звук,Степанов,19.03.2026,10,18,
Морской Берег,С03,монтаж,Кузнецова,19.03.2026,10,18,
Морской Берег,С03,монтаж,Попов,19.03.2026,10,18,
Морской Берег,С01,мастеринг,Дорохов,20.03.2026,10,18,
Морской Берег,С01,мастеринг,Степанов,20.03.2026,10,18,финальный звук
Морской Берег,С03,монтаж,Новиков,20.03.2026,10,18,
Морской Берег,С01,сдача,Кириллов,21.03.2026,10,13,
Морской Берег,С02,предотк,Кириллов,21.03.2026,14,17,
Морской Берег,С03,монтаж,Попов,21.03.2026,10,18,
Морской Берег,С02,отсмотр,Кириллов,23.03.2026,11,14,
Морской Берег,С03,цвет/звук,Дорохов,23.03.2026,10,18,
Морской Берег,С03,цвет/звук,Степанов,23.03.2026,10,18,
Морской Берег,С04,синхра,Быков,23.03.2026,10,18,новый блок
Морской Берег,С02,правки,Новиков,24.03.2026,10,16,
Морской Берег,С03,предотк,Кириллов,24.03.2026,10,13,
Морской Берег,С04,монтаж,Кузнецова,24.03.2026,10,18,`;
const VERSION = "1.4.2";
const BUILD_DATE = "11.10.2026";
const STORAGE_MODE = "server";
const SERVER_URL = "";
const RUNTIME = typeof window !== "undefined" && window.__TRACKER_RUNTIME__ ? window.__TRACKER_RUNTIME__ : {};
const DATA_ARRAY_KEYS = ["projects", "series", "tasks", "people", "roles", "stages", "stageGroups", "holidays", "achievements", "personAbsences", "templates", "changelog"];
const CLIENT_SECRET_KEY = /^(?:login|username|user|password|passwd|pwd|passphrase|secret|token|api[_-]?key|access[_-]?key|private[_-]?key|client[_-]?secret|credentials?)$/i;
const CLIENT_ACCESS_SECRET_KEY = /^(?:login|username|user|password|passwd|pwd|passphrase|secret|token|api[_-]?key|access[_-]?key|private[_-]?key|client[_-]?secret|credentials?)$/i;
function clientPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function clientMeaningfulValue(value) {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) return value.some(clientMeaningfulValue);
  if (clientPlainObject(value)) return Object.values(value).some(clientMeaningfulValue);
  return true;
}
function clientAccessHasCredential(access) {
  if (!clientPlainObject(access)) return clientMeaningfulValue(access);
  return Object.entries(access).some(_ref3 => {
    let _ref4 = _slicedToArray(_ref3, 2),
      key = _ref4[0],
      value = _ref4[1];
    return CLIENT_ACCESS_SECRET_KEY.test(key) && clientMeaningfulValue(value) || (Array.isArray(value) || clientPlainObject(value)) && clientAccessHasCredential(value);
  });
}
function sanitizeClientNode(value) {
  if (Array.isArray(value)) return value.map(sanitizeClientNode);
  if (!clientPlainObject(value)) return value;
  const safe = {};
  for (const _ref5 of Object.entries(value)) {
    var _ref6 = _slicedToArray(_ref5, 2);
    const key = _ref6[0];
    const item = _ref6[1];
    if (key === "accesses") {
      safe.accesses = Array.isArray(item) ? item.map(access => {
        const entry = {};
        if (clientPlainObject(access) && typeof access.id === "string") entry.id = access.id;
        if (clientPlainObject(access) && typeof access.label === "string") entry.label = access.label;
        if (clientPlainObject(access) && typeof access.name === "string" && !entry.label) entry.label = access.name;
        if (clientAccessHasCredential(access) || (access === null || access === void 0 ? void 0 : access.credentialsStored) === true) entry.credentialsStored = true;
        return entry;
      }).filter(entry => entry.id || entry.label || entry.credentialsStored) : [];
    } else if (!CLIENT_SECRET_KEY.test(key)) safe[key] = sanitizeClientNode(item);
  }
  return safe;
}
function sanitizeClientData(record) {
  const source = clientPlainObject(record) ? record : {};
  const safe = {
    ...source
  };
  safe.projects = Array.isArray(source.projects) ? source.projects.map(project => ({
    ...project,
    dossier: sanitizeClientNode(clientPlainObject(project === null || project === void 0 ? void 0 : project.dossier) ? project.dossier : {})
  })) : [];
  return safe;
}
function normalizeLoadedData(record) {
  const result = sanitizeClientData(record);
  DATA_ARRAY_KEYS.forEach(key => {
    if (!Array.isArray(result[key])) result[key] = [];
  });
  return result;
}
function accountBackupKey(user) {
  return "post_tracker_backup:" + String((user === null || user === void 0 ? void 0 : user.sam_name) || (user === null || user === void 0 ? void 0 : user.id) || "anonymous");
}
function persistAccountBackup(user, data) {
  const safe = sanitizeClientData(data);
  localStorage.setItem(accountBackupKey(user), JSON.stringify({
    ts: safe._savedAt,
    data: safe
  }));
}
function undoSnapshot(previous, current) {
  let now = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Date.now();
  const restored = {
    ...previous,
    _revision: current === null || current === void 0 ? void 0 : current._revision,
    changelog: (current === null || current === void 0 ? void 0 : current.changelog) || previous.changelog || []
  };
  for (const key of SOFT_DELETE_KEYS) {
    const old = Array.isArray(previous[key]) ? previous[key] : [];
    const ids = new Set(old.map(item => String(item.id)));
    restored[key] = [...old.map(item => ({
      ...item,
      _updatedAt: now
    })), ...((current === null || current === void 0 ? void 0 : current[key]) || []).filter(item => !ids.has(String(item.id))).map(item => ({
      ...item,
      deleted: true,
      _updatedAt: now
    }))];
  }
  return restored;
}
function deleteSeriesSnapshot(data, id) {
  let now = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Date.now();
  return {
    series: (data.series || []).map(s => s.id === id ? {
      ...s,
      deleted: true,
      _updatedAt: now
    } : s),
    tasks: (data.tasks || []).map(t => t.seriesId === id ? {
      ...t,
      deleted: true,
      _updatedAt: now
    } : t)
  };
}
function personWeeklyHours(tasks, today) {
  let weeks = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 12;
  const end = parseDate(today);
  if (!end || !Number.isInteger(weeks) || weeks < 1) return 0;
  const start = new Date(end);
  start.setDate(start.getDate() - (weeks * 7 - 1));
  const first = daySort(formatDate(start)),
    last = daySort(today);
  return (tasks || []).filter(t => !t.deleted && !t.cancelled && parseDate(t.day) && daySort(t.day) >= first && daySort(t.day) <= last).reduce((sum, t) => sum + Math.max(0, taskHours(t)), 0) / weeks;
}
function mergeChangelog() {
  const unique = new Map();
  for (var _len = arguments.length, lists = new Array(_len), _key = 0; _key < _len; _key++) {
    lists[_key] = arguments[_key];
  }
  for (const entry of lists.flat()) {
    if (entry && typeof entry.text === "string") unique.set(String(entry.ts) + ":" + entry.text, entry);
  }
  return Array.from(unique.values()).sort((a, b) => (Number(b.ts) || 0) - (Number(a.ts) || 0)).slice(0, 200);
}
function createSaveQueue(save, onResult, onError) {
  let tail = Promise.resolve(),
    version = 0,
    pending = false;
  return {
    get pending() {
      return pending;
    },
    enqueue(payload) {
      const current = ++version;
      pending = true;
      tail = tail.catch(() => {}).then(() => save(payload)).then(result => {
        if (current === version) {
          pending = false;
          onResult(result);
        }
      }, error => {
        if (current === version) {
          pending = false;
          onError(error);
        }
      });
      return tail;
    }
  };
}
let csrfToken = "";
function setCsrfToken(token) {
  csrfToken = token || "";
}
function csrfHeaders(headers) {
  const h = {
    ...(headers || {})
  };
  if (csrfToken) h["X-CSRF-Token"] = csrfToken;
  return h;
}
async function csrfFetch(url, options) {
  const opts = {
    ...(options || {})
  };
  const method = (opts.method || "GET").toUpperCase();
  const isWrite = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  if (isWrite) opts.headers = csrfHeaders(opts.headers);
  let response = await fetch(url, opts);
  if (!isWrite || response.status !== 403) return response;
  let problem = {};
  try {
    problem = await response.clone().json();
  } catch (e) {}
  if (problem.error !== "Invalid CSRF token") return response;
  const sessionResponse = await fetch(SERVER_URL + "/api/auth/me", {
    credentials: "include",
    cache: "no-store"
  });
  if (!sessionResponse.ok) return response;
  const session = await sessionResponse.json();
  if (!session.csrfToken) return response;
  setCsrfToken(session.csrfToken);
  opts.headers = csrfHeaders(opts.headers);
  response = await fetch(url, opts);
  return response;
}
async function cloudLoad() {
  const res = await fetch(SERVER_URL + "/api/data", {
    credentials: "include"
  });
  if (!res.ok) throw new Error("Server error: " + res.status);
  return normalizeLoadedData(await res.json());
}
async function cloudSave(data, clientId) {
  const safeData = sanitizeClientData(data);
  const headers = {
    "Content-Type": "application/json"
  };
  if (clientId) headers["x-client-id"] = clientId;
  const res = await csrfFetch(SERVER_URL + "/api/data", {
    method: "PUT",
    headers,
    credentials: "include",
    body: JSON.stringify(safeData)
  });
  if (!res.ok) {
    const problem = await res.json().catch(() => ({}));
    throw new Error(problem.error || "Не удалось сохранить изменения (" + res.status + ")");
  }
  const result = await res.json();
  return normalizeLoadedData(result.data || result);
}
const INCR_TYPES = {
  project: "project",
  series: "series",
  task: "task",
  person: "person",
  role: "role",
  achievement: "achievement"
};
async function incrSave(type, item) {}
async function incrDelete(type, id) {}
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
  return lines.slice(1).map((line, idx) => {
    const cols = [];
    let cur = "",
      inQ = false;
    for (const ch of line) {
      if (ch === '"') inQ = !inQ;else if (ch === ',' && !inQ) {
        cols.push(cur.trim());
        cur = "";
      } else cur += ch;
    }
    cols.push(cur.trim());
    const obj = {
      _id: idx
    };
    headers.forEach((h, i) => {
      obj[h] = (cols[i] || "").replace(/^"|"$/g, "").trim();
    });
    return obj;
  }).filter(r => r["проект"] && r["серия"] && r["кто"]);
}
function nsStatus(s) {
  if (!s) return "";
  const l = s.trim().toLowerCase();
  return l === "цвет / звук" ? "цвет/звук" : l;
}
function makeDemoData() {
  const raw = parseCSV(DEMO_CSV);
  const tasks = raw.map((t, i) => {
    const projId = NAME_TO_ID[t["проект"]] || t["проект"];
    const serName = t["серия"];
    const ser = DEMO_SERIES.find(s => s.projectId === projId && s.name === serName);
    return {
      id: i + 1,
      project: projId,
      series: serName,
      seriesId: ser ? ser.id : null,
      status: nsStatus(t["статус"]),
      person: t["кто"],
      day: t["день"],
      from: parseInt(t["с"]) ?? 10,
      to: parseInt(t["до"]) ?? 19,
      note: t["заметка / факт"] || "",
      unplanned: false,
      shifts_tail: false,
      autogenerated: false
    };
  });
  return {
    roles: DEMO_ROLES,
    people: DEMO_PEOPLE,
    projects: DEMO_PROJECTS,
    series: DEMO_SERIES,
    tasks,
    stages: DEFAULT_STAGES,
    holidays: DEFAULT_HOLIDAYS
  };
}
function serializeExportData(data) {
  return JSON.stringify(sanitizeClientData(data), null, 2);
}
function exportJSON(data) {
  const blob = new Blob([serializeExportData(data)], {
    type: "application/json"
  });
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = "tracker_backup_" + formatDate(new Date()) + ".json";
  a.click();
  URL.revokeObjectURL(url);
}
function taskHours(t) {
  return Math.max(0, (Number(t === null || t === void 0 ? void 0 : t.to) || 0) - (Number(t === null || t === void 0 ? void 0 : t.from) || 0));
}
function shiftFactFromHours(hours) {
  const h = Number(hours) || 0;
  if (h > 12) return Number((h / 12).toFixed(2));
  if (h >= 6) return 1;
  if (h >= 3) return 0.5;
  if (h >= 1) return 0.2;
  return 0;
}
function xlsEscape(v) {
  return String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function xlsFilePart(v) {
  return String(v || "").replace(/[^0-9A-Za-zА-Яа-я._-]+/g, "_").replace(/^_+|_+$/g, "") || "all";
}
function downloadAnalyticsXls(tasks, data, stageMap) {
  let filters = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  const rows = (tasks || []).filter(t => !t.deleted && !t.cancelled).slice().sort((a, b) => daySort(a.day).localeCompare(daySort(b.day)) || String(a.person || "").localeCompare(String(b.person || ""), "ru") || String(projName(data.projects || [], a.project)).localeCompare(String(projName(data.projects || [], b.project)), "ru") || String(a.series || "").localeCompare(String(b.series || ""), "ru"));
  if (!rows.length) {
    alert("Нет данных для выгрузки");
    return;
  }
  const thStyle = "background:#1f4e78;color:#ffffff;font-weight:700;border:1px solid #9e9e9e;padding:6px;";
  const tdStyle = "border:1px solid #b7b7b7;padding:5px;mso-number-format:'\\@';";
  const headers = ["Дата", "ФИО", "Вид работ", "Проект", "Выпуск", "Задача факт (комментарий)", "Смена факт"];
  const htmlRows = rows.map(t => {
    const hours = taskHours(t);
    const fact = shiftFactFromHours(hours);
    const bg = fact > 1 ? "#f4cccc" : fact < 1 ? "#fff2cc" : "#ffffff";
    const proj = (data.projects || []).find(p => p.id === t.project);
    const stage = stageMap === null || stageMap === void 0 ? void 0 : stageMap[t.status];
    const cells = [t.day || "", t.person || "", (stage === null || stage === void 0 ? void 0 : stage.label) || t.status || "", (proj === null || proj === void 0 ? void 0 : proj.name) || t.project || "", t.series || "", t.note || "", fact];
    const tds = cells.map((c, i) => '<td style="' + tdStyle + (i === 6 ? "mso-number-format:'0.00';" : "") + '">' + xlsEscape(c) + '</td>').join("");
    return '<tr style="background:' + bg + '">' + tds + '</tr>';
  }).join("\n");
  const head = headers.map(h => '<th style="' + thStyle + '">' + xlsEscape(h) + '</th>').join("");
  const html = '<!doctype html><html><head><meta charset="utf-8"><style>table{border-collapse:collapse;font-family:Arial,sans-serif;font-size:11pt;} td,th{vertical-align:top;} .note{color:#666;font-size:10pt;}</style></head><body><table><thead><tr>' + head + '</tr></thead><tbody>' + htmlRows + '</tbody></table><br><div class="note">Желтый: меньше 1 смены. Красный: больше 1 смены. 1 смена = 6-12 ч; 0.5 = 3-6 ч; 0.2 = 1-3 ч; 0 = до 1 ч.</div></body></html>';
  const blob = new Blob(["\ufeff" + html], {
    type: "application/vnd.ms-excel;charset=utf-8"
  });
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  const from = xlsFilePart(filters.from || "all");
  const to = xlsFilePart(filters.to || "all");
  const project = xlsFilePart(filters.projectName || "all_projects");
  a.href = url;
  a.download = "tracker_analytics_" + project + "_" + from + "_" + to + ".xls";
  a.click();
  URL.revokeObjectURL(url);
}
function importJSON(onLoad) {
  const inp = document.createElement("input");
  inp.type = "file";
  inp.accept = ".json,application/json";
  inp.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.projects) || !Array.isArray(parsed.tasks)) {
          alert("Файл не похож на бэкап ПОСТ ТРЕКЕРА — ожидаются массивы projects и tasks");
          return;
        }
        onLoad(parsed);
      } catch {
        alert("Ошибка чтения файла — невалидный JSON");
      }
    };
    reader.onerror = () => alert("Ошибка чтения файла");
    reader.readAsText(file);
  };
  inp.click();
}
function genId(arr) {
  const nums = (arr || []).map(x => Number(x.id)).filter(Number.isFinite);
  return nums.length ? Math.max(...nums) + 1 : 1;
}
function genTaskId(arr) {
  let id;
  do {
    id = Date.now() * 1000 + Math.floor(Math.random() * 1000);
  } while ((arr || []).some(x => String(x.id) === String(id)));
  return id;
}
function colorToBg(hex) {
  if (!hex || hex.length < 7) return "rgba(100,116,139,0.12)";
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},0.12)`;
}
function hexToRgba(hex) {
  let alpha = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.12;
  if (!hex || typeof hex !== "string" || hex.length < 7) return `rgba(100,116,139,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);
  if ([r, g, b].some(Number.isNaN)) return `rgba(100,116,139,${alpha})`;
  return `rgba(${r},${g},${b},${alpha})`;
}
function stageBg(hex) {
  return (hex || "#64748b") + "33";
}
function stageBorder(hex) {
  return (hex || "#64748b") + "66";
}
const PROJECT_SHAPES = [{
  id: "circle",
  label: "\u041a\u0440\u0443\u0433"
}, {
  id: "square",
  label: "\u041a\u0432\u0430\u0434\u0440\u0430\u0442"
}, {
  id: "diamond",
  label: "\u0420\u043e\u043c\u0431"
}, {
  id: "triangle",
  label: "\u0422\u0440\u0435\u0443\u0433\u043e\u043b\u044c\u043d\u0438\u043a"
}, {
  id: "pill",
  label: "\u041f\u043b\u0430\u0448\u043a\u0430"
}];
const PROJECT_PATTERNS = [{
  id: "solid",
  label: "\u0421\u043f\u043b\u043e\u0448\u043d\u043e\u0439"
}, {
  id: "stripe",
  label: "\u0414\u0438\u0430\u0433\u043e\u043d\u0430\u043b\u044c"
}, {
  id: "cross",
  label: "\u041a\u043b\u0435\u0442\u043a\u0430"
}, {
  id: "dots",
  label: "\u0422\u043e\u0447\u043a\u0438"
}, {
  id: "ring",
  label: "\u041a\u043e\u043b\u044c\u0446\u043e"
}];
const PROJECT_VISUAL_TEXT = {
  color: "\u0426\u0432\u0435\u0442",
  shape: "\u0424\u043e\u0440\u043c\u0430",
  pattern: "\u0428\u0442\u0440\u0438\u0445\u043e\u0432\u043a\u0430",
  preview: "\u0412\u0438\u0434"
};
function projectVisual(project) {
  var _project$dossier3;
  const visual = (project === null || project === void 0 || (_project$dossier3 = project.dossier) === null || _project$dossier3 === void 0 ? void 0 : _project$dossier3.visual) || {};
  return {
    shape: visual.shape || "circle",
    pattern: visual.pattern || "solid"
  };
}
function projectPatternStyle(color, pattern) {
  const base = color || "#64748b";
  const soft = colorToBg(base);
  if (pattern === "stripe") return {
    backgroundColor: soft,
    backgroundImage: `repeating-linear-gradient(45deg, ${base} 0 3px, transparent 3px 6px)`
  };
  if (pattern === "cross") return {
    backgroundColor: soft,
    backgroundImage: `repeating-linear-gradient(45deg, ${base} 0 2px, transparent 2px 6px), repeating-linear-gradient(-45deg, ${base} 0 2px, transparent 2px 6px)`
  };
  if (pattern === "dots") return {
    backgroundColor: soft,
    backgroundImage: `radial-gradient(circle, ${base} 0 1.6px, transparent 1.8px)`,
    backgroundSize: "6px 6px"
  };
  if (pattern === "ring") return {
    backgroundColor: "transparent",
    border: `2px solid ${base}`
  };
  return {
    backgroundColor: base
  };
}
function projectMarkStyle(project) {
  let size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 8;
  const v = projectVisual(project);
  const color = (project === null || project === void 0 ? void 0 : project.color) || "#64748b";
  const isPill = v.shape === "pill";
  const style = {
    display: "inline-block",
    width: isPill ? Math.round(size * 1.7) : size,
    height: size,
    flexShrink: 0,
    boxSizing: "border-box",
    ...projectPatternStyle(color, v.pattern)
  };
  if (v.shape === "circle" || v.shape === "pill") style.borderRadius = 999;else if (v.shape === "square") style.borderRadius = Math.max(2, Math.round(size * 0.18));else if (v.shape === "diamond") {
    style.borderRadius = Math.max(1, Math.round(size * 0.12));
    style.transform = "rotate(45deg)";
  } else if (v.shape === "triangle") {
    style.clipPath = "polygon(50% 0, 100% 100%, 0 100%)";
    style.borderRadius = 0;
  }
  return style;
}
function ProjectMark(_ref7) {
  let project = _ref7.project,
    _ref7$size = _ref7.size,
    size = _ref7$size === void 0 ? 8 : _ref7$size,
    style = _ref7.style,
    title = _ref7.title;
  return React.createElement("span", {
    title: title || (project === null || project === void 0 ? void 0 : project.name) || "",
    style: {
      ...projectMarkStyle(project, size),
      ...style
    }
  });
}
function ProjectVisualPicker(_ref8) {
  let project = _ref8.project,
    onColor = _ref8.onColor,
    onVisual = _ref8.onVisual;
  const visual = projectVisual(project);
  const color = (project === null || project === void 0 ? void 0 : project.color) || "#3b82f6";
  const setVisual = ch => onVisual && onVisual({
    ...visual,
    ...ch
  });
  return React.createElement("div", {
    style: {
      display: "grid",
      gap: 10
    }
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#64748b",
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 5
    }
  }, PROJECT_VISUAL_TEXT.color), React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      flexWrap: "wrap",
      alignItems: "center"
    }
  }, PALETTE.map(c => React.createElement("button", {
    key: c,
    type: "button",
    onClick: () => onColor && onColor(c),
    title: c,
    style: {
      width: 24,
      height: 24,
      borderRadius: 5,
      background: c,
      cursor: "pointer",
      border: color === c ? "2px solid #fff" : "2px solid transparent",
      boxShadow: color === c ? `0 0 8px ${c}` : "none"
    }
  })), React.createElement("input", {
    type: "color",
    value: color,
    onChange: e => onColor && onColor(e.target.value),
    style: {
      width: 28,
      height: 24,
      border: "1px solid #334155",
      background: "#0f172a",
      cursor: "pointer",
      padding: 1,
      borderRadius: 5
    }
  }))), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#64748b",
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 5
    }
  }, PROJECT_VISUAL_TEXT.shape), React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      flexWrap: "wrap"
    }
  }, PROJECT_SHAPES.map(sh => React.createElement("button", {
    key: sh.id,
    type: "button",
    onClick: () => setVisual({
      shape: sh.id
    }),
    title: sh.label,
    style: {
      width: 34,
      height: 28,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      borderRadius: 10,
      background: visual.shape === sh.id ? "rgba(59,130,246,0.18)" : "#0f172a",
      border: `1px solid ${visual.shape === sh.id ? "#3b82f6" : "#334155"}`
    }
  }, React.createElement(ProjectMark, {
    project: {
      ...project,
      dossier: {
        ...((project === null || project === void 0 ? void 0 : project.dossier) || {}),
        visual: {
          ...visual,
          shape: sh.id
        }
      }
    },
    size: 12
  }))))), React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#64748b",
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 5
    }
  }, PROJECT_VISUAL_TEXT.pattern), React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      flexWrap: "wrap"
    }
  }, PROJECT_PATTERNS.map(pt => React.createElement("button", {
    key: pt.id,
    type: "button",
    onClick: () => setVisual({
      pattern: pt.id
    }),
    title: pt.label,
    style: {
      width: 34,
      height: 28,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      borderRadius: 10,
      background: visual.pattern === pt.id ? "rgba(59,130,246,0.18)" : "#0f172a",
      border: `1px solid ${visual.pattern === pt.id ? "#3b82f6" : "#334155"}`
    }
  }, React.createElement(ProjectMark, {
    project: {
      ...project,
      dossier: {
        ...((project === null || project === void 0 ? void 0 : project.dossier) || {}),
        visual: {
          ...visual,
          pattern: pt.id
        }
      }
    },
    size: 12
  })))))));
}
function isNonWorkday(dateStr, holidays) {
  const d = parseDate(dateStr);
  if (!d) return false;
  const dow = d.getDay();
  if (dow === 0 || dow === 6) return true;
  return (holidays || []).includes(dateStr);
}
function parseDate(str) {
  if (!str || typeof str !== "string") return null;
  const m = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) return null;
  const date = new Date(+m[3], +m[2] - 1, +m[1]);
  return date.getFullYear() === +m[3] && date.getMonth() === +m[2] - 1 && date.getDate() === +m[1] ? date : null;
}
function formatDate(d) {
  if (!d) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
}
function toInput(dmy) {
  if (!dmy) return "";
  const m = dmy.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : "";
}
function fromInput(ymd) {
  if (!ymd) return "";
  const _ymd$split = ymd.split("-"),
    _ymd$split2 = _slicedToArray(_ymd$split, 3),
    y = _ymd$split2[0],
    mo = _ymd$split2[1],
    d = _ymd$split2[2];
  return `${d}.${mo}.${y}`;
}
function normalizeBirthday(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const m = raw.match(/^(\d{1,2})[.\-/](\d{1,2})$/);
  if (!m) return null;
  const day = +m[1],
    month = +m[2];
  const test = new Date(2000, month - 1, day);
  if (test.getMonth() !== month - 1 || test.getDate() !== day) return null;
  return `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}`;
}
function birthdayDateForYear(birthday, year) {
  const b = normalizeBirthday(birthday);
  if (!b) return "";
  const _b$split = b.split("."),
    _b$split2 = _slicedToArray(_b$split, 2),
    d = _b$split2[0],
    m = _b$split2[1];
  return `${d}.${m}.${year}`;
}
function birthdayNextDate(birthday) {
  let fromDate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Date();
  const b = normalizeBirthday(birthday);
  if (!b) return null;
  const from = new Date(fromDate);
  from.setHours(0, 0, 0, 0);
  const _b$split$map = b.split(".").map(Number),
    _b$split$map2 = _slicedToArray(_b$split$map, 2),
    d = _b$split$map2[0],
    m = _b$split$map2[1];
  let next = new Date(from.getFullYear(), m - 1, d);
  if (next < from) next = new Date(from.getFullYear() + 1, m - 1, d);
  return next;
}
function birthdayDiffDays(birthday) {
  let fromDate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Date();
  const next = birthdayNextDate(birthday, fromDate);
  if (!next) return null;
  const from = new Date(fromDate);
  from.setHours(0, 0, 0, 0);
  return Math.round((next - from) / 86400000);
}
const ABSENCE_TYPES = [{
  id: "dayoff",
  label: "Выходной",
  short: "Вых",
  color: "#fdba74"
}, {
  id: "vacation",
  label: "Отпуск",
  short: "Отп",
  color: "#38bdf8"
}, {
  id: "sick",
  label: "Болезнь",
  short: "Бол",
  color: "#f87171"
}];
function absenceTypeInfo(type) {
  return ABSENCE_TYPES.find(a => a.id === type) || ABSENCE_TYPES[0];
}
function normalizeAbsence(a) {
  const start = (a === null || a === void 0 ? void 0 : a.startDay) || (a === null || a === void 0 ? void 0 : a.day) || formatDate(new Date());
  return {
    id: String((a === null || a === void 0 ? void 0 : a.id) || "abs_" + Date.now()),
    personId: String((a === null || a === void 0 ? void 0 : a.personId) || ""),
    personName: String((a === null || a === void 0 ? void 0 : a.personName) || ""),
    type: (a === null || a === void 0 ? void 0 : a.type) || "dayoff",
    startDay: start,
    endDay: (a === null || a === void 0 ? void 0 : a.endDay) || start,
    note: String((a === null || a === void 0 ? void 0 : a.note) || ""),
    deleted: (a === null || a === void 0 ? void 0 : a.deleted) === true,
    updatedAt: (a === null || a === void 0 ? void 0 : a.updatedAt) || "",
    _updatedAt: (a === null || a === void 0 ? void 0 : a._updatedAt) || 0
  };
}
function absencePersonMatches(absence, person) {
  if (!absence || !person) return false;
  const vals = [person.id, person.name, person.login, person.email].filter(Boolean).map(v => String(v).trim().toLowerCase());
  const aVals = [absence.personId, absence.personName].filter(Boolean).map(v => String(v).trim().toLowerCase());
  return aVals.some(v => vals.includes(v));
}
function absencesForPersonDay(absences, people, personName, day) {
  const person = (people || []).find(p => p.name === personName) || {
    name: personName
  };
  const dk = daySort(day);
  return (absences || []).filter(a => {
    if (a.deleted) return false;
    if (!absencePersonMatches(a, person)) return false;
    const from = daySort(a.startDay || a.day);
    const to = daySort(a.endDay || a.startDay || a.day);
    return dk >= from && dk <= to;
  });
}
function birthdayPeopleOnDate(people, dateStr) {
  const d = parseDate(dateStr);
  if (!d) return [];
  const key = `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
  return (people || []).filter(p => p.active !== false && !p.deleted && normalizeBirthday(p.birthday) === key);
}
function upcomingBirthdays(people) {
  let fromDate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Date();
  let days = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 7;
  return (people || []).filter(p => p.active !== false && !p.deleted && normalizeBirthday(p.birthday)).map(p => {
    const next = birthdayNextDate(p.birthday, fromDate);
    const diff = birthdayDiffDays(p.birthday, fromDate);
    return {
      person: p,
      date: formatDate(next),
      diff
    };
  }).filter(x => x.diff >= 0 && x.diff <= days).sort((a, b) => a.diff - b.diff || a.person.name.localeCompare(b.person.name));
}
function birthdayWhenText(diff) {
  if (diff === 0) return "сегодня";
  if (diff === 1) return "завтра";
  return `через ${diff} дн.`;
}
function dayLabel(str) {
  const d = parseDate(str);
  if (!d) return str;
  return `${WDAYS[d.getDay()]} ${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function weekKey(str) {
  const d = parseDate(str);
  if (!d) return str;
  const day = d.getDay() || 7;
  const mon = new Date(d);
  mon.setDate(d.getDate() - day + 1);
  return mon.toISOString().slice(0, 10);
}
function weekLabel(str) {
  const d = parseDate(str);
  if (!d) return str;
  const day = d.getDay() || 7;
  const mon = new Date(d);
  mon.setDate(d.getDate() - day + 1);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const fmt = dt => `${String(dt.getDate()).padStart(2, "0")}.${String(dt.getMonth() + 1).padStart(2, "0")}`;
  return `${fmt(mon)} – ${fmt(sun)}`;
}
function monthKey(str) {
  const d = parseDate(str);
  if (!d) return str;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function addDays(str, n) {
  const d = parseDate(str);
  if (!d) return str;
  d.setDate(d.getDate() + n);
  return formatDate(d);
}
const OLD_TASK_EDIT_LIMIT_DAYS = 14;
function isDayOlderThanLimit(day) {
  let limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : OLD_TASK_EDIT_LIMIT_DAYS;
  const d = parseDate(day);
  if (!d) return false;
  d.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return (now - d) / 86400000 > limit;
}
function addWorkdays(str, n, holidays) {
  const h = new Set(holidays || []);
  let d = parseDate(str);
  if (!d) return str;
  let added = 0;
  while (added < n) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6 && !h.has(formatDate(d))) added++;
  }
  return formatDate(d);
}
function generateAirDates(proj) {
  if (proj.air_mode === "custom") return proj.air_dates || [];
  if (proj.air_mode !== "weekly") return [];
  const start = parseDate(proj.edit_start);
  const end = parseDate(proj.otk);
  if (!start || !end) return [];
  const jsDay = (proj.air_weekday ?? 1) % 7;
  const d = new Date(start);
  while (d.getDay() !== jsDay) d.setDate(d.getDate() + 1);
  const dates = [];
  while (d <= end) {
    dates.push(formatDate(d));
    d.setDate(d.getDate() + 7);
  }
  return dates;
}
function generateSeriesAirDates(series) {
  if (!series) return [];
  if (series.airDate) return [series.airDate];
  if (series.airMode !== "weekly") return [];
  if (!series.editStart || !series.otkDate) return [];
  const jsDay = (series.airDay ?? 1) % 7;
  const start = parseDate(series.editStart);
  const end = parseDate(series.otkDate);
  if (!start || !end) return [];
  const d = new Date(start);
  while (d.getDay() !== jsDay) d.setDate(d.getDate() + 1);
  const dates = [];
  while (d <= end) {
    dates.push(formatDate(d));
    d.setDate(d.getDate() + 7);
  }
  return dates;
}
function filterPeopleByStatus(people, status, stages) {
  const stage = (stages || []).find(s => s.id === status);
  const roles = (stage === null || stage === void 0 ? void 0 : stage.rolesRequired) || [];
  if (!roles.length) return people.filter(p => p.active !== false);
  return people.filter(p => p.active !== false && (p.roles || []).some(r => roles.includes(r)));
}
function getConflicts(tasks, people, stages, projects, personAbsences) {
  tasks = (tasks || []).filter(t => !t.deleted && !t.cancelled);
  const ids = new Set();
  const details = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDate(today);
  const in7 = new Date(today);
  in7.setDate(today.getDate() + 7);
  const in7Str = formatDate(in7);
  const byPD = {};
  tasks.filter(t => {
    var _find;
    return t.person && !((_find = (stages || []).find(s => s.id === t.status)) !== null && _find !== void 0 && _find.noImpact);
  }).forEach(t => {
    const k = t.person + "||" + t.day;
    if (!byPD[k]) byPD[k] = [];
    byPD[k].push(t);
  });
  Object.values(byPD).forEach(group => {
    const personObj = (people || []).find(p => {
      var _group$;
      return p.name === ((_group$ = group[0]) === null || _group$ === void 0 ? void 0 : _group$.person);
    });
    if (personObj !== null && personObj !== void 0 && personObj.allowParallel) return;
    for (let i = 0; i < group.length; i++) for (let j = i + 1; j < group.length; j++) {
      const a = group[i],
        b = group[j];
      const af = a.from || 0,
        at = a.to || 0,
        bf = b.from || 0,
        bt = b.to || 0;
      if (af < bt && bf < at) {
        ids.add(a.id);
        ids.add(b.id);
        const key = [a.id, b.id].sort().join("-");
        if (!details.find(d => d.key === key)) details.push({
          type: "overlap",
          notify: true,
          key,
          person: a.person,
          dayStr: a.day,
          taskA: a,
          taskB: b,
          overlapFrom: Math.max(af, bf),
          overlapTo: Math.min(at, bt)
        });
      }
    }
  });
  tasks.forEach(t => {
    const stage = (stages || []).find(s => s.id === t.status);
    if (!t.person && stage !== null && stage !== void 0 && stage.needsExecutor && !stage.noImpact && daySort(t.day) >= daySort(todayStr) && daySort(t.day) <= daySort(in7Str)) {
      ids.add(t.id);
      details.push({
        type: "unfilled",
        notify: true,
        key: "unfilled-" + t.id,
        task: t
      });
    }
  });
  tasks.forEach(t => {
    if (t.deleted || t.cancelled) return;
    const stage = (stages || []).find(s => s.id === t.status);
    if (stage !== null && stage !== void 0 && stage.noImpact) return;
    const hours = taskHours(t);
    if (hours > 12) {
      ids.add(t.id);
      details.push({
        type: "long-shift",
        notify: false,
        key: "long-shift-" + t.id,
        task: t,
        hours
      });
    }
  });
  (tasks || []).forEach(t => {
    if (!t.person) return;
    const hits = absencesForPersonDay(personAbsences, people, t.person, t.day);
    hits.forEach(a => {
      ids.add(t.id);
      details.push({
        type: "absence",
        notify: true,
        key: "absence-" + t.id + "-" + a.id,
        task: t,
        person: t.person,
        absence: a
      });
    });
  });
  if (people && stages) {
    tasks.forEach(t => {
      if (!t.person) return;
      const stage = (stages || []).find(s => s.id === t.status);
      if (!stage || !stage.rolesRequired || !stage.rolesRequired.length) return;
      if (stage.noImpact) return;
      const person = (people || []).find(p => p.name === t.person);
      if (!person) return;
      const personRoles = person.roles || [];
      const match = stage.rolesRequired.some(r => personRoles.includes(r));
      if (!match) {
        ids.add(t.id);
        details.push({
          type: "role",
          notify: true,
          key: "role-" + t.id,
          task: t,
          person: t.person,
          stage: stage.label,
          requiredRoles: stage.rolesRequired,
          personRoles
        });
      }
    });
  }
  (projects || []).filter(p => p.status !== "\u0430\u0440\u0445\u0438\u0432" && !p.deleted).forEach(p => {
    const managers = (p.managers || []).filter(m => String((m === null || m === void 0 ? void 0 : m.uid) || (m === null || m === void 0 ? void 0 : m.name) || m || "").trim());
    if (!managers.length) details.push({
      type: "project-manager",
      notify: false,
      key: "project-manager-" + p.id,
      project: p
    });
  });
  return {
    ids,
    details
  };
}
function enrichTasks(tasks) {
  return tasks.filter(t => !t.deleted).map(t => ({
    ...t,
    _dayKey: t.day,
    _weekKey: weekKey(t.day),
    _monthKey: monthKey(t.day)
  }));
}
function projColor(projects, projId) {
  return (projects.find(p => p.id === projId) || {}).color || "#3b82f6";
}
function projName(projects, projId) {
  return (projects.find(p => p.id === projId) || {}).name || projId;
}
function projAbbr(projects, projId) {
  const p = projects.find(pr => pr.id === projId);
  return p ? p.abbr || p.name : projId;
}
function parseHash() {
  try {
    const mp = window.location.hash.match(/^#project\/(.+)$/);
    if (mp) return {
      type: "project",
      id: decodeURIComponent(mp[1])
    };
    const ms = window.location.hash.match(/^#series\/(.+)$/);
    if (ms) return {
      type: "series",
      id: decodeURIComponent(ms[1])
    };
    const m = window.location.hash.match(/^#person\/(.+)$/);
    if (m) return {
      type: "person",
      id: decodeURIComponent(m[1])
    };
    return null;
  } catch (error) {
    return null;
  }
}
function canSeeTaskNotes() {
  return window.PPT_CAN_SEE_TASK_NOTES === true;
}
function accessKey(value) {
  return String(value || "").trim().toLowerCase();
}
function sameAccessKey(a, b) {
  const ak = accessKey(a),
    bk = accessKey(b);
  return !!ak && !!bk && ak === bk;
}
function findCurrentPerson(user, data) {
  return ((data === null || data === void 0 ? void 0 : data.people) || []).find(p => sameAccessKey(p.login, user === null || user === void 0 ? void 0 : user.sam_name) || sameAccessKey(p.name, user === null || user === void 0 ? void 0 : user.display_name) || sameAccessKey(p.email, user === null || user === void 0 ? void 0 : user.email));
}
function currentUserProjectKeys(user, data) {
  const keys = new Set([user === null || user === void 0 ? void 0 : user.id, user === null || user === void 0 ? void 0 : user.userId, user === null || user === void 0 ? void 0 : user.sam_name, user === null || user === void 0 ? void 0 : user.display_name, user === null || user === void 0 ? void 0 : user.email].map(accessKey).filter(Boolean));
  const person = findCurrentPerson(user, data);
  if (person) {
    [person.id, person.name, person.login, person.email].forEach(v => {
      const k = accessKey(v);
      if (k) keys.add(k);
    });
  }
  return keys;
}
function projectAssignedToKeys(project, keys) {
  if (!project || !keys) return false;
  return (project.managers || []).some(m => keys.has(accessKey((m === null || m === void 0 ? void 0 : m.uid) || m)) || keys.has(accessKey((m === null || m === void 0 ? void 0 : m.name) || m)));
}
function currentUserManagerEntry(user, data) {
  const person = findCurrentPerson(user, data);
  return {
    uid: (person === null || person === void 0 ? void 0 : person.id) || (user === null || user === void 0 ? void 0 : user.sam_name) || (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.id) || (user === null || user === void 0 ? void 0 : user.display_name) || "",
    name: (person === null || person === void 0 ? void 0 : person.name) || (user === null || user === void 0 ? void 0 : user.display_name) || (user === null || user === void 0 ? void 0 : user.sam_name) || (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.id) || ""
  };
}
function Modal(_ref9) {
  var _ReactDOM;
  let title = _ref9.title,
    onClose = _ref9.onClose,
    wide = _ref9.wide,
    onSubmit = _ref9.onSubmit,
    children = _ref9.children,
    freeOverflow = _ref9.freeOverflow;
  useEffect(() => {
    const h = e => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
      if (e.altKey && (e.key === "Enter" || e.code === "Enter")) {
        e.preventDefault();
        onSubmit && onSubmit();
      }
    };
    document.addEventListener("keydown", h, true);
    return () => document.removeEventListener("keydown", h, true);
  }, [onClose, onSubmit]);
  const modal = React.createElement("div", {
    className: "ppt-modal-backdrop",
    onClick: e => {},
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(3,7,18,0.72)",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      zIndex: 2147483000,
      padding: "18px 16px",
      overflowY: "auto",
      overscrollBehavior: "contain",
      isolation: "isolate"
    }
  }, React.createElement("div", {
    className: "ppt-modal-panel",
    style: {
      background: "linear-gradient(180deg,rgba(30,41,59,.92),rgba(15,23,42,.94))",
      border: "1px solid rgba(148,163,184,.24)",
      borderRadius: 20,
      position: "relative",
      zIndex: 2147483001,
      width: wide ? 720 : 480,
      maxWidth: "100%",
      maxHeight: "calc(100dvh - 36px)",
      display: "flex",
      flexDirection: "column",
      overflow: freeOverflow ? "visible" : "hidden"
    }
  }, React.createElement("div", {
    style: {
      padding: "16px 20px",
      borderBottom: "1px solid rgba(148,163,184,.18)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexShrink: 0,
      background: "rgba(255,255,255,.025)"
    }
  }, React.createElement("span", {
    style: {
      fontWeight: 800,
      fontSize: 16,
      color: "#f8fafc",
      letterSpacing: .1
    }
  }, title), React.createElement("button", {
    className: "ppt-btn",
    onClick: onClose,
    style: {
      background: "rgba(15,23,42,.72)",
      border: "1px solid rgba(148,163,184,.22)",
      color: "#9aa9bd",
      fontSize: 22,
      cursor: "pointer",
      lineHeight: 1,
      padding: "3px 8px",
      borderRadius: 12
    }
  }, "x")), React.createElement("div", {
    style: {
      padding: "18px 20px",
      overflowY: freeOverflow ? "visible" : "auto",
      flex: 1
    }
  }, children)));
  if (typeof document !== "undefined" && document.body && (_ReactDOM = ReactDOM) !== null && _ReactDOM !== void 0 && _ReactDOM.createPortal) {
    return ReactDOM.createPortal(modal, document.body);
  }
  return modal;
}
function Btn(_ref0) {
  let onClick = _ref0.onClick,
    _ref0$variant = _ref0.variant,
    variant = _ref0$variant === void 0 ? "default" : _ref0$variant,
    children = _ref0.children,
    small = _ref0.small,
    style = _ref0.style,
    disabled = _ref0.disabled,
    type = _ref0.type;
  const s = {
    default: {
      background: "linear-gradient(180deg,rgba(30,58,95,.78),rgba(15,23,42,.7))",
      border: "1px solid rgba(96,165,250,.32)",
      color: "#93c5fd"
    },
    primary: {
      background: "linear-gradient(135deg,#2563eb,#3b82f6 54%,#22d3ee)",
      border: "1px solid rgba(147,197,253,.55)",
      color: "#fff",
      boxShadow: "0 10px 28px rgba(37,99,235,.22)"
    },
    danger: {
      background: "linear-gradient(180deg,rgba(239,68,68,.20),rgba(127,29,29,.12))",
      border: "1px solid rgba(248,113,113,.42)",
      color: "#fca5a5"
    },
    ghost: {
      background: "rgba(15,23,42,.38)",
      border: "1px solid rgba(148,163,184,.22)",
      color: "#a9b8cc"
    },
    success: {
      background: "linear-gradient(180deg,rgba(34,197,94,.18),rgba(20,83,45,.12))",
      border: "1px solid rgba(74,222,128,.42)",
      color: "#86efac"
    },
    warn: {
      background: "linear-gradient(180deg,rgba(249,115,22,.18),rgba(124,45,18,.12))",
      border: "1px solid rgba(251,146,60,.42)",
      color: "#fdba74"
    }
  }[variant] || {};
  return React.createElement("button", {
    className: `ppt-btn ppt-btn-${variant}`,
    type: type || "button",
    onClick: onClick,
    disabled: disabled,
    style: {
      ...s,
      padding: small ? "4px 11px" : "7px 15px",
      borderRadius: small ? 10 : 12,
      cursor: disabled ? "not-allowed" : "pointer",
      fontSize: small ? 11 : 13,
      fontWeight: 700,
      opacity: disabled ? 0.5 : 1,
      letterSpacing: .05,
      ...style
    }
  }, children);
}
function Field(_ref1) {
  let label = _ref1.label,
    children = _ref1.children,
    hint = _ref1.hint,
    row = _ref1.row;
  return React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, label && React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#8ea2bb",
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 6,
      fontWeight: 800
    }
  }, label), row ? React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center"
    }
  }, children) : children, hint && React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#475569",
      marginTop: 4
    }
  }, hint));
}
function Inp(_ref10) {
  let value = _ref10.value,
    onChange = _ref10.onChange,
    placeholder = _ref10.placeholder,
    style = _ref10.style,
    type = _ref10.type,
    min = _ref10.min,
    max = _ref10.max;
  return React.createElement("input", {
    className: "ppt-input",
    type: type || "text",
    value: value || "",
    min: min,
    max: max,
    onChange: e => onChange(e.target.value),
    placeholder: placeholder,
    style: {
      background: "rgba(8,13,26,.74)",
      border: "1px solid rgba(148,163,184,.24)",
      color: "#eef4ff",
      borderRadius: 11,
      padding: "8px 11px",
      fontSize: 14,
      width: "100%",
      ...style
    }
  });
}
function InpDate(_ref11) {
  let value = _ref11.value,
    onChange = _ref11.onChange,
    warn = _ref11.warn;
  return React.createElement("div", null, React.createElement("input", {
    className: "ppt-input",
    type: "date",
    value: toInput(value),
    onChange: e => onChange(fromInput(e.target.value)),
    style: {
      background: "rgba(8,13,26,.74)",
      border: `1px solid ${warn ? "#fb923c" : "rgba(148,163,184,.24)"}`,
      color: "#eef4ff",
      borderRadius: 11,
      padding: "8px 11px",
      fontSize: 14,
      width: "100%"
    }
  }), warn && React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#fb923c",
      marginTop: 3
    }
  }, "! \u0412\u044B\u0445\u043E\u0434\u043D\u043E\u0439 \u0438\u043B\u0438 \u043F\u0440\u0430\u0437\u0434\u043D\u0438\u043A"));
}
function Sel(_ref12) {
  let value = _ref12.value,
    onChange = _ref12.onChange,
    options = _ref12.options,
    placeholder = _ref12.placeholder,
    style = _ref12.style;
  return React.createElement("select", {
    className: "ppt-input",
    value: value || "",
    onChange: e => onChange(e.target.value),
    style: {
      background: "rgba(8,13,26,.74)",
      border: "1px solid rgba(148,163,184,.24)",
      color: value ? "#eef4ff" : "#6f8096",
      borderRadius: 11,
      padding: "8px 11px",
      fontSize: 14,
      width: "100%",
      ...style
    }
  }, placeholder && React.createElement("option", {
    value: ""
  }, placeholder), options.map(o => typeof o === "string" ? React.createElement("option", {
    key: o,
    value: o
  }, o) : React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label)));
}
function SelSearch(_ref13) {
  let value = _ref13.value,
    onChange = _ref13.onChange,
    options = _ref13.options,
    placeholder = _ref13.placeholder,
    style = _ref13.style,
    allowCustom = _ref13.allowCustom,
    autoFocus = _ref13.autoFocus;
  const _useState = useState(""),
    _useState2 = _slicedToArray(_useState, 2),
    query = _useState2[0],
    setQuery = _useState2[1];
  const _useState3 = useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    open = _useState4[0],
    setOpen = _useState4[1];
  const _useState5 = useState(-1),
    _useState6 = _slicedToArray(_useState5, 2),
    hiIdx = _useState6[0],
    setHiIdx = _useState6[1];
  const ref = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, []);
  const normalized = useMemo(() => options.map(o => typeof o === "string" ? {
    value: o,
    label: o
  } : o), [options]);
  const selected = normalized.find(o => o.value === value);
  const filtered = query ? normalized.filter(o => o.label.toLowerCase().includes(query.toLowerCase())) : normalized;
  useEffect(() => {
    setHiIdx(-1);
  }, [filtered.length, query]);
  useEffect(() => {
    function h(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  function pick(opt) {
    onChange(opt.value);
    setQuery("");
    setOpen(false);
    setHiIdx(-1);
  }
  function handleFocus() {
    setOpen(true);
    setQuery("");
  }
  function handleChange(e) {
    setQuery(e.target.value);
    setOpen(true);
    if (!e.target.value) {
      onChange("");
    }
  }
  function handleBlur() {
    if (allowCustom && query && !normalized.find(o => o.value === query || o.label === query)) {
      onChange(query);
    }
  }
  function handleKeyDown(e) {
    if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHiIdx(i => {
        const n = Math.min(i + 1, filtered.length - 1);
        setTimeout(() => {
          if (listRef.current) {
            const el = listRef.current.children[n];
            if (el) el.scrollIntoView({
              block: "nearest"
            });
          }
        }, 0);
        return n;
      });
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHiIdx(i => {
        const n = Math.max(i - 1, 0);
        setTimeout(() => {
          if (listRef.current) {
            const el = listRef.current.children[n];
            if (el) el.scrollIntoView({
              block: "nearest"
            });
          }
        }, 0);
        return n;
      });
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (hiIdx >= 0 && filtered[hiIdx]) pick(filtered[hiIdx]);else if (filtered.length > 0) pick(filtered[0]);
    }
  }
  const displayVal = open ? query : selected ? selected.label : "";
  return React.createElement("div", {
    ref: ref,
    style: {
      position: "relative",
      ...style
    }
  }, React.createElement("input", {
    ref: inputRef,
    value: displayVal,
    onFocus: handleFocus,
    onChange: handleChange,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    placeholder: selected ? "" : placeholder || "Выбрать...",
    style: {
      background: "#0f172a",
      border: "1px solid #334155",
      color: "#e2e8f0",
      borderRadius: 10,
      padding: "7px 10px",
      fontSize: 13,
      width: "100%"
    }
  }), open && filtered.length > 0 && React.createElement("div", {
    ref: listRef,
    style: {
      position: "absolute",
      top: "100%",
      left: 0,
      right: 0,
      marginTop: 2,
      background: "rgba(30,41,59,.72)",
      border: "1px solid rgba(148,163,184,.18)",
      borderRadius: 10,
      zIndex: 400,
      maxHeight: 200,
      overflowY: "auto",
      boxShadow: "0 4px 20px rgba(0,0,0,0.6)"
    }
  }, filtered.map((opt, i) => React.createElement("div", {
    key: opt.value,
    onMouseDown: () => pick(opt),
    onMouseEnter: () => setHiIdx(i),
    style: {
      padding: "6px 10px",
      cursor: "pointer",
      fontSize: 13,
      background: i === hiIdx ? "rgba(59,130,246,0.35)" : opt.value === value ? "rgba(59,130,246,0.15)" : "transparent",
      color: i === hiIdx || opt.value === value ? "#93c5fd" : "#e2e8f0"
    }
  }, opt.label))));
}
function StatusBadge(_ref14) {
  let s = _ref14.s,
    small = _ref14.small;
  const _useContext = useContext(StagesCtx),
    stageMap = _useContext.stageMap;
  const st = stageMap[s];
  if (!st) return React.createElement("span", {
    style: {
      fontSize: 10,
      color: "#475569"
    }
  }, s || "—");
  return React.createElement("span", {
    style: {
      display: "inline-block",
      background: stageBg(st.color),
      color: st.color,
      border: `1px solid ${stageBorder(st.color)}`,
      borderRadius: 4,
      padding: small ? "1px 6px" : "2px 8px",
      fontSize: small ? 10 : 11,
      fontWeight: 600,
      whiteSpace: "nowrap"
    },
    title: st.abbr ? st.label : undefined
  }, small && st.abbr ? st.abbr : st.label);
}
function TaskCard(_ref15) {
  let task = _ref15.task,
    projects = _ref15.projects,
    isConflict = _ref15.isConflict,
    onClick = _ref15.onClick,
    onHover = _ref15.onHover,
    large = _ref15.large;
  const color = projColor(projects, task.project);
  const pname = large ? projAbbr(projects, task.project) : projName(projects, task.project);
  return React.createElement("div", {
    onClick: onClick,
    onMouseEnter: onHover ? e => onHover(task, e.currentTarget.getBoundingClientRect()) : undefined,
    onMouseLeave: onHover ? () => onHover(null) : undefined,
    style: {
      position: "relative",
      borderLeft: `3px solid ${task.cancelled ? "#334155" : isConflict ? "#ef4444" : color}`,
      background: task.cancelled ? "rgba(15,23,42,0.4)" : isConflict ? "rgba(239,68,68,0.07)" : "rgba(255,255,255,0.03)",
      borderRadius: "0 6px 6px 0",
      padding: "5px 8px",
      marginBottom: 4,
      cursor: onClick ? "pointer" : "default",
      opacity: task.cancelled ? 0.4 : 1
    }
  }, task.cancelled && React.createElement("span", {
    style: {
      position: "absolute",
      top: 3,
      right: 5,
      fontSize: 10,
      opacity: 0.7
    }
  }, "\uD83D\uDEAB"), React.createElement("div", {
    style: {
      fontWeight: 700,
      color: task.cancelled ? "#334155" : isConflict ? "#f87171" : color,
      fontSize: 11,
      marginBottom: 2,
      textDecoration: task.cancelled ? "line-through" : "none"
    }
  }, isConflict && "⚡ ", task.series, task.unplanned && !task.cancelled && React.createElement("span", {
    style: {
      color: "#f97316",
      marginLeft: 4,
      fontSize: 9
    }
  }, "!\u0432\u043D\u0435\u043F\u043B\u0430\u043D"), React.createElement("span", {
    style: {
      fontWeight: 400,
      color: "#475569",
      marginLeft: 5,
      fontSize: large ? 12 : 10
    }
  }, pname)), canSeeTaskNotes() && task.note && React.createElement("div", {
    style: {
      color: "#94a3b8",
      fontSize: 10,
      lineHeight: 1.3,
      marginBottom: 3
    }
  }, task.note), React.createElement("div", {
    style: {
      display: "flex",
      gap: 4,
      alignItems: "center",
      flexWrap: "wrap"
    }
  }, React.createElement(StatusBadge, {
    s: task.status,
    small: true
  }), React.createElement("span", {
    style: {
      color: large ? "#94a3b8" : "#475569",
      fontSize: large ? 13 : 10,
      fontWeight: large ? 600 : 400
    }
  }, fmtHour(task.from), "\u2013", fmtHour(task.to))));
}
function TaskTooltip(_ref16) {
  let task = _ref16.task,
    rect = _ref16.rect,
    projects = _ref16.projects;
  const _useContext2 = useContext(StagesCtx),
    stageMap = _useContext2.stageMap;
  if (!task || !rect) return null;
  const st = stageMap[task.status];
  const color = projColor(projects, task.project);
  const pname = projName(projects, task.project);
  const W = 240;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let left = rect.right + 10;
  if (left + W > vw - 16) left = rect.left - W - 10;
  let top = rect.top;
  if (top + 180 > vh - 16) top = Math.max(8, vh - 196);
  return React.createElement("div", {
    style: {
      position: "fixed",
      left,
      top,
      zIndex: 9999,
      width: W,
      background: "#1e293b",
      border: "1px solid #475569",
      borderRadius: 12,
      padding: "10px 14px",
      pointerEvents: "none",
      boxShadow: "0 8px 24px rgba(0,0,0,0.65)"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      marginBottom: 6
    }
  }, React.createElement("div", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: color,
      flexShrink: 0
    }
  }), React.createElement("span", {
    style: {
      fontSize: 11,
      color: "#94a3b8",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, pname)), task.series && React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: "#e2e8f0",
      marginBottom: 4
    }
  }, task.series), st && React.createElement("div", {
    style: {
      marginBottom: 6
    }
  }, React.createElement("span", {
    style: {
      background: colorToBg(st.color),
      border: `1px solid ${st.color}55`,
      borderRadius: 4,
      padding: "2px 8px",
      fontSize: 11,
      color: st.color,
      fontWeight: 600
    }
  }, st.label)), task.person && React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#cbd5e1",
      marginBottom: 3
    }
  }, task.person), React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#64748b",
      marginBottom: canSeeTaskNotes() && task.note ? 4 : 0
    }
  }, fmtHour(task.from), " \u2013 ", fmtHour(task.to), " \xB7 ", fmtDur(task.from, task.to), task.unplanned && React.createElement("span", {
    style: {
      color: "#f97316",
      marginLeft: 6
    }
  }, "! \u0432\u043D\u0435\u043F\u043B\u0430\u043D")), canSeeTaskNotes() && task.note && React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#94a3b8",
      lineHeight: 1.4,
      marginTop: 4,
      borderTop: "1px solid #334155",
      paddingTop: 4
    }
  }, task.note));
}
function StageEditModal(_ref17) {
  let stage = _ref17.stage,
    roles = _ref17.roles,
    stageGroups = _ref17.stageGroups,
    onSave = _ref17.onSave,
    onClose = _ref17.onClose;
  const _useState7 = useState({
      ...stage
    }),
    _useState8 = _slicedToArray(_useState7, 2),
    form = _useState8[0],
    setForm = _useState8[1];
  function toggleRole(rid) {
    setForm(f => ({
      ...f,
      rolesRequired: f.rolesRequired.includes(rid) ? f.rolesRequired.filter(r => r !== rid) : [...f.rolesRequired, rid]
    }));
  }
  function handleSave() {
    if (!form.label.trim()) {
      alert("Введите название");
      return;
    }
    onSave(form);
  }
  return React.createElement(Modal, {
    title: `Этап: ${stage.label}`,
    onClose: onClose,
    onSubmit: handleSave
  }, React.createElement(Field, {
    label: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"
  }, React.createElement(Inp, {
    value: form.label,
    onChange: v => setForm(f => ({
      ...f,
      label: v
    })),
    placeholder: "\u041C\u043E\u043D\u0442\u0430\u0436"
  })), React.createElement(Field, {
    label: "\u0410\u0431\u0431\u0440\u0435\u0432\u0438\u0430\u0442\u0443\u0440\u0430 (\u0434\u043B\u044F \u043F\u043B\u0430\u0448\u0435\u043A)"
  }, React.createElement(Inp, {
    value: form.abbr || "",
    onChange: v => setForm(f => ({
      ...f,
      abbr: v
    })),
    placeholder: "\u041C\u043E\u043D\u0442"
  })), React.createElement(Field, {
    label: "\u0413\u0440\u0443\u043F\u043F\u0430"
  }, React.createElement("select", {
    value: form.groupId || "",
    onChange: e => setForm(f => ({
      ...f,
      groupId: e.target.value
    })),
    style: {
      background: "#0f172a",
      border: "1px solid #334155",
      color: "#e2e8f0",
      borderRadius: 10,
      padding: "7px 10px",
      fontSize: 13,
      width: "100%"
    }
  }, React.createElement("option", {
    value: ""
  }, "\u2014 \u043D\u0435 \u0437\u0430\u0434\u0430\u043D\u0430 \u2014"), stageGroups.map(g => React.createElement("option", {
    key: g.id,
    value: g.id
  }, g.label)))), React.createElement(Field, {
    label: "\u0426\u0432\u0435\u0442"
  }, React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center"
    }
  }, React.createElement("input", {
    type: "color",
    value: form.color,
    onChange: e => setForm(f => ({
      ...f,
      color: e.target.value
    })),
    style: {
      width: 48,
      height: 36,
      border: "1px solid #334155",
      borderRadius: 10,
      background: "#0f172a",
      cursor: "pointer"
    }
  }), React.createElement("div", {
    style: {
      width: 80,
      height: 28,
      borderRadius: 4,
      background: colorToBg(form.color),
      border: `1px solid ${form.color}44`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 11,
      color: form.color,
      fontWeight: 600
    }
  }, form.label || "—"))), React.createElement(Field, {
    label: "\u0420\u043E\u043B\u0438 (\u0444\u0438\u043B\u044C\u0442\u0440 \u0438\u0441\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u0435\u0439)"
  }, React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6
    }
  }, roles.map(r => React.createElement("label", {
    key: r.id,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 5,
      cursor: "pointer",
      background: form.rolesRequired.includes(r.id) ? `${r.color}22` : "#0f172a",
      border: `1px solid ${form.rolesRequired.includes(r.id) ? r.color : "#334155"}`,
      borderRadius: 10,
      padding: "4px 10px"
    }
  }, React.createElement("input", {
    type: "checkbox",
    checked: form.rolesRequired.includes(r.id),
    onChange: () => toggleRole(r.id),
    style: {
      accentColor: r.color
    }
  }), React.createElement("span", {
    style: {
      fontSize: 12,
      color: form.rolesRequired.includes(r.id) ? r.color : "#94a3b8"
    }
  }, r.label))))), React.createElement(Field, {
    label: "\u0418\u0441\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C"
  }, React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      cursor: "pointer"
    }
  }, React.createElement("input", {
    type: "checkbox",
    checked: form.needsExecutor !== false,
    onChange: e => setForm(f => ({
      ...f,
      needsExecutor: e.target.checked
    })),
    style: {
      accentColor: "#22c55e"
    }
  }), React.createElement("span", {
    style: {
      fontSize: 13
    }
  }, "\u0418\u0441\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u0435\u043D"))), React.createElement(Field, {
    label: "\u0412\u043B\u0438\u044F\u043D\u0438\u0435 \u043D\u0430 \u043D\u0430\u0433\u0440\u0443\u0437\u043A\u0443"
  }, React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      cursor: "pointer"
    }
  }, React.createElement("input", {
    type: "checkbox",
    checked: form.noImpact === true,
    onChange: e => setForm(f => ({
      ...f,
      noImpact: e.target.checked
    })),
    style: {
      accentColor: "#f97316"
    }
  }), React.createElement("span", {
    style: {
      fontSize: 13
    }
  }, "\u0411\u0435\u0437 \u0432\u043B\u0438\u044F\u043D\u0438\u044F \u2014 \u043D\u0435 \u0441\u0447\u0438\u0442\u0430\u0442\u044C \u0432 \u0441\u043C\u0435\u043D\u0430\u0445 \u0438 \u043A\u043E\u043D\u0444\u043B\u0438\u043A\u0442\u0430\u0445")), form.noImpact && React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#f97316",
      marginTop: 4,
      opacity: 0.8
    }
  }, "\u042D\u0442\u0430\u043F \u043D\u0443\u0436\u0435\u043D \u0434\u043B\u044F \u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F, \u043D\u043E \u043D\u0435 \u0443\u0447\u0438\u0442\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0432 \u0430\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0435 \u0438 \u043D\u0435 \u0441\u043E\u0437\u0434\u0430\u0451\u0442 \u043A\u043E\u043D\u0444\u043B\u0438\u043A\u0442\u043E\u0432")), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      justifyContent: "flex-end",
      marginTop: 16
    }
  }, React.createElement(Btn, {
    variant: "ghost",
    onClick: onClose
  }, "\u041E\u0442\u043C\u0435\u043D\u0430"), React.createElement(Btn, {
    variant: "primary",
    onClick: handleSave
  }, "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C")));
}
function DirectoryView(_ref18) {
  let data = _ref18.data,
    writeUpdate = _ref18.onUpdate,
    writeBatchUpdate = _ref18.onBatchUpdate,
    onLog = _ref18.onLog,
    user = _ref18.user,
    onUserUpdate = _ref18.onUserUpdate;
  const _useState9 = useState("roles"),
    _useState0 = _slicedToArray(_useState9, 2),
    tab = _useState0[0],
    setTab = _useState0[1];
  const _useState1 = useState(null),
    _useState10 = _slicedToArray(_useState1, 2),
    personModal = _useState10[0],
    setPersonModal = _useState10[1];
  const _useState11 = useState(null),
    _useState12 = _slicedToArray(_useState11, 2),
    stageModal = _useState12[0],
    setStageModal = _useState12[1];
  const _useState13 = useState({
      id: "",
      label: "",
      color: "#6366f1"
    }),
    _useState14 = _slicedToArray(_useState13, 2),
    roleForm = _useState14[0],
    setRoleForm = _useState14[1];
  const _useState15 = useState(null),
    _useState16 = _slicedToArray(_useState15, 2),
    editRoleId = _useState16[0],
    setEditRoleId = _useState16[1];
  const _useState17 = useState(""),
    _useState18 = _slicedToArray(_useState17, 2),
    search = _useState18[0],
    setSearch = _useState18[1];
  const _useState19 = useState(null),
    _useState20 = _slicedToArray(_useState19, 2),
    dragOverStage = _useState20[0],
    setDragOverStage = _useState20[1];
  const stageDragRef = useRef(null);
  const _useState21 = useState(""),
    _useState22 = _slicedToArray(_useState21, 2),
    newHoliday = _useState22[0],
    setNewHoliday = _useState22[1];
  const _useState23 = useState(null),
    _useState24 = _slicedToArray(_useState23, 2),
    tmplModal = _useState24[0],
    setTmplModal = _useState24[1];
  const _useState25 = useState(null),
    _useState26 = _slicedToArray(_useState25, 2),
    achievementModal = _useState26[0],
    setAchievementModal = _useState26[1];
  const stages = data.stages && data.stages.length ? [...data.stages].sort((a, b) => (a.order || 0) - (b.order || 0)) : DEFAULT_STAGES;
  const stageGroups = data.stageGroups && data.stageGroups.length ? [...data.stageGroups].sort((a, b) => (a.order || 0) - (b.order || 0)) : DEFAULT_STAGE_GROUPS;
  const holidays = data.holidays || DEFAULT_HOLIDAYS;
  const roles = data.roles || DEMO_ROLES;
  const achievements = achievementList(data);
  const canEditAchievements = (user === null || user === void 0 ? void 0 : user.role) === "admin";
  const canManagePeople = (user === null || user === void 0 ? void 0 : user.role) === "admin" || (user === null || user === void 0 ? void 0 : user.role) === "lead";
  const onUpdate = function () {
    if (canManagePeople) writeUpdate(...arguments);
  };
  const onBatchUpdate = function () {
    if (canManagePeople) writeBatchUpdate(...arguments);
  };
  function saveRole(role) {
    let newRoles = editRoleId ? roles.map(r => r.id === editRoleId ? {
      ...r,
      ...role
    } : r) : [...roles, role];
    onUpdate("roles", newRoles);
    setEditRoleId(null);
    setRoleForm({
      id: "",
      label: "",
      color: "#6366f1"
    });
  }
  function deleteRole(id) {
    if (!canManagePeople) return;
    if (!window.confirm(`Удалить роль "${id}"?`)) return;
    const newRoles = roles.filter(r => r.id !== id);
    const newStages = stages.map(s => ({
      ...s,
      rolesRequired: (s.rolesRequired || []).filter(r => r !== id)
    }));
    onBatchUpdate({
      roles: newRoles,
      stages: newStages,
      people: (data.people || []).map(p => ({
        ...p,
        roles: (p.roles || []).filter(r => r !== id)
      }))
    });
    incrDelete("role", id);
  }
  function savePerson(person) {
    if (!canManagePeople) return;
    let people = [...data.people];
    const exists = person.id && people.find(p => p.id === person.id);
    const final = exists ? person : {
      ...person,
      id: "p" + Date.now()
    };
    if (exists) people = people.map(p => p.id === final.id ? final : p);else people.push(final);
    if (exists && exists.name !== final.name) {
      onBatchUpdate({
        people,
        tasks: (data.tasks || []).map(t => t.person === exists.name ? {
          ...t,
          person: final.name,
          _updatedAt: Date.now()
        } : t),
        personAbsences: (data.personAbsences || []).map(a => a.personId === final.id || a.personName === exists.name ? {
          ...a,
          personName: final.name,
          _updatedAt: Date.now()
        } : a)
      });
    } else onUpdate("people", people);
    setPersonModal(null);
    incrSave("person", final);
  }
  function deletePerson(id) {
    if (!window.confirm("Удалить сотрудника?")) return;
    onUpdate("people", data.people.map(p => p.id === id ? {
      ...p,
      deleted: true,
      _updatedAt: Date.now()
    } : p));
    setPersonModal(null);
    incrDelete("person", id);
  }
  function deleteStage(id) {
    if (!canManagePeople) return;
    if ((data.tasks || []).some(t => t.status === id)) {
      alert("Этап используется в задачах. Сначала перенесите задачи на другой этап.");
      return;
    }
    if (!window.confirm("Удалить этап?")) return;
    onUpdate("stages", stages.filter(s => s.id !== id).map((s, i) => ({
      ...s,
      order: i + 1
    })));
  }
  function saveStage(stage) {
    const arr = stages.map(s => s.id === stage.id ? stage : s);
    onUpdate("stages", arr);
    setStageModal(null);
  }
  function addStage() {
    const id = "stage_" + Date.now();
    const newStage = {
      id,
      label: "Новый этап",
      color: "#64748b",
      order: stages.length + 1,
      groupId: "",
      rolesRequired: [],
      needsExecutor: true
    };
    onUpdate("stages", [...stages, newStage]);
    setStageModal(newStage);
  }
  function saveGroup(g) {
    const arr = stageGroups.find(x => x.id === g.id) ? stageGroups.map(x => x.id === g.id ? g : x) : [...stageGroups, g];
    onUpdate("stageGroups", arr);
  }
  function deleteGroup(id) {
    if (!canManagePeople) return;
    if (!window.confirm("Удалить группу?")) return;
    onBatchUpdate({
      stageGroups: stageGroups.filter(g => g.id !== id).map((g, i) => ({
        ...g,
        order: i + 1
      })),
      stages: stages.map(s => s.groupId === id ? {
        ...s,
        groupId: ""
      } : s)
    });
  }
  function addGroup() {
    const g = {
      id: "sg" + Date.now(),
      label: "Новая группа",
      order: stageGroups.length + 1
    };
    onUpdate("stageGroups", [...stageGroups, g]);
  }
  function addHoliday() {
    if (!newHoliday) return;
    if (holidays.includes(newHoliday)) {
      setNewHoliday("");
      return;
    }
    onUpdate("holidays", [...holidays, newHoliday].sort());
    setNewHoliday("");
  }
  function removeHoliday(d) {
    onUpdate("holidays", holidays.filter(h => h !== d));
  }
  function saveAchievement(achievement) {
    if (!canEditAchievements) return;
    const a = normalizeAchievement(achievement);
    if (!a.title) {
      alert("\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0430\u0447\u0438\u0432\u043a\u0438");
      return;
    }
    const ar = ACHIEVEMENT_RULES.find(r => r.id === a.ruleType);
    if ((ar !== null && ar !== void 0 && ar.needsStage || ar !== null && ar !== void 0 && ar.needsGroup || ar !== null && ar !== void 0 && ar.needsRole) && !a.stageId) {
      alert("\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0446\u0435\u043b\u044c \u0443\u0441\u043b\u043e\u0432\u0438\u044f");
      return;
    }
    const arr = achievements.find(x => x.id === a.id) ? achievements.map(x => x.id === a.id ? a : x) : [...achievements, a];
    onUpdate("achievements", arr);
    incrSave("achievement", a);
    setAchievementModal(null);
  }
  function deleteAchievement(id) {
    if (!canEditAchievements) return;
    if (!window.confirm("\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0430\u0447\u0438\u0432\u043a\u0443?")) return;
    onUpdate("achievements", achievements.filter(a => a.id !== id));
    incrDelete("achievement", id);
  }
  const filtered = data.people.filter(p => !p.deleted && (!search || (p.name || '').toLowerCase().includes(search.toLowerCase())));
  const TAB_S = {
    display: "inline-flex",
    gap: 0,
    background: "#0f172a",
    borderRadius: 10,
    border: "1px solid #334155",
    overflow: "hidden",
    marginBottom: 20
  };
  const tabBtn = (id, label) => React.createElement("button", {
    key: id,
    onClick: () => setTab(id),
    style: {
      padding: "6px 16px",
      border: "none",
      cursor: "pointer",
      fontSize: 12,
      fontFamily: "inherit",
      background: tab === id ? "#3b82f6" : "transparent",
      color: tab === id ? "#fff" : "#64748b",
      fontWeight: tab === id ? 700 : 400
    }
  }, label);
  return React.createElement("div", null, React.createElement("div", {
    style: TAB_S
  }, tabBtn("roles", "Роли"), tabBtn("stages", "Этапы"), tabBtn("groups", "Группы этапов"), tabBtn("people", "Сотрудники"), tabBtn("holidays", "Праздники"), tabBtn("templates", "Шаблоны серий"), tabBtn("achievements", "\u0410\u0447\u0438\u0432\u043a\u0438"), tabBtn("users", "AD")), !canManagePeople && !["achievements", "users"].includes(tab) && React.createElement("p", {
    style: {
      fontSize: 12,
      color: "#94a3b8"
    }
  }, "\u0421\u043F\u0440\u0430\u0432\u043E\u0447\u043D\u0438\u043A\u0438 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B \u0434\u043B\u044F \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440\u0430. \u0418\u0437\u043C\u0435\u043D\u044F\u0442\u044C \u0438\u0445 \u043C\u043E\u0433\u0443\u0442 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440 \u0438 \u0440\u0443\u043A\u043E\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044C."), React.createElement("fieldset", {
    disabled: !canManagePeople,
    style: {
      border: 0,
      padding: 0,
      margin: 0,
      minWidth: 0
    }
  }, tab === "roles" && React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 24,
      alignItems: "start"
    }
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: "#93c5fd",
      marginBottom: 12
    }
  }, "\u0421\u043F\u0440\u0430\u0432\u043E\u0447\u043D\u0438\u043A \u0440\u043E\u043B\u0435\u0439"), roles.map(role => React.createElement("div", {
    key: role.id,
    style: {
      background: "rgba(30,41,59,.72)",
      border: "1px solid rgba(148,163,184,.18)",
      borderRadius: 12,
      padding: "9px 12px",
      marginBottom: 6,
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, React.createElement("div", {
    style: {
      width: 10,
      height: 10,
      borderRadius: 2,
      background: role.color,
      flexShrink: 0
    }
  }), editRoleId === role.id ? React.createElement(React.Fragment, null, React.createElement(Inp, {
    value: roleForm.label,
    onChange: v => setRoleForm(f => ({
      ...f,
      label: v
    })),
    style: {
      flex: 1
    },
    placeholder: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"
  }), React.createElement("input", {
    type: "color",
    value: roleForm.color,
    onChange: e => setRoleForm(f => ({
      ...f,
      color: e.target.value
    })),
    style: {
      width: 32,
      height: 30,
      border: "none",
      background: "none",
      cursor: "pointer"
    }
  }), React.createElement(Btn, {
    small: true,
    variant: "primary",
    onClick: () => saveRole({
      id: role.id,
      ...roleForm
    })
  }, "OK"), React.createElement(Btn, {
    small: true,
    variant: "ghost",
    onClick: () => setEditRoleId(null)
  }, "\u2715")) : React.createElement(React.Fragment, null, React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 13
    }
  }, role.label), React.createElement("span", {
    style: {
      fontSize: 10,
      color: "#475569",
      fontFamily: "monospace"
    }
  }, role.id), React.createElement(Btn, {
    small: true,
    variant: "ghost",
    onClick: () => {
      setEditRoleId(role.id);
      setRoleForm({
        label: role.label,
        color: role.color
      });
    }
  }, "\u0418\u0437\u043C"), React.createElement(Btn, {
    small: true,
    variant: "danger",
    onClick: () => deleteRole(role.id)
  }, "\u2715")))), React.createElement("div", {
    style: {
      background: "rgba(59,130,246,0.05)",
      border: "1px dashed #334155",
      borderRadius: 12,
      padding: "12px 14px",
      marginTop: 8
    }
  }, React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#64748b",
      marginBottom: 8,
      letterSpacing: 1
    }
  }, "\u041D\u041E\u0412\u0410\u042F \u0420\u041E\u041B\u042C"), React.createElement(Field, {
    label: "ID (\u043B\u0430\u0442.)"
  }, React.createElement(Inp, {
    value: roleForm.id,
    onChange: v => setRoleForm(f => ({
      ...f,
      id: v
    })),
    placeholder: "montazh"
  })), React.createElement(Field, {
    label: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"
  }, React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, React.createElement(Inp, {
    value: roleForm.label,
    onChange: v => setRoleForm(f => ({
      ...f,
      label: v
    })),
    placeholder: "\u041C\u043E\u043D\u0442\u0430\u0436\u0451\u0440",
    style: {
      flex: 1
    }
  }), React.createElement("input", {
    type: "color",
    value: roleForm.color,
    onChange: e => setRoleForm(f => ({
      ...f,
      color: e.target.value
    })),
    style: {
      width: 40,
      height: 36,
      border: "1px solid #334155",
      borderRadius: 10,
      background: "#0f172a",
      cursor: "pointer"
    }
  }))), React.createElement(Btn, {
    variant: "primary",
    onClick: () => {
      if (!roleForm.label || !roleForm.id) {
        alert("Заполните ID и название");
        return;
      }
      if (roles.find(r => r.id === roleForm.id)) {
        alert("Такой ID уже есть");
        return;
      }
      saveRole({
        id: roleForm.id,
        label: roleForm.label,
        color: roleForm.color
      });
    }
  }, "+ \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0440\u043E\u043B\u044C")))), tab === "stages" && React.createElement("div", {
    style: {
      maxWidth: 600
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12
    }
  }, React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: "#93c5fd"
    }
  }, "\u042D\u0442\u0430\u043F\u044B \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u0430 (", stages.length, ")"), React.createElement(Btn, {
    variant: "primary",
    onClick: addStage
  }, "+ \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u044D\u0442\u0430\u043F")), stages.map((stage, i) => {
    const isDragOver = dragOverStage === stage.id && stageDragRef.current !== stage.id;
    return React.createElement("div", {
      key: stage.id,
      draggable: true,
      onDragStart: () => {
        stageDragRef.current = stage.id;
      },
      onDragOver: e => {
        e.preventDefault();
        if (stageDragRef.current !== stage.id) setDragOverStage(stage.id);
      },
      onDragLeave: () => setDragOverStage(null),
      onDrop: e => {
        e.preventDefault();
        const fromId = stageDragRef.current;
        if (!fromId || fromId === stage.id) {
          setDragOverStage(null);
          return;
        }
        const arr = [...stages];
        const fi = arr.findIndex(s => s.id === fromId);
        const ti = arr.findIndex(s => s.id === stage.id);
        const _arr$splice = arr.splice(fi, 1),
          _arr$splice2 = _slicedToArray(_arr$splice, 1),
          item = _arr$splice2[0];
        arr.splice(ti, 0, item);
        onUpdate("stages", arr.map((s, idx) => ({
          ...s,
          order: idx + 1
        })));
        setDragOverStage(null);
        stageDragRef.current = null;
      },
      onDragEnd: () => {
        setDragOverStage(null);
        stageDragRef.current = null;
      },
      style: {
        background: "#1e293b",
        border: `1px solid ${isDragOver ? "#3b82f6" : "#334155"}`,
        borderRadius: 12,
        padding: "9px 12px",
        marginBottom: 6,
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: "grab",
        userSelect: "none",
        boxShadow: isDragOver ? "0 0 0 2px #3b82f644" : "none",
        opacity: stageDragRef.current === stage.id ? 0.5 : 1,
        transition: "border-color 0.1s,box-shadow 0.1s"
      }
    }, React.createElement("div", {
      style: {
        color: "#334155",
        fontSize: 14,
        padding: "0 4px",
        cursor: "grab",
        flexShrink: 0
      }
    }, "\u283F"), React.createElement("span", {
      style: {
        fontSize: 10,
        color: "#334155",
        width: 16,
        textAlign: "right",
        flexShrink: 0
      }
    }, i + 1), React.createElement("div", {
      style: {
        width: 10,
        height: 10,
        borderRadius: 2,
        background: stage.color,
        flexShrink: 0
      }
    }), React.createElement("div", {
      style: {
        flex: 1
      }
    }, React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 600
      }
    }, stage.label), !stage.needsExecutor && React.createElement("span", {
      style: {
        fontSize: 9,
        color: "#64748b",
        marginLeft: 6
      }
    }, "\u0431\u0435\u0437 \u0438\u0441\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044F"), stage.noImpact && React.createElement("span", {
      style: {
        fontSize: 9,
        color: "#f97316",
        marginLeft: 6,
        background: "rgba(249,115,22,0.1)",
        borderRadius: 3,
        padding: "1px 4px"
      }
    }, "\u0431\u0435\u0437 \u0432\u043B\u0438\u044F\u043D\u0438\u044F"), (() => {
      const knownRoles = (stage.rolesRequired || []).filter(rid => roles.find(r => r.id === rid));
      const missing = (stage.rolesRequired || []).filter(rid => !roles.find(r => r.id === rid));
      return (knownRoles.length > 0 || missing.length > 0) && React.createElement("div", {
        style: {
          fontSize: 10,
          color: "#475569",
          marginTop: 1
        }
      }, "\u0420\u043E\u043B\u0438: ", knownRoles.map(rid => {
        var _roles$find;
        return ((_roles$find = roles.find(r => r.id === rid)) === null || _roles$find === void 0 ? void 0 : _roles$find.label) || rid;
      }).join(", "), missing.length > 0 && React.createElement("span", {
        style: {
          color: "#ef4444",
          marginLeft: 4
        }
      }, "! \u0443\u0434\u0430\u043B\u0435\u043D\u044B: ", missing.join(", ")));
    })()), React.createElement("div", {
      style: {
        display: "flex",
        gap: 4,
        alignItems: "center"
      }
    }, React.createElement("div", {
      style: {
        width: 40,
        height: 18,
        borderRadius: 3,
        background: stageBg(stage.color),
        border: `1px solid ${stageBorder(stage.color)}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 9,
        color: stage.color,
        fontWeight: 700
      }
    }, stage.label.slice(0, 3)), React.createElement(Btn, {
      small: true,
      variant: "ghost",
      onClick: () => setStageModal(stage)
    }, "\u0418\u0437\u043C"), React.createElement(Btn, {
      small: true,
      variant: "danger",
      onClick: () => deleteStage(stage.id)
    }, "\u2715")));
  })), tab === "people" && React.createElement("div", null, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12
    }
  }, React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: "#93c5fd"
    }
  }, "\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0438 (", data.people.filter(p => p.active !== false && !p.deleted).length, " \u0430\u043A\u0442.)"), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, React.createElement(Btn, {
    variant: "primary",
    onClick: () => setPersonModal({
      name: "",
      roles: DEMO_ROLES,
      active: true
    })
  }, "+ \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C"))), React.createElement(Inp, {
    value: search,
    onChange: setSearch,
    placeholder: "\uD83D\uDD0D \u041F\u043E\u0438\u0441\u043A \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u043E\u0432...",
    style: {
      marginBottom: 10,
      maxWidth: 400
    }
  }), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, filtered.map(person => React.createElement("div", {
    key: person.id,
    style: {
      background: "rgba(30,41,59,.72)",
      border: "1px solid rgba(148,163,184,.18)",
      borderRadius: 12,
      padding: "9px 12px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      opacity: person.active === false ? 0.5 : 1
    }
  }, React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: "50%",
      background: "#0f172a",
      border: "2px solid #334155",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 12,
      fontWeight: 700,
      color: "#64748b",
      flexShrink: 0
    }
  }, (person.name || "?")[0]), React.createElement("div", {
    style: {
      flex: 1,
      overflow: "hidden"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, person.name, person.active === false && React.createElement("span", {
    style: {
      fontSize: 10,
      color: "#475569",
      marginLeft: 6
    }
  }, "\u043D\u0435\u0430\u043A\u0442\u0438\u0432\u0435\u043D")), person.login && React.createElement("div", {
    style: {
      fontSize: 9,
      color: "#475569",
      marginTop: 1
    }
  }, "\uD83D\uDD17 ", person.login, person.email ? " · " + person.email : ""), React.createElement("div", {
    style: {
      display: "flex",
      gap: 3,
      marginTop: 3,
      flexWrap: "wrap"
    }
  }, (person.roles || []).map(r => {
    const role = roles.find(rl => rl.id === r);
    const rk = typeof r === "string" ? r : r.id || JSON.stringify(r);
    return React.createElement("span", {
      key: rk,
      style: {
        fontSize: 9,
        background: "transparent",
        color: (role === null || role === void 0 ? void 0 : role.color) || "#64748b",
        border: `1.5px solid ${(role === null || role === void 0 ? void 0 : role.color) || "#64748b"}`,
        borderRadius: 3,
        padding: "1px 5px"
      }
    }, (role === null || role === void 0 ? void 0 : role.label) || r);
  }))), React.createElement(Btn, {
    small: true,
    variant: "ghost",
    onClick: () => setPersonModal(person)
  }, "\u0418\u0437\u043C")))), personModal && canManagePeople && React.createElement(PersonModal, {
    person: personModal,
    roles: roles,
    canEditBirthday: (user === null || user === void 0 ? void 0 : user.role) === "admin",
    onSave: savePerson,
    onDelete: deletePerson,
    onClose: () => setPersonModal(null)
  })), tab === "holidays" && React.createElement("div", {
    style: {
      maxWidth: 520
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12
    }
  }, React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: "#93c5fd"
    }
  }, "\u041D\u0435\u0440\u0430\u0431\u043E\u0447\u0438\u0435 \u0434\u043D\u0438 (", holidays.length, ")")), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 16
    }
  }, React.createElement("input", {
    type: "date",
    onChange: e => {
      if (e.target.value) setNewHoliday(fromInput(e.target.value));
    },
    style: {
      background: "#0f172a",
      border: "1px solid #334155",
      color: "#e2e8f0",
      borderRadius: 10,
      padding: "7px 10px",
      fontSize: 13,
      flex: 1
    }
  }), React.createElement(Btn, {
    variant: "primary",
    onClick: addHoliday
  }, "+ \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C")), React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6
    }
  }, [...holidays].sort().map(d => {
    const pd = parseDate(d);
    const dow = pd ? WDAYS[pd.getDay()] : "";
    return React.createElement("div", {
      key: d,
      style: {
        background: "rgba(59,130,246,0.08)",
        border: "1px solid #334155",
        borderRadius: 10,
        padding: "4px 10px",
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12
      }
    }, React.createElement("span", {
      style: {
        color: "#475569",
        fontSize: 10
      }
    }, dow), React.createElement("span", null, d), React.createElement("button", {
      onClick: () => removeHoliday(d),
      style: {
        background: "none",
        border: "none",
        color: "#475569",
        cursor: "pointer",
        fontSize: 14,
        lineHeight: 1,
        padding: 0
      }
    }, "\xD7"));
  }))), tab === "groups" && React.createElement("div", {
    style: {
      maxWidth: 500
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12
    }
  }, React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: "#93c5fd"
    }
  }, "\u0413\u0440\u0443\u043F\u043F\u044B \u044D\u0442\u0430\u043F\u043E\u0432"), React.createElement(Btn, {
    variant: "primary",
    small: true,
    onClick: addGroup
  }, "+ \u0413\u0440\u0443\u043F\u043F\u0430")), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, stageGroups.map(g => React.createElement("div", {
    key: g.id,
    style: {
      background: "rgba(30,41,59,.72)",
      border: "1px solid rgba(148,163,184,.18)",
      borderRadius: 12,
      padding: "10px 14px",
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, React.createElement("span", {
    style: {
      fontSize: 13,
      color: "#64748b",
      minWidth: 20,
      textAlign: "right"
    }
  }, g.order), React.createElement("input", {
    value: g.label,
    onChange: e => saveGroup({
      ...g,
      label: e.target.value
    }),
    style: {
      background: "#0f172a",
      border: "1px solid #334155",
      color: "#e2e8f0",
      borderRadius: 10,
      padding: "5px 10px",
      fontSize: 13,
      flex: 1
    }
  }), React.createElement("button", {
    onClick: () => deleteGroup(g.id),
    style: {
      background: "rgba(239,68,68,0.1)",
      border: "1px solid rgba(239,68,68,0.3)",
      color: "#f87171",
      borderRadius: 10,
      padding: "4px 10px",
      cursor: "pointer",
      fontSize: 12
    }
  }, "\u0423\u0434\u0430\u043B\u0438\u0442\u044C")))), React.createElement("div", {
    style: {
      marginTop: 16,
      padding: "10px 12px",
      background: "rgba(59,130,246,0.07)",
      border: "1px solid rgba(59,130,246,0.2)",
      borderRadius: 10,
      fontSize: 12,
      color: "#64748b"
    }
  }, "\u0413\u0440\u0443\u043F\u043F\u044B \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u044E\u0442\u0441\u044F \u0434\u043B\u044F \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u0441\u0442\u0430\u0442\u0443\u0441\u0430 \u0441\u0435\u0440\u0438\u0438. \u041D\u0430\u0437\u043D\u0430\u0447\u044C\u0442\u0435 \u0433\u0440\u0443\u043F\u043F\u0443 \u043A\u0430\u0436\u0434\u043E\u043C\u0443 \u044D\u0442\u0430\u043F\u0443 \u043D\u0430 \u0432\u043A\u043B\u0430\u0434\u043A\u0435 \xAB\u042D\u0442\u0430\u043F\u044B\xBB.")), tab === "templates" && (() => {
    const templates = data.templates || [];
    function saveTmpl(t) {
      const arr = templates.find(x => x.id === t.id) ? templates.map(x => x.id === t.id ? t : x) : [...templates, {
        ...t,
        id: "tmpl_" + Date.now()
      }];
      onUpdate("templates", arr);
      onLog === null || onLog === void 0 || onLog(`Шаблон «${t.name}» сохранён`);
      setTmplModal(null);
    }
    function deleteTmpl(id) {
      if (!window.confirm("Удалить шаблон?")) return;
      onUpdate("templates", templates.filter(t => t.id !== id));
    }
    return React.createElement("div", {
      style: {
        maxWidth: 680
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12
      }
    }, React.createElement("span", {
      style: {
        fontSize: 14,
        fontWeight: 700,
        color: "#93c5fd"
      }
    }, "\u0428\u0430\u0431\u043B\u043E\u043D\u044B \u0441\u0435\u0440\u0438\u0439 (", templates.length, ")"), React.createElement(Btn, {
      variant: "primary",
      small: true,
      onClick: () => setTmplModal({
        name: "",
        editDays: 5,
        csoundDays: 3,
        corrDays: 2,
        masterDays: 1,
        otherDays: 0
      })
    }, "+ \u0428\u0430\u0431\u043B\u043E\u043D")), React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, templates.map(t => {
      const total = t.editDays + t.csoundDays + t.corrDays + t.masterDays + (t.otherDays || 0);
      return React.createElement("div", {
        key: t.id,
        style: {
          background: "rgba(30,41,59,.72)",
          border: "1px solid rgba(148,163,184,.18)",
          borderRadius: 12,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12
        }
      }, React.createElement("div", {
        style: {
          flex: 1
        }
      }, React.createElement("div", {
        style: {
          fontWeight: 700,
          color: "#e2e8f0",
          marginBottom: 4
        }
      }, t.name), React.createElement("div", {
        style: {
          fontSize: 11,
          color: "#64748b",
          display: "flex",
          gap: 12,
          flexWrap: "wrap"
        }
      }, React.createElement("span", null, "\u041C\u043E\u043D\u0442\u0430\u0436: ", React.createElement("b", {
        style: {
          color: "#94a3b8"
        }
      }, t.editDays, "\u0434")), React.createElement("span", null, "\u0426\u0432\u0435\u0442/\u0417\u0432\u0443\u043A: ", React.createElement("b", {
        style: {
          color: "#94a3b8"
        }
      }, t.csoundDays, "\u0434")), React.createElement("span", null, "\u041F\u0440\u0430\u0432\u043A\u0438: ", React.createElement("b", {
        style: {
          color: "#94a3b8"
        }
      }, t.corrDays, "\u0434")), React.createElement("span", null, "\u041C\u0430\u0441\u0442\u0435\u0440\u0438\u043D\u0433: ", React.createElement("b", {
        style: {
          color: "#94a3b8"
        }
      }, t.masterDays, "\u0434")), t.otherDays ? React.createElement("span", null, "\u041F\u0440\u043E\u0447\u0435\u0435: ", React.createElement("b", {
        style: {
          color: "#94a3b8"
        }
      }, t.otherDays, "\u0434")) : null, React.createElement("span", {
        style: {
          color: "#3b82f6",
          fontWeight: 600
        }
      }, "\u0418\u0442\u043E\u0433\u043E: ", total, "\u0434"))), React.createElement(Btn, {
        variant: "ghost",
        small: true,
        onClick: () => setTmplModal(t)
      }, "\u270F"), React.createElement(Btn, {
        variant: "danger",
        small: true,
        onClick: () => deleteTmpl(t.id)
      }, "\xD7"));
    }), !templates.length && React.createElement("div", {
      style: {
        color: "#334155",
        fontSize: 13,
        padding: "20px 0",
        textAlign: "center"
      }
    }, "\u0428\u0430\u0431\u043B\u043E\u043D\u043E\u0432 \u043D\u0435\u0442. \u0421\u043E\u0437\u0434\u0430\u0439\u0442\u0435 \u0448\u0430\u0431\u043B\u043E\u043D, \u0447\u0442\u043E\u0431\u044B \u0431\u044B\u0441\u0442\u0440\u043E \u0437\u0430\u043F\u043E\u043B\u043D\u044F\u0442\u044C \u0434\u0430\u0442\u044B \u043D\u043E\u0432\u044B\u0445 \u0441\u0435\u0440\u0438\u0439.")), React.createElement("div", {
      style: {
        marginTop: 16,
        padding: "10px 12px",
        background: "rgba(59,130,246,0.07)",
        border: "1px solid rgba(59,130,246,0.2)",
        borderRadius: 10,
        fontSize: 12,
        color: "#64748b"
      }
    }, "\u041F\u0440\u0438 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0438 \u0441\u0435\u0440\u0438\u0438 \u043C\u043E\u0436\u043D\u043E \u0432\u044B\u0431\u0440\u0430\u0442\u044C \u0448\u0430\u0431\u043B\u043E\u043D \u2014 \u0434\u0430\u0442\u044B \u041F\u0440\u0435\u0434-\u041E\u0422\u041A \u0438 \u041E\u0422\u041A \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u044E\u0442\u0441\u044F \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u043E\u0442 \u0434\u0430\u0442\u044B \u0441\u0442\u0430\u0440\u0442\u0430 \u043C\u043E\u043D\u0442\u0430\u0436\u0430."));
  })()), tab === "achievements" && React.createElement(AchievementsSettings, {
    achievements: achievements,
    stages: stages,
    stageGroups: stageGroups,
    roles: roles,
    canEdit: canEditAchievements,
    onNew: () => setAchievementModal({
      id: "ach_" + Date.now(),
      title: "",
      description: "",
      icon: "A",
      image: "",
      color: "#38bdf8",
      ruleType: "shifts_count",
      threshold: 1,
      stageId: "",
      enabled: true
    }),
    onEdit: setAchievementModal,
    onDelete: deleteAchievement
  }), tab === "users" && React.createElement(UsersView, {
    user: user,
    onUserUpdate: onUserUpdate
  }), achievementModal && React.createElement(AchievementModal, {
    achievement: achievementModal,
    stages: stages,
    stageGroups: stageGroups,
    roles: roles,
    onSave: saveAchievement,
    onClose: () => setAchievementModal(null)
  }), tmplModal && React.createElement(SeriesTemplateModal, {
    tmpl: tmplModal,
    onSave: t => {
      const arr = data.templates || [];
      const isNew = !t.id || !arr.find(x => x.id === t.id);
      const saved = isNew ? {
        ...t,
        id: "tmpl_" + Date.now()
      } : t;
      onUpdate("templates", isNew ? [...arr, saved] : arr.map(x => x.id === saved.id ? saved : x));
      onLog === null || onLog === void 0 || onLog(`Шаблон «${saved.name}» ${isNew ? "создан" : "обновлён"}`);
      setTmplModal(null);
    },
    onClose: () => setTmplModal(null)
  }), stageModal && React.createElement(StageEditModal, {
    stage: stageModal,
    roles: roles,
    stageGroups: stageGroups,
    onSave: saveStage,
    onClose: () => setStageModal(null)
  }));
}
function AchievementsSettings(_ref19) {
  let achievements = _ref19.achievements,
    stages = _ref19.stages,
    stageGroups = _ref19.stageGroups,
    roles = _ref19.roles,
    canEdit = _ref19.canEdit,
    onNew = _ref19.onNew,
    onEdit = _ref19.onEdit,
    onDelete = _ref19.onDelete;
  const sorted = [...(achievements || [])].sort((a, b) => (a.enabled === b.enabled ? 0 : a.enabled ? -1 : 1) || a.title.localeCompare(b.title));
  return React.createElement("div", {
    style: {
      maxWidth: 900
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
      gap: 12
    }
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: "#93c5fd"
    }
  }, "\u0410\u0447\u0438\u0432\u043a\u0438", " (", sorted.length, ")"), React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#64748b",
      marginTop: 3
    }
  }, "\u041f\u0440\u0430\u0432\u0438\u043b\u0430 \u0441\u0447\u0438\u0442\u0430\u044e\u0442\u0441\u044f \u043f\u043e \u0441\u043c\u0435\u043d\u0430\u043c \u0438 \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u044e\u0442\u0441\u044f \u0432 \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0435 \u0447\u0435\u043b\u043e\u0432\u0435\u043a\u0430")), canEdit ? React.createElement(Btn, {
    variant: "primary",
    onClick: onNew
  }, "+ \u0410\u0447\u0438\u0432\u043a\u0430") : React.createElement("span", {
    style: {
      fontSize: 12,
      color: "#64748b"
    }
  }, "\u041c\u0435\u043d\u044f\u0442\u044c \u043c\u043e\u0436\u0435\u0442 \u0442\u043e\u043b\u044c\u043a\u043e admin")), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
      gap: 10
    }
  }, sorted.map(a => {
    const rule = ACHIEVEMENT_RULES.find(r => r.id === a.ruleType);
    const target = rule !== null && rule !== void 0 && rule.needsGroup ? (stageGroups || []).find(g => g.id === a.stageId) : rule !== null && rule !== void 0 && rule.needsRole ? (roles || []).find(r => r.id === a.stageId) : (stages || []).find(s => s.id === a.stageId);
    return React.createElement("div", {
      key: a.id,
      style: {
        background: a.enabled !== false ? `${a.color}14` : "#1e293b",
        border: `1px solid ${a.enabled !== false ? a.color + "55" : "#334155"}`,
        borderRadius: 12,
        padding: "12px 14px",
        opacity: a.enabled !== false ? 1 : 0.55
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        alignItems: "center",
        marginBottom: 8
      }
    }, React.createElement("div", {
      style: {
        width: 38,
        height: 38,
        borderRadius: 12,
        background: `${a.color}22`,
        border: `1px solid ${a.color}66`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        color: a.color,
        fontWeight: 900,
        fontSize: 12,
        flexShrink: 0
      }
    }, a.image ? React.createElement("img", {
      src: a.image,
      alt: "",
      style: {
        width: "100%",
        height: "100%",
        objectFit: "cover"
      }
    }) : a.icon || "?"), React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 800,
        color: "#e2e8f0",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, a.title), React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#64748b",
        marginTop: 2
      }
    }, a.description || "\u0411\u0435\u0437 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u044f"))), React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#94a3b8",
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
        marginBottom: 10
      }
    }, React.createElement("span", {
      style: {
        border: "1px solid #334155",
        borderRadius: 999,
        padding: "2px 7px"
      }
    }, (rule === null || rule === void 0 ? void 0 : rule.label) || a.ruleType, ": ", a.threshold), target && React.createElement("span", {
      style: {
        border: "1px solid #334155",
        borderRadius: 999,
        padding: "2px 7px",
        color: target.color || "#94a3b8"
      }
    }, target.label || target.id), a.enabled === false && React.createElement("span", {
      style: {
        border: "1px solid #475569",
        borderRadius: 999,
        padding: "2px 7px",
        color: "#64748b"
      }
    }, "\u0432\u044b\u043a\u043b")), canEdit && React.createElement("div", {
      style: {
        display: "flex",
        gap: 6
      }
    }, React.createElement(Btn, {
      small: true,
      variant: "ghost",
      onClick: () => onEdit(a)
    }, "\u0418\u0437\u043c"), React.createElement(Btn, {
      small: true,
      variant: "danger",
      onClick: () => onDelete(a.id)
    }, "\u0423\u0434\u0430\u043b\u0438\u0442\u044c")));
  })));
}
function AchievementModal(_ref20) {
  let achievement = _ref20.achievement,
    stages = _ref20.stages,
    stageGroups = _ref20.stageGroups,
    roles = _ref20.roles,
    onSave = _ref20.onSave,
    onClose = _ref20.onClose;
  const _useState27 = useState(normalizeAchievement(achievement)),
    _useState28 = _slicedToArray(_useState27, 2),
    form = _useState28[0],
    setForm = _useState28[1];
  const sf = v => setForm(f => ({
    ...f,
    ...v
  }));
  const rule = ACHIEVEMENT_RULES.find(r => r.id === form.ruleType) || ACHIEVEMENT_RULES[0];
  const targetOptions = rule.needsGroup ? stageGroups || [] : rule.needsRole ? roles || [] : stages || [];
  const targetLabel = rule.needsGroup ? "\u0413\u0440\u0443\u043f\u043f\u0430 \u044d\u0442\u0430\u043f\u043e\u0432" : rule.needsRole ? "\u0420\u043e\u043b\u044c \u044d\u0442\u0430\u043f\u0430" : "\u042d\u0442\u0430\u043f";
  function chooseImage(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 150000) {
      alert("\u041a\u0430\u0440\u0442\u0438\u043d\u043a\u0430 \u0441\u043b\u0438\u0448\u043a\u043e\u043c \u0431\u043e\u043b\u044c\u0448\u0430\u044f. \u0414\u043e 150 \u041a\u0411");
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => sf({
      image: String(ev.target.result || "")
    });
    reader.readAsDataURL(file);
  }
  return React.createElement(Modal, {
    title: achievement.title ? "\u0410\u0447\u0438\u0432\u043a\u0430" : "\u041d\u043e\u0432\u0430\u044f \u0430\u0447\u0438\u0432\u043a\u0430",
    onClose: onClose,
    wide: true
  }, React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14
    }
  }, React.createElement(Field, {
    label: "ID"
  }, React.createElement(Inp, {
    value: form.id,
    onChange: v => sf({
      id: v.replace(/[^a-zA-Z0-9_-]/g, "")
    }),
    placeholder: "shifts_50"
  })), React.createElement(Field, {
    label: "\\u0426\\u0432\\u0435\\u0442"
  }, React.createElement("input", {
    type: "color",
    value: form.color,
    onChange: e => sf({
      color: e.target.value
    }),
    style: {
      width: "100%",
      height: 36,
      background: "#0f172a",
      border: "1px solid #334155",
      borderRadius: 10
    }
  })), React.createElement(Field, {
    label: "\\u041d\\u0430\\u0437\\u0432\\u0430\\u043d\\u0438\\u0435"
  }, React.createElement(Inp, {
    value: form.title,
    onChange: v => sf({
      title: v
    }),
    placeholder: "\\u041f\\u043e\\u043b\\u0442\\u0438\\u043d\\u043d\\u0438\\u043a"
  })), React.createElement(Field, {
    label: "\\u0417\\u043d\\u0430\\u043a"
  }, React.createElement(Inp, {
    value: form.icon,
    onChange: v => sf({
      icon: v.slice(0, 16)
    }),
    placeholder: "50"
  })), React.createElement(Field, {
    label: "\\u0423\\u0441\\u043b\\u043e\\u0432\\u0438\\u0435"
  }, React.createElement("select", {
    value: form.ruleType,
    onChange: e => sf({
      ruleType: e.target.value,
      stageId: ""
    }),
    style: {
      width: "100%",
      background: "#0f172a",
      border: "1px solid #334155",
      borderRadius: 10,
      color: "#e2e8f0",
      padding: "7px 10px",
      fontSize: 13
    }
  }, ACHIEVEMENT_RULES.map(r => React.createElement("option", {
    key: r.id,
    value: r.id
  }, r.label)))), React.createElement(Field, {
    label: `\u041f\u043e\u0440\u043e\u0433 (${rule.unit})`
  }, React.createElement("input", {
    type: "number",
    min: "1",
    max: "10000",
    value: form.threshold,
    onChange: e => sf({
      threshold: Math.max(1, Number(e.target.value) || 1)
    }),
    style: {
      width: "100%",
      background: "#0f172a",
      border: "1px solid #334155",
      borderRadius: 10,
      color: "#e2e8f0",
      padding: "7px 10px",
      fontSize: 13
    }
  })), (rule.needsStage || rule.needsGroup || rule.needsRole) && React.createElement(Field, {
    label: targetLabel
  }, React.createElement("select", {
    value: form.stageId,
    onChange: e => sf({
      stageId: e.target.value
    }),
    style: {
      width: "100%",
      background: "#0f172a",
      border: "1px solid #334155",
      borderRadius: 10,
      color: "#e2e8f0",
      padding: "7px 10px",
      fontSize: 13
    }
  }, React.createElement("option", {
    value: ""
  }, "---"), targetOptions.map(st => React.createElement("option", {
    key: st.id,
    value: st.id
  }, st.label || st.id)))), React.createElement(Field, {
    label: "\\u041a\\u0430\\u0440\\u0442\\u0438\\u043d\\u043a\\u0430"
  }, React.createElement("input", {
    type: "file",
    accept: "image/*",
    onChange: chooseImage,
    style: {
      fontSize: 12,
      color: "#94a3b8"
    }
  }), form.image && React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center",
      marginTop: 6
    }
  }, React.createElement("img", {
    src: form.image,
    alt: "",
    style: {
      width: 32,
      height: 32,
      borderRadius: 10,
      objectFit: "cover"
    }
  }), React.createElement(Btn, {
    small: true,
    variant: "ghost",
    onClick: () => sf({
      image: ""
    })
  }, "\u0423\u0431\u0440\u0430\u0442\u044c"))), React.createElement(Field, {
    label: "\\u0412\\u043a\\u043b\\u044e\\u0447\\u0435\\u043d\\u0430"
  }, React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontSize: 13,
      color: "#94a3b8"
    }
  }, React.createElement("input", {
    type: "checkbox",
    checked: form.enabled !== false,
    onChange: e => sf({
      enabled: e.target.checked
    })
  }), " ", "\u041f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0442\u044c \u0438 \u0441\u0447\u0438\u0442\u0430\u0442\u044c"))), React.createElement(Field, {
    label: "\\u041e\\u043f\\u0438\\u0441\\u0430\\u043d\\u0438\\u0435"
  }, React.createElement("textarea", {
    value: form.description,
    onChange: e => sf({
      description: e.target.value
    }),
    rows: 3,
    style: {
      width: "100%",
      background: "#0f172a",
      border: "1px solid #334155",
      borderRadius: 10,
      color: "#e2e8f0",
      padding: "8px 10px",
      fontSize: 13,
      resize: "vertical"
    }
  })), React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 8,
      marginTop: 16
    }
  }, React.createElement(Btn, {
    variant: "ghost",
    onClick: onClose
  }, "\u041e\u0442\u043c\u0435\u043d\u0430"), React.createElement(Btn, {
    variant: "primary",
    onClick: () => onSave(form)
  }, "\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c")));
}
function SeriesTemplateModal(_ref21) {
  let tmpl = _ref21.tmpl,
    onSave = _ref21.onSave,
    onClose = _ref21.onClose;
  const _useState29 = useState({
      ...tmpl
    }),
    _useState30 = _slicedToArray(_useState29, 2),
    form = _useState30[0],
    setForm = _useState30[1];
  const f = form;
  const sf = v => setForm(p => ({
    ...p,
    ...v
  }));
  const numFld = (label, key) => React.createElement(Field, {
    label: label
  }, React.createElement("input", {
    type: "number",
    min: 0,
    max: 99,
    value: f[key] || 0,
    onChange: e => sf({
      [key]: Math.max(0, parseInt(e.target.value) || 0)
    }),
    style: {
      background: "#0f172a",
      border: "1px solid #334155",
      borderRadius: 10,
      color: "#e2e8f0",
      padding: "7px 10px",
      fontSize: 13,
      width: "100%",
      boxSizing: "border-box"
    }
  }));
  const total = (f.editDays || 0) + (f.csoundDays || 0) + (f.corrDays || 0) + (f.masterDays || 0) + (f.otherDays || 0);
  function handleSave() {
    var _f$name;
    if (!((_f$name = f.name) !== null && _f$name !== void 0 && _f$name.trim())) {
      alert("Введите название шаблона");
      return;
    }
    onSave(f);
  }
  return React.createElement(Modal, {
    title: f.id ? "Редактировать шаблон" : "Новый шаблон серии",
    onClose: onClose,
    onSubmit: handleSave
  }, React.createElement(Field, {
    label: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0448\u0430\u0431\u043B\u043E\u043D\u0430"
  }, React.createElement(Inp, {
    value: f.name || "",
    onChange: v => sf({
      name: v
    }),
    placeholder: "\u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430\u043B\u043A\u0430 52 \u043C\u0438\u043D"
  })), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
      marginTop: 8
    }
  }, numFld("Монтаж (дней)", "editDays"), numFld("Цвет / Звук (дней)", "csoundDays"), numFld("Правки (дней)", "corrDays"), numFld("Мастеринг (дней)", "masterDays"), numFld("Прочее (дней)", "otherDays"), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      paddingBottom: 4
    }
  }, React.createElement("div", {
    style: {
      background: "rgba(59,130,246,0.1)",
      border: "1px solid rgba(59,130,246,0.3)",
      borderRadius: 10,
      padding: "7px 12px",
      fontSize: 13,
      color: "#93c5fd",
      fontWeight: 700
    }
  }, "\u0418\u0442\u043E\u0433\u043E: ", total, " \u0434\u043D\u0435\u0439"))), React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#475569",
      marginTop: 10
    }
  }, "\u041E\u0442 \u0434\u0430\u0442\u044B \u0441\u0442\u0430\u0440\u0442\u0430 \u043C\u043E\u043D\u0442\u0430\u0436\u0430 \u0441\u0438\u0441\u0442\u0435\u043C\u0430 \u043F\u043E\u0441\u0447\u0438\u0442\u0430\u0435\u0442 \u0434\u0430\u0442\u0443 \u041F\u0440\u0435\u0434-\u041E\u0422\u041A \u0438 \u041E\u0422\u041A \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438."), React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 8,
      marginTop: 20,
      borderTop: "1px solid #334155",
      paddingTop: 16
    }
  }, React.createElement(Btn, {
    variant: "ghost",
    onClick: onClose
  }, "\u041E\u0442\u043C\u0435\u043D\u0430"), React.createElement(Btn, {
    variant: "primary",
    onClick: handleSave
  }, "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C")));
}
function PersonModal(_ref22) {
  let person = _ref22.person,
    roles = _ref22.roles,
    canEditBirthday = _ref22.canEditBirthday,
    onSave = _ref22.onSave,
    onDelete = _ref22.onDelete,
    onClose = _ref22.onClose;
  const _useState31 = useState({
      name: person.name || "",
      roles: [...(person.roles || [])],
      active: person.active !== false,
      allowParallel: person.allowParallel === true,
      login: person.login || "",
      email: person.email || "",
      birthday: person.birthday || ""
    }),
    _useState32 = _slicedToArray(_useState31, 2),
    form = _useState32[0],
    setForm = _useState32[1];
  const _useState33 = useState([]),
    _useState34 = _slicedToArray(_useState33, 2),
    domainUsers = _useState34[0],
    setDomainUsers = _useState34[1];
  const _useState35 = useState(""),
    _useState36 = _slicedToArray(_useState35, 2),
    domainSearch = _useState36[0],
    setDomainSearch = _useState36[1];
  const isNew = !person.id;
  React.useEffect(() => {
    if (isNew) {
      fetch("/api/users/domain", {
        credentials: "include"
      }).then(r => r.ok && r.json()).then(u => setDomainUsers(u || [])).catch(() => {});
    }
  }, [isNew]);
  function toggleRole(id) {
    setForm(f => ({
      ...f,
      roles: f.roles.includes(id) ? f.roles.filter(r => r !== id) : [...f.roles, id]
    }));
  }
  function handleSave() {
    const n = (form.name || "").trim();
    if (!n) {
      alert("Введите имя");
      return;
    }
    const bd = normalizeBirthday(form.birthday);
    if (canEditBirthday && bd === null) {
      alert("День рождения укажите в формате ДД.ММ");
      return;
    }
    onSave({
      ...person,
      ...form,
      birthday: canEditBirthday ? bd : person.birthday || "",
      roles: (form.roles || []).filter(r => typeof r === "string"),
      name: n
    });
  }
  const domainFiltered = domainUsers.filter(u => !domainSearch || (u.display_name || '').toLowerCase().includes(domainSearch.toLowerCase()) || u.sam_name.toLowerCase().includes(domainSearch.toLowerCase()));
  return React.createElement(Modal, {
    title: isNew ? "Новый сотрудник" : "Редактировать сотрудника",
    onClose: onClose,
    onSubmit: handleSave
  }, React.createElement(Field, {
    label: "\u0418\u043C\u044F / \u0424\u0430\u043C\u0438\u043B\u0438\u044F"
  }, React.createElement(Inp, {
    value: form.name,
    onChange: v => setForm(f => ({
      ...f,
      name: v
    })),
    placeholder: "\u0418\u0432\u0430\u043D\u043E\u0432"
  })), isNew && React.createElement(React.Fragment, null, React.createElement(Field, {
    label: "\u041F\u043E\u0438\u0441\u043A \u0432 \u0434\u043E\u043C\u0435\u043D\u0435"
  }, React.createElement(Inp, {
    value: domainSearch,
    onChange: setDomainSearch,
    placeholder: "\uD83D\uDD0D \u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0438\u043C\u044F \u0438\u043B\u0438 \u043B\u043E\u0433\u0438\u043D..."
  })), domainSearch && React.createElement("div", {
    style: {
      maxHeight: 280,
      overflowY: "auto",
      marginBottom: 10,
      border: "1px solid #334155",
      borderRadius: 10
    }
  }, domainFiltered.length === 0 ? React.createElement("div", {
    style: {
      color: "#64748b",
      textAlign: "center",
      padding: 12,
      fontSize: 12
    }
  }, "\u041D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E") : domainFiltered.map(u => React.createElement("div", {
    key: u.sam_name,
    style: {
      padding: "7px 10px",
      cursor: "pointer",
      borderBottom: "1px solid #1e293b",
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: form.login === u.sam_name ? "#1e3a5f" : "transparent"
    },
    onClick: () => {
      setForm(f => ({
        ...f,
        name: u.display_name,
        login: u.sam_name,
        email: u.email || ""
      }));
      setDomainSearch("");
    },
    onMouseEnter: e => e.currentTarget.style.background = "#1e3a5f",
    onMouseLeave: e => e.currentTarget.style.background = form.login === u.sam_name ? "#1e3a5f" : "transparent"
  }, React.createElement("div", {
    style: {
      width: 24,
      height: 24,
      borderRadius: "50%",
      background: "#0f172a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 10,
      fontWeight: 700,
      color: "#64748b",
      flexShrink: 0
    }
  }, (u.display_name || "?")[0]), React.createElement("div", {
    style: {
      flex: 1
    }
  }, React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 500
    }
  }, u.display_name), React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#475569"
    }
  }, u.sam_name))))), form.login && React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#475569",
      marginBottom: 8
    }
  }, "\uD83D\uDD17 \u041F\u0440\u0438\u0432\u044F\u0437\u0430\u043D \u043A: ", form.login, form.email ? " · " + form.email : "")), React.createElement(Field, {
    label: "\u0414\u0435\u043D\u044C \u0440\u043E\u0436\u0434\u0435\u043D\u0438\u044F"
  }, React.createElement(Inp, {
    value: form.birthday || "",
    onChange: v => canEditBirthday && setForm(f => ({
      ...f,
      birthday: v
    })),
    placeholder: "\u0414\u0414.\u041C\u041C",
    style: {
      maxWidth: 120,
      opacity: canEditBirthday ? 1 : 0.7
    }
  }), React.createElement("div", {
    style: {
      fontSize: 11,
      color: canEditBirthday ? "#64748b" : "#475569",
      marginTop: 4
    }
  }, canEditBirthday ? "Без года. Например: 14.09" : "Менять может только admin")), "      ", React.createElement(Field, {
    label: "\u0420\u043E\u043B\u0438"
  }, React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8
    }
  }, roles.map(r => React.createElement("label", {
    key: r.id,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      background: form.roles.includes(r.id) ? `${r.color}22` : "#0f172a",
      border: `1px solid ${form.roles.includes(r.id) ? r.color : "#334155"}`,
      borderRadius: 10,
      padding: "5px 10px",
      cursor: "pointer"
    }
  }, React.createElement("input", {
    type: "checkbox",
    checked: form.roles.includes(r.id),
    onChange: () => toggleRole(r.id),
    style: {
      accentColor: r.color
    }
  }), React.createElement("span", {
    style: {
      fontSize: 12,
      color: form.roles.includes(r.id) ? r.color : "#94a3b8"
    }
  }, r.label))))), React.createElement(Field, {
    label: "\u0421\u0442\u0430\u0442\u0443\u0441"
  }, React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      cursor: "pointer"
    }
  }, React.createElement("input", {
    type: "checkbox",
    checked: form.active,
    onChange: e => setForm(f => ({
      ...f,
      active: e.target.checked
    })),
    style: {
      accentColor: "#22c55e"
    }
  }), React.createElement("span", {
    style: {
      fontSize: 13
    }
  }, "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439 \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A"))), React.createElement(Field, {
    label: "\u041A\u043E\u043D\u0444\u043B\u0438\u043A\u0442\u044B"
  }, React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      cursor: "pointer"
    }
  }, React.createElement("input", {
    type: "checkbox",
    checked: form.allowParallel,
    onChange: e => setForm(f => ({
      ...f,
      allowParallel: e.target.checked
    })),
    style: {
      accentColor: "#a855f7"
    }
  }), React.createElement("span", {
    style: {
      fontSize: 13
    }
  }, "\u0420\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u044C \u043F\u0430\u0440\u0430\u043B\u043B\u0435\u043B\u044C\u043D\u044B\u0435 \u0437\u0430\u0434\u0430\u0447\u0438")), form.allowParallel && React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#a855f7",
      marginTop: 4,
      opacity: 0.8
    }
  }, "\u041F\u0435\u0440\u0435\u0441\u0435\u0447\u0435\u043D\u0438\u044F \u043F\u043E \u0432\u0440\u0435\u043C\u0435\u043D\u0438 \u043D\u0435 \u0431\u0443\u0434\u0443\u0442 \u0441\u0447\u0438\u0442\u0430\u0442\u044C\u0441\u044F \u043A\u043E\u043D\u0444\u043B\u0438\u043A\u0442\u0430\u043C\u0438")), React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: 16
    }
  }, React.createElement("div", null, !isNew && React.createElement(Btn, {
    variant: "danger",
    onClick: () => onDelete(person.id)
  }, "\u0423\u0434\u0430\u043B\u0438\u0442\u044C")), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, React.createElement(Btn, {
    variant: "ghost",
    onClick: onClose
  }, "\u041E\u0442\u043C\u0435\u043D\u0430"), React.createElement(Btn, {
    variant: "primary",
    onClick: handleSave
  }, "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C"))));
}
function ProjectsView(_ref23) {
  let data = _ref23.data,
    onUpdate = _ref23.onUpdate,
    onBatchUpdate = _ref23.onBatchUpdate,
    onDeleteProject = _ref23.onDeleteProject,
    onProjectSelect = _ref23.onProjectSelect,
    onSeriesSelect = _ref23.onSeriesSelect,
    canEdit = _ref23.canEdit,
    canDeleteStructure = _ref23.canDeleteStructure,
    isManager = _ref23.isManager,
    canManageProjectAssignments = _ref23.canManageProjectAssignments,
    canEditProjectById = _ref23.canEditProjectById,
    currentManagerEntry = _ref23.currentManagerEntry;
  const _useContext3 = useContext(StagesCtx),
    stages = _useContext3.sorted,
    stageGroups = _useContext3.stageGroups,
    groupMap = _useContext3.groupMap;
  const _useState37 = useState(null),
    _useState38 = _slicedToArray(_useState37, 2),
    modal = _useState38[0],
    setModal = _useState38[1];
  const _useState39 = useState(null),
    _useState40 = _slicedToArray(_useState39, 2),
    directEditSeries = _useState40[0],
    setDirectEditSeries = _useState40[1];
  const _useState41 = useState("все"),
    _useState42 = _slicedToArray(_useState41, 2),
    archFilter = _useState42[0],
    setArchFilter = _useState42[1];
  const _useState43 = useState(null),
    _useState44 = _slicedToArray(_useState43, 2),
    hoveredProj = _useState44[0],
    setHoveredProj = _useState44[1];
  const _useState45 = useState(null),
    _useState46 = _slicedToArray(_useState45, 2),
    hoveredSer = _useState46[0],
    setHoveredSer = _useState46[1];
  const _useState47 = useState(new Set()),
    _useState48 = _slicedToArray(_useState47, 2),
    collapsed = _useState48[0],
    setCollapsed = _useState48[1];
  const serDragRef = useRef(null);
  function saveProject(proj) {
    let projects = [...data.projects];
    const exists = proj.id && projects.find(p => p.id === proj.id);
    if (isManager && exists && !(canEditProjectById !== null && canEditProjectById !== void 0 && canEditProjectById(exists.id))) return;
    let final = exists ? proj : {
      ...proj,
      id: "pr" + Date.now(),
      dossier: proj.dossier || {}
    };
    if (isManager) {
      final = {
        ...final,
        status: exists ? exists.status || "\u0432 \u0440\u0430\u0431\u043e\u0442\u0435" : "\u0432 \u0440\u0430\u0431\u043e\u0442\u0435",
        managers: exists ? exists.managers || [] : [currentManagerEntry].filter(m => m && (m.uid || m.name))
      };
    }
    if (exists) projects = projects.map(p => p.id === proj.id ? final : p);else projects.push(final);
    onUpdate("projects", projects);
    setModal(null);
    incrSave("project", final);
  }
  const visProjects = useMemo(() => {
    if (archFilter === "архив") return data.projects.filter(p => p.status === "архив");
    if (archFilter === "в работе") return data.projects.filter(p => p.status !== "архив");
    return data.projects;
  }, [data.projects, archFilter]);
  return React.createElement("div", null, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
      flexWrap: "wrap",
      gap: 10
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      alignItems: "center"
    }
  }, React.createElement("span", {
    style: {
      fontSize: 16,
      fontWeight: 700
    }
  }, "\u041F\u0440\u043E\u0435\u043A\u0442\u044B"), React.createElement("div", {
    style: {
      display: "inline-flex",
      background: "#0f172a",
      borderRadius: 10,
      border: "1px solid #334155",
      overflow: "hidden",
      marginLeft: 8
    }
  }, [["все", "Все"], ["в работе", "В работе"], ["архив", "Архив"]].map(_ref24 => {
    let _ref25 = _slicedToArray(_ref24, 2),
      v = _ref25[0],
      l = _ref25[1];
    return React.createElement("button", {
      key: v,
      onClick: () => setArchFilter(v),
      style: {
        padding: "4px 12px",
        border: "none",
        cursor: "pointer",
        fontSize: 11,
        fontFamily: "inherit",
        background: archFilter === v ? "#3b82f6" : "transparent",
        color: archFilter === v ? "#fff" : "#64748b",
        fontWeight: archFilter === v ? 700 : 400
      }
    }, l);
  }))), canEdit && React.createElement(Btn, {
    variant: "primary",
    onClick: () => setModal({
      name: "",
      abbr: "",
      description: "",
      color: PALETTE[0],
      status: "\u0432 \u0440\u0430\u0431\u043e\u0442\u0435",
      managers: isManager ? [currentManagerEntry].filter(m => m && (m.uid || m.name)) : [],
      dossier: {}
    })
  }, "+ \u041D\u043E\u0432\u044B\u0439 \u043F\u0440\u043E\u0435\u043A\u0442")), (() => {
    const todayD = new Date();
    todayD.setHours(0, 0, 0, 0);
    const in7 = new Date(todayD);
    in7.setDate(todayD.getDate() + 7);
    const todStr = formatDate(todayD);
    const limStr = formatDate(in7);
    const upcoming = [];
    (data.series || []).forEach(ser => {
      const proj = data.projects.find(p => p.id === ser.projectId);
      if (!proj) return;
      getSeriesMilestoneEvents(ser, proj).forEach(m => {
        const date = m.date;
        if (date && daySort(date) >= daySort(todStr) && daySort(date) <= daySort(limStr)) upcoming.push({
          ser,
          proj,
          type: m.label,
          date,
          color: m.color
        });
      });
    });
    upcoming.sort((a, b) => daySort(a.date).localeCompare(daySort(b.date)));
    if (!upcoming.length) return null;
    const daysDiff = ds => {
      const d = parseDate(ds);
      if (!d) return "";
      const diff = Math.round((d - todayD) / 86400000);
      return diff === 0 ? "сегодня" : diff === 1 ? "завтра" : `через ${diff} дн.`;
    };
    return React.createElement("div", {
      style: {
        marginBottom: 16,
        padding: "10px 14px",
        background: "rgba(239,68,68,0.05)",
        border: "1px solid rgba(239,68,68,0.2)",
        borderRadius: 12
      }
    }, React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#f87171",
        fontWeight: 700,
        marginBottom: 8
      }
    }, "! \u0414\u0435\u0434\u043B\u0430\u0439\u043D\u044B \u2014 \u0431\u043B\u0438\u0436\u0430\u0439\u0448\u0438\u0435 7 \u0434\u043D\u0435\u0439"), React.createElement("div", {
      style: {
        display: "flex",
        gap: 6,
        overflowX: "auto",
        paddingBottom: 2
      }
    }, upcoming.map((u, i) => React.createElement("div", {
      key: i,
      onClick: () => {
        if (canEditProjectById !== null && canEditProjectById !== void 0 && canEditProjectById(u.proj.id)) setDirectEditSeries({
          ser: u.ser,
          proj: u.proj
        });
      },
      style: {
        background: `${u.color}18`,
        border: `1px solid ${u.color}55`,
        borderRadius: 12,
        padding: "6px 10px",
        fontSize: 11,
        cursor: "pointer",
        flexShrink: 0,
        minWidth: 110
      }
    }, React.createElement("div", {
      style: {
        color: u.color,
        fontWeight: 700,
        fontSize: 10,
        marginBottom: 2
      }
    }, u.type), React.createElement("div", {
      style: {
        color: "#e2e8f0",
        fontWeight: 600
      }
    }, u.proj.abbr || u.proj.name, " ", u.ser.name), React.createElement("div", {
      style: {
        color: "#64748b",
        fontSize: 10,
        marginTop: 2
      }
    }, u.date, " \xB7 ", daysDiff(u.date))))));
  })(), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, visProjects.map(proj => {
    const pTasks = data.tasks.filter(t => t.project === proj.id);
    const projSeries = (data.series || []).filter(s => s.projectId === proj.id).sort((a, b) => (a.order || 0) - (b.order || 0));
    const statusColors = {
      "в работе": "#3b82f6",
      "ожидаем": "#8b5cf6",
      "на паузе": "#f59e0b",
      "сдан": "#22c55e",
      "архив": "#475569"
    };
    return React.createElement("div", {
      key: proj.id,
      onDoubleClick: () => onProjectSelect && onProjectSelect(proj.id),
      onMouseEnter: () => setHoveredProj(proj.id),
      onMouseLeave: () => setHoveredProj(null),
      title: "\u0414\u0432\u043E\u0439\u043D\u043E\u0439 \u043A\u043B\u0438\u043A \u2014 \u043E\u0442\u043A\u0440\u044B\u0442\u044C \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0443 \u043F\u0440\u043E\u0435\u043A\u0442\u0430",
      style: {
        background: hoveredProj === proj.id ? "#243040" : "#1e293b",
        border: `1px solid ${hoveredProj === proj.id ? proj.color + "88" : proj.color + "44"}`,
        borderTop: `3px solid ${proj.color}`,
        borderRadius: 14,
        cursor: "pointer",
        transition: "background 0.15s,border-color 0.15s"
      }
    }, React.createElement("div", {
      style: {
        padding: "14px 18px",
        display: "flex",
        alignItems: "flex-start",
        gap: 12
      }
    }, React.createElement(ProjectMark, {
      project: proj,
      size: 12,
      style: {
        marginTop: 4,
        boxShadow: `0 0 8px ${proj.color}`
      }
    }), React.createElement("div", {
      style: {
        flex: 1
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 4,
        flexWrap: "wrap"
      }
    }, React.createElement("span", {
      style: {
        fontSize: 17,
        fontWeight: 700
      }
    }, proj.name), proj.abbr && React.createElement("span", {
      style: {
        fontSize: 11,
        background: "rgba(255,255,255,0.07)",
        border: "1px solid #334155",
        borderRadius: 4,
        padding: "1px 6px",
        color: "#64748b",
        fontFamily: "monospace"
      }
    }, proj.abbr), React.createElement("select", {
      value: proj.status || "в работе",
      onClick: e => e.stopPropagation(),
      onChange: e => {
        e.stopPropagation();
        if (!canManageProjectAssignments) return;
        const updated = data.projects.map(p => p.id === proj.id ? {
          ...p,
          status: e.target.value
        } : p);
        onUpdate("projects", updated);
      },
      style: {
        fontSize: 11,
        fontWeight: 700,
        background: `${statusColors[proj.status] || "#64748b"}22`,
        color: statusColors[proj.status] || "#64748b",
        border: `1px solid ${statusColors[proj.status] || "#64748b"}55`,
        borderRadius: 4,
        padding: "2px 6px",
        cursor: canManageProjectAssignments ? "pointer" : "default",
        outline: "none",
        appearance: "none",
        WebkitAppearance: "none"
      }
    }, PROJECT_STATUSES.map(s => React.createElement("option", {
      key: s.value || s,
      value: s.value || s,
      style: {
        background: "#1e293b",
        color: "#e2e8f0"
      }
    }, s.label || s))), proj.season && React.createElement("span", {
      style: {
        fontSize: 11,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid #334155",
        borderRadius: 4,
        padding: "1px 8px",
        color: "#64748b"
      }
    }, "\u0421\u0435\u0437\u043E\u043D ", proj.season)), proj.managers && proj.managers.length > 0 && React.createElement("div", {
      className: "ppt-project-managers-row"
    }, React.createElement("span", {
      className: "ppt-project-managers-label"
    }, "\u041c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u044b"), React.createElement("div", {
      className: "ppt-project-manager-chips"
    }, proj.managers.map((m, i) => {
      const name = m.name || m.uid || m;
      return React.createElement("span", {
        key: `${name}-${i}`,
        className: "ppt-project-manager-chip",
        title: name
      }, React.createElement("span", null, String(name || "?").trim().slice(0, 1).toUpperCase()), name);
    }))), proj.description && React.createElement("div", {
      className: "ppt-project-description-quote",
      title: proj.description
    }, proj.description), React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        alignItems: "center"
      }
    }, React.createElement("button", {
      onClick: e => {
        e.stopPropagation();
        setCollapsed(s => {
          const n = new Set(s);
          n.has(proj.id) ? n.delete(proj.id) : n.add(proj.id);
          return n;
        });
      },
      style: {
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: 11,
        color: "#94a3b8",
        padding: 0,
        display: "flex",
        alignItems: "center",
        gap: 4
      }
    }, React.createElement("span", null, collapsed.has(proj.id) ? "▶" : "▼"), React.createElement("span", {
      style: {
        background: "rgba(255,255,255,0.06)",
        border: "1px solid #334155",
        borderRadius: 4,
        padding: "2px 8px"
      }
    }, projSeries.length, " ", projSeries.length === 1 ? "серия" : projSeries.length >= 2 && projSeries.length <= 4 ? "серии" : "серий")), React.createElement("span", {
      style: {
        fontSize: 11,
        color: "#475569"
      }
    }, pTasks.length, " \u0437\u0430\u0434\u0430\u0447"), canEdit && (canEditProjectById === null || canEditProjectById === void 0 ? void 0 : canEditProjectById(proj.id)) && React.createElement("button", {
      onClick: e => {
        e.stopPropagation();
        setDirectEditSeries({
          ser: {
            name: "",
            shootStart: "",
            editStart: "",
            preOtkDate: "",
            otkDate: "",
            airMode: "weekly",
            airDay: 1,
            airTime: "21:00",
            syncStart: ""
          },
          proj
        });
      },
      style: {
        marginLeft: "auto",
        background: "#3b82f622",
        border: "1px solid #3b82f655",
        borderRadius: 4,
        color: "#3b82f6",
        fontSize: 11,
        padding: "2px 10px",
        cursor: "pointer",
        fontFamily: "inherit"
      }
    }, "+ \u0421\u0435\u0440\u0438\u044F")))), projSeries.length > 0 && !collapsed.has(proj.id) && React.createElement("div", {
      style: {
        padding: "0 18px 14px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
        gap: 6
      }
    }, projSeries.map(ser => {
      const todayStr = formatDate(new Date());
      const sTasks = pTasks.filter(t => t.series === ser.name && t.day === todayStr);
      const maxStageIdx = Math.max(...sTasks.map(t => stages.findIndex(s => s.id === t.status)).filter(x => x >= 0), -1);
      const autoStage = maxStageIdx >= 0 ? stages[maxStageIdx] : null;
      const autoGroupId = (autoStage === null || autoStage === void 0 ? void 0 : autoStage.groupId) || "";
      const autoGroup = autoGroupId ? groupMap[autoGroupId] : null;
      const autoGroupOrder = (autoGroup === null || autoGroup === void 0 ? void 0 : autoGroup.order) || 0;
      const manualGroupId = ser.manualStatus || "";
      const manualGroup = manualGroupId ? groupMap[manualGroupId] : null;
      const displayGroup = manualGroupId ? manualGroup : autoGroup;
      const displayStage = autoStage;
      const isManual = !!manualGroupId;
      const borderColor = displayStage ? displayStage.color : proj.color;
      function setManualStatus(gid) {
        const updSeries = (data.series || []).map(s => s.id === ser.id ? {
          ...s,
          manualStatus: gid || undefined
        } : s);
        onBatchUpdate({
          series: updSeries,
          tasks: data.tasks
        });
      }
      return React.createElement("div", {
        key: ser.id,
        draggable: true,
        onDragStart: e => {
          e.stopPropagation();
          serDragRef.current = {
            id: ser.id,
            projId: proj.id
          };
          e.dataTransfer.effectAllowed = "move";
        },
        onDragOver: e => {
          e.preventDefault();
          e.stopPropagation();
        },
        onDrop: e => {
          e.preventDefault();
          e.stopPropagation();
          const src = serDragRef.current;
          if (!src || src.projId !== proj.id || src.id === ser.id) return;
          const arr = [...projSeries];
          const si = arr.findIndex(s => s.id === src.id),
            ti = arr.findIndex(s => s.id === ser.id);
          if (si === -1 || ti === -1) return;
          const _arr$splice3 = arr.splice(si, 1),
            _arr$splice4 = _slicedToArray(_arr$splice3, 1),
            item = _arr$splice4[0];
          arr.splice(ti, 0, item);
          const others = (data.series || []).filter(s => s.projectId !== proj.id);
          onBatchUpdate({
            series: [...others, ...arr.map((s, i) => ({
              ...s,
              order: i
            }))],
            tasks: data.tasks
          });
          serDragRef.current = null;
        },
        onDragEnd: () => {
          serDragRef.current = null;
        },
        onDoubleClick: e => {
          if (!canEdit) return;
          e.stopPropagation();
          onSeriesSelect ? onSeriesSelect(ser.id) : setDirectEditSeries({
            ser,
            proj
          });
        },
        onMouseEnter: () => setHoveredSer(ser.id),
        onMouseLeave: () => setHoveredSer(null),
        title: "\u041F\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u044C \u2014 \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u043F\u043E\u0440\u044F\u0434\u043E\u043A \xB7 \u0414\u0432\u043E\u0439\u043D\u043E\u0439 \u043A\u043B\u0438\u043A \u2014 \u043E\u0442\u043A\u0440\u044B\u0442\u044C",
        style: {
          background: hoveredSer === ser.id ? "#1a2a3a" : "#0f172a",
          cursor: "grab",
          borderTop: `2px solid ${borderColor}`,
          border: hoveredSer === ser.id ? `1px solid ${borderColor}55` : "1px solid transparent",
          borderTopColor: borderColor,
          borderRadius: 10,
          padding: "10px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          transition: "background 0.15s,border-color 0.15s"
        }
      }, React.createElement("div", {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }
      }, React.createElement("span", {
        style: {
          fontWeight: 700,
          fontSize: 12
        }
      }, ser.name), React.createElement("span", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 4
        }
      }, isManual && React.createElement("span", {
        title: "\u0421\u0442\u0430\u0442\u0443\u0441 \u0437\u0430\u0434\u0430\u043D \u0432\u0440\u0443\u0447\u043D\u0443\u044E",
        style: {
          fontSize: 9,
          color: "#f59e0b"
        }
      }), React.createElement("span", {
        style: {
          fontSize: 9,
          color: "#334155",
          cursor: "grab"
        }
      }, "\u283F"))), React.createElement("span", {
        style: {
          fontSize: 11,
          fontWeight: 700,
          background: displayGroup ? `${borderColor}22` : "#1e293b",
          color: displayGroup ? borderColor : "#334155",
          border: `1px solid ${displayGroup ? borderColor + "44" : "#1e293b"}`,
          borderRadius: 4,
          padding: "3px 8px",
          textAlign: "center",
          display: "block"
        }
      }, displayGroup ? displayGroup.label : "—"), React.createElement("select", {
        value: manualGroupId,
        onClick: e => e.stopPropagation(),
        onDoubleClick: e => e.stopPropagation(),
        onChange: e => {
          e.stopPropagation();
          setManualStatus(e.target.value);
        },
        style: {
          fontSize: 10,
          background: "#0f172a",
          border: "1px solid #334155",
          color: "#475569",
          borderRadius: 4,
          padding: "2px 6px",
          cursor: "pointer",
          width: "100%"
        }
      }, React.createElement("option", {
        value: ""
      }, "\u0430\u0432\u0442\u043E"), stageGroups.map(g => React.createElement("option", {
        key: g.id,
        value: g.id
      }, g.label))), React.createElement("div", {
        style: {
          display: "flex",
          gap: 1
        }
      }, stageGroups.map(g => {
        const achieved = autoGroupOrder >= g.order;
        const isCur = (displayGroup === null || displayGroup === void 0 ? void 0 : displayGroup.id) === g.id;
        const stg = stages.find(s => s.groupId === g.id);
        const c = (stg === null || stg === void 0 ? void 0 : stg.color) || "#334155";
        return React.createElement("div", {
          key: g.id,
          title: g.label,
          style: {
            flex: 1,
            height: 3,
            borderRadius: 1,
            background: isCur ? c : achieved ? "#334155" : "#1e293b"
          }
        });
      })));
    })));
  })), modal && React.createElement(ProjectModal, {
    project: modal,
    data: data,
    canEdit: canEdit && (!modal.id || (canEditProjectById === null || canEditProjectById === void 0 ? void 0 : canEditProjectById(modal.id))),
    canDelete: canDeleteStructure,
    canEditStatus: canManageProjectAssignments,
    canEditManagers: canManageProjectAssignments,
    currentManagerEntry: currentManagerEntry,
    onSave: saveProject,
    onDelete: onDeleteProject,
    onClose: () => setModal(null)
  }), directEditSeries && React.createElement(SeriesModal, {
    series: directEditSeries.ser,
    project: directEditSeries.proj,
    data: data,
    canEdit: canEdit,
    onSave: ser => {
      let allS = [...(data.series || [])];
      const isNew = !ser.id || !allS.find(s => s.id === ser.id);
      let newTasks = data.tasks;
      if (isNew) {
        const final = {
          ...ser,
          id: "s" + Date.now(),
          projectId: directEditSeries.proj.id,
          order: allS.filter(s => s.projectId === directEditSeries.proj.id).length,
          checklists: [],
          notes: "",
          delivered: false,
          deliveredAt: "",
          assets: [],
          transitCode: "",
          transitVariants: ["", "", ""],
          syncStart: ser.syncStart || ""
        };
        allS.push(final);
        newTasks = data.tasks;
        onBatchUpdate({
          series: allS,
          tasks: newTasks
        });
        setDirectEditSeries(null);
        incrSave("series", final);
      } else {
        allS = allS.map(s => s.id === ser.id ? ser : s);
        onBatchUpdate({
          series: allS,
          tasks: newTasks
        });
        setDirectEditSeries(null);
        incrSave("series", ser);
      }
    },
    onClose: () => setDirectEditSeries(null)
  }));
}
function ManagerPicker(_ref26) {
  let value = _ref26.value,
    options = _ref26.options,
    onChange = _ref26.onChange;
  const _React$useState = React.useState(""),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    sel = _React$useState2[0],
    setSel = _React$useState2[1];
  function handleAdd(e) {
    const name = e.target.value;
    if (!name) return;
    const cur = value || [];
    const person = options.find(p => p.name === name);
    if (!cur.some(m => managerMatches(m, person || {
      id: name,
      name
    }))) {
      onChange([...cur, {
        uid: person ? person.id || name : name,
        name: name
      }]);
    }
    setSel("");
  }
  function managerMatches(m, person) {
    if (!m || !person) return false;
    return accessKey(m.uid) === accessKey(person.id) || accessKey(m.uid) === accessKey(person.name) || accessKey(m.name) === accessKey(person.name) || accessKey(m.name) === accessKey(person.id);
  }
  function removeManager(name) {
    onChange((value || []).filter(m => accessKey(m.uid) !== accessKey(name) && accessKey(m.name) !== accessKey(name) && accessKey(m) !== accessKey(name)));
  }
  const available = (options || []).filter(p => p.active !== false && !(value || []).some(m => managerMatches(m, p)));
  return React.createElement("div", null, React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 4,
      marginBottom: 6
    }
  }, (value || []).map(m => {
    const name = m.name || m.uid || m;
    return React.createElement("span", {
      key: name,
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: "rgba(30,41,59,.72)",
        border: "1px solid rgba(148,163,184,.18)",
        borderRadius: 10,
        padding: "2px 8px",
        fontSize: 12,
        color: "#e2e8f0"
      }
    }, name, React.createElement("span", {
      onClick: () => removeManager(name),
      style: {
        cursor: "pointer",
        color: "#ef4444",
        fontSize: 16,
        lineHeight: "12px",
        marginLeft: 2
      }
    }, "x"));
  })), React.createElement("select", {
    value: sel,
    onChange: handleAdd,
    style: {
      background: "#0f172a",
      border: "1px solid #334155",
      color: "#e2e8f0",
      borderRadius: 10,
      padding: "6px 10px",
      fontSize: 13,
      width: "100%"
    }
  }, React.createElement("option", {
    value: ""
  }, "--- Add Manager ---"), available.map(p => React.createElement("option", {
    key: p.name,
    value: p.name
  }, p.name))));
}
function ProjectModal(_ref27) {
  let project = _ref27.project,
    data = _ref27.data,
    onSave = _ref27.onSave,
    onDelete = _ref27.onDelete,
    onClose = _ref27.onClose,
    canEdit = _ref27.canEdit,
    canDelete = _ref27.canDelete,
    canEditStatus = _ref27.canEditStatus,
    canEditManagers = _ref27.canEditManagers,
    currentManagerEntry = _ref27.currentManagerEntry;
  const _useState49 = useState({
      ...project
    }),
    _useState50 = _slicedToArray(_useState49, 2),
    form = _useState50[0],
    setForm = _useState50[1];
  const isNew = !project.id;
  const f = form;
  const sf = v => setForm(p => ({
    ...p,
    ...v
  }));
  const readonlyManagers = f.managers && f.managers.length ? f.managers : [currentManagerEntry].filter(m => m && (m.uid || m.name));
  const managers = data.people.filter(p => p.active !== false && p.roles && (p.roles.includes("мнджр") || p.roles.includes("продюсер")));
  function handleSave() {
    if (!f.name.trim()) {
      alert("Введите название");
      return;
    }
    onSave(f);
  }
  return React.createElement(Modal, {
    title: isNew ? "Новый проект" : "Редактировать проект",
    onClose: onClose,
    onSubmit: handleSave
  }, React.createElement(Field, {
    label: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"
  }, React.createElement(Inp, {
    value: f.name,
    onChange: v => sf({
      name: v
    }),
    placeholder: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043F\u0440\u043E\u0435\u043A\u0442\u0430"
  })), React.createElement(Field, {
    label: "\u0410\u0431\u0431\u0440\u0435\u0432\u0438\u0430\u0442\u0443\u0440\u0430 (\u0434\u043B\u044F \u0413\u0430\u043D\u0442\u0430)"
  }, React.createElement(Inp, {
    value: f.abbr || "",
    onChange: v => sf({
      abbr: v
    }),
    placeholder: "\u0421\u0412",
    style: {
      width: 80
    }
  })), React.createElement(Field, {
    label: "\u0421\u0435\u0437\u043E\u043D"
  }, React.createElement(Inp, {
    value: f.season || "",
    onChange: v => sf({
      season: v.replace(/\D/g, "")
    }),
    placeholder: "1",
    style: {
      width: 80
    }
  })), React.createElement(Field, {
    label: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435"
  }, React.createElement("textarea", {
    value: f.description || "",
    onChange: e => sf({
      description: e.target.value
    }),
    placeholder: "\u041A\u0440\u0430\u0442\u043A\u043E\u0435 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435...",
    style: {
      background: "#0f172a",
      border: "1px solid #334155",
      color: "#e2e8f0",
      borderRadius: 10,
      padding: "7px 10px",
      fontSize: 13,
      width: "100%",
      resize: "vertical",
      minHeight: 60
    }
  })), React.createElement(Field, {
    label: PROJECT_VISUAL_TEXT.preview
  }, React.createElement(ProjectVisualPicker, {
    project: f,
    onColor: c => sf({
      color: c
    }),
    onVisual: visual => sf({
      dossier: {
        ...(f.dossier || {}),
        visual
      }
    })
  })), React.createElement(Field, {
    label: "\u0421\u0442\u0430\u0442\u0443\u0441"
  }, canEditStatus ? React.createElement(Sel, {
    value: f.status,
    onChange: v => sf({
      status: v
    }),
    options: PROJECT_STATUSES
  }) : React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#94a3b8",
      padding: "7px 10px",
      background: "#0f172a",
      border: "1px solid #334155",
      borderRadius: 10
    }
  }, f.status || "\u0432 \u0440\u0430\u0431\u043e\u0442\u0435")), React.createElement(Field, {
    label: "\u041c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u044b / \u041f\u0440\u043e\u0434\u044e\u0441\u0435\u0440\u044b"
  }, canEditManagers ? React.createElement(ManagerPicker, {
    value: f.managers || [],
    options: managers,
    onChange: v => sf({
      managers: v
    })
  }) : React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#94a3b8",
      padding: "7px 10px",
      background: "#0f172a",
      border: "1px solid #334155",
      borderRadius: 10
    }
  }, readonlyManagers.map(m => m.name || m.uid || m).filter(Boolean).join(", ") || "-")), React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: 20,
      borderTop: "1px solid #334155",
      paddingTop: 16
    }
  }, React.createElement("div", null, !isNew && canDelete && React.createElement(Btn, {
    variant: "danger",
    onClick: () => onDelete(project.id)
  }, "\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u043f\u0440\u043e\u0435\u043a\u0442")), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, React.createElement(Btn, {
    variant: "ghost",
    onClick: onClose
  }, "\u041E\u0442\u043C\u0435\u043D\u0430"), canEdit && React.createElement(Btn, {
    variant: "primary",
    onClick: handleSave
  }, isNew ? "Создать проект" : "Сохранить"))));
}
function SeriesListModal(_ref28) {
  let project = _ref28.project,
    data = _ref28.data,
    onSave = _ref28.onSave,
    onClose = _ref28.onClose,
    canDeleteStructure = _ref28.canDeleteStructure;
  const _useContext4 = useContext(StagesCtx),
    stages = _useContext4.sorted;
  const getSorted = () => (data.series || []).filter(s => s.projectId === project.id).sort((a, b) => (a.order || 0) - (b.order || 0));
  const _useState51 = useState(getSorted),
    _useState52 = _slicedToArray(_useState51, 2),
    local = _useState52[0],
    setLocal = _useState52[1];
  const _useState53 = useState(null),
    _useState54 = _slicedToArray(_useState53, 2),
    seriesEdit = _useState54[0],
    setSeriesEdit = _useState54[1];
  const dragIdx = useRef(null);
  useEffect(() => {
    setLocal(getSorted());
  }, [data.series, project.id]);
  function handleDragStart(idx) {
    dragIdx.current = idx;
  }
  function handleDragOver(e, idx) {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === idx) return;
    const arr = [...local];
    const _arr$splice5 = arr.splice(dragIdx.current, 1),
      _arr$splice6 = _slicedToArray(_arr$splice5, 1),
      item = _arr$splice6[0];
    arr.splice(idx, 0, item);
    dragIdx.current = idx;
    setLocal(arr);
  }
  function handleDrop() {
    dragIdx.current = null;
    const reordered = local.map((s, i) => ({
      ...s,
      order: i
    }));
    const others = (data.series || []).filter(s => s.projectId !== project.id);
    onSave({
      series: [...others, ...reordered]
    });
  }
  function saveSeries(serData) {
    if (!canEdit) return;
    let allS = [...(data.series || [])];
    let final;
    const existing = allS.find(s => s.id === serData.id);
    const oldName = existing === null || existing === void 0 ? void 0 : existing.name;
    if (serData.id && existing) {
      allS = allS.map(s => s.id === serData.id ? serData : s);
      final = serData;
    } else {
      final = {
        ...serData,
        id: "s" + Date.now(),
        order: allS.filter(s => s.projectId === project.id).length,
        transitCode: serData.transitCode || "",
        transitVariants: serData.transitVariants || ["", "", ""],
        checklists: [],
        notes: "",
        delivered: false,
        deliveredAt: "",
        assets: []
      };
      allS.push(final);
    }
    const isNew = !serData.id;
    let newTasks = data.tasks;
    if (!isNew && oldName && oldName !== final.name) newTasks = newTasks.map(t => t.seriesId === final.id && t.series === oldName ? {
      ...t,
      series: final.name
    } : t);
    onSave({
      series: allS,
      tasks: newTasks
    });
    setSeriesEdit(null);
    incrSave("series", final);
  }
  function deleteSeries(id) {
    if (!canDeleteStructure) return;
    if (!window.confirm("Удалить серию и все её задачи? Действие можно отменить через Ctrl+Z.")) return;
    onSave(deleteSeriesSnapshot(data, id));
    incrDelete("series", id);
  }
  const pTasks = data.tasks.filter(t => t.project === project.id);
  return React.createElement(Modal, {
    title: `Серии — ${project.name}`,
    onClose: onClose,
    wide: true
  }, React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, local.length === 0 && React.createElement("div", {
    style: {
      color: "#475569",
      fontSize: 13,
      textAlign: "center",
      padding: "20px 0"
    }
  }, "\u0421\u0435\u0440\u0438\u0439 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442. \u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u043F\u0435\u0440\u0432\u0443\u044E."), local.map((ser, idx) => {
    var _stages$maxOrder, _sTasks$;
    const sTasks = pTasks.filter(t => t.series === ser.name);
    const maxOrder = Math.max(...sTasks.map(t => stages.findIndex(s => s.id === t.status)).filter(x => x >= 0), -1);
    const curStatus = maxOrder >= 0 ? (_stages$maxOrder = stages[maxOrder]) === null || _stages$maxOrder === void 0 ? void 0 : _stages$maxOrder.id : ((_sTasks$ = sTasks[0]) === null || _sTasks$ === void 0 ? void 0 : _sTasks$.status) || "";
    return React.createElement("div", {
      key: ser.id,
      draggable: true,
      onDragStart: () => handleDragStart(idx),
      onDragOver: e => handleDragOver(e, idx),
      onDrop: handleDrop,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "#0f172a",
        border: "1px solid #334155",
        borderRadius: 12,
        padding: "10px 14px",
        marginBottom: 6,
        cursor: "grab",
        userSelect: "none"
      }
    }, React.createElement("span", {
      style: {
        color: "#334155",
        fontSize: 18,
        flexShrink: 0,
        lineHeight: 1
      }
    }, "\u283F"), React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 14,
        minWidth: 40,
        color: "#e2e8f0"
      }
    }, ser.name), React.createElement("div", {
      style: {
        flex: 1,
        display: "flex",
        gap: 14,
        flexWrap: "wrap",
        fontSize: 11,
        color: "#475569"
      }
    }, ser.editStart && React.createElement("span", null, "\u041C\u043E\u043D\u0442\u0430\u0436: ", React.createElement("span", {
      style: {
        color: "#94a3b8"
      }
    }, ser.editStart)), ser.otkDate && React.createElement("span", null, getProjectMilestoneMeta(project, 'otkDate', SERIES_MILESTONES.find(m => m.key === 'otkDate')).label, ": ", React.createElement("span", {
      style: {
        color: "#22c55e"
      }
    }, ser.otkDate)), ser.airDate && React.createElement("span", null, "\uD83D\uDCFA ", React.createElement("span", {
      style: {
        color: "#f59e0b"
      }
    }, ser.airDate))), React.createElement(StatusBadge, {
      s: curStatus,
      small: true
    }), canEdit && React.createElement(Btn, {
      small: true,
      variant: "ghost",
      onClick: e => {
        e.stopPropagation();
        setSeriesEdit(ser);
      }
    }, "\u0418\u0437\u043C"), canEdit && React.createElement(Btn, {
      small: true,
      variant: "danger",
      onClick: e => {
        e.stopPropagation();
        deleteSeries(ser.id);
      }
    }, "\xD7"));
  })), canEdit && React.createElement(Btn, {
    variant: "primary",
    onClick: () => setSeriesEdit({
      projectId: project.id,
      name: "",
      order: local.length,
      shootStart: "",
      shootEnd: "",
      editStart: "",
      preOtkDate: "",
      otkDate: "",
      airDate: "",
      airMode: "weekly",
      airDay: 1,
      airTime: "21:00"
    })
  }, "+ \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0441\u0435\u0440\u0438\u044E"), seriesEdit && React.createElement(SeriesModal, {
    series: seriesEdit,
    project: project,
    onSave: saveSeries,
    onClose: () => setSeriesEdit(null)
  }));
}
function SeriesModal(_ref29) {
  let series = _ref29.series,
    onSave = _ref29.onSave,
    onClose = _ref29.onClose,
    templates = _ref29.templates,
    project = _ref29.project;
  const holidays = useContext(HolidaysCtx);
  const _useState55 = useState({
      ...series
    }),
    _useState56 = _slicedToArray(_useState55, 2),
    form = _useState56[0],
    setForm = _useState56[1];
  const isNew = !series.id;
  const f = form;
  const sf = v => setForm(p => ({
    ...p,
    ...v
  }));
  const preOtkWarn = f.preOtkDate && isNonWorkday(f.preOtkDate, holidays);
  const otkWarn = f.otkDate && isNonWorkday(f.otkDate, holidays);
  const preOtkMeta = getProjectMilestoneMeta(project, 'preOtkDate', SERIES_MILESTONES.find(m => m.key === 'preOtkDate'));
  const otkMeta = getProjectMilestoneMeta(project, 'otkDate', SERIES_MILESTONES.find(m => m.key === 'otkDate'));
  function handleSave() {
    if (!f.name.trim()) {
      alert("Введите название серии");
      return;
    }
    onSave(f);
  }
  function applyTemplate(tmplId) {
    const t = (templates || []).find(x => x.id === tmplId);
    if (!t || !f.editStart) return;
    const totalPost = (t.editDays || 0) + (t.csoundDays || 0) + (t.corrDays || 0);
    const totalAll = totalPost + (t.masterDays || 0) + (t.otherDays || 0);
    const preOtk = addWorkdays(f.editStart, totalPost, holidays);
    const otk = addWorkdays(f.editStart, totalAll, holidays);
    sf({
      preOtkDate: preOtk,
      otkDate: otk
    });
  }
  return React.createElement(Modal, {
    title: isNew ? "Новая серия" : `Серия: ${series.name || "—"}`,
    onClose: onClose,
    wide: true,
    onSubmit: handleSave
  }, isNew && (templates === null || templates === void 0 ? void 0 : templates.length) > 0 && React.createElement("div", {
    style: {
      marginBottom: 16,
      padding: "10px 12px",
      background: "rgba(59,130,246,0.07)",
      border: "1px solid rgba(59,130,246,0.2)",
      borderRadius: 10,
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, React.createElement("span", {
    style: {
      fontSize: 12,
      color: "#64748b",
      flexShrink: 0
    }
  }, "\u0428\u0430\u0431\u043B\u043E\u043D:"), React.createElement("select", {
    onChange: e => {
      if (e.target.value) applyTemplate(e.target.value);
      e.target.value = "";
    },
    style: {
      background: "#0f172a",
      border: "1px solid #334155",
      borderRadius: 10,
      color: "#e2e8f0",
      padding: "5px 10px",
      fontSize: 12,
      flex: 1,
      cursor: "pointer"
    }
  }, React.createElement("option", {
    value: ""
  }, "\u2014 \u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C \u0448\u0430\u0431\u043B\u043E\u043D \u0434\u0430\u0442 \u2014"), (templates || []).map(t => React.createElement("option", {
    key: t.id,
    value: t.id
  }, t.name, " (", (t.editDays || 0) + (t.csoundDays || 0) + (t.corrDays || 0) + (t.masterDays || 0) + (t.otherDays || 0), "\u0434)"))), React.createElement("span", {
    style: {
      fontSize: 11,
      color: "#475569"
    }
  }, "\u2190 \u0437\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \xAB\u0421\u0442\u0430\u0440\u0442 \u043C\u043E\u043D\u0442\u0430\u0436\u0430\xBB \u043F\u0435\u0440\u0435\u0434 \u0432\u044B\u0431\u043E\u0440\u043E\u043C")), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 20
    }
  }, React.createElement("div", null, React.createElement(Field, {
    label: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0441\u0435\u0440\u0438\u0438"
  }, React.createElement(Inp, {
    value: f.name,
    onChange: v => sf({
      name: v
    }),
    placeholder: "\u042101"
  })), React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#64748b",
      letterSpacing: 1,
      marginBottom: 10
    }
  }, "\u0421\u042A\u0401\u041C\u041A\u0418"), React.createElement(Field, {
    label: "\u041D\u0430\u0447\u0430\u043B\u043E \u0441\u044A\u0451\u043C\u043E\u043A"
  }, React.createElement(InpDate, {
    value: f.shootStart || "",
    onChange: v => sf({
      shootStart: v
    })
  })), React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#64748b",
      letterSpacing: 1,
      margin: "14px 0 10px"
    }
  }, "\u0421\u0418\u041D\u0425\u0420\u0410"), React.createElement(Field, {
    label: "\u041D\u0430\u0447\u0430\u043B\u043E \u0441\u0438\u043D\u0445\u0440\u044B"
  }, React.createElement(InpDate, {
    value: f.syncStart || "",
    onChange: v => sf({
      syncStart: v
    })
  })), React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#64748b",
      letterSpacing: 1,
      margin: "14px 0 10px"
    }
  }, "\u041F\u041E\u0421\u0422\u041F\u0420\u041E\u0414\u0410\u041A\u0428\u041D"), React.createElement(Field, {
    label: "\u0421\u0442\u0430\u0440\u0442 \u043C\u043E\u043D\u0442\u0430\u0436\u0430"
  }, React.createElement(InpDate, {
    value: f.editStart || "",
    onChange: v => sf({
      editStart: v
    })
  })), React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#64748b",
      letterSpacing: 1,
      margin: "14px 0 10px"
    }
  }, "\u041A\u041B\u042E\u0427\u0415\u0412\u042B\u0415 \u0421\u041E\u0411\u042B\u0422\u0418\u042F"), React.createElement(Field, {
    label: "\u041E\u0442\u043F\u0440\u0430\u0432\u043A\u0430 \u0437\u0430\u043A\u0430\u0437\u0447\u0438\u043A\u0443"
  }, React.createElement(InpDate, {
    value: f.sendDate || "",
    onChange: v => sf({
      sendDate: v
    })
  })), React.createElement(Field, {
    label: preOtkMeta.label
  }, React.createElement(InpDate, {
    value: f.preOtkDate || "",
    onChange: v => sf({
      preOtkDate: v
    }),
    warn: preOtkWarn
  })), React.createElement(Field, {
    label: otkMeta.label
  }, React.createElement(InpDate, {
    value: f.otkDate || "",
    onChange: v => sf({
      otkDate: v
    }),
    warn: otkWarn
  })), React.createElement(Field, {
    label: "\u042D\u0444\u0438\u0440"
  }, React.createElement(InpDate, {
    value: f.airDate || "",
    onChange: v => sf({
      airDate: v
    })
  }))), React.createElement("div", null, isNew && React.createElement("div", {
    style: {
      background: "rgba(59,130,246,0.07)",
      border: "1px solid rgba(59,130,246,0.2)",
      borderRadius: 10,
      padding: "10px 12px",
      fontSize: 12,
      color: "#64748b"
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 600,
      color: "#94a3b8",
      marginBottom: 6
    }
  }, "\u0414\u0430\u0442\u044b \u0431\u0435\u0437 \u0430\u0432\u0442\u043e\u0441\u043c\u0435\u043d"), React.createElement("div", null, "\u0414\u0430\u0442\u044b \u0441\u0435\u0440\u0438\u0438 \u043f\u043e\u043f\u0430\u0434\u0443\u0442 \u0432 \u041a\u041f\u041f \u0438 \u043a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u044c. \u0421\u043c\u0435\u043d\u044b \u0441\u043e\u0437\u0434\u0430\u044e\u0442\u0441\u044f \u043e\u0442\u0434\u0435\u043b\u044c\u043d\u043e \u0432 \u0413\u0430\u043d\u0442\u0435.")), getSeriesMilestoneEvents(f, project).length > 0 && React.createElement("div", {
    style: {
      marginTop: isNew ? 12 : 0,
      background: "rgba(168,85,247,0.06)",
      border: "1px solid rgba(168,85,247,0.2)",
      borderRadius: 10,
      padding: "10px 12px",
      fontSize: 12,
      color: "#64748b"
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 600,
      color: "#94a3b8",
      marginBottom: 6
    }
  }, "\u041A\u043B\u044E\u0447\u0435\u0432\u044B\u0435 \u0441\u043E\u0431\u044B\u0442\u0438\u044F"), getSeriesMilestoneEvents(f, project).map(m => React.createElement("div", {
    key: m.key,
    style: {
      marginBottom: 3,
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: m.color,
      flexShrink: 0,
      display: "inline-block"
    }
  }), React.createElement("span", {
    style: {
      color: m.color,
      fontWeight: 600
    }
  }, m.label), React.createElement("span", null, "\u2192 ", m.date)))))), React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 8,
      marginTop: 20,
      borderTop: "1px solid #334155",
      paddingTop: 16
    }
  }, React.createElement(Btn, {
    variant: "ghost",
    onClick: onClose
  }, "\u041E\u0442\u043C\u0435\u043D\u0430"), React.createElement(Btn, {
    variant: "primary",
    onClick: handleSave
  }, isNew ? "Создать серию" : "Сохранить")));
}
function CalendarView(_ref30) {
  let data = _ref30.data,
    onGoToGantt = _ref30.onGoToGantt,
    canEdit = _ref30.canEdit;
  const today = new Date();
  const _useState57 = useState(today.getFullYear()),
    _useState58 = _slicedToArray(_useState57, 2),
    year = _useState58[0],
    setYear = _useState58[1];
  const _useState59 = useState(today.getMonth()),
    _useState60 = _slicedToArray(_useState59, 2),
    month = _useState60[0],
    setMonth = _useState60[1];
  const _useState61 = useState(null),
    _useState62 = _slicedToArray(_useState61, 2),
    selectedDay = _useState62[0],
    setSelectedDay = _useState62[1];
  const _useState63 = useState(null),
    _useState64 = _slicedToArray(_useState63, 2),
    hovDay = _useState64[0],
    setHovDay = _useState64[1];
  const _useState65 = useState(""),
    _useState66 = _slicedToArray(_useState65, 2),
    filterProject = _useState66[0],
    setFilterProject = _useState66[1];
  const _useState67 = useState(""),
    _useState68 = _slicedToArray(_useState67, 2),
    filterPerson = _useState68[0],
    setFilterPerson = _useState68[1];
  const _useContext5 = useContext(StagesCtx),
    stageMap = _useContext5.stageMap,
    stageGroups = _useContext5.stageGroups;
  useEffect(() => {
    const h = () => {
      setFilterProject("");
      setFilterPerson("");
    };
    window.addEventListener("ppt-escape", h);
    return () => window.removeEventListener("ppt-escape", h);
  }, []);
  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(y => y - 1);
    } else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(y => y + 1);
    } else setMonth(m => m + 1);
  }
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const filteredTasks = useMemo(() => data.tasks.filter(t => (!filterProject || t.project === filterProject) && (!filterPerson || t.person === filterPerson)), [data.tasks, filterProject, filterPerson]);
  const seriesList = useMemo(() => (data.series || []).filter(s => !filterProject || s.projectId === filterProject), [data.series, filterProject]);
  const calendarProjects = useMemo(() => filterProject ? data.projects.filter(p => p.id === filterProject) : data.projects, [data.projects, filterProject]);
  const calendarPeople = useMemo(() => [...new Set(data.tasks.map(t => t.person).filter(Boolean))].sort(), [data.tasks]);
  const allAirDates = {};
  seriesList.forEach(ser => {
    const proj = data.projects.find(p => p.id === ser.projectId);
    if (!proj) return;
    generateSeriesAirDates(ser).forEach(d => {
      if (!allAirDates[d]) allAirDates[d] = [];
      allAirDates[d].push({
        proj,
        ser
      });
    });
  });
  const milestones = {};
  seriesList.forEach(ser => {
    const proj = data.projects.find(p => p.id === ser.projectId);
    if (!proj) return;
    getSeriesMilestoneEvents(ser, proj).forEach(m => {
      const date = m.date;
      if (!date) return;
      if (!milestones[date]) milestones[date] = [];
      milestones[date].push({
        type: m.key,
        label: m.label,
        abbr: m.abbr || m.label,
        color: m.color,
        icon: m.icon || MILESTONE_ICON,
        proj,
        ser
      });
    });
  });
  const birthdays = {};
  (data.people || []).forEach(p => {
    if (filterPerson && p.name !== filterPerson) return;
    const bd = normalizeBirthday(p.birthday);
    if (!bd || p.active === false || p.deleted) return;
    const date = birthdayDateForYear(bd, year);
    const d = parseDate(date);
    if (!d || d.getMonth() !== month) return;
    if (!birthdays[date]) birthdays[date] = [];
    birthdays[date].push(p);
  });
  function dayStr(d) {
    if (!d) return null;
    return `${String(d).padStart(2, "0")}.${String(month + 1).padStart(2, "0")}.${year}`;
  }
  const todayStr = formatDate(today);
  const selStr = selectedDay ? dayStr(selectedDay) : null;
  const selTasks = selStr ? filteredTasks.filter(t => t.day === selStr) : [];
  const sortedSelTasks = useMemo(() => {
    const projectName = id => {
      const p = data.projects.find(x => x.id === id);
      return ((p === null || p === void 0 ? void 0 : p.name) || (p === null || p === void 0 ? void 0 : p.abbr) || id || "").toLowerCase();
    };
    return [...selTasks].sort((a, b) => projectName(a.project).localeCompare(projectName(b.project), "ru") || (Number(a.from) || 0) - (Number(b.from) || 0) || String(a.series || "").localeCompare(String(b.series || ""), "ru") || String(a.person || "").localeCompare(String(b.person || ""), "ru"));
  }, [selTasks, data.projects]);
  const selAirs = selStr ? allAirDates[selStr] || [] : [];
  const selMil = selStr ? milestones[selStr] || [] : [];
  const selBirthdays = selStr ? birthdays[selStr] || [] : [];
  const groupOrderMap = useMemo(() => Object.fromEntries((stageGroups || []).map(g => [g.id, g.order || 0])), [stageGroups]);
  const groupShapeMap = useMemo(() => {
    const shapes = ["circle", "square", "diamond", "bar", "triangle", "ring", "slash", "pill", "split", "dotline"];
    const map = {};
    (stageGroups || []).forEach((g, i) => {
      map[g.id] = shapes[i % shapes.length];
    });
    return map;
  }, [stageGroups]);
  function dayGroupMarkers(dayTasks) {
    const map = {};
    (dayTasks || []).forEach(t => {
      const st = (stageMap === null || stageMap === void 0 ? void 0 : stageMap[t.status]) || {};
      const gid = st.groupId || t.status || "other";
      const proj = data.projects.find(p => p.id === t.project);
      const group = (stageGroups || []).find(g => g.id === gid);
      if (!map[gid]) map[gid] = {
        id: gid,
        label: (group === null || group === void 0 ? void 0 : group.label) || st.label || t.status || "\u0421\u043c\u0435\u043d\u0430",
        color: st.color || (proj === null || proj === void 0 ? void 0 : proj.color) || "#64748b",
        count: 0,
        shape: groupShapeMap[gid] || "circle",
        order: groupOrderMap[gid] || 999
      };
      map[gid].count++;
    });
    return Object.values(map).sort((a, b) => a.order - b.order || a.label.localeCompare(b.label, "ru"));
  }
  return React.createElement("div", {
    className: "ppt-calendar-layout"
  }, React.createElement("div", null, React.createElement("div", {
    className: "ppt-calendar-toolbar"
  }, React.createElement(Btn, {
    variant: "ghost",
    onClick: prevMonth
  }, "\u2190"), React.createElement("span", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      minWidth: 200,
      textAlign: "center",
      color: "#f1f5f9"
    }
  }, MONTHS[month], " ", year), React.createElement(Btn, {
    variant: "ghost",
    onClick: nextMonth
  }, "\u2192"), React.createElement(Btn, {
    variant: "ghost",
    small: true,
    onClick: () => {
      setYear(today.getFullYear());
      setMonth(today.getMonth());
    }
  }, "\u0421\u0435\u0433\u043E\u0434\u043D\u044F"), React.createElement("input", {
    type: "month",
    value: `${year}-${String(month + 1).padStart(2, "0")}`,
    onChange: e => {
      const _e$target$value$split = e.target.value.split("-"),
        _e$target$value$split2 = _slicedToArray(_e$target$value$split, 2),
        y = _e$target$value$split2[0],
        m = _e$target$value$split2[1];
      if (y && m) {
        setYear(+y);
        setMonth(+m - 1);
      }
    },
    style: {
      background: "#0f172a",
      border: "1px solid #334155",
      color: "#e2e8f0",
      borderRadius: 10,
      padding: "5px 8px",
      fontSize: 12,
      cursor: "pointer"
    }
  }), React.createElement("select", {
    value: filterProject,
    onChange: e => setFilterProject(e.target.value),
    style: {
      background: "#0f172a",
      border: "1px solid #334155",
      color: filterProject ? "#e2e8f0" : "#64748b",
      borderRadius: 10,
      padding: "5px 8px",
      fontSize: 12,
      cursor: "pointer",
      maxWidth: 180
    }
  }, React.createElement("option", {
    value: ""
  }, "\u0412\u0441\u0435 \u043F\u0440\u043E\u0435\u043A\u0442\u044B"), data.projects.map(p => React.createElement("option", {
    key: p.id,
    value: p.id
  }, p.name))), React.createElement("select", {
    value: filterPerson,
    onChange: e => setFilterPerson(e.target.value),
    style: {
      background: "#0f172a",
      border: "1px solid #334155",
      color: filterPerson ? "#e2e8f0" : "#64748b",
      borderRadius: 10,
      padding: "5px 8px",
      fontSize: 12,
      cursor: "pointer",
      maxWidth: 180
    }
  }, React.createElement("option", {
    value: ""
  }, "\u0412\u0441\u0435 \u043B\u044E\u0434\u0438"), calendarPeople.map(p => React.createElement("option", {
    key: p,
    value: p
  }, p))), (filterProject || filterPerson) && React.createElement(Btn, {
    variant: "ghost",
    small: true,
    onClick: () => {
      setFilterProject("");
      setFilterPerson("");
    }
  }, "\u0421\u0431\u0440\u043E\u0441")), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(7,1fr)",
      gap: 2,
      marginBottom: 2
    }
  }, ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map(d => React.createElement("div", {
    key: d,
    style: {
      textAlign: "center",
      fontSize: 11,
      color: "#475569",
      padding: "4px 0"
    }
  }, d))), React.createElement("div", {
    className: "ppt-calendar-grid"
  }, cells.map((d, i) => {
    const ds = dayStr(d);
    const isToday = ds === todayStr;
    const isSel = d && selectedDay === d;
    const dayTasks = ds ? filteredTasks.filter(t => t.day === ds) : [];
    const dayAirs = ds ? allAirDates[ds] || [] : [];
    const dayMil = ds ? milestones[ds] || [] : [];
    const dayBirthdays = ds ? birthdays[ds] || [] : [];
    const groupMarkers = dayGroupMarkers(dayTasks);
    const compactEvents = [...dayAirs.map(x => ({
      ...x,
      kind: "air"
    })), ...dayMil.map(x => ({
      ...x,
      kind: "milestone"
    })), ...dayBirthdays.map(x => ({
      person: x,
      kind: "birthday"
    }))];
    const hiddenEventCount = Math.max(0, compactEvents.length - 4);
    return React.createElement("div", {
      key: i,
      className: "ppt-calendar-cell",
      onClick: () => d && setSelectedDay(isSel ? null : d),
      onMouseEnter: d && dayTasks.length ? e => setHovDay({
        ds,
        dayTasks,
        rect: e.currentTarget.getBoundingClientRect()
      }) : undefined,
      onMouseLeave: () => setHovDay(null),
      style: {
        background: isSel ? "#1e3a5f" : isToday ? "rgba(59,130,246,0.1)" : "#1e293b",
        border: `1px solid ${isSel ? "#3b82f6" : isToday ? "rgba(59,130,246,0.4)" : "#263352"}`,
        cursor: d ? "pointer" : "default",
        opacity: d ? 1 : 0.2
      }
    }, d && React.createElement(React.Fragment, null, React.createElement("div", {
      style: {
        fontSize: 11,
        color: isToday ? "#3b82f6" : "#475569",
        fontWeight: isToday ? 700 : 400,
        marginBottom: 3
      }
    }, d), React.createElement("div", {
      className: "ppt-calendar-stage-markers"
    }, groupMarkers.slice(0, 12).map(g => React.createElement("span", {
      key: g.id,
      className: `ppt-calendar-stage-marker ${g.shape}`,
      title: `${g.label}: ${g.count}`,
      style: {
        "--marker-color": g.color
      }
    })), groupMarkers.length > 12 && React.createElement("span", {
      className: "ppt-calendar-stage-more"
    }, "+", groupMarkers.length - 12)), React.createElement("div", {
      className: "ppt-calendar-cell-events"
    }, compactEvents.slice(0, 4).map((ev, ei) => {
      if (ev.kind === "air") return React.createElement("div", {
        key: `air-${ei}`,
        className: "ppt-calendar-event ppt-calendar-air",
        title: `\u042d\u0444\u0438\u0440: ${ev.proj.name} ${ev.ser.name}`
      }, React.createElement("span", null, "\u042d\u0444\u0438\u0440", " ", ev.proj.abbr || ev.proj.name, " ", ev.ser.name));
      if (ev.kind === "milestone") return React.createElement("div", {
        key: `mil-${ei}`,
        className: "ppt-calendar-event",
        title: `${ev.label}: ${ev.proj.name} ${ev.ser.name}`,
        style: {
          "--ppt-event-color": ev.color || "#a855f7",
          "--ppt-event-fill": `${ev.color || "#a855f7"}2f`,
          "--ppt-event-border": `${ev.color || "#a855f7"}66`,
          "--ppt-event-glow": `${ev.color || "#a855f7"}22`
        }
      }, React.createElement("span", null, ev.label, " ", ev.proj.abbr || ev.proj.name, " ", ev.ser.name));
      return React.createElement("div", {
        key: `bd-${ei}`,
        className: `ppt-calendar-event ppt-birthday-event ${ds === todayStr ? "ppt-birthday-today" : ""}`,
        title: `\u0414\u0435\u043d\u044c \u0440\u043e\u0436\u0434\u0435\u043d\u0438\u044f: ${ev.person.name}`
      }, React.createElement("span", null, "\u0414\u0420", " ", ev.person.name));
    }), hiddenEventCount > 0 && React.createElement("div", {
      className: "ppt-calendar-more-events"
    }, "+", hiddenEventCount, " ", "\u0441\u043e\u0431\u044b\u0442\u0438\u0439 \u043d\u0438\u0436\u0435")), dayTasks.length > 0 && React.createElement("div", {
      style: {
        fontSize: 9,
        color: "#475569",
        marginTop: 1
      }
    }, dayTasks.length, " \u0441\u043C\u0435\u043D")));
  })), React.createElement("div", {
    style: {
      marginTop: 12,
      display: "flex",
      gap: 16,
      flexWrap: "wrap"
    }
  }, calendarProjects.map(p => React.createElement("div", {
    key: p.id,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, React.createElement(ProjectMark, {
    project: p,
    size: 8
  }), React.createElement("span", {
    style: {
      fontSize: 10,
      color: "#475569"
    }
  }, p.name))), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, React.createElement("span", {
    style: {
      fontSize: 10,
      color: "#f59e0b"
    }
  }, "\uD83D\uDCFA"), React.createElement("span", {
    style: {
      fontSize: 10,
      color: "#475569"
    }
  }, "\u044D\u0444\u0438\u0440")), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, React.createElement("span", {
    style: {
      fontSize: 10,
      color: "#a855f7"
    }
  }, MILESTONE_ICON), React.createElement("span", {
    style: {
      fontSize: 10,
      color: "#475569"
    }
  }, "\u043A\u043B\u044E\u0447\u0435\u0432\u044B\u0435 \u0441\u043E\u0431\u044B\u0442\u0438\u044F")))), selStr && React.createElement("div", {
    className: "ppt-calendar-day-details"
  }, React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      color: "#93c5fd",
      marginBottom: 12
    }
  }, dayLabel(selStr)), React.createElement("div", {
    className: "ppt-calendar-detail-events"
  }, selAirs.map((_ref31, i) => {
    let proj = _ref31.proj,
      ser = _ref31.ser;
    return React.createElement("div", {
      key: proj.id + ser.id + i,
      className: "ppt-calendar-detail-event air"
    }, React.createElement("strong", null, "\u042d\u0444\u0438\u0440"), React.createElement("span", null, proj.name, " ", ser.name), ser.airTime && React.createElement("em", null, ser.airTime));
  }), selMil.map((m, i) => React.createElement("div", {
    key: i,
    className: "ppt-calendar-detail-event",
    style: {
      "--detail-color": m.color || "#94a3b8"
    }
  }, React.createElement("strong", null, m.label), React.createElement("span", null, m.proj.name, " ", m.ser.name))), selBirthdays.map((p, i) => React.createElement("div", {
    key: `bd-${p.id || p.name || i}`,
    className: `ppt-calendar-detail-event birthday ${selStr === todayStr ? "today" : ""}`,
    title: `\u0414\u0435\u043d\u044c \u0440\u043e\u0436\u0434\u0435\u043d\u0438\u044f: ${p.name}`
  }, React.createElement("strong", null, "\u0414\u0420"), React.createElement("span", null, p.name)))), selTasks.length === 0 && selAirs.length === 0 && selMil.length === 0 && selBirthdays.length === 0 && React.createElement("div", {
    style: {
      color: "#334155",
      fontSize: 12
    }
  }, "\u041d\u0435\u0442 \u0441\u043e\u0431\u044b\u0442\u0438\u0439"), selTasks.length > 0 && React.createElement("div", {
    className: "ppt-calendar-task-bricks"
  }, sortedSelTasks.map(t => {
    const proj = data.projects.find(p => p.id === t.project);
    const st = (stageMap === null || stageMap === void 0 ? void 0 : stageMap[t.status]) || {};
    const gid = st.groupId || t.status || "other";
    const group = (stageGroups || []).find(g => g.id === gid);
    const markerColor = st.color || (proj === null || proj === void 0 ? void 0 : proj.color) || "#64748b";
    const markerShape = groupShapeMap[gid] || "circle";
    return React.createElement("div", {
      key: t.id,
      className: "ppt-calendar-task-brick",
      onDoubleClick: () => onGoToGantt && onGoToGantt(t.day),
      title: onGoToGantt ? "\u0414\u0432\u043e\u0439\u043d\u043e\u0439 \u043a\u043b\u0438\u043a - \u043e\u0442\u043a\u0440\u044b\u0442\u044c \u0432 \u0413\u0430\u043d\u0442\u0435" : undefined,
      style: {
        "--task-color": markerColor
      }
    }, React.createElement("div", {
      className: "ppt-calendar-task-project"
    }, (proj === null || proj === void 0 ? void 0 : proj.name) || "\u0411\u0435\u0437 \u043f\u0440\u043e\u0435\u043a\u0442\u0430"), React.createElement("div", {
      className: "ppt-calendar-task-series"
    }, t.series || "\u0411\u0435\u0437 \u0441\u0435\u0440\u0438\u0438"), React.createElement("div", {
      className: "ppt-calendar-task-work"
    }, React.createElement("span", {
      className: "ppt-calendar-stage-marker " + markerShape,
      title: (group === null || group === void 0 ? void 0 : group.label) || st.label || t.status || "",
      style: {
        "--marker-color": markerColor
      }
    }), React.createElement("strong", null, st.label || t.status || "-"), React.createElement("em", null, fmtHour(t.from), "-", fmtHour(t.to))), React.createElement("div", {
      className: "ppt-calendar-task-person"
    }, t.person || "\u0431\u0435\u0437 \u0438\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044f"));
  }))), hovDay && !hovDay.single && React.createElement(CalendarDayTooltip, {
    dayTasks: hovDay.dayTasks,
    ds: hovDay.ds,
    rect: hovDay.rect,
    projects: data.projects
  }), (hovDay === null || hovDay === void 0 ? void 0 : hovDay.single) && React.createElement(TaskTooltip, {
    task: hovDay.task,
    rect: hovDay.rect,
    projects: data.projects
  }));
}
function CalendarDayTooltip(_ref32) {
  let dayTasks = _ref32.dayTasks,
    ds = _ref32.ds,
    rect = _ref32.rect,
    projects = _ref32.projects;
  const _useContext6 = useContext(StagesCtx),
    stageMap = _useContext6.stageMap;
  if (!(dayTasks !== null && dayTasks !== void 0 && dayTasks.length)) return null;
  const W = 260;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let left = rect.right + 8;
  if (left + W > vw - 16) left = rect.left - W - 8;
  let top = rect.top;
  if (top + dayTasks.length * 22 + 40 > vh - 16) top = Math.max(8, vh - dayTasks.length * 22 - 56);
  return React.createElement("div", {
    style: {
      position: "fixed",
      left,
      top,
      zIndex: 9999,
      width: W,
      background: "#0f172a",
      border: "1px solid #475569",
      borderRadius: 12,
      padding: "10px 14px",
      pointerEvents: "none",
      boxShadow: "0 8px 24px rgba(0,0,0,0.65)"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#64748b",
      letterSpacing: 1,
      marginBottom: 8
    }
  }, ds, " \xB7 ", dayTasks.length, " \u0441\u043C\u0435\u043D"), dayTasks.slice(0, 12).map((t, i) => {
    const st = stageMap[t.status];
    const c = projColor(projects, t.project);
    return React.createElement("div", {
      key: t.id,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 4
      }
    }, React.createElement("div", {
      style: {
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: c,
        flexShrink: 0
      }
    }), React.createElement("span", {
      style: {
        fontSize: 11,
        color: st ? st.color : "#94a3b8",
        fontWeight: 600,
        flexShrink: 0,
        minWidth: 90,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, (st === null || st === void 0 ? void 0 : st.label) || t.status), React.createElement("span", {
      style: {
        fontSize: 11,
        color: "#64748b",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, t.person || "—"), React.createElement("span", {
      style: {
        fontSize: 10,
        color: "#334155",
        flexShrink: 0,
        marginLeft: "auto"
      }
    }, t.from, "\u2013", t.to));
  }), dayTasks.length > 12 && React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#475569",
      marginTop: 4
    }
  }, "\u2026\u0435\u0449\u0451 ", dayTasks.length - 12));
}
function GanttTooltip(_ref33) {
  let task = _ref33.task,
    tasks = _ref33.tasks,
    rect = _ref33.rect,
    stageMap = _ref33.stageMap;
  const all = tasks || (task ? [task] : []);
  if (!all.length || !rect) return null;
  const W = 240;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let left = rect.right + 10;
  if (left + W > vw - 16) left = rect.left - W - 10;
  const estH = all.length > 1 ? 24 + all.length * 22 : 120;
  let top = rect.top;
  if (top + estH > vh - 16) top = Math.max(8, vh - estH - 8);
  if (all.length === 1) {
    const t = all[0];
    const st = stageMap[t.status];
    return React.createElement("div", {
      style: {
        position: "fixed",
        left,
        top,
        zIndex: 9999,
        width: W,
        background: "#1e293b",
        border: "1px solid #475569",
        borderRadius: 12,
        padding: "10px 14px",
        pointerEvents: "none",
        boxShadow: "0 8px 24px rgba(0,0,0,0.65)"
      }
    }, st && React.createElement("div", {
      style: {
        marginBottom: 6
      }
    }, React.createElement("span", {
      style: {
        background: colorToBg(st.color),
        border: `1px solid ${st.color}55`,
        borderRadius: 4,
        padding: "2px 8px",
        fontSize: 11,
        color: st.color,
        fontWeight: 600
      }
    }, st.label)), t.person && React.createElement("div", {
      style: {
        fontSize: 13,
        color: "#e2e8f0",
        marginBottom: 4,
        fontWeight: 600
      }
    }, t.person), React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#64748b",
        marginBottom: canSeeTaskNotes() && t.note ? 4 : 0
      }
    }, fmtHour(t.from), " \u2013 ", fmtHour(t.to), " \xB7 ", fmtDur(t.from, t.to)), canSeeTaskNotes() && t.note && React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#94a3b8",
        lineHeight: 1.4,
        marginTop: 4
      }
    }, t.note));
  }
  const st0 = stageMap[all[0].status];
  return React.createElement("div", {
    style: {
      position: "fixed",
      left,
      top,
      zIndex: 9999,
      width: W,
      background: "#1e293b",
      border: "1px solid #475569",
      borderRadius: 12,
      padding: "8px 12px",
      pointerEvents: "none",
      boxShadow: "0 8px 24px rgba(0,0,0,0.65)"
    }
  }, st0 && React.createElement("div", {
    style: {
      marginBottom: 6,
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, React.createElement("span", {
    style: {
      background: colorToBg(st0.color),
      border: `1px solid ${st0.color}55`,
      borderRadius: 4,
      padding: "2px 8px",
      fontSize: 11,
      color: st0.color,
      fontWeight: 600
    }
  }, st0.label), React.createElement("span", {
    style: {
      fontSize: 11,
      color: "#475569"
    }
  }, "\xD7 ", all.length)), all.map((t, i) => {
    const per = t.person || "—";
    return React.createElement("div", {
      key: t.id,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 0",
        borderTop: i > 0 ? "1px solid #1e293b" : undefined
      }
    }, React.createElement("span", {
      style: {
        fontSize: 11,
        color: "#94a3b8",
        flex: 1,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, per), React.createElement("span", {
      style: {
        fontSize: 10,
        color: "#475569",
        flexShrink: 0
      }
    }, t.from, "\u2013", t.to), canSeeTaskNotes() && t.note && React.createElement("span", {
      style: {
        fontSize: 9,
        color: "#334155",
        flexShrink: 0
      },
      title: t.note
    }, "\uD83D\uDCAC"));
  }));
}
function GanttView(_ref34) {
  let data = _ref34.data,
    onUpdate = _ref34.onUpdate,
    onBatchUpdate = _ref34.onBatchUpdate,
    onSeriesSelect = _ref34.onSeriesSelect,
    startDay = _ref34.startDay,
    onLog = _ref34.onLog,
    canEdit = _ref34.canEdit,
    canEditOldTasks = _ref34.canEditOldTasks,
    canEditProjectById = _ref34.canEditProjectById;
  const _useContext7 = useContext(StagesCtx),
    stages = _useContext7.sorted,
    stageMap = _useContext7.stageMap,
    groupMap = _useContext7.groupMap;
  const _useState69 = useState(() => {
      if (startDay) {
        const d = parseDate(startDay);
        if (!d) return 0;
        const today = new Date();
        const todayDay = today.getDay() || 7;
        const mon = new Date(today);
        mon.setDate(today.getDate() - todayDay + 1);
        mon.setHours(0, 0, 0, 0);
        return Math.floor((d - mon) / (7 * 24 * 60 * 60 * 1000));
      }
      return parseInt(sessionStorage.getItem("ganttWeek") || "0") || 0;
    }),
    _useState70 = _slicedToArray(_useState69, 2),
    weekOffset = _useState70[0],
    setWeekOffset = _useState70[1];
  const _useState71 = useState(null),
    _useState72 = _slicedToArray(_useState71, 2),
    taskModal = _useState72[0],
    setTaskModal = _useState72[1];
  const _useState73 = useState(new Set()),
    _useState74 = _slicedToArray(_useState73, 2),
    collapsedProjects = _useState74[0],
    setCollapsedProjects = _useState74[1];
  const _useState75 = useState(new Set()),
    _useState76 = _slicedToArray(_useState75, 2),
    expandedSeries = _useState76[0],
    setExpandedSeries = _useState76[1];
  const _useState77 = useState(null),
    _useState78 = _slicedToArray(_useState77, 2),
    hoverTask = _useState78[0],
    setHoverTask = _useState78[1];
  const _useState79 = useState(() => data.ganttOrder || null),
    _useState80 = _slicedToArray(_useState79, 2),
    projectOrder = _useState80[0],
    setProjectOrder = _useState80[1];
  const _useState81 = useState(""),
    _useState82 = _slicedToArray(_useState81, 2),
    ganttFilter = _useState82[0],
    setGanttFilter = _useState82[1];
  const _useState83 = useState(false),
    _useState84 = _slicedToArray(_useState83, 2),
    shiftTailMode = _useState84[0],
    setShiftTailMode = _useState84[1];
  const _useState85 = useState(new Set()),
    _useState86 = _slicedToArray(_useState85, 2),
    selectedTasks = _useState86[0],
    setSelectedTasks = _useState86[1];
  const _useState87 = useState(null),
    _useState88 = _slicedToArray(_useState87, 2),
    taskContextMenu = _useState88[0],
    setTaskContextMenu = _useState88[1];
  const _useState89 = useState(null),
    _useState90 = _slicedToArray(_useState89, 2),
    assignPersonModal = _useState90[0],
    setAssignPersonModal = _useState90[1];
  const _useState91 = useState(null),
    _useState92 = _slicedToArray(_useState91, 2),
    lassoRange = _useState92[0],
    setLassoRange = _useState92[1];
  const lassoRef = useRef(null);
  const dragRef = useRef(null);
  const shiftPressedRef = useRef(false);
  const projDragRef = useRef(null);
  const canWriteProject = projectId => !canEditProjectById || canEditProjectById(projectId);
  useEffect(() => {
    sessionStorage.setItem("ganttWeek", String(weekOffset));
  }, [weekOffset]);
  useEffect(() => {
    function h(e) {
      setTaskModal(e.detail || {});
    }
    window.addEventListener("gantt-new-task", h);
    return () => window.removeEventListener("gantt-new-task", h);
  }, []);
  useEffect(() => {
    function h(e) {
      if (e.key === "Escape") {
        setSelectedTasks(new Set());
        setTaskContextMenu(null);
        setAssignPersonModal(null);
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedTasks.size) {
        e.preventDefault();
        deleteSelectedTasks();
      }
    }
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [selectedTasks]);
  useEffect(() => {
    function close() {
      setTaskContextMenu(null);
    }
    window.addEventListener("click", close);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("scroll", close, true);
    };
  }, []);
  useEffect(() => {
    function down(e) {
      if (e.key === "Shift") shiftPressedRef.current = true;
    }
    function up(e) {
      if (e.key === "Shift") shiftPressedRef.current = false;
    }
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);
  const refMonday = useMemo(() => {
    const d = new Date();
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - day + 1 + weekOffset * 7);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [weekOffset]);
  const days = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 28; i++) {
      const d = new Date(refMonday);
      d.setDate(refMonday.getDate() + i);
      arr.push(formatDate(d));
    }
    return arr;
  }, [refMonday]);
  const todayStr = formatDate(new Date());
  const groupColorMap = useMemo(() => {
    const m = {};
    [...stages].sort((a, b) => (a.order || 0) - (b.order || 0)).forEach(s => {
      if (s.groupId && !m[s.groupId]) m[s.groupId] = s.color;
    });
    return m;
  }, [stages]);
  const orderedProjects = useMemo(() => {
    const active = data.projects.filter(p => p.status !== "архив");
    if (!projectOrder) return active;
    return [...projectOrder.map(id => active.find(p => p.id === id)).filter(Boolean), ...active.filter(p => !projectOrder.includes(p.id))];
  }, [data.projects, projectOrder]);
  const displayProjects = useMemo(() => ganttFilter ? orderedProjects.filter(p => p.id === ganttFilter) : orderedProjects, [orderedProjects, ganttFilter]);
  function toggleCollapse(projId) {
    setCollapsedProjects(prev => {
      const n = new Set(prev);
      n.has(projId) ? n.delete(projId) : n.add(projId);
      return n;
    });
  }
  function toggleExpandSer(key) {
    setExpandedSeries(prev => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  }
  function seriesKeysForProject(proj) {
    const projSeries = (data.series || []).filter(s => s.projectId === proj.id).map(s => s.name);
    const fromTasks = [...new Set((data.tasks || []).filter(t => t.project === proj.id).map(t => t.series))].filter(Boolean);
    return [...new Set([...projSeries, ...fromTasks])].map(name => `${proj.id}|${name}`);
  }
  function expandProjectFully(proj) {
    setCollapsedProjects(prev => {
      const n = new Set(prev);
      n.delete(proj.id);
      return n;
    });
    setExpandedSeries(prev => {
      const n = new Set(prev);
      seriesKeysForProject(proj).forEach(k => n.add(k));
      return n;
    });
  }
  function expandAllGantt() {
    setCollapsedProjects(new Set());
    setExpandedSeries(new Set(displayProjects.flatMap(p => seriesKeysForProject(p))));
  }
  useEffect(() => {
    function onUp() {
      if (!lassoRef.current) return;
      const _lassoRef$current = lassoRef.current,
        projId = _lassoRef$current.projId,
        serName = _lassoRef$current.serName,
        startDayIdx = _lassoRef$current.startDayIdx,
        endDayIdx = _lassoRef$current.endDayIdx;
      lassoRef.current = null;
      setLassoRange(null);
      if (startDayIdx === endDayIdx) return;
      const d1 = Math.min(startDayIdx, endDayIdx);
      const d2 = Math.max(startDayIdx, endDayIdx);
      const sel = new Set(data.tasks.filter(t => {
        const idx = days.indexOf(t.day);
        return t.project === projId && t.series === serName && idx >= d1 && idx <= d2;
      }).map(t => t.id));
      setSelectedTasks(sel);
    }
    document.addEventListener("mouseup", onUp);
    return () => document.removeEventListener("mouseup", onUp);
  }, [data.tasks, days]);
  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if (taskModal !== null) return;
      if (e.key === "ArrowRight") setWeekOffset(w => w + 1);else if (e.key === "ArrowLeft") setWeekOffset(w => w - 1);else if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedTasks.size > 0) deleteSelectedTasks();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [data.tasks, taskModal, selectedTasks]);
  function handleProjDragStart(e, projId) {
    projDragRef.current = projId;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", projId);
  }
  function handleProjDrop(e, targetId) {
    e.preventDefault();
    e.stopPropagation();
    const fromId = projDragRef.current;
    projDragRef.current = null;
    if (!fromId || fromId === targetId) return;
    const ids = orderedProjects.map(p => p.id);
    const fi = ids.indexOf(fromId);
    const ti = ids.indexOf(targetId);
    if (fi < 0 || ti < 0) return;
    const newIds = [...ids];
    newIds.splice(fi, 1);
    newIds.splice(ti, 0, fromId);
    setProjectOrder(newIds);
    onUpdate("ganttOrder", newIds);
  }
  function dropManualIfBeaten(seriesId, newTasks) {
    if (!seriesId) return null;
    const ser = (data.series || []).find(s => s.id === seriesId);
    if (!(ser !== null && ser !== void 0 && ser.manualStatus)) return null;
    const mg = groupMap[ser.manualStatus];
    if (!mg) return null;
    const todayStr = formatDate(new Date());
    const todayTasks = (newTasks || []).filter(t => !t.deleted && !t.cancelled && t.seriesId === seriesId && t.day === todayStr);
    if (!todayTasks.length) return null;
    const maxOrder = Math.max(...todayTasks.map(t => {
      var _stageMap$t$status;
      const g = (_stageMap$t$status = stageMap[t.status]) !== null && _stageMap$t$status !== void 0 && _stageMap$t$status.groupId ? groupMap[stageMap[t.status].groupId] : null;
      return (g === null || g === void 0 ? void 0 : g.order) || 0;
    }));
    if (maxOrder > mg.order) return (data.series || []).map(s => s.id === seriesId ? {
      ...s,
      manualStatus: ""
    } : s);
    return null;
  }
  function saveWithSeries(newTasks, seriesId) {
    const ns = dropManualIfBeaten(seriesId, newTasks);
    if (ns) onBatchUpdate({
      series: ns,
      tasks: newTasks
    });else onUpdate("tasks", newTasks);
  }
  function touchTask(task) {
    const ts = Date.now();
    return {
      ...task,
      updatedAt: new Date(ts).toISOString(),
      _updatedAt: ts,
      updatedBy: ""
    };
  }
  function oldTaskChangeBlocked() {
    return false;
  }
  function taskPersonName(task) {
    var _data$people;
    return ((_data$people = data.people) === null || _data$people === void 0 || (_data$people = _data$people.find(p => String(p.id) === String(task === null || task === void 0 ? void 0 : task.person))) === null || _data$people === void 0 ? void 0 : _data$people.name) || (task === null || task === void 0 ? void 0 : task.person) || "";
  }
  function taskPersonAbsent(task) {
    const name = taskPersonName(task);
    return !!(name && task !== null && task !== void 0 && task.day && absencesForPersonDay(data.personAbsences || [], data.people || [], name, task.day).length);
  }
  function warnAbsentTask(task) {
    const name = taskPersonName(task);
    const abs = absencesForPersonDay(data.personAbsences || [], data.people || [], name, task.day)[0];
    const ai = abs ? absenceTypeInfo(abs.type) : null;
    alert(`${name} уже отмечен как ${(ai === null || ai === void 0 ? void 0 : ai.label) || "отсутствует"} на ${task.day}. Сначала уберите отсутствие или выберите другого исполнителя.`);
  }
  function blockTasksWithAbsence(list) {
    const bad = (list || []).find(taskPersonAbsent);
    if (bad) {
      warnAbsentTask(bad);
      return true;
    }
    return false;
  }
  function saveTaskList(newTasks, seriesId, changedTasks) {
    let sourceTasks = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
    const changedList = changedTasks || [];
    const blockedProjectChange = changedList.some(t => {
      const old = (data.tasks || []).find(x => String(x.id) === String(t.id));
      return !canWriteProject(t.project) || old && old.project !== t.project && !canWriteProject(old.project);
    });
    if (blockedProjectChange) return;
    if (blockTasksWithAbsence(changedList)) return;
    if (oldTaskChangeBlocked(changedTasks, sourceTasks)) return;
    saveWithSeries(newTasks, seriesId);
    (changedTasks || []).forEach(t => incrSave("task", t));
  }
  function saveTask(task) {
    var _data$stages, _data$people2;
    if (!canWriteProject(task.project)) return;
    if (task.id) {
      const old = data.tasks.find(t => t.id === task.id);
      if (old && !canWriteProject(old.project)) return;
    }
    let tasks;
    let savedTask;
    if (task._cascadeAll) {
      const clean = {
        ...task
      };
      delete clean._cascadeAll;
      tasks = task._cascadeAll.map(t => t.id === clean.id ? clean : t);
      savedTask = tasks.find(t => t.id === clean.id);
      if (!savedTask) {
        savedTask = {
          ...clean,
          id: genTaskId(data.tasks)
        };
        tasks.push(savedTask);
      }
    } else {
      tasks = [...data.tasks];
      const exists = task.id && tasks.find(t => t.id === task.id);
      savedTask = exists ? task : {
        ...task,
        id: genTaskId(data.tasks)
      };
      if (exists) tasks = tasks.map(t => t.id === savedTask.id ? savedTask : t);else tasks.push(savedTask);
    }
    if (blockTasksWithAbsence([savedTask])) return;
    if (oldTaskChangeBlocked([savedTask], [task])) return;
    const now = new Date().toISOString();
    const ts = Date.now();
    savedTask = {
      ...savedTask,
      updatedAt: now,
      _updatedAt: ts,
      updatedBy: ""
    };
    tasks = tasks.map(t => t.id === savedTask.id ? savedTask : t);
    const stageLabel = ((_data$stages = data.stages) === null || _data$stages === void 0 || (_data$stages = _data$stages.find(s => s.id === savedTask.status)) === null || _data$stages === void 0 ? void 0 : _data$stages.label) || savedTask.status || "";
    const personName = ((_data$people2 = data.people) === null || _data$people2 === void 0 || (_data$people2 = _data$people2.find(p => p.id === savedTask.person)) === null || _data$people2 === void 0 ? void 0 : _data$people2.name) || savedTask.person || "";
    const isNew = !(task.id && data.tasks.find(t => t.id === task.id));
    onLog === null || onLog === void 0 || onLog(`${isNew ? "Задача" : "Изменена задача"}: ${stageLabel} · ${savedTask.series || ""} / ${personName} — ${savedTask.day}`);
    saveWithSeries(tasks, savedTask.seriesId);
    setTaskModal(null);
    incrSave("task", savedTask);
  }
  function deleteTask(id) {
    const t = data.tasks.find(x => x.id === id);
    if (t && !canWriteProject(t.project)) return;
    if (t) {
      var _data$stages2, _data$people3;
      const stageLabel = ((_data$stages2 = data.stages) === null || _data$stages2 === void 0 || (_data$stages2 = _data$stages2.find(s => s.id === t.status)) === null || _data$stages2 === void 0 ? void 0 : _data$stages2.label) || t.status || "";
      const personName = ((_data$people3 = data.people) === null || _data$people3 === void 0 || (_data$people3 = _data$people3.find(p => p.id === t.person)) === null || _data$people3 === void 0 ? void 0 : _data$people3.name) || t.person || "";
      onLog === null || onLog === void 0 || onLog(`Удалена задача: ${stageLabel} · ${t.series || ""} / ${personName} — ${t.day}`);
    }
    const ts = Date.now();
    if (oldTaskChangeBlocked([], t ? [t] : [])) return;
    onUpdate("tasks", data.tasks.map(t => t.id === id ? {
      ...t,
      deleted: true,
      _updatedAt: ts
    } : t));
    setTaskModal(null);
    incrDelete("task", id);
  }
  function taskById(id) {
    return (data.tasks || []).find(t => String(t.id) === String(id));
  }
  function writableTaskIds(ids) {
    return [...new Set(ids || [])].filter(id => {
      const t = taskById(id);
      return t && !t.deleted && canWriteProject(t.project);
    });
  }
  function openTaskContext(e, ids) {
    e.preventDefault();
    e.stopPropagation();
    const raw = [...new Set(ids || [])].filter(Boolean);
    const useSelected = selectedTasks.size > 1 && raw.some(id => selectedTasks.has(id));
    const allowed = writableTaskIds(useSelected ? [...selectedTasks] : raw);
    if (!allowed.length) return;
    setSelectedTasks(new Set(allowed));
    const menuW = 230,
      menuH = 150;
    setTaskContextMenu({
      x: Math.min(e.clientX, Math.max(8, window.innerWidth - menuW - 8)),
      y: Math.min(e.clientY, Math.max(8, window.innerHeight - menuH - 8)),
      ids: allowed
    });
    setHoverTask(null);
  }
  function closeTaskContext() {
    setTaskContextMenu(null);
  }
  function deleteTasksBulk(ids) {
    let requireConfirm = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    const allowed = writableTaskIds(ids);
    if (!allowed.length) return;
    if (requireConfirm && allowed.length > 1 && !window.confirm(`Удалить ${allowed.length} смен?`)) return;
    const idSet = new Set(allowed.map(String));
    const ts = Date.now();
    const source = (data.tasks || []).filter(t => idSet.has(String(t.id)));
    if (oldTaskChangeBlocked([], source)) return;
    source.forEach(t => {
      var _data$stages3, _data$people4;
      const stageLabel = ((_data$stages3 = data.stages) === null || _data$stages3 === void 0 || (_data$stages3 = _data$stages3.find(s => s.id === t.status)) === null || _data$stages3 === void 0 ? void 0 : _data$stages3.label) || t.status || "";
      const personName = ((_data$people4 = data.people) === null || _data$people4 === void 0 || (_data$people4 = _data$people4.find(p => p.id === t.person)) === null || _data$people4 === void 0 ? void 0 : _data$people4.name) || t.person || "";
      onLog === null || onLog === void 0 || onLog(`Удалена задача: ${stageLabel} · ${t.series || ""} / ${personName} — ${t.day}`);
      incrDelete("task", t.id);
    });
    onUpdate("tasks", data.tasks.map(t => idSet.has(String(t.id)) ? {
      ...t,
      deleted: true,
      _updatedAt: ts
    } : t));
    setSelectedTasks(new Set());
    closeTaskContext();
  }
  function clearTaskPeopleBulk(ids) {
    const allowed = writableTaskIds(ids);
    if (!allowed.length) return;
    if (allowed.length > 1 && !window.confirm(`Убрать исполнителей у ${allowed.length} смен?`)) return;
    const idSet = new Set(allowed.map(String));
    const originals = (data.tasks || []).filter(t => idSet.has(String(t.id)));
    const changed = [];
    const tasks = data.tasks.map(t => {
      if (!idSet.has(String(t.id))) return t;
      const nt = touchTask({
        ...t,
        person: ""
      });
      changed.push(nt);
      return nt;
    });
    saveTaskList(tasks, null, changed, originals);
    onLog === null || onLog === void 0 || onLog(allowed.length === 1 ? "Убран исполнитель со смены" : `Убраны исполнители у ${allowed.length} смен`);
    setSelectedTasks(new Set());
    closeTaskContext();
  }
  function deleteSelectedTasks() {
    deleteTasksBulk([...selectedTasks], true);
  }
  function openAssignPeopleBulk(ids) {
    const allowed = writableTaskIds(ids);
    if (!allowed.length) return;
    const source = (data.tasks || []).filter(t => allowed.map(String).includes(String(t.id)));
    let common = null;
    for (const t of source) {
      const names = new Set(filterPeopleByStatus(data.people || [], t.status, stages).filter(p => p.active !== false).map(p => p.name));
      common = common === null ? names : new Set([...common].filter(n => names.has(n)));
    }
    const people = [...(common || new Set())].sort((a, b) => String(a).localeCompare(String(b), "ru"));
    if (!people.length) {
      alert("\u0414\u043b\u044f \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u044b\u0445 \u0441\u043c\u0435\u043d \u043d\u0435\u0442 \u043e\u0431\u0449\u0435\u0433\u043e \u0441\u043f\u0438\u0441\u043a\u0430 \u0438\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u0435\u0439. \u042d\u0442\u0430\u043f\u044b \u0442\u0440\u0435\u0431\u0443\u044e\u0442 \u0440\u0430\u0437\u043d\u044b\u0435 \u0440\u043e\u043b\u0438.");
      closeTaskContext();
      return;
    }
    setAssignPersonModal({
      ids: allowed,
      people,
      person: people[0] || ""
    });
    closeTaskContext();
  }
  function assignPeopleBulk(ids, person) {
    if (!person) return;
    const allowed = writableTaskIds(ids);
    if (!allowed.length) return;
    const idSet = new Set(allowed.map(String));
    const originals = (data.tasks || []).filter(t => idSet.has(String(t.id)));
    const ts = Date.now();
    const changed = [];
    const tasks = (data.tasks || []).map(t => {
      if (!idSet.has(String(t.id))) return t;
      const nt = {
        ...t,
        person,
        updatedAt: new Date(ts).toISOString(),
        _updatedAt: ts,
        updatedBy: ""
      };
      changed.push(nt);
      return nt;
    });
    saveTaskList(tasks, null, changed, originals);
    onLog === null || onLog === void 0 || onLog(allowed.length === 1 ? "\u041d\u0430\u0437\u043d\u0430\u0447\u0435\u043d \u0438\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c: " + person : "\u041d\u0430\u0437\u043d\u0430\u0447\u0435\u043d \u0438\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c \u0434\u043b\u044f " + allowed.length + " \u0441\u043c\u0435\u043d: " + person);
    setSelectedTasks(new Set());
    setAssignPersonModal(null);
  }
  function handleDrop(e, row, d) {
    e.preventDefault();
    const drag = dragRef.current;
    if (!drag) return;
    if (!canWriteProject(row.projId)) {
      dragRef.current = null;
      return;
    }
    const task = drag.task,
      copy = drag.copy,
      multiTaskIds = drag.multiTaskIds,
      stretch = drag.stretch;
    dragRef.current = null;
    if (task && !copy && !canWriteProject(task.project)) return;
    const ser = (data.series || []).find(s => s.projectId === row.projId && s.name === row.series);
    const newSeriesId = (ser === null || ser === void 0 ? void 0 : ser.id) || null;
    if (drag.template) {
      const newTask = touchTask({
        id: genTaskId(data.tasks),
        project: row.projId,
        series: row.series,
        seriesId: newSeriesId,
        status: drag.status,
        day: d,
        from: 10,
        to: 19,
        person: "",
        note: "",
        autogenerated: false,
        unplanned: false
      });
      saveTaskList([...data.tasks, newTask], newSeriesId, [newTask], [task]);
      return;
    }
    if (copy && (!multiTaskIds || multiTaskIds.size <= 1)) {
      const newTask = touchTask({
        ...task,
        id: genTaskId(data.tasks),
        day: d,
        project: row.projId,
        series: row.series,
        seriesId: newSeriesId
      });
      delete newTask._cascadeAll;
      saveTaskList([...data.tasks, newTask], newSeriesId, [newTask]);
      return;
    }
    const diff = Math.round((parseDate(d) - parseDate(task.day)) / (1000 * 60 * 60 * 24));
    const stretchCopy = (stretch || e.shiftKey || shiftPressedRef.current) && diff !== 0;
    if (stretchCopy) {
      const ids = multiTaskIds && multiTaskIds.size ? multiTaskIds : new Set([task.id]);
      const source = data.tasks.filter(t => ids.has(t.id));
      const step = diff > 0 ? 1 : -1;
      const used = [...data.tasks];
      const newTasks = [];
      for (let off = step; step > 0 ? off <= diff : off >= diff; off += step) {
        source.forEach(t => {
          if (!canWriteProject(t.project)) return;
          const nt = touchTask({
            ...t,
            id: genTaskId(used),
            day: addDays(t.day, off),
            project: row.projId,
            series: row.series,
            seriesId: newSeriesId
          });
          delete nt._cascadeAll;
          used.push(nt);
          newTasks.push(nt);
        });
      }
      if (newTasks.length) saveTaskList([...data.tasks, ...newTasks], newSeriesId, newTasks, source);
      setSelectedTasks(new Set());
      return;
    }
    if (multiTaskIds && multiTaskIds.size > 1) {
      if (copy) {
        const used = [...data.tasks];
        const newTasks = data.tasks.filter(t => multiTaskIds.has(t.id)).map(t => {
          const nt = touchTask({
            ...t,
            id: genTaskId(used),
            day: addDays(t.day, diff),
            project: row.projId,
            series: row.series,
            seriesId: newSeriesId
          });
          used.push(nt);
          return nt;
        });
        saveTaskList([...data.tasks, ...newTasks], newSeriesId, newTasks, data.tasks.filter(t => multiTaskIds.has(t.id)));
      } else if (diff !== 0 || row.projId !== task.project || row.series !== task.series) {
        const changed = [];
        const tasks = data.tasks.map(t => {
          if (!multiTaskIds.has(t.id)) return t;
          const nt = touchTask({
            ...t,
            day: addDays(t.day, diff),
            project: row.projId,
            series: row.series,
            seriesId: newSeriesId
          });
          changed.push(nt);
          return nt;
        });
        saveTaskList(tasks, newSeriesId, changed);
      }
      setSelectedTasks(new Set());
      return;
    }
    if (d === task.day && row.projId === task.project && row.series === task.series) return;
    const taskDaySort = daySort(task.day);
    const hasTail = data.tasks.some(t => t.project === task.project && t.series === task.series && daySort(t.day) > taskDaySort && t.id !== task.id);
    const applyMove = cascade => {
      const changed = [];
      const tasks = data.tasks.map(t => {
        if (t.id === task.id) {
          const nt = touchTask({
            ...t,
            day: d,
            project: row.projId,
            series: row.series,
            seriesId: newSeriesId
          });
          changed.push(nt);
          return nt;
        }
        if (cascade && t.project === task.project && t.series === task.series && daySort(t.day) > taskDaySort) {
          const nt = touchTask({
            ...t,
            day: addDays(t.day, diff)
          });
          changed.push(nt);
          return nt;
        }
        return t;
      });
      saveTaskList(tasks, newSeriesId, changed);
    };
    applyMove(hasTail && diff !== 0 && shiftTailMode);
  }
  const COL = 78;
  function collapsedProjectDayItems(projectId, d) {
    const dayTasks = (data.tasks || []).filter(t => !t.deleted && !t.cancelled && t.project === projectId && t.day === d);
    const statuses = [...new Set(dayTasks.map(t => t.status).filter(Boolean))];
    return {
      statuses: statuses.slice(0, 5),
      count: dayTasks.length
    };
  }
  const monthSpans = useMemo(() => {
    const spans = [];
    days.forEach(d => {
      const pd = parseDate(d);
      const mk = `${pd.getFullYear()}-${pd.getMonth()}`;
      if (!spans.length || spans[spans.length - 1].key !== mk) spans.push({
        key: mk,
        label: MONTHS[pd.getMonth()],
        count: 1
      });else spans[spans.length - 1].count++;
    });
    return spans;
  }, [days]);
  return React.createElement("div", null, React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      alignItems: "center",
      marginBottom: 8,
      flexWrap: "wrap"
    }
  }, React.createElement(Btn, {
    variant: "ghost",
    onClick: () => setWeekOffset(w => w - 1)
  }, "\u2190 \u041F\u0440\u0435\u0434. \u043D\u0435\u0434\u0435\u043B\u044F"), React.createElement(Btn, {
    variant: "ghost",
    small: true,
    onClick: () => setWeekOffset(0)
  }, "\u0421\u0435\u0433\u043E\u0434\u043D\u044F"), React.createElement(Btn, {
    variant: "ghost",
    onClick: () => setWeekOffset(w => w + 1)
  }, "\u0421\u043B\u0435\u0434. \u043D\u0435\u0434\u0435\u043B\u044F \u2192"), React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      cursor: "pointer",
      background: "rgba(255,255,255,0.04)",
      borderRadius: 10,
      padding: "4px 10px",
      border: `1px solid ${shiftTailMode ? "#f59e0b33" : "#334155"}`,
      fontSize: 12,
      userSelect: "none"
    }
  }, React.createElement("input", {
    type: "checkbox",
    checked: shiftTailMode,
    onChange: e => setShiftTailMode(e.target.checked),
    style: {
      accentColor: "#f59e0b"
    }
  }), React.createElement("span", {
    style: {
      color: shiftTailMode ? "#f59e0b" : "#64748b"
    }
  }, "\u0421\u0434\u0432\u0438\u0433\u0430\u0442\u044C \u0445\u0432\u043E\u0441\u0442")), selectedTasks.size > 0 && React.createElement("span", {
    style: {
      fontSize: 12,
      color: "#60a5fa",
      background: "rgba(59,130,246,0.1)",
      borderRadius: 10,
      padding: "4px 10px",
      border: "1px solid rgba(59,130,246,0.3)",
      cursor: "default"
    },
    title: "Esc \u2014 \u0441\u043D\u044F\u0442\u044C \u0432\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u0435"
  }, "OK ", selectedTasks.size, " \u0432\u044B\u0431\u0440\u0430\u043D\u043E \xB7 Shift+\u043F\u0435\u0440\u0435\u0442\u0430\u0449\u0438 = \u043F\u0440\u043E\u0442\u044F\u043D\u0443\u0442\u044C \u043A\u043E\u043F\u0438\u0438 \xB7 Alt = \u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \xB7 Esc = \u0441\u043D\u044F\u0442\u044C"), React.createElement("select", {
    value: ganttFilter,
    onChange: e => setGanttFilter(e.target.value),
    style: {
      background: "rgba(30,41,59,.72)",
      border: "1px solid rgba(148,163,184,.18)",
      color: ganttFilter ? "#e2e8f0" : "#64748b",
      borderRadius: 10,
      padding: "4px 8px",
      fontSize: 12
    }
  }, React.createElement("option", {
    value: ""
  }, "\u0412\u0441\u0435 \u043F\u0440\u043E\u0435\u043A\u0442\u044B"), orderedProjects.map(p => React.createElement("option", {
    key: p.id,
    value: p.id
  }, p.abbr || p.name))), React.createElement(Btn, {
    variant: "ghost",
    small: true,
    onClick: () => {
      setCollapsedProjects(new Set(orderedProjects.map(p => p.id)));
      setExpandedSeries(new Set());
    }
  }, "\u0421\u0432\u0435\u0440\u043D\u0443\u0442\u044C \u0432\u0441\u0451"), React.createElement(Btn, {
    variant: "ghost",
    small: true,
    onClick: expandAllGantt
  }, "\u0420\u0430\u0437\u0432\u0435\u0440\u043D\u0443\u0442\u044C \u0432\u0441\u0451"), React.createElement("div", {
    style: {
      flex: 1
    }
  }), React.createElement(Btn, {
    variant: "primary",
    onClick: () => setTaskModal({})
  }, "+ \u0417\u0430\u0434\u0430\u0447\u0430")), React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      alignItems: "center",
      marginBottom: 12,
      flexWrap: "wrap"
    }
  }, React.createElement("span", {
    style: {
      fontSize: 10,
      color: "#475569",
      letterSpacing: 1,
      flexShrink: 0
    }
  }, "\u0428\u0410\u0411\u041B\u041E\u041D\u042B:"), GANTT_TEMPLATES.map(tmpl => {
    const st = stageMap[tmpl.status];
    return React.createElement("div", {
      key: tmpl.status,
      draggable: true,
      onDragStart: e => {
        dragRef.current = {
          template: true,
          status: tmpl.status
        };
        e.dataTransfer.effectAllowed = "copy";
      },
      onDragEnd: () => {
        dragRef.current = null;
      },
      title: `Перетащи на ячейку → создаст задачу "${tmpl.label}"`,
      style: {
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 9px",
        borderRadius: 5,
        cursor: "grab",
        userSelect: "none",
        fontSize: 11,
        fontWeight: 600,
        background: st ? stageBg(st.color) : "rgba(255,255,255,0.06)",
        border: `1px dashed ${st ? st.color : "#475569"}`,
        color: st ? st.color : "#94a3b8"
      }
    }, tmpl.label);
  })), React.createElement("div", {
    style: {
      overflow: "auto",
      maxHeight: "calc(100vh - 220px)",
      border: "1px solid #1e293b",
      borderRadius: 12
    },
    onMouseLeave: () => setHoverTask(null)
  }, React.createElement("div", {
    style: {
      minWidth: 200 + COL * 28
    }
  }, React.createElement("div", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 12
    }
  }, React.createElement("div", {
    style: {
      display: "flex"
    }
  }, React.createElement("div", {
    style: {
      width: 200,
      flexShrink: 0,
      height: 18,
      position: "sticky",
      left: 0,
      zIndex: 21,
      background: "#060d1a",
      borderBottom: "1px solid #0f172a",
      borderRight: "1px solid #334155"
    }
  }), monthSpans.map((span, si) => React.createElement("div", {
    key: span.key,
    style: {
      width: COL * span.count,
      flexShrink: 0,
      height: 18,
      display: "flex",
      alignItems: "center",
      paddingLeft: 6,
      background: "#060d1a",
      borderLeft: si === 0 ? "none" : "2px solid #334155",
      borderBottom: "1px solid #0f172a"
    }
  }, React.createElement("span", {
    style: {
      fontSize: 9,
      color: "#475569",
      letterSpacing: 1,
      textTransform: "uppercase"
    }
  }, span.label)))), React.createElement("div", {
    style: {
      display: "flex"
    }
  }, React.createElement("div", {
    style: {
      width: 200,
      flexShrink: 0,
      height: 44,
      position: "sticky",
      left: 0,
      zIndex: 20,
      background: "#0f172a",
      borderBottom: "1px solid #334155",
      borderRight: "1px solid #334155"
    }
  }), days.map(d => {
    const pd = parseDate(d);
    const isToday = d === todayStr;
    const isMon = pd && pd.getDay() === 1;
    const isSun = pd && pd.getDay() === 0;
    return React.createElement("div", {
      key: d,
      style: {
        width: COL,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: 44,
        background: isToday ? "rgba(59,130,246,0.2)" : isSun || isMon ? "#1e293b" : "#0f172a",
        borderLeft: isMon ? "2px solid #334155" : "1px solid #1e293b",
        borderBottom: "1px solid #334155"
      }
    }, React.createElement("span", {
      style: {
        fontSize: 9,
        color: "#475569"
      }
    }, WDAYS[(pd === null || pd === void 0 ? void 0 : pd.getDay()) || 0]), React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: isToday ? 700 : 400,
        color: isToday ? "#60a5fa" : "#64748b"
      }
    }, pd ? pd.getDate() : ""));
  }))), displayProjects.map((proj, pi) => {
    const isCollapsed = collapsedProjects.has(proj.id);
    const projSeries = (data.series || []).filter(s => s.projectId === proj.id).sort((a, b) => (a.order || 0) - (b.order || 0));
    const fromTasks = [...new Set(data.tasks.filter(t => t.project === proj.id).map(t => t.series))].filter(n => !projSeries.find(s => s.name === n)).sort();
    const allSeries = [...projSeries, ...fromTasks.map(n => ({
      id: n,
      name: n
    }))];
    return React.createElement(React.Fragment, {
      key: proj.id
    }, React.createElement("div", {
      draggable: true,
      onDragStart: e => handleProjDragStart(e, proj.id),
      onDragOver: e => {
        if (projDragRef.current && projDragRef.current !== proj.id) e.preventDefault();
      },
      onDrop: e => handleProjDrop(e, proj.id),
      onClick: e => {
        if (e.detail > 1) return;
        toggleCollapse(proj.id);
      },
      onDoubleClick: e => {
        e.preventDefault();
        expandProjectFully(proj);
      },
      style: {
        display: "flex",
        height: isCollapsed ? 26 : 36,
        background: "#05101f",
        cursor: "pointer",
        borderBottom: "1px solid #334155",
        userSelect: "none"
      }
    }, React.createElement("div", {
      style: {
        width: 200,
        flexShrink: 0,
        position: "sticky",
        left: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        padding: "0 10px",
        gap: 6,
        borderRight: "1px solid #475569",
        background: "#05101f"
      }
    }, React.createElement("span", {
      style: {
        fontSize: 14,
        color: "#334155",
        cursor: "grab",
        flexShrink: 0,
        lineHeight: 1
      },
      onMouseDown: e => e.stopPropagation()
    }, "\u283F"), React.createElement(ProjectMark, {
      project: proj,
      size: 9
    }), React.createElement("span", {
      style: {
        fontWeight: 700,
        fontSize: isCollapsed ? 11 : 12,
        color: "#94a3b8",
        flex: 1,
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis"
      }
    }, proj.name), isCollapsed && React.createElement("span", {
      style: {
        fontSize: 9,
        color: "#475569",
        flexShrink: 0,
        marginRight: 2
      }
    }, allSeries.length, " \u0441\u0435\u0440."), React.createElement("span", {
      style: {
        fontSize: 9,
        color: "#475569",
        flexShrink: 0
      }
    }, isCollapsed ? "▶" : "▼")), days.map(d => {
      const dayItems = collapsedProjectDayItems(proj.id, d);
      return React.createElement("div", {
        key: d,
        style: {
          width: COL,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          overflow: "hidden"
        }
      }, dayItems.statuses.map(stId => {
        const st = stageMap[stId];
        return React.createElement("span", {
          key: stId,
          title: (st === null || st === void 0 ? void 0 : st.label) || stId,
          style: {
            width: 6,
            height: 6,
            borderRadius: 2,
            background: (st === null || st === void 0 ? void 0 : st.color) || proj.color,
            opacity: 0.9,
            display: "inline-block"
          }
        });
      }), dayItems.count > dayItems.statuses.length && React.createElement("span", {
        style: {
          fontSize: 8,
          color: "#475569",
          lineHeight: 1
        }
      }, "+"));
    })), !isCollapsed && allSeries.map((ser, si) => {
      const serKey = `${proj.id}|${ser.name}`;
      const isExpanded = expandedSeries.has(serKey);
      const rowH = isExpanded ? 90 : 52;
      const seriesTasks = data.tasks.filter(t => t.project === proj.id && t.series === ser.name);
      const isRealSer = !!ser.projectId;
      const isDelivered = !!ser.delivered;
      return React.createElement("div", {
        key: serKey,
        style: {
          display: "flex",
          minHeight: rowH,
          height: "auto",
          background: si % 2 === 0 ? "#0a1220" : "#060d1a",
          borderBottom: "1px solid #1e293b",
          opacity: isDelivered ? 0.5 : 1,
          alignItems: "stretch"
        }
      }, React.createElement("div", {
        onClick: () => toggleExpandSer(serKey),
        onDoubleClick: () => {
          if (isRealSer && onSeriesSelect) onSeriesSelect(ser.id);
        },
        title: isRealSer ? "Двойной клик — открыть карточку серии" : "",
        style: {
          width: 200,
          flexShrink: 0,
          position: "sticky",
          left: 0,
          zIndex: 5,
          display: "flex",
          alignItems: "center",
          padding: "0 8px 0 22px",
          borderRight: "1px solid #334155",
          cursor: "pointer",
          background: si % 2 === 0 ? "#0f172a" : "#0a1220"
        }
      }, React.createElement("div", {
        style: {
          width: 3,
          height: 22,
          borderRadius: 2,
          background: isDelivered ? "#22c55e" : proj.color,
          marginRight: 8,
          flexShrink: 0,
          opacity: 0.55
        }
      }), React.createElement("div", {
        style: {
          flex: 1,
          overflow: "hidden"
        }
      }, React.createElement("div", {
        style: {
          fontSize: 12,
          fontWeight: 600,
          color: isDelivered ? "#475569" : "#cbd5e1",
          display: "flex",
          alignItems: "center",
          gap: 4
        }
      }, ser.name, isDelivered && React.createElement("span", {
        style: {
          fontSize: 9,
          color: "#22c55e"
        }
      }, "OK"), React.createElement("span", {
        style: {
          fontSize: 8,
          color: isExpanded ? "#3b82f6" : "#334155"
        }
      }, isExpanded ? "▲" : "▼")), isExpanded && React.createElement("div", {
        style: {
          fontSize: 9,
          color: "#475569",
          marginTop: 1
        }
      }, seriesTasks.length, " \u0437\u0430\u0434\u0430\u0447 \xB7 \u043A\u043B\u0438\u043A \u0434\u043B\u044F \u0441\u0432\u0451\u0440\u0442\u043A\u0438"))), days.map((d, dIdx) => {
        const cellTasks = seriesTasks.filter(t => t.day === d);
        const isToday = d === todayStr;
        const pd = parseDate(d);
        const isMon = (pd === null || pd === void 0 ? void 0 : pd.getDay()) === 1;
        const isInLasso = lassoRange && lassoRange.projId === proj.id && lassoRange.serName === ser.name && dIdx >= lassoRange.minIdx && dIdx <= lassoRange.maxIdx;
        return React.createElement("div", {
          key: d,
          onClick: () => {
            if (selectedTasks.size > 0) {
              setSelectedTasks(new Set());
              return;
            }
          },
          onDoubleClick: () => {
            if (!canWriteProject(proj.id)) return;
            setTaskModal({
              project: proj.id,
              series: ser.name,
              day: d,
              _fixedProject: true
            });
          },
          onMouseDown: e => {
            if (e.button !== 0) return;
            lassoRef.current = {
              projId: proj.id,
              serName: ser.name,
              startDayIdx: dIdx,
              endDayIdx: dIdx
            };
          },
          onMouseEnter: e => {
            if (lassoRef.current && lassoRef.current.projId === proj.id && lassoRef.current.serName === ser.name) {
              lassoRef.current.endDayIdx = dIdx;
              const _ref35 = [lassoRef.current.startDayIdx, dIdx],
                a = _ref35[0],
                b = _ref35[1];
              setLassoRange({
                projId: proj.id,
                serName: ser.name,
                minIdx: Math.min(a, b),
                maxIdx: Math.max(a, b)
              });
            } else if (!dragRef.current) {
              e.currentTarget.style.background = isToday ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.03)";
            }
          },
          onMouseLeave: e => {
            if (!lassoRef.current) e.currentTarget.style.background = isInLasso ? "rgba(59,130,246,0.15)" : isToday ? "rgba(59,130,246,0.06)" : "transparent";
          },
          onDragOver: e => {
            var _dragRef$current, _dragRef$current2;
            if (!canWriteProject(proj.id)) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = (_dragRef$current = dragRef.current) !== null && _dragRef$current !== void 0 && _dragRef$current.copy || (_dragRef$current2 = dragRef.current) !== null && _dragRef$current2 !== void 0 && _dragRef$current2.template ? "copy" : "move";
          },
          onDrop: e => handleDrop(e, {
            projId: proj.id,
            series: ser.name
          }, d),
          style: {
            width: COL,
            flexShrink: 0,
            borderLeft: isMon ? "2px solid #334155" : "1px solid #1e293b",
            padding: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            cursor: "pointer",
            overflow: "visible",
            background: isInLasso ? "rgba(59,130,246,0.18)" : isToday ? "rgba(59,130,246,0.06)" : "transparent",
            transition: "background 0.1s",
            userSelect: "none"
          }
        }, isRealSer && getSeriesMilestoneEvents(ser, proj).filter(m => m.date === d).map(m => React.createElement("div", {
          key: m.key,
          title: `${m.label}: ${m.date}`,
          style: {
            background: m.color,
            borderRadius: 2,
            color: "#000",
            fontSize: 8,
            padding: "0 3px",
            textAlign: "center",
            fontWeight: 800,
            flexShrink: 0,
            opacity: 0.88,
            letterSpacing: 0.3,
            pointerEvents: "none"
          }
        }, m.abbr || m.label)), isExpanded ? cellTasks.map(t => {
          const st = stageMap[t.status];
          const grpColor = st !== null && st !== void 0 && st.groupId ? groupColorMap[st.groupId] : undefined;
          const barColor = grpColor || proj.color;
          const isSel = selectedTasks.has(t.id);
          return React.createElement("div", {
            key: t.id,
            draggable: true,
            onMouseDown: e => e.stopPropagation(),
            onDragStart: e => {
              e.stopPropagation();
              const multi = isSel && selectedTasks.size > 1 ? selectedTasks : null;
              dragRef.current = {
                task: t,
                copy: e.altKey,
                stretch: e.shiftKey || shiftPressedRef.current,
                multiTaskIds: multi
              };
              e.dataTransfer.effectAllowed = e.altKey ? "copy" : "move";
            },
            onDragEnd: () => {
              dragRef.current = null;
            },
            onClick: e => {
              e.stopPropagation();
              if (e.shiftKey) {
                setSelectedTasks(prev => {
                  const n = new Set(prev);
                  n.has(t.id) ? n.delete(t.id) : n.add(t.id);
                  return n;
                });
              } else {
                setTaskModal(t);
              }
            },
            onContextMenu: e => openTaskContext(e, [t.id]),
            onMouseEnter: e => {
              e.stopPropagation();
              setHoverTask({
                task: t,
                rect: e.currentTarget.getBoundingClientRect()
              });
            },
            onMouseLeave: e => {
              e.stopPropagation();
              setHoverTask(null);
            },
            style: {
              position: "relative",
              background: t.cancelled ? "rgba(71,85,105,0.12)" : isSel ? `${(st === null || st === void 0 ? void 0 : st.color) || "#3b82f6"}33` : st ? stageBg(st.color) : "rgba(255,255,255,0.08)",
              border: t.cancelled ? "1px dashed #475569" : isSel ? `2px solid ${(st === null || st === void 0 ? void 0 : st.color) || "#3b82f6"}` : `1px solid ${st ? stageBorder(st.color) : "#334155"}`,
              borderLeft: `3px solid ${t.cancelled ? "#475569" : grpColor || proj.color}`,
              borderRadius: 3,
              flexShrink: 0,
              overflow: "hidden",
              color: t.cancelled ? "#64748b" : st ? st.color : "#94a3b8",
              cursor: "grab",
              userSelect: "none",
              padding: "3px 5px"
            }
          }, t.cancelled && React.createElement("span", {
            style: {
              position: "absolute",
              top: 1,
              right: 2,
              fontSize: 7,
              lineHeight: 1
            }
          }, "\uD83D\uDEAB"), React.createElement("div", {
            style: {
              fontSize: 9,
              lineHeight: 1.4
            }
          }, React.createElement("div", {
            style: {
              fontWeight: 700,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              textDecoration: t.cancelled ? "line-through" : "none"
            }
          }, (st === null || st === void 0 ? void 0 : st.abbr) || (st === null || st === void 0 ? void 0 : st.label) || t.status), React.createElement("div", {
            style: {
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              opacity: 0.85
            }
          }, t.person || "—"), React.createElement("div", {
            style: {
              fontSize: 8,
              opacity: 0.6
            }
          }, t.from, "\u2013", t.to)));
        }) : (() => {
          const activeCT = cellTasks.filter(t => !t.cancelled);
          const cancelledCnt = cellTasks.length - activeCT.length;
          const groups = {};
          activeCT.forEach(t => {
            if (!groups[t.status]) groups[t.status] = [];
            groups[t.status].push(t);
          });
          const badges = Object.entries(groups).map(_ref36 => {
            let _ref37 = _slicedToArray(_ref36, 2),
              status = _ref37[0],
              grpTasks = _ref37[1];
            const st = stageMap[status];
            const grpColor = st !== null && st !== void 0 && st.groupId ? groupColorMap[st.groupId] : undefined;
            const barColor = grpColor || proj.color;
            const count = grpTasks.length;
            const isSel = grpTasks.some(t => selectedTasks.has(t.id));
            return React.createElement("div", {
              key: status,
              draggable: true,
              onMouseDown: e => e.stopPropagation(),
              onDragStart: e => {
                e.stopPropagation();
                const t0 = grpTasks[0];
                const multi = count > 1 ? new Set(grpTasks.map(t => t.id)) : isSel && selectedTasks.size > 1 ? selectedTasks : null;
                dragRef.current = {
                  task: t0,
                  copy: e.altKey,
                  stretch: e.shiftKey || shiftPressedRef.current,
                  multiTaskIds: multi
                };
                e.dataTransfer.effectAllowed = e.altKey ? "copy" : "move";
              },
              onDragEnd: () => {
                dragRef.current = null;
              },
              onClick: e => {
                e.stopPropagation();
                if (count === 1) {
                  if (e.shiftKey) {
                    setSelectedTasks(prev => {
                      const n = new Set(prev);
                      n.has(grpTasks[0].id) ? n.delete(grpTasks[0].id) : n.add(grpTasks[0].id);
                      return n;
                    });
                  } else setTaskModal(grpTasks[0]);
                } else setTaskModal(grpTasks[0]);
              },
              onContextMenu: e => openTaskContext(e, grpTasks.map(t => t.id)),
              onMouseEnter: e => {
                e.stopPropagation();
                setHoverTask({
                  tasks: grpTasks,
                  rect: e.currentTarget.getBoundingClientRect()
                });
              },
              onMouseLeave: e => {
                e.stopPropagation();
                setHoverTask(null);
              },
              style: {
                background: isSel ? `${(st === null || st === void 0 ? void 0 : st.color) || "#3b82f6"}33` : st ? stageBg(st.color) : "rgba(255,255,255,0.08)",
                border: isSel ? `2px solid ${(st === null || st === void 0 ? void 0 : st.color) || "#3b82f6"}` : `1px solid ${st ? stageBorder(st.color) : "#334155"}`,
                borderLeft: `3px solid ${barColor}`,
                borderRadius: 3,
                flexShrink: 0,
                overflow: "hidden",
                color: st ? st.color : "#94a3b8",
                cursor: "grab",
                userSelect: "none",
                padding: "1px 3px"
              }
            }, React.createElement("div", {
              style: {
                fontSize: 9,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "flex",
                alignItems: "center",
                gap: 2
              }
            }, React.createElement("span", null, (st === null || st === void 0 ? void 0 : st.abbr) || (st === null || st === void 0 ? void 0 : st.label) || status), count > 1 && React.createElement("span", {
              style: {
                fontWeight: 800,
                background: `${(st === null || st === void 0 ? void 0 : st.color) || "#94a3b8"}33`,
                borderRadius: 2,
                padding: "0 2px",
                fontSize: 8,
                flexShrink: 0
              }
            }, "\xD7", count)));
          });
          if (cancelledCnt > 0) badges.push(React.createElement("div", {
            key: "__c",
            style: {
              background: "rgba(71,85,105,0.15)",
              border: "1px dashed #475569",
              borderLeft: "3px solid #475569",
              borderRadius: 3,
              overflow: "hidden",
              color: "#64748b",
              padding: "1px 3px",
              cursor: "pointer"
            },
            onClick: e => {
              e.stopPropagation();
              const ct = cellTasks.filter(t => t.cancelled);
              if (ct.length === 1) setTaskModal(ct[0]);
            },
            onContextMenu: e => openTaskContext(e, cellTasks.filter(t => t.cancelled).map(t => t.id))
          }, React.createElement("div", {
            style: {
              fontSize: 9,
              display: "flex",
              alignItems: "center",
              gap: 1
            }
          }, React.createElement("span", null, "\uD83D\uDEAB"), cancelledCnt > 1 && React.createElement("span", {
            style: {
              fontSize: 8,
              fontWeight: 800
            }
          }, "\xD7", cancelledCnt))));
          return badges;
        })());
      }));
    }));
  }))), taskContextMenu && (() => {
    const ids = taskContextMenu.ids || [];
    const first = taskById(ids[0]);
    const menuItem = {
      display: "block",
      width: "100%",
      textAlign: "left",
      background: "transparent",
      border: "none",
      color: "#dbeafe",
      padding: "9px 12px",
      fontSize: 13,
      fontWeight: 700,
      cursor: "pointer",
      borderRadius: 9
    };
    const danger = {
      ...menuItem,
      color: "#fecaca"
    };
    return React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        position: "fixed",
        left: taskContextMenu.x,
        top: taskContextMenu.y,
        zIndex: 2147483100,
        width: 230,
        background: "linear-gradient(180deg,rgba(30,41,59,.98),rgba(15,23,42,.98))",
        border: "1px solid rgba(148,163,184,.28)",
        borderRadius: 14,
        boxShadow: "0 18px 50px rgba(0,0,0,.55)",
        padding: 6
      }
    }, React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#94a3b8",
        padding: "6px 10px 8px",
        borderBottom: "1px solid rgba(148,163,184,.16)",
        marginBottom: 4
      }
    }, ids.length === 1 ? "1 смена" : ids.length + " смен"), ids.length === 1 && first && React.createElement("button", {
      type: "button",
      style: menuItem,
      onClick: () => {
        setTaskModal(first);
        closeTaskContext();
      }
    }, "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0441\u043C\u0435\u043D\u0443"), React.createElement("button", {
      type: "button",
      style: menuItem,
      onClick: () => openAssignPeopleBulk(ids)
    }, "\u041d\u0430\u0437\u043d\u0430\u0447\u0438\u0442\u044c \u0438\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044f"), React.createElement("button", {
      type: "button",
      style: menuItem,
      onClick: () => clearTaskPeopleBulk(ids)
    }, "\u0423\u0431\u0440\u0430\u0442\u044C \u0438\u0441\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u0435\u0439"), React.createElement("button", {
      type: "button",
      style: danger,
      onClick: () => deleteTasksBulk(ids, true)
    }, "\u0423\u0434\u0430\u043B\u0438\u0442\u044C"), React.createElement("button", {
      type: "button",
      style: {
        ...menuItem,
        color: "#94a3b8",
        fontWeight: 600
      },
      onClick: () => {
        setSelectedTasks(new Set());
        closeTaskContext();
      }
    }, "\u0421\u043D\u044F\u0442\u044C \u0432\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u0435"));
  })(), hoverTask && React.createElement(GanttTooltip, {
    task: hoverTask.task,
    tasks: hoverTask.tasks,
    rect: hoverTask.rect,
    stageMap: stageMap
  }), assignPersonModal && React.createElement(Modal, {
    title: "\u041d\u0430\u0437\u043d\u0430\u0447\u0438\u0442\u044c \u0438\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044f",
    onClose: () => setAssignPersonModal(null),
    onSubmit: () => assignPeopleBulk(assignPersonModal.ids, assignPersonModal.person),
    freeOverflow: true
  }, React.createElement(Field, {
    label: "\u0418\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c"
  }, React.createElement(SelSearch, {
    value: assignPersonModal.person,
    onChange: v => setAssignPersonModal(m => ({
      ...m,
      person: v
    })),
    options: assignPersonModal.people.map(p => ({
      value: p,
      label: p
    })),
    placeholder: "\u0412\u044b\u0431\u0440\u0430\u0442\u044c \u0438\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044f..."
  }))), taskModal !== null && React.createElement(TaskModal, {
    task: taskModal,
    data: data,
    onSave: saveTask,
    onDelete: deleteTask,
    onClose: () => setTaskModal(null),
    canEdit: canEdit && (!taskModal.project || canWriteProject(taskModal.project)),
    canEditOldTasks: canEditOldTasks,
    canEditProjectById: canEditProjectById
  }));
}
function TaskModal(_ref38) {
  let task = _ref38.task,
    data = _ref38.data,
    onSave = _ref38.onSave,
    onDelete = _ref38.onDelete,
    onClose = _ref38.onClose,
    canEdit = _ref38.canEdit,
    canEditOldTasks = _ref38.canEditOldTasks,
    canEditProjectById = _ref38.canEditProjectById;
  const _useContext8 = useContext(StagesCtx),
    stages = _useContext8.sorted,
    stageMap = _useContext8.stageMap;
  const isNew = !task.id;
  const _useState93 = useState({
      project: task.project || "",
      series: task.series || "",
      status: task.status || "",
      person: task.person || "",
      day: task.day || "",
      from: task.from ?? 10,
      to: task.to ?? 19,
      note: task.note || "",
      unplanned: task.unplanned || false,
      shifts_tail: false
    }),
    _useState94 = _slicedToArray(_useState93, 2),
    form = _useState94[0],
    setForm = _useState94[1];
  const sf = v => setForm(f => ({
    ...f,
    ...v
  }));
  const fixedProject = isNew && task._fixedProject && task.project;
  const fixedPerson = isNew && task._fixedPerson && task.person;
  const fixedProjectObj = fixedProject ? (data.projects || []).find(p => p.id === form.project) : null;
  const isLocked = false;
  const stageInfo = form.status ? stageMap[form.status] : null;
  const needsExecutor = !stageInfo || stageInfo.needsExecutor !== false;
  const availSeries = useMemo(() => {
    const fromSeries = (data.series || []).filter(s => s.projectId === form.project).sort((a, b) => (a.order || 0) - (b.order || 0)).map(s => s.name);
    const fromTasks = [...new Set(data.tasks.filter(t => t.project === form.project).map(t => t.series))].filter(n => !fromSeries.includes(n)).sort();
    return [...fromSeries, ...fromTasks];
  }, [form.project, data]);
  const availPeople = useMemo(() => {
    if (!form.status) return data.people.filter(p => p.active !== false);
    return filterPeopleByStatus(data.people, form.status, stages);
  }, [form.status, data.people, stages]);
  const roleHint = useMemo(() => {
    const roles = (stageInfo === null || stageInfo === void 0 ? void 0 : stageInfo.rolesRequired) || [];
    if (!roles.length) return "";
    const labels = roles.map(r => {
      var _data$roles$find;
      return ((_data$roles$find = data.roles.find(rl => rl.id === r)) === null || _data$roles$find === void 0 ? void 0 : _data$roles$find.label) || r;
    });
    return `Показаны: ${labels.join(", ")}`;
  }, [stageInfo, data.roles]);
  const hasTail = useMemo(() => {
    if (!task.id || !task.day || form.day === task.day) return false;
    const ds = daySort(task.day);
    return data.tasks.some(t => t.project === task.project && t.series === task.series && daySort(t.day) > ds && t.id !== task.id);
  }, [form.day, task, data.tasks]);
  function handleSave() {
    if (isLocked) return;
    if (!form.project) {
      alert("Выберите проект");
      return;
    }
    if (!form.series) {
      alert("Укажите серию");
      return;
    }
    if (!form.status) {
      alert("Выберите этап");
      return;
    }
    if (!form.day) {
      alert("Укажите дату");
      return;
    }
    if (!parseDate(form.day)) {
      alert("Укажите существующую дату");
      return;
    }
    if (!Number.isFinite(Number(form.from)) || !Number.isFinite(Number(form.to)) || Number(form.from) < 0 || Number(form.to) > 24 || Number(form.to) <= Number(form.from)) {
      alert("Время окончания должно быть позже начала, в пределах одного дня");
      return;
    }
    const ser = (data.series || []).find(s => s.projectId === form.project && s.name === form.series);
    const seriesId = ser ? ser.id : null;
    const saved = {
      ...task,
      ...form,
      seriesId,
      autogenerated: task.autogenerated || false
    };
    delete saved._fixedProject;
    delete saved._fixedPerson;
    if (form.shifts_tail && task.id && form.day !== task.day) {
      const diff = Math.round((parseDate(form.day) - parseDate(task.day)) / (1000 * 60 * 60 * 24));
      const ds = daySort(task.day);
      const tailTasks = data.tasks.filter(t => t.project === task.project && t.series === task.series && daySort(t.day) > ds && t.id !== task.id);
      const updatedTail = tailTasks.map(t => ({
        ...t,
        day: addDays(t.day, diff)
      }));
      const allTasks = data.tasks.map(t => {
        const upd = updatedTail.find(u => u.id === t.id);
        return upd || t;
      });
      onSave({
        ...saved,
        _cascadeAll: allTasks
      });
    } else {
      onSave(saved);
    }
  }
  return React.createElement(Modal, {
    title: isNew ? "Новая задача" : "Редактировать задачу",
    onClose: onClose,
    onSubmit: handleSave
  }, fixedProject && React.createElement("div", {
    style: {
      marginBottom: 12,
      padding: "8px 10px",
      background: "#0f172a",
      border: "1px solid #334155",
      borderRadius: 10,
      fontSize: 13,
      color: "#94a3b8"
    }
  }, React.createElement("div", {
    style: {
      fontWeight: 800,
      color: "#e2e8f0"
    }
  }, (fixedProjectObj === null || fixedProjectObj === void 0 ? void 0 : fixedProjectObj.name) || form.project), React.createElement("div", null, form.series || "-")), !fixedProject && React.createElement(Field, {
    label: "\u041f\u0440\u043e\u0435\u043a\u0442"
  }, React.createElement(SelSearch, {
    value: form.project,
    onChange: v => sf({
      project: v,
      series: "",
      person: fixedPerson ? form.person : ""
    }),
    options: data.projects.filter(p => !canEditProjectById || canEditProjectById(p.id)).map(p => ({
      value: p.id,
      label: p.name
    })),
    placeholder: "\u0412\u044b\u0431\u0440\u0430\u0442\u044c \u043f\u0440\u043e\u0435\u043a\u0442...",
    autoFocus: isNew
  })), !fixedProject && React.createElement(Field, {
    label: "\u0421\u0435\u0440\u0438\u044f"
  }, React.createElement(SelSearch, {
    value: form.series,
    onChange: v => sf({
      series: v
    }),
    options: availSeries,
    placeholder: "\u0412\u044b\u0431\u0440\u0430\u0442\u044c \u0438\u043b\u0438 \u0432\u0432\u0435\u0441\u0442\u0438: \u042101...",
    allowCustom: true
  })), React.createElement(Field, {
    label: "\u042D\u0442\u0430\u043F"
  }, React.createElement(SelSearch, {
    value: form.status,
    onChange: v => sf({
      status: v,
      person: fixedPerson ? form.person : ""
    }),
    options: stages.map(s => ({
      value: s.id,
      label: s.label
    })),
    placeholder: "\u0412\u044B\u0431\u0440\u0430\u0442\u044C \u044D\u0442\u0430\u043F..."
  })), React.createElement(Field, {
    label: `Исполнитель${needsExecutor ? "" : " (необязательно)"}`,
    hint: roleHint
  }, React.createElement(SelSearch, {
    value: form.person,
    onChange: v => sf({
      person: v
    }),
    options: availPeople.map(p => ({
      value: p.name,
      label: p.name + (p.roles.length ? " (" + p.roles.map(r => {
        var _data$roles$find2;
        return ((_data$roles$find2 = data.roles.find(rl => rl.id === r)) === null || _data$roles$find2 === void 0 ? void 0 : _data$roles$find2.label) || r;
      }).join(", ") + ")" : "")
    })),
    placeholder: needsExecutor ? "Выбрать исполнителя..." : "Без исполнителя...",
    allowCustom: true
  })), React.createElement(Field, {
    label: "\u0414\u0430\u0442\u0430"
  }, React.createElement(InpDate, {
    value: form.day,
    onChange: v => sf({
      day: v
    })
  })), React.createElement(Field, {
    label: "\u0412\u0440\u0435\u043C\u044F"
  }, React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      flexWrap: "wrap",
      marginBottom: 6
    }
  }, TIME_PRESETS.map(_ref39 => {
    let fr = _ref39.f,
      to = _ref39.t;
    return React.createElement(Btn, {
      key: `${fr}-${to}`,
      small: true,
      variant: form.from === fr && form.to === to ? "primary" : "ghost",
      onClick: () => sf({
        from: fr,
        to
      })
    }, fr, "\u2013", to);
  })), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center",
      flexWrap: "wrap"
    }
  }, React.createElement("span", {
    style: {
      fontSize: 12,
      color: "#64748b"
    }
  }, "\u0441"), React.createElement("select", {
    value: Math.floor(form.from || 0),
    onChange: e => sf({
      from: Number(e.target.value) + ((form.from || 0) % 1 >= 0.5 ? 0.5 : 0)
    }),
    style: {
      background: "#0f172a",
      border: "1px solid #334155",
      color: "#e2e8f0",
      borderRadius: 10,
      padding: "5px 8px",
      fontSize: 13,
      outline: "none"
    }
  }, Array.from({
    length: 24
  }, (_, i) => React.createElement("option", {
    key: i,
    value: i
  }, String(i).padStart(2, "0")))), React.createElement("select", {
    value: (form.from || 0) % 1 >= 0.5 ? 30 : 0,
    onChange: e => sf({
      from: Math.floor(form.from || 0) + Number(e.target.value) / 60
    }),
    style: {
      background: "#0f172a",
      border: "1px solid #334155",
      color: "#e2e8f0",
      borderRadius: 10,
      padding: "5px 8px",
      fontSize: 13,
      outline: "none"
    }
  }, React.createElement("option", {
    value: 0
  }, ":00"), React.createElement("option", {
    value: 30
  }, ":30")), React.createElement("span", {
    style: {
      fontSize: 12,
      color: "#64748b"
    }
  }, "\u0434\u043E"), React.createElement("select", {
    value: Math.floor(form.to || 0),
    onChange: e => sf({
      to: Number(e.target.value) + ((form.to || 0) % 1 >= 0.5 ? 0.5 : 0)
    }),
    style: {
      background: "#0f172a",
      border: "1px solid #334155",
      color: "#e2e8f0",
      borderRadius: 10,
      padding: "5px 8px",
      fontSize: 13,
      outline: "none"
    }
  }, Array.from({
    length: 25
  }, (_, i) => React.createElement("option", {
    key: i,
    value: i
  }, String(i).padStart(2, "0")))), React.createElement("select", {
    value: (form.to || 0) % 1 >= 0.5 ? 30 : 0,
    onChange: e => sf({
      to: Math.floor(form.to || 0) + Number(e.target.value) / 60
    }),
    style: {
      background: "#0f172a",
      border: "1px solid #334155",
      color: "#e2e8f0",
      borderRadius: 10,
      padding: "5px 8px",
      fontSize: 13,
      outline: "none"
    }
  }, React.createElement("option", {
    value: 0
  }, ":00"), React.createElement("option", {
    value: 30
  }, ":30")), React.createElement("span", {
    style: {
      fontSize: 12,
      color: "#64748b"
    }
  }, fmtDur(form.from, form.to)))), canSeeTaskNotes() && React.createElement(Field, {
    label: "\u0417\u0430\u043C\u0435\u0442\u043A\u0430"
  }, React.createElement("textarea", {
    value: form.note,
    onChange: e => sf({
      note: e.target.value
    }),
    rows: 2,
    placeholder: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435, \u0444\u0430\u043A\u0442 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u044F...",
    style: {
      background: "#0f172a",
      border: "1px solid #334155",
      color: "#e2e8f0",
      borderRadius: 10,
      padding: "7px 10px",
      fontSize: 13,
      width: "100%",
      resize: "vertical"
    }
  })), React.createElement("div", {
    style: {
      display: "flex",
      gap: 16,
      marginBottom: 6,
      alignItems: "center",
      flexWrap: "wrap"
    }
  }, hasTail && React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      cursor: "pointer"
    }
  }, React.createElement("input", {
    type: "checkbox",
    checked: form.shifts_tail,
    onChange: e => sf({
      shifts_tail: e.target.checked
    }),
    style: {
      accentColor: "#f59e0b"
    }
  }), React.createElement("span", {
    style: {
      fontSize: 13,
      color: "#f59e0b"
    }
  }, "\u0421\u0434\u0432\u0438\u043D\u0443\u0442\u044C \u0432\u0435\u0441\u044C \u0445\u0432\u043E\u0441\u0442 \u0441\u0435\u0440\u0438\u0438")), React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, form.cancelled ? React.createElement("span", {
    style: {
      fontSize: 11,
      color: "#475569",
      background: "rgba(71,85,105,0.15)",
      border: "1px solid #475569",
      borderRadius: 10,
      padding: "4px 10px"
    }
  }, "\uD83D\uDEAB \u041E\u0442\u043C\u0435\u043D\u0435\u043D\u0430") : React.createElement("span", {
    style: {
      fontSize: 11,
      color: "#94a3b8"
    }
  }, !isNew && daySort(form.day) < daySort(formatDate(new Date())) ? "OK Выполнено" : " Запланировано"), form.cancelled ? React.createElement(Btn, {
    small: true,
    variant: "ghost",
    onClick: () => sf({
      cancelled: false,
      note: (form.note || "").replace(/^ОТМЕНА\n?/, "").trim()
    })
  }, "\u21A9 \u0421\u043D\u044F\u0442\u044C \u043E\u0442\u043C\u0435\u043D\u0443") : React.createElement(Btn, {
    small: true,
    variant: "danger",
    onClick: () => sf({
      cancelled: true,
      note: "ОТМЕНА" + (form.note ? "\n" + form.note : "")
    })
  }, "\uD83D\uDEAB \u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C"))), task.updatedAt && React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#334155",
      marginTop: 8,
      textAlign: "right"
    }
  }, "\u0438\u0437\u043C\u0435\u043D\u0435\u043D\u043E: ", new Date(task.updatedAt).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }), task.updatedBy ? " · " + task.updatedBy : ""), React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: 16
    }
  }, React.createElement("div", null, !isNew && canEdit && React.createElement(Btn, {
    variant: "danger",
    disabled: isLocked,
    onClick: () => !isLocked && onDelete(task.id)
  }, "\u0423\u0434\u0430\u043B\u0438\u0442\u044C")), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, React.createElement(Btn, {
    variant: "ghost",
    onClick: onClose
  }, "\u041E\u0442\u043C\u0435\u043D\u0430"), canEdit && React.createElement(Btn, {
    variant: "primary",
    disabled: isLocked,
    onClick: handleSave
  }, isNew ? "Создать задачу" : "Сохранить"))));
}
function DaysView(_ref40) {
  let data = _ref40.data,
    conflictIds = _ref40.conflictIds;
  const _useState95 = useState("week"),
    _useState96 = _slicedToArray(_useState95, 2),
    groupBy = _useState96[0],
    setGroupBy = _useState96[1];
  const _useState97 = useState(""),
    _useState98 = _slicedToArray(_useState97, 2),
    filterPerson = _useState98[0],
    setFilterPerson = _useState98[1];
  const _useState99 = useState(""),
    _useState100 = _slicedToArray(_useState99, 2),
    filterProject = _useState100[0],
    setFilterProject = _useState100[1];
  const _useState101 = useState(null),
    _useState102 = _slicedToArray(_useState101, 2),
    hovTask = _useState102[0],
    setHovTask = _useState102[1];
  const tasks = useMemo(() => enrichTasks(data.tasks), [data.tasks]);
  const people = useMemo(() => [...new Set(tasks.map(t => t.person).filter(Boolean))].filter(p => data.people.some(dp => dp.name === p)).sort(), [tasks, data.people]);
  const containerRef = useRef(null);
  useEffect(() => {
    const h = e => {
      if (e.key === "Escape") {
        setFilterPerson("");
        setFilterProject("");
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);
  useEffect(() => {
    const t = setTimeout(scrollToToday, 150);
    return () => clearTimeout(t);
  }, []);
  const filtered = useMemo(() => {
    let r = tasks;
    if (filterPerson) r = r.filter(t => t.person === filterPerson);
    if (filterProject) r = r.filter(t => t.project === filterProject);
    return r;
  }, [tasks, filterPerson, filterProject]);
  const peopleCols = filterPerson ? [filterPerson] : people;
  function scrollToToday() {
    if (!containerRef.current) return;
    const today = formatDate(new Date());
    const el = containerRef.current.querySelector(`[data-day="${today}"]`);
    if (el) el.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest"
    });
  }
  function DayCol(_ref41) {
    let dayKey = _ref41.dayKey,
      dayTasks = _ref41.dayTasks,
      compact = _ref41.compact;
    const hasC = dayTasks.some(t => conflictIds.has(t.id));
    return React.createElement("div", {
      "data-day": dayKey
    }, React.createElement("div", {
      style: {
        padding: compact ? "4px 6px" : "7px 10px",
        background: hasC ? "rgba(239,68,68,0.12)" : "#1e293b",
        borderRadius: "6px 6px 0 0",
        borderBottom: `2px solid ${hasC ? "#ef4444" : "#3b82f6"}`,
        fontSize: compact ? 10 : 11,
        fontWeight: 700,
        color: hasC ? "#f87171" : "#93c5fd",
        display: "flex",
        justifyContent: "space-between"
      }
    }, React.createElement("span", null, dayLabel(dayKey)), hasC && React.createElement("span", null, "\u26A1")), React.createElement("div", {
      style: {
        background: "#1e293b",
        borderRadius: "0 0 6px 6px",
        border: "1px solid #334155",
        borderTop: "none",
        padding: compact ? 4 : 6,
        minHeight: compact ? 50 : 80
      }
    }, (() => {
      const visible = peopleCols.filter(p => dayTasks.some(t => t.person === p));
      const twoCol = !compact && visible.length > 4;
      const items = visible.map(person => {
        const pt = dayTasks.filter(t => t.person === person);
        return React.createElement("div", {
          key: person,
          style: {
            marginBottom: compact ? 4 : 8
          }
        }, React.createElement("div", {
          style: {
            fontSize: compact ? 9 : 13,
            color: "#94a3b8",
            fontWeight: 700,
            marginBottom: 3
          }
        }, person), React.createElement("div", {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: 2
          }
        }, pt.map(t => React.createElement(TaskCard, {
          key: t.id,
          task: t,
          projects: data.projects,
          isConflict: conflictIds.has(t.id),
          large: true,
          onHover: (t, r) => setHovTask(t ? {
            task: t,
            rect: r
          } : null)
        }))));
      });
      return twoCol ? React.createElement("div", {
        style: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 6,
          alignItems: "start"
        }
      }, items) : items;
    })(), !dayTasks.length && React.createElement("div", {
      style: {
        color: "#334155",
        fontSize: 11
      }
    }, "\u043D\u0435\u0442 \u0437\u0430\u0434\u0430\u0447")));
  }
  const dayKeys = [...new Set(filtered.map(t => t._dayKey))].filter(dk => filtered.some(t => t._dayKey === dk && peopleCols.includes(t.person))).sort((a, b) => daySort(a).localeCompare(daySort(b)));
  const groups = {};
  if (groupBy !== "day") filtered.forEach(t => {
    const k = groupBy === "week" ? t._weekKey : t._monthKey;
    if (!groups[k]) groups[k] = [];
    groups[k].push(t);
  });
  return React.createElement("div", null, React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginBottom: 12,
      flexWrap: "wrap",
      alignItems: "center"
    }
  }, ["все", ...people].map(p => React.createElement("button", {
    key: p,
    onClick: () => setFilterPerson(p === "все" ? "" : p),
    style: {
      padding: "3px 12px",
      borderRadius: 16,
      border: "1px solid",
      cursor: "pointer",
      fontSize: 11,
      borderColor: !filterPerson && p === "все" || filterPerson === p ? "#3b82f6" : "#334155",
      background: !filterPerson && p === "все" || filterPerson === p ? "rgba(59,130,246,0.2)" : "transparent",
      color: !filterPerson && p === "все" || filterPerson === p ? "#93c5fd" : "#64748b"
    }
  }, p)), React.createElement("span", {
    style: {
      color: "#263352",
      margin: "0 4px"
    }
  }, "\u2502"), ["все проекты", ...data.projects.map(p => p.id)].map(pid => {
    const proj = data.projects.find(p => p.id === pid);
    const label = proj ? proj.name : "все проекты";
    const active = pid === "все проекты" ? !filterProject : filterProject === pid;
    return React.createElement("button", {
      key: pid,
      onClick: () => setFilterProject(pid === "все проекты" ? "" : pid),
      style: {
        padding: "3px 12px",
        borderRadius: 16,
        border: "1px solid",
        cursor: "pointer",
        fontSize: 11,
        borderColor: active ? (proj === null || proj === void 0 ? void 0 : proj.color) || "#3b82f6" : "#334155",
        background: active ? `${(proj === null || proj === void 0 ? void 0 : proj.color) || "#3b82f6"}22` : "transparent",
        color: active ? (proj === null || proj === void 0 ? void 0 : proj.color) || "#93c5fd" : "#64748b"
      }
    }, label);
  }), React.createElement("span", {
    style: {
      color: "#263352",
      margin: "0 4px"
    }
  }, "\u2502"), [["week", "Неделя"], ["month", "Месяц"]].map(_ref42 => {
    let _ref43 = _slicedToArray(_ref42, 2),
      v = _ref43[0],
      l = _ref43[1];
    return React.createElement("button", {
      key: v,
      onClick: () => setGroupBy(v),
      style: {
        padding: "3px 10px",
        borderRadius: 4,
        border: "1px solid",
        cursor: "pointer",
        fontSize: 10,
        borderColor: groupBy === v ? "#475569" : "#263352",
        background: groupBy === v ? "#334155" : "transparent",
        color: groupBy === v ? "#cbd5e1" : "#475569"
      }
    }, l);
  }), React.createElement(Btn, {
    small: true,
    variant: "ghost",
    onClick: scrollToToday
  }, "\u2192 \u0421\u0435\u0433\u043E\u0434\u043D\u044F")), React.createElement("div", {
    ref: containerRef
  }, groupBy === "day" ? React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: `repeat(${Math.min(dayKeys.length, 7)},1fr)`,
      gap: 8
    }
  }, dayKeys.map(dk => React.createElement(DayCol, {
    key: dk,
    dayKey: dk,
    dayTasks: filtered.filter(t => t._dayKey === dk)
  }))) : React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, Object.entries(groups).sort((_ref44, _ref45) => {
    let _ref46 = _slicedToArray(_ref44, 1),
      a = _ref46[0];
    let _ref47 = _slicedToArray(_ref45, 1),
      b = _ref47[0];
    return a.localeCompare(b);
  }).map(_ref48 => {
    let _ref49 = _slicedToArray(_ref48, 2),
      gk = _ref49[0],
      gTasks = _ref49[1];
    const sample = gTasks[0];
    const title = groupBy === "week" ? `Неделя ${weekLabel(sample.day)}` : `${MONTHS[parseInt(gk.split("-")[1]) - 1]} ${gk.split("-")[0]}`;
    const dks = [...new Set(gTasks.map(t => t._dayKey))].filter(dk => gTasks.some(t => t._dayKey === dk && peopleCols.includes(t.person))).sort((a, b) => daySort(a).localeCompare(daySort(b)));
    return React.createElement("div", {
      key: gk
    }, React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: "#93c5fd",
        marginBottom: 8,
        paddingBottom: 6,
        borderBottom: "1px solid #1e293b",
        display: "flex",
        justifyContent: "space-between"
      }
    }, React.createElement("span", null, title), React.createElement("span", {
      style: {
        fontWeight: 400,
        fontSize: 11,
        color: "#475569"
      }
    }, gTasks.length, " \u0441\u043C\u0435\u043D")), React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: `repeat(${Math.min(dks.length, 7)},1fr)`,
        gap: 6
      }
    }, dks.map(dk => React.createElement(DayCol, {
      key: dk,
      dayKey: dk,
      dayTasks: gTasks.filter(t => t._dayKey === dk),
      compact: true
    }))));
  }))), hovTask && React.createElement(TaskTooltip, {
    task: hovTask.task,
    rect: hovTask.rect,
    projects: data.projects
  }));
}
function PeopleView(_ref50) {
  let data = _ref50.data,
    conflictIds = _ref50.conflictIds,
    onPersonSelect = _ref50.onPersonSelect,
    canEdit = _ref50.canEdit,
    onUpdate = _ref50.onUpdate,
    onLog = _ref50.onLog,
    canEditProjectById = _ref50.canEditProjectById;
  const _useContext9 = useContext(StagesCtx),
    stageMap = _useContext9.stageMap;
  const _useState103 = useState(0),
    _useState104 = _slicedToArray(_useState103, 2),
    weekOffset = _useState104[0],
    setWeekOffset = _useState104[1];
  const _useState105 = useState(""),
    _useState106 = _slicedToArray(_useState105, 2),
    roleFilter = _useState106[0],
    setRoleFilter = _useState106[1];
  const _useState107 = useState(""),
    _useState108 = _slicedToArray(_useState107, 2),
    query = _useState108[0],
    setQuery = _useState108[1];
  const _useState109 = useState(null),
    _useState110 = _slicedToArray(_useState109, 2),
    taskModal = _useState110[0],
    setTaskModal = _useState110[1];
  const _useState111 = useState(null),
    _useState112 = _slicedToArray(_useState111, 2),
    hovTask = _useState112[0],
    setHovTask = _useState112[1];
  const _useState113 = useState(null),
    _useState114 = _slicedToArray(_useState113, 2),
    peopleContextMenu = _useState114[0],
    setPeopleContextMenu = _useState114[1];
  const dragTaskRef = useRef(null);
  const dragAbsenceRef = useRef(null);
  const _useState115 = useState(new Set()),
    _useState116 = _slicedToArray(_useState115, 2),
    selectedPeopleTasks = _useState116[0],
    setSelectedPeopleTasks = _useState116[1];
  const _useState117 = useState(new Set()),
    _useState118 = _slicedToArray(_useState117, 2),
    selectedPeopleAbsences = _useState118[0],
    setSelectedPeopleAbsences = _useState118[1];
  const _useState119 = useState(new Set()),
    _useState120 = _slicedToArray(_useState119, 2),
    selectedPeopleNames = _useState120[0],
    setSelectedPeopleNames = _useState120[1];
  const _useState121 = useState(false),
    _useState122 = _slicedToArray(_useState121, 2),
    showSelectedPeopleOnly = _useState122[0],
    setShowSelectedPeopleOnly = _useState122[1];
  const roleMap = useMemo(() => Object.fromEntries((data.roles || []).map(r => [r.id, r])), [data.roles]);
  const canWriteProject = projectId => !canEditProjectById || canEditProjectById(projectId);
  function roleRank(role, id) {
    const text = String(((role === null || role === void 0 ? void 0 : role.label) || "") + " " + (id || (role === null || role === void 0 ? void 0 : role.id) || "")).toLowerCase();
    if (text.includes("\u043c\u043e\u043d\u0442\u0430\u0436") || text.includes("\u0440\u0435\u0434\u0430\u043a\u0442\u043e\u0440")) return 10;
    if (text.includes("\u0432\u044b\u043f\u0443\u0441\u043a\u0430")) return 20;
    if (text.includes("\u0441\u0438\u043d\u0445")) return 30;
    if (text.includes("\u0437\u0432\u0443\u043a")) return 40;
    if (text.includes("\u0446\u0432\u0435\u0442") || text.includes("\u043a\u043e\u043b\u043e\u0440\u0438\u0441\u0442")) return 50;
    if (text.includes("\u043c\u0435\u043d\u0435\u0434\u0436")) return 900;
    return 100;
  }
  function primaryRoleId(person) {
    const roles = Array.isArray(person === null || person === void 0 ? void 0 : person.roles) ? person.roles : [];
    if (!roles.length) return "";
    return [...roles].sort((a, b) => {
      var _roleMap$a, _roleMap$b;
      return roleRank(roleMap[b], b) - roleRank(roleMap[a], a) || String(((_roleMap$a = roleMap[a]) === null || _roleMap$a === void 0 ? void 0 : _roleMap$a.label) || a).localeCompare(String(((_roleMap$b = roleMap[b]) === null || _roleMap$b === void 0 ? void 0 : _roleMap$b.label) || b), "ru");
    })[0] || "";
  }
  const refMonday = useMemo(() => {
    const d = new Date();
    const wd = d.getDay() || 7;
    d.setDate(d.getDate() - wd + 1 + weekOffset * 7);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [weekOffset]);
  const days = useMemo(() => Array.from({
    length: 14
  }, (_, i) => {
    const d = new Date(refMonday);
    d.setDate(refMonday.getDate() + i);
    return formatDate(d);
  }), [refMonday]);
  const todayStr = formatDate(new Date());
  const weekTitle = weekLabel(days[0]);
  const tasks = useMemo(() => enrichTasks(data.tasks || []).filter(t => !t.deleted && !t.cancelled && days.includes(t.day)), [data.tasks, days]);
  const visibleRoles = useMemo(() => [...(data.roles || [])].sort((a, b) => roleRank(a, a.id) - roleRank(b, b.id) || String(a.label || a.id).localeCompare(String(b.label || b.id), "ru")), [data.roles]);
  const peopleTaskTemplates = useMemo(() => ["монтаж", "синхра", "цветокор", "сведение_звука", "правки"].map(status => {
    var _stageMap$status;
    return GANTT_TEMPLATES.find(t => t.status === status) || {
      status,
      label: ((_stageMap$status = stageMap[status]) === null || _stageMap$status === void 0 ? void 0 : _stageMap$status.label) || status
    };
  }).filter(Boolean), [stageMap]);
  const people = useMemo(() => {
    const merged = new Map();
    (data.people || []).forEach(p => {
      if (p.active === false || p.deleted) return;
      const name = String(p.name || "").trim();
      if (!name) return;
      const key = name.toLowerCase();
      const roles = Array.isArray(p.roles) ? p.roles : [];
      if (!merged.has(key)) {
        merged.set(key, {
          ...p,
          name,
          roles: [...roles]
        });
        return;
      }
      const prev = merged.get(key);
      merged.set(key, {
        ...prev,
        ...(!prev.id && p.id ? {
          id: p.id
        } : {}),
        name: prev.name || name,
        roles: [...new Set([...(prev.roles || []), ...roles])]
      });
    });
    const q = query.trim().toLowerCase();
    return Array.from(merged.values()).filter(p => !showSelectedPeopleOnly || selectedPeopleNames.has(p.name)).filter(p => {
      const roles = Array.isArray(p.roles) ? p.roles : [];
      if (roleFilter && !roles.includes(roleFilter)) return false;
      if (q && !String(p.name || "").toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => {
      const ar = primaryRoleId(a);
      const br = primaryRoleId(b);
      return roleRank(roleMap[ar], ar) - roleRank(roleMap[br], br) || String(a.name || "").localeCompare(String(b.name || ""), "ru");
    });
  }, [data.people, roleFilter, query, roleMap, showSelectedPeopleOnly, selectedPeopleNames]);
  const groupedPeople = useMemo(() => {
    const idx = {};
    people.forEach(p => {
      const rid = primaryRoleId(p) || "__none";
      const role = roleMap[rid] || {
        id: rid,
        label: "\u0411\u0435\u0437 \u0440\u043e\u043b\u0438",
        color: "#64748b",
        order: 999
      };
      if (!idx[rid]) idx[rid] = {
        role,
        people: []
      };
      idx[rid].people.push(p);
    });
    return Object.values(idx).sort((a, b) => roleRank(a.role, a.role.id) - roleRank(b.role, b.role.id) || String(a.role.label).localeCompare(String(b.role.label), "ru"));
  }, [people, roleMap]);
  const taskMap = useMemo(() => {
    const m = {};
    tasks.forEach(t => {
      const k = (t.person || "") + "||" + t.day;
      if (!m[k]) m[k] = [];
      m[k].push(t);
    });
    Object.values(m).forEach(list => list.sort((a, b) => (Number(a.from) || 0) - (Number(b.from) || 0) || projName(data.projects, a.project).localeCompare(projName(data.projects, b.project), "ru")));
    return m;
  }, [tasks, data.projects]);
  const cellAbsences = (person, day) => absencesForPersonDay(data.personAbsences || [], data.people || [], person.name, day);
  function daysBetweenIncl(start, end) {
    const a = parseDate(start),
      b = parseDate(end);
    if (!a || !b) return [];
    const step = a <= b ? 1 : -1;
    const out = [];
    let cur = formatDate(a);
    while (true) {
      out.push(cur);
      if (cur === formatDate(b)) break;
      cur = addDays(cur, step);
    }
    return out;
  }
  function personTasksOnDay(person, day) {
    return taskMap[(person.name || person.personName || "") + "||" + day] || [];
  }
  function personHasTasksInRange(person, start, end) {
    return daysBetweenIncl(start, end).some(d => personTasksOnDay(person, d).length);
  }
  function personHasAbsenceInRange(person, start, end, ignoreId) {
    return daysBetweenIncl(start, end).some(d => cellAbsences(person, d).some(a => String(a.id) !== String(ignoreId || "")));
  }
  function showAbsenceBlockedByTasks(type) {
    alert(type === "dayoff" ? "\u0427\u0442\u043e\u0431\u044b \u043f\u043e\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u0432\u044b\u0445\u043e\u0434\u043d\u043e\u0439, \u043d\u0435 \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u0441\u043c\u0435\u043d \u043d\u0430 \u044d\u0442\u043e\u0442 \u0434\u0435\u043d\u044c" : "\u0427\u0442\u043e\u0431\u044b \u043f\u043e\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u043e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0435, \u043d\u0435 \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u0441\u043c\u0435\u043d \u043d\u0430 \u044d\u0442\u043e\u0442 \u0434\u0435\u043d\u044c");
  }
  function showAbsenceDuplicate() {
    alert("\u041d\u0430 \u044d\u0442\u043e\u0442 \u0434\u0435\u043d\u044c \u0443\u0436\u0435 \u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u043e \u043e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0435");
  }
  function shiftBlockedByAbsence() {
    alert("\u041d\u0430 \u044d\u0442\u043e\u0442 \u0434\u0435\u043d\u044c \u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u043e \u043e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0435");
  }
  function addPersonAbsence(person, day, type) {
    if (!canEdit || !onUpdate || !person || !day) return;
    if (personHasTasksInRange(person, day, day)) {
      showAbsenceBlockedByTasks(type);
      return;
    }
    if (personHasAbsenceInRange(person, day, day)) {
      showAbsenceDuplicate();
      return;
    }
    const ts = Date.now();
    const item = normalizeAbsence({
      id: "abs_" + ts + "_" + Math.random().toString(36).slice(2, 7),
      personId: person.id || null,
      personName: person.name,
      type,
      startDay: day,
      endDay: day,
      note: "",
      createdAt: new Date(ts).toISOString(),
      updatedAt: new Date(ts).toISOString(),
      _updatedAt: ts
    });
    onUpdate("personAbsences", [...(data.personAbsences || []), item]);
    onLog === null || onLog === void 0 || onLog("\u041e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0435: " + person.name + " / " + absenceTypeInfo(type).label + " / " + day);
    setPeopleContextMenu(null);
  }
  function dropPeopleTask(source, person, day, stretch, copy) {
    if (!source || !person || !day || !onUpdate || !canWriteProject(source.project)) return;
    const ts = Date.now();
    const stamp = t => ({
      ...t,
      updatedAt: new Date(ts).toISOString(),
      _updatedAt: ts,
      updatedBy: ""
    });
    let all = [...(data.tasks || [])];
    if (stretch) {
      const start = parseDate(source.day),
        end = parseDate(day);
      if (!start || !end) return;
      const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
      if (diff === 0) {
        if (source.person === person.name) return;
        if (personHasAbsenceInRange(person, day, day)) {
          shiftBlockedByAbsence();
          return;
        }
        const changed = stamp({
          ...source,
          day,
          person: person.name
        });
        onUpdate("tasks", all.map(t => String(t.id) === String(source.id) ? changed : t));
        return;
      }
      const step = diff >= 0 ? 1 : -1;
      const checkFrom = diff > 0 ? addDays(source.day, 1) : day;
      const checkTo = diff > 0 ? day : addDays(source.day, -1);
      if (personHasAbsenceInRange(person, checkFrom, checkTo)) {
        shiftBlockedByAbsence();
        return;
      }
      const copies = [];
      for (let i = step; step > 0 ? i <= diff : i >= diff; i += step) {
        copies.push(stamp({
          ...source,
          id: genTaskId([...all, ...copies]),
          day: addDays(source.day, i),
          person: person.name
        }));
      }
      if (copies.length) onUpdate("tasks", [...all, ...copies]);
      return;
    }
    if (personHasAbsenceInRange(person, day, day)) {
      shiftBlockedByAbsence();
      return;
    }
    if (copy) {
      const nt = stamp({
        ...source,
        id: genTaskId(all),
        day,
        person: person.name
      });
      onUpdate("tasks", [...all, nt]);
      return;
    }
    const changed = stamp({
      ...source,
      day,
      person: person.name
    });
    onUpdate("tasks", all.map(t => String(t.id) === String(source.id) ? changed : t));
  }
  function openTemplateTask(status, person, day) {
    if (!canEdit || !onUpdate) return;
    if (personHasAbsenceInRange(person, day, day)) {
      shiftBlockedByAbsence();
      return;
    }
    setTaskModal({
      person: person.name,
      day,
      status,
      from: 10,
      to: 19,
      _fixedPerson: true
    });
  }
  function openNewTask(person, day) {
    openTemplateTask("", person, day);
  }
  function saveTask(task) {
    var _find2;
    if (!onUpdate || !canWriteProject(task.project)) return;
    const taskPerson = (data.people || []).find(p => p.name === task.person) || {
      name: task.person
    };
    if (task.person && task.day && personHasAbsenceInRange(taskPerson, task.day, task.day)) {
      shiftBlockedByAbsence();
      return;
    }
    if (task.id) {
      const old = (data.tasks || []).find(t => String(t.id) === String(task.id));
      if (old && !canWriteProject(old.project)) return;
    }
    let all = [...(data.tasks || [])];
    let saved;
    if (task._cascadeAll) {
      const clean = {
        ...task
      };
      delete clean._cascadeAll;
      delete clean._fixedPerson;
      all = task._cascadeAll.map(t => String(t.id) === String(clean.id) ? clean : t);
      saved = all.find(t => String(t.id) === String(clean.id)) || {
        ...clean,
        id: genTaskId(data.tasks || [])
      };
      if (!all.some(t => String(t.id) === String(saved.id))) all.push(saved);
    } else {
      const clean = {
        ...task
      };
      delete clean._fixedPerson;
      const exists = clean.id && all.find(t => String(t.id) === String(clean.id));
      saved = exists ? clean : {
        ...clean,
        id: genTaskId(data.tasks || [])
      };
      all = exists ? all.map(t => String(t.id) === String(saved.id) ? saved : t) : [...all, saved];
    }
    const ts = Date.now();
    saved = {
      ...saved,
      updatedAt: new Date(ts).toISOString(),
      _updatedAt: ts,
      updatedBy: ""
    };
    all = all.map(t => String(t.id) === String(saved.id) ? saved : t);
    onUpdate("tasks", all);
    const stLabel = ((_find2 = (data.stages || []).find(st => st.id === saved.status)) === null || _find2 === void 0 ? void 0 : _find2.label) || saved.status || "";
    onLog === null || onLog === void 0 || onLog("Смена: " + stLabel + " ? " + (saved.series || "") + " / " + (saved.person || "без исполнителя") + " ? " + saved.day);
    incrSave("task", saved);
    setTaskModal(null);
  }
  function deleteTask(id) {
    const t = (data.tasks || []).find(x => String(x.id) === String(id));
    if (t && !canWriteProject(t.project)) return;
    const ts = Date.now();
    onUpdate === null || onUpdate === void 0 || onUpdate("tasks", (data.tasks || []).map(x => String(x.id) === String(id) ? {
      ...x,
      deleted: true,
      _updatedAt: ts
    } : x));
    if (t) onLog === null || onLog === void 0 || onLog("Удалена смена: " + (t.series || "") + " / " + (t.person || "") + " ? " + t.day);
    incrDelete("task", id);
    setTaskModal(null);
  }
  function deletePeopleTasks(ids) {
    const allowed = (ids || []).filter(id => {
      const t = (data.tasks || []).find(x => String(x.id) === String(id));
      return t && canWriteProject(t.project);
    });
    if (!allowed.length) return;
    const idSet = new Set(allowed.map(String));
    const ts = Date.now();
    const changed = [];
    const all = (data.tasks || []).map(t => {
      if (!idSet.has(String(t.id))) return t;
      const nt = {
        ...t,
        deleted: true,
        updatedAt: new Date(ts).toISOString(),
        _updatedAt: ts
      };
      changed.push(nt);
      return nt;
    });
    onUpdate === null || onUpdate === void 0 || onUpdate("tasks", all);
    changed.forEach(t => incrDelete("task", t.id));
    setSelectedPeopleTasks(new Set());
    setPeopleContextMenu(null);
  }
  function deletePersonAbsence(id) {
    if (!id || !onUpdate) return;
    const ts = Date.now();
    onUpdate("personAbsences", (data.personAbsences || []).map(a => String(a.id) === String(id) ? {
      ...a,
      deleted: true,
      updatedAt: new Date(ts).toISOString(),
      _updatedAt: ts
    } : a));
    setPeopleContextMenu(null);
  }
  function deletePeopleAbsences(ids) {
    if (!(ids !== null && ids !== void 0 && ids.length) && !(ids !== null && ids !== void 0 && ids.size)) return;
    const idSet = new Set([...ids].map(String));
    const ts = Date.now();
    onUpdate === null || onUpdate === void 0 || onUpdate("personAbsences", (data.personAbsences || []).map(a => idSet.has(String(a.id)) ? {
      ...a,
      deleted: true,
      updatedAt: new Date(ts).toISOString(),
      _updatedAt: ts
    } : a));
    setSelectedPeopleAbsences(new Set());
    setPeopleContextMenu(null);
  }
  function dropPersonAbsence(source, person, day, stretch, copy) {
    if (!source || !person || !day || !onUpdate) return;
    const ts = Date.now();
    const all = [...(data.personAbsences || [])];
    const start = source.startDay || source.day;
    const end = source.endDay || start;
    const len = Math.max(0, Math.round((parseDate(end) - parseDate(start)) / (1000 * 60 * 60 * 24)));
    const stamp = a => normalizeAbsence({
      ...a,
      updatedAt: new Date(ts).toISOString(),
      _updatedAt: ts
    });
    const blocked = (from, to, ignoreId) => {
      if (personHasTasksInRange(person, from, to)) {
        showAbsenceBlockedByTasks(source.type);
        return true;
      }
      if (personHasAbsenceInRange(person, from, to, ignoreId)) {
        showAbsenceDuplicate();
        return true;
      }
      return false;
    };
    if (stretch) {
      const from = daySort(start) <= daySort(day) ? start : day;
      const to = daySort(start) <= daySort(day) ? day : start;
      if (blocked(from, to, source.id)) return;
      const updated = stamp({
        ...source,
        personId: person.id || "",
        personName: person.name,
        startDay: from,
        endDay: to
      });
      onUpdate("personAbsences", all.map(a => String(a.id) === String(source.id) ? updated : a));
      return;
    }
    const targetEnd = addDays(day, len);
    if (blocked(day, targetEnd, copy ? null : source.id)) return;
    if (copy) {
      const item = stamp({
        ...source,
        id: "abs_" + ts + "_" + Math.random().toString(36).slice(2, 7),
        personId: person.id || "",
        personName: person.name,
        startDay: day,
        endDay: targetEnd,
        deleted: false
      });
      onUpdate("personAbsences", [...all, item]);
      return;
    }
    const moved = stamp({
      ...source,
      personId: person.id || "",
      personName: person.name,
      startDay: day,
      endDay: targetEnd
    });
    onUpdate("personAbsences", all.map(a => String(a.id) === String(source.id) ? moved : a));
  }
  useEffect(() => {
    const h = e => {
      if (e.key === "Escape") {
        setQuery("");
        setRoleFilter("");
        setTaskModal(null);
        setPeopleContextMenu(null);
        setSelectedPeopleTasks(new Set());
        setSelectedPeopleAbsences(new Set());
        setSelectedPeopleNames(new Set());
        setShowSelectedPeopleOnly(false);
      }
      if ((e.key === "Delete" || e.key === "Backspace") && (selectedPeopleTasks.size || selectedPeopleAbsences.size)) {
        e.preventDefault();
        if (selectedPeopleTasks.size) deletePeopleTasks([...selectedPeopleTasks]);else deletePeopleAbsences([...selectedPeopleAbsences]);
      }
    };
    const close = () => setPeopleContextMenu(null);
    document.addEventListener("keydown", h);
    window.addEventListener("click", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("keydown", h);
      window.removeEventListener("click", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [selectedPeopleTasks, selectedPeopleAbsences]);
  const freeCount = people.reduce((sum, p) => sum + days.filter(d => !(taskMap[p.name + "||" + d] || []).length && !cellAbsences(p, d).length).length, 0);
  const absenceCount = people.reduce((sum, p) => sum + days.filter(d => cellAbsences(p, d).length).length, 0);
  return React.createElement("div", null, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
      marginBottom: 12
    }
  }, React.createElement(Btn, {
    small: true,
    variant: "ghost",
    onClick: () => setWeekOffset(w => w - 1)
  }, "\u2190 \u041D\u0435\u0434\u0435\u043B\u044F"), React.createElement(Btn, {
    small: true,
    variant: "ghost",
    onClick: () => setWeekOffset(0)
  }, "\u0421\u0435\u0433\u043E\u0434\u043D\u044F"), React.createElement(Btn, {
    small: true,
    variant: "ghost",
    onClick: () => setWeekOffset(w => w + 1)
  }, "\u041D\u0435\u0434\u0435\u043B\u044F \u2192"), React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 900,
      color: "#93c5fd",
      marginLeft: 6
    }
  }, "\u041D\u0435\u0434\u0435\u043B\u044F ", weekTitle), React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#64748b",
      marginLeft: "auto"
    }
  }, tasks.length, " \u0441\u043C\u0435\u043D ? ", freeCount, " \u0441\u0432\u043E\u0431\u043E\u0434\u043D\u044B\u0445 ? ", absenceCount, " \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0439")), React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginBottom: 12,
      flexWrap: "wrap",
      alignItems: "center"
    }
  }, React.createElement(Inp, {
    value: query,
    onChange: setQuery,
    placeholder: "\u041F\u043E\u0438\u0441\u043A \u0447\u0435\u043B\u043E\u0432\u0435\u043A\u0430...",
    style: {
      maxWidth: 220
    }
  }), React.createElement(Btn, {
    small: true,
    variant: showSelectedPeopleOnly ? "primary" : "ghost",
    disabled: !selectedPeopleNames.size,
    onClick: () => setShowSelectedPeopleOnly(v => !v)
  }, showSelectedPeopleOnly ? "\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u0432\u0441\u0435\u0445" : "\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u0432\u044b\u0434\u0435\u043b\u0435\u043d\u043d\u044b\u0445"), React.createElement("button", {
    onClick: () => setRoleFilter(""),
    style: {
      padding: "4px 10px",
      borderRadius: 999,
      border: "1px solid " + (!roleFilter ? "#3b82f6" : "#334155"),
      background: !roleFilter ? "rgba(59,130,246,.2)" : "transparent",
      color: !roleFilter ? "#bfdbfe" : "#64748b",
      fontSize: 10,
      cursor: "pointer",
      fontFamily: "inherit",
      fontWeight: 800
    }
  }, "\u0412\u0441\u0435 \u0440\u043E\u043B\u0438"), visibleRoles.map(r => React.createElement("button", {
    key: r.id,
    onClick: () => setRoleFilter(roleFilter === r.id ? "" : r.id),
    style: {
      padding: "4px 10px",
      borderRadius: 999,
      border: "1px solid " + (roleFilter === r.id ? r.color || "#3b82f6" : "#334155"),
      background: roleFilter === r.id ? (r.color || "#3b82f6") + "22" : "transparent",
      color: roleFilter === r.id ? r.color || "#93c5fd" : "#64748b",
      fontSize: 10,
      cursor: "pointer",
      fontFamily: "inherit",
      fontWeight: 800
    }
  }, r.label || r.id)), canEdit && React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      alignItems: "center",
      gap: 6,
      flexWrap: "wrap",
      justifyContent: "flex-end"
    }
  }, React.createElement("span", {
    style: {
      fontSize: 10,
      color: "#64748b",
      fontWeight: 900
    }
  }, "\u0417\u0430\u0433\u043e\u0442\u043e\u0432\u043a\u0438"), ABSENCE_TYPES.map(t => React.createElement("button", {
    key: t.id,
    type: "button",
    draggable: true,
    onDragStart: e => {
      dragAbsenceRef.current = {
        templateType: t.id
      };
      e.dataTransfer.effectAllowed = "copy";
      e.dataTransfer.setData("text/plain", t.id);
    },
    onDragEnd: () => {
      dragAbsenceRef.current = null;
    },
    style: {
      height: 22,
      padding: "2px 8px",
      borderRadius: 8,
      border: "1px solid " + t.color + "99",
      borderLeft: "4px solid " + t.color,
      background: hexToRgba(t.color, .14),
      color: t.color,
      fontSize: 10,
      cursor: "grab",
      fontFamily: "inherit",
      fontWeight: 900,
      lineHeight: 1
    }
  }, t.label)), peopleTaskTemplates.map(t => {
    const st = stageMap[t.status] || {};
    const color = st.color || "#60a5fa";
    return React.createElement("button", {
      key: t.status,
      type: "button",
      draggable: true,
      onDragStart: e => {
        dragTaskRef.current = {
          templateStatus: t.status
        };
        e.dataTransfer.effectAllowed = "copy";
        e.dataTransfer.setData("text/plain", t.status);
      },
      onDragEnd: () => {
        dragTaskRef.current = null;
      },
      style: {
        height: 22,
        padding: "2px 8px",
        borderRadius: 8,
        border: "1px solid " + color + "99",
        borderLeft: "4px solid " + color,
        background: hexToRgba(color, .14),
        color,
        fontSize: 10,
        cursor: "grab",
        fontFamily: "inherit",
        fontWeight: 900,
        lineHeight: 1
      }
    }, t.label);
  }))), React.createElement("div", {
    style: {
      overflowX: "auto",
      border: "1px solid rgba(148,163,184,.18)",
      borderRadius: 14,
      background: "rgba(15,23,42,.36)"
    }
  }, React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "220px repeat(14,minmax(92px,1fr))",
      minWidth: 1510
    }
  }, React.createElement("div", {
    style: {
      position: "sticky",
      left: 0,
      zIndex: 3,
      background: "#111c2e",
      borderBottom: "1px solid #334155",
      padding: "10px 12px",
      fontSize: 10,
      color: "#94a3b8",
      fontWeight: 900
    }
  }, "\u0421\u041E\u0422\u0420\u0423\u0414\u041D\u0418\u041A"), days.map(d => {
    const pd = parseDate(d);
    const isToday = d === todayStr;
    return React.createElement("div", {
      key: d,
      style: {
        borderBottom: "1px solid #334155",
        borderLeft: "1px solid rgba(148,163,184,.14)",
        padding: "8px 10px",
        background: isToday ? "rgba(59,130,246,.18)" : "#111c2e"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 10,
        color: isToday ? "#7dd3fc" : "#94a3b8",
        fontWeight: 900
      }
    }, WDAYS[pd.getDay()], " ", String(pd.getDate()).padStart(2, "0"), ".", String(pd.getMonth() + 1).padStart(2, "0")));
  }), groupedPeople.map(group => React.createElement(React.Fragment, {
    key: group.role.id
  }, React.createElement("div", {
    style: {
      gridColumn: "1 / -1",
      background: "rgba(30,41,59,.78)",
      borderTop: "1px solid rgba(148,163,184,.16)",
      borderBottom: "1px solid rgba(148,163,184,.12)",
      padding: "7px 12px",
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: 999,
      background: group.role.color || "#64748b"
    }
  }), React.createElement("span", {
    style: {
      fontSize: 10,
      color: group.role.color || "#94a3b8",
      fontWeight: 900,
      letterSpacing: .5
    }
  }, group.role.label), React.createElement("span", {
    style: {
      fontSize: 8,
      color: "#64748b"
    }
  }, group.people.length)), group.people.map(person => React.createElement(React.Fragment, {
    key: person.id || person.name
  }, React.createElement("div", {
    onClick: e => {
      if (e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        setSelectedPeopleNames(prev => {
          const n = new Set(prev);
          n.has(person.name) ? n.delete(person.name) : n.add(person.name);
          return n;
        });
      }
    },
    onDoubleClick: () => onPersonSelect === null || onPersonSelect === void 0 ? void 0 : onPersonSelect(person.id || person.name),
    style: {
      position: "sticky",
      left: 0,
      zIndex: 2,
      background: selectedPeopleNames.has(person.name) ? "rgba(59,130,246,.22)" : "#0f172a",
      borderTop: "1px solid rgba(148,163,184,.12)",
      padding: "10px 12px",
      display: "flex",
      alignItems: "center",
      gap: 9,
      cursor: onPersonSelect ? "pointer" : "default"
    }
  }, React.createElement("div", {
    style: {
      width: 26,
      height: 26,
      borderRadius: 999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: (group.role.color || "#64748b") + "22",
      border: "1px solid " + (group.role.color || "#64748b") + "66",
      color: group.role.color || "#94a3b8",
      fontWeight: 900,
      fontSize: 12
    }
  }, String(person.name || "?")[0]), React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#e2e8f0",
      fontWeight: 900,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, person.name), React.createElement("div", {
    style: {
      fontSize: 8,
      color: "#64748b",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, (Array.isArray(person.roles) ? person.roles : []).map(r => {
    var _roleMap$r;
    return ((_roleMap$r = roleMap[r]) === null || _roleMap$r === void 0 ? void 0 : _roleMap$r.label) || r;
  }).join(", ") || "без роли"))), days.map(day => {
    const list = taskMap[person.name + "||" + day] || [];
    const abs = cellAbsences(person, day);
    const free = !list.length && !abs.length;
    const primaryAbs = abs[0] ? absenceTypeInfo(abs[0].type) : null;
    const past = daySort(day) < daySort(todayStr);
    const bg = free ? past ? "rgba(250,204,21,.018)" : "rgba(250,204,21,.045)" : primaryAbs ? primaryAbs.color + "14" : "rgba(15,23,42,.56)";
    const border = free ? past ? "rgba(250,204,21,.08)" : "rgba(250,204,21,.18)" : primaryAbs ? primaryAbs.color + "66" : "rgba(148,163,184,.12)";
    const tip = [...abs.map(a => absenceTypeInfo(a.type).label + (a.note ? ": " + a.note : "")), ...list.map(t => {
      const p = data.projects.find(p => p.id === t.project);
      const st = stageMap[t.status] || {};
      return (((p === null || p === void 0 ? void 0 : p.name) || (p === null || p === void 0 ? void 0 : p.abbr) || t.project || "") + (t.series ? " / " + t.series : "") + (t.status ? " / " + (st.label || t.status) : "") + " " + (t.from || "") + "-" + (t.to || "")).trim();
    })].join("\n");
    return React.createElement("div", {
      key: person.name + day,
      title: tip || "Свободен",
      onDoubleClick: () => openNewTask(person, day),
      onContextMenu: e => {
        e.preventDefault();
        e.stopPropagation();
        setPeopleContextMenu({
          x: Math.min(e.clientX, Math.max(8, window.innerWidth - 230)),
          y: Math.min(e.clientY, Math.max(8, window.innerHeight - 168)),
          person,
          day
        });
      },
      onDragOver: e => {
        if (dragTaskRef.current || dragAbsenceRef.current) e.preventDefault();
      },
      onDrop: e => {
        e.preventDefault();
        e.stopPropagation();
        const d = dragTaskRef.current;
        const a = dragAbsenceRef.current;
        dragTaskRef.current = null;
        dragAbsenceRef.current = null;
        if (d) {
          if (d.templateStatus) openTemplateTask(d.templateStatus, person, day);else dropPeopleTask(d.task, person, day, e.shiftKey || d.shift, e.altKey || d.alt);
        }
        if (a) {
          if (a.templateType) addPersonAbsence(person, day, a.templateType);else dropPersonAbsence(a.absence, person, day, e.shiftKey || a.shift, e.altKey || a.alt);
        }
      },
      style: {
        minHeight: 54,
        borderTop: "1px solid rgba(148,163,184,.12)",
        borderLeft: "1px solid rgba(148,163,184,.08)",
        background: bg,
        boxShadow: "inset 0 0 0 1px " + border,
        padding: 3,
        cursor: canEdit ? "cell" : "default"
      }
    }, abs.map(a => {
      const ai = absenceTypeInfo(a.type);
      const isAbsSel = selectedPeopleAbsences.has(a.id);
      return React.createElement("div", {
        key: a.id,
        draggable: canEdit,
        onClick: e => {
          e.stopPropagation();
          setSelectedPeopleAbsences(prev => {
            const n = new Set(prev);
            if (e.shiftKey || e.ctrlKey || e.metaKey) {
              n.has(a.id) ? n.delete(a.id) : n.add(a.id);
            } else {
              n.clear();
              n.add(a.id);
            }
            return n;
          });
        },
        onDragStart: e => {
          e.stopPropagation();
          dragAbsenceRef.current = {
            absence: a,
            alt: e.altKey,
            shift: e.shiftKey
          };
          e.dataTransfer.effectAllowed = e.altKey || e.shiftKey ? "copy" : "move";
          e.dataTransfer.setData("text/plain", String(a.id));
        },
        onDragEnd: () => {
          dragAbsenceRef.current = null;
        },
        onContextMenu: e => {
          e.preventDefault();
          e.stopPropagation();
          setPeopleContextMenu({
            x: Math.min(e.clientX, Math.max(8, window.innerWidth - 230)),
            y: Math.min(e.clientY, Math.max(8, window.innerHeight - 168)),
            person,
            day,
            absence: a
          });
        },
        style: {
          minHeight: list.length ? 22 : 46,
          height: list.length ? 22 : "calc(100% - 2px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 9,
          color: ai.color,
          border: "1px solid " + (isAbsSel ? ai.color : ai.color + "88"),
          background: isAbsSel ? "linear-gradient(135deg," + hexToRgba(ai.color, .38) + "," + hexToRgba(ai.color, .16) + ")" : "linear-gradient(135deg," + ai.color + "24," + ai.color + "0f)",
          boxShadow: isAbsSel ? "0 0 0 2px " + hexToRgba(ai.color, .28) : undefined,
          borderRadius: 9,
          padding: "2px 6px",
          marginBottom: 2,
          fontWeight: 900,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          cursor: canEdit ? "grab" : "default"
        }
      }, ai.label);
    }), list.map(t => {
      const proj = data.projects.find(p => p.id === t.project);
      const st = stageMap[t.status] || {};
      const c = st.color || (proj === null || proj === void 0 ? void 0 : proj.color) || "#64748b";
      const hasC = conflictIds.has(t.id);
      const isSel = selectedPeopleTasks.has(t.id);
      return React.createElement("button", {
        key: t.id,
        draggable: canEdit && canWriteProject(t.project),
        onDragStart: e => {
          dragTaskRef.current = {
            task: t,
            alt: e.altKey,
            shift: e.shiftKey
          };
          e.dataTransfer.effectAllowed = e.altKey || e.shiftKey ? "copy" : "move";
          e.dataTransfer.setData("text/plain", String(t.id));
        },
        onDragEnd: () => {
          dragTaskRef.current = null;
        },
        onMouseEnter: e => setHovTask({
          task: t,
          rect: e.currentTarget.getBoundingClientRect()
        }),
        onMouseLeave: () => setHovTask(null),
        onClick: e => {
          e.stopPropagation();
          if (e.shiftKey || e.ctrlKey || e.metaKey) {
            setSelectedPeopleTasks(prev => {
              const n = new Set(prev);
              n.has(t.id) ? n.delete(t.id) : n.add(t.id);
              return n;
            });
            return;
          }
          setTaskModal(t);
        },
        onContextMenu: e => {
          e.preventDefault();
          e.stopPropagation();
          const ids = selectedPeopleTasks.has(t.id) && selectedPeopleTasks.size > 1 ? [...selectedPeopleTasks] : [t.id];
          setSelectedPeopleTasks(new Set(ids));
          setPeopleContextMenu({
            x: Math.min(e.clientX, Math.max(8, window.innerWidth - 230)),
            y: Math.min(e.clientY, Math.max(8, window.innerHeight - 168)),
            person,
            day,
            task: t,
            ids
          });
        },
        style: {
          display: "block",
          width: "100%",
          textAlign: "left",
          background: hasC ? "rgba(239,68,68,.14)" : isSel ? "rgba(59,130,246,.26)" : "rgba(30,41,59,.86)",
          border: "1px solid " + (hasC ? "rgba(239,68,68,.55)" : isSel ? "rgba(96,165,250,.9)" : c + "66"),
          borderLeft: "3px solid " + c,
          borderRadius: 8,
          padding: "5px 6px",
          marginBottom: 3,
          cursor: "grab",
          fontFamily: "inherit"
        }
      }, React.createElement("div", {
        style: {
          display: "flex",
          gap: 4,
          alignItems: "center",
          minWidth: 0
        }
      }, React.createElement("span", {
        style: {
          fontSize: 8,
          color: c,
          fontWeight: 900,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }
      }, (proj === null || proj === void 0 ? void 0 : proj.abbr) || (proj === null || proj === void 0 ? void 0 : proj.name) || t.project || "Проект"), React.createElement("span", {
        style: {
          fontSize: 8,
          color: "#94a3b8",
          marginLeft: "auto",
          whiteSpace: "nowrap"
        }
      }, t.from, "-", t.to)), React.createElement("div", {
        style: {
          fontSize: 8,
          color: "#e2e8f0",
          fontWeight: 800,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }
      }, t.series || "-", " ? ", st.label || t.status));
    }), free && React.createElement("div", {
      style: {
        fontSize: 8,
        color: past ? "#8a7a28" : "#c6a91a",
        fontWeight: 800,
        opacity: past ? .42 : .68
      }
    }, "\u0421\u0432\u043E\u0431\u043E\u0434\u0435\u043D"));
  }))))))), peopleContextMenu && ((_peopleContextMenu$id, _peopleContextMenu$id2) => {
    const menuItem = {
      display: "block",
      width: "100%",
      textAlign: "left",
      background: "transparent",
      border: "none",
      color: "#dbeafe",
      padding: "8px 10px",
      fontSize: 12,
      fontWeight: 800,
      cursor: "pointer",
      borderRadius: 9,
      fontFamily: "inherit"
    };
    const danger = {
      ...menuItem,
      color: "#fecaca"
    };
    const types = [{
      id: "dayoff",
      label: "\u0412\u044b\u0445\u043e\u0434\u043d\u043e\u0439"
    }, {
      id: "vacation",
      label: "\u041e\u0442\u043f\u0443\u0441\u043a"
    }, {
      id: "sick",
      label: "\u0411\u043e\u043b\u044c\u043d\u0438\u0447\u043d\u044b\u0439"
    }];
    return React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        position: "fixed",
        left: peopleContextMenu.x,
        top: peopleContextMenu.y,
        zIndex: 2147483200,
        width: 220,
        background: "linear-gradient(180deg,rgba(30,41,59,.98),rgba(15,23,42,.98))",
        border: "1px solid rgba(148,163,184,.28)",
        borderRadius: 14,
        boxShadow: "0 18px 50px rgba(0,0,0,.55)",
        padding: 6
      }
    }, peopleContextMenu.task && React.createElement(React.Fragment, null, React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#94a3b8",
        padding: "6px 10px 8px",
        borderBottom: "1px solid rgba(148,163,184,.16)",
        marginBottom: 4
      }
    }, ((_peopleContextMenu$id = peopleContextMenu.ids) === null || _peopleContextMenu$id === void 0 ? void 0 : _peopleContextMenu$id.length) === 1 ? "1 \u0441\u043c\u0435\u043d\u0430" : (((_peopleContextMenu$id2 = peopleContextMenu.ids) === null || _peopleContextMenu$id2 === void 0 ? void 0 : _peopleContextMenu$id2.length) || 1) + " \u0441\u043c\u0435\u043d"), React.createElement("button", {
      type: "button",
      style: menuItem,
      onClick: () => {
        setTaskModal(peopleContextMenu.task);
        setPeopleContextMenu(null);
      }
    }, "\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0441\u043c\u0435\u043d\u0443"), React.createElement("button", {
      type: "button",
      style: danger,
      onClick: () => deletePeopleTasks(peopleContextMenu.ids || [peopleContextMenu.task.id])
    }, "\u0423\u0434\u0430\u043b\u0438\u0442\u044c")), peopleContextMenu.absence && React.createElement(React.Fragment, null, React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#94a3b8",
        padding: "6px 10px 8px",
        borderBottom: "1px solid rgba(148,163,184,.16)",
        marginBottom: 4
      }
    }, absenceTypeInfo(peopleContextMenu.absence.type).label), React.createElement("button", {
      type: "button",
      style: danger,
      onClick: () => deletePersonAbsence(peopleContextMenu.absence.id)
    }, "\u0423\u0434\u0430\u043b\u0438\u0442\u044c")), !peopleContextMenu.task && !peopleContextMenu.absence && React.createElement(React.Fragment, null, React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#94a3b8",
        padding: "6px 10px 8px",
        borderBottom: "1px solid rgba(148,163,184,.16)",
        marginBottom: 4
      }
    }, "\u041d\u0430\u0437\u043d\u0430\u0447\u0438\u0442\u044c \u043e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0435"), types.map(a => React.createElement("button", {
      key: a.id,
      type: "button",
      style: menuItem,
      onClick: () => addPersonAbsence(peopleContextMenu.person, peopleContextMenu.day, a.id)
    }, a.label))));
  })(), people.length === 0 && React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#64748b",
      padding: "18px 0"
    }
  }, "\u041B\u044E\u0434\u0438 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B"), hovTask && React.createElement(TaskTooltip, {
    task: hovTask.task,
    rect: hovTask.rect,
    projects: data.projects
  }), " ", taskModal && React.createElement(TaskModal, {
    task: taskModal,
    data: data,
    onSave: saveTask,
    onDelete: deleteTask,
    onClose: () => setTaskModal(null),
    canEdit: canEdit && (!taskModal.project || canWriteProject(taskModal.project)),
    canEditOldTasks: true,
    canEditProjectById: canEditProjectById
  }));
}
function PeopleViewLegacy(_ref51) {
  let data = _ref51.data,
    conflictIds = _ref51.conflictIds,
    onPersonSelect = _ref51.onPersonSelect,
    canEdit = _ref51.canEdit;
  const _useState123 = useState([]),
    _useState124 = _slicedToArray(_useState123, 2),
    selPeople = _useState124[0],
    setSelPeople = _useState124[1];
  const _useState125 = useState(""),
    _useState126 = _slicedToArray(_useState125, 2),
    filterProject = _useState126[0],
    setFilterProject = _useState126[1];
  const _useState127 = useState("day"),
    _useState128 = _slicedToArray(_useState127, 2),
    groupBy = _useState128[0],
    setGroupBy = _useState128[1];
  const _useState129 = useState(null),
    _useState130 = _slicedToArray(_useState129, 2),
    hovTask = _useState130[0],
    setHovTask = _useState130[1];
  const tasks = useMemo(() => enrichTasks(data.tasks), [data.tasks]);
  const people = useMemo(() => [...new Set(tasks.map(t => t.person).filter(Boolean))].filter(p => data.people.some(dp => dp.name === p)).sort(), [tasks, data.people]);
  const containerRef = useRef(null);
  useEffect(() => {
    const h = e => {
      if (e.key === "Escape") setSelPeople([]);
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);
  useEffect(() => {
    const t = setTimeout(scrollToToday, 150);
    return () => clearTimeout(t);
  }, []);
  function togglePerson(name) {
    setSelPeople(prev => prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]);
  }
  const baseTasks = useMemo(() => {
    let r = tasks;
    if (filterProject) r = r.filter(t => t.project === filterProject);
    return r;
  }, [tasks, filterProject]);
  const showPeople = selPeople.length ? selPeople : people;
  function scrollToToday() {
    if (!containerRef.current) return;
    const today = formatDate(new Date());
    const el = containerRef.current.querySelector(`[data-day="${today}"]`);
    if (el) el.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest"
    });
  }
  return React.createElement("div", null, React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginBottom: 12,
      flexWrap: "wrap",
      alignItems: "center"
    }
  }, React.createElement("button", {
    onClick: () => setSelPeople([]),
    style: {
      padding: "3px 12px",
      borderRadius: 16,
      border: "1px solid",
      cursor: "pointer",
      fontSize: 11,
      borderColor: selPeople.length === 0 ? "#3b82f6" : "#334155",
      background: selPeople.length === 0 ? "rgba(59,130,246,0.2)" : "transparent",
      color: selPeople.length === 0 ? "#93c5fd" : "#64748b"
    }
  }, "\u0432\u0441\u0435"), people.map(p => {
    const active = selPeople.includes(p);
    const hasConflict = tasks.some(t => t.person === p && conflictIds.has(t.id));
    return React.createElement("button", {
      key: p,
      onClick: () => togglePerson(p),
      style: {
        padding: "3px 12px",
        borderRadius: 16,
        border: "1px solid",
        cursor: "pointer",
        fontSize: 11,
        borderColor: active ? "#3b82f6" : "#334155",
        background: active ? "rgba(59,130,246,0.2)" : "transparent",
        color: active ? "#93c5fd" : "#64748b"
      }
    }, p, hasConflict && React.createElement("span", {
      style: {
        width: 5,
        height: 5,
        borderRadius: "50%",
        background: "#ef4444",
        display: "inline-block",
        marginLeft: 4
      }
    }));
  }), React.createElement("span", {
    style: {
      color: "#263352",
      margin: "0 4px"
    }
  }, "\u2502"), [["day", "Дни"], ["week", "Нед"], ["month", "Мес"]].map(_ref52 => {
    let _ref53 = _slicedToArray(_ref52, 2),
      v = _ref53[0],
      l = _ref53[1];
    return React.createElement("button", {
      key: v,
      onClick: () => setGroupBy(v),
      style: {
        padding: "3px 10px",
        borderRadius: 4,
        border: "1px solid",
        cursor: "pointer",
        fontSize: 10,
        borderColor: groupBy === v ? "#475569" : "#263352",
        background: groupBy === v ? "#334155" : "transparent",
        color: groupBy === v ? "#cbd5e1" : "#475569"
      }
    }, l);
  }), React.createElement(Btn, {
    small: true,
    variant: "ghost",
    onClick: scrollToToday
  }, "\u2192 \u0421\u0435\u0433\u043E\u0434\u043D\u044F"), selPeople.length > 0 && React.createElement("span", {
    style: {
      fontSize: 11,
      color: "#475569"
    }
  }, "ESC \u2014 \u0441\u043D\u044F\u0442\u044C \u0432\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u0435")), React.createElement("div", {
    ref: containerRef,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, showPeople.map(person => {
    const pTasks = baseTasks.filter(t => t.person === person);
    if (!pTasks.length) return null;
    const cDays = [...new Set(pTasks.filter(t => conflictIds.has(t.id)).map(t => t._dayKey))];
    const groups = {};
    pTasks.forEach(t => {
      const k = groupBy === "week" ? t._weekKey : groupBy === "month" ? t._monthKey : t._dayKey;
      if (!groups[k]) groups[k] = [];
      groups[k].push(t);
    });
    const pInfo = data.people.find(p => p.name === person);
    return React.createElement("div", {
      key: person
    }, React.createElement("div", {
      onDoubleClick: () => onPersonSelect && onPersonSelect((pInfo === null || pInfo === void 0 ? void 0 : pInfo.id) || person),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 10,
        cursor: onPersonSelect ? "pointer" : "default"
      }
    }, React.createElement("div", {
      style: {
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "#1e293b",
        border: "2px solid #3b82f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 700,
        color: "#3b82f6"
      }
    }, person[0]), React.createElement("span", {
      style: {
        fontSize: 15,
        fontWeight: 700
      }
    }, person), onPersonSelect && React.createElement("span", {
      style: {
        fontSize: 10,
        color: "#334155",
        marginLeft: 2
      }
    }, "2\xD7 \u043A\u043B\u0438\u043A \u2192 \u043F\u0440\u043E\u0444\u0438\u043B\u044C"), cDays.length > 0 && React.createElement("span", {
      style: {
        background: "rgba(239,68,68,0.15)",
        border: "1px solid rgba(239,68,68,0.4)",
        borderRadius: 12,
        padding: "2px 10px",
        fontSize: 11,
        color: "#f87171"
      }
    }, "\u26A1 \u043A\u043E\u043D\u0444\u043B\u0438\u043A\u0442\u044B: ", cDays.map(d => dayLabel(d)).join(", "))), React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: `repeat(${Math.min(Object.keys(groups).length, 7)},1fr)`,
        gap: 6
      }
    }, Object.entries(groups).sort((_ref54, _ref55) => {
      let _ref56 = _slicedToArray(_ref54, 1),
        a = _ref56[0];
      let _ref57 = _slicedToArray(_ref55, 1),
        b = _ref57[0];
      return daySort(a).localeCompare(daySort(b));
    }).map(_ref58 => {
      let _ref59 = _slicedToArray(_ref58, 2),
        gk = _ref59[0],
        gtasks = _ref59[1];
      const hasC = gtasks.some(t => conflictIds.has(t.id));
      const label = groupBy === "day" ? dayLabel(gk) : groupBy === "week" ? `Нед ${weekLabel(gtasks[0].day)}` : `${MONTHS[parseInt(gk.split("-")[1]) - 1]}`;
      return React.createElement("div", {
        key: gk,
        "data-day": groupBy === "day" ? gk : undefined,
        style: {
          background: hasC ? "rgba(239,68,68,0.05)" : "#1e293b",
          border: `1px solid ${hasC ? "rgba(239,68,68,0.35)" : "#334155"}`,
          borderRadius: 12,
          padding: "8px 10px",
          minHeight: 60
        }
      }, React.createElement("div", {
        style: {
          fontSize: 9,
          color: hasC ? "#f87171" : "#475569",
          marginBottom: 5,
          letterSpacing: 0.5
        }
      }, label, hasC && " ⚡"), gtasks.map(t => React.createElement(TaskCard, {
        key: t.id,
        task: t,
        projects: data.projects,
        isConflict: conflictIds.has(t.id),
        large: true,
        onHover: (t, r) => setHovTask(t ? {
          task: t,
          rect: r
        } : null)
      })));
    })));
  })), hovTask && React.createElement(TaskTooltip, {
    task: hovTask.task,
    rect: hovTask.rect,
    projects: data.projects
  }));
}
function ConflictsView(_ref60) {
  let details = _ref60.details,
    data = _ref60.data;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDate(today);
  const in7 = new Date(today);
  in7.setDate(today.getDate() + 7);
  const in7Str = formatDate(in7);
  const unfilledTasks = useMemo(() => data.tasks.filter(t => !t.person && daySort(t.day) >= daySort(todayStr) && daySort(t.day) <= daySort(in7Str) && t.status !== "съёмки").sort((a, b) => daySort(a.day).localeCompare(daySort(b.day)) || a.status.localeCompare(b.status)), [data.tasks, todayStr, in7Str]);
  const overlapDetails = details.filter(d => d.type === "overlap" || !d.type);
  const roleDetails = details.filter(d => d.type === "role");
  const absenceDetails = details.filter(d => d.type === "absence");
  const passiveDetails = details.filter(d => d.notify === false);
  const byDay = {};
  overlapDetails.forEach(c => {
    if (!byDay[c.dayStr]) byDay[c.dayStr] = [];
    byDay[c.dayStr].push(c);
  });
  const hasAnything = details.length > 0 || unfilledTasks.length > 0;
  if (!hasAnything) return React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "60px 20px",
      color: "#475569"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 40,
      marginBottom: 12
    }
  }, "OK"), React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: "#94a3b8"
    }
  }, "\u0412\u0441\u0451 \u0432 \u043F\u043E\u0440\u044F\u0434\u043A\u0435"), React.createElement("div", {
    style: {
      fontSize: 13,
      marginTop: 6
    }
  }, "\u041A\u043E\u043D\u0444\u043B\u0438\u043A\u0442\u043E\u0432 \u043D\u0435\u0442, \u0432\u0441\u0435 \u0441\u043C\u0435\u043D\u044B \u043D\u0430 7 \u0434\u043D\u0435\u0439 \u0437\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u044B"));
  return React.createElement("div", null, unfilledTasks.length > 0 && React.createElement("div", {
    style: {
      marginBottom: 24
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 12
    }
  }, React.createElement("div", {
    style: {
      background: "rgba(249,115,22,0.1)",
      border: "1px solid rgba(249,115,22,0.35)",
      borderRadius: 12,
      padding: "8px 14px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      flex: 1
    }
  }, React.createElement("span", {
    style: {
      fontSize: 18
    }
  }, "!"), React.createElement("span", {
    style: {
      fontWeight: 700,
      color: "#fb923c",
      fontSize: 14
    }
  }, "\u0411\u0435\u0437 \u0438\u0441\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044F: ", unfilledTasks.length), React.createElement("span", {
    style: {
      color: "#64748b",
      fontSize: 12
    }
  }, "\u0441\u043C\u0435\u043D\u044B \u043D\u0430 7 \u0434\u043D\u0435\u0439 \u0431\u0435\u0437 \u043D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u043D\u043E\u0433\u043E \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0430"))), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, unfilledTasks.map(t => {
    const proj = data.projects.find(p => p.id === t.project);
    const isToday = t.day === todayStr;
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = formatDate(tomorrow);
    const isUrgent = daySort(t.day) <= daySort(tomorrowStr);
    return React.createElement("div", {
      key: t.id,
      style: {
        background: "#1e293b",
        border: `1px solid ${isUrgent ? "rgba(249,115,22,0.4)" : "#334155"}`,
        borderLeft: `3px solid ${isUrgent ? "#f97316" : "#475569"}`,
        borderRadius: 12,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, React.createElement("div", {
      style: {
        minWidth: 70,
        fontSize: 11,
        fontWeight: 700,
        color: isToday ? "#f97316" : isUrgent ? "#fb923c" : "#64748b"
      }
    }, isToday ? "Сегодня" : dayLabel(t.day)), React.createElement(ProjectMark, {
      project: proj,
      size: 8
    }), React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 12,
        color: "#e2e8f0"
      }
    }, (proj === null || proj === void 0 ? void 0 : proj.name) || t.project, " \xB7 ", t.series), React.createElement(StatusBadge, {
      s: t.status,
      small: true
    }), React.createElement("div", {
      style: {
        marginLeft: "auto",
        fontSize: 11,
        color: "#475569"
      }
    }, fmtHour(t.from), "\u2013", fmtHour(t.to)));
  }))), absenceDetails.length > 0 && React.createElement("div", {
    style: {
      marginBottom: 24
    }
  }, React.createElement("div", {
    style: {
      background: "rgba(248,113,113,0.1)",
      border: "1px solid rgba(248,113,113,0.32)",
      borderRadius: 12,
      padding: "8px 14px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 12
    }
  }, React.createElement("span", {
    style: {
      fontSize: 18
    }
  }, "!"), React.createElement("span", {
    style: {
      fontWeight: 700,
      color: "#fca5a5",
      fontSize: 14
    }
  }, "\u0421\u043C\u0435\u043D\u0430 \u0432 \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0435: ", absenceDetails.length), React.createElement("span", {
    style: {
      color: "#64748b",
      fontSize: 12
    }
  }, "\u0447\u0435\u043B\u043E\u0432\u0435\u043A \u043E\u0442\u043C\u0435\u0447\u0435\u043D \u043A\u0430\u043A \u0432\u044B\u0445\u043E\u0434\u043D\u043E\u0439 / \u043E\u0442\u043F\u0443\u0441\u043A / \u0431\u043E\u043B\u0435\u0437\u043D\u044C")), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, absenceDetails.map(c => {
    const proj = data.projects.find(p => p.id === c.task.project);
    const ai = absenceTypeInfo(c.absence.type);
    return React.createElement("div", {
      key: c.key,
      style: {
        background: "#1e293b",
        border: "1px solid " + ai.color + "55",
        borderLeft: "3px solid " + ai.color,
        borderRadius: 12,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap"
      }
    }, React.createElement("div", {
      style: {
        minWidth: 70,
        fontSize: 11,
        fontWeight: 700,
        color: ai.color
      }
    }, dayLabel(c.task.day)), React.createElement(ProjectMark, {
      project: proj,
      size: 8
    }), React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 12,
        color: "#e2e8f0"
      }
    }, (proj === null || proj === void 0 ? void 0 : proj.name) || c.task.project, " \xB7 ", c.task.series), React.createElement(StatusBadge, {
      s: c.task.status,
      small: true
    }), React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#f8fafc",
        fontWeight: 700
      }
    }, c.person), React.createElement("span", {
      style: {
        fontSize: 11,
        color: ai.color,
        border: "1px solid " + ai.color + "66",
        background: ai.color + "18",
        borderRadius: 999,
        padding: "2px 8px",
        fontWeight: 800
      }
    }, ai.label), React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#64748b",
        marginLeft: "auto"
      }
    }, c.absence.startDay, c.absence.endDay && c.absence.endDay !== c.absence.startDay ? " - " + c.absence.endDay : ""));
  }))), roleDetails.length > 0 && React.createElement("div", {
    style: {
      marginBottom: 24
    }
  }, React.createElement("div", {
    style: {
      background: "rgba(239,68,68,0.1)",
      border: "1px solid rgba(239,68,68,0.3)",
      borderRadius: 12,
      padding: "8px 14px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 12
    }
  }, React.createElement("span", {
    style: {
      fontSize: 18
    }
  }, "\uD83D\uDEAB"), React.createElement("span", {
    style: {
      fontWeight: 700,
      color: "#f87171",
      fontSize: 14
    }
  }, "\u041D\u0435\u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0438\u0435 \u0440\u043E\u043B\u0435\u0439: ", roleDetails.length), React.createElement("span", {
    style: {
      color: "#64748b",
      fontSize: 12
    }
  }, "\u043D\u0430\u0437\u043D\u0430\u0447\u0435\u043D \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0441\u0442 \u0431\u0435\u0437 \u043D\u0443\u0436\u043D\u043E\u0439 \u0440\u043E\u043B\u0438")), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, roleDetails.map(c => {
    const proj = data.projects.find(p => p.id === c.task.project);
    return React.createElement("div", {
      key: c.key,
      style: {
        background: "#1e293b",
        border: "1px solid rgba(239,68,68,0.3)",
        borderLeft: "3px solid #ef4444",
        borderRadius: 12,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap"
      }
    }, React.createElement("div", {
      style: {
        minWidth: 70,
        fontSize: 11,
        fontWeight: 700,
        color: "#64748b"
      }
    }, dayLabel(c.task.day)), React.createElement(ProjectMark, {
      project: proj,
      size: 8
    }), React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 12,
        color: "#e2e8f0"
      }
    }, (proj === null || proj === void 0 ? void 0 : proj.name) || c.task.project, " \xB7 ", c.task.series), React.createElement(StatusBadge, {
      s: c.task.status,
      small: true
    }), React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#f87171",
        fontWeight: 600
      }
    }, c.person), React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#475569",
        marginLeft: "auto"
      }
    }, "\u043D\u0443\u0436\u043D\u043E: ", React.createElement("span", {
      style: {
        color: "#94a3b8"
      }
    }, c.requiredRoles.join(", ")), " · ", "\u0435\u0441\u0442\u044C: ", React.createElement("span", {
      style: {
        color: "#94a3b8"
      }
    }, c.personRoles.join(", ") || "—")));
  }))), overlapDetails.length > 0 && React.createElement("div", null, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 16
    }
  }, React.createElement("div", {
    style: {
      background: "rgba(239,68,68,0.1)",
      border: "1px solid rgba(239,68,68,0.3)",
      borderRadius: 12,
      padding: "8px 14px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      flex: 1
    }
  }, React.createElement("span", {
    style: {
      fontSize: 18
    }
  }, "\u26A1"), React.createElement("span", {
    style: {
      fontWeight: 700,
      color: "#f87171",
      fontSize: 14
    }
  }, "\u041F\u0435\u0440\u0435\u0441\u0435\u0447\u0435\u043D\u0438\u0439: ", overlapDetails.length), React.createElement("span", {
    style: {
      color: "#64748b",
      fontSize: 12
    }
  }, "\u043E\u0434\u0438\u043D \u0447\u0435\u043B\u043E\u0432\u0435\u043A \u2014 \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0437\u0430\u0434\u0430\u0447 \u0432 \u043F\u0435\u0440\u0435\u0441\u0435\u043A\u0430\u044E\u0449\u0435\u0435\u0441\u044F \u0432\u0440\u0435\u043C\u044F"))), Object.entries(byDay).sort((_ref61, _ref62) => {
    let _ref63 = _slicedToArray(_ref61, 1),
      a = _ref63[0];
    let _ref64 = _slicedToArray(_ref62, 1),
      b = _ref64[0];
    return daySort(a).localeCompare(daySort(b));
  }).map(_ref65 => {
    let _ref66 = _slicedToArray(_ref65, 2),
      day = _ref66[0],
      pairs = _ref66[1];
    return React.createElement("div", {
      key: day,
      style: {
        marginBottom: 20
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 10
      }
    }, React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: "#f87171"
      }
    }, dayLabel(day)), React.createElement("div", {
      style: {
        flex: 1,
        height: 1,
        background: "rgba(239,68,68,0.2)"
      }
    })), pairs.map((p, i) => {
      const colorA = projColor(data.projects, p.taskA.project);
      const colorB = projColor(data.projects, p.taskB.project);
      const minT = 8,
        maxT = 22,
        range = maxT - minT;
      const pct = v => `${(v - minT) / range * 100}%`;
      return React.createElement("div", {
        key: i,
        style: {
          background: "#1e293b",
          border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: 12,
          padding: "12px 16px",
          marginBottom: 10
        }
      }, React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10
        }
      }, React.createElement("div", {
        style: {
          width: 26,
          height: 26,
          borderRadius: 10,
          background: "#0f172a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: 12,
          color: "#ef4444",
          border: "1px solid rgba(239,68,68,0.4)"
        }
      }, p.person[0]), React.createElement("span", {
        style: {
          fontWeight: 700,
          fontSize: 13
        }
      }, p.person), React.createElement("span", {
        style: {
          color: "#64748b",
          fontSize: 11
        }
      }, "\u2014 \u043F\u0435\u0440\u0435\u0441\u0435\u0447\u0435\u043D\u0438\u0435 ", p.overlapFrom, ":00\u2013", p.overlapTo, ":00 (", p.overlapTo - p.overlapFrom, "\u0447)")), React.createElement("div", {
        style: {
          position: "relative",
          height: 46,
          marginBottom: 10
        }
      }, [8, 10, 12, 14, 16, 18, 20, 22].map(h => React.createElement("div", {
        key: h,
        style: {
          position: "absolute",
          left: pct(h),
          top: 0,
          bottom: 0,
          borderLeft: "1px solid #1e293b",
          pointerEvents: "none"
        }
      }, React.createElement("span", {
        style: {
          position: "absolute",
          bottom: 0,
          fontSize: 8,
          color: "#334155",
          paddingLeft: 2
        }
      }, h))), [{
        t: p.taskA,
        c: colorA,
        top: 4
      }, {
        t: p.taskB,
        c: colorB,
        top: 24
      }].map(_ref67 => {
        let t = _ref67.t,
          c = _ref67.c,
          top = _ref67.top;
        return React.createElement("div", {
          key: t.id,
          style: {
            position: "absolute",
            left: pct(t.from || 0),
            width: `${(t.to - t.from) / range * 100}%`,
            top,
            height: 16,
            background: c,
            borderRadius: 3,
            opacity: 0.9,
            display: "flex",
            alignItems: "center",
            paddingLeft: 4,
            overflow: "hidden"
          }
        }, React.createElement("span", {
          style: {
            fontSize: 8,
            color: "#fff",
            fontWeight: 700,
            whiteSpace: "nowrap"
          }
        }, projName(data.projects, t.project), " ", t.series));
      }), React.createElement("div", {
        style: {
          position: "absolute",
          left: pct(p.overlapFrom),
          width: `${(p.overlapTo - p.overlapFrom) / range * 100}%`,
          top: 0,
          height: 46,
          background: "rgba(239,68,68,0.12)",
          border: "1px solid rgba(239,68,68,0.35)",
          borderRadius: 3
        }
      })));
    }));
  })), passiveDetails.length > 0 && React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, React.createElement("div", {
    style: {
      background: "rgba(148,163,184,0.08)",
      border: "1px solid rgba(148,163,184,0.22)",
      borderRadius: 12,
      padding: "8px 14px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 12
    }
  }, React.createElement("span", {
    style: {
      fontSize: 18
    }
  }, "i"), React.createElement("span", {
    style: {
      fontWeight: 700,
      color: "#94a3b8",
      fontSize: 14
    }
  }, "\u0411\u0435\u0437 \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u044f", ": ", passiveDetails.length), React.createElement("span", {
    style: {
      color: "#64748b",
      fontSize: 12
    }
  }, "\u043d\u0435 \u0433\u043e\u0440\u0438\u0442 \u0432 \u0441\u0447\u0435\u0442\u0447\u0438\u043a\u0435, \u043d\u043e \u0442\u0440\u0435\u0431\u0443\u0435\u0442 \u0432\u043d\u0438\u043c\u0430\u043d\u0438\u044f")), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, passiveDetails.map(c => {
    if (c.type === "long-shift") {
      const t = c.task || {};
      const proj = (data.projects || []).find(p => p.id === t.project);
      return React.createElement("div", {
        key: c.key,
        style: {
          background: "#1e293b",
          border: "1px solid rgba(248,113,113,0.22)",
          borderLeft: "3px solid #f87171",
          borderRadius: 10,
          padding: "9px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 12
        }
      }, React.createElement("span", {
        style: {
          color: "#94a3b8",
          minWidth: 78
        }
      }, dayLabel(t.day)), React.createElement(ProjectMark, {
        project: proj,
        size: 8
      }), React.createElement("span", {
        style: {
          fontWeight: 700,
          color: "#e2e8f0"
        }
      }, (proj === null || proj === void 0 ? void 0 : proj.name) || t.project || "—"), React.createElement("span", {
        style: {
          color: "#94a3b8"
        }
      }, t.series || "—"), React.createElement(StatusBadge, {
        s: t.status,
        small: true
      }), React.createElement("span", {
        style: {
          color: "#cbd5e1",
          marginLeft: "auto"
        }
      }, t.person || "без исполнителя"), React.createElement("span", {
        style: {
          color: "#fca5a5",
          fontWeight: 700
        }
      }, "\u0434\u043B\u0438\u043D\u043D\u0430\u044F \u0441\u043C\u0435\u043D\u0430: ", Number(c.hours || 0).toFixed(1), " \u0447"));
    }
    if (c.type === "project-manager") {
      const proj = c.project;
      return React.createElement("div", {
        key: c.key,
        style: {
          background: "#1e293b",
          border: "1px solid rgba(148,163,184,0.2)",
          borderLeft: "3px solid #64748b",
          borderRadius: 12,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 12
        }
      }, React.createElement(ProjectMark, {
        project: proj,
        size: 8
      }), React.createElement("div", {
        style: {
          fontWeight: 700,
          fontSize: 12,
          color: "#e2e8f0"
        }
      }, (proj === null || proj === void 0 ? void 0 : proj.name) || (proj === null || proj === void 0 ? void 0 : proj.id)), React.createElement("div", {
        style: {
          fontSize: 11,
          color: "#94a3b8"
        }
      }, "\u043f\u0440\u043e\u0435\u043a\u0442 \u0431\u0435\u0437 \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u0430"));
    }
    return null;
  }))));
}
function computeStageTimings(tasks, series, stages, stageGroups) {
  return stageGroups.map(g => {
    const stageIds = (stages || []).filter(s => s.groupId === g.id).map(s => s.id);
    if (!stageIds.length) return null;
    const durations = [];
    (series || []).forEach(ser => {
      const t = tasks.filter(x => x.seriesId === ser.id && stageIds.includes(x.status));
      if (!t.length) return;
      const days = [...new Set(t.map(x => x.day))].sort((a, b) => daySort(a).localeCompare(daySort(b)));
      const first = parseDate(days[0]),
        last = parseDate(days[days.length - 1]);
      if (!first || !last) return;
      const span = Math.round((last - first) / (1000 * 60 * 60 * 24)) + 1;
      durations.push({
        seriesId: ser.id,
        projectId: ser.projectId,
        days: span
      });
    });
    if (!durations.length) return null;
    const vals = durations.map(d => d.days);
    const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
    const min = Math.min(...vals),
      max = Math.max(...vals);
    const sigma = Math.sqrt(vals.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / vals.length);
    const longest = durations.find(d => d.days === max);
    return {
      group: g,
      avg,
      sigma,
      min,
      max,
      longest,
      count: durations.length
    };
  }).filter(Boolean);
}
function computeShifts(tasks, people) {
  const byPersonDay = {};
  tasks.filter(t => !t.deleted && !t.cancelled).forEach(t => {
    if (!t.person) return;
    const key = t.person + "|" + t.day;
    byPersonDay[key] = (byPersonDay[key] || 0) + (Number(t.to) || 0) - (Number(t.from) || 0);
  });
  const byPerson = {};
  Object.entries(byPersonDay).forEach(_ref68 => {
    let _ref69 = _slicedToArray(_ref68, 2),
      key = _ref69[0],
      hours = _ref69[1];
    const _key$split = key.split("|"),
      _key$split2 = _slicedToArray(_key$split, 1),
      person = _key$split2[0];
    if (!byPerson[person]) byPerson[person] = {
      person,
      exits: 0,
      shifts: 0
    };
    byPerson[person].exits += 1;
    byPerson[person].shifts += shiftFactFromHours(hours);
  });
  return Object.values(byPerson).map(r => {
    const p = people.find(p => p.name === r.person);
    const role = p && p.roles && p.roles[0] || "";
    return {
      ...r,
      role
    };
  }).sort((a, b) => a.role.localeCompare(b.role) || a.person.localeCompare(b.person));
}
function AnalyticsView(_ref70) {
  let data = _ref70.data,
    onPersonSelect = _ref70.onPersonSelect;
  const _useContext0 = useContext(StagesCtx),
    stages = _useContext0.sorted,
    stageGroups = _useContext0.stageGroups,
    stageMap = _useContext0.stageMap;
  const _useState131 = useState("shifts"),
    _useState132 = _slicedToArray(_useState131, 2),
    atab = _useState132[0],
    setAtab = _useState132[1];
  const _useState133 = useState(""),
    _useState134 = _slicedToArray(_useState133, 2),
    filterProject = _useState134[0],
    setFilterProject = _useState134[1];
  const _useState135 = useState(""),
    _useState136 = _slicedToArray(_useState135, 2),
    filterSeries = _useState136[0],
    setFilterSeries = _useState136[1];
  const _useState137 = useState(""),
    _useState138 = _slicedToArray(_useState137, 2),
    filterPerson = _useState138[0],
    setFilterPerson = _useState138[1];
  const _useState139 = useState(""),
    _useState140 = _slicedToArray(_useState139, 2),
    peopleSearch = _useState140[0],
    setPeopleSearch = _useState140[1];
  const _useState141 = useState(""),
    _useState142 = _slicedToArray(_useState141, 2),
    dateFrom = _useState142[0],
    setDateFrom = _useState142[1];
  const _useState143 = useState(""),
    _useState144 = _slicedToArray(_useState143, 2),
    dateTo = _useState144[0],
    setDateTo = _useState144[1];
  const filteredTasks = useMemo(() => {
    const noImpactIds = new Set(stages.filter(s => s.noImpact).map(s => s.id));
    let t = data.tasks.filter(x => !x.deleted && !x.cancelled && !noImpactIds.has(x.status));
    if (filterProject) t = t.filter(x => x.project === filterProject);
    if (filterSeries) t = t.filter(x => x.series === filterSeries);
    if (filterPerson) t = t.filter(x => x.person === filterPerson);
    if (dateFrom) t = t.filter(x => daySort(x.day) >= daySort(dateFrom));
    if (dateTo) t = t.filter(x => daySort(x.day) <= daySort(dateTo));
    return t;
  }, [data.tasks, filterProject, filterSeries, filterPerson, dateFrom, dateTo, stages]);
  const seriesOptions = useMemo(() => {
    const base = data.series || [];
    return filterProject ? base.filter(s => s.projectId === filterProject) : base;
  }, [data.series, filterProject]);
  const rows = useMemo(() => computeShifts(filteredTasks, data.people), [filteredTasks, data.people]);
  const roleMap = useMemo(() => {
    const m = {};
    data.roles.forEach(r => {
      m[r.id] = {
        label: r.label,
        color: r.color
      };
    });
    return m;
  }, [data.roles]);
  const roleTotals = useMemo(() => {
    const m = {};
    rows.forEach(r => {
      if (!m[r.role]) m[r.role] = {
        exits: 0,
        shifts: 0
      };
      m[r.role].exits += r.exits;
      m[r.role].shifts += r.shifts;
    });
    return Object.entries(m).sort((a, b) => a[0].localeCompare(b[0]));
  }, [rows]);
  const totalShifts = rows.reduce((s, r) => s + r.shifts, 0);
  const totalExits = rows.reduce((s, r) => s + r.exits, 0);
  const allPeople = useMemo(() => [...new Set(data.tasks.filter(t => t.person).map(t => t.person))].sort(), [data.tasks]);
  const filteredSeries = useMemo(() => {
    let s = data.series || [];
    if (filterProject) s = s.filter(x => x.projectId === filterProject);
    return s;
  }, [data.series, filterProject]);
  const stageTimings = useMemo(() => computeStageTimings(filteredTasks, filteredSeries, stages, stageGroups), [filteredTasks, filteredSeries, stages, stageGroups]);
  const TH = {
    padding: "8px 12px",
    textAlign: "left",
    fontSize: 11,
    color: "#64748b",
    letterSpacing: 1,
    borderBottom: "1px solid #334155",
    fontWeight: 600,
    textTransform: "uppercase"
  };
  const TD = {
    padding: "8px 12px",
    fontSize: 13,
    borderBottom: "1px solid #1e293b"
  };
  const activePeople = useMemo(() => {
    const noImpactIds = new Set(stages.filter(s => s.noImpact).map(s => s.id));
    return (data.people || []).filter(p => p.active !== false).map(p => {
      const pTasks = data.tasks.filter(t => t.person === p.name && !t.cancelled && !noImpactIds.has(t.status));
      const hours = pTasks.reduce((s, t) => (Number(t.to) || 0) - (Number(t.from) || 0) + s, 0);
      const lastTask = pTasks.length ? pTasks.reduce((a, b) => daySort(a.day) > daySort(b.day) ? a : b) : null;
      return {
        ...p,
        taskCount: pTasks.length,
        hours,
        lastDay: (lastTask === null || lastTask === void 0 ? void 0 : lastTask.day) || ""
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [data.people, data.tasks, stages]);
  useEffect(() => {
    function reset() {
      if (peopleSearch) {
        setPeopleSearch("");
        return;
      }
      if (filterPerson) {
        setFilterPerson("");
        return;
      }
      if (filterProject || filterSeries || dateFrom || dateTo) {
        setFilterProject("");
        setFilterSeries("");
        setDateFrom("");
        setDateTo("");
      }
    }
    window.addEventListener("ppt-escape", reset);
    return () => window.removeEventListener("ppt-escape", reset);
  }, [peopleSearch, filterPerson, filterProject, filterSeries, dateFrom, dateTo]);
  const visiblePeople = useMemo(() => {
    const q = peopleSearch.trim().toLowerCase();
    if (!q) return activePeople;
    return activePeople.filter(p => {
      const roleLabels = (p.roles || []).map(rid => {
        var _find3;
        return ((_find3 = (data.roles || []).find(r => r.id === rid)) === null || _find3 === void 0 ? void 0 : _find3.label) || rid;
      });
      const hay = [p.name, p.login, p.email, p.birthday, ...(p.roles || []), ...roleLabels].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [activePeople, data.roles, peopleSearch]);
  return React.createElement("div", null, React.createElement("div", {
    style: {
      display: "flex",
      gap: 2,
      marginBottom: 20,
      background: "#0f172a",
      borderRadius: 12,
      border: "1px solid #334155",
      overflow: "hidden",
      width: "fit-content"
    }
  }, [{
    id: "shifts",
    label: "Аналитика смен"
  }, {
    id: "people",
    label: `Люди (${activePeople.length})`
  }].map(t => React.createElement("button", {
    key: t.id,
    onClick: () => setAtab(t.id),
    style: {
      padding: "6px 16px",
      border: "none",
      cursor: "pointer",
      fontSize: 12,
      fontFamily: "inherit",
      background: atab === t.id ? "#3b82f6" : "transparent",
      color: atab === t.id ? "#fff" : "#64748b",
      fontWeight: atab === t.id ? 700 : 400
    }
  }, t.label))), atab === "people" && React.createElement("div", null, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
      maxWidth: 360
    }
  }, React.createElement(Inp, {
    value: peopleSearch,
    onChange: setPeopleSearch,
    placeholder: "\\u041f\\u043e\\u0438\\u0441\\u043a: \\u0438\\u043c\\u044f, \\u043b\\u043e\\u0433\\u0438\\u043d, \\u0440\\u043e\\u043b\\u044c"
  }), peopleSearch && React.createElement(Btn, {
    small: true,
    variant: "ghost",
    onClick: () => setPeopleSearch("")
  }, "x")), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
      gap: 10
    }
  }, visiblePeople.map(p => {
    const roleObjs = (p.roles || []).map(rid => (data.roles || []).find(r => r.id === rid)).filter(Boolean);
    const mainRole = roleObjs[0];
    return React.createElement("button", {
      key: p.id,
      onClick: () => onPersonSelect && onPersonSelect(p.id),
      style: {
        background: "#1e293b",
        border: `1px solid ${(mainRole === null || mainRole === void 0 ? void 0 : mainRole.color) || "#334155"}44`,
        borderRadius: 14,
        padding: "14px 16px",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "inherit",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        transition: "border-color 0.15s"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, React.createElement("div", {
      style: {
        width: 36,
        height: 36,
        borderRadius: "50%",
        flexShrink: 0,
        background: `${(mainRole === null || mainRole === void 0 ? void 0 : mainRole.color) || "#3b82f6"}22`,
        border: `2px solid ${(mainRole === null || mainRole === void 0 ? void 0 : mainRole.color) || "#3b82f6"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 15,
        fontWeight: 800,
        color: (mainRole === null || mainRole === void 0 ? void 0 : mainRole.color) || "#3b82f6"
      }
    }, (p.name || "?")[0]), React.createElement("div", null, React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 13,
        color: "#e2e8f0"
      }
    }, p.name), React.createElement("div", {
      style: {
        display: "flex",
        gap: 4,
        flexWrap: "wrap",
        marginTop: 2
      }
    }, roleObjs.map(r => React.createElement("span", {
      key: r.id,
      style: {
        fontSize: 10,
        color: r.color,
        border: `1px solid ${r.color}55`,
        borderRadius: 3,
        padding: "0px 5px"
      }
    }, r.label))))), React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        fontSize: 11,
        color: "#475569",
        paddingTop: 4,
        borderTop: "1px solid #1e293b"
      }
    }, React.createElement("span", null, p.taskCount, " \u0437\u0430\u0434\u0430\u0447"), React.createElement("span", null, p.hours, " \u0447"), p.lastDay && React.createElement("span", {
      style: {
        marginLeft: "auto",
        color: "#334155"
      }
    }, p.lastDay)));
  })), visiblePeople.length === 0 && React.createElement("div", {
    style: {
      color: "#475569",
      fontSize: 14,
      textAlign: "center",
      padding: "30px 0"
    }
  }, "\u041d\u0438\u043a\u043e\u0433\u043e \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e")), atab === "shifts" && React.createElement("div", null, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
      flexWrap: "wrap",
      gap: 10
    }
  }, React.createElement("span", {
    style: {
      fontSize: 16,
      fontWeight: 700
    }
  }, "\u0410\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0430 \u0441\u043C\u0435\u043D"), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    }
  }, React.createElement("select", {
    value: filterProject,
    onChange: e => {
      setFilterProject(e.target.value);
      setFilterSeries("");
    },
    style: {
      background: "rgba(30,41,59,.72)",
      border: "1px solid rgba(148,163,184,.18)",
      color: filterProject ? "#e2e8f0" : "#64748b",
      borderRadius: 10,
      padding: "5px 10px",
      fontSize: 12
    }
  }, React.createElement("option", {
    value: ""
  }, "\u0412\u0441\u0435 \u043F\u0440\u043E\u0435\u043A\u0442\u044B"), data.projects.map(p => React.createElement("option", {
    key: p.id,
    value: p.id
  }, p.name))), React.createElement("select", {
    value: filterSeries,
    onChange: e => setFilterSeries(e.target.value),
    style: {
      background: "rgba(30,41,59,.72)",
      border: "1px solid rgba(148,163,184,.18)",
      color: filterSeries ? "#e2e8f0" : "#64748b",
      borderRadius: 10,
      padding: "5px 10px",
      fontSize: 12
    }
  }, React.createElement("option", {
    value: ""
  }, "\u0412\u0441\u0435 \u0441\u0435\u0440\u0438\u0438"), seriesOptions.map(s => React.createElement("option", {
    key: s.id,
    value: s.name
  }, s.name))), React.createElement("select", {
    value: filterPerson,
    onChange: e => setFilterPerson(e.target.value),
    style: {
      background: "rgba(30,41,59,.72)",
      border: "1px solid rgba(148,163,184,.18)",
      color: filterPerson ? "#e2e8f0" : "#64748b",
      borderRadius: 10,
      padding: "5px 10px",
      fontSize: 12
    }
  }, React.createElement("option", {
    value: ""
  }, "\u0412\u0441\u0435 \u043B\u044E\u0434\u0438"), allPeople.map(p => React.createElement("option", {
    key: p,
    value: p
  }, p))), React.createElement("span", {
    style: {
      fontSize: 11,
      color: "#475569"
    }
  }, "\u0441"), React.createElement(InpDate, {
    value: dateFrom,
    onChange: setDateFrom
  }), React.createElement("span", {
    style: {
      fontSize: 11,
      color: "#475569"
    }
  }, "\u043F\u043E"), React.createElement(InpDate, {
    value: dateTo,
    onChange: setDateTo
  }), React.createElement(Btn, {
    small: true,
    variant: "success",
    onClick: () => {
      var _data$projects$find;
      return downloadAnalyticsXls(filteredTasks, data, stageMap, {
        from: dateFrom,
        to: dateTo,
        projectName: filterProject ? ((_data$projects$find = data.projects.find(p => p.id === filterProject)) === null || _data$projects$find === void 0 ? void 0 : _data$projects$find.name) || filterProject : "all_projects"
      });
    }
  }, "\u0412\u044B\u0433\u0440\u0443\u0437\u0438\u0442\u044C XLS"), (filterProject || filterSeries || filterPerson || dateFrom || dateTo) && React.createElement(Btn, {
    small: true,
    variant: "ghost",
    onClick: () => {
      setFilterProject("");
      setFilterSeries("");
      setFilterPerson("");
      setDateFrom("");
      setDateTo("");
    }
  }, "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C"))), React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginBottom: 20,
      flexWrap: "wrap"
    }
  }, React.createElement("div", {
    style: {
      background: "rgba(30,41,59,.72)",
      border: "1px solid rgba(148,163,184,.18)",
      borderRadius: 12,
      padding: "12px 20px",
      minWidth: 120
    }
  }, React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#64748b",
      marginBottom: 4
    }
  }, "\u0412\u0421\u0415\u0413\u041E \u0421\u041C\u0415\u041D"), React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 700,
      color: "#e2e8f0"
    }
  }, totalShifts % 1 === 0 ? totalShifts : totalShifts.toFixed(1))), React.createElement("div", {
    style: {
      background: "rgba(30,41,59,.72)",
      border: "1px solid rgba(148,163,184,.18)",
      borderRadius: 12,
      padding: "12px 20px",
      minWidth: 120
    }
  }, React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#64748b",
      marginBottom: 4
    }
  }, "\u0412\u042B\u0425\u041E\u0414\u041E\u0412"), React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 700,
      color: "#e2e8f0"
    }
  }, totalExits)), roleTotals.map(_ref71 => {
    let _ref72 = _slicedToArray(_ref71, 2),
      role = _ref72[0],
      v = _ref72[1];
    const ri = roleMap[role];
    return React.createElement("div", {
      key: role,
      style: {
        background: "#1e293b",
        border: `1px solid ${ri ? ri.color + "44" : "#334155"}`,
        borderRadius: 12,
        padding: "12px 20px",
        minWidth: 120
      }
    }, React.createElement("div", {
      style: {
        fontSize: 11,
        color: ri ? ri.color : "#64748b",
        marginBottom: 4,
        textTransform: "uppercase",
        letterSpacing: 1
      }
    }, ri ? ri.label : role || "—"), React.createElement("div", {
      style: {
        fontSize: 20,
        fontWeight: 700,
        color: "#e2e8f0"
      }
    }, v.shifts % 1 === 0 ? v.shifts : v.shifts.toFixed(1), React.createElement("span", {
      style: {
        fontSize: 12,
        color: "#475569",
        fontWeight: 400,
        marginLeft: 4
      }
    }, "\u0441\u043C\u0435\u043D")), React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#475569"
      }
    }, v.exits, " \u0432\u044B\u0445\u043E\u0434\u043E\u0432"));
  })), rows.length === 0 ? React.createElement("div", {
    style: {
      color: "#475569",
      fontSize: 14,
      textAlign: "center",
      padding: "40px 0"
    }
  }, "\u041D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445 \u043F\u043E \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u043C \u0444\u0438\u043B\u044C\u0442\u0440\u0430\u043C") : React.createElement("div", {
    style: {
      background: "rgba(30,41,59,.72)",
      border: "1px solid rgba(148,163,184,.18)",
      borderRadius: 12,
      overflow: "hidden"
    }
  }, React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse"
    }
  }, React.createElement("thead", null, React.createElement("tr", {
    style: {
      background: "#0f172a"
    }
  }, React.createElement("th", {
    style: TH
  }, "\u0421\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0441\u0442"), React.createElement("th", {
    style: TH
  }, "\u0420\u043E\u043B\u044C"), React.createElement("th", {
    style: {
      ...TH,
      textAlign: "right"
    }
  }, "\u0412\u044B\u0445\u043E\u0434\u043E\u0432"), React.createElement("th", {
    style: {
      ...TH,
      textAlign: "right"
    }
  }, "\u0421\u043C\u0435\u043D"))), React.createElement("tbody", null, rows.map((r, i) => {
    const ri = roleMap[r.role];
    return React.createElement("tr", {
      key: r.person,
      style: {
        background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)"
      }
    }, React.createElement("td", {
      style: TD
    }, r.person), React.createElement("td", {
      style: TD
    }, ri ? React.createElement("span", {
      style: {
        background: "transparent",
        color: ri.color,
        border: `1.5px solid ${ri.color}`,
        borderRadius: 4,
        padding: "1px 8px",
        fontSize: 12
      }
    }, ri.label) : React.createElement("span", {
      style: {
        color: "#475569"
      }
    }, r.role || "—")), React.createElement("td", {
      style: {
        ...TD,
        textAlign: "right",
        color: "#94a3b8"
      }
    }, r.exits), React.createElement("td", {
      style: {
        ...TD,
        textAlign: "right",
        fontWeight: 700,
        color: "#e2e8f0"
      }
    }, r.shifts % 1 === 0 ? r.shifts : r.shifts.toFixed(1)));
  })), React.createElement("tfoot", null, React.createElement("tr", {
    style: {
      background: "#0f172a"
    }
  }, React.createElement("td", {
    colSpan: 2,
    style: {
      ...TD,
      fontWeight: 700,
      color: "#94a3b8",
      fontSize: 12
    }
  }, "\u0418\u0422\u041E\u0413\u041E"), React.createElement("td", {
    style: {
      ...TD,
      textAlign: "right",
      fontWeight: 700,
      color: "#94a3b8"
    }
  }, totalExits), React.createElement("td", {
    style: {
      ...TD,
      textAlign: "right",
      fontWeight: 700,
      color: "#e2e8f0"
    }
  }, totalShifts % 1 === 0 ? totalShifts : totalShifts.toFixed(1)))))), stageTimings.length > 0 && React.createElement("div", {
    style: {
      marginTop: 28
    }
  }, React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      marginBottom: 4
    }
  }, "\u0421\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u044D\u0442\u0430\u043F\u043E\u0432"), React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#475569",
      marginBottom: 12
    }
  }, "\u043A\u0430\u043B\u0435\u043D\u0434\u0430\u0440\u043D\u044B\u0445 \u0434\u043D\u0435\u0439 \u043D\u0430 \u0441\u0435\u0440\u0438\u044E"), React.createElement("div", {
    style: {
      background: "rgba(30,41,59,.72)",
      border: "1px solid rgba(148,163,184,.18)",
      borderRadius: 12,
      overflow: "hidden"
    }
  }, React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse"
    }
  }, React.createElement("thead", null, React.createElement("tr", {
    style: {
      background: "#0f172a"
    }
  }, React.createElement("th", {
    style: TH
  }, "\u0413\u0440\u0443\u043F\u043F\u0430 \u044D\u0442\u0430\u043F\u043E\u0432"), React.createElement("th", {
    style: {
      ...TH,
      textAlign: "right"
    }
  }, "\u0421\u0440\u0435\u0434\u043D\u0435\u0435"), React.createElement("th", {
    style: {
      ...TH,
      textAlign: "right"
    }
  }, "\u03C3"), React.createElement("th", {
    style: {
      ...TH,
      textAlign: "right"
    }
  }, "\u041C\u0438\u043D"), React.createElement("th", {
    style: {
      ...TH,
      textAlign: "right"
    }
  }, "\u041C\u0430\u043A\u0441"), React.createElement("th", {
    style: TH
  }, "\u0421\u0430\u043C\u0430\u044F \u0434\u043E\u043B\u0433\u0430\u044F"), React.createElement("th", {
    style: {
      ...TH,
      textAlign: "right"
    }
  }, "\u0421\u0435\u0440\u0438\u0439"))), React.createElement("tbody", null, stageTimings.map((row, i) => {
    const longestProj = row.longest ? data.projects.find(p => p.id === row.longest.projectId) : null;
    const longestSer = row.longest ? (data.series || []).find(s => s.id === row.longest.seriesId) : null;
    const repStage = stages.find(s => s.groupId === row.group.id);
    const gc = (repStage === null || repStage === void 0 ? void 0 : repStage.color) || "#475569";
    return React.createElement("tr", {
      key: row.group.id,
      style: {
        background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)"
      }
    }, React.createElement("td", {
      style: TD
    }, React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6
      }
    }, React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: 2,
        background: gc,
        flexShrink: 0,
        display: "inline-block"
      }
    }), row.group.label)), React.createElement("td", {
      style: {
        ...TD,
        textAlign: "right",
        fontWeight: 700,
        color: "#e2e8f0"
      }
    }, row.avg.toFixed(1)), React.createElement("td", {
      style: {
        ...TD,
        textAlign: "right",
        color: row.sigma > row.avg * 0.5 ? "#f97316" : "#94a3b8"
      }
    }, row.sigma.toFixed(1)), React.createElement("td", {
      style: {
        ...TD,
        textAlign: "right",
        color: "#94a3b8"
      }
    }, row.min), React.createElement("td", {
      style: {
        ...TD,
        textAlign: "right",
        color: "#94a3b8"
      }
    }, row.max), React.createElement("td", {
      style: TD
    }, longestProj && longestSer ? React.createElement("span", {
      style: {
        fontSize: 12,
        color: "#64748b"
      }
    }, React.createElement("span", {
      style: {
        color: longestProj.color || "#94a3b8"
      }
    }, longestProj.abbr || longestProj.name), " · ", longestSer.name) : "—"), React.createElement("td", {
      style: {
        ...TD,
        textAlign: "right",
        color: "#475569"
      }
    }, row.count));
  })))), React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#475569",
      marginTop: 8
    }
  }, "\u0411\u043E\u043B\u044C\u0448\u043E\u0435 \u03C3 \u2014 \u043D\u0435\u0441\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u043E\u0435 \u043F\u0440\u043E\u0445\u043E\u0436\u0434\u0435\u043D\u0438\u0435 \u044D\u0442\u0430\u043F\u0430. \u0421\u0442\u043E\u0438\u0442 \u043F\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C, \u043A\u0430\u043A\u0438\u0435 \u0441\u0435\u0440\u0438\u0438 \u0442\u044F\u043D\u0443\u0442 \u0432\u0432\u0435\u0440\u0445."))));
}
const AUDIT_ACTION_LABELS = {
  create: "Создано",
  update: "Изменено",
  assign: "Изменён исполнитель",
  move: "Перемещено",
  reschedule: "Перенесено",
  complete: "Выполнено",
  cancel: "Отменено",
  restore: "Восстановлено",
  delete: "Удалено",
  approve: "Согласовано",
  reject: "Отклонено",
  save: "Сохранено"
};
const AUDIT_ENTITY_LABELS = {
  project: "Проект",
  series: "Серия",
  task: "Смена",
  productionBlock: "Блок продюсерской",
  productionGroup: "Группа задач",
  productionTask: "Задача продюсерской",
  productionApproval: "Согласование",
  person: "Сотрудник",
  role: "Роль",
  stage: "Этап",
  stageGroup: "Группа этапов",
  holiday: "Выходной",
  achievement: "Достижение",
  absence: "Отсутствие",
  settings: "Настройка",
  user: "Пользователь",
  userProject: "Доступ к проекту",
  bulk: "Массовое изменение"
};
const AUDIT_FIELD_LABELS = {
  name: "Название",
  label: "Название",
  title: "Название",
  internal_comment: "Внутренний комментарий",
  description: "Описание",
  person: "Исполнитель",
  assignee_name: "Исполнитель",
  responsible_name: "Ответственный",
  owner_name: "Ответственный за блок",
  group_id: "Группа",
  task_id: "Связанная задача",
  required: "Обязательное",
  due_date: "Срок решения",
  decision: "Решение",
  decision_comment: "Комментарий",
  decided_by_name: "Решение принял",
  decided_at: "Решение принято",
  start_date: "Начало",
  deadline: "Срок",
  completed_at: "Выполнено в",
  status: "Этап",
  day: "Дата",
  from: "Начало",
  to: "Окончание",
  project_id: "Проект",
  series_id: "Серия",
  cancelled: "Отмена",
  deleted: "Удаление",
  role: "Роль",
  can_view: "Просмотр",
  can_edit: "Редактирование",
  date: "Дата",
  edit_start: "Начало монтажа",
  pre_otk_date: "ПредОТК",
  otk_date: "ОТК",
  send_date: "Отправка",
  air_date: "Эфир",
  manual_status: "Статус серии",
  managers: "Ответственные",
  note: "Заметка",
  notes: "Заметки"
};
function auditActionLabel(event) {
  if (event.entity === "productionApproval" && event.action === "restore") return "Возвращено на согласование";
  return AUDIT_ACTION_LABELS[event.action] || event.action;
}
function auditValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (value === true) return "да";
  if (value === false) return "нет";
  if (Array.isArray(value)) return value.length ? value.map(v => typeof v === "object" ? v.name || v.label || v.uid || JSON.stringify(v) : String(v)).join(", ") : "—";
  if (typeof value === "object") {
    const text = JSON.stringify(value);
    return text.length > 140 ? text.slice(0, 140) + "…" : text;
  }
  return String(value);
}
function auditTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value || "") : date.toLocaleString("ru-RU", {
    dateStyle: "short",
    timeStyle: "medium"
  });
}
function HistoryView(_ref73) {
  let data = _ref73.data;
  const _useState145 = useState({
      projectId: "",
      actorUserId: "",
      action: "",
      from: "",
      to: ""
    }),
    _useState146 = _slicedToArray(_useState145, 2),
    filters = _useState146[0],
    setFilters = _useState146[1];
  const _useState147 = useState(1),
    _useState148 = _slicedToArray(_useState147, 2),
    page = _useState148[0],
    setPage = _useState148[1];
  const _useState149 = useState({
      events: [],
      actors: [],
      page: 1,
      total: 0,
      totalPages: 1
    }),
    _useState150 = _slicedToArray(_useState149, 2),
    result = _useState150[0],
    setResult = _useState150[1];
  const _useState151 = useState(true),
    _useState152 = _slicedToArray(_useState151, 2),
    loading = _useState152[0],
    setLoading = _useState152[1];
  const _useState153 = useState(""),
    _useState154 = _slicedToArray(_useState153, 2),
    error = _useState154[0],
    setError = _useState154[1];
  const _useState155 = useState(0),
    _useState156 = _slicedToArray(_useState155, 2),
    refreshKey = _useState156[0],
    setRefreshKey = _useState156[1];
  useEffect(() => {
    let active = true;
    const query = new URLSearchParams({
      page: String(page),
      pageSize: "50"
    });
    Object.entries(filters).forEach(_ref74 => {
      let _ref75 = _slicedToArray(_ref74, 2),
        key = _ref75[0],
        value = _ref75[1];
      if (value) query.set(key, value);
    });
    setLoading(true);
    setError("");
    fetch("/api/audit/events?" + query.toString(), {
      credentials: "include",
      cache: "no-store"
    }).then(async response => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Не удалось загрузить историю");
      return body;
    }).then(body => {
      if (active) setResult(body);
    }).catch(err => {
      if (active) setError(err.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [page, filters.projectId, filters.actorUserId, filters.action, filters.from, filters.to, refreshKey]);
  function change(key, value) {
    setFilters(current => ({
      ...current,
      [key]: value
    }));
    setPage(1);
  }
  const selectStyle = {
    background: "rgba(8,13,26,.74)",
    border: "1px solid rgba(148,163,184,.24)",
    color: "#eef4ff",
    borderRadius: 11,
    padding: "8px 10px",
    fontSize: 12,
    minWidth: 150
  };
  const dateStyle = {
    ...selectStyle,
    minWidth: 138,
    colorScheme: "dark"
  };
  return React.createElement("div", {
    style: {
      maxWidth: 1240,
      margin: "0 auto"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: 12,
      marginBottom: 16,
      flexWrap: "wrap"
    }
  }, React.createElement("div", null, React.createElement("h2", {
    style: {
      margin: "0 0 5px",
      fontSize: 24
    }
  }, "\u0418\u0441\u0442\u043E\u0440\u0438\u044F"), React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#8ea2bb"
    }
  }, "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D\u043D\u044B\u0435 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F, \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D\u043D\u044B\u0435 \u0441\u0435\u0440\u0432\u0435\u0440\u043E\u043C \xB7 \u0432\u0441\u0435\u0433\u043E ", result.total)), React.createElement(Btn, {
    variant: "ghost",
    small: true,
    onClick: () => setRefreshKey(value => value + 1)
  }, "\u21BB \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C")), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      padding: 12,
      marginBottom: 14,
      background: "rgba(15,23,42,.58)",
      border: "1px solid rgba(148,163,184,.18)",
      borderRadius: 16
    }
  }, React.createElement("select", {
    "aria-label": "\u041F\u0440\u043E\u0435\u043A\u0442",
    value: filters.projectId,
    onChange: e => change("projectId", e.target.value),
    style: selectStyle
  }, React.createElement("option", {
    value: ""
  }, "\u0412\u0441\u0435 \u043F\u0440\u043E\u0435\u043A\u0442\u044B"), (data.projects || []).map(project => React.createElement("option", {
    key: project.id,
    value: project.id
  }, project.name))), React.createElement("select", {
    "aria-label": "\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A",
    value: filters.actorUserId,
    onChange: e => change("actorUserId", e.target.value),
    style: selectStyle
  }, React.createElement("option", {
    value: ""
  }, "\u0412\u0441\u0435 \u0430\u0432\u0442\u043E\u0440\u044B"), (result.actors || []).map(actor => React.createElement("option", {
    key: String(actor.id) + actor.name,
    value: actor.id
  }, actor.name))), React.createElement("select", {
    "aria-label": "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435",
    value: filters.action,
    onChange: e => change("action", e.target.value),
    style: selectStyle
  }, React.createElement("option", {
    value: ""
  }, "\u0412\u0441\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F"), Object.entries(AUDIT_ACTION_LABELS).map(_ref76 => {
    let _ref77 = _slicedToArray(_ref76, 2),
      id = _ref77[0],
      label = _ref77[1];
    return React.createElement("option", {
      key: id,
      value: id
    }, label);
  })), React.createElement("input", {
    "aria-label": "\u041F\u0435\u0440\u0438\u043E\u0434 \u0441",
    title: "\u041F\u0435\u0440\u0438\u043E\u0434 \u0441",
    type: "date",
    value: filters.from,
    onChange: e => change("from", e.target.value),
    style: dateStyle
  }), React.createElement("input", {
    "aria-label": "\u041F\u0435\u0440\u0438\u043E\u0434 \u043F\u043E",
    title: "\u041F\u0435\u0440\u0438\u043E\u0434 \u043F\u043E",
    type: "date",
    value: filters.to,
    onChange: e => change("to", e.target.value),
    style: dateStyle
  }), Object.values(filters).some(Boolean) && React.createElement(Btn, {
    variant: "ghost",
    small: true,
    onClick: () => {
      setFilters({
        projectId: "",
        actorUserId: "",
        action: "",
        from: "",
        to: ""
      });
      setPage(1);
    }
  }, "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C")), error && React.createElement("div", {
    role: "alert",
    style: {
      padding: 14,
      border: "1px solid #b45309",
      borderRadius: 12,
      color: "#fde68a",
      background: "#422006"
    }
  }, error), loading ? React.createElement("div", {
    style: {
      padding: 30,
      textAlign: "center",
      color: "#8ea2bb"
    }
  }, "\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u044E \u0438\u0441\u0442\u043E\u0440\u0438\u044E\u2026") : !result.events.length ? React.createElement("div", {
    style: {
      padding: 36,
      textAlign: "center",
      color: "#64748b",
      border: "1px dashed #334155",
      borderRadius: 14
    }
  }, "\u041F\u043E \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u043C \u0444\u0438\u043B\u044C\u0442\u0440\u0430\u043C \u0437\u0430\u043F\u0438\u0441\u0435\u0439 \u043D\u0435\u0442") : React.createElement("div", {
    style: {
      display: "grid",
      gap: 5
    }
  }, result.events.map(event => {
    var _event$details;
    return React.createElement("details", {
      key: event.id,
      style: {
        background: "rgba(15,23,42,.58)",
        border: "1px solid rgba(148,163,184,.16)",
        borderRadius: 11,
        overflow: "hidden"
      }
    }, React.createElement("summary", {
      style: {
        display: "grid",
        gridTemplateColumns: "130px minmax(130px,180px) minmax(260px,1fr) auto",
        gap: 10,
        alignItems: "center",
        padding: "8px 12px",
        cursor: "pointer",
        listStyle: "none"
      }
    }, React.createElement("span", {
      style: {
        fontSize: 10,
        color: "#8ea2bb",
        whiteSpace: "nowrap"
      }
    }, auditTime(event.occurredAt)), React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: "#dbeafe",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, event.userName || "Система"), React.createElement("span", {
      style: {
        minWidth: 0
      }
    }, React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 800,
        color: event.action === "delete" ? "#fca5a5" : event.action === "create" ? "#86efac" : "#93c5fd"
      }
    }, auditActionLabel(event)), React.createElement("span", {
      style: {
        fontSize: 11,
        color: "#cbd5e1",
        marginLeft: 7
      }
    }, AUDIT_ENTITY_LABELS[event.entity] || event.entity, (_event$details = event.details) !== null && _event$details !== void 0 && _event$details.label ? ": " + event.details.label : ""), (event.projectName || event.seriesName) && React.createElement("span", {
      style: {
        fontSize: 10,
        color: "#64748b",
        marginLeft: 7
      }
    }, [event.projectName, event.seriesName].filter(Boolean).join(" · "))), React.createElement("span", {
      style: {
        fontSize: 10,
        color: "#7dd3fc",
        whiteSpace: "nowrap"
      }
    }, "\u041F\u043E\u0434\u0440\u043E\u0431\u043D\u0435\u0435 \xB7 ", (event.changes || []).length, " \u25BE")), React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "minmax(260px,1fr) minmax(160px,280px)",
        gap: 16,
        padding: "9px 12px 11px",
        borderTop: "1px solid rgba(148,163,184,.12)",
        fontSize: 11,
        lineHeight: 1.55,
        color: "#94a3b8"
      }
    }, React.createElement("div", null, (event.changes || []).map((change, index) => React.createElement("div", {
      key: change.field + index,
      style: {
        marginBottom: 2
      }
    }, React.createElement("span", {
      style: {
        color: "#cbd5e1",
        fontWeight: 700
      }
    }, AUDIT_FIELD_LABELS[change.field] || change.field, ": "), React.createElement("span", null, auditValue(change.before)), React.createElement("span", {
      style: {
        color: "#60a5fa",
        padding: "0 5px"
      }
    }, "\u2192"), React.createElement("span", {
      style: {
        color: "#e2e8f0"
      }
    }, auditValue(change.after)))), !(event.changes || []).length && React.createElement("span", null, "\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0445 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0439 \u043D\u0435\u0442"), event.reason && React.createElement("div", {
      style: {
        marginTop: 5,
        color: "#fcd34d"
      }
    }, "\u041F\u0440\u0438\u0447\u0438\u043D\u0430: ", event.reason)), React.createElement("div", {
      style: {
        color: "#64748b"
      }
    }, "\u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A: ", event.source === "user" ? "пользователь" : event.source, React.createElement("br", null), "\u041E\u0431\u044A\u0435\u043A\u0442: ", event.entityId || "—")));
  })), React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 14
    }
  }, React.createElement(Btn, {
    variant: "ghost",
    small: true,
    disabled: page <= 1 || loading,
    onClick: () => setPage(value => Math.max(1, value - 1))
  }, "\u2190 \u041D\u043E\u0432\u0435\u0435"), React.createElement("span", {
    style: {
      fontSize: 11,
      color: "#64748b"
    }
  }, "\u0421\u0442\u0440\u0430\u043D\u0438\u0446\u0430 ", result.page || page, " \u0438\u0437 ", result.totalPages || 1), React.createElement(Btn, {
    variant: "ghost",
    small: true,
    disabled: page >= (result.totalPages || 1) || loading,
    onClick: () => setPage(value => value + 1)
  }, "\u0421\u0442\u0430\u0440\u0435\u0435 \u2192")));
}
function ChangelogModal(_ref78) {
  let entries = _ref78.entries,
    onClose = _ref78.onClose;
  function fmtTs(ts) {
    const d = new Date(ts);
    const pad = n => String(n).padStart(2, "0");
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  return React.createElement(Modal, {
    title: "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0439",
    onClose: onClose
  }, !entries.length ? React.createElement("div", {
    style: {
      padding: "24px 0",
      textAlign: "center",
      color: "#475569",
      fontSize: 13
    }
  }, "\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0439 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442") : React.createElement("div", {
    style: {
      maxHeight: 480,
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: 1
    }
  }, entries.map((e, i) => React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      gap: 12,
      padding: "7px 4px",
      borderBottom: "1px solid #1e293b",
      alignItems: "flex-start"
    }
  }, React.createElement("span", {
    style: {
      fontSize: 11,
      color: "#475569",
      whiteSpace: "nowrap",
      flexShrink: 0,
      marginTop: 1
    }
  }, fmtTs(e.ts)), React.createElement("span", {
    style: {
      fontSize: 13,
      color: "#cbd5e1"
    }
  }, e.text)))), React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      marginTop: 16
    }
  }, React.createElement(Btn, {
    variant: "ghost",
    onClick: onClose
  }, "\u0417\u0430\u043A\u0440\u044B\u0442\u044C")));
}
function DayShiftsModal(_ref79) {
  let data = _ref79.data,
    onClose = _ref79.onClose;
  const _useContext1 = useContext(StagesCtx),
    stageMap = _useContext1.stageMap;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const _useState157 = useState(formatDate(tomorrow)),
    _useState158 = _slicedToArray(_useState157, 2),
    targetDay = _useState158[0],
    setTargetDay = _useState158[1];
  const _useState159 = useState(false),
    _useState160 = _slicedToArray(_useState159, 2),
    copied = _useState160[0],
    setCopied = _useState160[1];
  const shifts = useMemo(() => {
    const tasks = data.tasks.filter(t => t.day === targetDay && t.person).sort((a, b) => a.from - b.from);
    const byPerson = {};
    tasks.forEach(t => {
      if (!byPerson[t.person]) byPerson[t.person] = [];
      byPerson[t.person].push(t);
    });
    return Object.entries(byPerson).sort((_ref80, _ref81) => {
      let _ref82 = _slicedToArray(_ref80, 1),
        a = _ref82[0];
      let _ref83 = _slicedToArray(_ref81, 1),
        b = _ref83[0];
      return a.localeCompare(b);
    }).map(_ref84 => {
      let _ref85 = _slicedToArray(_ref84, 2),
        person = _ref85[0],
        tasks = _ref85[1];
      return {
        person,
        tasks
      };
    });
  }, [data.tasks, targetDay]);
  const pd = parseDate(targetDay);
  const dateLabel = pd ? `${WDAYS_LONG[pd.getDay()]}, ${targetDay}` : "—";
  function buildText() {
    let s = ` Смены — ${dateLabel}\n${"─".repeat(32)}\n\n`;
    if (!shifts.length) {
      s += "Смен нет\n";
      return s;
    }
    shifts.forEach(_ref86 => {
      let person = _ref86.person,
        tasks = _ref86.tasks;
      const totalH = tasks.reduce((acc, t) => (Number(t.to) || 0) - (Number(t.from) || 0) + acc, 0);
      s += `👤 ${person}  (${totalH}ч)\n`;
      tasks.forEach(t => {
        const proj = data.projects.find(p => p.id === t.project);
        const st = stageMap[t.status];
        s += `   • ${(proj === null || proj === void 0 ? void 0 : proj.name) || t.project}  ${t.series}  ·  ${(st === null || st === void 0 ? void 0 : st.label) || t.status}  ·  ${fmtHour(t.from)}–${fmtHour(t.to)}`;
        if (canSeeTaskNotes() && t.note) s += `  — ${t.note}`;
        s += "\n";
      });
      s += "\n";
    });
    return s;
  }
  function copyText() {
    navigator.clipboard.writeText(buildText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return React.createElement(Modal, {
    title: "\u0421\u043C\u0435\u043D\u044B \u043D\u0430 \u0434\u0435\u043D\u044C",
    onClose: onClose,
    wide: true
  }, React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      alignItems: "center",
      marginBottom: 20
    }
  }, React.createElement(InpDate, {
    value: targetDay,
    onChange: setTargetDay
  }), React.createElement("span", {
    style: {
      fontSize: 13,
      color: "#64748b"
    }
  }, pd ? WDAYS_LONG[pd.getDay()] : ""), React.createElement("div", {
    style: {
      flex: 1
    }
  }), React.createElement(Btn, {
    variant: "ghost",
    small: true,
    onClick: copyText
  }, copied ? "OK Скопировано" : " Копировать текст"), React.createElement(Btn, {
    variant: "ghost",
    small: true,
    onClick: () => window.print()
  }, "\uD83D\uDDA8 \u041F\u0435\u0447\u0430\u0442\u044C")), shifts.length === 0 ? React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "40px 0",
      color: "#475569",
      fontSize: 14
    }
  }, "\u041D\u0430 \u044D\u0442\u043E\u0442 \u0434\u0435\u043D\u044C \u0441\u043C\u0435\u043D \u043D\u0435\u0442") : React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, shifts.map(_ref87 => {
    var _pInfo$roles;
    let person = _ref87.person,
      tasks = _ref87.tasks;
    const totalH = tasks.reduce((acc, t) => (Number(t.to) || 0) - (Number(t.from) || 0) + acc, 0);
    const pInfo = data.people.find(p => p.name === person);
    const roleId = pInfo === null || pInfo === void 0 || (_pInfo$roles = pInfo.roles) === null || _pInfo$roles === void 0 ? void 0 : _pInfo$roles[0];
    const role = roleId ? data.roles.find(r => r.id === roleId) : null;
    return React.createElement("div", {
      key: person,
      style: {
        background: "#0f172a",
        border: "1px solid #334155",
        borderRadius: 12,
        overflow: "hidden"
      }
    }, React.createElement("div", {
      style: {
        padding: "10px 16px",
        background: "#1e293b",
        display: "flex",
        alignItems: "center",
        gap: 10,
        borderBottom: "1px solid #334155"
      }
    }, React.createElement("div", {
      style: {
        width: 34,
        height: 34,
        borderRadius: "50%",
        background: `${(role === null || role === void 0 ? void 0 : role.color) || "#3b82f6"}22`,
        border: `2px solid ${(role === null || role === void 0 ? void 0 : role.color) || "#3b82f6"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        fontWeight: 800,
        color: (role === null || role === void 0 ? void 0 : role.color) || "#3b82f6"
      }
    }, person[0]), React.createElement("div", null, React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 14
      }
    }, person), role && React.createElement("div", {
      style: {
        fontSize: 11,
        color: role.color
      }
    }, role.label)), React.createElement("div", {
      style: {
        marginLeft: "auto",
        fontSize: 12,
        color: "#64748b"
      }
    }, totalH, " \u0447 \xB7 ", tasks.length, " ", tasks.length === 1 ? "задача" : tasks.length <= 4 ? "задачи" : "задач")), tasks.map((t, ti) => {
      const proj = data.projects.find(p => p.id === t.project);
      const st = stageMap[t.status];
      return React.createElement("div", {
        key: t.id,
        style: {
          padding: "10px 16px",
          borderBottom: ti < tasks.length - 1 ? "1px solid #1e293b" : "none",
          display: "flex",
          gap: 12,
          alignItems: "center"
        }
      }, React.createElement("div", {
        style: {
          width: 3,
          alignSelf: "stretch",
          borderRadius: 2,
          background: (proj === null || proj === void 0 ? void 0 : proj.color) || "#334155",
          flexShrink: 0
        }
      }), React.createElement("div", {
        style: {
          flex: 1
        }
      }, React.createElement("div", {
        style: {
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 3
        }
      }, React.createElement("span", {
        style: {
          fontWeight: 600,
          fontSize: 13
        }
      }, (proj === null || proj === void 0 ? void 0 : proj.name) || t.project), React.createElement("span", {
        style: {
          fontSize: 11,
          color: "#475569"
        }
      }, "\xB7 ", t.series), st && React.createElement("span", {
        style: {
          fontSize: 10,
          background: `${st.color}22`,
          color: st.color,
          border: `1px solid ${st.color}44`,
          borderRadius: 4,
          padding: "1px 7px",
          fontWeight: 600
        }
      }, st.abbr || st.label)), canSeeTaskNotes() && t.note && React.createElement("div", {
        style: {
          fontSize: 11,
          color: "#64748b",
          marginTop: 2
        }
      }, t.note)), React.createElement("div", {
        style: {
          fontSize: 13,
          fontWeight: 700,
          color: "#94a3b8",
          flexShrink: 0
        }
      }, fmtHour(t.from), "\u2013", fmtHour(t.to), React.createElement("span", {
        style: {
          fontSize: 10,
          color: "#475569",
          marginLeft: 4
        }
      }, "(", fmtDur(t.from, t.to), ")")));
    }));
  })));
}
function PersonCard(_ref88) {
  var _person$roles, _roleMap$person$roles, _Object$entries$sort$;
  let personId = _ref88.personId,
    data = _ref88.data,
    onBack = _ref88.onBack,
    onUpdatePeople = _ref88.onUpdatePeople,
    canEditBirthday = _ref88.canEditBirthday,
    canEditAbsences = _ref88.canEditAbsences;
  const _useContext10 = useContext(StagesCtx),
    stageMap = _useContext10.stageMap;
  const _useState161 = useState("load"),
    _useState162 = _slicedToArray(_useState161, 2),
    tab = _useState162[0],
    setTab = _useState162[1];
  const person = useMemo(() => data.people.find(p => p.id === personId) || data.people.find(p => p.name === personId), [data.people, personId]);
  const personName = (person === null || person === void 0 ? void 0 : person.name) || personId;
  const _useState163 = useState(false),
    _useState164 = _slicedToArray(_useState163, 2),
    birthdayEdit = _useState164[0],
    setBirthdayEdit = _useState164[1];
  const _useState165 = useState((person === null || person === void 0 ? void 0 : person.birthday) || ""),
    _useState166 = _slicedToArray(_useState165, 2),
    birthdayDraft = _useState166[0],
    setBirthdayDraft = _useState166[1];
  const _useState167 = useState({
      type: "dayoff",
      startDay: formatDate(new Date()),
      endDay: formatDate(new Date()),
      note: ""
    }),
    _useState168 = _slicedToArray(_useState167, 2),
    absenceDraft = _useState168[0],
    setAbsenceDraft = _useState168[1];
  const _useState169 = useState(0),
    _useState170 = _slicedToArray(_useState169, 2),
    loadMonthOffset = _useState170[0],
    setLoadMonthOffset = _useState170[1];
  useEffect(() => setBirthdayDraft((person === null || person === void 0 ? void 0 : person.birthday) || ""), [person === null || person === void 0 ? void 0 : person.birthday]);
  const roleMap = useMemo(() => Object.fromEntries(data.roles.map(r => [r.id, r])), [data.roles]);
  const todayStr = formatDate(new Date());
  const tasks = useMemo(() => data.tasks.filter(t => t.person === personName && !t.deleted && !t.cancelled).sort((a, b) => daySort(a.day).localeCompare(daySort(b.day))), [data.tasks, personName]);
  const futureTasks = useMemo(() => tasks.filter(t => daySort(t.day) >= daySort(todayStr)), [tasks, todayStr]);
  const pastTasks = useMemo(() => [...tasks.filter(t => daySort(t.day) < daySort(todayStr))].reverse().slice(0, 50), [tasks, todayStr]);
  const doneAndTodayTasks = useMemo(() => tasks.filter(t => daySort(t.day) <= daySort(todayStr)), [tasks, todayStr]);
  const roleColor = person !== null && person !== void 0 && (_person$roles = person.roles) !== null && _person$roles !== void 0 && _person$roles[0] ? ((_roleMap$person$roles = roleMap[person.roles[0]]) === null || _roleMap$person$roles === void 0 ? void 0 : _roleMap$person$roles.color) || "#3b82f6" : "#3b82f6";
  const totalHrs = doneAndTodayTasks.reduce((s, t) => s + (Number(t.to) - Number(t.from)), 0);
  const avgHrsW = personWeeklyHours(tasks, todayStr, 12);
  const activeProjs = new Set(futureTasks.map(t => t.project)).size;
  const stageCounts = {};
  doneAndTodayTasks.forEach(t => {
    stageCounts[t.status] = (stageCounts[t.status] || 0) + 1;
  });
  const topSt = (_Object$entries$sort$ = Object.entries(stageCounts).sort((a, b) => b[1] - a[1])[0]) === null || _Object$entries$sort$ === void 0 ? void 0 : _Object$entries$sort$[0];
  const todayPersonTasks = useMemo(() => tasks.filter(t => t.day === todayStr).sort((a, b) => Number(a.from) - Number(b.from)), [tasks, todayStr]);
  const projectStats = useMemo(() => {
    const m = {};
    doneAndTodayTasks.forEach(t => {
      if (!t.project) return;
      if (!m[t.project]) m[t.project] = {
        id: t.project,
        count: 0,
        hours: 0
      };
      m[t.project].count++;
      m[t.project].hours += Number(t.to) - Number(t.from);
    });
    return Object.values(m).sort((a, b) => b.count - a.count || b.hours - a.hours);
  }, [doneAndTodayTasks]);
  const topProjects = projectStats.slice(0, 5);
  const projectBadges = projectStats.map(ps => data.projects.find(p => p.id === ps.id)).filter(Boolean);
  const achievementMetrics = useMemo(() => buildAchievementMetrics(doneAndTodayTasks, projectStats, stageMap, data, person), [doneAndTodayTasks, projectStats, stageMap]);
  const achievements = useMemo(() => earnedAchievements(data, achievementMetrics), [data, achievementMetrics]);
  const personAbsences = useMemo(() => (data.personAbsences || []).filter(a => !a.deleted && absencePersonMatches(a, person || {
    id: personId,
    name: personName
  })).sort((a, b) => daySort(a.startDay).localeCompare(daySort(b.startDay))), [data.personAbsences, person, personId, personName]);
  const birthdayNorm = normalizeBirthday(person === null || person === void 0 ? void 0 : person.birthday);
  const birthdayDiff = birthdayDiffDays(birthdayNorm);
  function saveBirthdayFromCard() {
    if (!canEditBirthday || !onUpdatePeople || !person) return;
    const bd = normalizeBirthday(birthdayDraft);
    if (bd === null) {
      alert("День рождения укажите в формате ДД.ММ");
      return;
    }
    onUpdatePeople("people", (data.people || []).map(p => p.id === person.id ? {
      ...p,
      birthday: bd
    } : p));
    setBirthdayEdit(false);
  }
  function saveAbsenceFromCard() {
    if (!canEditAbsences || !onUpdatePeople || !person) return;
    if (!absenceDraft.startDay) {
      alert("Укажите дату начала");
      return;
    }
    const start = absenceDraft.startDay;
    const end = absenceDraft.endDay || start;
    if (daySort(end) < daySort(start)) {
      alert("Дата окончания раньше начала");
      return;
    }
    const ts = Date.now();
    const item = normalizeAbsence({
      id: "abs_" + ts + "_" + Math.random().toString(36).slice(2, 7),
      personId: person.id || "",
      personName: person.name || personName,
      type: absenceDraft.type,
      startDay: start,
      endDay: end,
      note: absenceDraft.note,
      updatedAt: new Date(ts).toISOString(),
      _updatedAt: ts
    });
    onUpdatePeople("personAbsences", [...(data.personAbsences || []), item]);
    setAbsenceDraft(f => ({
      ...f,
      note: ""
    }));
  }
  function removeAbsenceFromCard(id) {
    if (!canEditAbsences || !onUpdatePeople) return;
    const ts = Date.now();
    onUpdatePeople("personAbsences", (data.personAbsences || []).map(a => a.id === id ? {
      ...a,
      deleted: true,
      updatedAt: new Date(ts).toISOString(),
      _updatedAt: ts
    } : a));
  }
  const loadCalendar = useMemo(() => {
    const monthStart = d => new Date(d.getFullYear(), d.getMonth(), 1);
    const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cur = addMonths(monthStart(today), loadMonthOffset);
    const daysInMonth = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
    const offset = (cur.getDay() + 6) % 7;
    const days = [];
    for (let i = 0; i < offset; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const dt = new Date(cur.getFullYear(), cur.getMonth(), day);
      const ds = formatDate(dt);
      const dayTasks = tasks.filter(t => t.day === ds);
      const hrs = dayTasks.reduce((sum, t) => sum + (Number(t.to) - Number(t.from)), 0);
      const absences = personAbsences.filter(a => daySort(ds) >= daySort(a.startDay) && daySort(ds) <= daySort(a.endDay || a.startDay));
      days.push({
        ds,
        day,
        hrs,
        tasks: dayTasks,
        absences,
        isToday: ds === todayStr
      });
    }
    while (days.length % 7) days.push(null);
    return [{
      key: String(cur.getFullYear()) + "-" + String(cur.getMonth() + 1).padStart(2, "0"),
      label: (MONTHS[cur.getMonth()] || "") + " " + cur.getFullYear(),
      days
    }];
  }, [tasks, personAbsences, todayStr, loadMonthOffset]);
  const loadCalendarMaxHrs = Math.max(1, ...loadCalendar.flatMap(m => m.days.map(c => (c === null || c === void 0 ? void 0 : c.hrs) || 0)));
  const loadMonth = loadCalendar[0];
  const tabS = {
    display: "inline-flex",
    background: "#0f172a",
    borderRadius: 10,
    border: "1px solid #334155",
    overflow: "hidden",
    marginBottom: 20
  };
  const tabBtn = (id, lbl) => React.createElement("button", {
    key: id,
    onClick: () => setTab(id),
    style: {
      padding: "6px 16px",
      border: "none",
      cursor: "pointer",
      fontSize: 12,
      fontFamily: "inherit",
      background: tab === id ? "#3b82f6" : "transparent",
      color: tab === id ? "#fff" : "#64748b",
      fontWeight: tab === id ? 700 : 400
    }
  }, lbl);
  const TD = {
    padding: "8px 12px",
    fontSize: 13,
    borderBottom: "1px solid #1e293b"
  };
  return React.createElement("div", null, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 24
    }
  }, React.createElement(Btn, {
    variant: "ghost",
    small: true,
    onClick: onBack
  }, "\u2190 \u041D\u0430\u0437\u0430\u0434"), React.createElement("div", {
    style: {
      width: 44,
      height: 44,
      borderRadius: "50%",
      background: roleColor + "22",
      border: `2px solid ${roleColor}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 18,
      fontWeight: 800,
      color: roleColor
    }
  }, personName[0]), React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 700
    }
  }, personName), React.createElement("div", {
    style: {
      display: "flex",
      gap: 4,
      marginTop: 3,
      flexWrap: "wrap"
    }
  }, ((person === null || person === void 0 ? void 0 : person.roles) || []).map(r => {
    const rl = roleMap[r];
    const rk2 = typeof r === "string" ? r : r.id || JSON.stringify(r);
    return React.createElement("span", {
      key: rk2,
      style: {
        fontSize: 10,
        background: "transparent",
        color: (rl === null || rl === void 0 ? void 0 : rl.color) || "#64748b",
        border: `1.5px solid ${(rl === null || rl === void 0 ? void 0 : rl.color) || "#64748b"}`,
        borderRadius: 3,
        padding: "1px 6px"
      }
    }, (rl === null || rl === void 0 ? void 0 : rl.label) || r);
  }), (person === null || person === void 0 ? void 0 : person.active) === false && React.createElement("span", {
    style: {
      fontSize: 10,
      color: "#475569",
      marginLeft: 4
    }
  }, "\u043D\u0435\u0430\u043A\u0442\u0438\u0432\u0435\u043D")))), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
      gap: 10,
      marginBottom: 18
    }
  }, React.createElement("div", {
    className: `ppt-birthday-card ${birthdayDiff === 0 ? "ppt-birthday-today" : ""}`
  }, React.createElement("div", {
    className: "ppt-birthday-kicker"
  }, "\u0414\u0415\u041D\u042C \u0420\u041E\u0416\u0414\u0415\u041D\u0418\u042F"), birthdayEdit ? React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center"
    }
  }, React.createElement(Inp, {
    value: birthdayDraft,
    onChange: setBirthdayDraft,
    placeholder: "\u0414\u0414.\u041C\u041C",
    style: {
      maxWidth: 100
    }
  }), React.createElement(Btn, {
    small: true,
    variant: "primary",
    onClick: saveBirthdayFromCard
  }, "OK"), React.createElement(Btn, {
    small: true,
    variant: "ghost",
    onClick: () => {
      setBirthdayEdit(false);
      setBirthdayDraft((person === null || person === void 0 ? void 0 : person.birthday) || "");
    }
  }, "\xD7")) : React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap"
    }
  }, React.createElement("span", {
    className: birthdayNorm ? "ppt-birthday-profile-value" : "ppt-birthday-empty"
  }, birthdayNorm ? `ДР ${birthdayNorm}` : "не указан"), birthdayNorm && birthdayDiff != null && React.createElement("span", {
    className: birthdayDiff <= 7 ? "ppt-birthday-profile-when" : "ppt-birthday-profile-when ppt-birthday-muted"
  }, "\xB7 ", birthdayWhenText(birthdayDiff)), canEditBirthday && React.createElement(Btn, {
    small: true,
    variant: "ghost",
    onClick: () => setBirthdayEdit(true)
  }, "\u0418\u0437\u043C"))), React.createElement("div", {
    style: {
      background: "rgba(30,41,59,.72)",
      border: "1px solid rgba(148,163,184,.18)",
      borderRadius: 12,
      padding: "12px 14px"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#64748b",
      letterSpacing: 1,
      marginBottom: 6
    }
  }, "\u0421\u0415\u0413\u041E\u0414\u041D\u042F"), todayPersonTasks.length ? todayPersonTasks.map(t => {
    const proj = data.projects.find(p => p.id === t.project);
    return React.createElement("div", {
      key: t.id,
      style: {
        display: "flex",
        gap: 7,
        alignItems: "center",
        fontSize: 12,
        marginBottom: 4
      }
    }, React.createElement("span", {
      style: {
        width: 7,
        height: 7,
        borderRadius: 2,
        background: (proj === null || proj === void 0 ? void 0 : proj.color) || "#64748b",
        flexShrink: 0
      }
    }), React.createElement("span", {
      style: {
        color: "#e2e8f0",
        fontWeight: 700
      }
    }, (proj === null || proj === void 0 ? void 0 : proj.abbr) || (proj === null || proj === void 0 ? void 0 : proj.name) || t.project), React.createElement("span", {
      style: {
        color: "#64748b"
      }
    }, t.series), React.createElement(StatusBadge, {
      s: t.status,
      small: true
    }));
  }) : React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#475569"
    }
  }, "\u0421\u0435\u0433\u043E\u0434\u043D\u044F \u0437\u0430\u0434\u0430\u0447 \u043D\u0435\u0442")), React.createElement("div", {
    style: {
      background: "rgba(30,41,59,.72)",
      border: "1px solid rgba(148,163,184,.18)",
      borderRadius: 12,
      padding: "12px 14px"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#64748b",
      letterSpacing: 1,
      marginBottom: 6
    }
  }, "\u041F\u0420\u041E\u0415\u041A\u0422\u041D\u042B\u0415 \u041D\u0410\u0428\u0418\u0412\u041A\u0418"), React.createElement("div", {
    style: {
      display: "flex",
      gap: 5,
      flexWrap: "wrap"
    }
  }, projectBadges.length ? projectBadges.map(p => React.createElement("span", {
    key: p.id,
    title: p.name,
    style: {
      fontSize: 10,
      color: p.color,
      border: `1px solid ${p.color}66`,
      background: `${p.color}22`,
      borderRadius: 999,
      padding: "2px 7px",
      fontWeight: 700
    }
  }, p.abbr || p.name)) : React.createElement("span", {
    style: {
      fontSize: 13,
      color: "#475569"
    }
  }, "\u043F\u043E\u043A\u0430 \u043D\u0435\u0442")))), React.createElement("div", {
    style: tabS
  }, tabBtn("load", "Загрузка"), tabBtn("current", "Текущие задачи"), tabBtn("history", "История"), tabBtn("stats", "Статистика")), tab === "load" && React.createElement("div", null, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 12,
      flexWrap: "wrap"
    }
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#93c5fd",
      fontWeight: 900,
      letterSpacing: .4
    }
  }, "\u041A\u0410\u041B\u0415\u041D\u0414\u0410\u0420\u042C \u0417\u0410\u0413\u0420\u0423\u0417\u041A\u0418"), React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#64748b",
      marginTop: 3
    }
  }, (loadMonth === null || loadMonth === void 0 ? void 0 : loadMonth.label) || "", " \xB7 ", (loadMonth === null || loadMonth === void 0 ? void 0 : loadMonth.days.filter(c => c === null || c === void 0 ? void 0 : c.tasks.length).length) || 0, " \u0434\u043D. \xB7 ", (loadMonth === null || loadMonth === void 0 ? void 0 : loadMonth.days.reduce((sum, c) => sum + ((c === null || c === void 0 ? void 0 : c.hrs) || 0), 0)) || 0, " \u0447 \xB7 ", (loadMonth === null || loadMonth === void 0 ? void 0 : loadMonth.days.filter(c => c === null || c === void 0 ? void 0 : c.absences.length).length) || 0, " \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0439")), React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      alignItems: "center"
    }
  }, React.createElement(Btn, {
    variant: "ghost",
    small: true,
    onClick: () => setLoadMonthOffset(v => v - 1)
  }, "?"), React.createElement(Btn, {
    variant: "ghost",
    small: true,
    onClick: () => setLoadMonthOffset(0)
  }, "\u0421\u0435\u0433\u043E\u0434\u043D\u044F"), React.createElement(Btn, {
    variant: "ghost",
    small: true,
    onClick: () => setLoadMonthOffset(v => v + 1)
  }, "?"))), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "minmax(320px,520px)",
      gap: 12,
      alignItems: "start"
    }
  }, loadCalendar.map(month => React.createElement("div", {
    key: month.key,
    style: {
      background: "rgba(30,41,59,.72)",
      border: "1px solid rgba(148,163,184,.18)",
      borderRadius: 12,
      padding: 10,
      boxShadow: "0 12px 30px rgba(0,0,0,.12)"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8
    }
  }, React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#e2e8f0",
      fontWeight: 900
    }
  }, month.label), React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#64748b"
    }
  }, month.days.filter(c => c === null || c === void 0 ? void 0 : c.tasks.length).length, " \u0434\u043D.")), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(7,1fr)",
      gap: 3,
      marginBottom: 4
    }
  }, ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map(d => React.createElement("div", {
    key: d,
    style: {
      fontSize: 9,
      color: "#64748b",
      textAlign: "center",
      fontWeight: 800
    }
  }, d))), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(7,1fr)",
      gap: 3
    }
  }, month.days.map((cell, idx) => {
    if (!cell) return React.createElement("div", {
      key: idx,
      style: {
        minHeight: 52,
        borderRadius: 8,
        background: "rgba(15,23,42,.18)"
      }
    });
    const intensity = Math.min(1, cell.hrs / loadCalendarMaxHrs);
    const primaryAbs = cell.absences[0] ? absenceTypeInfo(cell.absences[0].type) : null;
    const hasAbs = Boolean(primaryAbs);
    const bg = hasAbs ? primaryAbs.color + "18" : cell.hrs ? "rgba(99,102,241," + (0.13 + intensity * .25) + ")" : "rgba(15,23,42,.58)";
    const border = cell.isToday ? "#38bdf8" : hasAbs ? primaryAbs.color + "88" : cell.hrs ? "rgba(129,140,248,.5)" : "rgba(148,163,184,.14)";
    const details = [...cell.tasks.map(t => {
      const p = data.projects.find(p => p.id === t.project);
      const st = stageMap[t.status] || {};
      return (((p === null || p === void 0 ? void 0 : p.name) || (p === null || p === void 0 ? void 0 : p.abbr) || t.project || "") + (t.series ? " / " + t.series : "") + (t.status ? " / " + (st.label || t.status) : "") + " " + (t.from || "") + "-" + (t.to || "")).trim();
    }), ...cell.absences.map(a => absenceTypeInfo(a.type).label + (a.note ? ": " + a.note : ""))].join("\n");
    return React.createElement("button", {
      key: cell.ds,
      type: "button",
      title: details || cell.ds,
      onClick: () => canEditAbsences && setAbsenceDraft(f => ({
        ...f,
        startDay: cell.ds,
        endDay: cell.ds
      })),
      style: {
        minHeight: 52,
        borderRadius: 8,
        border: "1px solid " + border,
        background: bg,
        color: "#e2e8f0",
        padding: "4px 4px",
        textAlign: "left",
        fontFamily: "inherit",
        cursor: canEditAbsences ? "pointer" : "default",
        boxShadow: cell.isToday ? "0 0 0 1px rgba(56,189,248,.35)" : "none",
        overflow: "hidden"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 3
      }
    }, React.createElement("span", {
      style: {
        fontSize: 12,
        color: cell.isToday ? "#7dd3fc" : "#94a3b8",
        fontWeight: 900
      }
    }, cell.day), cell.hrs > 0 && React.createElement("span", {
      style: {
        fontSize: 10,
        color: "#cbd5e1",
        fontWeight: 800
      }
    }, cell.hrs, "\u0447")), React.createElement("div", {
      style: {
        display: "flex",
        gap: 2,
        flexWrap: "wrap",
        marginTop: 4,
        minHeight: 8
      }
    }, cell.absences.slice(0, 2).map(a => {
      const ai = absenceTypeInfo(a.type);
      return React.createElement("span", {
        key: a.id,
        style: {
          fontSize: 8,
          lineHeight: "12px",
          height: 12,
          borderRadius: 4,
          padding: "0 3px",
          background: ai.color + "22",
          border: "1px solid " + ai.color + "77",
          color: ai.color,
          fontWeight: 900
        }
      }, ai.short);
    }), cell.tasks.slice(0, 3).map(t => {
      const st = stageMap[t.status] || {};
      return React.createElement("span", {
        key: t.id,
        style: {
          width: 9,
          height: 9,
          borderRadius: 3,
          background: st.color || roleColor,
          display: "inline-block",
          marginTop: 2
        }
      });
    })));
  }))))), React.createElement("div", {
    style: {
      marginTop: 18,
      background: "rgba(30,41,59,.72)",
      border: "1px solid rgba(148,163,184,.18)",
      borderRadius: 12,
      padding: 14
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 12
    }
  }, React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#93c5fd",
      fontWeight: 900,
      letterSpacing: .4
    }
  }, "\u041E\u0422\u0421\u0423\u0422\u0421\u0422\u0412\u0418\u042F"), React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#64748b",
      marginTop: 2
    }
  }, "\u0432\u044B\u0445\u043E\u0434\u043D\u043E\u0439, \u043E\u0442\u043F\u0443\u0441\u043A, \u0431\u043E\u043B\u0435\u0437\u043D\u044C"))), canEditAbsences && React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "160px 140px 140px 1fr auto",
      gap: 8,
      alignItems: "end",
      marginBottom: 14
    }
  }, React.createElement(Field, {
    label: "\u0422\u0438\u043F"
  }, React.createElement(Sel, {
    value: absenceDraft.type,
    onChange: v => setAbsenceDraft(f => ({
      ...f,
      type: v
    })),
    options: ABSENCE_TYPES.map(a => ({
      value: a.id,
      label: a.label
    }))
  })), React.createElement(Field, {
    label: "\u0421"
  }, React.createElement(InpDate, {
    value: absenceDraft.startDay,
    onChange: v => setAbsenceDraft(f => ({
      ...f,
      startDay: v,
      endDay: f.endDay || v
    }))
  })), React.createElement(Field, {
    label: "\u041F\u043E"
  }, React.createElement(InpDate, {
    value: absenceDraft.endDay,
    onChange: v => setAbsenceDraft(f => ({
      ...f,
      endDay: v
    }))
  })), React.createElement(Field, {
    label: "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439"
  }, React.createElement(Inp, {
    value: absenceDraft.note,
    onChange: v => setAbsenceDraft(f => ({
      ...f,
      note: v
    })),
    placeholder: "\u043D\u0435\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E"
  })), React.createElement(Btn, {
    variant: "primary",
    onClick: saveAbsenceFromCard
  }, "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C")), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, personAbsences.length ? personAbsences.map(a => {
    const ai = absenceTypeInfo(a.type);
    return React.createElement("div", {
      key: a.id,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "#0f172a",
        border: "1px solid " + ai.color + "44",
        borderLeft: "3px solid " + ai.color,
        borderRadius: 10,
        padding: "9px 12px"
      }
    }, React.createElement("span", {
      style: {
        fontSize: 11,
        color: ai.color,
        fontWeight: 900,
        minWidth: 70
      }
    }, ai.label), React.createElement("span", {
      style: {
        fontSize: 13,
        color: "#e2e8f0",
        fontWeight: 700
      }
    }, a.startDay, a.endDay && a.endDay !== a.startDay ? " - " + a.endDay : ""), a.note && React.createElement("span", {
      style: {
        fontSize: 12,
        color: "#64748b"
      }
    }, a.note), canEditAbsences && React.createElement("button", {
      onClick: () => removeAbsenceFromCard(a.id),
      style: {
        marginLeft: "auto",
        background: "transparent",
        border: "1px solid rgba(248,113,113,.35)",
        color: "#fca5a5",
        borderRadius: 8,
        padding: "3px 7px",
        cursor: "pointer"
      }
    }, "\u0423\u0434\u0430\u043B\u0438\u0442\u044C"));
  }) : React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#64748b"
    }
  }, "\u041E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0439 \u043D\u0435\u0442")))), tab === "current" && React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, futureTasks.length === 0 ? React.createElement("div", {
    style: {
      color: "#475569",
      padding: "40px 0",
      textAlign: "center",
      fontSize: 13
    }
  }, "\u041D\u0435\u0442 \u043F\u0440\u0435\u0434\u0441\u0442\u043E\u044F\u0449\u0438\u0445 \u0437\u0430\u0434\u0430\u0447") : (() => {
    const byDay = {};
    futureTasks.forEach(t => {
      if (!byDay[t.day]) byDay[t.day] = [];
      byDay[t.day].push(t);
    });
    return Object.entries(byDay).sort((_ref89, _ref90) => {
      let _ref91 = _slicedToArray(_ref89, 1),
        a = _ref91[0];
      let _ref92 = _slicedToArray(_ref90, 1),
        b = _ref92[0];
      return daySort(a).localeCompare(daySort(b));
    }).map(_ref93 => {
      let _ref94 = _slicedToArray(_ref93, 2),
        day = _ref94[0],
        dt = _ref94[1];
      return React.createElement("div", {
        key: day,
        style: {
          marginBottom: 10
        }
      }, React.createElement("div", {
        style: {
          fontSize: 12,
          fontWeight: 700,
          color: "#64748b",
          padding: "6px 0 4px",
          borderBottom: "1px solid #1e293b",
          marginBottom: 4,
          letterSpacing: 0.5
        }
      }, dayLabel(day)), dt.map(t => React.createElement(TaskCard, {
        key: t.id,
        task: t,
        projects: data.projects
      })));
    });
  })()), tab === "history" && React.createElement("div", {
    style: {
      background: "rgba(30,41,59,.72)",
      border: "1px solid rgba(148,163,184,.18)",
      borderRadius: 12,
      overflow: "hidden"
    }
  }, pastTasks.length === 0 ? React.createElement("div", {
    style: {
      color: "#475569",
      padding: "40px 0",
      textAlign: "center",
      fontSize: 13
    }
  }, "\u041D\u0435\u0442 \u0438\u0441\u0442\u043E\u0440\u0438\u0438") : React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse"
    }
  }, React.createElement("thead", null, React.createElement("tr", {
    style: {
      background: "#0f172a"
    }
  }, ["Дата", "Проект", "Серия", "Этап", "Часов", "Заметка"].map(h => React.createElement("th", {
    key: h,
    style: {
      padding: "8px 12px",
      textAlign: "left",
      fontSize: 11,
      color: "#64748b",
      letterSpacing: 1,
      borderBottom: "1px solid #334155",
      fontWeight: 600,
      textTransform: "uppercase"
    }
  }, h)))), React.createElement("tbody", null, pastTasks.map((t, i) => {
    const proj = data.projects.find(p => p.id === t.project);
    return React.createElement("tr", {
      key: t.id,
      style: {
        background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)"
      }
    }, React.createElement("td", {
      style: {
        ...TD,
        color: "#94a3b8"
      }
    }, dayLabel(t.day)), React.createElement("td", {
      style: TD
    }, React.createElement("span", {
      style: {
        color: (proj === null || proj === void 0 ? void 0 : proj.color) || "#94a3b8"
      }
    }, (proj === null || proj === void 0 ? void 0 : proj.abbr) || (proj === null || proj === void 0 ? void 0 : proj.name) || t.project)), React.createElement("td", {
      style: {
        ...TD,
        color: "#64748b"
      }
    }, t.series), React.createElement("td", {
      style: TD
    }, React.createElement(StatusBadge, {
      s: t.status,
      small: true
    })), React.createElement("td", {
      style: {
        ...TD,
        color: "#94a3b8"
      }
    }, Number(t.to) - Number(t.from), "\u0447"), React.createElement("td", {
      style: {
        ...TD,
        color: "#475569",
        fontSize: 12
      }
    }, canSeeTaskNotes() ? t.note || "—" : "—"));
  })))), tab === "stats" && React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap"
    }
  }, [{
    l: "ЗАПИСЕЙ",
    v: doneAndTodayTasks.length
  }, {
    l: "ПЛАН, Ч",
    v: totalHrs
  }, {
    l: "СЕЙЧАС В ПРОЕКТАХ",
    v: activeProjs || "—"
  }, {
    l: "ПЛАН Ч/НЕД · 12 НЕД",
    v: avgHrsW.toFixed(1)
  }].map(_ref95 => {
    let l = _ref95.l,
      v = _ref95.v;
    return React.createElement("div", {
      key: l,
      style: {
        background: "rgba(30,41,59,.72)",
        border: "1px solid rgba(148,163,184,.18)",
        borderRadius: 12,
        padding: "12px 20px",
        minWidth: 120
      }
    }, React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#64748b",
        marginBottom: 4
      }
    }, l), React.createElement("div", {
      style: {
        fontSize: 24,
        fontWeight: 700,
        color: "#e2e8f0"
      }
    }, v));
  }), topSt && stageMap[topSt] && React.createElement("div", {
    style: {
      background: "rgba(30,41,59,.72)",
      border: "1px solid rgba(148,163,184,.18)",
      borderRadius: 12,
      padding: "12px 20px",
      minWidth: 120
    }
  }, React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#64748b",
      marginBottom: 6
    }
  }, "\u0427\u0410\u0429\u0415 \u0412\u0421\u0415\u0413\u041E"), React.createElement(StatusBadge, {
    s: topSt
  }), React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#475569",
      marginTop: 4
    }
  }, stageCounts[topSt], " \u0437\u0430\u0434\u0430\u0447")), React.createElement("div", {
    style: {
      background: "rgba(30,41,59,.72)",
      border: "1px solid rgba(148,163,184,.18)",
      borderRadius: 12,
      padding: "12px 20px",
      minWidth: 260,
      flex: "1 1 260px"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#64748b",
      marginBottom: 8
    }
  }, "\u0411\u041E\u041B\u042C\u0428\u0415 \u0412\u0421\u0415\u0413\u041E \u0420\u0410\u0411\u041E\u0422\u0410\u041B \u041D\u0410"), topProjects.length ? topProjects.map(ps => {
    const proj = data.projects.find(p => p.id === ps.id);
    return React.createElement("div", {
      key: ps.id,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 6
      }
    }, React.createElement(ProjectMark, {
      project: proj,
      size: 8
    }), React.createElement("span", {
      style: {
        fontSize: 12,
        color: "#e2e8f0",
        fontWeight: 700,
        flex: 1
      }
    }, (proj === null || proj === void 0 ? void 0 : proj.name) || ps.id), React.createElement("span", {
      style: {
        fontSize: 11,
        color: "#64748b"
      }
    }, ps.count, " \u0441\u043C\u0435\u043D"));
  }) : React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#475569"
    }
  }, "\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u0438\u0441\u0442\u043E\u0440\u0438\u0438 \u043F\u043E \u043F\u0440\u043E\u0435\u043A\u0442\u0430\u043C")), React.createElement("div", {
    style: {
      background: "rgba(30,41,59,.72)",
      border: "1px solid rgba(148,163,184,.18)",
      borderRadius: 12,
      padding: "12px 20px",
      minWidth: 260,
      flex: "1 1 260px"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#64748b",
      marginBottom: 8
    }
  }, "\u0410\u0427\u0418\u0412\u041A\u0418"), achievements.length ? React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      flexWrap: "wrap"
    }
  }, achievements.map(a => React.createElement("span", {
    key: a.id,
    title: `${a.description || a.title}: ${a.value}/${a.threshold}`,
    style: {
      fontSize: 11,
      color: a.color,
      border: `1px solid ${a.color}66`,
      background: `${a.color}22`,
      borderRadius: 999,
      padding: "4px 9px",
      fontWeight: 800,
      display: "inline-flex",
      alignItems: "center",
      gap: 5
    }
  }, a.image ? React.createElement("img", {
    src: a.image,
    alt: "",
    style: {
      width: 16,
      height: 16,
      borderRadius: "50%",
      objectFit: "cover"
    }
  }) : React.createElement("span", null, a.icon || "?"), React.createElement("span", null, a.title)))) : React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#475569"
    }
  }, "\u0410\u0447\u0438\u0432\u043A\u0438 \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u043F\u043E \u043C\u0435\u0440\u0435 \u0438\u0441\u0442\u043E\u0440\u0438\u0438"))));
}
function TodayView(_ref96) {
  let data = _ref96.data,
    conflictDetails = _ref96.conflictDetails,
    onNavigateConflicts = _ref96.onNavigateConflicts,
    canEdit = _ref96.canEdit;
  const _useContext11 = useContext(StagesCtx),
    stageMap = _useContext11.stageMap;
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const todayStr = useMemo(() => formatDate(today), [today]);
  const tomorrowStr = useMemo(() => formatDate(new Date(today.getTime() + 86400000)), [today]);
  const datStr = useMemo(() => formatDate(new Date(today.getTime() + 2 * 86400000)), [today]);
  const in7Str = useMemo(() => formatDate(new Date(today.getTime() + 7 * 86400000)), [today]);
  const todayTasks = useMemo(() => data.tasks.filter(t => !t.deleted && !t.cancelled && t.day === todayStr), [data.tasks, todayStr]);
  const tmrTasks = useMemo(() => data.tasks.filter(t => !t.deleted && !t.cancelled && t.day === tomorrowStr), [data.tasks, tomorrowStr]);
  const datTasks = useMemo(() => data.tasks.filter(t => !t.deleted && !t.cancelled && t.day === datStr), [data.tasks, datStr]);
  const deadlines = useMemo(() => {
    const items = [];
    (data.series || []).forEach(ser => {
      const proj = data.projects.find(p => p.id === ser.projectId);
      if (!proj) return;
      getSeriesMilestoneEvents(ser, proj).forEach(m => {
        const d = m.date;
        if (d && daySort(d) >= daySort(todayStr) && daySort(d) <= daySort(in7Str)) items.push({
          ser,
          proj,
          date: d,
          type: m.label,
          color: m.color
        });
      });
    });
    return items.sort((a, b) => daySort(a.date).localeCompare(daySort(b.date)));
  }, [data.series, data.projects, todayStr, in7Str]);
  const busyNames = useMemo(() => new Set(todayTasks.map(t => t.person).filter(Boolean)), [todayTasks]);
  const freePeople = useMemo(() => data.people.filter(p => p.active !== false && !busyNames.has(p.name)), [data.people, busyNames]);
  const birthdayItems = useMemo(() => upcomingBirthdays(data.people, today, 7), [data.people, today]);
  const notifyConflicts = useMemo(() => conflictDetails.filter(d => d.notify !== false), [conflictDetails]);
  function groupByProj(tasks) {
    const m = {};
    tasks.forEach(t => {
      if (t.deleted || t.cancelled) return;
      if (!m[t.project]) m[t.project] = [];
      m[t.project].push(t);
    });
    return Object.entries(m);
  }
  function groupTodayTasks(tasks) {
    const m = {};
    (tasks || []).filter(t => !t.deleted && !t.cancelled).forEach(t => {
      const key = [t.project || "", t.series || "", t.status || "", t.from || 0, t.to || 0].join("|");
      if (!m[key]) m[key] = {
        ...t,
        ids: [],
        people: [],
        tasks: []
      };
      m[key].ids.push(t.id);
      m[key].tasks.push(t);
      if (t.person && !m[key].people.includes(t.person)) m[key].people.push(t.person);
    });
    return Object.values(m).sort((a, b) => (Number(a.from) || 0) - (Number(b.from) || 0) || String(a.series || "").localeCompare(String(b.series || "")) || String(a.status || "").localeCompare(String(b.status || "")));
  }
  function daysDiff(ds) {
    const d = parseDate(ds);
    if (!d) return "";
    const diff = Math.round((d - today) / 86400000);
    return diff === 0 ? "\u0441\u0435\u0433\u043e\u0434\u043d\u044f" : diff === 1 ? "\u0437\u0430\u0432\u0442\u0440\u0430" : `\u0447\u0435\u0440\u0435\u0437 ${diff} \u0434\u043d.`;
  }
  function Block(_ref97) {
    let title = _ref97.title,
      count = _ref97.count,
      color = _ref97.color,
      children = _ref97.children;
    return React.createElement("div", {
      style: {
        background: "rgba(30,41,59,.72)",
        border: "1px solid rgba(148,163,184,.18)",
        borderRadius: 14,
        overflow: "hidden"
      }
    }, React.createElement("div", {
      style: {
        padding: "14px 18px",
        borderBottom: "1px solid #334155",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
    }, React.createElement("span", {
      style: {
        fontWeight: 700,
        fontSize: 12,
        color: "#64748b",
        letterSpacing: 1,
        textTransform: "uppercase"
      }
    }, title), count != null && React.createElement("span", {
      style: {
        fontSize: 22,
        fontWeight: 800,
        color: color || "#e2e8f0"
      }
    }, count)), React.createElement("div", {
      style: {
        padding: "14px 18px"
      }
    }, children));
  }
  function TasksBlock(_ref98) {
    let tasks = _ref98.tasks;
    const byProj = groupByProj(tasks);
    if (!byProj.length) return React.createElement("div", {
      style: {
        color: "#475569",
        fontSize: 14
      }
    }, "\u0421\u043c\u0435\u043d \u043d\u0435\u0442");
    return byProj.map(_ref99 => {
      let _ref100 = _slicedToArray(_ref99, 2),
        pid = _ref100[0],
        pts = _ref100[1];
      const proj = data.projects.find(p => p.id === pid);
      const grouped = groupTodayTasks(pts);
      return React.createElement("div", {
        key: pid,
        style: {
          marginBottom: 10
        }
      }, React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 4
        }
      }, React.createElement(ProjectMark, {
        project: proj,
        size: 8
      }), React.createElement("span", {
        style: {
          fontSize: 13,
          fontWeight: 600,
          color: (proj === null || proj === void 0 ? void 0 : proj.color) || "#94a3b8"
        }
      }, (proj === null || proj === void 0 ? void 0 : proj.name) || pid)), grouped.map(g => {
        const st = stageMap[g.status];
        return React.createElement("div", {
          key: g.ids.join("-"),
          style: {
            display: "grid",
            gridTemplateColumns: "minmax(62px,78px) minmax(120px,1fr) auto",
            alignItems: "center",
            gap: 8,
            padding: "6px 0 6px 14px",
            borderBottom: "1px solid #1e293b"
          }
        }, React.createElement("span", {
          style: {
            fontSize: 12,
            color: "#64748b",
            whiteSpace: "nowrap"
          }
        }, fmtHour(g.from), "-", fmtHour(g.to)), React.createElement("div", {
          style: {
            minWidth: 0
          }
        }, React.createElement("div", {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap"
          }
        }, React.createElement(StatusBadge, {
          s: g.status,
          small: true
        }), React.createElement("span", {
          style: {
            fontSize: 13,
            color: "#e2e8f0",
            fontWeight: 700,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }
        }, g.series || "-"), g.tasks.length > 1 && React.createElement("span", {
          style: {
            fontSize: 10,
            color: (st === null || st === void 0 ? void 0 : st.color) || "#64748b",
            border: `1px solid ${(st === null || st === void 0 ? void 0 : st.color) || "#64748b"}55`,
            borderRadius: 999,
            padding: "0 6px"
          }
        }, "x", g.tasks.length))), React.createElement("div", {
          style: {
            display: "flex",
            gap: 4,
            flexWrap: "wrap",
            justifyContent: "flex-end",
            maxWidth: 220
          }
        }, (g.people.length ? g.people : ["\u043d\u0435 \u043d\u0430\u0437\u043d."]).map(name => React.createElement("span", {
          key: name,
          style: {
            fontSize: 11,
            color: name === g.people[0] ? "#cbd5e1" : "#94a3b8",
            background: "rgba(148,163,184,0.09)",
            border: "1px solid #334155",
            borderRadius: 999,
            padding: "2px 7px",
            whiteSpace: "nowrap"
          }
        }, name))));
      }));
    });
  }
  const pd = today;
  const dateTitle = `${WDAYS_LONG[pd.getDay()]}, ${String(pd.getDate()).padStart(2, "0")} ${MONTHS[pd.getMonth()].toLowerCase()}`;
  return React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      marginBottom: 20,
      color: "#e2e8f0"
    }
  }, dateTitle), birthdayItems.length > 0 && React.createElement("div", {
    className: `ppt-birthday-banner ${birthdayItems.some(b => b.diff === 0) ? "ppt-birthday-today" : ""}`
  }, React.createElement("span", {
    className: "ppt-birthday-chip"
  }, "\u0414\u0420"), React.createElement("span", {
    className: "ppt-birthday-banner-title"
  }, "\u0414\u043D\u0438 \u0440\u043E\u0436\u0434\u0435\u043D\u0438\u044F 7 \u0434\u043D\u0435\u0439"), birthdayItems.map(b => React.createElement("span", {
    key: b.person.id || b.person.name,
    className: "ppt-birthday-pill"
  }, b.person.name, " \xB7 ", normalizeBirthday(b.person.birthday), " \xB7 ", birthdayWhenText(b.diff)))), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,400px),1fr))",
      gap: 16,
      alignItems: "start"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, React.createElement(Block, {
    title: "\u0421\u0435\u0433\u043E\u0434\u043D\u044F",
    count: todayTasks.length,
    color: todayTasks.length ? "#e2e8f0" : "#475569"
  }, React.createElement(TasksBlock, {
    tasks: todayTasks
  })), React.createElement(Block, {
    title: "\u0417\u0430\u0432\u0442\u0440\u0430",
    count: tmrTasks.length,
    color: "#64748b"
  }, React.createElement(TasksBlock, {
    tasks: tmrTasks
  }))), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, React.createElement(Block, {
    title: "\u041A\u043E\u043D\u0444\u043B\u0438\u043A\u0442\u044B",
    count: notifyConflicts.length,
    color: notifyConflicts.length ? "#f87171" : "#22c55e"
  }, notifyConflicts.length === 0 ? React.createElement("div", {
    style: {
      color: "#22c55e",
      fontSize: 15,
      fontWeight: 600
    }
  }, "OK \u041A\u043E\u043D\u0444\u043B\u0438\u043A\u0442\u043E\u0432 \u043D\u0435\u0442") : React.createElement("div", null, React.createElement("div", {
    style: {
      fontSize: 14,
      color: "#f87171",
      marginBottom: 10
    }
  }, "\u0422\u0440\u0435\u0431\u0443\u044E\u0442 \u0432\u043D\u0438\u043C\u0430\u043D\u0438\u044F: ", notifyConflicts.length), React.createElement(Btn, {
    variant: "ghost",
    small: true,
    onClick: onNavigateConflicts
  }, "\u0421\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0432\u0441\u0435 \u2192"))), React.createElement(Block, {
    title: "\u0412\u0430\u0436\u043D\u043E\u0435 7 \u0434\u043D\u0435\u0439",
    count: deadlines.length + birthdayItems.length,
    color: deadlines.length + birthdayItems.length ? "#f59e0b" : "#475569"
  }, deadlines.length === 0 && birthdayItems.length === 0 ? React.createElement("div", {
    style: {
      color: "#475569",
      fontSize: 14
    }
  }, "\u0412\u0430\u0436\u043D\u044B\u0445 \u0441\u043E\u0431\u044B\u0442\u0438\u0439 \u043D\u0435\u0442") : React.createElement("div", null, birthdayItems.map(b => React.createElement("div", {
    key: `bd-${b.person.id || b.person.name}`,
    className: `ppt-birthday-important ${b.diff === 0 ? "ppt-birthday-today" : ""}`
  }, React.createElement("span", {
    className: "ppt-birthday-chip ppt-birthday-chip-small"
  }, "\u0414\u0420"), React.createElement("span", {
    className: "ppt-birthday-important-name"
  }, b.person.name), React.createElement("span", {
    className: "ppt-birthday-important-label"
  }, "\u0414\u0435\u043D\u044C \u0440\u043E\u0436\u0434\u0435\u043D\u0438\u044F"), React.createElement("span", {
    className: "ppt-birthday-important-when"
  }, birthdayWhenText(b.diff)))), deadlines.map((u, i) => React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "7px 0",
      borderBottom: "1px solid #1e293b"
    }
  }, React.createElement(ProjectMark, {
    project: u.proj,
    size: 8
  }), React.createElement("span", {
    style: {
      fontSize: 14,
      color: "#e2e8f0",
      flex: 1,
      fontWeight: 500
    }
  }, u.proj.abbr || u.proj.name, " \xB7 ", u.ser.name), React.createElement("span", {
    style: {
      fontSize: 12,
      color: u.color,
      fontWeight: 700
    }
  }, u.type), React.createElement("span", {
    style: {
      fontSize: 12,
      color: "#475569"
    }
  }, daysDiff(u.date)))))), React.createElement(Block, {
    title: "\u041F\u043E\u0441\u043B\u0435\u0437\u0430\u0432\u0442\u0440\u0430",
    count: datTasks.length,
    color: "#64748b"
  }, React.createElement(TasksBlock, {
    tasks: datTasks
  })))));
}
function SeriesCard(_ref101) {
  let seriesId = _ref101.seriesId,
    data = _ref101.data,
    onBatchUpdate = _ref101.onBatchUpdate;
  const holidays = useContext(HolidaysCtx);
  const _useState171 = useState("general"),
    _useState172 = _slicedToArray(_useState171, 2),
    tab = _useState172[0],
    setTab = _useState172[1];
  const _useState173 = useState(null),
    _useState174 = _slicedToArray(_useState173, 2),
    newCLForm = _useState174[0],
    setNewCLForm = _useState174[1];
  const _useState175 = useState(null),
    _useState176 = _slicedToArray(_useState175, 2),
    editCLId = _useState176[0],
    setEditCLId = _useState176[1];
  const _useState177 = useState(""),
    _useState178 = _slicedToArray(_useState177, 2),
    editCLName = _useState178[0],
    setEditCLName = _useState178[1];
  const _useState179 = useState({}),
    _useState180 = _slicedToArray(_useState179, 2),
    openCmts = _useState180[0],
    setOpenCmts = _useState180[1];
  const ser = (data.series || []).find(s => s.id === seriesId);
  const proj = ser ? data.projects.find(p => p.id === ser.projectId) : null;
  if (!ser || !proj) return React.createElement("div", {
    style: {
      padding: 40,
      color: "#475569",
      textAlign: "center"
    }
  }, "\u0421\u0435\u0440\u0438\u044F \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430.");
  const checklists = ser.checklists || [];
  const allItems = checklists.flatMap(cl => cl.items || []);
  const doneCount = allItems.filter(i => i.done).length;
  const totalCount = allItems.length;
  const undoneCount = totalCount - doneCount;
  const canDeliver = totalCount === 0 || undoneCount === 0;
  const preOtkWarn = ser.preOtkDate && isNonWorkday(ser.preOtkDate, holidays);
  const otkWarn = ser.otkDate && isNonWorkday(ser.otkDate, holidays);
  function upSer(ch) {
    onBatchUpdate({
      series: (data.series || []).map(s => s.id === seriesId ? {
        ...s,
        ...ch
      } : s),
      tasks: data.tasks
    });
  }
  function updCL(clId, ch) {
    upSer({
      checklists: checklists.map(cl => cl.id === clId ? {
        ...cl,
        ...ch
      } : cl)
    });
  }
  function toggleItem(clId, itemId) {
    const cl = checklists.find(c => c.id === clId);
    updCL(clId, {
      items: (cl.items || []).map(it => it.id === itemId ? {
        ...it,
        done: !it.done
      } : it)
    });
  }
  function updItem(clId, itemId, ch) {
    const cl = checklists.find(c => c.id === clId);
    updCL(clId, {
      items: (cl.items || []).map(it => it.id === itemId ? {
        ...it,
        ...ch
      } : it)
    });
  }
  function delItem(clId, itemId) {
    const cl = checklists.find(c => c.id === clId);
    updCL(clId, {
      items: (cl.items || []).filter(it => it.id !== itemId)
    });
  }
  function addItem(clId) {
    const cl = checklists.find(c => c.id === clId);
    if (!cl) return;
    updCL(clId, {
      items: [...(cl.items || []), {
        id: "i" + Date.now(),
        text: "Новый пункт",
        done: false,
        comment: ""
      }]
    });
  }
  function delChecklist(clId) {
    if (!window.confirm("Удалить чек-лист?")) return;
    upSer({
      checklists: checklists.filter(cl => cl.id !== clId)
    });
  }
  function createChecklist() {
    const name = newCLForm.name,
      lines = newCLForm.lines;
    const items = lines.split("\n").filter(l => l.trim()).map((text, i) => ({
      id: "i" + Date.now() + i,
      text: text.trim(),
      done: false,
      comment: ""
    }));
    upSer({
      checklists: [...checklists, {
        id: "cl" + Date.now(),
        name: name.trim() || "Без названия",
        items
      }]
    });
    setNewCLForm(null);
  }
  function deliverSeries() {
    if (!window.confirm("Отметить серию как сданную?")) return;
    upSer({
      delivered: true,
      deliveredAt: formatDate(new Date())
    });
  }
  function reopenSeries() {
    if (!window.confirm("Открыть серию заново?")) return;
    upSer({
      delivered: false,
      deliveredAt: ""
    });
  }
  const iSt = {
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: 10,
    color: "#e2e8f0",
    padding: "7px 10px",
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box"
  };
  const lSt = {
    fontSize: 11,
    color: "#64748b",
    letterSpacing: 1,
    marginBottom: 3,
    display: "block"
  };
  const cSt = {
    background: "rgba(30,41,59,.72)",
    borderRadius: 16,
    padding: 20,
    border: "1px solid rgba(148,163,184,.18)"
  };
  const TABS = [{
    id: "general",
    label: "Общее"
  }, {
    id: "checklists",
    label: totalCount ? `Чек-листы (${doneCount}/${totalCount})` : "Чек-листы"
  }, {
    id: "notes",
    label: "Заметки"
  }];
  return React.createElement("div", {
    style: {
      maxWidth: 900,
      margin: "0 auto"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      marginBottom: 20
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      gap: 1,
      background: "#0f172a",
      borderRadius: 12,
      border: "1px solid #334155",
      overflow: "hidden",
      width: "fit-content"
    }
  }, TABS.map(_ref102 => {
    let id = _ref102.id,
      label = _ref102.label;
    return React.createElement("button", {
      key: id,
      onClick: () => setTab(id),
      style: {
        padding: "6px 16px",
        border: "none",
        borderRight: "1px solid #334155",
        cursor: "pointer",
        fontSize: 12,
        fontFamily: "inherit",
        background: tab === id ? "#3b82f6" : "transparent",
        color: tab === id ? "#fff" : "#64748b",
        fontWeight: tab === id ? 700 : 400
      }
    }, label);
  })), React.createElement(Btn, {
    variant: "primary",
    small: true,
    onClick: () => upSer({
      _updatedAt: Date.now()
    })
  }, "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C")), tab === "general" && React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))",
      gap: 16,
      alignItems: "start"
    }
  }, React.createElement("div", {
    style: cSt
  }, React.createElement("div", {
    style: {
      display: "grid",
      gap: 12
    }
  }, React.createElement("div", null, React.createElement("label", {
    style: lSt
  }, "\u041D\u0410\u0417\u0412\u0410\u041D\u0418\u0415"), React.createElement("input", {
    defaultValue: ser.name,
    style: iSt,
    onBlur: e => {
      const v = e.target.value.trim();
      if (v && v !== ser.name) upSer({
        name: v
      });
    }
  })), React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#475569",
      letterSpacing: 1
    }
  }, "\u2014\u2014\u2014 \u0421\u042A\u0401\u041C\u041A\u0418 \u2014\u2014\u2014"), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, React.createElement("div", null, React.createElement("label", {
    style: lSt
  }, "\u041D\u0410\u0427\u0410\u041B\u041E"), React.createElement(InpDate, {
    value: ser.shootStart || "",
    onChange: v => upSer({
      shootStart: v
    })
  })), React.createElement("div", null, React.createElement("label", {
    style: lSt
  }, "\u041A\u041E\u041D\u0415\u0426"), React.createElement(InpDate, {
    value: ser.shootEnd || "",
    onChange: v => upSer({
      shootEnd: v
    })
  }))), React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#475569",
      letterSpacing: 1
    }
  }, "\u2014\u2014\u2014 \u041F\u041E\u0421\u0422\u041F\u0420\u041E\u0414\u0410\u041A\u0428\u041D \u2014\u2014\u2014"), React.createElement("div", null, React.createElement("label", {
    style: lSt
  }, "\u041C\u041E\u041D\u0422\u0410\u0416 \u0421"), React.createElement(InpDate, {
    value: ser.editStart || "",
    onChange: v => upSer({
      editStart: v
    })
  })), React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#475569",
      letterSpacing: 1
    }
  }, "\u2014\u2014\u2014 \u041A\u041B\u042E\u0427\u0415\u0412\u042B\u0415 \u0421\u041E\u0411\u042B\u0422\u0418\u042F \u2014\u2014\u2014"), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, React.createElement("div", null, React.createElement("label", {
    style: {
      ...lSt,
      color: "#a855f7"
    }
  }, "\u0417\u0430\u043a\u0430\u0437 \u041e\u0422\u041f\u0420\u0410\u0412\u041a\u0410"), React.createElement(InpDate, {
    value: ser.sendDate || "",
    onChange: v => upSer({
      sendDate: v
    })
  })), React.createElement("div", null, React.createElement("label", {
    style: {
      ...lSt,
      color: getProjectMilestoneMeta(proj, "preOtkDate", SERIES_MILESTONES.find(m => m.key === "preOtkDate")).color
    }
  }, getProjectMilestoneMeta(proj, "preOtkDate", SERIES_MILESTONES.find(m => m.key === "preOtkDate")).label), React.createElement(InpDate, {
    value: ser.preOtkDate || "",
    onChange: v => upSer({
      preOtkDate: v
    }),
    warn: preOtkWarn
  }))), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, React.createElement("div", null, React.createElement("label", {
    style: {
      ...lSt,
      color: getProjectMilestoneMeta(proj, "otkDate", SERIES_MILESTONES.find(m => m.key === "otkDate")).color
    }
  }, getProjectMilestoneMeta(proj, "otkDate", SERIES_MILESTONES.find(m => m.key === "otkDate")).label), React.createElement(InpDate, {
    value: ser.otkDate || "",
    onChange: v => upSer({
      otkDate: v
    }),
    warn: otkWarn
  })), React.createElement("div", null, React.createElement("label", {
    style: {
      ...lSt,
      color: "#f59e0b"
    }
  }, "\u042D\u0424 \u042D\u0424\u0418\u0420"), React.createElement(InpDate, {
    value: ser.airDate || "",
    onChange: v => upSer({
      airDate: v
    })
  }))), getProjectCustomMilestones(proj).length > 0 && React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, getProjectCustomMilestones(proj).map(def => {
    var _vals$find;
    const vals = ser.customMilestones || [];
    const cur = ((_vals$find = vals.find(v => v.id === def.id)) === null || _vals$find === void 0 ? void 0 : _vals$find.date) || "";
    function setCustomDate(v) {
      const next = vals.filter(x => x.id !== def.id);
      if (v) next.push({
        id: def.id,
        date: v
      });
      upSer({
        customMilestones: next
      });
    }
    return React.createElement("div", {
      key: def.id
    }, React.createElement("label", {
      style: {
        ...lSt,
        color: def.color || "#f59e0b"
      }
    }, def.label || "Контрольная точка"), React.createElement(InpDate, {
      value: cur,
      onChange: setCustomDate
    }));
  })), React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#475569",
      letterSpacing: 1
    }
  }, "\u2014\u2014\u2014 \u0422\u0420\u0410\u041D\u0417\u0418\u0422\u041D\u042B\u0415 \u041A\u041E\u0414\u042B \u2014\u2014\u2014"), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, React.createElement("div", null, React.createElement("label", {
    style: lSt
  }, "\u0420\u0415\u041A\u041B\u0410\u041C\u041D\u042B\u0419"), React.createElement("input", {
    defaultValue: ser.transitCodeAd || "",
    style: iSt,
    onBlur: e => {
      if (e.target.value !== (ser.transitCodeAd || "")) upSer({
        transitCodeAd: e.target.value
      });
    }
  })), React.createElement("div", null, React.createElement("label", {
    style: lSt
  }, "\u0411\u0415\u0417\u0420\u0415\u041A\u041B\u0410\u041C\u041D\u042B\u0419"), React.createElement("input", {
    defaultValue: ser.transitCodeNoAd || "",
    style: iSt,
    onBlur: e => {
      if (e.target.value !== (ser.transitCodeNoAd || "")) upSer({
        transitCodeNoAd: e.target.value
      });
    }
  }))))), React.createElement("div", {
    style: cSt
  }, React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#64748b",
      letterSpacing: 1,
      marginBottom: 12
    }
  }, "\u0421\u0422\u0410\u0422\u0423\u0421 \u0421\u0415\u0420\u0418\u0418"), ser.delivered ? React.createElement("div", null, React.createElement("div", {
    style: {
      background: "#22c55e1a",
      border: "1px solid #22c55e44",
      borderRadius: 12,
      padding: "12px 16px",
      marginBottom: 16,
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, React.createElement("span", {
    style: {
      fontSize: 20
    }
  }, "OK"), React.createElement("div", null, React.createElement("div", {
    style: {
      fontWeight: 700,
      color: "#22c55e",
      fontSize: 15
    }
  }, "\u0421\u0434\u0430\u043D\u0430"), ser.deliveredAt && React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#475569",
      marginTop: 2
    }
  }, ser.deliveredAt))), React.createElement("button", {
    onClick: reopenSeries,
    style: {
      width: "100%",
      padding: "9px",
      borderRadius: 7,
      cursor: "pointer",
      background: "transparent",
      color: "#64748b",
      border: "1px solid #334155",
      fontSize: 13,
      fontFamily: "inherit"
    }
  }, "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0441\u0435\u0440\u0438\u044E \u0437\u0430\u043D\u043E\u0432\u043E")) : React.createElement("div", null, React.createElement("div", {
    style: {
      background: "#3b82f61a",
      border: "1px solid #3b82f644",
      borderRadius: 12,
      padding: "12px 16px",
      marginBottom: 16,
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, React.createElement("span", {
    style: {
      fontSize: 20
    }
  }, "\u25C9"), React.createElement("div", {
    style: {
      fontWeight: 700,
      color: "#3b82f6",
      fontSize: 15
    }
  }, "\u0412 \u0440\u0430\u0431\u043E\u0442\u0435")), totalCount > 0 && React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 5,
      fontSize: 11,
      color: "#64748b"
    }
  }, React.createElement("span", null, "\u0427\u0435\u043A-\u043B\u0438\u0441\u0442\u044B"), React.createElement("span", {
    style: {
      color: undoneCount === 0 ? "#22c55e" : "#94a3b8"
    }
  }, doneCount, "/", totalCount, " \u0433\u043E\u0442\u043E\u0432\u043E")), React.createElement("div", {
    style: {
      height: 6,
      background: "#0f172a",
      borderRadius: 3,
      overflow: "hidden"
    }
  }, React.createElement("div", {
    style: {
      height: "100%",
      borderRadius: 3,
      transition: "width 0.3s",
      width: `${totalCount ? Math.round(doneCount / totalCount * 100) : 0}%`,
      background: undoneCount === 0 ? "#22c55e" : "#3b82f6"
    }
  }))), React.createElement("button", {
    disabled: !canDeliver,
    onClick: deliverSeries,
    title: !canDeliver ? `Закройте все пункты: открыто ${undoneCount}` : "",
    style: {
      width: "100%",
      padding: "10px",
      borderRadius: 12,
      cursor: canDeliver ? "pointer" : "not-allowed",
      fontFamily: "inherit",
      background: canDeliver ? "#22c55e1a" : "#0f172a",
      color: canDeliver ? "#22c55e" : "#334155",
      border: `1px solid ${canDeliver ? "#22c55e44" : "#1e293b"}`,
      fontSize: 14,
      fontWeight: 700,
      transition: "all 0.2s"
    }
  }, canDeliver ? "OK Сдать серию" : ` Сдать серию (открыто ${undoneCount})`), !canDeliver && React.createElement("div", {
    style: {
      fontSize: 11,
      color: "#475569",
      marginTop: 6,
      textAlign: "center"
    }
  }, "\u0417\u0430\u043A\u0440\u043E\u0439\u0442\u0435 \u0432\u0441\u0435 \u043F\u0443\u043D\u043A\u0442\u044B \u0447\u0435\u043A-\u043B\u0438\u0441\u0442\u043E\u0432")))), tab === "checklists" && React.createElement("div", null, totalCount > 0 && React.createElement("div", {
    style: {
      ...cSt,
      marginBottom: 14,
      padding: "14px 20px"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6
    }
  }, React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700
    }
  }, "\u041E\u0431\u0449\u0438\u0439 \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441"), React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: undoneCount === 0 ? "#22c55e" : "#94a3b8"
    }
  }, doneCount, " / ", totalCount, " OK (", totalCount ? Math.round(doneCount / totalCount * 100) : 0, "%)")), React.createElement("div", {
    style: {
      height: 8,
      background: "#0f172a",
      borderRadius: 4,
      overflow: "hidden"
    }
  }, React.createElement("div", {
    style: {
      height: "100%",
      borderRadius: 4,
      transition: "width 0.3s",
      width: `${totalCount ? Math.round(doneCount / totalCount * 100) : 0}%`,
      background: undoneCount === 0 ? "#22c55e" : "#3b82f6"
    }
  }))), React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      marginBottom: 12
    }
  }, React.createElement(Btn, {
    variant: "primary",
    small: true,
    onClick: () => setNewCLForm({
      name: "",
      lines: ""
    })
  }, "+ \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0447\u0435\u043A-\u043B\u0438\u0441\u0442")), checklists.length === 0 && React.createElement("div", {
    style: {
      color: "#475569",
      padding: "40px 0",
      textAlign: "center",
      fontSize: 14
    }
  }, "\u041D\u0435\u0442 \u0447\u0435\u043A-\u043B\u0438\u0441\u0442\u043E\u0432 \u2014 \u043D\u0430\u0436\u043C\u0438\u0442\u0435 \xAB+ \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0447\u0435\u043A-\u043B\u0438\u0441\u0442\xBB"), checklists.map(cl => {
    const clDone = (cl.items || []).filter(i => i.done).length;
    const clTotal = (cl.items || []).length;
    return React.createElement("div", {
      key: cl.id,
      style: {
        ...cSt,
        marginBottom: 12
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12
      }
    }, editCLId === cl.id ? React.createElement("input", {
      autoFocus: true,
      value: editCLName,
      onChange: e => setEditCLName(e.target.value),
      onBlur: () => {
        if (editCLName.trim()) updCL(cl.id, {
          name: editCLName.trim()
        });
        setEditCLId(null);
      },
      onKeyDown: e => {
        if (e.key === "Enter") {
          if (editCLName.trim()) updCL(cl.id, {
            name: editCLName.trim()
          });
          setEditCLId(null);
        }
        if (e.key === "Escape") setEditCLId(null);
      },
      style: {
        ...iSt,
        fontSize: 14,
        fontWeight: 700,
        padding: "3px 8px",
        flex: 1,
        marginRight: 8
      }
    }) : React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, React.createElement("span", {
      style: {
        fontWeight: 700,
        fontSize: 14
      }
    }, cl.name), React.createElement("span", {
      style: {
        fontSize: 11,
        color: clDone === clTotal && clTotal > 0 ? "#22c55e" : "#475569"
      }
    }, clDone, "/", clTotal)), React.createElement("div", {
      style: {
        display: "flex",
        gap: 2
      }
    }, React.createElement("button", {
      onClick: () => {
        setEditCLId(cl.id);
        setEditCLName(cl.name);
      },
      style: {
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#475569",
        fontSize: 14,
        padding: "2px 7px"
      }
    }, "\u270F"), React.createElement("button", {
      onClick: () => delChecklist(cl.id),
      style: {
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#ef4444",
        fontSize: 15,
        padding: "2px 7px"
      }
    }))), (cl.items || []).map(item => {
      const ck = `${cl.id}|${item.id}`;
      const cmtOpen = openCmts[ck];
      return React.createElement("div", {
        key: item.id,
        style: {
          marginBottom: cmtOpen ? 6 : 2
        }
      }, React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "3px 0",
          borderBottom: "1px solid #0f172a"
        }
      }, React.createElement("button", {
        onClick: () => toggleItem(cl.id, item.id),
        style: {
          background: "none",
          border: "none",
          cursor: "pointer",
          color: item.done ? "#22c55e" : "#475569",
          fontSize: 19,
          padding: 0,
          flexShrink: 0,
          lineHeight: 1,
          width: 24
        }
      }, item.done ? "☑" : "☐"), React.createElement("input", {
        defaultValue: item.text,
        style: {
          background: "none",
          border: "none",
          outline: "none",
          color: item.done ? "#475569" : "#e2e8f0",
          fontFamily: "inherit",
          fontSize: 13,
          flex: 1,
          padding: "2px 0",
          cursor: "text",
          textDecoration: item.done ? "line-through" : "none"
        },
        onBlur: e => {
          const v = e.target.value.trim();
          if (v && v !== item.text) updItem(cl.id, item.id, {
            text: v
          });
        }
      }), React.createElement("button", {
        onClick: () => setOpenCmts(p => ({
          ...p,
          [ck]: !p[ck]
        })),
        title: "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439",
        style: {
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0 4px",
          flexShrink: 0,
          fontSize: 13,
          color: item.comment ? cmtOpen ? "#3b82f6" : "#f59e0b" : "#334155"
        }
      }, "\uD83D\uDCAC"), React.createElement("button", {
        onClick: () => delItem(cl.id, item.id),
        style: {
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0 4px",
          flexShrink: 0,
          color: "#475569",
          fontSize: 13
        }
      }, "\u2715")), cmtOpen && React.createElement("textarea", {
        defaultValue: item.comment || "",
        rows: 2,
        placeholder: "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439...",
        style: {
          ...iSt,
          fontSize: 12,
          resize: "none",
          marginTop: 3,
          marginLeft: 30,
          width: "calc(100% - 30px)",
          boxSizing: "border-box"
        },
        onBlur: e => {
          if (e.target.value !== (item.comment || "")) updItem(cl.id, item.id, {
            comment: e.target.value
          });
        }
      }));
    }), React.createElement("button", {
      onClick: () => addItem(cl.id),
      style: {
        background: "none",
        border: "1px dashed #334155",
        borderRadius: 10,
        color: "#475569",
        cursor: "pointer",
        padding: "5px 12px",
        fontSize: 11,
        fontFamily: "inherit",
        marginTop: 10,
        width: "100%"
      }
    }, "+ \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043F\u0443\u043D\u043A\u0442"));
  })), tab === "notes" && React.createElement("div", {
    style: cSt
  }, React.createElement("label", {
    style: lSt
  }, "\u0417\u0410\u041C\u0415\u0422\u041A\u0418"), React.createElement("textarea", {
    defaultValue: ser.notes || "",
    rows: 16,
    style: {
      ...iSt,
      resize: "vertical"
    },
    onBlur: e => {
      if (e.target.value !== (ser.notes || "")) upSer({
        notes: e.target.value
      });
    }
  })), newCLForm && React.createElement(Modal, {
    title: "\u041D\u043E\u0432\u044B\u0439 \u0447\u0435\u043A-\u043B\u0438\u0441\u0442",
    onClose: () => setNewCLForm(null),
    onSubmit: createChecklist
  }, React.createElement(Field, {
    label: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"
  }, React.createElement(Inp, {
    value: newCLForm.name,
    onChange: v => setNewCLForm(p => ({
      ...p,
      name: v
    })),
    placeholder: "\u041C\u043E\u043D\u0442\u0430\u0436, \u0421\u0434\u0430\u0447\u0430 \u043C\u0430\u0441\u0442\u0435\u0440\u0430, \u0418\u043D\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u0438..."
  })), React.createElement(Field, {
    label: "\u041F\u0443\u043D\u043A\u0442\u044B (\u043A\u0430\u0436\u0434\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430 \u2014 \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u044B\u0439 \u043F\u0443\u043D\u043A\u0442)"
  }, React.createElement("textarea", {
    value: newCLForm.lines,
    onChange: e => setNewCLForm(p => ({
      ...p,
      lines: e.target.value
    })),
    placeholder: "Проверить цветокоррекцию\nЗвук сведён\nСинхра принята",
    rows: 7,
    style: {
      background: "#0f172a",
      border: "1px solid #334155",
      borderRadius: 10,
      color: "#e2e8f0",
      padding: "8px 10px",
      fontSize: 13,
      width: "100%",
      fontFamily: "inherit",
      resize: "vertical",
      outline: "none"
    }
  })), React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 8,
      marginTop: 8,
      borderTop: "1px solid #334155",
      paddingTop: 14
    }
  }, React.createElement(Btn, {
    variant: "ghost",
    onClick: () => setNewCLForm(null)
  }, "\u041E\u0442\u043C\u0435\u043D\u0430"), React.createElement(Btn, {
    variant: "primary",
    onClick: createChecklist
  }, "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C"))));
}
function ProjectCard(_ref103) {
  let projectId = _ref103.projectId,
    data = _ref103.data,
    onUpdate = _ref103.onUpdate,
    onBatchUpdate = _ref103.onBatchUpdate,
    onBack = _ref103.onBack,
    onSeriesSelect = _ref103.onSeriesSelect,
    onDelete = _ref103.onDelete,
    onLog = _ref103.onLog,
    canDeleteStructure = _ref103.canDeleteStructure,
    canEditProject = _ref103.canEditProject,
    canManageProjectAssignments = _ref103.canManageProjectAssignments;
  const _useContext12 = useContext(StagesCtx),
    stages = _useContext12.sorted,
    stageGroups = _useContext12.stageGroups,
    groupMap = _useContext12.groupMap;
  const _useState181 = useState("general"),
    _useState182 = _slicedToArray(_useState181, 2),
    tab = _useState182[0],
    setTab = _useState182[1];
  const _useState183 = useState(null),
    _useState184 = _slicedToArray(_useState183, 2),
    editSeries = _useState184[0],
    setEditSeries = _useState184[1];
  const kppDragRef = useRef(null);
  const proj = data.projects.find(p => p.id === projectId);
  if (!proj) return React.createElement("div", {
    style: {
      padding: 24,
      color: "#475569"
    }
  }, "\u041F\u0440\u043E\u0435\u043A\u0442 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D.");
  const projSeries = (data.series || []).filter(s => s.projectId === projectId).sort((a, b) => (a.order || 0) - (b.order || 0));
  const pTasks = data.tasks.filter(t => t.project === projectId);
  const dossier = proj.dossier || {};
  const info = dossier.info || {};
  function upProj(ch) {
    if (!canEditProject) return;
    if (!canManageProjectAssignments && (Object.prototype.hasOwnProperty.call(ch, "managers") || Object.prototype.hasOwnProperty.call(ch, "status"))) return;
    onUpdate("projects", data.projects.map(p => p.id === projectId ? {
      ...p,
      ...ch
    } : p));
  }
  function upInfo(f, v) {
    upProj({
      dossier: {
        ...dossier,
        info: {
          ...info,
          [f]: v
        }
      }
    });
  }
  function upDoss(f, v) {
    upProj({
      dossier: {
        ...dossier,
        [f]: v
      }
    });
  }
  function upSer(sid, ch) {
    if (!canEditProject) return;
    onBatchUpdate({
      series: (data.series || []).map(s => s.id === sid ? {
        ...s,
        ...ch
      } : s),
      tasks: data.tasks
    });
  }
  function saveSeries(serData) {
    if (!canEditProject) return;
    let allS = [...(data.series || [])];
    let final;
    const existing = allS.find(s => s.id === serData.id);
    const oldName = existing === null || existing === void 0 ? void 0 : existing.name;
    const isNew = !serData.id || !existing;
    if (!isNew) {
      final = {
        ...serData,
        _updatedAt: Date.now()
      };
      allS = allS.map(s => s.id === serData.id ? final : s);
    } else {
      const findGid = kw => {
        var _stageGroups$find;
        return (_stageGroups$find = stageGroups.find(g => new RegExp(kw, "i").test(g.label))) === null || _stageGroups$find === void 0 ? void 0 : _stageGroups$find.id;
      };
      const sr = {};
      if (serData.shootStart) {
        const gid = findGid("съём");
        if (gid) sr[gid] = {
          from: serData.shootStart,
          to: addDays(serData.shootStart, 2)
        };
      }
      if (serData.syncStart) {
        const gid = findGid("синхр");
        if (gid) sr[gid] = {
          from: serData.syncStart,
          to: addDays(serData.syncStart, 1)
        };
      }
      if (serData.editStart) {
        const gid = findGid("монтаж");
        if (gid) sr[gid] = {
          from: serData.editStart,
          to: ""
        };
      }
      if (serData.otkDate) {
        const gid = findGid("отк");
        if (gid) sr[gid] = {
          from: serData.otkDate,
          to: ""
        };
      }
      final = {
        ...serData,
        id: "s" + Date.now(),
        projectId,
        order: allS.filter(s => s.projectId === projectId).length,
        syncStart: serData.syncStart || "",
        transitCode: "",
        transitVariants: ["", "", ""],
        checklists: [],
        notes: "",
        delivered: false,
        deliveredAt: "",
        assets: [],
        stageRanges: {
          ...sr
        },
        _updatedAt: Date.now()
      };
      allS.push(final);
    }
    let newTasks = data.tasks;
    if (!isNew && oldName && oldName !== final.name) newTasks = newTasks.map(t => t.seriesId === final.id && t.series === oldName ? {
      ...t,
      series: final.name
    } : t);
    onLog === null || onLog === void 0 || onLog(isNew ? `Создана серия «${final.name}» → ${proj.name}` : `Серия «${final.name}» обновлена`);
    onBatchUpdate({
      series: allS,
      tasks: newTasks
    });
    setEditSeries(null);
  }
  function deleteSeries(id) {
    var _find4;
    if (!canDeleteStructure) return;
    if (!window.confirm("Удалить серию и все её задачи? Действие можно отменить через Ctrl+Z.")) return;
    const serName = ((_find4 = (data.series || []).find(s => s.id === id)) === null || _find4 === void 0 ? void 0 : _find4.name) || id;
    onLog === null || onLog === void 0 || onLog(`Удалена серия «${serName}» → ${proj.name}`);
    onBatchUpdate(deleteSeriesSnapshot(data, id));
  }
  const iSt = {
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: 10,
    color: "#e2e8f0",
    padding: "7px 10px",
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box"
  };
  const lSt = {
    fontSize: 11,
    color: "#64748b",
    letterSpacing: 1,
    marginBottom: 3,
    display: "block"
  };
  const TABS = [{
    id: "general",
    label: "Общее"
  }, {
    id: "kpp",
    label: `КПП (${projSeries.length})`
  }, {
    id: "info",
    label: "Информация"
  }, {
    id: "transits",
    label: "Транзиты"
  }, {
    id: "access",
    label: "Доступы и ссылки"
  }, {
    id: "notes",
    label: "Заметки"
  }];
  return React.createElement("div", {
    style: {
      maxWidth: 960,
      margin: "0 auto"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      gap: 1,
      background: "#0f172a",
      borderRadius: 12,
      border: "1px solid #334155",
      overflow: "hidden",
      width: "fit-content"
    }
  }, TABS.map(_ref104 => {
    let id = _ref104.id,
      label = _ref104.label;
    return React.createElement("button", {
      key: id,
      onClick: () => setTab(id),
      style: {
        padding: "6px 16px",
        border: "none",
        borderRight: "1px solid #334155",
        cursor: "pointer",
        fontSize: 12,
        fontFamily: "inherit",
        background: tab === id ? "#3b82f6" : "transparent",
        color: tab === id ? "#fff" : "#64748b",
        fontWeight: tab === id ? 700 : 400
      }
    }, label);
  })), onDelete && canDeleteStructure && React.createElement(Btn, {
    variant: "danger",
    small: true,
    onClick: () => onDelete(projectId)
  }, "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043F\u0440\u043E\u0435\u043A\u0442")), tab === "general" && React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))",
      gap: 16,
      alignItems: "start"
    }
  }, React.createElement("div", {
    style: {
      background: "rgba(30,41,59,.72)",
      borderRadius: 16,
      padding: 20,
      border: `1px solid ${proj.color}66`,
      borderTop: `3px solid ${proj.color}`
    }
  }, React.createElement("div", {
    style: {
      display: "grid",
      gap: 12
    }
  }, React.createElement("div", null, React.createElement("label", {
    style: lSt
  }, "\u041D\u0410\u0417\u0412\u0410\u041D\u0418\u0415"), React.createElement("input", {
    defaultValue: proj.name,
    style: iSt,
    onBlur: e => {
      const v = e.target.value.trim();
      if (v && v !== proj.name) upProj({
        name: v
      });
    }
  })), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, React.createElement("div", null, React.createElement("label", {
    style: lSt
  }, "\u0410\u0411\u0411\u0420\u0415\u0412\u0418\u0410\u0422\u0423\u0420\u0410"), React.createElement("input", {
    defaultValue: proj.abbr || "",
    style: iSt,
    onBlur: e => {
      if (e.target.value.trim() !== (proj.abbr || "")) upProj({
        abbr: e.target.value.trim()
      });
    }
  })), React.createElement("div", null, React.createElement("label", {
    style: lSt
  }, "\u0421\u0415\u0417\u041E\u041D"), React.createElement("input", {
    defaultValue: proj.season || "",
    style: iSt,
    onBlur: e => {
      if (e.target.value.trim() !== (proj.season || "")) upProj({
        season: e.target.value.trim()
      });
    }
  }))), React.createElement("div", null, React.createElement("label", {
    style: lSt
  }, "\u041E\u041F\u0418\u0421\u0410\u041D\u0418\u0415"), React.createElement("textarea", {
    defaultValue: proj.description || "",
    rows: 3,
    style: {
      ...iSt,
      resize: "vertical"
    },
    onBlur: e => {
      if (e.target.value !== (proj.description || "")) upProj({
        description: e.target.value
      });
    }
  })), React.createElement("div", null, React.createElement("label", {
    style: lSt
  }, PROJECT_VISUAL_TEXT.preview.toUpperCase()), React.createElement(ProjectVisualPicker, {
    project: proj,
    onColor: c => upProj({
      color: c
    }),
    onVisual: visual => upDoss("visual", visual)
  })), React.createElement("div", null, React.createElement("label", {
    style: lSt
  }, "\u041c\u0415\u041d\u0415\u0414\u0416\u0415\u0420\u042b"), canManageProjectAssignments ? React.createElement(ManagerPicker, {
    value: proj.managers || [],
    options: (data.people || []).filter(p => p.active !== false && p.roles && (p.roles.includes("\u043c\u043d\u0434\u0436\u0440") || p.roles.includes("\u043f\u0440\u043e\u0434\u044e\u0441\u0435\u0440"))),
    onChange: v => upProj({
      managers: v
    })
  }) : React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#94a3b8",
      padding: "7px 10px",
      background: "#0f172a",
      border: "1px solid #334155",
      borderRadius: 10
    }
  }, (proj.managers || []).map(m => m.name || m.uid || m).filter(Boolean).join(", ") || "-")), React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#475569",
      letterSpacing: 1
    }
  }, "\u2014\u2014\u2014 \u041A\u041B\u042E\u0427\u0415\u0412\u042B\u0415 \u0421\u041E\u0411\u042B\u0422\u0418\u042F \u2014\u2014\u2014"), SERIES_MILESTONES.filter(m => m.configurable).map(base => {
    const meta = getProjectMilestoneMeta(proj, base.key, base);
    function setMeta(ch) {
      upDoss("milestoneMeta", {
        ...(dossier.milestoneMeta || {}),
        [base.key]: {
          ...((dossier.milestoneMeta || {})[base.key] || {}),
          ...ch
        }
      });
    }
    return React.createElement("div", {
      key: base.key,
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 44px",
        gap: 8,
        alignItems: "end"
      }
    }, React.createElement("div", null, React.createElement("label", {
      style: lSt
    }, base.label), React.createElement("input", {
      value: meta.label,
      style: iSt,
      onChange: e => setMeta({
        label: e.target.value,
        abbr: e.target.value
      })
    })), React.createElement("input", {
      type: "color",
      value: meta.color,
      onChange: e => setMeta({
        color: e.target.value
      }),
      style: {
        width: 40,
        height: 36,
        border: "none",
        background: "none",
        cursor: "pointer",
        padding: 2,
        borderRadius: 4
      }
    }));
  }), React.createElement("div", null, React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6
    }
  }, React.createElement("label", {
    style: lSt
  }, "\u0414\u041E\u041F. \u0422\u041E\u0427\u041A\u0418"), (dossier.customMilestones || []).length < CUSTOM_MILESTONE_LIMIT && React.createElement(Btn, {
    small: true,
    variant: "ghost",
    onClick: () => upDoss("customMilestones", [...(dossier.customMilestones || []), {
      id: "m" + Date.now(),
      label: "Контрольная точка",
      color: "#f59e0b"
    }])
  }, "+ \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C")), (dossier.customMilestones || []).map((m, idx) => {
    const items = dossier.customMilestones || [];
    function upd(ch) {
      const next = [...items];
      next[idx] = {
        ...next[idx],
        ...ch
      };
      upDoss("customMilestones", next);
    }
    return React.createElement("div", {
      key: m.id,
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 44px auto",
        gap: 8,
        alignItems: "center",
        marginBottom: 6
      }
    }, React.createElement("input", {
      value: m.label || "",
      style: iSt,
      onChange: e => upd({
        label: e.target.value
      })
    }), React.createElement("input", {
      type: "color",
      value: m.color || "#f59e0b",
      onChange: e => upd({
        color: e.target.value
      }),
      style: {
        width: 40,
        height: 36,
        border: "none",
        background: "none",
        cursor: "pointer",
        padding: 2,
        borderRadius: 4
      }
    }), React.createElement("button", {
      onClick: () => upDoss("customMilestones", items.filter((_, i) => i !== idx)),
      style: {
        background: "none",
        border: "none",
        color: "#ef4444",
        cursor: "pointer",
        fontSize: 18
      }
    }, "\xD7"));
  })))), React.createElement("div", {
    style: {
      background: "rgba(30,41,59,.72)",
      borderRadius: 16,
      padding: 20,
      border: "1px solid rgba(148,163,184,.18)"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: "#64748b",
      marginBottom: 10,
      letterSpacing: 1
    }
  }, "\u0421\u0415\u0420\u0418\u0418"), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, projSeries.map(ser => {
    const todayStr = formatDate(new Date());
    const sTasks = pTasks.filter(t => (t.seriesId === ser.id || t.series === ser.name) && t.day === todayStr);
    const maxIdx = Math.max(...sTasks.map(t => stages.findIndex(s => s.id === t.status)).filter(x => x >= 0), -1);
    const autoStage = maxIdx >= 0 ? stages[maxIdx] : null;
    const autoGroupId = (autoStage === null || autoStage === void 0 ? void 0 : autoStage.groupId) || "";
    const autoGroup = autoGroupId ? groupMap[autoGroupId] : null;
    const autoGroupOrder = (autoGroup === null || autoGroup === void 0 ? void 0 : autoGroup.order) || 0;
    const manualGroupId = ser.manualStatus || "";
    const manualGroup = manualGroupId ? groupMap[manualGroupId] : null;
    const displayGroup = manualGroupId ? manualGroup : autoGroup;
    const isManual = !!manualGroupId;
    const bc = autoStage ? autoStage.color : proj.color;
    return React.createElement("div", {
      key: ser.id,
      onDoubleClick: () => onSeriesSelect && onSeriesSelect(ser.id),
      title: "\u0414\u0432\u043E\u0439\u043D\u043E\u0439 \u043A\u043B\u0438\u043A \u2014 \u043E\u0442\u043A\u0440\u044B\u0442\u044C \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0443 \u0441\u0435\u0440\u0438\u0438",
      style: {
        borderLeft: `3px solid ${bc}`,
        background: "#0f172a",
        cursor: "pointer",
        borderRadius: 10,
        padding: "8px 12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
    }, React.createElement("div", null, React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 13,
        display: "flex",
        alignItems: "center",
        gap: 5
      }
    }, ser.name, isManual && React.createElement("span", {
      title: "\u0420\u0443\u0447\u043D\u043E\u0439 \u0441\u0442\u0430\u0442\u0443\u0441",
      style: {
        fontSize: 9,
        color: "#f59e0b"
      }
    }), ser.delivered && React.createElement("span", {
      title: "\u0421\u0434\u0430\u043D\u0430",
      style: {
        fontSize: 9,
        color: "#22c55e"
      }
    }, "OK")), displayGroup && React.createElement("div", {
      style: {
        fontSize: 10,
        color: bc,
        marginTop: 2
      }
    }, displayGroup.label)), React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#475569"
      }
    }, sTasks.length, " \u0437\u0430\u0434\u0430\u0447"));
  }), projSeries.length === 0 && React.createElement("div", {
    style: {
      color: "#475569",
      fontSize: 13
    }
  }, "\u041D\u0435\u0442 \u0441\u0435\u0440\u0438\u0439")))), tab === "kpp" && (() => {
    const milestoneDefs = getProjectMilestoneDefinitions(proj);
    const stageRows = [...stageGroups].sort((a, b) => (b.order || 0) - (a.order || 0)).map(g => {
      const stg = stages.find(s => s.groupId === g.id);
      return {
        kind: "stage",
        id: g.id,
        label: g.label,
        color: (stg === null || stg === void 0 ? void 0 : stg.color) || proj.color,
        group: g
      };
    });
    const milestoneRows = milestoneDefs.map(def => ({
      kind: "milestone",
      id: def.key,
      label: def.label,
      color: def.color || proj.color,
      def
    }));
    const rows = [...stageRows, ...milestoneRows];
    function updateMilestone(ser, def, date) {
      upSer(ser.id, seriesMilestonePatch(ser, def, date));
    }
    return React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 12,
        color: "#64748b",
        fontWeight: 700
      }
    }, "\u041a\u041f\u041f: \u044d\u0442\u0430\u043f\u044b \u043f\u043e \u0444\u0430\u043a\u0442\u0443 \u0441\u043c\u0435\u043d, \u043a\u043e\u043d\u0442\u0440\u043e\u043b\u044c\u043d\u044b\u0435 \u0442\u043e\u0447\u043a\u0438 \u0438\u0437 \u043a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u044f"), React.createElement(Btn, {
      variant: "primary",
      small: true,
      disabled: !canEditProject,
      onClick: () => canEditProject && setEditSeries({
        name: "",
        projectId,
        shootStart: "",
        shootEnd: "",
        syncStart: "",
        editStart: "",
        preOtkDate: "",
        otkDate: "",
        sendDate: "",
        airDate: "",
        airMode: "weekly",
        airDay: 1,
        airTime: "21:00"
      })
    }, "\u002b \u041d\u043e\u0432\u0430\u044f \u0441\u0435\u0440\u0438\u044f")), React.createElement("div", {
      style: {
        background: "rgba(30,41,59,.72)",
        borderRadius: 16,
        border: "1px solid rgba(148,163,184,.18)",
        overflowX: "auto"
      }
    }, projSeries.length === 0 ? React.createElement("div", {
      style: {
        padding: 32,
        color: "#64748b",
        fontSize: 14,
        textAlign: "center"
      }
    }, "\u041d\u0435\u0442 \u0441\u0435\u0440\u0438\u0439. \u041d\u0430\u0436\u043c\u0438\u0442\u0435 \u00ab+ \u041d\u043e\u0432\u0430\u044f \u0441\u0435\u0440\u0438\u044f\u00bb") : React.createElement("table", {
      style: {
        borderCollapse: "separate",
        borderSpacing: 0,
        minWidth: Math.max(720, 220 + projSeries.length * 190)
      }
    }, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", {
      style: {
        padding: "9px 14px",
        fontSize: 11,
        color: "#94a3b8",
        letterSpacing: 1,
        textAlign: "left",
        borderBottom: "1px solid #334155",
        borderRight: "1px solid #334155",
        position: "sticky",
        left: 0,
        background: "#1e293b",
        zIndex: 3,
        whiteSpace: "nowrap",
        minWidth: 220
      }
    }, "\u042d\u0422\u0410\u041f / \u041a\u041e\u041d\u0422\u0420\u041e\u041b\u042c\u041d\u0410\u042f \u0422\u041e\u0427\u041a\u0410"), projSeries.map(ser => React.createElement("th", {
      key: ser.id,
      draggable: true,
      onDragStart: e => {
        kppDragRef.current = ser.id;
        e.dataTransfer.effectAllowed = "move";
      },
      onDragOver: e => e.preventDefault(),
      onDrop: e => {
        e.preventDefault();
        const srcId = kppDragRef.current;
        if (!srcId || srcId === ser.id) return;
        const arr = [...projSeries];
        const si = arr.findIndex(s => s.id === srcId),
          ti = arr.findIndex(s => s.id === ser.id);
        if (si === -1 || ti === -1) return;
        const item = arr.splice(si, 1)[0];
        arr.splice(ti, 0, item);
        const others = (data.series || []).filter(s => s.projectId !== projectId);
        onBatchUpdate({
          series: [...others, ...arr.map((s, i) => ({
            ...s,
            order: i
          }))],
          tasks: data.tasks
        });
        kppDragRef.current = null;
      },
      onDragEnd: () => {
        kppDragRef.current = null;
      },
      style: {
        padding: "8px 10px",
        fontSize: 12,
        fontWeight: 800,
        textAlign: "left",
        borderBottom: "1px solid #334155",
        borderLeft: "1px solid #334155",
        minWidth: 190,
        maxWidth: 220,
        background: "rgba(15,23,42,.48)",
        cursor: "grab"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        minWidth: 0
      }
    }, React.createElement("span", {
      style: {
        fontSize: 10,
        color: "#64748b",
        flexShrink: 0
      }
    }, "::"), React.createElement("span", {
      onDoubleClick: () => onSeriesSelect && onSeriesSelect(ser.id),
      title: ser.name,
      style: {
        cursor: "pointer",
        flex: "1 1 0",
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        color: ser.delivered ? "#22c55e" : "#e2e8f0"
      }
    }, ser.name, ser.delivered ? " \u00b7 \u0441\u0434\u0430\u043d\u0430" : ""), React.createElement("button", {
      title: "Edit",
      disabled: !canEditProject,
      onClick: () => canEditProject && setEditSeries(ser),
      style: {
        background: "none",
        border: "none",
        color: "#64748b",
        cursor: "pointer",
        fontSize: 11,
        padding: "0 2px",
        lineHeight: 1,
        flexShrink: 0
      }
    }, "\u0438\u0437\u043c"), React.createElement("button", {
      title: "Delete",
      disabled: !canDeleteStructure,
      onClick: () => canDeleteStructure && deleteSeries(ser.id),
      style: {
        background: "none",
        border: "none",
        color: "#ef444466",
        cursor: "pointer",
        fontSize: 14,
        padding: "0 2px",
        lineHeight: 1,
        flexShrink: 0
      }
    }, "x")))))), React.createElement("tbody", null, rows.map((row, idx) => React.createElement("tr", {
      key: row.kind + "-" + row.id
    }, React.createElement("td", {
      style: {
        padding: "9px 12px",
        position: "sticky",
        left: 0,
        zIndex: 2,
        background: "#1e293b",
        borderLeft: "4px solid " + row.color,
        borderRight: "1px solid #334155",
        borderBottom: "1px solid rgba(51,65,85,.72)",
        whiteSpace: "nowrap"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 900,
        color: row.kind === "milestone" ? "#fbbf24" : "#93c5fd",
        background: "rgba(15,23,42,.72)",
        border: "1px solid rgba(148,163,184,.18)",
        borderRadius: 999,
        padding: "2px 7px"
      }
    }, row.kind === "milestone" ? "\u041a\u0422" : "\u042d\u0422\u0410\u041f"), React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 900,
        color: row.kind === "milestone" ? row.color : "#e2e8f0"
      }
    }, row.label))), projSeries.map(ser => {
      if (row.kind === "milestone") {
        const val = getSeriesMilestoneValue(ser, row.def);
        return React.createElement("td", {
          key: ser.id,
          style: {
            padding: "7px 8px",
            borderLeft: "1px solid #0f172a",
            borderBottom: "1px solid rgba(51,65,85,.48)",
            background: val ? row.color + "14" : "transparent"
          }
        }, React.createElement("input", {
          type: "date",
          value: toInput(val),
          disabled: !canEditProject,
          onChange: e => updateMilestone(ser, row.def, fromInput(e.target.value)),
          style: {
            background: "rgba(8,13,26,.68)",
            border: "1px solid rgba(148,163,184,.22)",
            borderRadius: 9,
            color: val ? "#e2e8f0" : "#64748b",
            fontSize: 12,
            outline: "none",
            width: "100%",
            minWidth: 130,
            cursor: canEditProject ? "pointer" : "default",
            fontFamily: "inherit",
            padding: "5px 8px"
          }
        }));
      }
      const actual = getSeriesGroupTaskRange(ser, row.group, stages, data.tasks);
      const manual = (ser.stageRanges || {})[row.group.id] || {};
      function setManual(field, date) {
        const old = ser.stageRanges || {};
        const next = {
          ...old,
          [row.group.id]: {
            ...(old[row.group.id] || {}),
            [field]: date
          }
        };
        upSer(ser.id, {
          stageRanges: next
        });
      }
      return React.createElement("td", {
        key: ser.id,
        style: {
          padding: "7px 8px",
          borderLeft: "1px solid #0f172a",
          borderBottom: "1px solid rgba(51,65,85,.48)",
          background: actual.count ? `linear-gradient(135deg, ${row.color}22, rgba(15,23,42,.72))` : "transparent",
          boxShadow: actual.count ? `inset 3px 0 0 ${row.color}` : "none",
          verticalAlign: "top"
        }
      }, React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 6,
          minWidth: 170
        }
      }, actual.count ? React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "6px 8px",
          borderRadius: 10,
          background: "rgba(8,13,26,.50)",
          border: `1px solid ${row.color}66`
        }
      }, React.createElement("span", {
        style: {
          width: 18,
          height: 18,
          borderRadius: "50%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: row.color,
          color: "#06111f",
          fontSize: 10,
          fontWeight: 950,
          flexShrink: 0
        }
      }, "OK"), React.createElement("div", {
        style: {
          minWidth: 0
        }
      }, React.createElement("div", {
        style: {
          fontSize: 11,
          color: "#f8fafc",
          fontWeight: 950,
          whiteSpace: "nowrap"
        }
      }, "\u042d\u0442\u0430\u043f \u043f\u0440\u043e\u0441\u0442\u0430\u0432\u043b\u0435\u043d"), React.createElement("div", {
        style: {
          fontSize: 10,
          color: "#cbd5e1",
          fontWeight: 800,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }
      }, actual.from, actual.to && actual.to !== actual.from ? " - " + actual.to : "", " / ", actual.count, " ", "\u0441\u043c\u0435\u043d"))) : React.createElement("div", {
        style: {
          fontSize: 10,
          color: "#475569",
          fontWeight: 800,
          whiteSpace: "nowrap",
          padding: "2px 0"
        }
      }, "\u0424\u0430\u043a\u0442\u0430 \u043d\u0435\u0442"), React.createElement("div", {
        style: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 5,
          opacity: actual.count ? 0.72 : 1
        }
      }, React.createElement("input", {
        type: "date",
        value: toInput(manual.from || ""),
        disabled: !canEditProject,
        title: "\u041f\u043b\u0430\u043d/\u0440\u0443\u0447\u043d\u043e\u0435 \u043d\u0430\u0447\u0430\u043b\u043e",
        onChange: e => setManual("from", fromInput(e.target.value)),
        style: {
          background: "rgba(8,13,26,.52)",
          border: "1px solid rgba(148,163,184,.16)",
          borderRadius: 8,
          color: manual.from ? "#e2e8f0" : "#64748b",
          fontSize: 11,
          padding: "4px 5px",
          minWidth: 0
        }
      }), React.createElement("input", {
        type: "date",
        value: toInput(manual.to || ""),
        disabled: !canEditProject,
        title: "\u041f\u043b\u0430\u043d/\u0440\u0443\u0447\u043d\u043e\u0439 \u043a\u043e\u043d\u0435\u0446",
        onChange: e => setManual("to", fromInput(e.target.value)),
        style: {
          background: "rgba(8,13,26,.52)",
          border: "1px solid rgba(148,163,184,.16)",
          borderRadius: 8,
          color: manual.to ? "#e2e8f0" : "#64748b",
          fontSize: 11,
          padding: "4px 5px",
          minWidth: 0
        }
      }))));
    })))))));
  })(), tab === "info" && React.createElement("div", {
    style: {
      background: "rgba(30,41,59,.72)",
      borderRadius: 16,
      padding: 20,
      border: "1px solid rgba(148,163,184,.18)"
    }
  }, React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, [["ТИП КОНТЕНТА", "type"], ["ХРОНОМЕТРАЖ", "duration"], ["ПУТЬ НА СЕРВЕРЕ", "serverPath"], ["ПРИНИМАЮЩИЙ ПРОДЮСЕР", "receivingProducer"], ["ТЕЛЕФОН ПР. ПРОДЮСЕРА", "receivingProducerPhone"], ["ТЕЛЕФОН МЕНЕДЖЕРА", "managerPhone"], ["КОЛ-ВО ВЕРСИЙ", "versions"], ["РЕКЛАМНЫЙ ХРОНОМЕТРАЖ", "adRules"], ["РАСПИСАНИЕ ЭФИРА", "airSchedule"], ["СПОСОБ ДОСТАВКИ", "deliveryMethod"]].map(_ref105 => {
    let _ref106 = _slicedToArray(_ref105, 2),
      l = _ref106[0],
      f = _ref106[1];
    return React.createElement("div", {
      key: f
    }, React.createElement("label", {
      style: lSt
    }, l), React.createElement("input", {
      defaultValue: info[f] || "",
      style: iSt,
      onBlur: e => {
        if (e.target.value !== (info[f] || "")) upInfo(f, e.target.value);
      }
    }));
  }), React.createElement("div", {
    style: {
      gridColumn: "1 / -1"
    }
  }, React.createElement("label", {
    style: lSt
  }, "\u0422\u0415\u0425\u041D\u0418\u0427\u0415\u0421\u041A\u0418\u0415 \u0422\u0420\u0415\u0411\u041E\u0412\u0410\u041D\u0418\u042F"), React.createElement("textarea", {
    defaultValue: info.technicalRequirements || "",
    rows: 4,
    style: {
      ...iSt,
      resize: "vertical"
    },
    onBlur: e => {
      if (e.target.value !== (info.technicalRequirements || "")) upInfo("technicalRequirements", e.target.value);
    }
  })))), tab === "transits" && React.createElement("div", {
    style: {
      background: "rgba(30,41,59,.72)",
      borderRadius: 16,
      padding: 20,
      border: "1px solid rgba(148,163,184,.18)",
      overflowX: "auto"
    }
  }, projSeries.length === 0 ? React.createElement("div", {
    style: {
      color: "#475569",
      fontSize: 14
    }
  }, "\u041D\u0435\u0442 \u0441\u0435\u0440\u0438\u0439") : React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: 320
    }
  }, React.createElement("thead", null, React.createElement("tr", null, ["Серия", "Рекламный", "Безрекламный"].map((h, i) => React.createElement("th", {
    key: i,
    style: {
      textAlign: "left",
      padding: "6px 10px",
      fontSize: 11,
      color: "#64748b",
      letterSpacing: 1,
      borderBottom: "1px solid #334155",
      whiteSpace: "nowrap"
    }
  }, h)))), React.createElement("tbody", null, projSeries.map(ser => React.createElement("tr", {
    key: ser.id,
    style: {
      borderBottom: "1px solid #1e293b"
    }
  }, React.createElement("td", {
    style: {
      padding: "6px 10px",
      fontWeight: 700,
      fontSize: 13,
      whiteSpace: "nowrap"
    }
  }, ser.name), React.createElement("td", {
    style: {
      padding: "4px 6px",
      minWidth: 200
    }
  }, React.createElement("input", {
    defaultValue: ser.transitCodeAd || "",
    style: {
      ...iSt,
      fontSize: 12,
      padding: "4px 8px"
    },
    onBlur: e => {
      if (e.target.value !== (ser.transitCodeAd || "")) upSer(ser.id, {
        transitCodeAd: e.target.value
      });
    }
  })), React.createElement("td", {
    style: {
      padding: "4px 6px",
      minWidth: 200
    }
  }, React.createElement("input", {
    defaultValue: ser.transitCodeNoAd || "",
    style: {
      ...iSt,
      fontSize: 12,
      padding: "4px 8px"
    },
    onBlur: e => {
      if (e.target.value !== (ser.transitCodeNoAd || "")) upSer(ser.id, {
        transitCodeNoAd: e.target.value
      });
    }
  }))))))), tab === "access" && React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, React.createElement("div", {
    style: {
      background: "rgba(30,41,59,.72)",
      borderRadius: 16,
      padding: 20,
      border: "1px solid rgba(245,158,11,.35)"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: "#fbbf24",
      marginBottom: 8
    }
  }, "\u0420\u0435\u043A\u0432\u0438\u0437\u0438\u0442\u044B \u0434\u043E\u0441\u0442\u0443\u043F\u0430 \u0441\u043A\u0440\u044B\u0442\u044B"), React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#94a3b8",
      lineHeight: 1.6
    }
  }, "\u0421\u043E\u0445\u0440\u0430\u043D\u0451\u043D\u043D\u044B\u0435 \u0440\u0430\u043D\u0435\u0435 \u043B\u043E\u0433\u0438\u043D\u044B, \u043F\u0430\u0440\u043E\u043B\u0438 \u0438 \u0442\u043E\u043A\u0435\u043D\u044B \u043D\u0435 \u043F\u0435\u0440\u0435\u0434\u0430\u044E\u0442\u0441\u044F \u0432 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435. \u0414\u043E \u0441\u043E\u0433\u043B\u0430\u0441\u043E\u0432\u0430\u043D\u0438\u044F \u043F\u0435\u0440\u0435\u043D\u043E\u0441\u0430 \u043E\u043D\u0438 \u043E\u0441\u0442\u0430\u044E\u0442\u0441\u044F \u0432 \u0438\u0441\u0445\u043E\u0434\u043D\u043E\u0439 \u0431\u0430\u0437\u0435 \u0431\u0435\u0437 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0439."), (dossier.accesses || []).length > 0 && React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 12
    }
  }, (dossier.accesses || []).map((item, idx) => React.createElement("span", {
    key: item.id || idx,
    style: {
      fontSize: 11,
      color: "#cbd5e1",
      background: "#0f172a",
      border: "1px solid #334155",
      borderRadius: 999,
      padding: "5px 9px"
    }
  }, item.label || `Запись ${idx + 1}`, item.credentialsStored ? " · сохранено в защищённом контуре" : "")))), [{
    key: "paths",
    title: "Пути на сервере",
    fields: [{
      k: "label",
      ph: "Название"
    }, {
      k: "path",
      ph: "Путь"
    }],
    empty: {
      label: "",
      path: ""
    }
  }, {
    key: "links",
    title: "Ссылки",
    fields: [{
      k: "label",
      ph: "Название"
    }, {
      k: "url",
      ph: "URL"
    }],
    empty: {
      label: "",
      url: ""
    }
  }].map(_ref107 => {
    let key = _ref107.key,
      title = _ref107.title,
      fields = _ref107.fields,
      empty = _ref107.empty;
    const items = dossier[key] || [];
    return React.createElement("div", {
      key: key,
      style: {
        background: "rgba(30,41,59,.72)",
        borderRadius: 16,
        padding: 20,
        border: "1px solid rgba(148,163,184,.18)"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12
      }
    }, React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: "#94a3b8"
      }
    }, title), React.createElement(Btn, {
      small: true,
      variant: "default",
      onClick: () => upDoss(key, [...items, {
        ...empty
      }])
    }, "+ \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C")), items.length === 0 && React.createElement("div", {
      style: {
        color: "#475569",
        fontSize: 12
      }
    }, "\u041F\u0443\u0441\u0442\u043E"), items.map((item, idx) => React.createElement("div", {
      key: idx,
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 8,
        alignItems: "center"
      }
    }, fields.map(_ref108 => {
      let k = _ref108.k,
        ph = _ref108.ph;
      return React.createElement("div", {
        key: k,
        style: {
          flex: 1,
          position: "relative"
        }
      }, React.createElement("input", {
        type: "text",
        defaultValue: item[k] || "",
        placeholder: ph,
        style: iSt,
        onBlur: e => {
          if (e.target.value !== (item[k] || "")) {
            const ni = [...items];
            ni[idx] = {
              ...ni[idx],
              [k]: e.target.value
            };
            upDoss(key, ni);
          }
        }
      }));
    }), React.createElement("button", {
      onClick: () => upDoss(key, items.filter((_, i) => i !== idx)),
      style: {
        background: "none",
        border: "none",
        color: "#ef4444",
        cursor: "pointer",
        fontSize: 18,
        padding: "0 4px",
        flexShrink: 0,
        lineHeight: 1
      }
    }, "\xD7"))));
  })), tab === "notes" && React.createElement("div", {
    style: {
      background: "rgba(30,41,59,.72)",
      borderRadius: 16,
      padding: 20,
      border: "1px solid rgba(148,163,184,.18)"
    }
  }, React.createElement("label", {
    style: lSt
  }, "\u0417\u0410\u041C\u0415\u0422\u041A\u0418"), React.createElement("textarea", {
    defaultValue: dossier.notes || "",
    rows: 14,
    style: {
      ...iSt,
      resize: "vertical"
    },
    onBlur: e => {
      if (e.target.value !== (dossier.notes || "")) upDoss("notes", e.target.value);
    }
  })), editSeries && React.createElement(SeriesModal, {
    series: editSeries,
    project: proj,
    data: data,
    templates: data.templates || [],
    onSave: saveSeries,
    onClose: () => setEditSeries(null)
  }));
}
function CommandPalette(_ref109) {
  let data = _ref109.data,
    onClose = _ref109.onClose,
    onNavigate = _ref109.onNavigate,
    onSetView = _ref109.onSetView,
    onSetGanttDay = _ref109.onSetGanttDay;
  const _useState185 = useState(""),
    _useState186 = _slicedToArray(_useState185, 2),
    query = _useState186[0],
    setQuery = _useState186[1];
  const _useState187 = useState(0),
    _useState188 = _slicedToArray(_useState187, 2),
    selIdx = _useState188[0],
    setSelIdx = _useState188[1];
  const inputRef = useRef(null);
  const listRef = useRef(null);
  useEffect(() => {
    var _inputRef$current;
    (_inputRef$current = inputRef.current) === null || _inputRef$current === void 0 || _inputRef$current.focus();
  }, []);
  useEffect(() => {
    setSelIdx(0);
  }, [query]);
  const NAV_CMDS = [{
    id: "today",
    label: "Сегодня",
    sub: "расписание на сегодня",
    icon: "📅"
  }, {
    id: "gantt",
    label: "Гант",
    sub: "диаграмма Ганта",
    icon: "📊"
  }, {
    id: "calendar",
    label: "Календарь",
    sub: "календарный вид",
    icon: "🗓"
  }, {
    id: "projects",
    label: "Проекты",
    sub: "список проектов",
    icon: "📁"
  }, {
    id: "people",
    label: "По людям",
    sub: "нагрузка людей",
    icon: "👥"
  }, {
    id: "days",
    label: "\u041d\u0415\u0414\u0415\u041b\u042f",
    sub: "\u043d\u0435\u0434\u0435\u043b\u044c\u043d\u044b\u0439 \u0432\u0438\u0434",
    icon: ""
  }, {
    id: "analytics",
    label: "Аналитика",
    sub: "статистика и отчёты",
    icon: "📈"
  }, {
    id: "directory",
    label: "Настройки",
    sub: "этапы, роли, праздники",
    icon: "⚙"
  }];
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const words = q.split(/\s+/);
    const score = text => {
      const t = (text || "").toLowerCase();
      if (!words.every(w => t.includes(w))) return 0;
      if (t.startsWith(q)) return 3;
      if (t.includes(q)) return 2;
      return 1;
    };
    const CREATE_TRIGGERS = ["создать", "создат", "добавить", "новый", "новая", "новое", "новую"];
    const isCreate = words.some(w => CREATE_TRIGGERS.some(ct => ct.startsWith(w) || w === ct));
    const items = [];
    if (isCreate) {
      const isSmen = words.some(w => ["смену", "смены", "смен", "задачу", "задач", "задачи", "шифт"].includes(w));
      const isProj = words.some(w => ["проект", "проекта", "проекты"].includes(w));
      const isSer = words.some(w => ["серию", "серии", "серий", "серия"].includes(w));
      const parsePrefill = () => {
        const today = new Date();
        const dateMap = {
          "сегодня": 0,
          "завтра": 1,
          "послезавтра": 2
        };
        let day = null,
          stageId = null,
          projectId = null;
        const STAGES = data.stages || DEFAULT_STAGES;
        words.forEach(w => {
          if (dateMap[w] !== undefined) {
            const d = new Date(today);
            d.setDate(d.getDate() + dateMap[w]);
            day = `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
          }
          const dm = w.match(/^(\d{1,2})\.(\d{2})$/);
          if (dm) day = `${dm[1].padStart(2, "0")}.${dm[2]}.${today.getFullYear()}`;
          STAGES.forEach(s => {
            const sl = s.label.toLowerCase();
            if (sl.includes(w) || w.includes(sl.slice(0, 4)) || s.id.includes(w)) stageId = s.id;
          });
          (data.projects || []).forEach(p => {
            const pl = (p.name || '').toLowerCase(),
              al = (p.abbr || "").toLowerCase();
            if (pl.includes(w) || al === w || w.includes(al)) projectId = p.id;
          });
        });
        return {
          day,
          stageId,
          projectId
        };
      };
      if (isSmen || !isProj && !isSer && words.length > 1) {
        const pf = parsePrefill();
        const proj = pf.projectId ? (data.projects || []).find(p => p.id === pf.projectId) : null;
        const stg = (data.stages || DEFAULT_STAGES).find(s => s.id === pf.stageId);
        const hints = [stg === null || stg === void 0 ? void 0 : stg.label, proj === null || proj === void 0 ? void 0 : proj.name, pf.day].filter(Boolean);
        items.push({
          type: "create",
          createType: "task",
          score: 20,
          icon: "",
          label: "Создать смену" + (hints.length ? ` — ${hints.join(", ")}` : ""),
          sub: "Открыть Гант с заполненной формой",
          prefill: {
            status: pf.stageId || "",
            project: pf.projectId || "",
            day: pf.day || ""
          }
        });
      }
      if (isProj || !isSmen) {
        items.push({
          type: "create",
          createType: "project",
          score: 18,
          icon: "📁",
          label: "Создать проект",
          sub: "Перейти в раздел Проекты → +"
        });
      }
      if (isSer || !isSmen) {
        items.push({
          type: "create",
          createType: "series",
          score: 17,
          icon: "🎬",
          label: "Создать серию",
          sub: "Перейти в Проекты и добавить серию"
        });
      }
    }
    NAV_CMDS.forEach(cmd => {
      const s = score(`${cmd.label} ${cmd.sub} ${cmd.id}`);
      if (s > 0) items.push({
        type: "nav",
        id: cmd.id,
        label: cmd.label,
        sub: cmd.sub,
        icon: cmd.icon,
        score: s + 10
      });
    });
    (data.projects || []).forEach(p => {
      const s = score(`${p.name} ${p.abbr || ""} ${p.description || ""}`);
      if (s > 0) items.push({
        type: "project",
        id: p.id,
        label: p.name,
        sub: [p.abbr, p.description].filter(Boolean).join(" · "),
        color: p.color,
        score: s
      });
    });
    (data.series || []).forEach(ser => {
      const proj = (data.projects || []).find(p => p.id === ser.projectId);
      const s = score(`${ser.name} ${(proj === null || proj === void 0 ? void 0 : proj.name) || ""} ${(proj === null || proj === void 0 ? void 0 : proj.abbr) || ""}`);
      if (s > 0) items.push({
        type: "series",
        id: ser.id,
        label: `${(proj === null || proj === void 0 ? void 0 : proj.abbr) || (proj === null || proj === void 0 ? void 0 : proj.name) || ""} · ${ser.name}`,
        sub: (proj === null || proj === void 0 ? void 0 : proj.name) || "",
        color: proj === null || proj === void 0 ? void 0 : proj.color,
        score: s
      });
    });
    (data.people || []).filter(p => p.active !== false).forEach(p => {
      const s = score(p.name);
      if (s > 0) items.push({
        type: "person",
        id: p.id,
        label: p.name,
        sub: (p.roles || []).join(", "),
        score: s
      });
    });
    const STAGES = data.stages || DEFAULT_STAGES;
    (data.tasks || []).filter(t => !t.cancelled).forEach(t => {
      const proj = (data.projects || []).find(p => p.id === t.project);
      const stg = STAGES.find(s => s.id === t.status);
      const searchText = [t.series, t.person, proj === null || proj === void 0 ? void 0 : proj.name, proj === null || proj === void 0 ? void 0 : proj.abbr, stg === null || stg === void 0 ? void 0 : stg.label, canSeeTaskNotes() ? t.note : "", t.day].filter(Boolean).join(" ");
      const s = score(searchText);
      if (s > 0) items.push({
        type: "task",
        id: t.id,
        task: t,
        label: `${t.series}${t.person ? " · " + t.person : ""}`,
        sub: [t.day, stg === null || stg === void 0 ? void 0 : stg.label, canSeeTaskNotes() ? t.note : ""].filter(Boolean).join(" · "),
        color: proj === null || proj === void 0 ? void 0 : proj.color,
        score: s
      });
    });
    const ORDER = {
      create: -1,
      nav: 0,
      project: 1,
      series: 2,
      person: 3,
      task: 4
    };
    return items.sort((a, b) => b.score - a.score || (ORDER[a.type] || 9) - (ORDER[b.type] || 9)).slice(0, 30);
  }, [query, data]);
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector("[data-sel=true]");
    el === null || el === void 0 || el.scrollIntoView({
      block: "nearest"
    });
  }, [selIdx]);
  function handleKey(e) {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelIdx(i => Math.min(i + 1, results.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelIdx(i => Math.max(i - 1, 0));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (results[selIdx]) pick(results[selIdx]);
    }
  }
  function pick(item) {
    if (item.type === "nav") {
      onSetView(item.id);
      onNavigate(null);
    } else if (item.type === "project") onNavigate({
      type: "project",
      id: item.id
    });else if (item.type === "series") onNavigate({
      type: "series",
      id: item.id
    });else if (item.type === "person") onNavigate({
      type: "person",
      id: item.id
    });else if (item.type === "task") {
      onSetGanttDay === null || onSetGanttDay === void 0 || onSetGanttDay(item.task.day);
      onSetView("gantt");
      onNavigate(null);
      setTimeout(() => window.dispatchEvent(new CustomEvent("gantt-new-task", {
        detail: item.task
      })), 80);
    } else if (item.type === "create") {
      if (item.createType === "task") {
        onSetView("gantt");
        onNavigate(null);
        setTimeout(() => window.dispatchEvent(new CustomEvent("gantt-new-task", {
          detail: item.prefill || {}
        })), 80);
      } else if (item.createType === "project" || item.createType === "series") {
        onSetView("projects");
        onNavigate(null);
      }
    }
    onClose();
  }
  const TYPE_LABELS = {
    create: "СОЗДАТЬ",
    nav: "НАВИГАЦИЯ",
    project: "ПРОЕКТЫ",
    series: "СЕРИИ",
    person: "ЛЮДИ",
    task: "ЗАДАЧИ"
  };
  const displayList = useMemo(() => {
    const out = [];
    let lastType = null;
    results.forEach((r, idx) => {
      if (r.type !== lastType) {
        out.push({
          isHeader: true,
          label: TYPE_LABELS[r.type] || r.type,
          key: "h-" + r.type
        });
        lastType = r.type;
      }
      out.push({
        ...r,
        flatIdx: idx
      });
    });
    return out;
  }, [results]);
  const kbd = {
    fontSize: 10,
    color: "#475569",
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: 4,
    padding: "1px 5px",
    fontFamily: "inherit",
    display: "inline-block"
  };
  return React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.72)",
      zIndex: 9999,
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      paddingTop: "8vh"
    },
    onClick: e => {
      if (e.target === e.currentTarget) onClose();
    }
  }, React.createElement("div", {
    style: {
      background: "rgba(30,41,59,.72)",
      border: "1px solid rgba(148,163,184,.18)",
      borderRadius: 12,
      width: "min(640px,92vw)",
      maxHeight: "70vh",
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 25px 60px rgba(0,0,0,0.65)",
      overflow: "hidden"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      padding: "12px 16px",
      borderBottom: "1px solid #334155",
      gap: 10
    }
  }, React.createElement("span", {
    style: {
      fontSize: 14,
      color: "#475569",
      flexShrink: 0
    }
  }, "\uD83D\uDD0D"), React.createElement("input", {
    ref: inputRef,
    value: query,
    onChange: e => setQuery(e.target.value),
    onKeyDown: handleKey,
    placeholder: "\u041F\u043E\u0438\u0441\u043A \u0438\u043B\u0438 \xAB\u0441\u043E\u0437\u0434\u0430\u0442\u044C \u0441\u043C\u0435\u043D\u0443 \u043C\u043E\u043D\u0442\u0430\u0436\u0430 \u0421\u0412 \u0437\u0430\u0432\u0442\u0440\u0430\xBB...",
    style: {
      flex: 1,
      background: "none",
      border: "none",
      outline: "none",
      fontSize: 15,
      color: "#e2e8f0",
      fontFamily: "inherit"
    }
  }), query && React.createElement("button", {
    onClick: () => setQuery(""),
    style: {
      background: "none",
      border: "none",
      color: "#475569",
      cursor: "pointer",
      fontSize: 13,
      padding: "2px 4px",
      lineHeight: 1
    }
  }, "\u2715"), React.createElement("span", {
    style: kbd
  }, "ESC")), React.createElement("div", {
    ref: listRef,
    style: {
      overflowY: "auto",
      flex: 1
    }
  }, !query.trim() && React.createElement("div", {
    style: {
      padding: "18px 16px"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#475569",
      marginBottom: 10
    }
  }, "\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u043F\u0440\u043E\u0435\u043A\u0442\u0430\u043C, \u0441\u0435\u0440\u0438\u044F\u043C \u0438 \u043B\u044E\u0434\u044F\u043C. \u0418\u043B\u0438 \u043D\u0430\u043F\u0438\u0448\u0438\u0442\u0435 \xAB\u0441\u043E\u0437\u0434\u0430\u0442\u044C \u0441\u043C\u0435\u043D\u0443 \u043C\u043E\u043D\u0442\u0430\u0436\u0430 \u0421\u0412 \u0437\u0430\u0432\u0442\u0440\u0430\xBB"), React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      flexWrap: "wrap",
      fontSize: 11,
      color: "#475569"
    }
  }, React.createElement("span", null, React.createElement("span", {
    style: kbd
  }, "\u2191"), " ", React.createElement("span", {
    style: kbd
  }, "\u2193"), " \u043D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F"), React.createElement("span", null, React.createElement("span", {
    style: kbd
  }, "Enter"), " \u043E\u0442\u043A\u0440\u044B\u0442\u044C"), React.createElement("span", null, React.createElement("span", {
    style: kbd
  }, "Esc"), " \u0437\u0430\u043A\u0440\u044B\u0442\u044C"), React.createElement("span", null, React.createElement("span", {
    style: kbd
  }, "Ctrl+K"), " \u043E\u0442\u043A\u0440\u044B\u0442\u044C"))), query.trim() && results.length === 0 && React.createElement("div", {
    style: {
      padding: "28px 16px",
      textAlign: "center",
      color: "#475569",
      fontSize: 13
    }
  }, "\u041D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E \u043F\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u0443 \xAB", query, "\xBB"), displayList.map((item, i) => {
    if (item.isHeader) return React.createElement("div", {
      key: item.key,
      style: {
        padding: "8px 16px 3px",
        fontSize: 10,
        color: "#334155",
        letterSpacing: 2,
        fontWeight: 700
      }
    }, item.label);
    const sel = item.flatIdx === selIdx;
    return React.createElement("div", {
      key: item.type + (item.id || item.createType || i),
      "data-sel": sel,
      onMouseEnter: () => setSelIdx(item.flatIdx),
      onClick: () => pick(item),
      style: {
        padding: "7px 16px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: sel ? "#334155" : "transparent"
      }
    }, item.icon ? React.createElement("span", {
      style: {
        fontSize: 13,
        width: 18,
        textAlign: "center",
        flexShrink: 0
      }
    }, item.icon) : item.color ? React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: item.color,
        flexShrink: 0,
        display: "inline-block"
      }
    }) : React.createElement("span", {
      style: {
        width: 18,
        fontSize: 11,
        color: "#475569",
        flexShrink: 0,
        textAlign: "center"
      }
    }, "\xB7"), React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: "#e2e8f0",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, item.label), item.sub && React.createElement("div", {
      style: {
        fontSize: 11,
        color: "#64748b",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, item.sub)), sel && React.createElement("span", {
      style: {
        fontSize: 11,
        color: "#475569",
        flexShrink: 0
      }
    }, "\u21B5"));
  })), results.length > 0 && React.createElement("div", {
    style: {
      padding: "5px 16px",
      borderTop: "1px solid #1e293b",
      fontSize: 10,
      color: "#334155"
    }
  }, "\u041D\u0430\u0439\u0434\u0435\u043D\u043E: ", results.length)));
}
const SOFT_DELETE_KEYS = ["tasks", "projects", "series", "people", "personAbsences"];
async function doLogin(login, password) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      login,
      password
    })
  });
  const data = await res.json();
  setCsrfToken(data.csrfToken);
  return data;
}
async function doLogout() {
  await csrfFetch("/api/auth/logout", {
    method: "POST",
    credentials: "include"
  });
  setCsrfToken("");
}
function FlipUnit(_ref110) {
  let digit = _ref110.digit;
  const _React$useState3 = React.useState(false),
    _React$useState4 = _slicedToArray(_React$useState3, 2),
    rolling = _React$useState4[0],
    setRolling = _React$useState4[1];
  const curRef = React.useRef(digit);
  React.useEffect(() => {
    if (curRef.current !== digit) {
      setRolling(true);
      const t = setTimeout(() => {
        curRef.current = digit;
        setRolling(false);
      }, 220);
      return () => clearTimeout(t);
    }
  }, [digit]);
  const d = rolling ? curRef.current : digit;
  return React.createElement("span", {
    style: {
      display: "inline-flex",
      flexDirection: "column",
      width: 16,
      height: 24,
      position: "relative",
      overflow: "hidden",
      textAlign: "center",
      flexShrink: 0,
      fontFamily: "'Space Grotesk','Courier New',monospace",
      fontWeight: 700,
      fontSize: 16,
      color: "#e2e8f0",
      background: "#1e293b",
      borderRadius: 3,
      border: "1px solid #334155",
      margin: "0 1px"
    }
  }, React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      transform: rolling ? "translateY(-50%)" : "translateY(0)",
      transition: rolling ? "transform 0.22s ease-out" : "none"
    }
  }, React.createElement("span", {
    style: {
      height: 24,
      lineHeight: "24px"
    }
  }, d), React.createElement("span", {
    style: {
      height: 24,
      lineHeight: "24px"
    }
  }, digit)));
}
function FlipClock() {
  const _React$useState5 = React.useState(new Date()),
    _React$useState6 = _slicedToArray(_React$useState5, 2),
    time = _React$useState6[0],
    setTime = _React$useState6[1];
  React.useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const h = time.getHours(),
    m = time.getMinutes(),
    s = time.getSeconds();
  const Sep = () => React.createElement("span", {
    style: {
      color: "#60a5fa",
      fontWeight: 700,
      fontSize: 14,
      lineHeight: '24px',
      margin: '0 1px',
      userSelect: 'none'
    }
  }, ":");
  return React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 0,
      flexShrink: 0,
      marginRight: 8
    }
  }, React.createElement(FlipUnit, {
    digit: Math.floor(h / 10)
  }), React.createElement(FlipUnit, {
    digit: h % 10
  }), React.createElement(Sep, null), React.createElement(FlipUnit, {
    digit: Math.floor(m / 10)
  }), React.createElement(FlipUnit, {
    digit: m % 10
  }), React.createElement(Sep, null), React.createElement(FlipUnit, {
    digit: Math.floor(s / 10)
  }), React.createElement(FlipUnit, {
    digit: s % 10
  }));
}
function LoginForm(_ref111) {
  let onLogin = _ref111.onLogin,
    error = _ref111.error;
  const _React$useState7 = React.useState(""),
    _React$useState8 = _slicedToArray(_React$useState7, 2),
    l = _React$useState8[0],
    setL = _React$useState8[1];
  const _React$useState9 = React.useState(""),
    _React$useState0 = _slicedToArray(_React$useState9, 2),
    p = _React$useState0[0],
    setP = _React$useState0[1];
  return React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#0f172a",
      color: "#e2e8f0"
    }
  }, React.createElement("div", {
    style: {
      background: "#1e293b",
      borderRadius: 12,
      padding: 32,
      width: 320,
      border: "1px solid #334155"
    }
  }, React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      letterSpacing: 1,
      textAlign: "center",
      marginBottom: 4
    }
  }, "\u041F\u041E\u0421\u0422 \u0422\u0420\u0415\u041A\u0415\u0420"), React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#475569",
      textAlign: "center",
      marginBottom: 24
    }
  }, "\u0412\u0445\u043E\u0434 \u0432 \u0441\u0438\u0441\u0442\u0435\u043C\u0443", React.createElement("div", {
    className: "ppt-author"
  }, "\u0421\u043E\u0437\u0434\u0430\u043D\u043E \u041C\u0430\u043A\u0441\u0438\u043C\u043E\u043C \u0415\u0444\u0440\u0435\u043C\u043E\u0432\u044B\u043C")), error && React.createElement("div", {
    style: {
      background: "#7f1d1d",
      color: "#fca5a5",
      padding: "6px 12px",
      borderRadius: 10,
      fontSize: 12,
      marginBottom: 12
    }
  }, error), React.createElement("input", {
    value: l,
    onChange: e => setL(e.target.value),
    placeholder: "\u041B\u043E\u0433\u0438\u043D",
    style: {
      width: "100%",
      padding: "8px 12px",
      background: "#0f172a",
      border: "1px solid #334155",
      borderRadius: 10,
      color: "#e2e8f0",
      fontSize: 14,
      fontFamily: "inherit",
      marginBottom: 8,
      boxSizing: "border-box"
    },
    onKeyDown: e => e.key === "Enter" && document.getElementById("login-pw").focus()
  }), React.createElement("input", {
    id: "login-pw",
    value: p,
    onChange: e => setP(e.target.value),
    type: "password",
    placeholder: "\u041F\u0430\u0440\u043E\u043B\u044C",
    style: {
      width: "100%",
      padding: "8px 12px",
      background: "#0f172a",
      border: "1px solid #334155",
      borderRadius: 10,
      color: "#e2e8f0",
      fontSize: 14,
      fontFamily: "inherit",
      marginBottom: 16,
      boxSizing: "border-box"
    },
    onKeyDown: e => {
      if (e.key === "Enter") onLogin(l, p);
    }
  }), React.createElement("button", {
    onClick: () => onLogin(l, p),
    style: {
      width: "100%",
      padding: "8px",
      background: "#2563eb",
      border: "none",
      borderRadius: 10,
      color: "#fff",
      fontSize: 14,
      cursor: "pointer",
      fontFamily: "inherit",
      fontWeight: 600
    }
  }, "\u0412\u043E\u0439\u0442\u0438")));
}
function UsersView(_ref112) {
  let user = _ref112.user,
    onUserUpdate = _ref112.onUserUpdate;
  const _React$useState1 = React.useState([]),
    _React$useState10 = _slicedToArray(_React$useState1, 2),
    users = _React$useState10[0],
    setUsers = _React$useState10[1];
  const _React$useState11 = React.useState(true),
    _React$useState12 = _slicedToArray(_React$useState11, 2),
    loading = _React$useState12[0],
    setLoading = _React$useState12[1];
  const _React$useState13 = React.useState(false),
    _React$useState14 = _slicedToArray(_React$useState13, 2),
    syncing = _React$useState14[0],
    setSyncing = _React$useState14[1];
  React.useEffect(() => {
    loadUsers();
  }, []);
  async function loadUsers() {
    try {
      const r = await fetch("/api/users", {
        credentials: "include"
      });
      if (r.ok) setUsers(await r.json());
    } catch (e) {}
    setLoading(false);
  }
  async function changeRole(id, role) {
    const r = await csrfFetch(`/api/users/${id}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        role
      })
    });
    if (r.ok) {
      const updated = await r.json();
      setUsers(u => u.map(x => x.id === id ? {
        ...x,
        role: updated.role
      } : x));
    }
  }
  async function syncAD() {
    setSyncing(true);
    try {
      await csrfFetch("/api/users/sync", {
        method: "POST",
        credentials: "include"
      });
      await loadUsers();
    } catch (e) {}
    setSyncing(false);
  }
  const _React$useState15 = React.useState(false),
    _React$useState16 = _slicedToArray(_React$useState15, 2),
    showDisabled = _React$useState16[0],
    setShowDisabled = _React$useState16[1];
  const filteredUsers = users.filter(u => showDisabled || u.ad_enabled !== false);
  const roleGroups = {};
  for (const u of filteredUsers) {
    const role = u.role || "viewer";
    if (!roleGroups[role]) roleGroups[role] = [];
    roleGroups[role].push(u);
  }
  const roleOrder = ["admin", "lead", "manager", "editor", "viewer", "na"];
  const roleLabels = {
    admin: "\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440\u044b",
    lead: "LEAD",
    manager: "\u041c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u044b",
    editor: "\u0420\u0435\u0434\u0430\u043a\u0442\u043e\u0440\u044b",
    viewer: "\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0449\u0438\u043a\u0438",
    na: "\u0411\u0435\u0437 \u0434\u043e\u0441\u0442\u0443\u043f\u0430 (NA)"
  };
  return React.createElement("div", {
    style: {
      padding: "20px 24px"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16
    }
  }, React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 16
    }
  }, "\uD83D\uDC65 \u0420\u043E\u043B\u0438"), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center"
    }
  }, React.createElement("span", {
    style: {
      fontSize: 11,
      color: "#64748b"
    }
  }, "\u0412\u0441\u0435\u0433\u043E: ", filteredUsers.length), React.createElement("button", {
    onClick: () => setShowDisabled(!showDisabled),
    style: {
      background: showDisabled ? "#1e3a5f" : "#1e293b",
      border: "1px solid #334155",
      borderRadius: 10,
      padding: "5px 12px",
      color: "#e2e8f0",
      fontSize: 12,
      cursor: "pointer",
      fontFamily: "inherit"
    }
  }, showDisabled ? "OK Все" : " Только активные"), RUNTIME.mode !== "local-demo" && React.createElement("button", {
    onClick: syncAD,
    disabled: syncing,
    style: {
      background: "rgba(30,41,59,.72)",
      border: "1px solid rgba(148,163,184,.18)",
      borderRadius: 10,
      padding: "5px 12px",
      color: "#e2e8f0",
      fontSize: 12,
      cursor: "pointer",
      fontFamily: "inherit"
    }
  }, syncing ? "⏳ Синхронизация..." : "🔄 Синхр. AD"))), loading ? React.createElement("div", {
    style: {
      color: "#475569"
    }
  }, "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...") : roleOrder.map(role => {
    const items = roleGroups[role] || [];
    if (!items.length) return null;
    return React.createElement("div", {
      key: role,
      style: {
        marginBottom: 20
      }
    }, React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: "#94a3b8",
        marginBottom: 8,
        borderBottom: "1px solid #1e293b",
        paddingBottom: 4
      }
    }, roleLabels[role] || role, " ", React.createElement("span", {
      style: {
        fontWeight: 400,
        fontSize: 11,
        color: "#475569"
      }
    }, "(", items.length, ")")), React.createElement("table", {
      style: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: 13
      }
    }, React.createElement("thead", null, React.createElement("tr", {
      style: {
        color: "#64748b",
        fontSize: 11
      }
    }, React.createElement("th", {
      style: {
        textAlign: "left",
        padding: "4px 8px",
        borderBottom: "1px solid #1e293b"
      }
    }, "\u0418\u043C\u044F"), React.createElement("th", {
      style: {
        textAlign: "left",
        padding: "4px 8px",
        borderBottom: "1px solid #1e293b"
      }
    }, "\u041B\u043E\u0433\u0438\u043D"), React.createElement("th", {
      style: {
        textAlign: "left",
        padding: "4px 8px",
        borderBottom: "1px solid #1e293b"
      }
    }, "\u0413\u0440\u0443\u043F\u043F\u044B AD"), React.createElement("th", {
      style: {
        textAlign: "left",
        padding: "4px 8px",
        borderBottom: "1px solid #1e293b"
      }
    }, "\u0420\u043E\u043B\u044C"), React.createElement("th", {
      style: {
        textAlign: "left",
        padding: "4px 8px",
        borderBottom: "1px solid #1e293b"
      }
    }, "\u0421\u0442\u0430\u0442\u0443\u0441"), React.createElement("th", {
      style: {
        textAlign: "left",
        padding: "4px 8px",
        borderBottom: "1px solid #1e293b"
      }
    }, "\u0412\u0445\u043E\u0434"))), React.createElement("tbody", null, items.map(u => React.createElement("tr", {
      key: u.id,
      style: {
        borderBottom: "1px solid #0f172a",
        opacity: u.ad_enabled === false ? 0.5 : 1
      }
    }, React.createElement("td", {
      style: {
        padding: "4px 8px"
      }
    }, u.display_name), React.createElement("td", {
      style: {
        padding: "4px 8px",
        color: "#64748b",
        fontSize: 11
      }
    }, u.sam_name), React.createElement("td", {
      style: {
        padding: "4px 8px",
        color: "#64748b",
        fontSize: 11
      }
    }, (u.ad_groups || []).slice(0, 3).join(", "), (u.ad_groups || []).length > 3 ? ", ..." : ""), React.createElement("td", {
      style: {
        padding: "4px 8px"
      }
    }, React.createElement("select", {
      value: u.role,
      onChange: e => changeRole(u.id, e.target.value),
      style: {
        background: "#0f172a",
        color: "#e2e8f0",
        border: "1px solid #334155",
        borderRadius: 4,
        padding: "2px 4px",
        fontSize: 12,
        fontFamily: "inherit"
      }
    }, React.createElement("option", {
      value: "admin"
    }, "admin"), React.createElement("option", {
      value: "lead"
    }, "lead"), React.createElement("option", {
      value: "manager"
    }, "manager"), React.createElement("option", {
      value: "editor"
    }, "editor"), React.createElement("option", {
      value: "viewer"
    }, "viewer"), React.createElement("option", {
      value: "na"
    }, "na (\u0431\u0435\u0437 \u0434\u043E\u0441\u0442\u0443\u043F\u0430)"))), React.createElement("td", {
      style: {
        padding: "4px 8px",
        fontSize: 11
      }
    }, React.createElement("span", {
      style: {
        color: u.ad_enabled === false ? "#ef4444" : "#22c55e"
      }
    }, u.ad_enabled === false ? "! Заблокирован" : "🟢 Активен")), React.createElement("td", {
      style: {
        padding: "4px 8px",
        fontSize: 11,
        color: "#475569"
      }
    }, u.last_login ? new Date(u.last_login).toLocaleDateString("ru-RU") : "—"))))));
  }));
}
const MT = {
  search: "\u041f\u043e\u0438\u0441\u043a",
  shifts: "\u0421\u043c\u0435\u043d\u044b",
  logout: "\u0412\u044b\u0439\u0442\u0438",
  today: "\u0421\u0435\u0433\u043e\u0434\u043d\u044f",
  tomorrow: "\u0417\u0430\u0432\u0442\u0440\u0430",
  calendar: "\u041a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u044c",
  projects: "\u041f\u0440\u043e\u0435\u043a\u0442\u044b",
  people: "\u041b\u044e\u0434\u0438",
  conflicts: "\u041a\u043e\u043d\u0444\u043b.",
  conflictsFull: "\u041a\u043e\u043d\u0444\u043b\u0438\u043a\u0442\u044b",
  birthdays: "\u0414\u043d\u0438 \u0440\u043e\u0436\u0434\u0435\u043d\u0438\u044f",
  birthdayShort: "\u0414\u0420",
  checkConflicts: "\u041d\u0443\u0436\u043d\u043e \u043f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c \u043a\u043e\u043d\u0444\u043b\u0438\u043a\u0442\u044b",
  noShifts: "\u0421\u043c\u0435\u043d \u043d\u0435\u0442",
  noEvents: "\u041d\u0430 \u044d\u0442\u043e\u0442 \u0434\u0435\u043d\u044c \u043d\u0438\u0447\u0435\u0433\u043e \u043d\u0435\u0442",
  series: "\u0441\u0435\u0440\u0438\u0439",
  todayLower: "\u0441\u0435\u0433\u043e\u0434\u043d\u044f",
  shiftShort: "\u0441\u043c\u0435\u043d",
  more: "\u0435\u0449\u0435",
  air: "\u042d\u0444\u0438\u0440",
  searchPerson: "\u041f\u043e\u0438\u0441\u043a \u0447\u0435\u043b\u043e\u0432\u0435\u043a\u0430",
  noPeople: "\u041d\u0438\u043a\u043e\u0433\u043e \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e",
  archive: "\u0430\u0440\u0445\u0438\u0432",
  close: "\u0417\u0430\u043a\u0440\u044b\u0442\u044c"
};
function useIsMobile() {
  let maxWidth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 760;
  const _useState189 = useState(() => typeof window !== "undefined" ? window.innerWidth <= maxWidth : false),
    _useState190 = _slicedToArray(_useState189, 2),
    isMobile = _useState190[0],
    setIsMobile = _useState190[1];
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener ? mq.addEventListener("change", onChange) : mq.addListener(onChange);
    return () => mq.removeEventListener ? mq.removeEventListener("change", onChange) : mq.removeListener(onChange);
  }, [maxWidth]);
  return isMobile;
}
function MobilePanel(_ref113) {
  let children = _ref113.children,
    style = _ref113.style,
    onClick = _ref113.onClick;
  return React.createElement("div", {
    className: "ppt-mobile-panel",
    onClick: onClick,
    style: style
  }, children);
}
function MobileTopbar(_ref114) {
  let user = _ref114.user,
    syncState = _ref114.syncState,
    onSearch = _ref114.onSearch,
    onLogout = _ref114.onLogout,
    onShifts = _ref114.onShifts;
  return React.createElement("div", {
    className: "ppt-mobile-topbar"
  }, React.createElement("div", null, React.createElement("div", {
    className: "ppt-title ppt-mobile-brand"
  }, "\u041F\u041E\u0421\u0422 \u0422\u0420\u0415\u041A\u0415\u0420"), React.createElement("div", {
    className: "ppt-author"
  }, "\u0421\u043E\u0437\u0434\u0430\u043D\u043E \u041C\u0430\u043A\u0441\u0438\u043C\u043E\u043C \u0415\u0444\u0440\u0435\u043C\u043E\u0432\u044B\u043C"), RUNTIME.label && React.createElement("div", {
    style: {
      fontSize: 10,
      color: "#fbbf24",
      fontWeight: 800,
      letterSpacing: .8,
      marginTop: 2
    }
  }, RUNTIME.label), React.createElement("div", {
    className: "ppt-mobile-subtitle"
  }, (user === null || user === void 0 ? void 0 : user.display_name) || "")), React.createElement("div", {
    className: "ppt-mobile-actions"
  }, React.createElement("button", {
    className: "ppt-mobile-icon-btn",
    onClick: onSearch,
    title: MT.search
  }, MT.search), React.createElement("button", {
    className: "ppt-mobile-icon-btn",
    onClick: onShifts,
    title: MT.shifts
  }, MT.shifts), React.createElement("span", {
    className: `ppt-mobile-sync ppt-mobile-sync-${syncState}`
  }, syncState === "error" ? "!" : syncState === "saving" ? "..." : "OK"), RUNTIME.mode !== "local-demo" && React.createElement("button", {
    className: "ppt-mobile-logout",
    onClick: onLogout
  }, MT.logout)));
}
function MobileBottomNav(_ref115) {
  let tabs = _ref115.tabs,
    view = _ref115.view,
    setView = _ref115.setView,
    navigate = _ref115.navigate;
  const allowed = new Set(["today", "calendar", "projects", "people", "conflicts"]);
  const items = tabs.filter(t => allowed.has(t.id)).slice(0, 5);
  const labels = {
    today: MT.today,
    calendar: MT.calendar,
    projects: MT.projects,
    people: MT.people,
    conflicts: MT.conflicts
  };
  return React.createElement("div", {
    className: "ppt-mobile-bottom-nav"
  }, items.map(t => React.createElement("button", {
    key: t.id,
    onClick: () => {
      setView(t.id);
      navigate(null);
    },
    className: view === t.id ? "active" : ""
  }, React.createElement("b", null, labels[t.id] || t.label))));
}
function groupMobileTasks(tasks) {
  const m = {};
  (tasks || []).forEach(t => {
    const key = [t.project || "", t.series || "", t.status || "", t.from || 0, t.to || 0].join("|");
    if (!m[key]) m[key] = {
      ...t,
      tasks: [],
      people: []
    };
    m[key].tasks.push(t);
    if (t.person && !m[key].people.includes(t.person)) m[key].people.push(t.person);
  });
  return Object.values(m).sort((a, b) => (Number(a.from) || 0) - (Number(b.from) || 0) || String(a.project || "").localeCompare(String(b.project || "")) || String(a.series || "").localeCompare(String(b.series || "")));
}
function MobileTaskGroup(_ref116) {
  let group = _ref116.group,
    data = _ref116.data,
    onOpenProject = _ref116.onOpenProject,
    onOpenPerson = _ref116.onOpenPerson;
  const proj = (data.projects || []).find(p => p.id === group.project);
  const people = group.people || [];
  return React.createElement("div", {
    className: "ppt-mobile-task ppt-mobile-task-group",
    style: {
      borderLeftColor: (proj === null || proj === void 0 ? void 0 : proj.color) || "#64748b"
    }
  }, React.createElement("div", {
    className: "ppt-mobile-task-time"
  }, fmtHour(group.from), "-", fmtHour(group.to)), React.createElement("div", {
    className: "ppt-mobile-task-main"
  }, React.createElement("button", {
    onClick: () => proj && onOpenProject(proj.id),
    className: "ppt-mobile-link"
  }, React.createElement(ProjectMark, {
    project: proj,
    size: 10
  }), React.createElement("span", null, (proj === null || proj === void 0 ? void 0 : proj.abbr) || (proj === null || proj === void 0 ? void 0 : proj.name) || group.project)), React.createElement("div", {
    className: "ppt-mobile-task-title"
  }, group.series || "-"), React.createElement("div", {
    className: "ppt-mobile-task-meta"
  }, React.createElement(StatusBadge, {
    s: group.status,
    small: true
  }), group.tasks.length > 1 && React.createElement("span", {
    className: "ppt-mobile-count"
  }, "x", group.tasks.length)), React.createElement("div", {
    className: "ppt-mobile-people-row"
  }, (people.length ? people : ["-"]).map(name => {
    const person = (data.people || []).find(p => p.name === name);
    return React.createElement("button", {
      key: name,
      onClick: () => person && onOpenPerson(person.id)
    }, name);
  }))));
}
function MobileTaskRow(_ref117) {
  let task = _ref117.task,
    data = _ref117.data,
    onOpenProject = _ref117.onOpenProject,
    onOpenPerson = _ref117.onOpenPerson;
  return React.createElement(MobileTaskGroup, {
    group: {
      ...task,
      tasks: [task],
      people: task.person ? [task.person] : []
    },
    data: data,
    onOpenProject: onOpenProject,
    onOpenPerson: onOpenPerson
  });
}
function mobileDayInfo(data, day) {
  const tasks = (data.tasks || []).filter(t => !t.deleted && !t.cancelled && t.day === day);
  const airs = [];
  (data.series || []).forEach(ser => {
    const proj = (data.projects || []).find(p => p.id === ser.projectId);
    if (!proj) return;
    if (generateSeriesAirDates(ser).includes(day)) airs.push({
      proj,
      ser
    });
  });
  const milestones = [];
  (data.series || []).forEach(ser => {
    const proj = (data.projects || []).find(p => p.id === ser.projectId);
    if (!proj) return;
    getSeriesMilestoneEvents(ser, proj).filter(m => m.date === day).forEach(m => milestones.push({
      ...m,
      proj,
      ser
    }));
  });
  const bdays = birthdayPeopleOnDate(data.people, day);
  return {
    day,
    tasks,
    airs,
    milestones,
    bdays,
    count: tasks.length + airs.length + milestones.length + bdays.length
  };
}
function MobileToday(_ref118) {
  let data = _ref118.data,
    conflictDetails = _ref118.conflictDetails,
    onOpenProject = _ref118.onOpenProject,
    onOpenPerson = _ref118.onOpenPerson,
    onConflicts = _ref118.onConflicts;
  const todayStr = formatDate(new Date());
  const tomorrowStr = addDays(todayStr, 1);
  const todayTasks = (data.tasks || []).filter(t => !t.deleted && !t.cancelled && t.day === todayStr).sort((a, b) => (Number(a.from) || 0) - (Number(b.from) || 0));
  const notifyConflicts = (conflictDetails || []).filter(d => d.notify !== false);
  const tomorrowTasks = (data.tasks || []).filter(t => !t.deleted && !t.cancelled && t.day === tomorrowStr).sort((a, b) => (Number(a.from) || 0) - (Number(b.from) || 0)).slice(0, 8);
  const birthdays = upcomingBirthdays(data.people, new Date(), 7);
  return React.createElement("div", {
    className: "ppt-mobile-stack"
  }, React.createElement("div", {
    className: "ppt-mobile-hero"
  }, React.createElement("div", null, React.createElement("span", null, MT.today), React.createElement("strong", null, todayTasks.length)), React.createElement("div", null, React.createElement("span", null, MT.conflictsFull), React.createElement("strong", {
    className: notifyConflicts.length ? "danger" : ""
  }, notifyConflicts.length)), React.createElement("div", null, React.createElement("span", null, MT.tomorrow), React.createElement("strong", null, tomorrowTasks.length))), birthdays.length > 0 && React.createElement(MobilePanel, null, React.createElement("div", {
    className: "ppt-mobile-section-title"
  }, MT.birthdays), React.createElement("div", {
    className: "ppt-mobile-chip-row"
  }, birthdays.map(b => React.createElement("span", {
    key: b.person.id || b.person.name,
    className: "ppt-mobile-birthday-chip"
  }, b.person.name, " - ", birthdayWhenText(b.diff))))), notifyConflicts.length > 0 && React.createElement(MobilePanel, {
    onClick: onConflicts,
    style: {
      borderColor: "rgba(248,113,113,.45)"
    }
  }, React.createElement("div", {
    className: "ppt-mobile-alert"
  }, MT.checkConflicts, ": ", notifyConflicts.length)), React.createElement(MobilePanel, null, React.createElement("div", {
    className: "ppt-mobile-section-title"
  }, MT.today), todayTasks.length ? groupMobileTasks(todayTasks).map(g => React.createElement(MobileTaskGroup, {
    key: g.tasks.map(t => t.id).join("-"),
    group: g,
    data: data,
    onOpenProject: onOpenProject,
    onOpenPerson: onOpenPerson
  })) : React.createElement("div", {
    className: "ppt-mobile-empty"
  }, MT.noShifts)), React.createElement(MobilePanel, null, React.createElement("div", {
    className: "ppt-mobile-section-title"
  }, MT.tomorrow), tomorrowTasks.length ? groupMobileTasks(tomorrowTasks).map(g => React.createElement(MobileTaskGroup, {
    key: g.tasks.map(t => t.id).join("-"),
    group: g,
    data: data,
    onOpenProject: onOpenProject,
    onOpenPerson: onOpenPerson
  })) : React.createElement("div", {
    className: "ppt-mobile-empty"
  }, MT.noShifts)));
}
function MobileCalendar(_ref119) {
  let data = _ref119.data,
    onOpenProject = _ref119.onOpenProject,
    onOpenPerson = _ref119.onOpenPerson;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const _useState191 = useState(() => new Date(today.getFullYear(), today.getMonth(), 1)),
    _useState192 = _slicedToArray(_useState191, 2),
    cursor = _useState192[0],
    setCursor = _useState192[1];
  const _useState193 = useState(() => formatDate(today)),
    _useState194 = _slicedToArray(_useState193, 2),
    selected = _useState194[0],
    setSelected = _useState194[1];
  const year = cursor.getFullYear(),
    month = cursor.getMonth();
  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - offset);
    return Array.from({
      length: 42
    }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [year, month]);
  const selectedInfo = mobileDayInfo(data, selected);
  function shiftMonth(delta) {
    setCursor(d => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  }
  return React.createElement("div", {
    className: "ppt-mobile-stack"
  }, React.createElement(MobilePanel, null, React.createElement("div", {
    className: "ppt-mobile-month-head"
  }, React.createElement("button", {
    onClick: () => shiftMonth(-1)
  }, "Prev"), React.createElement("strong", null, MONTHS[month], " ", year), React.createElement("button", {
    onClick: () => shiftMonth(1)
  }, "Next")), React.createElement("div", {
    className: "ppt-mobile-weekdays"
  }, ["\u041f\u043d", "\u0412\u0442", "\u0421\u0440", "\u0427\u0442", "\u041f\u0442", "\u0421\u0431", "\u0412\u0441"].map(d => React.createElement("span", {
    key: d
  }, d))), React.createElement("div", {
    className: "ppt-mobile-month-grid"
  }, cells.map(d => {
    const ds = formatDate(d);
    const info = mobileDayInfo(data, ds);
    const inMonth = d.getMonth() === month;
    const isToday = ds === formatDate(today);
    const isSelected = ds === selected;
    const projIds = [...new Set(info.tasks.map(t => t.project))].slice(0, 4);
    return React.createElement("button", {
      key: ds,
      className: `${inMonth ? "" : "muted"} ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`,
      onClick: () => setSelected(ds)
    }, React.createElement("span", null, d.getDate()), React.createElement("div", {
      className: "ppt-mobile-day-dots"
    }, info.bdays.length > 0 && React.createElement("i", {
      className: "birthday"
    }), info.airs.length > 0 && React.createElement("i", {
      className: "air"
    }), info.milestones.length > 0 && React.createElement("i", {
      className: "milestone"
    }), projIds.map(pid => {
      const p = (data.projects || []).find(x => x.id === pid);
      return React.createElement("i", {
        key: pid,
        style: {
          background: (p === null || p === void 0 ? void 0 : p.color) || "#64748b"
        }
      });
    })), info.count > 0 && React.createElement("em", null, info.count));
  }))), React.createElement(MobilePanel, null, React.createElement("div", {
    className: "ppt-mobile-day-head"
  }, React.createElement("strong", null, dayLabel(selected)), React.createElement("span", null, selectedInfo.count)), selectedInfo.bdays.map(p => React.createElement("div", {
    key: `b${p.id || p.name}`,
    className: "ppt-mobile-calendar-note birthday"
  }, MT.birthdayShort, " ", p.name)), selectedInfo.airs.map((_ref120, i) => {
    let proj = _ref120.proj,
      ser = _ref120.ser;
    return React.createElement("div", {
      key: `a${proj.id}${ser.id}${i}`,
      className: "ppt-mobile-calendar-note air",
      onClick: () => onOpenProject(proj.id)
    }, MT.air, ": ", proj.abbr || proj.name, " ", ser.name);
  }), selectedInfo.milestones.map((m, i) => React.createElement("div", {
    key: `m${i}`,
    className: "ppt-mobile-calendar-note",
    style: {
      borderLeftColor: m.color,
      color: "#f8fafc"
    },
    onClick: () => onOpenProject(m.proj.id)
  }, m.label, " - ", m.proj.abbr || m.proj.name, " ", m.ser.name)), groupMobileTasks(selectedInfo.tasks).map(g => React.createElement(MobileTaskGroup, {
    key: g.tasks.map(t => t.id).join("-"),
    group: g,
    data: data,
    onOpenProject: onOpenProject,
    onOpenPerson: onOpenPerson
  })), selectedInfo.count === 0 && React.createElement("div", {
    className: "ppt-mobile-empty"
  }, MT.noEvents)));
}
function MobileProjects(_ref121) {
  let data = _ref121.data,
    onOpenProject = _ref121.onOpenProject;
  const today = formatDate(new Date());
  const projects = (data.projects || []).filter(p => p.status !== MT.archive);
  return React.createElement("div", {
    className: "ppt-mobile-stack"
  }, projects.map(p => {
    const tasks = (data.tasks || []).filter(t => !t.deleted && !t.cancelled && t.project === p.id);
    const todayCount = tasks.filter(t => t.day === today).length;
    const seriesCount = (data.series || []).filter(s => s.projectId === p.id && !s.deleted).length;
    return React.createElement(MobilePanel, {
      key: p.id,
      onClick: () => onOpenProject(p.id),
      style: {
        borderTop: `3px solid ${p.color || "#64748b"}`
      }
    }, React.createElement("div", {
      className: "ppt-mobile-project-title"
    }, React.createElement(ProjectMark, {
      project: p,
      size: 12
    }), React.createElement("strong", null, p.name)), React.createElement("div", {
      className: "ppt-mobile-chip-row"
    }, React.createElement("span", null, seriesCount, " ", MT.series), React.createElement("span", null, todayCount, " ", MT.todayLower), React.createElement("span", null, tasks.length, " ", MT.shiftShort)));
  }));
}
function MobilePeople(_ref122) {
  let data = _ref122.data,
    onOpenPerson = _ref122.onOpenPerson;
  const _useState195 = useState(""),
    _useState196 = _slicedToArray(_useState195, 2),
    q = _useState196[0],
    setQ = _useState196[1];
  const today = formatDate(new Date());
  const people = (data.people || []).filter(p => p.active !== false && !p.deleted).filter(p => !q.trim() || String(p.name || "").toLowerCase().includes(q.trim().toLowerCase()));
  return React.createElement("div", {
    className: "ppt-mobile-stack"
  }, React.createElement("input", {
    className: "ppt-mobile-search",
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: MT.searchPerson
  }), people.map(p => {
    const todayTasks = (data.tasks || []).filter(t => !t.deleted && !t.cancelled && t.person === p.name && t.day === today);
    const diff = birthdayDiffDays(p.birthday, new Date());
    return React.createElement(MobilePanel, {
      key: p.id || p.name,
      onClick: () => onOpenPerson(p.id)
    }, React.createElement("div", {
      className: "ppt-mobile-person"
    }, React.createElement("div", null, (p.name || "?")[0]), React.createElement("strong", null, p.name)), React.createElement("div", {
      className: "ppt-mobile-chip-row"
    }, React.createElement("span", null, todayTasks.length, " ", MT.todayLower), diff != null && diff <= 7 && React.createElement("span", null, MT.birthdayShort, " ", birthdayWhenText(diff))));
  }), people.length === 0 && React.createElement(MobilePanel, null, React.createElement("div", {
    className: "ppt-mobile-empty"
  }, MT.noPeople)));
}
function MobileWorkspace(_ref123) {
  let view = _ref123.view,
    data = _ref123.data,
    conflictDetails = _ref123.conflictDetails,
    setView = _ref123.setView,
    navigate = _ref123.navigate;
  const openProject = id => navigate({
    type: "project",
    id
  });
  const openPerson = id => id && navigate({
    type: "person",
    id
  });
  if (view === "calendar") return React.createElement(MobileCalendar, {
    data: data,
    onOpenProject: openProject,
    onOpenPerson: openPerson
  });
  if (view === "projects") return React.createElement(MobileProjects, {
    data: data,
    onOpenProject: openProject
  });
  if (view === "people") return React.createElement(MobilePeople, {
    data: data,
    onOpenPerson: openPerson
  });
  if (view === "conflicts") return React.createElement(ConflictsView, {
    details: conflictDetails,
    data: data
  });
  return React.createElement(MobileToday, {
    data: data,
    conflictDetails: conflictDetails,
    onOpenProject: openProject,
    onOpenPerson: openPerson,
    onConflicts: () => setView("conflicts")
  });
}
async function producerRequest(path, options) {
  const response = await csrfFetch(SERVER_URL + path, {
    credentials: "include",
    ...(options || {}),
    headers: {
      "Content-Type": "application/json",
      ...(options && options.headers || {})
    }
  });
  let body = {};
  try {
    body = await response.json();
  } catch (error) {}
  if (!response.ok) throw new Error(body.error || "Ошибка сервера: " + response.status);
  return body;
}
function producerDate(value) {
  if (!value) return "Без срока";
  const parts = String(value).slice(0, 10).split("-");
  return parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : String(value);
}
function producerDateInput(value) {
  return value ? producerDate(value) : "";
}
function producerIsoFromInput(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const day = producerDay(text);
    return day && day.getFullYear() === Number(isoMatch[1]) && day.getMonth() + 1 === Number(isoMatch[2]) && day.getDate() === Number(isoMatch[3]) ? text : null;
  }
  const match = text.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})$/);
  if (!match) return null;
  const iso = `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
  const day = producerDay(iso);
  return day && day.getFullYear() === Number(match[3]) && day.getMonth() + 1 === Number(match[2]) && day.getDate() === Number(match[1]) ? iso : null;
}
function producerDay(value) {
  return value ? new Date(String(value).slice(0, 10) + "T12:00:00") : null;
}
function producerDueState(value, complete) {
  if (!value || complete) return "normal";
  const due = producerDay(value);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const days = Math.round((due - today) / 86400000);
  return days < 0 ? "overdue" : days === 0 ? "today" : days <= 3 ? "soon" : "normal";
}
function producerRelativeDue(value) {
  if (!value) return "срок не указан";
  const due = producerDay(value);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const days = Math.round((due - today) / 86400000);
  if (days < 0) return `просрочено на ${Math.abs(days)} дн.`;
  if (days === 0) return "сегодня";
  if (days === 1) return "завтра";
  return `через ${days} дн.`;
}
const PRODUCER_PROJECT_ART = {
  "demo-north": [0, 0],
  "demo-city": [1, 0],
  "demo-science": [2, 0],
  "demo-home": [3, 0],
  "demo-stage": [0, 1],
  "demo-factory": [1, 1],
  "demo-expedition": [2, 1]
};
const PRODUCER_AVATAR_IDS = ["demo-olga", "demo-ilya", "demo-anna", "demo-denis", "demo-maria", "local-demo-producer", "demo-pavel", "demo-elena", "demo-kirill", "demo-sofia", "demo-victor", "demo-irina"];
function ProducerAvatar(_ref124) {
  let person = _ref124.person,
    _ref124$size = _ref124.size,
    size = _ref124$size === void 0 ? "normal" : _ref124$size,
    title = _ref124.title;
  if (!person) return React.createElement("span", {
    className: `producer-avatar ${size} fallback`
  }, "?");
  const id = typeof person === "string" ? person : person.id;
  const name = typeof person === "string" ? title || person : person.name;
  const index = PRODUCER_AVATAR_IDS.indexOf(id);
  const col = index >= 0 ? index % 4 : 0;
  const row = index >= 0 ? Math.floor(index / 4) : 0;
  const style = index >= 0 ? {
    backgroundImage: 'url("/demo/staff-avatars-v1.png")',
    backgroundSize: "400% 300%",
    backgroundPosition: `${col * 100 / 3}% ${row * 50}%`
  } : {};
  return React.createElement("span", {
    className: `producer-avatar ${size}${index < 0 ? " fallback" : ""}`,
    title: name,
    style: style
  }, index < 0 ? String(name || "?").split(/\s+/).map(item => item[0]).join("").slice(0, 2) : "");
}
function ProducerProjectArt(_ref125) {
  let project = _ref125.project;
  const cell = PRODUCER_PROJECT_ART[project.id];
  const style = cell ? {
    backgroundImage: 'url("/demo/project-covers-v1.png")',
    backgroundSize: "400% auto",
    backgroundPosition: `${cell[0] * 100 / 3}% ${cell[1] * 100}%`
  } : {
    background: project.color
  };
  return React.createElement("span", {
    className: "producer-project-art",
    style: style
  }, React.createElement("i", {
    style: {
      background: project.color
    }
  }));
}
function ProducerWeatherDoodle() {
  return React.createElement("div", {
    className: "producer-weather-doodle",
    "aria-label": "\u0421\u0435\u0433\u043E\u0434\u043D\u044F \u0445\u043E\u0440\u043E\u0448\u0438\u0439 \u0434\u0435\u043D\u044C \u0434\u043B\u044F \u0440\u0430\u0431\u043E\u0442\u044B"
  }, React.createElement("svg", {
    viewBox: "0 0 118 94",
    role: "img",
    "aria-label": "\u0420\u0438\u0441\u043E\u0432\u0430\u043D\u043D\u043E\u0435 \u0443\u043B\u044B\u0431\u0430\u044E\u0449\u0435\u0435\u0441\u044F \u0441\u043E\u043B\u043D\u0446\u0435"
  }, React.createElement("g", {
    className: "producer-sun-rays"
  }, React.createElement("path", {
    d: "M58 4v13M58 77v13M15 47H3M113 47h-13M27 16l8 10M89 17l-8 10M26 78l9-10M90 77l-9-10"
  })), React.createElement("path", {
    className: "producer-sun-body",
    d: "M88 47c0 17-13 30-30 30S28 64 28 47 41 17 58 17s30 13 30 30Z"
  }), React.createElement("g", {
    className: "producer-sun-face"
  }, React.createElement("path", {
    d: "M45 43c2-2 4-2 6 0M66 43c2-2 4-2 6 0"
  }), React.createElement("path", {
    className: "producer-sun-smile",
    d: "M46 55c7 8 17 8 24 0"
  }))), React.createElement("span", null, React.createElement("b", null, "\u0421\u0435\u0433\u043E\u0434\u043D\u044F \u2014 \u0445\u043E\u0440\u043E\u0448\u0438\u0439 \u0434\u0435\u043D\u044C"), React.createElement("small", null, "\u0434\u043B\u044F \u0431\u043E\u043B\u044C\u0448\u0438\u0445 \u0438\u0441\u0442\u043E\u0440\u0438\u0439")));
}
function ProducerDateField(_ref126) {
  let value = _ref126.value,
    onChange = _ref126.onChange,
    label = _ref126.label;
  const _useState197 = useState(() => producerDateInput(value)),
    _useState198 = _slicedToArray(_useState197, 2),
    text = _useState198[0],
    setText = _useState198[1];
  const _useState199 = useState(false),
    _useState200 = _slicedToArray(_useState199, 2),
    invalid = _useState200[0],
    setInvalid = _useState200[1];
  const picker = useRef(null);
  useEffect(() => {
    setText(producerDateInput(value));
    setInvalid(false);
  }, [value]);
  function type(next) {
    setText(next);
    const parsed = producerIsoFromInput(next);
    setInvalid(parsed === null);
    if (parsed !== null) onChange(parsed);
  }
  function openPicker() {
    if (!picker.current) return;
    if (typeof picker.current.showPicker === "function") picker.current.showPicker();else picker.current.click();
  }
  return React.createElement("span", {
    className: "producer-date-field" + (invalid ? " invalid" : "")
  }, React.createElement("input", {
    "aria-label": label,
    inputMode: "numeric",
    value: text,
    onChange: e => type(e.target.value),
    onBlur: () => {
      if (invalid) {
        setText(producerDateInput(value));
        setInvalid(false);
      }
    },
    placeholder: "\u0414\u0414.\u041C\u041C.\u0413\u0413\u0413\u0413"
  }), React.createElement("button", {
    type: "button",
    title: "\u0412\u044B\u0431\u0440\u0430\u0442\u044C \u0434\u0430\u0442\u0443 \u0432 \u043A\u0430\u043B\u0435\u043D\u0434\u0430\u0440\u0435",
    "aria-label": "Открыть календарь: " + label,
    onClick: openPicker
  }, "\u25A6"), React.createElement("input", {
    ref: picker,
    className: "producer-date-native",
    tabIndex: "-1",
    type: "date",
    value: value || "",
    onChange: e => onChange(e.target.value)
  }));
}
function producerInitialScreen() {
  const hash = String(window.location.hash || "");
  const detail = hash.match(/^#producer\/(project|block)\/([^/]+)/);
  if (detail) return {
    type: detail[1],
    id: decodeURIComponent(detail[2])
  };
  const section = hash.match(/^#producer\/(projects|calendar|history)$/);
  return {
    type: section ? section[1] : "dashboard",
    id: ""
  };
}
function ProducerToast(_ref127) {
  let message = _ref127.message;
  if (!message) return null;
  return React.createElement("div", {
    className: "producer-toast",
    role: "status"
  }, "\u2713 ", message);
}
function ProducerProgress(_ref128) {
  let done = _ref128.done,
    total = _ref128.total;
  const percent = total ? Math.round(done * 100 / total) : 0;
  return React.createElement("div", {
    className: "producer-progress"
  }, React.createElement("span", {
    style: {
      width: percent + "%"
    }
  }), React.createElement("b", null, percent, "%"));
}
function ProducerShell(_ref129) {
  let user = _ref129.user,
    onExit = _ref129.onExit,
    children = _ref129.children,
    onHome = _ref129.onHome,
    screen = _ref129.screen,
    go = _ref129.go;
  return React.createElement("div", {
    className: "producer-shell"
  }, React.createElement("header", {
    className: "producer-header"
  }, React.createElement("button", {
    className: "producer-brand",
    onClick: onHome
  }, React.createElement("span", {
    className: "producer-brand-mark"
  }, "\u041F\u0422"), React.createElement("span", null, React.createElement("strong", null, "\u041F\u041E\u0421\u0422 \u0422\u0420\u0415\u041A\u0415\u0420"), React.createElement("small", null, "\u041F\u0440\u043E\u0434\u044E\u0441\u0435\u0440\u0441\u043A\u0430\u044F \xB7 ", RUNTIME.label || "рабочая версия"))), React.createElement("nav", {
    className: "producer-main-nav",
    "aria-label": "\u0420\u0430\u0437\u0434\u0435\u043B\u044B \u043F\u0440\u043E\u0434\u044E\u0441\u0435\u0440\u0441\u043A\u043E\u0439"
  }, React.createElement("button", {
    className: screen.type === "dashboard" ? "active" : "",
    onClick: () => go("dashboard")
  }, "\u0413\u043B\u0430\u0432\u043D\u0430\u044F"), React.createElement("button", {
    className: ["projects", "project", "block"].includes(screen.type) ? "active" : "",
    onClick: () => go("projects")
  }, "\u041F\u0440\u043E\u0435\u043A\u0442\u044B"), React.createElement("button", {
    className: screen.type === "calendar" ? "active" : "",
    onClick: () => go("calendar")
  }, "\u041A\u0430\u043B\u0435\u043D\u0434\u0430\u0440\u044C"), React.createElement("button", {
    className: screen.type === "history" ? "active" : "",
    onClick: () => go("history")
  }, "\u0418\u0441\u0442\u043E\u0440\u0438\u044F")), React.createElement("div", {
    className: "producer-user"
  }, React.createElement("button", {
    onClick: onExit
  }, "\u041F\u043E\u0441\u0442\u043F\u0440\u043E\u0434\u0430\u043A\u0448\u043D"), React.createElement(ProducerAvatar, {
    person: {
      id: "local-demo-producer",
      name: user.display_name
    },
    size: "small"
  }), React.createElement("span", null, user.display_name), React.createElement("b", null, user.role))), children);
}
const PRODUCER_STATUS_LABELS = {
  "в работе": "В работе",
  "постпродакшн": "В посте",
  "съёмка": "На съёмке",
  "подготовка": "В подготовке"
};
function ProducerProjectCard(_ref130) {
  let project = _ref130.project,
    go = _ref130.go;
  const _useState201 = useState(false),
    _useState202 = _slicedToArray(_useState201, 2),
    expanded = _useState202[0],
    setExpanded = _useState202[1];
  return React.createElement("article", {
    className: "producer-project-preview" + (expanded ? " expanded" : ""),
    style: {
      "--project-color": project.color
    }
  }, React.createElement("button", {
    className: "producer-project-preview-main",
    onClick: () => setExpanded(value => !value),
    onDoubleClick: () => go("project", project.id)
  }, React.createElement(ProducerProjectArt, {
    project: project
  }), React.createElement("span", {
    className: "producer-project-stage"
  }, "\u25CF ", PRODUCER_STATUS_LABELS[project.status] || project.status || "В работе"), project.warningCount > 0 && React.createElement("span", {
    className: "producer-project-alert"
  }, "! ", project.warningCount)), React.createElement("div", {
    className: "producer-project-preview-copy"
  }, React.createElement("strong", null, project.name), React.createElement("small", null, project.description || "Проект без описания"), React.createElement(ProducerProgress, {
    done: project.completedTasks,
    total: project.totalTasks
  }), React.createElement("div", {
    className: "producer-project-preview-meta"
  }, React.createElement("span", {
    className: "producer-project-team"
  }, React.createElement("span", {
    className: "producer-avatar-stack"
  }, (project.team || []).map(person => React.createElement(ProducerAvatar, {
    key: person.id,
    person: person,
    size: "tiny"
  }))), React.createElement("small", null, "\u041A\u043E\u043C\u0430\u043D\u0434\u0430: ", (project.team || []).length)), React.createElement("span", {
    className: "producer-project-deadline"
  }, React.createElement("small", null, PRODUCER_STATUS_LABELS[project.status] || project.status || "В работе"), React.createElement("strong", null, "\u0434\u043E ", producerDate(project.nextDeadline))))), expanded && React.createElement("div", {
    className: "producer-project-preview-detail"
  }, React.createElement("span", null, project.completedTasks, " \u0438\u0437 ", project.totalTasks, " \u0437\u0430\u0434\u0430\u0447 \u0433\u043E\u0442\u043E\u0432\u044B"), React.createElement("button", {
    onClick: () => go("project", project.id)
  }, "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043A\u0430\u0440\u0442\u0443 \u043F\u0440\u043E\u0435\u043A\u0442\u0430 \u2192")));
}
function ProducerDashboard(_ref131) {
  let go = _ref131.go,
    refreshKey = _ref131.refreshKey,
    user = _ref131.user;
  const _useState203 = useState(null),
    _useState204 = _slicedToArray(_useState203, 2),
    result = _useState204[0],
    setResult = _useState204[1];
  const _useState205 = useState(""),
    _useState206 = _slicedToArray(_useState205, 2),
    error = _useState206[0],
    setError = _useState206[1];
  const _useState207 = useState(""),
    _useState208 = _slicedToArray(_useState207, 2),
    openAttention = _useState208[0],
    setOpenAttention = _useState208[1];
  useEffect(() => {
    let alive = true;
    setError("");
    producerRequest("/api/producer/dashboard").then(data => alive && setResult(data)).catch(e => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [refreshKey]);
  if (error) return React.createElement("main", {
    className: "producer-main"
  }, React.createElement("div", {
    className: "producer-error"
  }, error));
  if (!result) return React.createElement("main", {
    className: "producer-main"
  }, React.createElement("div", {
    className: "producer-loading"
  }, "\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u044E \u043F\u0440\u043E\u0434\u044E\u0441\u0435\u0440\u0441\u043A\u0443\u044E\u2026"));
  const todayTasks = result.myTasks || [];
  const attention = result.attention || [];
  const statuses = result.projects.reduce((rows, project) => {
    const key = PRODUCER_STATUS_LABELS[project.status] || project.status || "Без статуса";
    rows[key] = (rows[key] || 0) + 1;
    return rows;
  }, {});
  const attentionGroups = attention.reduce((rows, item) => {
    let group = rows.find(row => row.id === item.projectId);
    if (!group) {
      group = {
        id: item.projectId,
        name: item.projectName,
        color: item.projectColor,
        items: []
      };
      rows.push(group);
    }
    group.items.push(item);
    return rows;
  }, []);
  const firstName = String(user.display_name || "Коллега").split(/\s+/)[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Доброе утро" : hour < 18 ? "Добрый день" : "Добрый вечер";
  return React.createElement("main", {
    className: "producer-main"
  }, React.createElement("section", {
    className: "producer-home-hero"
  }, React.createElement("div", null, React.createElement("h1", null, greeting, ", ", firstName, "!"), React.createElement("p", null, "\u0417\u0434\u0435\u0441\u044C \u0442\u043E\u043B\u044C\u043A\u043E \u0442\u043E, \u0447\u0442\u043E \u043F\u043E\u043C\u043E\u0433\u0430\u0435\u0442 \u0434\u0432\u0438\u0433\u0430\u0442\u044C \u043F\u0440\u043E\u0435\u043A\u0442\u044B \u0432\u043F\u0435\u0440\u0451\u0434.")), React.createElement(ProducerWeatherDoodle, null)), React.createElement("section", {
    className: "producer-home-projects"
  }, React.createElement("header", {
    className: "producer-clean-heading"
  }, React.createElement("div", null, React.createElement("h2", null, "\u041F\u0440\u043E\u0435\u043A\u0442\u044B \u0432 \u0440\u0430\u0431\u043E\u0442\u0435"), React.createElement("p", null, Object.entries(statuses).map(_ref132 => {
    let _ref133 = _slicedToArray(_ref132, 2),
      label = _ref133[0],
      count = _ref133[1];
    return `${count} ${label.toLowerCase()}`;
  }).join(" · "))), React.createElement("button", {
    onClick: () => go("projects")
  }, "\u0421\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0432\u0441\u0435 \u043F\u0440\u043E\u0435\u043A\u0442\u044B \u2192")), React.createElement("div", {
    className: "producer-project-preview-grid"
  }, result.projects.slice(0, 3).map(project => React.createElement(ProducerProjectCard, {
    key: project.id,
    project: project,
    go: go
  })))), React.createElement("section", {
    className: "producer-home-columns"
  }, React.createElement("article", {
    className: "producer-clean-list producer-today-list"
  }, React.createElement("header", null, React.createElement("h2", null, "\u041C\u043E\u0438 \u0437\u0430\u0434\u0430\u0447\u0438 \u0441\u0435\u0433\u043E\u0434\u043D\u044F"), React.createElement("b", null, todayTasks.length)), React.createElement("div", null, todayTasks.length ? todayTasks.map(item => React.createElement("button", {
    key: item.id,
    onClick: () => go("block", item.blockId)
  }, React.createElement("span", {
    className: "producer-paper-check"
  }, "\u2713"), React.createElement("span", null, React.createElement("strong", null, item.title), React.createElement("small", null, item.projectName, " \xB7 ", item.blockName), item.internalComment && React.createElement("em", {
    className: "producer-list-comment"
  }, "\uD83D\uDCAC ", item.internalComment)), React.createElement("time", null, producerDate(item.deadline)))) : React.createElement("p", null, "\u041D\u0430 \u0441\u0435\u0433\u043E\u0434\u043D\u044F \u0437\u0430\u0434\u0430\u0447 \u043D\u0435\u0442."))), React.createElement("article", {
    className: "producer-clean-list producer-deadline-list"
  }, React.createElement("header", null, React.createElement("h2", null, "\u0411\u043B\u0438\u0436\u0430\u0439\u0448\u0438\u0435 \u0441\u0440\u043E\u043A\u0438"), React.createElement("button", {
    onClick: () => go("calendar")
  }, "\u041A\u0430\u043B\u0435\u043D\u0434\u0430\u0440\u044C \u2192")), React.createElement("div", null, result.deadlines.length ? result.deadlines.slice(0, 5).map(item => React.createElement("button", {
    key: item.id,
    onClick: () => go("block", item.blockId)
  }, React.createElement("i", {
    style: {
      background: item.projectColor
    }
  }), React.createElement("time", null, producerDate(item.deadline)), React.createElement("span", null, React.createElement("strong", null, item.title), React.createElement("small", null, item.projectName, " \xB7 ", item.blockName)))) : React.createElement("p", null, "\u0412 \u0431\u043B\u0438\u0436\u0430\u0439\u0448\u0438\u0435 \u0434\u0432\u0435 \u043D\u0435\u0434\u0435\u043B\u0438 \u0441\u0440\u043E\u043A\u043E\u0432 \u043D\u0435\u0442."))), React.createElement("article", {
    className: "producer-attention-summary"
  }, React.createElement("header", null, React.createElement("span", null, "!"), React.createElement("div", null, React.createElement("h2", null, "\u0422\u0440\u0435\u0431\u0443\u0435\u0442 \u0432\u043D\u0438\u043C\u0430\u043D\u0438\u044F"), React.createElement("p", null, attention.length, " \u0441\u0438\u0442\u0443\u0430\u0446\u0438\u0439 \u0432 ", attentionGroups.length, " \u043F\u0440\u043E\u0435\u043A\u0442\u0430\u0445"))), React.createElement("div", null, attentionGroups.length ? attentionGroups.slice(0, 3).map(group => {
    const open = openAttention === group.id;
    const visible = open ? group.items : group.items.slice(0, 1);
    return React.createElement("section", {
      key: group.id,
      style: {
        "--project-color": group.color
      }
    }, React.createElement("button", {
      className: "producer-attention-project",
      onClick: () => setOpenAttention(open ? "" : group.id)
    }, React.createElement("i", null), React.createElement("strong", null, group.name), React.createElement("b", null, group.items.length), React.createElement("span", null, open ? "−" : "+")), visible.map(item => React.createElement("button", {
      className: "producer-attention-item",
      key: item.id,
      onClick: () => go("block", item.blockId)
    }, React.createElement("span", null, React.createElement("em", null, item.reason), React.createElement("strong", null, item.title), (item.detail || item.blockName) && React.createElement("small", null, item.detail || item.blockName)), React.createElement("time", null, producerRelativeDue(item.deadline), " \u2192"))));
  }) : React.createElement("p", null, "\u0421\u0440\u043E\u0447\u043D\u044B\u0445 \u043F\u0440\u0435\u043F\u044F\u0442\u0441\u0442\u0432\u0438\u0439 \u0441\u0435\u0439\u0447\u0430\u0441 \u043D\u0435\u0442.")))));
}
function ProducerProjectsPage(_ref134) {
  let go = _ref134.go,
    refreshKey = _ref134.refreshKey;
  const _useState209 = useState(null),
    _useState210 = _slicedToArray(_useState209, 2),
    result = _useState210[0],
    setResult = _useState210[1];
  const _useState211 = useState(""),
    _useState212 = _slicedToArray(_useState211, 2),
    error = _useState212[0],
    setError = _useState212[1];
  useEffect(() => {
    let alive = true;
    producerRequest("/api/producer/dashboard").then(data => alive && setResult(data)).catch(e => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [refreshKey]);
  if (error) return React.createElement("main", {
    className: "producer-main"
  }, React.createElement("div", {
    className: "producer-error"
  }, error));
  if (!result) return React.createElement("main", {
    className: "producer-main"
  }, React.createElement("div", {
    className: "producer-loading"
  }, "\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u044E \u043F\u0440\u043E\u0435\u043A\u0442\u044B\u2026"));
  return React.createElement("main", {
    className: "producer-main producer-directory-page"
  }, React.createElement("header", {
    className: "producer-page-heading"
  }, React.createElement("div", null, React.createElement("span", {
    className: "producer-eyebrow"
  }, "\u0412\u0421\u0415 \u041F\u0420\u041E\u0415\u041A\u0422\u042B"), React.createElement("h1", null, "\u041F\u0440\u043E\u0435\u043A\u0442\u044B"), React.createElement("p", null, "\u041E\u0434\u0438\u043D \u0449\u0435\u043B\u0447\u043E\u043A \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u0434\u0435\u0442\u0430\u043B\u0438, \u0434\u0432\u043E\u0439\u043D\u043E\u0439 \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u0435\u0442 \u043A\u0430\u0440\u0442\u0443 \u043F\u0440\u043E\u0435\u043A\u0442\u0430.")), React.createElement("b", null, result.projects.length, " \u0432 \u0440\u0430\u0431\u043E\u0442\u0435")), React.createElement("div", {
    className: "producer-project-directory"
  }, result.projects.map(project => React.createElement(ProducerProjectCard, {
    key: project.id,
    project: project,
    go: go
  }))));
}
function producerMonthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12);
}
function producerIsoLocal(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function ProducerCalendarPage(_ref135) {
  let go = _ref135.go,
    refreshKey = _ref135.refreshKey;
  const _useState213 = useState(null),
    _useState214 = _slicedToArray(_useState213, 2),
    result = _useState214[0],
    setResult = _useState214[1];
  const _useState215 = useState(""),
    _useState216 = _slicedToArray(_useState215, 2),
    error = _useState216[0],
    setError = _useState216[1];
  const _useState217 = useState(() => producerMonthStart(new Date())),
    _useState218 = _slicedToArray(_useState217, 2),
    month = _useState218[0],
    setMonth = _useState218[1];
  useEffect(() => {
    let alive = true;
    producerRequest("/api/producer/dashboard").then(data => alive && setResult(data)).catch(e => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [refreshKey]);
  if (error) return React.createElement("main", {
    className: "producer-main"
  }, React.createElement("div", {
    className: "producer-error"
  }, error));
  if (!result) return React.createElement("main", {
    className: "producer-main"
  }, React.createElement("div", {
    className: "producer-loading"
  }, "\u0421\u043E\u0431\u0438\u0440\u0430\u044E \u043A\u0430\u043B\u0435\u043D\u0434\u0430\u0440\u044C\u2026"));
  const first = producerMonthStart(month);
  const offset = (first.getDay() + 6) % 7;
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - offset);
  const days = Array.from({
    length: 42
  }, (_, index) => {
    const value = new Date(gridStart);
    value.setDate(gridStart.getDate() + index);
    return value;
  });
  const items = result.calendarItems || [];
  const today = producerIsoLocal(new Date());
  function shift(value) {
    setMonth(current => new Date(current.getFullYear(), current.getMonth() + value, 1, 12));
  }
  return React.createElement("main", {
    className: "producer-main producer-calendar-page"
  }, React.createElement("header", {
    className: "producer-page-heading"
  }, React.createElement("div", null, React.createElement("span", {
    className: "producer-eyebrow"
  }, "\u0421\u0420\u041E\u041A\u0418 \u0417\u0410\u0414\u0410\u0427"), React.createElement("h1", null, "\u041A\u0430\u043B\u0435\u043D\u0434\u0430\u0440\u044C"), React.createElement("p", null, "\u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u043D\u0430 \u0441\u0440\u043E\u043A, \u0447\u0442\u043E\u0431\u044B \u043F\u0435\u0440\u0435\u0439\u0442\u0438 \u043F\u0440\u044F\u043C\u043E \u0432 \u043D\u0443\u0436\u043D\u044B\u0439 \u0431\u043B\u043E\u043A.")), React.createElement("div", {
    className: "producer-month-switch"
  }, React.createElement("button", {
    onClick: () => shift(-1)
  }, "\u2190"), React.createElement("strong", null, month.toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric"
  })), React.createElement("button", {
    onClick: () => shift(1)
  }, "\u2192"))), React.createElement("div", {
    className: "producer-calendar-weekdays"
  }, ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map(day => React.createElement("span", {
    key: day
  }, day))), React.createElement("div", {
    className: "producer-calendar-grid"
  }, days.map(day => {
    const iso = producerIsoLocal(day);
    const rows = items.filter(item => item.deadline === iso);
    return React.createElement("section", {
      key: iso,
      className: (day.getMonth() !== month.getMonth() ? "outside " : "") + (iso === today ? "today" : "")
    }, React.createElement("time", null, day.getDate()), React.createElement("div", null, rows.slice(0, 3).map(item => React.createElement("button", {
      key: item.id,
      style: {
        "--project-color": item.projectColor
      },
      onClick: () => go("block", item.blockId),
      title: item.projectName + ": " + item.title
    }, React.createElement("i", null), React.createElement("span", null, item.title))), rows.length > 3 && React.createElement("small", null, "\u0435\u0449\u0451 ", rows.length - 3)));
  })));
}
const PRODUCER_AUDIT_ACTIONS = {
  create: "Создано",
  update: "Изменено",
  assign: "Изменён исполнитель",
  move: "Перемещено",
  reschedule: "Перенесён срок",
  complete: "Выполнено",
  restore: "Возвращено",
  delete: "Удалено",
  approve: "Согласовано",
  reject: "Отклонено",
  save: "Сохранено"
};
const PRODUCER_AUDIT_ENTITIES = {
  project: "Проект",
  series: "Серия",
  task: "Смена",
  productionBlock: "Блок",
  productionGroup: "Группа",
  productionTask: "Задача",
  productionApproval: "Согласование",
  person: "Сотрудник",
  settings: "Настройки",
  bulk: "Массовое изменение"
};
const PRODUCER_AUDIT_FIELDS = {
  title: "Название",
  name: "Название",
  internal_comment: "Внутренний комментарий",
  deadline: "Срок",
  assignee_name: "Исполнитель",
  responsible_name: "Ответственный",
  owner_name: "Ответственный блока",
  group_id: "Группа",
  status: "Статус",
  description: "Описание",
  decision_comment: "Комментарий к решению"
};
function producerAuditValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (value === true) return "да";
  if (value === false) return "нет";
  if (Array.isArray(value)) return value.length ? value.map(item => typeof item === "object" ? item.name || item.label || item.uid || JSON.stringify(item) : String(item)).join(", ") : "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
function ProducerHistoryPage(_ref136) {
  let refreshKey = _ref136.refreshKey;
  const _useState219 = useState([]),
    _useState220 = _slicedToArray(_useState219, 2),
    projects = _useState220[0],
    setProjects = _useState220[1];
  const _useState221 = useState({
      projectId: "",
      actorUserId: "",
      action: "",
      from: "",
      to: ""
    }),
    _useState222 = _slicedToArray(_useState221, 2),
    filters = _useState222[0],
    setFilters = _useState222[1];
  const _useState223 = useState(1),
    _useState224 = _slicedToArray(_useState223, 2),
    page = _useState224[0],
    setPage = _useState224[1];
  const _useState225 = useState({
      events: [],
      actors: [],
      total: 0,
      totalPages: 1
    }),
    _useState226 = _slicedToArray(_useState225, 2),
    result = _useState226[0],
    setResult = _useState226[1];
  const _useState227 = useState(""),
    _useState228 = _slicedToArray(_useState227, 2),
    error = _useState228[0],
    setError = _useState228[1];
  const _useState229 = useState(true),
    _useState230 = _slicedToArray(_useState229, 2),
    loading = _useState230[0],
    setLoading = _useState230[1];
  useEffect(() => {
    producerRequest("/api/producer/dashboard").then(data => setProjects(data.projects || [])).catch(() => {});
  }, [refreshKey]);
  useEffect(() => {
    let alive = true;
    const query = new URLSearchParams({
      page: String(page),
      pageSize: "30"
    });
    Object.entries(filters).forEach(_ref137 => {
      let _ref138 = _slicedToArray(_ref137, 2),
        key = _ref138[0],
        value = _ref138[1];
      return value && query.set(key, value);
    });
    setLoading(true);
    producerRequest("/api/audit/events?" + query).then(data => {
      if (alive) {
        setResult(data);
        setError("");
      }
    }).catch(e => alive && setError(e.message)).finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [page, filters.projectId, filters.actorUserId, filters.action, filters.from, filters.to, refreshKey]);
  function change(key, value) {
    setFilters(current => ({
      ...current,
      [key]: value
    }));
    setPage(1);
  }
  return React.createElement("main", {
    className: "producer-main producer-history-page"
  }, React.createElement("header", {
    className: "producer-page-heading"
  }, React.createElement("div", null, React.createElement("span", {
    className: "producer-eyebrow"
  }, "\u041E\u0411\u0429\u0418\u0419 \u0416\u0423\u0420\u041D\u0410\u041B"), React.createElement("h1", null, "\u0418\u0441\u0442\u043E\u0440\u0438\u044F"), React.createElement("p", null, "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D\u043D\u044B\u0435 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u0432\u043E \u0432\u0441\u0435\u0445 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0445 \u043F\u0440\u043E\u0435\u043A\u0442\u0430\u0445.")), React.createElement("b", null, result.total, " \u0441\u043E\u0431\u044B\u0442\u0438\u0439")), React.createElement("div", {
    className: "producer-history-filters"
  }, React.createElement("select", {
    "aria-label": "\u0424\u0438\u043B\u044C\u0442\u0440 \u0438\u0441\u0442\u043E\u0440\u0438\u0438 \u043F\u043E \u043F\u0440\u043E\u0435\u043A\u0442\u0443",
    value: filters.projectId,
    onChange: e => change("projectId", e.target.value)
  }, React.createElement("option", {
    value: ""
  }, "\u0412\u0441\u0435 \u043F\u0440\u043E\u0435\u043A\u0442\u044B"), projects.map(project => React.createElement("option", {
    key: project.id,
    value: project.id
  }, project.name))), React.createElement("select", {
    "aria-label": "\u0424\u0438\u043B\u044C\u0442\u0440 \u0438\u0441\u0442\u043E\u0440\u0438\u0438 \u043F\u043E \u0430\u0432\u0442\u043E\u0440\u0443",
    value: filters.actorUserId,
    onChange: e => change("actorUserId", e.target.value)
  }, React.createElement("option", {
    value: ""
  }, "\u0412\u0441\u0435 \u0430\u0432\u0442\u043E\u0440\u044B"), (result.actors || []).map(actor => React.createElement("option", {
    key: String(actor.id) + actor.name,
    value: actor.id
  }, actor.name))), React.createElement("select", {
    "aria-label": "\u0424\u0438\u043B\u044C\u0442\u0440 \u0438\u0441\u0442\u043E\u0440\u0438\u0438 \u043F\u043E \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044E",
    value: filters.action,
    onChange: e => change("action", e.target.value)
  }, React.createElement("option", {
    value: ""
  }, "\u0412\u0441\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F"), Object.entries(PRODUCER_AUDIT_ACTIONS).map(_ref139 => {
    let _ref140 = _slicedToArray(_ref139, 2),
      id = _ref140[0],
      label = _ref140[1];
    return React.createElement("option", {
      key: id,
      value: id
    }, label);
  })), React.createElement(ProducerDateField, {
    label: "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0441 \u0434\u0430\u0442\u044B",
    value: filters.from,
    onChange: value => change("from", value)
  }), React.createElement(ProducerDateField, {
    label: "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u043F\u043E \u0434\u0430\u0442\u0443",
    value: filters.to,
    onChange: value => change("to", value)
  })), error && React.createElement("div", {
    className: "producer-inline-error"
  }, error), loading ? React.createElement("div", {
    className: "producer-loading"
  }, "\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u044E \u0438\u0441\u0442\u043E\u0440\u0438\u044E\u2026") : React.createElement("div", {
    className: "producer-history-feed"
  }, result.events.length ? result.events.map(event => {
    var _event$details2;
    return React.createElement("details", {
      key: event.id
    }, React.createElement("summary", null, React.createElement("time", null, new Date(event.occurredAt).toLocaleString("ru-RU")), React.createElement("strong", null, event.userName || "Система"), React.createElement("span", null, React.createElement("b", null, PRODUCER_AUDIT_ACTIONS[event.action] || event.action), " ", PRODUCER_AUDIT_ENTITIES[event.entity] || event.entity, (_event$details2 = event.details) !== null && _event$details2 !== void 0 && _event$details2.label ? ": " + event.details.label : ""), React.createElement("em", null, event.projectName || "Общие настройки")), React.createElement("div", null, (event.changes || []).length ? (event.changes || []).map((item, index) => React.createElement("p", {
      key: item.field + index
    }, React.createElement("b", null, PRODUCER_AUDIT_FIELDS[item.field] || item.field, ":"), " ", producerAuditValue(item.before), " ", React.createElement("i", null, "\u2192"), " ", producerAuditValue(item.after))) : React.createElement("p", null, "\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0445 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0439 \u043D\u0435\u0442.")));
  }) : React.createElement("p", {
    className: "producer-history-empty"
  }, "\u041F\u043E \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u043C \u0444\u0438\u043B\u044C\u0442\u0440\u0430\u043C \u0437\u0430\u043F\u0438\u0441\u0435\u0439 \u043D\u0435\u0442.")), React.createElement("div", {
    className: "producer-history-pages"
  }, React.createElement("button", {
    disabled: page <= 1,
    onClick: () => setPage(value => value - 1)
  }, "\u2190 \u041D\u043E\u0432\u0435\u0435"), React.createElement("span", null, "\u0421\u0442\u0440\u0430\u043D\u0438\u0446\u0430 ", result.page || page, " \u0438\u0437 ", result.totalPages || 1), React.createElement("button", {
    disabled: page >= (result.totalPages || 1),
    onClick: () => setPage(value => value + 1)
  }, "\u0421\u0442\u0430\u0440\u0435\u0435 \u2192")));
}
function ProducerBlockNode(_ref141) {
  let block = _ref141.block,
    onOpen = _ref141.onOpen;
  const statusLabel = {
    done: "Готово",
    active: "В работе",
    planned: "Запланировано",
    paused: "Пауза"
  }[block.status] || block.status;
  const dueState = producerDueState(block.deadline, block.status === "done");
  return React.createElement("button", {
    className: `producer-map-node ${block.status} due-${dueState}`,
    onClick: () => onOpen(block.id)
  }, React.createElement("span", {
    className: "producer-node-status"
  }, statusLabel), React.createElement("strong", null, block.name), React.createElement("small", {
    className: "producer-node-owner"
  }, React.createElement(ProducerAvatar, {
    person: {
      id: block.ownerPersonId,
      name: block.ownerName
    },
    size: "tiny"
  }), block.ownerName || "Ответственный не указан"), block.warningCount > 0 && React.createElement("span", {
    className: "producer-node-warning"
  }, "! ", block.warningCount, " \u0442\u0440\u0435\u0431\u0443\u0435\u0442 \u0432\u043D\u0438\u043C\u0430\u043D\u0438\u044F"), React.createElement("div", null, React.createElement(ProducerProgress, {
    done: block.completedTasks,
    total: block.totalTasks
  }), React.createElement("time", {
    className: dueState
  }, producerDate(block.deadline))));
}
function ProducerProjectMap(_ref142) {
  var _people$;
  let projectId = _ref142.projectId,
    people = _ref142.people,
    go = _ref142.go,
    toast = _ref142.toast;
  const _useState231 = useState(null),
    _useState232 = _slicedToArray(_useState231, 2),
    result = _useState232[0],
    setResult = _useState232[1];
  const _useState233 = useState(""),
    _useState234 = _slicedToArray(_useState233, 2),
    error = _useState234[0],
    setError = _useState234[1];
  const _useState235 = useState(false),
    _useState236 = _slicedToArray(_useState235, 2),
    showCreate = _useState236[0],
    setShowCreate = _useState236[1];
  const _useState237 = useState(false),
    _useState238 = _slicedToArray(_useState237, 2),
    saving = _useState238[0],
    setSaving = _useState238[1];
  const _useState239 = useState({
      name: "",
      description: "",
      seriesId: "",
      ownerPersonId: ((_people$ = people[0]) === null || _people$ === void 0 ? void 0 : _people$.id) || "",
      startDate: "",
      deadline: "",
      status: "planned"
    }),
    _useState240 = _slicedToArray(_useState239, 2),
    form = _useState240[0],
    setForm = _useState240[1];
  const load = () => producerRequest("/api/producer/projects/" + encodeURIComponent(projectId)).then(setResult).catch(e => setError(e.message));
  useEffect(() => {
    load();
  }, [projectId]);
  async function createBlock(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const created = await producerRequest("/api/producer/projects/" + encodeURIComponent(projectId) + "/blocks", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          seriesId: form.seriesId || null,
          startDate: form.startDate || null,
          deadline: form.deadline || null
        })
      });
      setShowCreate(false);
      setForm({
        ...form,
        name: "",
        description: "",
        startDate: "",
        deadline: ""
      });
      await load();
      go("block", created.id);
      toast("Блок создан и сохранён");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  if (!result) return React.createElement("main", {
    className: "producer-main"
  }, error ? React.createElement("div", {
    className: "producer-error"
  }, error) : React.createElement("div", {
    className: "producer-loading"
  }, "\u0421\u0442\u0440\u043E\u044E \u043A\u0430\u0440\u0442\u0443 \u043F\u0440\u043E\u0435\u043A\u0442\u0430\u2026"));
  const common = result.blocks.filter(block => !block.seriesId);
  return React.createElement("main", {
    className: "producer-main producer-map-page"
  }, React.createElement("div", {
    className: "producer-breadcrumb"
  }, React.createElement("button", {
    onClick: () => go("dashboard")
  }, "\u2190 \u0412\u0441\u0435 \u043F\u0440\u043E\u0435\u043A\u0442\u044B"), React.createElement("span", null, "/"), React.createElement("b", null, result.project.name)), React.createElement("section", {
    className: "producer-project-hero",
    style: {
      "--project-color": result.project.color
    }
  }, React.createElement("div", {
    className: "producer-cover"
  }, result.project.abbr || result.project.name.slice(0, 2)), React.createElement("div", null, React.createElement("span", {
    className: "producer-eyebrow"
  }, "\u041A\u0410\u0420\u0422\u0410 \u041F\u0420\u041E\u0415\u041A\u0422\u0410"), React.createElement("h1", null, result.project.name), React.createElement("p", null, result.project.description || "Описание проекта пока не добавлено.")), React.createElement("button", {
    className: "producer-primary",
    onClick: () => setShowCreate(true)
  }, "\uFF0B \u041D\u043E\u0432\u044B\u0439 \u0431\u043B\u043E\u043A")), React.createElement("section", {
    className: "producer-map-section"
  }, React.createElement("div", {
    className: "producer-map-title"
  }, React.createElement("div", null, React.createElement("small", null, "\u041E\u0411\u0429\u0410\u042F \u041B\u0418\u041D\u0418\u042F"), React.createElement("h2", null, "\u041E\u0431\u0449\u0438\u0435 \u044D\u0442\u0430\u043F\u044B")), React.createElement("span", null, common.length, " \u0431\u043B\u043E\u043A\u043E\u0432")), React.createElement("div", {
    className: "producer-map-track"
  }, common.length ? common.map((block, index) => React.createElement(React.Fragment, {
    key: block.id
  }, React.createElement(ProducerBlockNode, {
    block: block,
    onOpen: id => go("block", id)
  }), index < common.length - 1 && React.createElement("i", {
    className: "producer-map-connector"
  }))) : React.createElement("div", {
    className: "producer-empty-map"
  }, "\u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u043F\u0435\u0440\u0432\u044B\u0439 \u043E\u0431\u0449\u0438\u0439 \u0431\u043B\u043E\u043A \u043F\u0440\u043E\u0435\u043A\u0442\u0430"))), React.createElement("section", {
    className: "producer-series-map"
  }, React.createElement("div", {
    className: "producer-map-title"
  }, React.createElement("div", null, React.createElement("small", null, "\u0421\u0415\u0420\u0418\u0419\u041D\u042B\u0415 \u0412\u0415\u0422\u041A\u0418"), React.createElement("h2", null, "\u0420\u0430\u0431\u043E\u0442\u0430 \u043F\u043E \u0441\u0435\u0440\u0438\u044F\u043C"))), result.series.map(series => {
    const blocks = result.blocks.filter(block => block.seriesId === series.id);
    return React.createElement("div", {
      className: "producer-series-row",
      key: series.id
    }, React.createElement("div", {
      className: "producer-series-label"
    }, React.createElement("span", null, String(series.order || 1).padStart(2, "0")), React.createElement("strong", null, series.name)), React.createElement("div", {
      className: "producer-map-track"
    }, blocks.length ? blocks.map((block, index) => React.createElement(React.Fragment, {
      key: block.id
    }, React.createElement(ProducerBlockNode, {
      block: block,
      onOpen: id => go("block", id)
    }), index < blocks.length - 1 && React.createElement("i", {
      className: "producer-map-connector"
    }))) : React.createElement("div", {
      className: "producer-empty-map compact"
    }, "\u0411\u043B\u043E\u043A\u043E\u0432 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442")));
  })), showCreate && React.createElement("div", {
    className: "producer-modal-backdrop",
    onMouseDown: e => {
      if (e.target === e.currentTarget) setShowCreate(false);
    }
  }, React.createElement("form", {
    className: "producer-modal",
    onSubmit: createBlock
  }, React.createElement("div", {
    className: "producer-modal-head"
  }, React.createElement("div", null, React.createElement("small", null, "\u041D\u041E\u0412\u042B\u0419 \u042D\u0422\u0410\u041F"), React.createElement("h2", null, "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0431\u043B\u043E\u043A")), React.createElement("button", {
    type: "button",
    onClick: () => setShowCreate(false)
  }, "\xD7")), React.createElement("label", null, "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435", React.createElement("input", {
    autoFocus: true,
    value: form.name,
    onChange: e => setForm({
      ...form,
      name: e.target.value
    }),
    placeholder: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, \u041F\u0440\u0435\u043F\u0440\u043E\u0434\u0430\u043A\u0448\u043D",
    required: true
  })), React.createElement("label", null, "\u041A\u043E\u0440\u043E\u0442\u043A\u043E\u0435 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435", React.createElement("textarea", {
    value: form.description,
    onChange: e => setForm({
      ...form,
      description: e.target.value
    }),
    placeholder: "\u0427\u0442\u043E \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0441\u0434\u0435\u043B\u0430\u043D\u043E \u0432 \u044D\u0442\u043E\u043C \u0431\u043B\u043E\u043A\u0435"
  })), React.createElement("div", {
    className: "producer-form-row"
  }, React.createElement("label", null, "\u0421\u0435\u0440\u0438\u044F", React.createElement("select", {
    value: form.seriesId,
    onChange: e => setForm({
      ...form,
      seriesId: e.target.value
    })
  }, React.createElement("option", {
    value: ""
  }, "\u041E\u0431\u0449\u0438\u0439 \u0431\u043B\u043E\u043A \u043F\u0440\u043E\u0435\u043A\u0442\u0430"), result.series.map(item => React.createElement("option", {
    key: item.id,
    value: item.id
  }, item.name)))), React.createElement("label", null, "\u041E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439", React.createElement("select", {
    value: form.ownerPersonId,
    onChange: e => setForm({
      ...form,
      ownerPersonId: e.target.value
    }),
    required: true
  }, React.createElement("option", {
    value: ""
  }, "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435"), people.map(item => React.createElement("option", {
    key: item.id,
    value: item.id
  }, item.name))))), React.createElement("div", {
    className: "producer-form-row"
  }, React.createElement("label", null, "\u041D\u0430\u0447\u0430\u043B\u043E", React.createElement(ProducerDateField, {
    label: "\u0414\u0430\u0442\u0430 \u043D\u0430\u0447\u0430\u043B\u0430 \u0431\u043B\u043E\u043A\u0430",
    value: form.startDate,
    onChange: value => setForm({
      ...form,
      startDate: value
    })
  })), React.createElement("label", null, "\u0421\u0440\u043E\u043A", React.createElement(ProducerDateField, {
    label: "\u0421\u0440\u043E\u043A \u0431\u043B\u043E\u043A\u0430",
    value: form.deadline,
    onChange: value => setForm({
      ...form,
      deadline: value
    })
  }))), React.createElement("label", null, "\u0421\u0442\u0430\u0442\u0443\u0441", React.createElement("select", {
    value: form.status,
    onChange: e => setForm({
      ...form,
      status: e.target.value
    })
  }, React.createElement("option", {
    value: "planned"
  }, "\u0417\u0430\u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043E"), React.createElement("option", {
    value: "active"
  }, "\u0412 \u0440\u0430\u0431\u043E\u0442\u0435"), React.createElement("option", {
    value: "paused"
  }, "\u041F\u0430\u0443\u0437\u0430"), React.createElement("option", {
    value: "done"
  }, "\u0413\u043E\u0442\u043E\u0432\u043E"))), error && React.createElement("div", {
    className: "producer-inline-error"
  }, error), React.createElement("div", {
    className: "producer-modal-actions"
  }, React.createElement("button", {
    type: "button",
    onClick: () => setShowCreate(false)
  }, "\u041E\u0442\u043C\u0435\u043D\u0430"), React.createElement("button", {
    className: "producer-primary",
    disabled: saving
  }, saving ? "Сохраняю…" : "Создать блок")))));
}
function ProducerTaskRow(_ref143) {
  let task = _ref143.task,
    people = _ref143.people,
    groups = _ref143.groups,
    onChange = _ref143.onChange;
  const _useState241 = useState(false),
    _useState242 = _slicedToArray(_useState241, 2),
    busy = _useState242[0],
    setBusy = _useState242[1];
  const _useState243 = useState(false),
    _useState244 = _slicedToArray(_useState243, 2),
    editing = _useState244[0],
    setEditing = _useState244[1];
  const _useState245 = useState({
      title: task.title,
      internalComment: task.internalComment || "",
      groupId: task.groupId || "",
      assigneePersonId: task.assigneePersonId || "",
      responsiblePersonId: task.responsiblePersonId || "",
      deadline: task.deadline || ""
    }),
    _useState246 = _slicedToArray(_useState245, 2),
    draft = _useState246[0],
    setDraft = _useState246[1];
  useEffect(() => {
    if (!editing) setDraft({
      title: task.title,
      internalComment: task.internalComment || "",
      groupId: task.groupId || "",
      assigneePersonId: task.assigneePersonId || "",
      responsiblePersonId: task.responsiblePersonId || "",
      deadline: task.deadline || ""
    });
  }, [task.title, task.internalComment, task.groupId, task.assigneePersonId, task.responsiblePersonId, task.deadline, editing]);
  async function update(patch) {
    setBusy(true);
    try {
      await onChange(task.id, patch);
    } catch (error) {} finally {
      setBusy(false);
    }
  }
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    try {
      await onChange(task.id, {
        ...draft,
        groupId: draft.groupId || null,
        responsiblePersonId: draft.responsiblePersonId || null,
        deadline: draft.deadline || null
      });
      setEditing(false);
    } catch (error) {} finally {
      setBusy(false);
    }
  }
  const dueState = producerDueState(task.deadline, task.completed);
  return React.createElement("div", {
    id: "producer-task-" + task.id,
    className: "producer-task-item due-" + dueState + (task.completed ? " complete" : "") + (busy ? " busy" : "")
  }, React.createElement("div", {
    className: "producer-task-row"
  }, React.createElement("label", {
    className: "producer-check",
    title: task.completed ? "Вернуть в работу" : "Отметить выполненной"
  }, React.createElement("input", {
    "aria-label": task.completed ? "Вернуть задачу в работу" : "Выполнить задачу",
    type: "checkbox",
    checked: task.completed,
    onChange: e => update({
      completed: e.target.checked
    })
  }), React.createElement("span", null, "\u2713")), React.createElement("button", {
    className: "producer-task-copy",
    onClick: () => setEditing(value => !value)
  }, React.createElement("strong", null, task.title), React.createElement("small", null, task.responsibleName ? "Ответственный: " + task.responsibleName : "Без отдельного ответственного"), task.internalComment && React.createElement("em", {
    title: task.internalComment
  }, "\u25CC ", task.internalComment)), React.createElement("div", {
    className: "producer-task-assignee"
  }, React.createElement(ProducerAvatar, {
    person: {
      id: task.assigneePersonId,
      name: task.assigneeName
    },
    size: "tiny"
  }), React.createElement("select", {
    "aria-label": "Исполнитель задачи " + task.title,
    value: task.assigneePersonId || "",
    onChange: e => update({
      assigneePersonId: e.target.value
    })
  }, people.map(person => React.createElement("option", {
    key: person.id,
    value: person.id
  }, person.name)))), React.createElement("time", {
    className: dueState,
    title: producerRelativeDue(task.deadline)
  }, producerDate(task.deadline)), React.createElement("button", {
    className: "producer-edit-task",
    onClick: () => setEditing(value => !value),
    "aria-label": "Изменить задачу " + task.title
  }, editing ? "Скрыть" : "Изменить")), editing && React.createElement("form", {
    className: "producer-task-editor",
    onSubmit: save
  }, React.createElement("label", null, "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435", React.createElement("input", {
    autoFocus: true,
    value: draft.title,
    onChange: e => setDraft({
      ...draft,
      title: e.target.value
    }),
    required: true
  })), React.createElement("label", {
    className: "producer-task-comment-field"
  }, "\u0412\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0438\u0439 \u043A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439", React.createElement("textarea", {
    value: draft.internalComment,
    onChange: e => setDraft({
      ...draft,
      internalComment: e.target.value
    }),
    placeholder: "\u041A\u043E\u043D\u0442\u0435\u043A\u0441\u0442, \u0434\u043E\u0433\u043E\u0432\u043E\u0440\u0451\u043D\u043D\u043E\u0441\u0442\u044C \u0438\u043B\u0438 \u0432\u0430\u0436\u043D\u0430\u044F \u0434\u0435\u0442\u0430\u043B\u044C \u0434\u043B\u044F \u043A\u043E\u043C\u0430\u043D\u0434\u044B"
  })), React.createElement("label", null, "\u0418\u0441\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C", React.createElement("select", {
    value: draft.assigneePersonId,
    onChange: e => setDraft({
      ...draft,
      assigneePersonId: e.target.value
    }),
    required: true
  }, people.map(person => React.createElement("option", {
    key: person.id,
    value: person.id
  }, person.name)))), React.createElement("label", null, "\u041E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439", React.createElement("select", {
    value: draft.responsiblePersonId,
    onChange: e => setDraft({
      ...draft,
      responsiblePersonId: e.target.value
    })
  }, React.createElement("option", {
    value: ""
  }, "\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D"), people.map(person => React.createElement("option", {
    key: person.id,
    value: person.id
  }, person.name)))), React.createElement("label", null, "\u0413\u0440\u0443\u043F\u043F\u0430", React.createElement("select", {
    value: draft.groupId,
    onChange: e => setDraft({
      ...draft,
      groupId: e.target.value
    })
  }, React.createElement("option", {
    value: ""
  }, "\u0411\u0435\u0437 \u0433\u0440\u0443\u043F\u043F\u044B"), groups.map(group => React.createElement("option", {
    key: group.id,
    value: group.id
  }, group.name)))), React.createElement("label", null, "\u0421\u0440\u043E\u043A", React.createElement(ProducerDateField, {
    label: "Срок задачи " + task.title,
    value: draft.deadline,
    onChange: value => setDraft({
      ...draft,
      deadline: value
    })
  })), React.createElement("div", {
    className: "producer-task-editor-actions"
  }, React.createElement("button", {
    type: "button",
    onClick: () => setEditing(false)
  }, "\u041E\u0442\u043C\u0435\u043D\u0430"), React.createElement("button", {
    className: "producer-primary",
    disabled: busy
  }, "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C"))));
}
function ProducerQuickTask(_ref144) {
  var _people$2;
  let groupId = _ref144.groupId,
    people = _ref144.people,
    onCreate = _ref144.onCreate;
  const _useState247 = useState(false),
    _useState248 = _slicedToArray(_useState247, 2),
    open = _useState248[0],
    setOpen = _useState248[1];
  const _useState249 = useState(false),
    _useState250 = _slicedToArray(_useState249, 2),
    busy = _useState250[0],
    setBusy = _useState250[1];
  const _useState251 = useState(""),
    _useState252 = _slicedToArray(_useState251, 2),
    title = _useState252[0],
    setTitle = _useState252[1];
  const _useState253 = useState(""),
    _useState254 = _slicedToArray(_useState253, 2),
    comment = _useState254[0],
    setComment = _useState254[1];
  const _useState255 = useState(((_people$2 = people[0]) === null || _people$2 === void 0 ? void 0 : _people$2.id) || ""),
    _useState256 = _slicedToArray(_useState255, 2),
    assignee = _useState256[0],
    setAssignee = _useState256[1];
  async function submit(event) {
    event.preventDefault();
    if (!title.trim() || !assignee) return;
    setBusy(true);
    try {
      await onCreate({
        title,
        internalComment: comment,
        groupId: groupId || null,
        assigneePersonId: assignee
      });
      setTitle("");
      setComment("");
      setOpen(false);
    } catch (error) {} finally {
      setBusy(false);
    }
  }
  if (!open) return React.createElement("button", {
    className: "producer-quick-task-open",
    onClick: () => setOpen(true)
  }, "\uFF0B \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u0434\u0430\u0447\u0443");
  return React.createElement("form", {
    className: "producer-quick-task",
    onSubmit: submit
  }, React.createElement("input", {
    autoFocus: true,
    "aria-label": "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043D\u043E\u0432\u043E\u0439 \u0437\u0430\u0434\u0430\u0447\u0438",
    value: title,
    onChange: e => setTitle(e.target.value),
    placeholder: "\u0427\u0442\u043E \u043D\u0443\u0436\u043D\u043E \u0441\u0434\u0435\u043B\u0430\u0442\u044C?",
    required: true
  }), React.createElement("input", {
    "aria-label": "\u0412\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0438\u0439 \u043A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439 \u043D\u043E\u0432\u043E\u0439 \u0437\u0430\u0434\u0430\u0447\u0438",
    value: comment,
    onChange: e => setComment(e.target.value),
    placeholder: "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439 (\u043D\u0435\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E)"
  }), React.createElement("select", {
    "aria-label": "\u0418\u0441\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C \u043D\u043E\u0432\u043E\u0439 \u0437\u0430\u0434\u0430\u0447\u0438",
    value: assignee,
    onChange: e => setAssignee(e.target.value),
    required: true
  }, React.createElement("option", {
    value: ""
  }, "\u0418\u0441\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C"), people.map(person => React.createElement("option", {
    key: person.id,
    value: person.id
  }, person.name))), React.createElement("button", {
    className: "producer-primary",
    disabled: busy
  }, busy ? "…" : "Добавить"), React.createElement("button", {
    type: "button",
    onClick: () => {
      setOpen(false);
      setTitle("");
      setComment("");
    }
  }, "\u041E\u0442\u043C\u0435\u043D\u0430"));
}
function ProducerGroupHeader(_ref145) {
  let group = _ref145.group,
    done = _ref145.done,
    total = _ref145.total,
    onRename = _ref145.onRename,
    onDelete = _ref145.onDelete;
  const _useState257 = useState(false),
    _useState258 = _slicedToArray(_useState257, 2),
    renaming = _useState258[0],
    setRenaming = _useState258[1];
  const _useState259 = useState(group.name),
    _useState260 = _slicedToArray(_useState259, 2),
    name = _useState260[0],
    setName = _useState260[1];
  async function save(event) {
    event.preventDefault();
    if (!name.trim()) return;
    try {
      await onRename(group.id, name);
      setRenaming(false);
    } catch (error) {}
  }
  return React.createElement("div", {
    className: "producer-group-head"
  }, renaming ? React.createElement("form", {
    onSubmit: save
  }, React.createElement("input", {
    autoFocus: true,
    "aria-label": "\u041D\u043E\u0432\u043E\u0435 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0433\u0440\u0443\u043F\u043F\u044B",
    value: name,
    onChange: e => setName(e.target.value)
  }), React.createElement("button", null, "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C"), React.createElement("button", {
    type: "button",
    onClick: () => {
      setName(group.name);
      setRenaming(false);
    }
  }, "\u041E\u0442\u043C\u0435\u043D\u0430")) : React.createElement(React.Fragment, null, React.createElement("h3", null, group.name, React.createElement("span", null, done, "/", total)), React.createElement("div", null, React.createElement("button", {
    onClick: () => setRenaming(true)
  }, "\u041F\u0435\u0440\u0435\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u0442\u044C"), React.createElement("button", {
    className: "danger",
    onClick: () => onDelete(group, total)
  }, "\u0423\u0434\u0430\u043B\u0438\u0442\u044C"))));
}
function ProducerBlockSettings(_ref146) {
  let block = _ref146.block,
    seriesOptions = _ref146.seriesOptions,
    people = _ref146.people,
    onSave = _ref146.onSave;
  const _useState261 = useState({
      name: block.name,
      description: block.description || "",
      seriesId: block.seriesId || "",
      ownerPersonId: block.ownerPersonId || "",
      startDate: block.startDate || "",
      deadline: block.deadline || "",
      status: block.status
    }),
    _useState262 = _slicedToArray(_useState261, 2),
    draft = _useState262[0],
    setDraft = _useState262[1];
  const _useState263 = useState(false),
    _useState264 = _slicedToArray(_useState263, 2),
    busy = _useState264[0],
    setBusy = _useState264[1];
  useEffect(() => setDraft({
    name: block.name,
    description: block.description || "",
    seriesId: block.seriesId || "",
    ownerPersonId: block.ownerPersonId || "",
    startDate: block.startDate || "",
    deadline: block.deadline || "",
    status: block.status
  }), [block.id, block.name, block.description, block.seriesId, block.ownerPersonId, block.startDate, block.deadline, block.status]);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      await onSave({
        ...draft,
        seriesId: draft.seriesId || null,
        startDate: draft.startDate || null,
        deadline: draft.deadline || null
      });
    } catch (error) {} finally {
      setBusy(false);
    }
  }
  return React.createElement("details", {
    className: "producer-block-settings"
  }, React.createElement("summary", null, "\u041F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B \u0431\u043B\u043E\u043A\u0430 ", React.createElement("span", null, "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C")), React.createElement("form", {
    onSubmit: submit
  }, React.createElement("label", null, "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435", React.createElement("input", {
    value: draft.name,
    onChange: e => setDraft({
      ...draft,
      name: e.target.value
    }),
    required: true
  })), React.createElement("label", null, "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435", React.createElement("textarea", {
    value: draft.description,
    onChange: e => setDraft({
      ...draft,
      description: e.target.value
    })
  })), React.createElement("label", null, "\u0412\u0435\u0442\u043A\u0430", React.createElement("select", {
    value: draft.seriesId,
    onChange: e => setDraft({
      ...draft,
      seriesId: e.target.value
    })
  }, React.createElement("option", {
    value: ""
  }, "\u041E\u0431\u0449\u0438\u0439 \u0431\u043B\u043E\u043A \u043F\u0440\u043E\u0435\u043A\u0442\u0430"), seriesOptions.map(item => React.createElement("option", {
    key: item.id,
    value: item.id
  }, item.name)))), React.createElement("label", null, "\u041E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439", React.createElement("select", {
    value: draft.ownerPersonId,
    onChange: e => setDraft({
      ...draft,
      ownerPersonId: e.target.value
    }),
    required: true
  }, people.map(person => React.createElement("option", {
    key: person.id,
    value: person.id
  }, person.name)))), React.createElement("div", {
    className: "producer-form-row"
  }, React.createElement("label", null, "\u041D\u0430\u0447\u0430\u043B\u043E", React.createElement(ProducerDateField, {
    label: "\u0414\u0430\u0442\u0430 \u043D\u0430\u0447\u0430\u043B\u0430 \u0431\u043B\u043E\u043A\u0430",
    value: draft.startDate,
    onChange: value => setDraft({
      ...draft,
      startDate: value
    })
  })), React.createElement("label", null, "\u0421\u0440\u043E\u043A", React.createElement(ProducerDateField, {
    label: "\u0421\u0440\u043E\u043A \u0431\u043B\u043E\u043A\u0430",
    value: draft.deadline,
    onChange: value => setDraft({
      ...draft,
      deadline: value
    })
  }))), React.createElement("label", null, "\u0421\u0442\u0430\u0442\u0443\u0441", React.createElement("select", {
    value: draft.status,
    onChange: e => setDraft({
      ...draft,
      status: e.target.value
    })
  }, React.createElement("option", {
    value: "planned"
  }, "\u0417\u0430\u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043E"), React.createElement("option", {
    value: "active"
  }, "\u0412 \u0440\u0430\u0431\u043E\u0442\u0435"), React.createElement("option", {
    value: "paused"
  }, "\u041F\u0430\u0443\u0437\u0430"), React.createElement("option", {
    value: "done"
  }, "\u0413\u043E\u0442\u043E\u0432\u043E"))), React.createElement("button", {
    className: "producer-primary",
    disabled: busy
  }, busy ? "Сохраняю…" : "Сохранить параметры")));
}
function ProducerWarnings(_ref147) {
  let warnings = _ref147.warnings,
    onFocus = _ref147.onFocus;
  return React.createElement("section", {
    className: "producer-warnings" + (warnings.length ? " has-items" : " clear")
  }, React.createElement("div", {
    className: "producer-warnings-head"
  }, React.createElement("div", null, React.createElement("span", {
    className: "producer-eyebrow"
  }, "\u041A\u041E\u041D\u0422\u0420\u041E\u041B\u042C"), React.createElement("h2", null, "\u041F\u0440\u0435\u0434\u0443\u043F\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u044F")), React.createElement("b", null, warnings.length || "✓")), warnings.length ? React.createElement("div", {
    className: "producer-warning-list"
  }, warnings.map(item => React.createElement("button", {
    className: item.severity,
    key: item.id,
    onClick: () => onFocus(item)
  }, React.createElement("span", null, "!"), React.createElement("div", null, React.createElement("strong", null, item.title), React.createElement("p", null, item.message), React.createElement("small", null, "\u041D\u0430\u0436\u043C\u0438\u0442\u0435, \u0447\u0442\u043E\u0431\u044B \u0443\u0432\u0438\u0434\u0435\u0442\u044C \u043C\u0435\u0441\u0442\u043E \u043F\u0440\u043E\u0431\u043B\u0435\u043C\u044B \u2192")), React.createElement("time", null, producerDate(item.dueDate))))) : React.createElement("p", null, "\u041A\u0440\u0438\u0442\u0438\u0447\u043D\u044B\u0445 \u043F\u0440\u0435\u043F\u044F\u0442\u0441\u0442\u0432\u0438\u0439 \u043F\u043E \u0441\u0440\u043E\u043A\u0430\u043C \u0438 \u0441\u043E\u0433\u043B\u0430\u0441\u043E\u0432\u0430\u043D\u0438\u044F\u043C \u043D\u0435\u0442."));
}
function ProducerApprovalItem(_ref148) {
  let approval = _ref148.approval,
    tasks = _ref148.tasks,
    canDecide = _ref148.canDecide,
    onDecision = _ref148.onDecision;
  const _useState265 = useState(approval.decisionComment || ""),
    _useState266 = _slicedToArray(_useState265, 2),
    comment = _useState266[0],
    setComment = _useState266[1];
  const _useState267 = useState(false),
    _useState268 = _slicedToArray(_useState267, 2),
    busy = _useState268[0],
    setBusy = _useState268[1];
  useEffect(() => setComment(approval.status === "pending" ? "" : approval.decisionComment || ""), [approval.status, approval.decisionComment]);
  const linkedTask = tasks.find(task => task.id === approval.taskId);
  const status = approval.status === "pending" ? "pending" : approval.decision;
  const labels = {
    pending: "Ожидает решения",
    approved: "Согласовано",
    rejected: "Отклонено"
  };
  async function decide(value) {
    setBusy(true);
    try {
      await onDecision(approval.id, value, value ? comment : "");
    } catch (error) {} finally {
      setBusy(false);
    }
  }
  return React.createElement("article", {
    id: "producer-approval-" + approval.id,
    className: "producer-approval " + status
  }, React.createElement("div", {
    className: "producer-approval-main"
  }, React.createElement("div", {
    className: "producer-approval-title"
  }, React.createElement("span", null, labels[status] || status), approval.required && React.createElement("b", null, "\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E"), React.createElement("strong", null, approval.title)), React.createElement("p", null, linkedTask ? "Задача: " + linkedTask.title : "Весь блок", approval.dueDate ? " · срок " + producerDate(approval.dueDate) : ""), React.createElement("small", null, "\u0417\u0430\u043F\u0440\u043E\u0441\u0438\u043B: ", approval.requestedByName || "Система", approval.decidedByName ? " · решение: " + approval.decidedByName : ""), approval.decisionComment && approval.status !== "pending" && React.createElement("blockquote", null, approval.decisionComment)), approval.status === "pending" && canDecide && React.createElement("div", {
    className: "producer-approval-decision"
  }, React.createElement("input", {
    "aria-label": "Комментарий к согласованию " + approval.title,
    value: comment,
    onChange: e => setComment(e.target.value),
    placeholder: "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439 \u043A \u0440\u0435\u0448\u0435\u043D\u0438\u044E"
  }), React.createElement("div", null, React.createElement("button", {
    disabled: busy,
    onClick: () => decide("approved")
  }, "\u0421\u043E\u0433\u043B\u0430\u0441\u043E\u0432\u0430\u0442\u044C"), React.createElement("button", {
    className: "danger",
    disabled: busy,
    onClick: () => decide("rejected")
  }, "\u041E\u0442\u043A\u043B\u043E\u043D\u0438\u0442\u044C"))), approval.status === "pending" && !canDecide && React.createElement("em", null, "\u0420\u0435\u0448\u0435\u043D\u0438\u0435 \u043F\u0440\u0438\u043D\u0438\u043C\u0430\u0435\u0442 \u0440\u0443\u043A\u043E\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044C \u0438\u043B\u0438 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440"), approval.status !== "pending" && canDecide && React.createElement("button", {
    className: "producer-approval-reopen",
    disabled: busy,
    onClick: () => decide(null)
  }, "\u0412\u0435\u0440\u043D\u0443\u0442\u044C \u043D\u0430 \u0441\u043E\u0433\u043B\u0430\u0441\u043E\u0432\u0430\u043D\u0438\u0435"));
}
function ProducerApprovals(_ref149) {
  let approvals = _ref149.approvals,
    tasks = _ref149.tasks,
    canDecide = _ref149.canDecide,
    onCreate = _ref149.onCreate,
    onDecision = _ref149.onDecision;
  const _useState269 = useState(false),
    _useState270 = _slicedToArray(_useState269, 2),
    open = _useState270[0],
    setOpen = _useState270[1];
  const _useState271 = useState(false),
    _useState272 = _slicedToArray(_useState271, 2),
    busy = _useState272[0],
    setBusy = _useState272[1];
  const _useState273 = useState({
      title: "",
      taskId: "",
      dueDate: "",
      required: true
    }),
    _useState274 = _slicedToArray(_useState273, 2),
    draft = _useState274[0],
    setDraft = _useState274[1];
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      await onCreate({
        ...draft,
        taskId: draft.taskId || null,
        dueDate: draft.dueDate || null
      });
      setDraft({
        title: "",
        taskId: "",
        dueDate: "",
        required: true
      });
      setOpen(false);
    } catch (error) {} finally {
      setBusy(false);
    }
  }
  return React.createElement("section", {
    className: "producer-approvals-section"
  }, React.createElement("div", {
    className: "producer-section-head"
  }, React.createElement("div", null, React.createElement("span", {
    className: "producer-eyebrow"
  }, "\u0420\u0415\u0428\u0415\u041D\u0418\u042F"), React.createElement("h2", null, "\u0421\u043E\u0433\u043B\u0430\u0441\u043E\u0432\u0430\u043D\u0438\u044F")), React.createElement("b", null, approvals.filter(item => item.status === "pending").length, " \u043E\u0436\u0438\u0434\u0430\u044E\u0442")), React.createElement("div", {
    className: "producer-approval-list"
  }, approvals.length ? approvals.map(item => React.createElement(ProducerApprovalItem, {
    key: item.id,
    approval: item,
    tasks: tasks,
    canDecide: canDecide,
    onDecision: onDecision
  })) : React.createElement("p", {
    className: "producer-approval-empty"
  }, "\u0421\u043E\u0433\u043B\u0430\u0441\u043E\u0432\u0430\u043D\u0438\u0439 \u0432 \u044D\u0442\u043E\u043C \u0431\u043B\u043E\u043A\u0435 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442.")), !open ? React.createElement("button", {
    className: "producer-approval-create-open",
    onClick: () => setOpen(true)
  }, "\uFF0B \u0417\u0430\u043F\u0440\u043E\u0441\u0438\u0442\u044C \u0441\u043E\u0433\u043B\u0430\u0441\u043E\u0432\u0430\u043D\u0438\u0435") : React.createElement("form", {
    className: "producer-approval-create",
    onSubmit: submit
  }, React.createElement("label", null, "\u0427\u0442\u043E \u0441\u043E\u0433\u043B\u0430\u0441\u043E\u0432\u0430\u0442\u044C", React.createElement("input", {
    autoFocus: true,
    value: draft.title,
    onChange: e => setDraft({
      ...draft,
      title: e.target.value
    }),
    placeholder: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, \u0444\u0438\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u0441\u0446\u0435\u043D\u0430\u0440\u0438\u0439",
    required: true
  })), React.createElement("div", {
    className: "producer-form-row"
  }, React.createElement("label", null, "\u0421\u0432\u044F\u0437\u0430\u043D\u043D\u0430\u044F \u0437\u0430\u0434\u0430\u0447\u0430", React.createElement("select", {
    value: draft.taskId,
    onChange: e => setDraft({
      ...draft,
      taskId: e.target.value
    })
  }, React.createElement("option", {
    value: ""
  }, "\u0412\u0435\u0441\u044C \u0431\u043B\u043E\u043A"), tasks.map(task => React.createElement("option", {
    key: task.id,
    value: task.id
  }, task.title)))), React.createElement("label", null, "\u0421\u0440\u043E\u043A \u0440\u0435\u0448\u0435\u043D\u0438\u044F", React.createElement(ProducerDateField, {
    label: "\u0421\u0440\u043E\u043A \u0440\u0435\u0448\u0435\u043D\u0438\u044F",
    value: draft.dueDate,
    onChange: value => setDraft({
      ...draft,
      dueDate: value
    })
  }))), React.createElement("label", {
    className: "producer-approval-required"
  }, React.createElement("input", {
    type: "checkbox",
    checked: draft.required,
    onChange: e => setDraft({
      ...draft,
      required: e.target.checked
    })
  }), " \u041E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0435 \u0441\u043E\u0433\u043B\u0430\u0441\u043E\u0432\u0430\u043D\u0438\u0435 \u0432\u043B\u0438\u044F\u0435\u0442 \u043D\u0430 \u043F\u0440\u0435\u0434\u0443\u043F\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u044F"), React.createElement("div", {
    className: "producer-task-editor-actions"
  }, React.createElement("button", {
    type: "button",
    onClick: () => setOpen(false)
  }, "\u041E\u0442\u043C\u0435\u043D\u0430"), React.createElement("button", {
    className: "producer-primary",
    disabled: busy
  }, busy ? "Сохраняю…" : "Создать запрос"))));
}
function ProducerHistory(_ref150) {
  let events = _ref150.events;
  const actions = {
    create: "Создано",
    update: "Изменено",
    assign: "Назначен исполнитель",
    move: "Перемещено",
    reschedule: "Изменён срок",
    complete: "Выполнено",
    restore: "Возвращено в работу",
    delete: "Удалено",
    approve: "Согласовано",
    reject: "Отклонено"
  };
  return React.createElement("details", {
    className: "producer-history"
  }, React.createElement("summary", null, "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0431\u043B\u043E\u043A\u0430 ", React.createElement("b", null, events.length)), React.createElement("div", null, events.length ? events.map(event => {
    var _event$details3;
    return React.createElement("article", {
      key: event.id
    }, React.createElement("span", null, event.entity === "productionApproval" && event.action === "restore" ? "Возвращено на согласование" : actions[event.action] || event.action), React.createElement("strong", null, ((_event$details3 = event.details) === null || _event$details3 === void 0 ? void 0 : _event$details3.label) || "Изменение"), React.createElement("small", null, event.userName, " \xB7 ", new Date(event.occurredAt).toLocaleString("ru-RU")));
  }) : React.createElement("p", null, "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u043F\u043E\u044F\u0432\u0438\u0442\u0441\u044F \u043F\u043E\u0441\u043B\u0435 \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F.")));
}
function ProducerBlockPage(_ref151) {
  let blockId = _ref151.blockId,
    go = _ref151.go,
    toast = _ref151.toast;
  const _useState275 = useState(null),
    _useState276 = _slicedToArray(_useState275, 2),
    result = _useState276[0],
    setResult = _useState276[1];
  const _useState277 = useState(""),
    _useState278 = _slicedToArray(_useState277, 2),
    error = _useState278[0],
    setError = _useState278[1];
  const _useState279 = useState(""),
    _useState280 = _slicedToArray(_useState279, 2),
    groupName = _useState280[0],
    setGroupName = _useState280[1];
  const _useState281 = useState(false),
    _useState282 = _slicedToArray(_useState281, 2),
    saving = _useState282[0],
    setSaving = _useState282[1];
  const load = () => producerRequest("/api/producer/blocks/" + encodeURIComponent(blockId)).then(data => {
    setResult(data);
    setError("");
    return data;
  }).catch(e => {
    setError(e.message);
    return null;
  });
  useEffect(() => {
    load();
  }, [blockId]);
  async function addGroup(event) {
    event.preventDefault();
    if (!groupName.trim()) return;
    setSaving(true);
    try {
      await producerRequest("/api/producer/blocks/" + encodeURIComponent(blockId) + "/groups", {
        method: "POST",
        body: JSON.stringify({
          name: groupName
        })
      });
      setGroupName("");
      await load();
      toast("Группа создана");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  async function addTask(input) {
    try {
      await producerRequest("/api/producer/blocks/" + encodeURIComponent(blockId) + "/tasks", {
        method: "POST",
        body: JSON.stringify(input)
      });
      await load();
      toast("Задача создана и сохранена");
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }
  async function updateTask(taskId, patch) {
    try {
      await producerRequest("/api/producer/tasks/" + encodeURIComponent(taskId), {
        method: "PATCH",
        body: JSON.stringify(patch)
      });
      await load();
      toast(patch.completed === true ? "Задача выполнена" : patch.completed === false ? "Задача возвращена в работу" : "Изменения сохранены");
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }
  async function updateBlock(patch) {
    try {
      await producerRequest("/api/producer/blocks/" + encodeURIComponent(blockId), {
        method: "PATCH",
        body: JSON.stringify(patch)
      });
      await load();
      toast("Параметры блока сохранены");
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }
  async function renameGroup(groupId, name) {
    try {
      await producerRequest("/api/producer/groups/" + encodeURIComponent(groupId), {
        method: "PATCH",
        body: JSON.stringify({
          name
        })
      });
      await load();
      toast("Группа переименована");
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }
  async function addApproval(input) {
    try {
      await producerRequest("/api/producer/blocks/" + encodeURIComponent(blockId) + "/approvals", {
        method: "POST",
        body: JSON.stringify(input)
      });
      await load();
      toast("Запрос на согласование создан");
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }
  async function decideApproval(approvalId, decision, comment) {
    try {
      await producerRequest("/api/producer/approvals/" + encodeURIComponent(approvalId) + "/decision", {
        method: "PATCH",
        body: JSON.stringify({
          decision,
          comment
        })
      });
      await load();
      toast(decision === "approved" ? "Согласование принято" : decision === "rejected" ? "Согласование отклонено" : "Запрос возвращён на согласование");
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }
  async function deleteGroup(group, total) {
    if (!window.confirm(total ? `Удалить группу «${group.name}»? ${total} задач будут сохранены в разделе «Без группы».` : `Удалить пустую группу «${group.name}»?`)) return;
    try {
      const answer = await producerRequest("/api/producer/groups/" + encodeURIComponent(group.id), {
        method: "DELETE"
      });
      await load();
      toast(answer.movedTasks ? `Группа удалена, задач сохранено: ${answer.movedTasks}` : "Группа удалена");
    } catch (e) {
      setError(e.message);
    }
  }
  function focusWarning(item) {
    const targetId = item.taskId ? "producer-task-" + item.taskId : item.approvalId ? "producer-approval-" + item.approvalId : "producer-block-deadline";
    const target = document.getElementById(targetId);
    if (!target) return;
    target.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
    target.classList.add("producer-focus-flash");
    window.setTimeout(() => target.classList.remove("producer-focus-flash"), 1800);
  }
  if (!result) return React.createElement("main", {
    className: "producer-main"
  }, error ? React.createElement("div", {
    className: "producer-error"
  }, error) : React.createElement("div", {
    className: "producer-loading"
  }, "\u041E\u0442\u043A\u0440\u044B\u0432\u0430\u044E \u0431\u043B\u043E\u043A\u2026"));
  const block = result.block,
    project = result.project,
    series = result.series,
    seriesOptions = result.seriesOptions,
    groups = result.groups,
    tasks = result.tasks,
    _result$approvals = result.approvals,
    approvals = _result$approvals === void 0 ? [] : _result$approvals,
    _result$warnings = result.warnings,
    warnings = _result$warnings === void 0 ? [] : _result$warnings,
    people = result.people,
    history = result.history,
    _result$permissions = result.permissions,
    permissions = _result$permissions === void 0 ? {} : _result$permissions;
  const ungrouped = tasks.filter(task => !task.groupId);
  return React.createElement("main", {
    className: "producer-main producer-block-page"
  }, React.createElement("div", {
    className: "producer-breadcrumb"
  }, React.createElement("button", {
    onClick: () => go("dashboard")
  }, "\u0412\u0441\u0435 \u043F\u0440\u043E\u0435\u043A\u0442\u044B"), React.createElement("span", null, "/"), React.createElement("button", {
    onClick: () => go("project", project.id)
  }, project.name), React.createElement("span", null, "/"), React.createElement("b", null, block.name)), React.createElement("section", {
    className: "producer-block-hero",
    style: {
      "--project-color": project.color
    }
  }, React.createElement("div", null, React.createElement("span", {
    className: "producer-eyebrow"
  }, series ? series.name : "ОБЩИЙ БЛОК"), React.createElement("h1", null, block.name), React.createElement("p", null, block.description || "Описание можно добавить позже.")), React.createElement("div", {
    className: "producer-block-meta"
  }, React.createElement("span", null, React.createElement("small", null, "\u041E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439"), React.createElement("strong", {
    className: "producer-owner-with-avatar"
  }, React.createElement(ProducerAvatar, {
    person: {
      id: block.ownerPersonId,
      name: block.ownerName
    },
    size: "small"
  }), block.ownerName || "Не назначен")), React.createElement("span", {
    id: "producer-block-deadline",
    className: "due-" + producerDueState(block.deadline, block.status === "done")
  }, React.createElement("small", null, "\u041F\u0435\u0440\u0438\u043E\u0434"), React.createElement("strong", null, block.startDate ? producerDate(block.startDate) + " — " : "", producerDate(block.deadline)), React.createElement("em", null, producerRelativeDue(block.deadline))), React.createElement("span", null, React.createElement("small", null, "\u0413\u043E\u0442\u043E\u0432\u043D\u043E\u0441\u0442\u044C"), React.createElement(ProducerProgress, {
    done: block.completedTasks,
    total: block.totalTasks
  })))), error && React.createElement("div", {
    className: "producer-inline-error"
  }, error), React.createElement("section", {
    className: "producer-block-layout"
  }, React.createElement("div", {
    className: "producer-task-area"
  }, React.createElement(ProducerWarnings, {
    warnings: warnings,
    onFocus: focusWarning
  }), React.createElement("div", {
    className: "producer-section-head"
  }, React.createElement("div", null, React.createElement("span", {
    className: "producer-eyebrow"
  }, "\u0420\u0410\u0411\u041E\u0422\u0410"), React.createElement("h2", null, "\u0417\u0430\u0434\u0430\u0447\u0438 \u0431\u043B\u043E\u043A\u0430")), React.createElement("b", null, block.completedTasks, " \u0438\u0437 ", block.totalTasks)), groups.map(group => {
    const rows = tasks.filter(task => task.groupId === group.id);
    return React.createElement("article", {
      className: "producer-task-group",
      key: group.id
    }, React.createElement(ProducerGroupHeader, {
      group: group,
      done: rows.filter(t => t.completed).length,
      total: rows.length,
      onRename: renameGroup,
      onDelete: deleteGroup
    }), rows.length ? rows.map(task => React.createElement(ProducerTaskRow, {
      key: task.id,
      task: task,
      people: people,
      groups: groups,
      onChange: updateTask
    })) : React.createElement("p", null, "\u0412 \u0433\u0440\u0443\u043F\u043F\u0435 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442 \u0437\u0430\u0434\u0430\u0447"), React.createElement(ProducerQuickTask, {
      groupId: group.id,
      people: people,
      onCreate: addTask
    }));
  }), React.createElement("article", {
    className: "producer-task-group producer-ungrouped"
  }, React.createElement("div", {
    className: "producer-group-head"
  }, React.createElement("h3", null, "\u0411\u0435\u0437 \u0433\u0440\u0443\u043F\u043F\u044B", React.createElement("span", null, ungrouped.filter(t => t.completed).length, "/", ungrouped.length))), ungrouped.length ? ungrouped.map(task => React.createElement(ProducerTaskRow, {
    key: task.id,
    task: task,
    people: people,
    groups: groups,
    onChange: updateTask
  })) : React.createElement("p", null, "\u0421\u044E\u0434\u0430 \u043F\u043E\u043F\u0430\u0434\u0443\u0442 \u0437\u0430\u0434\u0430\u0447\u0438 \u0431\u0435\u0437 \u0433\u0440\u0443\u043F\u043F\u044B \u0438 \u0437\u0430\u0434\u0430\u0447\u0438 \u0438\u0437 \u0443\u0434\u0430\u043B\u0451\u043D\u043D\u044B\u0445 \u0433\u0440\u0443\u043F\u043F."), React.createElement(ProducerQuickTask, {
    groupId: null,
    people: people,
    onCreate: addTask
  })), React.createElement(ProducerApprovals, {
    approvals: approvals,
    tasks: tasks,
    canDecide: permissions.canDecideApprovals === true,
    onCreate: addApproval,
    onDecision: decideApproval
  }), React.createElement(ProducerHistory, {
    events: history
  })), React.createElement("aside", {
    className: "producer-create-panel"
  }, React.createElement("div", {
    className: "producer-side-intro"
  }, React.createElement("span", {
    className: "producer-eyebrow"
  }, "\u041D\u0410\u0421\u0422\u0420\u041E\u0419\u041A\u0410"), React.createElement("h2", null, "\u0411\u043B\u043E\u043A \u0438 \u0433\u0440\u0443\u043F\u043F\u044B"), React.createElement("p", null, "\u0417\u0430\u0434\u0430\u0447\u0438 \u0434\u043E\u0431\u0430\u0432\u043B\u044F\u044E\u0442\u0441\u044F \u043F\u0440\u044F\u043C\u043E \u0432 \u043D\u0443\u0436\u043D\u043E\u0439 \u0433\u0440\u0443\u043F\u043F\u0435 \u0441\u043B\u0435\u0432\u0430.")), React.createElement(ProducerBlockSettings, {
    block: block,
    seriesOptions: seriesOptions || [],
    people: people,
    onSave: updateBlock
  }), React.createElement("form", {
    className: "producer-group-form",
    onSubmit: addGroup
  }, React.createElement("h3", null, "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0433\u0440\u0443\u043F\u043F\u0443"), React.createElement("p", null, "\u0413\u0440\u0443\u043F\u043F\u0430 \u043E\u0431\u044A\u0435\u0434\u0438\u043D\u044F\u0435\u0442 \u0437\u0430\u0434\u0430\u0447\u0438 \u0432\u043D\u0443\u0442\u0440\u0438 \u044D\u0442\u043E\u0433\u043E \u0431\u043B\u043E\u043A\u0430."), React.createElement("div", null, React.createElement("input", {
    "aria-label": "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043D\u043E\u0432\u043E\u0439 \u0433\u0440\u0443\u043F\u043F\u044B",
    value: groupName,
    onChange: e => setGroupName(e.target.value),
    placeholder: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, \u041B\u043E\u043A\u0430\u0446\u0438\u0438"
  }), React.createElement("button", {
    disabled: saving || !groupName.trim()
  }, "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C"))))));
}
function ProducerWorkspace(_ref152) {
  let user = _ref152.user,
    data = _ref152.data,
    onExit = _ref152.onExit;
  const _useState283 = useState(() => producerInitialScreen()),
    _useState284 = _slicedToArray(_useState283, 2),
    screen = _useState284[0],
    setScreen = _useState284[1];
  const _useState285 = useState(""),
    _useState286 = _slicedToArray(_useState285, 2),
    toastMessage = _useState286[0],
    setToastMessage = _useState286[1];
  const _useState287 = useState(0),
    _useState288 = _slicedToArray(_useState287, 2),
    refreshKey = _useState288[0],
    setRefreshKey = _useState288[1];
  useEffect(() => {
    const update = () => setScreen(producerInitialScreen());
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  function go(type, id) {
    const staticSection = ["dashboard", "projects", "calendar", "history"].includes(type);
    const next = {
      type,
      id: staticSection ? "" : id
    };
    setScreen(next);
    window.location.hash = type === "dashboard" ? "producer" : staticSection ? `producer/${type}` : `producer/${type}/${encodeURIComponent(id)}`;
    window.scrollTo(0, 0);
  }
  function toast(message) {
    setToastMessage(message);
    setRefreshKey(value => value + 1);
    window.clearTimeout(ProducerWorkspace.toastTimer);
    ProducerWorkspace.toastTimer = window.setTimeout(() => setToastMessage(""), 2600);
  }
  return React.createElement(ProducerShell, {
    user: user,
    onHome: () => go("dashboard"),
    onExit: onExit,
    screen: screen,
    go: go
  }, screen.type === "dashboard" && React.createElement(ProducerDashboard, {
    go: go,
    refreshKey: refreshKey,
    user: user
  }), screen.type === "projects" && React.createElement(ProducerProjectsPage, {
    go: go,
    refreshKey: refreshKey
  }), screen.type === "calendar" && React.createElement(ProducerCalendarPage, {
    go: go,
    refreshKey: refreshKey
  }), screen.type === "history" && React.createElement(ProducerHistoryPage, {
    refreshKey: refreshKey
  }), screen.type === "project" && React.createElement(ProducerProjectMap, {
    projectId: screen.id,
    people: data.people || [],
    go: go,
    toast: toast
  }), screen.type === "block" && React.createElement(ProducerBlockPage, {
    blockId: screen.id,
    go: go,
    toast: toast
  }), React.createElement(ProducerToast, {
    message: toastMessage
  }));
}
function App() {
  var _data$projects$find2, _saveQueueRef$current5;
  const _useState289 = useState(null),
    _useState290 = _slicedToArray(_useState289, 2),
    rawData = _useState290[0],
    setRawData = _useState290[1];
  const _useState291 = useState(() => String(window.location.hash || "").startsWith("#producer") ? "producer" : "post"),
    _useState292 = _slicedToArray(_useState291, 2),
    workspace = _useState292[0],
    setWorkspace = _useState292[1];
  const _useState293 = useState("today"),
    _useState294 = _slicedToArray(_useState293, 2),
    view = _useState294[0],
    setView = _useState294[1];
  const _useState295 = useState(() => parseHash()),
    _useState296 = _slicedToArray(_useState295, 2),
    navState = _useState296[0],
    setNavState = _useState296[1];
  const _useState297 = useState("ok"),
    _useState298 = _slicedToArray(_useState297, 2),
    syncState = _useState298[0],
    setSyncState = _useState298[1];
  const _useState299 = useState(""),
    _useState300 = _slicedToArray(_useState299, 2),
    syncError = _useState300[0],
    setSyncError = _useState300[1];
  const _useState301 = useState(false),
    _useState302 = _slicedToArray(_useState301, 2),
    dayShiftsModal = _useState302[0],
    setDayShiftsModal = _useState302[1];
  const _useState303 = useState(null),
    _useState304 = _slicedToArray(_useState303, 2),
    ganttDay = _useState304[0],
    setGanttDay = _useState304[1];
  const _useState305 = useState(false),
    _useState306 = _slicedToArray(_useState305, 2),
    cmdPaletteOpen = _useState306[0],
    setCmdPaletteOpen = _useState306[1];
  const isMobile = useIsMobile(760);
  const _useState307 = useState(null),
    _useState308 = _slicedToArray(_useState307, 2),
    user = _useState308[0],
    setUser = _useState308[1];
  const _useState309 = useState(null),
    _useState310 = _slicedToArray(_useState309, 2),
    loginError = _useState310[0],
    setLoginError = _useState310[1];
  const saveTimer = useRef(null);
  const clientIdRef = useRef(Math.random().toString(36).slice(2));
  const saveQueueRef = useRef(null);
  const unsavedRef = useRef(false);
  const serverRevisionRef = useRef(null);
  const backupAccountRef = useRef(null);
  const logHistoryRef = useRef([]);
  const rawDataRef = useRef(null);
  rawDataRef.current = rawData;
  backupAccountRef.current = user;
  if (!saveQueueRef.current) saveQueueRef.current = createSaveQueue(payload => cloudSave({
    ...payload,
    _revision: serverRevisionRef.current ?? payload._revision
  }, clientIdRef.current).then(result => {
    serverRevisionRef.current = result._revision;
    return result;
  }), merged => {
    if (saveTimer.current) return;
    unsavedRef.current = false;
    logHistoryRef.current = merged.changelog || [];
    setSyncState("ok");
    setSyncError("");
    setRawData(merged);
    try {
      persistAccountBackup(backupAccountRef.current, merged);
    } catch (e) {}
  }, error => {
    if (!saveTimer.current) {
      setSyncState("error");
      setSyncError(error.message);
    }
  });
  const data = useMemo(() => {
    if (!rawData) return null;
    const d = {
      ...rawData
    };
    for (const key of SOFT_DELETE_KEYS) {
      if (Array.isArray(rawData[key])) d[key] = rawData[key].filter(x => !x.deleted);
    }
    return d;
  }, [rawData]);
  useEffect(() => {
    setSyncState("saving");
    let currentAccount = null;
    fetch("/api/auth/me", {
      credentials: "include"
    }).then(r => r.ok ? r.json() : null).then(d => {
      if (d) {
        setCsrfToken(d.csrfToken);
        if (d.user) {
          currentAccount = d.user;
          setUser(d.user);
        }
      }
    }).catch(() => {}).then(() => cloudLoad()).then(record => {
      var _record, _record$projects, _record$tasks, _record$people, _currentAccount2;
      serverRevisionRef.current = (_record = record) === null || _record === void 0 ? void 0 : _record._revision;
      const isReallyEmpty = !record || !((_record$projects = record.projects) !== null && _record$projects !== void 0 && _record$projects.length) && !((_record$tasks = record.tasks) !== null && _record$tasks !== void 0 && _record$tasks.length) && !((_record$people = record.people) !== null && _record$people !== void 0 && _record$people.length);
      if (isReallyEmpty) {
        var _record2, _currentAccount;
        record = normalizeLoadedData({
          _revision: (_record2 = record) === null || _record2 === void 0 ? void 0 : _record2._revision,
          projects: [],
          tasks: [],
          people: [],
          series: [],
          roles: DEMO_ROLES,
          stages: DEFAULT_STAGES,
          stageGroups: DEFAULT_STAGE_GROUPS,
          holidays: DEFAULT_HOLIDAYS,
          personAbsences: [],
          templates: [],
          changelog: []
        });
        setRawData(record);
        if (["admin", "lead"].includes((_currentAccount = currentAccount) === null || _currentAccount === void 0 ? void 0 : _currentAccount.role)) return cloudSave(record);
        return;
      }
      let migrated = false;
      if (!record.roles) {
        record.roles = DEMO_ROLES;
        migrated = true;
      }
      if (!record.stages || !record.stages.length) {
        record.stages = DEFAULT_STAGES;
        migrated = true;
      }
      if (!record.stageGroups || !record.stageGroups.length) {
        record.stageGroups = DEFAULT_STAGE_GROUPS;
        migrated = true;
      }
      if (!record.holidays) {
        record.holidays = DEFAULT_HOLIDAYS;
        migrated = true;
      }
      if (!record.personAbsences) {
        record.personAbsences = [];
        migrated = true;
      }
      if (!record.templates) {
        record.templates = [];
        migrated = true;
      }
      if (!record.changelog) {
        record.changelog = [];
        migrated = true;
      }
      if (!record.series) {
        record.series = [];
        (record.projects || []).forEach(proj => {
          (proj.series || []).forEach((name, idx) => {
            record.series.push({
              id: proj.id + "-" + name.toLowerCase().replace(/\s/g, "_"),
              projectId: proj.id,
              name,
              order: idx,
              shootStart: proj.shoot_start || "",
              shootEnd: proj.shoot_end || "",
              editStart: proj.edit_start || "",
              preOtkDate: proj.pre_otk || "",
              otkDate: proj.otk || "",
              airDate: "",
              airMode: proj.air_mode || "weekly",
              airDay: proj.air_weekday || 1,
              airTime: proj.air_time || "21:00"
            });
          });
        });
        migrated = true;
      }
      if ((record.tasks || []).some(t => t.seriesId === undefined)) {
        record.tasks = (record.tasks || []).map(t => {
          if (t.seriesId !== undefined) return t;
          const ser = (record.series || []).find(s => s.projectId === t.project && s.name === t.series);
          return {
            ...t,
            seriesId: ser ? ser.id : null,
            autogenerated: t.autogenerated || false
          };
        });
        migrated = true;
      }
      if ((record.series || []).some(s => !s.checklists || s.stageRanges === undefined)) {
        record.series = (record.series || []).map(s => ({
          checklists: [],
          notes: "",
          delivered: false,
          deliveredAt: "",
          stageRanges: {},
          ...s
        }));
        migrated = true;
      }
      if ((record.projects || []).some(p => !p.dossier)) {
        record.projects = (record.projects || []).map(p => p.dossier ? p : {
          ...p,
          dossier: {
            info: {},
            paths: [],
            accesses: [],
            links: [],
            notes: ""
          }
        });
        migrated = true;
      }
      if ((record.series || []).some(s => s.transitCode === undefined)) {
        record.series = (record.series || []).map(s => s.transitCode !== undefined ? s : {
          ...s,
          transitCode: "",
          transitVariants: ["", "", ""]
        });
        migrated = true;
      }
      if ((record.series || []).some(s => s.syncStart === undefined)) {
        record.series = (record.series || []).map(s => s.syncStart !== undefined ? s : {
          ...s,
          syncStart: ""
        });
        migrated = true;
      }
      if ((record.series || []).some(s => !s.assets)) {
        record.series = (record.series || []).map(s => s.assets ? s : {
          ...s,
          assets: []
        });
        migrated = true;
      }
      setRawData(record);
      if (migrated && ["admin", "lead"].includes((_currentAccount2 = currentAccount) === null || _currentAccount2 === void 0 ? void 0 : _currentAccount2.role)) return cloudSave(record);
    }).then(saved => {
      if (saved) {
        serverRevisionRef.current = saved._revision;
        setRawData(saved);
      }
      setSyncState("ok");
    }).catch(error => {
      try {
        const raw = currentAccount ? localStorage.getItem(accountBackupKey(currentAccount)) : null;
        if (raw) {
          const bk = JSON.parse(raw);
          if (bk !== null && bk !== void 0 && bk.data) {
            const safeBackup = normalizeLoadedData(bk.data);
            persistAccountBackup(currentAccount, safeBackup);
            unsavedRef.current = true;
            serverRevisionRef.current = safeBackup._revision ?? null;
            setRawData(safeBackup);
            setSyncState("error");
            setSyncError("Открыта локальная копия. Связь с сервером недоступна.");
            return;
          }
        }
      } catch (e) {}
      setRawData(normalizeLoadedData(null));
      setSyncState("error");
      if (currentAccount) setSyncError("Не удалось загрузить данные: " + error.message);
    }).catch(() => {});
  }, []);
  const histRef = useRef([]);
  const viewRef = useRef(view);
  viewRef.current = view;
  const pendingLogRef = useRef([]);
  useEffect(() => {
    const protectUnsaved = event => {
      var _saveQueueRef$current;
      if (unsavedRef.current || saveTimer.current || (_saveQueueRef$current = saveQueueRef.current) !== null && _saveQueueRef$current !== void 0 && _saveQueueRef$current.pending) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", protectUnsaved);
    return () => window.removeEventListener("beforeunload", protectUnsaved);
  }, []);
  function addLog(text) {
    pendingLogRef.current = [...pendingLogRef.current, {
      ts: Date.now(),
      text
    }];
  }
  function pushHistory(prev) {
    histRef.current = [...histRef.current.slice(-30), prev];
  }
  function doSave(d) {
    const newEntries = pendingLogRef.current;
    pendingLogRef.current = [];
    const prevLog = Array.isArray(d.changelog) ? d.changelog : [];
    const changelog = mergeChangelog(newEntries, logHistoryRef.current, prevLog);
    logHistoryRef.current = changelog;
    const payload = {
      ...d,
      changelog,
      _savedAt: Date.now(),
      _clientId: clientIdRef.current
    };
    if (!user) return;
    unsavedRef.current = true;
    clearTimeout(saveTimer.current);
    setSyncState("saving");
    setSyncError("");
    try {
      persistAccountBackup(user, payload);
    } catch (e) {}
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      const outgoing = {
        ...payload,
        changelog: mergeChangelog(pendingLogRef.current, logHistoryRef.current, payload.changelog)
      };
      logHistoryRef.current = outgoing.changelog;
      pendingLogRef.current = [];
      try {
        persistAccountBackup(user, outgoing);
      } catch (e) {}
      saveQueueRef.current.enqueue(outgoing);
    }, 1000);
  }
  function undo() {
    if (!histRef.current.length) return;
    const previous = histRef.current[histRef.current.length - 1];
    const prev = undoSnapshot(previous, rawDataRef.current);
    histRef.current = histRef.current.slice(0, -1);
    setRawData(prev);
    doSave(prev);
  }
  async function handleLogout() {
    var _saveQueueRef$current2;
    if (saveTimer.current || (_saveQueueRef$current2 = saveQueueRef.current) !== null && _saveQueueRef$current2 !== void 0 && _saveQueueRef$current2.pending) {
      alert("Дождитесь завершения сохранения перед выходом.");
      return;
    }
    if (unsavedRef.current && !window.confirm("Изменения ещё не сохранены на сервере. Локальная резервная копия останется на этом компьютере. Выйти?")) return;
    await doLogout();
    histRef.current = [];
    pendingLogRef.current = [];
    logHistoryRef.current = [];
    serverRevisionRef.current = null;
    unsavedRef.current = false;
    setRawData(normalizeLoadedData(null));
    setUser(null);
    setLoginError(null);
    setSyncError("");
  }
  function navigate(state) {
    setNavState(state);
    if (state) window.location.hash = `#${state.type}/${encodeURIComponent(state.id)}`;else history.pushState(null, "", location.pathname + location.search);
  }
  useEffect(() => {
    const onPop = () => setNavState(parseHash());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  useEffect(() => {
    function handle(e) {
      const ctrl = e.ctrlKey || e.metaKey;
      const inInput = e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT";
      if (e.key === "Escape") {
        if (cmdPaletteOpen) {
          e.preventDefault();
          setCmdPaletteOpen(false);
          return;
        }
        window.dispatchEvent(new CustomEvent("ppt-escape"));
      }
      if (ctrl && (e.key === "z" || e.code === "KeyZ") && !e.shiftKey && !inInput) {
        e.preventDefault();
        undo();
      }
      if (ctrl && (e.key === "k" || e.code === "KeyK") && !inInput) {
        e.preventDefault();
        setCmdPaletteOpen(o => !o);
      }
      if (e.altKey && e.code === "KeyN" && viewRef.current === "gantt") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("gantt-new-task"));
      }
    }
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [cmdPaletteOpen, user]);
  useEffect(() => {
    if (STORAGE_MODE !== "server") return;
    var reconnectTimer = null;
    var reconnectAttempts = 0;
    var currentES = null;
    function connectSSE() {
      if (currentES) {
        try {
          currentES.close();
        } catch (e) {}
      }
      var es = new EventSource(`${SERVER_URL}/api/events`);
      currentES = es;
      es.onmessage = function (e) {
        reconnectAttempts = 0;
        try {
          var _saveQueueRef$current3;
          var msg = JSON.parse(e.data);
          if (msg.clientId && msg.clientId !== clientIdRef.current && !unsavedRef.current && !saveTimer.current && !((_saveQueueRef$current3 = saveQueueRef.current) !== null && _saveQueueRef$current3 !== void 0 && _saveQueueRef$current3.pending)) {
            cloudLoad().then(function (d) {
              var _saveQueueRef$current4;
              if (d && !unsavedRef.current && !saveTimer.current && !((_saveQueueRef$current4 = saveQueueRef.current) !== null && _saveQueueRef$current4 !== void 0 && _saveQueueRef$current4.pending)) {
                serverRevisionRef.current = d._revision;
                histRef.current = [];
                logHistoryRef.current = d.changelog || [];
                setRawData(d);
              }
            }).catch(function () {});
          }
        } catch (e) {}
      };
      es.onerror = function () {
        es.close();
        currentES = null;
        reconnectAttempts++;
        var delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(connectSSE, delay);
      };
    }
    connectSSE();
    return function () {
      if (currentES) {
        try {
          currentES.close();
        } catch (e) {}
      }
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);
  function updateData(key, val) {
    setRawData(d => {
      pushHistory(d);
      let mergedVal = val;
      if (SOFT_DELETE_KEYS.includes(key) && Array.isArray(val)) {
        const deletedItems = (d[key] || []).filter(x => x.deleted && key !== "people");
        mergedVal = [...val, ...deletedItems.filter(x => !val.some(v => String(v.id) === String(x.id)))];
      }
      const newData = {
        ...d,
        [key]: mergedVal
      };
      doSave(newData);
      return newData;
    });
  }
  function deleteProject(projId) {
    if (!window.confirm("Удалить проект, его серии и задачи? Действие можно отменить через Ctrl+Z.")) return;
    const ts = Date.now();
    setRawData(d => {
      pushHistory(d);
      const newData = {
        ...d,
        projects: d.projects.map(p => p.id === projId ? {
          ...p,
          deleted: true,
          _updatedAt: ts
        } : p),
        series: (d.series || []).map(s => s.projectId === projId ? {
          ...s,
          deleted: true,
          _updatedAt: ts
        } : s),
        tasks: (d.tasks || []).map(t => t.project === projId ? {
          ...t,
          deleted: true,
          _updatedAt: ts
        } : t)
      };
      doSave(newData);
      return newData;
    });
    incrDelete("project", projId);
  }
  function batchUpdate(changes) {
    setRawData(d => {
      pushHistory(d);
      const merged = {
        ...d
      };
      for (const _ref153 of Object.entries(changes)) {
        var _ref154 = _slicedToArray(_ref153, 2);
        const key = _ref154[0];
        const val = _ref154[1];
        if (SOFT_DELETE_KEYS.includes(key) && Array.isArray(val)) {
          const deletedItems = (d[key] || []).filter(x => x.deleted);
          merged[key] = [...val, ...deletedItems.filter(x => !val.some(v => String(v.id) === String(x.id)))];
        } else {
          merged[key] = val;
        }
      }
      doSave(merged);
      return merged;
    });
  }
  const stagesCtxVal = useMemo(() => {
    const stagesArr = data !== null && data !== void 0 && data.stages && data.stages.length ? data.stages : DEFAULT_STAGES;
    const sorted = [...stagesArr].sort((a, b) => (a.order || 0) - (b.order || 0));
    const stageMap = Object.fromEntries(stagesArr.map(s => [s.id, s]));
    const stageGroups = data !== null && data !== void 0 && data.stageGroups && data.stageGroups.length ? data.stageGroups : DEFAULT_STAGE_GROUPS;
    const groupMap = Object.fromEntries(stageGroups.map(g => [g.id, g]));
    return {
      stageMap,
      sorted,
      stageGroups,
      groupMap
    };
  }, [data === null || data === void 0 ? void 0 : data.stages, data === null || data === void 0 ? void 0 : data.stageGroups]);
  const holidaysCtxVal = useMemo(() => (data === null || data === void 0 ? void 0 : data.holidays) || DEFAULT_HOLIDAYS, [data === null || data === void 0 ? void 0 : data.holidays]);
  const _useMemo = useMemo(() => {
      if (!data) return {
        ids: new Set(),
        details: []
      };
      const todayStr = daySort(formatDate(new Date()));
      return getConflicts(data.tasks.filter(t => daySort(t.day) >= todayStr && !t.cancelled), data.people, data.stages || DEFAULT_STAGES, data.projects, data.personAbsences || []);
    }, [data === null || data === void 0 ? void 0 : data.tasks, data === null || data === void 0 ? void 0 : data.people, data === null || data === void 0 ? void 0 : data.stages, data === null || data === void 0 ? void 0 : data.projects, data === null || data === void 0 ? void 0 : data.personAbsences]),
    conflictIds = _useMemo.ids,
    conflictDetails = _useMemo.details;
  const conflictCount = conflictDetails.filter(d => d.notify !== false).length;
  if (!user && !data) return React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      color: "#475569"
    }
  }, "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...");
  if (!data) return React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      color: "#475569"
    }
  }, "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0434\u0430\u043D\u043D\u044B\u0445...");
  if (!user) return React.createElement(LoginForm, {
    onLogin: (l, p) => {
      setLoginError(null);
      doLogin(l, p).then(r => {
        if (r.user) {
          setCsrfToken(r.csrfToken);
          setLoginError(null);
          setSyncState("saving");
          cloudLoad().then(rec => {
            if (rec) {
              serverRevisionRef.current = rec._revision;
              histRef.current = [];
              setRawData(rec);
            }
            setSyncState("ok");
            setUser(r.user);
          }).catch(error => {
            setRawData(normalizeLoadedData(null));
            setSyncError("Не удалось загрузить данные: " + error.message);
            setSyncState("error");
            setUser(r.user);
          });
        } else setLoginError(r.error || "Ошибка входа");
      });
    },
    error: loginError
  });
  const isViewer = user.role === "viewer";
  const isEditor = user.role === "editor";
  const isAdmin = user.role === "admin";
  const isLead = user.role === "lead";
  const isManager = user.role === "manager";
  const canManage = isAdmin || isLead || isManager;
  const canDeleteStructure = isAdmin || isLead;
  const canEdit = isAdmin || isLead || isManager || isEditor;
  const canManageProjectAssignments = isAdmin || isLead;
  const currentProjectKeys = currentUserProjectKeys(user, data);
  const currentManagerEntry = currentUserManagerEntry(user, data);
  function canEditProjectById(projectId) {
    if (isAdmin || isLead) return true;
    if (isManager) return projectAssignedToKeys(data.projects.find(p => p.id === projectId), currentProjectKeys);
    return canEdit;
  }
  window.PPT_CAN_SEE_TASK_NOTES = isAdmin || isLead || isManager;
  const isNA = user.role === "na";
  if (isNA) {
    return React.createElement("div", {
      style: {
        background: "#0f172a",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#64748b"
      }
    }, React.createElement("div", {
      style: {
        textAlign: "center"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 48,
        marginBottom: 16
      }
    }, "\uD83D\uDEAB"), React.createElement("h2", {
      style: {
        color: "#e2e8f0",
        margin: "0 0 8px 0"
      }
    }, "\u0414\u043E\u0441\u0442\u0443\u043F \u0437\u0430\u043F\u0440\u0435\u0449\u0451\u043D"), React.createElement("p", {
      style: {
        fontSize: 14,
        margin: 0
      }
    }, "\u0412\u0430\u0448 \u0430\u043A\u043A\u0430\u0443\u043D\u0442 \u0437\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D \u0434\u043B\u044F \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440\u0430 \u0434\u0430\u043D\u043D\u044B\u0445 \u0442\u0440\u0435\u043A\u0435\u0440\u0430."), React.createElement("p", {
      style: {
        fontSize: 12,
        marginTop: 16,
        color: "#475569"
      }
    }, user.display_name, " (", user.sam_name, ")"), React.createElement("button", {
      onClick: handleLogout,
      style: {
        marginTop: 20,
        background: "#334155",
        border: "none",
        borderRadius: 10,
        color: "#e2e8f0",
        fontSize: 13,
        cursor: "pointer",
        padding: "8px 20px",
        fontFamily: "inherit"
      }
    }, "\u0412\u044B\u0439\u0442\u0438")));
  }
  if (isViewer && data.projects && data.projects.length === 0) {
    return React.createElement("div", {
      style: {
        background: "#0f172a",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#64748b"
      }
    }, React.createElement("div", {
      style: {
        textAlign: "center",
        maxWidth: 400
      }
    }, React.createElement("div", {
      style: {
        fontSize: 48,
        marginBottom: 16
      }
    }, "\uD83D\uDC40"), React.createElement("h2", {
      style: {
        color: "#e2e8f0",
        margin: "0 0 8px 0"
      }
    }, "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0430 \u043A \u043F\u0440\u043E\u0435\u043A\u0442\u0430\u043C"), React.createElement("p", {
      style: {
        fontSize: 14,
        margin: 0,
        lineHeight: 1.6
      }
    }, "\u0412\u0430\u0448\u0430 \u0443\u0447\u0451\u0442\u043D\u0430\u044F \u0437\u0430\u043F\u0438\u0441\u044C \u0438\u043C\u0435\u0435\u0442 \u043F\u0440\u0430\u0432\u0430 \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440\u0430, \u043D\u043E \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440 \u0435\u0449\u0451 \u043D\u0435 \u043D\u0430\u0437\u043D\u0430\u0447\u0438\u043B \u0432\u0430\u043C \u043D\u0438 \u043E\u0434\u043D\u043E\u0433\u043E \u043F\u0440\u043E\u0435\u043A\u0442\u0430."), React.createElement("p", {
      style: {
        fontSize: 12,
        marginTop: 16,
        color: "#475569"
      }
    }, user.display_name, " (", user.sam_name, ") \xB7 \u0440\u043E\u043B\u044C: viewer"), React.createElement("button", {
      onClick: handleLogout,
      style: {
        marginTop: 20,
        background: "#334155",
        border: "none",
        borderRadius: 10,
        color: "#e2e8f0",
        fontSize: 13,
        cursor: "pointer",
        padding: "8px 20px",
        fontFamily: "inherit"
      }
    }, "\u0412\u044B\u0439\u0442\u0438 \u0438 \u0437\u0430\u0439\u0442\u0438 \u043F\u043E\u0434 \u0434\u0440\u0443\u0433\u0438\u043C \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u043C")));
  }
  if (workspace === "producer" && canManage) {
    return React.createElement(ProducerWorkspace, {
      user: user,
      data: data,
      onExit: () => {
        setWorkspace("post");
        history.pushState(null, "", location.pathname + location.search);
        setNavState(null);
      }
    });
  }
  const TABS = [{
    id: "today",
    label: "Сегодня"
  }, {
    id: "projects",
    label: "Проекты"
  }, {
    id: "calendar",
    label: "Календарь"
  }, {
    id: "gantt",
    label: "Гант",
    adminManagerOnly: true
  }, {
    id: "people",
    label: "По людям"
  }, {
    id: "days",
    label: "\u041d\u0415\u0414\u0415\u041b\u042f"
  }, {
    id: "conflicts",
    label: `Конфликты${conflictCount ? ` ⚡${conflictCount}` : ""}`,
    warn: conflictCount > 0,
    adminManagerOnly: true
  }, {
    id: "analytics",
    label: "Аналитика",
    adminManagerOnly: true
  }, {
    id: "history",
    label: "История",
    adminManagerOnly: true
  }, {
    id: "directory",
    label: "⚙ Настройки",
    adminManagerOnly: true
  }].filter(t => {
    if (t.adminOnly && !isAdmin) return false;
    if (t.adminManagerOnly && !canManage) return false;
    return true;
  });
  return React.createElement(StagesCtx.Provider, {
    value: stagesCtxVal
  }, React.createElement(HolidaysCtx.Provider, {
    value: holidaysCtxVal
  }, React.createElement("div", {
    className: "ppt-app-shell",
    style: {
      background: "transparent",
      minHeight: "100vh",
      color: "#eef4ff",
      paddingTop: 1
    }
  }, isMobile ? React.createElement(MobileTopbar, {
    user: user,
    syncState: syncState,
    onSearch: () => setCmdPaletteOpen(true),
    onShifts: () => setDayShiftsModal(true),
    onLogout: handleLogout
  }) : React.createElement("div", {
    className: "ppt-topbar",
    style: {
      background: "rgba(15,23,42,.72)",
      border: "1px solid rgba(148,163,184,.18)",
      borderBottom: "1px solid rgba(148,163,184,.22)",
      borderRadius: 20,
      padding: "14px 20px",
      position: "sticky",
      top: 10,
      zIndex: 50,
      margin: "10px 14px 0",
      overflow: "hidden"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      marginBottom: 12
    }
  }, React.createElement("div", {
    style: {
      flexShrink: 0
    }
  }, React.createElement("div", {
    className: "ppt-title",
    style: {
      fontSize: 23,
      fontWeight: 900,
      letterSpacing: .2,
      lineHeight: 1.05
    }
  }, "\u041F\u041E\u0421\u0422 \u0422\u0420\u0415\u041A\u0415\u0420"), React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#9aa9bd",
      marginTop: 4,
      fontWeight: 600
    }
  }, "\u041F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043F\u043E\u0441\u0442\u043F\u0440\u043E\u0434\u0430\u043A\u0448\u043D\u0430 ", React.createElement("span", {
    style: {
      marginLeft: 8,
      fontSize: 11,
      color: "#94a3b8"
    }
  }, "v", VERSION), RUNTIME.label && React.createElement("span", {
    style: {
      marginLeft: 8,
      fontSize: 10,
      color: "#fbbf24",
      fontWeight: 800,
      letterSpacing: .8
    }
  }, RUNTIME.label)), React.createElement("div", {
    className: "ppt-author"
  }, "\u0421\u043E\u0437\u0434\u0430\u043D\u043E \u041C\u0430\u043A\u0441\u0438\u043C\u043E\u043C \u0415\u0444\u0440\u0435\u043C\u043E\u0432\u044B\u043C")), React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      justifyContent: "center"
    }
  }, React.createElement("button", {
    onClick: () => setCmdPaletteOpen(true),
    style: {
      background: "#0f172a",
      border: "1px solid #1e3a5f",
      borderRadius: 10,
      padding: "5px 12px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontFamily: "inherit"
    }
  }, React.createElement("span", {
    style: {
      fontSize: 13,
      color: "#334155",
      lineHeight: 1
    }
  }, "\uD83D\uDD0D"), React.createElement("span", {
    style: {
      fontSize: 12,
      color: "#334155",
      letterSpacing: 1,
      userSelect: "none"
    }
  }, "\u041F\u043E\u0438\u0441\u043A"), React.createElement("span", {
    style: {
      fontSize: 9,
      color: "#1e3a5f",
      border: "1px solid #1e3a5f",
      borderRadius: 3,
      padding: "1px 5px",
      letterSpacing: 0,
      flexShrink: 0
    }
  }, "Ctrl+K"))), React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      alignItems: "center",
      flexShrink: 0
    }
  }, React.createElement(FlipClock, null), {
    ok: React.createElement("span", {
      style: {
        fontSize: 11,
        color: "#22c55e"
      }
    }, "OK"),
    saving: React.createElement("span", {
      style: {
        fontSize: 11,
        color: "#f59e0b"
      }
    }, "\u27F3"),
    error: React.createElement("span", {
      style: {
        fontSize: 11,
        color: "#ef4444"
      }
    }, "!")
  }[syncState], React.createElement(Btn, {
    variant: "ghost",
    small: true,
    onClick: () => {
      setView("history");
      navigate(null);
    }
  }, "\uD83D\uDCDC \u0418\u0441\u0442\u043E\u0440\u0438\u044F"), React.createElement(Btn, {
    variant: "ghost",
    small: true,
    onClick: () => setDayShiftsModal(true)
  }, " \u0421\u043C\u0435\u043D\u044B"), canManage && React.createElement(Btn, {
    variant: "ghost",
    small: true,
    onClick: () => {
      setWorkspace("producer");
      window.location.hash = "producer";
    }
  }, "\u041F\u0440\u043E\u0434\u044E\u0441\u0435\u0440\u0441\u043A\u0430\u044F \u2192")), React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginLeft: 8
    }
  }, React.createElement("span", {
    style: {
      fontSize: 12,
      color: "#cbd5e1",
      fontWeight: 700
    }
  }, user.display_name), React.createElement("span", {
    style: {
      fontSize: 10,
      color: "#9aa9bd",
      background: "rgba(8,13,26,.56)",
      borderRadius: 999,
      padding: "2px 8px",
      border: "1px solid rgba(148,163,184,.22)",
      fontWeight: 800
    }
  }, user.role), RUNTIME.mode !== "local-demo" && React.createElement("button", {
    onClick: handleLogout,
    className: "ppt-btn",
    style: {
      background: "rgba(15,23,42,.34)",
      border: "1px solid rgba(148,163,184,.22)",
      borderRadius: 14,
      color: "#a9b8cc",
      fontSize: 11,
      cursor: "pointer",
      padding: "4px 8px",
      fontFamily: "inherit",
      fontWeight: 700
    }
  }, "\u0412\u044B\u0439\u0442\u0438"))), (navState === null || navState === void 0 ? void 0 : navState.type) === "project" ? React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, React.createElement("button", {
    onClick: () => navigate(null),
    style: {
      background: "none",
      border: "none",
      color: "#3b82f6",
      cursor: "pointer",
      fontSize: 13,
      fontFamily: "inherit",
      padding: "4px 0"
    }
  }, "\u2190 \u0412\u0441\u0435 \u043F\u0440\u043E\u0435\u043A\u0442\u044B"), React.createElement("span", {
    style: {
      color: "#334155"
    }
  }, "/"), React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      color: "#e2e8f0"
    }
  }, ((_data$projects$find2 = data.projects.find(p => p.id === navState.id)) === null || _data$projects$find2 === void 0 ? void 0 : _data$projects$find2.name) || navState.id)) : (navState === null || navState === void 0 ? void 0 : navState.type) === "series" ? (() => {
    const ser = (data.series || []).find(s => s.id === navState.id);
    const proj = ser ? data.projects.find(p => p.id === ser.projectId) : null;
    return React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap"
      }
    }, React.createElement("button", {
      onClick: () => navigate(proj ? {
        type: "project",
        id: proj.id
      } : null),
      style: {
        background: "none",
        border: "none",
        color: "#3b82f6",
        cursor: "pointer",
        fontSize: 13,
        fontFamily: "inherit",
        padding: "4px 0"
      }
    }, "\u2190 ", (proj === null || proj === void 0 ? void 0 : proj.name) || "Проект"), React.createElement("span", {
      style: {
        color: "#334155"
      }
    }, "/"), React.createElement("span", {
      style: {
        fontWeight: 700,
        fontSize: 14,
        color: "#e2e8f0"
      }
    }, (ser === null || ser === void 0 ? void 0 : ser.name) || navState.id), (ser === null || ser === void 0 ? void 0 : ser.delivered) && React.createElement("span", {
      style: {
        fontSize: 11,
        color: "#22c55e",
        background: "#22c55e1a",
        border: "1px solid #22c55e44",
        borderRadius: 4,
        padding: "1px 7px"
      }
    }, "OK \u0421\u0434\u0430\u043D\u0430"));
  })() : React.createElement("div", {
    style: {
      display: "flex",
      gap: 3,
      background: "rgba(8,13,26,.48)",
      borderRadius: 14,
      border: "1px solid rgba(148,163,184,.18)",
      overflow: "hidden",
      width: "fit-content",
      padding: 3,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,.035)"
    }
  }, TABS.map(_ref155 => {
    let id = _ref155.id,
      label = _ref155.label,
      warn = _ref155.warn;
    return React.createElement("button", {
      key: id,
      onClick: () => {
        setView(id);
        navigate(null);
      },
      style: {
        padding: "7px 14px",
        border: "none",
        borderRight: "none",
        cursor: "pointer",
        borderRadius: 11,
        fontSize: 12,
        fontFamily: "inherit",
        transition: "background .15s ease,color .15s ease",
        background: view === id ? "linear-gradient(135deg,#2563eb,#3b82f6 64%,#22d3ee)" : "transparent",
        color: warn ? view === id ? "#fff" : "#fca5a5" : view === id ? "#fff" : "#9aa9bd",
        fontWeight: view === id ? 800 : 700
      }
    }, label);
  }))), syncError && React.createElement("div", {
    role: "alert",
    style: {
      margin: "12px 20px 0",
      padding: 12,
      border: "1px solid #b45309",
      borderRadius: 10,
      color: "#fde68a",
      background: "#422006"
    }
  }, React.createElement("span", {
    style: {
      marginRight: 10
    }
  }, syncError, " \u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u043F\u043E\u043A\u0430 \u043D\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u044B \u0441\u0435\u0440\u0432\u0435\u0440\u043E\u043C."), React.createElement("span", {
    style: {
      display: "inline-flex",
      gap: 6,
      flexWrap: "wrap"
    }
  }, React.createElement(Btn, {
    variant: "warn",
    small: true,
    onClick: () => doSave(rawData)
  }, "\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435"), React.createElement(Btn, {
    variant: "ghost",
    small: true,
    onClick: () => exportJSON(rawData)
  }, "\u0421\u043A\u0430\u0447\u0430\u0442\u044C \u043C\u043E\u0438 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F"), React.createElement(Btn, {
    variant: "ghost",
    small: true,
    disabled: Boolean(saveTimer.current || ((_saveQueueRef$current5 = saveQueueRef.current) === null || _saveQueueRef$current5 === void 0 ? void 0 : _saveQueueRef$current5.pending)),
    onClick: () => {
      if (window.confirm("Загрузить данные сервера? Сначала скачайте свои несохранённые изменения, если они нужны.")) cloudLoad().then(d => {
        serverRevisionRef.current = d._revision;
        histRef.current = [];
        pendingLogRef.current = [];
        logHistoryRef.current = d.changelog || [];
        unsavedRef.current = false;
        setRawData(d);
        setSyncError("");
        setSyncState("ok");
      }).catch(e => setSyncError(e.message));
    }
  }, "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0430\u043A\u0442\u0443\u0430\u043B\u044C\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435"))), React.createElement("div", {
    className: "ppt-main-content",
    style: {
      padding: "22px 20px 20px"
    }
  }, (navState === null || navState === void 0 ? void 0 : navState.type) === "person" ? React.createElement(PersonCard, {
    personId: navState.id,
    data: data,
    onBack: () => navigate(null),
    onUpdatePeople: updateData,
    canEditBirthday: isAdmin,
    canEditAbsences: canManage
  }) : (navState === null || navState === void 0 ? void 0 : navState.type) === "series" ? React.createElement(SeriesCard, {
    seriesId: navState.id,
    data: data,
    onBatchUpdate: batchUpdate
  }) : (navState === null || navState === void 0 ? void 0 : navState.type) === "project" ? React.createElement(ProjectCard, {
    projectId: navState.id,
    data: data,
    onUpdate: updateData,
    onBatchUpdate: batchUpdate,
    onBack: () => navigate(null),
    onSeriesSelect: id => navigate({
      type: "series",
      id
    }),
    onDelete: canDeleteStructure ? id => {
      deleteProject(id);
      navigate(null);
    } : null,
    onLog: addLog,
    canDeleteStructure: canDeleteStructure,
    canEditProject: canEditProjectById(navState.id),
    canManageProjectAssignments: canManageProjectAssignments
  }) : view === "history" && canManage ? React.createElement(HistoryView, {
    data: data
  }) : isMobile ? React.createElement(MobileWorkspace, {
    view: view,
    data: data,
    conflictDetails: conflictDetails,
    setView: setView,
    navigate: navigate
  }) : React.createElement(React.Fragment, null, view === "today" && React.createElement(TodayView, {
    data: data,
    conflictDetails: conflictDetails,
    onNavigateConflicts: () => setView("conflicts"),
    canEdit: canEdit,
    canDeleteStructure: canDeleteStructure
  }), view === "projects" && React.createElement(ProjectsView, {
    data: data,
    onUpdate: updateData,
    onBatchUpdate: batchUpdate,
    onDeleteProject: deleteProject,
    onProjectSelect: id => navigate({
      type: "project",
      id
    }),
    onSeriesSelect: id => navigate({
      type: "series",
      id
    }),
    canEdit: canEdit,
    canDeleteStructure: canDeleteStructure,
    isManager: isManager,
    canManageProjectAssignments: canManageProjectAssignments,
    canEditProjectById: canEditProjectById,
    currentManagerEntry: currentManagerEntry
  }), view === "calendar" && React.createElement(CalendarView, {
    data: data,
    onGoToGantt: day => {
      setGanttDay(day);
      setView("gantt");
    },
    canEdit: canEdit,
    canDeleteStructure: canDeleteStructure
  }), view === "gantt" && canManage && React.createElement(GanttView, {
    data: data,
    onUpdate: updateData,
    onBatchUpdate: batchUpdate,
    onSeriesSelect: id => navigate({
      type: "series",
      id
    }),
    startDay: ganttDay,
    onLog: addLog,
    canEdit: canEdit,
    canEditOldTasks: isAdmin || isLead,
    canEditProjectById: canEditProjectById
  }), view === "days" && React.createElement(DaysView, {
    data: data,
    conflictIds: conflictIds
  }), view === "people" && React.createElement(PeopleView, {
    data: data,
    conflictIds: conflictIds,
    onPersonSelect: id => navigate({
      type: "person",
      id
    }),
    canEdit: canEdit,
    onUpdate: updateData,
    onLog: addLog,
    canEditProjectById: canEditProjectById
  }), view === "conflicts" && canManage && React.createElement(ConflictsView, {
    details: conflictDetails,
    data: data
  }), view === "analytics" && canManage && React.createElement(AnalyticsView, {
    data: data,
    onPersonSelect: id => navigate({
      type: "person",
      id
    })
  }), view === "directory" && canManage && React.createElement(DirectoryView, {
    data: data,
    onUpdate: updateData,
    onBatchUpdate: batchUpdate,
    onLog: addLog,
    user: user,
    onUserUpdate: newU => {
      setUser(newU);
    }
  })), !isMobile && !navState && !["today", "conflicts", "analytics", "history", "directory"].includes(view) && React.createElement("div", {
    style: {
      marginTop: 24,
      paddingTop: 14,
      borderTop: "1px solid #1e293b",
      display: "flex",
      gap: 6,
      flexWrap: "wrap",
      alignItems: "center"
    }
  }, React.createElement("span", {
    style: {
      fontSize: 10,
      color: "#334155",
      letterSpacing: 2,
      marginRight: 2
    }
  }, "\u0413\u0420\u0423\u041F\u041F\u042B:"), stagesCtxVal.stageGroups.map(g => {
    const repStage = stagesCtxVal.sorted.find(s => s.groupId === g.id);
    const c = (repStage === null || repStage === void 0 ? void 0 : repStage.color) || "#475569";
    return React.createElement("span", {
      key: g.id,
      style: {
        fontSize: 10,
        background: `${c}22`,
        color: c,
        border: `1px solid ${c}44`,
        borderRadius: 4,
        padding: "1px 8px",
        fontWeight: 600
      }
    }, g.label);
  }), React.createElement("span", {
    style: {
      fontSize: 11,
      color: "#f87171",
      marginLeft: 6
    }
  }, "\u26A1 = \u043A\u043E\u043D\u0444\u043B\u0438\u043A\u0442"))), isMobile && !navState && React.createElement(MobileBottomNav, {
    tabs: TABS,
    view: view,
    setView: setView,
    navigate: navigate
  })), dayShiftsModal && React.createElement(DayShiftsModal, {
    data: data,
    onClose: () => setDayShiftsModal(false)
  }), cmdPaletteOpen && React.createElement(CommandPalette, {
    data: data,
    onClose: () => setCmdPaletteOpen(false),
    onNavigate: state => {
      navigate(state);
    },
    onSetView: v => {
      setView(v);
      navigate(null);
    },
    onSetGanttDay: setGanttDay
  })));
}
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App, null));
