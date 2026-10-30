/* Derived prototype presentation data. Fixtures are never evidence of a real-world event. */
(function(root){
  'use strict';
  const M=root.MewLinkCare,D=root.MewLinkData;
  const LEARNING_KEY='mewlink-care-basics-completed-v1';
  const AVS='https://avs.nparks.gov.sg/community-animals/living-harmoniously-with-community-animals/community-cats/';
  const CWS='https://www.catwelfare.org/responsible-caregiving/';
  const time=r=>Date.parse(r.occurredAt);
  const fresh=(r,now)=>Number.isFinite(time(r))&&time(r)<=now&&M.daysSince(r.occurredAt,now)>=0&&M.daysSince(r.occurredAt,now)<=30;
  const cat=id=>M.allCats().find(c=>c.id===id);
  const source=r=>D.sourceFor(r);
  function rows(id,options={}){return D.observations(id,options).filter(r=>fresh(r,options.now??Date.now()));}
  function kindFor(text){
    if(/\bwater\b|\bbowl.*(?:clean|empty)|饮水|补水|水碗/i.test(text))return 'water';
    if(/\bcover\b|\bhandover\b|\baway\b|\btravel\b|交接|代喂/i.test(text))return 'cover';
    if(/\bfeed|\beat|\bfood\b|喂|食/i.test(text))return 'feeding';
    return 'observation';
  }
  const labels={water:'Water check',cover:'Feeding cover',feeding:'Feeding check'};
  function needLabel(text,kind){
    if(/\bear\b/i.test(text))return 'Ear check';
    if(/\bpaw\b/i.test(text))return 'Paw check';
    if(/\b(?:appetite|how much|eats|eating)\b/i.test(text))return 'Appetite check';
    if(/\bspace\b|\bdistance\b/i.test(text))return 'Give space';
    if(/\bsighting\b|look out|\bfind\b/i.test(text))return 'Sighting check';
    return labels[kind]||'';
  }
  function careRecords(options={}){
    const now=options.now??Date.now(),records=options.careRecords||M.allRecords();
    return [...new Map(records.filter(r=>r.valid===true&&M.VALID_CARE.has(r.kind)&&r.catId&&r.caregiverId&&Number.isFinite(time(r))&&time(r)<=now&&(!r.circleId||D.accessible(r,options.viewer))).map(r=>[r.updateId||r.id,r])).values()];
  }
  function needs(id,options={}){
    if(!cat(id))return [];
    const history=rows(id,options),records=careRecords(options),seen=new Set(),out=[];
    for(const r of history){
      const text=String(r.next||'').trim();if(!text)continue;
      const kind=kindFor(text),label=needLabel(text,kind);if(!label||seen.has(label))continue;seen.add(label);
      // A completed later visit of the same kind resolves an earlier request. A saved
      // draft, sighting, or absence of feeding evidence never creates/resolves a need.
      const matchingCompletion=history.some(n=>time(n)>time(r)&&n.requestStatus==='completed'&&(n.resolvesRequestId===r.id||(Array.isArray(n.resolvedRequestIds)&&n.resolvedRequestIds.includes(r.id))));
      // Cover may refer to a future evening or many dates. A later feeding visit
      // cannot establish that the requested period has been covered.
      const resolved=matchingCompletion||(kind!=='cover'&&(records.some(c=>c.catId===id&&time(c)>time(r)&&c.kind===kind)||history.some(n=>time(n)>time(r)&&/\b(resolved|completed|checked and|no longer needed|healed|no concerns?)\b/i.test(n.observed||'')&&kindFor((n.observed||'')+' '+(n.next||''))===kind)));
      if(resolved)continue;
      out.push({kind,label,detail:text,occurredAt:r.occurredAt,sourceIds:[r.id],sources:[source(r)],demo:r.source==='demo'});
    }
    return out.sort((a,b)=>Date.parse(b.occurredAt)-Date.parse(a.occurredAt));
  }
  function zoneNeeds(zone,options={}){return M.allCats().filter(c=>c.zone===zone).map(c=>({catId:c.id,catName:c.name,photo:c.photo,tnrOk:c.tnrOk===true,zone:c.zone,needs:needs(c.id,options)})).filter(c=>c.needs.length);}
  function notifications(options={}){
    const events=[];
    for(const c of M.allCats())for(const need of needs(c.id,options)){
      const r=rows(c.id,options).find(r=>r.id===need.sourceIds[0]);if(!r)continue;
      events.push({id:'request-'+r.id,catId:c.id,catName:c.name,author:D.author(r.authorId),occurredAt:r.occurredAt,title:c.name+' · '+need.label,detail:need.detail,sources:[source(r)],demo:r.source==='demo'});
    }
    // Additional event types require explicit records; no TNR/absence events are seeded.
    return events.sort((a,b)=>Date.parse(b.occurredAt)-Date.parse(a.occurredAt));
  }
  function alerts(options={}){
    const out=[];
    for(const c of M.allCats()){
      const resolved=r=>/\b(resolved|no concerns?|no longer needed|healed)\b/i.test(r.observed||'');
      const r=rows(c.id,options).find(r=>!resolved(r)&&/\b(cut|ear|wound|swollen|injur|hid|hiding|hiss|stepped back|untouched|not come|did not come|not seen|shy|nervous|avoiding|approach|calm)\b|伤|躲|紧张|亲近/i.test((r.observed||'')+' '+(r.uncertain||'')));
      if(!r)continue;
      const later=rows(c.id,options).some(n=>time(n)>time(r)&&resolved(n));if(later)continue;
      const compact=alertCopy(r);
      out.push({catId:c.id,catName:c.name,...compact,occurredAt:r.occurredAt,sources:[source(r)],demo:r.source==='demo'});
    }
    return out.sort((a,b)=>Date.parse(b.occurredAt)-Date.parse(a.occurredAt));
  }
  function alertCopy(r){
    const text=r.observed||'';
    if(/\bear\b|\bcut\b|\bscratch\b/i.test(text))return {title:'Tiny ear mystery! 👀',detail:'Possible scratch. Check next visit—snap a pic if the cat is comfortable. 📷',tag:'Ear check'};
    if(/untouched|did not eat|not eating|skipped.*(?:food|dinner)/i.test(text))return {title:'Dinner still waiting? 🍽️',detail:'Food was left untouched. Check appetite next visit.',tag:'Appetite check'};
    if(/hid|hiding|stepped back|hiss|avoiding/i.test(text))return {title:'A little breathing room 🐾',detail:'Kept some distance. Give space and let the cat come to you.',tag:'Give space'};
    if(/not come|did not come|not seen/i.test(text))return {title:'Spot our quiet neighbour? 👀',detail:'Not seen on the last round. Log a sighting if you meet.',tag:'Sighting check'};
    const sentence=text.match(/[^.!?]+[.!?]?/)?.[0]?.trim()||'A new care note is waiting.';
    return {title:'A small check-in 🐾',detail:sentence.length>115?sentence.slice(0,112)+'…':sentence,tag:needLabel(r.next||'',kindFor(r.next||''))||'Check-in'};
  }
  function facts(id,options={}){
    const c=cat(id);if(!c)return 'No behaviour note recorded yet.';
    const notes=rows(id,options);
    const r=notes.find(r=>/\b(calm|shy|approach|come close|ate with|finished.*first|hide|hiding|purr|play)\b/i.test(r.observed||''));
    if(c.funFact)return c.funFact;
    if(r)return r.observed;
    return 'Still getting to know '+c.name+' — add what you notice.';
  }
  function contributions(id=null,options={}){
    const viewer=options.viewer||M.CURRENT_USER,records=careRecords(options).filter(r=>r.caregiverId===viewer&&(!id||r.catId===id));
    const byKind={};for(const r of records)byKind[r.kind]=(byKind[r.kind]||0)+1;
    const observations=M.allCats().filter(c=>!id||c.id===id).flatMap(c=>D.observations(c.id,options)).filter(r=>r.authorId===viewer&&(!r.careKind||r.careKind==='observation'));
    byKind.observation=new Set(observations.map(r=>r.id)).size;
    const tnr=D.updates().filter(r=>r.authorId===viewer&&(!id||r.catId===id)&&r.identity==='confirmed'&&D.accessible(r,viewer)&&r.careKind==='tnr_support'&&r.careOutcome==='provided'&&Number.isFinite(time(r))&&time(r)<=(options.now??Date.now()));
    byKind.tnr_support=new Set(tnr.map(r=>r.id)).size;
    return {feeding:byKind.feeding||0,total:records.length,byKind,observation:byKind.observation,tnrSupport:byKind.tnr_support};
  }
  function basics(){return [
    {id:'feeding',title:'Food & fresh water',text:'Offer cat food in a container and clear leftovers within two hours. Change water daily and clean the bowl.',sourceUrl:CWS,sourceTitle:'Cat Welfare Society · Responsible Caregiving'},
    {id:'approach',title:'Let the cat approach',text:'Stay quiet and keep a respectful distance. Let the cat choose to come closer; do not chase, stare at or corner it.',sourceUrl:AVS,sourceTitle:'AVS · Encountering community cats'},
    {id:'interaction',title:'Give cats a way to leave',text:'Keep interactions calm. Avoid sudden movement or noise, and supervise children so they do not startle the cat.',sourceUrl:AVS,sourceTitle:'AVS · Encountering community cats'},
    {id:'safety',title:'Notice & ask for help',text:'Record what you see without guessing a diagnosis. If a cat shows medical distress, seek veterinary attention with the care circle.',sourceUrl:CWS,sourceTitle:'Cat Welfare Society · Responsible Caregiving'}
  ];}
  function completedLearning(){try{return JSON.parse(root.localStorage.getItem(LEARNING_KEY))?.version===1;}catch(_){return false;}}
  function requiresLearning(answers){
    if(completedLearning())return false;
    if(!answers){try{answers=JSON.parse(root.localStorage.getItem('mewlink-profile-answers')||'{}');}catch(_){answers={};}}
    return answers?.home==='No'&&['New to this','Under 1 year'].includes(answers.exp);
  }
  function learningPending(){try{return root.localStorage.getItem('mewlink-learning-required')==='1'&&requiresLearning();}catch(_){return false;}}
  function completeLearning(){try{root.localStorage.setItem(LEARNING_KEY,JSON.stringify({version:1,completedAt:new Date().toISOString()}));return true;}catch(_){return false;}}
  const api={LEARNING_KEY,rows,careRecords,needs,zoneNeeds,notifications,alerts,facts,contributions,basics,completedLearning,completeLearning,requiresLearning,learningPending};
  root.MewLinkRefine=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
