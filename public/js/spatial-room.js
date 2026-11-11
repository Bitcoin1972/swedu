import * as THREE from '/board-vendor/three.module.js';
const canvas=document.querySelector('.room-canvas');
if(canvas){
 try{
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(0,100,100,0,.1,500);camera.position.z=100;
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  const material=new THREE.MeshStandardMaterial({color:0xecc982,metalness:.8,roughness:.25});
  const marker=new THREE.Mesh(new THREE.TorusGeometry(3,.2,12,64),material);marker.scale.y=.55;scene.add(marker);
  scene.add(new THREE.HemisphereLight(0xffebbd,0x17415e,4));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(0,80,80);scene.add(light);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');let visible=true,last=performance.now(),check=true;
  const position=new THREE.Vector3(),target=new THREE.Vector3();
  function select(id){const el=document.querySelector(`[data-room-zone="${id}"]`);target.set(parseFloat(el.style.getPropertyValue('--x')),100-parseFloat(el.style.getPropertyValue('--y'))-8,2);check=true;}
  select(document.querySelector('[data-room-zone][aria-current="true"]')?.dataset.roomZone||'student');position.copy(target);
  document.addEventListener('swe:room-zone',e=>select(e.detail.zone));
  new ResizeObserver(()=>renderer.setSize(canvas.parentElement.clientWidth,canvas.parentElement.clientHeight,false)).observe(canvas.parentElement);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;}).observe(canvas.parentElement);
  function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.1);last=now;if(!visible||document.hidden)return;position.lerp(target,reduced.matches?1:1-Math.exp(-4*dt));marker.position.copy(position);if(!reduced.matches)marker.rotation.z+=dt*.12;renderer.render(scene,camera);
   if(check&&position.distanceTo(target)<.05){const gl=renderer.getContext(),pixels=new Uint8Array(canvas.width*canvas.height*4);gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);let lit=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i])lit++;canvas.dataset.litPixels=String(lit);check=false;}
  }
  requestAnimationFrame(frame);canvas.dataset.ready='true';canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();canvas.hidden=true;});
 }catch{canvas.hidden=true;}
}
