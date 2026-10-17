import test from 'node:test';
import assert from 'node:assert/strict';
import {slots,OPEN,CLOSE,clock,classify,buildSchedule,validateProject,totalMinutes,upgradeProject,DEFAULT_BOXES} from '../site/engine.js';
function person(id,active=[],rest=[]){return {id,name:`Persona ${id}`,states:slots.map((_,i)=>active.includes(i)?'caja':rest.includes(i)?'descanso':'fuera'),box:'',reviewed:true};}
test('covers exactly 09:00 to 21:30 in 25 half-hour slots',()=>{assert.equal(slots.length,25);assert.equal(slots[0],540);assert.equal(slots.at(-1)+30,CLOSE);assert.equal(clock(OPEN),'09:00');});
test('rank by real cash minutes and honor first cashier, never add support names',()=>{
 const a=person('A',[0,1]),b=person('B',[0,1,2]),c=person('C',[1]);
 assert.equal(totalMinutes(b),90);let r=buildSchedule([a,b,c]);assert.deepEqual(r.blocks[0].members.map(p=>p.id),['B','A']);
 r=buildSchedule([a,b,c],undefined,'A');assert.deepEqual(r.blocks[0].members.map(p=>p.id),['A','B']);assert.equal(r.blocks[0].members[0].box,10);
});
test('breaks exclude a cashier and keep existing cashier boxes across relief',()=>{
 const a=person('A',[0,2],[1]),b=person('B',[0,1,2]);const r=buildSchedule([a,b]);
 const initial=r.blocks[0],rest=r.blocks[1],last=r.blocks[2];assert.equal(rest.members.length,1);assert.equal(rest.breaks[0].id,'A');assert.equal(rest.breaks[0].kind,'HD');
 assert.equal(rest.members[0].box,initial.members.find(p=>p.id==='B').box);assert.equal(last.members.find(p=>p.id==='B').box,initial.members.find(p=>p.id==='B').box);
});
test('only merges blocks when both cashier assignments and breaks match',()=>{
 const a=person('A',[0,1,2],[3]),r=buildSchedule([a]);assert.equal(r.blocks[0].start,540);assert.equal(r.blocks[0].end,630);assert.equal(r.blocks[1].breaks.length,1);assert.equal(r.blocks[1].end,660);
});
test('cashiers return to priority boxes after the morning shift ends',()=>{
 const morning=person('M',[0,1]),afternoonA=person('T1',[1,2,3,4]),afternoonB=person('T2',[1,2,3,4]);
 const r=buildSchedule([morning,afternoonA,afternoonB],undefined,'M');
 const overlap=r.blocks.find(b=>b.start===570),after=r.blocks.find(b=>b.start===600);
 assert.deepEqual(overlap.members.map(p=>p.box),[10,19,14]);
 assert.deepEqual(after.members.map(p=>p.box),[10,19]);
});
test('detect duplicate fixed boxes and demand mismatches instead of inventing staff',()=>{
 const a=person('A',[0]),b=person('B',[0]);a.box=10;b.box=10;const demand=slots.map(()=>null);demand[0]=3;
 const r=buildSchedule([a,b],undefined,'',demand);assert.ok(r.issues.some(x=>x.text.includes('duplicada')));assert.ok(r.issues.some(x=>x.text.includes('3 indicados')));assert.equal(r.blocks[0].members.length,2);
});
test('uncertain image cells are not silently treated as cashier assignments',()=>{const a=person('A');a.states[0]='duda';const r=buildSchedule([a]);assert.equal(r.blocks[0].members.length,0);assert.deepEqual(r.blocks[0].uncertain,['Persona A']);assert.equal(r.issues.length,1);});
test('white paper, grey blocks and coloured work have distinct states',()=>{assert.equal(classify({l:230,c:4}),'fuera');assert.equal(classify({l:110,c:10}),'caja');assert.equal(classify({l:140,c:65}),'otra');assert.equal(classify({l:201,c:15}),'duda');});
test('reject malformed imports and bad slot counts',()=>{assert.throws(()=>validateProject({schema:1,people:[{name:'x',states:[]}],boxes:[10]}));assert.throws(()=>validateProject({schema:1,people:[],boxes:[-2]}));assert.doesNotThrow(()=>validateProject({schema:1,people:[person('A')],boxes:[10,19,14]}));});

