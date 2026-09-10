# LearningD

Tablero Kanban estático para planear el lanzamiento de un negocio de bolsas con mensajes y café (septiembre 2026 → enero 2027).

## Qué incluye

- Columnas por etapa: Backlog / Ideas, Market Research, Product (Bags MVP), Digital Presence, Launch & Sell, Done.
- Tarjetas con título, descripción, fecha límite y prioridad; marcan visualmente lo vencido y lo que vence en los próximos 7 días.
- Crear, editar, eliminar tareas y moverlas entre columnas con arrastrar y soltar (o cambiando la columna en el formulario de edición).
- Franja de línea de tiempo con los próximos 6 meses y las tareas de cada mes.
- Todo se guarda en `localStorage`: no hay backend, cuentas ni base de datos. El botón "Reiniciar tablero" restaura las tareas iniciales.

## Cómo abrirlo localmente

Opción 1 — abrir el archivo directamente:

```bash
open index.html      # macOS
xdg-open index.html  # Linux
```

Opción 2 — servirlo con un servidor local (recomendado):

```bash
python3 -m http.server 8000
# luego abre http://localhost:8000
```

## Desplegar en GitHub Pages

1. En GitHub, entra a **Settings → Pages**.
2. En **Source** elige **Deploy from a branch**.
3. Selecciona la rama `main` y la carpeta `/ (root)`, y guarda.
4. En un par de minutos el tablero estará en `https://itsyoha.github.io/LearningD/`.

## Archivos

- `index.html` — estructura de la página y formulario de tareas.
- `styles.css` — estilos (paleta cálida, tarjetas redondeadas, diseño responsivo).
- `app.js` — estado, persistencia en `localStorage`, arrastrar y soltar, línea de tiempo.
