// ── GSAP GLOBAL CONFIG ──
if (typeof gsap !== 'undefined') {
  gsap.config({ nullTargetWarn: false, autoSleep: 60 });
  gsap.ticker.lagSmoothing(false);
}

// ── NAV: expandable sidebar ──
const navEl      = document.getElementById('nav');
const navToggle  = document.getElementById('navToggle');
const navLogoBtn = document.getElementById('navLogoBtn');
const navOverlay = document.getElementById('navOverlay');
const navLabel   = navToggle ? navToggle.querySelector('.nav__toggle-label') : null;

function openNav() {
  navEl.classList.add('nav--open');
  navOverlay.classList.add('active');
  if (navLabel) navLabel.textContent = 'CLOSE';
}

function closeNav() {
  navEl.classList.remove('nav--open');
  navOverlay.classList.remove('active');
  if (navLabel) navLabel.textContent = 'MENU';
}

if (navToggle) navToggle.addEventListener('click', () => {
  navEl.classList.contains('nav--open') ? closeNav() : openNav();
});

if (navLogoBtn) navLogoBtn.addEventListener('click', closeNav);

if (navOverlay) navOverlay.addEventListener('click', closeNav);

document.querySelectorAll('.nav__links a').forEach(a => a.addEventListener('click', closeNav));

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeNav();
});

// Active link on scroll — nav + right sidenav
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav__links a');
const rnavItems = document.querySelectorAll('.rnav__item[data-section]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 200) current = sec.getAttribute('id');
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
  rnavItems.forEach(a => {
    a.classList.toggle('active', a.getAttribute('data-section') === current);
  });
}, { passive: true });

// ── ABOUT PARALLAX ──
(function initAboutParallax() {
  const img = document.getElementById('aboutParallax');
  if (!img) return;

  // Disable on mobile — fixed bg causes iOS jank
  if (window.matchMedia('(max-width: 600px)').matches) return;

  let ticking = false;
  function updateParallax() {
    const wrap = img.parentElement;
    const rect = wrap.getBoundingClientRect();
    // Only run when strip is visible
    if (rect.bottom < 0 || rect.top > window.innerHeight) { ticking = false; return; }
    const progress = (rect.top / window.innerHeight);   // 1 = above viewport, -1 = below
    const shift = progress * 80;                         // ±80px travel
    img.style.transform = `translateY(${shift}px)`;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
  }, { passive: true });

  updateParallax();
}());