test('upgrades current default boxes to 10 and 19, preserves older days and custom priorities',()=>{
 const legacy=[10,18,14,11,12,13,15,16,17];
 const p={schema:1,date:'2026-10-16',people:[],boxes:legacy};
 assert.deepEqual(upgradeProject(p).boxes,DEFAULT_BOXES);
 assert.deepEqual(upgradeProject({...p,date:'2026-10-13'}).boxes,legacy);
 assert.deepEqual(upgradeProject({...p,boxes:[10,18,15]}).boxes,[10,18,15]);
 assert.deepEqual(upgradeProject({...p,rulesVersion:2}).boxes,legacy);
});

test('shift ranking counts only cashier time within chosen hours and clips output',()=>{
 const a=person('A',[0,1,2,3,4,5,6,7,8,9,10,11]),b=person('B',[10,11,12,13]);
 const r=buildSchedule([a,b],undefined,'',null,{start:840,end:960});
 assert.equal(r.blocks[0].start,840);assert.equal(r.blocks.at(-1).end,960);
 assert.equal(r.blocks[0].members[0].id,'B');assert.equal(r.blocks[0].members[0].box,10);
 assert.equal(r.blocks.flatMap(b=>b.breaks).length,0);
});
test('temporary principal, fixed box and swap apply only within their interval',()=>{
 const a=person('A',[0,1,2]),b=person('B',[0,1,2]),c=person('C',[0,1,2]);
 for(const adjustment of [{kind:'first',personId:'B'},{kind:'box',personId:'B',box:18},{kind:'swap',personId:'A',otherId:'B'}]){
  const base=buildSchedule([a,b,c],undefined,'',null,{start:540,end:630});
  const r=buildSchedule([a,b,c],undefined,'',null,{start:540,end:630,adjustments:[{...adjustment,start:570,end:600}]});
  assert.deepEqual(r.blocks[0].members,base.blocks[0].members);assert.deepEqual(r.blocks.at(-1).members,base.blocks[0].members);
  const mid=r.blocks.find(b=>b.start===570);assert.equal(new Set(mid.members.map(p=>p.box)).size,3);
  if(adjustment.kind==='first')assert.equal(mid.members[0].id,'B');
  if(adjustment.kind==='box')assert.equal(mid.members.find(p=>p.id==='B').box,18);
  if(adjustment.kind==='swap')assert.equal(mid.members.find(p=>p.id==='B').box,10);
 }
});
test('exceptions never create a cashier during another task or a break',()=>{
 const a=person('A',[0],[1]);const r=buildSchedule([a],undefined,'',null,{start:570,end:600,adjustments:[{kind:'box',personId:'A',box:10,start:570,end:600}]});
 assert.equal(r.blocks[0].members.length,0);assert.equal(r.blocks[0].breaks[0].id,'A');assert.ok(r.issues.length);
});
test('imports validate shifts and exceptions; older projects remain readable',()=>{
 const p={schema:1,people:[person('A',[0])],boxes:[10,19]};assert.doesNotThrow(()=>validateProject(p));
 assert.throws(()=>validateProject({...p,shift:'night'}));assert.throws(()=>validateProject({...p,shiftStart:541,shiftEnd:600}));
 assert.throws(()=>validateProject({...p,adjustments:[{kind:'box',personId:'missing',box:10,start:540,end:600}]}));
 assert.doesNotThrow(()=>validateProject({...p,shift:'afternoon',shiftStart:840,shiftEnd:1290,adjustments:[]}));
});

test('a section relief replaces one cashier, inherits the box, and expires without adding support',()=>{
 const a=person('A',[0,1,2]),b=person('B',[0,1,2]),cover=person('C');cover.states[1]='otra';
 const r=buildSchedule([a,b,cover],undefined,'A',null,{start:540,end:630,adjustments:[{kind:'relief',personId:'A',otherId:'C',start:570,end:600}]});
 assert.deepEqual(r.blocks[0].members.map(p=>p.id),['A','B']);assert.deepEqual(r.blocks[1].members.map(p=>p.id),['C','B']);assert.equal(r.blocks[1].members[0].box,10);assert.equal(r.blocks[1].members.length,2);assert.equal(r.blocks[1].breaks.length,0);assert.deepEqual(r.blocks[2].members.map(p=>p.id),['A','B']);
 cover.states[1]='descanso';const invalid=buildSchedule([a,b,cover],undefined,'A',null,{start:570,end:600,adjustments:[{kind:'relief',personId:'A',otherId:'C',start:570,end:600}]});assert.ok(invalid.issues.some(i=>i.text.includes('Relevo')));assert.equal(invalid.blocks[0].members[0].id,'A');
});
