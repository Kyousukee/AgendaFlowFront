# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Dueños y recepción de negocios que trabajan con hora agendada.** Sobre todo barberías y peluquerías pequeñas y medianas en Chile. Configuran el negocio (sucursales, empleados, servicios, horarios y bloqueos) y miran el día en el panel admin. Lo usan por igual desde el celular, entre un cliente y otro, y desde el computador del mesón. Las dos situaciones pesan lo mismo.
- **Clientes finales de esos negocios.** Reservan su hora solos desde el enlace público del negocio (`/reservar/:slug`), casi siempre desde el teléfono y sin crear una cuenta.
- **Otros rubros con hora agendada.** Estudios de tatuaje, uñas, cosmetología, spa, masajes, y cejas y pestañas. Usan el mismo producto sin cambios.

## Product Purpose

AgendaFlow reemplaza la libreta del mesón y el chat de WhatsApp como forma de agendar. El cliente reserva solo, a cualquier hora, y el negocio ve su día completo en un panel. El éxito es que el dueño deje de coordinar horas a mano y que ninguna reserva se pierda ni se cruce.

## Positioning

Es una agenda online pensada para el mesón de una barbería chilena. Las horas libres se calculan desde la duración real de cada servicio, el horario de cada profesional y sucursal, y los bloqueos (almuerzo, vacaciones y feriados). El precio va en pesos chilenos y hay un plan Gratis que no vence.

## Operating Context

- El panel admin se usa en medio de la atención: con prisa, a veces con una sola mano en el teléfono y a veces en el computador de recepción.
- La reserva pública se abre desde un enlace compartido por el negocio (redes sociales o WhatsApp). La abre un cliente que no conoce la app.
- La app consume una API REST en NestJS (`api.agendaflow.cl`). El front es Angular con SSR, y la landing se prerenderiza.

## Capabilities and Constraints

- **Lo que existe:**
  - Reservas online 24/7 desde un enlace propio.
  - Horas libres calculadas según la duración de cada servicio.
  - Precio y duración visibles antes de reservar.
  - Agenda por profesional.
  - Varias sucursales con su propio horario.
  - Bloqueos de agenda.
  - Registro de pagos por reserva.
  - Panel del día.
  - Logo de la empresa.
- **Planes:**
  - **Prueba:** tiene vencimiento.
  - **Gratis:** $0, no vence, con límites de sucursales, empleados y servicios.
  - **Pro:** $19.990 al mes, sin límites.
  - Lo que pasa del límite queda desactivado, no borrado. Pro se activa escribiendo al equipo, sin pago en línea.
- **Lo que no existe y no se puede prometer:** IA, SMS, punto de venta, inventario y cifras de reducción de inasistencias.
- **Restricciones técnicas:** Angular 22 standalone con SSR, Angular Material como base de componentes y Material Icons como única librería de iconos.

## Brand Commitments

- **Nombre:** AgendaFlow. El logo está en `public/logo.png`.
- **Idioma y voz:** español de Chile neutro, tuteando ("tú ves", "tus clientes"), sin chilenismos fuertes. La voz es directa y concreta: describe lo que la app hace, sin superlativos.
- **Mercado:** solo Chile por ahora. Los precios van en CLP con punto de miles (`$19.990`).
- **Textos legales:** las páginas de privacidad y términos citan las leyes 19.628, 21.719 y 19.496. Están pendientes de revisión por un abogado, así que no se reescriben sin esa revisión.

## Evidence on Hand

- **No hay clientes, testimonios, cifras de uso ni casos reales.** No se pueden inventar testimonios, logos de clientes, contadores ("500+ negocios") ni métricas de resultado.
- **Fotos stock** (Unsplash y Pexels) en `public/images/landing/`, con sus créditos en `CREDITOS.md`.
- **La app real** sirve como demostración: los fragmentos de interfaz del showcase de la landing son HTML real de la app.

## Product Principles

1. **El cliente reserva solo.** Cada paso de la reserva pública tiene que poder hacerse sin ayuda y sin cuenta, desde el teléfono.
2. **El dueño ve su día de un vistazo.** En el admin, la información del día va antes que la configuración.
3. **Solo se dice lo que existe.** El copy describe funciones reales y nunca promete lo que la app no hace.
4. **Nada se pierde en silencio.** Los límites del plan, los errores y los registros desactivados se explican en palabras.
5. **Sirve a más rubros que la barbería**, aunque la barbería y la peluquería son el centro.

## Accessibility & Inclusion

- WCAG 2.2 AA en toda la app (SPEC 04): contraste de 4.5:1 en texto, foco visible, objetivos táctiles de 44px o más, labels en todos los campos y uso completo de los diálogos con el teclado.
- Respeta `prefers-reduced-motion`.
