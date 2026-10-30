(() => {
  const D = window.PINK;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const img = (id, w, h) => `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&fm=webp&q=70`;
  const MAX = 3;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Estado ----------
  let cat = D.categorias[0];
  let model = cat.modelos[0];
  let size = null;
  let bag = [];
  try { bag = JSON.parse(localStorage.getItem('pink-sacola') || '[]').slice(0, MAX); } catch (e) {}
  const save = () => { try { localStorage.setItem('pink-sacola', JSON.stringify(bag)); } catch (e) {} };

  // ---------- Avisos ----------
  const toastEl = $('[data-toast]');
  let toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('is-on'), 4200);
  }

  // ---------- WhatsApp ----------
  // Com número confirmado: wa.me/<numero>?text=. Só com o link curto da bio: copia o texto e abre o link.
  async function sendWhatsApp(text) {
    const n = (D.whatsapp.numero || '').replace(/\D/g, '');
    if (n) {
      window.open(`https://wa.me/${n}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
      return;
    }
    let copied = false;
    try { await navigator.clipboard.writeText(text); copied = true; } catch (e) {}
    if (D.whatsapp.link) window.open(D.whatsapp.link, '_blank', 'noopener');
    toast(copied
      ? 'Mensagem copiada. Cole na conversa com a Pink e envie.'
      : 'Não deu para copiar sozinho. Copie a mensagem da sacola e cole no WhatsApp.');
  }
  const pageUrl = () => location.href.split('#')[0];

  // ---------- Catálogo ----------
  const tabsEl = $('[data-tabs]');
  const modelsEl = $('[data-models]');
  const sizesEl = $('[data-sizes]');
  const photo = $('[data-model-photo]');

  tabsEl.innerHTML = D.categorias.map(c =>
    `<button type="button" role="tab" id="tab-${c.id}" data-cat="${c.id}" aria-selected="false">${c.nome}</button>`).join('');
  sizesEl.innerHTML = D.numeracao.map(n =>
    `<button type="button" data-size="${n}" aria-pressed="false" aria-label="Número ${n}">${n}</button>`).join('');

  function renderCat() {
    $$('button', tabsEl).forEach(b => b.setAttribute('aria-selected', String(b.dataset.cat === cat.id)));
    $('[data-brands]').textContent = `Marcas desta seção na loja: ${cat.marcas}.`;
    modelsEl.innerHTML = cat.modelos.map(m =>
      `<button type="button" data-model="${m.id}" aria-pressed="false" aria-label="${m.nome}">
        <img src="${img(m.foto, 168, 168)}" width="84" height="84" alt="" loading="lazy"></button>`).join('');
    renderModel();
  }
  function renderModel() {
    $$('button', modelsEl).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.model === model.id)));
    $('[data-model-name]').textContent = model.nome;
    $('[data-model-text]').textContent = model.texto;
    const src = img(model.foto, 900, 900);
    if (photo.getAttribute('src') !== src) {
      photo.classList.add('is-swapping');
      setTimeout(() => { photo.src = src; photo.alt = `${model.nome} (imagem ilustrativa)`; }, reduced ? 0 : 200);
      photo.onload = () => photo.classList.remove('is-swapping');
    }
    photo.alt = `${model.nome} (imagem ilustrativa)`;
  }
  function renderSizes() {
    $$('button', sizesEl).forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.size) === size)));
  }

  tabsEl.addEventListener('click', e => {
    const b = e.target.closest('[data-cat]'); if (!b) return;
    cat = D.categorias.find(c => c.id === b.dataset.cat);
    model = cat.modelos[0];
    renderCat();
  });
  tabsEl.addEventListener('keydown', e => {
    if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
    const i = D.categorias.indexOf(cat);
    const next = D.categorias[(i + (e.key === 'ArrowRight' ? 1 : -1) + D.categorias.length) % D.categorias.length];
    cat = next; model = cat.modelos[0]; renderCat(); $(`#tab-${cat.id}`).focus();
  });
  modelsEl.addEventListener('click', e => {
    const b = e.target.closest('[data-model]'); if (!b) return;
    model = cat.modelos.find(m => m.id === b.dataset.model);
    renderModel();
  });
  sizesEl.addEventListener('click', e => {
    const b = e.target.closest('[data-size]'); if (!b) return;
    const n = Number(b.dataset.size);
    size = size === n ? null : n;
    renderSizes();
  });

  $('[data-add]').addEventListener('click', () => {
    if (!size) { toast('Escolha o seu número antes.'); sizesEl.querySelector('button').focus(); return; }
    if (bag.some(i => i.id === model.id && i.size === size)) { toast('Esse par já está na sacola.'); return; }
    if (bag.length >= MAX) { toast(`A sacola leva até ${MAX} pares. Envie estes e continue depois.`); return; }
    bag.push({ id: model.id, nome: model.nome, foto: model.foto, size });
    save(); renderBag();
    toast(`${model.nome}, número ${size}, na sacola.`);
  });
  $('[data-ask]').addEventListener('click', () => {
    const n = size ? `no número ${size}` : 'no meu número';
    sendWhatsApp(`Oi, Pink! Vi no site o modelo "${model.nome}" (${cat.nome}). Tem ${n}? Qual o preço?\n${pageUrl()}`);
  });
  $('[data-ask-general]').addEventListener('click', () => {
    sendWhatsApp(`Oi, Pink! Vim pelo site e queria tirar uma dúvida.\n${pageUrl()}`);
  });

  // ---------- Sacola ----------
  const dlg = $('[data-bag]');
  const bagbar = $('[data-bagbar]');
  function bagMessage() {
    const nome = $('[data-bag-name]').value.trim();
    const receber = $('input[name="receber"]:checked').value;
    const linhas = bag.map((i, k) => `${k + 1}. ${i.nome} — número ${i.size}`).join('\n');
    return `Oi, Pink!${nome ? ` Aqui é ${nome}.` : ''} Montei uma sacola no site:\n${linhas}\n` +
      `Prefiro ${receber}. Pode me passar preço e disponibilidade?\n${pageUrl()}`;
  }
  function renderBag() {
    $$('[data-bag-count]').forEach(el => { el.textContent = bag.length; });
    $('[data-bag-word]').textContent = bag.length === 1 ? 'par' : 'pares';
    bagbar.hidden = bag.length === 0 || dlg.open;
    $('[data-bag-empty]').hidden = bag.length > 0;
    $('[data-send]').disabled = bag.length === 0;
    $('[data-bag-list]').innerHTML = bag.map((i, k) =>
      `<li><img src="${img(i.foto, 144, 144)}" width="72" height="72" alt="">
        <span>${i.nome}<small>Número ${i.size}</small></span>
        <button class="linkbtn" type="button" data-remove="${k}" aria-label="Tirar ${i.nome} da sacola">Tirar</button></li>`).join('');
  }
  function openBag(e) {
    if (e) e.preventDefault();
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    renderBag();
  }
  $$('[data-open-bag]').forEach(b => b.addEventListener('click', openBag));
  $('[data-close-bag]').addEventListener('click', () => dlg.close());
  dlg.addEventListener('close', renderBag);
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  $('[data-bag-list]').addEventListener('click', e => {
    const b = e.target.closest('[data-remove]'); if (!b) return;
    bag.splice(Number(b.dataset.remove), 1); save(); renderBag();
  });
  $('[data-send]').addEventListener('click', () => { if (bag.length) sendWhatsApp(bagMessage()); });
  if (D.whatsapp.numero) $('[data-send-note]').textContent = 'O WhatsApp da Pink abre com a sacola escrita. A consultora confirma preço, número e entrega.';

  // ---------- Horário ----------
  $('[data-hours]').innerHTML = D.horario.map(([d, h]) => `<dt>${d}</dt><dd>${h}</dd>`).join('');

  // ---------- Foto do topo: troca lenta ----------
  const heroImgs = $$('.hero-photo img');
  if (!reduced && heroImgs.length > 1) {
    let i = 0, timer;
    const tick = () => {
      heroImgs[i].classList.remove('is-on');
      i = (i + 1) % heroImgs.length;
      heroImgs[i].classList.add('is-on');
    };
    const start = () => { clearInterval(timer); timer = setInterval(tick, 5600); };
    document.addEventListener('visibilitychange', () => (document.hidden ? clearInterval(timer) : start()));
    start();
  }

  // ---------- Entradas ----------
  const io = 'IntersectionObserver' in window && new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach((el, k) => {
    const sib = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
    el.style.transitionDelay = `${sib.indexOf(el) * 80}ms`;
    if (io) io.observe(el); else el.classList.add('is-in');
  });

  renderCat();
  renderSizes();
  renderBag();
})();
