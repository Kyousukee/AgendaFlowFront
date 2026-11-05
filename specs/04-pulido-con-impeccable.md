# SPEC 04 — Pulido de toda la app con impeccable

> **Estado:** Aprobado
> **Depende de:** SPEC 03 (`specs/03-rediseno-visual-app.md`)
> **Fecha:** 2026-11-05
> **Objetivo:** Auditar y pulir la landing, auth, la reserva pública y el panel admin con el skill impeccable, manteniendo la dirección `editorial-report` del SPEC 03 y dejando la app sin hallazgos P0 ni P1 y en WCAG 2.2 AA.

## Por qué existe este spec

El SPEC 03 le dio a la app una dirección de arte propia (`editorial-report`) usando taste-skill. Ese skill sirve para elegir una dirección y revisar composición, pero no hace un control sistemático de accesibilidad, responsive, estados de error, textos de UI ni consistencia entre pantallas.

El skill `impeccable` cubre esa parte. Este spec lo usa para **refinar**, no para rediseñar: la identidad del SPEC 03 se conserva y impeccable corrige lo que hay dentro de ella.

Además, el proyecto no tiene `PRODUCT.md` ni `DESIGN.md`. Sin ellos, cada comando de impeccable trabaja sin contexto. Este spec los crea primero, y desde ahí `DESIGN.md` pasa a ser la fuente de verdad del diseño.

## Alcance

**Entra:**

- **Contexto de impeccable.** `init` crea `PRODUCT.md` y `document` (en modo scan, desde el código actual) crea `DESIGN.md` y `.impeccable/design.json`.
- **Hook detector.** Se activa con `/impeccable hooks on` y queda activo en el proyecto.
- **Diagnóstico.** `audit` y `critique` sobre las cuatro áreas, a 375px y 1440px. El resultado se guarda en `specs/04-pulido-con-impeccable-informe.md` con el puntaje y los hallazgos por área.
- **Arreglos con los comandos `polish`, `adapt`, `harden`, `clarify` y `onboard`**, aplicados según los hallazgos del informe.
- **Áreas cubiertas:**
  - **Landing** (modo Persuade): `navbar`, `hero`, `showcase`, `features-section`, `rubros`, `how-it-works`, `pricing`, `faq`, `cta` y `footer`.
  - **Legales** (modo Read): `legal-page`, `privacidad` y `terminos`. Solo cambian estilos y estructura, no el texto legal.
  - **Auth** (modo Operate): `login` y `register`.
  - **Reserva pública** (modo Operate): `reservar-page`, `reservar-form` y `reservar-confirmacion`.
  - **Panel admin** (modo Operate): `layout`, las 8 páginas (`home`, `pagos`, `servicios`, `empleados`, `sucursales`, `horarios`, `bloqueos` y `configuracion`) y los 5 diálogos (`bloqueo-dialog`, `empleado-dialog`, `reserva-detail-dialog`, `servicio-dialog` y `sucursal-dialog`).
- **Qué se puede tocar:** templates (`.html` o template inline), estilos (`.scss`, estilos inline de los diálogos y `src/styles.scss`) y el copy de la UI (labels, textos de ayuda, mensajes de error, estados vacíos y textos de la landing).
- **Accesibilidad WCAG 2.2 AA:** contraste de 4.5:1 en texto normal y 3:1 en texto grande y en componentes, foco visible, objetivos táctiles de 44px o más, labels asociados en todos los campos, navegación por teclado en diálogos y menús, y `alt` en las imágenes.
- **Ajuste de tokens.** Se pueden ajustar los neutros, los tamaños, los espaciados, los radios y las sombras si un hallazgo lo justifica. Cada cambio queda anotado en `DESIGN.md`.
- **Pendientes con lógica.** Los hallazgos que necesitan TS se registran en el informe, en la sección "Pendientes con lógica", para un spec futuro.
- **`.gitignore`.** Se agregan `.taste-skill/`, `.impeccable/config.local.json` y `.claude/settings.local.json`.

**Fuera de alcance (para specs futuros):**

