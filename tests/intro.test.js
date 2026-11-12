const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const script = fs.readFileSync(require.resolve('../public/js/main.js'),'utf8').split('// NAV mobile toggle')[0];
async function intro({search='',hash='',seen=false,reduced=false,blocked=false,storageDenied=false,mission=false}={}) {
  const events = new Map();
  const element = id => ({id,hidden:true,inert:false,style:{},children:[],appendChild(child){this.children.push(child);},classList:{add(){}},setAttribute(){},focus(){doc.activeElement=this;},addEventListener(type,fn){events.set(`${id}:${type}`,fn);}});
  const overlay=element('introOverlay'),video=element('introVideo'),skip=element('skipBtn'),main=element('main');
  overlay.dataset=mission?{missionSrc:'/media/swe-mission-en.mp4',missionLabel:'Play mission film (English)'}:{};
  video.load=()=>{};video.removeAttribute=()=>{};
  let plays=0,paused=true,stored=seen?'1':null,hint;
  video.play=async()=>{plays++;if(blocked)throw Error('Autoplay blocked');paused=false;};
  video.pause=()=>{paused=true;};
  overlay.appendChild=el=>{hint=el;};
  overlay.querySelectorAll=()=>hint?[skip,hint]:[skip];
  const doc={body:{children:[overlay,main],style:{}},activeElement:null,querySelector:()=>main,
    getElementById:id=>({introOverlay:overlay,introVideo:video,skipBtn:skip,playHint:hint}[id]),
    createElement:()=>({...element('hint'),remove(){hint=null;}})};
  doc.activeElement=doc.body;
  vm.runInNewContext(script,{document:doc,window:{location:{search,hash},matchMedia:()=>({matches:reduced})},URLSearchParams,
    sessionStorage:{getItem(){if(storageDenied)throw Error();return stored;},setItem(k,v){if(storageDenied)throw Error();stored=v;},removeItem(){stored=null;}},setTimeout:()=>1,clearTimeout(){}});
  await Promise.resolve();await Promise.resolve();
  return {overlay,video,main,doc,events,get plays(){return plays;},get paused(){return paused;},get seen(){return stored;},get hint(){return hint;}};
}
test('intro plays muted on first visit and dismissal restores access and remembers session',async()=>{
  const x=await intro();assert.equal(x.plays,1);assert.equal(x.overlay.hidden,false);assert.equal(x.video.muted,true);assert.equal(x.main.inert,true);
  x.events.get('skipBtn:click')();assert.equal(x.overlay.hidden,true);assert.equal(x.paused,true);assert.equal(x.seen,'1');assert.equal(x.main.inert,false);
});
test('return visits, deep links, reduced motion and explicit skip do not autoplay',async()=>{
  for(const opts of [{seen:true},{hash:'#contact'},{reduced:true},{search:'?skipIntro=1'},{search:'?intro=1&skipIntro=1'}]){
    const x=await intro(opts);assert.equal(x.plays,0);assert.equal(x.overlay.hidden,true);
  }
});
test('explicit replay overrides seen state but reduced motion waits for user playback',async()=>{
  assert.equal((await intro({search:'?intro=1',seen:true})).plays,1);
  const x=await intro({search:'?intro=1',reduced:true});assert.equal(x.plays,0);assert.ok(x.hint);assert.equal(x.overlay.hidden,false);
  await x.events.get('hint:click')();assert.equal(x.plays,1);
});
test('autoplay denial leaves a manual control and Escape always dismisses',async()=>{
  const x=await intro({blocked:true});assert.ok(x.hint);
  x.events.get('introOverlay:keydown')({key:'Escape'});assert.equal(x.overlay.hidden,true);assert.equal(x.main.inert,false);
});
test('video ending, media error and unavailable storage cannot trap the visitor',async()=>{
  for(const event of ['ended','error']){
    const x=await intro({storageDenied:true});x.events.get('introVideo:'+event)();assert.equal(x.overlay.hidden,true);
  }
});
test('keyboard focus cycles within intro and returns to the page',async()=>{
  const x=await intro({blocked:true});let prevented=false;
  x.events.get('introOverlay:keydown')({key:'Tab',shiftKey:true,preventDefault(){prevented=true;}});
  assert.ok(prevented);assert.equal(x.doc.activeElement,x.hint);
  x.events.get('introOverlay:keydown')({key:'Escape'});assert.equal(x.doc.activeElement,x.main);
});
test('opener returns to the page without loading or starting the mission',async()=>{
  const x=await intro({mission:true});
  x.events.get('introVideo:ended')();
  assert.equal(x.overlay.hidden,true);assert.equal(x.main.inert,false);
  assert.equal(x.video.src,undefined);assert.equal(x.plays,1);assert.ok(!x.hint);
});
test('mission is skippable and media errors restore the journey',async()=>{
  for(const event of ['skipBtn:click','introVideo:error','introOverlay:keydown']){
    const x=await intro({mission:true});x.events.get('skipBtn:click')();
    x.events.get(event)({key:'Escape'});assert.equal(x.overlay.hidden,true);assert.equal(x.main.inert,false);
  }
});
test('return visits and reduced motion do not force the mission',async()=>{
  for(const opts of [{seen:true},{reduced:true},{search:'?skipIntro=1'}]){
    const x=await intro({...opts,mission:true});assert.equal(x.plays,0);assert.equal(x.video.src,undefined);
  }
});
