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
