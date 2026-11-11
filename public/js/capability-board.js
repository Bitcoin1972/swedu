import * as THREE from '/board-vendor/three.module.js';

const root=document.querySelector('.capability-board');
if(root){
 const data=JSON.parse(document.getElementById('board-data').textContent);
 let language=data.lang, active=0, timer=null, running=false;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const links=[...root.querySelectorAll('[data-board-select]')];
 const panels=[...root.querySelectorAll('[data-board-stage]')];
 const guide=root.querySelector('[data-board-guide]');
 const dialog=root.querySelector('dialog');
 let markerUpdate=()=>{};
 const label=s=>s[language]||s.title;
 function select(index,announce=true){
  active=(index+data.stages.length)%data.stages.length;
  panels.forEach((p,i)=>p.hidden=i!==active);
  links.forEach(a=>{const selected=Number(a.dataset.boardSelect)===active;a.setAttribute('aria-current',String(selected));});
  root.querySelector('#board-count').textContent=`${String(active+1).padStart(2,'0')} / 09`;
  root.querySelectorAll('[data-ecosystem]').forEach(e=>e.toggleAttribute('data-active',e.dataset.ecosystem===data.stages[active].ecosystem));
  if(announce)root.querySelector('.board-announcement').textContent=label(data.stages[active]);
  markerUpdate(active);
  document.dispatchEvent(new CustomEvent('swe:board-stage',{detail:{stage:active}}));
 }
 function stop(){clearTimeout(timer);timer=null;running=false;guide.querySelector('span').textContent=data.copy[language].guide;guide.setAttribute('aria-pressed','false');}
 function tick(){if(active===data.stages.length-1){stop();return;}select(active+1);timer=setTimeout(tick,9000);}
 function start(){running=true;guide.setAttribute('aria-pressed','true');guide.querySelector('span').textContent=data.copy[language].pause;if(active===data.stages.length-1)select(0);if(!reduced.matches)timer=setTimeout(tick,9000);}
 links.forEach(a=>{a.addEventListener('click',e=>{e.preventDefault();stop();select(Number(a.dataset.boardSelect));if(a.closest('.board-stations')&&[2,3,4].includes(active))location.assign(a.href);});a.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();stop();select(e.key==='Home'?0:e.key==='End'?8:Number(a.dataset.boardSelect)+(e.key==='ArrowRight'?1:-1));const group=a.closest('nav,ol');group.querySelector(`[data-board-select="${active}"]`).focus();});});
 root.querySelector('[data-board-prev]').onclick=()=>{stop();select(active-1);};
 root.querySelector('[data-board-next]').onclick=()=>{stop();select(active+1);};
 root.querySelector('.board-step-controls').hidden=false;
 guide.hidden=false;guide.onclick=()=>running?stop():start();
 const intro=root.querySelector('[data-board-intro]');intro.hidden=false;intro.onclick=()=>{stop();dialog.showModal();};
 root.querySelector('[data-board-explore]').onclick=()=>dialog.close();
 root.querySelector('[data-board-start]').onclick=()=>{dialog.close();start();};
 dialog.addEventListener('close',()=>{try{sessionStorage.setItem('sweBoardIntro','1');}catch{}guide.focus({preventScroll:true});});
 // Wait for the existing movie dialog to finish before introducing the board.
 const movie=document.getElementById('introOverlay');
 function welcome(){let seen=false;try{seen=sessionStorage.getItem('sweBoardIntro')==='1';}catch{}if(!seen&&!location.hash&&!movie?.matches(':not([hidden])')){dialog.showModal();return true;}return seen;}
 function prepareWelcome(){if(!welcome()&&movie){const observer=new MutationObserver(()=>{if(welcome())observer.disconnect();});observer.observe(movie,{attributes:true,attributeFilter:['hidden']});}}
 if(document.readyState==='complete')prepareWelcome();else document.addEventListener('DOMContentLoaded',prepareWelcome,{once:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 reduced.addEventListener('change',stop);
 document.addEventListener('swe:perspective-change',stop);
 document.addEventListener('swe:language-change',e=>{
  if(!data.copy[e.detail.language])return;language=e.detail.language;root.lang=language;root.querySelector('#board-title').textContent=data.copy[language].title;
  root.querySelectorAll('[data-board-copy]').forEach(el=>el.textContent=data.copy[language][el.dataset.boardCopy]);
  links.forEach(a=>a.querySelector('span').textContent=label(data.stages[Number(a.dataset.boardSelect)]));
  panels.forEach((p,i)=>{p.querySelector('h2').textContent=label(data.stages[i]);const text=data.stages[i].text[language];p.querySelector('p').textContent=text[0];p.querySelector('.board-capability').textContent=text[1];p.querySelector('.board-programme span').textContent=text[2];});
  stop();select(active,false);
 });
 select(data.initialStage||0,false);
 root.dataset.boardEnhanced='true';
 if(window.lucide)window.lucide.createIcons();
 // The raster landscape supplies architectural detail; Three.js supplies real depth,
 // lighting and the moving brass journey marker. Semantic links work without WebGL.
 try{
  const canvas=root.querySelector('canvas'),world=root.querySelector('.board-world');
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(0,100,100,0,.1,500);camera.position.set(0,0,200);
  scene.add(new THREE.HemisphereLight(0xffeed2,0x17314c,3));const sun=new THREE.DirectionalLight(0xffd79a,4);sun.position.set(-30,70,100);scene.add(sun);
  const material=new THREE.MeshStandardMaterial({color:0xffd47a,metalness:.8,roughness:.24,emissive:0xbc7624,emissiveIntensity:.3});
  const marker=new THREE.Mesh(new THREE.OctahedronGeometry(1.3),material);scene.add(marker);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(2,.16,12,64),material);ring.scale.y=.48;scene.add(ring);
  let target=new THREE.Vector3(),position=new THREE.Vector3(),last=performance.now(),visible=true,inspectPixels=true;
  markerUpdate=i=>{const s=data.stages[i];target.set(s.x,100-s.y-6,3);inspectPixels=true;if(reduced.matches)position.copy(target);};markerUpdate(active);position.copy(target);
  const size=()=>{renderer.setSize(world.clientWidth,world.clientHeight,false);};new ResizeObserver(size).observe(world);size();
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;}).observe(world);
  function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.1);last=now;if(!visible||document.hidden)return;position.lerp(target,reduced.matches?1:1-Math.exp(-dt*4));marker.position.copy(position);ring.position.copy(position);if(!reduced.matches){marker.rotation.y+=dt*.5;marker.rotation.z+=dt*.2;}renderer.render(scene,camera);
   if(inspectPixels&&position.distanceTo(target)<.05){
    // One readback per completed transition makes blank-canvas regressions observable.
    const gl=renderer.getContext(),pixels=new Uint8Array(canvas.width*canvas.height*4);gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
    let lit=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i])lit++;
    canvas.dataset.litPixels=String(lit);canvas.dataset.stage=String(active);inspectPixels=false;
   }
  }
  requestAnimationFrame(frame);canvas.dataset.ready='true';
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();canvas.hidden=true;});
 }catch{root.querySelector('canvas').hidden=true;}
}
