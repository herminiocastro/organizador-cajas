export const OPEN=9*60, CLOSE=21*60+30, STEP=30;
export const STATES=['fuera','otra','caja','descanso','duda'];
export const LABELS={fuera:'Sin asignación',otra:'Otra tarea',caja:'Caja',descanso:'Descanso',duda:'Revisar'};
export const slots=Array.from({length:(CLOSE-OPEN)/STEP},(_,i)=>OPEN+i*STEP);
export function clock(n){return `${Math.floor(n/60).toString().padStart(2,'0')}:${(n%60).toString().padStart(2,'0')}`;}
export function minute(s){const [h,m]=String(s).split(':').map(Number);return h*60+m;}
export function cleanName(s){return s.replace(/[|{}\[\](]\s*[AB8§6].*$/i,'').replace(/\s+[|}\]]?\s*[AB8]\s*$/,'').replace(/[^\p{L}\s.'-]/gu,'').replace(/\s+/g,' ').trim();}
export function sampleCell(img,cx,cy,halfW=5,halfH=3){
  const vals=[];for(let y=Math.round(cy-halfH);y<=Math.round(cy+halfH);y++)for(let x=Math.round(cx-halfW);x<=Math.round(cx+halfW);x++){
    if(x<0||y<0||x>=img.width||y>=img.height)continue;
    const i=(y*img.width+x)*4,r=img.data[i],g=img.data[i+1],b=img.data[i+2];
    vals.push({l:(r+g+b)/3,c:Math.max(r,g,b)-Math.min(r,g,b)});
  }
  if(!vals.length)return {l:255,c:0};vals.sort((a,b)=>a.l-b.l);return vals[Math.floor(vals.length/2)];
}
export function classify(p,paper=230){
  if(p.c>32)return 'otra';
  const ratio=p.l/Math.max(30,paper);
  if(ratio<.83&&p.c<24)return 'caja';
  if(ratio<.91&&p.c<32)return 'duda';
  return 'fuera';
}
export function bands(img){
  const {width:w,height:h}=img,ys=[];
  for(let y=Math.round(h*.075);y<h*.94;y++){
    let n=0;for(let x=Math.round(w*.235);x<w*.96;x+=3){const i=(y*w+x)*4,r=img.data[i],g=img.data[i+1],b=img.data[i+2];if(Math.max(r,g,b)-Math.min(r,g,b)>32 && (r+g+b)/3<225)n++;}
    if(n>w*.017)ys.push(y);
  }
  const out=[];let start=ys[0],last=start;
  for(const y of ys.slice(1)){if(y-last>3){if(last-start>=h*.003&&last-start<h*.022)out.push({y:(start+last)/2,top:start,bottom:last});start=y;}last=y;}
  if(last-start>=h*.003&&last-start<h*.022)out.push({y:(start+last)/2,top:start,bottom:last});return out;
}
export function inferGrid(img,y,fallback){
  // Estimate the half-hour spacing from the light gutters between coloured blocks.
  const paper=sampleCell(img,img.width*.19,y,2,2).l, runs=[];let start=null;
  for(let x=Math.round(img.width*.24);x<img.width*.96;x++){
    const p=sampleCell(img,x,y,0,2),ink=p.c>32||p.l<Math.min(190,paper*.78);
    if(ink&&start===null)start=x;
    if((!ink||x===Math.floor(img.width*.96)-1)&&start!==null){if(x-start>=img.width*.009&&x-start<img.width*.04)runs.push({start,end:x});start=null;}
  }
  const gaps=[];for(let i=1;i<runs.length;i++){const d=runs[i].start-runs[i-1].start;if(d>img.width*.013&&d<img.width*.033)gaps.push(d);}
  if(gaps.length<4)return fallback;
  gaps.sort((a,b)=>a-b);const median=gaps[Math.floor(gaps.length/2)],close=gaps.filter(g=>Math.abs(g-median)<2);const step=close.reduce((a,b)=>a+b,0)/close.length;
  // Retain the user's calibrated origin; only snap the inferred phase close to it.
  const near=runs.map(r=>r.start-Math.round((r.start-fallback.x5)/step)*step).sort((a,b)=>Math.abs(a-fallback.x5)-Math.abs(b-fallback.x5))[0];
  return {x5:Math.abs(near-fallback.x5)<3?near:fallback.x5,step};
}
export function gridAt(photo,y){const c=photo.calibration,t=Math.max(0,Math.min(1,(y-c.top)/(c.bottom-c.top||1)));return {x5:c.leftTop+(c.leftBottom-c.leftTop)*t,step:((c.rightTop+(c.rightBottom-c.rightTop)*t)-(c.leftTop+(c.leftBottom-c.leftTop)*t))/32};}
export function extractRows(photo,lines,img){
  const found=[],used=[];
  for(const line of lines){
    const raw=line.text.trim(),name=cleanName(raw);
    // Only accept employee-labelled rows. Text from legends or task subtotals must not become staff.
    if(!/[|{}\[\](]\s*[AB8§6](?:\s|$|[)©®@])/i.test(raw)&&!(/\s+[AB][o0]?$/i.test(raw)&&line.confidence>=20))continue;
    if(name.length<5||!name.includes(' ')||/horas|tareas|sobres|embutido|jamon|cuchillo|montaje|caudal|ancla|planific|perfumer|limpieza|organizador|fruta|verdura|cajas|horario|charcut|pescado|mantenim|reposici|descanso|vacacion|descarga|extra|invierno/i.test(name))continue;
    let y=(line.bbox.y0+line.bbox.y1)/2;
    if(y<img.height*.08||y>img.height*.94||used.some(a=>Math.abs(a-y)<img.height*.009))continue;
    // Text baseline and coloured cell centres can differ slightly; prefer the strongest nearby row.
    let best=y,bestScore=-1;
    for(let yy=y-img.height*.006;yy<=y+img.height*.006;yy+=2){let score=0;for(let x=img.width*.26;x<img.width*.92;x+=8){const p=sampleCell(img,x,yy,1,1);if(p.c>32||p.l<135)score++;}if(score>bestScore){best=yy;bestScore=score;}}
    if(bestScore<5)continue;y=best;
    const calibrated=gridAt(photo,y),grid=photo.userCalibrated?calibrated:inferGrid(img,y,calibrated);
    const states=slots.map(t=>{
      const x=grid.x5+((t-300)/30+.5)*grid.step;
      // Compare with nearby paper at the SAME x: a shadow is not a cashier block.
      const slope=photo.id==='front'?-.03*Math.max(0,1-y/(img.height*.37)):0;
      const predicted=y+(x-img.width*.3)*slope;
      let best=sampleCell(img,x,predicted,grid.step*.20,2),bestY=predicted;
      for(let yy=predicted-img.height*.004;yy<=predicted+img.height*.004;yy+=2){const p=sampleCell(img,x,yy,grid.step*.20,2);if(p.l<best.l){best=p;bestY=yy;}}
      const papers=[sampleCell(img,x,bestY-img.height*.009,grid.step*.18,1).l,sampleCell(img,x,bestY+img.height*.009,grid.step*.18,1).l,sampleCell(img,x,bestY+img.height*.014,grid.step*.18,1).l];
      return classify(best,Math.max(...papers));
    });
    const breaks=[];
    for(const am of photo.amLines||[]){if(Math.abs((am.bbox.y0+am.bbox.y1)/2-y)<img.height*.011){const x=(am.bbox.x0+am.bbox.x1)/2;const index=Math.round((x-grid.x5)/grid.step-.5)-(OPEN-300)/30;if(index>=0&&index<slots.length){states[index]='descanso';breaks.push(index);}}}
    if(states.some(s=>s==='caja')){used.push(y);found.push({id:crypto.randomUUID(),name,source:photo.id,sourceY:y,grid,states,confidence:line.confidence??0,reviewed:false,box:'',priority:0});}
  }
  return found;
}
export function totalMinutes(p){return p.states.filter(s=>s==='caja').length*STEP;}
export function buildSchedule(people,boxes=[10,18,14,11,12,13,15,16,17],firstId='',demand=null){
  const ranked=[...people].sort((a,b)=>(a.id===firstId?-1:b.id===firstId?1:0)||(a.priority||0)-(b.priority||0)||totalMinutes(b)-totalMinutes(a)||a.name.localeCompare(b.name,'es'));
  let previous=new Map();const blocks=[],issues=[];
  for(let i=0;i<slots.length;i++){
    const active=ranked.filter(p=>p.states[i]==='caja'),rest=ranked.filter(p=>p.states[i]==='descanso'),uncertain=ranked.filter(p=>p.states[i]==='duda');
    const assigned=new Map(),used=new Set();
    for(const p of active){if(p.box){const box=Number(p.box);if(used.has(box))issues.push({i,text:`Caja ${box} duplicada en ${clock(slots[i])}.`});else{assigned.set(p.id,box);used.add(box);}}}
    for(const p of active){if(assigned.has(p.id))continue;const old=previous.get(p.id);if(old&&!used.has(old)){assigned.set(p.id,old);used.add(old);}}
    for(const p of active){if(assigned.has(p.id))continue;const box=boxes.find(b=>!used.has(b));if(box){assigned.set(p.id,box);used.add(box);}else issues.push({i,text:`Faltan números de caja en ${clock(slots[i])}.`});}
    for(const p of uncertain)issues.push({i,text:`Revisar casilla de ${p.name} a las ${clock(slots[i])}.`});
    if(demand&&demand[i]!==null&&demand[i]!==''&&Number(demand[i])!==active.length)issues.push({i,text:`${clock(slots[i])}: ${active.length} asignados y ${demand[i]} indicados en el MOT.`});
    const members=active.map(p=>({id:p.id,name:p.name,box:assigned.get(p.id)??null}));
    const breaks=rest.map(p=>({id:p.id,name:p.name,kind:['HD','HM'].includes(p.breakKind)?p.breakKind:(slots[i]<900?'HD':'HM')}));
    const signature=JSON.stringify([members,breaks,uncertain.map(p=>p.id)]),last=blocks.at(-1);
    if(last&&last.signature===signature)last.end=slots[i]+STEP;else blocks.push({start:slots[i],end:slots[i]+STEP,members,breaks,uncertain:uncertain.map(p=>p.name),signature});
    previous=assigned;
  }
  return {blocks,issues};
}
export function validateProject(p){
  if(!p||p.schema!==1||!Array.isArray(p.people)||p.people.length>150)throw new Error('Este archivo no es un proyecto válido de Organizador de cajas.');
  const ids=new Set();for(const a of p.people){if(typeof a.id!=='string'||a.id.length>100||ids.has(a.id)||typeof a.name!=='string'||a.name.length>150||!Array.isArray(a.states)||a.states.length!==slots.length||a.states.some(s=>!STATES.includes(s))||(a.box!==''&&a.box!==undefined&&(!Number.isInteger(a.box)||a.box<1||a.box>99))||(a.breakKind&&!['HD','HM'].includes(a.breakKind)))throw new Error('El archivo contiene horarios no válidos.');ids.add(a.id);}
  if(!Array.isArray(p.boxes)||!p.boxes.length||new Set(p.boxes).size!==p.boxes.length||p.boxes.some(b=>!Number.isInteger(b)||b<1||b>99))throw new Error('Revisa los números de caja del archivo.');
  if(p.store!==undefined&&(typeof p.store!=='string'||p.store.length>100))throw new Error('El nombre de tienda no es válido.');
  if(p.date!==undefined&&(typeof p.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(p.date)))throw new Error('La fecha no es válida.');
  if(p.demand&&(!Array.isArray(p.demand)||p.demand.length!==slots.length||p.demand.some(v=>v!==null&&(!Number.isInteger(v)||v<0||v>40))))throw new Error('La necesidad del MOT no es válida.');return p;
}
