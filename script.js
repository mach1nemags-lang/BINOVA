// Utilidades UI
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Año en footer
$('#year').textContent = new Date().getFullYear();

// Smooth scroll para anclas internas
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if(href.length > 1){
      e.preventDefault();
      const el = $(href);
      if(el){ el.scrollIntoView({behavior:'smooth', block:'start'}); }
    }
  });
});

// Botón Back to Top
const backToTop = $('#backToTop');
window.addEventListener('scroll', () => {
  if(window.scrollY > 400){ backToTop.classList.add('show'); }
  else{ backToTop.classList.remove('show'); }
});
backToTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

// Theme toggle
const themeToggle = $('#themeToggle');
const preferred = localStorage.getItem('binova-theme');
if(preferred){ document.documentElement.setAttribute('data-theme', preferred); }
const updateToggleVisual = () => themeToggle.classList.toggle('active', document.documentElement.getAttribute('data-theme') === 'dark');
updateToggleVisual();
themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'green' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('binova-theme', next);
  updateToggleVisual();
});

// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); }
  })
}, {threshold: 0.15});
$$('.reveal').forEach(el => io.observe(el));

// Tarjetas: efecto hover spotlight
$$('.card').forEach(card => {
  card.addEventListener('pointermove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 100;
    const y = (e.clientY - rect.top) / rect.height * 100;
    card.style.setProperty('--mx', x + '%');
    card.style.setProperty('--my', y + '%');
  });
});

// Carrusel 3D
(function(){
  const stage = $('.carousel-stage');
  const slides = $$('.slide', stage);
  const prev = $('.carousel-btn.prev');
  const next = $('.carousel-btn.next');
  let idx = 0;
  const N = slides.length;
  const angle = 360 / N;
  let radius = 600; // valor inicial, será recalculado
  let xOffset = 120; // desplazamiento lateral, será recalculado

  const recalc = () => {
    const w = stage.clientWidth || 800;
    // Radio menor para hacerlo más compacto y proporcional al ancho
    radius = Math.max(250, Math.min(420, w * 0.55));
    // Desplazamiento lateral más pequeño para reducir apertura
    xOffset = Math.max(60, Math.min(110, w * 0.12));
  };
  recalc();

  const layout = () => {
    slides.forEach((s, i) => {
      const a = (i - idx) * angle;
      const z = Math.cos(a * Math.PI/180) * radius;
      const x = Math.sin(a * Math.PI/180) * xOffset;
      s.style.transform = `translateX(-50%) translateZ(${z}px) rotateY(${a}deg) translateX(${x}px)`;
      s.style.opacity = i === idx ? 1 : 0.66;
    });
  };
  layout();
  prev.addEventListener('click', () => { idx = (idx - 1 + N) % N; layout(); });
  next.addEventListener('click', () => { idx = (idx + 1) % N; layout(); });
  // Auto-rotate para demo
  let auto = setInterval(() => { next.click(); }, 4000);
  [prev, next, stage].forEach(el => el.addEventListener('pointerenter', () => clearInterval(auto)));
  // Recalcular en resize
  window.addEventListener('resize', () => { recalc(); layout(); });
})();

// Fondo: animación de circuitos en canvas
(function(){
  const canvas = document.getElementById('bg-circuits');
  const ctx = canvas.getContext('2d');
  let w, h, dpr;

  const lines = [];
  const N = 60;

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = Math.floor(innerWidth * dpr);
    h = canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
  }
  resize();
  window.addEventListener('resize', resize);

  function rand(a,b){return Math.random()*(b-a)+a}
  for(let i=0;i<N;i++){
    lines.push({
      x: rand(0, w), y: rand(0, h),
      vx: rand(-0.2, 0.2), vy: rand(-0.2, 0.2),
      l: rand(30, 120), alpha: rand(0.05, 0.25)
    });
  }

  function step(){
    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle = 'rgba(0,255,136,0.18)';
    ctx.lineWidth = 1 * dpr;
    ctx.shadowColor = 'rgba(0,255,136,0.25)';
    ctx.shadowBlur = 6 * dpr;

    lines.forEach(L => {
      L.x += L.vx; L.y += L.vy;
      if(L.x < -50) L.x = w+50; if(L.x > w+50) L.x = -50;
      if(L.y < -50) L.y = h+50; if(L.y > h+50) L.y = -50;
      ctx.beginPath();
      ctx.moveTo(L.x, L.y);
      ctx.lineTo(L.x + L.l, L.y);
      ctx.stroke();

      // nodos
      ctx.beginPath();
      ctx.fillStyle = 'rgba(0,255,136,' + L.alpha + ')';
      ctx.arc(L.x + L.l, L.y, 1.8 * dpr, 0, Math.PI*2);
      ctx.fill();
    });

    requestAnimationFrame(step);
  }
  step();
})();

// Accesibilidad: focus visible para botones del carrusel con teclado
$$('.carousel-btn').forEach(b => b.addEventListener('keydown', e => {
  if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); b.click(); }
}));
