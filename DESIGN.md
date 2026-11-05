---
name: AgendaFlow
description: Agenda online para barberías y peluquerías; la libreta del mesón hecha sistema.
colors:
  tinta-de-libreta: "#0a0a0a"
  superficie: "#141414"
  superficie-elevada: "#1a1a1a"
  superficie-hover: "#242424"
  carbon: "#161513"
  hueso: "#e6e4df"
  dorado-de-meson: "#c9a84c"
  dorado-claro: "#e0c872"
  dorado-oscuro: "#a8893d"
  texto-primario: "#ffffff"
  texto-secundario: "#9ca3af"
  texto-tenue: "#858a93"
  borde: "#2a2a2a"
  borde-claro: "#333333"
  contorno: "#4a4a4a"
  borde-control: "#6b6b6b"
  borde-control-hover: "#858a93"
  estado-ok: "#6ee7b7"
  estado-pendiente: "#fbbf24"
  estado-error: "#f87171"
  estado-error-texto: "#fca5a5"
typography:
  display:
    fontFamily: "Young Serif, Georgia, serif"
    fontSize: "clamp(4rem, 8.3vw, 8rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Young Serif, Georgia, serif"
    fontSize: "clamp(2rem, 1.3rem + 3.2vw, 4rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Young Serif, Georgia, serif"
    fontSize: "1.75rem"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  lead:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem)"
    fontWeight: 400
    lineHeight: 1.45
  body:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "clamp(1.125rem, 1.05rem + 0.3vw, 1.3125rem)"
    fontWeight: 400
    lineHeight: 1.55
  title-dialog:
    fontFamily: "Young Serif, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.1
  title-empty:
    fontFamily: "Young Serif, Georgia, serif"
    fontSize: "1.375rem"
    fontWeight: 400
    lineHeight: 1.15
  body-ui:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.4
  body-ui-sm:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-app:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.3
  label-sm:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  publico: "0"
  app: "6px"
  app-card: "8px"
  app-panel: "10px"
  dialogo: "16px"
  pill: "999px"
spacing:
  margen: "clamp(16px, 2vw, 32px)"
  eje: "42vw"
  seccion: "clamp(120px, 14vw, 200px)"
  app-gap: "16px"
  app-header: "24px"
  target-min: "44px"
components:
  button-primary:
    backgroundColor: "{colors.dorado-de-meson}"
    textColor: "{colors.tinta-de-libreta}"
    rounded: "{rounded.publico}"
    padding: "0 28px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.dorado-claro}"
  button-app-primary:
    backgroundColor: "{colors.dorado-de-meson}"
    textColor: "{colors.tinta-de-libreta}"
    rounded: "{rounded.app}"
    padding: "0 14px"
    height: "36px"
  button-app-secondary:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.texto-primario}"
    rounded: "{rounded.app}"
    padding: "0 14px"
    height: "36px"
  input-app:
    backgroundColor: "{colors.tinta-de-libreta}"
    textColor: "{colors.texto-primario}"
    rounded: "{rounded.app}"
    padding: "0 12px"
    height: "40px"
  empty-state:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.texto-secundario}"
    rounded: "{rounded.app-panel}"
    padding: "56px 24px"
  dialog:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.texto-primario}"
    rounded: "{rounded.dialogo}"
    width: "min(480px, calc(100vw - 32px))"
---

# Design System: AgendaFlow

<!-- Fuente de verdad del diseño desde el SPEC 04. Derivado del código tras el SPEC 03 (dirección `editorial-report`). Los tokens viven en `src/styles.scss` (:root) y las clases del admin en `src/app/features/admin/styles/_admin.scss`. -->

## Overview

**Creative North Star: "La libreta del mesón"**

AgendaFlow toma la libreta de turnos que está sobre el mesón de una barbería y la convierte en sistema. La columna de horas de la libreta es el **eje**: una línea vertical al 42% del ancho. A la izquierda queda el margen de las horas (notas, cifras y horarios) y el contenido se anota a la derecha, como un turno. Es un sistema editorial e impreso: serifas en todo, tinta casi negra, un solo dorado y bloques de color planos en vez de degradados.

Tiene dos registros. Las superficies públicas (landing, auth y reserva) son de **imprenta**: esquinas rectas, tipografía grande y campos de color a sangre. Las superficies de trabajo (panel admin y diálogos) son de **mesón**: más densas, con esquinas suaves de 6px, texto de 15px y paneles repetidos. Las une el mismo par tipográfico, la misma paleta y la misma regla del dorado.