// ── SMOOTH SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 20;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ── HERO CANVAS — grid nodes + floating connectors ──
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx     = canvas.getContext('2d');
  const GRID_PX = 60;
  const FLOAT_N = 16;
  const MAX_DIST = 105;

  let gridNodes  = [];
  let floatNodes = [];

  function resizeCanvas() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    buildGrid();
  }

  function buildGrid() {
    gridNodes = [];
    const cols = Math.ceil(canvas.width  / GRID_PX);
    const rows = Math.ceil(canvas.height / GRID_PX);
    for (let c = 0; c <= cols; c++) {
      for (let r = 0; r <= rows; r++) {
        gridNodes.push({ x: c * GRID_PX, y: r * GRID_PX });
      }
    }
  }

  function makeFloatNode() {
    return {
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.38,
      vy: (Math.random() - 0.5) * 0.38,
      r:  Math.random() * 2 + 2,
      a:  Math.random() * 0.35 + 0.5,
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height)  this.vy *= -1;
      },
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,220,160,${this.a})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,180,80,0.07)';
        ctx.fill();
      }
    };
  }

  resizeCanvas();
  floatNodes = Array.from({ length: FLOAT_N }, makeFloatNode);
  window.addEventListener('resize', resizeCanvas);

  function drawGridDots() {
    ctx.fillStyle = 'rgba(255,210,150,0.22)';
    gridNodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawConnections() {
    for (let i = 0; i < floatNodes.length; i++) {
      for (let j = i + 1; j < floatNodes.length; j++) {
        const dx = floatNodes[i].x - floatNodes[j].x;
        const dy = floatNodes[i].y - floatNodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(floatNodes[i].x, floatNodes[i].y);
          ctx.lineTo(floatNodes[j].x, floatNodes[j].y);
          ctx.strokeStyle = `rgba(255,210,140,${(1 - dist / MAX_DIST) * 0.5})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      for (let g = 0; g < gridNodes.length; g++) {
        const dx = floatNodes[i].x - gridNodes[g].x;
        const dy = floatNodes[i].y - gridNodes[g].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(floatNodes[i].x, floatNodes[i].y);
          ctx.lineTo(gridNodes[g].x, gridNodes[g].y);
          ctx.strokeStyle = `rgba(255,200,120,${(1 - dist / MAX_DIST) * 0.22})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGridDots();
    floatNodes.forEach(n => { n.update(); n.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }
  animate();
}());


// ── STATEMENT CAROUSEL — scroll-driven calendar flip ──
(function initStmtCarousel() {
  const wrap   = document.getElementById('stmtScrollWrap');
  const slides = document.querySelectorAll('.stmt-slide');
  const dots   = document.querySelectorAll('.stmt-dot');
  const ghost  = document.querySelector('.statement__ghost');
  if (!wrap || !slides.length) return;

  const ghosts = ['PROBLEM', 'NO-SHOWS', 'PIPELINE', 'THE FIX'];
  const total     = slides.length;
  let current     = 0;
  const leaveTimers = new Array(total).fill(null);

  slides[0].classList.add('stmt-slide--active');
  dots[0] && dots[0].classList.add('stmt-dot--active');

  function goTo(idx) {
    const next = Math.max(0, Math.min(idx, total - 1));
    if (next === current) return;

    const leavingIdx = current;
    const leaving    = slides[leavingIdx];
    leaving.classList.remove('stmt-slide--active');
    leaving.classList.add('stmt-slide--leaving');
    clearTimeout(leaveTimers[leavingIdx]);
    leaveTimers[leavingIdx] = setTimeout(() => leaving.classList.remove('stmt-slide--leaving'), 480);

    current = next;
    slides[current].classList.remove('stmt-slide--leaving'); // clear stale state before activating
    slides[current].classList.add('stmt-slide--active');
    dots.forEach((d, i) => d.classList.toggle('stmt-dot--active', i === current));

    if (ghost) {
      ghost.style.opacity = '0';
      setTimeout(() => {
        ghost.textContent = ghosts[current];
        ghost.style.opacity = '';
      }, 180);
    }
  }

  let rafId = null;
  function onScroll() {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const rect      = wrap.getBoundingClientRect();
      const scrolled  = Math.max(0, -rect.top);
      const maxScroll = wrap.offsetHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      const progress  = Math.min(scrolled / maxScroll, 1);
      goTo(Math.min(Math.floor(progress * total), total - 1));
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}());

// ── PROBLEM SCENARIO CAROUSEL — auto-advance ──
(function initProbCarousel() {
  const cards    = document.querySelectorAll('.prob-card');
  const dots     = document.querySelectorAll('.prob-dot');
  const bar      = document.getElementById('probProgressBar');
  const carousel = document.getElementById('probCarousel');
  if (!cards.length) return;

  const DURATION = 4500;
  let current = 0;
  let timer   = null;

  function goTo(idx) {
    cards[current].classList.remove('prob-card--active');
    dots[current].classList.remove('prob-dot--active');
    current = (idx + cards.length) % cards.length;
    cards[current].classList.add('prob-card--active');
    dots[current].classList.add('prob-dot--active');
    if (bar) {
      bar.style.transition = 'none';
      bar.style.width = '0%';
      void bar.offsetWidth;
      bar.style.transition = `width ${DURATION}ms linear`;
      bar.style.width = '100%';
    }
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), DURATION);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); startTimer(); });
  });

  if (carousel) {
    carousel.addEventListener('mouseenter', () => clearInterval(timer));
    carousel.addEventListener('mouseleave', startTimer);
  }

  goTo(0);
  startTimer();
}());

// ── SYSTEM CARDS — CSS sticky stacking, class-toggle only (no scrub) ──
(function initStackCards() {
  var items = Array.from(document.querySelectorAll('.sc-item'));
  if (!items.length) return;

  items.forEach(function(item, idx) {
    if (typeof ScrollTrigger === 'undefined') return;

    ScrollTrigger.create({
      trigger    : item,
      start      : 'top top',
      onEnter    : function() {
        // New card sticks at top — scale down the card behind it
        if (idx > 0) items[idx - 1].classList.add('sc--behind');
      },
      onLeaveBack: function() {
        // Scrolled back up past this card — un-scale the card behind
        if (idx > 0) items[idx - 1].classList.remove('sc--behind');
      },
    });
  });
}());

