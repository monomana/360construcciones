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

  const grid = document.getElementById('galeriaGrid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxTitulo = document.getElementById('lightboxTitulo');

  let proyectos = [];
  let fotosActuales = [];
  let fotoActual = 0;

  // Quita los parámetros de tracking de las URLs de Instagram
  document.querySelectorAll('a[href*="instagram.com"]').forEach(a => {
    const href = a.getAttribute('href');
    if (href.startsWith('http')) {
      a.setAttribute('href', href.split('?')[0]);
    }
  });

  // Tarjetas: una por proyecto con la primera foto como miniatura
  function renderTarjetas() {
    grid.innerHTML = '';
    proyectos.forEach(proyecto => {
      const card = document.createElement('article');
      card.className = 'proyecto-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', 'Ver fotos de ' + proyecto.nombre);

      const img = document.createElement('img');
      img.src = proyecto.fotos[0].thumb;
      img.alt = proyecto.nombre;
      img.loading = 'lazy';
      card.appendChild(img);

      const count = document.createElement('span');
      count.className = 'proyecto-card-count';
      count.textContent = proyecto.fotos.length + ' foto' + (proyecto.fotos.length === 1 ? '' : 's');
      card.appendChild(count);

      const info = document.createElement('div');
      info.className = 'proyecto-card-info';
      const h3 = document.createElement('h3');
      h3.textContent = proyecto.nombre;
      const sub = document.createElement('span');
      sub.textContent = 'Ver fotos →';
      info.appendChild(h3);
      info.appendChild(sub);
      card.appendChild(info);

      card.addEventListener('click', () => abrirModal(proyecto));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          abrirModal(proyecto);
        }
      });

      grid.appendChild(card);
    });
  }

  function abrirModal(proyecto) {
    fotosActuales = proyecto.fotos.map(f => ({ ...f, proyecto: proyecto.nombre }));
    fotoActual = 0;
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
    lightboxTitulo.textContent = foto.proyecto;
    lightboxImg.src = encodeURI(foto.full);
    lightboxImg.alt = foto.alt;
    lightboxCaption.textContent = (fotoActual + 1) + ' / ' + fotosActuales.length;
  }

  function moverLightbox(delta) {
    fotoActual = (fotoActual + delta + fotosActuales.length) % fotosActuales.length;
    actualizarLightbox();
  }

  document.getElementById('lightboxCerrar').addEventListener('click', cerrarLightbox);
  document.getElementById('lightboxAnterior').addEventListener('click', () => moverLightbox(-1));
  document.getElementById('lightboxSiguiente').addEventListener('click', () => moverLightbox(1));

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) cerrarLightbox();
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('abierto')) return;
    if (e.key === 'Escape') cerrarLightbox();
    if (e.key === 'ArrowLeft') moverLightbox(-1);
    if (e.key === 'ArrowRight') moverLightbox(1);
  });

  fetch('galeria-data.json')
    .then(r => r.json())
    .then(data => {
      proyectos = data;
      renderTarjetas();
    })
    .catch(err => {
      console.error('No se pudo cargar la galería:', err);
      grid.innerHTML = '<p>No se pudo cargar la galería.</p>';
    });

});