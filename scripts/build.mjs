import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const resources=JSON.parse(await fs.readFile(path.join(root,'src/resources.json'),'utf8'));
const out=path.join(root,'dist');
await fs.mkdir(path.join(out,'assets'),{recursive:true});
const manifest={}; const files=[];
for(const entry of resources){
  // Immutable font/vendor assets stay in the original portable packed form.
  const raw=entry.bundledParts ? null : await fs.readFile(path.join(root,'src',entry.path));
  const bytes=entry.bundledParts
    ? Buffer.concat(await Promise.all(entry.bundledParts.map(file=>fs.readFile(path.join(root,file)))))
    : entry.compressed?zlib.gzipSync(raw,{level:9}):raw;
  const parts=[];
  for(let offset=0,part=0;offset<bytes.length;offset+=24576,part++){
    const file='assets/'+entry.id+'-'+part+'.bin';
    const chunk=bytes.subarray(offset,offset+24576);
    await fs.writeFile(path.join(out,file),chunk);
    parts.push('/'+file);
    files.push({file,sha:crypto.createHash('sha1').update(chunk).digest('hex'),size:chunk.length});
  }
  manifest[entry.id]={mime:entry.mime,compressed:entry.compressed,parts};
}
const template=await fs.readFile(path.join(root,'src/template.html'),'utf8');
let loader=await fs.readFile(path.join(root,'src/loader.html'),'utf8');
loader=loader.replace('__RESOURCE_MANIFEST__',JSON.stringify(manifest)).replace('__PAGE_TEMPLATE__',JSON.stringify(template).replace(/<\//g,'<\\/'));
await fs.writeFile(path.join(out,'index.html'),loader);
for(const file of await fs.readdir(path.join(root,'public'))){
  await fs.copyFile(path.join(root,'public',file),path.join(out,file));
}
for(const file of ['index.html',...await fs.readdir(path.join(root,'public'))]){
 const bytes=await fs.readFile(path.join(out,file));
 files.push({file,sha:crypto.createHash('sha1').update(bytes).digest('hex'),size:bytes.length});
}
await fs.writeFile(path.join(root,'deployment-files.json'),JSON.stringify(files,null,2));
console.log(JSON.stringify({files:files.length,bytes:files.reduce((s,f)=>s+f.size,0),out}));