// ── HOW IT WORKS — pure CSS + IntersectionObserver (no GSAP, tab-safe) ──
(function initProcFlow() {
  var section = document.getElementById('journey');
  if (!section) return;

  var rows       = Array.from(section.querySelectorAll('.proc-row'));
  var nodes      = Array.from(section.querySelectorAll('.j-fn'));
  var connectors = Array.from(section.querySelectorAll('.j-fn__connector'));
  var fills      = Array.from(section.querySelectorAll('.j-fn__fill'));
  var terminal   = section.querySelector('.j-fn__terminal');

  if (!rows.length || !nodes.length) return;

  var activeIdx = -1;

  function activateNode(idx) {
    if (idx === activeIdx) return;
    activeIdx = idx;

    rows.forEach(function(row, i) {
      row.classList.toggle('proc-row--active', i === idx);
    });

    nodes.forEach(function(node, i) {
      node.classList.remove('j-fn--active', 'j-fn--done');
      if      (i < idx)   node.classList.add('j-fn--done');
      else if (i === idx) node.classList.add('j-fn--active');
    });

    connectors.forEach(function(conn, i) {
      var fill = fills[i];
      if (i < idx) {
        conn.classList.add('j-fn__connector--lit');
        if (fill) fill.style.height = '100%';
      } else if (i === idx) {
        conn.classList.add('j-fn__connector--lit');
        if (fill) fill.style.height = '50%';
      } else {
        conn.classList.remove('j-fn__connector--lit');
        if (fill) fill.style.height = '0%';
      }
    });

    if (terminal) terminal.classList.toggle('j-fn__terminal--lit', idx >= nodes.length - 1);
  }

  // Reveal: CSS transition triggered by class, one-shot per row
  var revealObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  rows.forEach(function(row) { revealObs.observe(row); });

  // Sync: whichever row is in the center 30% of the viewport activates its node
  var visible = new Set();
  var syncObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      var idx = rows.indexOf(entry.target);
      if (idx < 0) return;
      if (entry.isIntersecting) visible.add(idx);
      else visible.delete(idx);
    });
    if (visible.size > 0) activateNode(Math.min.apply(null, Array.from(visible)));
  }, { threshold: 0, rootMargin: '-35% 0px -35% 0px' });

  rows.forEach(function(row) { syncObs.observe(row); });
}());


// ── SCROLL FADE-UP ──
const fadeEls = document.querySelectorAll(
  '.section-tag, .problem__grid, .system__header, ' +
  '.process__header, .process__step, .who__header, ' +
  '.about__grid, .cta-block__inner, .footer__top, .preview__wrap, .flow-strip__inner'
);

fadeEls.forEach(el => el.classList.add('fade-up'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

fadeEls.forEach(el => observer.observe(el));

// ── ABOUT — activate steps as they enter the middle of the viewport ──
(function initAboutSteps() {
  var steps = document.querySelectorAll('.about__step');
  if (!steps.length) return;

  // On mobile steps are always visible (CSS overrides opacity/transform)
  if (window.matchMedia('(max-width: 900px)').matches) return;

  var aboutObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      entry.target.classList.toggle('is-active', entry.isIntersecting);
    });
  }, { threshold: 0.35, rootMargin: '-15% 0px -15% 0px' });

  steps.forEach(function(step) { aboutObserver.observe(step); });
}());

// ── WHO SCROLLY — horizontal slide transitions (scrollytelling skill) ──
(function initWhoScrolly() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  var track  = document.querySelector('.whs__track');
  var scene  = document.querySelector('.whs__scene');
  var slides = Array.from(document.querySelectorAll('.whs__slide'));
  if (!track || !scene || !slides.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.set(slides[0], { x: 0, opacity: 1 });
    return;
  }

  // All slides start hidden off-screen right
  gsap.set(slides, { x: '110vw', opacity: 0 });

  var dur  = 0.22;   // enter duration
  var hold = 0.14;   // hold time
  var exit = 0.16;   // exit duration

  var tl = gsap.timeline({
    scrollTrigger: {
      trigger : track,
      start   : 'top top',
      end     : 'bottom bottom',
      scrub   : 1.2,
      pin     : scene,
      anticipatePin: 1,
    }
  });

  slides.forEach(function(slide, i) {
    var offset = i * (dur + hold + exit);
    // Slide in from right
    tl.to(slide, { x: '0vw', opacity: 1, duration: dur, ease: 'power3.out' }, offset);
    // Slide out to left (all but last)
    if (i < slides.length - 1) {
      tl.to(slide, { x: '-110vw', opacity: 0, duration: exit, ease: 'power3.in' }, offset + dur + hold);
    }
  });
}());

