// Smart World Education — swedu.me

// VIDEO INTRO
const overlay = document.getElementById('introOverlay');
const video = document.getElementById('introVideo');
const skipBtn = document.getElementById('skipBtn');
const forceIntro = new URLSearchParams(window.location.search).get('intro') === '1';
let introSeen = false;
try { introSeen = sessionStorage.getItem('introSeen') === '1'; } catch { /* Storage can be unavailable in private contexts. */ }
const skipIntro = (!forceIntro && document.body.classList.contains('capability-home'))
  || new URLSearchParams(window.location.search).get('skipIntro') === '1'
  || (!forceIntro && (introSeen || Boolean(window.location.hash) || window.matchMedia('(prefers-reduced-motion: reduce)').matches));

if (forceIntro) {
  try { sessionStorage.removeItem('introSeen'); } catch { /* The intro can run without persistence. */ }
}

function dismissIntro() {
  if (!overlay) return;
  video?.pause();
  overlay.classList.add('fade-out');
  setTimeout(() => { overlay.style.display = 'none'; }, 800);
  try { sessionStorage.setItem('introSeen', '1'); } catch { /* Dismissing the overlay must still work. */ }
}

if (overlay) {
  if (forceIntro) overlay.hidden = false;
  if (skipIntro) {
    overlay.style.display = 'none';
  } else {
    let fallbackTimer;
    let playHintTimer;

    function showPlayHint() {
      if (document.getElementById('playHint')) return;

      const playHint = document.createElement('button');
      playHint.id = 'playHint';
      playHint.type = 'button';
      playHint.innerHTML = '<strong>Play Intro</strong><span>Tap to start the video</span>';
      overlay.appendChild(playHint);
      playHint.addEventListener('click', async () => {
        try {
          await video.play();
          playHint.remove();
          clearTimeout(playHintTimer);
          fallbackTimer = setTimeout(dismissIntro, 15000);
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
        clearTimeout(playHintTimer);
        fallbackTimer = setTimeout(dismissIntro, 15000);
      } catch {
        showPlayHint();
      }
    }

    skipBtn.addEventListener('click', dismissIntro);
    video.addEventListener('playing', () => clearTimeout(playHintTimer));
    video.addEventListener('ended', () => {
      clearTimeout(fallbackTimer);
      dismissIntro();
    });
    video.addEventListener('error', showPlayHint);
    playHintTimer = setTimeout(() => {
      if (video.paused || video.readyState < 2) showPlayHint();
    }, 1200);
    startIntroVideo();
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
    btn.querySelector('.btn-text').textContent = 'Sending...';

    try {
      const data = Object.fromEntries(new FormData(form));
      const res = await fetch('/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (res.ok && json.success) {
        success.textContent = 'Your message was accepted by our mail service. Thank you.';
        success.style.display = 'block';
        form.reset();
      } else {
        error.textContent = json.error || 'We could not send your message. Please email info@swedu.info.';
        error.style.display = 'block';
      }
    } catch {
      error.textContent = 'We could not confirm delivery. Please try again later or email info@swedu.info.';
      error.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.querySelector('.btn-text').textContent = 'Send Message';
    }
  });
}
