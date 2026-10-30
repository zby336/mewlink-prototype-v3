const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
test('pending first-join learning guards all application deep links, completion and returning visitors can proceed',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../src/template.html'),'utf8'),code=html.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/)[1];
 const store=new Map([['mewlink-learning-required','1']]);let complete=false,eligible=true;
 const ctx={DCLogic:class{},location:{hash:'#cats'},localStorage:{getItem:k=>store.get(k)},window:{MewLinkRefine:{learningPending:()=>store.get('mewlink-learning-required')==='1'&&eligible&&!complete}}};vm.createContext(ctx);vm.runInContext(code+';this.C=Component;',ctx);
 const c=new ctx.C();for(const r of ['cats','today','care','me','tiger','community','askmew','askmewai','careupdate']){ctx.location.hash='#'+r;assert.equal(c.read(),'learn',r);}
 ctx.location.hash='#join';assert.equal(c.read(),'join');complete=true;ctx.location.hash='#care';assert.equal(c.read(),'today');ctx.location.hash='#askmewai';assert.equal(c.read(),'askmew');complete=false;eligible=false;ctx.location.hash='#cats';assert.equal(c.read(),'cats');eligible=true;store.delete('mewlink-learning-required');ctx.location.hash='#cats';assert.equal(c.read(),'cats');
});
