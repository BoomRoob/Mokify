// Mokify — shared front-end behaviour (no build step, progressively enhanced)

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initPasswordToggles();
  initRoleSwitch();
  initSectionReveal();
  initTransparentHeader();
});

function initMobileNav() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.mobile-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    // Relax the header's full pill radius while the dropdown is open, so the
    // now-tall island reads as a rounded panel instead of a stretched capsule.
    header?.classList.toggle('nav-open', isOpen);
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      header?.classList.remove('nav-open');
    });
  });
}

function initPasswordToggles() {
  document.querySelectorAll('.password-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.password-field')?.querySelector('input');
      if (!input) return;
      const showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      btn.setAttribute('aria-pressed', String(!showing));
      btn.textContent = showing ? 'Rodyti' : 'Slėpti';
    });
  });
}

function initRoleSwitch() {
  document.querySelectorAll('.role-switch').forEach((group) => {
    const buttons = group.querySelectorAll('button');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.setAttribute('aria-selected', 'false'));
        btn.setAttribute('aria-selected', 'true');
        const event = new CustomEvent('role-change', { detail: btn.dataset.role });
        group.dispatchEvent(event);
      });
    });
  });
}

function initTransparentHeader() {
  const header = document.querySelector('.site-header--transparent');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// Only one <section> is ever "loaded" at a time: whichever one currently
// spans the vertical center of the viewport gets its reveal elements
// faded in: every other section's reveal elements fade out, even if
// they're still partly on screen. A section is tracked as "centered" via
// an IntersectionObserver whose root is collapsed to a 0-height line at
// the viewport's midpoint (rootMargin -50%/-50%): a section only
// intersects that line while it's the one straddling the center.
function initSectionReveal() {
  const allTargets = document.querySelectorAll('[data-reveal], [data-reveal-draw]');
  if (!allTargets.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced || !('IntersectionObserver' in window)) {
    allTargets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const sections = Array.from(document.querySelectorAll('main > section'));
  if (!sections.length) {
    // No <section> wrappers on this page (e.g. the 404 shell) — nothing to
    // center-track, so just reveal everything once.
    allTargets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const revealTargetsIn = (section) => section.querySelectorAll('[data-reveal], [data-reveal-draw]');

  const setActiveSection = (activeSection) => {
    sections.forEach((section) => {
      const isActive = section === activeSection;
      revealTargetsIn(section).forEach((el) => el.classList.toggle('is-visible', isActive));
    });
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveSection(entry.target);
      });
    },
    { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
  );

  sections.forEach((section) => io.observe(section));
}

// Front-end-only form handling for the auth shell (no backend yet).
function handleShellForm(form, redirectUrl) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    form.querySelectorAll('[required]').forEach((input) => {
      const field = input.closest('.field');
      if (!field) return;
      const ok = input.type === 'checkbox' ? input.checked : input.value.trim().length > 0;
      field.classList.toggle('has-error', !ok);
      if (!ok) valid = false;
    });

    if (!valid) {
      form.querySelector('.field.has-error input, .field.has-error select')?.focus();
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.originalText = submitBtn.textContent;
      submitBtn.textContent = 'Kraunama…';
    }

    window.setTimeout(() => {
      window.location.href = redirectUrl;
    }, 600);
  });
}
