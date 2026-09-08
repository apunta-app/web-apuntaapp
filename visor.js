// EL VISOR DE CAPTURAS — 08/09/2026.
//
// Al pulsar una captura se abre grande, centrada, sobre un fondo oscuro
// translucido. Se cierra con la X, pulsando fuera y con Escape.
//
// SIN LIBRERIAS Y SIN CDN, a proposito: el resto de la web no usa ninguna y
// no se va a empezar ahora.
//
// UN SOLO FICHERO PARA LAS DOS PAGINAS. Si el visor viviera dentro de cada
// HTML habria dos copias de lo mismo, y el dia que se arregle un fallo en una
// la otra se queda atras sin que nada avise.
//
// Y EL MARCADO SE CONSTRUYE AQUI, no en el HTML. Por eso las dos paginas solo
// llevan UNA linea -la del <script>- y la de autonomos no cambia ni una linea
// de sus capturas.
(function () {
    'use strict';

    // Las de la galeria, y la grande del hero de gestorias (08/09/2026).
    //
    // 🔴 `.captura-escritorio` y no `.hero-imagen img`: esa clase es SOLO la
    // del hero de gestorias. El hero de autonomos lleva `.captura-movil`, y
    // esa pagina no se toca.
    var capturas = document.querySelectorAll('.captura-item img, .captura-escritorio');
    if (!capturas.length) return;

    // ---- el visor, montado una vez ----------------------------------------
    var fondo = document.createElement('div');
    fondo.className = 'visor';
    fondo.setAttribute('role', 'dialog');
    fondo.setAttribute('aria-modal', 'true');
    fondo.setAttribute('aria-label', 'Captura ampliada');
    fondo.hidden = true;

    var caja = document.createElement('div');
    caja.className = 'visor-caja';

    var grande = document.createElement('img');
    grande.className = 'visor-imagen';

    var pie = document.createElement('p');
    pie.className = 'visor-pie';

    var cerrar = document.createElement('button');
    cerrar.type = 'button';
    cerrar.className = 'visor-cerrar';
    cerrar.setAttribute('aria-label', 'Cerrar la ampliacion');
    cerrar.textContent = '×'; // ×

    caja.appendChild(grande);
    caja.appendChild(pie);
    fondo.appendChild(cerrar);
    fondo.appendChild(caja);
    document.body.appendChild(fondo);

    // Quien lo abrio, para devolverle el foco al cerrar: quien llego a la
    // captura tabulando tiene que volver a donde estaba, no al principio.
    var queLaAbrio = null;

    function abrir(img) {
        grande.src = img.currentSrc || img.src;
        grande.alt = img.alt || '';
        var suPie = img.parentNode.querySelector('.captura-pie');
        pie.textContent = suPie ? suPie.textContent : '';
        pie.hidden = !pie.textContent;
        queLaAbrio = img;
        fondo.hidden = false;
        document.body.classList.add('con-visor');
        cerrar.focus();
    }

    function cerrarlo() {
        if (fondo.hidden) return;
        fondo.hidden = true;
        // Se suelta la imagen: una captura grande no tiene por que quedarse
        // en memoria mientras se sigue leyendo la pagina.
        grande.removeAttribute('src');
        document.body.classList.remove('con-visor');
        if (queLaAbrio) {
            queLaAbrio.focus();
            queLaAbrio = null;
        }
    }

    // ---- cada captura, pulsable y alcanzable con el teclado ---------------
    Array.prototype.forEach.call(capturas, function (img) {
        img.tabIndex = 0;
        img.setAttribute('role', 'button');
        img.setAttribute('aria-haspopup', 'dialog');
        if (!img.title) img.title = 'Pulsa para verla en grande';

        img.addEventListener('click', function () {
            abrir(img);
        });

        img.addEventListener('keydown', function (e) {
            // Enter y espacio, que es lo que hace un boton de verdad.
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                abrir(img);
            }
        });
    });

    // ---- las tres formas de cerrar ----------------------------------------
    cerrar.addEventListener('click', cerrarlo);

    // Pulsar FUERA cierra. Pulsar la imagen o su pie, no: quien quiere mirar
    // la captura de cerca no tiene por que cerrarla sin querer.
    fondo.addEventListener('click', function (e) {
        if (e.target === fondo || e.target === caja) cerrarlo();
    });

    document.addEventListener('keydown', function (e) {
        if (fondo.hidden) return;
        if (e.key === 'Escape' || e.key === 'Esc') {
            cerrarlo();
            return;
        }
        // Con el visor abierto el foco no se escapa por detras: si no, se
        // tabula por una pagina que no se ve.
        if (e.key === 'Tab') {
            e.preventDefault();
            cerrar.focus();
        }
    });
})();
