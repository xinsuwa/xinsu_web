/* =========================================================
   西式奇幻风 · 共享脚本
   烛光跟随 / 尘光粒子 / 卡片3D倾斜 / 滚动揭示
   ========================================================= */

(function () {
  /* ---------- 烛光跟随 ---------- */
  const light = document.createElement('div');
  light.className = 'candlelight';
  document.body.appendChild(light);

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let tx = mx, ty = my;

  window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });

  function animLight() {
    tx += (mx - tx) * 0.12;
    ty += (my - ty) * 0.12;
    // 烛火轻微抖动
    const flicker = (Math.sin(Date.now() * 0.008) + Math.sin(Date.now() * 0.013)) * 4;
    light.style.left = (tx + flicker) + 'px';
    light.style.top = (ty + flicker) + 'px';
    requestAnimationFrame(animLight);
  }
  animLight();

  /* ---------- 卡片烛光高亮 + 3D 倾斜 ---------- */
  document.querySelectorAll('.relic').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', (px * 100) + '%');
      card.style.setProperty('--my', (py * 100) + '%');
      const rx = (0.5 - py) * 8;
      const ry = (px - 0.5) * 8;
      card.style.transform = `translateY(-8px) rotateX(${rx}deg) rotateY(${ry}deg) rotate(-0.6deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ---------- 尘光粒子 ---------- */
  const canvas = document.createElement('canvas');
  canvas.id = 'dustCanvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let W, H, particles;
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    const count = Math.min(80, Math.floor(W * H / 22000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.4 - 0.1,
      a: Math.random() * 0.6 + 0.2,
      tw: Math.random() * Math.PI * 2
    }));
  }
  resize();
  window.addEventListener('resize', resize);

  function drawDust() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.tw += 0.03;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      const alpha = p.a * (0.6 + 0.4 * Math.sin(p.tw));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 210, 130, ${alpha})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(255, 200, 120, 0.8)';
      ctx.fill();
    });
    requestAnimationFrame(drawDust);
  }
  drawDust();

  /* ---------- 滚动揭示 ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- 翻页过渡（点击物品时淡出） ---------- */
  document.querySelectorAll('a[data-transition]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || a.target === '_blank') return;
      e.preventDefault();
      document.body.style.transition = 'opacity 0.45s';
      document.body.style.opacity = '0';
      setTimeout(() => { window.location.href = href; }, 450);
    });
  });

  /* 页面进入淡入 */
  window.addEventListener('pageshow', () => {
    document.body.style.opacity = '0';
    requestAnimationFrame(() => {
      document.body.style.transition = 'opacity 0.6s';
      document.body.style.opacity = '1';
    });
  });
})();
