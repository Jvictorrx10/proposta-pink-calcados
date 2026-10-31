// Assinatura de movimento da Pink. Abaixo dela, a base comum (_base/motion-base.js).
window.assinatura = ({ gsap, ScrollTrigger, mobile }) => {
  const $ = s => document.querySelector(s);
  const $$ = s => gsap.utils.toArray(s);

  // Abertura: foto sobe por trás do cartão, depois o nome em letra cursiva, o título, o texto e os botões.
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.hero-photo', { clipPath: 'inset(100% 0 0 0)', duration: 1.2, ease: 'power4.inOut' })
    .from('.hero-card', { y: 60, opacity: 0, duration: 1 }, '-=.7')
    .from('.hero-wordmark', { x: -40, opacity: 0, rotation: -6, duration: .9 }, '-=.5')
    .fromTo('.hero .intro', { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: .9, stagger: .12 }, '-=.55');

  // Rolando: a foto do topo afunda devagar e o cartão sobe um pouco mais rápido.
  gsap.to('.hero-photo img', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
  if (!mobile) gsap.to('.hero-card', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });

  // Faixa de vantagens vira um letreiro correndo.
  const promo = $('.promo');
  if (promo && !promo.querySelector('.promo-track')) {
    const track = document.createElement('div');
    track.className = 'promo-track';
    track.setAttribute('aria-hidden', 'true');
    const items = [...promo.children].map(s => s.textContent);
    track.innerHTML = Array(4).fill(items.map(t => `<span>${t}</span><i>✦</i>`).join('')).join('');
    promo.append(track);
    promo.classList.add('is-marquee');
  }
  const marquee = gsap.to('.promo-track', { xPercent: -50, ease: 'none', duration: mobile ? 16 : 24, repeat: -1 });

  // Vitrine: categorias e cartões entram em cascata; ao filtrar, os novos cartões sobem de novo.
  gsap.from('.cats button', { y: 24, opacity: 0, stagger: .06, duration: .7, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.cats', start: 'top 90%', once: true } });
  ScrollTrigger.batch('.grid > li', { start: 'top 92%', once: true,
    onEnter: els => gsap.from(els, { y: 50, opacity: 0, scale: .96, duration: .8, ease: 'power3.out', stagger: .08 }) });
  const onVitrine = () => gsap.from('.grid > li', { y: 30, opacity: 0, duration: .55, ease: 'power3.out', stagger: .05, onComplete: () => ScrollTrigger.refresh() });
  document.addEventListener('pink:vitrine', onVitrine);

  // Ao adicionar: a foto do par voa até a sacola, e a sacola pula.
  const onSacola = e => {
    const { id, foto } = e.detail;
    const pdp = $('[data-pdp]');
    const from = (pdp && pdp.open ? pdp.querySelector('[data-pdp-img]') : document.querySelector(`.card[data-id="${id}"] .card-photo img`));
    const to = $('.nav-action');
    if (!from || !to) return;
    const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    const fly = document.createElement('img');
    fly.src = foto; fly.className = 'fly'; fly.alt = '';
    document.body.append(fly);
    const w = 72, h = 90;
    gsap.set(fly, { left: a.left + a.width / 2 - w / 2, top: a.top + a.height / 2 - h / 2, width: w, height: h });
    gsap.timeline({ onComplete: () => fly.remove() })
      .from(fly, { scale: 1.8, opacity: 0, duration: .25 })
      .to(fly, { left: b.left + b.width / 2 - 14, top: b.top + b.height / 2 - 14, width: 28, height: 28, borderRadius: 14, rotation: 12, duration: .7, ease: 'power2.in' })
      .to(fly, { opacity: 0, duration: .15 })
      .fromTo(to, { scale: 1 }, { scale: 1.12, duration: .15, yoyo: true, repeat: 1, ease: 'power2.out' }, '-=.15');
  };
  document.addEventListener('pink:sacola', onSacola);

  // Como funciona: o cupom é "impresso" conforme a rolagem, linha por linha.
  gsap.fromTo('.slip', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', ease: 'none',
    scrollTrigger: { trigger: '.slip', start: 'top 85%', end: mobile ? 'bottom 75%' : 'bottom 60%', scrub: 1 } });
  gsap.from('.slip .row, .slip h3, .slip-total', { x: -16, opacity: 0, stagger: .06, ease: 'power2.out',
    scrollTrigger: { trigger: '.slip', start: 'top 80%', end: 'bottom 65%', scrub: 1 } });

  // Loja: o endereço grande desliza com a rolagem.
  gsap.fromTo('.store-address', { xPercent: mobile ? 0 : 6 }, { xPercent: mobile ? 0 : -4, ease: 'none', scrollTrigger: { trigger: '.store', start: 'top bottom', end: 'bottom top', scrub: 1 } });

  return () => {
    document.removeEventListener('pink:vitrine', onVitrine);
    document.removeEventListener('pink:sacola', onSacola);
    marquee.kill();
  };
};

// Movimento padrão dos sites-demo (estilo TAL): GSAP + ScrollTrigger.
// Como usar: site/motion.js = `window.assinatura = ({ gsap, ScrollTrigger, mobile }) => { ... }` + este arquivo.
// A assinatura roda dentro do gsap.matchMedia (só com movimento permitido) e cuida da abertura (.intro) do site.
// No index.html, antes de app.js:
//   <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
//   <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
// e depois de app.js: <script src="motion.js" defer></script>  (app.js também com defer)
// No <head>, um script que marca html.no-motion se o GSAP não carregar em 2,5s, e no CSS:
//   html.js:not(.no-motion) .reveal, html.js:not(.no-motion) .intro { opacity: 0; }
//   @media (prefers-reduced-motion: reduce) { html.js .reveal, html.js .intro { opacity: 1; } }
//   .backtype { position:absolute; font-size:22vw; white-space:nowrap; pointer-events:none; line-height:.8; }
// Marcações: .reveal (entra ao rolar), .intro (entra na abertura, pela assinatura), [data-parallax] (foto com
// parallax), [data-count] (número que conta), .backtype (palavra gigante).
(() => {
  if (!window.gsap || !window.ScrollTrigger) return; // sem GSAP o site fica como está
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('motion');
  const $$ = s => gsap.utils.toArray(s);

  const mm = gsap.matchMedia();
  mm.add({ motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)', mobile: '(max-width: 860px)' }, ctx => {
    const { motion, mobile } = ctx.conditions;
    if (!motion) { gsap.set('.reveal, .intro', { opacity: 1, y: 0 }); return; }

    // Revelar ao rolar, em cascata
    gsap.set('.reveal', { opacity: 0, y: 26 });
    ScrollTrigger.batch('.reveal', {
      start: 'top 94%', once: true,
      onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: .85, ease: 'power3.out', stagger: .08, overwrite: true }),
    });

    // Fotos com parallax
    $$('[data-parallax]').forEach(img => {
      gsap.fromTo(img, { scale: 1.08, yPercent: -4 }, {
        scale: 1, yPercent: 4, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 },
      });
    });

    // Números que contam até o valor (data-count="447", data-dec="1" para 4,9)
    $$('[data-count]').forEach(el => {
      const fim = parseFloat(el.dataset.count), dec = Number(el.dataset.dec || 0), o = { v: 0 };
      const fmt = v => v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
      gsap.to(o, { v: fim, duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: () => { el.textContent = fmt(o.v); }, onStart: () => { el.textContent = fmt(0); } });
    });

    // Palavras gigantes atravessando a seção
    $$('.backtype').forEach(el => {
      gsap.fromTo(el, { xPercent: mobile ? 5 : 10 }, {
        xPercent: mobile ? -45 : -30, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 },
      });
    });

    // A assinatura pode devolver uma função de limpeza (ex.: remover ouvintes de eventos).
    if (typeof window.assinatura === 'function') return window.assinatura({ gsap, ScrollTrigger, mobile });
  });

  // Recalcula as posições quando fontes e fotos terminam de carregar
  const refresh = () => ScrollTrigger.refresh();
  document.fonts && document.fonts.ready.then(refresh);
  $$('img').forEach(i => { if (!i.complete) i.addEventListener('load', refresh, { once: true }); });
})();
