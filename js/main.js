// ============================================================
// MMR Portfolio — shared behavior
// ============================================================

/* ---------- Theme toggle (init happens inline in <head> to avoid
   a flash of the wrong theme — this just wires up the button) ---------- */
(function(){
  const btn = document.querySelector('#theme-toggle');
  if(!btn) return;
  btn.addEventListener('click', () => {
    const root = document.documentElement;
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try{ localStorage.setItem('mmr-theme', next); }catch(e){}
  });
})();

/* ---------- Nav: condense on scroll ---------- */
(function(){
  const nav = document.querySelector('.nav');
  if(!nav) return;
  const onScroll = () => {
    if(window.scrollY > 24) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if(toggle && links){
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open-mobile');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
})();

/* ---------- View Transitions between pages ---------- */
(function(){
  const supportsVT = 'startViewTransition' in document;
  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    // only intercept same-origin internal page links, not anchors/external
    const href = link.getAttribute('href');
    if(!href || href.startsWith('http') || link.target === '_blank') return;
    link.addEventListener('click', (e) => {
      if(!supportsVT) return; // graceful fallback: normal navigation
      if(e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      document.startViewTransition(() => {
        window.location.href = href;
      });
    });
  });
})();

/* ---------- Scroll reveal (Intersection Observer, animate once) ---------- */
(function(){
  const items = document.querySelectorAll('.reveal');
  if(!items.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  items.forEach(el => io.observe(el));
})();

/* ---------- Skill bars / progress fills (animate once on view) ---------- */
(function(){
  const fills = document.querySelectorAll('[data-fill]');
  if(!fills.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const el = entry.target;
        const pct = el.getAttribute('data-fill');
        requestAnimationFrame(() => { el.style.width = pct + '%'; });
        io.unobserve(el);
      }
    });
  }, { threshold: 0.3 });
  fills.forEach(el => io.observe(el));
})();

/* ---------- Hero dashboard bars (one orchestrated load animation) ---------- */
(function(){
  const panel = document.querySelector('.hero-panel');
  if(!panel) return;
  const bars = panel.querySelectorAll('.bar');
  const heights = [38, 62, 45, 88, 55, 70];
  window.requestAnimationFrame(() => {
    setTimeout(() => {
      bars.forEach((bar, i) => { bar.style.height = (heights[i % heights.length]) + '%'; });
    }, 450);
  });
})();

/* ---------- Case study expand (Projects page) ---------- */
(function(){
  const cards = document.querySelectorAll('.case-study');
  cards.forEach(card => {
    const trigger = card.querySelector('.case-study-top');
    if(!trigger) return;
    trigger.addEventListener('click', () => {
      const wasOpen = card.classList.contains('open');
      cards.forEach(c => c.classList.remove('open'));
      if(!wasOpen) card.classList.add('open');
    });
  });
})();

/* ---------- Contact form validation ---------- */
(function(){
  const form = document.querySelector('#contact-form');
  if(!form) return;
  const status = form.querySelector('.form-status');

  const validators = {
    name: v => v.trim().length > 1,
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    service: v => v.trim().length > 0,
    message: v => v.trim().length > 8,
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    Object.keys(validators).forEach(name => {
      const field = form.elements[name];
      if(!field) return;
      const row = field.closest('.form-row');
      const ok = validators[name](field.value || '');
      row.classList.toggle('invalid', !ok);
      if(!ok) valid = false;
    });

    if(!valid){
      status.textContent = '';
      status.classList.remove('show');
      return;
    }

    const name = encodeURIComponent(form.elements['name'].value);
    const email = encodeURIComponent(form.elements['email'].value);
    const service = encodeURIComponent(form.elements['service'].value);
    const message = encodeURIComponent(form.elements['message'].value);
    const subject = encodeURIComponent(`Project inquiry from ${form.elements['name'].value}`);
    const body = `Name: ${decodeURIComponent(name)}%0AEmail: ${decodeURIComponent(email)}%0AService interest: ${decodeURIComponent(service)}%0A%0A${decodeURIComponent(message)}`;

    // No backend wired up — falls back to opening the user's mail client
    // with the message pre-filled. Swap this for a form service
    // (e.g. Formspree) endpoint + fetch() if server-side handling is added.
    window.location.href = `mailto:chmuzaffarrahman@gmail.com?subject=${subject}&body=${body}`;

    status.textContent = "Opening your email client with this message pre-filled…";
    status.classList.add('show');
  });
})();
