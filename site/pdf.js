import {clock} from './engine.js';
function safe(s){return String(s??'').replace(/[^\u0020-\u00ff\u20ac]/g,' ').replace(/\s+/g,' ').trim();}
export async function buildPDF(project,result,lib=globalThis.PDFLib){
  if(!lib)throw new Error('No se ha cargado el generador PDF. Recarga la aplicación.');
  const {PDFDocument,StandardFonts,rgb}=lib,doc=await PDFDocument.create();
  const regular=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
  const ink=rgb(.09,.20,.16),muted=rgb(.37,.44,.37),red=rgb(.66,.22,.16),rule=rgb(.83,.87,.81),shade=rgb(.96,.97,.95);
  const margin=28,width=595.28,height=841.89,xTime=margin,xNames=115,xBreaks=449,nameWidth=319,breakWidth=width-margin-xBreaks;
  const provisional=project.people.some(p=>!p.reviewed)||result.issues.length>0;
  let page,y,pageNo=0;
  const size=8.5,line=11;
  function wrap(text,max,font=regular,fontSize=size){const lines=[];let current='';for(const word of safe(text).split(' ')){const next=current?current+' '+word:word;if(current&&font.widthOfTextAtSize(next,fontSize)>max){lines.push(current);current=word;}else current=next;}if(current)lines.push(current);return lines;}
  function newPage(){page=doc.addPage([width,height]);pageNo++;page.drawText('LISTA DE CAJAS',{x:margin,y:height-38,size:15,font:bold,color:ink});const date=project.date?project.date.split('-').reverse().join('/'):'Fecha pendiente';page.drawText(date,{x:margin,y:height-55,size:10,font:regular,color:muted});page.drawText(`Pagina ${pageNo}`,{x:width-82,y:height-38,size:8,font:regular,color:muted});y=height-78;if(project.demo){page.drawText('EJEMPLO FICTICIO',{x:margin,y,size:9,font:bold,color:red});y-=16;}if(provisional){page.drawText('PROVISIONAL - Revisa los datos del MOT antes de utilizar la hoja.',{x:margin,y,size:8,font:bold,color:red});y-=18;}
    page.drawText('Tramo',{x:xTime,y,size:8,font:bold,color:muted});page.drawText('Cajeros / caja',{x:xNames,y,size:8,font:bold,color:muted});page.drawText('HD / HM',{x:xBreaks,y,size:8,font:bold,color:muted});y-=8;page.drawLine({start:{x:margin,y},end:{x:width-margin,y},thickness:1,color:ink});y-=5;
  }
  newPage();
  for(const [index,b] of result.blocks.entries()){
    const tokens=[];let xx=0,ln=0;
    for(const p of b.members){const name=safe(p.name),box=p.box===null?'?':String(p.box);const nameSize=regular.widthOfTextAtSize(name,size),boxSize=bold.widthOfTextAtSize(box,7),total=nameSize+boxSize+13;if(xx&&xx+total>nameWidth){ln++;xx=0;}tokens.push({name,box,x:xx,line:ln,nameSize});xx+=total;}
    const unknown=b.uncertain.length?wrap('REVISAR: '+b.uncertain.join(', '),nameWidth):[];
    const rests=b.breaks.flatMap(r=>wrap(`${r.kind}: ${r.name}`,breakWidth));
    const nameLines=Math.max(1,ln+1)+unknown.length;
    const rowHeight=Math.max(25,(Math.max(nameLines,rests.length)+.35)*line);
    if(y-rowHeight<margin+14)newPage();
    if(index%2===0)page.drawRectangle({x:margin-3,y:y-rowHeight+2,width:width-margin*2+6,height:rowHeight,color:shade});
    const base=y-11;
    page.drawText(`${clock(b.start)} - ${clock(b.end)}`,{x:xTime,y:base,size:8,font:bold,color:ink});page.drawText(`(${b.members.length})`,{x:xTime,y:base-11,size:8,font:regular,color:muted});
    if(!tokens.length)page.drawText('Sin cajeros asignados',{x:xNames,y:base,size:8,font:regular,color:muted});
    for(const t of tokens){page.drawText(t.name,{x:xNames+t.x,y:base-t.line*line,size,font:regular,color:ink});page.drawText(t.box,{x:xNames+t.x+t.nameSize+3,y:base-t.line*line+2,size:7,font:bold,color:red});}
    unknown.forEach((t,i)=>page.drawText(t,{x:xNames,y:base-(ln+1+i)*line,size:7.5,font:regular,color:red}));
    rests.forEach((t,i)=>page.drawText(t,{x:xBreaks,y:base-i*line,size:8,font:regular,color:muted}));
    y-=rowHeight;page.drawLine({start:{x:margin,y},end:{x:width-margin,y},thickness:.35,color:rule});
  }
  for(const [i,p]of doc.getPages().entries())p.drawText(`09:00 - 21:30  |  ${i+1} / ${pageNo}`,{x:margin,y:15,size:7,font:regular,color:muted});
  return doc.save();
}