- Cualquier cambio en archivos `.ts`: servicios, componentes, formularios reactivos, validaciones, rutas, guards, interceptores e interfaces. Esto incluye signals o `computed` nuevos para estados de carga, vacío o error.
- Rediseñar o reemplazar la dirección `editorial-report`.
- Cambiar el negro `#0a0a0a`, el dorado `#c9a84c`, el par Young Serif + Source Serif 4 o la idea del eje.
- Cambios en el flujo de la reserva pública o del admin (orden de pasos, campos o navegación).
- Reescribir el contenido de los textos legales.
- Cambiar los planes, precios o límites de `pricing`.
- Agregar en la landing funciones o afirmaciones que la app no tiene.
- Modo claro.
- Componentes compartidos nuevos en `shared/`.
- Reemplazar los iconos (se sigue usando `<mat-icon>`), el logo o el favicon.
- Motion nuevo con GSAP fuera de la landing.
- Los comandos de impeccable que no están en la lista: `bolder`, `quieter`, `distill`, `colorize`, `typeset`, `layout`, `delight`, `overdrive`, `animate`, `optimize`, `extract`, `live` y `generate`.
- Borrar `.taste-skill/` o editar el SPEC 03.

## Modelo de datos

Este spec no introduce estructuras de datos de negocio ni cambia interfaces. Los archivos nuevos son de contexto de diseño y de configuración.

### Archivos nuevos

| Archivo | Lo crea | Contenido |
| --- | --- | --- |
| `PRODUCT.md` | `impeccable init` | Producto, público (barberías y peluquerías, y también tatuaje, uñas, cosmetología y spa), tono y compromisos de marca. |
| `DESIGN.md` | `impeccable document` (scan) | Sistema de diseño derivado del código actual: tokens, tipografía, componentes y reglas. |
| `.impeccable/design.json` | `impeccable document` | Sidecar en formato máquina de `DESIGN.md`. |
| `.impeccable/config.json` | `impeccable hooks on` | Configuración compartida del hook y de los ignores del detector. Se commitea. |
| `.impeccable/config.local.json` | `impeccable hooks on` | Consentimiento local del hook. No se commitea. |
| `specs/04-pulido-con-impeccable-informe.md` | A mano, en los pasos 4 y 10 | Informe antes y después. |

### Estructura del informe

```markdown
# SPEC 04 — Informe de impeccable

## Antes (YYYY-MM-DD)

### Landing
- **Critique:** <puntaje>
- **Audit:**
  - P0 — <hallazgo> — `<archivo>` — <comando que lo arregla>
  - P1 — …

### Legales
### Auth
### Reserva pública
### Panel admin

## Después (YYYY-MM-DD)

(Misma estructura. Cada hallazgo del "Antes" figura como arreglado, aceptado con motivo o movido a pendientes.)

## Cambios de tokens

| Token | Antes | Después | Motivo |

## Pendientes con lógica

- <hallazgo> — `<archivo>` — qué TS haría falta
```

### Reglas que se mantienen del SPEC 03

- `--bg-primary` = `#0a0a0a` y `--gold` = `#c9a84c`.
- `--font-display` = Young Serif y `--font-body` = Source Serif 4.
- Los nombres de las variables CSS actuales no cambian. Solo pueden cambiar los valores de los tokens ajustables.
- Los colores por estado del chip de plan (Prueba ámbar, Gratis gris, Pro dorado y por vencer rojo) se mantienen. Si alguno no llega al contraste AA, se ajusta el tono, no el color.

## Plan de implementación

Cada paso deja la app compilando y usable.

