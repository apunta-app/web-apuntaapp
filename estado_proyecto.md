# Estado del proyecto — Web de Apunta (apuntaapp.com)

> Repo: `apunta-app/web-apuntaapp` · Rama: `main` · Publicación: GitHub Pages → apuntaapp.com

**Última actualización: 2026-10-06 (cierre del día)**

---

## 2026-10-06 — El Asistente de Apunta App, arreglado y al día

> Todo publicado en apuntaapp.com y comprobado con Chrome y la IA de verdad,
> en las dos páginas. (Tres commits de la tarde dicen «07/10» en el mensaje
> por error: son de hoy, 06/10.)

### Lo que se ha hecho

1. **Arreglo de los fallos que vio Javier el 05/10** (chat del móvil que
   mandaba a WhatsApp las preguntas del escritorio, el cuaderno «en Ajustes»,
   el «Perdón» + WhatsApp al corregirle, el chat que bajaba de golpe):
   - **Derivar entre páginas:** si a un chat le preguntan por la otra app,
     sale el botón «Preguntar al asistente de …», que abre la otra página con
     su chat abierto y la pregunta ya hecha; aquel la contesta solo (si
     también quisiera derivarla, WhatsApp: sin ping-pong).
   - **Scroll:** al llegar la respuesta, la pregunta queda arriba y «¿Te he
     resuelto la duda?» al final (también con respuestas cortas).
   - **Correcciones:** «no, …» con más de cuatro palabras no suma un «No» ni
     saca WhatsApp; el asistente no dice «perdón» ni «perdona».
2. **Conocimiento del asistente** (fuera del repo, `Dominio y web\Chatbot`):
   mapa de dónde está cada cosa en las dos apps, sacado de los manuales y sus
   capturas; regla de usar solo el mapa; y las respuestas de Javier:
   borrar / pasar a ingreso en el móvil (Editar gasto → tres puntitos),
   «Varios tipos de IVA» sin sumar cuotas, «Quitar» en el escritorio, botón R
   a la derecha de «Importes», enlace en «Pulsa aquí», sin consejos de
   relleno, el icono de bifurcación sin decir dónde está, y el texto de
   Javier para «¿se puede instalar en el servidor del despacho?».
3. **Portero** (Cloudflare Worker): marca `[[DERIVAR|pregunta]]` y redes de
   seguridad (quita «perdón», «disculpa la confusión», el teléfono escrito y
   los emojis). Publicado con su configuración normal (300 preguntas al día,
   vistas previas cerradas).
4. **WhatsApp con mensaje ya escrito:** el botón del chat del móvil, el del
   escritorio y el enlace de Contacto abren la conversación diciendo de dónde
   viene el cliente.
5. **Pruebas:** batería de 103 preguntas en 6 rondas y repeticiones de las
   preguntas que cambiaban (603 preguntas contra una versión de prueba, con
   su propio contador). Preguntas y respuestas en
   `Chatbot\BATERIA-PREGUNTAS-Y-RESPUESTAS.md`, para que Claude las revise.
6. **Privacidad:** los apartados 3.6 (móvil) y 4.5 (escritorio) se quedan
   como están, por decisión de Javier.

### Commits de hoy

- `f8a6858` (00:13) — el Asistente en autónomos y gestorías, y el WhatsApp en Contacto.
- `45cc845` (00:21) y `a2aba83` (00:51) — estado del 05/10 y su publicación.
- `ac753c2` — derivar a la otra página, pregunta arriba, correcciones.
- `7034873` — con una respuesta corta, los botones también a la vista.
- `2516e6f`, `c548f6c`, `9ce7d9e` — estado del proyecto.
- `e18dbf2` — WhatsApp con mensaje ya escrito.
- El commit de este cierre.

### Coste de la API hoy

Unos **1,7 $**: 1,62 $ de las baterías de prueba (medido) y unos 0,05-0,10 $
de las 21 preguntas de comprobación en apuntaapp.com (estimado). El saldo de
créditos solo se ve en console.anthropic.com.

### Pendiente

- **Manual del móvil:** falta la captura de un apunte abierto desde el
  Historial («Editar gasto») con sus tres puntitos y su menú («Pasarlo a
  ingreso», «Borrar»). No se ha tocado el manual.
- **La abogada:** el texto del aviso de la ventanita (provisional) y las
  políticas de privacidad (destinatarios y transferencias internacionales
  todavía no mencionan a Cloudflare ni a Anthropic).
- **Revisar la batería** con Claude (`Chatbot\BATERIA-PREGUNTAS-Y-RESPUESTAS.md`).
- **App de escritorio, próxima versión:** «Salir de Apunta» → «Salir de Apunta App».
- `README.md` desactualizado (dice «Sin JavaScript»).
- Vistas previas de `Chatbot\vista-previa`: tienen la ventanita antigua y ya
  no hablan con el portero (cerrado a vistas previas).

## 2026-10-05 — Textos al día con la app, «Apunta App» siempre junto y el chat

> **Publicado el 06/10/2026 a las 00:50** (publicación nº 32 de GitHub Pages),
> después de la incidencia de GitHub con Actions y Pages del 05/10 por la
> noche, que hizo fallar las publicaciones de `b1283fc` y `e61d2ce`. Los cuatro
> commits de abajo salieron juntos y se comprobaron en apuntaapp.com página por
> página. El chat se probó de verdad en las dos páginas publicadas (preguntas
> reales, botón «No», línea de Contacto): funciona.

