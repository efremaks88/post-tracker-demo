const {useState,useEffect,useMemo,useCallback,useRef,useContext} = React;

// ── КОНТЕКСТЫ ────────────────────────────────────────────────────────
const StagesCtx = React.createContext({stageMap:{},sorted:[],stageGroups:[],groupMap:{}});
const HolidaysCtx = React.createContext([]);

// ── КОНСТАНТЫ ────────────────────────────────────────────────────────
const DEFAULT_STAGES = [
  // Съемка
  {id:"съемки",            label:"Съемки",                   color:"#f97316",order:1,  groupId:"sg1", rolesRequired:[],                   needsExecutor:false},
  // Синхра
  {id:"приход_мат",        label:"Приход материала",         color:"#ec4899",order:2,  groupId:"sg2", rolesRequired:["инжест"],            needsExecutor:true},
  {id:"синхра",            label:"Синхра",                   color:"#ec4899",order:3,  groupId:"sg2", rolesRequired:["инжест","монтаж"],   needsExecutor:true},
  // Редактура
  {id:"редактура",         label:"Редактура",                color:"#a78bfa",order:4,  groupId:"sg3", rolesRequired:["монтаж"],            needsExecutor:true},
  {id:"рыба",              label:"Получение рыбы",           color:"#a78bfa",order:5,  groupId:"sg3", rolesRequired:["выпуск"],            needsExecutor:true},
  // Монтаж
  {id:"монтаж",            label:"Монтаж",                   color:"#6366f1",order:6,  groupId:"sg4", rolesRequired:["монтаж"],            needsExecutor:true},
  {id:"отсмотр_вып",       label:"Отсмотр выпускающего",     color:"#6366f1",order:7,  groupId:"sg4", rolesRequired:["выпуск"],            needsExecutor:true},
  // Внутренний отсмотр
  {id:"внутр_отсмотр",     label:"Внутренний отсмотр",       color:"#3b82f6",order:8,  groupId:"sg5", rolesRequired:["выпуск","продюсер"], needsExecutor:true},
  {id:"просмотр_заказ",    label:"Просмотр заказчиков",      color:"#3b82f6",order:9,  groupId:"sg5", rolesRequired:["продюсер"],          needsExecutor:true},
  // Отсмотр на канале
  {id:"отсмотр_канал",     label:"Отсмотр на канале",        color:"#8b5cf6",order:10, groupId:"sg6", rolesRequired:["выпуск"],            needsExecutor:true},
  // Мастеринг
  {id:"правки_предотк",    label:"Правки предОТК",           color:"#0ea5e9",order:11, groupId:"sg7", rolesRequired:["монтаж","цвет","звук"],needsExecutor:true},
  {id:"высчет",            label:"Высчет на цвет/звук",      color:"#0ea5e9",order:12, groupId:"sg7", rolesRequired:["цвет","звук"],       needsExecutor:true},
  {id:"цветокор",          label:"Цветокор",                 color:"#f59e0b",order:13, groupId:"sg7", rolesRequired:["цвет"],              needsExecutor:true},
  {id:"сведение_звука",    label:"Сведение звука",           color:"#14b8a6",order:14, groupId:"sg7", rolesRequired:["звук"],              needsExecutor:true},
  {id:"отсмотр_маст",      label:"Отсмотр мастеринга",       color:"#0ea5e9",order:15, groupId:"sg7", rolesRequired:["выпуск"],            needsExecutor:true},
  {id:"правки_маст",       label:"Правки на цвет/звук",      color:"#0ea5e9",order:16, groupId:"sg7", rolesRequired:["цвет","звук"],       needsExecutor:true},
  {id:"отсмотр_маст_прод", label:"Отсмотр мастеринга прод.", color:"#0ea5e9",order:17, groupId:"sg7", rolesRequired:["продюсер"],          needsExecutor:true},
  // ОТК
  {id:"выгон_отк",         label:"Выгон на ОТК",             color:"#22c55e",order:18, groupId:"sg8", rolesRequired:["выпуск"],            needsExecutor:true},
  {id:"правки_отк",        label:"Правки ОТК",               color:"#22c55e",order:19, groupId:"sg8", rolesRequired:["монтаж","цвет","звук"],needsExecutor:true},
  {id:"выгон_заплаток",    label:"Выгон заплаток",           color:"#22c55e",order:20, groupId:"sg8", rolesRequired:["выпуск"],            needsExecutor:true},
  {id:"сдача_отк",         label:"Сдача ОТК",                color:"#22c55e",order:21, groupId:"sg8", rolesRequired:["выпуск","продюсер"], needsExecutor:true},
  // БезРЕК
  {id:"безрек",            label:"БезРЕК",                   color:"#f59e0b",order:22, groupId:"sg9", rolesRequired:["монтаж"],            needsExecutor:true},
  // Архив
  {id:"выгон_развед",      label:"Выгон разведенки",         color:"#64748b",order:23, groupId:"sg10",rolesRequired:["инжест"],            needsExecutor:true},
  {id:"подготовка_архива", label:"Подготовка архива",        color:"#64748b",order:24, groupId:"sg10",rolesRequired:["инжест"],            needsExecutor:true},
  // Без группы
  {id:"графика",           label:"Графика",                  color:"#06b6d4",order:25, groupId:"",    rolesRequired:[],                   needsExecutor:true},
  {id:"промо",             label:"Промо",                    color:"#f43f5e",order:26, groupId:"",    rolesRequired:[],                   needsExecutor:false},
  {id:"блюр",              label:"Блюр",                     color:"#94a3b8",order:27, groupId:"",    rolesRequired:[],                   needsExecutor:false},
  {id:"титры",             label:"Титры",                    color:"#94a3b8",order:28, groupId:"",    rolesRequired:[],                   needsExecutor:false},
  {id:"правки",            label:"Правки",                   color:"#f97316",order:29, groupId:"",    rolesRequired:[],                   needsExecutor:false},
  {id:"заплатки_цвет",     label:"Заплатки цвет",            color:"#f59e0b",order:30, groupId:"",    rolesRequired:["цвет"],             needsExecutor:true},
  {id:"заплатки_звук",     label:"Заплатки звук",            color:"#14b8a6",order:31, groupId:"",    rolesRequired:["звук"],             needsExecutor:true},
];

const DEFAULT_HOLIDAYS = [
  "01.01.2025","02.01.2025","03.01.2025","06.01.2025","07.01.2025","08.01.2025",
  "23.02.2025","24.02.2025","08.03.2025","09.03.2025","01.05.2025","02.05.2025",
  "08.05.2025","09.05.2025","12.06.2025","13.06.2025","03.11.2025","04.11.2025",
  "31.12.2025","01.01.2026","02.01.2026","08.01.2026","09.01.2026",
  "23.02.2026","09.03.2026","01.05.2026","11.05.2026","09.06.2026",
  "03.11.2026","04.11.2026",
];

const PALETTE = [
  "#3b82f6","#2563eb","#0ea5e9","#06b6d4","#14b8a6","#22c55e",
  "#84cc16","#eab308","#f59e0b","#f97316","#ef4444","#f43f5e",
  "#ec4899","#a855f7","#8b5cf6","#6366f1","#64748b","#94a3b8",
  "#38bdf8","#34d399","#facc15","#fb7185","#c084fc","#2dd4bf",
];

const DEFAULT_ACHIEVEMENTS = [{"id":"shift_1","title":"Мы рады видеть!","description":"Первая смена","icon":"1","color":"#38bdf8","ruleType":"shifts_count","threshold":1,"stageId":"","enabled":true},{"id":"shifts_10","title":"Разогрев","description":"10 смен","icon":"10","color":"#38bdf8","ruleType":"shifts_count","threshold":10,"stageId":"","enabled":true},{"id":"shifts_50","title":"Постоянный","description":"Отработал 50 смен","icon":"50","color":"#38bdf8","ruleType":"shifts_count","threshold":50,"stageId":"","enabled":true},{"id":"shifts_100","title":"Сотня","description":"100 смен в трекере","icon":"100","color":"#60a5fa","ruleType":"shifts_count","threshold":100,"stageId":"","enabled":true},{"id":"shifts_250","title":"Ветеран","description":"250 смен","icon":"250","color":"#818cf8","ruleType":"shifts_count","threshold":250,"stageId":"","enabled":true},{"id":"shifts_500","title":"Титан смен","description":"500 смен","icon":"500","color":"#a78bfa","ruleType":"shifts_count","threshold":500,"stageId":"","enabled":true},{"id":"shifts_1001","title":"Тысяча и одна смена","description":"1001 смена","icon":"1001","color":"#f59e0b","ruleType":"shifts_count","threshold":1001,"stageId":"","enabled":true},{"id":"hours_500","title":"Наработка","description":"500 часов работы","icon":"500","color":"#14b8a6","ruleType":"hours_count","threshold":500,"stageId":"","enabled":true},{"id":"projects_1","title":"Новый проект, новый опыт","description":"Поработал на первом проекте","icon":"1P","color":"#60a5fa","ruleType":"projects_count","threshold":1,"stageId":"","enabled":true},{"id":"projects_10","title":"Проектный человек","description":"Поработал на 10 проектах","icon":"10P","color":"#a78bfa","ruleType":"projects_count","threshold":10,"stageId":"","enabled":true},{"id":"projects_20","title":"Видел продакшн мир","description":"Поработал на 20 проектах","icon":"20P","color":"#c084fc","ruleType":"projects_count","threshold":20,"stageId":"","enabled":true},{"id":"series_10","title":"Серийный специалист","description":"Поработал над 10 сериями","icon":"10S","color":"#22c55e","ruleType":"series_count","threshold":10,"stageId":"","enabled":true},{"id":"series_50","title":"Сериалити","description":"50 серий опыта","icon":"50S","color":"#22c55e","ruleType":"series_count","threshold":50,"stageId":"","enabled":true},{"id":"full_project_5","title":"Полный круг","description":"Поработал над каждой серией проекта, где минимум 5 серий","icon":"ALL5","color":"#34d399","ruleType":"full_project_series","threshold":5,"stageId":"","enabled":true},{"id":"project_loyalty_50","title":"Верность проекту","description":"50 смен на одном проекте","icon":"50P","color":"#facc15","ruleType":"project_shifts_count","threshold":50,"stageId":"","enabled":true},{"id":"projects_day_2","title":"Двойной заход","description":"Два проекта за один день","icon":"2D","color":"#f97316","ruleType":"projects_one_day","threshold":2,"stageId":"","enabled":true},{"id":"projects_day_3","title":"Тройной заход","description":"Три проекта за один день","icon":"3D","color":"#f59e0b","ruleType":"projects_one_day","threshold":3,"stageId":"","enabled":true},{"id":"projects_day_5","title":"Продакшн серфинг","description":"5 проектов за один день","icon":"5D","color":"#ef4444","ruleType":"projects_one_day","threshold":5,"stageId":"","enabled":true},{"id":"stages_day_3","title":"Широкий профиль","description":"Три разных этапа за день","icon":"3E","color":"#8b5cf6","ruleType":"stages_one_day","threshold":3,"stageId":"","enabled":true},{"id":"tasks_day_5","title":"Всё под контролем","description":"Пять заданий за день","icon":"5T","color":"#ec4899","ruleType":"tasks_one_day","threshold":5,"stageId":"","enabled":true},{"id":"series_week_5","title":"Спринтер","description":"За неделю поработал над пятью сериями","icon":"5W","color":"#06b6d4","ruleType":"series_week","threshold":5,"stageId":"","enabled":true},{"id":"same_project_series_day_3","title":"Марафон","description":"Три серии одного проекта за день","icon":"3S","color":"#f97316","ruleType":"same_project_series_one_day","threshold":3,"stageId":"","enabled":true},{"id":"pro_roles_3","title":"Универсальный боец","description":"Работал в трёх разных профессиональных ролях","icon":"3R","color":"#94a3b8","ruleType":"professional_roles_count","threshold":3,"stageId":"","enabled":true},{"id":"material_first","title":"Принял материал","description":"Первая задача по приходу материала","icon":"IN","color":"#ec4899","ruleType":"stage_task_count","threshold":1,"stageId":"приход_мат","enabled":true},{"id":"sync_25","title":"Синхронавт","description":"25 задач синхры","icon":"25","color":"#ec4899","ruleType":"stage_task_count","threshold":25,"stageId":"синхра","enabled":true},{"id":"sync_100","title":"Синхра, камера, мотор!","description":"100 задач синхры","icon":"100","color":"#ec4899","ruleType":"stage_task_count","threshold":100,"stageId":"синхра","enabled":true},{"id":"fresh_eye_25","title":"Свежий взгляд","description":"25 отсмотров","icon":"25","color":"#3b82f6","ruleType":"stage_group_task_count","threshold":25,"stageId":"sg5","enabled":true},{"id":"client_view_20","title":"Заказчик доволен","description":"20 просмотров у заказчика","icon":"20","color":"#3b82f6","ruleType":"stage_task_count","threshold":20,"stageId":"просмотр_заказ","enabled":true},{"id":"channel_view_20","title":"Через сито канала","description":"20 отсмотров на канале","icon":"20","color":"#8b5cf6","ruleType":"stage_task_count","threshold":20,"stageId":"отсмотр_канал","enabled":true},{"id":"masters_25","title":"Мастерская рука","description":"25 задач мастеринга","icon":"M25","color":"#22c55e","ruleType":"masters_count","threshold":25,"stageId":"","enabled":true},{"id":"color_25","title":"Цвет настроения","description":"25 цветокоров","icon":"C25","color":"#f59e0b","ruleType":"stage_task_count","threshold":25,"stageId":"цветокор","enabled":true},{"id":"sound_25","title":"Всё звучит","description":"25 задач сведения звука","icon":"S25","color":"#14b8a6","ruleType":"stage_task_count","threshold":25,"stageId":"сведение_звука","enabled":true},{"id":"otk_25","title":"ОТКшник","description":"25 задач, связанных с ОТК","icon":"ОТК","color":"#22c55e","ruleType":"stage_group_task_count","threshold":25,"stageId":"sg8","enabled":true},{"id":"fixes_50","title":"Повелитель правок","description":"50 задач правок","icon":"FIX","color":"#f97316","ruleType":"stage_task_count","threshold":50,"stageId":"правки","enabled":true},{"id":"patches_50","title":"Заплаточник","description":"50 задач с заплатками","icon":"PATCH","color":"#22c55e","ruleType":"stage_task_count","threshold":50,"stageId":"выгон_заплаток","enabled":true},{"id":"bezrek_50","title":"Безрековый","description":"50 задач БезРЕК","icon":"BR","color":"#f59e0b","ruleType":"stage_task_count","threshold":50,"stageId":"безрек","enabled":true},{"id":"archive_50","title":"Архивариус","description":"50 подготовленных архивов","icon":"AR","color":"#64748b","ruleType":"stage_task_count","threshold":50,"stageId":"подготовка_архива","enabled":true},{"id":"blur_10","title":"Блюролог","description":"10 задач с блюром","icon":"BL","color":"#94a3b8","ruleType":"stage_task_count","threshold":10,"stageId":"блюр","enabled":true},{"id":"promo_20","title":"Промоходец","description":"20 промо-задач","icon":"PR","color":"#f43f5e","ruleType":"stage_task_count","threshold":20,"stageId":"промо","enabled":true},{"id":"holiday_shift_1","title":"Праздничный герой","description":"Смена 31 декабря или в новогодние праздники","icon":"NY","color":"#60a5fa","ruleType":"holiday_shift_count","threshold":1,"stageId":"","enabled":true},{"id":"early_shift_1","title":"Ранний старт","description":"Смена началась до 07:00","icon":"07","color":"#facc15","ruleType":"early_shift_count","threshold":1,"stageId":"","enabled":true},{"id":"comeback_30","title":"Камбэк","description":"Вернулся после перерыва больше месяца","icon":"CB","color":"#a78bfa","ruleType":"comeback_gap_days","threshold":30,"stageId":"","enabled":true},{"id":"fixes_series_5","title":"Эта серия прошла многое","description":"Пять задач правок на одной серии","icon":"V5","color":"#f97316","ruleType":"same_series_stage_count","threshold":5,"stageId":"правки","enabled":true},{"id":"office_10","title":"На связи","description":"Работал 10 дней в трекере","icon":"10D","color":"#64748b","ruleType":"work_days_count","threshold":10,"stageId":"","enabled":true},{"id":"sound_role_10","title":"Человек с ухом","description":"10 задач в роли звука","icon":"S10","color":"#14b8a6","ruleType":"role_task_count","threshold":10,"stageId":"звук","enabled":true},{"id":"color_role_10","title":"Глаз в цвете","description":"10 задач в роли цветокора","icon":"C10","color":"#f59e0b","ruleType":"role_task_count","threshold":10,"stageId":"цвет","enabled":true},{"id":"ingest_role_10","title":"Входной контроль","description":"10 задач в роли инжеста","icon":"I10","color":"#ec4899","ruleType":"role_task_count","threshold":10,"stageId":"инжест","enabled":true},{"id":"editor_role_50","title":"Монтажная смена","description":"50 задач в роли монтажа","icon":"E50","color":"#6366f1","ruleType":"role_task_count","threshold":50,"stageId":"монтаж","enabled":true}];
const ACHIEVEMENT_RULES = [{"id":"shifts_count","label":"Всего смен","unit":"смен"},{"id":"hours_count","label":"Часы работы","unit":"ч"},{"id":"work_days_count","label":"Дни в трекере","unit":"дней"},{"id":"series_count","label":"Разные серии","unit":"серий"},{"id":"projects_count","label":"Проекты","unit":"проектов"},{"id":"project_shifts_count","label":"Смен на одном проекте","unit":"смен"},{"id":"projects_one_day","label":"Проектов за день","unit":"проектов"},{"id":"series_one_day","label":"Серий за день","unit":"серий"},{"id":"same_project_series_one_day","label":"Серий одного проекта за день","unit":"серий"},{"id":"stages_one_day","label":"Этапов за день","unit":"этапов"},{"id":"tasks_one_day","label":"Задач за день","unit":"задач"},{"id":"series_week","label":"Серий за неделю","unit":"серий"},{"id":"full_project_series","label":"Все серии проекта","unit":"серий в проекте"},{"id":"masters_count","label":"Задач по мастерингу","unit":"задач"},{"id":"stage_task_count","label":"Задач на этапе","unit":"задач","needsStage":true},{"id":"stage_group_task_count","label":"Задач в группе этапов","unit":"задач","needsGroup":true},{"id":"same_series_stage_count","label":"Задач этапа на одной серии","unit":"задач","needsStage":true},{"id":"role_task_count","label":"Задач по роли этапа","unit":"задач","needsRole":true},{"id":"professional_roles_count","label":"Профессиональные роли","unit":"ролей"},{"id":"early_shift_count","label":"Ранние смены","unit":"смен"},{"id":"holiday_shift_count","label":"Праздничные смены","unit":"смен"},{"id":"comeback_gap_days","label":"Перерыв перед сменой","unit":"дней"}];
function normalizeAchievement(a){
  const src=a||{};
  return {id:String(src.id||("ach_"+Date.now())).trim(),title:String(src.title||"").trim(),description:String(src.description||""),
    icon:String(src.icon||""),image:String(src.image||""),color:src.color||"#38bdf8",ruleType:src.ruleType||"shifts_count",
    threshold:Math.max(1,Number(src.threshold)||1),stageId:src.stageId||"",enabled:src.enabled!==false};
}
function achievementList(data){
  if(Array.isArray(data?.achievements)) return data.achievements.map(normalizeAchievement);
  return DEFAULT_ACHIEVEMENTS.map(normalizeAchievement);
}
function achievementRuleLabel(type){return ACHIEVEMENT_RULES.find(r=>r.id===type)?.label||type;}
function buildAchievementMetrics(tasks,projectStats,stageMap,data,person){
  const done=(tasks||[]).filter(t=>!t.deleted&&!t.cancelled);
  const stageCounts={};
  const groupCounts={};
  const roleCounts={};
  const byDay={};
  const seriesByDay={};
  const stagesByDay={};
  const sameProjectSeriesByDay={};
  const seriesByWeek={};
  const seriesSet=new Set();
  const workDays=new Set();
  const shiftsByProject={};
  const seriesStageCounts={};
  const professionalRoles=new Set();
  const holidays=new Set([...(data?.holidays||[]),...DEFAULT_HOLIDAYS]);
  let masterCount=0;
  let hours=0;
  let early=0;
  let holiday=0;
  const seriesKey=t=>String(t.seriesId||((t.project||"")+"|"+(t.series||"")));
  done.forEach(t=>{
    const st=stageMap?.[t.status]||{};
    const key=seriesKey(t);
    if(key&&key!=="|") seriesSet.add(key);
    if(t.day) workDays.add(t.day);
    stageCounts[t.status]=(stageCounts[t.status]||0)+1;
    if(st.groupId) groupCounts[st.groupId]=(groupCounts[st.groupId]||0)+1;
    (st.rolesRequired||[]).forEach(r=>{roleCounts[r]=(roleCounts[r]||0)+1;professionalRoles.add(r);});
    hours+=Math.max(0,Number(t.to)-Number(t.from));
    if(String(t.status||"").toLowerCase().includes("\u043c\u0430\u0441\u0442\u0435\u0440")||String(st?.label||"").toLowerCase().includes("\u043c\u0430\u0441\u0442\u0435\u0440")) masterCount++;
    if(Number(t.from)<7) early++;
    if(t.day&&(holidays.has(t.day)||/^31\.12\./.test(t.day)||/^0[1-8]\.01\./.test(t.day))) holiday++;
    if(t.project) shiftsByProject[t.project]=(shiftsByProject[t.project]||0)+1;
    if(t.day){
      if(!byDay[t.day]) byDay[t.day]=new Set();
      if(!seriesByDay[t.day]) seriesByDay[t.day]=new Set();
      if(!stagesByDay[t.day]) stagesByDay[t.day]=new Set();
      if(t.project) byDay[t.day].add(t.project);
      if(key) seriesByDay[t.day].add(key);
      if(t.status) stagesByDay[t.day].add(t.status);
      const psKey=(t.project||"")+"|"+t.day;
      if(!sameProjectSeriesByDay[psKey]) sameProjectSeriesByDay[psKey]=new Set();
      if(key) sameProjectSeriesByDay[psKey].add(key);
      const wk=weekKey(t.day);
      if(wk){if(!seriesByWeek[wk]) seriesByWeek[wk]=new Set(); if(key) seriesByWeek[wk].add(key);}
    }
    const ssKey=key+"|"+(t.status||"");
    seriesStageCounts[ssKey]=(seriesStageCounts[ssKey]||0)+1;
  });
  const dates=[...workDays].sort((a,b)=>daySort(a).localeCompare(daySort(b)));
  let maxGap=0;
  for(let i=1;i<dates.length;i++){const a=parseDate(dates[i-1]), b=parseDate(dates[i]); if(a&&b) maxGap=Math.max(maxGap,Math.round((b-a)/86400000));}
  let fullProjectMax=0;
  (data?.projects||[]).forEach(p=>{
    const pSeries=(data?.series||[]).filter(s=>!s.deleted&&s.projectId===p.id);
    if(!pSeries.length) return;
    const pDone=new Set(done.filter(t=>t.project===p.id).map(seriesKey));
    const allDone=pSeries.every(s=>pDone.has(String(s.id))||pDone.has(p.id+"|"+s.name));
    if(allDone) fullProjectMax=Math.max(fullProjectMax,pSeries.length);
  });
  const maxNumber=obj=>Object.values(obj||{}).reduce((m,n)=>Math.max(m,Number(n)||0),0);
  const maxSetSize=obj=>Object.values(obj||{}).reduce((m,set)=>Math.max(m,set?.size||0),0);
  return {shifts_count:done.length,hours_count:Math.round(hours),work_days_count:workDays.size,masters_count:masterCount,projects_count:(projectStats||[]).length,series_count:seriesSet.size,project_shifts_count:maxNumber(shiftsByProject),projects_one_day:maxSetSize(byDay),series_one_day:maxSetSize(seriesByDay),same_project_series_one_day:maxSetSize(sameProjectSeriesByDay),stages_one_day:maxSetSize(stagesByDay),tasks_one_day:dates.reduce((m,d)=>Math.max(m,done.filter(t=>t.day===d).length),0),series_week:maxSetSize(seriesByWeek),full_project_series:fullProjectMax,professional_roles_count:professionalRoles.size,early_shift_count:early,holiday_shift_count:holiday,comeback_gap_days:maxGap,stageCounts,groupCounts,roleCounts,seriesStageCounts};
}
function achievementValue(a,metrics){
  if(a.ruleType==="stage_task_count") return metrics.stageCounts?.[a.stageId]||0;
  if(a.ruleType==="stage_group_task_count") return metrics.groupCounts?.[a.stageId]||0;
  if(a.ruleType==="role_task_count") return metrics.roleCounts?.[a.stageId]||0;
  if(a.ruleType==="same_series_stage_count") {
    const suffix="|"+(a.stageId||"");
    return Object.entries(metrics.seriesStageCounts||{}).reduce((m,[k,v])=>k.endsWith(suffix)?Math.max(m,v):m,0);
  }
  return metrics[a.ruleType]||0;
}
function earnedAchievements(data,metrics){
  return achievementList(data).map(a=>({...a,value:achievementValue(a,metrics)})).filter(a=>a.enabled!==false&&a.value>=a.threshold);
}

const ASSET_STAGES=[
  {id:"ingest",   label:"Инжест",    color:"#64748b"},
  {id:"sync",     label:"Синхра",    color:"#ec4899"},
  {id:"edit",     label:"Редактура", color:"#a855f7"},
  {id:"montage",  label:"Монтаж",    color:"#3b82f6"},
  {id:"color",    label:"Цвет",      color:"#f59e0b"},
  {id:"sound",    label:"Звук",      color:"#06b6d4"},
  {id:"master",   label:"Мастер",    color:"#22c55e"},
  {id:"delivered",label:"Сдан",      color:"#10b981"},
];
function makeAsset(id){
  return {
    id,label:"",stage:"ingest",
    paths:{ingest:"",sync:"",project:"",master:"",delivery:""},
    history:[],
    timings:{ingestAt:"",syncAt:"",editAt:"",colorAt:"",soundAt:"",masterAt:"",deliveredAt:""},
    thumb:"",
    qc:{status:null,checks:[]},
    ai:{estimatedDays:null,deadlineRisk:null,diskWarning:null,suggestedNextStep:null,notes:""},
  };
}
const SERIES_MILESTONES=[
  {key:"sendDate",   label:"\u041e\u0442\u043f\u0440\u0430\u0432\u043a\u0430 \u0437\u0430\u043a\u0430\u0437\u0447\u0438\u043a\u0443", abbr:"\u0417\u0430\u043a\u0430\u0437", color:"#a855f7"},
  {key:"preOtkDate", label:"ПредОТК",            abbr:"пОТК", color:"#0ea5e9", configurable:true},
  {key:"otkDate",    label:"ОТК",                abbr:"ОТК",  color:"#22c55e", configurable:true},
  {key:"airDate",    label:"Эфир",               abbr:"Эфир", color:"#ef4444"},
];
const MILESTONE_ICON="◆";
const CUSTOM_MILESTONE_LIMIT=10;
function getProjectMilestoneMeta(project,key,base){
  const meta=(project?.dossier?.milestoneMeta||{})[key]||{};
  return {...base,label:meta.label||base.label,abbr:meta.abbr||meta.label||base.abbr||base.label,color:meta.color||base.color};
}
function getProjectCustomMilestones(project){
  return (project?.dossier?.customMilestones||[]).slice(0,CUSTOM_MILESTONE_LIMIT).filter(m=>m&&m.id);
}
function getProjectMilestoneDefinitions(project){
  const fixed=SERIES_MILESTONES.map(base=>{
    const m=base.configurable?getProjectMilestoneMeta(project,base.key,base):base;
    return {...m,key:base.key,field:base.key,custom:false};
  });
  const custom=getProjectCustomMilestones(project).map(def=>({
    key:def.id,field:def.id,label:def.label||"\u041a\u043e\u043d\u0442\u0440\u043e\u043b\u044c\u043d\u0430\u044f \u0442\u043e\u0447\u043a\u0430",
    abbr:def.label||"\u041a\u0422",color:def.color||"#f59e0b",custom:true,icon:MILESTONE_ICON
  }));
  return [...fixed,...custom];
}
function getSeriesMilestoneValue(series,def){
  if(!series||!def) return "";
  if(def.custom){
    const row=(series.customMilestones||[]).find(v=>v.id===def.key)||{};
    return row.date||"";
  }
  return series[def.field||def.key]||"";
}
function seriesMilestonePatch(series,def,date){
  if(!def) return {};
  if(def.custom){
    const items=[...(series.customMilestones||[])];
    const idx=items.findIndex(v=>v.id===def.key);
    if(idx>=0) items[idx]={...items[idx],id:def.key,date};
    else items.push({id:def.key,date});
    return {customMilestones:items};
  }
  return {[def.field||def.key]:date};
}
function getSeriesGroupTaskRange(series,group,stages,tasks){
  if(!series||!group) return {from:"",to:"",count:0};
  const stageIds=new Set((stages||[]).filter(s=>s.groupId===group.id).map(s=>s.id));
  if(!stageIds.size) return {from:"",to:"",count:0};
  const rows=(tasks||[]).filter(t=>!t.deleted&&!t.cancelled&&t.project===series.projectId&&
    (t.seriesId===series.id||(!t.seriesId&&t.series===series.name))&&stageIds.has(t.status)&&t.day)
    .sort((a,b)=>daySort(a.day).localeCompare(daySort(b.day)));
  if(!rows.length) return {from:"",to:"",count:0};
  return {from:rows[0].day,to:rows[rows.length-1].day,count:rows.length};
}
function getSeriesMilestoneEvents(series,project){
  const fixed=SERIES_MILESTONES.map(base=>{
    const m=base.configurable?getProjectMilestoneMeta(project,base.key,base):base;
    return {...m,date:series?.[base.key]||"", icon:MILESTONE_ICON};
  }).filter(m=>m.date);
  const values=series?.customMilestones||[];
  const custom=getProjectCustomMilestones(project).map(def=>{
    const row=values.find(v=>v.id===def.id)||{};
    return {key:def.id,label:def.label||"Контрольная точка",abbr:def.label||"КТ",color:def.color||"#f59e0b",date:row.date||"",icon:MILESTONE_ICON,custom:true};
  }).filter(m=>m.date);
  return [...fixed,...custom];
}
const GANTT_TEMPLATES=[
  {status:"\u0441\u0438\u043d\u0445\u0440\u0430",label:"\u0421\u0438\u043d\u0445\u0440\u0430"},
  {status:"\u043c\u043e\u043d\u0442\u0430\u0436",label:"\u041c\u043e\u043d\u0442\u0430\u0436"},
  {status:"\u0432\u043d\u0443\u0442\u0440_\u043e\u0442\u0441\u043c\u043e\u0442\u0440",label:"\u0412\u043d\u0443\u0442\u0440. \u043e\u0442\u0441\u043c\u043e\u0442\u0440"},
  {status:"\u0446\u0432\u0435\u0442\u043e\u043a\u043e\u0440",label:"\u0426\u0432\u0435\u0442\u043e\u043a\u043e\u0440"},
  {status:"\u0441\u0432\u0435\u0434\u0435\u043d\u0438\u0435_\u0437\u0432\u0443\u043a\u0430",label:"\u0421\u0432\u0435\u0434\u0435\u043d\u0438\u0435 \u0437\u0432\u0443\u043a\u0430"},
  {status:"\u043f\u0440\u0430\u0432\u043a\u0438",label:"\u041f\u0440\u0430\u0432\u043a\u0438"},
];
const TIME_PRESETS = [{f:10,t:19},{f:11,t:20},{f:10,t:14},{f:14,t:19},{f:10,t:22},{f:9,t:18}];
const WDAYS = ["вс","пн","вт","ср","чт","пт","сб"];
const WDAYS_LONG = ["Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"];
const MONTHS = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const PROJECT_STATUSES = ["в работе","ожидаем","на паузе","сдан","архив"];
const DEFAULT_STAGE_GROUPS = [
  {id:"sg1", label:"Съемка",              order:1},
  {id:"sg2", label:"Синхра",              order:2},
  {id:"sg3", label:"Редактура",           order:3},
  {id:"sg4", label:"Монтаж",              order:4},
  {id:"sg5", label:"Внутренний отсмотр",  order:5},
  {id:"sg6", label:"Отсмотр на канале",   order:6},
  {id:"sg7", label:"Мастеринг",           order:7},
  {id:"sg8", label:"ОТК",                 order:8},
  {id:"sg9", label:"БезРЕК",              order:9},
  {id:"sg10",label:"Архив",               order:10},
];
function daySort(s){return s?s.split('.').reverse().join(''):'';}
function fmtHour(h){const n=Number(h)||0;return `${Math.floor(n)}:${n%1>=0.5?"30":"00"}`;}
function fmtDur(f,t){const d=Number(t)-Number(f);if(d<=0)return "";const h=Math.floor(d);return d%1>=0.5?`${h}ч 30мин`:`${h}ч`;}

// ── ДЕМО ДАННЫЕ ──────────────────────────────────────────────────────
const DEMO_ROLES = [
  {id:"монтаж",  label:"Монтажёр",       color:"#6366f1"},
  {id:"цвет",    label:"Цветокор",        color:"#f59e0b"},
  {id:"звук",    label:"Звукорежиссёр",   color:"#14b8a6"},
  {id:"инжест",  label:"Инжест",          color:"#ec4899"},
  {id:"выпуск",  label:"Выпускающий",     color:"#22c55e"},
  {id:"продюсер",label:"Продюсер",        color:"#3b82f6"},
];
const DEMO_PEOPLE = [
  {id:"p1", name:"Захаров",   roles:["выпуск","продюсер"], active:true},
  {id:"p2", name:"Громов",    roles:["цвет"],              active:true},
  {id:"p3", name:"Ильин",     roles:["звук"],              active:true},
  {id:"p4", name:"Романов",   roles:["монтаж"],            active:true},
  {id:"p5", name:"Белов",     roles:["монтаж","звук"],     active:true},
  {id:"p6", name:"Крылова",   roles:["монтаж"],            active:true},
  {id:"p7", name:"Титов",     roles:["инжест","монтаж"],   active:true},
  {id:"p8", name:"Соколова",  roles:["выпуск"],            active:true},
  {id:"p9", name:"Соколов",   roles:["монтаж"],            active:true},
  {id:"p10",name:"Фёдоров",   roles:["монтаж"],            active:true},
  {id:"p11",name:"Зайцева",   roles:["монтаж"],            active:true},
  {id:"p12",name:"Нилов",     roles:["цвет"],              active:true},
  {id:"p13",name:"Сидоров",   roles:["звук"],              active:true},
  {id:"p14",name:"Петров",    roles:["инжест"],            active:true},
  {id:"p15",name:"Орлов",     roles:["монтаж"],            active:true},
  {id:"p16",name:"Волков",    roles:["монтаж"],            active:true},
  {id:"p17",name:"Смирнова",  roles:["монтаж"],            active:true},
  {id:"p18",name:"Козлов",    roles:["монтаж"],            active:true},
  {id:"p19",name:"Морозов",   roles:["монтаж"],            active:true},
  {id:"p20",name:"Лебедева",  roles:["выпуск"],            active:true},
  {id:"p21",name:"Кириллов",  roles:["выпуск"],            active:true},
  {id:"p22",name:"Новиков",   roles:["монтаж"],            active:true},
  {id:"p23",name:"Попов",     roles:["монтаж"],            active:true},
  {id:"p24",name:"Кузнецова", roles:["монтаж"],            active:true},
  {id:"p25",name:"Быков",     roles:["инжест"],            active:true},
  {id:"p26",name:"Дорохов",   roles:["цвет"],              active:true},
  {id:"p27",name:"Степанов",  roles:["звук"],              active:true},
];
const NAME_TO_ID = {
  "Северный Ветер":"sv","Большой Город":"bg","Дикая Природа":"dp",
  "Звёздный Путь":"zp","Морской Берег":"mb",
};
const DEMO_PROJECTS = [
  {id:"sv",name:"Северный Ветер",abbr:"СВ",description:"Документальный сериал, 5 серий",color:"#3b82f6",status:"в работе"},
  {id:"bg",name:"Большой Город",abbr:"БГ",description:"Городской репортажный сериал, 4 серии",color:"#a855f7",status:"в работе"},
  {id:"dp",name:"Дикая Природа",abbr:"ДП",description:"Природный документальный сериал",color:"#22c55e",status:"в работе"},
  {id:"zp",name:"Звёздный Путь",abbr:"ЗП",description:"Научно-популярный сериал",color:"#f59e0b",status:"в работе"},
  {id:"mb",name:"Морской Берег",abbr:"МБ",description:"Приключенческий сериал",color:"#ec4899",status:"в работе"},
];
const DEMO_SERIES = [
  {id:"sv-s01",projectId:"sv",name:"С01",order:0,shootStart:"01.02.2026",shootEnd:"10.02.2026",editStart:"01.03.2026",preOtkDate:"05.04.2026",otkDate:"10.04.2026",airDate:"",airMode:"weekly",airDay:1,airTime:"21:00"},
  {id:"sv-s02",projectId:"sv",name:"С02",order:1,shootStart:"10.02.2026",shootEnd:"17.02.2026",editStart:"10.03.2026",preOtkDate:"05.04.2026",otkDate:"10.04.2026",airDate:"",airMode:"weekly",airDay:1,airTime:"21:00"},
  {id:"sv-s03",projectId:"sv",name:"С03",order:2,shootStart:"17.02.2026",shootEnd:"22.02.2026",editStart:"17.03.2026",preOtkDate:"05.04.2026",otkDate:"10.04.2026",airDate:"",airMode:"weekly",airDay:1,airTime:"21:00"},
  {id:"sv-s04",projectId:"sv",name:"С04",order:3,shootStart:"22.02.2026",shootEnd:"25.02.2026",editStart:"22.03.2026",preOtkDate:"05.04.2026",otkDate:"10.04.2026",airDate:"",airMode:"weekly",airDay:1,airTime:"21:00"},
  {id:"sv-s05",projectId:"sv",name:"С05",order:4,shootStart:"25.02.2026",shootEnd:"28.02.2026",editStart:"28.03.2026",preOtkDate:"05.04.2026",otkDate:"10.04.2026",airDate:"",airMode:"weekly",airDay:1,airTime:"21:00"},
  {id:"bg-s01",projectId:"bg",name:"С01",order:0,shootStart:"10.02.2026",shootEnd:"18.02.2026",editStart:"06.03.2026",preOtkDate:"10.04.2026",otkDate:"15.04.2026",airDate:"",airMode:"weekly",airDay:3,airTime:"20:00"},
  {id:"bg-s02",projectId:"bg",name:"С02",order:1,shootStart:"18.02.2026",shootEnd:"24.02.2026",editStart:"12.03.2026",preOtkDate:"10.04.2026",otkDate:"15.04.2026",airDate:"",airMode:"weekly",airDay:3,airTime:"20:00"},
  {id:"bg-s03",projectId:"bg",name:"С03",order:2,shootStart:"24.02.2026",shootEnd:"01.03.2026",editStart:"18.03.2026",preOtkDate:"10.04.2026",otkDate:"15.04.2026",airDate:"",airMode:"weekly",airDay:3,airTime:"20:00"},
  {id:"bg-s04",projectId:"bg",name:"С04",order:3,shootStart:"01.03.2026",shootEnd:"05.03.2026",editStart:"24.03.2026",preOtkDate:"10.04.2026",otkDate:"15.04.2026",airDate:"",airMode:"weekly",airDay:3,airTime:"20:00"},
  {id:"dp-s01",projectId:"dp",name:"С01",order:0,shootStart:"05.02.2026",shootEnd:"15.02.2026",editStart:"01.03.2026",preOtkDate:"15.04.2026",otkDate:"20.04.2026",airDate:"",airMode:"weekly",airDay:5,airTime:"20:30"},
  {id:"dp-s02",projectId:"dp",name:"С02",order:1,shootStart:"15.02.2026",shootEnd:"25.02.2026",editStart:"20.03.2026",preOtkDate:"15.04.2026",otkDate:"20.04.2026",airDate:"",airMode:"weekly",airDay:5,airTime:"20:30"},
  {id:"zp-s01",projectId:"zp",name:"С01",order:0,shootStart:"01.02.2026",shootEnd:"08.02.2026",editStart:"20.02.2026",preOtkDate:"20.03.2026",otkDate:"25.03.2026",airDate:"",airMode:"weekly",airDay:2,airTime:"21:30"},
  {id:"zp-s02",projectId:"zp",name:"С02",order:1,shootStart:"08.02.2026",shootEnd:"14.02.2026",editStart:"02.03.2026",preOtkDate:"20.03.2026",otkDate:"25.03.2026",airDate:"",airMode:"weekly",airDay:2,airTime:"21:30"},
  {id:"zp-s03",projectId:"zp",name:"С03",order:2,shootStart:"14.02.2026",shootEnd:"20.02.2026",editStart:"10.03.2026",preOtkDate:"20.03.2026",otkDate:"25.03.2026",airDate:"",airMode:"weekly",airDay:2,airTime:"21:30"},
  {id:"mb-s01",projectId:"mb",name:"С01",order:0,shootStart:"01.02.2026",shootEnd:"04.02.2026",editStart:"10.02.2026",preOtkDate:"10.04.2026",otkDate:"15.04.2026",airDate:"",airMode:"weekly",airDay:6,airTime:"21:00"},
  {id:"mb-s02",projectId:"mb",name:"С02",order:1,shootStart:"04.02.2026",shootEnd:"07.02.2026",editStart:"24.02.2026",preOtkDate:"10.04.2026",otkDate:"15.04.2026",airDate:"",airMode:"weekly",airDay:6,airTime:"21:00"},
  {id:"mb-s03",projectId:"mb",name:"С03",order:2,shootStart:"07.02.2026",shootEnd:"09.02.2026",editStart:"10.03.2026",preOtkDate:"10.04.2026",otkDate:"15.04.2026",airDate:"",airMode:"weekly",airDay:6,airTime:"21:00"},
  {id:"mb-s04",projectId:"mb",name:"С04",order:3,shootStart:"09.02.2026",shootEnd:"10.02.2026",editStart:"24.03.2026",preOtkDate:"10.04.2026",otkDate:"15.04.2026",airDate:"",airMode:"weekly",airDay:6,airTime:"21:00"},
];
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

// ── ХРАНИЛИЩЕ ДАННЫХ ─────────────────────────────────────────────────
//
//  STORAGE_MODE:
//    "server"  — собственный сервер + PostgreSQL (поменяйте когда айтишник настроит)
//
const VERSION = "1.4.2";
const BUILD_DATE = "11.10.2026";
const STORAGE_MODE = "server";

//  SERVER_URL — адрес вашего сервера.
//  Если браузер открывает страницу с того же сервера — оставьте "".
//  Если разработка на отдельной машине — укажите, например: "http://192.168.1.50:3000"
const SERVER_URL = "";
const DATA_ARRAY_KEYS=["projects","series","tasks","people","roles","stages","stageGroups","holidays","achievements","personAbsences","templates","changelog"];
function normalizeLoadedData(record){
  const result={...(record||{})};
  DATA_ARRAY_KEYS.forEach(key=>{if(!Array.isArray(result[key]))result[key]=[];});
  return result;
}
function accountBackupKey(user){return "post_tracker_backup:"+String(user?.sam_name||user?.id||"anonymous");}
function undoSnapshot(previous,current,now=Date.now()){
  const restored={...previous,_revision:current?._revision,changelog:current?.changelog||previous.changelog||[]};
  for(const key of SOFT_DELETE_KEYS){
    const old=Array.isArray(previous[key])?previous[key]:[];
    const ids=new Set(old.map(item=>String(item.id)));
    restored[key]=[
      ...old.map(item=>({...item,_updatedAt:now})),
      ...(current?.[key]||[]).filter(item=>!ids.has(String(item.id))).map(item=>({...item,deleted:true,_updatedAt:now})),
    ];
  }
  return restored;
}
function deleteSeriesSnapshot(data,id,now=Date.now()){
  return {
    series:(data.series||[]).map(s=>s.id===id?{...s,deleted:true,_updatedAt:now}:s),
    tasks:(data.tasks||[]).map(t=>t.seriesId===id?{...t,deleted:true,_updatedAt:now}:t),
  };
}
function personWeeklyHours(tasks,today,weeks=12){
  const end=parseDate(today);
  if(!end||!Number.isInteger(weeks)||weeks<1)return 0;
  const start=new Date(end);
  start.setDate(start.getDate()-(weeks*7-1));
  const first=daySort(formatDate(start)),last=daySort(today);
  return (tasks||[]).filter(t=>!t.deleted&&!t.cancelled&&parseDate(t.day)&&daySort(t.day)>=first&&daySort(t.day)<=last)
    .reduce((sum,t)=>sum+Math.max(0,taskHours(t)),0)/weeks;
}
function mergeChangelog(...lists){
  const unique=new Map();
  for(const entry of lists.flat()){
    if(entry&&typeof entry.text==="string")unique.set(String(entry.ts)+":"+entry.text,entry);
  }
  return Array.from(unique.values()).sort((a,b)=>(Number(b.ts)||0)-(Number(a.ts)||0)).slice(0,200);
}
function createSaveQueue(save,onResult,onError){
  let tail=Promise.resolve(),version=0,pending=false;
  return {
    get pending(){return pending;},
    enqueue(payload){
      const current=++version;
      pending=true;
      tail=tail.catch(()=>{}).then(()=>save(payload)).then(result=>{
        if(current===version){pending=false;onResult(result);}
      },error=>{if(current===version){pending=false;onError(error);}});
      return tail;
    }
  };
}
let csrfToken = "";
function setCsrfToken(token){ csrfToken = token || ""; }
function csrfHeaders(headers){
  const h = {...(headers||{})};
  if(csrfToken) h["X-CSRF-Token"] = csrfToken;
  return h;
}
async function csrfFetch(url, options){
  const opts = {...(options||{})};
  const method = (opts.method||"GET").toUpperCase();
  if(["POST","PUT","PATCH","DELETE"].includes(method)) opts.headers = csrfHeaders(opts.headers);
  return fetch(url, opts);
}

async function cloudLoad() {
  const res = await fetch(SERVER_URL + "/api/data", {credentials:"include"});
  if (!res.ok) throw new Error("Server error: " + res.status);
  return normalizeLoadedData(await res.json());
}

async function cloudSave(data, clientId) {
  const headers = {"Content-Type": "application/json"};
  if (clientId) headers["x-client-id"] = clientId;
  const res = await csrfFetch(SERVER_URL + "/api/data", {
    method: "PUT",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const problem=await res.json().catch(()=>({}));
    throw new Error(problem.error||("Не удалось сохранить изменения ("+res.status+")"));
  }
  const result = await res.json();
  return normalizeLoadedData(result.data || result);
}

// ── ИНКРЕМЕНТАЛЬНЫЕ СОХРАНЕНИЯ (точечные POST/DELETE) ──────────────
const INCR_TYPES = { project: "project", series: "series", task: "task", person: "person", role: "role", achievement: "achievement" };

async function incrSave(type, item) {
  // UI changes are saved once by the bulk queue, including deletions.
}

async function incrDelete(type, id) {
  // Individual API endpoints remain available to integrations.
}

// ── SEED ─────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map(h=>h.trim().toLowerCase());
  return lines.slice(1).map((line,idx)=>{
    const cols=[]; let cur="", inQ=false;
    for(const ch of line){
      if(ch==='"') inQ=!inQ;
      else if(ch===',' && !inQ){cols.push(cur.trim());cur="";}
      else cur+=ch;
    }
    cols.push(cur.trim());
    const obj={_id:idx};
    headers.forEach((h,i)=>{obj[h]=(cols[i]||"").replace(/^"|"$/g,"").trim();});
    return obj;
  }).filter(r=>r["проект"]&&r["серия"]&&r["кто"]);
}

function nsStatus(s){
  if(!s) return "";
  const l=s.trim().toLowerCase();
  return l==="цвет / звук"?"цвет/звук":l;
}

function makeDemoData(){
  const raw=parseCSV(DEMO_CSV);
  const tasks=raw.map((t,i)=>{
    const projId=NAME_TO_ID[t["проект"]]||t["проект"];
    const serName=t["серия"];
    const ser=DEMO_SERIES.find(s=>s.projectId===projId&&s.name===serName);
    return {
      id:i+1,
      project:projId,
      series:serName,
      seriesId:ser?ser.id:null,
      status:nsStatus(t["статус"]),
      person:t["кто"],
      day:t["день"],
      from:parseInt(t["с"])??10,
      to:parseInt(t["до"])??19,
      note:t["заметка / факт"]||"",
      unplanned:false, shifts_tail:false, autogenerated:false,
    };
  });
  return {roles:DEMO_ROLES, people:DEMO_PEOPLE, projects:DEMO_PROJECTS,
    series:DEMO_SERIES, tasks, stages:DEFAULT_STAGES, holidays:DEFAULT_HOLIDAYS};
}

function exportJSON(data){
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const a=document.createElement("a");
  const url=URL.createObjectURL(blob);
  a.href=url;
  a.download="tracker_backup_"+formatDate(new Date())+".json";
  a.click();
  URL.revokeObjectURL(url);
}

function taskHours(t){
  return Math.max(0,(Number(t?.to)||0)-(Number(t?.from)||0));
}
function shiftFactFromHours(hours){
  const h=Number(hours)||0;
  if(h>12) return Number((h/12).toFixed(2));
  if(h>=6) return 1;
  if(h>=3) return 0.5;
  if(h>=1) return 0.2;
  return 0;
}
function xlsEscape(v){
  return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function xlsFilePart(v){
  return String(v||"").replace(/[^0-9A-Za-zА-Яа-я._-]+/g,"_").replace(/^_+|_+$/g,"")||"all";
}
function downloadAnalyticsXls(tasks,data,stageMap,filters={}){
  const rows=(tasks||[]).filter(t=>!t.deleted&&!t.cancelled).slice().sort((a,b)=>
    daySort(a.day).localeCompare(daySort(b.day))||
    String(a.person||"").localeCompare(String(b.person||""),"ru")||
    String(projName(data.projects||[],a.project)).localeCompare(String(projName(data.projects||[],b.project)),"ru")||
    String(a.series||"").localeCompare(String(b.series||""),"ru")
  );
  if(!rows.length){alert("Нет данных для выгрузки");return;}
  const thStyle="background:#1f4e78;color:#ffffff;font-weight:700;border:1px solid #9e9e9e;padding:6px;";
  const tdStyle="border:1px solid #b7b7b7;padding:5px;mso-number-format:'\\@';";
  const headers=["Дата","ФИО","Вид работ","Проект","Выпуск","Задача факт (комментарий)","Смена факт"];
  const htmlRows=rows.map(t=>{
    const hours=taskHours(t);
    const fact=shiftFactFromHours(hours);
    const bg=fact>1?"#f4cccc":fact<1?"#fff2cc":"#ffffff";
    const proj=(data.projects||[]).find(p=>p.id===t.project);
    const stage=stageMap?.[t.status];
    const cells=[t.day||"",t.person||"",stage?.label||t.status||"",proj?.name||t.project||"",t.series||"",t.note||"",fact];
    const tds=cells.map((c,i)=>'<td style="'+tdStyle+(i===6?"mso-number-format:'0.00';":"")+'">'+xlsEscape(c)+'</td>').join("");
    return '<tr style="background:'+bg+'">'+tds+'</tr>';
  }).join("\n");
  const head=headers.map(h=>'<th style="'+thStyle+'">'+xlsEscape(h)+'</th>').join("");
  const html='<!doctype html><html><head><meta charset="utf-8"><style>table{border-collapse:collapse;font-family:Arial,sans-serif;font-size:11pt;} td,th{vertical-align:top;} .note{color:#666;font-size:10pt;}</style></head><body><table><thead><tr>'+head+'</tr></thead><tbody>'+htmlRows+'</tbody></table><br><div class="note">Желтый: меньше 1 смены. Красный: больше 1 смены. 1 смена = 6-12 ч; 0.5 = 3-6 ч; 0.2 = 1-3 ч; 0 = до 1 ч.</div></body></html>';
  const blob=new Blob(["\ufeff"+html],{type:"application/vnd.ms-excel;charset=utf-8"});
  const a=document.createElement("a");
  const url=URL.createObjectURL(blob);
  const from=xlsFilePart(filters.from||"all");
  const to=xlsFilePart(filters.to||"all");
  const project=xlsFilePart(filters.projectName||"all_projects");
  a.href=url;
  a.download="tracker_analytics_"+project+"_"+from+"_"+to+".xls";
  a.click();
  URL.revokeObjectURL(url);
}

function importJSON(onLoad){
  const inp=document.createElement("input");
  inp.type="file"; inp.accept=".json,application/json";
  inp.onchange=e=>{
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=ev=>{
      try{
        const parsed=JSON.parse(ev.target.result);
        if(!parsed||typeof parsed!=="object"||!Array.isArray(parsed.projects)||!Array.isArray(parsed.tasks))
          {alert("Файл не похож на бэкап ПОСТ ТРЕКЕРА — ожидаются массивы projects и tasks");return;}
        onLoad(parsed);
      }catch{alert("Ошибка чтения файла — невалидный JSON");}
    };
    reader.onerror=()=>alert("Ошибка чтения файла");
    reader.readAsText(file);
  };
  inp.click();
}

function genId(arr){
  const nums=(arr||[]).map(x=>Number(x.id)).filter(Number.isFinite);
  return nums.length?Math.max(...nums)+1:1;
}
function genTaskId(arr){
  let id;
  do { id=Date.now()*1000+Math.floor(Math.random()*1000); }
  while((arr||[]).some(x=>String(x.id)===String(id)));
  return id;
}

// ── УТИЛИТЫ ──────────────────────────────────────────────────────────
function colorToBg(hex){
  if(!hex||hex.length<7) return "rgba(100,116,139,0.12)";
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},0.12)`;
}
function hexToRgba(hex,alpha=0.12){
  if(!hex||typeof hex!=="string"||hex.length<7) return `rgba(100,116,139,${alpha})`;
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  if([r,g,b].some(Number.isNaN)) return `rgba(100,116,139,${alpha})`;
  return `rgba(${r},${g},${b},${alpha})`;
}
function stageBg(hex){return (hex||"#64748b")+"33";}
function stageBorder(hex){return (hex||"#64748b")+"66";}


const PROJECT_SHAPES = [
  {id:"circle",label:"\u041a\u0440\u0443\u0433"},
  {id:"square",label:"\u041a\u0432\u0430\u0434\u0440\u0430\u0442"},
  {id:"diamond",label:"\u0420\u043e\u043c\u0431"},
  {id:"triangle",label:"\u0422\u0440\u0435\u0443\u0433\u043e\u043b\u044c\u043d\u0438\u043a"},
  {id:"pill",label:"\u041f\u043b\u0430\u0448\u043a\u0430"},
];
const PROJECT_PATTERNS = [
  {id:"solid",label:"\u0421\u043f\u043b\u043e\u0448\u043d\u043e\u0439"},
  {id:"stripe",label:"\u0414\u0438\u0430\u0433\u043e\u043d\u0430\u043b\u044c"},
  {id:"cross",label:"\u041a\u043b\u0435\u0442\u043a\u0430"},
  {id:"dots",label:"\u0422\u043e\u0447\u043a\u0438"},
  {id:"ring",label:"\u041a\u043e\u043b\u044c\u0446\u043e"},
];
const PROJECT_VISUAL_TEXT = {
  color:"\u0426\u0432\u0435\u0442", shape:"\u0424\u043e\u0440\u043c\u0430", pattern:"\u0428\u0442\u0440\u0438\u0445\u043e\u0432\u043a\u0430", preview:"\u0412\u0438\u0434",
};
function projectVisual(project){
  const visual=project?.dossier?.visual||{};
  return {shape:visual.shape||"circle",pattern:visual.pattern||"solid"};
}
function projectPatternStyle(color,pattern){
  const base=color||"#64748b";
  const soft=colorToBg(base);
  if(pattern==="stripe") return {backgroundColor:soft,backgroundImage:`repeating-linear-gradient(45deg, ${base} 0 3px, transparent 3px 6px)`};
  if(pattern==="cross") return {backgroundColor:soft,backgroundImage:`repeating-linear-gradient(45deg, ${base} 0 2px, transparent 2px 6px), repeating-linear-gradient(-45deg, ${base} 0 2px, transparent 2px 6px)`};
  if(pattern==="dots") return {backgroundColor:soft,backgroundImage:`radial-gradient(circle, ${base} 0 1.6px, transparent 1.8px)`,backgroundSize:"6px 6px"};
  if(pattern==="ring") return {backgroundColor:"transparent",border:`2px solid ${base}`};
  return {backgroundColor:base};
}
function projectMarkStyle(project,size=8){
  const v=projectVisual(project);
  const color=project?.color||"#64748b";
  const isPill=v.shape==="pill";
  const style={display:"inline-block",width:isPill?Math.round(size*1.7):size,height:size,flexShrink:0,boxSizing:"border-box",...projectPatternStyle(color,v.pattern)};
  if(v.shape==="circle"||v.shape==="pill") style.borderRadius=999;
  else if(v.shape==="square") style.borderRadius=Math.max(2,Math.round(size*0.18));
  else if(v.shape==="diamond") {style.borderRadius=Math.max(1,Math.round(size*0.12));style.transform="rotate(45deg)";}
  else if(v.shape==="triangle") {style.clipPath="polygon(50% 0, 100% 100%, 0 100%)";style.borderRadius=0;}
  return style;
}
function ProjectMark({project,size=8,style,title}){
  return <span title={title||project?.name||""} style={{...projectMarkStyle(project,size),...style}}/>;
}
function ProjectVisualPicker({project,onColor,onVisual}){
  const visual=projectVisual(project);
  const color=project?.color||"#3b82f6";
  const setVisual=ch=>onVisual&&onVisual({...visual,...ch});
  return (
    <div style={{display:"grid",gap:10}}>
      <div>
        <div style={{fontSize:10,color:"#64748b",letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>{PROJECT_VISUAL_TEXT.color}</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          {PALETTE.map(c=>(
            <button key={c} type="button" onClick={()=>onColor&&onColor(c)}
              title={c}
              style={{width:24,height:24,borderRadius:5,background:c,cursor:"pointer",
                border:color===c?"2px solid #fff":"2px solid transparent",boxShadow:color===c?`0 0 8px ${c}`:"none"}}/>
          ))}
          <input type="color" value={color} onChange={e=>onColor&&onColor(e.target.value)}
            style={{width:28,height:24,border:"1px solid #334155",background:"#0f172a",cursor:"pointer",padding:1,borderRadius:5}}/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div>
          <div style={{fontSize:10,color:"#64748b",letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>{PROJECT_VISUAL_TEXT.shape}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {PROJECT_SHAPES.map(sh=>(
              <button key={sh.id} type="button" onClick={()=>setVisual({shape:sh.id})} title={sh.label}
                style={{width:34,height:28,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",
                  borderRadius:10,background:visual.shape===sh.id?"rgba(59,130,246,0.18)":"#0f172a",
                  border:`1px solid ${visual.shape===sh.id?"#3b82f6":"#334155"}`}}>
                <ProjectMark project={{...project,dossier:{...(project?.dossier||{}),visual:{...visual,shape:sh.id}}}} size={12}/>
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={{fontSize:10,color:"#64748b",letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>{PROJECT_VISUAL_TEXT.pattern}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {PROJECT_PATTERNS.map(pt=>(
              <button key={pt.id} type="button" onClick={()=>setVisual({pattern:pt.id})} title={pt.label}
                style={{width:34,height:28,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",
                  borderRadius:10,background:visual.pattern===pt.id?"rgba(59,130,246,0.18)":"#0f172a",
                  border:`1px solid ${visual.pattern===pt.id?"#3b82f6":"#334155"}`}}>
                <ProjectMark project={{...project,dossier:{...(project?.dossier||{}),visual:{...visual,pattern:pt.id}}}} size={12}/>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function isNonWorkday(dateStr, holidays){
  const d=parseDate(dateStr); if(!d) return false;
  const dow=d.getDay();
  if(dow===0||dow===6) return true;
  return (holidays||[]).includes(dateStr);
}

function parseDate(str){
  if(!str||typeof str!=="string") return null;
  const m=str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if(!m) return null;
  const date=new Date(+m[3],+m[2]-1,+m[1]);
  return date.getFullYear()===+m[3]&&date.getMonth()===+m[2]-1&&date.getDate()===+m[1]?date:null;
}
function formatDate(d){
  if(!d) return "";
  const dd=String(d.getDate()).padStart(2,"0");
  const mm=String(d.getMonth()+1).padStart(2,"0");
  return `${dd}.${mm}.${d.getFullYear()}`;
}
function toInput(dmy){
  if(!dmy) return "";
  const m=dmy.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  return m?`${m[3]}-${m[2]}-${m[1]}`:"";
}
function fromInput(ymd){
  if(!ymd) return "";
  const [y,mo,d]=ymd.split("-");
  return `${d}.${mo}.${y}`;
}
function normalizeBirthday(value){
  const raw=String(value||"").trim();
  if(!raw) return "";
  const m=raw.match(/^(\d{1,2})[.\-/](\d{1,2})$/);
  if(!m) return null;
  const day=+m[1], month=+m[2];
  const test=new Date(2000,month-1,day);
  if(test.getMonth()!==month-1||test.getDate()!==day) return null;
  return `${String(day).padStart(2,"0")}.${String(month).padStart(2,"0")}`;
}
function birthdayDateForYear(birthday,year){
  const b=normalizeBirthday(birthday);
  if(!b) return "";
  const [d,m]=b.split(".");
  return `${d}.${m}.${year}`;
}
function birthdayNextDate(birthday,fromDate=new Date()){
  const b=normalizeBirthday(birthday);
  if(!b) return null;
  const from=new Date(fromDate);from.setHours(0,0,0,0);
  const [d,m]=b.split(".").map(Number);
  let next=new Date(from.getFullYear(),m-1,d);
  if(next<from) next=new Date(from.getFullYear()+1,m-1,d);
  return next;
}
function birthdayDiffDays(birthday,fromDate=new Date()){
  const next=birthdayNextDate(birthday,fromDate);
  if(!next) return null;
  const from=new Date(fromDate);from.setHours(0,0,0,0);
  return Math.round((next-from)/86400000);
}

const ABSENCE_TYPES = [
  {id:"dayoff",label:"Выходной",short:"Вых",color:"#fdba74"},
  {id:"vacation",label:"Отпуск",short:"Отп",color:"#38bdf8"},
  {id:"sick",label:"Болезнь",short:"Бол",color:"#f87171"},
];
function absenceTypeInfo(type){
  return ABSENCE_TYPES.find(a=>a.id===type)||ABSENCE_TYPES[0];
}
function normalizeAbsence(a){
  const start=a?.startDay||a?.day||formatDate(new Date());
  return {
    id:String(a?.id||"abs_"+Date.now()),
    personId:String(a?.personId||""),
    personName:String(a?.personName||""),
    type:a?.type||"dayoff",
    startDay:start,
    endDay:a?.endDay||start,
    note:String(a?.note||""),
    deleted:a?.deleted===true,
    updatedAt:a?.updatedAt||"",
    _updatedAt:a?._updatedAt||0,
  };
}
function absencePersonMatches(absence, person){
  if(!absence||!person) return false;
  const vals=[person.id,person.name,person.login,person.email].filter(Boolean).map(v=>String(v).trim().toLowerCase());
  const aVals=[absence.personId,absence.personName].filter(Boolean).map(v=>String(v).trim().toLowerCase());
  return aVals.some(v=>vals.includes(v));
}
function absencesForPersonDay(absences, people, personName, day){
  const person=(people||[]).find(p=>p.name===personName)||{name:personName};
  const dk=daySort(day);
  return (absences||[]).filter(a=>{
    if(a.deleted) return false;
    if(!absencePersonMatches(a,person)) return false;
    const from=daySort(a.startDay||a.day);
    const to=daySort(a.endDay||a.startDay||a.day);
    return dk>=from&&dk<=to;
  });
}
function birthdayPeopleOnDate(people,dateStr){
  const d=parseDate(dateStr); if(!d) return [];
  const key=`${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}`;
  return (people||[]).filter(p=>p.active!==false&&!p.deleted&&normalizeBirthday(p.birthday)===key);
}
function upcomingBirthdays(people,fromDate=new Date(),days=7){
  return (people||[]).filter(p=>p.active!==false&&!p.deleted&&normalizeBirthday(p.birthday)).map(p=>{
    const next=birthdayNextDate(p.birthday,fromDate);
    const diff=birthdayDiffDays(p.birthday,fromDate);
    return {person:p,date:formatDate(next),diff};
  }).filter(x=>x.diff>=0&&x.diff<=days).sort((a,b)=>a.diff-b.diff||a.person.name.localeCompare(b.person.name));
}
function birthdayWhenText(diff){
  if(diff===0) return "сегодня";
  if(diff===1) return "завтра";
  return `через ${diff} дн.`;
}
function dayLabel(str){
  const d=parseDate(str); if(!d) return str;
  return `${WDAYS[d.getDay()]} ${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}`;
}
function weekKey(str){
  const d=parseDate(str); if(!d) return str;
  const day=d.getDay()||7;
  const mon=new Date(d); mon.setDate(d.getDate()-day+1);
  return mon.toISOString().slice(0,10);
}
function weekLabel(str){
  const d=parseDate(str); if(!d) return str;
  const day=d.getDay()||7;
  const mon=new Date(d); mon.setDate(d.getDate()-day+1);
  const sun=new Date(mon); sun.setDate(mon.getDate()+6);
  const fmt=dt=>`${String(dt.getDate()).padStart(2,"0")}.${String(dt.getMonth()+1).padStart(2,"0")}`;
  return `${fmt(mon)} – ${fmt(sun)}`;
}
function monthKey(str){
  const d=parseDate(str); if(!d) return str;
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}
function addDays(str,n){
  const d=parseDate(str); if(!d) return str;
  d.setDate(d.getDate()+n);
  return formatDate(d);
}

const OLD_TASK_EDIT_LIMIT_DAYS=14;
function isDayOlderThanLimit(day,limit=OLD_TASK_EDIT_LIMIT_DAYS){
  const d=parseDate(day);
  if(!d) return false;
  d.setHours(0,0,0,0);
  const now=new Date(); now.setHours(0,0,0,0);
  return (now-d)/86400000>limit;
}
function addWorkdays(str,n,holidays){
  const h=new Set(holidays||[]);
  let d=parseDate(str); if(!d) return str;
  let added=0;
  while(added<n){
    d.setDate(d.getDate()+1);
    const dow=d.getDay();
    if(dow!==0&&dow!==6&&!h.has(formatDate(d))) added++;
  }
  return formatDate(d);
}
function generateAirDates(proj){
  if(proj.air_mode==="custom") return proj.air_dates||[];
  if(proj.air_mode!=="weekly") return [];
  const start=parseDate(proj.edit_start);
  const end=parseDate(proj.otk);
  if(!start||!end) return [];
  const jsDay=(proj.air_weekday??1)%7;
  const d=new Date(start);
  while(d.getDay()!==jsDay) d.setDate(d.getDate()+1);
  const dates=[];
  while(d<=end){dates.push(formatDate(d));d.setDate(d.getDate()+7);}
  return dates;
}
function generateSeriesAirDates(series){
  if(!series) return [];
  if(series.airDate) return [series.airDate];
  if(series.airMode!=="weekly") return [];
  if(!series.editStart||!series.otkDate) return [];
  const jsDay=(series.airDay??1)%7;
  const start=parseDate(series.editStart);
  const end=parseDate(series.otkDate);
  if(!start||!end) return [];
  const d=new Date(start);
  while(d.getDay()!==jsDay) d.setDate(d.getDate()+1);
  const dates=[];
  while(d<=end){dates.push(formatDate(d));d.setDate(d.getDate()+7);}
  return dates;
}
function filterPeopleByStatus(people, status, stages){
  const stage=(stages||[]).find(s=>s.id===status);
  const roles=stage?.rolesRequired||[];
  if(!roles.length) return people.filter(p=>p.active!==false);
  return people.filter(p=>p.active!==false&&(p.roles||[]).some(r=>roles.includes(r)));
}
function getConflicts(tasks,people,stages,projects,personAbsences){
  tasks=(tasks||[]).filter(t=>!t.deleted&&!t.cancelled);
  const ids=new Set(); const details=[];
  const today=new Date(); today.setHours(0,0,0,0);
  const todayStr=formatDate(today);
  const in7=new Date(today); in7.setDate(today.getDate()+7);
  const in7Str=formatDate(in7);
  const byPD={};
  tasks.filter(t=>t.person&&!((stages||[]).find(s=>s.id===t.status)?.noImpact)).forEach(t=>{
    const k=t.person+"||"+t.day;
    if(!byPD[k]) byPD[k]=[];
    byPD[k].push(t);
  });
  Object.values(byPD).forEach(group=>{
    const personObj=(people||[]).find(p=>p.name===group[0]?.person);
    if(personObj?.allowParallel) return;
    for(let i=0;i<group.length;i++) for(let j=i+1;j<group.length;j++){
      const a=group[i],b=group[j];
      const af=a.from||0,at=a.to||0,bf=b.from||0,bt=b.to||0;
      if(af<bt&&bf<at){
        ids.add(a.id);ids.add(b.id);
        const key=[a.id,b.id].sort().join("-");
        if(!details.find(d=>d.key===key))
          details.push({type:"overlap",notify:true,key,person:a.person,dayStr:a.day,taskA:a,taskB:b,
            overlapFrom:Math.max(af,bf),overlapTo:Math.min(at,bt)});
      }
    }
  });
  tasks.forEach(t=>{
    const stage=(stages||[]).find(s=>s.id===t.status);
    if(!t.person&&stage?.needsExecutor&&!stage.noImpact&&daySort(t.day)>=daySort(todayStr)&&daySort(t.day)<=daySort(in7Str)){
      ids.add(t.id);
      details.push({type:"unfilled",notify:true,key:"unfilled-"+t.id,task:t});
    }
  });
  tasks.forEach(t=>{
    if(t.deleted||t.cancelled) return;
    const stage=(stages||[]).find(s=>s.id===t.status);
    if(stage?.noImpact) return;
    const hours=taskHours(t);
    if(hours>12){
      ids.add(t.id);
      details.push({type:"long-shift",notify:false,key:"long-shift-"+t.id,task:t,hours});
    }
  });
  (tasks||[]).forEach(t=>{
    if(!t.person) return;
    const hits=absencesForPersonDay(personAbsences,people,t.person,t.day);
    hits.forEach(a=>{
      ids.add(t.id);
      details.push({type:"absence",notify:true,key:"absence-"+t.id+"-"+a.id,task:t,person:t.person,absence:a});
    });
  });
  if(people&&stages){
    tasks.forEach(t=>{
      if(!t.person) return;
      const stage=(stages||[]).find(s=>s.id===t.status);
      if(!stage||!stage.rolesRequired||!stage.rolesRequired.length) return;
      if(stage.noImpact) return;
      const person=(people||[]).find(p=>p.name===t.person);
      if(!person) return;
      const personRoles=person.roles||[];
      const match=stage.rolesRequired.some(r=>personRoles.includes(r));
      if(!match){
        ids.add(t.id);
        details.push({type:"role",notify:true,key:"role-"+t.id,task:t,person:t.person,
          stage:stage.label,requiredRoles:stage.rolesRequired,personRoles});
      }
    });
  }
  (projects||[]).filter(p=>p.status!=="\u0430\u0440\u0445\u0438\u0432"&&!p.deleted).forEach(p=>{
    const managers=(p.managers||[]).filter(m=>String(m?.uid||m?.name||m||"").trim());
    if(!managers.length) details.push({type:"project-manager",notify:false,key:"project-manager-"+p.id,project:p});
  });
  return {ids,details};
}
function enrichTasks(tasks){
  return tasks.filter(t=>!t.deleted).map(t=>({...t,
    _dayKey:t.day,
    _weekKey:weekKey(t.day),
    _monthKey:monthKey(t.day),
  }));
}
function projColor(projects,projId){
  return (projects.find(p=>p.id===projId)||{}).color||"#3b82f6";
}
function projName(projects,projId){
  return (projects.find(p=>p.id===projId)||{}).name||projId;
}
function projAbbr(projects,projId){
  const p=projects.find(pr=>pr.id===projId);
  return p?(p.abbr||p.name):projId;
}

function parseHash(){
  try {
  const mp=window.location.hash.match(/^#project\/(.+)$/);
  if(mp) return {type:"project",id:decodeURIComponent(mp[1])};
  const ms=window.location.hash.match(/^#series\/(.+)$/);
  if(ms) return {type:"series",id:decodeURIComponent(ms[1])};
  const m=window.location.hash.match(/^#person\/(.+)$/);
  if(m) return {type:"person",id:decodeURIComponent(m[1])};
  return null;
  } catch(error) { return null; }
}
function canSeeTaskNotes(){
  return window.PPT_CAN_SEE_TASK_NOTES === true;
}

function accessKey(value){
  return String(value||"").trim().toLowerCase();
}
function sameAccessKey(a,b){
  const ak=accessKey(a),bk=accessKey(b);
  return !!ak&&!!bk&&ak===bk;
}
function findCurrentPerson(user,data){
  return (data?.people||[]).find(p=>
    sameAccessKey(p.login,user?.sam_name)||
    sameAccessKey(p.name,user?.display_name)||
    sameAccessKey(p.email,user?.email)
  );
}
function currentUserProjectKeys(user,data){
  const keys=new Set([user?.id,user?.userId,user?.sam_name,user?.display_name,user?.email].map(accessKey).filter(Boolean));
  const person=findCurrentPerson(user,data);
  if(person){[person.id,person.name,person.login,person.email].forEach(v=>{const k=accessKey(v);if(k)keys.add(k);});}
  return keys;
}
function projectAssignedToKeys(project,keys){
  if(!project||!keys) return false;
  return (project.managers||[]).some(m=>keys.has(accessKey(m?.uid||m))||keys.has(accessKey(m?.name||m)));
}
function currentUserManagerEntry(user,data){
  const person=findCurrentPerson(user,data);
  return {uid:person?.id||user?.sam_name||user?.userId||user?.id||user?.display_name||"",name:person?.name||user?.display_name||user?.sam_name||user?.userId||user?.id||""};
}

// ── ОБЩИЕ КОМПОНЕНТЫ ─────────────────────────────────────────────────
function Modal({title,onClose,wide,onSubmit,children,freeOverflow}){
  useEffect(()=>{
    const h=(e)=>{
      if(e.key==="Escape"){e.preventDefault();e.stopPropagation();onClose();}
      if(e.altKey&&(e.key==="Enter"||e.code==="Enter")) {e.preventDefault();onSubmit&&onSubmit();}
    };
    document.addEventListener("keydown",h,true);
    return ()=>document.removeEventListener("keydown",h,true);
  },[onClose,onSubmit]);
  const modal=(
    <div className="ppt-modal-backdrop" onClick={e=>{/* backdrop locked */}}
      style={{position:"fixed",inset:0,background:"rgba(3,7,18,0.72)",
        display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:2147483000,padding:"18px 16px",overflowY:"auto",overscrollBehavior:"contain",isolation:"isolate"}}>
      <div className="ppt-modal-panel" style={{background:"linear-gradient(180deg,rgba(30,41,59,.92),rgba(15,23,42,.94))",border:"1px solid rgba(148,163,184,.24)",borderRadius:20,
        position:"relative",zIndex:2147483001,width:wide?720:480,maxWidth:"100%",maxHeight:"calc(100dvh - 36px)",display:"flex",flexDirection:"column",overflow:freeOverflow?"visible":"hidden"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid rgba(148,163,184,.18)",
          display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0,background:"rgba(255,255,255,.025)"}}>
          <span style={{fontWeight:800,fontSize:16,color:"#f8fafc",letterSpacing:.1}}>{title}</span>
          <button className="ppt-btn" onClick={onClose} style={{background:"rgba(15,23,42,.72)",border:"1px solid rgba(148,163,184,.22)",color:"#9aa9bd",
            fontSize:22,cursor:"pointer",lineHeight:1,padding:"3px 8px",borderRadius:12}}>x</button>
        </div>
        <div style={{padding:"18px 20px",overflowY:freeOverflow?"visible":"auto",flex:1}}>{children}</div>
      </div>
    </div>
  );
  if(typeof document!=="undefined"&&document.body&&ReactDOM?.createPortal){
    return ReactDOM.createPortal(modal,document.body);
  }
  return modal;
}

function Btn({onClick,variant="default",children,small,style,disabled,type}){
  const s={
    default:{background:"linear-gradient(180deg,rgba(30,58,95,.78),rgba(15,23,42,.7))",border:"1px solid rgba(96,165,250,.32)",color:"#93c5fd"},
    primary:{background:"linear-gradient(135deg,#2563eb,#3b82f6 54%,#22d3ee)",border:"1px solid rgba(147,197,253,.55)",color:"#fff",boxShadow:"0 10px 28px rgba(37,99,235,.22)"},
    danger: {background:"linear-gradient(180deg,rgba(239,68,68,.20),rgba(127,29,29,.12))",border:"1px solid rgba(248,113,113,.42)",color:"#fca5a5"},
    ghost:  {background:"rgba(15,23,42,.38)",border:"1px solid rgba(148,163,184,.22)",color:"#a9b8cc"},
    success:{background:"linear-gradient(180deg,rgba(34,197,94,.18),rgba(20,83,45,.12))",border:"1px solid rgba(74,222,128,.42)",color:"#86efac"},
    warn:   {background:"linear-gradient(180deg,rgba(249,115,22,.18),rgba(124,45,18,.12))",border:"1px solid rgba(251,146,60,.42)",color:"#fdba74"},
  }[variant]||{};
  return (
    <button className={`ppt-btn ppt-btn-${variant}`} type={type||"button"} onClick={onClick} disabled={disabled}
      style={{...s,padding:small?"4px 11px":"7px 15px",borderRadius:small?10:12,
        cursor:disabled?"not-allowed":"pointer",fontSize:small?11:13,
        fontWeight:700,opacity:disabled?0.5:1,letterSpacing:.05,...style}}>
      {children}
    </button>
  );
}

function Field({label,children,hint,row}){
  return (
    <div style={{marginBottom:14}}>
      {label&&<div style={{fontSize:11,color:"#8ea2bb",letterSpacing:1,
        textTransform:"uppercase",marginBottom:6,fontWeight:800}}>{label}</div>}
      {row?<div style={{display:"flex",gap:8,alignItems:"center"}}>{children}</div>:children}
      {hint&&<div style={{fontSize:11,color:"#475569",marginTop:4}}>{hint}</div>}
    </div>
  );
}

function Inp({value,onChange,placeholder,style,type,min,max}){
  return (
    <input className="ppt-input" type={type||"text"} value={value||""} min={min} max={max}
      onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{background:"rgba(8,13,26,.74)",border:"1px solid rgba(148,163,184,.24)",color:"#eef4ff",
        borderRadius:11,padding:"8px 11px",fontSize:14,width:"100%",...style}}/>
  );
}

function InpDate({value,onChange,warn}){
  return (
    <div>
      <input className="ppt-input" type="date" value={toInput(value)} onChange={e=>onChange(fromInput(e.target.value))}
        style={{background:"rgba(8,13,26,.74)",border:`1px solid ${warn?"#fb923c":"rgba(148,163,184,.24)"}`,color:"#eef4ff",
          borderRadius:11,padding:"8px 11px",fontSize:14,width:"100%"}}/>
      {warn&&<div style={{fontSize:11,color:"#fb923c",marginTop:3}}>! Выходной или праздник</div>}
    </div>
  );
}

function Sel({value,onChange,options,placeholder,style}){
  return (
    <select className="ppt-input" value={value||""} onChange={e=>onChange(e.target.value)}
      style={{background:"rgba(8,13,26,.74)",border:"1px solid rgba(148,163,184,.24)",
        color:value?"#eef4ff":"#6f8096",borderRadius:11,padding:"8px 11px",
        fontSize:14,width:"100%",...style}}>
      {placeholder&&<option value="">{placeholder}</option>}
      {options.map(o=>typeof o==="string"
        ?<option key={o} value={o}>{o}</option>
        :<option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function SelSearch({value,onChange,options,placeholder,style,allowCustom,autoFocus}){
  const [query,setQuery]=useState("");
  const [open,setOpen]=useState(false);
  const [hiIdx,setHiIdx]=useState(-1);
  const ref=useRef(null);
  const inputRef=useRef(null);
  const listRef=useRef(null);
  useEffect(()=>{if(autoFocus&&inputRef.current)inputRef.current.focus();},[]);
  const normalized=useMemo(()=>options.map(o=>typeof o==="string"?{value:o,label:o}:o),[options]);
  const selected=normalized.find(o=>o.value===value);
  const filtered=query
    ?normalized.filter(o=>o.label.toLowerCase().includes(query.toLowerCase()))
    :normalized;

  useEffect(()=>{setHiIdx(-1);},[filtered.length,query]);

  useEffect(()=>{
    function h(e){if(ref.current&&!ref.current.contains(e.target)){setOpen(false);setQuery("");}}
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[]);

  function pick(opt){onChange(opt.value);setQuery("");setOpen(false);setHiIdx(-1);}

  function handleFocus(){setOpen(true);setQuery("");}
  function handleChange(e){
    setQuery(e.target.value);
    setOpen(true);
    if(!e.target.value){onChange("");}
  }
  function handleBlur(){
    if(allowCustom&&query&&!normalized.find(o=>o.value===query||o.label===query)){
      onChange(query);
    }
  }
  function handleKeyDown(e){
    if(e.key==="Escape"){setOpen(false);setQuery("");return;}
    if(e.key==="ArrowDown"){
      e.preventDefault();
      setOpen(true);
      setHiIdx(i=>{const n=Math.min(i+1,filtered.length-1);
        setTimeout(()=>{if(listRef.current){const el=listRef.current.children[n];if(el)el.scrollIntoView({block:"nearest"});}},0);
        return n;
      });
      return;
    }
    if(e.key==="ArrowUp"){
      e.preventDefault();
      setHiIdx(i=>{const n=Math.max(i-1,0);
        setTimeout(()=>{if(listRef.current){const el=listRef.current.children[n];if(el)el.scrollIntoView({block:"nearest"});}},0);
        return n;
      });
      return;
    }
    if(e.key==="Enter"){
      e.preventDefault();
      if(hiIdx>=0&&filtered[hiIdx]) pick(filtered[hiIdx]);
      else if(filtered.length>0) pick(filtered[0]);
    }
  }

  const displayVal=open?(query):(selected?selected.label:"");

  return (
    <div ref={ref} style={{position:"relative",...style}}>
      <input ref={inputRef} value={displayVal}
        onFocus={handleFocus}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={selected?"":placeholder||"Выбрать..."}
        style={{background:"#0f172a",border:"1px solid #334155",color:"#e2e8f0",
          borderRadius:10,padding:"7px 10px",fontSize:13,width:"100%"}}/>
      {open&&filtered.length>0&&(
        <div ref={listRef} style={{position:"absolute",top:"100%",left:0,right:0,marginTop:2,
          background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:10,
          zIndex:400,maxHeight:200,overflowY:"auto",boxShadow:"0 4px 20px rgba(0,0,0,0.6)"}}>
          {filtered.map((opt,i)=>(
            <div key={opt.value}
              onMouseDown={()=>pick(opt)}
              onMouseEnter={()=>setHiIdx(i)}
              style={{padding:"6px 10px",cursor:"pointer",fontSize:13,
                background:i===hiIdx?"rgba(59,130,246,0.35)":opt.value===value?"rgba(59,130,246,0.15)":"transparent",
                color:i===hiIdx||opt.value===value?"#93c5fd":"#e2e8f0"}}>
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function StatusBadge({s,small}){
  const {stageMap}=useContext(StagesCtx);
  const st=stageMap[s];
  if(!st) return <span style={{fontSize:10,color:"#475569"}}>{s||"—"}</span>;
  return (
    <span style={{display:"inline-block",background:stageBg(st.color),color:st.color,
      border:`1px solid ${stageBorder(st.color)}`,borderRadius:4,
      padding:small?"1px 6px":"2px 8px",fontSize:small?10:11,fontWeight:600,whiteSpace:"nowrap"}}
      title={st.abbr?st.label:undefined}>
      {small&&st.abbr?st.abbr:st.label}
    </span>
  );
}

function TaskCard({task,projects,isConflict,onClick,onHover,large}){
  const color=projColor(projects,task.project);
  const pname=large?projAbbr(projects,task.project):projName(projects,task.project);
  return (
    <div onClick={onClick}
      onMouseEnter={onHover?e=>onHover(task,e.currentTarget.getBoundingClientRect()):undefined}
      onMouseLeave={onHover?()=>onHover(null):undefined}
      style={{position:"relative",borderLeft:`3px solid ${task.cancelled?"#334155":isConflict?"#ef4444":color}`,
        background:task.cancelled?"rgba(15,23,42,0.4)":isConflict?"rgba(239,68,68,0.07)":"rgba(255,255,255,0.03)",
        borderRadius:"0 6px 6px 0",padding:"5px 8px",marginBottom:4,
        cursor:onClick?"pointer":"default",opacity:task.cancelled?0.4:1}}>
      {task.cancelled&&<span style={{position:"absolute",top:3,right:5,fontSize:10,opacity:0.7}}>🚫</span>}
      <div style={{fontWeight:700,color:task.cancelled?"#334155":isConflict?"#f87171":color,fontSize:11,marginBottom:2,
        textDecoration:task.cancelled?"line-through":"none"}}>
        {isConflict&&"⚡ "}{task.series}
        {task.unplanned&&!task.cancelled&&<span style={{color:"#f97316",marginLeft:4,fontSize:9}}>!внеплан</span>}
        <span style={{fontWeight:400,color:"#475569",marginLeft:5,fontSize:large?12:10}}>{pname}</span>
      </div>
      {canSeeTaskNotes()&&task.note&&<div style={{color:"#94a3b8",fontSize:10,lineHeight:1.3,marginBottom:3}}>{task.note}</div>}
      <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>
        <StatusBadge s={task.status} small/>
        <span style={{color:large?"#94a3b8":"#475569",fontSize:large?13:10,fontWeight:large?600:400}}>{fmtHour(task.from)}–{fmtHour(task.to)}</span>
      </div>
    </div>
  );
}
function TaskTooltip({task,rect,projects}){
  const {stageMap}=useContext(StagesCtx);
  if(!task||!rect) return null;
  const st=stageMap[task.status];
  const color=projColor(projects,task.project);
  const pname=projName(projects,task.project);
  const W=240; const vw=window.innerWidth; const vh=window.innerHeight;
  let left=rect.right+10; if(left+W>vw-16) left=rect.left-W-10;
  let top=rect.top; if(top+180>vh-16) top=Math.max(8,vh-196);
  return (
    <div style={{position:"fixed",left,top,zIndex:9999,width:W,
      background:"#1e293b",border:"1px solid #475569",borderRadius:12,
      padding:"10px 14px",pointerEvents:"none",boxShadow:"0 8px 24px rgba(0,0,0,0.65)"}}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:color,flexShrink:0}}/>
        <span style={{fontSize:11,color:"#94a3b8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pname}</span>
      </div>
      {task.series&&<div style={{fontSize:13,fontWeight:700,color:"#e2e8f0",marginBottom:4}}>{task.series}</div>}
      {st&&<div style={{marginBottom:6}}>
        <span style={{background:colorToBg(st.color),border:`1px solid ${st.color}55`,
          borderRadius:4,padding:"2px 8px",fontSize:11,color:st.color,fontWeight:600}}>
          {st.label}
        </span>
      </div>}
      {task.person&&<div style={{fontSize:12,color:"#cbd5e1",marginBottom:3}}>{task.person}</div>}
      <div style={{fontSize:11,color:"#64748b",marginBottom:canSeeTaskNotes()&&task.note?4:0}}>
        {fmtHour(task.from)} – {fmtHour(task.to)} · {fmtDur(task.from,task.to)}
        {task.unplanned&&<span style={{color:"#f97316",marginLeft:6}}>! внеплан</span>}
      </div>
      {canSeeTaskNotes()&&task.note&&<div style={{fontSize:11,color:"#94a3b8",lineHeight:1.4,marginTop:4,borderTop:"1px solid #334155",paddingTop:4}}>{task.note}</div>}
    </div>
  );
}

// ── СПРАВОЧНИК ───────────────────────────────────────────────────────
function StageEditModal({stage,roles,stageGroups,onSave,onClose}){
  const [form,setForm]=useState({...stage});
  function toggleRole(rid){
    setForm(f=>({...f,
      rolesRequired:f.rolesRequired.includes(rid)
        ?f.rolesRequired.filter(r=>r!==rid)
        :[...f.rolesRequired,rid]
    }));
  }
  function handleSave(){if(!form.label.trim()){alert("Введите название");return;}onSave(form);}
  return (
    <Modal title={`Этап: ${stage.label}`} onClose={onClose} onSubmit={handleSave}>
      <Field label="Название">
        <Inp value={form.label} onChange={v=>setForm(f=>({...f,label:v}))} placeholder="Монтаж"/>
      </Field>
      <Field label="Аббревиатура (для плашек)">
        <Inp value={form.abbr||""} onChange={v=>setForm(f=>({...f,abbr:v}))} placeholder="Монт"/>
      </Field>
      <Field label="Группа">
        <select value={form.groupId||""} onChange={e=>setForm(f=>({...f,groupId:e.target.value}))}
          style={{background:"#0f172a",border:"1px solid #334155",color:"#e2e8f0",
            borderRadius:10,padding:"7px 10px",fontSize:13,width:"100%"}}>
          <option value="">— не задана —</option>
          {stageGroups.map(g=><option key={g.id} value={g.id}>{g.label}</option>)}
        </select>
      </Field>
      <Field label="Цвет">
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <input type="color" value={form.color}
            onChange={e=>setForm(f=>({...f,color:e.target.value}))}
            style={{width:48,height:36,border:"1px solid #334155",borderRadius:10,
              background:"#0f172a",cursor:"pointer"}}/>
          <div style={{width:80,height:28,borderRadius:4,background:colorToBg(form.color),
            border:`1px solid ${form.color}44`,display:"flex",alignItems:"center",
            justifyContent:"center",fontSize:11,color:form.color,fontWeight:600}}>
            {form.label||"—"}
          </div>
        </div>
      </Field>
      <Field label="Роли (фильтр исполнителей)">
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {roles.map(r=>(
            <label key={r.id} style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",
              background:form.rolesRequired.includes(r.id)?`${r.color}22`:"#0f172a",
              border:`1px solid ${form.rolesRequired.includes(r.id)?r.color:"#334155"}`,
              borderRadius:10,padding:"4px 10px"}}>
              <input type="checkbox" checked={form.rolesRequired.includes(r.id)}
                onChange={()=>toggleRole(r.id)} style={{accentColor:r.color}}/>
              <span style={{fontSize:12,color:form.rolesRequired.includes(r.id)?r.color:"#94a3b8"}}>{r.label}</span>
            </label>
          ))}
        </div>
      </Field>
      <Field label="Исполнитель">
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
          <input type="checkbox" checked={form.needsExecutor!==false}
            onChange={e=>setForm(f=>({...f,needsExecutor:e.target.checked}))}
            style={{accentColor:"#22c55e"}}/>
          <span style={{fontSize:13}}>Исполнитель обязателен</span>
        </label>
      </Field>
      <Field label="Влияние на нагрузку">
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
          <input type="checkbox" checked={form.noImpact===true}
            onChange={e=>setForm(f=>({...f,noImpact:e.target.checked}))}
            style={{accentColor:"#f97316"}}/>
          <span style={{fontSize:13}}>Без влияния — не считать в сменах и конфликтах</span>
        </label>
        {form.noImpact&&<div style={{fontSize:11,color:"#f97316",marginTop:4,opacity:0.8}}>
          Этап нужен для планирования, но не учитывается в аналитике и не создаёт конфликтов
        </div>}
      </Field>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:16}}>
        <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
        <Btn variant="primary" onClick={handleSave}>Сохранить</Btn>
      </div>
    </Modal>
  );
}

function DirectoryView({data,onUpdate:writeUpdate,onBatchUpdate:writeBatchUpdate,onLog,user,onUserUpdate}){
  const [tab,setTab]=useState("roles");
  const [personModal,setPersonModal]=useState(null);
  const [stageModal,setStageModal]=useState(null);
  const [roleForm,setRoleForm]=useState({id:"",label:"",color:"#6366f1"});
  const [editRoleId,setEditRoleId]=useState(null);
  const [search,setSearch]=useState("");
  const [dragOverStage,setDragOverStage]=useState(null);
  const stageDragRef=useRef(null);
  const [newHoliday,setNewHoliday]=useState("");
  const [tmplModal,setTmplModal]=useState(null);
  const [achievementModal,setAchievementModal]=useState(null);


  const stages=(data.stages&&data.stages.length)?[...data.stages].sort((a,b)=>(a.order||0)-(b.order||0)):DEFAULT_STAGES;
  const stageGroups=(data.stageGroups&&data.stageGroups.length)?[...data.stageGroups].sort((a,b)=>(a.order||0)-(b.order||0)):DEFAULT_STAGE_GROUPS;
  const holidays=data.holidays||DEFAULT_HOLIDAYS;
  const roles=data.roles||DEMO_ROLES;
  const achievements=achievementList(data);
  const canEditAchievements=user?.role==="admin";
  const canManagePeople=user?.role==="admin"||user?.role==="lead";
  const onUpdate=(...args)=>{if(canManagePeople)writeUpdate(...args);};
  const onBatchUpdate=(...args)=>{if(canManagePeople)writeBatchUpdate(...args);};

  function saveRole(role){
    let newRoles=editRoleId?roles.map(r=>r.id===editRoleId?{...r,...role}:r):[...roles,role];
    onUpdate("roles",newRoles);
    setEditRoleId(null); setRoleForm({id:"",label:"",color:"#6366f1"});
  }
  function deleteRole(id){
    if(!canManagePeople) return;
    if(!window.confirm(`Удалить роль "${id}"?`)) return;
    const newRoles=roles.filter(r=>r.id!==id);
    const newStages=stages.map(s=>({...s,rolesRequired:(s.rolesRequired||[]).filter(r=>r!==id)}));
    onBatchUpdate({roles:newRoles,stages:newStages,people:(data.people||[]).map(p=>({...p,roles:(p.roles||[]).filter(r=>r!==id)}))}); incrDelete("role", id);
  }
  function savePerson(person){
    if(!canManagePeople) return;
    let people=[...data.people];
    const exists=person.id&&people.find(p=>p.id===person.id);
    const final=exists?person:{...person,id:"p"+Date.now()};
    if(exists) people=people.map(p=>p.id===final.id?final:p);
    else people.push(final);
    if(exists&&exists.name!==final.name){
      onBatchUpdate({people,tasks:(data.tasks||[]).map(t=>t.person===exists.name?{...t,person:final.name,_updatedAt:Date.now()}:t),
        personAbsences:(data.personAbsences||[]).map(a=>a.personId===final.id||a.personName===exists.name?{...a,personName:final.name,_updatedAt:Date.now()}:a)});
    } else onUpdate("people",people);
    setPersonModal(null);
    incrSave("person", final);
  }

  function deletePerson(id){
    if(!window.confirm("Удалить сотрудника?")) return;
    onUpdate("people",data.people.map(p=>p.id===id?{...p,deleted:true,_updatedAt:Date.now()}:p)); setPersonModal(null);
    incrDelete("person", id);
  }
  function deleteStage(id){
    if(!canManagePeople) return;
    if((data.tasks||[]).some(t=>t.status===id)){alert("Этап используется в задачах. Сначала перенесите задачи на другой этап.");return;}
    if(!window.confirm("Удалить этап?")) return;
    onUpdate("stages",stages.filter(s=>s.id!==id).map((s,i)=>({...s,order:i+1})));
  }
  function saveStage(stage){
    const arr=stages.map(s=>s.id===stage.id?stage:s);
    onUpdate("stages",arr); setStageModal(null);
  }
  function addStage(){
    const id="stage_"+Date.now();
    const newStage={id,label:"Новый этап",color:"#64748b",order:stages.length+1,
      groupId:"",rolesRequired:[],needsExecutor:true};
    onUpdate("stages",[...stages,newStage]);
    setStageModal(newStage);
  }
  function saveGroup(g){
    const arr=stageGroups.find(x=>x.id===g.id)
      ?stageGroups.map(x=>x.id===g.id?g:x)
      :[...stageGroups,g];
    onUpdate("stageGroups",arr);
  }
  function deleteGroup(id){
    if(!canManagePeople) return;
    if(!window.confirm("Удалить группу?")) return;
    onBatchUpdate({stageGroups:stageGroups.filter(g=>g.id!==id).map((g,i)=>({...g,order:i+1})),stages:stages.map(s=>s.groupId===id?{...s,groupId:""}:s)});
  }
  function addGroup(){
    const g={id:"sg"+Date.now(),label:"Новая группа",order:stageGroups.length+1};
    onUpdate("stageGroups",[...stageGroups,g]);
  }
  function addHoliday(){
    if(!newHoliday) return;
    if(holidays.includes(newHoliday)){setNewHoliday("");return;}
    onUpdate("holidays",[...holidays,newHoliday].sort());
    setNewHoliday("");
  }
  function removeHoliday(d){
    onUpdate("holidays",holidays.filter(h=>h!==d));
  }
  function saveAchievement(achievement){
    if(!canEditAchievements) return;
    const a=normalizeAchievement(achievement);
    if(!a.title){alert("\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0430\u0447\u0438\u0432\u043a\u0438");return;}
    const ar=ACHIEVEMENT_RULES.find(r=>r.id===a.ruleType);
    if((ar?.needsStage||ar?.needsGroup||ar?.needsRole)&&!a.stageId){alert("\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0446\u0435\u043b\u044c \u0443\u0441\u043b\u043e\u0432\u0438\u044f");return;}
    const arr=achievements.find(x=>x.id===a.id)?achievements.map(x=>x.id===a.id?a:x):[...achievements,a];
    onUpdate("achievements",arr);
    incrSave("achievement",a);
    setAchievementModal(null);
  }
  function deleteAchievement(id){
    if(!canEditAchievements) return;
    if(!window.confirm("\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0430\u0447\u0438\u0432\u043a\u0443?")) return;
    onUpdate("achievements",achievements.filter(a=>a.id!==id));
    incrDelete("achievement",id);
  }

  const filtered=data.people.filter(p=>!p.deleted&&(!search||(p.name||'').toLowerCase().includes(search.toLowerCase())));

  const TAB_S={display:"inline-flex",gap:0,background:"#0f172a",borderRadius:10,
    border:"1px solid #334155",overflow:"hidden",marginBottom:20};
  const tabBtn=(id,label)=>(
    <button key={id} onClick={()=>setTab(id)} style={{
      padding:"6px 16px",border:"none",cursor:"pointer",fontSize:12,fontFamily:"inherit",
      background:tab===id?"#3b82f6":"transparent",
      color:tab===id?"#fff":"#64748b",fontWeight:tab===id?700:400}}>
      {label}
    </button>
  );

  return (
    <div>
      <div style={TAB_S}>
        {tabBtn("roles","Роли")}
        {tabBtn("stages","Этапы")}
        {tabBtn("groups","Группы этапов")}
        {tabBtn("people","Сотрудники")}
        {tabBtn("holidays","Праздники")}
        {tabBtn("templates","Шаблоны серий")}
        {tabBtn("achievements","\u0410\u0447\u0438\u0432\u043a\u0438")}
        {tabBtn("users","AD")}
      </div>

      {!canManagePeople&&!["achievements","users"].includes(tab)&&<p style={{fontSize:12,color:"#94a3b8"}}>Справочники доступны для просмотра. Изменять их могут администратор и руководитель.</p>}
      <fieldset disabled={!canManagePeople} style={{border:0,padding:0,margin:0,minWidth:0}}>
      {tab==="roles"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,alignItems:"start"}}>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:"#93c5fd",marginBottom:12}}>Справочник ролей</div>
            {roles.map(role=>(
              <div key={role.id} style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",
                borderRadius:12,padding:"9px 12px",marginBottom:6,display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:10,height:10,borderRadius:2,background:role.color,flexShrink:0}}/>
                {editRoleId===role.id?(
                  <>
                    <Inp value={roleForm.label} onChange={v=>setRoleForm(f=>({...f,label:v}))}
                      style={{flex:1}} placeholder="Название"/>
                    <input type="color" value={roleForm.color}
                      onChange={e=>setRoleForm(f=>({...f,color:e.target.value}))}
                      style={{width:32,height:30,border:"none",background:"none",cursor:"pointer"}}/>
                    <Btn small variant="primary" onClick={()=>saveRole({id:role.id,...roleForm})}>OK</Btn>
                    <Btn small variant="ghost" onClick={()=>setEditRoleId(null)}>✕</Btn>
                  </>
                ):(
                  <>
                    <span style={{flex:1,fontSize:13}}>{role.label}</span>
                    <span style={{fontSize:10,color:"#475569",fontFamily:"monospace"}}>{role.id}</span>
                    <Btn small variant="ghost" onClick={()=>{setEditRoleId(role.id);setRoleForm({label:role.label,color:role.color});}}>Изм</Btn>
                    <Btn small variant="danger" onClick={()=>deleteRole(role.id)}>✕</Btn>
                  </>
                )}
              </div>
            ))}
            <div style={{background:"rgba(59,130,246,0.05)",border:"1px dashed #334155",borderRadius:12,padding:"12px 14px",marginTop:8}}>
              <div style={{fontSize:11,color:"#64748b",marginBottom:8,letterSpacing:1}}>НОВАЯ РОЛЬ</div>
              <Field label="ID (лат.)">
                <Inp value={roleForm.id} onChange={v=>setRoleForm(f=>({...f,id:v}))} placeholder="montazh"/>
              </Field>
              <Field label="Название">
                <div style={{display:"flex",gap:8}}>
                  <Inp value={roleForm.label} onChange={v=>setRoleForm(f=>({...f,label:v}))}
                    placeholder="Монтажёр" style={{flex:1}}/>
                  <input type="color" value={roleForm.color}
                    onChange={e=>setRoleForm(f=>({...f,color:e.target.value}))}
                    style={{width:40,height:36,border:"1px solid #334155",borderRadius:10,background:"#0f172a",cursor:"pointer"}}/>
                </div>
              </Field>
              <Btn variant="primary" onClick={()=>{
                if(!roleForm.label||!roleForm.id){alert("Заполните ID и название");return;}
                if(roles.find(r=>r.id===roleForm.id)){alert("Такой ID уже есть");return;}
                saveRole({id:roleForm.id,label:roleForm.label,color:roleForm.color});
              }}>+ Добавить роль</Btn>
            </div>
          </div>
        </div>
      )}

      {tab==="stages"&&(
        <div style={{maxWidth:600}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontSize:14,fontWeight:700,color:"#93c5fd"}}>Этапы производства ({stages.length})</span>
            <Btn variant="primary" onClick={addStage}>+ Добавить этап</Btn>
          </div>
          {stages.map((stage,i)=>{
            const isDragOver=dragOverStage===stage.id&&stageDragRef.current!==stage.id;
            return (
            <div key={stage.id}
              draggable
              onDragStart={()=>{stageDragRef.current=stage.id;}}
              onDragOver={e=>{e.preventDefault();if(stageDragRef.current!==stage.id)setDragOverStage(stage.id);}}
              onDragLeave={()=>setDragOverStage(null)}
              onDrop={e=>{
                e.preventDefault();
                const fromId=stageDragRef.current;
                if(!fromId||fromId===stage.id){setDragOverStage(null);return;}
                const arr=[...stages];
                const fi=arr.findIndex(s=>s.id===fromId);
                const ti=arr.findIndex(s=>s.id===stage.id);
                const [item]=arr.splice(fi,1);
                arr.splice(ti,0,item);
                onUpdate("stages",arr.map((s,idx)=>({...s,order:idx+1})));
                setDragOverStage(null);stageDragRef.current=null;
              }}
              onDragEnd={()=>{setDragOverStage(null);stageDragRef.current=null;}}
              style={{background:"#1e293b",
                border:`1px solid ${isDragOver?"#3b82f6":"#334155"}`,
                borderRadius:12,padding:"9px 12px",marginBottom:6,
                display:"flex",alignItems:"center",gap:8,
                cursor:"grab",userSelect:"none",
                boxShadow:isDragOver?"0 0 0 2px #3b82f644":"none",
                opacity:stageDragRef.current===stage.id?0.5:1,
                transition:"border-color 0.1s,box-shadow 0.1s"}}>
              <div style={{color:"#334155",fontSize:14,padding:"0 4px",cursor:"grab",flexShrink:0}}>⠿</div>
              <span style={{fontSize:10,color:"#334155",width:16,textAlign:"right",flexShrink:0}}>{i+1}</span>
              <div style={{width:10,height:10,borderRadius:2,background:stage.color,flexShrink:0}}/>
              <div style={{flex:1}}>
                <span style={{fontSize:13,fontWeight:600}}>{stage.label}</span>
                {!stage.needsExecutor&&<span style={{fontSize:9,color:"#64748b",marginLeft:6}}>без исполнителя</span>}
                {stage.noImpact&&<span style={{fontSize:9,color:"#f97316",marginLeft:6,background:"rgba(249,115,22,0.1)",borderRadius:3,padding:"1px 4px"}}>без влияния</span>}
                {(()=>{
                  const knownRoles=(stage.rolesRequired||[]).filter(rid=>roles.find(r=>r.id===rid));
                  const missing=(stage.rolesRequired||[]).filter(rid=>!roles.find(r=>r.id===rid));
                  return (knownRoles.length>0||missing.length>0)&&(
                    <div style={{fontSize:10,color:"#475569",marginTop:1}}>
                      Роли: {knownRoles.map(rid=>roles.find(r=>r.id===rid)?.label||rid).join(", ")}
                      {missing.length>0&&<span style={{color:"#ef4444",marginLeft:4}}>
                        ! удалены: {missing.join(", ")}
                      </span>}
                    </div>
                  );
                })()}
              </div>
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                <div style={{width:40,height:18,borderRadius:3,background:stageBg(stage.color),
                  border:`1px solid ${stageBorder(stage.color)}`,display:"flex",alignItems:"center",
                  justifyContent:"center",fontSize:9,color:stage.color,fontWeight:700}}>
                  {stage.label.slice(0,3)}
                </div>
                <Btn small variant="ghost" onClick={()=>setStageModal(stage)}>Изм</Btn>
                <Btn small variant="danger" onClick={()=>deleteStage(stage.id)}>✕</Btn>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {tab==="people"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontSize:14,fontWeight:700,color:"#93c5fd"}}>
              Сотрудники ({data.people.filter(p=>p.active!==false&&!p.deleted).length} акт.)
            </span>
            <div style={{display:"flex",gap:8}}>
            <Btn variant="primary" onClick={()=>setPersonModal({name:"",roles:DEMO_ROLES,active:true})}>+ Добавить</Btn>
          </div>
          </div>
          <Inp value={search} onChange={setSearch} placeholder="🔍 Поиск сотрудников..." style={{marginBottom:10,maxWidth:400}}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {filtered.map(person=>(
              <div key={person.id} style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",
                borderRadius:12,padding:"9px 12px",
                display:"flex",alignItems:"center",gap:10,opacity:person.active===false?0.5:1}}>
                <div style={{width:30,height:30,borderRadius:"50%",background:"#0f172a",border:"2px solid #334155",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#64748b",flexShrink:0}}>
                  {(person.name||"?")[0]}
                </div>
                <div style={{flex:1,overflow:"hidden"}}>
                  <div style={{fontSize:13,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                    {person.name}
                    {person.active===false&&<span style={{fontSize:10,color:"#475569",marginLeft:6}}>неактивен</span>}
                  </div>
                  {person.login&&<div style={{fontSize:9,color:"#475569",marginTop:1}}>🔗 {person.login}{person.email?" · "+person.email:""}</div>}
                  <div style={{display:"flex",gap:3,marginTop:3,flexWrap:"wrap"}}>
                    {(person.roles||[]).map(r=>{
                      const role=roles.find(rl=>rl.id===r);
                      const rk = typeof r === "string" ? r : (r.id || JSON.stringify(r)); return <span key={rk} style={{fontSize:9,background:"transparent",
                        color:role?.color||"#64748b",border:`1.5px solid ${role?.color||"#64748b"}`,
                        borderRadius:3,padding:"1px 5px"}}>{role?.label||r}</span>;
                    })}
                  </div>
                </div>
                <Btn small variant="ghost" onClick={()=>setPersonModal(person)}>Изм</Btn>
              </div>
            ))}
          </div>
          {personModal&&canManagePeople&&<PersonModal person={personModal} roles={roles} canEditBirthday={user?.role==="admin"}
            onSave={savePerson} onDelete={deletePerson} onClose={()=>setPersonModal(null)}/>}
        </div>
      )}

      {tab==="holidays"&&(
        <div style={{maxWidth:520}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontSize:14,fontWeight:700,color:"#93c5fd"}}>
              Нерабочие дни ({holidays.length})
            </span>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            <input type="date"
              onChange={e=>{if(e.target.value)setNewHoliday(fromInput(e.target.value));}}
              style={{background:"#0f172a",border:"1px solid #334155",color:"#e2e8f0",
                borderRadius:10,padding:"7px 10px",fontSize:13,flex:1}}/>
            <Btn variant="primary" onClick={addHoliday}>+ Добавить</Btn>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {[...holidays].sort().map(d=>{
              const pd=parseDate(d);
              const dow=pd?WDAYS[pd.getDay()]:"";
              return (
                <div key={d} style={{background:"rgba(59,130,246,0.08)",border:"1px solid #334155",
                  borderRadius:10,padding:"4px 10px",display:"flex",alignItems:"center",gap:6,fontSize:12}}>
                  <span style={{color:"#475569",fontSize:10}}>{dow}</span>
                  <span>{d}</span>
                  <button onClick={()=>removeHoliday(d)}
                    style={{background:"none",border:"none",color:"#475569",cursor:"pointer",
                      fontSize:14,lineHeight:1,padding:0}}>×</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab==="groups"&&(
        <div style={{maxWidth:500}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontSize:14,fontWeight:700,color:"#93c5fd"}}>Группы этапов</span>
            <Btn variant="primary" small onClick={addGroup}>+ Группа</Btn>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {stageGroups.map(g=>(
              <div key={g.id} style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,
                padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:13,color:"#64748b",minWidth:20,textAlign:"right"}}>{g.order}</span>
                <input value={g.label} onChange={e=>saveGroup({...g,label:e.target.value})}
                  style={{background:"#0f172a",border:"1px solid #334155",color:"#e2e8f0",
                    borderRadius:10,padding:"5px 10px",fontSize:13,flex:1}}/>
                <button onClick={()=>deleteGroup(g.id)}
                  style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",
                    color:"#f87171",borderRadius:10,padding:"4px 10px",cursor:"pointer",fontSize:12}}>
                  Удалить
                </button>
              </div>
            ))}
          </div>
          <div style={{marginTop:16,padding:"10px 12px",background:"rgba(59,130,246,0.07)",
            border:"1px solid rgba(59,130,246,0.2)",borderRadius:10,fontSize:12,color:"#64748b"}}>
            Группы используются для отображения статуса серии. Назначьте группу каждому этапу на вкладке «Этапы».
          </div>
        </div>
      )}

      {tab==="templates"&&(()=>{
        const templates=data.templates||[];
        function saveTmpl(t){
          const arr=templates.find(x=>x.id===t.id)
            ?templates.map(x=>x.id===t.id?t:x)
            :[...templates,{...t,id:"tmpl_"+Date.now()}];
          onUpdate("templates",arr);
          onLog?.(`Шаблон «${t.name}» сохранён`);
          setTmplModal(null);
        }
        function deleteTmpl(id){
          if(!window.confirm("Удалить шаблон?")) return;
          onUpdate("templates",templates.filter(t=>t.id!==id));
        }
        return (
          <div style={{maxWidth:680}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <span style={{fontSize:14,fontWeight:700,color:"#93c5fd"}}>Шаблоны серий ({templates.length})</span>
              <Btn variant="primary" small onClick={()=>setTmplModal({name:"",editDays:5,csoundDays:3,corrDays:2,masterDays:1,otherDays:0})}>+ Шаблон</Btn>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {templates.map(t=>{
                const total=t.editDays+t.csoundDays+t.corrDays+t.masterDays+(t.otherDays||0);
                return (
                  <div key={t.id} style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",
                    borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,color:"#e2e8f0",marginBottom:4}}>{t.name}</div>
                      <div style={{fontSize:11,color:"#64748b",display:"flex",gap:12,flexWrap:"wrap"}}>
                        <span>Монтаж: <b style={{color:"#94a3b8"}}>{t.editDays}д</b></span>
                        <span>Цвет/Звук: <b style={{color:"#94a3b8"}}>{t.csoundDays}д</b></span>
                        <span>Правки: <b style={{color:"#94a3b8"}}>{t.corrDays}д</b></span>
                        <span>Мастеринг: <b style={{color:"#94a3b8"}}>{t.masterDays}д</b></span>
                        {t.otherDays?<span>Прочее: <b style={{color:"#94a3b8"}}>{t.otherDays}д</b></span>:null}
                        <span style={{color:"#3b82f6",fontWeight:600}}>Итого: {total}д</span>
                      </div>
                    </div>
                    <Btn variant="ghost" small onClick={()=>setTmplModal(t)}>✏</Btn>
                    <Btn variant="danger" small onClick={()=>deleteTmpl(t.id)}>×</Btn>
                  </div>
                );
              })}
              {!templates.length&&(
                <div style={{color:"#334155",fontSize:13,padding:"20px 0",textAlign:"center"}}>
                  Шаблонов нет. Создайте шаблон, чтобы быстро заполнять даты новых серий.
                </div>
              )}
            </div>
            <div style={{marginTop:16,padding:"10px 12px",background:"rgba(59,130,246,0.07)",
              border:"1px solid rgba(59,130,246,0.2)",borderRadius:10,fontSize:12,color:"#64748b"}}>
              При создании серии можно выбрать шаблон — даты Пред-ОТК и ОТК рассчитаются автоматически от даты старта монтажа.
            </div>
          </div>
        );
      })()}
      </fieldset>
      {tab==="achievements"&&(
        <AchievementsSettings achievements={achievements} stages={stages} stageGroups={stageGroups} roles={roles} canEdit={canEditAchievements}
          onNew={()=>setAchievementModal({id:"ach_"+Date.now(),title:"",description:"",icon:"A",image:"",color:"#38bdf8",ruleType:"shifts_count",threshold:1,stageId:"",enabled:true})}
          onEdit={setAchievementModal} onDelete={deleteAchievement}/>
      )}

      {tab==="users"&&(
              <UsersView user={user} onUserUpdate={onUserUpdate}/>
            )}

      {achievementModal&&<AchievementModal achievement={achievementModal} stages={stages} stageGroups={stageGroups} roles={roles}
        onSave={saveAchievement} onClose={()=>setAchievementModal(null)}/>} 

      {tmplModal&&<SeriesTemplateModal tmpl={tmplModal} onSave={t=>{
        const arr=(data.templates||[]);
        const isNew=!t.id||!arr.find(x=>x.id===t.id);
        const saved=isNew?{...t,id:"tmpl_"+Date.now()}:t;
        onUpdate("templates",isNew?[...arr,saved]:arr.map(x=>x.id===saved.id?saved:x));
        onLog?.(`Шаблон «${saved.name}» ${isNew?"создан":"обновлён"}`);
        setTmplModal(null);
      }} onClose={()=>setTmplModal(null)}/>}

      {stageModal&&<StageEditModal stage={stageModal} roles={roles} stageGroups={stageGroups}
        onSave={saveStage} onClose={()=>setStageModal(null)}/>}
    </div>
  );
}


function AchievementsSettings({achievements,stages,stageGroups,roles,canEdit,onNew,onEdit,onDelete}){
  const sorted=[...(achievements||[])].sort((a,b)=>(a.enabled===b.enabled?0:(a.enabled?-1:1))||a.title.localeCompare(b.title));
  return (
    <div style={{maxWidth:900}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,gap:12}}>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:"#93c5fd"}}>{"\u0410\u0447\u0438\u0432\u043a\u0438"} ({sorted.length})</div>
          <div style={{fontSize:12,color:"#64748b",marginTop:3}}>{"\u041f\u0440\u0430\u0432\u0438\u043b\u0430 \u0441\u0447\u0438\u0442\u0430\u044e\u0442\u0441\u044f \u043f\u043e \u0441\u043c\u0435\u043d\u0430\u043c \u0438 \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u044e\u0442\u0441\u044f \u0432 \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0435 \u0447\u0435\u043b\u043e\u0432\u0435\u043a\u0430"}</div>
        </div>
        {canEdit?<Btn variant="primary" onClick={onNew}>{"+ \u0410\u0447\u0438\u0432\u043a\u0430"}</Btn>:<span style={{fontSize:12,color:"#64748b"}}>{"\u041c\u0435\u043d\u044f\u0442\u044c \u043c\u043e\u0436\u0435\u0442 \u0442\u043e\u043b\u044c\u043a\u043e admin"}</span>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:10}}>
        {sorted.map(a=>{
          const rule=ACHIEVEMENT_RULES.find(r=>r.id===a.ruleType);
          const target=rule?.needsGroup?(stageGroups||[]).find(g=>g.id===a.stageId):rule?.needsRole?(roles||[]).find(r=>r.id===a.stageId):(stages||[]).find(s=>s.id===a.stageId);
          return (
            <div key={a.id} style={{background:a.enabled!==false?`${a.color}14`:"#1e293b",border:`1px solid ${a.enabled!==false?a.color+"55":"#334155"}`,borderRadius:12,padding:"12px 14px",opacity:a.enabled!==false?1:0.55}}>
              <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
                <div style={{width:38,height:38,borderRadius:12,background:`${a.color}22`,border:`1px solid ${a.color}66`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",color:a.color,fontWeight:900,fontSize:12,flexShrink:0}}>
                  {a.image?<img src={a.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(a.icon||"?")}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:800,color:"#e2e8f0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{a.title}</div>
                  <div style={{fontSize:11,color:"#64748b",marginTop:2}}>{a.description||"\u0411\u0435\u0437 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u044f"}</div>
                </div>
              </div>
              <div style={{fontSize:11,color:"#94a3b8",display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                <span style={{border:"1px solid #334155",borderRadius:999,padding:"2px 7px"}}>{rule?.label||a.ruleType}: {a.threshold}</span>
                {target&&<span style={{border:"1px solid #334155",borderRadius:999,padding:"2px 7px",color:target.color||"#94a3b8"}}>{target.label||target.id}</span>}
                {a.enabled===false&&<span style={{border:"1px solid #475569",borderRadius:999,padding:"2px 7px",color:"#64748b"}}>{"\u0432\u044b\u043a\u043b"}</span>}
              </div>
              {canEdit&&<div style={{display:"flex",gap:6}}>
                <Btn small variant="ghost" onClick={()=>onEdit(a)}>{"\u0418\u0437\u043c"}</Btn>
                <Btn small variant="danger" onClick={()=>onDelete(a.id)}>{"\u0423\u0434\u0430\u043b\u0438\u0442\u044c"}</Btn>
              </div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AchievementModal({achievement,stages,stageGroups,roles,onSave,onClose}){
  const [form,setForm]=useState(normalizeAchievement(achievement));
  const sf=v=>setForm(f=>({...f,...v}));
  const rule=ACHIEVEMENT_RULES.find(r=>r.id===form.ruleType)||ACHIEVEMENT_RULES[0];
  const targetOptions=rule.needsGroup?(stageGroups||[]):rule.needsRole?(roles||[]):(stages||[]);
  const targetLabel=rule.needsGroup?"\u0413\u0440\u0443\u043f\u043f\u0430 \u044d\u0442\u0430\u043f\u043e\u0432":rule.needsRole?"\u0420\u043e\u043b\u044c \u044d\u0442\u0430\u043f\u0430":"\u042d\u0442\u0430\u043f";
  function chooseImage(e){
    const file=e.target.files&&e.target.files[0];
    if(!file) return;
    if(file.size>150000){alert("\u041a\u0430\u0440\u0442\u0438\u043d\u043a\u0430 \u0441\u043b\u0438\u0448\u043a\u043e\u043c \u0431\u043e\u043b\u044c\u0448\u0430\u044f. \u0414\u043e 150 \u041a\u0411");return;}
    const reader=new FileReader();
    reader.onload=ev=>sf({image:String(ev.target.result||"")});
    reader.readAsDataURL(file);
  }
  return (
    <Modal title={achievement.title?"\u0410\u0447\u0438\u0432\u043a\u0430":"\u041d\u043e\u0432\u0430\u044f \u0430\u0447\u0438\u0432\u043a\u0430"} onClose={onClose} wide>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Field label="ID"><Inp value={form.id} onChange={v=>sf({id:v.replace(/[^a-zA-Z0-9_-]/g,"")})} placeholder="shifts_50"/></Field>
        <Field label="\u0426\u0432\u0435\u0442"><input type="color" value={form.color} onChange={e=>sf({color:e.target.value})} style={{width:"100%",height:36,background:"#0f172a",border:"1px solid #334155",borderRadius:10}}/></Field>
        <Field label="\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435"><Inp value={form.title} onChange={v=>sf({title:v})} placeholder="\u041f\u043e\u043b\u0442\u0438\u043d\u043d\u0438\u043a"/></Field>
        <Field label="\u0417\u043d\u0430\u043a"><Inp value={form.icon} onChange={v=>sf({icon:v.slice(0,16)})} placeholder="50"/></Field>
        <Field label="\u0423\u0441\u043b\u043e\u0432\u0438\u0435">
          <select value={form.ruleType} onChange={e=>sf({ruleType:e.target.value,stageId:""})} style={{width:"100%",background:"#0f172a",border:"1px solid #334155",borderRadius:10,color:"#e2e8f0",padding:"7px 10px",fontSize:13}}>
            {ACHIEVEMENT_RULES.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </Field>
        <Field label={`\u041f\u043e\u0440\u043e\u0433 (${rule.unit})`}><input type="number" min="1" max="10000" value={form.threshold} onChange={e=>sf({threshold:Math.max(1,Number(e.target.value)||1)})} style={{width:"100%",background:"#0f172a",border:"1px solid #334155",borderRadius:10,color:"#e2e8f0",padding:"7px 10px",fontSize:13}}/></Field>
        {(rule.needsStage||rule.needsGroup||rule.needsRole)&&<Field label={targetLabel}>
          <select value={form.stageId} onChange={e=>sf({stageId:e.target.value})} style={{width:"100%",background:"#0f172a",border:"1px solid #334155",borderRadius:10,color:"#e2e8f0",padding:"7px 10px",fontSize:13}}>
            <option value="">---</option>
            {targetOptions.map(st=><option key={st.id} value={st.id}>{st.label||st.id}</option>)}
          </select>
        </Field>}
        <Field label="\u041a\u0430\u0440\u0442\u0438\u043d\u043a\u0430">
          <input type="file" accept="image/*" onChange={chooseImage} style={{fontSize:12,color:"#94a3b8"}}/>
          {form.image&&<div style={{display:"flex",gap:8,alignItems:"center",marginTop:6}}><img src={form.image} alt="" style={{width:32,height:32,borderRadius:10,objectFit:"cover"}}/><Btn small variant="ghost" onClick={()=>sf({image:""})}>{"\u0423\u0431\u0440\u0430\u0442\u044c"}</Btn></div>}
        </Field>
        <Field label="\u0412\u043a\u043b\u044e\u0447\u0435\u043d\u0430">
          <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"#94a3b8"}}><input type="checkbox" checked={form.enabled!==false} onChange={e=>sf({enabled:e.target.checked})}/> {"\u041f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0442\u044c \u0438 \u0441\u0447\u0438\u0442\u0430\u0442\u044c"}</label>
        </Field>
      </div>
      <Field label="\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435">
        <textarea value={form.description} onChange={e=>sf({description:e.target.value})} rows={3} style={{width:"100%",background:"#0f172a",border:"1px solid #334155",borderRadius:10,color:"#e2e8f0",padding:"8px 10px",fontSize:13,resize:"vertical"}}/>
      </Field>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:16}}>
        <Btn variant="ghost" onClick={onClose}>{"\u041e\u0442\u043c\u0435\u043d\u0430"}</Btn>
        <Btn variant="primary" onClick={()=>onSave(form)}>{"\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c"}</Btn>
      </div>
    </Modal>
  );
}

function SeriesTemplateModal({tmpl,onSave,onClose}){
  const [form,setForm]=useState({...tmpl});
  const f=form; const sf=v=>setForm(p=>({...p,...v}));
  const numFld=(label,key)=>(
    <Field label={label}>
      <input type="number" min={0} max={99} value={f[key]||0}
        onChange={e=>sf({[key]:Math.max(0,parseInt(e.target.value)||0)})}
        style={{background:"#0f172a",border:"1px solid #334155",borderRadius:10,
          color:"#e2e8f0",padding:"7px 10px",fontSize:13,width:"100%",boxSizing:"border-box"}}/>
    </Field>
  );
  const total=(f.editDays||0)+(f.csoundDays||0)+(f.corrDays||0)+(f.masterDays||0)+(f.otherDays||0);
  function handleSave(){
    if(!f.name?.trim()){alert("Введите название шаблона");return;}
    onSave(f);
  }
  return (
    <Modal title={f.id?"Редактировать шаблон":"Новый шаблон серии"} onClose={onClose} onSubmit={handleSave}>
      <Field label="Название шаблона">
        <Inp value={f.name||""} onChange={v=>sf({name:v})} placeholder="Документалка 52 мин"/>
      </Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:8}}>
        {numFld("Монтаж (дней)","editDays")}
        {numFld("Цвет / Звук (дней)","csoundDays")}
        {numFld("Правки (дней)","corrDays")}
        {numFld("Мастеринг (дней)","masterDays")}
        {numFld("Прочее (дней)","otherDays")}
        <div style={{display:"flex",alignItems:"flex-end",paddingBottom:4}}>
          <div style={{background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.3)",
            borderRadius:10,padding:"7px 12px",fontSize:13,color:"#93c5fd",fontWeight:700}}>
            Итого: {total} дней
          </div>
        </div>
      </div>
      <div style={{fontSize:11,color:"#475569",marginTop:10}}>
        От даты старта монтажа система посчитает дату Пред-ОТК и ОТК автоматически.
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:20,
        borderTop:"1px solid #334155",paddingTop:16}}>
        <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
        <Btn variant="primary" onClick={handleSave}>Сохранить</Btn>
      </div>
    </Modal>
  );
}
function PersonModal({person,roles,canEditBirthday,onSave,onDelete,onClose}){
  const [form,setForm]=useState({name:person.name||"",roles:[...(person.roles||[])],active:person.active!==false,allowParallel:person.allowParallel===true,login:person.login||"",email:person.email||"",birthday:person.birthday||""});
  const [domainUsers,setDomainUsers]=useState([]);
  const [domainSearch,setDomainSearch]=useState("");
  const isNew=!person.id;
  React.useEffect(()=>{if(isNew){fetch("/api/users/domain",{credentials:"include"}).then(r=>r.ok&&r.json()).then(u=>setDomainUsers(u||[])).catch(()=>{});}},[isNew]);
  function toggleRole(id){setForm(f=>({...f,roles:f.roles.includes(id)?f.roles.filter(r=>r!==id):[...f.roles,id]}));}
  function handleSave(){
    const n=(form.name||"").trim();if(!n){alert("Введите имя");return;}
    const bd=normalizeBirthday(form.birthday);
    if(canEditBirthday&&bd===null){alert("День рождения укажите в формате ДД.ММ");return;}
    onSave({...person,...form,birthday:canEditBirthday?bd:(person.birthday||""),roles:(form.roles||[]).filter(r=>typeof r==="string"),name:n});
  }
  const domainFiltered=domainUsers.filter(u=>!domainSearch||(u.display_name||'').toLowerCase().includes(domainSearch.toLowerCase())||u.sam_name.toLowerCase().includes(domainSearch.toLowerCase()));
  return (
    <Modal title={isNew?"Новый сотрудник":"Редактировать сотрудника"} onClose={onClose} onSubmit={handleSave}>
      <Field label="Имя / Фамилия">
        <Inp value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="Иванов"/>
      </Field>
      {isNew&&<>
        <Field label="Поиск в домене">
          <Inp value={domainSearch} onChange={setDomainSearch} placeholder="🔍 Введите имя или логин..."/>
        </Field>
        {domainSearch&&<div style={{maxHeight:280,overflowY:"auto",marginBottom:10,border:"1px solid #334155",borderRadius:10}}>
          {domainFiltered.length===0?<div style={{color:"#64748b",textAlign:"center",padding:12,fontSize:12}}>Ничего не найдено</div>:
            domainFiltered.map(u=>(
              <div key={u.sam_name} style={{padding:"7px 10px",cursor:"pointer",borderBottom:"1px solid #1e293b",
                display:"flex",alignItems:"center",gap:8,background:form.login===u.sam_name?"#1e3a5f":"transparent"}}
                onClick={()=>{setForm(f=>({...f,name:u.display_name,login:u.sam_name,email:u.email||""}));setDomainSearch("");}}
                onMouseEnter={e=>e.currentTarget.style.background="#1e3a5f"}
                onMouseLeave={e=>e.currentTarget.style.background=form.login===u.sam_name?"#1e3a5f":"transparent"}>
                <div style={{width:24,height:24,borderRadius:"50%",background:"#0f172a",display:"flex",alignItems:"center",
                  justifyContent:"center",fontSize:10,fontWeight:700,color:"#64748b",flexShrink:0}}>{(u.display_name||"?")[0]}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:500}}>{u.display_name}</div>
                  <div style={{fontSize:10,color:"#475569"}}>{u.sam_name}</div>
                </div>
              </div>
            ))}
        </div>}
        {form.login&&<div style={{fontSize:10,color:"#475569",marginBottom:8}}>🔗 Привязан к: {form.login}{form.email?" · "+form.email:""}</div>}
      </>}
      <Field label="День рождения">
        <Inp value={form.birthday||""} onChange={v=>canEditBirthday&&setForm(f=>({...f,birthday:v}))}
          placeholder="ДД.ММ" style={{maxWidth:120,opacity:canEditBirthday?1:0.7}}/>
        <div style={{fontSize:11,color:canEditBirthday?"#64748b":"#475569",marginTop:4}}>
          {canEditBirthday?"Без года. Например: 14.09":"Менять может только admin"}
        </div>
      </Field>      <Field label="Роли">
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {roles.map(r=>(
            <label key={r.id} style={{display:"flex",alignItems:"center",gap:6,
              background:form.roles.includes(r.id)?`${r.color}22`:"#0f172a",
              border:`1px solid ${form.roles.includes(r.id)?r.color:"#334155"}`,
              borderRadius:10,padding:"5px 10px",cursor:"pointer"}}>
              <input type="checkbox" checked={form.roles.includes(r.id)} onChange={()=>toggleRole(r.id)} style={{accentColor:r.color}}/>
              <span style={{fontSize:12,color:form.roles.includes(r.id)?r.color:"#94a3b8"}}>{r.label}</span>
            </label>
          ))}
        </div>
      </Field>
      <Field label="Статус">
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
          <input type="checkbox" checked={form.active} onChange={e=>setForm(f=>({...f,active:e.target.checked}))} style={{accentColor:"#22c55e"}}/>
          <span style={{fontSize:13}}>Активный сотрудник</span>
        </label>
      </Field>
      <Field label="Конфликты">
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
          <input type="checkbox" checked={form.allowParallel} onChange={e=>setForm(f=>({...f,allowParallel:e.target.checked}))} style={{accentColor:"#a855f7"}}/>
          <span style={{fontSize:13}}>Разрешить параллельные задачи</span>
        </label>
        {form.allowParallel&&<div style={{fontSize:11,color:"#a855f7",marginTop:4,opacity:0.8}}>Пересечения по времени не будут считаться конфликтами</div>}
      </Field>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:16}}>
        <div>{!isNew&&<Btn variant="danger" onClick={()=>onDelete(person.id)}>Удалить</Btn>}</div>
        <div style={{display:"flex",gap:8}}>
          <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
          <Btn variant="primary" onClick={handleSave}>Сохранить</Btn>
        </div>
      </div>
    </Modal>
  );
}

// ── ПРОЕКТЫ ──────────────────────────────────────────────────────────
function ProjectsView({data,onUpdate,onBatchUpdate,onDeleteProject,onProjectSelect,onSeriesSelect,canEdit,canDeleteStructure,isManager,canManageProjectAssignments,canEditProjectById,currentManagerEntry}){
  const {sorted:stages,stageGroups,groupMap}=useContext(StagesCtx);
  const [modal,setModal]=useState(null);
  const [directEditSeries,setDirectEditSeries]=useState(null);
  const [archFilter,setArchFilter]=useState("все");
  const [hoveredProj,setHoveredProj]=useState(null);
  const [hoveredSer,setHoveredSer]=useState(null);
  const [collapsed,setCollapsed]=useState(new Set());
  const serDragRef=useRef(null);

  function saveProject(proj){
    let projects=[...data.projects];
    const exists=proj.id&&projects.find(p=>p.id===proj.id);
    if(isManager&&exists&&!canEditProjectById?.(exists.id)) return;
    let final=exists?proj:{...proj,id:"pr"+Date.now(),dossier:proj.dossier||{}};
    if(isManager){
      final={...final,
        status:exists?(exists.status||"\u0432 \u0440\u0430\u0431\u043e\u0442\u0435"):"\u0432 \u0440\u0430\u0431\u043e\u0442\u0435",
        managers:exists?(exists.managers||[]):([currentManagerEntry].filter(m=>m&&(m.uid||m.name)))
      };
    }
    if(exists) projects=projects.map(p=>p.id===proj.id?final:p);
    else projects.push(final);
    onUpdate("projects",projects); setModal(null);
    incrSave("project", final);
  }

  const visProjects=useMemo(()=>{
    if(archFilter==="архив") return data.projects.filter(p=>p.status==="архив");
    if(archFilter==="в работе") return data.projects.filter(p=>p.status!=="архив");
    return data.projects;
  },[data.projects,archFilter]);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <span style={{fontSize:16,fontWeight:700}}>Проекты</span>
          <div style={{display:"inline-flex",background:"#0f172a",borderRadius:10,border:"1px solid #334155",overflow:"hidden",marginLeft:8}}>
            {[["все","Все"],["в работе","В работе"],["архив","Архив"]].map(([v,l])=>(
              <button key={v} onClick={()=>setArchFilter(v)}
                style={{padding:"4px 12px",border:"none",cursor:"pointer",fontSize:11,fontFamily:"inherit",
                  background:archFilter===v?"#3b82f6":"transparent",
                  color:archFilter===v?"#fff":"#64748b",fontWeight:archFilter===v?700:400}}>
                {l}
              </button>
            ))}
          </div>
        </div>
        {canEdit&&<Btn variant="primary" onClick={()=>setModal({name:"",abbr:"",description:"",color:PALETTE[0],status:"\u0432 \u0440\u0430\u0431\u043e\u0442\u0435",managers:isManager?[currentManagerEntry].filter(m=>m&&(m.uid||m.name)):[],dossier:{}})}>
          + Новый проект
        </Btn>}
      </div>

      {(()=>{
        const todayD=new Date(); todayD.setHours(0,0,0,0);
        const in7=new Date(todayD); in7.setDate(todayD.getDate()+7);
        const todStr=formatDate(todayD); const limStr=formatDate(in7);
        const upcoming=[];
        (data.series||[]).forEach(ser=>{
          const proj=data.projects.find(p=>p.id===ser.projectId);
          if(!proj) return;
          getSeriesMilestoneEvents(ser,proj).forEach(m=>{
            const date=m.date;
            if(date&&daySort(date)>=daySort(todStr)&&daySort(date)<=daySort(limStr))
              upcoming.push({ser,proj,type:m.label,date,color:m.color});
          });
        });
        upcoming.sort((a,b)=>daySort(a.date).localeCompare(daySort(b.date)));
        if(!upcoming.length) return null;
        const daysDiff=ds=>{const d=parseDate(ds);if(!d)return"";const diff=Math.round((d-todayD)/(86400000));return diff===0?"сегодня":diff===1?"завтра":`через ${diff} дн.`;};
        return (
          <div style={{marginBottom:16,padding:"10px 14px",background:"rgba(239,68,68,0.05)",
            border:"1px solid rgba(239,68,68,0.2)",borderRadius:12}}>
            <div style={{fontSize:11,color:"#f87171",fontWeight:700,marginBottom:8}}>! Дедлайны — ближайшие 7 дней</div>
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:2}}>
              {upcoming.map((u,i)=>(
                <div key={i} onClick={()=>{if(canEditProjectById?.(u.proj.id))setDirectEditSeries({ser:u.ser,proj:u.proj});}}
                  style={{background:`${u.color}18`,border:`1px solid ${u.color}55`,borderRadius:12,
                    padding:"6px 10px",fontSize:11,cursor:"pointer",flexShrink:0,minWidth:110}}>
                  <div style={{color:u.color,fontWeight:700,fontSize:10,marginBottom:2}}>{u.type}</div>
                  <div style={{color:"#e2e8f0",fontWeight:600}}>{u.proj.abbr||u.proj.name} {u.ser.name}</div>
                  <div style={{color:"#64748b",fontSize:10,marginTop:2}}>{u.date} · {daysDiff(u.date)}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {visProjects.map(proj=>{
          const pTasks=data.tasks.filter(t=>t.project===proj.id);
          const projSeries=(data.series||[]).filter(s=>s.projectId===proj.id).sort((a,b)=>(a.order||0)-(b.order||0));
          const statusColors={"в работе":"#3b82f6","ожидаем":"#8b5cf6","на паузе":"#f59e0b","сдан":"#22c55e","архив":"#475569"};
          return (
            <div key={proj.id}
              onDoubleClick={()=>onProjectSelect&&onProjectSelect(proj.id)}
              onMouseEnter={()=>setHoveredProj(proj.id)}
              onMouseLeave={()=>setHoveredProj(null)}
              title="Двойной клик — открыть карточку проекта"
              style={{background:hoveredProj===proj.id?"#243040":"#1e293b",
                border:`1px solid ${hoveredProj===proj.id?proj.color+"88":proj.color+"44"}`,
                borderTop:`3px solid ${proj.color}`,borderRadius:14,cursor:"pointer",
                transition:"background 0.15s,border-color 0.15s"}}>
              <div style={{padding:"14px 18px",display:"flex",alignItems:"flex-start",gap:12}}>
                <ProjectMark project={proj} size={12} style={{marginTop:4,boxShadow:`0 0 8px ${proj.color}`}}/>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4,flexWrap:"wrap"}}>
                    <span style={{fontSize:17,fontWeight:700}}>{proj.name}</span>
                    {proj.abbr&&<span style={{fontSize:11,background:"rgba(255,255,255,0.07)",
                      border:"1px solid #334155",borderRadius:4,padding:"1px 6px",
                      color:"#64748b",fontFamily:"monospace"}}>{proj.abbr}</span>}
                    <select
                      value={proj.status||"в работе"}
                      onClick={e=>e.stopPropagation()}
                      onChange={e=>{
                        e.stopPropagation();
                        if(!canManageProjectAssignments) return;
                        const updated=data.projects.map(p=>p.id===proj.id?{...p,status:e.target.value}:p);
                        onUpdate("projects",updated);
                      }}
                      style={{fontSize:11,fontWeight:700,
                        background:`${statusColors[proj.status]||"#64748b"}22`,
                        color:statusColors[proj.status]||"#64748b",
                        border:`1px solid ${statusColors[proj.status]||"#64748b"}55`,
                        borderRadius:4,padding:"2px 6px",cursor:canManageProjectAssignments?"pointer":"default",outline:"none",
                        appearance:"none",WebkitAppearance:"none"}}>
                      {PROJECT_STATUSES.map(s=>(
                        <option key={s.value||s} value={s.value||s}
                          style={{background:"#1e293b",color:"#e2e8f0"}}>
                          {s.label||s}
                        </option>
                      ))}
                    </select>
                    {proj.season&&<span style={{fontSize:11,background:"rgba(255,255,255,0.05)",
                      border:"1px solid #334155",borderRadius:4,padding:"1px 8px",color:"#64748b"}}>
                      Сезон {proj.season}
                    </span>}
                  </div>
                  {proj.managers&&proj.managers.length>0&&<div className="ppt-project-managers-row">
                    <span className="ppt-project-managers-label">{"\u041c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u044b"}</span>
                    <div className="ppt-project-manager-chips">
                      {proj.managers.map((m,i)=>{
                        const name=m.name||m.uid||m;
                        return <span key={`${name}-${i}`} className="ppt-project-manager-chip" title={name}>
                          <span>{String(name||"?").trim().slice(0,1).toUpperCase()}</span>{name}
                        </span>;
                      })}
                    </div>
                  </div>}
                  {proj.description&&<div className="ppt-project-description-quote" title={proj.description}>{proj.description}</div>}
                  <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
                    <button onClick={e=>{e.stopPropagation();setCollapsed(s=>{const n=new Set(s);n.has(proj.id)?n.delete(proj.id):n.add(proj.id);return n;})}}
                      style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:"#94a3b8",
                        padding:0,display:"flex",alignItems:"center",gap:4}}>
                      <span>{collapsed.has(proj.id)?"▶":"▼"}</span>
                      <span style={{background:"rgba(255,255,255,0.06)",border:"1px solid #334155",
                        borderRadius:4,padding:"2px 8px"}}>
                        {projSeries.length} {projSeries.length===1?"серия":projSeries.length>=2&&projSeries.length<=4?"серии":"серий"}
                      </span>
                    </button>
                    <span style={{fontSize:11,color:"#475569"}}>{pTasks.length} задач</span>
                    {canEdit&&canEditProjectById?.(proj.id)&&<button onClick={e=>{e.stopPropagation();setDirectEditSeries({ser:{name:"",shootStart:"",editStart:"",preOtkDate:"",otkDate:"",airMode:"weekly",airDay:1,airTime:"21:00",syncStart:""},proj});}}
                      style={{marginLeft:"auto",background:"#3b82f622",border:"1px solid #3b82f655",
                        borderRadius:4,color:"#3b82f6",fontSize:11,padding:"2px 10px",
                        cursor:"pointer",fontFamily:"inherit"}}>
                      + Серия
                    </button>}
                  </div>
                </div>
              </div>

              {projSeries.length>0&&!collapsed.has(proj.id)&&(
                <div style={{padding:"0 18px 14px",display:"grid",
                  gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:6}}>
                  {projSeries.map(ser=>{
                    const todayStr=formatDate(new Date());
                    const sTasks=pTasks.filter(t=>t.series===ser.name&&t.day===todayStr);
                    const maxStageIdx=Math.max(...sTasks.map(t=>stages.findIndex(s=>s.id===t.status)).filter(x=>x>=0),-1);
                    const autoStage=maxStageIdx>=0?stages[maxStageIdx]:null;
                    const autoGroupId=autoStage?.groupId||"";
                    const autoGroup=autoGroupId?groupMap[autoGroupId]:null;
                    const autoGroupOrder=autoGroup?.order||0;
                    const manualGroupId=ser.manualStatus||"";
                    const manualGroup=manualGroupId?groupMap[manualGroupId]:null;
                    const displayGroup=manualGroupId?manualGroup:autoGroup;
                    const displayStage=autoStage;
                    const isManual=!!manualGroupId;
                    const borderColor=displayStage?displayStage.color:proj.color;
                    function setManualStatus(gid){
                      const updSeries=(data.series||[]).map(s=>s.id===ser.id?{...s,manualStatus:gid||undefined}:s);
                      onBatchUpdate({series:updSeries,tasks:data.tasks});
                    }
                    return (
                      <div key={ser.id}
                        draggable
                        onDragStart={e=>{e.stopPropagation();serDragRef.current={id:ser.id,projId:proj.id};e.dataTransfer.effectAllowed="move";}}
                        onDragOver={e=>{e.preventDefault();e.stopPropagation();}}
                        onDrop={e=>{
                          e.preventDefault();e.stopPropagation();
                          const src=serDragRef.current;
                          if(!src||src.projId!==proj.id||src.id===ser.id) return;
                          const arr=[...projSeries];
                          const si=arr.findIndex(s=>s.id===src.id),ti=arr.findIndex(s=>s.id===ser.id);
                          if(si===-1||ti===-1) return;
                          const [item]=arr.splice(si,1);arr.splice(ti,0,item);
                          const others=(data.series||[]).filter(s=>s.projectId!==proj.id);
                          onBatchUpdate({series:[...others,...arr.map((s,i)=>({...s,order:i}))],tasks:data.tasks});
                          serDragRef.current=null;
                        }}
                        onDragEnd={()=>{serDragRef.current=null;}}
                        onDoubleClick={e=>{if(!canEdit)return;e.stopPropagation();onSeriesSelect?onSeriesSelect(ser.id):setDirectEditSeries({ser,proj});}}
                        onMouseEnter={()=>setHoveredSer(ser.id)}
                        onMouseLeave={()=>setHoveredSer(null)}
                        title="Перетащить — изменить порядок · Двойной клик — открыть"
                        style={{background:hoveredSer===ser.id?"#1a2a3a":"#0f172a",cursor:"grab",
                          borderTop:`2px solid ${borderColor}`,
                          border:hoveredSer===ser.id?`1px solid ${borderColor}55`:"1px solid transparent",
                          borderTopColor:borderColor,
                          borderRadius:10,padding:"10px 12px",
                          display:"flex",flexDirection:"column",gap:6,
                          transition:"background 0.15s,border-color 0.15s"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <span style={{fontWeight:700,fontSize:12}}>{ser.name}</span>
                          <span style={{display:"flex",alignItems:"center",gap:4}}>
                            {isManual&&<span title="Статус задан вручную" style={{fontSize:9,color:"#f59e0b"}}></span>}
                            <span style={{fontSize:9,color:"#334155",cursor:"grab"}}>⠿</span>
                          </span>
                        </div>
                        <span style={{fontSize:11,fontWeight:700,
                          background:displayGroup?`${borderColor}22`:"#1e293b",
                          color:displayGroup?borderColor:"#334155",
                          border:`1px solid ${displayGroup?borderColor+"44":"#1e293b"}`,
                          borderRadius:4,padding:"3px 8px",textAlign:"center",display:"block"}}>
                          {displayGroup?displayGroup.label:"—"}
                        </span>
                        <select
                          value={manualGroupId}
                          onClick={e=>e.stopPropagation()}
                          onDoubleClick={e=>e.stopPropagation()}
                          onChange={e=>{e.stopPropagation();setManualStatus(e.target.value);}}
                          style={{fontSize:10,background:"#0f172a",border:"1px solid #334155",color:"#475569",
                            borderRadius:4,padding:"2px 6px",cursor:"pointer",width:"100%"}}>
                          <option value="">авто</option>
                          {stageGroups.map(g=><option key={g.id} value={g.id}>{g.label}</option>)}
                        </select>
                        <div style={{display:"flex",gap:1}}>
                          {stageGroups.map(g=>{
                            const achieved=autoGroupOrder>=g.order;
                            const isCur=displayGroup?.id===g.id;
                            const stg=stages.find(s=>s.groupId===g.id);
                            const c=stg?.color||"#334155";
                            return <div key={g.id} title={g.label} style={{flex:1,height:3,borderRadius:1,
                              background:isCur?c:achieved?"#334155":"#1e293b"}}/>;
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modal&&<ProjectModal project={modal} data={data} canEdit={canEdit&&(!modal.id||canEditProjectById?.(modal.id))} canDelete={canDeleteStructure}
        canEditStatus={canManageProjectAssignments} canEditManagers={canManageProjectAssignments} currentManagerEntry={currentManagerEntry}
        onSave={saveProject} onDelete={onDeleteProject} onClose={()=>setModal(null)}/>}
      {directEditSeries&&(
        <SeriesModal series={directEditSeries.ser} project={directEditSeries.proj} data={data} canEdit={canEdit}
          onSave={ser=>{
            let allS=[...(data.series||[])];
            const isNew=!ser.id||!allS.find(s=>s.id===ser.id);
            let newTasks=data.tasks;
            if(isNew){
              const final={...ser,id:"s"+Date.now(),projectId:directEditSeries.proj.id,
                order:allS.filter(s=>s.projectId===directEditSeries.proj.id).length,
                checklists:[],notes:"",delivered:false,deliveredAt:"",assets:[],
                transitCode:"",transitVariants:["","",""],syncStart:ser.syncStart||""};
              allS.push(final);
              newTasks=data.tasks;
              onBatchUpdate({series:allS,tasks:newTasks});
              setDirectEditSeries(null);
              incrSave("series", final);
            } else {
              allS=allS.map(s=>s.id===ser.id?ser:s);
              onBatchUpdate({series:allS,tasks:newTasks});
              setDirectEditSeries(null);
              incrSave("series", ser);
            }
          }}
          onClose={()=>setDirectEditSeries(null)}/>
      )}
    </div>
  );
}

function ManagerPicker({value,options,onChange}){
  const [sel,setSel]=React.useState("");
  function handleAdd(e){
    const name=e.target.value;
    if(!name)return;
    const cur=value||[];
    const person=options.find(p=>p.name===name);
    if(!cur.some(m=>managerMatches(m,person||{id:name,name}))){
      onChange([...cur,{uid:person?person.id||name:name,name:name}]);
    }
    setSel("");
  }
  function managerMatches(m,person){
    if(!m||!person) return false;
    return accessKey(m.uid)===accessKey(person.id)||accessKey(m.uid)===accessKey(person.name)||accessKey(m.name)===accessKey(person.name)||accessKey(m.name)===accessKey(person.id);
  }
  function removeManager(name){
    onChange((value||[]).filter(m=>accessKey(m.uid)!==accessKey(name)&&accessKey(m.name)!==accessKey(name)&&accessKey(m)!==accessKey(name)));
  }
  const available=(options||[]).filter(p=>
    p.active!==false&&!((value||[]).some(m=>managerMatches(m,p)))
  );
  return (
    <div>
      <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>
        {(value||[]).map(m=>{
          const name=m.name||m.uid||m;
          return (
            <span key={name} style={{display:"inline-flex",alignItems:"center",gap:4,
              background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:10,
              padding:"2px 8px",fontSize:12,color:"#e2e8f0"}}>
              {name}
              <span onClick={()=>removeManager(name)} style={{cursor:"pointer",
                color:"#ef4444",fontSize:16,lineHeight:"12px",marginLeft:2}}>x</span>
            </span>
          );
        })}
      </div>
      <select value={sel} onChange={handleAdd}
        style={{background:"#0f172a",border:"1px solid #334155",color:"#e2e8f0",
          borderRadius:10,padding:"6px 10px",fontSize:13,width:"100%"}}>
        <option value="">--- Add Manager ---</option>
        {available.map(p=>(
          <option key={p.name} value={p.name}>{p.name}</option>
        ))}
      </select>
    </div>
  );
}

function ProjectModal({project,data,onSave,onDelete,onClose,canEdit,canDelete,canEditStatus,canEditManagers,currentManagerEntry}){
  const [form,setForm]=useState({...project});
  const isNew=!project.id;
  const f=form; const sf=v=>setForm(p=>({...p,...v}));
  const readonlyManagers=(f.managers&&f.managers.length)?f.managers:([currentManagerEntry].filter(m=>m&&(m.uid||m.name)));
  const managers=data.people.filter(p=>p.active!==false&&p.roles&&(p.roles.includes("мнджр")||p.roles.includes("продюсер")));

  function handleSave(){if(!f.name.trim()){alert("Введите название");return;}onSave(f);}
  return (
    <Modal title={isNew?"Новый проект":"Редактировать проект"} onClose={onClose} onSubmit={handleSave}>
      <Field label="Название"><Inp value={f.name} onChange={v=>sf({name:v})} placeholder="Название проекта"/></Field>
      <Field label="Аббревиатура (для Ганта)">
        <Inp value={f.abbr||""} onChange={v=>sf({abbr:v})} placeholder="СВ" style={{width:80}}/>
      </Field>
      <Field label="Сезон">
        <Inp value={f.season||""} onChange={v=>sf({season:v.replace(/\D/g,"")})} placeholder="1" style={{width:80}}/>
      </Field>
      <Field label="Описание">
        <textarea value={f.description||""} onChange={e=>sf({description:e.target.value})}
          placeholder="Краткое описание..."
          style={{background:"#0f172a",border:"1px solid #334155",color:"#e2e8f0",
            borderRadius:10,padding:"7px 10px",fontSize:13,width:"100%",resize:"vertical",minHeight:60}}/>
      </Field>
      <Field label={PROJECT_VISUAL_TEXT.preview}>
        <ProjectVisualPicker project={f}
          onColor={c=>sf({color:c})}
          onVisual={visual=>sf({dossier:{...(f.dossier||{}),visual}})}/>
      </Field>
      <Field label={"\u0421\u0442\u0430\u0442\u0443\u0441"}>{canEditStatus?<Sel value={f.status} onChange={v=>sf({status:v})} options={PROJECT_STATUSES}/>:<div style={{fontSize:13,color:"#94a3b8",padding:"7px 10px",background:"#0f172a",border:"1px solid #334155",borderRadius:10}}>{f.status||"\u0432 \u0440\u0430\u0431\u043e\u0442\u0435"}</div>}</Field>
      <Field label={"\u041c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u044b / \u041f\u0440\u043e\u0434\u044e\u0441\u0435\u0440\u044b"}>
        {canEditManagers?<ManagerPicker value={f.managers||[]} options={managers} onChange={v=>sf({managers:v})}/>:<div style={{fontSize:13,color:"#94a3b8",padding:"7px 10px",background:"#0f172a",border:"1px solid #334155",borderRadius:10}}>{readonlyManagers.map(m=>m.name||m.uid||m).filter(Boolean).join(", ")||"-"}</div>}
      </Field>

      <div style={{display:"flex",justifyContent:"space-between",marginTop:20,borderTop:"1px solid #334155",paddingTop:16}}>
        <div>{!isNew&&canDelete&&<Btn variant="danger" onClick={()=>onDelete(project.id)}>{"\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u043f\u0440\u043e\u0435\u043a\u0442"}</Btn>}</div>
        <div style={{display:"flex",gap:8}}>
          <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
          {canEdit&&<Btn variant="primary" onClick={handleSave}>
            {isNew?"Создать проект":"Сохранить"}
          </Btn>}
        </div>
      </div>
    </Modal>
  );
}

function SeriesListModal({project,data,onSave,onClose,canDeleteStructure}){
  const {sorted:stages}=useContext(StagesCtx);
  const getSorted=()=>(data.series||[]).filter(s=>s.projectId===project.id).sort((a,b)=>(a.order||0)-(b.order||0));
  const [local,setLocal]=useState(getSorted);
  const [seriesEdit,setSeriesEdit]=useState(null);
  const dragIdx=useRef(null);

  useEffect(()=>{ setLocal(getSorted()); },[data.series,project.id]);

  function handleDragStart(idx){ dragIdx.current=idx; }
  function handleDragOver(e,idx){
    e.preventDefault();
    if(dragIdx.current===null||dragIdx.current===idx) return;
    const arr=[...local];
    const [item]=arr.splice(dragIdx.current,1);
    arr.splice(idx,0,item);
    dragIdx.current=idx;
    setLocal(arr);
  }
  function handleDrop(){
    dragIdx.current=null;
    const reordered=local.map((s,i)=>({...s,order:i}));
    const others=(data.series||[]).filter(s=>s.projectId!==project.id);
    onSave({series:[...others,...reordered]});
  }

  function saveSeries(serData){
    if(!canEdit) return;
    let allS=[...(data.series||[])];
    let final;
    const existing=allS.find(s=>s.id===serData.id);
    const oldName=existing?.name;
    if(serData.id&&existing){
      allS=allS.map(s=>s.id===serData.id?serData:s);
      final=serData;
    } else {
      final={...serData,id:"s"+Date.now(),order:allS.filter(s=>s.projectId===project.id).length,
        transitCode:serData.transitCode||"",transitVariants:serData.transitVariants||["","",""],
        checklists:[],notes:"",delivered:false,deliveredAt:"",assets:[]};
      allS.push(final);
    }
    const isNew=!serData.id;
    let newTasks=data.tasks;
    if(!isNew&&oldName&&oldName!==final.name)
      newTasks=newTasks.map(t=>t.seriesId===final.id&&t.series===oldName?{...t,series:final.name}:t);
    onSave({series:allS,tasks:newTasks});
    setSeriesEdit(null);
    incrSave("series", final);
  }

  function deleteSeries(id){
    if(!canDeleteStructure) return;
    if(!window.confirm("Удалить серию и все её задачи? Действие можно отменить через Ctrl+Z.")) return;
    onSave(deleteSeriesSnapshot(data,id));
    incrDelete("series", id);
  }

  const pTasks=data.tasks.filter(t=>t.project===project.id);

  return (
    <Modal title={`Серии — ${project.name}`} onClose={onClose} wide>
      <div style={{marginBottom:12}}>
        {local.length===0&&(
          <div style={{color:"#475569",fontSize:13,textAlign:"center",padding:"20px 0"}}>
            Серий пока нет. Добавьте первую.
          </div>
        )}
        {local.map((ser,idx)=>{
          const sTasks=pTasks.filter(t=>t.series===ser.name);
          const maxOrder=Math.max(...sTasks.map(t=>stages.findIndex(s=>s.id===t.status)).filter(x=>x>=0),-1);
          const curStatus=maxOrder>=0?stages[maxOrder]?.id:sTasks[0]?.status||"";
          return (
            <div key={ser.id}
              draggable
              onDragStart={()=>handleDragStart(idx)}
              onDragOver={e=>handleDragOver(e,idx)}
              onDrop={handleDrop}
              style={{display:"flex",alignItems:"center",gap:10,
                background:"#0f172a",border:"1px solid #334155",
                borderRadius:12,padding:"10px 14px",marginBottom:6,
                cursor:"grab",userSelect:"none"}}>
              <span style={{color:"#334155",fontSize:18,flexShrink:0,lineHeight:1}}>⠿</span>
              <div style={{fontWeight:700,fontSize:14,minWidth:40,color:"#e2e8f0"}}>{ser.name}</div>
              <div style={{flex:1,display:"flex",gap:14,flexWrap:"wrap",fontSize:11,color:"#475569"}}>
                {ser.editStart&&<span>Монтаж: <span style={{color:"#94a3b8"}}>{ser.editStart}</span></span>}
                {ser.otkDate&&<span>{getProjectMilestoneMeta(project,'otkDate',SERIES_MILESTONES.find(m=>m.key==='otkDate')).label}: <span style={{color:"#22c55e"}}>{ser.otkDate}</span></span>}
                {ser.airDate&&<span>📺 <span style={{color:"#f59e0b"}}>{ser.airDate}</span></span>}
              </div>
              <StatusBadge s={curStatus} small/>
              {canEdit&&<Btn small variant="ghost" onClick={e=>{e.stopPropagation();setSeriesEdit(ser);}}>Изм</Btn>}
              {canEdit&&<Btn small variant="danger" onClick={e=>{e.stopPropagation();deleteSeries(ser.id);}}>×</Btn>}
            </div>
          );
        })}
      </div>
      {canEdit&&<Btn variant="primary" onClick={()=>setSeriesEdit({
        projectId:project.id,name:"",order:local.length,
        shootStart:"",shootEnd:"",editStart:"",preOtkDate:"",otkDate:"",
        airDate:"",airMode:"weekly",airDay:1,airTime:"21:00",
      })}>+ Добавить серию</Btn>}
      {seriesEdit&&<SeriesModal series={seriesEdit} project={project} onSave={saveSeries} onClose={()=>setSeriesEdit(null)}/>}
    </Modal>
  );
}

function SeriesModal({series,onSave,onClose,templates,project}){
  const holidays=useContext(HolidaysCtx);
  const [form,setForm]=useState({...series});
  const isNew=!series.id;
  const f=form; const sf=v=>setForm(p=>({...p,...v}));
  const preOtkWarn=f.preOtkDate&&isNonWorkday(f.preOtkDate,holidays);
  const otkWarn=f.otkDate&&isNonWorkday(f.otkDate,holidays);
  const preOtkMeta=getProjectMilestoneMeta(project,'preOtkDate',SERIES_MILESTONES.find(m=>m.key==='preOtkDate'));
  const otkMeta=getProjectMilestoneMeta(project,'otkDate',SERIES_MILESTONES.find(m=>m.key==='otkDate'));
  function handleSave(){if(!f.name.trim()){alert("Введите название серии");return;}onSave(f);}

  function applyTemplate(tmplId){
    const t=(templates||[]).find(x=>x.id===tmplId);
    if(!t||!f.editStart) return;
    const totalPost=(t.editDays||0)+(t.csoundDays||0)+(t.corrDays||0);
    const totalAll=totalPost+(t.masterDays||0)+(t.otherDays||0);
    const preOtk=addWorkdays(f.editStart,totalPost,holidays);
    const otk=addWorkdays(f.editStart,totalAll,holidays);
    sf({preOtkDate:preOtk,otkDate:otk});
  }

  return (
    <Modal title={isNew?"Новая серия":`Серия: ${series.name||"—"}`} onClose={onClose} wide onSubmit={handleSave}>
      {isNew&&templates?.length>0&&(
        <div style={{marginBottom:16,padding:"10px 12px",background:"rgba(59,130,246,0.07)",
          border:"1px solid rgba(59,130,246,0.2)",borderRadius:10,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:12,color:"#64748b",flexShrink:0}}>Шаблон:</span>
          <select onChange={e=>{if(e.target.value)applyTemplate(e.target.value);e.target.value="";}}
            style={{background:"#0f172a",border:"1px solid #334155",borderRadius:10,color:"#e2e8f0",
              padding:"5px 10px",fontSize:12,flex:1,cursor:"pointer"}}>
            <option value="">— Применить шаблон дат —</option>
            {(templates||[]).map(t=>(
              <option key={t.id} value={t.id}>{t.name} ({(t.editDays||0)+(t.csoundDays||0)+(t.corrDays||0)+(t.masterDays||0)+(t.otherDays||0)}д)</option>
            ))}
          </select>
          <span style={{fontSize:11,color:"#475569"}}>← заполните «Старт монтажа» перед выбором</span>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <div>
          <Field label="Название серии">
            <Inp value={f.name} onChange={v=>sf({name:v})} placeholder="С01"/>
          </Field>
          <div style={{fontSize:11,color:"#64748b",letterSpacing:1,marginBottom:10}}>СЪЁМКИ</div>
          <Field label="Начало съёмок"><InpDate value={f.shootStart||""} onChange={v=>sf({shootStart:v})}/></Field>
          <div style={{fontSize:11,color:"#64748b",letterSpacing:1,margin:"14px 0 10px"}}>СИНХРА</div>
          <Field label="Начало синхры"><InpDate value={f.syncStart||""} onChange={v=>sf({syncStart:v})}/></Field>
          <div style={{fontSize:11,color:"#64748b",letterSpacing:1,margin:"14px 0 10px"}}>ПОСТПРОДАКШН</div>
          <Field label="Старт монтажа"><InpDate value={f.editStart||""} onChange={v=>sf({editStart:v})}/></Field>
          <div style={{fontSize:11,color:"#64748b",letterSpacing:1,margin:"14px 0 10px"}}>КЛЮЧЕВЫЕ СОБЫТИЯ</div>
          <Field label="Отправка заказчику">
            <InpDate value={f.sendDate||""} onChange={v=>sf({sendDate:v})}/>
          </Field>
          <Field label={preOtkMeta.label}>
            <InpDate value={f.preOtkDate||""} onChange={v=>sf({preOtkDate:v})} warn={preOtkWarn}/>
          </Field>
          <Field label={otkMeta.label}>
            <InpDate value={f.otkDate||""} onChange={v=>sf({otkDate:v})} warn={otkWarn}/>
          </Field>
          <Field label="Эфир">
            <InpDate value={f.airDate||""} onChange={v=>sf({airDate:v})}/>
          </Field>
        </div>
        <div>
          {isNew&&(
            <div style={{background:"rgba(59,130,246,0.07)",border:"1px solid rgba(59,130,246,0.2)",
              borderRadius:10,padding:"10px 12px",fontSize:12,color:"#64748b"}}>
              <div style={{fontWeight:600,color:"#94a3b8",marginBottom:6}}>{"\u0414\u0430\u0442\u044b \u0431\u0435\u0437 \u0430\u0432\u0442\u043e\u0441\u043c\u0435\u043d"}</div>
              <div>{"\u0414\u0430\u0442\u044b \u0441\u0435\u0440\u0438\u0438 \u043f\u043e\u043f\u0430\u0434\u0443\u0442 \u0432 \u041a\u041f\u041f \u0438 \u043a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u044c. \u0421\u043c\u0435\u043d\u044b \u0441\u043e\u0437\u0434\u0430\u044e\u0442\u0441\u044f \u043e\u0442\u0434\u0435\u043b\u044c\u043d\u043e \u0432 \u0413\u0430\u043d\u0442\u0435."}</div>
            </div>
          )}
          {getSeriesMilestoneEvents(f,project).length>0&&(
            <div style={{marginTop:isNew?12:0,background:"rgba(168,85,247,0.06)",border:"1px solid rgba(168,85,247,0.2)",
              borderRadius:10,padding:"10px 12px",fontSize:12,color:"#64748b"}}>
              <div style={{fontWeight:600,color:"#94a3b8",marginBottom:6}}>Ключевые события</div>
              {getSeriesMilestoneEvents(f,project).map(m=>(
                <div key={m.key} style={{marginBottom:3,display:"flex",alignItems:"center",gap:6}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:m.color,flexShrink:0,display:"inline-block"}}/>
                  <span style={{color:m.color,fontWeight:600}}>{m.label}</span>
                  <span>→ {m.date}</span>
                </div>
              ))}
            </div>
          )}
      </div>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:20,
        borderTop:"1px solid #334155",paddingTop:16}}>
        <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
        <Btn variant="primary" onClick={handleSave}>{isNew?"Создать серию":"Сохранить"}</Btn>
      </div>
    </Modal>
  );
}

// ── КАЛЕНДАРЬ ────────────────────────────────────────────────────────
function CalendarView({data,onGoToGantt,canEdit}){
  const today=new Date();
  const [year,setYear]=useState(today.getFullYear());
  const [month,setMonth]=useState(today.getMonth());
  const [selectedDay,setSelectedDay]=useState(null);
  const [hovDay,setHovDay]=useState(null);
  const [filterProject,setFilterProject]=useState("");
  const [filterPerson,setFilterPerson]=useState("");
  const {stageMap,stageGroups}=useContext(StagesCtx);

  useEffect(()=>{
    const h=()=>{setFilterProject("");setFilterPerson("");};
    window.addEventListener("ppt-escape",h);
    return()=>window.removeEventListener("ppt-escape",h);
  },[]);

  function prevMonth(){if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1);}
  function nextMonth(){if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1);}

  const firstDay=new Date(year,month,1);
  const startOffset=(firstDay.getDay()+6)%7;
  const daysInMonth=new Date(year,month+1,0).getDate();
  const cells=[];
  for(let i=0;i<startOffset;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) cells.push(d);
  while(cells.length%7!==0) cells.push(null);

  const filteredTasks=useMemo(()=>data.tasks.filter(t=>(!filterProject||t.project===filterProject)&&(!filterPerson||t.person===filterPerson)),[data.tasks,filterProject,filterPerson]);
  const seriesList=useMemo(()=>(data.series||[]).filter(s=>!filterProject||s.projectId===filterProject),[data.series,filterProject]);
  const calendarProjects=useMemo(()=>filterProject?data.projects.filter(p=>p.id===filterProject):data.projects,[data.projects,filterProject]);
  const calendarPeople=useMemo(()=>[...new Set(data.tasks.map(t=>t.person).filter(Boolean))].sort(),[data.tasks]);
  const allAirDates={};
  seriesList.forEach(ser=>{
    const proj=data.projects.find(p=>p.id===ser.projectId);
    if(!proj) return;
    generateSeriesAirDates(ser).forEach(d=>{
      if(!allAirDates[d]) allAirDates[d]=[];
      allAirDates[d].push({proj,ser});
    });
  });

  const milestones={};
  seriesList.forEach(ser=>{
    const proj=data.projects.find(p=>p.id===ser.projectId);
    if(!proj) return;
    getSeriesMilestoneEvents(ser,proj).forEach(m=>{
      const date=m.date;
      if(!date) return;
      if(!milestones[date]) milestones[date]=[];
      milestones[date].push({type:m.key,label:m.label,abbr:m.abbr||m.label,color:m.color,icon:m.icon||MILESTONE_ICON,proj,ser});
    });
  });

  const birthdays={};
  (data.people||[]).forEach(p=>{
    if(filterPerson&&p.name!==filterPerson) return;
    const bd=normalizeBirthday(p.birthday);
    if(!bd||p.active===false||p.deleted) return;
    const date=birthdayDateForYear(bd,year);
    const d=parseDate(date);
    if(!d||d.getMonth()!==month) return;
    if(!birthdays[date]) birthdays[date]=[];
    birthdays[date].push(p);
  });


  function dayStr(d){
    if(!d) return null;
    return `${String(d).padStart(2,"0")}.${String(month+1).padStart(2,"0")}.${year}`;
  }

  const todayStr=formatDate(today);
  const selStr=selectedDay?dayStr(selectedDay):null;
  const selTasks=selStr?filteredTasks.filter(t=>t.day===selStr):[];
  const sortedSelTasks=useMemo(()=>{
    const projectName=id=>{const p=data.projects.find(x=>x.id===id);return (p?.name||p?.abbr||id||"").toLowerCase();};
    return [...selTasks].sort((a,b)=>
      projectName(a.project).localeCompare(projectName(b.project),"ru")||
      (Number(a.from)||0)-(Number(b.from)||0)||
      String(a.series||"").localeCompare(String(b.series||""),"ru")||
      String(a.person||"").localeCompare(String(b.person||""),"ru")
    );
  },[selTasks,data.projects]);
  const selAirs=selStr?(allAirDates[selStr]||[]):[];
  const selMil=selStr?(milestones[selStr]||[]):[];
  const selBirthdays=selStr?(birthdays[selStr]||[]):[];
  const groupOrderMap=useMemo(()=>Object.fromEntries((stageGroups||[]).map(g=>[g.id,g.order||0])),[stageGroups]);
  const groupShapeMap=useMemo(()=>{
    const shapes=["circle","square","diamond","bar","triangle","ring","slash","pill","split","dotline"];
    const map={};
    (stageGroups||[]).forEach((g,i)=>{map[g.id]=shapes[i%shapes.length];});
    return map;
  },[stageGroups]);
  function dayGroupMarkers(dayTasks){
    const map={};
    (dayTasks||[]).forEach(t=>{
      const st=stageMap?.[t.status]||{};
      const gid=st.groupId||t.status||"other";
      const proj=data.projects.find(p=>p.id===t.project);
      const group=(stageGroups||[]).find(g=>g.id===gid);
      if(!map[gid]) map[gid]={id:gid,label:group?.label||st.label||t.status||"\u0421\u043c\u0435\u043d\u0430",color:st.color||proj?.color||"#64748b",count:0,shape:groupShapeMap[gid]||"circle",order:groupOrderMap[gid]||999};
      map[gid].count++;
    });
    return Object.values(map).sort((a,b)=>a.order-b.order||a.label.localeCompare(b.label,"ru"));
  }

  return (
    <div className="ppt-calendar-layout">
      <div>
        <div className="ppt-calendar-toolbar">
          <Btn variant="ghost" onClick={prevMonth}>←</Btn>
          <span style={{fontSize:22,fontWeight:800,minWidth:200,textAlign:"center",color:"#f1f5f9"}}>
            {MONTHS[month]} {year}
          </span>
          <Btn variant="ghost" onClick={nextMonth}>→</Btn>
          <Btn variant="ghost" small onClick={()=>{setYear(today.getFullYear());setMonth(today.getMonth());}}>Сегодня</Btn>
          <input type="month"
            value={`${year}-${String(month+1).padStart(2,"0")}`}
            onChange={e=>{const[y,m]=e.target.value.split("-");if(y&&m){setYear(+y);setMonth(+m-1);}}}
            style={{background:"#0f172a",border:"1px solid #334155",color:"#e2e8f0",
              borderRadius:10,padding:"5px 8px",fontSize:12,cursor:"pointer"}}/>
          <select value={filterProject} onChange={e=>setFilterProject(e.target.value)}
            style={{background:"#0f172a",border:"1px solid #334155",color:filterProject?"#e2e8f0":"#64748b",
              borderRadius:10,padding:"5px 8px",fontSize:12,cursor:"pointer",maxWidth:180}}>
            <option value="">Все проекты</option>
            {data.projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={filterPerson} onChange={e=>setFilterPerson(e.target.value)}
            style={{background:"#0f172a",border:"1px solid #334155",color:filterPerson?"#e2e8f0":"#64748b",
              borderRadius:10,padding:"5px 8px",fontSize:12,cursor:"pointer",maxWidth:180}}>
            <option value="">Все люди</option>
            {calendarPeople.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
          {(filterProject||filterPerson)&&<Btn variant="ghost" small onClick={()=>{setFilterProject("");setFilterPerson("");}}>Сброс</Btn>}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:2}}>
          {["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map(d=>(
            <div key={d} style={{textAlign:"center",fontSize:11,color:"#475569",padding:"4px 0"}}>{d}</div>
          ))}
        </div>

        <div className="ppt-calendar-grid">
          {cells.map((d,i)=>{
            const ds=dayStr(d);
            const isToday=ds===todayStr;
            const isSel=d&&selectedDay===d;
            const dayTasks=ds?filteredTasks.filter(t=>t.day===ds):[];
            const dayAirs=ds?(allAirDates[ds]||[]):[];
            const dayMil=ds?(milestones[ds]||[]):[];
            const dayBirthdays=ds?(birthdays[ds]||[]):[];
            const groupMarkers=dayGroupMarkers(dayTasks);
            const compactEvents=[
              ...dayAirs.map(x=>({...x,kind:"air"})),
              ...dayMil.map(x=>({...x,kind:"milestone"})),
              ...dayBirthdays.map(x=>({person:x,kind:"birthday"}))
            ];
            const hiddenEventCount=Math.max(0,compactEvents.length-4);
            return (
              <div key={i}
                className="ppt-calendar-cell"
                onClick={()=>d&&setSelectedDay(isSel?null:d)}
                onMouseEnter={d&&dayTasks.length?e=>setHovDay({ds,dayTasks,rect:e.currentTarget.getBoundingClientRect()}):undefined}
                onMouseLeave={()=>setHovDay(null)}
                style={{background:isSel?"#1e3a5f":isToday?"rgba(59,130,246,0.1)":"#1e293b",
                  border:`1px solid ${isSel?"#3b82f6":isToday?"rgba(59,130,246,0.4)":"#263352"}`,
                  cursor:d?"pointer":"default",opacity:d?1:0.2}}>
                {d&&(
                  <>
                    <div style={{fontSize:11,color:isToday?"#3b82f6":"#475569",fontWeight:isToday?700:400,marginBottom:3}}>
                      {d}
                    </div>
                    <div className="ppt-calendar-stage-markers">
                      {groupMarkers.slice(0,12).map(g=>(
                        <span key={g.id} className={`ppt-calendar-stage-marker ${g.shape}`} title={`${g.label}: ${g.count}`} style={{"--marker-color":g.color}}/>
                      ))}
                      {groupMarkers.length>12&&<span className="ppt-calendar-stage-more">+{groupMarkers.length-12}</span>}
                    </div>
                    <div className="ppt-calendar-cell-events">
                      {compactEvents.slice(0,4).map((ev,ei)=>{
                        if(ev.kind==="air") return <div key={`air-${ei}`} className="ppt-calendar-event ppt-calendar-air" title={`\u042d\u0444\u0438\u0440: ${ev.proj.name} ${ev.ser.name}`}><span>{"\u042d\u0444\u0438\u0440"} {ev.proj.abbr||ev.proj.name} {ev.ser.name}</span></div>;
                        if(ev.kind==="milestone") return <div key={`mil-${ei}`} className="ppt-calendar-event" title={`${ev.label}: ${ev.proj.name} ${ev.ser.name}`} style={{"--ppt-event-color":ev.color||"#a855f7","--ppt-event-fill":`${ev.color||"#a855f7"}2f`,"--ppt-event-border":`${ev.color||"#a855f7"}66`,"--ppt-event-glow":`${ev.color||"#a855f7"}22`}}><span>{ev.label} {ev.proj.abbr||ev.proj.name} {ev.ser.name}</span></div>;
                        return <div key={`bd-${ei}`} className={`ppt-calendar-event ppt-birthday-event ${ds===todayStr?"ppt-birthday-today":""}`} title={`\u0414\u0435\u043d\u044c \u0440\u043e\u0436\u0434\u0435\u043d\u0438\u044f: ${ev.person.name}`}><span>{"\u0414\u0420"} {ev.person.name}</span></div>;
                      })}
                      {hiddenEventCount>0&&<div className="ppt-calendar-more-events">+{hiddenEventCount} {"\u0441\u043e\u0431\u044b\u0442\u0438\u0439 \u043d\u0438\u0436\u0435"}</div>}
                    </div>
                    {dayTasks.length>0&&(
                      <div style={{fontSize:9,color:"#475569",marginTop:1}}>{dayTasks.length} смен</div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div style={{marginTop:12,display:"flex",gap:16,flexWrap:"wrap"}}>
          {calendarProjects.map(p=>(
            <div key={p.id} style={{display:"flex",alignItems:"center",gap:4}}>
              <ProjectMark project={p} size={8}/>
              <span style={{fontSize:10,color:"#475569"}}>{p.name}</span>
            </div>
          ))}
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:10,color:"#f59e0b"}}>📺</span><span style={{fontSize:10,color:"#475569"}}>эфир</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:10,color:"#a855f7"}}>{MILESTONE_ICON}</span><span style={{fontSize:10,color:"#475569"}}>ключевые события</span>
          </div>
        </div>
      </div>

      {selStr&&(
        <div className="ppt-calendar-day-details">
          <div style={{fontWeight:700,fontSize:14,color:"#93c5fd",marginBottom:12}}>
            {dayLabel(selStr)}
          </div>
          <div className="ppt-calendar-detail-events">
            {selAirs.map(({proj,ser},i)=>(
              <div key={proj.id+ser.id+i} className="ppt-calendar-detail-event air">
                <strong>{"\u042d\u0444\u0438\u0440"}</strong>
                <span>{proj.name} {ser.name}</span>
                {ser.airTime&&<em>{ser.airTime}</em>}
              </div>
            ))}
            {selMil.map((m,i)=>(
              <div key={i} className="ppt-calendar-detail-event" style={{"--detail-color":m.color||"#94a3b8"}}>
                <strong>{m.label}</strong>
                <span>{m.proj.name} {m.ser.name}</span>
              </div>
            ))}
            {selBirthdays.map((p,i)=>(
              <div key={`bd-${p.id||p.name||i}`} className={`ppt-calendar-detail-event birthday ${selStr===todayStr?"today":""}`} title={`\u0414\u0435\u043d\u044c \u0440\u043e\u0436\u0434\u0435\u043d\u0438\u044f: ${p.name}`}>
                <strong>{"\u0414\u0420"}</strong>
                <span>{p.name}</span>
              </div>
            ))}
          </div>
          {selTasks.length===0&&selAirs.length===0&&selMil.length===0&&selBirthdays.length===0&&(
            <div style={{color:"#334155",fontSize:12}}>{"\u041d\u0435\u0442 \u0441\u043e\u0431\u044b\u0442\u0438\u0439"}</div>
          )}
          {selTasks.length>0&&(
            <div className="ppt-calendar-task-bricks">
              {sortedSelTasks.map(t=>{
                const proj=data.projects.find(p=>p.id===t.project);
                const st=stageMap?.[t.status]||{};
                const gid=st.groupId||t.status||"other";
                const group=(stageGroups||[]).find(g=>g.id===gid);
                const markerColor=st.color||proj?.color||"#64748b";
                const markerShape=groupShapeMap[gid]||"circle";
                return <div key={t.id} className="ppt-calendar-task-brick" onDoubleClick={()=>onGoToGantt&&onGoToGantt(t.day)} title={onGoToGantt?"\u0414\u0432\u043e\u0439\u043d\u043e\u0439 \u043a\u043b\u0438\u043a - \u043e\u0442\u043a\u0440\u044b\u0442\u044c \u0432 \u0413\u0430\u043d\u0442\u0435":undefined}
                  style={{"--task-color":markerColor}}>
                  <div className="ppt-calendar-task-project">{proj?.name||"\u0411\u0435\u0437 \u043f\u0440\u043e\u0435\u043a\u0442\u0430"}</div>
                  <div className="ppt-calendar-task-series">{t.series||"\u0411\u0435\u0437 \u0441\u0435\u0440\u0438\u0438"}</div>
                  <div className="ppt-calendar-task-work">
                    <span className={"ppt-calendar-stage-marker "+markerShape} title={group?.label||st.label||t.status||""} style={{"--marker-color":markerColor}}/>
                    <strong>{st.label||t.status||"-"}</strong>
                    <em>{fmtHour(t.from)}-{fmtHour(t.to)}</em>
                  </div>
                  <div className="ppt-calendar-task-person">{t.person||"\u0431\u0435\u0437 \u0438\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044f"}</div>
                </div>;
              })}
            </div>
          )}
        </div>
      )}
      {hovDay&&!hovDay.single&&(
        <CalendarDayTooltip dayTasks={hovDay.dayTasks} ds={hovDay.ds} rect={hovDay.rect} projects={data.projects}/>
      )}
      {hovDay?.single&&(
        <TaskTooltip task={hovDay.task} rect={hovDay.rect} projects={data.projects}/>
      )}
    </div>
  );
}
function CalendarDayTooltip({dayTasks,ds,rect,projects}){
  const {stageMap}=useContext(StagesCtx);
  if(!dayTasks?.length) return null;
  const W=260; const vw=window.innerWidth; const vh=window.innerHeight;
  let left=rect.right+8; if(left+W>vw-16) left=rect.left-W-8;
  let top=rect.top; if(top+dayTasks.length*22+40>vh-16) top=Math.max(8,vh-dayTasks.length*22-56);
  return (
    <div style={{position:"fixed",left,top,zIndex:9999,width:W,
      background:"#0f172a",border:"1px solid #475569",borderRadius:12,
      padding:"10px 14px",pointerEvents:"none",boxShadow:"0 8px 24px rgba(0,0,0,0.65)"}}>
      <div style={{fontSize:10,color:"#64748b",letterSpacing:1,marginBottom:8}}>{ds} · {dayTasks.length} смен</div>
      {dayTasks.slice(0,12).map((t,i)=>{
        const st=stageMap[t.status];
        const c=projColor(projects,t.project);
        return (
          <div key={t.id} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:c,flexShrink:0}}/>
            <span style={{fontSize:11,color:st?st.color:"#94a3b8",fontWeight:600,flexShrink:0,minWidth:90,
              overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{st?.label||t.status}</span>
            <span style={{fontSize:11,color:"#64748b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.person||"—"}</span>
            <span style={{fontSize:10,color:"#334155",flexShrink:0,marginLeft:"auto"}}>{t.from}–{t.to}</span>
          </div>
        );
      })}
      {dayTasks.length>12&&<div style={{fontSize:10,color:"#475569",marginTop:4}}>…ещё {dayTasks.length-12}</div>}
    </div>
  );
}

// ── ГАНТ ─────────────────────────────────────────────────────────────
function GanttTooltip({task,tasks,rect,stageMap}){
  const all=tasks||(task?[task]:[]);
  if(!all.length||!rect) return null;
  const W=240;
  const vw=window.innerWidth; const vh=window.innerHeight;
  let left=rect.right+10; if(left+W>vw-16) left=rect.left-W-10;
  const estH=all.length>1?24+all.length*22:120;
  let top=rect.top; if(top+estH>vh-16) top=Math.max(8,vh-estH-8);
  if(all.length===1){
    const t=all[0]; const st=stageMap[t.status];
    return (
      <div style={{position:"fixed",left,top,zIndex:9999,width:W,
        background:"#1e293b",border:"1px solid #475569",borderRadius:12,
        padding:"10px 14px",pointerEvents:"none",boxShadow:"0 8px 24px rgba(0,0,0,0.65)"}}>
        {st&&<div style={{marginBottom:6}}>
          <span style={{background:colorToBg(st.color),border:`1px solid ${st.color}55`,
            borderRadius:4,padding:"2px 8px",fontSize:11,color:st.color,fontWeight:600}}>
            {st.label}
          </span>
        </div>}
        {t.person&&<div style={{fontSize:13,color:"#e2e8f0",marginBottom:4,fontWeight:600}}>{t.person}</div>}
        <div style={{fontSize:11,color:"#64748b",marginBottom:canSeeTaskNotes()&&t.note?4:0}}>
          {fmtHour(t.from)} – {fmtHour(t.to)} · {fmtDur(t.from,t.to)}
        </div>
        {canSeeTaskNotes()&&t.note&&<div style={{fontSize:11,color:"#94a3b8",lineHeight:1.4,marginTop:4}}>{t.note}</div>}
      </div>
    );
  }
  const st0=stageMap[all[0].status];
  return (
    <div style={{position:"fixed",left,top,zIndex:9999,width:W,
      background:"#1e293b",border:"1px solid #475569",borderRadius:12,
      padding:"8px 12px",pointerEvents:"none",boxShadow:"0 8px 24px rgba(0,0,0,0.65)"}}>
      {st0&&<div style={{marginBottom:6,display:"flex",alignItems:"center",gap:6}}>
        <span style={{background:colorToBg(st0.color),border:`1px solid ${st0.color}55`,
          borderRadius:4,padding:"2px 8px",fontSize:11,color:st0.color,fontWeight:600}}>
          {st0.label}
        </span>
        <span style={{fontSize:11,color:"#475569"}}>× {all.length}</span>
      </div>}
      {all.map((t,i)=>{
        const per=t.person||"—";
        return (
          <div key={t.id} style={{display:"flex",alignItems:"center",gap:6,padding:"3px 0",
            borderTop:i>0?"1px solid #1e293b":undefined}}>
            <span style={{fontSize:11,color:"#94a3b8",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{per}</span>
            <span style={{fontSize:10,color:"#475569",flexShrink:0}}>{t.from}–{t.to}</span>
            {canSeeTaskNotes()&&t.note&&<span style={{fontSize:9,color:"#334155",flexShrink:0}} title={t.note}>💬</span>}
          </div>
        );
      })}
    </div>
  );
}

function GanttView({data,onUpdate,onBatchUpdate,onSeriesSelect,startDay,onLog,canEdit,canEditOldTasks,canEditProjectById}){
  const {sorted:stages,stageMap,groupMap}=useContext(StagesCtx);
  const [weekOffset,setWeekOffset]=useState(()=>{
    if(startDay){
      const d=parseDate(startDay); if(!d) return 0;
      const today=new Date(); const todayDay=today.getDay()||7;
      const mon=new Date(today); mon.setDate(today.getDate()-todayDay+1); mon.setHours(0,0,0,0);
      return Math.floor((d-mon)/(7*24*60*60*1000));
    }
    return parseInt(sessionStorage.getItem("ganttWeek")||"0")||0;
  });
  const [taskModal,setTaskModal]=useState(null);
  const [collapsedProjects,setCollapsedProjects]=useState(new Set());
  const [expandedSeries,setExpandedSeries]=useState(new Set());
  const [hoverTask,setHoverTask]=useState(null);
  const [projectOrder,setProjectOrder]=useState(()=>data.ganttOrder||null);
  const [ganttFilter,setGanttFilter]=useState("");
  const [shiftTailMode,setShiftTailMode]=useState(false);
  const [selectedTasks,setSelectedTasks]=useState(new Set());
  const [taskContextMenu,setTaskContextMenu]=useState(null);
  const [assignPersonModal,setAssignPersonModal]=useState(null);
  const [lassoRange,setLassoRange]=useState(null);
  const lassoRef=useRef(null);
  const dragRef=useRef(null);
  const shiftPressedRef=useRef(false);
  const projDragRef=useRef(null);
  const canWriteProject=projectId=>!canEditProjectById||canEditProjectById(projectId);

  useEffect(()=>{sessionStorage.setItem("ganttWeek",String(weekOffset));},[weekOffset]);

  useEffect(()=>{
    function h(e){setTaskModal(e.detail||{});}
    window.addEventListener("gantt-new-task",h);
    return ()=>window.removeEventListener("gantt-new-task",h);
  },[]);
  useEffect(()=>{
    function h(e){if(e.key==="Escape"){ setSelectedTasks(new Set()); setTaskContextMenu(null); setAssignPersonModal(null); }if((e.key==="Delete"||e.key==="Backspace")&&selectedTasks.size){e.preventDefault();deleteSelectedTasks();}}
    document.addEventListener("keydown",h);
    return()=>document.removeEventListener("keydown",h);
  },[selectedTasks]);
  useEffect(()=>{
    function close(){setTaskContextMenu(null);}
    window.addEventListener("click",close);
    window.addEventListener("scroll",close,true);
    return()=>{window.removeEventListener("click",close);window.removeEventListener("scroll",close,true);};
  },[]);
  useEffect(()=>{
    function down(e){if(e.key==="Shift") shiftPressedRef.current=true;}
    function up(e){if(e.key==="Shift") shiftPressedRef.current=false;}
    window.addEventListener("keydown",down);
    window.addEventListener("keyup",up);
    return()=>{window.removeEventListener("keydown",down);window.removeEventListener("keyup",up);};
  },[]);

  const refMonday=useMemo(()=>{
    const d=new Date(); const day=d.getDay()||7;
    d.setDate(d.getDate()-day+1+weekOffset*7);
    d.setHours(0,0,0,0); return d;
  },[weekOffset]);

  const days=useMemo(()=>{
    const arr=[];
    for(let i=0;i<28;i++){
      const d=new Date(refMonday); d.setDate(refMonday.getDate()+i);
      arr.push(formatDate(d));
    }
    return arr;
  },[refMonday]);

  const todayStr=formatDate(new Date());

  const groupColorMap=useMemo(()=>{
    const m={};
    [...stages].sort((a,b)=>(a.order||0)-(b.order||0)).forEach(s=>{
      if(s.groupId&&!m[s.groupId]) m[s.groupId]=s.color;
    });
    return m;
  },[stages]);

  const orderedProjects=useMemo(()=>{
    const active=data.projects.filter(p=>p.status!=="архив");
    if(!projectOrder) return active;
    return [
      ...projectOrder.map(id=>active.find(p=>p.id===id)).filter(Boolean),
      ...active.filter(p=>!projectOrder.includes(p.id))
    ];
  },[data.projects,projectOrder]);

  const displayProjects=useMemo(()=>
    ganttFilter?orderedProjects.filter(p=>p.id===ganttFilter):orderedProjects
  ,[orderedProjects,ganttFilter]);

  function toggleCollapse(projId){
    setCollapsedProjects(prev=>{const n=new Set(prev);n.has(projId)?n.delete(projId):n.add(projId);return n;});
  }
  function toggleExpandSer(key){
    setExpandedSeries(prev=>{const n=new Set(prev);n.has(key)?n.delete(key):n.add(key);return n;});
  }
  function seriesKeysForProject(proj){
    const projSeries=(data.series||[]).filter(s=>s.projectId===proj.id).map(s=>s.name);
    const fromTasks=[...new Set((data.tasks||[]).filter(t=>t.project===proj.id).map(t=>t.series))].filter(Boolean);
    return [...new Set([...projSeries,...fromTasks])].map(name=>`${proj.id}|${name}`);
  }
  function expandProjectFully(proj){
    setCollapsedProjects(prev=>{const n=new Set(prev);n.delete(proj.id);return n;});
    setExpandedSeries(prev=>{const n=new Set(prev);seriesKeysForProject(proj).forEach(k=>n.add(k));return n;});
  }
  function expandAllGantt(){
    setCollapsedProjects(new Set());
    setExpandedSeries(new Set(displayProjects.flatMap(p=>seriesKeysForProject(p))));
  }

  useEffect(()=>{
    function onUp(){
      if(!lassoRef.current) return;
      const {projId,serName,startDayIdx,endDayIdx}=lassoRef.current;
      lassoRef.current=null; setLassoRange(null);
      if(startDayIdx===endDayIdx) return;
      const d1=Math.min(startDayIdx,endDayIdx); const d2=Math.max(startDayIdx,endDayIdx);
      const sel=new Set(data.tasks.filter(t=>{
        const idx=days.indexOf(t.day);
        return t.project===projId&&t.series===serName&&idx>=d1&&idx<=d2;
      }).map(t=>t.id));
      setSelectedTasks(sel);
    }
    document.addEventListener("mouseup",onUp);
    return()=>document.removeEventListener("mouseup",onUp);
  },[data.tasks,days]);

  useEffect(()=>{
    function onKey(e){
      if(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA"||e.target.tagName==="SELECT") return;
      if(taskModal!==null) return;
      if(e.key==="ArrowRight") setWeekOffset(w=>w+1);
      else if(e.key==="ArrowLeft") setWeekOffset(w=>w-1);
      else if(e.key==="Delete"||e.key==="Backspace"){
        if(selectedTasks.size>0) deleteSelectedTasks();
      }
    }
    document.addEventListener("keydown",onKey);
    return()=>document.removeEventListener("keydown",onKey);
  },[data.tasks,taskModal,selectedTasks]);

  function handleProjDragStart(e,projId){
    projDragRef.current=projId;
    e.dataTransfer.effectAllowed="move";
    e.dataTransfer.setData("text/plain",projId);
  }
  function handleProjDrop(e,targetId){
    e.preventDefault(); e.stopPropagation();
    const fromId=projDragRef.current; projDragRef.current=null;
    if(!fromId||fromId===targetId) return;
    const ids=orderedProjects.map(p=>p.id);
    const fi=ids.indexOf(fromId); const ti=ids.indexOf(targetId);
    if(fi<0||ti<0) return;
    const newIds=[...ids];
    newIds.splice(fi,1); newIds.splice(ti,0,fromId);
    setProjectOrder(newIds);
    onUpdate("ganttOrder",newIds);
  }

  // Ручной статус сбрасывается только сегодняшней задачей из более поздней группы.
  function dropManualIfBeaten(seriesId, newTasks){
    if(!seriesId) return null;
    const ser=(data.series||[]).find(s=>s.id===seriesId);
    if(!ser?.manualStatus) return null;
    const mg=groupMap[ser.manualStatus];
    if(!mg) return null;
    const todayStr=formatDate(new Date());
    const todayTasks=(newTasks||[]).filter(t=>!t.deleted&&!t.cancelled&&t.seriesId===seriesId&&t.day===todayStr);
    if(!todayTasks.length) return null;
    const maxOrder=Math.max(...todayTasks.map(t=>{
      const g=stageMap[t.status]?.groupId?groupMap[stageMap[t.status].groupId]:null;
      return g?.order||0;
    }));
    if(maxOrder>mg.order)
      return (data.series||[]).map(s=>s.id===seriesId?{...s,manualStatus:""}:s);
    return null;
  }
  function saveWithSeries(newTasks, seriesId){
    const ns=dropManualIfBeaten(seriesId,newTasks);
    if(ns) onBatchUpdate({series:ns,tasks:newTasks});
    else onUpdate("tasks",newTasks);
  }
  function touchTask(task){
    const ts=Date.now();
    return {...task,updatedAt:new Date(ts).toISOString(),_updatedAt:ts,updatedBy:""};
  }
  function oldTaskChangeBlocked(){
    return false;
  }
  function taskPersonName(task){return data.people?.find(p=>String(p.id)===String(task?.person))?.name||task?.person||"";}
  function taskPersonAbsent(task){const name=taskPersonName(task);return !!(name&&task?.day&&absencesForPersonDay(data.personAbsences||[],data.people||[],name,task.day).length);}
  function warnAbsentTask(task){const name=taskPersonName(task);const abs=absencesForPersonDay(data.personAbsences||[],data.people||[],name,task.day)[0];const ai=abs?absenceTypeInfo(abs.type):null;alert(`${name} уже отмечен как ${ai?.label||"отсутствует"} на ${task.day}. Сначала уберите отсутствие или выберите другого исполнителя.`);}
  function blockTasksWithAbsence(list){const bad=(list||[]).find(taskPersonAbsent);if(bad){warnAbsentTask(bad);return true;}return false;}
  function saveTaskList(newTasks, seriesId, changedTasks, sourceTasks=[]){
    const changedList=changedTasks||[];
    const blockedProjectChange=changedList.some(t=>{const old=(data.tasks||[]).find(x=>String(x.id)===String(t.id));return !canWriteProject(t.project)||(old&&old.project!==t.project&&!canWriteProject(old.project));});
    if(blockedProjectChange) return;
    if(blockTasksWithAbsence(changedList)) return;
    if(oldTaskChangeBlocked(changedTasks,sourceTasks)) return;
    saveWithSeries(newTasks,seriesId);
    (changedTasks||[]).forEach(t=>incrSave("task",t));
  }

  function saveTask(task){
    if(!canWriteProject(task.project)) return;
    if(task.id){const old=data.tasks.find(t=>t.id===task.id);if(old&&!canWriteProject(old.project)) return;}
    let tasks;
    let savedTask;
    if(task._cascadeAll){
      const clean={...task}; delete clean._cascadeAll;
      tasks=task._cascadeAll.map(t=>t.id===clean.id?clean:t);
      savedTask=tasks.find(t=>t.id===clean.id);
      if(!savedTask){
        savedTask={...clean,id:genTaskId(data.tasks)};
        tasks.push(savedTask);
      }
    } else {
      tasks=[...data.tasks];
      const exists=task.id&&tasks.find(t=>t.id===task.id);
      savedTask=exists?task:{...task,id:genTaskId(data.tasks)};
      if(exists) tasks=tasks.map(t=>t.id===savedTask.id?savedTask:t);
      else tasks.push(savedTask);
    }
    if(blockTasksWithAbsence([savedTask])) return;
    if(oldTaskChangeBlocked([savedTask],[task])) return;
    const now=new Date().toISOString();
    const ts=Date.now();
    savedTask={...savedTask,updatedAt:now,_updatedAt:ts,updatedBy:""};
    tasks=tasks.map(t=>t.id===savedTask.id?savedTask:t);
    const stageLabel=data.stages?.find(s=>s.id===savedTask.status)?.label||savedTask.status||"";
    const personName=data.people?.find(p=>p.id===savedTask.person)?.name||savedTask.person||"";
    const isNew=!(task.id&&data.tasks.find(t=>t.id===task.id));
    onLog?.(`${isNew?"Задача":"Изменена задача"}: ${stageLabel} · ${savedTask.series||""} / ${personName} — ${savedTask.day}`);
    saveWithSeries(tasks, savedTask.seriesId);
    setTaskModal(null);
    incrSave("task", savedTask);
  }
  function deleteTask(id){
    const t=data.tasks.find(x=>x.id===id);
    if(t&&!canWriteProject(t.project)) return;
    if(t){
      const stageLabel=data.stages?.find(s=>s.id===t.status)?.label||t.status||"";
      const personName=data.people?.find(p=>p.id===t.person)?.name||t.person||"";
      onLog?.(`Удалена задача: ${stageLabel} · ${t.series||""} / ${personName} — ${t.day}`);
    }
    const ts=Date.now();
    if(oldTaskChangeBlocked([],t?[t]:[])) return;
    onUpdate("tasks",data.tasks.map(t=>t.id===id?{...t,deleted:true,_updatedAt:ts}:t));
    setTaskModal(null);
    incrDelete("task", id);
  }

  function taskById(id){
    return (data.tasks||[]).find(t=>String(t.id)===String(id));
  }
  function writableTaskIds(ids){
    return [...new Set(ids||[])].filter(id=>{
      const t=taskById(id);
      return t&&!t.deleted&&canWriteProject(t.project);
    });
  }
  function openTaskContext(e, ids){
    e.preventDefault();
    e.stopPropagation();
    const raw=[...new Set(ids||[])].filter(Boolean);
    const useSelected=selectedTasks.size>1&&raw.some(id=>selectedTasks.has(id));
    const allowed=writableTaskIds(useSelected?[...selectedTasks]:raw);
    if(!allowed.length) return;
    setSelectedTasks(new Set(allowed));
    const menuW=230, menuH=150;
    setTaskContextMenu({
      x:Math.min(e.clientX, Math.max(8, window.innerWidth-menuW-8)),
      y:Math.min(e.clientY, Math.max(8, window.innerHeight-menuH-8)),
      ids:allowed
    });
    setHoverTask(null);
  }
  function closeTaskContext(){
    setTaskContextMenu(null);
  }
  function deleteTasksBulk(ids, requireConfirm=true){
    const allowed=writableTaskIds(ids);
    if(!allowed.length) return;
    if(requireConfirm&&allowed.length>1&&!window.confirm(`Удалить ${allowed.length} смен?`)) return;
    const idSet=new Set(allowed.map(String));
    const ts=Date.now();
    const source=(data.tasks||[]).filter(t=>idSet.has(String(t.id)));
    if(oldTaskChangeBlocked([],source)) return;
    source.forEach(t=>{
      const stageLabel=data.stages?.find(s=>s.id===t.status)?.label||t.status||"";
      const personName=data.people?.find(p=>p.id===t.person)?.name||t.person||"";
      onLog?.(`Удалена задача: ${stageLabel} · ${t.series||""} / ${personName} — ${t.day}`);
      incrDelete("task", t.id);
    });
    onUpdate("tasks",data.tasks.map(t=>idSet.has(String(t.id))?{...t,deleted:true,_updatedAt:ts}:t));
    setSelectedTasks(new Set());
    closeTaskContext();
  }
  function clearTaskPeopleBulk(ids){
    const allowed=writableTaskIds(ids);
    if(!allowed.length) return;
    if(allowed.length>1&&!window.confirm(`Убрать исполнителей у ${allowed.length} смен?`)) return;
    const idSet=new Set(allowed.map(String));
    const originals=(data.tasks||[]).filter(t=>idSet.has(String(t.id)));
    const changed=[];
    const tasks=data.tasks.map(t=>{
      if(!idSet.has(String(t.id))) return t;
      const nt=touchTask({...t,person:""});
      changed.push(nt);
      return nt;
    });
    saveTaskList(tasks,null,changed,originals);
    onLog?.(allowed.length===1?"Убран исполнитель со смены":`Убраны исполнители у ${allowed.length} смен`);
    setSelectedTasks(new Set());
    closeTaskContext();
  }
  function deleteSelectedTasks(){
    deleteTasksBulk([...selectedTasks],true);
  }
  function openAssignPeopleBulk(ids){const allowed=writableTaskIds(ids);if(!allowed.length)return;const source=(data.tasks||[]).filter(t=>allowed.map(String).includes(String(t.id)));let common=null;for(const t of source){const names=new Set(filterPeopleByStatus(data.people||[],t.status,stages).filter(p=>p.active!==false).map(p=>p.name));common=common===null?names:new Set([...common].filter(n=>names.has(n)));}const people=[...(common||new Set())].sort((a,b)=>String(a).localeCompare(String(b),"ru"));if(!people.length){alert("\u0414\u043b\u044f \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u044b\u0445 \u0441\u043c\u0435\u043d \u043d\u0435\u0442 \u043e\u0431\u0449\u0435\u0433\u043e \u0441\u043f\u0438\u0441\u043a\u0430 \u0438\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u0435\u0439. \u042d\u0442\u0430\u043f\u044b \u0442\u0440\u0435\u0431\u0443\u044e\u0442 \u0440\u0430\u0437\u043d\u044b\u0435 \u0440\u043e\u043b\u0438.");closeTaskContext();return;}setAssignPersonModal({ids:allowed,people,person:people[0]||""});closeTaskContext();}
  function assignPeopleBulk(ids,person){if(!person)return;const allowed=writableTaskIds(ids);if(!allowed.length)return;const idSet=new Set(allowed.map(String));const originals=(data.tasks||[]).filter(t=>idSet.has(String(t.id)));const ts=Date.now();const changed=[];const tasks=(data.tasks||[]).map(t=>{if(!idSet.has(String(t.id)))return t;const nt={...t,person,updatedAt:new Date(ts).toISOString(),_updatedAt:ts,updatedBy:""};changed.push(nt);return nt;});saveTaskList(tasks,null,changed,originals);onLog?.(allowed.length===1?"\u041d\u0430\u0437\u043d\u0430\u0447\u0435\u043d \u0438\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c: "+person:"\u041d\u0430\u0437\u043d\u0430\u0447\u0435\u043d \u0438\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c \u0434\u043b\u044f "+allowed.length+" \u0441\u043c\u0435\u043d: "+person);setSelectedTasks(new Set());setAssignPersonModal(null);}

  function handleDrop(e,row,d){
    e.preventDefault();
    const drag=dragRef.current; if(!drag) return;
    if(!canWriteProject(row.projId)){dragRef.current=null;return;}
    const {task,copy,multiTaskIds,stretch}=drag; dragRef.current=null;
    if(task&&!copy&&!canWriteProject(task.project)) return;
    const ser=(data.series||[]).find(s=>s.projectId===row.projId&&s.name===row.series);
    const newSeriesId=ser?.id||null;
    // Template drop
    if(drag.template){
      const newTask=touchTask({
        id:genTaskId(data.tasks),project:row.projId,series:row.series,seriesId:newSeriesId,
        status:drag.status,day:d,from:10,to:19,person:"",note:"",autogenerated:false,unplanned:false,
      });
      saveTaskList([...data.tasks,newTask],newSeriesId,[newTask],[task]); return;
    }
    // Single copy (alt+drag one task)
    if(copy&&(!multiTaskIds||multiTaskIds.size<=1)){
      const newTask=touchTask({...task,id:genTaskId(data.tasks),day:d,project:row.projId,series:row.series,seriesId:newSeriesId});
      delete newTask._cascadeAll;
      saveTaskList([...data.tasks,newTask],newSeriesId,[newTask]); return;
    }
    const diff=Math.round((parseDate(d)-parseDate(task.day))/(1000*60*60*24));
    const stretchCopy=(stretch||e.shiftKey||shiftPressedRef.current)&&diff!==0;
    if(stretchCopy){
      const ids=multiTaskIds&&multiTaskIds.size?multiTaskIds:new Set([task.id]);
      const source=data.tasks.filter(t=>ids.has(t.id));
      const step=diff>0?1:-1;
      const used=[...data.tasks];
      const newTasks=[];
      for(let off=step; step>0?off<=diff:off>=diff; off+=step){
        source.forEach(t=>{
          if(!canWriteProject(t.project)) return;
          const nt=touchTask({...t,id:genTaskId(used),day:addDays(t.day,off),project:row.projId,series:row.series,seriesId:newSeriesId});
          delete nt._cascadeAll;
          used.push(nt);
          newTasks.push(nt);
        });
      }
      if(newTasks.length) saveTaskList([...data.tasks,...newTasks],newSeriesId,newTasks,source);
      setSelectedTasks(new Set());
      return;
    }
    // Multi-select drag (move or copy)
    if(multiTaskIds&&multiTaskIds.size>1){
      if(copy){
        const used=[...data.tasks];
        const newTasks=data.tasks.filter(t=>multiTaskIds.has(t.id)).map(t=>{
          const nt=touchTask({...t,id:genTaskId(used),day:addDays(t.day,diff),project:row.projId,series:row.series,seriesId:newSeriesId});
          used.push(nt);
          return nt;
        });
        saveTaskList([...data.tasks,...newTasks],newSeriesId,newTasks,data.tasks.filter(t=>multiTaskIds.has(t.id)));
      } else if(diff!==0||row.projId!==task.project||row.series!==task.series){
        const changed=[];
        const tasks=data.tasks.map(t=>{
          if(!multiTaskIds.has(t.id)) return t;
          const nt=touchTask({...t,day:addDays(t.day,diff),project:row.projId,series:row.series,seriesId:newSeriesId});
          changed.push(nt);
          return nt;
        });
        saveTaskList(tasks,newSeriesId,changed);
      }
      setSelectedTasks(new Set()); return;
    }
    if(d===task.day&&row.projId===task.project&&row.series===task.series) return;
    const taskDaySort=daySort(task.day);
    const hasTail=data.tasks.some(t=>
      t.project===task.project&&t.series===task.series&&daySort(t.day)>taskDaySort&&t.id!==task.id);
    const applyMove=(cascade)=>{
      const changed=[];
      const tasks=data.tasks.map(t=>{
        if(t.id===task.id){
          const nt=touchTask({...t,day:d,project:row.projId,series:row.series,seriesId:newSeriesId});
          changed.push(nt);
          return nt;
        }
        if(cascade&&t.project===task.project&&t.series===task.series&&daySort(t.day)>taskDaySort){
          const nt=touchTask({...t,day:addDays(t.day,diff)});
          changed.push(nt);
          return nt;
        }
        return t;
      });
      saveTaskList(tasks,newSeriesId,changed);
    };
    applyMove(hasTail&&diff!==0&&shiftTailMode);
  }

  const COL=78;

  function collapsedProjectDayItems(projectId,d){
    const dayTasks=(data.tasks||[]).filter(t=>!t.deleted&&!t.cancelled&&t.project===projectId&&t.day===d);
    const statuses=[...new Set(dayTasks.map(t=>t.status).filter(Boolean))];
    return {statuses:statuses.slice(0,5),count:dayTasks.length};
  }

  const monthSpans=useMemo(()=>{
    const spans=[];
    days.forEach(d=>{
      const pd=parseDate(d);
      const mk=`${pd.getFullYear()}-${pd.getMonth()}`;
      if(!spans.length||spans[spans.length-1].key!==mk)
        spans.push({key:mk,label:MONTHS[pd.getMonth()],count:1});
      else spans[spans.length-1].count++;
    });
    return spans;
  },[days]);

  return (
    <div>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
        <Btn variant="ghost" onClick={()=>setWeekOffset(w=>w-1)}>← Пред. неделя</Btn>
        <Btn variant="ghost" small onClick={()=>setWeekOffset(0)}>Сегодня</Btn>
        <Btn variant="ghost" onClick={()=>setWeekOffset(w=>w+1)}>След. неделя →</Btn>
        <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",
          background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"4px 10px",
          border:`1px solid ${shiftTailMode?"#f59e0b33":"#334155"}`,fontSize:12,userSelect:"none"}}>
          <input type="checkbox" checked={shiftTailMode}
            onChange={e=>setShiftTailMode(e.target.checked)} style={{accentColor:"#f59e0b"}}/>
          <span style={{color:shiftTailMode?"#f59e0b":"#64748b"}}>Сдвигать хвост</span>
        </label>
        {selectedTasks.size>0&&(
          <span style={{fontSize:12,color:"#60a5fa",background:"rgba(59,130,246,0.1)",
            borderRadius:10,padding:"4px 10px",border:"1px solid rgba(59,130,246,0.3)",cursor:"default"}}
            title="Esc — снять выделение">
            OK {selectedTasks.size} выбрано · Shift+перетащи = протянуть копии · Alt = копировать · Esc = снять
          </span>
        )}
        <select value={ganttFilter} onChange={e=>setGanttFilter(e.target.value)}
          style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",
            color:ganttFilter?"#e2e8f0":"#64748b",borderRadius:10,padding:"4px 8px",fontSize:12}}>
          <option value="">Все проекты</option>
          {orderedProjects.map(p=><option key={p.id} value={p.id}>{p.abbr||p.name}</option>)}
        </select>
        <Btn variant="ghost" small onClick={()=>{setCollapsedProjects(new Set(orderedProjects.map(p=>p.id)));setExpandedSeries(new Set());}}>Свернуть всё</Btn>
        <Btn variant="ghost" small onClick={expandAllGantt}>Развернуть всё</Btn>
        <div style={{flex:1}}/>
        <Btn variant="primary" onClick={()=>setTaskModal({})}>+ Задача</Btn>
      </div>
      <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:12,flexWrap:"wrap"}}>
        <span style={{fontSize:10,color:"#475569",letterSpacing:1,flexShrink:0}}>ШАБЛОНЫ:</span>
        {GANTT_TEMPLATES.map(tmpl=>{
          const st=stageMap[tmpl.status];
          return (
            <div key={tmpl.status}
              draggable
              onDragStart={e=>{
                dragRef.current={template:true,status:tmpl.status};
                e.dataTransfer.effectAllowed="copy";
              }}
              onDragEnd={()=>{dragRef.current=null;}}
              title={`Перетащи на ячейку → создаст задачу "${tmpl.label}"`}
              style={{display:"inline-flex",alignItems:"center",padding:"3px 9px",
                borderRadius:5,cursor:"grab",userSelect:"none",fontSize:11,fontWeight:600,
                background:st?stageBg(st.color):"rgba(255,255,255,0.06)",
                border:`1px dashed ${st?st.color:"#475569"}`,
                color:st?st.color:"#94a3b8"}}>
              {tmpl.label}
            </div>
          );
        })}
      </div>

      <div style={{overflow:"auto",maxHeight:"calc(100vh - 220px)",border:"1px solid #1e293b",borderRadius:12}}
        onMouseLeave={()=>setHoverTask(null)}>
        <div style={{minWidth:200+COL*28}}>
          {/* Шапка */}
          <div style={{position:"sticky",top:0,zIndex:12}}>
            <div style={{display:"flex"}}>
              <div style={{width:200,flexShrink:0,height:18,position:"sticky",left:0,zIndex:21,
                background:"#060d1a",borderBottom:"1px solid #0f172a",borderRight:"1px solid #334155"}}/>
              {monthSpans.map((span,si)=>(
                <div key={span.key} style={{width:COL*span.count,flexShrink:0,height:18,
                  display:"flex",alignItems:"center",paddingLeft:6,background:"#060d1a",
                  borderLeft:si===0?"none":"2px solid #334155",borderBottom:"1px solid #0f172a"}}>
                  <span style={{fontSize:9,color:"#475569",letterSpacing:1,textTransform:"uppercase"}}>
                    {span.label}
                  </span>
                </div>
              ))}
            </div>
            <div style={{display:"flex"}}>
              <div style={{width:200,flexShrink:0,height:44,position:"sticky",left:0,zIndex:20,
                background:"#0f172a",borderBottom:"1px solid #334155",borderRight:"1px solid #334155"}}/>
              {days.map(d=>{
                const pd=parseDate(d); const isToday=d===todayStr;
                const isMon=pd&&pd.getDay()===1; const isSun=pd&&pd.getDay()===0;
                return (
                  <div key={d} style={{width:COL,flexShrink:0,display:"flex",flexDirection:"column",
                    alignItems:"center",justifyContent:"center",height:44,
                    background:isToday?"rgba(59,130,246,0.2)":isSun||isMon?"#1e293b":"#0f172a",
                    borderLeft:isMon?"2px solid #334155":"1px solid #1e293b",
                    borderBottom:"1px solid #334155"}}>
                    <span style={{fontSize:9,color:"#475569"}}>{WDAYS[pd?.getDay()||0]}</span>
                    <span style={{fontSize:11,fontWeight:isToday?700:400,color:isToday?"#60a5fa":"#64748b"}}>
                      {pd?pd.getDate():""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Строки */}
          {displayProjects.map((proj,pi)=>{
            const isCollapsed=collapsedProjects.has(proj.id);
            const projSeries=(data.series||[])
              .filter(s=>s.projectId===proj.id)
              .sort((a,b)=>(a.order||0)-(b.order||0));
            const fromTasks=[...new Set(data.tasks.filter(t=>t.project===proj.id).map(t=>t.series))]
              .filter(n=>!projSeries.find(s=>s.name===n)).sort();
            const allSeries=[...projSeries,...fromTasks.map(n=>({id:n,name:n}))];

            return (
              <React.Fragment key={proj.id}>
                {/* Заголовок проекта */}
                <div
                  draggable
                  onDragStart={e=>handleProjDragStart(e,proj.id)}
                  onDragOver={e=>{if(projDragRef.current&&projDragRef.current!==proj.id)e.preventDefault();}}
                  onDrop={e=>handleProjDrop(e,proj.id)}
                  onClick={e=>{if(e.detail>1)return;toggleCollapse(proj.id);}}
                  onDoubleClick={e=>{e.preventDefault();expandProjectFully(proj);}}
                  style={{display:"flex",height:isCollapsed?26:36,background:"#05101f",
                    cursor:"pointer",borderBottom:"1px solid #334155",userSelect:"none"}}>
                  <div style={{width:200,flexShrink:0,position:"sticky",left:0,zIndex:10,
                    display:"flex",alignItems:"center",padding:"0 10px",gap:6,
                    borderRight:"1px solid #475569",background:"#05101f"}}>
                    <span style={{fontSize:14,color:"#334155",cursor:"grab",flexShrink:0,lineHeight:1}}
                      onMouseDown={e=>e.stopPropagation()}>⠿</span>
                    <ProjectMark project={proj} size={9}/>
                    <span style={{fontWeight:700,fontSize:isCollapsed?11:12,color:"#94a3b8",flex:1,
                      overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>
                      {proj.name}
                    </span>
                    {isCollapsed&&<span style={{fontSize:9,color:"#475569",flexShrink:0,marginRight:2}}>
                      {allSeries.length} сер.
                    </span>}
                    <span style={{fontSize:9,color:"#475569",flexShrink:0}}>{isCollapsed?"▶":"▼"}</span>
                  </div>
                  {days.map(d=>{
                    const dayItems=collapsedProjectDayItems(proj.id,d);
                    return (
                      <div key={d} style={{width:COL,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",gap:2,overflow:"hidden"}}>
                        {dayItems.statuses.map(stId=>{
                          const st=stageMap[stId];
                          return <span key={stId} title={st?.label||stId} style={{width:6,height:6,borderRadius:2,background:st?.color||proj.color,opacity:0.9,display:"inline-block"}}/>;
                        })}
                        {dayItems.count>dayItems.statuses.length&&<span style={{fontSize:8,color:"#475569",lineHeight:1}}>+</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Серии */}
                {!isCollapsed&&allSeries.map((ser,si)=>{
                  const serKey=`${proj.id}|${ser.name}`;
                  const isExpanded=expandedSeries.has(serKey);
                  const rowH=isExpanded?90:52;
                  const seriesTasks=data.tasks.filter(t=>t.project===proj.id&&t.series===ser.name);
                  const isRealSer=!!(ser.projectId);
                  const isDelivered=!!(ser.delivered);

                  return (
                    <div key={serKey} style={{display:"flex",minHeight:rowH,height:"auto",
                      background:si%2===0?"#0a1220":"#060d1a",
                      borderBottom:"1px solid #1e293b",
                      opacity:isDelivered?0.5:1,alignItems:"stretch"}}>
                      {/* Метка серии */}
                      <div
                        onClick={()=>toggleExpandSer(serKey)}
                        onDoubleClick={()=>{if(isRealSer&&onSeriesSelect)onSeriesSelect(ser.id);}}
                        title={isRealSer?"Двойной клик — открыть карточку серии":""}
                        style={{width:200,flexShrink:0,position:"sticky",left:0,zIndex:5,
                          display:"flex",alignItems:"center",padding:"0 8px 0 22px",
                          borderRight:"1px solid #334155",cursor:"pointer",
                          background:si%2===0?"#0f172a":"#0a1220"}}>
                        <div style={{width:3,height:22,borderRadius:2,
                          background:isDelivered?"#22c55e":proj.color,
                          marginRight:8,flexShrink:0,opacity:0.55}}/>
                        <div style={{flex:1,overflow:"hidden"}}>
                          <div style={{fontSize:12,fontWeight:600,
                            color:isDelivered?"#475569":"#cbd5e1",
                            display:"flex",alignItems:"center",gap:4}}>
                            {ser.name}
                            {isDelivered&&<span style={{fontSize:9,color:"#22c55e"}}>OK</span>}
                            <span style={{fontSize:8,color:isExpanded?"#3b82f6":"#334155"}}>
                              {isExpanded?"▲":"▼"}
                            </span>
                          </div>
                          {isExpanded&&<div style={{fontSize:9,color:"#475569",marginTop:1}}>
                            {seriesTasks.length} задач · клик для свёртки
                          </div>}
                        </div>
                      </div>

                      {/* Ячейки дней */}
                      {days.map((d,dIdx)=>{
                        const cellTasks=seriesTasks.filter(t=>t.day===d);
                        const isToday=d===todayStr;
                        const pd=parseDate(d); const isMon=pd?.getDay()===1;
                        const isInLasso=lassoRange&&
                          lassoRange.projId===proj.id&&lassoRange.serName===ser.name&&
                          dIdx>=lassoRange.minIdx&&dIdx<=lassoRange.maxIdx;
                        return (
                          <div key={d}
                            onClick={()=>{if(selectedTasks.size>0){setSelectedTasks(new Set());return;}}}
                            onDoubleClick={()=>{
                              if(!canWriteProject(proj.id)) return;
                              setTaskModal({project:proj.id,series:ser.name,day:d,_fixedProject:true});
                            }}
                            onMouseDown={e=>{
                              if(e.button!==0) return;
                              lassoRef.current={projId:proj.id,serName:ser.name,startDayIdx:dIdx,endDayIdx:dIdx};
                            }}
                            onMouseEnter={e=>{
                              if(lassoRef.current&&lassoRef.current.projId===proj.id&&lassoRef.current.serName===ser.name){
                                lassoRef.current.endDayIdx=dIdx;
                                const[a,b]=[lassoRef.current.startDayIdx,dIdx];
                                setLassoRange({projId:proj.id,serName:ser.name,minIdx:Math.min(a,b),maxIdx:Math.max(a,b)});
                              } else if(!dragRef.current){
                                e.currentTarget.style.background=isToday?"rgba(59,130,246,0.12)":"rgba(255,255,255,0.03)";
                              }
                            }}
                            onMouseLeave={e=>{
                              if(!lassoRef.current)
                                e.currentTarget.style.background=isInLasso?"rgba(59,130,246,0.15)":(isToday?"rgba(59,130,246,0.06)":"transparent");
                            }}
                            onDragOver={e=>{if(!canWriteProject(proj.id)) return;e.preventDefault();
                              e.dataTransfer.dropEffect=(dragRef.current?.copy||dragRef.current?.template)?"copy":"move";}}
                            onDrop={e=>handleDrop(e,{projId:proj.id,series:ser.name},d)}
                            style={{width:COL,flexShrink:0,
                              borderLeft:isMon?"2px solid #334155":"1px solid #1e293b",
                              padding:2,display:"flex",flexDirection:"column",gap:1,
                              cursor:"pointer",overflow:"visible",
                              background:isInLasso?"rgba(59,130,246,0.18)":(isToday?"rgba(59,130,246,0.06)":"transparent"),
                              transition:"background 0.1s",userSelect:"none"}}>
                            {isRealSer&&getSeriesMilestoneEvents(ser,proj).filter(m=>m.date===d).map(m=>(
                              <div key={m.key} title={`${m.label}: ${m.date}`}
                                style={{background:m.color,borderRadius:2,
                                  color:"#000",fontSize:8,padding:"0 3px",
                                  textAlign:"center",fontWeight:800,flexShrink:0,
                                  opacity:0.88,letterSpacing:0.3,pointerEvents:"none"}}>
                                {m.abbr||m.label}
                              </div>
                            ))}
                            {isExpanded?(
                              cellTasks.map(t=>{
                                const st=stageMap[t.status];
                                const grpColor=st?.groupId?groupColorMap[st.groupId]:undefined;
                                const barColor=grpColor||proj.color;
                                const isSel=selectedTasks.has(t.id);
                                return (
                                  <div key={t.id} draggable
                                    onMouseDown={e=>e.stopPropagation()}
                                    onDragStart={e=>{e.stopPropagation();const multi=isSel&&selectedTasks.size>1?selectedTasks:null;dragRef.current={task:t,copy:e.altKey,stretch:e.shiftKey||shiftPressedRef.current,multiTaskIds:multi};e.dataTransfer.effectAllowed=e.altKey?"copy":"move";}}
                                    onDragEnd={()=>{dragRef.current=null;}}
                                    onClick={e=>{e.stopPropagation();if(e.shiftKey){setSelectedTasks(prev=>{const n=new Set(prev);n.has(t.id)?n.delete(t.id):n.add(t.id);return n;});}else{setTaskModal(t);}}}
                                    onContextMenu={e=>openTaskContext(e,[t.id])}
                                    onMouseEnter={e=>{e.stopPropagation();setHoverTask({task:t,rect:e.currentTarget.getBoundingClientRect()});}}
                                    onMouseLeave={e=>{e.stopPropagation();setHoverTask(null);}}
                                    style={{position:"relative",
                                      background:t.cancelled?"rgba(71,85,105,0.12)":isSel?`${st?.color||"#3b82f6"}33`:st?stageBg(st.color):"rgba(255,255,255,0.08)",
                                      border:t.cancelled?"1px dashed #475569":isSel?`2px solid ${st?.color||"#3b82f6"}`:`1px solid ${st?stageBorder(st.color):"#334155"}`,
                                      borderLeft:`3px solid ${t.cancelled?"#475569":grpColor||proj.color}`,
                                      borderRadius:3,flexShrink:0,overflow:"hidden",
                                      color:t.cancelled?"#64748b":st?st.color:"#94a3b8",
                                      cursor:"grab",userSelect:"none",padding:"3px 5px"}}>
                                    {t.cancelled&&<span style={{position:"absolute",top:1,right:2,fontSize:7,lineHeight:1}}>🚫</span>}
                                    <div style={{fontSize:9,lineHeight:1.4}}>
                                      <div style={{fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",textDecoration:t.cancelled?"line-through":"none"}}>{st?.abbr||st?.label||t.status}</div>
                                      <div style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",opacity:0.85}}>{t.person||"—"}</div>
                                      <div style={{fontSize:8,opacity:0.6}}>{t.from}–{t.to}</div>
                                    </div>
                                  </div>
                                );
                              })
                            ):(()=>{
                              // Collapsed: group active by status, cancelled separately
                              const activeCT=cellTasks.filter(t=>!t.cancelled);
                              const cancelledCnt=cellTasks.length-activeCT.length;
                              const groups={};
                              activeCT.forEach(t=>{if(!groups[t.status])groups[t.status]=[];groups[t.status].push(t);});
                              const badges=Object.entries(groups).map(([status,grpTasks])=>{
                                const st=stageMap[status];
                                const grpColor=st?.groupId?groupColorMap[st.groupId]:undefined;
                                const barColor=grpColor||proj.color;
                                const count=grpTasks.length;
                                const isSel=grpTasks.some(t=>selectedTasks.has(t.id));
                                return (
                                  <div key={status} draggable
                                    onMouseDown={e=>e.stopPropagation()}
                                    onDragStart={e=>{e.stopPropagation();const t0=grpTasks[0];const multi=count>1?new Set(grpTasks.map(t=>t.id)):(isSel&&selectedTasks.size>1?selectedTasks:null);dragRef.current={task:t0,copy:e.altKey,stretch:e.shiftKey||shiftPressedRef.current,multiTaskIds:multi};e.dataTransfer.effectAllowed=e.altKey?"copy":"move";}}
                                    onDragEnd={()=>{dragRef.current=null;}}
                                    onClick={e=>{e.stopPropagation();if(count===1){if(e.shiftKey){setSelectedTasks(prev=>{const n=new Set(prev);n.has(grpTasks[0].id)?n.delete(grpTasks[0].id):n.add(grpTasks[0].id);return n;});}else setTaskModal(grpTasks[0]);}else setTaskModal(grpTasks[0]);}}
                                    onContextMenu={e=>openTaskContext(e,grpTasks.map(t=>t.id))}
                                    onMouseEnter={e=>{e.stopPropagation();setHoverTask({tasks:grpTasks,rect:e.currentTarget.getBoundingClientRect()});}}
                                    onMouseLeave={e=>{e.stopPropagation();setHoverTask(null);}}
                                    style={{background:isSel?`${st?.color||"#3b82f6"}33`:st?stageBg(st.color):"rgba(255,255,255,0.08)",
                                      border:isSel?`2px solid ${st?.color||"#3b82f6"}`:`1px solid ${st?stageBorder(st.color):"#334155"}`,
                                      borderLeft:`3px solid ${barColor}`,
                                      borderRadius:3,flexShrink:0,overflow:"hidden",
                                      color:st?st.color:"#94a3b8",cursor:"grab",userSelect:"none",padding:"1px 3px"}}>
                                    <div style={{fontSize:9,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",display:"flex",alignItems:"center",gap:2}}>
                                      <span>{st?.abbr||st?.label||status}</span>
                                      {count>1&&<span style={{fontWeight:800,background:`${st?.color||"#94a3b8"}33`,
                                        borderRadius:2,padding:"0 2px",fontSize:8,flexShrink:0}}>×{count}</span>}
                                    </div>
                                  </div>
                                );
                              });
                              if(cancelledCnt>0) badges.push(
                                <div key="__c" style={{background:"rgba(71,85,105,0.15)",border:"1px dashed #475569",
                                  borderLeft:"3px solid #475569",borderRadius:3,overflow:"hidden",
                                  color:"#64748b",padding:"1px 3px",cursor:"pointer"}}
                                  onClick={e=>{e.stopPropagation();const ct=cellTasks.filter(t=>t.cancelled);if(ct.length===1)setTaskModal(ct[0]);}}
                                  onContextMenu={e=>openTaskContext(e,cellTasks.filter(t=>t.cancelled).map(t=>t.id))}>
                                  <div style={{fontSize:9,display:"flex",alignItems:"center",gap:1}}>
                                    <span>🚫</span>
                                    {cancelledCnt>1&&<span style={{fontSize:8,fontWeight:800}}>×{cancelledCnt}</span>}
                                  </div>
                                </div>
                              );
                              return badges;
                            })()}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {taskContextMenu&&(()=>{
        const ids=taskContextMenu.ids||[];
        const first=taskById(ids[0]);
        const menuItem={display:"block",width:"100%",textAlign:"left",background:"transparent",border:"none",color:"#dbeafe",padding:"9px 12px",fontSize:13,fontWeight:700,cursor:"pointer",borderRadius:9};
        const danger={...menuItem,color:"#fecaca"};
        return (
          <div onClick={e=>e.stopPropagation()} style={{position:"fixed",left:taskContextMenu.x,top:taskContextMenu.y,zIndex:2147483100,width:230,
            background:"linear-gradient(180deg,rgba(30,41,59,.98),rgba(15,23,42,.98))",border:"1px solid rgba(148,163,184,.28)",
            borderRadius:14,boxShadow:"0 18px 50px rgba(0,0,0,.55)",padding:6}}>
            <div style={{fontSize:11,color:"#94a3b8",padding:"6px 10px 8px",borderBottom:"1px solid rgba(148,163,184,.16)",marginBottom:4}}>
              {ids.length===1?"1 смена":ids.length+" смен"}
            </div>
            {ids.length===1&&first&&<button type="button" style={menuItem} onClick={()=>{setTaskModal(first);closeTaskContext();}}>Открыть смену</button>}
            <button type="button" style={menuItem} onClick={()=>openAssignPeopleBulk(ids)}>{"\u041d\u0430\u0437\u043d\u0430\u0447\u0438\u0442\u044c \u0438\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044f"}</button>
            <button type="button" style={menuItem} onClick={()=>clearTaskPeopleBulk(ids)}>Убрать исполнителей</button>
            <button type="button" style={danger} onClick={()=>deleteTasksBulk(ids,true)}>Удалить</button>
            <button type="button" style={{...menuItem,color:"#94a3b8",fontWeight:600}} onClick={()=>{setSelectedTasks(new Set());closeTaskContext();}}>Снять выделение</button>
          </div>
        );
      })()}

      {hoverTask&&<GanttTooltip task={hoverTask.task} tasks={hoverTask.tasks} rect={hoverTask.rect} stageMap={stageMap}/>}

      {assignPersonModal&&(<Modal title={"\u041d\u0430\u0437\u043d\u0430\u0447\u0438\u0442\u044c \u0438\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044f"} onClose={()=>setAssignPersonModal(null)} onSubmit={()=>assignPeopleBulk(assignPersonModal.ids,assignPersonModal.person)} freeOverflow><Field label={"\u0418\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c"}><SelSearch value={assignPersonModal.person} onChange={v=>setAssignPersonModal(m=>({...m,person:v}))} options={assignPersonModal.people.map(p=>({value:p,label:p}))} placeholder={"\u0412\u044b\u0431\u0440\u0430\u0442\u044c \u0438\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044f..."}/></Field></Modal>)}
      {taskModal!==null&&(
        <TaskModal task={taskModal} data={data}
          onSave={saveTask} onDelete={deleteTask} onClose={()=>setTaskModal(null)} canEdit={canEdit&&(!taskModal.project||canWriteProject(taskModal.project))} canEditOldTasks={canEditOldTasks} canEditProjectById={canEditProjectById}/>
      )}
    </div>
  );
}

function TaskModal({task,data,onSave,onDelete,onClose,canEdit,canEditOldTasks,canEditProjectById}){
  const {sorted:stages,stageMap}=useContext(StagesCtx);
  const isNew=!task.id;
  const [form,setForm]=useState({
    project:task.project||"",series:task.series||"",status:task.status||"",
    person:task.person||"",day:task.day||"",from:task.from??10,to:task.to??19,
    note:task.note||"",unplanned:task.unplanned||false,shifts_tail:false,
  });
  const sf=v=>setForm(f=>({...f,...v}));
  const fixedProject=isNew&&task._fixedProject&&task.project;
  const fixedPerson=isNew&&task._fixedPerson&&task.person;
  const fixedProjectObj=fixedProject?(data.projects||[]).find(p=>p.id===form.project):null;

  const isLocked=false;

  const stageInfo=form.status?stageMap[form.status]:null;
  const needsExecutor=!stageInfo||stageInfo.needsExecutor!==false;

  const availSeries=useMemo(()=>{
    const fromSeries=(data.series||[]).filter(s=>s.projectId===form.project)
      .sort((a,b)=>(a.order||0)-(b.order||0)).map(s=>s.name);
    const fromTasks=[...new Set(data.tasks.filter(t=>t.project===form.project).map(t=>t.series))]
      .filter(n=>!fromSeries.includes(n)).sort();
    return [...fromSeries,...fromTasks];
  },[form.project,data]);

  const availPeople=useMemo(()=>{
    if(!form.status) return data.people.filter(p=>p.active!==false);
    return filterPeopleByStatus(data.people,form.status,stages);
  },[form.status,data.people,stages]);

  const roleHint=useMemo(()=>{
    const roles=stageInfo?.rolesRequired||[];
    if(!roles.length) return "";
    const labels=roles.map(r=>data.roles.find(rl=>rl.id===r)?.label||r);
    return `Показаны: ${labels.join(", ")}`;
  },[stageInfo,data.roles]);

  const hasTail=useMemo(()=>{
    if(!task.id||!task.day||form.day===task.day) return false;
    const ds=daySort(task.day);
    return data.tasks.some(t=>t.project===task.project&&t.series===task.series&&daySort(t.day)>ds&&t.id!==task.id);
  },[form.day,task,data.tasks]);

  function handleSave(){
    if(isLocked) return;
    if(!form.project){alert("Выберите проект");return;}
    if(!form.series){alert("Укажите серию");return;}
    if(!form.status){alert("Выберите этап");return;}
    if(!form.day){alert("Укажите дату");return;}
    if(!parseDate(form.day)){alert("Укажите существующую дату");return;}
    if(!Number.isFinite(Number(form.from))||!Number.isFinite(Number(form.to))||Number(form.from)<0||Number(form.to)>24||Number(form.to)<=Number(form.from)){alert("Время окончания должно быть позже начала, в пределах одного дня");return;}
    const ser=(data.series||[]).find(s=>s.projectId===form.project&&s.name===form.series);
    const seriesId=ser?ser.id:null;
    const saved={...task,...form,seriesId,autogenerated:task.autogenerated||false};
    delete saved._fixedProject;
    delete saved._fixedPerson;
    if(form.shifts_tail&&task.id&&form.day!==task.day){
      const diff=Math.round((parseDate(form.day)-parseDate(task.day))/(1000*60*60*24));
      const ds=daySort(task.day);
      const tailTasks=data.tasks.filter(t=>t.project===task.project&&t.series===task.series&&daySort(t.day)>ds&&t.id!==task.id);
      const updatedTail=tailTasks.map(t=>({...t,day:addDays(t.day,diff)}));
      const allTasks=data.tasks.map(t=>{const upd=updatedTail.find(u=>u.id===t.id);return upd||t;});
      onSave({...saved,_cascadeAll:allTasks});
    } else {
      onSave(saved);
    }
  }
  return (
    <Modal title={isNew?"Новая задача":"Редактировать задачу"} onClose={onClose} onSubmit={handleSave}>
      {fixedProject&&<div style={{marginBottom:12,padding:"8px 10px",background:"#0f172a",border:"1px solid #334155",borderRadius:10,fontSize:13,color:"#94a3b8"}}>
        <div style={{fontWeight:800,color:"#e2e8f0"}}>{fixedProjectObj?.name||form.project}</div>
        <div>{form.series||"-"}</div>
      </div>}
      {!fixedProject&&<Field label={"\u041f\u0440\u043e\u0435\u043a\u0442"}>
        <SelSearch value={form.project} onChange={v=>sf({project:v,series:"",person:fixedPerson?form.person:""})}
          options={data.projects.filter(p=>!canEditProjectById||canEditProjectById(p.id)).map(p=>({value:p.id,label:p.name}))} placeholder={"\u0412\u044b\u0431\u0440\u0430\u0442\u044c \u043f\u0440\u043e\u0435\u043a\u0442..."} autoFocus={isNew}/>
      </Field>}
      {!fixedProject&&<Field label={"\u0421\u0435\u0440\u0438\u044f"}>
        <SelSearch value={form.series} onChange={v=>sf({series:v})}
          options={availSeries} placeholder={"\u0412\u044b\u0431\u0440\u0430\u0442\u044c \u0438\u043b\u0438 \u0432\u0432\u0435\u0441\u0442\u0438: \u042101..."} allowCustom/>
      </Field>}
      <Field label="Этап">
        <SelSearch value={form.status} onChange={v=>sf({status:v,person:fixedPerson?form.person:""})}
          options={stages.map(s=>({value:s.id,label:s.label}))} placeholder="Выбрать этап..."/>
      </Field>
      <Field label={`Исполнитель${needsExecutor?"":" (необязательно)"}`} hint={roleHint}>
        <SelSearch value={form.person} onChange={v=>sf({person:v})}
          options={availPeople.map(p=>({value:p.name,label:p.name+(p.roles.length?" ("+p.roles.map(r=>data.roles.find(rl=>rl.id===r)?.label||r).join(", ")+")":"")}))}
          placeholder={needsExecutor?"Выбрать исполнителя...":"Без исполнителя..."} allowCustom/>
      </Field>
      <Field label="Дата">
        <InpDate value={form.day} onChange={v=>sf({day:v})}/>
      </Field>
      <Field label="Время">
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
          {TIME_PRESETS.map(({f:fr,t:to})=>(
            <Btn key={`${fr}-${to}`} small
              variant={form.from===fr&&form.to===to?"primary":"ghost"}
              onClick={()=>sf({from:fr,to})}>
              {fr}–{to}
            </Btn>
          ))}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{fontSize:12,color:"#64748b"}}>с</span>
          <select value={Math.floor(form.from||0)}
            onChange={e=>sf({from:Number(e.target.value)+(((form.from||0)%1>=0.5)?0.5:0)})}
            style={{background:"#0f172a",border:"1px solid #334155",color:"#e2e8f0",
              borderRadius:10,padding:"5px 8px",fontSize:13,outline:"none"}}>
            {Array.from({length:24},(_,i)=><option key={i} value={i}>{String(i).padStart(2,"0")}</option>)}
          </select>
          <select value={(form.from||0)%1>=0.5?30:0}
            onChange={e=>sf({from:Math.floor(form.from||0)+Number(e.target.value)/60})}
            style={{background:"#0f172a",border:"1px solid #334155",color:"#e2e8f0",
              borderRadius:10,padding:"5px 8px",fontSize:13,outline:"none"}}>
            <option value={0}>:00</option>
            <option value={30}>:30</option>
          </select>
          <span style={{fontSize:12,color:"#64748b"}}>до</span>
          <select value={Math.floor(form.to||0)}
            onChange={e=>sf({to:Number(e.target.value)+(((form.to||0)%1>=0.5)?0.5:0)})}
            style={{background:"#0f172a",border:"1px solid #334155",color:"#e2e8f0",
              borderRadius:10,padding:"5px 8px",fontSize:13,outline:"none"}}>
            {Array.from({length:25},(_,i)=><option key={i} value={i}>{String(i).padStart(2,"0")}</option>)}
          </select>
          <select value={(form.to||0)%1>=0.5?30:0}
            onChange={e=>sf({to:Math.floor(form.to||0)+Number(e.target.value)/60})}
            style={{background:"#0f172a",border:"1px solid #334155",color:"#e2e8f0",
              borderRadius:10,padding:"5px 8px",fontSize:13,outline:"none"}}>
            <option value={0}>:00</option>
            <option value={30}>:30</option>
          </select>
          <span style={{fontSize:12,color:"#64748b"}}>{fmtDur(form.from,form.to)}</span>
        </div>
      </Field>
      {canSeeTaskNotes()&&<Field label="Заметка">
        <textarea value={form.note} onChange={e=>sf({note:e.target.value})} rows={2}
          placeholder="Описание, факт выполнения..."
          style={{background:"#0f172a",border:"1px solid #334155",color:"#e2e8f0",
            borderRadius:10,padding:"7px 10px",fontSize:13,width:"100%",resize:"vertical"}}/>
      </Field>}
      <div style={{display:"flex",gap:16,marginBottom:6,alignItems:"center",flexWrap:"wrap"}}>
        {hasTail&&(
          <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}>
            <input type="checkbox" checked={form.shifts_tail}
              onChange={e=>sf({shifts_tail:e.target.checked})} style={{accentColor:"#f59e0b"}}/>
            <span style={{fontSize:13,color:"#f59e0b"}}>Сдвинуть весь хвост серии</span>
          </label>
        )}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
          {form.cancelled?(
            <span style={{fontSize:11,color:"#475569",background:"rgba(71,85,105,0.15)",
              border:"1px solid #475569",borderRadius:10,padding:"4px 10px"}}>🚫 Отменена</span>
          ):(
            <span style={{fontSize:11,color:"#94a3b8"}}>
              {!isNew&&daySort(form.day)<daySort(formatDate(new Date()))?"OK Выполнено":" Запланировано"}
            </span>
          )}
          {form.cancelled?(
            <Btn small variant="ghost" onClick={()=>sf({cancelled:false,
              note:(form.note||"").replace(/^ОТМЕНА\n?/,"").trim()})}>↩ Снять отмену</Btn>
          ):(
            <Btn small variant="danger" onClick={()=>sf({cancelled:true,
              note:"ОТМЕНА"+(form.note?"\n"+form.note:"")})}>🚫 Отменить</Btn>
          )}
        </div>
      </div>
      {task.updatedAt&&(
        <div style={{fontSize:10,color:"#334155",marginTop:8,textAlign:"right"}}>
          изменено: {new Date(task.updatedAt).toLocaleString("ru-RU",{day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"})}
          {task.updatedBy?" · "+task.updatedBy:""}
        </div>
      )}
      <div style={{display:"flex",justifyContent:"space-between",marginTop:16}}>
        <div>{!isNew&&canEdit&&<Btn variant="danger" disabled={isLocked} onClick={()=>!isLocked&&onDelete(task.id)}>Удалить</Btn>}</div>
        <div style={{display:"flex",gap:8}}>
          <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
          {canEdit&&<Btn variant="primary" disabled={isLocked} onClick={handleSave}>
            {isNew?"Создать задачу":"Сохранить"}
          </Btn>}
        </div>
      </div>
    </Modal>
  );
}

// ── ПО ДНЯМ ──────────────────────────────────────────────────────────
function DaysView({data,conflictIds}){
  const [groupBy,setGroupBy]=useState("week");
  const [filterPerson,setFilterPerson]=useState("");
  const [filterProject,setFilterProject]=useState("");
  const [hovTask,setHovTask]=useState(null);
  const tasks=useMemo(()=>enrichTasks(data.tasks),[data.tasks]);
  const people=useMemo(()=>[...new Set(tasks.map(t=>t.person).filter(Boolean))].filter(p=>data.people.some(dp=>dp.name===p)).sort(),[tasks,data.people]);
  const containerRef=useRef(null);

  useEffect(()=>{
    const h=e=>{if(e.key==="Escape"){setFilterPerson("");setFilterProject("");}};
    document.addEventListener("keydown",h);
    return()=>document.removeEventListener("keydown",h);
  },[]);
  useEffect(()=>{const t=setTimeout(scrollToToday,150);return()=>clearTimeout(t);},[]);

  const filtered=useMemo(()=>{
    let r=tasks;
    if(filterPerson) r=r.filter(t=>t.person===filterPerson);
    if(filterProject) r=r.filter(t=>t.project===filterProject);
    return r;
  },[tasks,filterPerson,filterProject]);

  const peopleCols=filterPerson?[filterPerson]:people;

  function scrollToToday(){
    if(!containerRef.current) return;
    const today=formatDate(new Date());
    const el=containerRef.current.querySelector(`[data-day="${today}"]`);
    if(el) el.scrollIntoView({behavior:"smooth",inline:"center",block:"nearest"});
  }

  function DayCol({dayKey,dayTasks,compact}){
    const hasC=dayTasks.some(t=>conflictIds.has(t.id));
    return (
      <div data-day={dayKey}>
        <div style={{padding:compact?"4px 6px":"7px 10px",
          background:hasC?"rgba(239,68,68,0.12)":"#1e293b",
          borderRadius:"6px 6px 0 0",borderBottom:`2px solid ${hasC?"#ef4444":"#3b82f6"}`,
          fontSize:compact?10:11,fontWeight:700,color:hasC?"#f87171":"#93c5fd",
          display:"flex",justifyContent:"space-between"}}>
          <span>{dayLabel(dayKey)}</span>{hasC&&<span>⚡</span>}
        </div>
        <div style={{background:"#1e293b",borderRadius:"0 0 6px 6px",border:"1px solid #334155",
          borderTop:"none",padding:compact?4:6,minHeight:compact?50:80}}>
          {(()=>{
            const visible=peopleCols.filter(p=>dayTasks.some(t=>t.person===p));
            const twoCol=!compact&&visible.length>4;
            const items=visible.map(person=>{
              const pt=dayTasks.filter(t=>t.person===person);
              return (
                <div key={person} style={{marginBottom:compact?4:8}}>
                  <div style={{fontSize:compact?9:13,color:"#94a3b8",fontWeight:700,marginBottom:3}}>{person}</div>
                  <div style={{display:"flex",flexDirection:"column",gap:2}}>
                    {pt.map(t=><TaskCard key={t.id} task={t} projects={data.projects} isConflict={conflictIds.has(t.id)} large onHover={(t,r)=>setHovTask(t?{task:t,rect:r}:null)}/>)}
                  </div>
                </div>
              );
            });
            return twoCol
              ? <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,alignItems:"start"}}>{items}</div>
              : items;
          })()}
          {!dayTasks.length&&<div style={{color:"#334155",fontSize:11}}>нет задач</div>}
        </div>
      </div>
    );
  }

  const dayKeys=[...new Set(filtered.map(t=>t._dayKey))]
    .filter(dk=>filtered.some(t=>t._dayKey===dk&&peopleCols.includes(t.person)))
    .sort((a,b)=>daySort(a).localeCompare(daySort(b)));
  const groups={};
  if(groupBy!=="day") filtered.forEach(t=>{
    const k=groupBy==="week"?t._weekKey:t._monthKey;
    if(!groups[k]) groups[k]=[];
    groups[k].push(t);
  });

  return (
    <div>
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
        {["все",...people].map(p=>(
          <button key={p} onClick={()=>setFilterPerson(p==="все"?"":p)}
            style={{padding:"3px 12px",borderRadius:16,border:"1px solid",cursor:"pointer",fontSize:11,
              borderColor:(!filterPerson&&p==="все")||(filterPerson===p)?"#3b82f6":"#334155",
              background:(!filterPerson&&p==="все")||(filterPerson===p)?"rgba(59,130,246,0.2)":"transparent",
              color:(!filterPerson&&p==="все")||(filterPerson===p)?"#93c5fd":"#64748b"}}>
            {p}
          </button>
        ))}
        <span style={{color:"#263352",margin:"0 4px"}}>│</span>
        {["все проекты",...data.projects.map(p=>p.id)].map(pid=>{
          const proj=data.projects.find(p=>p.id===pid);
          const label=proj?proj.name:"все проекты";
          const active=pid==="все проекты"?!filterProject:filterProject===pid;
          return (
            <button key={pid} onClick={()=>setFilterProject(pid==="все проекты"?"":pid)}
              style={{padding:"3px 12px",borderRadius:16,border:"1px solid",cursor:"pointer",fontSize:11,
                borderColor:active?(proj?.color||"#3b82f6"):"#334155",
                background:active?`${proj?.color||"#3b82f6"}22`:"transparent",
                color:active?(proj?.color||"#93c5fd"):"#64748b"}}>
              {label}
            </button>
          );
        })}
        <span style={{color:"#263352",margin:"0 4px"}}>│</span>
        {[["week","Неделя"],["month","Месяц"]].map(([v,l])=>(
          <button key={v} onClick={()=>setGroupBy(v)}
            style={{padding:"3px 10px",borderRadius:4,border:"1px solid",cursor:"pointer",fontSize:10,
              borderColor:groupBy===v?"#475569":"#263352",background:groupBy===v?"#334155":"transparent",
              color:groupBy===v?"#cbd5e1":"#475569"}}>{l}</button>
        ))}
        <Btn small variant="ghost" onClick={scrollToToday}>→ Сегодня</Btn>
      </div>

      <div ref={containerRef}>
        {groupBy==="day"?(
          <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(dayKeys.length,7)},1fr)`,gap:8}}>
            {dayKeys.map(dk=><DayCol key={dk} dayKey={dk} dayTasks={filtered.filter(t=>t._dayKey===dk)}/>)}
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            {Object.entries(groups).sort(([a],[b])=>a.localeCompare(b)).map(([gk,gTasks])=>{
              const sample=gTasks[0];
              const title=groupBy==="week"?`Неделя ${weekLabel(sample.day)}`:`${MONTHS[parseInt(gk.split("-")[1])-1]} ${gk.split("-")[0]}`;
              const dks=[...new Set(gTasks.map(t=>t._dayKey))]
                .filter(dk=>gTasks.some(t=>t._dayKey===dk&&peopleCols.includes(t.person)))
                .sort((a,b)=>daySort(a).localeCompare(daySort(b)));
              return (
                <div key={gk}>
                  <div style={{fontSize:13,fontWeight:700,color:"#93c5fd",marginBottom:8,
                    paddingBottom:6,borderBottom:"1px solid #1e293b",display:"flex",justifyContent:"space-between"}}>
                    <span>{title}</span>
                    <span style={{fontWeight:400,fontSize:11,color:"#475569"}}>{gTasks.length} смен</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(dks.length,7)},1fr)`,gap:6}}>
                    {dks.map(dk=><DayCol key={dk} dayKey={dk} dayTasks={gTasks.filter(t=>t._dayKey===dk)} compact/>)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {hovTask&&<TaskTooltip task={hovTask.task} rect={hovTask.rect} projects={data.projects}/>}
    </div>
  );
}


// ── ПО ЛЮДЯМ ─────────────────────────────────────────────────────────
function PeopleView({data,conflictIds,onPersonSelect,canEdit,onUpdate,onLog,canEditProjectById}){
  const {stageMap}=useContext(StagesCtx);
  const [weekOffset,setWeekOffset]=useState(0);
  const [roleFilter,setRoleFilter]=useState("");
  const [query,setQuery]=useState("");
  const [taskModal,setTaskModal]=useState(null);
  const [hovTask,setHovTask]=useState(null);
  const [peopleContextMenu,setPeopleContextMenu]=useState(null);
  const dragTaskRef=useRef(null);
  const dragAbsenceRef=useRef(null);
  const [selectedPeopleTasks,setSelectedPeopleTasks]=useState(new Set());
  const [selectedPeopleAbsences,setSelectedPeopleAbsences]=useState(new Set());
  const [selectedPeopleNames,setSelectedPeopleNames]=useState(new Set());
  const [showSelectedPeopleOnly,setShowSelectedPeopleOnly]=useState(false);
  const roleMap=useMemo(()=>Object.fromEntries((data.roles||[]).map(r=>[r.id,r])),[data.roles]);
  const canWriteProject=projectId=>!canEditProjectById||canEditProjectById(projectId);
  function roleRank(role,id){
    const text=String((role?.label||"")+" "+(id||role?.id||"")).toLowerCase();
    if(text.includes("\u043c\u043e\u043d\u0442\u0430\u0436")||text.includes("\u0440\u0435\u0434\u0430\u043a\u0442\u043e\u0440")) return 10;
    if(text.includes("\u0432\u044b\u043f\u0443\u0441\u043a\u0430")) return 20;
    if(text.includes("\u0441\u0438\u043d\u0445")) return 30;
    if(text.includes("\u0437\u0432\u0443\u043a")) return 40;
    if(text.includes("\u0446\u0432\u0435\u0442")||text.includes("\u043a\u043e\u043b\u043e\u0440\u0438\u0441\u0442")) return 50;
    if(text.includes("\u043c\u0435\u043d\u0435\u0434\u0436")) return 900;
    return 100;
  }
  function primaryRoleId(person){const roles=Array.isArray(person?.roles)?person.roles:[];if(!roles.length)return "";return [...roles].sort((a,b)=>roleRank(roleMap[b],b)-roleRank(roleMap[a],a)||String(roleMap[a]?.label||a).localeCompare(String(roleMap[b]?.label||b),"ru"))[0]||"";}
  const refMonday=useMemo(()=>{const d=new Date();const wd=d.getDay()||7;d.setDate(d.getDate()-wd+1+weekOffset*7);d.setHours(0,0,0,0);return d;},[weekOffset]);
  const days=useMemo(()=>Array.from({length:14},(_,i)=>{const d=new Date(refMonday);d.setDate(refMonday.getDate()+i);return formatDate(d);}),[refMonday]);
  const todayStr=formatDate(new Date());
  const weekTitle=weekLabel(days[0]);
  const tasks=useMemo(()=>enrichTasks(data.tasks||[]).filter(t=>!t.deleted&&!t.cancelled&&days.includes(t.day)),[data.tasks,days]);
  const visibleRoles=useMemo(()=>[...(data.roles||[])].sort((a,b)=>roleRank(a,a.id)-roleRank(b,b.id)||String(a.label||a.id).localeCompare(String(b.label||b.id),"ru")),[data.roles]);
  const peopleTaskTemplates=useMemo(()=>["монтаж","синхра","цветокор","сведение_звука","правки"].map(status=>GANTT_TEMPLATES.find(t=>t.status===status)||{status,label:stageMap[status]?.label||status}).filter(Boolean),[stageMap]);
  const people=useMemo(()=>{const merged=new Map();(data.people||[]).forEach(p=>{if(p.active===false||p.deleted)return;const name=String(p.name||"").trim();if(!name)return;const key=name.toLowerCase();const roles=Array.isArray(p.roles)?p.roles:[];if(!merged.has(key)){merged.set(key,{...p,name,roles:[...roles]});return;}const prev=merged.get(key);merged.set(key,{...prev,...(!prev.id&&p.id?{id:p.id}:{}),name:prev.name||name,roles:[...new Set([...(prev.roles||[]),...roles])]});});const q=query.trim().toLowerCase();return Array.from(merged.values()).filter(p=>!showSelectedPeopleOnly||selectedPeopleNames.has(p.name)).filter(p=>{const roles=Array.isArray(p.roles)?p.roles:[];if(roleFilter&&!roles.includes(roleFilter))return false;if(q&&!String(p.name||"").toLowerCase().includes(q))return false;return true;}).sort((a,b)=>{const ar=primaryRoleId(a);const br=primaryRoleId(b);return roleRank(roleMap[ar],ar)-roleRank(roleMap[br],br)||String(a.name||"").localeCompare(String(b.name||""),"ru");});},[data.people,roleFilter,query,roleMap,showSelectedPeopleOnly,selectedPeopleNames]);
  const groupedPeople=useMemo(()=>{const idx={};people.forEach(p=>{const rid=primaryRoleId(p)||"__none";const role=roleMap[rid]||{id:rid,label:"\u0411\u0435\u0437 \u0440\u043e\u043b\u0438",color:"#64748b",order:999};if(!idx[rid])idx[rid]={role,people:[]};idx[rid].people.push(p);});return Object.values(idx).sort((a,b)=>roleRank(a.role,a.role.id)-roleRank(b.role,b.role.id)||String(a.role.label).localeCompare(String(b.role.label),"ru"));},[people,roleMap]);
  const taskMap=useMemo(()=>{const m={};tasks.forEach(t=>{const k=(t.person||"")+"||"+t.day;if(!m[k])m[k]=[];m[k].push(t);});Object.values(m).forEach(list=>list.sort((a,b)=>(Number(a.from)||0)-(Number(b.from)||0)||projName(data.projects,a.project).localeCompare(projName(data.projects,b.project),"ru")));return m;},[tasks,data.projects]);
  const cellAbsences=(person,day)=>absencesForPersonDay(data.personAbsences||[],data.people||[],person.name,day);
  function daysBetweenIncl(start,end){const a=parseDate(start),b=parseDate(end);if(!a||!b)return[];const step=a<=b?1:-1;const out=[];let cur=formatDate(a);while(true){out.push(cur);if(cur===formatDate(b))break;cur=addDays(cur,step);}return out;}
  function personTasksOnDay(person,day){return taskMap[(person.name||person.personName||"")+"||"+day]||[];}
  function personHasTasksInRange(person,start,end){return daysBetweenIncl(start,end).some(d=>personTasksOnDay(person,d).length);}
  function personHasAbsenceInRange(person,start,end,ignoreId){return daysBetweenIncl(start,end).some(d=>cellAbsences(person,d).some(a=>String(a.id)!==String(ignoreId||"")));}
  function showAbsenceBlockedByTasks(type){alert(type==="dayoff"?"\u0427\u0442\u043e\u0431\u044b \u043f\u043e\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u0432\u044b\u0445\u043e\u0434\u043d\u043e\u0439, \u043d\u0435 \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u0441\u043c\u0435\u043d \u043d\u0430 \u044d\u0442\u043e\u0442 \u0434\u0435\u043d\u044c":"\u0427\u0442\u043e\u0431\u044b \u043f\u043e\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u043e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0435, \u043d\u0435 \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u0441\u043c\u0435\u043d \u043d\u0430 \u044d\u0442\u043e\u0442 \u0434\u0435\u043d\u044c");}
  function showAbsenceDuplicate(){alert("\u041d\u0430 \u044d\u0442\u043e\u0442 \u0434\u0435\u043d\u044c \u0443\u0436\u0435 \u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u043e \u043e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0435");}
  function shiftBlockedByAbsence(){alert("\u041d\u0430 \u044d\u0442\u043e\u0442 \u0434\u0435\u043d\u044c \u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u043e \u043e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0435");}
  function addPersonAbsence(person,day,type){if(!canEdit||!onUpdate||!person||!day)return;if(personHasTasksInRange(person,day,day)){showAbsenceBlockedByTasks(type);return;}if(personHasAbsenceInRange(person,day,day)){showAbsenceDuplicate();return;}const ts=Date.now();const item=normalizeAbsence({id:"abs_"+ts+"_"+Math.random().toString(36).slice(2,7),personId:person.id||null,personName:person.name,type,startDay:day,endDay:day,note:"",createdAt:new Date(ts).toISOString(),updatedAt:new Date(ts).toISOString(),_updatedAt:ts});onUpdate("personAbsences",[...(data.personAbsences||[]),item]);onLog?.("\u041e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0435: "+person.name+" / "+absenceTypeInfo(type).label+" / "+day);setPeopleContextMenu(null);}
  function dropPeopleTask(source,person,day,stretch,copy){if(!source||!person||!day||!onUpdate||!canWriteProject(source.project))return;const ts=Date.now();const stamp=t=>({...t,updatedAt:new Date(ts).toISOString(),_updatedAt:ts,updatedBy:""});let all=[...(data.tasks||[])];if(stretch){const start=parseDate(source.day),end=parseDate(day);if(!start||!end)return;const diff=Math.round((end-start)/(1000*60*60*24));if(diff===0){if(source.person===person.name)return;if(personHasAbsenceInRange(person,day,day)){shiftBlockedByAbsence();return;}const changed=stamp({...source,day,person:person.name});onUpdate("tasks",all.map(t=>String(t.id)===String(source.id)?changed:t));return;}const step=diff>=0?1:-1;const checkFrom=diff>0?addDays(source.day,1):day;const checkTo=diff>0?day:addDays(source.day,-1);if(personHasAbsenceInRange(person,checkFrom,checkTo)){shiftBlockedByAbsence();return;}const copies=[];for(let i=step;step>0?i<=diff:i>=diff;i+=step){copies.push(stamp({...source,id:"task_"+ts+"_"+Math.abs(i)+"_"+Math.random().toString(36).slice(2,5),day:addDays(source.day,i),person:person.name}));}if(copies.length)onUpdate("tasks",[...all,...copies]);return;}if(personHasAbsenceInRange(person,day,day)){shiftBlockedByAbsence();return;}if(copy){const nt=stamp({...source,id:"task_"+ts+"_"+Math.random().toString(36).slice(2,7),day,person:person.name});onUpdate("tasks",[...all,nt]);return;}const changed=stamp({...source,day,person:person.name});onUpdate("tasks",all.map(t=>String(t.id)===String(source.id)?changed:t));}
  function openTemplateTask(status,person,day){if(!canEdit||!onUpdate)return;if(personHasAbsenceInRange(person,day,day)){shiftBlockedByAbsence();return;}setTaskModal({person:person.name,day,status,from:10,to:19,_fixedPerson:true});}
  function openNewTask(person,day){openTemplateTask("",person,day);}
  function saveTask(task){if(!onUpdate||!canWriteProject(task.project))return;const taskPerson=(data.people||[]).find(p=>p.name===task.person)||{name:task.person};if(task.person&&task.day&&personHasAbsenceInRange(taskPerson,task.day,task.day)){shiftBlockedByAbsence();return;}if(task.id){const old=(data.tasks||[]).find(t=>String(t.id)===String(task.id));if(old&&!canWriteProject(old.project))return;}let all=[...(data.tasks||[])];let saved;if(task._cascadeAll){const clean={...task};delete clean._cascadeAll;delete clean._fixedPerson;all=task._cascadeAll.map(t=>String(t.id)===String(clean.id)?clean:t);saved=all.find(t=>String(t.id)===String(clean.id))||{...clean,id:genTaskId(data.tasks||[])};if(!all.some(t=>String(t.id)===String(saved.id)))all.push(saved);}else{const clean={...task};delete clean._fixedPerson;const exists=clean.id&&all.find(t=>String(t.id)===String(clean.id));saved=exists?clean:{...clean,id:genTaskId(data.tasks||[])};all=exists?all.map(t=>String(t.id)===String(saved.id)?saved:t):[...all,saved];}const ts=Date.now();saved={...saved,updatedAt:new Date(ts).toISOString(),_updatedAt:ts,updatedBy:""};all=all.map(t=>String(t.id)===String(saved.id)?saved:t);onUpdate("tasks",all);const stLabel=(data.stages||[]).find(st=>st.id===saved.status)?.label||saved.status||"";onLog?.("Смена: "+stLabel+" ? "+(saved.series||"")+" / "+(saved.person||"без исполнителя")+" ? "+saved.day);incrSave("task",saved);setTaskModal(null);}
  function deleteTask(id){const t=(data.tasks||[]).find(x=>String(x.id)===String(id));if(t&&!canWriteProject(t.project))return;const ts=Date.now();onUpdate?.("tasks",(data.tasks||[]).map(x=>String(x.id)===String(id)?{...x,deleted:true,_updatedAt:ts}:x));if(t)onLog?.("Удалена смена: "+(t.series||"")+" / "+(t.person||"")+" ? "+t.day);incrDelete("task",id);setTaskModal(null);}
  function deletePeopleTasks(ids){const allowed=(ids||[]).filter(id=>{const t=(data.tasks||[]).find(x=>String(x.id)===String(id));return t&&canWriteProject(t.project);});if(!allowed.length)return;const idSet=new Set(allowed.map(String));const ts=Date.now();const changed=[];const all=(data.tasks||[]).map(t=>{if(!idSet.has(String(t.id)))return t;const nt={...t,deleted:true,updatedAt:new Date(ts).toISOString(),_updatedAt:ts};changed.push(nt);return nt;});onUpdate?.("tasks",all);changed.forEach(t=>incrDelete("task",t.id));setSelectedPeopleTasks(new Set());setPeopleContextMenu(null);}
  function deletePersonAbsence(id){if(!id||!onUpdate)return;const ts=Date.now();onUpdate("personAbsences",(data.personAbsences||[]).map(a=>String(a.id)===String(id)?{...a,deleted:true,updatedAt:new Date(ts).toISOString(),_updatedAt:ts}:a));setPeopleContextMenu(null);}
  function deletePeopleAbsences(ids){if(!ids?.length&&!ids?.size)return;const idSet=new Set([...ids].map(String));const ts=Date.now();onUpdate?.("personAbsences",(data.personAbsences||[]).map(a=>idSet.has(String(a.id))?{...a,deleted:true,updatedAt:new Date(ts).toISOString(),_updatedAt:ts}:a));setSelectedPeopleAbsences(new Set());setPeopleContextMenu(null);}
  function dropPersonAbsence(source,person,day,stretch,copy){if(!source||!person||!day||!onUpdate)return;const ts=Date.now();const all=[...(data.personAbsences||[])];const start=source.startDay||source.day;const end=source.endDay||start;const len=Math.max(0,Math.round((parseDate(end)-parseDate(start))/(1000*60*60*24)));const stamp=a=>normalizeAbsence({...a,updatedAt:new Date(ts).toISOString(),_updatedAt:ts});const blocked=(from,to,ignoreId)=>{if(personHasTasksInRange(person,from,to)){showAbsenceBlockedByTasks(source.type);return true;}if(personHasAbsenceInRange(person,from,to,ignoreId)){showAbsenceDuplicate();return true;}return false;};if(stretch){const from=daySort(start)<=daySort(day)?start:day;const to=daySort(start)<=daySort(day)?day:start;if(blocked(from,to,source.id))return;const updated=stamp({...source,personId:person.id||"",personName:person.name,startDay:from,endDay:to});onUpdate("personAbsences",all.map(a=>String(a.id)===String(source.id)?updated:a));return;}const targetEnd=addDays(day,len);if(blocked(day,targetEnd,copy?null:source.id))return;if(copy){const item=stamp({...source,id:"abs_"+ts+"_"+Math.random().toString(36).slice(2,7),personId:person.id||"",personName:person.name,startDay:day,endDay:targetEnd,deleted:false});onUpdate("personAbsences",[...all,item]);return;}const moved=stamp({...source,personId:person.id||"",personName:person.name,startDay:day,endDay:targetEnd});onUpdate("personAbsences",all.map(a=>String(a.id)===String(source.id)?moved:a));}
  useEffect(()=>{const h=e=>{if(e.key==="Escape"){setQuery("");setRoleFilter("");setTaskModal(null);setPeopleContextMenu(null);setSelectedPeopleTasks(new Set());setSelectedPeopleAbsences(new Set());setSelectedPeopleNames(new Set());setShowSelectedPeopleOnly(false);}if((e.key==="Delete"||e.key==="Backspace")&&(selectedPeopleTasks.size||selectedPeopleAbsences.size)){e.preventDefault();if(selectedPeopleTasks.size)deletePeopleTasks([...selectedPeopleTasks]);else deletePeopleAbsences([...selectedPeopleAbsences]);}};const close=()=>setPeopleContextMenu(null);document.addEventListener("keydown",h);window.addEventListener("click",close);window.addEventListener("scroll",close,true);return()=>{document.removeEventListener("keydown",h);window.removeEventListener("click",close);window.removeEventListener("scroll",close,true);};},[selectedPeopleTasks,selectedPeopleAbsences]);
  const freeCount=people.reduce((sum,p)=>sum+days.filter(d=>!(taskMap[p.name+"||"+d]||[]).length&&!cellAbsences(p,d).length).length,0);
  const absenceCount=people.reduce((sum,p)=>sum+days.filter(d=>cellAbsences(p,d).length).length,0);
  return <div>
    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:12}}><Btn small variant="ghost" onClick={()=>setWeekOffset(w=>w-1)}>← Неделя</Btn><Btn small variant="ghost" onClick={()=>setWeekOffset(0)}>Сегодня</Btn><Btn small variant="ghost" onClick={()=>setWeekOffset(w=>w+1)}>Неделя →</Btn><div style={{fontSize:14,fontWeight:900,color:"#93c5fd",marginLeft:6}}>Неделя {weekTitle}</div><div style={{fontSize:10,color:"#64748b",marginLeft:"auto"}}>{tasks.length} смен ? {freeCount} свободных ? {absenceCount} отсутствий</div></div>
    <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}><Inp value={query} onChange={setQuery} placeholder="Поиск человека..." style={{maxWidth:220}}/><Btn small variant={showSelectedPeopleOnly?"primary":"ghost"} disabled={!selectedPeopleNames.size} onClick={()=>setShowSelectedPeopleOnly(v=>!v)}>{showSelectedPeopleOnly?"\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u0432\u0441\u0435\u0445":"\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u0432\u044b\u0434\u0435\u043b\u0435\u043d\u043d\u044b\u0445"}</Btn><button onClick={()=>setRoleFilter("")} style={{padding:"4px 10px",borderRadius:999,border:"1px solid "+(!roleFilter?"#3b82f6":"#334155"),background:!roleFilter?"rgba(59,130,246,.2)":"transparent",color:!roleFilter?"#bfdbfe":"#64748b",fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:800}}>Все роли</button>{visibleRoles.map(r=><button key={r.id} onClick={()=>setRoleFilter(roleFilter===r.id?"":r.id)} style={{padding:"4px 10px",borderRadius:999,border:"1px solid "+(roleFilter===r.id?(r.color||"#3b82f6"):"#334155"),background:roleFilter===r.id?((r.color||"#3b82f6")+"22"):"transparent",color:roleFilter===r.id?(r.color||"#93c5fd"):"#64748b",fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:800}}>{r.label||r.id}</button>)}{canEdit&&<div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",justifyContent:"flex-end"}}><span style={{fontSize:10,color:"#64748b",fontWeight:900}}>{"\u0417\u0430\u0433\u043e\u0442\u043e\u0432\u043a\u0438"}</span>{ABSENCE_TYPES.map(t=><button key={t.id} type="button" draggable onDragStart={e=>{dragAbsenceRef.current={templateType:t.id};e.dataTransfer.effectAllowed="copy";e.dataTransfer.setData("text/plain",t.id);}} onDragEnd={()=>{dragAbsenceRef.current=null;}} style={{height:22,padding:"2px 8px",borderRadius:8,border:"1px solid "+t.color+"99",borderLeft:"4px solid "+t.color,background:hexToRgba(t.color,.14),color:t.color,fontSize:10,cursor:"grab",fontFamily:"inherit",fontWeight:900,lineHeight:1}}>{t.label}</button>)}{peopleTaskTemplates.map(t=>{const st=stageMap[t.status]||{};const color=st.color||"#60a5fa";return <button key={t.status} type="button" draggable onDragStart={e=>{dragTaskRef.current={templateStatus:t.status};e.dataTransfer.effectAllowed="copy";e.dataTransfer.setData("text/plain",t.status);}} onDragEnd={()=>{dragTaskRef.current=null;}} style={{height:22,padding:"2px 8px",borderRadius:8,border:"1px solid "+color+"99",borderLeft:"4px solid "+color,background:hexToRgba(color,.14),color,fontSize:10,cursor:"grab",fontFamily:"inherit",fontWeight:900,lineHeight:1}}>{t.label}</button>;})}</div>}</div>
    <div style={{overflowX:"auto",border:"1px solid rgba(148,163,184,.18)",borderRadius:14,background:"rgba(15,23,42,.36)"}}><div style={{display:"grid",gridTemplateColumns:"220px repeat(14,minmax(92px,1fr))",minWidth:1510}}><div style={{position:"sticky",left:0,zIndex:3,background:"#111c2e",borderBottom:"1px solid #334155",padding:"10px 12px",fontSize:10,color:"#94a3b8",fontWeight:900}}>СОТРУДНИК</div>{days.map(d=>{const pd=parseDate(d);const isToday=d===todayStr;return <div key={d} style={{borderBottom:"1px solid #334155",borderLeft:"1px solid rgba(148,163,184,.14)",padding:"8px 10px",background:isToday?"rgba(59,130,246,.18)":"#111c2e"}}><div style={{fontSize:10,color:isToday?"#7dd3fc":"#94a3b8",fontWeight:900}}>{WDAYS[pd.getDay()]} {String(pd.getDate()).padStart(2,"0")}.{String(pd.getMonth()+1).padStart(2,"0")}</div></div>;})}{groupedPeople.map(group=><React.Fragment key={group.role.id}><div style={{gridColumn:"1 / -1",background:"rgba(30,41,59,.78)",borderTop:"1px solid rgba(148,163,184,.16)",borderBottom:"1px solid rgba(148,163,184,.12)",padding:"7px 12px",display:"flex",alignItems:"center",gap:8}}><span style={{width:8,height:8,borderRadius:999,background:group.role.color||"#64748b"}}/><span style={{fontSize:10,color:group.role.color||"#94a3b8",fontWeight:900,letterSpacing:.5}}>{group.role.label}</span><span style={{fontSize:8,color:"#64748b"}}>{group.people.length}</span></div>{group.people.map(person=><React.Fragment key={person.id||person.name}><div onClick={e=>{if(e.shiftKey){e.preventDefault();e.stopPropagation();setSelectedPeopleNames(prev=>{const n=new Set(prev);n.has(person.name)?n.delete(person.name):n.add(person.name);return n;});}}} onDoubleClick={()=>onPersonSelect?.(person.id||person.name)} style={{position:"sticky",left:0,zIndex:2,background:selectedPeopleNames.has(person.name)?"rgba(59,130,246,.22)":"#0f172a",borderTop:"1px solid rgba(148,163,184,.12)",padding:"10px 12px",display:"flex",alignItems:"center",gap:9,cursor:onPersonSelect?"pointer":"default"}}><div style={{width:26,height:26,borderRadius:999,display:"flex",alignItems:"center",justifyContent:"center",background:(group.role.color||"#64748b")+"22",border:"1px solid "+(group.role.color||"#64748b")+"66",color:group.role.color||"#94a3b8",fontWeight:900,fontSize:12}}>{String(person.name||"?")[0]}</div><div style={{minWidth:0}}><div style={{fontSize:12,color:"#e2e8f0",fontWeight:900,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{person.name}</div><div style={{fontSize:8,color:"#64748b",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{(Array.isArray(person.roles)?person.roles:[]).map(r=>roleMap[r]?.label||r).join(", ")||"без роли"}</div></div></div>{days.map(day=>{const list=taskMap[person.name+"||"+day]||[];const abs=cellAbsences(person,day);const free=!list.length&&!abs.length;const primaryAbs=abs[0]?absenceTypeInfo(abs[0].type):null;const past=daySort(day)<daySort(todayStr);const bg=free?(past?"rgba(250,204,21,.018)":"rgba(250,204,21,.045)"):primaryAbs?(primaryAbs.color+"14"):"rgba(15,23,42,.56)";const border=free?(past?"rgba(250,204,21,.08)":"rgba(250,204,21,.18)"):primaryAbs?(primaryAbs.color+"66"):"rgba(148,163,184,.12)";const tip=[...abs.map(a=>absenceTypeInfo(a.type).label+(a.note?": "+a.note:"")),...list.map(t=>{const p=data.projects.find(p=>p.id===t.project);const st=stageMap[t.status]||{};return ((p?.name||p?.abbr||t.project||"")+(t.series?" / "+t.series:"")+(t.status?" / "+(st.label||t.status):"")+" "+(t.from||"")+"-"+(t.to||"")).trim();})].join("\n");return <div key={person.name+day} title={tip||"Свободен"} onDoubleClick={()=>openNewTask(person,day)} onContextMenu={e=>{e.preventDefault();e.stopPropagation();setPeopleContextMenu({x:Math.min(e.clientX,Math.max(8,window.innerWidth-230)),y:Math.min(e.clientY,Math.max(8,window.innerHeight-168)),person,day});}} onDragOver={e=>{if(dragTaskRef.current||dragAbsenceRef.current)e.preventDefault();}} onDrop={e=>{e.preventDefault();e.stopPropagation();const d=dragTaskRef.current;const a=dragAbsenceRef.current;dragTaskRef.current=null;dragAbsenceRef.current=null;if(d){if(d.templateStatus)openTemplateTask(d.templateStatus,person,day);else dropPeopleTask(d.task,person,day,e.shiftKey||d.shift,e.altKey||d.alt);}if(a){if(a.templateType)addPersonAbsence(person,day,a.templateType);else dropPersonAbsence(a.absence,person,day,e.shiftKey||a.shift,e.altKey||a.alt);}}} style={{minHeight:54,borderTop:"1px solid rgba(148,163,184,.12)",borderLeft:"1px solid rgba(148,163,184,.08)",background:bg,boxShadow:"inset 0 0 0 1px "+border,padding:3,cursor:canEdit?"cell":"default"}}>{abs.map(a=>{const ai=absenceTypeInfo(a.type);const isAbsSel=selectedPeopleAbsences.has(a.id);return <div key={a.id} draggable={canEdit} onClick={e=>{e.stopPropagation();setSelectedPeopleAbsences(prev=>{const n=new Set(prev);if(e.shiftKey||e.ctrlKey||e.metaKey){n.has(a.id)?n.delete(a.id):n.add(a.id);}else{n.clear();n.add(a.id);}return n;});}} onDragStart={e=>{e.stopPropagation();dragAbsenceRef.current={absence:a,alt:e.altKey,shift:e.shiftKey};e.dataTransfer.effectAllowed=(e.altKey||e.shiftKey)?"copy":"move";e.dataTransfer.setData("text/plain",String(a.id));}} onDragEnd={()=>{dragAbsenceRef.current=null;}} onContextMenu={e=>{e.preventDefault();e.stopPropagation();setPeopleContextMenu({x:Math.min(e.clientX,Math.max(8,window.innerWidth-230)),y:Math.min(e.clientY,Math.max(8,window.innerHeight-168)),person,day,absence:a});}} style={{minHeight:list.length?22:46,height:list.length?22:"calc(100% - 2px)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:ai.color,border:"1px solid "+(isAbsSel?ai.color:ai.color+"88"),background:isAbsSel?("linear-gradient(135deg,"+hexToRgba(ai.color,.38)+","+hexToRgba(ai.color,.16)+")"):("linear-gradient(135deg,"+ai.color+"24,"+ai.color+"0f)"),boxShadow:isAbsSel?("0 0 0 2px "+hexToRgba(ai.color,.28)):undefined,borderRadius:9,padding:"2px 6px",marginBottom:2,fontWeight:900,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",cursor:canEdit?"grab":"default"}}>{ai.label}</div>;})}{list.map(t=>{const proj=data.projects.find(p=>p.id===t.project);const st=stageMap[t.status]||{};const c=st.color||proj?.color||"#64748b";const hasC=conflictIds.has(t.id);const isSel=selectedPeopleTasks.has(t.id);return <button key={t.id} draggable={canEdit&&canWriteProject(t.project)} onDragStart={e=>{dragTaskRef.current={task:t,alt:e.altKey,shift:e.shiftKey};e.dataTransfer.effectAllowed=(e.altKey||e.shiftKey)?"copy":"move";e.dataTransfer.setData("text/plain",String(t.id));}} onDragEnd={()=>{dragTaskRef.current=null;}} onMouseEnter={e=>setHovTask({task:t,rect:e.currentTarget.getBoundingClientRect()})} onMouseLeave={()=>setHovTask(null)} onClick={e=>{e.stopPropagation();if(e.shiftKey||e.ctrlKey||e.metaKey){setSelectedPeopleTasks(prev=>{const n=new Set(prev);n.has(t.id)?n.delete(t.id):n.add(t.id);return n;});return;}setTaskModal(t);}} onContextMenu={e=>{e.preventDefault();e.stopPropagation();const ids=selectedPeopleTasks.has(t.id)&&selectedPeopleTasks.size>1?[...selectedPeopleTasks]:[t.id];setSelectedPeopleTasks(new Set(ids));setPeopleContextMenu({x:Math.min(e.clientX,Math.max(8,window.innerWidth-230)),y:Math.min(e.clientY,Math.max(8,window.innerHeight-168)),person,day,task:t,ids});}} style={{display:"block",width:"100%",textAlign:"left",background:hasC?"rgba(239,68,68,.14)":isSel?"rgba(59,130,246,.26)":"rgba(30,41,59,.86)",border:"1px solid "+(hasC?"rgba(239,68,68,.55)":isSel?"rgba(96,165,250,.9)":c+"66"),borderLeft:"3px solid "+c,borderRadius:8,padding:"5px 6px",marginBottom:3,cursor:"grab",fontFamily:"inherit"}}><div style={{display:"flex",gap:4,alignItems:"center",minWidth:0}}><span style={{fontSize:8,color:c,fontWeight:900,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{proj?.abbr||proj?.name||t.project||"Проект"}</span><span style={{fontSize:8,color:"#94a3b8",marginLeft:"auto",whiteSpace:"nowrap"}}>{t.from}-{t.to}</span></div><div style={{fontSize:8,color:"#e2e8f0",fontWeight:800,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.series||"-"} ? {st.label||t.status}</div></button>;})}{free&&<div style={{fontSize:8,color:past?"#8a7a28":"#c6a91a",fontWeight:800,opacity:past?.42:.68}}>Свободен</div>}</div>;})}</React.Fragment>)}</React.Fragment>)}</div></div>
    {peopleContextMenu&&(()=>{const menuItem={display:"block",width:"100%",textAlign:"left",background:"transparent",border:"none",color:"#dbeafe",padding:"8px 10px",fontSize:12,fontWeight:800,cursor:"pointer",borderRadius:9,fontFamily:"inherit"};const danger={...menuItem,color:"#fecaca"};const types=[{id:"dayoff",label:"\u0412\u044b\u0445\u043e\u0434\u043d\u043e\u0439"},{id:"vacation",label:"\u041e\u0442\u043f\u0443\u0441\u043a"},{id:"sick",label:"\u0411\u043e\u043b\u044c\u043d\u0438\u0447\u043d\u044b\u0439"}];return <div onClick={e=>e.stopPropagation()} style={{position:"fixed",left:peopleContextMenu.x,top:peopleContextMenu.y,zIndex:2147483200,width:220,background:"linear-gradient(180deg,rgba(30,41,59,.98),rgba(15,23,42,.98))",border:"1px solid rgba(148,163,184,.28)",borderRadius:14,boxShadow:"0 18px 50px rgba(0,0,0,.55)",padding:6}}>{peopleContextMenu.task&&<><div style={{fontSize:11,color:"#94a3b8",padding:"6px 10px 8px",borderBottom:"1px solid rgba(148,163,184,.16)",marginBottom:4}}>{peopleContextMenu.ids?.length===1?"1 \u0441\u043c\u0435\u043d\u0430":(peopleContextMenu.ids?.length||1)+" \u0441\u043c\u0435\u043d"}</div><button type="button" style={menuItem} onClick={()=>{setTaskModal(peopleContextMenu.task);setPeopleContextMenu(null);}}>{"\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0441\u043c\u0435\u043d\u0443"}</button><button type="button" style={danger} onClick={()=>deletePeopleTasks(peopleContextMenu.ids||[peopleContextMenu.task.id])}>{"\u0423\u0434\u0430\u043b\u0438\u0442\u044c"}</button></>}{peopleContextMenu.absence&&<><div style={{fontSize:11,color:"#94a3b8",padding:"6px 10px 8px",borderBottom:"1px solid rgba(148,163,184,.16)",marginBottom:4}}>{absenceTypeInfo(peopleContextMenu.absence.type).label}</div><button type="button" style={danger} onClick={()=>deletePersonAbsence(peopleContextMenu.absence.id)}>{"\u0423\u0434\u0430\u043b\u0438\u0442\u044c"}</button></>}{!peopleContextMenu.task&&!peopleContextMenu.absence&&<><div style={{fontSize:11,color:"#94a3b8",padding:"6px 10px 8px",borderBottom:"1px solid rgba(148,163,184,.16)",marginBottom:4}}>{"\u041d\u0430\u0437\u043d\u0430\u0447\u0438\u0442\u044c \u043e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0435"}</div>{types.map(a=><button key={a.id} type="button" style={menuItem} onClick={()=>addPersonAbsence(peopleContextMenu.person,peopleContextMenu.day,a.id)}>{a.label}</button>)}</>}</div>;})()}
    {people.length===0&&<div style={{fontSize:13,color:"#64748b",padding:"18px 0"}}>Люди не найдены</div>}
    {hovTask&&<TaskTooltip task={hovTask.task} rect={hovTask.rect} projects={data.projects}/>} {taskModal&&<TaskModal task={taskModal} data={data} onSave={saveTask} onDelete={deleteTask} onClose={()=>setTaskModal(null)} canEdit={canEdit&&(!taskModal.project||canWriteProject(taskModal.project))} canEditOldTasks canEditProjectById={canEditProjectById}/> }
  </div>;
}

function PeopleViewLegacy({data,conflictIds,onPersonSelect,canEdit}){
  const [selPeople,setSelPeople]=useState([]);
  const [filterProject,setFilterProject]=useState("");
  const [groupBy,setGroupBy]=useState("day");
  const [hovTask,setHovTask]=useState(null);
  const tasks=useMemo(()=>enrichTasks(data.tasks),[data.tasks]);
  const people=useMemo(()=>[...new Set(tasks.map(t=>t.person).filter(Boolean))].filter(p=>data.people.some(dp=>dp.name===p)).sort(),[tasks,data.people]);
  const containerRef=useRef(null);

  useEffect(()=>{
    const h=(e)=>{if(e.key==="Escape") setSelPeople([]);};
    document.addEventListener("keydown",h);
    return ()=>document.removeEventListener("keydown",h);
  },[]);
  useEffect(()=>{const t=setTimeout(scrollToToday,150);return()=>clearTimeout(t);},[]);

  function togglePerson(name){
    setSelPeople(prev=>prev.includes(name)?prev.filter(p=>p!==name):[...prev,name]);
  }

  const baseTasks=useMemo(()=>{
    let r=tasks;
    if(filterProject) r=r.filter(t=>t.project===filterProject);
    return r;
  },[tasks,filterProject]);

  const showPeople=selPeople.length?selPeople:people;

  function scrollToToday(){
    if(!containerRef.current) return;
    const today=formatDate(new Date());
    const el=containerRef.current.querySelector(`[data-day="${today}"]`);
    if(el) el.scrollIntoView({behavior:"smooth",inline:"center",block:"nearest"});
  }

  return (
    <div>
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
        <button onClick={()=>setSelPeople([])}
          style={{padding:"3px 12px",borderRadius:16,border:"1px solid",cursor:"pointer",fontSize:11,
            borderColor:selPeople.length===0?"#3b82f6":"#334155",
            background:selPeople.length===0?"rgba(59,130,246,0.2)":"transparent",
            color:selPeople.length===0?"#93c5fd":"#64748b"}}>
          все
        </button>
        {people.map(p=>{
          const active=selPeople.includes(p);
          const hasConflict=tasks.some(t=>t.person===p&&conflictIds.has(t.id));
          return (
            <button key={p} onClick={()=>togglePerson(p)}
              style={{padding:"3px 12px",borderRadius:16,border:"1px solid",cursor:"pointer",fontSize:11,
                borderColor:active?"#3b82f6":"#334155",
                background:active?"rgba(59,130,246,0.2)":"transparent",
                color:active?"#93c5fd":"#64748b"}}>
              {p}{hasConflict&&<span style={{width:5,height:5,borderRadius:"50%",background:"#ef4444",display:"inline-block",marginLeft:4}}/>}
            </button>
          );
        })}
        <span style={{color:"#263352",margin:"0 4px"}}>│</span>
        {[["day","Дни"],["week","Нед"],["month","Мес"]].map(([v,l])=>(
          <button key={v} onClick={()=>setGroupBy(v)}
            style={{padding:"3px 10px",borderRadius:4,border:"1px solid",cursor:"pointer",fontSize:10,
              borderColor:groupBy===v?"#475569":"#263352",background:groupBy===v?"#334155":"transparent",
              color:groupBy===v?"#cbd5e1":"#475569"}}>{l}</button>
        ))}
        <Btn small variant="ghost" onClick={scrollToToday}>→ Сегодня</Btn>
        {selPeople.length>0&&<span style={{fontSize:11,color:"#475569"}}>ESC — снять выделение</span>}
      </div>

      <div ref={containerRef} style={{display:"flex",flexDirection:"column",gap:20}}>
        {showPeople.map(person=>{
          const pTasks=baseTasks.filter(t=>t.person===person);
          if(!pTasks.length) return null;
          const cDays=[...new Set(pTasks.filter(t=>conflictIds.has(t.id)).map(t=>t._dayKey))];
          const groups={};
          pTasks.forEach(t=>{
            const k=groupBy==="week"?t._weekKey:groupBy==="month"?t._monthKey:t._dayKey;
            if(!groups[k]) groups[k]=[];
            groups[k].push(t);
          });
          const pInfo=data.people.find(p=>p.name===person);
          return (
            <div key={person}>
              <div
                onDoubleClick={()=>onPersonSelect&&onPersonSelect(pInfo?.id||person)}
                style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,
                  cursor:onPersonSelect?"pointer":"default"}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:"#1e293b",
                  border:"2px solid #3b82f6",display:"flex",alignItems:"center",
                  justifyContent:"center",fontSize:13,fontWeight:700,color:"#3b82f6"}}>
                  {person[0]}
                </div>
                <span style={{fontSize:15,fontWeight:700}}>{person}</span>
                {onPersonSelect&&<span style={{fontSize:10,color:"#334155",marginLeft:2}}>2× клик → профиль</span>}
                {cDays.length>0&&(
                  <span style={{background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.4)",
                    borderRadius:12,padding:"2px 10px",fontSize:11,color:"#f87171"}}>
                    ⚡ конфликты: {cDays.map(d=>dayLabel(d)).join(", ")}
                  </span>
                )}
              </div>
              <div style={{display:"grid",
                gridTemplateColumns:`repeat(${Math.min(Object.keys(groups).length,7)},1fr)`,gap:6}}>
                {Object.entries(groups).sort(([a],[b])=>daySort(a).localeCompare(daySort(b))).map(([gk,gtasks])=>{
                  const hasC=gtasks.some(t=>conflictIds.has(t.id));
                  const label=groupBy==="day"?dayLabel(gk):groupBy==="week"?`Нед ${weekLabel(gtasks[0].day)}`:`${MONTHS[parseInt(gk.split("-")[1])-1]}`;
                  return (
                    <div key={gk} data-day={groupBy==="day"?gk:undefined}
                      style={{background:hasC?"rgba(239,68,68,0.05)":"#1e293b",
                        border:`1px solid ${hasC?"rgba(239,68,68,0.35)":"#334155"}`,
                        borderRadius:12,padding:"8px 10px",minHeight:60}}>
                      <div style={{fontSize:9,color:hasC?"#f87171":"#475569",marginBottom:5,letterSpacing:0.5}}>
                        {label}{hasC&&" ⚡"}
                      </div>
                      {gtasks.map(t=><TaskCard key={t.id} task={t} projects={data.projects} isConflict={conflictIds.has(t.id)} large onHover={(t,r)=>setHovTask(t?{task:t,rect:r}:null)}/>)}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {hovTask&&<TaskTooltip task={hovTask.task} rect={hovTask.rect} projects={data.projects}/>}
    </div>
  );
}

// ── КОНФЛИКТЫ ────────────────────────────────────────────────────────
function ConflictsView({details,data}){
  const today=new Date(); today.setHours(0,0,0,0);
  const todayStr=formatDate(today);
  const in7=new Date(today); in7.setDate(today.getDate()+7);
  const in7Str=formatDate(in7);

  const unfilledTasks=useMemo(()=>
    data.tasks.filter(t=>!t.person&&daySort(t.day)>=daySort(todayStr)&&daySort(t.day)<=daySort(in7Str)&&t.status!=="съёмки")
      .sort((a,b)=>daySort(a.day).localeCompare(daySort(b.day))||a.status.localeCompare(b.status)),
  [data.tasks,todayStr,in7Str]);

  const overlapDetails=details.filter(d=>d.type==="overlap"||!d.type);
  const roleDetails=details.filter(d=>d.type==="role");
  const absenceDetails=details.filter(d=>d.type==="absence");
  const passiveDetails=details.filter(d=>d.notify===false);

  const byDay={};
  overlapDetails.forEach(c=>{if(!byDay[c.dayStr]) byDay[c.dayStr]=[];byDay[c.dayStr].push(c);});

  const hasAnything=details.length>0||unfilledTasks.length>0;
  if(!hasAnything) return (
    <div style={{textAlign:"center",padding:"60px 20px",color:"#475569"}}>
      <div style={{fontSize:40,marginBottom:12}}>OK</div>
      <div style={{fontSize:16,fontWeight:700,color:"#94a3b8"}}>Всё в порядке</div>
      <div style={{fontSize:13,marginTop:6}}>Конфликтов нет, все смены на 7 дней заполнены</div>
    </div>
  );
  return (
    <div>
      {/* Незаполненные смены */}
      {unfilledTasks.length>0&&(
        <div style={{marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{background:"rgba(249,115,22,0.1)",border:"1px solid rgba(249,115,22,0.35)",
              borderRadius:12,padding:"8px 14px",display:"flex",alignItems:"center",gap:10,flex:1}}>
              <span style={{fontSize:18}}>!</span>
              <span style={{fontWeight:700,color:"#fb923c",fontSize:14}}>Без исполнителя: {unfilledTasks.length}</span>
              <span style={{color:"#64748b",fontSize:12}}>смены на 7 дней без назначенного сотрудника</span>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {unfilledTasks.map(t=>{
              const proj=data.projects.find(p=>p.id===t.project);
              const isToday=t.day===todayStr;
              const tomorrow=new Date(today);tomorrow.setDate(today.getDate()+1);
              const tomorrowStr=formatDate(tomorrow);
              const isUrgent=daySort(t.day)<=daySort(tomorrowStr);
              return (
                <div key={t.id} style={{background:"#1e293b",
                  border:`1px solid ${isUrgent?"rgba(249,115,22,0.4)":"#334155"}`,
                  borderLeft:`3px solid ${isUrgent?"#f97316":"#475569"}`,
                  borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:12}}>
                  <div style={{minWidth:70,fontSize:11,fontWeight:700,
                    color:isToday?"#f97316":isUrgent?"#fb923c":"#64748b"}}>
                    {isToday?"Сегодня":dayLabel(t.day)}
                  </div>
                  <ProjectMark project={proj} size={8}/>
                  <div style={{fontWeight:600,fontSize:12,color:"#e2e8f0"}}>
                    {proj?.name||t.project} · {t.series}
                  </div>
                  <StatusBadge s={t.status} small/>
                  <div style={{marginLeft:"auto",fontSize:11,color:"#475569"}}>{fmtHour(t.from)}–{fmtHour(t.to)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Отсутствия */}
      {absenceDetails.length>0&&(
        <div style={{marginBottom:24}}>
          <div style={{background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.32)",
            borderRadius:12,padding:"8px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <span style={{fontSize:18}}>!</span>
            <span style={{fontWeight:700,color:"#fca5a5",fontSize:14}}>Смена в отсутствие: {absenceDetails.length}</span>
            <span style={{color:"#64748b",fontSize:12}}>человек отмечен как выходной / отпуск / болезнь</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {absenceDetails.map(c=>{
              const proj=data.projects.find(p=>p.id===c.task.project);
              const ai=absenceTypeInfo(c.absence.type);
              return (
                <div key={c.key} style={{background:"#1e293b",border:"1px solid "+ai.color+"55",borderLeft:"3px solid "+ai.color,
                  borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                  <div style={{minWidth:70,fontSize:11,fontWeight:700,color:ai.color}}>{dayLabel(c.task.day)}</div>
                  <ProjectMark project={proj} size={8}/>
                  <div style={{fontWeight:600,fontSize:12,color:"#e2e8f0"}}>{proj?.name||c.task.project} · {c.task.series}</div>
                  <StatusBadge s={c.task.status} small/>
                  <div style={{fontSize:12,color:"#f8fafc",fontWeight:700}}>{c.person}</div>
                  <span style={{fontSize:11,color:ai.color,border:"1px solid "+ai.color+"66",background:ai.color+"18",borderRadius:999,padding:"2px 8px",fontWeight:800}}>{ai.label}</span>
                  <div style={{fontSize:11,color:"#64748b",marginLeft:"auto"}}>{c.absence.startDay}{c.absence.endDay&&c.absence.endDay!==c.absence.startDay?" - "+c.absence.endDay:""}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Несоответствие ролей */}
      {roleDetails.length>0&&(
        <div style={{marginBottom:24}}>
          <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",
            borderRadius:12,padding:"8px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <span style={{fontSize:18}}>🚫</span>
            <span style={{fontWeight:700,color:"#f87171",fontSize:14}}>Несоответствие ролей: {roleDetails.length}</span>
            <span style={{color:"#64748b",fontSize:12}}>назначен специалист без нужной роли</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {roleDetails.map(c=>{
              const proj=data.projects.find(p=>p.id===c.task.project);
              return (
                <div key={c.key} style={{background:"#1e293b",
                  border:"1px solid rgba(239,68,68,0.3)",borderLeft:"3px solid #ef4444",
                  borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                  <div style={{minWidth:70,fontSize:11,fontWeight:700,color:"#64748b"}}>{dayLabel(c.task.day)}</div>
                  <ProjectMark project={proj} size={8}/>
                  <div style={{fontWeight:600,fontSize:12,color:"#e2e8f0"}}>{proj?.name||c.task.project} · {c.task.series}</div>
                  <StatusBadge s={c.task.status} small/>
                  <div style={{fontSize:12,color:"#f87171",fontWeight:600}}>{c.person}</div>
                  <div style={{fontSize:11,color:"#475569",marginLeft:"auto"}}>
                    нужно: <span style={{color:"#94a3b8"}}>{c.requiredRoles.join(", ")}</span>
                    {" · "}есть: <span style={{color:"#94a3b8"}}>{c.personRoles.join(", ")||"—"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Пересечения смен */}
      {overlapDetails.length>0&&(
      <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",
          borderRadius:12,padding:"8px 14px",display:"flex",alignItems:"center",gap:10,flex:1}}>
          <span style={{fontSize:18}}>⚡</span>
          <span style={{fontWeight:700,color:"#f87171",fontSize:14}}>Пересечений: {overlapDetails.length}</span>
          <span style={{color:"#64748b",fontSize:12}}>один человек — несколько задач в пересекающееся время</span>
        </div>
      </div>
      {Object.entries(byDay).sort(([a],[b])=>daySort(a).localeCompare(daySort(b))).map(([day,pairs])=>(
        <div key={day} style={{marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <span style={{fontSize:12,fontWeight:700,color:"#f87171"}}>{dayLabel(day)}</span>
            <div style={{flex:1,height:1,background:"rgba(239,68,68,0.2)"}}/>
          </div>
          {pairs.map((p,i)=>{
            const colorA=projColor(data.projects,p.taskA.project);
            const colorB=projColor(data.projects,p.taskB.project);
            const minT=8,maxT=22,range=maxT-minT;
            const pct=v=>`${((v-minT)/range)*100}%`;
            return (
              <div key={i} style={{background:"#1e293b",border:"1px solid rgba(239,68,68,0.3)",
                borderRadius:12,padding:"12px 16px",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <div style={{width:26,height:26,borderRadius:10,background:"#0f172a",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontWeight:800,fontSize:12,color:"#ef4444",border:"1px solid rgba(239,68,68,0.4)"}}>
                    {p.person[0]}
                  </div>
                  <span style={{fontWeight:700,fontSize:13}}>{p.person}</span>
                  <span style={{color:"#64748b",fontSize:11}}>
                    — пересечение {p.overlapFrom}:00–{p.overlapTo}:00 ({p.overlapTo-p.overlapFrom}ч)
                  </span>
                </div>
                <div style={{position:"relative",height:46,marginBottom:10}}>
                  {[8,10,12,14,16,18,20,22].map(h=>(
                    <div key={h} style={{position:"absolute",left:pct(h),top:0,bottom:0,
                      borderLeft:"1px solid #1e293b",pointerEvents:"none"}}>
                      <span style={{position:"absolute",bottom:0,fontSize:8,color:"#334155",paddingLeft:2}}>{h}</span>
                    </div>
                  ))}
                  {[{t:p.taskA,c:colorA,top:4},{t:p.taskB,c:colorB,top:24}].map(({t,c,top})=>(
                    <div key={t.id} style={{position:"absolute",
                      left:pct(t.from||0),width:`${((t.to-t.from)/range)*100}%`,
                      top,height:16,background:c,borderRadius:3,opacity:0.9,
                      display:"flex",alignItems:"center",paddingLeft:4,overflow:"hidden"}}>
                      <span style={{fontSize:8,color:"#fff",fontWeight:700,whiteSpace:"nowrap"}}>
                        {projName(data.projects,t.project)} {t.series}
                      </span>
                    </div>
                  ))}
                  <div style={{position:"absolute",left:pct(p.overlapFrom),
                    width:`${((p.overlapTo-p.overlapFrom)/range)*100}%`,
                    top:0,height:46,background:"rgba(239,68,68,0.12)",
                    border:"1px solid rgba(239,68,68,0.35)",borderRadius:3}}/>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      </div>
      )}

      {passiveDetails.length>0&&(
        <div style={{marginTop:24}}>
          <div style={{background:"rgba(148,163,184,0.08)",border:"1px solid rgba(148,163,184,0.22)",
            borderRadius:12,padding:"8px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <span style={{fontSize:18}}>i</span>
            <span style={{fontWeight:700,color:"#94a3b8",fontSize:14}}>{"\u0411\u0435\u0437 \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u044f"}: {passiveDetails.length}</span>
            <span style={{color:"#64748b",fontSize:12}}>{"\u043d\u0435 \u0433\u043e\u0440\u0438\u0442 \u0432 \u0441\u0447\u0435\u0442\u0447\u0438\u043a\u0435, \u043d\u043e \u0442\u0440\u0435\u0431\u0443\u0435\u0442 \u0432\u043d\u0438\u043c\u0430\u043d\u0438\u044f"}</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {passiveDetails.map(c=>{
              if(c.type==="long-shift"){
                const t=c.task||{};
                const proj=(data.projects||[]).find(p=>p.id===t.project);
                return (
                  <div key={c.key} style={{background:"#1e293b",border:"1px solid rgba(248,113,113,0.22)",borderLeft:"3px solid #f87171",
                    borderRadius:10,padding:"9px 12px",display:"flex",alignItems:"center",gap:10,fontSize:12}}>
                    <span style={{color:"#94a3b8",minWidth:78}}>{dayLabel(t.day)}</span>
                    <ProjectMark project={proj} size={8}/>
                    <span style={{fontWeight:700,color:"#e2e8f0"}}>{proj?.name||t.project||"—"}</span>
                    <span style={{color:"#94a3b8"}}>{t.series||"—"}</span>
                    <StatusBadge s={t.status} small/>
                    <span style={{color:"#cbd5e1",marginLeft:"auto"}}>{t.person||"без исполнителя"}</span>
                    <span style={{color:"#fca5a5",fontWeight:700}}>длинная смена: {Number(c.hours||0).toFixed(1)} ч</span>
                  </div>
                );
              }
              if(c.type==="project-manager"){
                const proj=c.project;
                return (
                  <div key={c.key} style={{background:"#1e293b",border:"1px solid rgba(148,163,184,0.2)",borderLeft:"3px solid #64748b",
                    borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:12}}>
                    <ProjectMark project={proj} size={8}/>
                    <div style={{fontWeight:700,fontSize:12,color:"#e2e8f0"}}>{proj?.name||proj?.id}</div>
                    <div style={{fontSize:11,color:"#94a3b8"}}>{"\u043f\u0440\u043e\u0435\u043a\u0442 \u0431\u0435\u0437 \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u0430"}</div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── АНАЛИТИКА ────────────────────────────────────────────────────────
function computeStageTimings(tasks,series,stages,stageGroups){
  return stageGroups.map(g=>{
    const stageIds=(stages||[]).filter(s=>s.groupId===g.id).map(s=>s.id);
    if(!stageIds.length) return null;
    const durations=[];
    (series||[]).forEach(ser=>{
      const t=tasks.filter(x=>x.seriesId===ser.id&&stageIds.includes(x.status));
      if(!t.length) return;
      const days=[...new Set(t.map(x=>x.day))].sort((a,b)=>daySort(a).localeCompare(daySort(b)));
      const first=parseDate(days[0]), last=parseDate(days[days.length-1]);
      if(!first||!last) return;
      const span=Math.round((last-first)/(1000*60*60*24))+1;
      durations.push({seriesId:ser.id,projectId:ser.projectId,days:span});
    });
    if(!durations.length) return null;
    const vals=durations.map(d=>d.days);
    const avg=vals.reduce((s,v)=>s+v,0)/vals.length;
    const min=Math.min(...vals), max=Math.max(...vals);
    const sigma=Math.sqrt(vals.reduce((s,v)=>s+Math.pow(v-avg,2),0)/vals.length);
    const longest=durations.find(d=>d.days===max);
    return {group:g,avg,sigma,min,max,longest,count:durations.length};
  }).filter(Boolean);
}

function computeShifts(tasks, people){
  // Суммируем часы по person+day, потом применяем правило 6ч
  const byPersonDay={};
  tasks.filter(t=>!t.deleted&&!t.cancelled).forEach(t=>{
    if(!t.person) return;
    const key=t.person+"|"+t.day;
    byPersonDay[key]=(byPersonDay[key]||0)+(Number(t.to)||0)-(Number(t.from)||0);
  });
  // Теперь по каждому person считаем выходы и смены
  const byPerson={};
  Object.entries(byPersonDay).forEach(([key,hours])=>{
    const [person]=key.split("|");
    if(!byPerson[person]) byPerson[person]={person,exits:0,shifts:0};
    byPerson[person].exits+=1;
    byPerson[person].shifts+=shiftFactFromHours(hours);
  });
  return Object.values(byPerson).map(r=>{
    const p=people.find(p=>p.name===r.person);
    const role=(p&&p.roles&&p.roles[0])||"";
    return {...r,role};
  }).sort((a,b)=>a.role.localeCompare(b.role)||a.person.localeCompare(b.person));
}

function AnalyticsView({data,onPersonSelect}){
  const {sorted:stages,stageGroups,stageMap}=useContext(StagesCtx);
  const [atab,setAtab]=useState("shifts");
  const [filterProject,setFilterProject]=useState("");
  const [filterSeries,setFilterSeries]=useState("");
  const [filterPerson,setFilterPerson]=useState("");
  const [peopleSearch,setPeopleSearch]=useState("");
  const [dateFrom,setDateFrom]=useState("");
  const [dateTo,setDateTo]=useState("");

  const filteredTasks=useMemo(()=>{
    const noImpactIds=new Set(stages.filter(s=>s.noImpact).map(s=>s.id));
    let t=data.tasks.filter(x=>!x.deleted&&!x.cancelled&&!noImpactIds.has(x.status));
    if(filterProject) t=t.filter(x=>x.project===filterProject);
    if(filterSeries)  t=t.filter(x=>x.series===filterSeries);
    if(filterPerson)  t=t.filter(x=>x.person===filterPerson);
    if(dateFrom)      t=t.filter(x=>daySort(x.day)>=daySort(dateFrom));
    if(dateTo)        t=t.filter(x=>daySort(x.day)<=daySort(dateTo));
    return t;
  },[data.tasks,filterProject,filterSeries,filterPerson,dateFrom,dateTo,stages]);

  const seriesOptions=useMemo(()=>{
    const base=(data.series||[]);
    return filterProject?base.filter(s=>s.projectId===filterProject):base;
  },[data.series,filterProject]);

  const rows=useMemo(()=>computeShifts(filteredTasks,data.people),[filteredTasks,data.people]);

  const roleMap=useMemo(()=>{
    const m={};
    data.roles.forEach(r=>{m[r.id]={label:r.label,color:r.color};});
    return m;
  },[data.roles]);

  const roleTotals=useMemo(()=>{
    const m={};
    rows.forEach(r=>{
      if(!m[r.role]) m[r.role]={exits:0,shifts:0};
      m[r.role].exits+=r.exits;
      m[r.role].shifts+=r.shifts;
    });
    return Object.entries(m).sort((a,b)=>a[0].localeCompare(b[0]));
  },[rows]);

  const totalShifts=rows.reduce((s,r)=>s+r.shifts,0);
  const totalExits=rows.reduce((s,r)=>s+r.exits,0);

  const allPeople=useMemo(()=>[...new Set(data.tasks.filter(t=>t.person).map(t=>t.person))].sort(),[data.tasks]);

  const filteredSeries=useMemo(()=>{
    let s=data.series||[];
    if(filterProject) s=s.filter(x=>x.projectId===filterProject);
    return s;
  },[data.series,filterProject]);

  const stageTimings=useMemo(()=>computeStageTimings(filteredTasks,filteredSeries,stages,stageGroups),
    [filteredTasks,filteredSeries,stages,stageGroups]);

  const TH={padding:"8px 12px",textAlign:"left",fontSize:11,color:"#64748b",
    letterSpacing:1,borderBottom:"1px solid #334155",fontWeight:600,textTransform:"uppercase"};
  const TD={padding:"8px 12px",fontSize:13,borderBottom:"1px solid #1e293b"};

  const activePeople=useMemo(()=>{
    const noImpactIds=new Set(stages.filter(s=>s.noImpact).map(s=>s.id));
    return (data.people||[]).filter(p=>p.active!==false)
      .map(p=>{
        const pTasks=data.tasks.filter(t=>t.person===p.name&&!t.cancelled&&!noImpactIds.has(t.status));
        const hours=pTasks.reduce((s,t)=>(Number(t.to)||0)-(Number(t.from)||0)+s,0);
        const lastTask=pTasks.length?pTasks.reduce((a,b)=>daySort(a.day)>daySort(b.day)?a:b):null;
        return {...p,taskCount:pTasks.length,hours,lastDay:lastTask?.day||""};
      })
      .sort((a,b)=>a.name.localeCompare(b.name));
  },[data.people,data.tasks,stages]);

  useEffect(()=>{
    function reset(){
      if(peopleSearch){setPeopleSearch("");return;}
      if(filterPerson){setFilterPerson("");return;}
      if(filterProject||filterSeries||dateFrom||dateTo){setFilterProject("");setFilterSeries("");setDateFrom("");setDateTo("");}
    }
    window.addEventListener("ppt-escape",reset);
    return()=>window.removeEventListener("ppt-escape",reset);
  },[peopleSearch,filterPerson,filterProject,filterSeries,dateFrom,dateTo]);

  const visiblePeople=useMemo(()=>{
    const q=peopleSearch.trim().toLowerCase();
    if(!q) return activePeople;
    return activePeople.filter(p=>{
      const roleLabels=(p.roles||[]).map(rid=>(data.roles||[]).find(r=>r.id===rid)?.label||rid);
      const hay=[p.name,p.login,p.email,p.birthday,...(p.roles||[]),...roleLabels].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  },[activePeople,data.roles,peopleSearch]);

  return (
    <div>
      {/* Sub-tab bar */}
      <div style={{display:"flex",gap:2,marginBottom:20,background:"#0f172a",borderRadius:12,
        border:"1px solid #334155",overflow:"hidden",width:"fit-content"}}>
        {[{id:"shifts",label:"Аналитика смен"},{id:"people",label:`Люди (${activePeople.length})`}].map(t=>(
          <button key={t.id} onClick={()=>setAtab(t.id)}
            style={{padding:"6px 16px",border:"none",cursor:"pointer",fontSize:12,fontFamily:"inherit",
              background:atab===t.id?"#3b82f6":"transparent",
              color:atab===t.id?"#fff":"#64748b",fontWeight:atab===t.id?700:400}}>
            {t.label}
          </button>
        ))}
      </div>

      {atab==="people"&&(
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,maxWidth:360}}>
            <Inp value={peopleSearch} onChange={setPeopleSearch} placeholder="\u041f\u043e\u0438\u0441\u043a: \u0438\u043c\u044f, \u043b\u043e\u0433\u0438\u043d, \u0440\u043e\u043b\u044c"/>
            {peopleSearch&&<Btn small variant="ghost" onClick={()=>setPeopleSearch("")}>x</Btn>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
            {visiblePeople.map(p=>{
              const roleObjs=(p.roles||[]).map(rid=>(data.roles||[]).find(r=>r.id===rid)).filter(Boolean);
              const mainRole=roleObjs[0];
              return (
                <button key={p.id} onClick={()=>onPersonSelect&&onPersonSelect(p.id)}
                  style={{background:"#1e293b",border:`1px solid ${mainRole?.color||"#334155"}44`,
                    borderRadius:14,padding:"14px 16px",cursor:"pointer",textAlign:"left",
                    fontFamily:"inherit",display:"flex",flexDirection:"column",gap:6,
                    transition:"border-color 0.15s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:36,height:36,borderRadius:"50%",flexShrink:0,
                      background:`${mainRole?.color||"#3b82f6"}22`,
                      border:`2px solid ${mainRole?.color||"#3b82f6"}`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:15,fontWeight:800,color:mainRole?.color||"#3b82f6"}}>
                      {(p.name||"?")[0]}
                    </div>
                    <div>
                      <div style={{fontWeight:700,fontSize:13,color:"#e2e8f0"}}>{p.name}</div>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:2}}>
                        {roleObjs.map(r=>(
                          <span key={r.id} style={{fontSize:10,color:r.color,
                            border:`1px solid ${r.color}55`,borderRadius:3,padding:"0px 5px"}}>
                            {r.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:12,fontSize:11,color:"#475569",paddingTop:4,
                    borderTop:"1px solid #1e293b"}}>
                    <span>{p.taskCount} задач</span>
                    <span>{p.hours} ч</span>
                    {p.lastDay&&<span style={{marginLeft:"auto",color:"#334155"}}>{p.lastDay}</span>}
                  </div>
                </button>
              );
            })}
          </div>
          {visiblePeople.length===0&&<div style={{color:"#475569",fontSize:14,textAlign:"center",padding:"30px 0"}}>{"\u041d\u0438\u043a\u043e\u0433\u043e \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e"}</div>}
        </div>
      )}

      {atab==="shifts"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <span style={{fontSize:16,fontWeight:700}}>Аналитика смен</span>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <select value={filterProject} onChange={e=>{setFilterProject(e.target.value);setFilterSeries("");}}
            style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",color:filterProject?"#e2e8f0":"#64748b",
              borderRadius:10,padding:"5px 10px",fontSize:12}}>
            <option value="">Все проекты</option>
            {data.projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={filterSeries} onChange={e=>setFilterSeries(e.target.value)}
            style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",color:filterSeries?"#e2e8f0":"#64748b",
              borderRadius:10,padding:"5px 10px",fontSize:12}}>
            <option value="">Все серии</option>
            {seriesOptions.map(s=><option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
          <select value={filterPerson} onChange={e=>setFilterPerson(e.target.value)}
            style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",color:filterPerson?"#e2e8f0":"#64748b",
              borderRadius:10,padding:"5px 10px",fontSize:12}}>
            <option value="">Все люди</option>
            {allPeople.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
          <span style={{fontSize:11,color:"#475569"}}>с</span>
          <InpDate value={dateFrom} onChange={setDateFrom}/>
          <span style={{fontSize:11,color:"#475569"}}>по</span>
          <InpDate value={dateTo} onChange={setDateTo}/>
          <Btn small variant="success" onClick={()=>downloadAnalyticsXls(filteredTasks,data,stageMap,{from:dateFrom,to:dateTo,projectName:filterProject?(data.projects.find(p=>p.id===filterProject)?.name||filterProject):"all_projects"})}>Выгрузить XLS</Btn>
          {(filterProject||filterSeries||filterPerson||dateFrom||dateTo)&&(
            <Btn small variant="ghost" onClick={()=>{setFilterProject("");setFilterSeries("");setFilterPerson("");setDateFrom("");setDateTo("");}}>
              Сбросить
            </Btn>
          )}
        </div>
      </div>

      {/* Итоговые плашки */}
      <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
        <div style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,padding:"12px 20px",minWidth:120}}>
          <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>ВСЕГО СМЕН</div>
          <div style={{fontSize:24,fontWeight:700,color:"#e2e8f0"}}>{totalShifts % 1===0?totalShifts:totalShifts.toFixed(1)}</div>
        </div>
        <div style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,padding:"12px 20px",minWidth:120}}>
          <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>ВЫХОДОВ</div>
          <div style={{fontSize:24,fontWeight:700,color:"#e2e8f0"}}>{totalExits}</div>
        </div>
        {roleTotals.map(([role,v])=>{
          const ri=roleMap[role];
          return (
            <div key={role} style={{background:"#1e293b",border:`1px solid ${ri?ri.color+"44":"#334155"}`,
              borderRadius:12,padding:"12px 20px",minWidth:120}}>
              <div style={{fontSize:11,color:ri?ri.color:"#64748b",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>
                {ri?ri.label:role||"—"}
              </div>
              <div style={{fontSize:20,fontWeight:700,color:"#e2e8f0"}}>
                {v.shifts%1===0?v.shifts:v.shifts.toFixed(1)}
                <span style={{fontSize:12,color:"#475569",fontWeight:400,marginLeft:4}}>смен</span>
              </div>
              <div style={{fontSize:11,color:"#475569"}}>{v.exits} выходов</div>
            </div>
          );
        })}
      </div>

      {/* Таблица по людям */}
      {rows.length===0?(
        <div style={{color:"#475569",fontSize:14,textAlign:"center",padding:"40px 0"}}>
          Нет данных по выбранным фильтрам
        </div>
      ):(
        <div style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:"#0f172a"}}>
                <th style={TH}>Специалист</th>
                <th style={TH}>Роль</th>
                <th style={{...TH,textAlign:"right"}}>Выходов</th>
                <th style={{...TH,textAlign:"right"}}>Смен</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r,i)=>{
                const ri=roleMap[r.role];
                return (
                  <tr key={r.person} style={{background:i%2===0?"transparent":"rgba(255,255,255,0.02)"}}>
                    <td style={TD}>{r.person}</td>
                    <td style={TD}>
                      {ri?(
                        <span style={{background:"transparent",color:ri.color,
                          border:`1.5px solid ${ri.color}`,borderRadius:4,padding:"1px 8px",fontSize:12}}>
                          {ri.label}
                        </span>
                      ):<span style={{color:"#475569"}}>{r.role||"—"}</span>}
                    </td>
                    <td style={{...TD,textAlign:"right",color:"#94a3b8"}}>{r.exits}</td>
                    <td style={{...TD,textAlign:"right",fontWeight:700,color:"#e2e8f0"}}>
                      {r.shifts%1===0?r.shifts:r.shifts.toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{background:"#0f172a"}}>
                <td colSpan={2} style={{...TD,fontWeight:700,color:"#94a3b8",fontSize:12}}>ИТОГО</td>
                <td style={{...TD,textAlign:"right",fontWeight:700,color:"#94a3b8"}}>{totalExits}</td>
                <td style={{...TD,textAlign:"right",fontWeight:700,color:"#e2e8f0"}}>
                  {totalShifts%1===0?totalShifts:totalShifts.toFixed(1)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Скорость этапов */}
      {stageTimings.length>0&&(
        <div style={{marginTop:28}}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>Скорость этапов</div>
          <div style={{fontSize:12,color:"#475569",marginBottom:12}}>календарных дней на серию</div>
          <div style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:"#0f172a"}}>
                  <th style={TH}>Группа этапов</th>
                  <th style={{...TH,textAlign:"right"}}>Среднее</th>
                  <th style={{...TH,textAlign:"right"}}>σ</th>
                  <th style={{...TH,textAlign:"right"}}>Мин</th>
                  <th style={{...TH,textAlign:"right"}}>Макс</th>
                  <th style={TH}>Самая долгая</th>
                  <th style={{...TH,textAlign:"right"}}>Серий</th>
                </tr>
              </thead>
              <tbody>
                {stageTimings.map((row,i)=>{
                  const longestProj=row.longest?data.projects.find(p=>p.id===row.longest.projectId):null;
                  const longestSer=row.longest?(data.series||[]).find(s=>s.id===row.longest.seriesId):null;
                  const repStage=stages.find(s=>s.groupId===row.group.id);
                  const gc=repStage?.color||"#475569";
                  return (
                    <tr key={row.group.id} style={{background:i%2===0?"transparent":"rgba(255,255,255,0.02)"}}>
                      <td style={TD}>
                        <span style={{display:"inline-flex",alignItems:"center",gap:6}}>
                          <span style={{width:8,height:8,borderRadius:2,background:gc,flexShrink:0,display:"inline-block"}}/>
                          {row.group.label}
                        </span>
                      </td>
                      <td style={{...TD,textAlign:"right",fontWeight:700,color:"#e2e8f0"}}>{row.avg.toFixed(1)}</td>
                      <td style={{...TD,textAlign:"right",color:row.sigma>row.avg*0.5?"#f97316":"#94a3b8"}}>{row.sigma.toFixed(1)}</td>
                      <td style={{...TD,textAlign:"right",color:"#94a3b8"}}>{row.min}</td>
                      <td style={{...TD,textAlign:"right",color:"#94a3b8"}}>{row.max}</td>
                      <td style={TD}>
                        {longestProj&&longestSer?(
                          <span style={{fontSize:12,color:"#64748b"}}>
                            <span style={{color:longestProj.color||"#94a3b8"}}>{longestProj.abbr||longestProj.name}</span>
                            {" · "}{longestSer.name}
                          </span>
                        ):"—"}
                      </td>
                      <td style={{...TD,textAlign:"right",color:"#475569"}}>{row.count}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{fontSize:11,color:"#475569",marginTop:8}}>
            Большое σ — нестабильное прохождение этапа. Стоит посмотреть, какие серии тянут вверх.
          </div>
        </div>
      )}
      </div>}
    </div>
  );
}

// ── ЛОГ ИЗМЕНЕНИЙ ────────────────────────────────────────────────────
function ChangelogModal({entries,onClose}){
  function fmtTs(ts){
    const d=new Date(ts);
    const pad=n=>String(n).padStart(2,"0");
    return `${pad(d.getDate())}.${pad(d.getMonth()+1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  return (
    <Modal title="История изменений" onClose={onClose}>
      {!entries.length?(
        <div style={{padding:"24px 0",textAlign:"center",color:"#475569",fontSize:13}}>
          Изменений пока нет
        </div>
      ):(
        <div style={{maxHeight:480,overflowY:"auto",display:"flex",flexDirection:"column",gap:1}}>
          {entries.map((e,i)=>(
            <div key={i} style={{display:"flex",gap:12,padding:"7px 4px",
              borderBottom:"1px solid #1e293b",alignItems:"flex-start"}}>
              <span style={{fontSize:11,color:"#475569",whiteSpace:"nowrap",flexShrink:0,marginTop:1}}>
                {fmtTs(e.ts)}
              </span>
              <span style={{fontSize:13,color:"#cbd5e1"}}>{e.text}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}>
        <Btn variant="ghost" onClick={onClose}>Закрыть</Btn>
      </div>
    </Modal>
  );
}

// ── СМЕНЫ НА ДЕНЬ ────────────────────────────────────────────────────
function DayShiftsModal({data,onClose}){
  const {stageMap}=useContext(StagesCtx);
  const tomorrow=new Date(); tomorrow.setDate(tomorrow.getDate()+1);
  const [targetDay,setTargetDay]=useState(formatDate(tomorrow));
  const [copied,setCopied]=useState(false);

  const shifts=useMemo(()=>{
    const tasks=data.tasks.filter(t=>t.day===targetDay&&t.person)
      .sort((a,b)=>a.from-b.from);
    const byPerson={};
    tasks.forEach(t=>{
      if(!byPerson[t.person]) byPerson[t.person]=[];
      byPerson[t.person].push(t);
    });
    return Object.entries(byPerson).sort(([a],[b])=>a.localeCompare(b))
      .map(([person,tasks])=>({person,tasks}));
  },[data.tasks,targetDay]);

  const pd=parseDate(targetDay);
  const dateLabel=pd?`${WDAYS_LONG[pd.getDay()]}, ${targetDay}`:"—";

  function buildText(){
    let s=` Смены — ${dateLabel}\n${"─".repeat(32)}\n\n`;
    if(!shifts.length){s+="Смен нет\n";return s;}
    shifts.forEach(({person,tasks})=>{
      const totalH=tasks.reduce((acc,t)=>(Number(t.to)||0)-(Number(t.from)||0)+acc,0);
      s+=`👤 ${person}  (${totalH}ч)\n`;
      tasks.forEach(t=>{
        const proj=data.projects.find(p=>p.id===t.project);
        const st=stageMap[t.status];
        s+=`   • ${proj?.name||t.project}  ${t.series}  ·  ${st?.label||t.status}  ·  ${fmtHour(t.from)}–${fmtHour(t.to)}`;
        if(canSeeTaskNotes()&&t.note) s+=`  — ${t.note}`;
        s+="\n";
      });
      s+="\n";
    });
    return s;
  }

  function copyText(){
    navigator.clipboard.writeText(buildText()).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});
  }

  return (
    <Modal title="Смены на день" onClose={onClose} wide>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:20}}>
        <InpDate value={targetDay} onChange={setTargetDay}/>
        <span style={{fontSize:13,color:"#64748b"}}>{pd?WDAYS_LONG[pd.getDay()]:""}</span>
        <div style={{flex:1}}/>
        <Btn variant="ghost" small onClick={copyText}>{copied?"OK Скопировано":" Копировать текст"}</Btn>
        <Btn variant="ghost" small onClick={()=>window.print()}>🖨 Печать</Btn>
      </div>

      {shifts.length===0?(
        <div style={{textAlign:"center",padding:"40px 0",color:"#475569",fontSize:14}}>
          На этот день смен нет
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {shifts.map(({person,tasks})=>{
            const totalH=tasks.reduce((acc,t)=>(Number(t.to)||0)-(Number(t.from)||0)+acc,0);
            const pInfo=data.people.find(p=>p.name===person);
            const roleId=pInfo?.roles?.[0];
            const role=roleId?data.roles.find(r=>r.id===roleId):null;
            return (
              <div key={person} style={{background:"#0f172a",border:"1px solid #334155",borderRadius:12,overflow:"hidden"}}>
                <div style={{padding:"10px 16px",background:"#1e293b",display:"flex",alignItems:"center",gap:10,
                  borderBottom:"1px solid #334155"}}>
                  <div style={{width:34,height:34,borderRadius:"50%",
                    background:`${role?.color||"#3b82f6"}22`,border:`2px solid ${role?.color||"#3b82f6"}`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:14,fontWeight:800,color:role?.color||"#3b82f6"}}>
                    {person[0]}
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14}}>{person}</div>
                    {role&&<div style={{fontSize:11,color:role.color}}>{role.label}</div>}
                  </div>
                  <div style={{marginLeft:"auto",fontSize:12,color:"#64748b"}}>
                    {totalH} ч · {tasks.length} {tasks.length===1?"задача":tasks.length<=4?"задачи":"задач"}
                  </div>
                </div>
                {tasks.map((t,ti)=>{
                  const proj=data.projects.find(p=>p.id===t.project);
                  const st=stageMap[t.status];
                  return (
                    <div key={t.id} style={{padding:"10px 16px",
                      borderBottom:ti<tasks.length-1?"1px solid #1e293b":"none",
                      display:"flex",gap:12,alignItems:"center"}}>
                      <div style={{width:3,alignSelf:"stretch",borderRadius:2,
                        background:proj?.color||"#334155",flexShrink:0}}/>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:3}}>
                          <span style={{fontWeight:600,fontSize:13}}>{proj?.name||t.project}</span>
                          <span style={{fontSize:11,color:"#475569"}}>· {t.series}</span>
                          {st&&<span style={{fontSize:10,background:`${st.color}22`,color:st.color,
                            border:`1px solid ${st.color}44`,borderRadius:4,padding:"1px 7px",fontWeight:600}}>
                            {st.abbr||st.label}
                          </span>}
                        </div>
                        {canSeeTaskNotes()&&t.note&&<div style={{fontSize:11,color:"#64748b",marginTop:2}}>{t.note}</div>}
                      </div>
                      <div style={{fontSize:13,fontWeight:700,color:"#94a3b8",flexShrink:0}}>
                        {fmtHour(t.from)}–{fmtHour(t.to)}
                        <span style={{fontSize:10,color:"#475569",marginLeft:4}}>
                          ({fmtDur(t.from,t.to)})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

// ── ПЕРСОНА ──────────────────────────────────────────────────────────
function PersonCard({personId,data,onBack,onUpdatePeople,canEditBirthday,canEditAbsences}){
  const {stageMap}=useContext(StagesCtx);
  const [tab,setTab]=useState("load");
  const person=useMemo(()=>data.people.find(p=>p.id===personId)||data.people.find(p=>p.name===personId),[data.people,personId]);
  const personName=person?.name||personId;
  const [birthdayEdit,setBirthdayEdit]=useState(false);
  const [birthdayDraft,setBirthdayDraft]=useState(person?.birthday||"");
  const [absenceDraft,setAbsenceDraft]=useState({type:"dayoff",startDay:formatDate(new Date()),endDay:formatDate(new Date()),note:""});
  const [loadMonthOffset,setLoadMonthOffset]=useState(0);
  useEffect(()=>setBirthdayDraft(person?.birthday||""),[person?.birthday]);
  const roleMap=useMemo(()=>Object.fromEntries(data.roles.map(r=>[r.id,r])),[data.roles]);
  const todayStr=formatDate(new Date());
  const tasks=useMemo(()=>
    data.tasks.filter(t=>t.person===personName&&!t.deleted&&!t.cancelled).sort((a,b)=>daySort(a.day).localeCompare(daySort(b.day)))
  ,[data.tasks,personName]);
  const futureTasks=useMemo(()=>tasks.filter(t=>daySort(t.day)>=daySort(todayStr)),[tasks,todayStr]);
  const pastTasks=useMemo(()=>[...tasks.filter(t=>daySort(t.day)<daySort(todayStr))].reverse().slice(0,50),[tasks,todayStr]);
  const doneAndTodayTasks=useMemo(()=>tasks.filter(t=>daySort(t.day)<=daySort(todayStr)),[tasks,todayStr]);
  const roleColor=person?.roles?.[0]?roleMap[person.roles[0]]?.color||"#3b82f6":"#3b82f6";
  const totalHrs=doneAndTodayTasks.reduce((s,t)=>s+(Number(t.to)-Number(t.from)),0);
  const avgHrsW=personWeeklyHours(tasks,todayStr,12);
  const activeProjs=new Set(futureTasks.map(t=>t.project)).size;
  const stageCounts={};
  doneAndTodayTasks.forEach(t=>{stageCounts[t.status]=(stageCounts[t.status]||0)+1;});
  const topSt=Object.entries(stageCounts).sort((a,b)=>b[1]-a[1])[0]?.[0];
  const todayPersonTasks=useMemo(()=>tasks.filter(t=>t.day===todayStr).sort((a,b)=>Number(a.from)-Number(b.from)),[tasks,todayStr]);
  const projectStats=useMemo(()=>{
    const m={};
    doneAndTodayTasks.forEach(t=>{if(!t.project)return;if(!m[t.project])m[t.project]={id:t.project,count:0,hours:0};m[t.project].count++;m[t.project].hours+=Number(t.to)-Number(t.from);});
    return Object.values(m).sort((a,b)=>b.count-a.count||b.hours-a.hours);
  },[doneAndTodayTasks]);
  const topProjects=projectStats.slice(0,5);
  const projectBadges=projectStats.map(ps=>data.projects.find(p=>p.id===ps.id)).filter(Boolean);
  const achievementMetrics=useMemo(()=>buildAchievementMetrics(doneAndTodayTasks,projectStats,stageMap,data,person),[doneAndTodayTasks,projectStats,stageMap]);
  const achievements=useMemo(()=>earnedAchievements(data,achievementMetrics),[data,achievementMetrics]);
  const personAbsences=useMemo(()=>(data.personAbsences||[]).filter(a=>!a.deleted&&absencePersonMatches(a,person||{id:personId,name:personName})).sort((a,b)=>daySort(a.startDay).localeCompare(daySort(b.startDay))),[data.personAbsences,person,personId,personName]);
  const birthdayNorm=normalizeBirthday(person?.birthday);
  const birthdayDiff=birthdayDiffDays(birthdayNorm);
  function saveBirthdayFromCard(){
    if(!canEditBirthday||!onUpdatePeople||!person) return;
    const bd=normalizeBirthday(birthdayDraft);
    if(bd===null){alert("День рождения укажите в формате ДД.ММ");return;}
    onUpdatePeople("people",(data.people||[]).map(p=>p.id===person.id?{...p,birthday:bd}:p));
    setBirthdayEdit(false);
  }
  function saveAbsenceFromCard(){
    if(!canEditAbsences||!onUpdatePeople||!person) return;
    if(!absenceDraft.startDay){alert("Укажите дату начала");return;}
    const start=absenceDraft.startDay;
    const end=absenceDraft.endDay||start;
    if(daySort(end)<daySort(start)){alert("Дата окончания раньше начала");return;}
    const ts=Date.now();
    const item=normalizeAbsence({
      id:"abs_"+ts+"_"+Math.random().toString(36).slice(2,7),
      personId:person.id||"",
      personName:person.name||personName,
      type:absenceDraft.type,
      startDay:start,
      endDay:end,
      note:absenceDraft.note,
      updatedAt:new Date(ts).toISOString(),
      _updatedAt:ts,
    });
    onUpdatePeople("personAbsences",[...(data.personAbsences||[]),item]);
    setAbsenceDraft(f=>({...f,note:""}));
  }
  function removeAbsenceFromCard(id){
    if(!canEditAbsences||!onUpdatePeople) return;
    const ts=Date.now();
    onUpdatePeople("personAbsences",(data.personAbsences||[]).map(a=>a.id===id?{...a,deleted:true,updatedAt:new Date(ts).toISOString(),_updatedAt:ts}:a));
  }

  const loadCalendar=useMemo(()=>{
    const monthStart=d=>new Date(d.getFullYear(),d.getMonth(),1);
    const addMonths=(d,n)=>new Date(d.getFullYear(),d.getMonth()+n,1);
    const today=new Date();today.setHours(0,0,0,0);
    const cur=addMonths(monthStart(today),loadMonthOffset);
    const daysInMonth=new Date(cur.getFullYear(),cur.getMonth()+1,0).getDate();
    const offset=(cur.getDay()+6)%7;
    const days=[];
    for(let i=0;i<offset;i++)days.push(null);
    for(let day=1;day<=daysInMonth;day++){
      const dt=new Date(cur.getFullYear(),cur.getMonth(),day);
      const ds=formatDate(dt);
      const dayTasks=tasks.filter(t=>t.day===ds);
      const hrs=dayTasks.reduce((sum,t)=>sum+(Number(t.to)-Number(t.from)),0);
      const absences=personAbsences.filter(a=>daySort(ds)>=daySort(a.startDay)&&daySort(ds)<=daySort(a.endDay||a.startDay));
      days.push({ds,day,hrs,tasks:dayTasks,absences,isToday:ds===todayStr});
    }
    while(days.length%7)days.push(null);
    return [{key:String(cur.getFullYear())+"-"+String(cur.getMonth()+1).padStart(2,"0"),label:(MONTHS[cur.getMonth()]||"")+" "+cur.getFullYear(),days}];
  },[tasks,personAbsences,todayStr,loadMonthOffset]);
  const loadCalendarMaxHrs=Math.max(1,...loadCalendar.flatMap(m=>m.days.map(c=>c?.hrs||0)));
  const loadMonth=loadCalendar[0];


  const tabS={display:"inline-flex",background:"#0f172a",borderRadius:10,border:"1px solid #334155",overflow:"hidden",marginBottom:20};
  const tabBtn=(id,lbl)=>(
    <button key={id} onClick={()=>setTab(id)} style={{padding:"6px 16px",border:"none",cursor:"pointer",fontSize:12,fontFamily:"inherit",
      background:tab===id?"#3b82f6":"transparent",color:tab===id?"#fff":"#64748b",fontWeight:tab===id?700:400}}>{lbl}</button>
  );
  const TD={padding:"8px 12px",fontSize:13,borderBottom:"1px solid #1e293b"};

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <Btn variant="ghost" small onClick={onBack}>← Назад</Btn>
        <div style={{width:44,height:44,borderRadius:"50%",background:roleColor+"22",
          border:`2px solid ${roleColor}`,display:"flex",alignItems:"center",
          justifyContent:"center",fontSize:18,fontWeight:800,color:roleColor}}>{personName[0]}</div>
        <div>
          <div style={{fontSize:20,fontWeight:700}}>{personName}</div>
          <div style={{display:"flex",gap:4,marginTop:3,flexWrap:"wrap"}}>
            {(person?.roles||[]).map(r=>{const rl=roleMap[r];const rk2 = typeof r === "string" ? r : (r.id || JSON.stringify(r)); return(
              <span key={rk2} style={{fontSize:10,background:"transparent",color:rl?.color||"#64748b",
                border:`1.5px solid ${rl?.color||"#64748b"}`,borderRadius:3,padding:"1px 6px"}}>{rl?.label||r}</span>
            );})}
            {person?.active===false&&<span style={{fontSize:10,color:"#475569",marginLeft:4}}>неактивен</span>}
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:10,marginBottom:18}}>
        <div className={`ppt-birthday-card ${birthdayDiff===0?"ppt-birthday-today":""}`}>
          <div className="ppt-birthday-kicker">ДЕНЬ РОЖДЕНИЯ</div>
          {birthdayEdit?(
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <Inp value={birthdayDraft} onChange={setBirthdayDraft} placeholder="ДД.ММ" style={{maxWidth:100}}/>
              <Btn small variant="primary" onClick={saveBirthdayFromCard}>OK</Btn>
              <Btn small variant="ghost" onClick={()=>{setBirthdayEdit(false);setBirthdayDraft(person?.birthday||"");}}>×</Btn>
            </div>
          ):(
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <span className={birthdayNorm?"ppt-birthday-profile-value":"ppt-birthday-empty"}>{birthdayNorm?`ДР ${birthdayNorm}`:"не указан"}</span>
              {birthdayNorm&&birthdayDiff!=null&&<span className={birthdayDiff<=7?"ppt-birthday-profile-when":"ppt-birthday-profile-when ppt-birthday-muted"}>· {birthdayWhenText(birthdayDiff)}</span>}
              {canEditBirthday&&<Btn small variant="ghost" onClick={()=>setBirthdayEdit(true)}>Изм</Btn>}
            </div>
          )}
        </div>
        <div style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,padding:"12px 14px"}}>
          <div style={{fontSize:11,color:"#64748b",letterSpacing:1,marginBottom:6}}>СЕГОДНЯ</div>
          {todayPersonTasks.length?todayPersonTasks.map(t=>{
            const proj=data.projects.find(p=>p.id===t.project);
            return <div key={t.id} style={{display:"flex",gap:7,alignItems:"center",fontSize:12,marginBottom:4}}>
              <span style={{width:7,height:7,borderRadius:2,background:proj?.color||"#64748b",flexShrink:0}}/>
              <span style={{color:"#e2e8f0",fontWeight:700}}>{proj?.abbr||proj?.name||t.project}</span>
              <span style={{color:"#64748b"}}>{t.series}</span>
              <StatusBadge s={t.status} small/>
            </div>;
          }):<div style={{fontSize:13,color:"#475569"}}>Сегодня задач нет</div>}
        </div>
        <div style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,padding:"12px 14px"}}>
          <div style={{fontSize:11,color:"#64748b",letterSpacing:1,marginBottom:6}}>ПРОЕКТНЫЕ НАШИВКИ</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {projectBadges.length?projectBadges.map(p=><span key={p.id} title={p.name} style={{fontSize:10,color:p.color,border:`1px solid ${p.color}66`,background:`${p.color}22`,borderRadius:999,padding:"2px 7px",fontWeight:700}}>{p.abbr||p.name}</span>):<span style={{fontSize:13,color:"#475569"}}>пока нет</span>}
          </div>
        </div>
      </div>
      <div style={tabS}>
        {tabBtn("load","Загрузка")}
        {tabBtn("current","Текущие задачи")}
        {tabBtn("history","История")}
        {tabBtn("stats","Статистика")}
      </div>

      {tab==="load"&&(
        <div>
          <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:12,marginBottom:12,flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:12,color:"#93c5fd",fontWeight:900,letterSpacing:.4}}>КАЛЕНДАРЬ ЗАГРУЗКИ</div>
              <div style={{fontSize:11,color:"#64748b",marginTop:3}}>{loadMonth?.label||""} · {loadMonth?.days.filter(c=>c?.tasks.length).length||0} дн. · {loadMonth?.days.reduce((sum,c)=>sum+(c?.hrs||0),0)||0} ч · {loadMonth?.days.filter(c=>c?.absences.length).length||0} отсутствий</div>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <Btn variant="ghost" small onClick={()=>setLoadMonthOffset(v=>v-1)}>?</Btn>
              <Btn variant="ghost" small onClick={()=>setLoadMonthOffset(0)}>Сегодня</Btn>
              <Btn variant="ghost" small onClick={()=>setLoadMonthOffset(v=>v+1)}>?</Btn>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"minmax(320px,520px)",gap:12,alignItems:"start"}}>
            {loadCalendar.map(month=>(
              <div key={month.key} style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,padding:10,boxShadow:"0 12px 30px rgba(0,0,0,.12)"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <div style={{fontSize:13,color:"#e2e8f0",fontWeight:900}}>{month.label}</div>
                  <div style={{fontSize:10,color:"#64748b"}}>{month.days.filter(c=>c?.tasks.length).length} дн.</div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:4}}>
                  {["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map(d=><div key={d} style={{fontSize:9,color:"#64748b",textAlign:"center",fontWeight:800}}>{d}</div>)}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
                  {month.days.map((cell,idx)=>{
                    if(!cell)return <div key={idx} style={{minHeight:52,borderRadius:8,background:"rgba(15,23,42,.18)"}}/>;
                    const intensity=Math.min(1,cell.hrs/loadCalendarMaxHrs);
                    const primaryAbs=cell.absences[0]?absenceTypeInfo(cell.absences[0].type):null;
                    const hasAbs=Boolean(primaryAbs);
                    const bg=hasAbs?(primaryAbs.color+"18"):(cell.hrs?("rgba(99,102,241,"+(0.13+intensity*.25)+")"):"rgba(15,23,42,.58)");
                    const border=cell.isToday?"#38bdf8":(hasAbs?(primaryAbs.color+"88"):(cell.hrs?"rgba(129,140,248,.5)":"rgba(148,163,184,.14)"));
                    const details=[...cell.tasks.map(t=>{const p=data.projects.find(p=>p.id===t.project);const st=stageMap[t.status]||{};return ((p?.name||p?.abbr||t.project||"")+(t.series?" / "+t.series:"")+(t.status?" / "+(st.label||t.status):"")+" "+(t.from||"")+"-"+(t.to||"")).trim();}),...cell.absences.map(a=>absenceTypeInfo(a.type).label+(a.note?": "+a.note:""))].join("\n");
                    return <button key={cell.ds} type="button" title={details||cell.ds}
                      onClick={()=>canEditAbsences&&setAbsenceDraft(f=>({...f,startDay:cell.ds,endDay:cell.ds}))}
                      style={{minHeight:52,borderRadius:8,border:"1px solid "+border,background:bg,color:"#e2e8f0",padding:"4px 4px",textAlign:"left",fontFamily:"inherit",cursor:canEditAbsences?"pointer":"default",boxShadow:cell.isToday?"0 0 0 1px rgba(56,189,248,.35)":"none",overflow:"hidden"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:3}}>
                        <span style={{fontSize:12,color:cell.isToday?"#7dd3fc":"#94a3b8",fontWeight:900}}>{cell.day}</span>
                        {cell.hrs>0&&<span style={{fontSize:10,color:"#cbd5e1",fontWeight:800}}>{cell.hrs}ч</span>}
                      </div>
                      <div style={{display:"flex",gap:2,flexWrap:"wrap",marginTop:4,minHeight:8}}>
                        {cell.absences.slice(0,2).map(a=>{const ai=absenceTypeInfo(a.type);return <span key={a.id} style={{fontSize:8,lineHeight:"12px",height:12,borderRadius:4,padding:"0 3px",background:ai.color+"22",border:"1px solid "+ai.color+"77",color:ai.color,fontWeight:900}}>{ai.short}</span>;})}
                        {cell.tasks.slice(0,3).map(t=>{const st=stageMap[t.status]||{};return <span key={t.id} style={{width:9,height:9,borderRadius:3,background:st.color||roleColor,display:"inline-block",marginTop:2}}/>;})}
                      </div>
                    </button>;
                  })}
                </div>
              </div>
            ))}
          </div>
          <div style={{marginTop:18,background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,padding:14}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:12}}>
              <div>
                <div style={{fontSize:12,color:"#93c5fd",fontWeight:900,letterSpacing:.4}}>ОТСУТСТВИЯ</div>
                <div style={{fontSize:11,color:"#64748b",marginTop:2}}>выходной, отпуск, болезнь</div>
              </div>
            </div>
            {canEditAbsences&&<div style={{display:"grid",gridTemplateColumns:"160px 140px 140px 1fr auto",gap:8,alignItems:"end",marginBottom:14}}>
              <Field label="Тип"><Sel value={absenceDraft.type} onChange={v=>setAbsenceDraft(f=>({...f,type:v}))} options={ABSENCE_TYPES.map(a=>({value:a.id,label:a.label}))}/></Field>
              <Field label="С"><InpDate value={absenceDraft.startDay} onChange={v=>setAbsenceDraft(f=>({...f,startDay:v,endDay:f.endDay||v}))}/></Field>
              <Field label="По"><InpDate value={absenceDraft.endDay} onChange={v=>setAbsenceDraft(f=>({...f,endDay:v}))}/></Field>
              <Field label="Комментарий"><Inp value={absenceDraft.note} onChange={v=>setAbsenceDraft(f=>({...f,note:v}))} placeholder="необязательно"/></Field>
              <Btn variant="primary" onClick={saveAbsenceFromCard}>Добавить</Btn>
            </div>}
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {personAbsences.length?personAbsences.map(a=>{
                const ai=absenceTypeInfo(a.type);
                return <div key={a.id} style={{display:"flex",alignItems:"center",gap:10,background:"#0f172a",border:"1px solid "+ai.color+"44",borderLeft:"3px solid "+ai.color,borderRadius:10,padding:"9px 12px"}}>
                  <span style={{fontSize:11,color:ai.color,fontWeight:900,minWidth:70}}>{ai.label}</span>
                  <span style={{fontSize:13,color:"#e2e8f0",fontWeight:700}}>{a.startDay}{a.endDay&&a.endDay!==a.startDay?" - "+a.endDay:""}</span>
                  {a.note&&<span style={{fontSize:12,color:"#64748b"}}>{a.note}</span>}
                  {canEditAbsences&&<button onClick={()=>removeAbsenceFromCard(a.id)} style={{marginLeft:"auto",background:"transparent",border:"1px solid rgba(248,113,113,.35)",color:"#fca5a5",borderRadius:8,padding:"3px 7px",cursor:"pointer"}}>Удалить</button>}
                </div>;
              }):<div style={{fontSize:13,color:"#64748b"}}>Отсутствий нет</div>}
            </div>
          </div>
        </div>
      )}

      {tab==="current"&&(
        <div style={{display:"flex",flexDirection:"column",gap:2}}>
          {futureTasks.length===0?(
            <div style={{color:"#475569",padding:"40px 0",textAlign:"center",fontSize:13}}>Нет предстоящих задач</div>
          ):(()=>{
            const byDay={};
            futureTasks.forEach(t=>{if(!byDay[t.day])byDay[t.day]=[];byDay[t.day].push(t);});
            return Object.entries(byDay).sort(([a],[b])=>daySort(a).localeCompare(daySort(b))).map(([day,dt])=>(
              <div key={day} style={{marginBottom:10}}>
                <div style={{fontSize:12,fontWeight:700,color:"#64748b",padding:"6px 0 4px",
                  borderBottom:"1px solid #1e293b",marginBottom:4,letterSpacing:0.5}}>
                  {dayLabel(day)}
                </div>
                {dt.map(t=><TaskCard key={t.id} task={t} projects={data.projects}/>)}
              </div>
            ));
          })()}
        </div>
      )}

      {tab==="history"&&(
        <div style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,overflow:"hidden"}}>
          {pastTasks.length===0?(
            <div style={{color:"#475569",padding:"40px 0",textAlign:"center",fontSize:13}}>Нет истории</div>
          ):(
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:"#0f172a"}}>
                  {["Дата","Проект","Серия","Этап","Часов","Заметка"].map(h=>(
                    <th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:11,color:"#64748b",
                      letterSpacing:1,borderBottom:"1px solid #334155",fontWeight:600,textTransform:"uppercase"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pastTasks.map((t,i)=>{
                  const proj=data.projects.find(p=>p.id===t.project);
                  return (
                    <tr key={t.id} style={{background:i%2===0?"transparent":"rgba(255,255,255,0.02)"}}>
                      <td style={{...TD,color:"#94a3b8"}}>{dayLabel(t.day)}</td>
                      <td style={TD}><span style={{color:proj?.color||"#94a3b8"}}>{proj?.abbr||proj?.name||t.project}</span></td>
                      <td style={{...TD,color:"#64748b"}}>{t.series}</td>
                      <td style={TD}><StatusBadge s={t.status} small/></td>
                      <td style={{...TD,color:"#94a3b8"}}>{(Number(t.to)-Number(t.from))}ч</td>
                      <td style={{...TD,color:"#475569",fontSize:12}}>{canSeeTaskNotes()?(t.note||"—"):"—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab==="stats"&&(
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {[{l:"ЗАПИСЕЙ",v:doneAndTodayTasks.length},{l:"ПЛАН, Ч",v:totalHrs},
            {l:"СЕЙЧАС В ПРОЕКТАХ",v:activeProjs||"—"},{l:"ПЛАН Ч/НЕД · 12 НЕД",v:avgHrsW.toFixed(1)}
          ].map(({l,v})=>(
            <div key={l} style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,padding:"12px 20px",minWidth:120}}>
              <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>{l}</div>
              <div style={{fontSize:24,fontWeight:700,color:"#e2e8f0"}}>{v}</div>
            </div>
          ))}
          {topSt&&stageMap[topSt]&&(
            <div style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,padding:"12px 20px",minWidth:120}}>
              <div style={{fontSize:11,color:"#64748b",marginBottom:6}}>ЧАЩЕ ВСЕГО</div>
              <StatusBadge s={topSt}/>
              <div style={{fontSize:11,color:"#475569",marginTop:4}}>{stageCounts[topSt]} задач</div>
            </div>
          )}
          <div style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,padding:"12px 20px",minWidth:260,flex:"1 1 260px"}}>
            <div style={{fontSize:11,color:"#64748b",marginBottom:8}}>БОЛЬШЕ ВСЕГО РАБОТАЛ НА</div>
            {topProjects.length?topProjects.map(ps=>{const proj=data.projects.find(p=>p.id===ps.id);return(
              <div key={ps.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <ProjectMark project={proj} size={8}/>
                <span style={{fontSize:12,color:"#e2e8f0",fontWeight:700,flex:1}}>{proj?.name||ps.id}</span>
                <span style={{fontSize:11,color:"#64748b"}}>{ps.count} смен</span>
              </div>
            );}):<div style={{fontSize:13,color:"#475569"}}>Пока нет истории по проектам</div>}
          </div>
          <div style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,padding:"12px 20px",minWidth:260,flex:"1 1 260px"}}>
            <div style={{fontSize:11,color:"#64748b",marginBottom:8}}>АЧИВКИ</div>
            {achievements.length?(
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {achievements.map(a=><span key={a.id} title={`${a.description||a.title}: ${a.value}/${a.threshold}`} style={{fontSize:11,color:a.color,border:`1px solid ${a.color}66`,background:`${a.color}22`,borderRadius:999,padding:"4px 9px",fontWeight:800,display:"inline-flex",alignItems:"center",gap:5}}>
                  {a.image?<img src={a.image} alt="" style={{width:16,height:16,borderRadius:"50%",objectFit:"cover"}}/>:<span>{a.icon||"?"}</span>}
                  <span>{a.title}</span>
                </span>)}
              </div>
            ):<div style={{fontSize:13,color:"#475569"}}>Ачивки появятся по мере истории</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── СЕГОДНЯ ──────────────────────────────────────────────────────────
function TodayView({data,conflictDetails,onNavigateConflicts,canEdit}){
  const {stageMap}=useContext(StagesCtx);
  const today=useMemo(()=>{const d=new Date();d.setHours(0,0,0,0);return d;},[]);
  const todayStr=useMemo(()=>formatDate(today),[today]);
  const tomorrowStr=useMemo(()=>formatDate(new Date(today.getTime()+86400000)),[today]);
  const datStr=useMemo(()=>formatDate(new Date(today.getTime()+2*86400000)),[today]);
  const in7Str=useMemo(()=>formatDate(new Date(today.getTime()+7*86400000)),[today]);

  const todayTasks=useMemo(()=>data.tasks.filter(t=>!t.deleted&&!t.cancelled&&t.day===todayStr),[data.tasks,todayStr]);
  const tmrTasks=useMemo(()=>data.tasks.filter(t=>!t.deleted&&!t.cancelled&&t.day===tomorrowStr),[data.tasks,tomorrowStr]);
  const datTasks=useMemo(()=>data.tasks.filter(t=>!t.deleted&&!t.cancelled&&t.day===datStr),[data.tasks,datStr]);

  const deadlines=useMemo(()=>{
    const items=[];
    (data.series||[]).forEach(ser=>{
      const proj=data.projects.find(p=>p.id===ser.projectId);
      if(!proj) return;
      getSeriesMilestoneEvents(ser,proj).forEach(m=>{
        const d=m.date;
        if(d&&daySort(d)>=daySort(todayStr)&&daySort(d)<=daySort(in7Str))
          items.push({ser,proj,date:d,type:m.label,color:m.color});
      });
    });
    return items.sort((a,b)=>daySort(a.date).localeCompare(daySort(b.date)));
  },[data.series,data.projects,todayStr,in7Str]);

  const busyNames=useMemo(()=>new Set(todayTasks.map(t=>t.person).filter(Boolean)),[todayTasks]);
  const freePeople=useMemo(()=>data.people.filter(p=>p.active!==false&&!busyNames.has(p.name)),[data.people,busyNames]);
  const birthdayItems=useMemo(()=>upcomingBirthdays(data.people,today,7),[data.people,today]);
  const notifyConflicts=useMemo(()=>conflictDetails.filter(d=>d.notify!==false),[conflictDetails]);

  function groupByProj(tasks){
    const m={};tasks.forEach(t=>{if(t.deleted||t.cancelled)return;if(!m[t.project])m[t.project]=[];m[t.project].push(t);});
    return Object.entries(m);
  }
  function groupTodayTasks(tasks){
    const m={};
    (tasks||[]).filter(t=>!t.deleted&&!t.cancelled).forEach(t=>{
      const key=[t.project||"",t.series||"",t.status||"",t.from||0,t.to||0].join("|");
      if(!m[key]) m[key]={...t,ids:[],people:[],tasks:[]};
      m[key].ids.push(t.id);
      m[key].tasks.push(t);
      if(t.person&&!m[key].people.includes(t.person)) m[key].people.push(t.person);
    });
    return Object.values(m).sort((a,b)=>(Number(a.from)||0)-(Number(b.from)||0)||String(a.series||"").localeCompare(String(b.series||""))||String(a.status||"").localeCompare(String(b.status||"")));
  }
  function daysDiff(ds){
    const d=parseDate(ds);if(!d)return"";
    const diff=Math.round((d-today)/86400000);
    return diff===0?"\u0441\u0435\u0433\u043e\u0434\u043d\u044f":diff===1?"\u0437\u0430\u0432\u0442\u0440\u0430":`\u0447\u0435\u0440\u0435\u0437 ${diff} \u0434\u043d.`;
  }
  function Block({title,count,color,children}){
    return (
      <div style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:14,overflow:"hidden"}}>
        <div style={{padding:"14px 18px",borderBottom:"1px solid #334155",
          display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontWeight:700,fontSize:12,color:"#64748b",letterSpacing:1,textTransform:"uppercase"}}>{title}</span>
          {count!=null&&<span style={{fontSize:22,fontWeight:800,color:color||"#e2e8f0"}}>{count}</span>}
        </div>
        <div style={{padding:"14px 18px"}}>{children}</div>
      </div>
    );
  }
  function TasksBlock({tasks}){
    const byProj=groupByProj(tasks);
    if(!byProj.length) return <div style={{color:"#475569",fontSize:14}}>{"\u0421\u043c\u0435\u043d \u043d\u0435\u0442"}</div>;
    return byProj.map(([pid,pts])=>{
      const proj=data.projects.find(p=>p.id===pid);
      const grouped=groupTodayTasks(pts);
      return (
        <div key={pid} style={{marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
            <ProjectMark project={proj} size={8}/>
            <span style={{fontSize:13,fontWeight:600,color:proj?.color||"#94a3b8"}}>{proj?.name||pid}</span>
          </div>
          {grouped.map(g=>{
            const st=stageMap[g.status];
            return (
              <div key={g.ids.join("-")} style={{display:"grid",gridTemplateColumns:"minmax(62px,78px) minmax(120px,1fr) auto",alignItems:"center",gap:8,
                padding:"6px 0 6px 14px",borderBottom:"1px solid #1e293b"}}>
                <span style={{fontSize:12,color:"#64748b",whiteSpace:"nowrap"}}>{fmtHour(g.from)}-{fmtHour(g.to)}</span>
                <div style={{minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                    <StatusBadge s={g.status} small/>
                    <span style={{fontSize:13,color:"#e2e8f0",fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.series||"-"}</span>
                    {g.tasks.length>1&&<span style={{fontSize:10,color:st?.color||"#64748b",border:`1px solid ${st?.color||"#64748b"}55`,borderRadius:999,padding:"0 6px"}}>x{g.tasks.length}</span>}
                  </div>
                </div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"flex-end",maxWidth:220}}>
                  {(g.people.length?g.people:["\u043d\u0435 \u043d\u0430\u0437\u043d."]).map(name=>(
                    <span key={name} style={{fontSize:11,color:name===g.people[0]?"#cbd5e1":"#94a3b8",background:"rgba(148,163,184,0.09)",border:"1px solid #334155",borderRadius:999,padding:"2px 7px",whiteSpace:"nowrap"}}>{name}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    });
  }


  const pd=today;
  const dateTitle=`${WDAYS_LONG[pd.getDay()]}, ${String(pd.getDate()).padStart(2,"0")} ${MONTHS[pd.getMonth()].toLowerCase()}`;

  return (
    <div>
      <div style={{fontSize:22,fontWeight:800,marginBottom:20,color:"#e2e8f0"}}>{dateTitle}</div>
      {birthdayItems.length>0&&(
        <div className={`ppt-birthday-banner ${birthdayItems.some(b=>b.diff===0)?"ppt-birthday-today":""}`}>
          <span className="ppt-birthday-chip">ДР</span>
          <span className="ppt-birthday-banner-title">Дни рождения 7 дней</span>
          {birthdayItems.map(b=><span key={b.person.id||b.person.name} className="ppt-birthday-pill">
            {b.person.name} · {normalizeBirthday(b.person.birthday)} · {birthdayWhenText(b.diff)}
          </span>)}
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,400px),1fr))",gap:16,alignItems:"start"}}>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <Block title="Сегодня" count={todayTasks.length} color={todayTasks.length?"#e2e8f0":"#475569"}>
            <TasksBlock tasks={todayTasks}/>
          </Block>
          <Block title="Завтра" count={tmrTasks.length} color="#64748b">
            <TasksBlock tasks={tmrTasks}/>
          </Block>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <Block title="Конфликты" count={notifyConflicts.length} color={notifyConflicts.length?"#f87171":"#22c55e"}>
            {notifyConflicts.length===0?(
              <div style={{color:"#22c55e",fontSize:15,fontWeight:600}}>OK Конфликтов нет</div>
            ):(
              <div>
                <div style={{fontSize:14,color:"#f87171",marginBottom:10}}>
                  Требуют внимания: {notifyConflicts.length}
                </div>
                <Btn variant="ghost" small onClick={onNavigateConflicts}>Смотреть все →</Btn>
              </div>
            )}
          </Block>
          <Block title="Важное 7 дней" count={deadlines.length+birthdayItems.length} color={(deadlines.length+birthdayItems.length)?"#f59e0b":"#475569"}>
            {deadlines.length===0&&birthdayItems.length===0?(
              <div style={{color:"#475569",fontSize:14}}>Важных событий нет</div>
            ):(
              <div>
                {birthdayItems.map(b=>(
                  <div key={`bd-${b.person.id||b.person.name}`} className={`ppt-birthday-important ${b.diff===0?"ppt-birthday-today":""}`}>
                    <span className="ppt-birthday-chip ppt-birthday-chip-small">ДР</span>
                    <span className="ppt-birthday-important-name">{b.person.name}</span>
                    <span className="ppt-birthday-important-label">День рождения</span>
                    <span className="ppt-birthday-important-when">{birthdayWhenText(b.diff)}</span>
                  </div>
                ))}
                {deadlines.map((u,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,
                    padding:"7px 0",borderBottom:"1px solid #1e293b"}}>
                    <ProjectMark project={u.proj} size={8}/>
                    <span style={{fontSize:14,color:"#e2e8f0",flex:1,fontWeight:500}}>{u.proj.abbr||u.proj.name} · {u.ser.name}</span>
                    <span style={{fontSize:12,color:u.color,fontWeight:700}}>{u.type}</span>
                    <span style={{fontSize:12,color:"#475569"}}>{daysDiff(u.date)}</span>
                  </div>
                ))}
              </div>
            )}
          </Block>
          <Block title="Послезавтра" count={datTasks.length} color="#64748b">
            <TasksBlock tasks={datTasks}/>
          </Block>
        </div>
      </div>
    </div>
  );
}

// ── КАРТОЧКА СЕРИИ ───────────────────────────────────────────────────
function SeriesCard({seriesId,data,onBatchUpdate}){
  const holidays=useContext(HolidaysCtx);
  const [tab,setTab]=useState("general");
  const [newCLForm,setNewCLForm]=useState(null);
  const [editCLId,setEditCLId]=useState(null);
  const [editCLName,setEditCLName]=useState("");
  const [openCmts,setOpenCmts]=useState({});

  const ser=(data.series||[]).find(s=>s.id===seriesId);
  const proj=ser?data.projects.find(p=>p.id===ser.projectId):null;
  if(!ser||!proj) return <div style={{padding:40,color:"#475569",textAlign:"center"}}>Серия не найдена.</div>;

  const checklists=ser.checklists||[];
  const allItems=checklists.flatMap(cl=>cl.items||[]);
  const doneCount=allItems.filter(i=>i.done).length;
  const totalCount=allItems.length;
  const undoneCount=totalCount-doneCount;
  const canDeliver=totalCount===0||undoneCount===0;
  const preOtkWarn=ser.preOtkDate&&isNonWorkday(ser.preOtkDate,holidays);
  const otkWarn=ser.otkDate&&isNonWorkday(ser.otkDate,holidays);

  function upSer(ch){
    onBatchUpdate({series:(data.series||[]).map(s=>s.id===seriesId?{...s,...ch}:s),tasks:data.tasks});
  }
  function updCL(clId,ch){upSer({checklists:checklists.map(cl=>cl.id===clId?{...cl,...ch}:cl)});}
  function toggleItem(clId,itemId){
    const cl=checklists.find(c=>c.id===clId);
    updCL(clId,{items:(cl.items||[]).map(it=>it.id===itemId?{...it,done:!it.done}:it)});
  }
  function updItem(clId,itemId,ch){
    const cl=checklists.find(c=>c.id===clId);
    updCL(clId,{items:(cl.items||[]).map(it=>it.id===itemId?{...it,...ch}:it)});
  }
  function delItem(clId,itemId){
    const cl=checklists.find(c=>c.id===clId);
    updCL(clId,{items:(cl.items||[]).filter(it=>it.id!==itemId)});
  }
  function addItem(clId){
    const cl=checklists.find(c=>c.id===clId);
    if(!cl) return;
    updCL(clId,{items:[...(cl.items||[]),{id:"i"+Date.now(),text:"Новый пункт",done:false,comment:""}]});
  }
  function delChecklist(clId){
    if(!window.confirm("Удалить чек-лист?")) return;
    upSer({checklists:checklists.filter(cl=>cl.id!==clId)});
  }
  function createChecklist(){
    const {name,lines}=newCLForm;
    const items=lines.split("\n").filter(l=>l.trim()).map((text,i)=>
      ({id:"i"+Date.now()+i,text:text.trim(),done:false,comment:""}));
    upSer({checklists:[...checklists,{id:"cl"+Date.now(),name:name.trim()||"Без названия",items}]});
    setNewCLForm(null);
  }
  function deliverSeries(){
    if(!window.confirm("Отметить серию как сданную?")) return;
    upSer({delivered:true,deliveredAt:formatDate(new Date())});
  }
  function reopenSeries(){
    if(!window.confirm("Открыть серию заново?")) return;
    upSer({delivered:false,deliveredAt:""});
  }

  const iSt={background:"#0f172a",border:"1px solid #334155",borderRadius:10,
    color:"#e2e8f0",padding:"7px 10px",fontSize:13,outline:"none",fontFamily:"inherit",
    width:"100%",boxSizing:"border-box"};
  const lSt={fontSize:11,color:"#64748b",letterSpacing:1,marginBottom:3,display:"block"};
  const cSt={background:"rgba(30,41,59,.72)",borderRadius:16,padding:20,border:"1px solid rgba(148,163,184,.18)"};

  const TABS=[
    {id:"general",label:"Общее"},
    {id:"checklists",label:totalCount?`Чек-листы (${doneCount}/${totalCount})`:"Чек-листы"},
    {id:"notes",label:"Заметки"},
  ];

  return (
    <div style={{maxWidth:900,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:20}}>
      <div style={{display:"flex",gap:1,background:"#0f172a",borderRadius:12,
        border:"1px solid #334155",overflow:"hidden",width:"fit-content"}}>
        {TABS.map(({id,label})=>(
          <button key={id} onClick={()=>setTab(id)} style={{
            padding:"6px 16px",border:"none",borderRight:"1px solid #334155",cursor:"pointer",
            fontSize:12,fontFamily:"inherit",
            background:tab===id?"#3b82f6":"transparent",
            color:tab===id?"#fff":"#64748b",fontWeight:tab===id?700:400}}>
            {label}
          </button>
        ))}
      </div>
        <Btn variant="primary" small onClick={()=>upSer({_updatedAt:Date.now()})}>Сохранить</Btn>
      </div>

      {tab==="general"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,360px),1fr))",gap:16,alignItems:"start"}}>
          <div style={cSt}>
            <div style={{display:"grid",gap:12}}>
              <div>
                <label style={lSt}>НАЗВАНИЕ</label>
                <input defaultValue={ser.name} style={iSt}
                  onBlur={e=>{const v=e.target.value.trim();if(v&&v!==ser.name)upSer({name:v});}}/>
              </div>
              <div style={{fontSize:10,color:"#475569",letterSpacing:1}}>——— СЪЁМКИ ———</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div><label style={lSt}>НАЧАЛО</label>
                  <InpDate value={ser.shootStart||""} onChange={v=>upSer({shootStart:v})}/></div>
                <div><label style={lSt}>КОНЕЦ</label>
                  <InpDate value={ser.shootEnd||""} onChange={v=>upSer({shootEnd:v})}/></div>
              </div>
              <div style={{fontSize:10,color:"#475569",letterSpacing:1}}>——— ПОСТПРОДАКШН ———</div>
              <div>
                <label style={lSt}>МОНТАЖ С</label>
                <InpDate value={ser.editStart||""} onChange={v=>upSer({editStart:v})}/>
              </div>
              <div style={{fontSize:10,color:"#475569",letterSpacing:1}}>——— КЛЮЧЕВЫЕ СОБЫТИЯ ———</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div><label style={{...lSt,color:"#a855f7"}}>{"\u0417\u0430\u043a\u0430\u0437 \u041e\u0422\u041f\u0420\u0410\u0412\u041a\u0410"}</label>
                  <InpDate value={ser.sendDate||""} onChange={v=>upSer({sendDate:v})}/></div>
                <div><label style={{...lSt,color:getProjectMilestoneMeta(proj,"preOtkDate",SERIES_MILESTONES.find(m=>m.key==="preOtkDate")).color}}>{getProjectMilestoneMeta(proj,"preOtkDate",SERIES_MILESTONES.find(m=>m.key==="preOtkDate")).label}</label>
                  <InpDate value={ser.preOtkDate||""} onChange={v=>upSer({preOtkDate:v})} warn={preOtkWarn}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div><label style={{...lSt,color:getProjectMilestoneMeta(proj,"otkDate",SERIES_MILESTONES.find(m=>m.key==="otkDate")).color}}>{getProjectMilestoneMeta(proj,"otkDate",SERIES_MILESTONES.find(m=>m.key==="otkDate")).label}</label>
                  <InpDate value={ser.otkDate||""} onChange={v=>upSer({otkDate:v})} warn={otkWarn}/></div>
                <div><label style={{...lSt,color:"#f59e0b"}}>ЭФ ЭФИР</label>
                  <InpDate value={ser.airDate||""} onChange={v=>upSer({airDate:v})}/></div>
              </div>
              {getProjectCustomMilestones(proj).length>0&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {getProjectCustomMilestones(proj).map(def=>{
                    const vals=ser.customMilestones||[];
                    const cur=vals.find(v=>v.id===def.id)?.date||"";
                    function setCustomDate(v){
                      const next=vals.filter(x=>x.id!==def.id);
                      if(v) next.push({id:def.id,date:v});
                      upSer({customMilestones:next});
                    }
                    return <div key={def.id}><label style={{...lSt,color:def.color||"#f59e0b"}}>{def.label||"Контрольная точка"}</label><InpDate value={cur} onChange={setCustomDate}/></div>;
                  })}
                </div>
              )}
              <div style={{fontSize:10,color:"#475569",letterSpacing:1}}>——— ТРАНЗИТНЫЕ КОДЫ ———</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div>
                  <label style={lSt}>РЕКЛАМНЫЙ</label>
                  <input defaultValue={ser.transitCodeAd||""} style={iSt}
                    onBlur={e=>{if(e.target.value!==(ser.transitCodeAd||""))upSer({transitCodeAd:e.target.value});}}/>
                </div>
                <div>
                  <label style={lSt}>БЕЗРЕКЛАМНЫЙ</label>
                  <input defaultValue={ser.transitCodeNoAd||""} style={iSt}
                    onBlur={e=>{if(e.target.value!==(ser.transitCodeNoAd||""))upSer({transitCodeNoAd:e.target.value});}}/>
                </div>
              </div>
            </div>
          </div>
          <div style={cSt}>
            <div style={{fontSize:11,color:"#64748b",letterSpacing:1,marginBottom:12}}>СТАТУС СЕРИИ</div>
            {ser.delivered?(
              <div>
                <div style={{background:"#22c55e1a",border:"1px solid #22c55e44",borderRadius:12,
                  padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:20}}>OK</span>
                  <div>
                    <div style={{fontWeight:700,color:"#22c55e",fontSize:15}}>Сдана</div>
                    {ser.deliveredAt&&<div style={{fontSize:11,color:"#475569",marginTop:2}}>{ser.deliveredAt}</div>}
                  </div>
                </div>
                <button onClick={reopenSeries}
                  style={{width:"100%",padding:"9px",borderRadius:7,cursor:"pointer",
                    background:"transparent",color:"#64748b",border:"1px solid #334155",
                    fontSize:13,fontFamily:"inherit"}}>
                  Открыть серию заново
                </button>
              </div>
            ):(
              <div>
                <div style={{background:"#3b82f61a",border:"1px solid #3b82f644",borderRadius:12,
                  padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:20}}>◉</span>
                  <div style={{fontWeight:700,color:"#3b82f6",fontSize:15}}>В работе</div>
                </div>
                {totalCount>0&&(
                  <div style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:11,color:"#64748b"}}>
                      <span>Чек-листы</span>
                      <span style={{color:undoneCount===0?"#22c55e":"#94a3b8"}}>
                        {doneCount}/{totalCount} готово
                      </span>
                    </div>
                    <div style={{height:6,background:"#0f172a",borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",borderRadius:3,transition:"width 0.3s",
                        width:`${totalCount?Math.round(doneCount/totalCount*100):0}%`,
                        background:undoneCount===0?"#22c55e":"#3b82f6"}}/>
                    </div>
                  </div>
                )}
                <button disabled={!canDeliver} onClick={deliverSeries}
                  title={!canDeliver?`Закройте все пункты: открыто ${undoneCount}`:""}
                  style={{width:"100%",padding:"10px",borderRadius:12,
                    cursor:canDeliver?"pointer":"not-allowed",fontFamily:"inherit",
                    background:canDeliver?"#22c55e1a":"#0f172a",
                    color:canDeliver?"#22c55e":"#334155",
                    border:`1px solid ${canDeliver?"#22c55e44":"#1e293b"}`,
                    fontSize:14,fontWeight:700,transition:"all 0.2s"}}>
                  {canDeliver?"OK Сдать серию":` Сдать серию (открыто ${undoneCount})`}
                </button>
                {!canDeliver&&<div style={{fontSize:11,color:"#475569",marginTop:6,textAlign:"center"}}>
                  Закройте все пункты чек-листов
                </div>}
              </div>
            )}
          </div>
        </div>
      )}

      {tab==="checklists"&&(
        <div>
          {totalCount>0&&(
            <div style={{...cSt,marginBottom:14,padding:"14px 20px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:13,fontWeight:700}}>Общий прогресс</span>
                <span style={{fontSize:14,fontWeight:700,
                  color:undoneCount===0?"#22c55e":"#94a3b8"}}>
                  {doneCount} / {totalCount} OK ({totalCount?Math.round(doneCount/totalCount*100):0}%)
                </span>
              </div>
              <div style={{height:8,background:"#0f172a",borderRadius:4,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:4,transition:"width 0.3s",
                  width:`${totalCount?Math.round(doneCount/totalCount*100):0}%`,
                  background:undoneCount===0?"#22c55e":"#3b82f6"}}/>
              </div>
            </div>
          )}
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
            <Btn variant="primary" small
              onClick={()=>setNewCLForm({name:"",lines:""})}>+ Добавить чек-лист</Btn>
          </div>
          {checklists.length===0&&(
            <div style={{color:"#475569",padding:"40px 0",textAlign:"center",fontSize:14}}>
              Нет чек-листов — нажмите «+ Добавить чек-лист»
            </div>
          )}
          {checklists.map(cl=>{
            const clDone=(cl.items||[]).filter(i=>i.done).length;
            const clTotal=(cl.items||[]).length;
            return (
              <div key={cl.id} style={{...cSt,marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",
                  alignItems:"center",marginBottom:12}}>
                  {editCLId===cl.id?(
                    <input autoFocus value={editCLName}
                      onChange={e=>setEditCLName(e.target.value)}
                      onBlur={()=>{if(editCLName.trim())updCL(cl.id,{name:editCLName.trim()});
                        setEditCLId(null);}}
                      onKeyDown={e=>{
                        if(e.key==="Enter"){if(editCLName.trim())updCL(cl.id,{name:editCLName.trim()});
                          setEditCLId(null);}
                        if(e.key==="Escape")setEditCLId(null);
                      }}
                      style={{...iSt,fontSize:14,fontWeight:700,padding:"3px 8px",flex:1,marginRight:8}}/>
                  ):(
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontWeight:700,fontSize:14}}>{cl.name}</span>
                      <span style={{fontSize:11,
                        color:clDone===clTotal&&clTotal>0?"#22c55e":"#475569"}}>
                        {clDone}/{clTotal}
                      </span>
                    </div>
                  )}
                  <div style={{display:"flex",gap:2}}>
                    <button onClick={()=>{setEditCLId(cl.id);setEditCLName(cl.name);}}
                      style={{background:"none",border:"none",cursor:"pointer",
                        color:"#475569",fontSize:14,padding:"2px 7px"}}>✏</button>
                    <button onClick={()=>delChecklist(cl.id)}
                      style={{background:"none",border:"none",cursor:"pointer",
                        color:"#ef4444",fontSize:15,padding:"2px 7px"}}></button>
                  </div>
                </div>
                {(cl.items||[]).map(item=>{
                  const ck=`${cl.id}|${item.id}`;
                  const cmtOpen=openCmts[ck];
                  return (
                    <div key={item.id} style={{marginBottom:cmtOpen?6:2}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,
                        padding:"3px 0",borderBottom:"1px solid #0f172a"}}>
                        <button onClick={()=>toggleItem(cl.id,item.id)}
                          style={{background:"none",border:"none",cursor:"pointer",
                            color:item.done?"#22c55e":"#475569",
                            fontSize:19,padding:0,flexShrink:0,lineHeight:1,width:24}}>
                          {item.done?"☑":"☐"}
                        </button>
                        <input defaultValue={item.text}
                          style={{background:"none",border:"none",outline:"none",
                            color:item.done?"#475569":"#e2e8f0",fontFamily:"inherit",
                            fontSize:13,flex:1,padding:"2px 0",cursor:"text",
                            textDecoration:item.done?"line-through":"none"}}
                          onBlur={e=>{
                            const v=e.target.value.trim();
                            if(v&&v!==item.text)updItem(cl.id,item.id,{text:v});
                          }}/>
                        <button onClick={()=>setOpenCmts(p=>({...p,[ck]:!p[ck]}))}
                          title="Комментарий"
                          style={{background:"none",border:"none",cursor:"pointer",padding:"0 4px",
                            flexShrink:0,fontSize:13,
                            color:item.comment?cmtOpen?"#3b82f6":"#f59e0b":"#334155"}}>💬</button>
                        <button onClick={()=>delItem(cl.id,item.id)}
                          style={{background:"none",border:"none",cursor:"pointer",padding:"0 4px",
                            flexShrink:0,color:"#475569",fontSize:13}}>✕</button>
                      </div>
                      {cmtOpen&&(
                        <textarea defaultValue={item.comment||""}
                          rows={2} placeholder="Комментарий..."
                          style={{...iSt,fontSize:12,resize:"none",marginTop:3,
                            marginLeft:30,width:"calc(100% - 30px)",boxSizing:"border-box"}}
                          onBlur={e=>{
                            if(e.target.value!==(item.comment||""))
                              updItem(cl.id,item.id,{comment:e.target.value});
                          }}/>
                      )}
                    </div>
                  );
                })}
                <button onClick={()=>addItem(cl.id)}
                  style={{background:"none",border:"1px dashed #334155",borderRadius:10,
                    color:"#475569",cursor:"pointer",padding:"5px 12px",fontSize:11,
                    fontFamily:"inherit",marginTop:10,width:"100%"}}>
                  + Добавить пункт
                </button>
              </div>
            );
          })}
        </div>
      )}

      {tab==="notes"&&(
        <div style={cSt}>
          <label style={lSt}>ЗАМЕТКИ</label>
          <textarea defaultValue={ser.notes||""} rows={16} style={{...iSt,resize:"vertical"}}
            onBlur={e=>{if(e.target.value!==(ser.notes||""))upSer({notes:e.target.value});}}/>
        </div>
      )}

      {newCLForm&&(
        <Modal title="Новый чек-лист" onClose={()=>setNewCLForm(null)} onSubmit={createChecklist}>
          <Field label="Название">
            <Inp value={newCLForm.name}
              onChange={v=>setNewCLForm(p=>({...p,name:v}))}
              placeholder="Монтаж, Сдача мастера, Интеграции..."/>
          </Field>
          <Field label="Пункты (каждая строка — отдельный пункт)">
            <textarea value={newCLForm.lines}
              onChange={e=>setNewCLForm(p=>({...p,lines:e.target.value}))}
              placeholder={"Проверить цветокоррекцию\nЗвук сведён\nСинхра принята"}
              rows={7} style={{background:"#0f172a",border:"1px solid #334155",
                borderRadius:10,color:"#e2e8f0",padding:"8px 10px",fontSize:13,
                width:"100%",fontFamily:"inherit",resize:"vertical",outline:"none"}}/>
          </Field>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:8,
            borderTop:"1px solid #334155",paddingTop:14}}>
            <Btn variant="ghost" onClick={()=>setNewCLForm(null)}>Отмена</Btn>
            <Btn variant="primary" onClick={createChecklist}>Сохранить</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── КАРТОЧКА ПРОЕКТА ─────────────────────────────────────────────────
function ProjectCard({projectId,data,onUpdate,onBatchUpdate,onBack,onSeriesSelect,onDelete,onLog,canDeleteStructure,canEditProject,canManageProjectAssignments}){
  const {sorted:stages,stageGroups,groupMap}=useContext(StagesCtx);
  const [tab,setTab]=useState("general");
  const [editSeries,setEditSeries]=useState(null);
  const [showPwd,setShowPwd]=useState({});
  const kppDragRef=useRef(null);

  const proj=data.projects.find(p=>p.id===projectId);
  if(!proj) return <div style={{padding:24,color:"#475569"}}>Проект не найден.</div>;

  const projSeries=(data.series||[]).filter(s=>s.projectId===projectId).sort((a,b)=>(a.order||0)-(b.order||0));
  const pTasks=data.tasks.filter(t=>t.project===projectId);
  const dossier=proj.dossier||{};
  const info=dossier.info||{};

  function upProj(ch){if(!canEditProject) return;if(!canManageProjectAssignments&&(Object.prototype.hasOwnProperty.call(ch,"managers")||Object.prototype.hasOwnProperty.call(ch,"status"))) return;onUpdate("projects",data.projects.map(p=>p.id===projectId?{...p,...ch}:p));}
  function upInfo(f,v){upProj({dossier:{...dossier,info:{...info,[f]:v}}});}
  function upDoss(f,v){upProj({dossier:{...dossier,[f]:v}});}
  function upSer(sid,ch){if(!canEditProject) return;onBatchUpdate({series:(data.series||[]).map(s=>s.id===sid?{...s,...ch}:s),tasks:data.tasks});}

  function saveSeries(serData){
    if(!canEditProject) return;
    let allS=[...(data.series||[])];
    let final;
    const existing=allS.find(s=>s.id===serData.id);
    const oldName=existing?.name;
    const isNew=!serData.id||!existing;
    if(!isNew){
      final={...serData,_updatedAt:Date.now()};
      allS=allS.map(s=>s.id===serData.id?final:s);
    } else {
      // Map series dates → КПП stageRanges using group label matching
      const findGid=kw=>stageGroups.find(g=>new RegExp(kw,"i").test(g.label))?.id;
      const sr={};
      if(serData.shootStart){
        const gid=findGid("съём");
        if(gid) sr[gid]={from:serData.shootStart,to:addDays(serData.shootStart,2)};
      }
      if(serData.syncStart){
        const gid=findGid("синхр");
        if(gid) sr[gid]={from:serData.syncStart,to:addDays(serData.syncStart,1)};
      }
      if(serData.editStart){
        const gid=findGid("монтаж");
        if(gid) sr[gid]={from:serData.editStart,to:""};
      }
      if(serData.otkDate){
        const gid=findGid("отк");
        if(gid) sr[gid]={from:serData.otkDate,to:""};
      }
      final={...serData,id:"s"+Date.now(),projectId,
        order:allS.filter(s=>s.projectId===projectId).length,
        syncStart:serData.syncStart||"",
        transitCode:"",transitVariants:["","",""],
        checklists:[],notes:"",delivered:false,deliveredAt:"",assets:[],
        stageRanges:{...sr},_updatedAt:Date.now()};
      allS.push(final);
    }
    let newTasks=data.tasks;
    if(!isNew&&oldName&&oldName!==final.name)
      newTasks=newTasks.map(t=>t.seriesId===final.id&&t.series===oldName?{...t,series:final.name}:t);
    onLog?.(isNew?`Создана серия «${final.name}» → ${proj.name}`:`Серия «${final.name}» обновлена`);
    onBatchUpdate({series:allS,tasks:newTasks});
    setEditSeries(null);
  }

  function deleteSeries(id){
    if(!canDeleteStructure) return;
    if(!window.confirm("Удалить серию и все её задачи? Действие можно отменить через Ctrl+Z.")) return;
    const serName=(data.series||[]).find(s=>s.id===id)?.name||id;
    onLog?.(`Удалена серия «${serName}» → ${proj.name}`);
    onBatchUpdate(deleteSeriesSnapshot(data,id));
  }

  const iSt={background:"#0f172a",border:"1px solid #334155",borderRadius:10,
    color:"#e2e8f0",padding:"7px 10px",fontSize:13,outline:"none",fontFamily:"inherit",
    width:"100%",boxSizing:"border-box"};
  const lSt={fontSize:11,color:"#64748b",letterSpacing:1,marginBottom:3,display:"block"};

  const TABS=[
    {id:"general",label:"Общее"},
    {id:"kpp",label:`КПП (${projSeries.length})`},
    {id:"info",label:"Информация"},
    {id:"transits",label:"Транзиты"},
    {id:"access",label:"Доступы и ссылки"},
    {id:"notes",label:"Заметки"},
  ];

  return (
    <div style={{maxWidth:960,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{display:"flex",gap:1,background:"#0f172a",borderRadius:12,
          border:"1px solid #334155",overflow:"hidden",width:"fit-content"}}>
          {TABS.map(({id,label})=>(
            <button key={id} onClick={()=>setTab(id)} style={{
              padding:"6px 16px",border:"none",borderRight:"1px solid #334155",cursor:"pointer",
              fontSize:12,fontFamily:"inherit",
              background:tab===id?"#3b82f6":"transparent",
              color:tab===id?"#fff":"#64748b",
              fontWeight:tab===id?700:400}}>
              {label}
            </button>
          ))}
        </div>
        {onDelete&&canDeleteStructure&&<Btn variant="danger" small onClick={()=>onDelete(projectId)}>Удалить проект</Btn>}
      </div>

      {tab==="general"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,360px),1fr))",gap:16,alignItems:"start"}}>
          <div style={{background:"rgba(30,41,59,.72)",borderRadius:16,padding:20,
            border:`1px solid ${proj.color}66`,borderTop:`3px solid ${proj.color}`}}>
            <div style={{display:"grid",gap:12}}>
              <div>
                <label style={lSt}>НАЗВАНИЕ</label>
                <input defaultValue={proj.name} style={iSt}
                  onBlur={e=>{const v=e.target.value.trim();if(v&&v!==proj.name)upProj({name:v});}}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div>
                  <label style={lSt}>АББРЕВИАТУРА</label>
                  <input defaultValue={proj.abbr||""} style={iSt}
                    onBlur={e=>{if(e.target.value.trim()!==(proj.abbr||""))upProj({abbr:e.target.value.trim()});}}/>
                </div>
                <div>
                  <label style={lSt}>СЕЗОН</label>
                  <input defaultValue={proj.season||""} style={iSt}
                    onBlur={e=>{if(e.target.value.trim()!==(proj.season||""))upProj({season:e.target.value.trim()});}}/>
                </div>
              </div>
              <div>
                <label style={lSt}>ОПИСАНИЕ</label>
                <textarea defaultValue={proj.description||""} rows={3} style={{...iSt,resize:"vertical"}}
                  onBlur={e=>{if(e.target.value!==(proj.description||""))upProj({description:e.target.value});}}/>
              </div>
              <div>
                <label style={lSt}>{PROJECT_VISUAL_TEXT.preview.toUpperCase()}</label>
                <ProjectVisualPicker project={proj}
                  onColor={c=>upProj({color:c})}
                  onVisual={visual=>upDoss("visual",visual)}/>
              </div>
              <div>
                <label style={lSt}>{"\u041c\u0415\u041d\u0415\u0414\u0416\u0415\u0420\u042b"}</label>
                {canManageProjectAssignments?<ManagerPicker value={proj.managers||[]} options={(data.people||[]).filter(p=>p.active!==false&&p.roles&&(p.roles.includes("\u043c\u043d\u0434\u0436\u0440")||p.roles.includes("\u043f\u0440\u043e\u0434\u044e\u0441\u0435\u0440")))} onChange={v=>upProj({managers:v})}/>:<div style={{fontSize:13,color:"#94a3b8",padding:"7px 10px",background:"#0f172a",border:"1px solid #334155",borderRadius:10}}>{(proj.managers||[]).map(m=>m.name||m.uid||m).filter(Boolean).join(", ")||"-"}</div>}
              </div>
              <div style={{fontSize:10,color:"#475569",letterSpacing:1}}>——— КЛЮЧЕВЫЕ СОБЫТИЯ ———</div>
              {SERIES_MILESTONES.filter(m=>m.configurable).map(base=>{
                const meta=getProjectMilestoneMeta(proj,base.key,base);
                function setMeta(ch){upDoss("milestoneMeta",{...(dossier.milestoneMeta||{}),[base.key]:{...((dossier.milestoneMeta||{})[base.key]||{}),...ch}});}
                return <div key={base.key} style={{display:"grid",gridTemplateColumns:"1fr 44px",gap:8,alignItems:"end"}}>
                  <div><label style={lSt}>{base.label}</label><input value={meta.label} style={iSt} onChange={e=>setMeta({label:e.target.value,abbr:e.target.value})}/></div>
                  <input type="color" value={meta.color} onChange={e=>setMeta({color:e.target.value})} style={{width:40,height:36,border:"none",background:"none",cursor:"pointer",padding:2,borderRadius:4}}/>
                </div>;
              })}
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <label style={lSt}>ДОП. ТОЧКИ</label>
                  {(dossier.customMilestones||[]).length<CUSTOM_MILESTONE_LIMIT&&<Btn small variant="ghost" onClick={()=>upDoss("customMilestones",[...(dossier.customMilestones||[]),{id:"m"+Date.now(),label:"Контрольная точка",color:"#f59e0b"}])}>+ Добавить</Btn>}
                </div>
                {(dossier.customMilestones||[]).map((m,idx)=>{
                  const items=dossier.customMilestones||[];
                  function upd(ch){const next=[...items];next[idx]={...next[idx],...ch};upDoss("customMilestones",next);}
                  return <div key={m.id} style={{display:"grid",gridTemplateColumns:"1fr 44px auto",gap:8,alignItems:"center",marginBottom:6}}>
                    <input value={m.label||""} style={iSt} onChange={e=>upd({label:e.target.value})}/>
                    <input type="color" value={m.color||"#f59e0b"} onChange={e=>upd({color:e.target.value})} style={{width:40,height:36,border:"none",background:"none",cursor:"pointer",padding:2,borderRadius:4}}/>
                    <button onClick={()=>upDoss("customMilestones",items.filter((_,i)=>i!==idx))} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:18}}>×</button>
                  </div>;
                })}
              </div>
            </div>
          </div>
          <div style={{background:"rgba(30,41,59,.72)",borderRadius:16,padding:20,border:"1px solid rgba(148,163,184,.18)"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#64748b",marginBottom:10,letterSpacing:1}}>СЕРИИ</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {projSeries.map(ser=>{
                const todayStr=formatDate(new Date());
                const sTasks=pTasks.filter(t=>(t.seriesId===ser.id||t.series===ser.name)&&t.day===todayStr);
                const maxIdx=Math.max(...sTasks.map(t=>stages.findIndex(s=>s.id===t.status)).filter(x=>x>=0),-1);
                const autoStage=maxIdx>=0?stages[maxIdx]:null;
                const autoGroupId=autoStage?.groupId||"";
                const autoGroup=autoGroupId?groupMap[autoGroupId]:null;
                const autoGroupOrder=autoGroup?.order||0;
                const manualGroupId=ser.manualStatus||"";
                const manualGroup=manualGroupId?groupMap[manualGroupId]:null;
                const displayGroup=manualGroupId?manualGroup:autoGroup;
                const isManual=!!manualGroupId;
                const bc=autoStage?autoStage.color:proj.color;
                return (
                  <div key={ser.id}
                    onDoubleClick={()=>onSeriesSelect&&onSeriesSelect(ser.id)}
                    title="Двойной клик — открыть карточку серии"
                    style={{borderLeft:`3px solid ${bc}`,background:"#0f172a",cursor:"pointer",
                      borderRadius:10,padding:"8px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:5}}>
                        {ser.name}
                        {isManual&&<span title="Ручной статус" style={{fontSize:9,color:"#f59e0b"}}></span>}
                        {ser.delivered&&<span title="Сдана" style={{fontSize:9,color:"#22c55e"}}>OK</span>}
                      </div>
                      {displayGroup&&<div style={{fontSize:10,color:bc,marginTop:2}}>{displayGroup.label}</div>}
                    </div>
                    <div style={{fontSize:11,color:"#475569"}}>{sTasks.length} задач</div>
                  </div>
                );
              })}
              {projSeries.length===0&&<div style={{color:"#475569",fontSize:13}}>Нет серий</div>}
            </div>
          </div>
        </div>
      )}

      {tab==="kpp"&&(()=>{
        const milestoneDefs=getProjectMilestoneDefinitions(proj);
        const stageRows=[...stageGroups].sort((a,b)=>(b.order||0)-(a.order||0)).map(g=>{
          const stg=stages.find(s=>s.groupId===g.id);
          return {kind:"stage",id:g.id,label:g.label,color:stg?.color||proj.color,group:g};
        });
        const milestoneRows=milestoneDefs.map(def=>({kind:"milestone",id:def.key,label:def.label,color:def.color||proj.color,def}));
        const rows=[...stageRows,...milestoneRows];
        function updateMilestone(ser,def,date){
          upSer(ser.id,seriesMilestonePatch(ser,def,date));
        }
        return (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
            <div style={{fontSize:12,color:"#64748b",fontWeight:700}}>
              {"\u041a\u041f\u041f: \u044d\u0442\u0430\u043f\u044b \u043f\u043e \u0444\u0430\u043a\u0442\u0443 \u0441\u043c\u0435\u043d, \u043a\u043e\u043d\u0442\u0440\u043e\u043b\u044c\u043d\u044b\u0435 \u0442\u043e\u0447\u043a\u0438 \u0438\u0437 \u043a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u044f"}
            </div>
            <Btn variant="primary" small disabled={!canEditProject}
              onClick={()=>canEditProject&&setEditSeries({name:"",projectId,shootStart:"",shootEnd:"",syncStart:"",
                editStart:"",preOtkDate:"",otkDate:"",sendDate:"",airDate:"",
                airMode:"weekly",airDay:1,airTime:"21:00"})}>
              {"\u002b \u041d\u043e\u0432\u0430\u044f \u0441\u0435\u0440\u0438\u044f"}
            </Btn>
          </div>
          <div style={{background:"rgba(30,41,59,.72)",borderRadius:16,border:"1px solid rgba(148,163,184,.18)",overflowX:"auto"}}>
            {projSeries.length===0?(
              <div style={{padding:32,color:"#64748b",fontSize:14,textAlign:"center"}}>
                {"\u041d\u0435\u0442 \u0441\u0435\u0440\u0438\u0439. \u041d\u0430\u0436\u043c\u0438\u0442\u0435 \u00ab+ \u041d\u043e\u0432\u0430\u044f \u0441\u0435\u0440\u0438\u044f\u00bb"}
              </div>
            ):(
              <table style={{borderCollapse:"separate",borderSpacing:0,minWidth:Math.max(720,220+projSeries.length*190)}}>
                <thead>
                  <tr>
                    <th style={{padding:"9px 14px",fontSize:11,color:"#94a3b8",letterSpacing:1,
                      textAlign:"left",borderBottom:"1px solid #334155",borderRight:"1px solid #334155",
                      position:"sticky",left:0,background:"#1e293b",zIndex:3,whiteSpace:"nowrap",minWidth:220}}>
                      {"\u042d\u0422\u0410\u041f / \u041a\u041e\u041d\u0422\u0420\u041e\u041b\u042c\u041d\u0410\u042f \u0422\u041e\u0427\u041a\u0410"}
                    </th>
                    {projSeries.map(ser=>(
                      <th key={ser.id}
                        draggable
                        onDragStart={e=>{kppDragRef.current=ser.id;e.dataTransfer.effectAllowed="move";}}
                        onDragOver={e=>e.preventDefault()}
                        onDrop={e=>{
                          e.preventDefault();
                          const srcId=kppDragRef.current;
                          if(!srcId||srcId===ser.id) return;
                          const arr=[...projSeries];
                          const si=arr.findIndex(s=>s.id===srcId),ti=arr.findIndex(s=>s.id===ser.id);
                          if(si===-1||ti===-1) return;
                          const item=arr.splice(si,1)[0];arr.splice(ti,0,item);
                          const others=(data.series||[]).filter(s=>s.projectId!==projectId);
                          onBatchUpdate({series:[...others,...arr.map((s,i)=>({...s,order:i}))],tasks:data.tasks});
                          kppDragRef.current=null;
                        }}
                        onDragEnd={()=>{kppDragRef.current=null;}}
                        style={{padding:"8px 10px",fontSize:12,fontWeight:800,textAlign:"left",
                          borderBottom:"1px solid #334155",borderLeft:"1px solid #334155",minWidth:190,maxWidth:220,
                          background:"rgba(15,23,42,.48)",cursor:"grab"}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0}}>
                          <span style={{fontSize:10,color:"#64748b",flexShrink:0}}>::</span>
                          <span onDoubleClick={()=>onSeriesSelect&&onSeriesSelect(ser.id)} title={ser.name}
                            style={{cursor:"pointer",flex:"1 1 0",minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:ser.delivered?"#22c55e":"#e2e8f0"}}>
                            {ser.name}{ser.delivered?" \u00b7 \u0441\u0434\u0430\u043d\u0430":""}
                          </span>
                          <button title="Edit" disabled={!canEditProject} onClick={()=>canEditProject&&setEditSeries(ser)}
                            style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:11,padding:"0 2px",lineHeight:1,flexShrink:0}}>{"\u0438\u0437\u043c"}</button>
                          <button title="Delete" disabled={!canDeleteStructure} onClick={()=>canDeleteStructure&&deleteSeries(ser.id)}
                            style={{background:"none",border:"none",color:"#ef444466",cursor:"pointer",fontSize:14,padding:"0 2px",lineHeight:1,flexShrink:0}}>x</button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row,idx)=>(
                    <tr key={row.kind+"-"+row.id}>
                      <td style={{padding:"9px 12px",position:"sticky",left:0,zIndex:2,background:"#1e293b",
                        borderLeft:"4px solid "+row.color,borderRight:"1px solid #334155",borderBottom:"1px solid rgba(51,65,85,.72)",whiteSpace:"nowrap"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:10,fontWeight:900,color:row.kind==="milestone"?"#fbbf24":"#93c5fd",
                            background:"rgba(15,23,42,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:999,padding:"2px 7px"}}>
                            {row.kind==="milestone"?"\u041a\u0422":"\u042d\u0422\u0410\u041f"}
                          </span>
                          <span style={{fontSize:12,fontWeight:900,color:row.kind==="milestone"?row.color:"#e2e8f0"}}>{row.label}</span>
                        </div>
                      </td>
                      {projSeries.map(ser=>{
                        if(row.kind==="milestone"){
                          const val=getSeriesMilestoneValue(ser,row.def);
                          return <td key={ser.id} style={{padding:"7px 8px",borderLeft:"1px solid #0f172a",borderBottom:"1px solid rgba(51,65,85,.48)",background:val?(row.color+"14"):"transparent"}}>
                            <input type="date" value={toInput(val)} disabled={!canEditProject}
                              onChange={e=>updateMilestone(ser,row.def,fromInput(e.target.value))}
                              style={{background:"rgba(8,13,26,.68)",border:"1px solid rgba(148,163,184,.22)",borderRadius:9,
                                color:val?"#e2e8f0":"#64748b",fontSize:12,outline:"none",width:"100%",minWidth:130,
                                cursor:canEditProject?"pointer":"default",fontFamily:"inherit",padding:"5px 8px"}}/>
                          </td>;
                        }
                        const actual=getSeriesGroupTaskRange(ser,row.group,stages,data.tasks);
                        const manual=(ser.stageRanges||{})[row.group.id]||{};
                        function setManual(field,date){
                          const old=ser.stageRanges||{};
                          const next={...old,[row.group.id]:{...(old[row.group.id]||{}),[field]:date}};
                          upSer(ser.id,{stageRanges:next});
                        }
                        return <td key={ser.id} style={{padding:"7px 8px",borderLeft:"1px solid #0f172a",borderBottom:"1px solid rgba(51,65,85,.48)",
                          background:actual.count?`linear-gradient(135deg, ${row.color}22, rgba(15,23,42,.72))`:"transparent",
                          boxShadow:actual.count?`inset 3px 0 0 ${row.color}`:"none",verticalAlign:"top"}}>
                          <div style={{display:"flex",flexDirection:"column",gap:6,minWidth:170}}>
                            {actual.count?(
                              <div style={{display:"flex",alignItems:"center",gap:7,padding:"6px 8px",borderRadius:10,
                                background:"rgba(8,13,26,.50)",border:`1px solid ${row.color}66`}}>
                                <span style={{width:18,height:18,borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center",
                                  background:row.color,color:"#06111f",fontSize:10,fontWeight:950,flexShrink:0}}>OK</span>
                                <div style={{minWidth:0}}>
                                  <div style={{fontSize:11,color:"#f8fafc",fontWeight:950,whiteSpace:"nowrap"}}>{"\u042d\u0442\u0430\u043f \u043f\u0440\u043e\u0441\u0442\u0430\u0432\u043b\u0435\u043d"}</div>
                                  <div style={{fontSize:10,color:"#cbd5e1",fontWeight:800,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                                    {actual.from}{actual.to&&actual.to!==actual.from?(" - "+actual.to):""}{" / "}{actual.count} {"\u0441\u043c\u0435\u043d"}
                                  </div>
                                </div>
                              </div>
                            ):(
                              <div style={{fontSize:10,color:"#475569",fontWeight:800,whiteSpace:"nowrap",padding:"2px 0"}}>{"\u0424\u0430\u043a\u0442\u0430 \u043d\u0435\u0442"}</div>
                            )}
                            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,opacity:actual.count?0.72:1}}>
                              <input type="date" value={toInput(manual.from||"")} disabled={!canEditProject}
                                title={"\u041f\u043b\u0430\u043d/\u0440\u0443\u0447\u043d\u043e\u0435 \u043d\u0430\u0447\u0430\u043b\u043e"}
                                onChange={e=>setManual("from",fromInput(e.target.value))}
                                style={{background:"rgba(8,13,26,.52)",border:"1px solid rgba(148,163,184,.16)",borderRadius:8,color:manual.from?"#e2e8f0":"#64748b",fontSize:11,padding:"4px 5px",minWidth:0}}/>
                              <input type="date" value={toInput(manual.to||"")} disabled={!canEditProject}
                                title={"\u041f\u043b\u0430\u043d/\u0440\u0443\u0447\u043d\u043e\u0439 \u043a\u043e\u043d\u0435\u0446"}
                                onChange={e=>setManual("to",fromInput(e.target.value))}
                                style={{background:"rgba(8,13,26,.52)",border:"1px solid rgba(148,163,184,.16)",borderRadius:8,color:manual.to?"#e2e8f0":"#64748b",fontSize:11,padding:"4px 5px",minWidth:0}}/>
                            </div>
                          </div>
                        </td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        );
      })()}

      {tab==="info"&&(
        <div style={{background:"rgba(30,41,59,.72)",borderRadius:16,padding:20,border:"1px solid rgba(148,163,184,.18)"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[
              ["ТИП КОНТЕНТА","type"],
              ["ХРОНОМЕТРАЖ","duration"],
              ["ПУТЬ НА СЕРВЕРЕ","serverPath"],
              ["ПРИНИМАЮЩИЙ ПРОДЮСЕР","receivingProducer"],
              ["ТЕЛЕФОН ПР. ПРОДЮСЕРА","receivingProducerPhone"],
              ["ТЕЛЕФОН МЕНЕДЖЕРА","managerPhone"],
              ["КОЛ-ВО ВЕРСИЙ","versions"],
              ["РЕКЛАМНЫЙ ХРОНОМЕТРАЖ","adRules"],
              ["РАСПИСАНИЕ ЭФИРА","airSchedule"],
              ["СПОСОБ ДОСТАВКИ","deliveryMethod"],
            ].map(([l,f])=>(
              <div key={f}>
                <label style={lSt}>{l}</label>
                <input defaultValue={info[f]||""} style={iSt}
                  onBlur={e=>{if(e.target.value!==(info[f]||""))upInfo(f,e.target.value);}}/>
              </div>
            ))}
            <div style={{gridColumn:"1 / -1"}}>
              <label style={lSt}>ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ</label>
              <textarea defaultValue={info.technicalRequirements||""} rows={4}
                style={{...iSt,resize:"vertical"}}
                onBlur={e=>{if(e.target.value!==(info.technicalRequirements||""))upInfo("technicalRequirements",e.target.value);}}/>
            </div>
          </div>
        </div>
      )}

      {tab==="transits"&&(
        <div style={{background:"rgba(30,41,59,.72)",borderRadius:16,padding:20,border:"1px solid rgba(148,163,184,.18)",overflowX:"auto"}}>
          {projSeries.length===0?
            <div style={{color:"#475569",fontSize:14}}>Нет серий</div>
          :(
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:320}}>
              <thead>
                <tr>
                  {["Серия","Рекламный","Безрекламный"].map((h,i)=>(
                    <th key={i} style={{textAlign:"left",padding:"6px 10px",fontSize:11,
                      color:"#64748b",letterSpacing:1,borderBottom:"1px solid #334155",whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projSeries.map(ser=>(
                  <tr key={ser.id} style={{borderBottom:"1px solid #1e293b"}}>
                    <td style={{padding:"6px 10px",fontWeight:700,fontSize:13,whiteSpace:"nowrap"}}>{ser.name}</td>
                    <td style={{padding:"4px 6px",minWidth:200}}>
                      <input defaultValue={ser.transitCodeAd||""} style={{...iSt,fontSize:12,padding:"4px 8px"}}
                        onBlur={e=>{if(e.target.value!==(ser.transitCodeAd||""))upSer(ser.id,{transitCodeAd:e.target.value});}}/>
                    </td>
                    <td style={{padding:"4px 6px",minWidth:200}}>
                      <input defaultValue={ser.transitCodeNoAd||""} style={{...iSt,fontSize:12,padding:"4px 8px"}}
                        onBlur={e=>{if(e.target.value!==(ser.transitCodeNoAd||""))upSer(ser.id,{transitCodeNoAd:e.target.value});}}/>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab==="access"&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {[
            {key:"paths",title:"Пути на сервере",
              fields:[{k:"label",ph:"Название"},{k:"path",ph:"Путь"}],
              empty:{label:"",path:""}},
            {key:"accesses",title:"Доступы",
              fields:[{k:"label",ph:"Название"},{k:"login",ph:"Логин"},{k:"password",ph:"Пароль",pwd:true}],
              empty:{label:"",login:"",password:""}},
            {key:"links",title:"Ссылки",
              fields:[{k:"label",ph:"Название"},{k:"url",ph:"URL"}],
              empty:{label:"",url:""}},
          ].map(({key,title,fields,empty})=>{
            const items=dossier[key]||[];
            return (
              <div key={key} style={{background:"rgba(30,41,59,.72)",borderRadius:16,padding:20,border:"1px solid rgba(148,163,184,.18)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <span style={{fontSize:13,fontWeight:700,color:"#94a3b8"}}>{title}</span>
                  <Btn small variant="default" onClick={()=>upDoss(key,[...items,{...empty}])}>+ Добавить</Btn>
                </div>
                {items.length===0&&<div style={{color:"#475569",fontSize:12}}>Пусто</div>}
                {items.map((item,idx)=>(
                  <div key={idx} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
                    {fields.map(({k,ph,pwd})=>{
                      const pwKey=`${key}-${idx}-${k}`;
                      const shown=showPwd[pwKey];
                      return (
                        <div key={k} style={{flex:1,position:"relative"}}>
                          <input type={pwd&&!shown?"password":"text"}
                            defaultValue={item[k]||""} placeholder={ph} style={iSt}
                            onBlur={e=>{
                              if(e.target.value!==(item[k]||"")){
                                const ni=[...items];ni[idx]={...ni[idx],[k]:e.target.value};
                                upDoss(key,ni);
                              }
                            }}/>
                          {pwd&&(
                            <button onClick={()=>setShowPwd(p=>({...p,[pwKey]:!p[pwKey]}))}
                              style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",
                                background:"none",border:"none",cursor:"pointer",color:"#475569",fontSize:14,padding:0}}>
                              {shown?"":""}
                            </button>
                          )}
                        </div>
                      );
                    })}
                    <button onClick={()=>upDoss(key,items.filter((_,i)=>i!==idx))}
                      style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",
                        fontSize:18,padding:"0 4px",flexShrink:0,lineHeight:1}}>×</button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {tab==="notes"&&(
        <div style={{background:"rgba(30,41,59,.72)",borderRadius:16,padding:20,border:"1px solid rgba(148,163,184,.18)"}}>
          <label style={lSt}>ЗАМЕТКИ</label>
          <textarea defaultValue={dossier.notes||""} rows={14} style={{...iSt,resize:"vertical"}}
            onBlur={e=>{if(e.target.value!==(dossier.notes||""))upDoss("notes",e.target.value);}}/>
        </div>
      )}

      {editSeries&&(
        <SeriesModal series={editSeries} project={proj} data={data}
          templates={data.templates||[]}
          onSave={saveSeries}
          onClose={()=>setEditSeries(null)}/>
      )}
    </div>
  );
}

// ── APP ──────────────────────────────────────────────────────────────
// ── COMMAND PALETTE ──────────────────────────────────────────────────
function CommandPalette({data,onClose,onNavigate,onSetView,onSetGanttDay}){
  const [query,setQuery]=useState("");
  const [selIdx,setSelIdx]=useState(0);
  const inputRef=useRef(null);
  const listRef=useRef(null);

  useEffect(()=>{inputRef.current?.focus();},[]);
  useEffect(()=>{setSelIdx(0);},[query]);

  const NAV_CMDS=[
    {id:"today",    label:"Сегодня",   sub:"расписание на сегодня",   icon:"📅"},
    {id:"gantt",    label:"Гант",      sub:"диаграмма Ганта",         icon:"📊"},
    {id:"calendar", label:"Календарь", sub:"календарный вид",         icon:"🗓"},
    {id:"projects", label:"Проекты",   sub:"список проектов",         icon:"📁"},
    {id:"people",   label:"По людям",  sub:"нагрузка людей",          icon:"👥"},
    {id:"days",     label:"\u041d\u0415\u0414\u0415\u041b\u042f", sub:"\u043d\u0435\u0434\u0435\u043b\u044c\u043d\u044b\u0439 \u0432\u0438\u0434", icon:""},
    {id:"analytics",label:"Аналитика", sub:"статистика и отчёты",     icon:"📈"},
    {id:"directory",label:"Настройки", sub:"этапы, роли, праздники",  icon:"⚙"},
  ];

  const results=useMemo(()=>{
    const q=query.trim().toLowerCase();
    if(!q) return [];
    const words=q.split(/\s+/);
    const score=(text)=>{
      const t=(text||"").toLowerCase();
      if(!words.every(w=>t.includes(w))) return 0;
      if(t.startsWith(q)) return 3;
      if(t.includes(q)) return 2;
      return 1;
    };

    // Detect "create" intent
    const CREATE_TRIGGERS=["создать","создат","добавить","новый","новая","новое","новую"];
    const isCreate=words.some(w=>CREATE_TRIGGERS.some(ct=>ct.startsWith(w)||w===ct));

    const items=[];

    if(isCreate){
      // Parse target entity
      const isSmen=words.some(w=>["смену","смены","смен","задачу","задач","задачи","шифт"].includes(w));
      const isProj=words.some(w=>["проект","проекта","проекты"].includes(w));
      const isSer=words.some(w=>["серию","серии","серий","серия"].includes(w));

      // Parse task prefill: stage, project, date
      const parsePrefill=()=>{
        const today=new Date();
        const dateMap={"сегодня":0,"завтра":1,"послезавтра":2};
        let day=null,stageId=null,projectId=null;
        const STAGES=data.stages||DEFAULT_STAGES;
        words.forEach(w=>{
          if(dateMap[w]!==undefined){
            const d=new Date(today);d.setDate(d.getDate()+dateMap[w]);
            day=`${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`;
          }
          const dm=w.match(/^(\d{1,2})\.(\d{2})$/);
          if(dm) day=`${dm[1].padStart(2,"0")}.${dm[2]}.${today.getFullYear()}`;
          STAGES.forEach(s=>{
            const sl=s.label.toLowerCase();
            if(sl.includes(w)||w.includes(sl.slice(0,4))||s.id.includes(w)) stageId=s.id;
          });
          (data.projects||[]).forEach(p=>{
            const pl=(p.name||'').toLowerCase(),al=(p.abbr||"").toLowerCase();
            if(pl.includes(w)||al===w||w.includes(al)) projectId=p.id;
          });
        });
        return {day,stageId,projectId};
      };

      if(isSmen||(!isProj&&!isSer&&words.length>1)){
        const pf=parsePrefill();
        const proj=pf.projectId?(data.projects||[]).find(p=>p.id===pf.projectId):null;
        const stg=(data.stages||DEFAULT_STAGES).find(s=>s.id===pf.stageId);
        const hints=[stg?.label,proj?.name,pf.day].filter(Boolean);
        items.push({type:"create",createType:"task",score:20,icon:"",
          label:"Создать смену"+(hints.length?` — ${hints.join(", ")}`:""),
          sub:"Открыть Гант с заполненной формой",
          prefill:{status:pf.stageId||"",project:pf.projectId||"",day:pf.day||""},
        });
      }
      if(isProj||!isSmen){
        items.push({type:"create",createType:"project",score:18,icon:"📁",
          label:"Создать проект",sub:"Перейти в раздел Проекты → +",
        });
      }
      if(isSer||!isSmen){
        items.push({type:"create",createType:"series",score:17,icon:"🎬",
          label:"Создать серию",sub:"Перейти в Проекты и добавить серию",
        });
      }
    }

    NAV_CMDS.forEach(cmd=>{
      const s=score(`${cmd.label} ${cmd.sub} ${cmd.id}`);
      if(s>0) items.push({type:"nav",id:cmd.id,label:cmd.label,sub:cmd.sub,icon:cmd.icon,score:s+10});
    });
    (data.projects||[]).forEach(p=>{
      const s=score(`${p.name} ${p.abbr||""} ${p.description||""}`);
      if(s>0) items.push({type:"project",id:p.id,label:p.name,
        sub:[p.abbr,p.description].filter(Boolean).join(" · "),color:p.color,score:s});
    });
    (data.series||[]).forEach(ser=>{
      const proj=(data.projects||[]).find(p=>p.id===ser.projectId);
      const s=score(`${ser.name} ${proj?.name||""} ${proj?.abbr||""}`);
      if(s>0) items.push({type:"series",id:ser.id,
        label:`${proj?.abbr||proj?.name||""} · ${ser.name}`,
        sub:proj?.name||"",color:proj?.color,score:s});
    });
    (data.people||[]).filter(p=>p.active!==false).forEach(p=>{
      const s=score(p.name);
      if(s>0) items.push({type:"person",id:p.id,label:p.name,
        sub:(p.roles||[]).join(", "),score:s});
    });
    // Tasks + notes search
    const STAGES=data.stages||DEFAULT_STAGES;
    (data.tasks||[]).filter(t=>!t.cancelled).forEach(t=>{
      const proj=(data.projects||[]).find(p=>p.id===t.project);
      const stg=STAGES.find(s=>s.id===t.status);
      const searchText=[t.series,t.person,proj?.name,proj?.abbr,stg?.label,canSeeTaskNotes()?t.note:"",t.day].filter(Boolean).join(" ");
      const s=score(searchText);
      if(s>0) items.push({type:"task",id:t.id,task:t,
        label:`${t.series}${t.person?" · "+t.person:""}`,
        sub:[t.day,stg?.label,canSeeTaskNotes()?t.note:""].filter(Boolean).join(" · "),
        color:proj?.color,score:s});
    });
    const ORDER={create:-1,nav:0,project:1,series:2,person:3,task:4};
    return items.sort((a,b)=>b.score-a.score||(ORDER[a.type]||9)-(ORDER[b.type]||9)).slice(0,30);
  },[query,data]);

  useEffect(()=>{
    if(!listRef.current) return;
    const el=listRef.current.querySelector("[data-sel=true]");
    el?.scrollIntoView({block:"nearest"});
  },[selIdx]);

  function handleKey(e){
    if(e.key==="Escape"){e.stopPropagation();onClose();return;}
    if(e.key==="ArrowDown"){e.preventDefault();setSelIdx(i=>Math.min(i+1,results.length-1));}
    if(e.key==="ArrowUp"){e.preventDefault();setSelIdx(i=>Math.max(i-1,0));}
    if(e.key==="Enter"){e.preventDefault();if(results[selIdx]) pick(results[selIdx]);}
  }
  function pick(item){
    if(item.type==="nav"){onSetView(item.id);onNavigate(null);}
    else if(item.type==="project") onNavigate({type:"project",id:item.id});
    else if(item.type==="series")  onNavigate({type:"series", id:item.id});
    else if(item.type==="person")  onNavigate({type:"person", id:item.id});
    else if(item.type==="task"){
      onSetGanttDay?.(item.task.day);
      onSetView("gantt");onNavigate(null);
      setTimeout(()=>window.dispatchEvent(new CustomEvent("gantt-new-task",{detail:item.task})),80);
    }
    else if(item.type==="create"){
      if(item.createType==="task"){
        onSetView("gantt");onNavigate(null);
        setTimeout(()=>window.dispatchEvent(new CustomEvent("gantt-new-task",{detail:item.prefill||{}})),80);
      } else if(item.createType==="project"||item.createType==="series"){
        onSetView("projects");onNavigate(null);
      }
    }
    onClose();
  }

  const TYPE_LABELS={create:"СОЗДАТЬ",nav:"НАВИГАЦИЯ",project:"ПРОЕКТЫ",series:"СЕРИИ",person:"ЛЮДИ",task:"ЗАДАЧИ"};
  const displayList=useMemo(()=>{
    const out=[];let lastType=null;
    results.forEach((r,idx)=>{
      if(r.type!==lastType){out.push({isHeader:true,label:TYPE_LABELS[r.type]||r.type,key:"h-"+r.type});lastType=r.type;}
      out.push({...r,flatIdx:idx});
    });
    return out;
  },[results]);

  const kbd={fontSize:10,color:"#475569",background:"#0f172a",border:"1px solid #334155",
    borderRadius:4,padding:"1px 5px",fontFamily:"inherit",display:"inline-block"};

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",zIndex:9999,
      display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:"8vh"}}
      onClick={e=>{if(e.target===e.currentTarget) onClose();}}>
      <div style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,
        width:"min(640px,92vw)",maxHeight:"70vh",display:"flex",flexDirection:"column",
        boxShadow:"0 25px 60px rgba(0,0,0,0.65)",overflow:"hidden"}}>

        <div style={{display:"flex",alignItems:"center",padding:"12px 16px",
          borderBottom:"1px solid #334155",gap:10}}>
          <span style={{fontSize:14,color:"#475569",flexShrink:0}}>🔍</span>
          <input ref={inputRef} value={query}
            onChange={e=>setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Поиск или «создать смену монтажа СВ завтра»..."
            style={{flex:1,background:"none",border:"none",outline:"none",
              fontSize:15,color:"#e2e8f0",fontFamily:"inherit"}}/>
          {query&&<button onClick={()=>setQuery("")}
            style={{background:"none",border:"none",color:"#475569",cursor:"pointer",
              fontSize:13,padding:"2px 4px",lineHeight:1}}>✕</button>}
          <span style={kbd}>ESC</span>
        </div>

        <div ref={listRef} style={{overflowY:"auto",flex:1}}>
          {!query.trim()&&(
            <div style={{padding:"18px 16px"}}>
              <div style={{fontSize:12,color:"#475569",marginBottom:10}}>
                Поиск по проектам, сериям и людям. Или напишите «создать смену монтажа СВ завтра»
              </div>
              <div style={{display:"flex",gap:14,flexWrap:"wrap",fontSize:11,color:"#475569"}}>
                <span><span style={kbd}>↑</span> <span style={kbd}>↓</span> навигация</span>
                <span><span style={kbd}>Enter</span> открыть</span>
                <span><span style={kbd}>Esc</span> закрыть</span>
                <span><span style={kbd}>Ctrl+K</span> открыть</span>
              </div>
            </div>
          )}
          {query.trim()&&results.length===0&&(
            <div style={{padding:"28px 16px",textAlign:"center",color:"#475569",fontSize:13}}>
              Ничего не найдено по запросу «{query}»
            </div>
          )}
          {displayList.map((item,i)=>{
            if(item.isHeader) return (
              <div key={item.key} style={{padding:"8px 16px 3px",fontSize:10,
                color:"#334155",letterSpacing:2,fontWeight:700}}>{item.label}</div>
            );
            const sel=item.flatIdx===selIdx;
            return (
              <div key={item.type+(item.id||item.createType||i)} data-sel={sel}
                onMouseEnter={()=>setSelIdx(item.flatIdx)}
                onClick={()=>pick(item)}
                style={{padding:"7px 16px",cursor:"pointer",display:"flex",
                  alignItems:"center",gap:10,background:sel?"#334155":"transparent"}}>
                {item.icon?(
                  <span style={{fontSize:13,width:18,textAlign:"center",flexShrink:0}}>{item.icon}</span>
                ):item.color?(
                  <span style={{width:8,height:8,borderRadius:"50%",background:item.color,
                    flexShrink:0,display:"inline-block"}}/>
                ):(
                  <span style={{width:18,fontSize:11,color:"#475569",flexShrink:0,textAlign:"center"}}>·</span>
                )}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#e2e8f0",
                    whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.label}</div>
                  {item.sub&&<div style={{fontSize:11,color:"#64748b",
                    whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.sub}</div>}
                </div>
                {sel&&<span style={{fontSize:11,color:"#475569",flexShrink:0}}>↵</span>}
              </div>
            );
          })}
        </div>

        {results.length>0&&(
          <div style={{padding:"5px 16px",borderTop:"1px solid #1e293b",
            fontSize:10,color:"#334155"}}>
            Найдено: {results.length}
          </div>
        )}
      </div>
    </div>
  );
}

// Массивы сущностей, у которых возможен soft-delete
const SOFT_DELETE_KEYS=["tasks","projects","series","people","personAbsences"];

// ── АВТОРИЗАЦИЯ ────────────────────────────────────────────────────
async function doLogin(login,password){
  const res=await fetch("/api/auth/login",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    credentials:"include",
    body:JSON.stringify({login,password})
  });
  const data=await res.json();
  setCsrfToken(data.csrfToken);
  return data;
}

async function doLogout(){
  await csrfFetch("/api/auth/logout",{method:"POST",credentials:"include"});
  setCsrfToken("");
}

// ── СЧЁТЧИК (одометр / механический счётчик пробега) ──────────
function FlipUnit({digit}){
  const [rolling,setRolling]=React.useState(false);
  const curRef=React.useRef(digit);
  
  React.useEffect(()=>{
    if(curRef.current!==digit){
      setRolling(true);
      const t=setTimeout(()=>{
        curRef.current=digit;
        setRolling(false);
      },220);
      return ()=>clearTimeout(t);
    }
  },[digit]);

  const d=rolling?curRef.current:digit;

  return (
    <span style={{display:"inline-flex",flexDirection:"column",width:16,height:24,
      position:"relative",overflow:"hidden",textAlign:"center",flexShrink:0,
      fontFamily:"'Space Grotesk','Courier New',monospace",fontWeight:700,fontSize:16,
      color:"#e2e8f0",background:"#1e293b",borderRadius:3,border:"1px solid #334155",
      margin:"0 1px"}}>
      <span style={{
        display:"flex",flexDirection:"column",
        transform:rolling?"translateY(-50%)":"translateY(0)",
        transition:rolling?"transform 0.22s ease-out":"none"
      }}>
        <span style={{height:24,lineHeight:"24px"}}>{d}</span>
        <span style={{height:24,lineHeight:"24px"}}>{digit}</span>
      </span>
    </span>
  );
}

function FlipClock(){
  const [time,setTime]=React.useState(new Date());
  React.useEffect(()=>{
    const id=setInterval(()=>setTime(new Date()),1000);
    return ()=>clearInterval(id);
  },[]);
  const h=time.getHours(), m=time.getMinutes(), s=time.getSeconds();

  const Sep=()=><span style={{color:"#60a5fa",fontWeight:700,fontSize:14,
    lineHeight:'24px',margin:'0 1px',userSelect:'none'}}>:</span>;

  return (
    <span style={{display:"flex",alignItems:"center",gap:0,flexShrink:0,marginRight:8}}>
      <FlipUnit digit={Math.floor(h/10)}/>
      <FlipUnit digit={h%10}/>
      <Sep/>
      <FlipUnit digit={Math.floor(m/10)}/>
      <FlipUnit digit={m%10}/>
      <Sep/>
      <FlipUnit digit={Math.floor(s/10)}/>
      <FlipUnit digit={s%10}/>
    </span>
  );
}

function LoginForm({onLogin,error}){
  const [l,setL]=React.useState("");
  const [p,setP]=React.useState("");
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",
      background:"#0f172a",color:"#e2e8f0"}}>
      <div style={{background:"#1e293b",borderRadius:12,padding:32,width:320,
        border:"1px solid #334155"}}>
        <div style={{fontSize:22,fontWeight:800,letterSpacing:1,textAlign:"center",marginBottom:4}}>
          ПОСТ ТРЕКЕР
        </div>
        <div style={{fontSize:12,color:"#475569",textAlign:"center",marginBottom:24}}>
          Вход в систему
          <div className="ppt-author">Создано Максимом Ефремовым</div>
        </div>
        {error&&<div style={{background:"#7f1d1d",color:"#fca5a5",padding:"6px 12px",
          borderRadius:10,fontSize:12,marginBottom:12}}>{error}</div>}
        <input value={l} onChange={e=>setL(e.target.value)} placeholder="Логин"
          style={{width:"100%",padding:"8px 12px",background:"#0f172a",border:"1px solid #334155",
            borderRadius:10,color:"#e2e8f0",fontSize:14,fontFamily:"inherit",marginBottom:8,
            boxSizing:"border-box"}}
          onKeyDown={e=>e.key==="Enter"&&document.getElementById("login-pw").focus()}/>
        <input id="login-pw" value={p} onChange={e=>setP(e.target.value)} type="password"
          placeholder="Пароль"
          style={{width:"100%",padding:"8px 12px",background:"#0f172a",border:"1px solid #334155",
            borderRadius:10,color:"#e2e8f0",fontSize:14,fontFamily:"inherit",marginBottom:16,
            boxSizing:"border-box"}}
          onKeyDown={e=>{if(e.key==="Enter")onLogin(l,p);}}/>
        <button onClick={()=>onLogin(l,p)}
          style={{width:"100%",padding:"8px",background:"#2563eb",border:"none",borderRadius:10,
            color:"#fff",fontSize:14,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>
          Войти
        </button>
      </div>
    </div>
  );
}

function UsersView({user,onUserUpdate}){
  const [users,setUsers]=React.useState([]);
  const [loading,setLoading]=React.useState(true);
  const [syncing,setSyncing]=React.useState(false);

  React.useEffect(()=>{loadUsers();},[]);

  async function loadUsers(){
    try{
      const r=await fetch("/api/users",{credentials:"include"});
      if(r.ok)setUsers(await r.json());
    }catch(e){}
    setLoading(false);
  }

  async function changeRole(id,role){
    const r=await csrfFetch(`/api/users/${id}/role`,{method:"PUT",
      headers:{"Content-Type":"application/json"},credentials:"include",
      body:JSON.stringify({role})});
    if(r.ok){
      const updated=await r.json();
      setUsers(u=>u.map(x=>x.id===id?{...x,role:updated.role}:x));
    }
  }

  async function syncAD(){
    setSyncing(true);
    try{
      await csrfFetch("/api/users/sync",{method:"POST",credentials:"include"});
      await loadUsers();
    }catch(e){}
    setSyncing(false);
  }

  const [showDisabled,setShowDisabled]=React.useState(false);
  const filteredUsers=users.filter(u=>showDisabled||u.ad_enabled!==false);
  const roleGroups={};
  for(const u of filteredUsers){
    const role=u.role||"viewer";
    if(!roleGroups[role]) roleGroups[role]=[];
    roleGroups[role].push(u);
  }
  const roleOrder=["admin","lead","manager","editor","viewer","na"];
  const roleLabels={admin:"\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440\u044b",lead:"LEAD",manager:"\u041c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u044b",editor:"\u0420\u0435\u0434\u0430\u043a\u0442\u043e\u0440\u044b",viewer:"\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0449\u0438\u043a\u0438",na:"\u0411\u0435\u0437 \u0434\u043e\u0441\u0442\u0443\u043f\u0430 (NA)"};

  return (
    <div style={{padding:"20px 24px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <h3 style={{margin:0,fontSize:16}}>👥 Роли</h3>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:11,color:"#64748b"}}>Всего: {filteredUsers.length}</span>
          <button onClick={()=>setShowDisabled(!showDisabled)}
            style={{background:showDisabled?"#1e3a5f":"#1e293b",border:"1px solid #334155",borderRadius:10,
              padding:"5px 12px",color:"#e2e8f0",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
            {showDisabled?"OK Все":" Только активные"}
          </button>
          <button onClick={syncAD} disabled={syncing}
            style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:10,
              padding:"5px 12px",color:"#e2e8f0",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
            {syncing?"⏳ Синхронизация...":"🔄 Синхр. AD"}
          </button>
        </div>
      </div>
      {loading?<div style={{color:"#475569"}}>Загрузка...</div>:
      roleOrder.map(role=>{
        const items=roleGroups[role]||[];
        if(!items.length) return null;
        return (
          <div key={role} style={{marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:700,color:"#94a3b8",marginBottom:8,
              borderBottom:"1px solid #1e293b",paddingBottom:4}}>
              {roleLabels[role]||role} <span style={{fontWeight:400,fontSize:11,color:"#475569"}}>({items.length})</span>
            </div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{color:"#64748b",fontSize:11}}>
                  <th style={{textAlign:"left",padding:"4px 8px",borderBottom:"1px solid #1e293b"}}>Имя</th>
                  <th style={{textAlign:"left",padding:"4px 8px",borderBottom:"1px solid #1e293b"}}>Логин</th>
                  <th style={{textAlign:"left",padding:"4px 8px",borderBottom:"1px solid #1e293b"}}>Группы AD</th>
                  <th style={{textAlign:"left",padding:"4px 8px",borderBottom:"1px solid #1e293b"}}>Роль</th>
                  <th style={{textAlign:"left",padding:"4px 8px",borderBottom:"1px solid #1e293b"}}>Статус</th>
                  <th style={{textAlign:"left",padding:"4px 8px",borderBottom:"1px solid #1e293b"}}>Вход</th>
                </tr>
              </thead>
              <tbody>
                {items.map(u=>(
                  <tr key={u.id} style={{borderBottom:"1px solid #0f172a",opacity:u.ad_enabled===false?0.5:1}}>
                    <td style={{padding:"4px 8px"}}>{u.display_name}</td>
                    <td style={{padding:"4px 8px",color:"#64748b",fontSize:11}}>{u.sam_name}</td>
                    <td style={{padding:"4px 8px",color:"#64748b",fontSize:11}}>
                      {(u.ad_groups||[]).slice(0,3).join(", ")}{(u.ad_groups||[]).length>3?", ...":""}
                    </td>
                    <td style={{padding:"4px 8px"}}>
                      <select value={u.role} onChange={e=>changeRole(u.id,e.target.value)}
                        style={{background:"#0f172a",color:"#e2e8f0",border:"1px solid #334155",
                          borderRadius:4,padding:"2px 4px",fontSize:12,fontFamily:"inherit"}}>
                        <option value="admin">admin</option>
                        <option value="lead">lead</option>
                        <option value="manager">manager</option>
                        <option value="editor">editor</option>
                        <option value="viewer">viewer</option>
                        <option value="na">na (без доступа)</option>
                      </select>
                    </td>
                    <td style={{padding:"4px 8px",fontSize:11}}>
                      <span style={{color:u.ad_enabled===false?"#ef4444":"#22c55e"}}>
                        {u.ad_enabled===false?"! Заблокирован":"🟢 Активен"}
                      </span>
                    </td>
                    <td style={{padding:"4px 8px",fontSize:11,color:"#475569"}}>
                      {u.last_login?new Date(u.last_login).toLocaleDateString("ru-RU"):"—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

// ── ОСНОВНОЕ ПРИЛОЖЕНИЕ ─────────────────────────────────────────────


const MT={
  search:"\u041f\u043e\u0438\u0441\u043a",
  shifts:"\u0421\u043c\u0435\u043d\u044b",
  logout:"\u0412\u044b\u0439\u0442\u0438",
  today:"\u0421\u0435\u0433\u043e\u0434\u043d\u044f",
  tomorrow:"\u0417\u0430\u0432\u0442\u0440\u0430",
  calendar:"\u041a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u044c",
  projects:"\u041f\u0440\u043e\u0435\u043a\u0442\u044b",
  people:"\u041b\u044e\u0434\u0438",
  conflicts:"\u041a\u043e\u043d\u0444\u043b.",
  conflictsFull:"\u041a\u043e\u043d\u0444\u043b\u0438\u043a\u0442\u044b",
  birthdays:"\u0414\u043d\u0438 \u0440\u043e\u0436\u0434\u0435\u043d\u0438\u044f",
  birthdayShort:"\u0414\u0420",
  checkConflicts:"\u041d\u0443\u0436\u043d\u043e \u043f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c \u043a\u043e\u043d\u0444\u043b\u0438\u043a\u0442\u044b",
  noShifts:"\u0421\u043c\u0435\u043d \u043d\u0435\u0442",
  noEvents:"\u041d\u0430 \u044d\u0442\u043e\u0442 \u0434\u0435\u043d\u044c \u043d\u0438\u0447\u0435\u0433\u043e \u043d\u0435\u0442",
  series:"\u0441\u0435\u0440\u0438\u0439",
  todayLower:"\u0441\u0435\u0433\u043e\u0434\u043d\u044f",
  shiftShort:"\u0441\u043c\u0435\u043d",
  more:"\u0435\u0449\u0435",
  air:"\u042d\u0444\u0438\u0440",
  searchPerson:"\u041f\u043e\u0438\u0441\u043a \u0447\u0435\u043b\u043e\u0432\u0435\u043a\u0430",
  noPeople:"\u041d\u0438\u043a\u043e\u0433\u043e \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e",
  archive:"\u0430\u0440\u0445\u0438\u0432",
  close:"\u0417\u0430\u043a\u0440\u044b\u0442\u044c",
};

function useIsMobile(maxWidth=760){
  const [isMobile,setIsMobile]=useState(()=>typeof window!=="undefined"?window.innerWidth<=maxWidth:false);
  useEffect(()=>{
    const mq=window.matchMedia(`(max-width: ${maxWidth}px)`);
    const onChange=()=>setIsMobile(mq.matches);
    onChange();
    mq.addEventListener?mq.addEventListener("change",onChange):mq.addListener(onChange);
    return ()=>mq.removeEventListener?mq.removeEventListener("change",onChange):mq.removeListener(onChange);
  },[maxWidth]);
  return isMobile;
}
function MobilePanel({children,style,onClick}){
  return <div className="ppt-mobile-panel" onClick={onClick} style={style}>{children}</div>;
}
function MobileTopbar({user,syncState,onSearch,onLogout,onShifts}){
  return (
    <div className="ppt-mobile-topbar">
      <div>
        <div className="ppt-title ppt-mobile-brand">ПОСТ ТРЕКЕР</div>
        <div className="ppt-author">Создано Максимом Ефремовым</div>
        <div className="ppt-mobile-subtitle">{user?.display_name||""}</div>
      </div>
      <div className="ppt-mobile-actions">
        <button className="ppt-mobile-icon-btn" onClick={onSearch} title={MT.search}>{MT.search}</button>
        <button className="ppt-mobile-icon-btn" onClick={onShifts} title={MT.shifts}>{MT.shifts}</button>
        <span className={`ppt-mobile-sync ppt-mobile-sync-${syncState}`}>{syncState==="error"?"!":syncState==="saving"?"...":"OK"}</span>
        <button className="ppt-mobile-logout" onClick={onLogout}>{MT.logout}</button>
      </div>
    </div>
  );
}
function MobileBottomNav({tabs,view,setView,navigate}){
  const allowed=new Set(["today","calendar","projects","people","conflicts"]);
  const items=tabs.filter(t=>allowed.has(t.id)).slice(0,5);
  const labels={today:MT.today,calendar:MT.calendar,projects:MT.projects,people:MT.people,conflicts:MT.conflicts};
  return (
    <div className="ppt-mobile-bottom-nav">
      {items.map(t=>(
        <button key={t.id} onClick={()=>{setView(t.id);navigate(null);}} className={view===t.id?"active":""}>
          <b>{labels[t.id]||t.label}</b>
        </button>
      ))}
    </div>
  );
}
function groupMobileTasks(tasks){
  const m={};
  (tasks||[]).forEach(t=>{
    const key=[t.project||"",t.series||"",t.status||"",t.from||0,t.to||0].join("|");
    if(!m[key]) m[key]={...t,tasks:[],people:[]};
    m[key].tasks.push(t);
    if(t.person&&!m[key].people.includes(t.person)) m[key].people.push(t.person);
  });
  return Object.values(m).sort((a,b)=>(Number(a.from)||0)-(Number(b.from)||0)||String(a.project||"").localeCompare(String(b.project||""))||String(a.series||"").localeCompare(String(b.series||"")));
}
function MobileTaskGroup({group,data,onOpenProject,onOpenPerson}){
  const proj=(data.projects||[]).find(p=>p.id===group.project);
  const people=group.people||[];
  return (
    <div className="ppt-mobile-task ppt-mobile-task-group" style={{borderLeftColor:proj?.color||"#64748b"}}>
      <div className="ppt-mobile-task-time">{fmtHour(group.from)}-{fmtHour(group.to)}</div>
      <div className="ppt-mobile-task-main">
        <button onClick={()=>proj&&onOpenProject(proj.id)} className="ppt-mobile-link">
          <ProjectMark project={proj} size={10}/><span>{proj?.abbr||proj?.name||group.project}</span>
        </button>
        <div className="ppt-mobile-task-title">{group.series||"-"}</div>
        <div className="ppt-mobile-task-meta"><StatusBadge s={group.status} small/>{group.tasks.length>1&&<span className="ppt-mobile-count">x{group.tasks.length}</span>}</div>
        <div className="ppt-mobile-people-row">
          {(people.length?people:["-"]).map(name=>{
            const person=(data.people||[]).find(p=>p.name===name);
            return <button key={name} onClick={()=>person&&onOpenPerson(person.id)}>{name}</button>;
          })}
        </div>
      </div>
    </div>
  );
}
function MobileTaskRow({task,data,onOpenProject,onOpenPerson}){
  return <MobileTaskGroup group={{...task,tasks:[task],people:task.person?[task.person]:[]}} data={data} onOpenProject={onOpenProject} onOpenPerson={onOpenPerson}/>;
}

function mobileDayInfo(data,day){
  const tasks=(data.tasks||[]).filter(t=>!t.deleted&&!t.cancelled&&t.day===day);
  const airs=[];
  (data.series||[]).forEach(ser=>{
    const proj=(data.projects||[]).find(p=>p.id===ser.projectId);
    if(!proj) return;
    if(generateSeriesAirDates(ser).includes(day)) airs.push({proj,ser});
  });
  const milestones=[];
  (data.series||[]).forEach(ser=>{
    const proj=(data.projects||[]).find(p=>p.id===ser.projectId);
    if(!proj) return;
    getSeriesMilestoneEvents(ser,proj).filter(m=>m.date===day).forEach(m=>milestones.push({...m,proj,ser}));
  });
  const bdays=birthdayPeopleOnDate(data.people,day);
  return {day,tasks,airs,milestones,bdays,count:tasks.length+airs.length+milestones.length+bdays.length};
}
function MobileToday({data,conflictDetails,onOpenProject,onOpenPerson,onConflicts}){
  const todayStr=formatDate(new Date());
  const tomorrowStr=addDays(todayStr,1);
  const todayTasks=(data.tasks||[]).filter(t=>!t.deleted&&!t.cancelled&&t.day===todayStr).sort((a,b)=>(Number(a.from)||0)-(Number(b.from)||0));
  const notifyConflicts=(conflictDetails||[]).filter(d=>d.notify!==false);
  const tomorrowTasks=(data.tasks||[]).filter(t=>!t.deleted&&!t.cancelled&&t.day===tomorrowStr).sort((a,b)=>(Number(a.from)||0)-(Number(b.from)||0)).slice(0,8);
  const birthdays=upcomingBirthdays(data.people,new Date(),7);
  return (
    <div className="ppt-mobile-stack">
      <div className="ppt-mobile-hero">
        <div><span>{MT.today}</span><strong>{todayTasks.length}</strong></div>
        <div><span>{MT.conflictsFull}</span><strong className={notifyConflicts.length?"danger":""}>{notifyConflicts.length}</strong></div>
        <div><span>{MT.tomorrow}</span><strong>{tomorrowTasks.length}</strong></div>
      </div>
      {birthdays.length>0&&<MobilePanel><div className="ppt-mobile-section-title">{MT.birthdays}</div><div className="ppt-mobile-chip-row">{birthdays.map(b=><span key={b.person.id||b.person.name} className="ppt-mobile-birthday-chip">{b.person.name} - {birthdayWhenText(b.diff)}</span>)}</div></MobilePanel>}
      {notifyConflicts.length>0&&<MobilePanel onClick={onConflicts} style={{borderColor:"rgba(248,113,113,.45)"}}><div className="ppt-mobile-alert">{MT.checkConflicts}: {notifyConflicts.length}</div></MobilePanel>}
      <MobilePanel><div className="ppt-mobile-section-title">{MT.today}</div>{todayTasks.length?groupMobileTasks(todayTasks).map(g=><MobileTaskGroup key={g.tasks.map(t=>t.id).join("-")} group={g} data={data} onOpenProject={onOpenProject} onOpenPerson={onOpenPerson}/>):<div className="ppt-mobile-empty">{MT.noShifts}</div>}</MobilePanel>
      <MobilePanel><div className="ppt-mobile-section-title">{MT.tomorrow}</div>{tomorrowTasks.length?groupMobileTasks(tomorrowTasks).map(g=><MobileTaskGroup key={g.tasks.map(t=>t.id).join("-")} group={g} data={data} onOpenProject={onOpenProject} onOpenPerson={onOpenPerson}/>):<div className="ppt-mobile-empty">{MT.noShifts}</div>}</MobilePanel>
    </div>
  );
}
function MobileCalendar({data,onOpenProject,onOpenPerson}){
  const today=new Date(); today.setHours(0,0,0,0);
  const [cursor,setCursor]=useState(()=>new Date(today.getFullYear(),today.getMonth(),1));
  const [selected,setSelected]=useState(()=>formatDate(today));
  const year=cursor.getFullYear(), month=cursor.getMonth();
  const cells=useMemo(()=>{
    const first=new Date(year,month,1);
    const offset=(first.getDay()+6)%7;
    const start=new Date(year,month,1-offset);
    return Array.from({length:42},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return d;});
  },[year,month]);
  const selectedInfo=mobileDayInfo(data,selected);
  function shiftMonth(delta){setCursor(d=>new Date(d.getFullYear(),d.getMonth()+delta,1));}
  return (
    <div className="ppt-mobile-stack">
      <MobilePanel>
        <div className="ppt-mobile-month-head">
          <button onClick={()=>shiftMonth(-1)}>Prev</button>
          <strong>{MONTHS[month]} {year}</strong>
          <button onClick={()=>shiftMonth(1)}>Next</button>
        </div>
        <div className="ppt-mobile-weekdays">{["\u041f\u043d","\u0412\u0442","\u0421\u0440","\u0427\u0442","\u041f\u0442","\u0421\u0431","\u0412\u0441"].map(d=><span key={d}>{d}</span>)}</div>
        <div className="ppt-mobile-month-grid">
          {cells.map(d=>{
            const ds=formatDate(d);
            const info=mobileDayInfo(data,ds);
            const inMonth=d.getMonth()===month;
            const isToday=ds===formatDate(today);
            const isSelected=ds===selected;
            const projIds=[...new Set(info.tasks.map(t=>t.project))].slice(0,4);
            return (
              <button key={ds} className={`${inMonth?"":"muted"} ${isToday?"today":""} ${isSelected?"selected":""}`} onClick={()=>setSelected(ds)}>
                <span>{d.getDate()}</span>
                <div className="ppt-mobile-day-dots">
                  {info.bdays.length>0&&<i className="birthday"/>}
                  {info.airs.length>0&&<i className="air"/>}
                  {info.milestones.length>0&&<i className="milestone"/>}
                  {projIds.map(pid=>{const p=(data.projects||[]).find(x=>x.id===pid);return <i key={pid} style={{background:p?.color||"#64748b"}}/>;})}
                </div>
                {info.count>0&&<em>{info.count}</em>}
              </button>
            );
          })}
        </div>
      </MobilePanel>
      <MobilePanel>
        <div className="ppt-mobile-day-head"><strong>{dayLabel(selected)}</strong><span>{selectedInfo.count}</span></div>
        {selectedInfo.bdays.map(p=><div key={`b${p.id||p.name}`} className="ppt-mobile-calendar-note birthday">{MT.birthdayShort} {p.name}</div>)}
        {selectedInfo.airs.map(({proj,ser},i)=><div key={`a${proj.id}${ser.id}${i}`} className="ppt-mobile-calendar-note air" onClick={()=>onOpenProject(proj.id)}>{MT.air}: {proj.abbr||proj.name} {ser.name}</div>)}
        {selectedInfo.milestones.map((m,i)=><div key={`m${i}`} className="ppt-mobile-calendar-note" style={{borderLeftColor:m.color,color:"#f8fafc"}} onClick={()=>onOpenProject(m.proj.id)}>{m.label} - {m.proj.abbr||m.proj.name} {m.ser.name}</div>)}
        {groupMobileTasks(selectedInfo.tasks).map(g=><MobileTaskGroup key={g.tasks.map(t=>t.id).join("-")} group={g} data={data} onOpenProject={onOpenProject} onOpenPerson={onOpenPerson}/>) }
        {selectedInfo.count===0&&<div className="ppt-mobile-empty">{MT.noEvents}</div>}
      </MobilePanel>
    </div>
  );
}
function MobileProjects({data,onOpenProject}){
  const today=formatDate(new Date());
  const projects=(data.projects||[]).filter(p=>p.status!==MT.archive);
  return <div className="ppt-mobile-stack">{projects.map(p=>{
    const tasks=(data.tasks||[]).filter(t=>!t.deleted&&!t.cancelled&&t.project===p.id);
    const todayCount=tasks.filter(t=>t.day===today).length;
    const seriesCount=(data.series||[]).filter(s=>s.projectId===p.id&&!s.deleted).length;
    return <MobilePanel key={p.id} onClick={()=>onOpenProject(p.id)} style={{borderTop:`3px solid ${p.color||"#64748b"}`}}>
      <div className="ppt-mobile-project-title"><ProjectMark project={p} size={12}/><strong>{p.name}</strong></div>
      <div className="ppt-mobile-chip-row"><span>{seriesCount} {MT.series}</span><span>{todayCount} {MT.todayLower}</span><span>{tasks.length} {MT.shiftShort}</span></div>
    </MobilePanel>;
  })}</div>;
}
function MobilePeople({data,onOpenPerson}){
  const [q,setQ]=useState("");
  const today=formatDate(new Date());
  const people=(data.people||[]).filter(p=>p.active!==false&&!p.deleted).filter(p=>!q.trim()||String(p.name||"").toLowerCase().includes(q.trim().toLowerCase()));
  return <div className="ppt-mobile-stack"><input className="ppt-mobile-search" value={q} onChange={e=>setQ(e.target.value)} placeholder={MT.searchPerson}/>{people.map(p=>{
    const todayTasks=(data.tasks||[]).filter(t=>!t.deleted&&!t.cancelled&&t.person===p.name&&t.day===today);
    const diff=birthdayDiffDays(p.birthday,new Date());
    return <MobilePanel key={p.id||p.name} onClick={()=>onOpenPerson(p.id)}>
      <div className="ppt-mobile-person"><div>{(p.name||"?")[0]}</div><strong>{p.name}</strong></div>
      <div className="ppt-mobile-chip-row"><span>{todayTasks.length} {MT.todayLower}</span>{diff!=null&&diff<=7&&<span>{MT.birthdayShort} {birthdayWhenText(diff)}</span>}</div>
    </MobilePanel>;
  })}{people.length===0&&<MobilePanel><div className="ppt-mobile-empty">{MT.noPeople}</div></MobilePanel>}</div>;
}
function MobileWorkspace({view,data,conflictDetails,setView,navigate}){
  const openProject=id=>navigate({type:"project",id});
  const openPerson=id=>id&&navigate({type:"person",id});
  if(view==="calendar") return <MobileCalendar data={data} onOpenProject={openProject} onOpenPerson={openPerson}/>;
  if(view==="projects") return <MobileProjects data={data} onOpenProject={openProject}/>;
  if(view==="people") return <MobilePeople data={data} onOpenPerson={openPerson}/>;
  if(view==="conflicts") return <ConflictsView details={conflictDetails} data={data}/>;
  return <MobileToday data={data} conflictDetails={conflictDetails} onOpenProject={openProject} onOpenPerson={openPerson} onConflicts={()=>setView("conflicts")}/>;
}

function App(){
  const [rawData,setRawData]=useState(null);
  const [view,setView]=useState("today");
  const [navState,setNavState]=useState(()=>parseHash());
  const [syncState,setSyncState]=useState("ok");
  const [syncError,setSyncError]=useState("");
  const [dayShiftsModal,setDayShiftsModal]=useState(false);
  const [ganttDay,setGanttDay]=useState(null);
  const [cmdPaletteOpen,setCmdPaletteOpen]=useState(false);
  const isMobile=useIsMobile(760);

  const [user,setUser]=useState(null);
  const [loginError,setLoginError]=useState(null);
  const saveTimer=useRef(null);
  const clientIdRef=useRef(Math.random().toString(36).slice(2));
  const saveQueueRef=useRef(null);
  const unsavedRef=useRef(false);
  const serverRevisionRef=useRef(null);
  const backupAccountRef=useRef(null);
  const logHistoryRef=useRef([]);
  const rawDataRef=useRef(null);
  rawDataRef.current=rawData;
  backupAccountRef.current=user;
  if(!saveQueueRef.current) saveQueueRef.current=createSaveQueue(
    payload=>cloudSave({...payload,_revision:serverRevisionRef.current??payload._revision},clientIdRef.current).then(result=>{serverRevisionRef.current=result._revision;return result;}),
    merged=>{
      if(saveTimer.current) return;
      unsavedRef.current=false;
      logHistoryRef.current=merged.changelog||[];
      setSyncState("ok");setSyncError("");setRawData(merged);
      try{localStorage.setItem(accountBackupKey(backupAccountRef.current),JSON.stringify({ts:merged._savedAt,data:merged}));}catch(e){}
    },
    error=>{if(!saveTimer.current){setSyncState("error");setSyncError(error.message);}}
  );

  // Чистые данные без удалённых — передаются во все дочерние компоненты
  const data=useMemo(()=>{
    if(!rawData) return null;
    const d={...rawData};
    for(const key of SOFT_DELETE_KEYS){
      if(Array.isArray(rawData[key])) d[key]=rawData[key].filter(x=>!x.deleted);
    }
    return d;
  },[rawData]);

  useEffect(()=>{
    setSyncState("saving");
    let currentAccount=null;
    fetch("/api/auth/me",{credentials:"include"})
      .then(r=>r.ok?r.json():null)
      .then(d=>{if(d){setCsrfToken(d.csrfToken);if(d.user){currentAccount=d.user;setUser(d.user);}}})
      .catch(()=>{})
      .then(()=>cloudLoad())
      .then(record=>{
        serverRevisionRef.current=record?._revision;
        // Сид только если бин реально пустой (нет ни проектов, ни задач, ни людей)
        const isReallyEmpty=!record||(!record.projects?.length&&!record.tasks?.length&&!record.people?.length);
        if(isReallyEmpty){
          record=normalizeLoadedData({_revision:record?._revision,projects:[],tasks:[],people:[],series:[],roles:DEMO_ROLES,stages:DEFAULT_STAGES,stageGroups:DEFAULT_STAGE_GROUPS,holidays:DEFAULT_HOLIDAYS,personAbsences:[],templates:[],changelog:[]});
          setRawData(record);
          if(["admin","lead"].includes(currentAccount?.role)) return cloudSave(record);
          return;
        }
        let migrated=false;
        if(!record.roles){record.roles=DEMO_ROLES;migrated=true;}
        if(!record.stages||!record.stages.length){record.stages=DEFAULT_STAGES;migrated=true;}
        if(!record.stageGroups||!record.stageGroups.length){record.stageGroups=DEFAULT_STAGE_GROUPS;migrated=true;}
        if(!record.holidays){record.holidays=DEFAULT_HOLIDAYS;migrated=true;}
        if(!record.personAbsences){record.personAbsences=[];migrated=true;}
        if(!record.templates){record.templates=[];migrated=true;}
        if(!record.changelog){record.changelog=[];migrated=true;}
        if(!record.series){
          record.series=[];
          (record.projects||[]).forEach(proj=>{
            (proj.series||[]).forEach((name,idx)=>{
              record.series.push({
                id:proj.id+"-"+name.toLowerCase().replace(/\s/g,"_"),
                projectId:proj.id,name,order:idx,
                shootStart:proj.shoot_start||"",shootEnd:proj.shoot_end||"",
                editStart:proj.edit_start||"",preOtkDate:proj.pre_otk||"",
                otkDate:proj.otk||"",airDate:"",
                airMode:proj.air_mode||"weekly",airDay:proj.air_weekday||1,airTime:proj.air_time||"21:00",
              });
            });
          });
          migrated=true;
        }
        if((record.tasks||[]).some(t=>t.seriesId===undefined)){
          record.tasks=(record.tasks||[]).map(t=>{
            if(t.seriesId!==undefined) return t;
            const ser=(record.series||[]).find(s=>s.projectId===t.project&&s.name===t.series);
            return{...t,seriesId:ser?ser.id:null,autogenerated:t.autogenerated||false};
          });
          migrated=true;
        }
        if((record.series||[]).some(s=>!s.checklists||s.stageRanges===undefined)){
          record.series=(record.series||[]).map(s=>({
            checklists:[],notes:"",delivered:false,deliveredAt:"",
            stageRanges:{},
            ...s,
          }));
          migrated=true;
        }
        if((record.projects||[]).some(p=>!p.dossier)){
          record.projects=(record.projects||[]).map(p=>p.dossier?p:
            {...p,dossier:{info:{},paths:[],accesses:[],links:[],notes:""}});
          migrated=true;
        }
        if((record.series||[]).some(s=>s.transitCode===undefined)){
          record.series=(record.series||[]).map(s=>s.transitCode!==undefined?s:
            {...s,transitCode:"",transitVariants:["","",""]});
          migrated=true;
        }
        if((record.series||[]).some(s=>s.syncStart===undefined)){
          record.series=(record.series||[]).map(s=>s.syncStart!==undefined?s:
            {...s,syncStart:""});
          migrated=true;
        }
        if((record.series||[]).some(s=>!s.assets)){
          record.series=(record.series||[]).map(s=>s.assets?s:{...s,assets:[]});
          migrated=true;
        }
        // Online data is authoritative; never overwrite it with another session's backup.
        setRawData(record);
        if(migrated&&["admin","lead"].includes(currentAccount?.role)) return cloudSave(record);
      })
      .then(saved=>{if(saved){serverRevisionRef.current=saved._revision;setRawData(saved);}setSyncState("ok");})
      .catch(error=>{
        // Если облако недоступно — пробуем локальный бэкап
        try{
          const raw=currentAccount?localStorage.getItem(accountBackupKey(currentAccount)):null;
          if(raw){const bk=JSON.parse(raw);if(bk?.data){unsavedRef.current=true;serverRevisionRef.current=bk.data._revision??null;setRawData(normalizeLoadedData(bk.data));setSyncState("error");setSyncError("Открыта локальная копия. Связь с сервером недоступна.");return;}}
        }catch(e){}
        setRawData(normalizeLoadedData(null));
        setSyncState("error");
        if(currentAccount)setSyncError("Не удалось загрузить данные: "+error.message);
      })
      .catch(()=>{});
  },[]);

  const histRef=useRef([]);
  const viewRef=useRef(view);
  viewRef.current=view;
  const pendingLogRef=useRef([]);
  const [changelogOpen,setChangelogOpen]=useState(false);

  useEffect(()=>{
    const protectUnsaved=event=>{
      if(unsavedRef.current||saveTimer.current||saveQueueRef.current?.pending){event.preventDefault();event.returnValue="";}
    };
    window.addEventListener("beforeunload",protectUnsaved);
    return()=>window.removeEventListener("beforeunload",protectUnsaved);
  },[]);

  function addLog(text){
    pendingLogRef.current=[...pendingLogRef.current,{ts:Date.now(),text}];
  }

  function pushHistory(prev){
    histRef.current=[...histRef.current.slice(-30),prev];
  }
  function doSave(d){
    const newEntries=pendingLogRef.current;
    pendingLogRef.current=[];
    const prevLog=Array.isArray(d.changelog)?d.changelog:[];
    const changelog=mergeChangelog(newEntries,logHistoryRef.current,prevLog);
    logHistoryRef.current=changelog;
    const payload={...d,changelog,_savedAt:Date.now(),_clientId:clientIdRef.current};
    if(!user) return;
    unsavedRef.current=true;
    clearTimeout(saveTimer.current);
    setSyncState("saving");
    setSyncError("");
    try{localStorage.setItem(accountBackupKey(user),JSON.stringify({ts:payload._savedAt,data:payload}));}catch(e){}
    saveTimer.current=setTimeout(()=>{
      saveTimer.current=null;
      const outgoing={...payload,changelog:mergeChangelog(pendingLogRef.current,logHistoryRef.current,payload.changelog)};
      logHistoryRef.current=outgoing.changelog;
      pendingLogRef.current=[];
      try{localStorage.setItem(accountBackupKey(user),JSON.stringify({ts:outgoing._savedAt,data:outgoing}));}catch(e){}
      saveQueueRef.current.enqueue(outgoing);
    },1000);
  }
  function undo(){
    if(!histRef.current.length) return;
    const previous=histRef.current[histRef.current.length-1];
    const prev=undoSnapshot(previous,rawDataRef.current);
    histRef.current=histRef.current.slice(0,-1);
    setRawData(prev);
    doSave(prev);
  }

  async function handleLogout(){
    if(saveTimer.current||saveQueueRef.current?.pending){alert("Дождитесь завершения сохранения перед выходом.");return;}
    if(unsavedRef.current&&!window.confirm("Изменения ещё не сохранены на сервере. Локальная резервная копия останется на этом компьютере. Выйти?"))return;
    await doLogout();
    histRef.current=[];pendingLogRef.current=[];logHistoryRef.current=[];serverRevisionRef.current=null;unsavedRef.current=false;
    setRawData(normalizeLoadedData(null));setUser(null);setLoginError(null);setSyncError("");
  }

  function navigate(state){
    setNavState(state);
    if(state) window.location.hash=`#${state.type}/${encodeURIComponent(state.id)}`;
    else history.pushState(null,"",location.pathname+location.search);
  }
  useEffect(()=>{
    const onPop=()=>setNavState(parseHash());
    window.addEventListener("popstate",onPop);
    return()=>window.removeEventListener("popstate",onPop);
  },[]);

  useEffect(()=>{
    function handle(e){
      const ctrl=e.ctrlKey||e.metaKey;
      const inInput=e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA"||e.target.tagName==="SELECT";
      if(e.key==="Escape"){
        if(cmdPaletteOpen){e.preventDefault();setCmdPaletteOpen(false);return;}
        window.dispatchEvent(new CustomEvent("ppt-escape"));
      }
      if(ctrl&&(e.key==="z"||e.code==="KeyZ")&&!e.shiftKey&&!inInput){e.preventDefault();undo();}
      if(ctrl&&(e.key==="k"||e.code==="KeyK")&&!inInput){e.preventDefault();setCmdPaletteOpen(o=>!o);}
      if(e.altKey&&(e.code==="KeyN")&&viewRef.current==="gantt"){
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("gantt-new-task"));
      }
    }
    document.addEventListener("keydown",handle);
    return ()=>document.removeEventListener("keydown",handle);
  },[cmdPaletteOpen,user]);

    useEffect(()=>{
    if(STORAGE_MODE!=="server") return;
    var reconnectTimer=null;
    var reconnectAttempts=0;
    var currentES=null;
    function connectSSE(){
      if(currentES){ try{ currentES.close(); }catch(e){} }
      var es=new EventSource(`${SERVER_URL}/api/events`);
      currentES=es;
      es.onmessage=function(e){
        reconnectAttempts=0;
        try{
          var msg=JSON.parse(e.data);
          if(msg.clientId&&msg.clientId!==clientIdRef.current&&!unsavedRef.current&&!saveTimer.current&&!saveQueueRef.current?.pending){
            cloudLoad().then(function(d){if(d&&!unsavedRef.current&&!saveTimer.current&&!saveQueueRef.current?.pending){serverRevisionRef.current=d._revision;histRef.current=[];logHistoryRef.current=d.changelog||[];setRawData(d);}}).catch(function(){});
          }
        }catch(e){}
      };
      es.onerror=function(){
        es.close();
        currentES=null;
        reconnectAttempts++;
        var delay=Math.min(1000*Math.pow(2,reconnectAttempts),30000);
        clearTimeout(reconnectTimer);
        reconnectTimer=setTimeout(connectSSE,delay);
      };
    }
    connectSSE();
    return function(){
      if(currentES){ try{ currentES.close(); }catch(e){} }
      if(reconnectTimer)clearTimeout(reconnectTimer);
    };
  },[]);


  function updateData(key,val){
    setRawData(d=>{
      pushHistory(d);
      let mergedVal=val;
      if(SOFT_DELETE_KEYS.includes(key)&&Array.isArray(val)){
        const deletedItems=(d[key]||[]).filter(x=>x.deleted&&key!=="people");
        mergedVal=[...val,...deletedItems.filter(x=>!val.some(v=>String(v.id)===String(x.id)))];
      }
      const newData={...d,[key]:mergedVal};
      doSave(newData);
      return newData;
    });
  }

  function deleteProject(projId){
    if(!window.confirm("Удалить проект, его серии и задачи? Действие можно отменить через Ctrl+Z.")) return;
    const ts=Date.now();
    setRawData(d=>{
      pushHistory(d);
      const newData={
        ...d,
        projects:d.projects.map(p=>p.id===projId?{...p,deleted:true,_updatedAt:ts}:p),
        series:(d.series||[]).map(s=>s.projectId===projId?{...s,deleted:true,_updatedAt:ts}:s),
        tasks:(d.tasks||[]).map(t=>t.project===projId?{...t,deleted:true,_updatedAt:ts}:t),
      };
      doSave(newData);
      return newData;
    });
    incrDelete("project", projId);
  }

  function batchUpdate(changes){
    setRawData(d=>{
      pushHistory(d);
      const merged={...d};
      for(const [key,val] of Object.entries(changes)){
        if(SOFT_DELETE_KEYS.includes(key)&&Array.isArray(val)){
          const deletedItems=(d[key]||[]).filter(x=>x.deleted);
          merged[key]=[...val,...deletedItems.filter(x=>!val.some(v=>String(v.id)===String(x.id)))];
        } else {
          merged[key]=val;
        }
      }
      doSave(merged);
      return merged;
    });
  }

  const stagesCtxVal=useMemo(()=>{
    const stagesArr=(data?.stages&&data.stages.length)?data.stages:DEFAULT_STAGES;
    const sorted=[...stagesArr].sort((a,b)=>(a.order||0)-(b.order||0));
    const stageMap=Object.fromEntries(stagesArr.map(s=>[s.id,s]));
    const stageGroups=(data?.stageGroups&&data.stageGroups.length)?data.stageGroups:DEFAULT_STAGE_GROUPS;
    const groupMap=Object.fromEntries(stageGroups.map(g=>[g.id,g]));
    return {stageMap,sorted,stageGroups,groupMap};
  },[data?.stages,data?.stageGroups]);

  const holidaysCtxVal=useMemo(()=>data?.holidays||DEFAULT_HOLIDAYS,[data?.holidays]);

  const {ids:conflictIds,details:conflictDetails}=useMemo(()=>{
    if(!data) return {ids:new Set(),details:[]};
    const todayStr=daySort(formatDate(new Date()));
    return getConflicts(data.tasks.filter(t=>daySort(t.day)>=todayStr&&!t.cancelled),data.people,data.stages||DEFAULT_STAGES,data.projects,data.personAbsences||[]);
  },[data?.tasks,data?.people,data?.stages,data?.projects,data?.personAbsences]);
  const conflictCount=conflictDetails.filter(d=>d.notify!==false).length;

  if(!user && !data) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",color:"#475569"}}>
      Загрузка...
    </div>
  );
  if(!data) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",color:"#475569"}}>
      Загрузка данных...
    </div>
  );
  if(!user) return <LoginForm onLogin={(l,p)=>{
    setLoginError(null);
    doLogin(l,p).then(r=>{
      if(r.user){setCsrfToken(r.csrfToken);setLoginError(null);setSyncState("saving");cloudLoad().then(rec=>{if(rec){serverRevisionRef.current=rec._revision;histRef.current=[];setRawData(rec);}setSyncState("ok");setUser(r.user);}).catch(error=>{setRawData(normalizeLoadedData(null));setSyncError("Не удалось загрузить данные: "+error.message);setSyncState("error");setUser(r.user);});}
      else setLoginError(r.error||"Ошибка входа");
    });
  }} error={loginError}/>;

  const isViewer=user.role==="viewer";
  const isEditor=user.role==="editor";
  const isAdmin=user.role==="admin";
  const isLead=user.role==="lead";
  const isManager=user.role==="manager";
  const canManage=isAdmin||isLead||isManager;
  const canDeleteStructure=isAdmin||isLead;
  const canEdit=isAdmin||isLead||isManager||isEditor;
  const canManageProjectAssignments=isAdmin||isLead;
  const currentProjectKeys=currentUserProjectKeys(user,data);
  const currentManagerEntry=currentUserManagerEntry(user,data);
  function canEditProjectById(projectId){
    if(isAdmin||isLead) return true;
    if(isManager) return projectAssignedToKeys(data.projects.find(p=>p.id===projectId),currentProjectKeys);
    return canEdit;
  }
  window.PPT_CAN_SEE_TASK_NOTES=isAdmin||isLead||isManager;
  const isNA=user.role==="na";
  
  if(isNA){
    return (
      <div style={{background:"#0f172a",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#64748b"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:16}}>🚫</div>
          <h2 style={{color:"#e2e8f0",margin:"0 0 8px 0"}}>Доступ запрещён</h2>
          <p style={{fontSize:14,margin:0}}>Ваш аккаунт заблокирован для просмотра данных трекера.</p>
          <p style={{fontSize:12,marginTop:16,color:"#475569"}}>
            {user.display_name} ({user.sam_name})
          </p>
          <button onClick={handleLogout}
            style={{marginTop:20,background:"#334155",border:"none",borderRadius:10,color:"#e2e8f0",
              fontSize:13,cursor:"pointer",padding:"8px 20px",fontFamily:"inherit"}}>
            Выйти
          </button>
        </div>
      </div>
    );
  }

  // Viewer с пустыми проектами — показываем пояснение
  if(isViewer && data.projects && data.projects.length === 0){
    return (
      <div style={{background:"#0f172a",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#64748b"}}>
        <div style={{textAlign:"center",maxWidth:400}}>
          <div style={{fontSize:48,marginBottom:16}}>👀</div>
          <h2 style={{color:"#e2e8f0",margin:"0 0 8px 0"}}>Нет доступа к проектам</h2>
          <p style={{fontSize:14,margin:0,lineHeight:1.6}}>
            Ваша учётная запись имеет права просмотра, но администратор ещё не назначил вам ни одного проекта.
          </p>
          <p style={{fontSize:12,marginTop:16,color:"#475569"}}>
            {user.display_name} ({user.sam_name}) · роль: viewer
          </p>
          <button onClick={handleLogout}
            style={{marginTop:20,background:"#334155",border:"none",borderRadius:10,color:"#e2e8f0",
              fontSize:13,cursor:"pointer",padding:"8px 20px",fontFamily:"inherit"}}>
            Выйти и зайти под другим пользователем
          </button>
        </div>
      </div>
    );
  }

  const TABS=[
    {id:"today",    label:"Сегодня"},
    {id:"projects", label:"Проекты"},
    {id:"calendar", label:"Календарь"},
    {id:"gantt",    label:"Гант", adminManagerOnly:true},
    {id:"people",   label:"По людям"},
    {id:"days",     label:"\u041d\u0415\u0414\u0415\u041b\u042f"},
    {id:"conflicts",  label:`Конфликты${conflictCount?` ⚡${conflictCount}`:""}`,warn:conflictCount>0, adminManagerOnly:true},
    {id:"analytics",  label:"Аналитика", adminManagerOnly:true},
    {id:"directory",  label:"⚙ Настройки", adminManagerOnly:true},
  ].filter(t=>{
    if(t.adminOnly && !isAdmin) return false;
    if(t.adminManagerOnly && !canManage) return false;
    return true;
  });

  return (
    <StagesCtx.Provider value={stagesCtxVal}>
    <HolidaysCtx.Provider value={holidaysCtxVal}>
    <div className="ppt-app-shell" style={{background:"transparent",minHeight:"100vh",color:"#eef4ff",paddingTop:1}}>
      {isMobile?(
        <MobileTopbar user={user} syncState={syncState} onSearch={()=>setCmdPaletteOpen(true)} onShifts={()=>setDayShiftsModal(true)} onLogout={handleLogout}/>
      ):(
      <div className="ppt-topbar" style={{background:"rgba(15,23,42,.72)",border:"1px solid rgba(148,163,184,.18)",borderBottom:"1px solid rgba(148,163,184,.22)",borderRadius:20,padding:"14px 20px",position:"sticky",top:10,zIndex:50,margin:"10px 14px 0",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",marginBottom:12}}>
          <div style={{flexShrink:0}}>
            <div className="ppt-title" style={{fontSize:23,fontWeight:900,letterSpacing:.2,lineHeight:1.05}}>
              ПОСТ ТРЕКЕР
            </div>
            <div style={{fontSize:12,color:"#9aa9bd",marginTop:4,fontWeight:600}}>Планирование постпродакшна <span style={{marginLeft:8,fontSize:11,color:"#94a3b8"}}>v{VERSION}</span></div>
            <div className="ppt-author">Создано Максимом Ефремовым</div>
          </div>
          <div style={{flex:1,display:"flex",justifyContent:"center"}}>
            <button onClick={()=>setCmdPaletteOpen(true)}
              style={{background:"#0f172a",border:"1px solid #1e3a5f",borderRadius:10,
                padding:"5px 12px",cursor:"pointer",display:"flex",alignItems:"center",
                gap:8,fontFamily:"inherit"}}>
              <span style={{fontSize:13,color:"#334155",lineHeight:1}}>🔍</span>
              <span style={{fontSize:12,color:"#334155",letterSpacing:1,userSelect:"none"}}>Поиск</span>
              <span style={{fontSize:9,color:"#1e3a5f",border:"1px solid #1e3a5f",
                borderRadius:3,padding:"1px 5px",letterSpacing:0,flexShrink:0}}>Ctrl+K</span>
            </button>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
            <FlipClock/>
            {{ok:    <span style={{fontSize:11,color:"#22c55e"}}>OK</span>,
              saving:<span style={{fontSize:11,color:"#f59e0b"}}>⟳</span>,
              error: <span style={{fontSize:11,color:"#ef4444"}}>!</span>,
            }[syncState]}
            <Btn variant="ghost" small onClick={()=>setChangelogOpen(true)}>📜</Btn>
            <Btn variant="ghost" small onClick={()=>setDayShiftsModal(true)}> Смены</Btn>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:8}}>
            <span style={{fontSize:12,color:"#cbd5e1",fontWeight:700}}>{user.display_name}</span>
            <span style={{fontSize:10,color:"#9aa9bd",background:"rgba(8,13,26,.56)",borderRadius:999,
              padding:"2px 8px",border:"1px solid rgba(148,163,184,.22)",fontWeight:800}}>{user.role}</span>
            <button onClick={handleLogout}
              className="ppt-btn"
              style={{background:"rgba(15,23,42,.34)",border:"1px solid rgba(148,163,184,.22)",borderRadius:14,color:"#a9b8cc",
                fontSize:11,cursor:"pointer",padding:"4px 8px",fontFamily:"inherit",fontWeight:700}}>
              Выйти
            </button>
          </div>
        </div>
        {navState?.type==="project"?(
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={()=>navigate(null)}
              style={{background:"none",border:"none",color:"#3b82f6",cursor:"pointer",
                fontSize:13,fontFamily:"inherit",padding:"4px 0"}}>
              ← Все проекты
            </button>
            <span style={{color:"#334155"}}>/</span>
            <span style={{fontWeight:700,fontSize:14,color:"#e2e8f0"}}>
              {data.projects.find(p=>p.id===navState.id)?.name||navState.id}
            </span>
          </div>
        ):navState?.type==="series"?(()=>{
          const ser=(data.series||[]).find(s=>s.id===navState.id);
          const proj=ser?data.projects.find(p=>p.id===ser.projectId):null;
          return (
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <button onClick={()=>navigate(proj?{type:"project",id:proj.id}:null)}
                style={{background:"none",border:"none",color:"#3b82f6",cursor:"pointer",
                  fontSize:13,fontFamily:"inherit",padding:"4px 0"}}>
                ← {proj?.name||"Проект"}
              </button>
              <span style={{color:"#334155"}}>/</span>
              <span style={{fontWeight:700,fontSize:14,color:"#e2e8f0"}}>
                {ser?.name||navState.id}
              </span>
              {ser?.delivered&&(
                <span style={{fontSize:11,color:"#22c55e",background:"#22c55e1a",
                  border:"1px solid #22c55e44",borderRadius:4,padding:"1px 7px"}}>OK Сдана</span>
              )}
            </div>
          );
        })():(
          <div style={{display:"flex",gap:3,background:"rgba(8,13,26,.48)",borderRadius:14,border:"1px solid rgba(148,163,184,.18)",
            overflow:"hidden",width:"fit-content",padding:3,boxShadow:"inset 0 1px 0 rgba(255,255,255,.035)"}}>
            {TABS.map(({id,label,warn})=>(
              <button key={id} onClick={()=>{setView(id);navigate(null);}} style={{
                padding:"7px 14px",border:"none",borderRight:"none",cursor:"pointer",borderRadius:11,
                fontSize:12,fontFamily:"inherit",transition:"background .15s ease,color .15s ease",
                background:view===id?"linear-gradient(135deg,#2563eb,#3b82f6 64%,#22d3ee)":"transparent",
                color:warn?(view===id?"#fff":"#fca5a5"):(view===id?"#fff":"#9aa9bd"),
                fontWeight:view===id?800:700}}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
      )}


      {syncError&&<div role="alert" style={{margin:"12px 20px 0",padding:12,border:"1px solid #b45309",borderRadius:10,color:"#fde68a",background:"#422006"}}>
        {syncError} Изменения пока не подтверждены сервером.
        <button className="ppt-btn" onClick={()=>doSave(rawData)}>Повторить сохранение</button>
        <button className="ppt-btn" onClick={()=>exportJSON(rawData)}>Скачать мои изменения</button>
        <button className="ppt-btn" disabled={Boolean(saveTimer.current||saveQueueRef.current?.pending)} onClick={()=>{if(window.confirm("Загрузить данные сервера? Сначала скачайте свои несохранённые изменения, если они нужны."))cloudLoad().then(d=>{serverRevisionRef.current=d._revision;histRef.current=[];pendingLogRef.current=[];logHistoryRef.current=d.changelog||[];unsavedRef.current=false;setRawData(d);setSyncError("");setSyncState("ok");}).catch(e=>setSyncError(e.message));}}>Загрузить актуальные данные</button>
      </div>}
      <div className="ppt-main-content" style={{padding:"22px 20px 20px"}}>
        {navState?.type==="person"?(
          <PersonCard personId={navState.id} data={data} onBack={()=>navigate(null)} onUpdatePeople={updateData} canEditBirthday={isAdmin} canEditAbsences={canManage}/>
        ):navState?.type==="series"?(
          <SeriesCard seriesId={navState.id} data={data} onBatchUpdate={batchUpdate}/>
        ):navState?.type==="project"?(
          <ProjectCard projectId={navState.id} data={data} onUpdate={updateData} onBatchUpdate={batchUpdate}
            onBack={()=>navigate(null)} onSeriesSelect={id=>navigate({type:"series",id})}
            onDelete={canDeleteStructure?(id=>{deleteProject(id);navigate(null);}):null} onLog={addLog} canDeleteStructure={canDeleteStructure}
            canEditProject={canEditProjectById(navState.id)} canManageProjectAssignments={canManageProjectAssignments}/>
        ):(isMobile?(
          <MobileWorkspace view={view} data={data} conflictDetails={conflictDetails} setView={setView} navigate={navigate}/>
        ):(
        <>
        {view==="today"    &&<TodayView     data={data} conflictDetails={conflictDetails} onNavigateConflicts={()=>setView("conflicts")} canEdit={canEdit} canDeleteStructure={canDeleteStructure}/>}
        {view==="projects" &&<ProjectsView  data={data} onUpdate={updateData} onBatchUpdate={batchUpdate} onDeleteProject={deleteProject} onProjectSelect={id=>navigate({type:"project",id})} onSeriesSelect={id=>navigate({type:"series",id})} canEdit={canEdit} canDeleteStructure={canDeleteStructure}
          isManager={isManager} canManageProjectAssignments={canManageProjectAssignments} canEditProjectById={canEditProjectById} currentManagerEntry={currentManagerEntry}/>}
        {view==="calendar" &&<CalendarView  data={data} onGoToGantt={day=>{setGanttDay(day);setView("gantt");}} canEdit={canEdit} canDeleteStructure={canDeleteStructure}/>}
        {view==="gantt"    && canManage &&<GanttView     data={data} onUpdate={updateData} onBatchUpdate={batchUpdate} onSeriesSelect={id=>navigate({type:"series",id})} startDay={ganttDay} onLog={addLog} canEdit={canEdit} canEditOldTasks={isAdmin||isLead} canEditProjectById={canEditProjectById}/>}
        {view==="days"     &&<DaysView      data={data} conflictIds={conflictIds}/>}
        {view==="people"   &&<PeopleView    data={data} conflictIds={conflictIds} onPersonSelect={id=>navigate({type:"person",id})} canEdit={canEdit} onUpdate={updateData} onLog={addLog} canEditProjectById={canEditProjectById}/>}
        {view==="conflicts" && canManage &&<ConflictsView details={conflictDetails} data={data}/>}
        {view==="analytics" && canManage &&<AnalyticsView data={data} onPersonSelect={id=>navigate({type:"person",id})}/>}
        {view==="directory" && canManage &&<DirectoryView data={data} onUpdate={updateData} onBatchUpdate={batchUpdate} onLog={addLog} user={user} onUserUpdate={(newU)=>{setUser(newU);}}/>}
        </>
        ))}

        {!isMobile&&!navState&&!["today","conflicts","analytics","directory"].includes(view)&&(
          <div style={{marginTop:24,paddingTop:14,borderTop:"1px solid #1e293b",
            display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:10,color:"#334155",letterSpacing:2,marginRight:2}}>ГРУППЫ:</span>
            {stagesCtxVal.stageGroups.map(g=>{
              const repStage=stagesCtxVal.sorted.find(s=>s.groupId===g.id);
              const c=repStage?.color||"#475569";
              return (
                <span key={g.id} style={{fontSize:10,background:`${c}22`,color:c,
                  border:`1px solid ${c}44`,borderRadius:4,padding:"1px 8px",fontWeight:600}}>
                  {g.label}
                </span>
              );
            })}
            <span style={{fontSize:11,color:"#f87171",marginLeft:6}}>⚡ = конфликт</span>
          </div>
        )}
      </div>
      {isMobile&&!navState&&<MobileBottomNav tabs={TABS} view={view} setView={setView} navigate={navigate}/>}
    </div>
    {changelogOpen&&<ChangelogModal entries={data.changelog||[]} onClose={()=>setChangelogOpen(false)}/>}
    {dayShiftsModal&&<DayShiftsModal data={data} onClose={()=>setDayShiftsModal(false)}/>}
    {cmdPaletteOpen&&<CommandPalette data={data} onClose={()=>setCmdPaletteOpen(false)}
      onNavigate={state=>{navigate(state);}}
      onSetView={v=>{setView(v);navigate(null);}}
      onSetGanttDay={setGanttDay}/>}
    </HolidaysCtx.Provider>
    </StagesCtx.Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);