// ── WHO CARDS — subtle backward tilt + shine on hover ──
(function initWfTilt() {
  if (typeof gsap === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var cards = Array.from(document.querySelectorAll('.wf-card'));
  if (!cards.length) return;

  gsap.set(cards, { rotateX: 0, transformPerspective: 800 });

  cards.forEach(function(card) {
    var shine = card.querySelector('.wf-shine');

    card.addEventListener('mouseenter', function() {
      gsap.to(card, { rotateX: 10, scale: 1.03, duration: 0.4, ease: 'power2.out' });
      if (shine) gsap.to(shine, { opacity: 1, duration: 0.3 });
    });

    card.addEventListener('mousemove', function(e) {
      if (!shine) return;
      var rect = card.getBoundingClientRect();
      var px = ((e.clientX - rect.left) / rect.width)  * 100;
      var py = ((e.clientY - rect.top)  / rect.height) * 100;
      shine.style.background =
        'radial-gradient(circle at ' + px + '% ' + py + '%, rgba(255,255,255,0.13) 0%, transparent 60%)';
    });

    card.addEventListener('mouseleave', function() {
      gsap.to(card, { rotateX: 0, scale: 1, duration: 0.45, ease: 'power3.out' });
      if (shine) gsap.to(shine, { opacity: 0, duration: 0.3 });
    });
  });
}());

// ── WHO — folder stack (pure click-driven, arc-around animation) ──
(function initWhoFolders() {
  if (typeof gsap === 'undefined') return;
  var stack   = document.getElementById('whoStack');
  var counter = document.getElementById('whoCountNum');
  if (!stack) return;

  var folders = Array.from(stack.querySelectorAll('.who__folder'));
  var total   = folders.length;
  if (!total) return;

  var PEEK      = 54;  // px each folder peeks above the one in front
  var animating = false;

  var order = folders.slice();

  // ── File-drawer stack: front folder fully visible, others peek upward ──
  function applyStack(useAnim) {
    order.forEach(function(f, i) {
      var props = {
        xPercent : -50,
        yPercent : -100,   // anchor at folder's TOP edge
        x        : 0,
        y        : -i * PEEK,
        rotateZ  : 0,
        scale    : 1 - i * 0.015,
        zIndex   : total - i,
        opacity  : 1,
      };
      if (useAnim) {
        gsap.to(f, Object.assign({ duration: 0.5, ease: 'back.out(1.4)' }, props));
      } else {
        gsap.set(f, props);
      }
      f.style.cursor = i === 0 ? 'default' : 'pointer';
    });
    if (counter) counter.textContent = String(parseInt(order[0].dataset.folder, 10) + 1).padStart(2, '0');
  }

  // Start hidden, position, then fade in back-to-front on scroll
  gsap.set(folders, { opacity: 0 });
  applyStack(false);

  ScrollTrigger.create({
    trigger: stack,
    start: 'top 75%',
    once: true,
    onEnter: function() {
      var revealOrder = order.slice().reverse();
      gsap.to(revealOrder, {
        opacity : 1,
        duration: 0.55,
        ease    : 'power3.out',
        stagger : 0.06,
      });
    }
  });

  // ── Click: lift folder, slide it to front ──
  stack.addEventListener('click', function(e) {
    var clicked = e.target.closest('.who__folder');
    if (!clicked || animating) return;

    var idx = order.indexOf(clicked);
    if (idx <= 0) return;

    animating = true;

    var tl = gsap.timeline({
      onComplete: function() {
        order.splice(idx, 1);
        order.unshift(clicked);
        applyStack(false);
        animating = false;
      }
    });

    // Lift the clicked folder up and forward
    tl.to(clicked, {
      y       : -idx * PEEK - 60,
      x       : 32,
      rotateZ : 4,
      scale   : 1.04,
      zIndex  : total + 2,
      duration: 0.22,
      ease    : 'power2.out',
    });

    // Spring it into the front position
    tl.to(clicked, {
      x       : 0,
      y       : 0,
      rotateZ : 0,
      scale   : 1,
      zIndex  : total + 2,
      duration: 0.44,
      ease    : 'back.out(1.6)',
    });

    // Simultaneously shift others back one level
    tl.to(order.slice(0, idx), {
      y       : function(i) { return -(i + 1) * PEEK; },
      scale   : function(i) { return 1 - (i + 1) * 0.015; },
      zIndex  : function(i) { return total - i - 1; },
      duration: 0.44,
      ease    : 'power2.inOut',
      stagger : { amount: 0.06, from: 'start' },
    }, 0.1);

    tl.call(function() {
      if (counter) counter.textContent = String(parseInt(clicked.dataset.folder, 10) + 1).padStart(2, '0');
    }, null, 0.28);
  });
}());

// ── HERO 3D LOGO PARALLAX — rolls downward + drifts at different speeds ──
(function initHeroPlxBg() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var wrap = document.querySelector('.hero__plx-wrap');
  var icon = document.querySelector('.hero__plx-icon');
  var hero = document.querySelector('.hero');
  if (!wrap || !icon || !hero) return;

  // ── Scroll parallax on the wrap ──
  gsap.to(wrap, {
    y: function() { return window.innerHeight * 0.55; },
    rotation: 45,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.6
    }
  });

  // ── Fixed starting position: centered in the lower hero ──
  function placeIcon() {
    var heroRect = hero.getBoundingClientRect();
    var iconW    = icon.offsetWidth;
    var iconH    = icon.offsetHeight;
    gsap.set(icon, {
      x:        heroRect.width  * 0.5  - iconW / 2,
      y:        heroRect.height * 0.38 - iconH / 2,
      rotation: 28
    });
  }
  placeIcon();
  window.addEventListener('resize', placeIcon);
}());

