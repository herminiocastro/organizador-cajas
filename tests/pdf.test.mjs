import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {slots,buildSchedule,halfHourBlocks,DEFAULT_BOXES} from '../site/engine.js';
import {buildPDF} from '../site/pdf.js';
const require=createRequire(import.meta.url),PDFLib=require('pdf-lib');
test('exports all 25 half-hours and a valid PDF, including accents and breaks',async()=>{
 const people=Array.from({length:8},(_,i)=>({id:String(i),name:['Ángel García','María Suárez','José Fernández','Raquel Galván','Nicolás Pérez','Ana Belén','Óscar López','Inés Díaz'][i],states:slots.map((_,j)=>j===i+3?'descanso':'caja'),reviewed:true,box:''}));
 const result=buildSchedule(people,DEFAULT_BOXES);result.blocks=halfHourBlocks(result.blocks);
 assert.equal(result.blocks.length,25);assert.ok(result.blocks.every(b=>b.end-b.start===30));
 const bytes=await buildPDF({date:'2026-10-16',people},result,PDFLib);assert.equal(new TextDecoder().decode(bytes.slice(0,5)),'%PDF-');
 const doc=await PDFLib.PDFDocument.load(bytes);assert.ok(doc.getPageCount()>=1&&doc.getPageCount()<=3);assert.ok(bytes.length>1000);
});
