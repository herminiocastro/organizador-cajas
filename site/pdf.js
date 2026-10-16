import {clock} from './engine.js';
function safe(s){return String(s??'').replace(/[^\u0020-\u00ff\u20ac]/g,' ').replace(/\s+/g,' ').trim();}
export async function buildPDF(project,result,lib=globalThis.PDFLib){
  if(!lib)throw new Error('No se ha cargado el generador PDF. Recarga la aplicación.');
  const {PDFDocument,StandardFonts,rgb}=lib,doc=await PDFDocument.create();
  const regular=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
  const ink=rgb(.09,.20,.16),muted=rgb(.37,.44,.37),red=rgb(.66,.22,.16),rule=rgb(.83,.87,.81);
  const width=595.28,height=841.89,margin=27,gap=27,colWidth=(width-margin*2-gap)/2,restWidth=74,restX=colWidth-restWidth-3,nameWidth=restX-11;
  const provisional=result.provisional??(project.people.some(p=>!p.reviewed)||result.issues.length>0);
  const fontSize=7.8,line=8.8;
  function wrap(text,max,font=regular,size=fontSize){const lines=[];let current='';for(const word of safe(text).split(' ')){const next=current?current+' '+word:word;if(current&&font.widthOfTextAtSize(next,size)>max){lines.push(current);current=word;}else current=next;}if(current)lines.push(current);return lines;}
  const blocks=result.blocks.map(b=>{
    const names=b.members.flatMap(p=>wrap(`${p.name} (${p.box??'?'})`,nameWidth));
    if(!names.length)names.push('Sin cajeros confirmados');
    const unknown=b.uncertain.flatMap(name=>wrap(`REVISAR: ${name}`,nameWidth));
    const rests=b.breaks.flatMap(r=>wrap(`${r.name} (${r.kind})`,restWidth,regular,8));
    return {b,names,unknown,rests,height:22+Math.max(names.length+unknown.length,rests.length+(rests.length?1:0) )*line+6};
  });
  let page,pageNo=0,top,y,col;
  function newPage(){page=doc.addPage([width,height]);pageNo++;col=0;page.drawText('LISTA DE CAJAS',{x:margin,y:height-36,size:15,font:bold,color:ink});const date=project.date?project.date.split('-').reverse().join('/'):'Fecha pendiente';
    page.drawText(`${date}  |  ${safe(result.label||'Día completo')}  |  ${clock(result.start??540)} - ${clock(result.end??1290)}`,{x:margin,y:height-52,size:9,font:regular,color:muted});
    top=height-74;
    if(project.demo){page.drawText('EJEMPLO FICTICIO',{x:margin,y:top,size:8,font:bold,color:red});top-=15;}
    if(provisional){page.drawText('PROVISIONAL - Comprueba nombres, tramos y descansos con el MOT.',{x:margin,y:top,size:8,font:bold,color:red});top-=16;}
    y=top;page.drawLine({start:{x:width/2,y:top},end:{x:width/2,y:margin+12},thickness:.4,color:rule});
  }
  newPage();
  // Fill from top to bottom in the left column, then in the right column, as on the reference sheet.
  // Balance a single page where possible without splitting a time block across columns.
  const total=blocks.reduce((sum,b)=>sum+b.height,0),capacity=top-margin-12;
  const balanced=total<=capacity*2?Math.max(...blocks.map(b=>b.height),total/2):capacity;
  for(let index=0;index<blocks.length;index++){
    const item=blocks[index];
    const threshold=col===0&&total<=capacity*2?top-balanced:margin+12;
    if(y<top&&(y-item.height<margin+12||(col===0&&y-item.height<threshold&&top-y>=total/2-item.height/2))){if(col===0){col=1;y=top;}else newPage();}
    const x=margin+col*(colWidth+gap),base=y-12,b=item.b;
    page.drawText(`${clock(b.start)} - ${clock(b.end)}`,{x,y:base,size:10,font:bold,color:ink});
    page.drawLine({start:{x,y:base-4},end:{x:x+94,y:base-4},thickness:.6,color:ink});
    const cx=x+114;page.drawCircle({x:cx,y:base+3,size:10,borderWidth:.7,borderColor:ink});const count=String(b.members.length);page.drawText(count,{x:cx-bold.widthOfTextAtSize(count,10)/2,y:base-1,size:10,font:bold,color:ink});
    let nameY=y-23;
    for(const name of item.names){page.drawText(name,{x,y:nameY,size:fontSize,font:regular,color:ink});nameY-=line;}
    for(const name of item.unknown){page.drawText(name,{x,y:nameY,size:fontSize,font:regular,color:red});nameY-=line;}
    if(item.rests.length){page.drawText('Descansos',{x:x+restX,y:y-23,size:8,font:bold,color:muted});item.rests.forEach((name,i)=>page.drawText(name,{x:x+restX,y:y-23-(i+1)*line,size:8,font:regular,color:muted}));}
    y-=item.height;
  }
  const count=doc.getPageCount();for(const [i,p]of doc.getPages().entries())p.drawText(`${clock(result.start??540)} - ${clock(result.end??1290)}  |  ${i+1} / ${count}`,{x:margin,y:15,size:7,font:regular,color:muted});
  return doc.save();
}