Sobre fondos oscuros, la profundidad se construye con un paso de tono o una regla de 1px, nunca con sombras en reposo. Las fotos van en escala de grises para que el dorado sea el único color con voz.

**Key Characteristics:**

- Eje vertical al 42% en las superficies públicas. En móvil colapsa al margen.
- Young Serif para display y títulos, y Source Serif 4 para todo el texto, incluido el admin.
- Un solo acento, el dorado de mesón, sobre la tinta.
- Bloques planos de color (tinta, carbón, dorado y hueso) sin degradados.
- Fotos en gris: `grayscale(1) contrast(1.05)`.
- Sin sombras en reposo. `--shadow-float` solo para menús y diálogos.
- Motion rico (GSAP) solo en la landing, y transiciones CSS cortas en el resto.

## Colors

Tinta casi negra con un solo dorado. Los neutros son grises fríos y el hueso es el único claro.

### Primary

- **Dorado de mesón** (`--gold`): la acción principal de cada pantalla, el campo dorado de la landing (la columna de AgendaFlow en la comparación y el plan Pro), la selección de texto y las marcas chicas del admin. **Valor fijo.**
- **Dorado claro** (`--gold-light`): hover del primario, anillo de foco y texto sobre el contenedor dorado oscuro.
- **Dorado oscuro** (`--gold-dark`): variante apagada para bordes y tintes.

### Neutral

- **Tinta de libreta** (`--bg-primary`, `--field-ink`): fondo de toda la app y texto sobre el dorado y el hueso (`--on-gold` y `--on-bone`). **Valor fijo.**
- **Superficie** (`--bg-surface`), **Superficie elevada** (`--bg-surface-elevated`) y **Superficie hover** (`--bg-surface-hover`): los tres pasos de tono que separan paneles, tarjetas y estados de hover en el admin.
- **Carbón** (`--field-char`): campo de sección un paso sobre la tinta, en la landing.
- **Hueso** (`--field-bone`): único campo claro. Se usa en el plan Gratis y en el CTA final, siempre con texto en tinta.
- **Texto primario** (`--text-primary`), **Texto secundario** (`--text-secondary`) y **Texto tenue** (`--text-muted`): jerarquía del texto.
- **Borde** (`--border`), **Borde claro** (`--border-light`) y **Contorno**: reglas de 1px decorativas y separadores.
- **Borde de control** (`--border-field`) y su hover (`--border-field-hover`): el contorno de todo lo que se puede llenar o elegir (campos, selects y chips o tarjetas seleccionables). Da 3:1 o más sobre tinta y superficie (WCAG 1.4.11). El tema M3 lo usa como `outline`.

### Estados (admin)

- **Ok** (`--success`), **Pendiente** (`--warning`) y **Error** (`--error`): el texto de los badges de estado de pagos y reservas, sobre un tinte del mismo color al 14% (`--success-surface`, `--warning-surface`, `--error-surface` y `--neutral-surface`).
- **Error texto** (`--error-text`): los mensajes de error bajo los campos (10.4:1 sobre tinta). El borde del campo con error usa `--error`.
- **Chip de plan** (SPEC 02): Prueba ámbar, Gratis gris, Pro dorado y por vencer rojo. Si alguno no llega al contraste AA, se ajusta el tono, no el color.

### Named Rules

**La Regla del Dorado Único.** El dorado pleno va en la acción principal y en un solo campo de color por pantalla. En el admin, el dorado pleno solo aparece en el botón primario y en marcas chicas; las áreas usan sus tintes.

**La Regla del Borde de Control.** Todo lo que se llena o se elige lleva un borde de 3:1 o más (`--border-field`). Las reglas decorativas siguen en `--border`.

**La Regla de la Identidad Fija.** `#0a0a0a` y `#c9a84c` no cambian de valor nunca. Los neutros pueden ajustarse para cumplir el contraste AA, y cada cambio se anota aquí.

## Typography

**Display Font:** Young Serif (con Georgia, serif)
**Body Font:** Source Serif 4 (con Georgia, serif)

**Character:** una serifa de cartel con peso, sobre una serifa de lectura sobria. El resultado se lee como un informe impreso y no como un SaaS genérico. Se cargan desde Google Fonts en `src/index.html`, y Material Icons es la única otra fuente.

### Hierarchy

