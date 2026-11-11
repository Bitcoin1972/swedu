(() => {
  const dataElement = document.getElementById('site-i18n-data');
  if (!dataElement) return;
  const data = JSON.parse(dataElement.textContent);
  const selector = document.getElementById('site-language');
  const translate = source => data.dictionaries[data.lang]?.[source] || source;
  window.SWE_I18N = {t:translate};
  selector.closest('form').querySelector('button').hidden = true;
  function setLanguage(lang) {
    if (!Object.hasOwn(data.dictionaries,lang)) return;
    const candidates = [...document.querySelectorAll('main [data-swe-i18n]')].filter(el=>!el.closest('[hidden]') && el.getBoundingClientRect().height>0);
    const anchor = candidates.find(el=>el.getBoundingClientRect().bottom>180);
    const rect = anchor?.getBoundingClientRect();
    const offset = rect ? (180-rect.top)/rect.height : 0;
    const insideIntroduction = document.querySelector('#approved-introduction');
    const readingIntroduction = insideIntroduction && insideIntroduction.getBoundingClientRect().top<180 && insideIntroduction.getBoundingClientRect().bottom>180;
    data.lang = lang;
    document.documentElement.lang = lang;
    for (const record of data.records) {
      const element = document.querySelector(`[data-swe-i18n="${record.id}"]`);
      if (!element) continue;
      for (const v of record.values) {
        if (v.attr) element.setAttribute(v.attr,translate(v.source));
        else if (element.childNodes[v.index]?.nodeType === Node.TEXT_NODE) element.childNodes[v.index].textContent = v.prefix + translate(v.source) + v.suffix;
      }
    }
    selector.value = lang;
    selector.closest('form').querySelector('label').textContent = data.labels[lang];
    const notice=document.querySelector('.site-translation-notice');
    if(notice)notice.textContent=data.notices[lang];
    const url = new URL(location.href);
    url.searchParams.set('lang',lang);
    url.searchParams.delete('introLang');
    history.replaceState({},'',url);
    document.dispatchEvent(new CustomEvent('swe:language-change',{detail:{language:lang,preservePosition:readingIntroduction}}));
    document.querySelectorAll('a[href]').forEach(link=>{
      const u=new URL(link.href,location.href);
      if(u.origin===location.origin && !/\.(?:jpg|jpeg|png|svg|webp|mp4|css|js|pdf)$/i.test(u.pathname)) {
        u.searchParams.set('lang',lang);link.href=u.pathname+u.search+u.hash;
      }
    });
    document.querySelectorAll('input[name="lang"]').forEach(input=>{input.value=lang;});
    if (!readingIntroduction && anchor) requestAnimationFrame(()=>{
      const next=anchor.getBoundingClientRect();
      window.scrollBy({top:next.top+offset*next.height-180,behavior:'instant'});
    });
  }
  selector.addEventListener('change',()=>setLanguage(selector.value));
  selector.closest('form').addEventListener('submit',event=>{event.preventDefault();setLanguage(selector.value);});
})();
