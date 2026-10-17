import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyMotCell,detectLayout,detectHourAnchors,timeX,sampleMotRow,employeeName} from '../site/mot-reader.js';
function fixture(){
 const width=1000,height=1400,data=new Uint8ClampedArray(width*height*4);data.fill(245);for(let i=3;i<data.length;i+=4)data[i]=255;
 const paint=(x,y,rgb)=>{x=Math.round(x);y=Math.round(y);if(x<0||x>=width||y<0||y>=height)return;const p=(y*width+x)*4;data[p]=rgb[0];data[p+1]=rgb[1];data[p+2]=rgb[2];};
 const left=220,right=950,step=(right-left)/38,curve=x=>160+Math.max(0,Math.min(1,(x-left)/250))*20-Math.max(0,(x-700)/250)*10;
 for(let x=left;x<=right;x++){const hour=5+(x-left)/(right-left)*19,rgb=hour<9||hour>=21?[125,153,121]:hour>=11&&hour<14||hour>=18&&hour<20?[185,142,142]:[203,186,110];for(let dy=-2;dy<=2;dy++)paint(x,curve(x)+dy,rgb);}
 for(let h=5;h<=24;h++){const x=left+(h-5)*step*2+3;for(let xx=0;xx<(h>=10?7:4);xx++)for(let yy=-13;yy<=-7;yy++)if(xx%4===0||yy===-13||yy===-7)paint(x+xx,curve(x)+yy,[80,80,80]);}
 for(let n=0;n<3;n++){const offset=40+n*34;for(let cell=2;cell<32;cell++){const a=left+cell*step+1,b=left+(cell+1)*step-1;for(let x=a;x<b;x++)for(let dy=-6;dy<=6;dy++)paint(x,curve(x)+offset+dy,n===1?[103,149,106]:[100,102,100]);}const cx=198,cy=curve(left)+offset;for(let x=cx-9;x<=cx+9;x++)for(let y=cy-9;y<=cy+9;y++){const d=Math.hypot((x-cx)/9,(y-cy)/9);if(d>.78&&d<1.05)paint(x,y,[50,50,50]);}}
 return {width,height,data};
}
test('measures curved clock scale and row tracks without employee labels or known names',()=>{
 const img=fixture(),layout=detectLayout(img);assert.equal(layout.sections.length,1);const section=layout.sections[0];assert.equal(section.rows.length,3);assert.ok(section.right-section.left>700);
 section.anchors=detectHourAnchors(img,section);assert.ok(section.anchors.length>=12);assert.ok(Math.abs(timeX(section,840)-((section.left+(840-300)/30*section.step)))<12);
 const cash=sampleMotRow(img,section,section.rows[0]),coloured=sampleMotRow(img,section,section.rows[1]);assert.ok(cash.states.filter(s=>s==='caja').length>=15);assert.equal(coloured.states.filter(s=>s==='caja').length,0);
});
test('task colours and a coloured shadow do not become cash, grey remains cash',()=>{
 assert.equal(classifyMotCell([103,105,104],[205,201,196]),'caja');
 assert.equal(classifyMotCell([96,137,110],[206,206,205]),'otra');
 assert.equal(classifyMotCell([111,91,67],[203,203,199]),'otra');
 assert.equal(classifyMotCell([115,124,127],[213,219,223]),'caja');
 assert.equal(classifyMotCell([220,220,218],[224,224,222]),'fuera');
});
test('a cropped/unsupported photo fails explicitly instead of returning a tiny confident list',()=>{
 const data=new Uint8ClampedArray(300*400*4).fill(255);assert.throws(()=>detectLayout({width:300,height:400,data}),/escala horaria/);
});
test('clock interpolation uses measured marks rather than a uniform full-photo grid',()=>{
 const section={left:200,step:20,anchors:[{time:300,x:200},{time:600,x:400},{time:1200,x:830},{time:1440,x:1010}]};assert.equal(timeX(section,1215),841.25);assert.equal(timeX(section,900),615);
});
test('employee names are cleaned without requiring a correctly recognised A/B label',()=>{
 assert.equal(employeeName('Ana García | A'), 'Ana García');assert.equal(employeeName('Ana García'), 'Ana García');
});
