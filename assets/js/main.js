// Mokify — shared front-end behaviour (no build step, progressively enhanced)

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initPasswordToggles();
  initRoleSwitch();
  initRevealOnScroll();
  initHeaderShadow();
  initScrolly();
});

function initScrolly() {
  const root = document.getElementById('scrolly');
  if (!root || !('IntersectionObserver' in window)) return;

  const steps = Array.from(root.querySelectorAll('.scrolly-step'));
  const scenes = Array.from(root.querySelectorAll('.scrolly-scene'));
  const dots = Array.from(root.querySelectorAll('.scrolly-progress .dot'));
  const symbolIds = ['scene-login', 'scene-match', 'scene-learn'];
  if (!steps.length) return;

  const setActive = (index) => {
    steps.forEach((el, i) => el.classList.toggle('is-active', i === index));
    scenes.forEach((el, i) => el.classList.toggle('is-active', i === index));
    dots.forEach((el, i) => el.classList.toggle('is-active', i === index));
    // Accent strokes live inside <symbol> defs, which IntersectionObserver
    // can never see directly (no layout of their own) — draw them in here,
    // the moment their scene becomes active, instead.
    const symbol = document.getElementById(symbolIds[index]);
    symbol?.querySelectorAll('.draw-in-path').forEach((el) => el.classList.add('is-visible'));
  };

  setActive(0);

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActive(Number(entry.target.dataset.step));
        }
      });
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  );

  steps.forEach((el) => io.observe(el));
}

function initHeaderShadow() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.mobile-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
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

function initRevealOnScroll() {
  const targets = document.querySelectorAll('[data-reveal], [data-reveal-draw]');
  if (!targets.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => io.observe(el));
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
