const data=require('./catalogue');
const languages=['en','de','hi'];
const language=value=>languages.includes(value)?value:'en';
const sweContext=value=>data.products.find(p=>p.portfolio==='SWE' && p.id===value)?.id || null;
const origins={SWE:'https://swedu.me',SWEX:'https://www.swex.ai'};
function programmeUrl(id,{lang='en',from,absolute=false}={}){
  const p=data.products.find(p=>p.id===id);if(!p) throw Error('Unknown programme');
  const query=new URLSearchParams({lang:language(lang)});
  const context=sweContext(from);if(context && p.portfolio==='SWEX') query.set('from',context);
  return `${absolute?origins[p.portfolio]:''}/education/${p.id}?${query}`;
}
const categories=[
  {id:'sessions',name:'Topic Sessions',kind:'topic-session'},
  {id:'labs',name:'Learning Labs',kind:'applied-lab'},
  {id:'bootcamps',name:'Specialist Bootcamps',kind:'specialist-bootcamp'},
  {id:'architecture',name:'Systems Architecture Programme',kind:'standalone-programme'},
  {id:'security',name:'Cybersecurity & Cyber Resilience',modules:['cybersecurity','resilience']},
  {id:'governance',name:'Governance & Law',modules:['governance','law']},
  {id:'sdgs',name:'AI for SDGs',modules:['sdgs']},
  {id:'partners',name:'Specialist Partner Add-ons',partner:true}
];
function categoryProducts(id){
  const c=categories.find(c=>c.id===id);
  const products=data.products.filter(p=>p.portfolio==='SWEX');
  if(!c) return products;
  if(c.partner) return [];
  return products.filter(p=>c.kind?p.kind===c.kind:p.kind==='topic-session' && p.moduleIds.some(id=>c.modules.includes(id)));
}
module.exports={language,sweContext,origins,programmeUrl,categories,categoryProducts};
