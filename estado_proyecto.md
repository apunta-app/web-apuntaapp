# Estado del proyecto — Web de Apunta (apuntaapp.com)

> Repo: `apunta-app/web-apuntaapp` · Rama: `main` · Publicación: GitHub Pages → apuntaapp.com

**Última actualización: 2026-10-05**

---

## 2026-10-05 — Textos al día con la app, «Apunta App» siempre junto y el chat

> **Nada de lo de hoy está publicado todavía.** GitHub tiene desde las 21:12
> (hora de España) una incidencia con Actions y Pages: las publicaciones de
> `b1283fc` y `e61d2ce` fallaron («The job was not acquired by Runner») y
> apuntaapp.com sigue enseñando la versión del 1 de octubre (`7e78715`). Los
> commits están subidos a `main`; saldrán todos juntos en cuanto GitHub
> publique el siguiente.

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

1. **Publicar**: cuando GitHub se recupere, comprobar que salen los tres
   commits y probar el chat de verdad en las dos páginas de apuntaapp.com.
2. **La abogada**: el texto del aviso de la ventanita (provisional) y el
   apartado nuevo de las dos políticas de privacidad. En esas políticas, los
   apartados de destinatarios y de transferencias internacionales todavía no
   mencionan a Cloudflare ni a Anthropic.
3. **App de escritorio, próxima versión**: el botón «Salir de Apunta» → «Salir
   de Apunta App».
4. `README.md` está desactualizado (dice «Sin JavaScript» y no lista las
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