1. **Preparación.** Agregar `.taste-skill/`, `.impeccable/config.local.json` y `.claude/settings.local.json` al `.gitignore`. Correr `impeccable context` desde la raíz del proyecto. Verificar: `git status` ya no muestra `.taste-skill/`.
2. **Contexto del producto y del diseño.** Correr `init` para crear `PRODUCT.md`, con la información de `AGENTS.md` y de los specs 02 y 03. Después correr `document` en modo scan para crear `DESIGN.md` y `.impeccable/design.json` desde los tokens de `src/styles.scss` y los componentes actuales. `DESIGN.md` tiene que reflejar la dirección `editorial-report` y marcar como fijos el negro, el dorado, el par tipográfico y el eje. No se toca código.
3. **Hook.** Correr `/impeccable hooks on` y verificar con `/impeccable hooks status` que está activo.
4. **Diagnóstico inicial.** Levantar la app (`ng serve`) y correr `critique` y `audit` sobre cada área a 375px y 1440px. Escribir la sección "Antes" del informe, con cada hallazgo clasificado (P0 a P3) y asignado a un comando (`polish`, `adapt`, `harden`, `clarify` u `onboard`). Los hallazgos que necesitan TS van directo a "Pendientes con lógica". No se toca código.
5. **Base global.** Arreglar en `src/styles.scss` los hallazgos que se repiten en varias áreas: contraste de neutros, foco visible, tamaño mínimo de los objetivos táctiles y estilos de los campos de Material. Anotar en `DESIGN.md` y en "Cambios de tokens" cada token que cambie. Verificar: `ng build` pasa.
6. **Landing y legales.** Aplicar `adapt`, `clarify` y `polish` a los componentes de la landing, y `adapt` y `polish` a las páginas legales, según el informe. Verificar: `ng build` pasa y el HTML SSR de `/` contiene todo el texto visible.
7. **Auth y reserva pública.** Aplicar `harden`, `clarify`, `adapt` y `polish` a `login`, `register`, `reservar-page`, `reservar-form` y `reservar-confirmacion`. Los mensajes de error y los estados se arreglan solo con template y copy. Verificar: el login, el registro y una reserva completa funcionan igual que antes.
8. **Admin: layout, home y pagos.** Aplicar `adapt`, `harden`, `clarify` y `polish` a `layout`, `home`, `pagos` y `reserva-detail-dialog`. Se conservan el banner de aviso y el chip de plan del SPEC 02.
9. **Admin: listas, agenda y configuración.** Aplicar `onboard` (estados vacíos), `harden`, `clarify` y `polish` a `servicios`, `empleados`, `sucursales`, `horarios`, `bloqueos`, `configuracion` y sus diálogos. Se conservan la etiqueta "Desactivado por plan", el botón "Agregar" deshabilitado y la sección "Tu plan" del SPEC 02.
10. **Diagnóstico final.** Volver a correr `critique` y `audit` sobre cada área a 375px y 1440px. Escribir la sección "Después" del informe. Si queda algún P0 o P1, o si el puntaje de critique de un área bajó, se vuelve al paso de esa área y se repite el diagnóstico. Actualizar `DESIGN.md` y `.impeccable/design.json` si cambiaron los tokens.

## Criterios de aceptación

- [ ] `PRODUCT.md`, `DESIGN.md` y `.impeccable/design.json` existen en la raíz del proyecto.
- [ ] `DESIGN.md` describe la dirección `editorial-report` y marca como fijos el negro `#0a0a0a`, el dorado `#c9a84c`, Young Serif, Source Serif 4 y el eje.
- [ ] `/impeccable hooks status` muestra el hook activo.
- [ ] `.gitignore` incluye `.taste-skill/`, `.impeccable/config.local.json` y `.claude/settings.local.json`, y `git status` no muestra `.taste-skill/`.
- [ ] `specs/04-pulido-con-impeccable-informe.md` tiene las secciones "Antes", "Después", "Cambios de tokens" y "Pendientes con lógica", con las cinco áreas en "Antes" y en "Después".
- [ ] El audit final no tiene hallazgos P0 ni P1 en ninguna de las cinco áreas.
- [ ] El puntaje de critique de cada área en "Después" es igual o mayor que en "Antes".
- [ ] Cada hallazgo de "Antes" figura en "Después" como arreglado, aceptado con motivo o movido a "Pendientes con lógica".
- [ ] Todo texto de la app tiene un contraste de 4.5:1 o más sobre su fondo (3:1 en texto de 24px o más, o de 18.66px o más en negrita).
- [ ] Todos los elementos interactivos muestran un foco visible al navegar con Tab.
- [ ] Todos los botones y enlaces de la reserva pública, auth y admin miden 44×44px o más a 375px.
- [ ] Todos los campos de formulario tienen un label asociado.
- [ ] En cada uno de los 5 diálogos, Tab no sale del diálogo y Esc lo cierra.
- [ ] Las listas de `servicios`, `empleados`, `sucursales` y `bloqueos` muestran un estado vacío con texto cuando no hay datos.
- [ ] Ninguna página tiene scroll horizontal a 375px.
- [ ] `--bg-primary` sigue siendo `#0a0a0a`, `--gold` sigue siendo `#c9a84c`, y se siguen cargando solo Young Serif y Source Serif 4.
- [ ] `git diff main --stat` no muestra cambios en archivos `*.ts` dentro de `src/`, salvo los de los cuatro arreglos de TS mínimo de "Ajustes después del diagnóstico inicial".
- [ ] El texto de `privacidad` y `terminos` es igual que antes.
- [ ] Los planes, precios y límites de `pricing` son los mismos que antes.
- [ ] El banner de aviso, el chip de plan con sus 4 colores, la sección "Tu plan", la etiqueta "Desactivado por plan" y el botón "Agregar" deshabilitado del SPEC 02 se siguen viendo y funcionando.
- [ ] Login, registro, reserva pública completa, crear, editar y eliminar un servicio, y crear un bloqueo siguen funcionando igual que antes.
- [ ] `ng build` termina sin errores.
- [ ] `node dist/AgendaFlow/server/server.mjs` sirve `/` sin errores en la consola del servidor.

