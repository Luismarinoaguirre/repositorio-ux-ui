# Arquitectura inicial

## Objetivo
Dejar una base local, portable y facil de reutilizar para transformar la pagina de Notion "Herraminentas UX/UI" en un repositorio con experiencia tipo web.

## Decision tomada
- `Local-first` antes que GitHub.
- `Markdown` como fuente legible y editable.
- `JSON` como formato interoperable para otras IAs, scripts o frontends.
- `site/` como navegador local simple que se puede abrir directo desde el Finder.

## Estructura
- `content/`
  - Fuente humana y editable.
- `data/`
  - Salidas estructuradas generadas.
- `scripts/`
  - Automatizacion para regenerar JSON y assets del sitio.
- `site/`
  - Navegador local del catalogo.
- `docs/`
  - Notas de arquitectura y decisiones.

## Por que no GitHub primero
- Evita friccion de setup.
- Nos deja iterar rapido con referencias visuales y cambios de estructura.
- Cuando el contenido y la UI esten mas cerrados, publicar a GitHub va a ser directo.

## Siguiente etapa sugerida
1. Revisar esta exportacion y detectar si faltan secciones o etiquetas.
2. Recibir tus referencias visuales.
3. Definir arquitectura final del sitio:
   - landing
   - explorador por categorias
   - buscador
   - tags
   - detalle por recurso
4. Elegir stack final:
   - HTML/CSS/JS estatico
   - Vite
   - Next.js
   - Astro

## Estado del bloque Libros
- El bloque existe como base inline en Notion.
- Se pudo leer el esquema.
- No se pudieron extraer sus filas en esta corrida porque el conector de query devolvio error.
