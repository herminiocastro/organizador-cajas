const CACHE='organizador-cajas-0.2.0';
const BASE=new URL('./',self.location.href);
const FILES=['./','index.html','styles.css','app.js','engine.js','pdf.js','manifest.webmanifest','icon.svg','icon-180.png','icon-192.png','icon-512.png','vendor/tesseract.min.js','vendor/pdf-lib.min.js','vendor/worker.min.js','vendor/eng.traineddata','vendor/tesseract-core-lstm.wasm.js','vendor/tesseract-core-lstm.wasm','vendor/tesseract-core-simd-lstm.wasm.js','vendor/tesseract-core-simd-lstm.wasm'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(new URL(f,BASE).href,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('organizador-cajas-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request)));});
