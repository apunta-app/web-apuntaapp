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
// - Escribir «no, …» con más de cuatro palabras es una corrección, no un
//   «No»: va al asistente sin sumar a la cuenta.
//
// La otra app: si al chat del móvil le preguntan por la app de escritorio (o
// al revés), el asistente contesta con la acción «derivar» y la pregunta
// reescrita. La ventanita pone un botón que abre la otra página con
// ?pregunta=…&desde=…: allí el chat se abre solo y la pregunta ya va hecha.
// Si aquel asistente también quiere derivar, se manda a WhatsApp (sin
// ping-pong entre las dos páginas).
//
// Al llegar una respuesta, la pregunta del visitante queda arriba de la
// ventanita y la respuesta debajo, para leerla desde el principio.
(function () {
    var PORTERO = 'https://apunta-portero.apunta-portero.workers.dev';
    // El botón de WhatsApp abre la conversación con un mensaje ya escrito,
    // para que en atención al cliente sepan de qué chat viene.
    var WHATSAPP = 'https://wa.me/34680352807?text=' + encodeURIComponent({
        movil: 'Hola, vengo del asistente de Apunta App móvil de la web y tengo una duda:',
        escritorio: 'Hola, vengo del asistente de Apunta App Escritorio de la web y tengo una duda:'
    }[document.querySelector('.chat-ventana').getAttribute('data-bot')]);
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
    var OTRA = {
        movil: { pagina: 'gestorias.html', boton: 'Preguntar al asistente de Apunta App Escritorio' },
        escritorio: { pagina: 'autonomos.html', boton: 'Preguntar al asistente de la app del móvil' }
    }[bot];
    var TEXTO_NO_DERIVAR = 'Eso no te lo sé decir. Lo mejor es que hables con nuestro servicio de atención al cliente por WhatsApp: ellos te ayudan.';

    // Lo que se le manda al portero: {rol: 'visitante'|'asistente', texto}.
    var historial = [];
    var esperando = false;
    // La última duda escrita por el visitante (para el botón de derivar).
    var ultimaDuda = '';
    // true mientras se contesta la pregunta que llega de la otra página.
    var llegadaDeLaOtra = false;

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

    // Deja arriba de la ventanita el último mensaje del visitante, con la
    // respuesta debajo. Si todo cabe, no se mueve nada.
    function verDesdeLaPregunta() {
        var suyos = mensajes.querySelectorAll('.chat-mensaje-visitante');
        var pregunta = suyos[suyos.length - 1];
        if (!pregunta) { return; }
        mensajes.scrollTop = Math.max(0, pregunta.offsetTop - 12);
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

    // extra: 'whatsapp', o {derivar: 'la pregunta'} para el botón de la otra página.
    function anadirAsistente(texto, extra) {
        var mensaje = document.createElement('div');
        mensaje.className = 'chat-mensaje chat-mensaje-asistente';
        mensaje.innerHTML = aHtml(texto);
        if (extra === 'whatsapp') {
            var plantilla = document.getElementById('plantilla-whatsapp');
            var boton = plantilla.content.firstElementChild.cloneNode(true);
            boton.href = WHATSAPP;
            mensaje.appendChild(boton);
        } else if (extra && extra.derivar) {
            var enlace = document.createElement('a');
            enlace.className = 'chat-boton-derivar';
            enlace.href = OTRA.pagina + '?pregunta=' + encodeURIComponent(extra.derivar) + '&desde=' + bot;
            enlace.target = '_blank';
            enlace.rel = 'noopener';
            enlace.textContent = OTRA.boton + ' →';
            mensaje.appendChild(enlace);
        }
        mensajes.appendChild(mensaje);
        verDesdeLaPregunta();
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
        // Sin bajar hasta el final: la pregunta sigue arriba. Se vuelve a
        // colocar porque, con una respuesta corta, antes de añadir este
        // bloque no había sitio por debajo para subirla del todo.
        mensajes.appendChild(bloque);
        verDesdeLaPregunta();
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
            // La pregunta ya venía de la otra página: no se devuelve, a WhatsApp.
            if (datos.accion === 'derivar' && llegadaDeLaOtra) {
                datos = { texto: TEXTO_NO_DERIVAR, accion: 'whatsapp' };
            }
            llegadaDeLaOtra = false;
            apuntar('asistente', datos.texto);
            if (datos.accion === 'derivar') {
                anadirAsistente(datos.texto, { derivar: (datos.pregunta || ultimaDuda).slice(0, 300) });
            } else {
                anadirAsistente(datos.texto, datos.accion === 'whatsapp' ? 'whatsapp' : null);
            }
            if (datos.accion === 'normal') { preguntarSiResuelto(noes); }
        }).catch(function () {
            ponerEsperando(false);
            llegadaDeLaOtra = false;
            apuntar('asistente', TEXTO_SIN_CONEXION);
            anadirAsistente(TEXTO_SIN_CONEXION, 'whatsapp');
        });
    }

    function contestar(bloque, valor, textoEscrito) {
        var noes = parseInt(bloque.getAttribute('data-noes'), 10) || 0;
        cerrarPregunta(bloque);
        if (valor === 'si') {
            var gracias = '¡Genial! Si te surge cualquier otra duda, aquí estoy.';
            apuntar('visitante', textoEscrito || 'Sí, gracias');
            apuntar('asistente', gracias);
            setTimeout(function () { anadirAsistente(gracias, null); }, 300);
            return;
        }
        noes += 1;
        if (noes >= NO_PARA_WHATSAPP) {
            apuntar('visitante', textoEscrito || 'No');
            apuntar('asistente', TEXTO_WHATSAPP_NO);
            setTimeout(function () { anadirAsistente(TEXTO_WHATSAPP_NO, 'whatsapp'); }, 300);
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
        // «no» con más de cuatro palabras es una corrección («no, está en…»).
        if (/^no\b/.test(limpio)) { return limpio.split(/\s+/).length > 4 ? 'correccion' : 'no'; }
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
        if (pendiente && respuesta === 'correccion') {
            // Le corrigen: no suma «No» y la duda sigue siendo la misma.
            var noesAhora = parseInt(pendiente.getAttribute('data-noes'), 10) || 0;
            cerrarPregunta(pendiente);
            apuntar('visitante', texto);
            preguntar(noesAhora);
            return;
        }
        if (pendiente && respuesta && respuesta !== 'correccion') {
            contestar(pendiente, respuesta, texto);
            return;
        }
        // Una duda nueva: la anterior se da por cerrada y la cuenta empieza.
        if (pendiente) { cerrarPregunta(pendiente); }
        ultimaDuda = texto;
        apuntar('visitante', texto);
        preguntar(0);
    });

    // Llegada desde la otra página con la pregunta ya hecha.
    var parametros = new URLSearchParams(window.location.search);
    var preguntaHecha = (parametros.get('pregunta') || '').trim().slice(0, 300);
    if (preguntaHecha) {
        // Fuera de la dirección, para que al recargar no se vuelva a preguntar.
        history.replaceState(null, '', window.location.pathname + window.location.hash);
        abrir();
        anadirVisitante(preguntaHecha);
        ultimaDuda = preguntaHecha;
        llegadaDeLaOtra = true;
        apuntar('visitante', preguntaHecha);
        preguntar(0);
    }
})();
