// ═══════════════════════════════════════════════════════
//  ENCHANTING TABLE GLYPH CANVAS
//  Characters from Standard Galactic Alphabet (Minecraft)
//  + runes + symbols — appear, float up, fade out
// ═══════════════════════════════════════════════════════
(function () {
  const canvas = document.getElementById('glyph-canvas');
  const ctx    = canvas.getContext('2d');

  // Pool of glyph characters — Galactic + runic style unicode
  const GLYPHS = [
    // Standard Galactic Alphabet look-alikes (private use / similar unicode)
    'ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ',
    'ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ',
    'ᛚ','ᛜ','ᛞ','ᛟ',
    // Alchemical / mystical symbols
    '⊕','⊗','⊘','⊙','⊛','⊜','⊝','∞','∇','∆',
    '⋄','◈','◇','⬡','⬢','⬟','⬠',
    // Old Italic / Phoenician
    '𐤀','𐤁','𐤂','𐤃','𐤄','𐤅','𐤆','𐤇','𐤈','𐤉',
    // Geometric
    '▲','△','▷','◁','◈','◉','◎','⬟',
    // Extra mystical
    '✦','✧','✶','✷','✸','✹','❋','❊','❉',
  ];

  let W, H;
  const glyphs = [];
  const MAX_GLYPHS = 38;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function randomGlyph() {
    return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  }

  function spawnGlyph() {
    const size = Math.random() * 14 + 9; // 9–23px
    glyphs.push({
      char:     randomGlyph(),
      x:        Math.random() * W,
      y:        H + size,
      size:     size,
      alpha:    0,
      alphaMax: Math.random() * 0.22 + 0.06,  // very subtle
      vy:       -(Math.random() * 0.45 + 0.18), // float up
      vx:       (Math.random() - 0.5) * 0.18,  // slight drift
      // life stages: 0=fade-in, 1=hold, 2=fade-out
      state:    0,
      holdTimer: Math.random() * 140 + 80,
      fadeSpeed: Math.random() * 0.006 + 0.003,
      // slight rotation
      rot:    Math.random() * Math.PI * 2,
      vrot:   (Math.random() - 0.5) * 0.008,
    });
  }

  // Spawn interval varies
  let spawnAccum = 0;
  let spawnInterval = 18; // frames between spawns

  function draw() {
    ctx.clearRect(0, 0, W, H);

    spawnAccum++;
    if (spawnAccum >= spawnInterval && glyphs.length < MAX_GLYPHS) {
      spawnGlyph();
      spawnAccum = 0;
      spawnInterval = Math.random() * 25 + 10;
    }

    for (let i = glyphs.length - 1; i >= 0; i--) {
      const g = glyphs[i];

      // Move
      g.x   += g.vx;
      g.y   += g.vy;
      g.rot += g.vrot;

      // Alpha lifecycle
      if (g.state === 0) {
        g.alpha += g.fadeSpeed * 1.5;
        if (g.alpha >= g.alphaMax) { g.alpha = g.alphaMax; g.state = 1; }
      } else if (g.state === 1) {
        g.holdTimer--;
        if (g.holdTimer <= 0) g.state = 2;
      } else {
        g.alpha -= g.fadeSpeed;
      }

      // Remove when gone or off screen
      if (g.alpha <= 0 || g.y < -40) {
        glyphs.splice(i, 1);
        continue;
      }

      // Draw
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(g.rot);

      // Glow
      ctx.shadowColor = `rgba(124,58,237,${g.alpha * 2.5})`;
      ctx.shadowBlur  = 8;

      ctx.font        = `${g.size}px 'Space Mono', monospace`;
      ctx.textAlign   = 'center';
      ctx.textBaseline= 'middle';
      ctx.fillStyle   = `rgba(167,139,250,${g.alpha})`;
      ctx.fillText(g.char, 0, 0);

      ctx.restore();
    }

    requestAnimationFrame(draw);
  }

  draw();
})();


// ═══════════════════════════════════════════════════════
//  CUSTOM CURSOR
// ═══════════════════════════════════════════════════════
const cur   = document.getElementById('cursor');
const trail = document.getElementById('cursor-trail');
let mx = 0, my = 0, tx = 0, ty = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.left = mx + 'px';
  cur.style.top  = my + 'px';
});
(function animTrail() {
  tx += (mx - tx) * 0.11;
  ty += (my - ty) * 0.11;
  trail.style.left = tx + 'px';
  trail.style.top  = ty + 'px';
  requestAnimationFrame(animTrail);
})();


// ═══════════════════════════════════════════════════════
//  SPA NAVIGATION — no scroll, page switching
// ═══════════════════════════════════════════════════════
const pages    = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');

function goTo(id) {
  // Deactivate all
  pages.forEach(p => p.classList.remove('active'));
  navLinks.forEach(a => a.classList.remove('active'));

  // Activate target
  const target = document.getElementById('page-' + id);
  if (target) {
    target.classList.add('active');
    // scroll the page container back to top
    target.scrollTop = 0;
    // trigger reveals inside
    triggerReveals(target);
  }

  // Highlight nav
  navLinks.forEach(a => {
    if (a.dataset.section === id) a.classList.add('active');
  });

  // Update URL hash without scrolling
  history.replaceState(null, '', '#' + id);

  closeMobile();
}

// Nav link clicks
navLinks.forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    goTo(a.dataset.section);
  });
});

// CTA buttons (data-goto attribute)
document.querySelectorAll('[data-goto]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    goTo(btn.dataset.goto);
  });
});

// On load: read hash or default to home
function initPage() {
  const hash = window.location.hash.replace('#', '');
  goTo(hash || 'home');
}
initPage();


// ═══════════════════════════════════════════════════════
//  MOBILE MENU
// ═══════════════════════════════════════════════════════
const burger     = document.getElementById('nav-burger');
const mobileMenu = document.getElementById('mobile-menu');
let mobileOpen   = false;

function toggleMobile() {
  mobileOpen = !mobileOpen;
  burger.classList.toggle('open', mobileOpen);
  mobileMenu.classList.toggle('open', mobileOpen);
}
function closeMobile() {
  mobileOpen = false;
  burger.classList.remove('open');
  mobileMenu.classList.remove('open');
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobile(); });


// ═══════════════════════════════════════════════════════
//  RESOURCE TABS
// ═══════════════════════════════════════════════════════
function switchTab(id, btn) {
  document.querySelectorAll('#page-ressources .tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#page-ressources .tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  btn.classList.add('active');
}


// ═══════════════════════════════════════════════════════
//  SCROLL REVEAL (inside each page panel)
// ═══════════════════════════════════════════════════════
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('vis'), i * 60);
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

function triggerReveals(container) {
  container.querySelectorAll('.reveal').forEach(r => {
    r.classList.remove('vis');
    revealObserver.observe(r);
  });
}
