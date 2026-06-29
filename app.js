/**
 * app.js
 * Metabarcoding Workshop — APSCALE · DADA2 · Kaggle
 *
 * Vanilla JS — no frameworks, no build step required.
 * Features:
 *   1. Navbar scroll behaviour (shadow + background change)
 *   2. Mobile hamburger menu toggle
 *   3. Active nav-link highlighting based on scroll position
 *   4. Smooth scroll for all anchor links
 *   5. Scroll-reveal animation (IntersectionObserver)
 *   6. ESV / OTU mode tab switcher (APSCALE section)
 *   7. R Pipeline main tab switcher (Overview / Bootstrap / Databases / Outputs)
 *   8. Bootstrap threshold slider — live verdict text
 */

'use strict';

/* ── 1. DOM Ready Helper ────────────────────────────────────── */
function ready(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(function () {

  /* ============================================================
     2. NAVBAR — scroll state
  ============================================================ */
  const navbar = document.getElementById('navbar');

  function updateNavbarScroll() {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateNavbarScroll, { passive: true });
  updateNavbarScroll(); // Run once on load


  /* ============================================================
     3. HAMBURGER MENU
  ============================================================ */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when a link inside it is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
      if (!navbar.contains(e.target)) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }


  /* ============================================================
     4. ACTIVE NAV LINK — highlight current section
  ============================================================ */
  const sections   = document.querySelectorAll('section[id]');
  const navLinkEls = document.querySelectorAll('.nav-link[data-section]');

  function updateActiveLink() {
    let currentSection = '';
    const scrollMid = window.scrollY + window.innerHeight / 3;

    sections.forEach(function (section) {
      if (section.offsetTop <= scrollMid) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinkEls.forEach(function (link) {
      const isActive = link.dataset.section === currentSection;
      link.classList.toggle('active', isActive);
      link.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();


  /* ============================================================
     5. SMOOTH SCROLL for all internal anchor links
        (Handles cases where CSS scroll-behavior may not suffice,
         e.g. links with scroll-padding offsets or older Safari)
  ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = anchor.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);

      if (target) {
        e.preventDefault();
        const navHeight = navbar ? navbar.offsetHeight : 0;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;

        window.scrollTo({
          top:      targetTop,
          behavior: 'smooth',
        });
      }
    });
  });


  /* ============================================================
     6. SCROLL-REVEAL ANIMATION (IntersectionObserver)
        Adds .reveal class to qualifying elements, then triggers
        .visible when they enter the viewport.
  ============================================================ */
  const revealSelectors = [
    '.pipeline-card',
    '.step-card',
    '.db-card',
    '.kaggle-feature',
    '.output-item',
    '.checklist-item',
    '.info-card',
    '.folder-section',
    '.cli-showcase',
    '.checklist-card',
  ];

  const revealElements = document.querySelectorAll(revealSelectors.join(', '));

  revealElements.forEach(function (el, index) {
    el.classList.add('reveal');
    // Stagger animation delay for sibling elements
    el.style.transitionDelay = (index % 4) * 60 + 'ms';
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Animate only once
          }
        });
      },
      {
        threshold:  0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach(function (el) { observer.observe(el); });
  } else {
    // Fallback: show all immediately for browsers without IntersectionObserver
    revealElements.forEach(function (el) { el.classList.add('visible'); });
  }


  /* ============================================================
     7. ESV / OTU MODE TAB SWITCHER (APSCALE section)
  ============================================================ */
  /**
   * Generic tab switcher factory.
   * @param {string} tabSelector   - CSS selector for tab buttons
   * @param {string} panelSelector - CSS selector for tab panels
   * @param {string} activeTabClass
   * @param {string} hiddenPanelClass
   * @param {string} dataAttr      - data attribute on tab button pointing to panel id
   */
  function initTabSwitcher(tabSelector, panelSelector, activeTabClass, hiddenPanelClass, dataAttr) {
    const tabs   = document.querySelectorAll(tabSelector);
    const panels = document.querySelectorAll(panelSelector);

    if (!tabs.length || !panels.length) return;

    function activateTab(targetId) {
      tabs.forEach(function (tab) {
        const isActive = tab.dataset[dataAttr] === targetId;
        tab.classList.toggle(activeTabClass, isActive);
        tab.setAttribute('aria-selected', String(isActive));
      });

      panels.forEach(function (panel) {
        const isActive = panel.id === targetId;
        panel.classList.toggle(hiddenPanelClass, !isActive);
        panel.setAttribute('aria-hidden', String(!isActive));
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        activateTab(tab.dataset[dataAttr]);
      });

      // Keyboard navigation: arrow keys move between tabs
      tab.addEventListener('keydown', function (e) {
        const tabArray = Array.from(tabs);
        const idx      = tabArray.indexOf(tab);
        let nextIdx;

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          nextIdx = (idx + 1) % tabArray.length;
          e.preventDefault();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          nextIdx = (idx - 1 + tabArray.length) % tabArray.length;
          e.preventDefault();
        } else {
          return;
        }

        tabArray[nextIdx].focus();
        activateTab(tabArray[nextIdx].dataset[dataAttr]);
      });
    });
  }

  // ESV / OTU switcher in APSCALE card
  initTabSwitcher(
    '.mode-tab',
    '.mode-panel',
    'mode-tab-active',
    'mode-panel-hidden',
    'target'  // reads data-target attribute
  );

  // R Pipeline main tab switcher
  initTabSwitcher(
    '.main-tab',
    '.r-panel',
    'main-tab-active',
    'r-panel-hidden',
    'rtab'  // reads data-rtab attribute
  );


  /* ============================================================
     8. BOOTSTRAP THRESHOLD SLIDER — live verdict text
  ============================================================ */
  const slider       = document.getElementById('bootstrap-slider');
  const valueDisplay = document.getElementById('bootstrap-value');
  const verdictBox   = document.getElementById('bootstrap-verdict');
  const verdictText  = document.getElementById('verdict-text');

  /**
   * Verdict config per threshold range.
   * icon: emoji to display
   * text: description shown to users
   * color: CSS border/background colour key (matches --clr-* vars)
   */
  const verdicts = [
    {
      max:   40,
      icon:  '⚠️',
      text:  'Very sensitive — high risk of spurious assignments. Use only for exploratory analysis with novel, uncharacterised taxa.',
      bg:    'rgba(245,158,11,0.07)',
      border:'rgba(245,158,11,0.2)',
    },
    {
      max:   65,
      icon:  '🔍',
      text:  'Moderately sensitive. Useful for comparing community-level patterns but not recommended for species-level publication.',
      bg:    'rgba(245,158,11,0.07)',
      border:'rgba(245,158,11,0.15)',
    },
    {
      max:   85,
      icon:  '✅',
      text:  'Recommended for most datasets. Good balance of sensitivity and specificity. The DADA2 default (80) falls here.',
      bg:    'rgba(34,197,94,0.07)',
      border:'rgba(34,197,94,0.15)',
    },
    {
      max:   95,
      icon:  '🔒',
      text:  'Conservative — suitable for peer-reviewed publication or datasets with large, curated reference databases.',
      bg:    'rgba(0,212,255,0.07)',
      border:'rgba(0,212,255,0.15)',
    },
    {
      max:  100,
      icon:  '🔬',
      text:  'Very conservative — many sequences will only be classified to family or order. Only use when false-positive cost is high.',
      bg:    'rgba(124,110,245,0.07)',
      border:'rgba(124,110,245,0.15)',
    },
  ];

  function getVerdict(value) {
    return verdicts.find(function (v) { return value <= v.max; }) || verdicts[verdicts.length - 1];
  }

  function updateSlider() {
    if (!slider) return;
    const value   = parseInt(slider.value, 10);
    const verdict = getVerdict(value);

    if (valueDisplay) valueDisplay.textContent = value;

    if (verdictBox && verdictText) {
      const icon     = verdictBox.querySelector('.verdict-icon');
      if (icon)        icon.textContent = verdict.icon;
      verdictText.textContent = verdict.text;
      verdictBox.style.background   = verdict.bg;
      verdictBox.style.borderColor  = verdict.border;
    }

    // Update aria value for screen readers
    slider.setAttribute('aria-valuenow', value);
    slider.setAttribute('aria-valuetext', `Bootstrap threshold: ${value}. ${verdict.text}`);
  }

  if (slider) {
    slider.addEventListener('input', updateSlider);
    updateSlider(); // Set initial state
  }


  /* ============================================================
     9. HERO — parallax-lite on scroll (subtle depth effect)
  ============================================================ */
  const heroOrbs = document.querySelectorAll('.hero .orb');

  if (heroOrbs.length) {
    window.addEventListener('scroll', function () {
      const y = window.scrollY;
      heroOrbs.forEach(function (orb, i) {
        const speed = 0.04 + i * 0.02;
        orb.style.transform = `translateY(${y * speed}px)`;
      });
    }, { passive: true });
  }


  /* ============================================================
     10. CURRENT YEAR in footer (if element exists)
  ============================================================ */
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

});
