# RC-3.5 – Fortalecimiento avanzado del flujo de recuperación

## Estado

- Diferido.
- Prioridad baja.
- No bloquea el cierre funcional de RC-3.4.

Esta decisión no implica que RC-3.4 esté completamente validado de extremo a extremo en todos sus escenarios. El estado actual de comprobación es el siguiente:

- `absent`: validado de extremo a extremo.
- `unconfirmed`: el flujo alcanzó `auth.resend({ type: "signup" })`, pero la entrega del correo quedó pendiente debido al rate limit.
- `confirmed`: implementado, pero todavía no existe un candidato seguro para realizar una prueba completa.

## Contexto

RC-3.4 implementa el tratamiento de los tres estados posibles de una cuenta asociada al correo normalizado de una invitación:

- Cuenta inexistente: creación mediante `signUp()` y envío de confirmación.
- Cuenta existente sin confirmar: reenvío de confirmación mediante `resend` de tipo `signup`.
- Cuenta existente confirmada: inicio de recuperación de contraseña.

Además, el diseño vigente contempla:

- confirmación del correo antes de vincular la cuenta;
- consumo atómico de invitaciones;
- vinculación del integrante mediante `members.auth_user_id`;
- validación servidor-side de usuario autenticado, correo confirmado y coincidencia con el correo esperado por la invitación;
- controles razonables contra enumeración mediante respuestas públicas neutrales;
- uso de las nuevas Publishable API Keys y Secret API Keys;
- ausencia de dependencias en claves heredadas.

Estas capacidades describen el alcance implementado, no sustituyen las pruebas funcionales todavía pendientes indicadas en la sección de estado.

## Riesgo residual conocido

Existe un escenario residual en el que:

- el navegador conserva una sesión confirmada previa;
- los marcadores Auth del flujo de recuperación ya no están presentes en la URL;
- el frontend obtiene esa sesión sin evidencia suficiente para determinar su procedencia.

En esas condiciones, el cliente no puede demostrar de manera fiable si la sesión provino de:

- una confirmación normal;
- una recuperación de contraseña;
- un inicio de sesión previo;
- una restauración automática de sesión;
- otra pestaña del navegador.

Por tanto, el cliente no debe considerarse una autoridad definitiva sobre el origen de una sesión. La clasificación realizada en el frontend puede orientar la experiencia de usuario, pero no constituye por sí sola una garantía formal servidor-side de que una contraseña fue cambiada durante el flujo actual.

## Alternativa avanzada analizada

Se analizó una arquitectura de fortalecimiento servidor-side compuesta por:

- una tabla privada de requisitos de activación, inaccesible para roles públicos;
- una RPC privilegiada de preparación;
- persistencia inmutable del estado inicial `absent`, `unconfirmed` o `confirmed` para cada invitación;
- atestación autenticada de una sesión de recuperación mediante `auth.jwt()` y el método `recovery` de `amr`;
- asociación de la atestación con el `session_id` de Auth;
- comprobación servidor-side de que la credencial cambió después de preparar la recuperación;
- fortalecimiento de `public.consume_student_invitation(text)` como finalizador atómico;
- expiración controlada de requisitos y atestaciones;
- protección contra replay y doble consumo;
- bloqueo y orden de concurrencia definidos;
- estrategia explícita de limpieza de registros expirados o completados.

Esta alternativa no se implementa como parte de RC-3.4 ni mediante este documento.

## Motivo para diferir

La alternativa avanzada incrementa sustancialmente:

- la complejidad del modelo de datos y de los contratos entre Auth, PostgreSQL, Edge Functions y frontend;
- la superficie de mantenimiento y auditoría;
- los estados transitorios que deben administrarse;
- las pruebas necesarias para expiración, replay, concurrencia, renovación de sesión, doble apertura y recuperación ante fallos parciales.

El riesgo residual se considera poco frecuente para el contexto operativo actual de Vivace Suite. La implementación vigente conserva controles relevantes de identidad, correo confirmado, coincidencia del correo autenticado con la invitación, vigencia, atomicidad y prevención de vinculaciones duplicadas.

Sin un requisito de seguridad superior, evidencia de abuso o una obligación regulatoria, el costo de introducir y mantener la arquitectura avanzada no se considera justificado en este momento.

## Condiciones para reabrir RC-3.5

RC-3.5 deberá reevaluarse si ocurre al menos una de las siguientes condiciones:

- Vivace Suite comienza a operar con información de alta sensibilidad.
- Surgen requisitos regulatorios o contractuales aplicables al proceso de recuperación y vinculación.
- Existe evidencia de abuso, replay, secuestro de sesión o consumo indebido de invitaciones.
- Se requiere una garantía formal y auditable de que la contraseña cambió antes de vincular una cuenta existente confirmada.
- Se incorpora autenticación multi-organización o una identidad puede participar en múltiples dominios de confianza.
- Una auditoría externa exige trasladar completamente esta decisión de seguridad al servidor.
- Aumenta significativamente el número de usuarios.
- La aplicación adquiere una exposición pública sustancialmente mayor.

## Restricciones vigentes

Mientras RC-3.5 permanezca diferido:

- no deben eliminarse ni debilitarse las validaciones servidor-side actuales;
- no debe utilizarse `user_metadata` como prueba de recuperación, cambio de contraseña o autorización;
- no debe consumirse una invitación sin una sesión autenticada y un correo confirmado;
- no deben reintroducirse claves heredadas;
- cualquier cambio futuro debe conservar respuestas públicas neutrales y evitar enumeración de cuentas;
- no deben almacenarse contraseñas ni tokens Auth;
- los marcadores de URL y eventos del frontend no deben presentarse como una prueba servidor-side definitiva;
- deben conservarse la validación del correo esperado, la vigencia de la invitación, la atomicidad y las protecciones contra duplicidad.

## Referencias del proyecto

- `database/access/13_create_student_invitation_account_resolution.sql`
- `database/access/postflight/13_student_invitation_account_resolution_postflight.sql`
- `supabase/functions/register-student-invitation/index.ts`
- `src/app/activar-cuenta/page.tsx`
- `database/access/10_create_student_invitations.sql`
