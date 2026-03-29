# Direccion visual inicial

## Referencias analizadas

### departuremono.com
- Tipografia con precision tecnica.
- Uso de microcopy monospace para dar sensacion de sistema.
- Identidad clara sin exceso de elementos.

### voidzero.dev
- Superficies oscuras y sobrias.
- Producto con look de tooling premium.
- Mucha claridad estructural entre hero, bloques y llamadas principales.

### 14islands.com
- Ritmo editorial.
- Aire generoso y jerarquia relajada.
- Sensacion de estudio creativo, no solo de dashboard.

### apple.com
- Modulos extremadamente ordenados.
- Jerarquia visual limpia.
- Tarjetas que organizan sin hacer ruido.

### modalzmodalzmodalz.com
- Voz editorial marcada.
- Idea central fuerte.
- Contraste claro entre mensaje, estructura y accion.

### forpeople.com
- Sensacion de estudio premium con storytelling visual.
- Movimiento sutil, cinematografico y ligado al contenido.
- Mucha continuidad entre bloques, sin cortes bruscos.

### framer.com
- Motion rapido y limpio.
- Transiciones pensadas para continuidad, no para llamar la atencion por si mismas.
- Uso de scroll-triggered y scroll-linked animation como capa de polish.

### Land-book / Giacomo Dal Pra
- Direccion visual mas autoral y pulida.
- Composicion aireada, con foco en atmosfera y refinamiento.
- Interacciones que se sienten suaves y modernas.

### Refero screenshot
- Shell de aplicacion oscura.
- Sidebar persistente.
- Command palette como patron mental de navegacion.
- Blur, capas y foco contextual.

## Como se tradujo al proyecto
- Fondo oscuro con gradientes suaves y profundidad.
- Hero mas editorial, menos "catalogo generico".
- Microcopy en tono de sistema.
- Busqueda convertida en una command surface.
- Sidebar persistente con mapa de secciones.
- Tarjetas oscuras con bordes suaves y brillo minimo.
- Jerarquia clara para explorar rapidamente sin perder elegancia.

## Sistema de motion aplicado
- Entradas escalonadas con `IntersectionObserver`.
- Scroll parallax muy sutil en hero y capas ambientales.
- Hover premium en superficies interactivas.
- Spotlight reactivo en la command surface.
- Topbar que gana blur y presencia al hacer scroll.
- Respeto por `prefers-reduced-motion` para no romper accesibilidad.

## Principios para la siguiente iteracion
- Mantener transiciones cortas y suaves.
- Priorizar continuidad visual sobre espectacularidad.
- Reservar movimientos mas notorios solo para hitos clave.
- Si agregamos mas motion, hacerlo con un stack que nos permita control fino sin perder performance.
