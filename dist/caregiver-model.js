/* MewLink Feature 01. Demo records and local-only preferences; no account backend. */
(function(root) {
  'use strict';
  const DAY = 86400000, SG_OFFSET = 8 * 3600000;
  const VALID_CARE = new Set(['feeding','water','medication','vet_visit','cleaning','hands_on_check']);
  const KEYS = { records:'mewlink-care-records-v1', demo:'mewlink-care-demo-v1', prefs:'mewlink-care-preferences-v1' };
  const CURRENT_USER = 'mei-ling';
  const PEOPLE = {
    aisha:{name:'Aisha',initials:'AS',color:'#F4D7C7',publicIdentity:true},
    ravi:{name:'Ravi',initials:'RK',color:'#E3EBDA',publicIdentity:true},
    wei:{name:'Wei',initials:'WT',color:'#E9DDC8',publicIdentity:true},
    'mei-ling':{name:'Mei Ling',initials:'ML',color:'#FBE7BA',publicIdentity:true},
    'private-1':{publicIdentity:false},
    'private-2':{publicIdentity:false}
  };
  const CAT_PHOTO = id => 'https://images.unsplash.com/'+id+'?w=720&h=440&fit=crop&crop=top&q=75&auto=format';
  const CATS = [
    {id:'tiger',name:'Tiger',zone:'Zone A',photo:CAT_PHOTO('photo-1650535812141-04d564530b17'),when:'Yesterday',last:'Aisha: looked like a small cut near one ear.',tag:'Follow-up',next:'Check the ear in better light.'},
    {id:'kopi',name:'Kopi',zone:'Zone B',photo:CAT_PHOTO('photo-1622015680443-cb4c5bec36b7'),when:'2h ago',last:'Ravi: fed him, ate everything.',tag:'Handover',next:'Someone to cover the 7pm feed Thu.'},
    {id:'oyen',name:'Oyen',zone:'Zone B',photo:CAT_PHOTO('photo-1581536678522-afcf3257d780'),when:'7:40am',last:'Ravi: fed with Milo.',tag:'Recorded by caregivers',next:'Add a care update after your next visit.'},
    {id:'milo',name:'Milo',zone:'Zone B',photo:CAT_PHOTO('photo-1683989903370-9fe4f7c8e0c7'),when:'7:40am',last:'Ravi: fed with Oyen.',tag:'Recorded by caregivers',next:'Add a care update after your next visit.'},
    {id:'ash',name:'Ash',zone:'Zone C',photo:CAT_PHOTO('photo-1557408938-0f220f49bca1'),when:'3 days ago',last:'Wei: didn’t come out on the evening round.',tag:'Not seen recently',next:'Look out for him on your round.'},
    {id:'bubu',name:'Bubu',zone:'Zone C',photo:CAT_PHOTO('photo-1514888286974-6c03e2ca1dba'),when:'Recently',last:'An extra pair of hands on weekends would help.',tag:'Recorded by caregivers',next:'Join the weekend care round.'}
  ];
  function sgDay(value) {
    const ms = new Date(value).getTime();
    return Number.isFinite(ms) ? Math.floor((ms+SG_OFFSET)/DAY) : NaN;
  }
  function daysSince(value,now=Date.now()) { return sgDay(now)-sgDay(value); }
  function opacityForDays(days) { return days<=7 ? .98 : days<=14 ? .76 : days<=21 ? .54 : .32; }
  function relativeTime(value,now=Date.now()) {
    const days=daysSince(value,now);
    if(days===0) return 'Today';
    return days===1 ? '1 day ago' : days+' days ago';
  }
  function stableHash(text) {
    let hash=2166136261;
    for(const c of text){ hash^=c.charCodeAt(0); hash=Math.imul(hash,16777619); }
    return hash>>>0;
  }
  function activity(records,catId,options={}) {
    const now=Number(options.now??Date.now()), prefs=options.prefs||{}, people=options.people||PEOPLE, latest=new Map();
    for(const r of records){
      const time=new Date(r.occurredAt).getTime();
      const age=daysSince(time,now);
      if(r.catId!==catId || r.valid!==true || !VALID_CARE.has(r.kind) || !r.caregiverId || !Number.isFinite(time) || time>now || age<0 || age>30) continue;
      if(!latest.has(r.caregiverId)||time>latest.get(r.caregiverId)) latest.set(r.caregiverId,time);
    }
    const hidden=new Set(prefs.hiddenIds||[]);
    const publicRows=[]; let privateCount=0,hiddenCount=0;
    for(const [id,time] of latest){
      const p=people[id];
      if(!p || p.publicIdentity===false || (id===CURRENT_USER && prefs.selfPrivate)){ privateCount++; continue; }
      if(prefs.hideAll || hidden.has(id)){hiddenCount++;continue;}
      const days=daysSince(time,now);
      publicRows.push({id,name:p.name,initials:p.initials,color:p.color,lastAt:new Date(time).toISOString(),days,relative:relativeTime(time,now),opacity:opacityForDays(days)});
    }
    publicRows.sort((a,b)=>stableHash((prefs.seed||'demo')+catId+a.id)-stableHash((prefs.seed||'demo')+catId+b.id)||a.id.localeCompare(b.id));
    const avatars=publicRows.slice(0,5);
    return {count:latest.size,rows:publicRows,avatars,overflow:Math.max(0,latest.size-avatars.length),privateCount,hiddenCount};
  }
  function read(key,fallback) { try { return JSON.parse(root.localStorage.getItem(key))??fallback; } catch(_){ return fallback; } }
  function write(key,value) { try {root.localStorage.setItem(key,JSON.stringify(value));return true;}catch(_){return false;} }
  function demoRecords(anchor) {
    const record=(cat,id,days,kind='feeding',valid=true,index=0)=>({id:'demo-'+cat+'-'+id+'-'+days+'-'+index,catId:cat,caregiverId:id,occurredAt:new Date(anchor-days*DAY).toISOString(),kind,valid,source:'demo'});
    return [
      record('tiger','aisha',1),record('tiger','aisha',5),record('tiger','ravi',10),record('tiger','wei',18,'water'),
      record('tiger','mei-ling',26),record('tiger','private-1',3),record('tiger','private-2',22,'cleaning'),
      record('tiger','ravi',0,'seen'),record('tiger','private-2',31),record('tiger','wei',0,'feeding',false),
      record('kopi','ravi',0),record('kopi','wei',9,'vet_visit'),record('kopi','aisha',16),record('kopi','mei-ling',24),
      record('oyen','ravi',0),record('oyen','aisha',8),record('oyen','mei-ling',20,'water'),
      record('milo','ravi',0),record('milo','wei',12),record('milo','mei-ling',23,'cleaning'),
      record('ash','wei',9,'water'),record('ash','ravi',24),record('ash','aisha',3,'seen'),
      record('bubu','wei',2)
    ];
  }
  function initDemo() {
    let demo=read(KEYS.demo,null);
    if(!demo || !Array.isArray(demo.records)){
      demo={version:1,anchor:new Date().toISOString(),records:demoRecords(Date.now())};
      write(KEYS.demo,demo);
    }
    return demo;
  }
  function allRecords() {
    const demo=initDemo().records, saved=read(KEYS.records,[]);
    return [...demo,...(Array.isArray(saved)?saved:[]),...(root.MewLinkData?.savedCareRecords()||[])];
  }
  function preferences() {
    let p=read(KEYS.prefs,null);
    if(!p||typeof p!=='object') p={};
    if(typeof p.seed!=='string') { p.seed=root.crypto?.randomUUID?.()||String(Math.random());write(KEYS.prefs,p); }
    return {hiddenIds:Array.isArray(p.hiddenIds)?p.hiddenIds:[],hideAll:!!p.hideAll,selfPrivate:!!p.selfPrivate,seed:p.seed};
  }
  function emitChange() { if(root.dispatchEvent) root.dispatchEvent(new Event('mewlink-care-changed')); }
  function savePreferences(patch) { const next={...preferences(),...patch};write(KEYS.prefs,next);emitChange();return next; }
  function recordCare({catId,kind,occurredAt=new Date().toISOString()}) {
    if(!VALID_CARE.has(kind)||!catId) return false;
    const records=read(KEYS.records,[]);
    const record={id:'local-'+(root.crypto?.randomUUID?.()||Date.now()),catId,caregiverId:CURRENT_USER,occurredAt,kind,valid:true,source:'prototype-action'};
    if(!write(KEYS.records,[...(Array.isArray(records)?records:[]),record])) return false;
    emitChange();return true;
  }
  function allCats() {
    const added=read('mewlink-added-cats',[]);
    const known=new Set(CATS.map(c=>c.name));
    return [...CATS,...(Array.isArray(added)?added:[]).filter(c=>!known.has(c.name)).map(c=>({id:catIdForName(c.name),name:c.name,zone:c.zone||'Area not recorded',photo:c.photo||'',when:c.when||'Recently',last:c.last||'No observation recorded yet.',tag:c.t||'New',next:c.follow||'Add a care update after your next visit.'}))];
  }
  function catIdForName(name) { return String(name||'').trim().toLowerCase().replace(/\s+/g,'-'); }
  function profileHref(id) { return id==='tiger' ? '#tiger' : '#cat/'+encodeURIComponent(id); }
  function syncFeedingModal(open) {
    if(!root.document)return;
    root.document.documentElement.toggleAttribute('data-mew-feeding',!!open);
    if(open){
      const dialog=root.document.querySelector('[data-mew-feed-dialog]');
      if(dialog && !dialog.contains(root.document.activeElement)) dialog.querySelector('[data-mew-feed-cancel]')?.focus();
    }
  }
  if(root.document) root.document.addEventListener('keydown',function(event){
    if(!root.document.documentElement.hasAttribute('data-mew-feeding'))return;
    const dialog=root.document.querySelector('[data-mew-feed-dialog]');if(!dialog)return;
    if(event.key==='Escape'){event.preventDefault();dialog.querySelector('[data-mew-feed-cancel]')?.click();return;}
    if(event.key!=='Tab')return;const controls=[...dialog.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled)')];
    const first=controls[0],last=controls[controls.length-1];
    if(event.shiftKey && root.document.activeElement===first){event.preventDefault();last?.focus();}
    if(!event.shiftKey && root.document.activeElement===last){event.preventDefault();first?.focus();}
  });
  const api={DAY,KEYS,PEOPLE,CATS,CURRENT_USER,VALID_CARE,sgDay,daysSince,opacityForDays,relativeTime,stableHash,activity,demoRecords,allRecords,preferences,savePreferences,recordCare,allCats,catIdForName,profileHref,syncFeedingModal};
  root.MewLinkCare=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
