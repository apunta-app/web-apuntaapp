// CHAT DE AYUDA de apuntaapp.com
// La ventanita habla con el portero (Cloudflare Worker), que es quien llama a
// Claude. Sirve para los dos chats: el atributo data-bot de la ventanita dice
// cuál es («movil» o «escritorio»).
//
// Cómo va «¿Te he resuelto la duda?»:
// - Después de cada respuesta normal, la ventanita lo pregunta. Solo la
//   última pregunta tiene botones; al contestar, los botones se quitan y la
//   respuesta queda como un mensaje del visitante.
// - Escribir «no» o «sí» en la caja cuenta igual que pulsar el botón.
// - «Sí, gracias»: contesta la ventanita sola, sin gastar nada.
// - «No»: se le pide al asistente que lo vuelva a intentar. Cada duda lleva
//   su cuenta; al tercer «No», la ventanita manda a WhatsApp sola.
// - Si el asistente manda a WhatsApp o contesta que no da consejo fiscal ni
//   legal, no se pregunta.
(function () {
    var PORTERO = 'https://apunta-portero.apunta-portero.workers.dev';
    var WHATSAPP = 'https://wa.me/34680352807';
    var NO_PARA_WHATSAPP = 3;
    var MAX_HISTORIAL = 12;
    var TEXTO_WHATSAPP_NO = 'Siento no estar sabiendo ayudarte con esto. Te recomiendo que escribas a nuestro servicio de atención al cliente por WhatsApp: lo verán contigo.';
    var TEXTO_SIN_CONEXION = 'Ahora mismo no puedo responderte. Escribe a nuestro servicio de atención al cliente por WhatsApp y te ayudan.';

    var burbuja = document.querySelector('.chat-burbuja');
    var ventana = document.querySelector('.chat-ventana');
    var cerrar = document.querySelector('.chat-cerrar');
    var mensajes = document.querySelector('.chat-mensajes');
    var formulario = document.querySelector('.chat-formulario');
    var entrada = document.querySelector('.chat-entrada');
    var enviar = document.querySelector('.chat-enviar');
    var enlacesAbrir = document.querySelectorAll('[data-abrir-chat]');
    var bot = ventana.getAttribute('data-bot');

    // Lo que se le manda al portero: {rol: 'visitante'|'asistente', texto}.
    var historial = [];
    var esperando = false;

    function abrir() {
        ventana.hidden = false;
        document.body.classList.add('chat-abierto');
        burbuja.setAttribute('aria-expanded', 'true');
        bajar();
        entrada.focus({ preventScroll: true });
    }

    function cerrarVentana() {
        ventana.hidden = true;
        document.body.classList.remove('chat-abierto');
        burbuja.setAttribute('aria-expanded', 'false');
        burbuja.focus({ preventScroll: true });
    }

    burbuja.addEventListener('click', function () {
        if (ventana.hidden) { abrir(); } else { cerrarVentana(); }
    });
    cerrar.addEventListener('click', cerrarVentana);
    enlacesAbrir.forEach(function (enlace) {
        enlace.addEventListener('click', abrir);
    });
    document.addEventListener('keydown', function (evento) {
        if (evento.key === 'Escape' && !ventana.hidden) { cerrarVentana(); }
    });

    function bajar() {
        mensajes.scrollTop = mensajes.scrollHeight;
    }

    // Texto del asistente → HTML seguro: se escapa todo y solo se convierten
    // en enlace los [texto](https://apuntaapp.com/pagina.html).
    function aHtml(texto) {
        var seguro = texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        seguro = seguro.replace(/\[([^\]]{1,80})\]\((https:\/\/apuntaapp\.com\/[a-z0-9\-]+\.html)\)/g,
            '<a href="$2">$1</a>');
        return seguro.split(/\n\s*\n/).map(function (parrafo) {
            return '<p>' + parrafo.trim().replace(/\n/g, '<br>') + '</p>';
        }).join('');
    }

    function anadirVisitante(texto) {
        var mensaje = document.createElement('div');
        mensaje.className = 'chat-mensaje chat-mensaje-visitante';
        mensaje.textContent = texto;
        mensajes.appendChild(mensaje);
        bajar();
    }

    function anadirAsistente(texto, conWhatsApp) {
        var mensaje = document.createElement('div');
        mensaje.className = 'chat-mensaje chat-mensaje-asistente';
        mensaje.innerHTML = aHtml(texto);
        if (conWhatsApp) {
            var plantilla = document.getElementById('plantilla-whatsapp');
            var boton = plantilla.content.firstElementChild.cloneNode(true);
            boton.href = WHATSAPP;
            mensaje.appendChild(boton);
        }
        mensajes.appendChild(mensaje);
        bajar();
    }

    function apuntar(rol, texto) {
        historial.push({ rol: rol, texto: texto });
    }

    // Las últimas entradas, empezando siempre por el visitante.
    function historialParaEnviar() {
        var recorte = historial.slice(-MAX_HISTORIAL);
        while (recorte.length && recorte[0].rol !== 'visitante') { recorte.shift(); }
        return recorte;
    }

    function preguntarSiResuelto(noes) {
        var bloque = document.createElement('div');
        bloque.className = 'chat-valoracion';
        bloque.setAttribute('data-noes', String(noes));
        bloque.innerHTML = '<span class="chat-valoracion-pregunta">¿Te he resuelto la duda?</span>' +
            '<button type="button" data-valor="si">Sí, gracias</button>' +
            '<button type="button" data-valor="no">No</button>';
        mensajes.appendChild(bloque);
        bajar();
    }

    function preguntaPendiente() {
        var bloques = mensajes.querySelectorAll('.chat-valoracion:not(.contestada)');
        return bloques.length ? bloques[bloques.length - 1] : null;
    }

    function cerrarPregunta(bloque) {
        bloque.classList.add('contestada');
        bloque.querySelectorAll('button').forEach(function (boton) { boton.remove(); });
    }

    function ponerEsperando(si) {
        esperando = si;
        entrada.disabled = si;
        enviar.disabled = si;
        var puntos = mensajes.querySelector('.chat-escribiendo');
        if (si && !puntos) {
            puntos = document.createElement('div');
            puntos.className = 'chat-mensaje chat-mensaje-asistente chat-escribiendo';
            puntos.setAttribute('aria-label', 'El asistente está escribiendo');
            puntos.innerHTML = '<span></span><span></span><span></span>';
            mensajes.appendChild(puntos);
            bajar();
        } else if (!si && puntos) {
            puntos.remove();
            entrada.focus({ preventScroll: true });
        }
    }

    // Manda el historial al portero y enseña la respuesta.
    function preguntar(noes) {
        ponerEsperando(true);
        fetch(PORTERO, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bot: bot, mensajes: historialParaEnviar() })
        }).then(function (respuesta) {
            return respuesta.json().catch(function () { return {}; });
        }).then(function (datos) {
            ponerEsperando(false);
            if (!datos.texto) { datos = { texto: TEXTO_SIN_CONEXION, accion: 'whatsapp' }; }
            apuntar('asistente', datos.texto);
            anadirAsistente(datos.texto, datos.accion === 'whatsapp');
            if (datos.accion === 'normal') { preguntarSiResuelto(noes); }
        }).catch(function () {
            ponerEsperando(false);
            apuntar('asistente', TEXTO_SIN_CONEXION);
            anadirAsistente(TEXTO_SIN_CONEXION, true);
        });
    }

    function contestar(bloque, valor, textoEscrito) {
        var noes = parseInt(bloque.getAttribute('data-noes'), 10) || 0;
        cerrarPregunta(bloque);
        if (valor === 'si') {
            var gracias = '¡Genial! Si te surge cualquier otra duda, aquí estoy.';
            apuntar('visitante', textoEscrito || 'Sí, gracias');
            apuntar('asistente', gracias);
            setTimeout(function () { anadirAsistente(gracias, false); }, 300);
            return;
        }
        noes += 1;
        if (noes >= NO_PARA_WHATSAPP) {
            apuntar('visitante', textoEscrito || 'No');
            apuntar('asistente', TEXTO_WHATSAPP_NO);
            setTimeout(function () { anadirAsistente(TEXTO_WHATSAPP_NO, true); }, 300);
            return;
        }
        var aviso = '[El visitante ha pulsado «No»: no le has resuelto la duda. Es su «No» número ' + noes + ' sobre esta duda.]';
        // El portero acepta 500 caracteres por mensaje: el aviso ocupa unos 110.
        if (textoEscrito) { aviso += ' Ha escrito: «' + textoEscrito.slice(0, 350) + '»'; }
        apuntar('visitante', aviso);
        preguntar(noes);
    }

    mensajes.addEventListener('click', function (evento) {
        var boton = evento.target.closest('.chat-valoracion button');
        if (!boton || esperando) { return; }
        anadirVisitante(boton.textContent);
        contestar(boton.closest('.chat-valoracion'), boton.getAttribute('data-valor'), null);
    });

    // «no», «no lo entiendo», «sí», «sí, gracias», «vale»… escritos a mano.
    function leerRespuesta(texto) {
        var limpio = texto.toLowerCase()
            .normalize('NFD').replace(/[̀-ͯ]/g, '')
            .replace(/[¡!¿?.,;:]/g, ' ').trim();
        if (/^no\b/.test(limpio)) { return 'no'; }
        if (/^(si|vale|ok|gracias|perfecto|genial)\b/.test(limpio)) { return 'si'; }
        return null;
    }

    formulario.addEventListener('submit', function (evento) {
        evento.preventDefault();
        var texto = entrada.value.trim();
        if (!texto || esperando) { return; }
        entrada.value = '';
        anadirVisitante(texto);

        var pendiente = preguntaPendiente();
        var respuesta = leerRespuesta(texto);
        if (pendiente && respuesta) {
            contestar(pendiente, respuesta, texto);
            return;
        }
        // Una duda nueva: la anterior se da por cerrada y la cuenta empieza.
        if (pendiente) { cerrarPregunta(pendiente); }
        apuntar('visitante', texto);
        preguntar(0);
    });
})();
