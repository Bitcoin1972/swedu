(() => {
 const source=document.getElementById('sp-data');if(!source)return;
 const data=JSON.parse(source.textContent),state={...data.state},app=document.querySelector('.sp-app'),reader=document.getElementById('sp-reader');
 const environment=document.querySelector('.sp-environment'),previous=document.querySelector('.sp-scene-previous');
 const stageCount=data.stages.length;let pathway=1;
 function pathwayPanel(){const choice=reader.querySelector('[data-sp-pathway-choice]');if(!choice)return;choice.value=String(pathway);if(state.stage===9)document.getElementById('sp-offers-body').innerHTML=data.versions[state.lang].pathwayOffers[pathway-1];reader.querySelectorAll('[data-sp-pathway-panel]').forEach(p=>p.hidden=Number(p.dataset.spPathwayPanel)!==pathway);document.querySelectorAll('[data-sp-pathway]').forEach(p=>{p.setAttribute('aria-current',String(Number(p.dataset.spPathway)===pathway));p.querySelector('span').textContent=data.versions[state.lang].pathways.entries[Number(p.dataset.spPathway)-1].title;});}
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:900px)');
 let zoneOpen=new URLSearchParams(location.search).get('topic')==='1',view='story',documentURL=null,request=null,requestNumber=0;
 const c=()=>data.versions[state.lang].copy;
 window.SWE_I18N={t:text=>({de:{'Play Intro':'Intro abspielen','Tap to start the video':'Antippen, um das Video zu starten'},hi:{'Play Intro':'परिचय चलाएँ','Tap to start the video':'वीडियो शुरू करने के लिए टैप करें'}}[state.lang]?.[text]||text)};
 const icons=()=>window.lucide?.createIcons();
 function address(){return (state.room==='world'?'/':'/world/'+state.room)+'?'+new URLSearchParams({...state,topic:zoneOpen?'1':'0',skipIntro:'1'});}
 function save(push=true){history[push?'pushState':'replaceState']({...state,view,zoneOpen,documentURL},'',documentURL?withContext(documentURL):address());}
 function withContext(href){const url=new URL(href,location.origin);for(const[k,v]of Object.entries(state))url.searchParams.set(k,v);url.searchParams.set('topic',zoneOpen?'1':'0');url.searchParams.set('skipIntro','1');return url.pathname+url.search+url.hash;}
 function cancelDocument(){window.SWE_PARTNERS?.close();request?.abort();request=null;requestNumber++;documentURL=null;app.classList.remove('sp-document-open');}
 function drawer(which){document.querySelectorAll('.sp-panel').forEach(p=>p.classList.toggle('sp-open',p.id==='sp-'+which));document.querySelectorAll('[data-sp-drawer]').forEach(b=>b.setAttribute('aria-expanded',String(b.dataset.spDrawer===which)));if(which)document.querySelector('#sp-'+which+' .sp-close')?.focus({preventScroll:true});}
 function scene(){
  const sceneId=state.stage===9?'programmes':state.stage===3&&state.room==='school'?'youth':state.room;
  if(environment.dataset.scene!==sceneId){previous.dataset.scene=environment.dataset.scene;previous.classList.remove('sp-fading');environment.dataset.scene=sceneId;if(!reduced.matches){void previous.offsetWidth;previous.classList.add('sp-fading');}}
  environment.setAttribute('aria-label',sceneId==='youth'?data.versions[state.lang].labels[3]:state.room==='world'?c().world:c().roomLabels[data.roomIds.indexOf(state.room)]);
  document.querySelector('.sp-markers').hidden=state.room!=='world'||state.stage===9;
  document.querySelector('.sp-pathway-spots').hidden=state.stage!==9;
  const spots=document.querySelector('.sp-hotspots');spots.hidden=state.room==='world';
  document.querySelector('[data-sp-overview]').hidden=state.room==='world';
  if(state.room!=='world')spots.innerHTML=(sceneId==='youth'?data.versions[state.lang].panelCopy.youthZones:c().zones[state.room]).map((label,i)=>`<button data-sp-zone="${i}" aria-current="${zoneOpen&&state.zone===i}" style="--x:${[22,40,73,76][i]}%;--y:${[70,42,29,72][i]}%"><i data-lucide="${['book-open','users','network','microscope'][i]}" aria-hidden="true"></i><span>${label}</span></button>`).join('');
  document.querySelector('.sp-scene-caption').textContent=state.stage?data.versions[state.lang].labels[state.stage]:'';
 }
 const knowledge=document.createElement('dialog');knowledge.className='sp-knowledge';knowledge.setAttribute('aria-labelledby','sp-knowledge-title');document.body.append(knowledge);
 let knowledgeTrigger=null;
 knowledge.addEventListener('close',()=>knowledgeTrigger?.isConnected&&knowledgeTrigger.focus({preventScroll:true}));
 function assumptions(){const k=data.versions[state.lang].knowledge,a=data.versions[state.lang].assessment;return `<section class="sp-dependencies"><h3>${k.heading}</h3><p>${k.intro}</p>${k.issues.map((issue,i)=>`<button data-sp-knowledge="${i}">${issue.title}<i data-lucide="arrow-up-right" aria-hidden="true"></i></button>`).join('')}${a?`<button data-sp-assessment>${a.title}</button>`:''}</section>`;}
 function openAssessment(trigger){
  const a=data.versions[state.lang].assessment,k=data.versions[state.lang].knowledge;if(!a)return;
  const v=data.versions[state.lang],record=v.caseRecord,editorial=record.locales[state.lang],labels=v.panelCopy;
  knowledgeTrigger=trigger;knowledge.lang=state.lang;
  knowledge.innerHTML=`<header><div><small>${k.context}: ${data.versions[state.lang].labels[state.stage]}</small><h2 id="sp-knowledge-title" tabindex="-1">${a.title}</h2></div><button data-sp-knowledge-close aria-label="${k.close}">${k.close}</button></header><div class="sp-knowledge-body"><h3>${a.labels[0]}</h3><p>${editorial.facts}</p><h3>${a.labels[1]}</h3><p>${editorial.interpretation}</p><label>${a.perspective}<select data-sp-case-view>${a.names.map((name,i)=>`<option value="${i}">${name}</option>`).join('')}</select></label><p data-sp-case-text aria-live="polite">${a.views[0]}</p><h3>${a.labels[2]}</h3><p>${editorial.proposedResponse}</p>${state.stage===9?a.links:''}<h3>${a.labels[3]}</h3><p>${editorial.evaluation}</p><h3>${a.labels[4]}</h3>${[[record.publisher+' · '+record.publishedOn,record.originalUrl],[record.primaryTitle,record.primaryUrl]].map(([name,url])=>`<p><a lang="en" href="${url}" target="_blank" rel="noopener">${name}</a></p>`).join('')}</div><footer><button data-sp-knowledge-close>${k.close}</button></footer>`;
  knowledge.showModal();knowledge.querySelector('h2').focus({preventScroll:true});
  const body=knowledge.querySelector('.sp-knowledge-body');
  const metadata=document.createElement('p');metadata.className='sp-case-metadata';metadata.textContent=`${record.publisher} · ${record.author} · ${record.publishedOn} · ${labels.verified}: ${record.verifiedOn}`;body.prepend(metadata);
  const title=document.createElement('p');title.lang='en';title.textContent=record.title;metadata.after(title);
  const limits=document.createElement('p');limits.textContent=editorial.limitations;
  const heading=document.createElement('h3');heading.textContent=labels.limits;body.append(heading,limits);
  if(state.stage!==9)body.querySelectorAll('.sp-programme').forEach(el=>el.remove());
  const initial=state.room==='governance'||state.room==='national'?3:state.room==='institutions'||state.room==='academy'||state.room==='school'?1:state.room==='economy'?2:0;
  body.querySelector('[data-sp-case-view]').value=String(initial);body.querySelector('[data-sp-case-text]').textContent=a.views[initial];
 }
 function openKnowledge(index,trigger){
  stop();knowledgeTrigger=trigger;const v=data.versions[state.lang],k=v.knowledge,issue=k.issues[index];
  knowledge.lang=state.lang;
  knowledge.innerHTML=`<header><div><small>${k.context}: ${v.labels[state.stage]}</small><h2 id="sp-knowledge-title" tabindex="-1">${issue.title}</h2></div><button data-sp-knowledge-close aria-label="${k.close}"><i data-lucide="x" aria-hidden="true"></i></button></header><div class="sp-knowledge-body">${issue.explanation}${state.stage===9?issue.links:''}<details><summary>${k.explore}</summary><label><input type="checkbox" data-sp-assumption="${index}"${state.scenario[index]==='1'?' checked':''}> ${k.available}</label><p data-sp-effect aria-live="polite">${issue.effects[state.scenario[index]==='1'?0:1]}</p></details><p class="sp-note">${k.limit}</p><h3>${k.related}</h3><nav>${issue.rooms.map(room=>`<button data-sp-room="${room}">${c().roomLabels[data.roomIds.indexOf(room)]}</button>`).join('')}</nav></div><footer><button data-sp-knowledge-close>${k.close}</button></footer>`;

  if(state.stage!==9)knowledge.querySelectorAll('.sp-programme').forEach(el=>el.remove());
  icons();knowledge.showModal();knowledge.querySelector('h2').focus({preventScroll:true});
 }
 function openZone(trigger){
  const v=data.versions[state.lang],k=v.knowledge;
  knowledgeTrigger=trigger;knowledge.lang=state.lang;
  const youth=state.stage===3&&state.room==='school';
  const label=youth?v.panelCopy.youthZones[state.zone]:c().zones[state.room][state.zone];
  knowledge.innerHTML=`<header><h2 id="sp-knowledge-title" tabindex="-1">${label}</h2><button data-sp-knowledge-close aria-label="${k.close}">${k.close}</button></header><div class="sp-knowledge-body"></div><footer><button data-sp-knowledge-close>${k.close}</button></footer>`;
  const body=knowledge.querySelector('.sp-knowledge-body');
  body.innerHTML=v.zones[youth?'youth':state.room][state.zone];
  icons();knowledge.showModal();knowledge.querySelector('h2').focus({preventScroll:true});
 }
 function model(){const m=data.versions[state.lang].model;return `<h2>${c().model}</h2><p>${c().top}</p><div class="sp-model">${m.layers.map((label,i)=>`<button data-sp-room="${['national','governance','institutions','academy','economy','society'][i]}">${label}<i data-lucide="arrow-down-up" aria-hidden="true"></i></button>`).join('')}</div><p>${c().bottom}</p>${assumptions()}`;}
 function renderPanel(reset=true){
  if(view==='document')return;
  const v=data.versions[state.lang];
  reader.innerHTML=view==='model'?model():state.stage===0?v.intro:state.stage===9?v.stories[9]:state.room==='governance'?v.governance:v.stories[state.stage];
  pathwayPanel();
  if(reset)reader.scrollTop=0;
 }
 function labels(){
  const u=c(),v=data.versions[state.lang];document.documentElement.lang=state.lang;
  document.querySelector('.skip-content').textContent=state.stage===0?u.vision:state.stage===9?u.programmes:v.panelCopy.realityLabel;
  document.querySelector('.sp-scene').setAttribute('aria-label',u.world);
  document.querySelector('.sp-title h1').textContent=u.title;document.querySelector('.sp-title p').textContent=u.subtitle;document.querySelector('.sp-title small').textContent=u.draft;
  document.querySelector('#sp-language').value=state.lang;
  document.querySelectorAll('[data-sp-stage]').forEach(a=>{const i=Number(a.dataset.spStage);a.querySelector('span').textContent=v.labels[i];a.setAttribute('aria-label',v.labels[i]);a.setAttribute('aria-current',String(i===state.stage));const s={...state,stage:i,room:data.roomsByStage[i]};a.href=(s.room==='world'?'/':'/world/'+s.room)+'?'+new URLSearchParams(s);});
  document.querySelectorAll('[data-sp-home]').forEach(a=>{if(!a.classList.contains('sp-brand'))a.textContent=u.vision;});
  document.querySelector('[data-sp-model]').textContent=u.model;
  const nav=document.querySelector('.sp-header nav');nav.querySelector('[href="/programmes"]').textContent=u.all;nav.querySelector('[href="/network"]').textContent=u.ecosystem;nav.querySelector('[href="/about"]').textContent=u.about;
  document.querySelector('.sp-partner').textContent=u.partners;document.querySelector('.sp-language span').textContent=u.language;
  document.querySelectorAll('[data-sp-close]').forEach(b=>b.setAttribute('aria-label',u.close));
  document.querySelector('[data-sp-overview]').innerHTML=`<i data-lucide="map" aria-hidden="true"></i>${u.world}`;
  document.querySelector('[data-sp-drawer="offers"]').innerHTML=`<i data-lucide="book-open" aria-hidden="true"></i>${state.stage===9?u.offers:v.panelCopy.storyLabel}`;
  document.querySelector('[data-sp-drawer="information"]').innerHTML=`<i data-lucide="globe" aria-hidden="true"></i>${state.stage===0?u.vision:state.stage===9?u.programmes:v.panelCopy.realityLabel}`;
  for(const [attr,label]of [['prev',u.previous],['next',u.next],['restart',u.restart]])document.querySelectorAll('[data-sp-'+attr+']').forEach(b=>{b.title=label;b.setAttribute('aria-label',label);});
  document.getElementById('sp-count').textContent=`${String(state.stage+1).padStart(2,'0')} / ${String(stageCount).padStart(2,'0')}`;
  document.getElementById('sp-status').textContent=v.labels[state.stage];
  document.querySelector('.sp-utilities a').textContent=u.contact;document.querySelector('.sp-utilities a[href="/privacy"]').textContent={en:'Privacy',de:'Datenschutz',hi:'गोपनीयता'}[state.lang];
  let replay=document.querySelector('[data-sp-replay]');
  if(!replay){replay=document.createElement('a');replay.dataset.spReplay='';document.querySelector('.sp-utilities').append(replay);}
  replay.href='/?intro=1&lang='+state.lang;replay.textContent={en:'Replay intro',de:'Intro erneut abspielen',hi:'परिचय फिर चलाएँ'}[state.lang];
 }
 function render(reset=true){scene();const offers=document.getElementById('sp-offers-body');offers.innerHTML=data.versions[state.lang].ecosystems[state.stage];
  if(reset)document.getElementById('sp-offers').scrollTop=offers.scrollTop=0;
  renderPanel(reset);labels();icons();}
 function stop(){labels();icons();}
 function select(stage,push=true){cancelDocument();state.stage=Math.max(0,Math.min(stageCount-1,stage));state.room=data.roomsByStage[state.stage];state.focus=['society','society','academy','academy','academy','economy','economy','institutions','capability','capability'][state.stage];state.zone=0;zoneOpen=false;view='story';render();save(push);document.getElementById('sp-status').textContent=data.versions[state.lang].labels[state.stage];}
 async function documentView(href,push=true,position=0){
  if(data.partners&&window.SWE_PARTNERS&&new URL(href,location.origin).pathname==='/network'){
   request?.abort();requestNumber++;documentURL=href;view='document';app.classList.remove('sp-document-open');drawer(null);save(push);
   window.SWE_PARTNERS.open(data.partners,state.lang,()=>{cancelDocument();view='story';render();save();document.querySelector('.sp-header a[href="/network"]').focus();});return;
  }
  window.SWE_PARTNERS?.close();
  stop();request?.abort();request=new AbortController();const n=++requestNumber;documentURL=href;view='document';app.classList.add('sp-document-open');reader.innerHTML=`<p role="status">${c().loading}</p>`;save(push);if(mobile.matches)drawer('information');
  try{
   const target=new URL(href,location.origin);if(target.origin!==location.origin||target.pathname.startsWith('/partners'))return location.assign(href);
   target.searchParams.set('worldDocument','1');target.searchParams.set('lang',state.lang);
   const response=await fetch(target.pathname+target.search,{signal:request.signal});if(!response.ok)throw Error('Unavailable');
   const doc=new DOMParser().parseFromString(await response.text(),'text/html');if(n!==requestNumber)return;
   let main=target.hash?doc.getElementById(decodeURIComponent(target.hash.slice(1))):doc.querySelector('main');if(!main)main=doc.body;
   main.querySelectorAll('script,header,footer,#nav,#introOverlay,.site-language,.site-translation-notice,.world-return-strip').forEach(el=>el.remove());
   reader.innerHTML=`<button data-sp-story>${c().back}</button>${state.lang!=='en'&&doc.documentElement.getAttribute('data-swe-translation-complete')!=='true'?`<p class="sp-doc-warning">${c().missing}</p>`:''}<div class="sp-loaded"></div>`;
   reader.querySelector('.sp-loaded').append(...main.childNodes);reader.scrollTop=position*Math.max(0,reader.scrollHeight-reader.clientHeight);icons();
  }catch(e){if(e.name==='AbortError'||n!==requestNumber)return;reader.innerHTML=`<p>${c().error}</p><a data-sp-original>${c().original}</a>`;reader.querySelector('a').href=href;}
 }
 document.addEventListener('click',e=>{
  const el=e.target.closest('a,button');if(!el||el.closest('#introOverlay'))return;
  if(el.matches('[data-mission-replay]')){e.preventDefault();const film=reader.querySelector('#sp-mission-video');if(film){film.scrollIntoView({block:'center'});film.focus({preventScroll:true});film.play().catch(()=>{});}return;}
  if(el.matches('[data-sp-pathway]')){e.preventDefault();pathway=Number(el.dataset.spPathway);pathwayPanel();icons();if(mobile.matches)drawer('information');reader.querySelector('[data-sp-pathway-choice]')?.scrollIntoView({block:'start'});return;}
  if(el.matches('[data-sp-return-stage]')){select(Number(el.dataset.spReturnStage));return;}
  if(el.matches('[data-sp-assessment]')){openAssessment(el);return;}
  if(el.matches('[data-sp-knowledge]')){openKnowledge(Number(el.dataset.spKnowledge),el);return;}
  if(el.matches('[data-sp-knowledge-close]')){knowledge.close();return;}
  if(knowledge.open&&el.matches('[data-sp-room],[data-sp-document]'))knowledge.close();
  if(el.matches('[data-sp-stage]')){e.preventDefault();stop();select(Number(el.dataset.spStage));return;}
  if(el.matches('[data-sp-zone]')){state.zone=Number(el.dataset.spZone);zoneOpen=true;scene();icons();save();openZone(document.querySelector('[data-sp-zone="'+state.zone+'"]'));return;}
  if(el.matches('[data-sp-home],[data-sp-restart]')){e.preventDefault();stop();select(0);return;}
  if(el.matches('[data-sp-overview]')){stop();cancelDocument();state.room='world';zoneOpen=false;view='story';render();save();return;}
  if(el.matches('[data-sp-model]')){stop();cancelDocument();view='model';render();save();if(mobile.matches)drawer('information');return;}
  if(el.matches('[data-sp-room]')){stop();cancelDocument();state.room=el.dataset.spRoom;view='story';zoneOpen=false;render();save();return;}
  if(el.matches('[data-sp-next],[data-sp-prev]')){stop();select((state.stage+(el.hasAttribute('data-sp-prev')?-1:1)+stageCount)%stageCount);return;}
  if(el.matches('[data-sp-start]')){select(1);return;}
  if(el.matches('[data-sp-story]')){const fromDocument=view==='document';cancelDocument();view='story';if(!fromDocument)zoneOpen=false;render();save();return;}
  if(el.matches('[data-sp-drawer]')){drawer(el.dataset.spDrawer);return;}
  if(el.matches('[data-sp-close]')){drawer(null);document.querySelector('[data-sp-drawer="information"]').focus();return;}
  if(el.matches('[data-sp-chapter]')){e.preventDefault();const target=reader.querySelector(el.getAttribute('href'));target?.scrollIntoView({block:'start'});return;}
  if(el.matches('a')&&!el.matches('[data-sp-original]')){
   const target=new URL(el.href,location.href);if(target.origin!==location.origin||target.pathname.startsWith('/partners')||/\.(pdf|png|jpg|jpeg|mp4)$/.test(target.pathname))return;
   if(el.hasAttribute('data-sp-document')||el.closest('.sp-reader')){e.preventDefault();documentView(target.pathname+target.search+target.hash);}
  }
 });
 document.getElementById('sp-language').addEventListener('change',e=>{const position=reader.scrollTop/Math.max(1,reader.scrollHeight-reader.clientHeight),left=document.getElementById('sp-offers'),leftPosition=left.scrollTop/Math.max(1,left.scrollHeight-left.clientHeight);state.lang=e.target.value;render();left.scrollTop=leftPosition*Math.max(0,left.scrollHeight-left.clientHeight);if(view==='document')documentView(documentURL,false,position);else reader.scrollTop=position*Math.max(0,reader.scrollHeight-reader.clientHeight);save();});
 document.addEventListener('change',e=>{if(e.target.matches('[data-sp-pathway-choice]')){pathway=Number(e.target.value);pathwayPanel();icons();}if(e.target.matches('[data-sp-case-view]'))knowledge.querySelector('[data-sp-case-text]').textContent=data.versions[state.lang].assessment.views[Number(e.target.value)];if(e.target.matches('[data-sp-assumption]')){const i=Number(e.target.dataset.spAssumption),bits=state.scenario.split('');bits[i]=e.target.checked?'1':'0';state.scenario=bits.join('');knowledge.querySelector('[data-sp-effect]').textContent=data.versions[state.lang].knowledge.issues[i].effects[e.target.checked?0:1];labels();save(false);}});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!knowledge.open){stop();drawer(null);}const a=e.target.closest('[data-sp-stage]');if(a&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();stop();select(e.key==='Home'?0:e.key==='End'?stageCount-1:(Number(a.dataset.spStage)+(e.key==='ArrowLeft'?-1:1)+stageCount)%stageCount);document.querySelector('.sp-timeline [data-sp-stage="'+state.stage+'"]').focus();}});
 addEventListener('popstate',e=>{stop();cancelDocument();const s=e.state;if(s){for(const key of Object.keys(data.state))state[key]=s[key];view=s.view||'story';zoneOpen=!!s.zoneOpen;documentURL=s.documentURL||null;}else{const q=new URLSearchParams(location.search);Object.assign(state,data.state);for(const key of ['lang','perspective','room','scenario'])if(q.has(key))state[key]=q.get(key);state.stage=Math.max(0,Math.min(stageCount-1,Number(q.get('stage'))||0));state.zone=Number(q.get('zone'))||0;view='story';zoneOpen=q.get('topic')==='1';}
  if(!data.versions[state.lang])state.lang='en';if(!data.roomIds.includes(state.room)&&state.room!=='world')state.room=data.roomsByStage[state.stage];render();if(view==='document'&&documentURL)documentView(documentURL,false);
 });
 // Preserve the existing contact endpoint and truthful mail-service response semantics.
 document.addEventListener('submit',async e=>{
  if(e.target.id!=='contactForm')return;e.preventDefault();const form=e.target,button=form.querySelector('[type=submit]'),success=form.querySelector('#formSuccess')||reader.querySelector('#formSuccess'),error=form.querySelector('#formError')||reader.querySelector('#formError');
  if(success)success.style.display='none';if(error)error.style.display='none';button.disabled=true;
  try{const r=await fetch('/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form)))}),j=await r.json();if(!r.ok||!j.success)throw Error(j.error||'Delivery could not be confirmed.');if(success){success.textContent={en:'Your message was accepted by our mail service.',de:'Deine Nachricht wurde von unserem E-Mail-Dienst angenommen.',hi:'हमारी ईमेल सेवा ने आपका संदेश स्वीकार कर लिया है।'}[state.lang];success.style.display='block';}form.reset();}catch{if(error){error.textContent={en:'Delivery could not be confirmed. Please email info@swedu.info.',de:'Die Zustellung konnte nicht bestätigt werden. Bitte schreibe an info@swedu.info.',hi:'संदेश की डिलीवरी की पुष्टि नहीं हुई। कृपया info@swedu.info पर लिखें।'}[state.lang];error.style.display='block';}}finally{button.disabled=false;}
 });
 const initialDocument=data.initialDocument,initialHash=location.hash;
 for(const src of ['/images/academy-room.jpg','/images/world-environments.jpg']){const image=new Image();image.src=src;}
 document.querySelectorAll('[data-sp-drawer]').forEach(b=>{b.setAttribute('aria-controls','sp-'+b.dataset.spDrawer);b.setAttribute('aria-expanded','false');});
 render();history.replaceState({...state,view,zoneOpen,documentURL},'',location.href);
 if(initialHash&&initialHash!=='#hero')documentView('/'+initialHash,false);
 if(initialDocument)documentView(initialDocument,false);
})();
