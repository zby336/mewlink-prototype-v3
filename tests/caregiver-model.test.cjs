const test=require('node:test');
const assert=require('node:assert/strict');
const M=require('../public/caregiver-model.js');
const now=Date.parse('2026-10-28T04:00:00+08:00');
const rec=(id,days,kind='feeding',extra={})=>({catId:'tiger',caregiverId:id,occurredAt:new Date(now-days*M.DAY).toISOString(),kind,valid:true,...extra});
test('Singapore calendar day changes at 16:00 UTC',()=>{
 assert.equal(M.sgDay('2026-10-27T15:59:59Z')+1,M.sgDay('2026-10-27T16:00:00Z'));
 assert.equal(M.daysSince('2026-10-27T15:59:59Z','2026-10-27T16:00:00Z'),1);
 assert.equal(M.daysSince('2026-10-27T16:00:00Z','2026-10-28T15:59:59Z'),0);
});
test('all four fade bands include their documented boundaries',()=>{
 for(const [day,op]of [[0,.98],[7,.98],[8,.76],[14,.76],[15,.54],[21,.54],[22,.32],[30,.32]]){
  const d=M.activity([rec('aisha',day)],'tiger',{now});
  assert.equal(d.count,1);assert.equal(d.rows[0].opacity,op);
 }
 assert.equal(M.activity([rec('aisha',31)],'tiger',{now}).count,0);
});
test('deduplicates each person using latest VALID hands-on care',()=>{
 const rows=[rec('aisha',20),rec('aisha',9),rec('aisha',0,'seen'),rec('aisha',0,'feeding',{valid:false}),rec('wei',1,'offer')];
 const d=M.activity(rows,'tiger',{now});assert.equal(d.count,1);assert.equal(d.rows[0].days,9);assert.equal(d.rows[0].opacity,.76);
});
test('rejects invalid dates, future timestamps and other cats',()=>{
 const rows=[rec('aisha',1,'feeding',{occurredAt:'invalid'}),rec('ravi',-1),rec('wei',1,'water',{catId:'kopi'}),rec('mei-ling',1,'observation')];
 assert.equal(M.activity(rows,'tiger',{now}).count,0);
});
test('hiding one, all or self never changes real deduplicated count',()=>{
 const rows=[rec('aisha',1),rec('ravi',2),rec('mei-ling',10)];
 for(const prefs of [{hiddenIds:['aisha']},{hideAll:true},{selfPrivate:true}]){
  const d=M.activity(rows,'tiger',{now,prefs});assert.equal(d.count,3);
 }
 assert.equal(M.activity(rows,'tiger',{now,prefs:{hideAll:true}}).avatars.length,0);
 const self=M.activity(rows,'tiger',{now,prefs:{selfPrivate:true}});
 assert.equal(self.privateCount,1);assert(!JSON.stringify(self).includes('Mei Ling'));
 assert(!JSON.stringify(M.activity(rows,'tiger',{now,prefs:{hiddenIds:['aisha']}})).includes('Aisha'));
});
test('private caregiver identities never enter activity presentation data',()=>{
 const d=M.activity([rec('private-1',1),rec('aisha',1)],'tiger',{now});
 assert.equal(d.count,2);assert.equal(d.privateCount,1);
 assert(!JSON.stringify(d).includes('private-1'));assert(!JSON.stringify(d).includes('private-2'));
});
test('seeded order is stable and independent of care frequency',()=>{
 const rows=[rec('aisha',1),rec('ravi',10),rec('wei',18),rec('mei-ling',26)];
 const options={now,prefs:{seed:'viewer-42'}};
 const ids=d=>d.rows.map(r=>r.id);
 assert.deepEqual(ids(M.activity(rows,'tiger',options)),ids(M.activity(rows,'tiger',options)));
 assert.deepEqual(ids(M.activity(rows,'tiger',options)),ids(M.activity([...rows,...Array.from({length:30},()=>rec('ravi',14))],'tiger',options)));
});
test('no more than five public avatars, remainder is +N',()=>{
 const people=Object.fromEntries(Array.from({length:8},(_,i)=>['p'+i,{name:'Demo '+i,initials:String(i),color:'#eee',publicIdentity:true}]));
 const d=M.activity(Object.keys(people).map(id=>rec(id,1)),'tiger',{now,people});
 assert.equal(d.count,8);assert.equal(d.avatars.length,5);assert.equal(d.overflow,3);
});
test('expiry recalculates as Singapore date advances',()=>{
 const rows=[rec('aisha',30)];assert.equal(M.activity(rows,'tiger',{now}).count,1);
 assert.equal(M.activity(rows,'tiger',{now:now+M.DAY}).count,0);
});
test('demo fixtures stay fixed; local care updates persist and Seen is rejected',()=>{
 const store=new Map();global.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
 const before=M.allRecords();assert.deepEqual(M.allRecords(),before);
 assert.equal(M.recordCare({catId:'tiger',kind:'seen'}),false);
 assert.equal(M.recordCare({catId:'tiger',kind:'feeding'}),true);
 const after=M.activity(M.allRecords(),'tiger',{prefs:{seed:'test'}});
 assert.equal(after.count,6);assert.equal(after.rows.find(p=>p.id===M.CURRENT_USER).days,0);
 M.savePreferences({hideAll:true,selfPrivate:true});assert.equal(M.preferences().hideAll,true);assert.equal(M.preferences().selfPrivate,true);
 assert.deepEqual(M.allRecords().slice(0,before.length),before);
});
