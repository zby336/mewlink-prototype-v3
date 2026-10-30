const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function setup({reduce=false,contextMissing=false}={}){
 const queue=new Map(),listeners=new Set(),motion={matches:reduce,addEventListener:(_,fn)=>listeners.add(fn),removeEventListener:(_,fn)=>listeners.delete(fn)};let C,next=1,canvases=0,draws=0;
 const ctx={setTransform(){},clearRect(){},save(){},restore(){},translate(){},rotate(){},scale(){},beginPath(){},arc(){},fill(){draws++;},fillRect(){draws++;}};
 const document={createElement(name){assert.equal(name,'canvas');canvases++;return {tagName:'CANVAS',width:0,height:0,getContext:()=>contextMissing?null:ctx};}};
 class Element{constructor(){this.attrs={'record-id':'saved-record'};this.children=[];this.isConnected=true;this.ownerDocument=document;}getAttribute(k){return this.attrs[k];}setAttribute(k,v){this.attrs[k]=v;}getBoundingClientRect(){return {width:390,height:844};}replaceChildren(...c){this.children=c;}}
 const window={innerWidth:390,innerHeight:844,devicePixelRatio:3,matchMedia:()=>motion,requestAnimationFrame:()=>{throw Error('No JavaScript animation loop should be scheduled');}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../public/refinement-ui.js'),'utf8'),{HTMLElement:Element,customElements:{get:()=>null,define:(_,type)=>C=type},window,setTimeout:fn=>{const id=next++;queue.set(id,fn);return id;},clearTimeout:id=>queue.delete(id)});
 return {element:new C(),queue,motion,canvases:()=>canvases,draws:()=>draws,reduce(){motion.matches=true;for(const fn of listeners)fn();},finish(){const tasks=[...queue.values()];queue.clear();tasks.forEach(fn=>fn());}};
}
test('full-screen celebration draws 84 pieces once across two bounded-resolution layers with no animation loop',()=>{
 const h=setup(),e=h.element;e.connectedCallback();assert.equal(h.canvases(),2);assert.equal(e.children.length,2);assert(e.children.every(c=>c.tagName==='CANVAS'));assert.equal(e.children[0].width,585);assert.equal(e.children[0].height,1519);assert.equal(h.draws(),84);assert.equal(h.queue.size,1);h.finish();assert.equal(e.children.length,0);assert.equal(h.queue.size,0);assert.equal(h.draws(),84);
});
test('celebration never replays for the same record and cleans up when leaving',()=>{
 const h=setup(),e=h.element;e.connectedCallback();e.connectedCallback();assert.equal(h.canvases(),2);assert.equal(h.queue.size,1);e.isConnected=false;e.disconnectedCallback();assert.equal(h.queue.size,0);assert.equal(e.children.length,0);e.isConnected=true;e.connectedCallback();assert.equal(h.canvases(),2);assert.equal(h.queue.size,0);
});
test('reduced motion skips all rendering and changing that preference stops an active celebration',()=>{
 const quiet=setup({reduce:true});quiet.element.connectedCallback();assert.equal(quiet.canvases(),0);assert.equal(quiet.queue.size,0);const active=setup();active.element.connectedCallback();active.reduce();assert.equal(active.element.children.length,0);assert.equal(active.queue.size,0);
});
test('unavailable canvas context skips only the celebration gracefully',()=>{const h=setup({contextMissing:true});assert.doesNotThrow(()=>h.element.connectedCallback());assert.equal(h.queue.size,0);assert.equal(h.element.children.length,0);});
