(function () {
  'use strict';

  // 1. Menu hambúrguer
  var header = document.getElementById('topo');
  var burger = document.getElementById('burger');
  burger.addEventListener('click', function () {
    var open = header.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  document.querySelectorAll('.menu a').forEach(function (a) {
    a.addEventListener('click', function () {
      header.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Abrir menu');
    });
  });

  // 2. Link ativo conforme a rolagem
  var links = [].slice.call(document.querySelectorAll('.menu a'));
  var secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = secs.indexOf(e.target);
        links.forEach(function (l, j) { l.classList.toggle('active', j === i); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(function (s) { if (s) io.observe(s); });
  }

  // 3. Ano atual no rodapé
  document.getElementById('ano').textContent = new Date().getFullYear();

  // 4. Efeito de digitação no cargo (desligado com prefers-reduced-motion)
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var roleEl = document.getElementById('role-text');
  var roles = ['Desenvolvedor Back-end', 'Automação com Python', 'APIs com FastAPI e NestJS'];
  if (roleEl && !reduce) {
    var r = 0, c = roles[0].length, deleting = true;
    var tick = function () {
      if (deleting) {
        c--;
        if (c <= 0) { deleting = false; r = (r + 1) % roles.length; }
      } else {
        c++;
        if (c >= roles[r].length) { deleting = true; roleEl.textContent = roles[r]; return setTimeout(tick, 2200); }
      }
      roleEl.textContent = roles[r].slice(0, Math.max(c, 0));
      setTimeout(tick, deleting ? 45 : 85);
    };
    setTimeout(tick, 2600);
  }

  // 5. Currículo: avisa se o PDF ainda não foi colocado em assets/
  var cv = document.getElementById('cv-btn');
  if (cv && location.protocol !== 'file:' && window.fetch) {
    fetch(cv.getAttribute('href'), { method: 'HEAD' }).then(function (res) {
      if (!res.ok) markCvMissing();
    }).catch(function () {});
  }
  function markCvMissing() {
    cv.addEventListener('click', function (e) {
      e.preventDefault();
      cv.querySelector('span').textContent = 'Currículo em breve';
    });
  }

  // 6. Formulário (Formspree)
  var form = document.getElementById('form');
  var note = document.getElementById('form-note');
  var setNote = function (msg, ok) { note.textContent = msg; note.classList.toggle('ok', !!ok); };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var filled = [].every.call(form.querySelectorAll('[required]'), function (f) { return f.value.trim(); });
    if (!filled) return setNote('Preencha nome, e-mail e mensagem para continuar.');
    if (!/^\S+@\S+\.\S+$/.test(form.email.value)) return setNote('Confira o e-mail: ele precisa ter o formato nome@dominio.com.');

    if (form.action.indexOf('SEU_ID') !== -1) {
      return setNote('Formulário ainda não configurado. Por enquanto, escreva para richardmarques923@gmail.com.');
    }

    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    setNote('Enviando...');
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (res.ok) { form.reset(); setNote('Mensagem enviada! Respondo em breve.', true); }
        else setNote('Não consegui enviar agora. Tente de novo ou escreva para richardmarques923@gmail.com.');
      })
      .catch(function () { setNote('Sem conexão. Tente de novo ou escreva para richardmarques923@gmail.com.'); })
      .then(function () { btn.disabled = false; });
  });
})();