- **Display** (Young Serif 400, `--step-display`, leading 0.95, tracking -0.02em): solo el h1 del hero. Va en sentence case y en dos líneas desde el eje.
- **Headline** (Young Serif 400, `--step-head`): los títulos de sección de la landing.
- **Title** (Young Serif 400, 1.75rem, o 1.5rem a 600px o menos): títulos de página del admin. Los diálogos usan 1.5rem y los estados vacíos 1.375rem.
- **Lead** (Source Serif 4 400, `--step-lead`): el texto de apoyo bajo los títulos públicos.
- **Body** (Source Serif 4 400, `--step-body`, leading 1.55): texto corrido de la landing y de los legales. Medida de 60 a 70ch.
- **Body app** (Source Serif 4 400, 0.9375rem, leading 1.5): texto del admin, de los campos y de los botones.
- **Title dialog** (Young Serif 400, 1.5rem) y **Title empty** (Young Serif 400, 1.375rem): el título de los diálogos y el de los estados vacíos.
- **Body UI** (Source Serif 4 600, 1.0625rem): el texto de los botones y enlaces públicos y el nombre de los ítems seleccionables (servicios y profesionales).
- **Body UI sm** (Source Serif 4 400, 1rem): el texto de los campos públicos y de los ítems de lista del admin.
- **Label** (Source Serif 4 600, 0.875rem): labels de formulario y metadatos.
- **Label sm** (Source Serif 4 600, 0.8125rem): labels de filtro, badges, mensajes de error y notas legales chicas.
- Los `clamp()` de los títulos de sección de la landing (entre `--step-head` y `--step-display`) son variaciones de Headline y Display propias de cada sección.

### Named Rules

**La Regla de la Serifa Completa.** Todo el texto va en serifa, también en el admin. No se agrega una sans ni una mono.

**La Regla del Sentence Case.** Los títulos van en sentence case, sin mayúsculas sostenidas ni tracking abierto.

## Layout

- **Superficies públicas:** el eje (`--axis: 42vw`) organiza el contenido. Los títulos y el contenido arrancan en el eje y la zona izquierda guarda notas, cifras y etiquetas. Las secciones respiran `--space-section` (de 120 a 200px). El margen lateral es `--margin` (de 16 a 32px).
- **Landing:** navbar fija, delgada y opaca (72px de `scroll-padding-top`). Mosaico de cabecera de 6×2 en escritorio y de 3×2 en móvil, grillas sin gutters y campos a sangre.
- **Admin:** sidebar a la izquierda y contenido con una cabecera de página (título a la izquierda y acción a la derecha, con 24px debajo). Los gaps son de 10 a 16px. En 600px o menos, la cabecera se apila.
- **Breakpoints observados:** 900px (el eje colapsa y el mosaico pasa a 3×2), 600px (cabecera del admin) y 520px (filas de formulario apiladas).
- **Sin scroll horizontal** desde 375px.

## Elevation & Depth

El sistema es plano. La profundidad se construye con pasos de tono (tinta → superficie → superficie elevada → superficie hover) y con reglas de 1px en `--border`. La única sombra es `--shadow-float` (`0 12px 32px rgba(0,0,0,0.5)`), para lo que flota sobre la página: menús y diálogos. El scrim de los diálogos es tinta al 60%.

**La Regla del Plano en Reposo.** Nada tiene sombra en reposo. Si algo necesita separarse, sube un paso de tono o gana una regla.

## Shapes

Hay dos registros de forma, por decisión del SPEC 03:

- **Imprenta (landing, auth y reserva):** esquinas rectas (`--radius-sm`, `--radius-md` y `--radius-lg` en 0) en botones, fotos, campos y campos de color. Los únicos redondos son los indicadores circulares (50%).
- **Mesón (admin y diálogos):** esquinas suaves. Son 6px en botones, campos y botones de ícono; 8px en tarjetas y filas (`app-card`), y 10px en paneles y estados vacíos (`app-panel`); 16px en el contenedor del diálogo; y forma de pastilla (999px) en badges de estado.

**La Regla de los Dos Registros.** Lo público es recto y lo de trabajo es suave. Una superficie no mezcla los dos.

## Components

### Buttons

