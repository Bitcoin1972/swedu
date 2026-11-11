(() => {
 const source=document.getElementById('world-data');
 if(!source)return;
 const data=JSON.parse(source.textContent),state={...data.context};
 const selector=document.getElementById('world-perspective');
 const forms=[...document.querySelectorAll('.world-perspective-form')];
 const room=document.querySelector('.capability-room');
 let showRoomView=()=>{};
 const stateKeys=['stage','perspective','zone','scenario','lang','focus'];
 const roomURL=()=>{
  const url=new URL('/world/academy',location.origin);for(const key of stateKeys)url.searchParams.set(key,state[key]);return url.pathname+url.search;
 };
 function links(){
  document.querySelectorAll('[data-world-context]').forEach(a=>{
   const url=new URL(a.getAttribute('href'),location.href);
   if(url.origin!==location.origin)return;
   for(const key of stateKeys)url.searchParams.set(key,state[key]);
   a.href=url.pathname+url.search+url.hash;
  });
  document.querySelectorAll('[data-world-room]').forEach(a=>a.href=roomURL());
  document.querySelectorAll('.board-stations [data-board-select]').forEach(a=>{
   const stage=Number(a.dataset.boardSelect);
   if([2,3,4].includes(stage)){const url=new URL(roomURL(),location.origin);url.searchParams.set('stage',stage);url.searchParams.set('focus','academy');a.href=url.pathname+url.search;a.setAttribute('aria-label',a.textContent.trim()+' · Enter Academy room');}
  });
 }
 function save(){
  const url=new URL(location.href);for(const key of stateKeys)url.searchParams.set(key,state[key]);
  history.replaceState(null,'',url.pathname+url.search+url.hash);
  forms.forEach(f=>{for(const key of stateKeys){const input=f.elements.namedItem(key);if(input)input.value=String(state[key]);}});
  links();
 }
 function effects(){
  document.querySelectorAll('[data-world-effect]').forEach(el=>{
   const i=Number(el.dataset.worldEffect),enabled=state.scenario[i]==='1';
   el.querySelector('p').textContent=data.assumptions[i][enabled?'yes':'no'];
   el.classList.toggle('world-condition-missing',!enabled);
  });
  document.querySelectorAll('[data-world-assumption]').forEach(el=>el.checked=state.scenario[Number(el.dataset.worldAssumption)]==='1');
 }
 function render(){
  document.getElementById('world-story').innerHTML=data.stories[state.lang][state.focus];
  document.getElementById('world-lens').innerHTML=data.panels[state.focus][state.perspective];
  document.querySelectorAll('[data-world-focus]').forEach(a=>a.setAttribute('aria-current',String(a.dataset.worldFocus===state.focus)));
  selector.value=state.perspective;
  document.querySelectorAll('[data-world-stage-label]').forEach(el=>el.textContent=state.stage+1);
  effects();save();window.lucide?.createIcons();
 }
 selector.addEventListener('change',()=>{
  state.perspective=selector.value;
  document.dispatchEvent(new CustomEvent('swe:perspective-change',{detail:{perspective:state.perspective}}));
  render();
  if(room)showRoomView('perspective');
 });
 forms.forEach(f=>{f.addEventListener('submit',e=>e.preventDefault());f.querySelector('.world-apply').hidden=true;});
 document.addEventListener('swe:board-stage',e=>{
  if(state.stage!==e.detail.stage){state.stage=e.detail.stage;state.focus=data.stagePhases[state.stage];}
  render();
 });
 document.addEventListener('swe:language-change',e=>{if(data.stories[e.detail.language]){state.lang=e.detail.language;render();}});
 document.querySelectorAll('[data-world-assumption]').forEach(input=>input.addEventListener('change',()=>{
  const values=state.scenario.split('');values[Number(input.dataset.worldAssumption)]=input.checked?'1':'0';state.scenario=values.join('');effects();save();
 }));
 document.querySelectorAll('[data-world-focus]').forEach(a=>a.addEventListener('click',e=>{
  e.preventDefault();state.focus=a.dataset.worldFocus;render();if(room)showRoomView('perspective');
  document.getElementById('world-story').scrollIntoView({block:'nearest',behavior:'auto'});
 }));
 const reset=document.querySelector('[data-world-reset]');reset.hidden=false;reset.onclick=()=>{state.scenario='111';effects();save();};
 const present=document.querySelector('[data-world-present]');present.hidden=false;present.setAttribute('aria-pressed','false');
 present.onclick=()=>{const active=document.body.classList.toggle('world-presentation');present.setAttribute('aria-pressed',String(active));present.querySelector('span').textContent=active?'Exit presentation':'Presentation view';};
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('world-presentation'))present.click();});
 if(room){
  const information=document.querySelector('.room-information'),casePanel=document.querySelector('.room-case');
  const topic=document.createElement('div');topic.id='room-topic';topic.setAttribute('role','tabpanel');topic.setAttribute('aria-labelledby','room-tab-topic');
  [...information.children].forEach(el=>topic.append(el));information.append(topic);
  casePanel.setAttribute('role','tabpanel');casePanel.setAttribute('aria-labelledby','room-tab-perspective');information.append(casePanel);
  const tabs=document.createElement('div');tabs.className='room-view-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Room information');
  for(const [id,label]of [['topic','Learning zone'],['perspective','Your perspective']]){
   const button=document.createElement('button');button.type='button';button.id='room-tab-'+id;button.textContent=label;button.setAttribute('role','tab');button.setAttribute('aria-controls',id==='topic'?'room-topic':'room-case');button.addEventListener('click',()=>showRoomView(id));
   button.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?'topic':e.key==='End'?'perspective':id==='topic'?'perspective':'topic';showRoomView(next);document.getElementById('room-tab-'+next).focus();}});tabs.append(button);
  }
  information.prepend(tabs);
  showRoomView=id=>{topic.hidden=id!=='topic';casePanel.hidden=id!=='perspective';tabs.querySelectorAll('button').forEach(b=>{const selected=b.id==='room-tab-'+id;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;});};
  showRoomView('topic');
  const zones=[...document.querySelectorAll('[data-room-zone]')];
  function zone(id){
   state.zone=id;
   document.querySelectorAll('[data-room-panel]').forEach(el=>el.hidden=el.dataset.roomPanel!==id);
   zones.forEach(a=>a.setAttribute('aria-current',String(a.dataset.roomZone===id)));
   document.dispatchEvent(new CustomEvent('swe:room-zone',{detail:{zone:id}}));
   showRoomView('topic');
   save();
  }
  zones.forEach((a,i)=>{
   a.addEventListener('click',e=>{e.preventDefault();zone(a.dataset.roomZone);});
   a.addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?zones.length-1:(i+(e.key==='ArrowRight'?1:-1)+zones.length)%zones.length;zone(zones[next].dataset.roomZone);zones[next].focus();});
  });
  document.querySelector('[data-room-return]').onclick=e=>{e.preventDefault();zones.find(a=>a.dataset.roomZone===state.zone).focus();};
  zone(state.zone);
 }
 document.body.classList.add('world-ready');
 render();
})();
