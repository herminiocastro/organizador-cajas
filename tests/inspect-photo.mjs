// Manual regression with private MOTs. Never commit photos or the resulting JSON.
// Requires sharp and @napi-rs/canvas in the local inspection environment.
// node tests/inspect-photo.mjs <front-photo> <back-photo> <private-output.json>
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {readMotPhoto} from '../site/mot-reader.js';
const require=createRequire(import.meta.url),sharp=require('sharp'),{createCanvas,loadImage}=require('@napi-rs/canvas'),{createWorker}=require('tesseract.js');
const [front,back,output]=process.argv.slice(2);if(!front||!back||!output)throw new Error('Indica las dos fotos y una ruta JSON privada de salida.');
const worker=await createWorker('spa',1,{langPath:new URL('../site/vendor',import.meta.url).pathname,gzip:false});
const adapter={setParameters:p=>worker.setParameters(p),recognize:(canvas,...args)=>worker.recognize(canvas.toBuffer('image/png'),...args)};
try{const readings=[];for(const [i,file]of [front,back].entries()){let image=sharp(file).rotate();const meta=await image.metadata();if(meta.width>meta.height*1.15)image=image.rotate(90);const bytes=await image.resize({width:1800,withoutEnlargement:true}).png().toBuffer(),decoded=await loadImage(bytes),canvas=createCanvas(decoded.width,decoded.height);canvas.getContext('2d').drawImage(decoded,0,0);const reading=await readMotPhoto({id:i?'back':'front',canvas},adapter,{canvasFactory:createCanvas});readings.push(reading);console.log('Cara',i+1,'secciones',reading.diagnostics.sections,'filas',reading.diagnostics.rows,'con caja',reading.people.length);}
 fs.writeFileSync(output,JSON.stringify({readerVersion:3,readings},null,2),{mode:0o600});console.log('Resultado privado guardado.');}
finally{await worker.terminate();}
