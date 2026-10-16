// Run manually with private local photo paths. No photos or names are committed.
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {extractRows,slots,clock} from '../site/engine.js';
const require=createRequire(import.meta.url),sharp=require('sharp'),{createWorker}=require('tesseract.js');
const worker=await createWorker('eng',1,{langPath:new URL('../site/vendor',import.meta.url).pathname,gzip:false});
try{for(const [index,file] of process.argv.slice(2).entries()){
 const {data,info}=await sharp(file).rotate().resize({width:1800,withoutEnlargement:true}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const {width:w,height:h}=info,x=Math.round(w*.055),y=Math.round(h*.085),cw=Math.round(w*.15),ch=Math.round(h*.85),scale=4;
 let crop=await sharp(data,{raw:{width:w,height:h,channels:4}}).extract({left:x,top:y,width:cw,height:ch}).resize(cw*scale,ch*scale).grayscale().normalise({lower:1.5,upper:98.5}).png().toBuffer();
 await worker.setParameters({tessedit_pageseg_mode:'6'});const r=await worker.recognize(crop,{}, {tsv:true,text:true});
 const grouped=new Map();for(const l of r.data.tsv.split('\n').slice(1)){const a=l.split('\t');if(a[0]!=='5'||!a[11]?.trim())continue;const key=a.slice(1,5).join('-'),left=Number(a[6])/scale+x,top=Number(a[7])/scale+y,right=left+Number(a[8])/scale,bottom=top+Number(a[9])/scale,old=grouped.get(key);if(old){old.text+=' '+a[11];old.bbox.x1=Math.max(old.bbox.x1,right);old.bbox.y1=Math.max(old.bbox.y1,bottom);old.confidence=Math.min(old.confidence,Number(a[10]));}else grouped.set(key,{text:a[11],bbox:{x0:left,y0:top,x1:right,y1:bottom},confidence:Number(a[10])});}
 const photo={id:index?'back':'front',amLines:[],calibration:{leftTop:w*.22,leftBottom:w*(index?.21:.19),rightTop:w*(index?.905:.821),rightBottom:w*(index?.91:.879),top:0,bottom:h}};
 const rows=extractRows(photo,[...grouped.values()],{width:w,height:h,data});console.log('Photo',index+1,'OCR lines:',grouped.size,'candidate cashiers:',rows.length);console.log(rows.map(p=>({name:p.name,confidence:p.confidence,y:Math.round(p.sourceY),grid:p.grid,hours:p.states.filter(s=>s==='caja').length*.5,times:p.states.map((s,i)=>s==='caja'?clock(slots[i]):null).filter(Boolean)})));
}}
finally{await worker.terminate();}
