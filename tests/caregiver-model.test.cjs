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

test('care counts count distinct qualifying records and retain latest fading date',()=>{
 const first=rec('aisha',6,'feeding',{id:'first'});
 const rows=[first,{...first},rec('aisha',1,'water',{id:'second'}),rec('aisha',0,'seen',{id:'sighting'}),rec('aisha',0,'feeding',{id:'invalid',valid:false}),rec('aisha',31,'feeding',{id:'expired'}),rec('ravi',2,'feeding',{id:'other'})];
 const result=M.activity(rows,'tiger',{now});
 assert.equal(result.rows.find(r=>r.id==='aisha').careCount,2);
 assert.equal(result.rows.find(r=>r.id==='aisha').days,1);
 assert.equal(result.rows.find(r=>r.id==='aisha').crown,true);
 assert.equal(result.rows.find(r=>r.id==='ravi').crown,false);
});

test('equal most-active counts crown ties without sorting by count',()=>{
 const rows=[rec('aisha',1,'feeding',{id:'a1'}),rec('aisha',2,'water',{id:'a2'}),rec('ravi',3,'feeding',{id:'r1'}),rec('ravi',4,'feeding',{id:'r2'}),rec('wei',1,'water',{id:'w1'})];
 const result=M.activity(rows,'tiger',{now,prefs:{seed:'shared-view'}});
 assert.deepEqual(result.rows.filter(r=>r.crown).map(r=>r.id).sort(),['aisha','ravi']);
 const changed=M.activity([...rows,rec('wei',2,'water',{id:'w2'}),rec('wei',3,'feeding',{id:'w3'})],'tiger',{now,prefs:{seed:'shared-view'}});
 assert.deepEqual(changed.rows.map(r=>r.id),result.rows.map(r=>r.id));
 assert.deepEqual(changed.rows.filter(r=>r.crown).map(r=>r.id),['wei']);
});

test('circle and note visibility filters apply before care counts or crowns',()=>{
 const rows=[rec('aisha',1,'feeding',{id:'public',circleId:'our-circle',visibility:'circle'}),rec('ravi',1,'feeding',{id:'foreign',circleId:'another-circle',visibility:'circle'}),rec('ravi',2,'feeding',{id:'private',circleId:'our-circle',visibility:'private'}),rec(M.CURRENT_USER,1,'water',{id:'own-private',circleId:'our-circle',visibility:'private'})];
 const result=M.activity(rows,'tiger',{now,circleId:'our-circle'});
 assert.equal(result.count,2);assert.equal(result.rows.some(r=>r.id==='ravi'),false);
 assert.equal(result.rows.find(r=>r.id===M.CURRENT_USER).careCount,1);
});

test('private and hidden leaders never expose identities or promote another public avatar',()=>{
 const rows=[rec('aisha',1,'feeding',{id:'a1'}),rec('aisha',2,'water',{id:'a2'}),rec('ravi',3,'feeding',{id:'r1'})];
 const hidden=M.activity(rows,'tiger',{now,prefs:{hiddenIds:['aisha']}});
 assert.equal(hidden.count,2);assert.equal(hidden.rows.length,1);assert.equal(hidden.rows[0].crown,false);
 assert(!JSON.stringify(hidden).includes('Aisha'));
 const priv=M.activity([...rows,...[1,2,3].map((d,i)=>rec('private-1',d,'water',{id:'p'+i}))],'tiger',{now});
 assert.equal(priv.privateCount,1);assert.equal(priv.rows.filter(r=>r.crown).length,0);
 assert(!JSON.stringify(priv).includes('private-1'));
 const self=M.activity([rec('mei-ling',1,'feeding',{id:'m1'}),rec('mei-ling',2,'water',{id:'m2'}),rec('ravi',1,'feeding',{id:'r1'})],'tiger',{now,prefs:{selfPrivate:true}});
 assert(!JSON.stringify(self).includes('Mei Ling'));assert.equal(self.rows[0].crown,false);
});

test('observation history uses Singapore day groups and preserves all note contents',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),registry=new Map();
 const rows=[
  {occurredAt:'2026-10-27T15:59:00Z',authorId:'private-1',observed:'Earlier <note>',details:'Earlier <note> with original additional detail.',uncertain:'Could not assess',next:'Please check next',photo:'https://example.org/photo.jpg',careKind:'feeding',careOutcome:'not_provided'},
  {occurredAt:'2026-10-27T16:01:00Z',authorId:'aisha',observed:'Newer note',careKind:'water',careOutcome:'provided'},
  {occurredAt:'2026-10-27T16:02:00Z',authorId:'ravi',observed:'Newest note'}
 ];
 class Element{constructor(){this.shadowRoot={innerHTML:''};}attachShadow(){return this.shadowRoot;}getAttribute(){return 'tiger';}hasAttribute(){return false;}}
 const context={window:{MewLinkCare:M,MewLinkData:{observations:()=>rows,author:id=>id==='private-1'?'Anonymous caregiver':M.PEOPLE[id].name}},HTMLElement:Element,customElements:{get:name=>registry.get(name),define:(name,cls)=>registry.set(name,cls)},Intl,Date,Map,Set};
 vm.runInNewContext(fs.readFileSync(require.resolve('../public/knowledge-ui.js'),'utf8'),context);
 const Log=registry.get('mew-observation-log'),view=new Log();view.render();const html=view.shadowRoot.innerHTML;
 assert.equal((html.match(/class="log-day"/g)||[]).length,2);
 assert.equal((html.match(/class="log-date"/g)||[]).length,2);
 assert(html.indexOf('Newest note')<html.indexOf('Newer note'));assert(html.indexOf('Newer note')<html.indexOf('Earlier &lt;note&gt;'));
 assert.match(html,/Anonymous caregiver/);assert.match(html,/Could not assess/);assert.match(html,/Please check next/);assert.match(html,/Feeding not provided/);assert.match(html,/Water recorded/);assert.match(html,/https:\/\/example.org\/photo.jpg/);
 assert(!html.includes('private-1'));assert(!html.includes('<note>'));
 assert.match(html,/with original additional detail/);
});
