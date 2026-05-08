// Smart World Education — swedu.me

// VIDEO INTRO
const overlay = document.getElementById('introOverlay');
const video = document.getElementById('introVideo');
const skipBtn = document.getElementById('skipBtn');

function dismissIntro() {
  if (!overlay) return;
  overlay.classList.add('fade-out');
  setTimeout(() => { overlay.style.display = 'none'; }, 800);
  sessionStorage.setItem('introSeen', '1');
}

if (overlay) {
  if (sessionStorage.getItem('introSeen')) {
    overlay.style.display = 'none';
  } else {
    // Force play with multiple fallbacks
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay failed — show click-to-play overlay
        const playHint = document.createElement('div');
        playHint.id = 'playHint';
        playHint.innerHTML = '<span>▶ Tap to play intro</span>';
        playHint.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#c9a84c;font-family:DM Mono,monospace;font-size:1rem;letter-spacing:0.15em;text-transform:uppercase;cursor:pointer;text-align:center;';
        overlay.appendChild(playHint);
        playHint.addEventListener('click', () => {
          video.play();
          playHint.remove();
        });
      });
    }

    skipBtn.addEventListener('click', dismissIntro);
    video.addEventListener('ended', dismissIntro);
    // Fallback dismiss after 15 seconds
    setTimeout(dismissIntro, 15000);
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

document.querySelectorAll('.field-card, .partner-card, .hub-step, .forwhom-item, .event').forEach(el => {
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
      if (json.success) {
        success.style.display = 'block';
        form.reset();
      } else {
        error.style.display = 'block';
      }
    } catch {
      error.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.querySelector('.btn-text').textContent = 'Send Message';
    }
  });
}
