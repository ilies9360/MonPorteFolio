// ═══════════════════════════════════════════════════════
// ENCHANTING TABLE GLYPH CANVAS
// ═══════════════════════════════════════════════════════
(function () {
  const canvas = document.getElementById('ambient-canvas');
  const ctx    = canvas.getContext('2d');

  const GLYPHS = [
    'ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ',
    'ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ',
    'ᛚ','ᛜ','ᛞ','ᛟ',
    '⊕','⊗','⊘','⊙','⊛','⊜','⊝','∞','∇','∆',
    '⋄','◈','◇','⬡','⬢',
    '▲','△','▷','◁','◉','◎',
    '✦','✧','✶','✷','✸','✹','❋','❊','❉',
  ];

  let W, H;
  const glyphs = [];
  const MAX = 40;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function spawn() {
    const size = Math.random() * 14 + 9;
    glyphs.push({
      char:      GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      x:         Math.random() * W,
      y:         H + size,
      size,
      alpha:     0,
      alphaMax:  Math.random() * 0.20 + 0.76,
      vy:       -(Math.random() * 0.45 + 0.18),
      vx:        (Math.random() - 0.5) * 0.16,
      state:     0,
      holdTimer: Math.random() * 130 + 70,
      fadeSpeed: Math.random() * 0.01 + 0.003,
      rot:       Math.random() * Math.PI * 2,
      vrot:      (Math.random() - 0.5) * 0.008,
    });
  }

  let spawnAcc = 0, spawnInt = 18;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    spawnAcc++;
    if (spawnAcc >= spawnInt && glyphs.length < MAX) {
      spawn(); spawnAcc = 0;
      spawnInt = Math.random() * 28 + 10;
    }

    for (let i = glyphs.length - 1; i >= 0; i--) {
      const g = glyphs[i];
      g.x += g.vx; g.y += g.vy; g.rot += g.vrot;

      if      (g.state === 0) { g.alpha += g.fadeSpeed * 1.5; if (g.alpha >= g.alphaMax) { g.alpha = g.alphaMax; g.state = 1; } }
      else if (g.state === 1) { if (--g.holdTimer <= 0) g.state = 2; }
      else                    { g.alpha -= g.fadeSpeed; }

      if (g.alpha <= 0 || g.y < -40) { glyphs.splice(i, 1); continue; }

      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(g.rot);
      ctx.shadowColor = `rgba(124,58,237,${g.alpha * 3})`;
      ctx.shadowBlur  = 10;
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
// CUSTOM CURSOR
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
// FIXED NAVBAR — active link on scroll
// ═══════════════════════════════════════════════════════
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function updateActiveNav() {
  let current = '';
  sections.forEach(sec => {
    if (sec.getBoundingClientRect().top <= 80) current = sec.id;
  });
  navLinks.forEach(a => a.classList.toggle('active', a.dataset.section === current));
}
window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();


// ═══════════════════════════════════════════════════════
// MOBILE MENU
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
// TABS (Ressources)
// ═══════════════════════════════════════════════════════
function switchTab(id, btn) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  btn.classList.add('active');
}


// ═══════════════════════════════════════════════════════
// SCROLL REVEAL
// ═══════════════════════════════════════════════════════
const io = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('vis'), i * 65);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(r => io.observe(r));


// ═══════════════════════════════════════════════════════
// SCROLL REVEAL
// ═══════════════════════════════════════════════════════
// Initialisation avec ta clé publique
(function() {
    emailjs.init("-_m-XBD3vSaoWgksg"); 
})();

const contactForm = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');

contactForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Empêche le rechargement de la page

    // Changement d'état du bouton
    submitBtn.innerText = "Envoi en cours...";
    submitBtn.disabled = true;

    // Envoi des données du formulaire
    // 'this' fait référence au formulaire lui-même
    emailjs.sendForm('service_0ty6ged', 'template_fgfv61a', this)
        .then(function() {
            alert('Succès ! Votre message a été transmis.');
            contactForm.reset(); // Vide les champs
        }, function(error) {
            alert('Oups... Erreur : ' + JSON.stringify(error));
        })
        .finally(function() {
            // Remise à zéro du bouton
            submitBtn.innerText = "Envoyer";
            submitBtn.disabled = false;
        });
});