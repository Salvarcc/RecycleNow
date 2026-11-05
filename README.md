# RecycleNow ♻️

Plataforma cívica web de reciclaje ciudadano alineada con el **ODS 12 (Producción y consumo responsables)** y el **ODS 13 (Acción por el clima)**.

Desarrollada para el curso de **HCI for UX Design** utilizando **JavaScript puro (Vanilla JS)**, sin dependencias ni frameworks externos, con un diseño modular adaptable para 6 integrantes y 3 Historias de Usuario principales.

## 🚀 Funcionalidades Principales

* **Buscador y Chips Rápidos:** Búsqueda reactiva instantánea que intercepta el envío sin recargar la página (`e.preventDefault()`).
* **Catálogo de Residuos:** Filtros dinámicos por tipo de material (Plásticos, Papel y Cartón, Vidrio, Metales y Residuos especiales).
* **Protocolo de Acondicionamiento en Cascada:** Checklist interactivo donde cada paso requiere haber completado el anterior, con cálculo del progreso en tiempo real (0% al 100%).
* **Centros de Acopio:** Conmutación entre **Vista Lista** y **Vista Mapa**, con filtros por "Abierto ahora" y radio de distancia.
* **Organización Doméstica:** Guardado persistente de puntos favoritos en `localStorage` y modal para agendar recordatorios de entrega con validación.
* **Panel del Reciclador:** Administración con controles nativos de horario (`<input type="time">`) y selección conmutable de materiales con validación de publicación.

## 📁 Estructura del Proyecto

```text
├── index.html       # Landing page única integrada
├── styles.css       # Hoja de estilos (Design System en CSS3)
├── script.js        # Lógica interactiva en Vanilla JS
├── imagenes/        # Recursos multimedia del proyecto
└── Auditoria_Historias_de_Usuario_RecycleNow.docx # Documentación de requerimientos y HU
```

## 💻 Ejecución
Simplemente abre `index.html` en cualquier navegador web moderno.
