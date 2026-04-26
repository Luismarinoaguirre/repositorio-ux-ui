# UX/UI Tools Repository

Base local para convertir tu página de recursos UX/UI en un hub navegable, visual y listo para crecer con carga manual, inbox automatizado y base de datos live.

## Estructura
- `docs/` y `site/`
  - versión publicada y versión local del hub
- `docs/data.js`
  - dataset base que usa la web
- `docs/config.js`
  - configuración editable para conectar una base live
- `docs/live-data.js`
  - capa que lee y escribe recursos remotos y los mezcla con el catálogo base
- `docs/database-setup.sql`
  - SQL base para crear la tabla de recursos en Supabase
- `scripts/add_resource.py`
  - sync por JSON, archivo o inbox
- `inbox/resources/`
  - carpeta para soltar JSONs nuevos
- `inbox/processed/`
  - histórico de JSONs ya procesados

## Modos de carga
### 1. Desde la web
1. completá `docs/config.js`
2. ejecutá `docs/database-setup.sql` en tu proyecto de Supabase
3. usá el botón `Agregar recurso`

### 2. Desde inbox
```bash
python3 scripts/add_resource.py --dir inbox/resources --archive
```

## Estado actual
- home y secciones listas para leer recursos remotos si la base está conectada
- modal preparado para guardar links y metadata desde la web
- carga de archivos reales pendiente para la próxima etapa con storage

## Próximo paso recomendado
Conectar storage para PDFs y archivos, o endurecer la escritura pública pasando el alta por una función backend.
