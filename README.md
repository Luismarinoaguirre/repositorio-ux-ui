# UX/UI Tools Repository

Base local para convertir tu página de recursos UX/UI en un hub navegable, visual y listo para crecer con carga manual, inbox automatizado y base de datos live.

## Estructura
- `docs/` y `site/`
  - versión publicada y versión local del hub
- `docs/data.js`
  - dataset base que usa la web
- `docs/config.js`
  - configuración editable para conectar Supabase
- `docs/live-data.js`
  - capa que lee recursos remotos, sube archivos a Storage y los mezcla con el catálogo base
- `docs/database-setup.sql`
  - SQL para crear la tabla `ux_resources`
- `docs/storage-setup.sql`
  - SQL para crear el bucket `ux-assets` y habilitar uploads públicos
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
3. ejecutá `docs/storage-setup.sql`
4. usá el botón `Agregar recurso`

### 2. Desde inbox
```bash
python3 scripts/add_resource.py --dir inbox/resources --archive
```

## Estado actual
- home y secciones listas para leer recursos remotos si la base está conectada
- modal preparado para guardar links, metadata y archivos reales desde la web
- uploads con URL pública soportados vía Supabase Storage

## Próximo paso recomendado
Endurecer la escritura pública con auth o una función backend antes de abrir la carga a más usuarios.

## Setup live con uploads
- `docs/database-setup.sql`: crea la tabla y las políticas base de recursos.
- `docs/storage-setup.sql`: crea el bucket `ux-assets` y habilita uploads públicos.
- `docs/config.js`: activa Supabase y define bucket/prefijo de uploads.
- `docs/live-data.js`: mezcla catálogo estático + base live y sube archivos reales a Storage.
