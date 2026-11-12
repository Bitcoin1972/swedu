const fs=require('node:fs');
const path=require('node:path');
const film=require('../content/film-v3.json');
const out=path.join(__dirname,'../docs/film-v3');
fs.mkdirSync(out,{recursive:true});
const time=s=>`00:${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}.000`;
for(const lang of ['en','de','hi']){
 const cues=[];
 for(const scene of film.scenes){
  const sentences=scene[lang].match(/[^.!?।]+[.!?।]+/g)||[scene[lang]];
  sentences.forEach((text,i)=>{
   const start=Math.round(scene.start+i*(scene.end-scene.start)/sentences.length);
   const end=Math.round(scene.start+(i+1)*(scene.end-scene.start)/sentences.length);
   cues.push(`${time(start)} --> ${time(end)}\n${text.trim()}`);
  });
 }
 fs.writeFileSync(path.join(out,`narration.${lang}.vtt`),'WEBVTT\n\nNOTE Draft timings; synchronize with recorded voice before publication.\n\n'+cues.join('\n\n')+'\n');
 fs.writeFileSync(path.join(out,`narration.${lang}.md`),`# Narration draft (${lang})\n\n`+film.scenes.map(s=>`## ${s.start}-${s.end}s: ${s.title}\n\n${s[lang]}`).join('\n\n')+'\n');
}
console.log('Exported three narration scripts and three draft caption tracks to docs/film-v3.');
