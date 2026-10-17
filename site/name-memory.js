// Confirmed spellings stay on this device; no employee directory is shipped.
const key=name=>String(name||'').normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase('es').replace(/\s+/g,' ').trim();
export function rememberName(memory,read,confirmed){
  if(!read||!confirmed||/^Nombre pendiente/i.test(read)||read.length>150||confirmed.length>150)return memory;
  return {...memory,[key(read)]:confirmed.trim()};
}
export function confirmedName(memory,read){
  const value=Object.hasOwn(memory,key(read))?memory[key(read)]:null;
  return typeof value==='string'&&value.trim()&&value.length<=150?value:null;
}
