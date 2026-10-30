const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
function setup(){
  const saved=new Map(),localStorage={getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,String(v)),removeItem:k=>saved.delete(k)},sessionStorage={...localStorage},location={hash:'#today'};
  const cats=[{id:'tiger',name:'Tiger',zone:'Zone A'},{id:'kopi',name:'Kopi',zone:'Zone B'},{id:'ash',name:'Ash',zone:'Zone C'}],calls=[];
  let learned=false;
  const M={CURRENT_USER:'mei-ling',VALID_CARE:new Set(['feeding','water','medication','vet_visit','cleaning','hands_on_check']),CATS:cats,thumbnail:c=>typeof c==='string'?c:c?.photo||'',allCats:()=>cats,profileHref:id=>'#cat/'+id,syncFeedingModal:()=>{}};
  const D={feedingStatus:()=>({status:'unconfirmed'}),stamp:x=>x,observations:()=>[],updates:()=>[{authorId:'mei-ling',identity:'confirmed'},{authorId:'aisha',identity:'confirmed'},{authorId:'mei-ling',identity:'unconfirmed'}],accessible:()=>true,beginDraft:x=>calls.push(x)};
  const R={needs:id=>id==='tiger'?[{label:'Ear check'}]:[],facts:id=>'Recorded behaviour of '+id,zoneNeeds:zone=>zone==='Zone A'?[{catId:'tiger',catName:'Tiger',photo:'tiger.jpg',needs:[{label:'Ear check'}]}]:[],contributions:id=>id===null?{feeding:3,total:5,byKind:{feeding:3,water:2}}:{feeding:id==='tiger'?2:0,total:id==='tiger'?2:0,byKind:{}},completedLearning:()=>learned,requiresLearning:a=>!learned&&a?.home==='No'&&['New to this','Under 1 year'].includes(a.exp),learningPending:()=>localStorage.getItem('mewlink-learning-required')==='1'&&R.requiresLearning(JSON.parse(localStorage.getItem('mewlink-profile-answers')||'{}'))};
  const window={MewLinkCare:M,MewLinkData:D,MewLinkRefine:R,alert:x=>{throw Error(x)}},React={createRef:()=>({current:null}),createElement:()=>({})};
  class DCLogic{constructor(props){this.props=props;}setState(p){Object.assign(this.state,typeof p==='function'?p(this.state):p);}forceUpdate(){}}
  const html=fs.readFileSync(require('node:path').join(__dirname,'../src/Home.dc.html'),'utf8'),source=html.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/)[1];
  const Component=new Function('DCLogic','React','window','localStorage','sessionStorage','location',source+';return Component;')(DCLogic,React,window,localStorage,sessionStorage,location);
  const c=new Component({only:'today'});
  return {c,R,D,M,calls,location,localStorage,setLearned:x=>learned=x};
}
test('Care recommendations use recorded needs and counts; refreshing only changes order',()=>{
  const {c}=setup(),before=c.pager();assert.equal(before.deckTitle,'Recommended');assert.equal(before.pages[0].statusText,'Ear check');assert.equal(before.pages[1].statusText,'');assert.equal(before.pages[1].hasStatus,false);assert.match(before.pages[0].why,/Tiger 2 times/);assert.equal(before.showPager,true);before.refreshRecommended();const after=c.pager();assert.notEqual(after.pages[0].key,before.pages[0].key);assert.equal(after.pages.find(x=>x.key==='tiger').why,before.pages[0].why);
});
test('Home Add update enters existing generic record flow without a feeding action',()=>{
  const {c,calls,location,localStorage}=setup();c.pager().pages[1].feed();assert.deepEqual(calls.map(x=>[x.catId,x.origin]),[['kopi','profile']]);assert.equal(location.hash,'careupdate');assert.equal(localStorage.getItem('mewlink-care-target'),'kopi');
});
test('New join requires basics; completion prevents repeat onboarding',()=>{
  const {c,location,localStorage,setLearned}=setup();c.state.a={zone:'Zone A',home:'No',exp:'New to this'};c.state.agree=true;c.renderVals().submitJoin();assert.equal(location.hash,'learn');assert.equal(localStorage.getItem('mewlink-learning-required'),'1');c.props.only='done';assert.equal(c.route(),'learn');setLearned(true);assert.equal(c.route(),'done');c.renderVals().submitJoin();assert.equal(location.hash,'done');
});
test('Care zone strip and personal contributions are separate record-backed views',()=>{
  const {c}=setup(),view=c.renderVals();assert.deepEqual(view.stories.map(x=>x.name),['Tiger']);assert.equal(view.stories[0].sub,'Ear check');assert.equal(view.meFed,3);assert.equal(view.meCareTotal,5);assert.equal(view.meObservations,1);assert.match(view.meTnrLabel,/not provided/);assert.equal(view.profileCats.length,1);c.state.a.zone='Zone D';assert.equal(c.renderVals().noZoneNeeds,true);
});
test('Milo cleaning and other valid care actions display their actual contribution counts',()=>{
  const {c,M,R}=setup(),original=R.contributions;
  M.CATS.push({id:'milo',name:'Milo',zone:'Zone B'});
  R.contributions=id=>id==='milo'?{feeding:0,total:5,byKind:{cleaning:2,medication:1,vet_visit:1,hands_on_check:1}}:original(id);
  const milo=c.renderVals().profileCats.find(x=>x.id==='milo');
  assert(milo);assert.match(milo.summary,/Cleaning · 2/);assert.match(milo.summary,/Medication · 1/);assert.match(milo.summary,/Vet support · 1/);assert.match(milo.summary,/Hands-on check · 1/);assert.doesNotMatch(milo.summary,/No care/);
});
test('submitted onboarding answers and selected help survive reload without changing other data',()=>{
  const {c,localStorage,setLearned}=setup();
  localStorage.setItem('mewlink-care-records-v1','existing records');
  c.state.a={zone:'Zone B',home:'Yes',exp:'3+ years',tnr:'Helped once or twice'};
  c.state.help={'Daily feeding':true,'Vet trips':true,'Short-term fostering':false};c.state.agree=true;
  c.renderVals().submitJoin();setLearned(true);
  const reloaded=new c.constructor({only:'me'}),view=reloaded.renderVals();
  assert.deepEqual(reloaded.state.a,c.state.a);assert.deepEqual(reloaded.state.help,{'Daily feeding':true,'Vet trips':true});
  assert.match(view.meTnrLabel,/Helped once or twice/);assert.equal(view.meInfo.find(x=>x.k==='Feeding experience').v,'3+ years');assert.equal(view.meInfo.find(x=>x.k==='Can help with').v,'Daily feeding, Vet trips');
  assert.equal(localStorage.getItem('mewlink-care-records-v1'),'existing records');
});

test('all eight home-cat and experience combinations route correctly and remove stale mandatory flags',()=>{for(const home of ['Yes','No'])for(const exp of ['New to this','Under 1 year','1–3 years','3+ years']){const {c,location,localStorage}=setup();localStorage.setItem('mewlink-learning-required','1');c.state.a={zone:'Zone A',home,exp};c.state.agree=true;c.renderVals().submitJoin();const required=home==='No'&&['New to this','Under 1 year'].includes(exp);assert.equal(location.hash,required?'learn':'done',home+' / '+exp);assert.equal(localStorage.getItem('mewlink-learning-required'),required?'1':null);assert.equal(localStorage.getItem('mewlink-care-basics-completed-v1'),null);}});
test('both experience questions must be answered before join is submitted',()=>{const {c,location}=setup();c.state.a={zone:'Zone A',exp:'New to this'};c.state.agree=true;c.renderVals().submitJoin();assert.equal(location.hash,'#today');c.state.a.home='Yes';delete c.state.a.exp;c.renderVals().submitJoin();assert.equal(location.hash,'#today');});
