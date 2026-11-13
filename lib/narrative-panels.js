const content=require('../content/journey-panels');
const cases=require('../content/real-world-cases');
const knowledge=require('../content/world-knowledge');
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paragraphs=items=>items.map(p=>`<p>${escape(p)}</p>`).join('');
function sourceCard(lang){
 const c=content[lang],source=cases[0];
 const date=new Intl.DateTimeFormat({en:'en-GB',de:'de-DE',hi:'hi-IN'}[lang],{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(source.publishedOn));
 return `<section class="sp-source-card" data-case-id="${source.id}"><small>${escape(c.sourceLabel)} · <time datetime="${source.publishedOn}">${date}</time></small><button data-sp-assessment><strong>${escape(c.sourceTitle)}</strong><span lang="en">${escape(source.title)}</span><span>${source.publisher} · ${source.author}</span><span class="sp-source-action">${escape(c.openCase)} →</span></button><p>${escape(c.sourceSummary)}</p><nav><a href="${source.originalUrl}" target="_blank" rel="noopener">${escape(c.original)}</a><a href="${source.primaryUrl}" target="_blank" rel="noopener">${escape(c.primary)}</a></nav></section>`;
}
function story(stage,lang,title){const c=content[lang];return `<article class="sp-human-story"><small>${escape(c.storyLabel)}</small><h2>${escape(title)}</h2>${paragraphs(c.story[stage])}${stage?`<button data-sp-next>${escape(stage===8?c.gateway:require('./spatial-copy')[lang].next)} →</button>`:''}</article>`;}
function reality(stage,lang,room){
 const c=content[lang],p=room==='governance'?c.governance:c.reality[stage];
 return `<article class="sp-real-world"><small>${escape(c.realityLabel)}</small><h2>${escape(c.questions[stage])}</h2><p>${escape(p[0])}</p>${sourceCard(lang)}<h3>${escape(c.approach)}</h3><p>${escape(p[1])}</p><p class="sp-note">${escape(c.interpretation)}</p><div class="sp-dependencies"><h3>${escape(c.detail)}</h3>${knowledge[lang].issues.map((issue,i)=>`<button data-sp-knowledge="${i}">${escape(issue.title)} <span aria-hidden="true">↗</span></button>`).join('')}</div></article>`;
}
module.exports={story,reality,sourceCard,content,cases};
