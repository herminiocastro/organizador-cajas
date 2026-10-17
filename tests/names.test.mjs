import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseNameReadings,employeeName} from '../site/mot-reader.js';
import {rememberName,confirmedName} from '../site/name-memory.js';

test('independent name readings favor agreement and flag conflicting letters',()=>{
  const result=chooseNameReadings([{name:'Alicia Perez',confidence:80},{name:'Alicia Pérez',confidence:82},{name:'Alicia Pere',confidence:95}]);
  assert.equal(result.name,'Alicia Pérez');assert.equal(result.uncertain,true);
  assert.equal(chooseNameReadings([{name:'Alicia Perez',confidence:80},{name:'Alicia Pérez',confidence:82}]).uncertain,false);
  assert.equal(chooseNameReadings([{name:'Alicia Perez',confidence:99}]).uncertain,true);
});
test('employee tags do not become extra surname letters',()=>{
  assert.equal(employeeName('Alicia Perez lA'),'Alicia Perez');
  assert.equal(employeeName('Alicia Perez | B'),'Alicia Perez');
});
test('confirmed spelling is reused only for the same reading, never a guessed similar person',()=>{
  const memory=rememberName({},'licia Perez','Alicia Pérez');
  assert.equal(confirmedName(memory,'LICIA PEREZ'),'Alicia Pérez');
  assert.equal(confirmedName(memory,'Lucia Perez'),null);
  assert.equal(confirmedName(memory,'Nombre pendiente 1'),null);
  assert.equal(confirmedName({},'toString'),null);
  assert.deepEqual(rememberName({},'Nombre pendiente 1','Alicia Pérez'),{});
});
