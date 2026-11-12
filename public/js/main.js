// Smart World Education — swedu.me
const siteText = source => window.SWE_I18N?.t(source) || source;

// VIDEO INTRO
const overlay = document.getElementById('introOverlay');
const video = document.getElementById('introVideo');
const skipBtn = document.getElementById('skipBtn');
const forceIntro = new URLSearchParams(window.location.search).get('intro') === '1';
let introSeen = false;
try { introSeen = sessionStorage.getItem('introSeen') === '1'; } catch { /* Storage can be unavailable in private contexts. */ }
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const skipIntro = new URLSearchParams(window.location.search).get('skipIntro') === '1'
  || (!forceIntro && (introSeen || Boolean(window.location.hash) || reducedMotion));
let introClosed = false;
let fallbackTimer;
let playHintTimer;
let previousFocus;
let pageSiblings = [];

if (forceIntro) {
  try { sessionStorage.removeItem('introSeen'); } catch { /* The intro can run without persistence. */ }
}

function dismissIntro() {
  if (!overlay || introClosed) return;
  introClosed = true;
  clearTimeout(fallbackTimer);
  clearTimeout(playHintTimer);
  video?.pause();
  overlay.hidden = true;
  pageSiblings.forEach(([element, inert]) => { element.inert = inert; });
  document.body.style.overflow = '';
  if (previousFocus && previousFocus !== document.body) previousFocus.focus();
  else document.querySelector('.skip-content')?.focus({preventScroll:true});
  try { sessionStorage.setItem('introSeen', '1'); } catch { /* Dismissing the overlay must still work. */ }
}

if (overlay) {
  if (skipIntro) {
    overlay.hidden = true;
  } else {
    overlay.hidden = false;
    previousFocus = document.activeElement;
    pageSiblings = [...document.body.children].filter(el => el !== overlay && !['SCRIPT','STYLE'].includes(el.tagName)).map(el => [el, el.inert]);
    pageSiblings.forEach(([element]) => { element.inert = true; });
    document.body.style.overflow = 'hidden';
    skipBtn.focus({preventScroll:true});
    overlay.addEventListener('keydown', event => {
      if (event.key === 'Escape') dismissIntro();
      if (event.key === 'Tab') {
        const buttons = [...overlay.querySelectorAll('video[controls],button')];
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });

    function showPlayHint() {
      if (introClosed || document.getElementById('playHint')) return;

      const playHint = document.createElement('button');
      playHint.id = 'playHint';
      playHint.type = 'button';
      const hintTitle = document.createElement('strong');
      hintTitle.textContent = siteText('Play Intro');
      const hintHelp = document.createElement('span');
      hintHelp.textContent = siteText('Tap to start the video');
      playHint.appendChild(hintTitle);
      playHint.appendChild(hintHelp);
      overlay.appendChild(playHint);
      playHint.addEventListener('click', async () => {
        try {
          await video.play();
          if (introClosed) { video.pause(); return; }
          playHint.remove();
          clearTimeout(playHintTimer);
          fallbackTimer = setTimeout(dismissIntro, 120000);
        } catch {
          playHint.classList.add('is-blocked');
        }
      });
    }

    async function startIntroVideo() {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');

      try {
        await video.play();
        if (introClosed) { video.pause(); return; }
        clearTimeout(playHintTimer);
        // Retain an escape for a stalled brand opener.
        fallbackTimer = setTimeout(dismissIntro, 120000);
      } catch {
        showPlayHint();
      }
    }

    skipBtn.addEventListener('click', dismissIntro);
    video.addEventListener('playing', () => {
      clearTimeout(playHintTimer);
      const hint = document.getElementById('playHint');
      if (hint && document.activeElement === hint) skipBtn.focus({preventScroll:true});
      hint?.remove();
    });
    video.addEventListener('ended', () => {
      clearTimeout(fallbackTimer);
      dismissIntro();
    });
    video.addEventListener('error', dismissIntro);
    playHintTimer = setTimeout(() => {
      if (video.paused || video.readyState < 2) showPlayHint();
    }, 1200);
    // Explicit replay still respects reduced motion: the visitor starts playback.
    if (reducedMotion) showPlayHint();
    else startIntroVideo();
  }
}

// NAV mobile toggle
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');
if (navToggle && navMobile) {
  navMobile.classList.add('hidden');
  navToggle.addEventListener('click', () => {
    navMobile.classList.toggle('hidden');
  });
  navMobile.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navMobile.classList.add('hidden'));
  });
}

// NAV scroll effect
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (!nav) return;
  if (window.scrollY > 60) {
    nav.style.borderBottomColor = 'rgba(201,168,76,0.15)';
  } else {
    nav.style.borderBottomColor = 'rgba(255,255,255,0.08)';
  }
});

// Intersection Observer — fade in sections
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.field-card, .partner-card, .hub-step, .forwhom-item, .event, .credential-card, .topics-list span').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// Contact form
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const success = document.getElementById('formSuccess');
    const error = document.getElementById('formError');
    success.style.display = 'none';
    error.style.display = 'none';
    btn.disabled = true;
    btn.querySelector('.btn-text').textContent = siteText('Sending...');

    try {
      const data = Object.fromEntries(new FormData(form));
      const res = await fetch('/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (res.ok && json.success) {
        success.textContent = siteText('Your message was accepted by our mail service. Thank you.');
        success.style.display = 'block';
        form.reset();
      } else {
        error.textContent = siteText(json.error || 'We could not send your message. Please email info@swedu.info.');
        error.style.display = 'block';
      }
    } catch {
      error.textContent = siteText('We could not confirm delivery. Please try again later or email info@swedu.info.');
      error.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.querySelector('.btn-text').textContent = siteText('Send Message');
    }
  });
}
