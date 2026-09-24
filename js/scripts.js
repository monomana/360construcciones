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
  const track = document.getElementById('galeriaTrack');
  const carAnterior = document.getElementById('carAnterior');
  const carSiguiente = document.getElementById('carSiguiente');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');

  let proyectos = [];
  let filtroActivo = null; // null = carrusel general (una foto por proyecto)
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
    // Proyectos primero y "Todos" al final
    const btns = [...proyectos, { id: 'todos', nombre: 'Todos' }];
    filtrosCont.innerHTML = '';
    btns.forEach(p => {
      const b = document.createElement('button');
      b.className = 'galeria-filtro' + (p.id === filtroActivo ? ' activo' : '');
      b.textContent = p.nombre;
      b.dataset.id = p.id;
      b.addEventListener('click', () => {
        // Clic en el proyecto activo → vuelve a la vista general (una foto por proyecto)
        filtroActivo = (filtroActivo === p.id) ? null : p.id;
        renderCarrusel();
        renderFiltros();
      });
      filtrosCont.appendChild(b);
    });
  }

  // Construye el conjunto de slides según el filtro:
  // - null: una foto por proyecto, con el nombre como título
  // - 'todos': todas las fotos de todos los proyectos
  // - proyecto: todas las fotos del proyecto seleccionado
  function construirSlides() {
    if (filtroActivo === null) {
      return proyectos.map(p => ({
        ...p.fotos[0],
        proyecto: p.nombre,
        titulo: p.nombre,
        esProyecto: true,
        idProyecto: p.id
      }));
    }
    if (filtroActivo === 'todos') {
      return proyectos.flatMap(p => p.fotos.map(f => ({
        ...f,
        proyecto: p.nombre,
        titulo: p.nombre + ' · ' + (f.alt.split(' - foto ')[1] || '')
      })));
    }
    const proy = proyectos.find(p => p.id === filtroActivo);
    return proy.fotos.map(f => ({
      ...f,
      proyecto: proy.nombre,
      titulo: proy.nombre + ' · ' + (f.alt.split(' - foto ')[1] || '')
    }));
  }

  function renderCarrusel() {
    fotosActuales = construirSlides();
    track.innerHTML = '';

    fotosActuales.forEach((foto, idx) => {
      const slide = document.createElement('div');
      slide.className = 'galeria-slide';
      slide.title = foto.titulo;

      const img = document.createElement('img');
      img.src = foto.thumb;
      img.alt = foto.alt;
      img.loading = 'lazy';
      slide.appendChild(img);

      const cap = document.createElement('div');
      cap.className = 'galeria-caption';
      // En la vista general (null) mostramos el nombre del proyecto,
      // en el resto mostramos nombre + número de foto
      cap.textContent = foto.esProyecto ? foto.proyecto : foto.titulo;
      slide.appendChild(cap);

      // Click en la foto general → entra al proyecto; si no → lightbox
      slide.addEventListener('click', () => {
        if (foto.esProyecto) {
          filtroActivo = foto.idProyecto;
          renderCarrusel();
          renderFiltros();
        } else {
          abrirLightbox(idx);
        }
      });

      track.appendChild(slide);
    });
    fotoActual = 0;
  }

  function moverCarrusel(delta) {
    if (!fotosActuales.length) return;
    fotoActual = (fotoActual + delta + fotosActuales.length) % fotosActuales.length;
    const slide = track.children[fotoActual];
    if (slide) slide.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  carAnterior.addEventListener('click', () => moverCarrusel(-1));
  carSiguiente.addEventListener('click', () => moverCarrusel(1));

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
      renderFiltros();
      renderCarrusel();
    })
    .catch(err => {
      console.error('No se pudo cargar la galería:', err);
      track.innerHTML = '<p>No se pudo cargar la galería.</p>';
    });

});