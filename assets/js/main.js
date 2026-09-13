// Mokify — shared front-end behaviour (no build step, progressively enhanced)

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initPasswordToggles();
  initRoleSwitch();
  initRevealOnScroll();
  initTransparentHeader();
  initHeaderHeightVar();
});

// Keeps --header-h in sync with the real header height so the full-bleed
// hero photo lines up exactly behind the transparent header, with no gap
// (the header's rendered height shifts with content/webfont changes, so a
// hardcoded value drifts and leaves a sliver of the page background showing).
function initHeaderHeightVar() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const setHeaderHeightVar = () => {
    document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`);
  };

  setHeaderHeightVar();
  window.addEventListener('resize', setHeaderHeightVar);
  document.fonts?.ready.then(setHeaderHeightVar);
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

function initTransparentHeader() {
  const header = document.querySelector('.site-header--transparent');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
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
