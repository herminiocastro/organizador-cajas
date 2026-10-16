import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const dest=path.join(root,'site/vendor');await fs.mkdir(dest,{recursive:true});
const tess=path.dirname(require.resolve('tesseract.js/package.json'));
const core=path.dirname(require.resolve('tesseract.js-core/package.json'));
for(const f of ['tesseract.min.js','worker.min.js','tesseract.min.js.LICENSE.txt','worker.min.js.LICENSE.txt'])await fs.copyFile(path.join(tess,'dist',f),path.join(dest,f));
for(const f of ['tesseract-core-lstm.wasm.js','tesseract-core-lstm.wasm','tesseract-core-simd-lstm.wasm.js','tesseract-core-simd-lstm.wasm'])await fs.copyFile(path.join(core,f),path.join(dest,f));
await fs.copyFile(path.join(tess,'LICENSE.md'),path.join(dest,'tesseract.js-LICENSE.txt'));
await fs.copyFile(path.join(core,'LICENSE'),path.join(dest,'tesseract.js-core-LICENSE.txt'));
const file=path.join(dest,'eng.traineddata');
const expected='7d4322bd2a7749724879683fc3912cb542f19906c83bcc1a52132556427170b2';
let bytes;try{bytes=await fs.readFile(file);}catch{}
if(!bytes||createHash('sha256').update(bytes).digest('hex')!==expected){
 const response=await fetch('https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/4.1.0/eng.traineddata',{signal:AbortSignal.timeout(60000)});
 if(!response.ok)throw new Error(`No se ha podido descargar el idioma OCR: ${response.status}`);
 bytes=Buffer.from(await response.arrayBuffer());
 if(createHash('sha256').update(bytes).digest('hex')!==expected)throw new Error('La comprobación del idioma OCR ha fallado.');
 await fs.writeFile(file,bytes);
}
console.log('Lector OCR y datos de idioma preparados y verificados.');
