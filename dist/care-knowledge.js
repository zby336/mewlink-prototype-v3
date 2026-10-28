/* Local knowledge retrieval for the MewLink demo. No LLM, account or remote database. */
(function(root){
  'use strict';
  const M=root.MewLinkCare, CIRCLE='toa-payoh-demo';
  const KEYS={updates:'mewlink-updates-v2',draft:'mewlink-draft-v2',drafts:'mewlink-other-drafts-v2',demo:'mewlink-knowledge-demo-v2',social:'mewlink-social-v2'};
  const read=(key,fallback)=>{try{return JSON.parse(root.localStorage.getItem(key))??fallback;}catch(_){return fallback;}};
  const write=(key,value)=>{try{root.localStorage.setItem(key,JSON.stringify(value));return true;}catch(_){return false;}};
  const uid=()=>root.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
  const nowISO=()=>new Date().toISOString();
  const emit=()=>{if(root.dispatchEvent){root.dispatchEvent(new Event('mewlink-data-changed'));root.dispatchEvent(new Event('mewlink-care-changed'));}};
  const cat=id=>M.allCats().find(c=>c.id===id);
  const stamp=value=>new Intl.DateTimeFormat('en-SG',{timeZone:'Asia/Singapore',day:'numeric',month:'short',year:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date(value))+' SGT';
  const GENERAL=[
    {id:'guide-cws',title:'Cat Welfare Society · Responsible Caregiving',url:'https://www.catwelfare.org/responsible-caregiving/',text:'Offer cat food in containers, clear leftovers within two hours, and provide fresh water daily. Clean the water container when changing water. Arrange veterinary attention for signs of medical distress.',topics:['feeding','water','bowl','clean','care','food','喂','水','照护'],reviewedAt:'2026-10-28'},
    {id:'guide-cornell',title:'Cornell Feline Health Center · Anorexia',url:'https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/anorexia',text:'Loss of appetite has many possible causes. Contact a veterinarian promptly when a cat stops eating; do not diagnose the cause from a note or force food into its mouth.',topics:['appetite','eating','eat','health','vet','sick','诊断','不吃','健康'],reviewedAt:'2026-10-28'},
    {id:'guide-avs',title:'AVS · Community Cat Caregiving Guidelines',url:'https://www.nparks.gov.sg/-/media/avs/cat-management-framework/avs-handbook-for-cat-caregiving-guidelines.pdf',text:'Coordinate a regular feeding schedule with other caregivers to avoid overfeeding. Agree on suitable feeding areas with the relevant community partners.',topics:['schedule','handover','feeding','neighbour','coordinate','交接','安排'],reviewedAt:'2026-10-28'}
  ];
  function demo(){
    let data=read(KEYS.demo,null);if(data?.observations)return data;
    M.allRecords();const anchor=Date.parse(read(M.KEYS.demo,{}).anchor)||Date.now();
    const at=hours=>new Date(anchor-hours*3600000).toISOString();
    const row=(id,catId,authorId,hours,observed,uncertain,next)=>({id,catId,authorId,occurredAt:at(hours),createdAt:at(hours),observed,uncertain,next,visibility:'circle',circleId:CIRCLE,source:'demo',identity:'confirmed'});
    data={anchor:new Date(anchor).toISOString(),observations:[
      row('obs-tiger-aisha','tiger','aisha',24,'I noticed what looked like a small cut near one ear.','This is an observation, not a diagnosis.','Check the ear in better light and add a clear photo if Tiger is comfortable.'),
      row('obs-tiger-wei','tiger','wei',26,'Tiger ate about half.','I could not assess the ear in the low light.','Record how much he eats at the next visit.'),
      row('obs-kopi-ravi','kopi','ravi',2,'Fed Kopi; he ate everything.','','Please coordinate cover for the next evening feed.'),
      row('obs-oyen-ravi','oyen','ravi',3,'Oyen ate with Milo.','','Coordinate the next feeding round.'),
      row('obs-milo-ravi','milo','ravi',3,'Milo finished his food first.','','Place his bowl a little apart and record what he eats.'),
      row('obs-ash-wei','ash','wei',72,'Ash did not come out on the evening round.','His current whereabouts are not confirmed.','Look out for Ash and record the time of any sighting.'),
      row('obs-bubu-wei','bubu','wei',48,'An extra pair of hands on weekends would help.','','Coordinate weekend cover with the circle.')
    ]};write(KEYS.demo,data);return data;
  }
  function updates(){const a=read(KEYS.updates,[]);return Array.isArray(a)?a:[];}
  function accessible(r,viewer=M.CURRENT_USER){return r.circleId===CIRCLE&&(r.visibility==='circle'||r.authorId===viewer);}
  function observations(id,options={}){
    const rows=options.records||[...demo().observations,...updates()];const now=options.now??Date.now();
    return rows.filter(r=>r.catId===id&&r.identity==='confirmed'&&accessible(r,options.viewer)&&Number.isFinite(Date.parse(r.occurredAt))&&Date.parse(r.occurredAt)<=now).sort((a,b)=>Date.parse(b.occurredAt)-Date.parse(a.occurredAt));
  }
  function author(id){const p=M.PEOPLE[id];return !p||p.publicIdentity===false||(id===M.CURRENT_USER&&M.preferences().selfPrivate)?'Anonymous caregiver':p.name;}
  function sourceFor(r,type='observation'){
    return {id:r.id,title:(cat(r.catId)?.name||'Unconfirmed cat')+' · '+type,when:stamp(r.occurredAt),at:r.occurredAt,text:[r.observed,r.uncertain&&'Uncertain: '+r.uncertain,r.next&&'Next visit: '+r.next].filter(Boolean).join(' '),author:author(r.authorId||r.caregiverId),url:M.profileHref(r.catId),demo:true};
  }
  const guideSource=g=>({id:g.id,title:g.title,when:'Reviewed '+g.reviewedAt,text:g.text,url:g.url,external:true});
  function savedCareRecords(){return updates().filter(r=>accessible(r)&&r.identity==='confirmed'&&r.catId&&M.VALID_CARE.has(r.careKind)&&r.careOutcome==='provided').map(r=>({id:'care-'+r.id,updateId:r.id,catId:r.catId,caregiverId:r.authorId,occurredAt:r.occurredAt,kind:r.careKind,valid:true,source:'prototype-action',circleId:r.circleId,visibility:r.visibility,authorId:r.authorId}));}
  function feedingStatus(id,options={}){
    const now=options.now??Date.now(),day=options.day??M.sgDay(now),records=options.records||M.allRecords(),notes=options.observations||observations(id,{now});
    const valid=r=>r.catId===id&&r.valid===true&&r.kind==='feeding'&&Number.isFinite(Date.parse(r.occurredAt))&&Date.parse(r.occurredAt)<=now&&M.sgDay(r.occurredAt)===day&&(!r.circleId||accessible(r,options.viewer));
    const yes=records.filter(valid),no=notes.filter(r=>r.catId===id&&r.identity==='confirmed'&&accessible(r,options.viewer)&&r.careKind==='feeding'&&r.careOutcome==='not_provided'&&M.sgDay(r.occurredAt)===day&&Date.parse(r.occurredAt)<=now);
    const status=yes.length&&no.length?'conflict':yes.length?'confirmed':'unconfirmed';
    const sources=[...yes.map(r=>({...sourceFor(r,'feeding record'),text:'A caregiver recorded feeding '+(cat(id)?.name||id)+'.'})),...no.map(r=>sourceFor({...r,observed:'The caregiver reported no feeding on this visit. '+(r.observed||'')},'feeding report'))].sort((a,b)=>Date.parse(b.at)-Date.parse(a.at));
    return {status,count:yes.length,sources,day,lastAt:sources[0]?.at||null};
  }
  function beginDraft(input={}){
    const old=read(KEYS.draft,null);
    // Resume this cat's flow; retain other cats' unfinished drafts on this device.
    if(old&&old.expectedCatId===(input.catId||'tiger'))return {draft:old,resumed:true};
    const drafts=read(KEYS.drafts,{});
    if(old&&!old.savedId){drafts[old.expectedCatId]=old;if(!write(KEYS.drafts,drafts))throw new Error('Could not preserve the existing draft. Please finish it first.');}
    if(drafts[input.catId]&&!drafts[input.catId].savedId){const d=drafts[input.catId];if(!write(KEYS.draft,d))throw new Error('Could not restore the draft.');return {draft:d,resumed:true};}
    const d={id:uid(),expectedCatId:input.catId||'tiger',origin:input.origin||'profile',occurredAt:input.occurredAt||nowISO(),zone:input.zone||cat(input.catId)?.zone||'',photo:input.photo||'',careKind:input.origin==='feeding'?'feeding':'observation',careOutcome:input.origin==='feeding'?'provided':'unknown',step:input.origin==='feeding'?2:0,typed:'',transcript:input.text||'',observed:'',uncertain:'',next:'',who:null,selectedCatId:'',createdAt:nowISO()};
    if(!write(KEYS.draft,d))throw new Error('This browser could not save the draft. Free some storage and try again.');return {draft:d,resumed:false};
  }
  function loadDraft(){return read(KEYS.draft,null);}
  function saveDraft(patch){const d={...(loadDraft()||{}),...patch};return write(KEYS.draft,d);}
  function discardDraft(){try{const old=loadDraft(),drafts=read(KEYS.drafts,{});if(old)delete drafts[old.expectedCatId];if(!write(KEYS.drafts,drafts))return false;root.localStorage.removeItem(KEYS.draft);return true;}catch(_){return false;}}
  function saveUpdate(d){
    const existing=updates().find(r=>r.id===d.id);if(existing)return {ok:true,record:existing,duplicate:true};
    if(!d.id)return {ok:false,error:'The draft is missing. Go back and try again.'};
    if(!['yes','another','unsure'].includes(d.who))return {ok:false,error:'Confirm the cat identity before saving.'};
    const id=d.who==='yes'?d.expectedCatId:d.who==='another'?d.selectedCatId:null;
    if(d.who!=='unsure'&&!cat(id))return {ok:false,error:'Choose the correct cat, or select Not sure.'};
    if(![d.observed,d.uncertain,d.next].some(v=>String(v||'').trim())&&!d.photo)return {ok:false,error:'Add a note or photo before saving.'};
    if(!Number.isFinite(Date.parse(d.occurredAt))||Date.parse(d.occurredAt)>Date.now()+1000)return {ok:false,error:'Check the care time before saving.'};
    const record={id:d.id,catId:id,expectedCatId:d.expectedCatId,identity:id?'confirmed':'unconfirmed',authorId:M.CURRENT_USER,circleId:CIRCLE,visibility:id?'circle':'private',occurredAt:d.occurredAt,createdAt:nowISO(),observed:String(d.observed||'').trim(),uncertain:String(d.uncertain||'').trim(),next:String(d.next||'').trim(),originalText:String(d.transcript||d.typed||''),photo:d.photo||'',zone:d.zone||'',careKind:d.careKind||'observation',careOutcome:d.careOutcome||'unknown',source:'prototype-action',shared:false};
    if(!write(KEYS.updates,[...updates(),record]))return {ok:false,error:'Could not save on this device. Your draft is still available; please try again.'};
    saveDraft({...d,savedId:record.id,step:6});emit();return {ok:true,record};
  }
  function arrangeWords(text){
    const groups={observed:[],uncertain:[],next:[]};
    for(const sentence of String(text||'').match(/[^.!?\n]+[.!?]?/g)||[]){const s=sentence.trim();if(!s)continue;const key=/\b(maybe|might|could|not sure|perhaps|uncertain|seems)\b|可能|不确定/i.test(s)?'uncertain':/\b(please|next visit|check next|follow up|remember to)\b|下次|请/i.test(s)?'next':'observed';groups[key].push(s);}
    return Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,v.join(' ')]));
  }
  function answer(question,options={}){
    const q=String(question||'').trim(),lower=q.toLowerCase(),now=options.now??Date.now();
    const matches=M.allCats().filter(c=>new RegExp('(^|[^a-z])'+c.name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'([^a-z]|$)').test(lower));
    const base={mode:'Local knowledge demo · rule-based retrieval, no LLM',generatedAt:new Date(now).toISOString(),sources:[],status:'information'};
    if(!q)return {...base,status:'unconfirmed',text:'Ask about a cat, a recorded visit, feeding or a handover.'};
    const day=M.sgDay(now)-(/yesterday|昨天/i.test(q)?1:0),dayLabel=day===M.sgDay(now)?'today':'yesterday';
    if(matches.length&&/\bfed\b|feed(?:ing)?\s+(?:record|today|status)|has .*eat|喂过|喂了|喂食记录/i.test(q)){
      const results=matches.map(c=>({c,result:feedingStatus(c.id,{...options,now,day})}));
      return {...base,status:results.some(x=>x.result.status==='conflict')?'conflict':results.every(x=>x.result.status==='confirmed')?'confirmed':'unconfirmed',text:results.map(({c,result:r})=>r.status==='confirmed'?c.name+': '+r.count+' confirmed feeding '+(r.count===1?'record':'records')+' found for '+dayLabel+' (Singapore time). This confirms a saved report, not independent verification of the event.':r.status==='conflict'?c.name+': records need reconciliation. There is a feeding record and a no-feeding report for '+dayLabel+'. They may describe different visits; check the times and ask the caregivers before deciding.':c.name+': no confirmed feeding record found for '+dayLabel+'. This does not mean '+c.name+' has not been fed. Check with the care circle.').join('\n\n'),sources:results.flatMap(x=>x.result.sources)};
    }
    if(matches.length){
      const parts=[],sources=[];let found=false;
      for(const c of matches){const rows=observations(c.id,options);const selected=/handover|next|follow|交接|建议/i.test(q)?rows.filter(r=>r.next).slice(0,3):rows.slice(0,3);
        if(!selected.length){parts.push(c.name+': no matching care notes found. The available records may be incomplete.');continue;}
        found=true;parts.push(c.name+' — '+selected.map(r=>(/handover|next|follow|交接|建议/i.test(q)?'Recorded next visit: '+r.next:r.observed+(r.uncertain?' Uncertain: '+r.uncertain:''))).join('\n'));sources.push(...selected.map(r=>sourceFor(r)));
      }
      if(/diagnos|disease|medicine|dose|sick|health|诊断|用药|病/i.test(q))parts.push('These are caregiver reports, not a medical diagnosis. A veterinarian should assess health concerns.');
      return {...base,status:found?'records':'unconfirmed',text:parts.join('\n\n'),sources};
    }
    if(/\b(has|did|is)\s+\w+.*\b(fed|feed)|喂过|喂了/i.test(q))return {...base,status:'unconfirmed',text:'I could not match a cat in this circle. Please use a cat name from Cats. I cannot check records from other circles.'};
    const guides=GENERAL.map(g=>({g,score:g.topics.filter(t=>lower.includes(t)).length})).filter(x=>x.score).sort((a,b)=>b.score-a.score).slice(0,2);
    if(guides.length)return {...base,text:guides.map(x=>x.g.text).join('\n\n'),sources:guides.map(x=>guideSource(x.g))};
    return {...base,status:'unconfirmed',text:'No relevant source found in this small local knowledge base. Try a cat name with feeding, recent observations or next visit. I will not guess at missing records.'};
  }
  function suggestions(id,options={}){
    const now=options.now??Date.now(),rows=observations(id,{...options,now}),recent=rows.filter(r=>M.daysSince(r.occurredAt,now)<=30),items=[],used=[];
    for(const r of recent.filter(r=>r.next).slice(0,3)){const text=r.next.trim();if(!items.some(x=>x.text===text)){items.push({text,sourceIds:[r.id]});used.push(r);}}
    if(recent.some(r=>/cut|ear|wound|swollen|mark|injur|伤|肿/i.test(r.observed+' '+r.uncertain))&&items.length<4){items.push({text:'Record what has changed in the reported concern; if there are signs of distress, arrange veterinary attention. Do not infer a diagnosis.',sourceIds:['guide-cws']});}
    if(!recent.length){items.push({text:'There are not enough recent notes to personalise this handover. Ask the circle what still needs checking.',sourceIds:[]});}
    if(items.length<2){const r=recent[0];items.push({text:r?'Add a time-stamped observation at your next visit, including anything still uncertain.':'Record a clear observation, the time, and a confirmed cat identity after the next visit.',sourceIds:r?[r.id]:[]});if(r)used.push(r);}
    return {items:items.slice(0,4),sources:[...new Map(used.map(r=>[r.id,sourceFor(r)])).values(),...(items.some(i=>i.sourceIds.includes('guide-cws'))?[guideSource(GENERAL[0])]:[])],updatedAt:rows[0]?.createdAt||rows[0]?.occurredAt||null,generatedAt:new Date(now).toISOString(),limited:!recent.length};
  }
  function social(){const s=read(KEYS.social,{});return {posts:s.posts||[],likes:s.likes||{},comments:s.comments||{}};}
  function basePosts(){const obs=demo().observations;return [
    {id:'demo-post-ravi',author:'Ravi',initials:'RK',catIds:['oyen','milo'],catName:'Oyen and Milo',at:obs.find(r=>r.id==='obs-oyen-ravi').occurredAt,photo:M.CATS.find(c=>c.id==='oyen').photo,text:'Both ate well. Milo finished first again.',likes:4},
    {id:'demo-post-aisha',author:'Aisha',initials:'AS',catIds:['tiger'],catName:'Tiger',at:obs[0].occurredAt,photo:'https://images.unsplash.com/photo-1675504661658-33940d979a6a?w=720&h=720&fit=crop&q=75&auto=format',text:'Small cut near one ear. He let me come close.',likes:7}
  ];}
  function posts(){const s=social();return [...s.posts,...basePosts()].map(p=>({...p,liked:!!s.likes[p.id],likeCount:(p.likes||0)+(s.likes[p.id]?1:0),comments:s.comments[p.id]||[]}));}
  function toggleLike(id){const s=social();s.likes[id]=!s.likes[id];if(!write(KEYS.social,s))return false;emit();return true;}
  function addComment(id,text){text=String(text||'').trim().slice(0,1000);if(!text||!posts().some(p=>p.id===id))return false;const s=social();s.comments[id]=[...(s.comments[id]||[]),{id:uid(),author:'You',text,at:nowISO()}];if(!write(KEYS.social,s))return false;emit();return true;}
  function publishPost({text,catId,photo,recordId,id}){
    const s=social();id=id||'post-'+(recordId||uid());if(s.posts.some(p=>p.id===id))return {ok:true,duplicate:true};
    const record=recordId?updates().find(r=>r.id===recordId):null;
    if(recordId&&!record)return {ok:false,error:'Save the care update first.'};
    const body=String(text??record?.observed??'').trim();if(!body)return {ok:false,error:'Add text before sharing.'};
    const confirmedId=record?record.catId:catId;if(confirmedId&&!cat(confirmedId))return {ok:false,error:'Choose a cat from this circle.'};
    const post={id,recordId:recordId||null,author:'You',initials:'ML',at:nowISO(),catIds:confirmedId?[confirmedId]:[],catName:cat(confirmedId)?.name||'Unconfirmed cat',photo:photo||record?.photo||'',text:body,likes:0};
    if(!write(KEYS.social,{...s,posts:[post,...s.posts]}))return {ok:false,error:'Could not share on this device. Please try again.'};emit();return {ok:true,post};
  }
  const api={KEYS,CIRCLE,GENERAL,read,stamp,cat,author,demo,updates,accessible,observations,sourceFor,feedingStatus,savedCareRecords,beginDraft,loadDraft,saveDraft,discardDraft,saveUpdate,arrangeWords,answer,suggestions,social,posts,toggleLike,addComment,publishPost};
  root.MewLinkData=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
