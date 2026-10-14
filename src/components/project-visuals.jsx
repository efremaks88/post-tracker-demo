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