### Commits de hoy

- `b1283fc` — **autonomos.html y textos legales del móvil, al día con la app.**
  FAQ sin «contraseña que solo tú conoces» (la única es la de la copia de
  seguridad); internet solo para comprarla, descargarla, abrirla la primera
  vez y enviar la exportación; se exporta «cuando quieras y las veces que
  quieras» (paso 3 y «Para quién»). Términos: fuera el apartado de la frase de
  recuperación de 12 palabras (apartados renumerados, 13 → 12) y su mención en
  el apartado 3. Privacidad: fuera las categorías y el botón «¿Algo no cuadra?
  Avísame». Fechas de «Última actualización» sin cambiar.
- `e61d2ce` — **«Apunta App» siempre junto, nunca «Apunta» solo**, en todas las
  páginas salvo los manuales (86 cambios en 9 páginas; «Apunta Escritorio» →
  «Apunta App Escritorio»). Se quedan como estaban, a propósito, el eslogan
  «Apunta... Y olvídate.» y las frases «El nombre "Apunta"…» de los dos avisos
  legales (es el nombre de la marca).
- `f8a6858` — **El Asistente de Apunta App** (chat) en `autonomos.html`
  (asistente de la app del móvil) y `gestorias.html` (asistente de Apunta App
  Escritorio): burbuja abajo a la derecha y línea «Pregúntale al Asistente de
  Apunta App» en Contacto. Ficheros nuevos `chat.css` y `chat.js`, sin
  librerías ni CDN. **WhatsApp +34 680 352 807** junto al correo en las dos
  secciones de Contacto. Políticas de privacidad: apartado nuevo sobre el
  asistente (3.6 en la del móvil, 4.5 en la del escritorio), con fechas sin
  cambiar.

### Cómo funciona el chat

- La web no habla con la IA directamente: le manda la conversación a un
  **portero** (Cloudflare Worker `apunta-portero`, cuenta de Cloudflare de
  javier@evolution-s.com), que guarda la clave de la API como secreto y llama
  a **Claude Haiku 4.5**. El portero solo acepta peticiones de apuntaapp.com,
  limita las preguntas (10 por minuto por persona, 300 al día en total) y no
  guarda las conversaciones.
- Lo que sabe cada asistente, el código del portero, las vistas previas y la
  documentación están **fuera de este repositorio**, en
  `Dominio y web\Chatbot` (`portero\LEEME.md`, `RESUMEN-PARA-JAVIER.md`).
- Probado de verdad contra la IA (37 preguntas, 0,128 $) y la ventanita con
  Chrome en local. **Falta comprobarlo en apuntaapp.com cuando se publique.**

### Pendiente

1. **La abogada**: el texto del aviso de la ventanita (provisional) y el
   apartado nuevo de las dos políticas de privacidad. En esas políticas, los
   apartados de destinatarios y de transferencias internacionales todavía no
   mencionan a Cloudflare ni a Anthropic.
2. **App de escritorio, próxima versión**: el botón «Salir de Apunta» → «Salir
   de Apunta App».
3. `README.md` está desactualizado (dice «Sin JavaScript» y no lista las
   páginas nuevas).

## 2026-07-10 — Activación de iOS en la web

La app de iOS ya está publicada y descargable en la App Store española
(19,99 €): https://apps.apple.com/es/app/apunta-app/id6788078139

Cambios hechos hoy y **ya en producción**:

- **Bloque iOS de descarga activado** (HERO). Antes mostraba "Próximamente en
  App Store" con un QR gris atenuado; ahora está a plena opacidad y color,
  replicando la estructura del bloque de Google Play:
  - Badge oficial de la App Store (`badge-app-store.svg`) enlazado a la ficha
    española (`apps.apple.com/es/app/apunta-app/id6788078139`,
    `target="_blank" rel="noopener"`).
  - QR verde de marca (`qr-app-store.png`, #2D5A3D) que apunta a esa misma ficha.
  - Pie de texto: "Escanea para descargar en iPhone".
  - Badge de Apple con **altura igualada a la del badge de Google Play (59px)**
    y `width: auto`, para respetar su proporción oficial sin deformarlo
    (clase `.insignia-imagen-apple`).
  - Eliminadas del CSS las reglas del atenuado gris ("Próximamente"):
    `.plataforma-proximamente` (opacity + grayscale) y `.proximamente-titulo`.
- **Borrado** el asset obsoleto `qr-ios-proximamente.png` (el QR gris que ya no
  usa nadie).
- **FAQ "¿En qué móviles funciona?"** actualizada: de "próximamente para iPhone"
  a disponible. Texto nuevo: "Apunta está disponible para Android (móviles con
  Android 8 o superior) y para iPhone (iOS 15.5 o superior)."
  (El mínimo iOS 15.5 se confirmó en el proyecto Xcode del repo de la app:
  `IPHONEOS_DEPLOYMENT_TARGET = 15.5`, coincidente con el `Podfile`.)

**Commits en producción:**
- `960f0e3` — Activar descarga iOS en la web: badge oficial App Store + QR a ficha española.
- `99680ae` — Actualizar FAQ: iOS ya disponible (iOS 15.5 o superior).

Web verificada en producción tras el despliegue de GitHub Pages. Cerrada por hoy.