// ── HERO BRAND REVEAL — CraftLab. logo fades in at top ──
(function initHeroBrandReveal() {
  if (typeof gsap === 'undefined') return;
  var brandImg = document.querySelector('.hero__watermark-img');
  if (!brandImg) return;

  gsap.to(brandImg, {
    opacity: 1,
    y: 0,
    duration: 1.6,
    ease: 'power3.out',
    delay: 0.2
  });
}());

// ── TEXT SPLIT ANIMATIONS (custom — no SplitText CDN needed) ──
(function initTextAnimations() {
  if (typeof gsap === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Splits element text into individual char <span>s while preserving HTML structure
  function splitChars(el) {
    var charSpans = [];

    function walkAndWrap(node) {
      if (node.nodeType === 3) { // Text node
        var text = node.nodeValue;
        var frag = document.createDocumentFragment();
        text.split('').forEach(function(ch) {
          if (ch === ' ') {
            frag.appendChild(document.createTextNode(' '));
            return;
          }
          var span = document.createElement('span');
          span.style.display = 'inline-block';
          span.textContent = ch;
          frag.appendChild(span);
          charSpans.push(span);
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1 && node.nodeName !== 'BR') { // Element node (skip BR)
        Array.from(node.childNodes).forEach(walkAndWrap);
      }
    }

    walkAndWrap(el);
    return charSpans;
  }

  // ── CTA HEADLINES — cinematic staggered fade ──
  var ctaLines = document.querySelectorAll('.cta-h--white, .cta-h--black');
  if (ctaLines.length) {
    gsap.fromTo(ctaLines,
      { y: 70, opacity: 0, filter: 'blur(6px)' },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.2,
        ease: 'power4.out',
        stagger: 0.3,
        clearProps: 'all',
        scrollTrigger: {
          trigger: '.cta-block__h',
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // ── 3. SYSTEM HEADER — cinematic blur fade ──
  var sysHeader = document.querySelectorAll('.system__header h2, .system__sub');
  if (sysHeader.length) {
    gsap.fromTo(sysHeader,
      { y: 70, opacity: 0, filter: 'blur(8px)' },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.6,
        ease: 'power4.out',
        stagger: 0.25,
        clearProps: 'all',
        scrollTrigger: {
          trigger: '.system__header',
          start: 'top 82%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // ── 4. SECTION CARD TITLES — quick pop-up ──
  document.querySelectorAll('.sc-title').forEach(function(title) {
    gsap.from(title, {
      y: 24,
      opacity: 0,
      duration: 0.5,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: title,
        start: 'top 90%',
        toggleActions: 'play none none none'
      }
    });
  });

}());

// ── SCROLL SYSTEM: batch reveal + parallax + progress (MCP gsap-master pattern) ──
(function initScrollSystem() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ── 1. Clip-path wipe reveal — targets real content elements
  var wipeSelectors = [
    '.sc-desc', '.sc-tags', '.sc-quote',
    '.process__step',
    '.process__header h2', '.process__header p',
    '.who__item', '.who__label',
    '.about__step-p',
    '.cta-block__stat', '.cta-block__col-label',
    '.flow-strip__step'
  ].join(', ');

  ScrollTrigger.batch(wipeSelectors, {
    onEnter: function(elements) {
      gsap.fromTo(elements,
        { y: 24, opacity: 0, clipPath: 'inset(0 0 100% 0)' },
        { y: 0, opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 0.52, ease: 'expo.out', stagger: 0.06, clearProps: 'clipPath,transform,opacity' }
      );
    },
    start: 'top 92%',
    once: true
  });

  // ── 2. Parallax: any element with data-speed="0.3" to "1.0" moves at that rate on scroll
  gsap.utils.toArray('[data-speed]').forEach(el => {
    const speed = parseFloat(el.getAttribute('data-speed')) || 0.5;
    gsap.to(el, {
      yPercent: -50 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: el.closest('section'),
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        refreshPriority: -1
      }
    });
  });

  // ── 3. Progress Bar: horizontal fill as page scrolls
  const progressBar = document.querySelector('.progress-bar');
  if (progressBar) {
    gsap.to(progressBar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3
      }
    });
  }

}());

// ── Keychain Circular Orbit — 3 items orbit a circle, rotation scroll-scrubbed
(function initKeychainOrbit() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth <= 900) return;

  var section   = document.getElementById('tools-block');
  var items     = Array.from(document.querySelectorAll('.keychain-item'));
  var names     = Array.from(document.querySelectorAll('.kc-name'));
  var descEl    = document.getElementById('kc-active-desc');
  var labelEl   = document.getElementById('kc-active-label');
  var toolNames = ['Canva', 'GoHighLevel', 'Claude.ai', 'CraftLab'];
  var descTexts = [
    'Your brand looks premium from day one. Every proposal, deck, and client asset is built to close — not just to impress.',
    'GoHighLevel is the engine. One platform that captures leads, automates follow-up, books appointments, and recovers no-shows — without you lifting a finger.',
    'AI-assisted builds start with precise planning. Sharper logic, cleaner systems — without the extra cost or delay.',
    'The CraftLab framework is the backbone of every build. Your entire customer journey gets mapped before a single workflow is created. No guesswork. No gaps.'
  ];
  var lastActiveIdx = 0;

  if (!section || items.length < 2) return;

  var total = items.length;
  var R     = 162; // orbit radius in px — matches SVG circle r=172 minus half item size

  // Spread items evenly around the circle.
  // "Front" featured position = bottom of circle (angle = 0 here, mapped to y=+R).
  // We use angle where 0 = bottom, 2π/3 = upper-right, 4π/3 = upper-left.
  // x = sin(angle) * R,  y = cos(angle) * R  (cos(0)=1 → y positive = bottom on screen)
  var baseAngles = items.map(function(_, i) {
    return i * (2 * Math.PI / total); // evenly spaced, item 0 starts at bottom
  });

  function render(progress) {
    // As scroll progresses, rotate the whole carousel counter-clockwise.
    // Rotating by one full step (2π/3) brings the next item to the bottom.
    var rotation = -progress * (total - 1) * (2 * Math.PI / total);

    var bestFrontness = -Infinity;
    var activeIdx = 0;

    items.forEach(function(item, i) {
      var angle = baseAngles[i] + rotation;

      // Screen-space orbit position (y is down on screen, cos(0)=1 → bottom)
      var x = Math.sin(angle) * R;
      var y = Math.cos(angle) * R;

      // "Frontness": item at bottom (angle≈0) = front (t=1), top = back (t=0)
      var t = (Math.cos(angle) + 1) / 2; // 0 (top/back) → 1 (bottom/front)

      var scale   = 0.08 + 1.92 * t;
      var opacity = Math.pow(t, 7);
      var zIndex  = Math.round(t * 10);

      gsap.set(item, { x: x, y: y, scale: scale, opacity: opacity, zIndex: zIndex, force3D: true });

      if (t > bestFrontness) { bestFrontness = t; activeIdx = i; }
    });

    // Always snap the front item to full opacity — scrub lag can leave it partial
    gsap.set(items[activeIdx], { opacity: 1 });

    names.forEach(function(n, i) { n.classList.toggle('kc-name--active', i === activeIdx); });

    if (descEl && activeIdx !== lastActiveIdx) {
      lastActiveIdx = activeIdx;
      var els = [descEl, labelEl].filter(Boolean);
      gsap.to(els, { opacity: 0, y: 8, duration: 0.18, onComplete: function() {
        descEl.textContent = descTexts[activeIdx];
        if (labelEl) labelEl.textContent = toolNames[activeIdx];
        gsap.to(els, { opacity: 1, y: 0, duration: 0.28 });
      }});
    }
  }

  render(0); // set initial positions before any scroll

  ScrollTrigger.create({
    trigger            : section,
    start              : 'top top',
    end                : 'bottom bottom',
    scrub              : 2,
    invalidateOnRefresh: true,
    onUpdate           : function(self) { render(self.progress); }
  });
}());

// ── SECTION BACKGROUND TRANSITION — white → orange tint across Who + Tools ──
(function initBgTransition() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  var whoSection   = document.querySelector('.who-v2');
  var toolsSection = document.getElementById('tools-block');

  if (whoSection) {
    gsap.fromTo(whoSection,
      { backgroundColor: '#F6F7F8' },
      {
        backgroundColor: '#FFD4A8',
        ease: 'none',
        scrollTrigger: {
          trigger: whoSection,
          start  : 'top top',
          end    : 'bottom bottom',
          scrub  : 1.5
        }
      }
    );
  }

  if (toolsSection) {
    gsap.fromTo(toolsSection,
      { backgroundColor: '#FFD4A8' },
      {
        backgroundColor: '#FF6A00',
        ease: 'none',
        scrollTrigger: {
          trigger: toolsSection,
          start  : 'top top',
          end    : 'bottom bottom',
          scrub  : 1.5
        }
      }
    );
  }
}());

// ── CRAFTLAB BACKGROUND PARALLAX — drifts upward slower than scroll ──
(function initCraftlabParallax() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  var el = document.querySelector('.cl-bg-text');
  if (!el) return;
  gsap.fromTo(el,
    { opacity: 0.7 },
    {
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '#tools-block',
        start: 'top top',
        endTrigger: '#booking',
        end: 'bottom center',
        scrub: 2
      }
    }
  );
}());