## Decisiones

- **Sí:** impeccable refina la dirección del SPEC 03. El rediseño está recién mergeado y funciona como identidad.
- **No:** un rediseño nuevo con impeccable. Tiraría el trabajo del SPEC 03 sin un problema de identidad que lo justifique.
- **No:** solo documentar (`init` + `document`). Deja sin arreglar lo que audit encuentre.
- **Sí:** todas las áreas en un solo spec por fases, por decisión del usuario. Cada fase deja la app funcionando.
- **No:** dividir en un spec de diagnóstico y otro de arreglos, ni un spec por área. Se propusieron y se descartaron.
- **Sí:** se crean primero `PRODUCT.md` y `DESIGN.md`. Sin ese contexto, impeccable trabaja a ciegas y sus críticas son genéricas.
- **Sí:** `document` en modo scan. El diseño ya existe en el código, así que `DESIGN.md` lo describe en vez de proponer uno nuevo.
- **Sí:** `DESIGN.md` pasa a ser la fuente de verdad del diseño. La "Dirección elegida" del SPEC 03 queda como historia y no se edita.
- **Sí:** `.taste-skill/` va al `.gitignore` y no se borra. Son capturas y la hoja de dirección, útiles como referencia local.
- **Sí:** se puede cambiar template, estilos y copy. `clarify` y `harden` necesitan reescribir textos de UI y mensajes de error.
- **No:** cambios en TS, ni siquiera signals en componentes. Se mantiene la regla del SPEC 03 de no mezclar diseño con lógica.
- **Sí:** los hallazgos que necesitan TS se anotan en "Pendientes con lógica". Así no se pierden y alimentan un spec futuro.
- **Sí:** el informe va en un archivo aparte (`specs/04-pulido-con-impeccable-informe.md`). Es el contrato de lo que se arregla y no alarga el spec.
- **No:** guardar el informe dentro del spec ni descartarlo al terminar.
- **Sí:** hook detector activo en el proyecto. Atrapa regresiones al momento de editar.
- **Sí:** la identidad es fija (negro, dorado, par tipográfico y eje). Los neutros, tamaños, espaciados, radios y sombras son ajustables si un hallazgo lo justifica.
- **No:** dejar que impeccable cambie la tipografía o la paleta base, ni congelar todos los tokens del SPEC 03.
- **Sí:** WCAG 2.2 AA como nivel de accesibilidad. Es un estándar verificable, y no depende solo de cómo audit clasifique los hallazgos.
- **Sí:** se termina cuando no quedan P0 ni P1 y el critique de cada área no baja. Es un criterio que se puede verificar.
- **No:** exigir también cero P2. Puede alargar la implementación sin un beneficio proporcional.
- **Sí:** el texto legal no se reescribe con `clarify`. Está pendiente de revisión por un abogado (SPEC 03) y cambiarlo invalidaría esa base.
- **Sí:** los comandos usados son `init`, `document`, `audit`, `critique`, `polish`, `adapt`, `harden`, `clarify` y `onboard`. El resto empuja hacia cambios de identidad (`bolder`, `colorize`, `typeset` y otros) o queda fuera del límite de no tocar TS (`optimize`).

### Ajustes después del diagnóstico inicial (2026-11-05)

