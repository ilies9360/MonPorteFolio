// ═══════════════════════════════════════════════
// AMBIENT BACKGROUND CANVAS
// ═══════════════════════════════════════════════
(function () {
  const canvas = document.getElementById('ambient-canvas');
  const ctx    = canvas.getContext('2d');

  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // ── Floating particles ──────────────────────
  const PARTICLE_COUNT = 55;
  const particles = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x:     Math.random() * window.innerWidth,
      y:     Math.random() * window.innerHeight,
      r:     Math.random() * 1.4 + 0.3,
      alpha: Math.random() * 0.35 + 0.05,
      vx:    (Math.random() - 0.5) * 0.18,
      vy:    (Math.random() - 0.5) * 0.18,
      // slow pulse
      pulseSpeed: Math.random() * 0.008 + 0.003,
      pulsePhase: Math.random() * Math.PI * 2,
    });
  }

  // ── Slow drifting orbs ───────────────────────
  const ORBS = [
    { x: 0.15, y: 0.25, r: 320, color: 'rgba(124,58,237,', baseAlpha: 0.07, speed: 0.00012, angle: 0.0 },
    { x: 0.80, y: 0.60, r: 260, color: 'rgba(124,58,237,', baseAlpha: 0.05, speed: 0.00018, angle: 1.2 },
    { x: 0.50, y: 0.85, r: 200, color: 'rgba(167,139,250,', baseAlpha: 0.04, speed: 0.00014, angle: 2.4 },
  ];

  // ── Grid lines (very subtle) ─────────────────
  const GRID_SIZE = 64;

  let t = 0;

  function draw() {
    t++;
    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.save();
    ctx.strokeStyle = 'rgba(124,58,237,0.028)';
    ctx.lineWidth   = 1;
    for (let x = 0; x < W; x += GRID_SIZE) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += GRID_SIZE) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    ctx.restore();

    // Drifting orbs
    for (const orb of ORBS) {
      orb.angle += orb.speed;
      const cx = (orb.x + Math.sin(orb.angle * 1.3) * 0.08) * W;
      const cy = (orb.y + Math.cos(orb.angle)       * 0.06) * H;
      const alpha = orb.baseAlpha + Math.sin(orb.angle * 3) * 0.015;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orb.r);
      grad.addColorStop(0,   orb.color + alpha + ')');
      grad.addColorStop(0.5, orb.color + (alpha * 0.4) + ')');
      grad.addColorStop(1,   orb.color + '0)');

      ctx.beginPath();
      ctx.arc(cx, cy, orb.r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Particles
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.pulsePhase += p.pulseSpeed;

      // Wrap around edges
      if (p.x < -10)  p.x = W + 10;
      if (p.x > W+10) p.x = -10;
      if (p.y < -10)  p.y = H + 10;
      if (p.y > H+10) p.y = -10;

      const pulse = 0.5 + 0.5 * Math.sin(p.pulsePhase);
      const a     = p.alpha * (0.6 + 0.4 * pulse);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167,139,250,${a})`;
      ctx.fill();
    }

    // Faint connecting lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const lineAlpha = (1 - dist / 100) * 0.055;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(124,58,237,${lineAlpha})`;
          ctx.lineWidth   = 0.6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  draw();
})();


// ═══════════════════════════════════════════════
// CUSTOM CURSOR
// ═══════════════════════════════════════════════
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


// ═══════════════════════════════════════════════
// FIXED NAVBAR — active link on scroll
// ═══════════════════════════════════════════════
const navLinks   = document.querySelectorAll('.nav-link');
const sections   = document.querySelectorAll('section[id]');

function updateActiveNav() {
  let current = '';
  sections.forEach(sec => {
    const top = sec.getBoundingClientRect().top;
    if (top <= 80) current = sec.id;
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.dataset.section === current);
  });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();


// ═══════════════════════════════════════════════
// MOBILE MENU
// ═══════════════════════════════════════════════
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

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMobile();
});


// ═══════════════════════════════════════════════
// TABS (Ressources)
// ═══════════════════════════════════════════════
function switchTab(id, btn) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  btn.classList.add('active');
}


// ═══════════════════════════════════════════════
// SCROLL REVEAL
// ═══════════════════════════════════════════════
const io = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('vis'), i * 65);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(r => io.observe(r));
