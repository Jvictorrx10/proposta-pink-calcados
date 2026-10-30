(() => {
  const D = window.PINK;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const img = (id, w, h) => `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&fm=webp&q=70`;
  const brl = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const MAX = 6;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Produtos ----------
  const produtos = D.categorias.flatMap(c => c.modelos.map(m => ({ ...m, cat: c.id, catNome: c.nome })));
  const byId = id => produtos.find(p => p.id === id);

  // ---------- Estado ----------
  let filtro = 'todos';
  const picked = {}; // número escolhido em cada cartão
  let bag = [];
  try { bag = JSON.parse(localStorage.getItem('pink-sacola') || '[]').filter(i => byId(i.id)).slice(0, MAX); } catch (e) {}
  const save = () => { try { localStorage.setItem('pink-sacola', JSON.stringify(bag.map(({ id, size }) => ({ id, size })))); } catch (e) {} };

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

  // ---------- Vitrine ----------
  const catsEl = $('[data-cats]');
  const gridEl = $('[data-grid]');
  const cats = [{ id: 'todos', nome: 'Todos', foto: '1786396798387-f1eb58ab4d15' },
    ...D.categorias.map(c => ({ id: c.id, nome: c.nome, foto: c.modelos[0].foto }))];

  catsEl.innerHTML = cats.map(c =>
    `<button type="button" data-cat="${c.id}" aria-pressed="false">
      <img src="${img(c.foto, 160, 160)}" width="80" height="80" alt="" loading="lazy"><span>${c.nome}</span></button>`).join('');

  function card(p) {
    const off = Math.round((1 - p.por / p.de) * 100);
    const sizes = D.numeracao.map(n => {
      const out = p.esgotados.includes(n);
      return `<button type="button" data-size="${n}" aria-pressed="${picked[p.id] === n}" ${out ? 'disabled' : ''}
        aria-label="Número ${n}${out ? ', esgotado' : ''}">${n}</button>`;
    }).join('');
    return `<li class="card" data-id="${p.id}">
      <div class="card-photo"><img src="${img(p.foto, 600, 750)}" width="600" height="750" alt="${p.nome} (imagem ilustrativa)" loading="lazy"><span class="off">-${off}%</span></div>
      <p class="card-cat">${p.catNome}</p>
      <h3>${p.nome}</h3>
      <p class="price"><s>${brl(p.de)}</s> <b>${brl(p.por)}</b></p>
      <div class="card-sizes" role="group" aria-label="Número">${sizes}</div>
      <button class="card-add" type="button" data-add>Adicionar à sacola</button>
    </li>`;
  }
  const tile = `<li class="tile">
      <p class="script">Pink</p>
      <p>Chega novidade toda semana. Veja o que entrou no Instagram.</p>
      <a href="https://www.instagram.com/pinkcuritiba/" target="_blank" rel="noopener">@pinkcuritiba</a>
    </li>`;

  function renderShop() {
    $$('button', catsEl).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cat === filtro)));
    const lista = filtro === 'todos' ? produtos : produtos.filter(p => p.cat === filtro);
    const c = D.categorias.find(x => x.id === filtro);
    $('[data-brands]').textContent = c ? `Marcas de ${c.nome.toLowerCase()} na loja: ${c.marcas}.` : 'Marcas na loja: Vizzano, Moleca, Beira Rio e Actvitta.';
    gridEl.innerHTML = lista.map(card).join('') + (filtro === 'todos' ? tile : '');
  }

  catsEl.addEventListener('click', e => {
    const b = e.target.closest('[data-cat]'); if (!b) return;
    filtro = b.dataset.cat;
    renderShop();
  });

  gridEl.addEventListener('click', e => {
    const li = e.target.closest('.card'); if (!li) return;
    const p = byId(li.dataset.id);
    const s = e.target.closest('[data-size]');
    if (s) {
      const n = Number(s.dataset.size);
      picked[p.id] = picked[p.id] === n ? undefined : n;
      $$('[data-size]', li).forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.size) === picked[p.id])));
      li.classList.remove('needs-size');
      return;
    }
    if (!e.target.closest('[data-add]')) return;
    const size = picked[p.id];
    if (!size) {
      li.classList.remove('needs-size'); void li.offsetWidth; li.classList.add('needs-size');
      toast('Escolha o número antes.');
      return;
    }
    if (bag.some(i => i.id === p.id && i.size === size)) { toast('Esse par já está na sacola.'); return; }
    if (bag.length >= MAX) { toast(`A sacola leva até ${MAX} pares. Finalize estes e continue depois.`); return; }
    bag.push({ id: p.id, size });
    save(); renderBag();
    toast(`${p.nome}, número ${size}, na sacola.`);
  });

  $('[data-ask-general]').addEventListener('click', () => {
    sendWhatsApp(`Oi, Pink! Vim pelo site e queria tirar uma dúvida.\n${pageUrl()}`);
  });

  // ---------- Sacola ----------
  const dlg = $('[data-bag]');
  const bagbar = $('[data-bagbar]');
  const total = () => bag.reduce((t, i) => t + byId(i.id).por, 0);
  function bagMessage() {
    const nome = $('[data-bag-name]').value.trim();
    const receber = $('input[name="receber"]:checked').value;
    const linhas = bag.map((i, k) => { const p = byId(i.id); return `${k + 1}. ${p.nome} — número ${i.size} — ${brl(p.por)}`; }).join('\n');
    return `Oi, Pink!${nome ? ` Aqui é ${nome}.` : ''} Montei uma sacola no site:\n${linhas}\nTotal: ${brl(total())}\n` +
      `Prefiro ${receber}. Pode confirmar se tem esses números?\n${pageUrl()}`;
  }
  function renderBag() {
    $$('[data-bag-count]').forEach(el => { el.textContent = bag.length; });
    $$('[data-bag-total]').forEach(el => { el.textContent = brl(total()); });
    $('[data-bag-word]').textContent = bag.length === 1 ? 'par' : 'pares';
    bagbar.hidden = bag.length === 0 || dlg.open;
    $('[data-bag-empty]').hidden = bag.length > 0;
    $('[data-send]').disabled = bag.length === 0;
    $('[data-bag-list]').innerHTML = bag.map((i, k) => {
      const p = byId(i.id);
      return `<li><img src="${img(p.foto, 144, 144)}" width="72" height="72" alt="">
        <span>${p.nome}<small>Número ${i.size} · ${brl(p.por)}</small></span>
        <button class="linkbtn" type="button" data-remove="${k}" aria-label="Tirar ${p.nome} da sacola">Tirar</button></li>`;
    }).join('') + (bag.length ? `<li class="bag-sum"><span>Total <small>preços ilustrativos</small></span><b>${brl(total())}</b></li>` : '');
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
  if (D.whatsapp.numero) $('[data-send-note]').textContent = 'O WhatsApp da Pink abre com a sacola escrita. A consultora confirma número, pagamento e entrega.';

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
  $$('.reveal').forEach(el => {
    const sib = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
    el.style.transitionDelay = `${sib.indexOf(el) * 80}ms`;
    if (io) io.observe(el); else el.classList.add('is-in');
  });

  renderShop();
  renderBag();
})();
