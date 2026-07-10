# Estado del proyecto — Web de Apunta (apuntaapp.com)

> Repo: `apunta-app/web-apuntaapp` · Rama: `main` · Publicación: GitHub Pages → apuntaapp.com

**Última actualización: 2026-07-10**

---

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
