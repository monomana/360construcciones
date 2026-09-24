document.addEventListener('DOMContentLoaded', () => {

  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });

  const form = document.getElementById('contactForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.btn');
    const original = btn.textContent;
    btn.textContent = 'Mensaje enviado ✓';
    btn.style.background = '#22c55e';
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
      form.reset();
    }, 3000);
  });

  /* ===================== Galería ===================== */

  const filtrosCont = document.getElementById('galeriaFiltros');
  const grid = document.getElementById('galeriaGrid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');

  let proyectos = [];
  let filtroActivo = 'todos';
  let fotosActuales = [];
  let fotoActual = 0;

  // Quita los parámetros de tracking de las URLs de Instagram
  document.querySelectorAll('a[href*="instagram.com"]').forEach(a => {
    const href = a.getAttribute('href');
    if (href.startsWith('http')) {
      a.setAttribute('href', href.split('?')[0]);
    }
  });

  function renderFiltros() {
    const btns = [{ id: 'todos', nombre: 'Todos' }, ...proyectos];
    filtrosCont.innerHTML = '';
    btns.forEach(p => {
      const b = document.createElement('button');
      b.className = 'galeria-filtro' + (p.id === filtroActivo ? ' activo' : '');
      b.textContent = p.nombre;
      b.dataset.id = p.id;
      b.addEventListener('click', () => {
        filtroActivo = p.id;
        renderGrid();
        renderFiltros();
      });
      filtrosCont.appendChild(b);
    });
  }

  function renderGrid() {
    grid.innerHTML = '';
    fotosActuales = filtroActivo === 'todos'
      ? proyectos.flatMap(p => p.fotos.map(f => ({ ...f, proyecto: p.nombre })))
      : proyectos.find(p => p.id === filtroActivo).fotos;

    fotosActuales.forEach((foto, idx) => {
      const art = document.createElement('article');
      const img = document.createElement('img');
      img.src = foto.thumb;
      img.alt = foto.alt;
      img.loading = 'lazy';
      img.addEventListener('click', () => abrirLightbox(idx));
      art.appendChild(img);
      grid.appendChild(art);
    });
  }

  function abrirLightbox(idx) {
    fotoActual = idx;
    actualizarLightbox();
    lightbox.classList.add('abierto');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function cerrarLightbox() {
    lightbox.classList.remove('abierto');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function actualizarLightbox() {
    const foto = fotosActuales[fotoActual];
    lightboxImg.src = encodeURI(foto.full);
    lightboxImg.alt = foto.alt;
    lightboxCaption.textContent = foto.proyecto + ' · ' + (fotoActual + 1) + ' / ' + fotosActuales.length;
  }

  function mover(delta) {
    fotoActual = (fotoActual + delta + fotosActuales.length) % fotosActuales.length;
    actualizarLightbox();
  }

  document.getElementById('lightboxCerrar').addEventListener('click', cerrarLightbox);
  document.getElementById('lightboxAnterior').addEventListener('click', () => mover(-1));
  document.getElementById('lightboxSiguiente').addEventListener('click', () => mover(1));

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) cerrarLightbox();
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('abierto')) return;
    if (e.key === 'Escape') cerrarLightbox();
    if (e.key === 'ArrowLeft') mover(-1);
    if (e.key === 'ArrowRight') mover(1);
  });

  fetch('galeria-data.json')
    .then(r => r.json())
    .then(data => {
      proyectos = data;
      renderFiltros();
      renderGrid();
    })
    .catch(err => {
      console.error('No se pudo cargar la galería:', err);
      grid.innerHTML = '<p>No se pudo cargar la galería.</p>';
    });

});