- **Primario público** (landing, auth y reserva): bloque dorado recto, de 52px de alto en el hero y 44px o más en general, con texto en tinta y peso 600. En hover pasa a dorado claro. Al presionarlo baja 1px y escala a 0.98.
- **Enlace público:** texto primario con un subrayado dorado de 2px y un offset de 6px que se abre en hover.
- **Primario app** (`.btn--primary`): dorado, de 36px de alto, con radio de 6px y padding de 14px.
- **Secundario app** (`.btn--outline` y `.btn--secondary`): superficie con borde claro, que en hover pasa a superficie elevada y contorno.
- **Ícono app** (`.action-btn`): 32×32px, en texto secundario y transparente. En hover toma la superficie hover, y la variante `--danger` toma un tinte rojo.
- **Foco:** contorno de 2px en dorado claro, con un offset de 2 a 4px. Es el valor por defecto global (`:where(...):focus-visible` en `styles.scss`), y los componentes solo ajustan el offset.
- **Tamaño táctil:** a 900px o menos, todo control del admin mide `--target-min` (44px) o más. En las superficies públicas, los controles principales miden 44px o más siempre.
- **Deshabilitado:** opacidad de 0.45 con `cursor: not-allowed`.

### Inputs / Fields

- **Campo app** (`.form-input`): tinta, con un borde de control de 1px (`--border-field`), 40px de alto (44px a 900px o menos) y radio de 6px. En hover el borde pasa a `--border-field-hover`. Con foco, el borde es dorado y el contorno es dorado al 35%.
- **Error:** borde `--error` y mensaje en `.form-error` de 0.8125rem en `--error-text`. El mensaje se asocia al campo con `aria-describedby`, y el campo lleva `aria-invalid`.
- **Campos de Material** (`mat-form-field`): toman el tema M3 oscuro de `mat.theme`, con el dorado como primario y los roles de superficie apuntando a los tokens.

### Chips

- **Badge de estado** (`.estado-badge`): pastilla con un tinte del color de estado al 14%, texto del mismo color y peso 600, de 0.8125rem.
- **Chip de plan** (sidebar): toma su color del plan y enlaza a Configuración.

### Cards / Containers

- **Paneles del admin:** superficie sobre tinta, con radio de 8 a 10px, sin sombra y una regla de 1px cuando hace falta.
- **Estado vacío** (`.empty-state`): panel de superficie centrado, con un ícono de 40px en texto tenue, un título en Young Serif, un texto de 44ch como máximo y la acción.
- **Diálogo** (`.dialog-panel`): superficie con un borde de 1px y radio de 16px, de 480px como máximo. Tiene cabecera con título y botón de cierre, formulario con gaps de 16px y acciones a la derecha.

### Navigation

- **Navbar de la landing:** barra fija, delgada y opaca, sin blur. Lleva el logo, los enlaces a las anclas, "Iniciar sesión" y el botón dorado "Empezar gratis".
- **Sidebar del admin:** navegación vertical con íconos de Material, el banner de aviso y el chip de plan del SPEC 02 al pie.

### Showcase (landing)

Índice de cuatro "salidas" a la izquierda y una hoja de la app a la derecha, recortada por el escenario. Los fragmentos son HTML real de la app (`data-ui`), no capturas.

## Do's and Don'ts

### Do:

- **Do** usar `--bg-primary` (#0a0a0a) como fondo y `--gold` (#c9a84c) como único acento, siempre con sus valores fijos.
- **Do** arrancar los títulos públicos desde el eje (42vw) y colapsarlo al margen en 900px o menos.
- **Do** separar las superficies con un paso de tono o una regla de 1px.
- **Do** poner las fotos en escala de grises con `grayscale(1) contrast(1.05)`.
- **Do** respetar `prefers-reduced-motion`: el contenido es visible sin animaciones y el estado oculto inicial lo aplica GSAP en el navegador, nunca el CSS.
- **Do** dejar en los estados vacíos del admin un título, una frase que diga qué hacer y la acción.

### Don't:

- **Don't** agregar otra familia tipográfica ni volver a Inter o Playfair Display.
- **Don't** usar degradados, texto con degradado ni sombras de brillo.
- **Don't** usar sombras en reposo. `--shadow-float` es solo para lo que flota.
- **Don't** poner esquinas redondeadas en la landing, la auth o la reserva, ni esquinas rectas en el admin.
- **Don't** poner más de un campo dorado por pantalla.
- **Don't** inventar prueba social (testimonios, contadores ni logos de clientes).
- **Don't** usar otra librería de iconos que no sea Material Icons (`<mat-icon>`).
- **Don't** usar GSAP fuera de `src/app/features/landing/`.
