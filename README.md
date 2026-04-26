# UX/UI Tools Repository

Base local para convertir tu pagina de Notion "Herraminentas UX/UI" en un repositorio navegable, reutilizable y listo para evolucionar a una web mas robusta.

## Estructura
- `content/herramientas-ux-ui.md`
  - Exportacion legible y editable del contenido de Notion.
- `data/ux-ui-tools.json`
  - Dataset estructurado por secciones y grupos.
- `data/ux-ui-tools.flat.json`
  - Dataset plano, ideal para busquedas o imports.
- `docs/` y `site/`
  - Version publicada y version local del hub.
- `scripts/build_catalog.py`
  - Genera los archivos de `data/` y `site/data.js` a partir del markdown base.
- `scripts/add_resource.py`
  - Alta y sync de recursos por JSON, archivo o inbox.
- `inbox/resources/`
  - Carpeta para soltar nuevos JSONs de recursos.
- `inbox/processed/`
  - Archivo historico de los JSONs ya importados.

## Carga rapida
1. Crear un JSON por recurso en `inbox/resources/` usando este template:
   - [inbox/resources/_template.json](/Users/luismarino/Desktop/CL4UDE-PJ/Repositorio%20UX-UI/inbox/resources/_template.json)
2. Ejecutar el sync del inbox:

```bash
python3 scripts/add_resource.py --dir inbox/resources --archive
```

Eso:
- agrega o actualiza recursos en `docs/data.js` y `site/data.js`
- recalcula el total de items
- mueve los JSON ya procesados a `inbox/processed/`

## Otras formas de carga
- Desde stdin:

```bash
cat recurso.json | python3 scripts/add_resource.py --stdin
```

- Desde un archivo puntual:

```bash
python3 scripts/add_resource.py --file inbox/resources/mi-recurso.json --archive
```

## Estado actual
- Exportacion inicial creada desde Notion.
- Sitio local listo para navegar offline.
- Workflow de carga incremental por JSON listo.
- Bloque `Libros` detectado, pero con filas pendientes de extraccion por limitacion del conector.

## Siguiente paso recomendado
Montar una automatizacion que ejecute el sync del inbox de forma horaria para que cualquier JSON nuevo se incorpore solo.
