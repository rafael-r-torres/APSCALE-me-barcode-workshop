/* Workshop Site JS */

document.addEventListener('DOMContentLoaded', () => {
  initCopyButtons();
  initScrollSpy();
  initVideoPlaceholders();
  setActivePage();
});

/* ── Copy buttons ── */
function initCopyButtons() {
  document.querySelectorAll('.code-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const codeEl = btn.closest('.code-block').querySelector('pre');
      const text = codeEl.innerText;
      navigator.clipboard.writeText(text).then(() => {
        const orig = btn.textContent;
        btn.textContent = '✓ Copied';
        btn.style.color = '#2ea043';
        setTimeout(() => {
          btn.textContent = orig;
          btn.style.color = '';
        }, 1800);
      });
    });
  });
}

/* ── Sidebar scroll spy ── */
function initScrollSpy() {
  const links = document.querySelectorAll('.sidebar-nav a[href^="#"]');
  if (!links.length) return;

  const sections = [...links].map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.sidebar-nav a[href="#${entry.target.id}"]`);
        if (activeLink) activeLink.classList.add('active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  sections.forEach(s => observer.observe(s));
}

/* ── Video placeholders ── */
function initVideoPlaceholders() {
  document.querySelectorAll('.video-placeholder[data-src]').forEach(placeholder => {
    placeholder.addEventListener('click', () => {
      const src = placeholder.getAttribute('data-src');
      const container = placeholder.closest('.video-container');
      const iframe = document.createElement('iframe');
      iframe.className = 'video-real';
      iframe.src = src;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      container.innerHTML = '';
      container.appendChild(iframe);
    });
  });
}

/* ── Mark active nav link ── */
function setActivePage() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (path.endsWith(href) || (path === '/' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}