// ── BACK TO TOP — reveal when near bottom ──
(function() {
  var btn = document.getElementById('backToTop');
  if (!btn) return;
  function onScroll() {
    var scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    btn.classList.toggle('visible', scrolled >= 0.99);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
}());

// Tab-switch note: ScrollTrigger.refresh() was removed — it recalculated positions
// incorrectly after the journey pin spacers were removed, breaking all scrub animations.
// All remaining GSAP sections (WHO, tools bg, keychain orbit) use scrub-based tweens
// that auto-seek correctly on tab return without any manual refresh.

// ── HASH NAV FIX — prevent GSAP pin collision on direct hash load ──
(function() {
  var hash = window.location.hash;
  if (!hash || hash === '#home') return;
  // Strip hash so browser starts at top; GSAP pins initialize correctly
  history.replaceState(null, null, window.location.pathname + window.location.search);
  window.addEventListener('load', function() {
    setTimeout(function() {
      var target = document.querySelector(hash);
      if (target) {
        var top = target.getBoundingClientRect().top + window.scrollY - 20;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    }, 350);
  });
}());

// ── LEAD-TO-CLIENT SYSTEM NAV — reload page so GSAP starts clean, hash nav fix scrolls down ──
(function() {
  var btn = document.querySelector('.nav__system-btn');
  if (!btn) return;
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = window.location.pathname + window.location.search + '#system';
  });
}());

