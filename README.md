# RecycleNow ♻️

Plataforma cívica web de reciclaje ciudadano alineada con el **ODS 12 (Producción y consumo responsables)** y el **ODS 13 (Acción por el clima)**.

Desarrollada para el curso de **HCI for UX Design** (UPC), estructurada como un **Portal de Entregas Progresivas** que evidencia la evolución técnica desde el prototipo HTML semántico hasta la interactividad en JavaScript puro sin dependencias externas.

---

## 🌐 Portal de Entregas en Vivo (GitHub Pages)

El archivo raíz [`index.html`](index.html) funciona como un **Dashboard Interactivo** donde puedes probar cada avance semanal mediante pestañas y enlaces directos:

1. **[Semana 09: Fundamentos de HTML5](semana-09-html/index.html)**: Estructura semántica pura (`<header>`, `<nav>`, `<main>`, `<article>`, `<form>`), jerarquía de contenidos y formularios cívicos sin estilos CSS ni scripts.
2. **[Semana 10: CSS3 & Responsive Design](semana-10-css/index.html)**: Maquetación con Flexbox, CSS Grid, Design System con variables (`:root`), paleta ecológica y adaptabilidad multidispositivo sin JavaScript.
3. **[Semana 11: Vanilla JS (Proyecto Completo)](semana-11-js/index.html)**: Implementación de las 3 Historias de Usuario (HU1, HU2 y HU3) modularizadas para los 6 integrantes del equipo:
   * **HU1:** Buscador en vivo con `e.preventDefault()`, chips rápidos, filtros por categoría y checklist en cascada con cálculo de progreso al 100%.
   * **HU3:** Conmutador Vista Lista / Vista Mapa, filtros por distancia y disponibilidad, persistencia de favoritos con `localStorage` y modal de recordatorio.
   * **HU2:** Formulario administrativo del reciclador con selectores de hora (`<input type="time">`), conversión 12h am/pm y validación de publicación.

---

## 📁 Estructura del Repositorio

```text
RecycleNow/
│
├── index.html                 # PORTAL PRINCIPAL (Dashboard / Hub de Semanas)
├── portal.css                 # Estilos del portal de presentación
│
├── semana-09-html/            # HITO SEMANA 9: Solo HTML5 Semántico
│   ├── index.html
│   └── imagenes/
│
├── semana-10-css/             # HITO SEMANA 10: HTML5 + CSS3 Responsive
│   ├── index.html
│   ├── styles.css
│   └── imagenes/
│
├── semana-11-js/              # HITO SEMANA 11: Proyecto Completo en Vanilla JS
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   └── imagenes/
│
├── docs/                      # DOCUMENTACIÓN FORMAL
│   ├── Auditoria_Historias_de_Usuario_RecycleNow.docx
│   └── Presentacion_RecycleNow_HUs.pptx
│
└── README.md
```

---

## 👥 Equipo y Distribución de Responsabilidades (Semana 11)

* **Integrante 1:** CA01 - Buscador reactivo y chips rápidos con `e.preventDefault()`.
* **Integrante 2:** CA02 - Filtro dinámico por categorías de material en el catálogo.
* **Integrante 3:** CA03 - Checklist con validación en cascada estricta y cálculo de progreso.
* **Integrante 4:** CA04 - Filtros de puntos de acopio y switch Vista Lista / Vista Mapa.
* **Integrante 5:** CA05 - Guardado en `localStorage` y modal de recordatorio de entrega.
* **Integrante 6:** CA06 - Panel del reciclador con time-pickers y validación de publicación.

---

## 🚀 Cómo Ejecutar Localmente

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Salvarcc/RecycleNow.git
   ```
2. Abre `index.html` en tu navegador web favorito (Chrome, Edge, Firefox).
3. Utiliza el **Visor Comparativo** o haz clic en los botones de cada semana para navegar entre los diferentes hitos del proyecto.
