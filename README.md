# UX/UI Tools Repository

Base local para convertir tu pagina de Notion "Herraminentas UX/UI" en un repositorio navegable, reutilizable y listo para evolucionar a una web mas robusta.

## Estructura
- `content/herramientas-ux-ui.md`
  - Exportacion legible y editable del contenido de Notion.
- `data/ux-ui-tools.json`
  - Dataset estructurado por secciones y grupos.
- `data/ux-ui-tools.flat.json`
  - Dataset plano, ideal para busquedas o imports.
- `site/`
  - Navegador local del catalogo.
- `scripts/build_catalog.py`
  - Genera los archivos de `data/` y `site/data.js`.

## Uso
1. Editar `content/herramientas-ux-ui.md` si queres ajustar nombres o agregar recursos.
2. Regenerar el dataset:

```bash
python3 scripts/build_catalog.py
```

3. Abrir `site/index.html` en el navegador.

## Estado actual
- Exportacion inicial creada desde Notion.
- Sitio local listo para navegar offline.
- Bloque `Libros` detectado, pero con filas pendientes de extraccion por limitacion del conector.

## Proximo paso recomendado
Sumar referencias visuales para rediseñar la interfaz y pasar de este navegador base a una experiencia mas editorial y curada.