- **Sí, amplía el alcance:** se permite el mínimo de TS para cuatro hallazgos graves que no tienen arreglo solo con template. Lo decidió el usuario, porque sin esto no se puede cumplir el criterio "sin P0 ni P1". Los cuatro son:
  1. **P0.** La falla al confirmar la reserva se muestra al cliente. Se agrega una señal de error y un mensaje con `role="alert"` en `reservar-form`.
  2. **P1.** El checkbox de términos bloquea el registro (`Validators.requiredTrue` en `register`).
  3. **P1.** Eliminar en servicios, empleados, sucursales y bloqueos pide confirmación y avisa si falla.
  4. **P1.** El modal de pago de Inicio atrapa el foco (`cdkTrapFocus`).

  Todo lo demás que requiere TS sigue en "Pendientes con lógica". Por esto, el criterio "`git diff main --stat` no muestra cambios en archivos `*.ts`" queda limitado a los archivos de esos cuatro arreglos.
- **Sí, segunda ampliación (2026-11-05, después del diagnóstico final):** el usuario autorizó TS mínimo para los 4 P1 que quedaron:
  1. La confirmación de la reserva muestra qué se reservó y cuándo.
  2. El admin avisa cuando falla un guardado o una carga, en Horarios, Configuración, los 4 diálogos (desde sus páginas) y la agenda de Inicio.
  3. El modal de pago no se cierra solo, no pierde el estado elegido y pide confirmación antes de cancelar una reserva.
  4. Los errores de Inicio dicen qué pasó y qué hacer.

  Esto también amplía el criterio de "sin cambios en `*.ts`".
- **Sí:** el P1 del login sin recuperación de contraseña queda **aceptado con motivo**, por decisión del usuario. No existe un flujo de recuperación ni un canal confirmado, y no se inventa uno. Vuelve cuando el back tenga el flujo.
- **Sí:** el copy de pricing no se toca, por decisión del usuario. Las menciones a "analíticas avanzadas", "soporte prioritario" y "horarios limitados" quedan en el informe como "aceptado con motivo".

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Impeccable empuja a cambiar la identidad (fuentes, dorado o eje) | `DESIGN.md` marca esos valores como fijos, y "the brief wins" en impeccable hace que se respeten. Lo verifica el criterio de tokens y fuentes. |
| Un ajuste de neutros para el contraste rompe el look del SPEC 03 | Cada cambio de token queda en "Cambios de tokens" con su motivo, y el critique de cada área no puede bajar. |
| Un hallazgo P0 o P1 solo se arregla con TS | Se mueve a "Pendientes con lógica" con motivo. Si es P0 de accesibilidad y no tiene arreglo sin TS, se detiene el spec y se consulta al usuario antes de ampliar el alcance. |
| `clarify` cambia un texto que tiene peso legal o comercial (precios o promesas) | Los textos legales y los datos de `pricing` quedan fuera de `clarify`. La landing no puede agregar funciones que no existen. |
| Un cambio de template rompe un binding o un formulario | Solo cambian marcado, estilos y textos. Se conservan los bindings, `formControlName` y los eventos. Lo verifican los flujos probados a mano. |
| El hook genera ruido en archivos `.ts` | El hook solo reporta en `.ts` cuando encuentra algo. Las excepciones se registran con `impeccable hooks ignore-*` y su motivo. |
| El launcher de impeccable no corre en Windows | Se usa `impeccable.cmd`. Si falla, se sigue leyendo `PRODUCT.md` y `DESIGN.md` a mano, como indica el skill. |
| Spec grande que queda a medio implementar | Las fases por área son independientes y cada una deja la app funcionando. El informe muestra qué falta. |

## Qué **no** entra en este spec

- Cambios en archivos `.ts` (servicios, componentes, rutas, guards, interceptores o interfaces).
- Rediseñar la dirección `editorial-report`, o cambiar el negro, el dorado, el par tipográfico o el eje.
- Cambios en el flujo de la reserva pública o del admin.
- Reescribir los textos legales o cambiar planes, precios o límites.
- Modo claro, componentes compartidos nuevos, otra librería de iconos, logo o favicon.
- Motion nuevo con GSAP fuera de la landing.
- Los comandos `bolder`, `quieter`, `distill`, `colorize`, `typeset`, `layout`, `delight`, `overdrive`, `animate`, `optimize`, `extract`, `live` y `generate`.
- Resolver los "Pendientes con lógica".

Cada uno, si se hace, va en su propio spec.
