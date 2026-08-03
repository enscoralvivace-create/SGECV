# RC-3.3.3 — Checklist de ejecución

> No ejecutar esta secuencia mientras existan bloqueos abiertos. No copiar respaldos, tokens, correos, contraseñas ni claves al repositorio, tickets o logs.

## 0. Bloqueos detectados en la auditoría

- [ ] **Detener despliegue:** `supabase/functions/register-student-invitation/index.ts` referencia el tipo inexistente `RegistrationRequest` al convertir el resultado de `JSON.parse`. Debe corregirse y pasar `deno check` antes del despliegue.
- [ ] **Detener aprobación del postflight:** el postflight obtiene `proowner`, pero el resultado final no muestra el nombre del propietario. Debe poder confirmarse explícitamente que la función pertenece a un rol administrativo confiable antes de aprobarla.
- [ ] Documentar la corrección y repetir la revisión de seguridad sin ampliar el alcance.

## 1. Precondiciones

- [ ] Existe un commit de seguridad local que contiene exactamente la versión auditada que se pretende ejecutar y desplegar.
- [ ] El árbol de trabajo y el commit fueron revisados para excluir `.env`, respaldos, correos, tokens, contraseñas y claves.
- [ ] Existe un respaldo privado y recuperable de las columnas necesarias de `members`, como mínimo `id`, `auth_user_id`, `role` y `status`.
- [ ] El respaldo está cifrado o protegido y fuera de Git.
- [ ] RC-3.3.1 está operativa: tabla de invitaciones, cinco RPC, grants y retiro del trigger histórico validados.
- [ ] La corrección de grants de las RPC de invitaciones está aplicada y aprobada por postflight.
- [ ] No hay altas, invitaciones, confirmaciones ni vinculaciones ejecutándose simultáneamente.
- [ ] Se acordó una ventana de cambio con una persona responsable de detener la ejecución ante cualquier resultado inesperado.

## 2. Auditoría de la migración 12

Archivo: `database/access/12_prepare_student_invitation_signup.sql`

- [ ] Está envuelta en `BEGIN` y `COMMIT`.
- [ ] Crea o reemplaza únicamente `public.resolve_student_invitation_for_signup(text)`.
- [ ] No contiene `INSERT`, `UPDATE`, `DELETE`, `MERGE` ni `TRUNCATE` ejecutables.
- [ ] No consume ni marca invitaciones como usadas.
- [ ] No crea usuarios Auth ni modifica integrantes.
- [ ] La función es `SECURITY DEFINER`.
- [ ] Declara `SET search_path TO ''`.
- [ ] Devuelve únicamente `email_normalized text`.
- [ ] No devuelve `member_id`, `auth_user_id`, `token_hash` ni el token plano.
- [ ] Rechaza tokens nulos, vacíos o con formato inválido.
- [ ] Compara el hash SHA-256 del token usando `extensions.digest`.
- [ ] Rechaza invitaciones usadas, revocadas o expiradas.
- [ ] Exige integrante existente y estado `Activo`.
- [ ] Exige correo no vacío, normalizado, con formato válido y único.
- [ ] Exige rol `member` o `student`.
- [ ] Exige `auth_user_id IS NULL`.
- [ ] Confirma que el correo actual coincide con `invitation.email_normalized`.
- [ ] Los grants finales son exactamente:

  | Rol | EXECUTE esperado |
  | --- | --- |
  | `PUBLIC` | No |
  | `anon` | No |
  | `authenticated` | No |
  | `service_role` | Sí |

- [ ] No modifica privilegios por defecto ni grants de otros objetos.

## 3. Aplicación de la migración

- [ ] Abrir Supabase Dashboard → SQL Editor en el proyecto correcto.
- [ ] Confirmar nuevamente que no existen operaciones concurrentes.
- [ ] Pegar el contenido completo de `database/access/12_prepare_student_invitation_signup.sql`.
- [ ] Ejecutar el archivo completo en una sola operación; no ejecutar fragmentos.
- [ ] Confirmar finalización sin errores y `COMMIT` exitoso.
- [ ] Resultado esperado: existe una función nueva o reemplazada con la firma exacta `public.resolve_student_invitation_for_signup(text)` y no cambia ninguna fila.
- [ ] Ante cualquier error, detenerse; no repetir parcialmente ni continuar al despliegue.
- [ ] No desplegar la Edge Function hasta que el postflight completo sea aprobado.

## 4. Postflight

Archivo: `database/access/postflight/12_student_invitation_signup_postflight.sql`

- [ ] Ejecutarlo inmediatamente después de la migración.
- [ ] Confirmar esquema `public`.
- [ ] Confirmar nombre `resolve_student_invitation_for_signup`.
- [ ] Confirmar argumento de identidad `plain_token text`.
- [ ] Confirmar retorno `TABLE(email_normalized text)` o representación equivalente del catálogo.
- [ ] Confirmar lenguaje `plpgsql`.
- [ ] Confirmar `security_definer = true`.
- [ ] Confirmar configuración que represente `search_path=""`.
- [ ] Confirmar que el propietario es un rol administrativo confiable; nunca `anon` ni `authenticated`.
- [ ] Confirmar la matriz exacta:

  | `grantee` | `expected_execute` | `actual_execute` | `matches_expected` |
  | --- | ---: | ---: | ---: |
  | `PUBLIC` | `false` | `false` | `true` |
  | `anon` | `false` | `false` | `true` |
  | `authenticated` | `false` | `false` | `true` |
  | `service_role` | `true` | `true` | `true` |

- [ ] Deben aparecer exactamente cuatro filas, una por cada grantee.
- [ ] Si falta la función, un rol, una fila o cualquier `matches_expected` no es `true`, detenerse.
- [ ] No aprobar mientras el postflight actual no permita verificar explícitamente el propietario.

## 5. Configuración de Supabase Auth

- [ ] En Authentication → Providers → Email, **Confirm email** está activado.
- [ ] El registro por correo está habilitado para que `auth.signUp()` de la Edge Function pueda crear la cuenta pendiente.
- [ ] Site URL de desarrollo configurada con el origen exacto usado en pruebas, normalmente `http://localhost:3000`.
- [ ] Redirect URL de desarrollo añadida exactamente: `http://localhost:3000/activar-cuenta`.
- [ ] Site URL productiva futura definida antes del despliegue productivo.
- [ ] Redirect URL productiva futura añadida con HTTPS y ruta exacta `/activar-cuenta`.
- [ ] La plantilla **Confirm signup** conserva el enlace oficial de confirmación y no incluye datos internos.
- [ ] SMTP o proveedor de correo está configurado y validado; no continuar si no puede comprobarse la entrega.
- [ ] Se conocen límites de envío y expiración de enlaces del proveedor.
- [ ] Se acepta el riesgo documentado de que Auth público habilitado permita identidades no vinculadas, aunque no reciban roles ni acceso de integrante.

## 6. Edge Function

Función: `supabase/functions/register-student-invitation/index.ts`

### Variables y secretos requeridos

- [ ] `SUPABASE_URL` disponible en el runtime.
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada para el frontend.
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` configurada para el frontend sin fallback a claves heredadas.
- [ ] `VIVACE_SUPABASE_PUBLISHABLE_KEY` disponible únicamente en el runtime de la Edge Function para `auth.signUp()`.
- [ ] `VIVACE_SUPABASE_SECRET_KEY` disponible únicamente en el runtime servidor para la RPC privilegiada.
- [ ] `ALLOWED_ORIGINS` configurada con orígenes exactos separados por comas y sin comodines.
- [ ] La Secret API Key no usa prefijo `NEXT_PUBLIC_*` ni está presente en el navegador.
- [ ] No quedan referencias ejecutables a `SUPABASE_ANON_KEY` ni `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] Ningún valor fue guardado en Git o copiado a logs.

### Auditoría antes del despliegue

- [ ] El body acepta exclusivamente `plain_token`, `password`, `password_confirmation` y `redirect_origin`.
- [ ] Rechaza campos adicionales, incluyendo `email`, `role`, `memberId`, `member_id` y `auth_user_id`.
- [ ] El cliente con `VIVACE_SUPABASE_SECRET_KEY` se usa únicamente para `resolve_student_invitation_for_signup`; el rol de base de datos efectivo conserva el grant exclusivo requerido.
- [ ] `auth.signUp()` usa el cliente separado con `VIVACE_SUPABASE_PUBLISHABLE_KEY` y sin persistencia de sesión.
- [ ] CORS devuelve acceso únicamente a orígenes de `ALLOWED_ORIGINS`.
- [ ] `redirect_origin` coincide exactamente con el encabezado `Origin` permitido.
- [ ] Solo acepta `POST`; `OPTIONS` se limita a preflight CORS.
- [ ] El body está limitado a 8 KiB.
- [ ] No existen `console.log`, logs de errores sensibles ni respuestas que incluyan token, contraseña, correo o sesión.
- [ ] El rate limiting básico fue revisado y existe una estrategia adicional para producción.
- [ ] La función pasa `deno check` con el runtime y dependencias que se desplegarán.

### Despliegue futuro

- [ ] Desplegar solo después de aprobar migración y postflight.
- [ ] Cargar las claves mediante entrada interactiva o variables locales temporales; nunca escribir sus valores en comandos, historial o documentación.
- [ ] Configurar `VIVACE_SUPABASE_PUBLISHABLE_KEY`, `VIVACE_SUPABASE_SECRET_KEY` y `ALLOWED_ORIGINS` antes del despliegue.
- [ ] Usar: `supabase functions deploy register-student-invitation --no-verify-jwt`.
- [ ] Confirmar que el proyecto vinculado es el correcto antes de ejecutar.
- [ ] No incluir secretos en el comando ni en su salida guardada.
- [ ] Probar login, lectura RLS, `OPTIONS`, `POST` inválido, creación de invitación y un registro controlado.
- [ ] Deshabilitar las claves heredadas `anon` y `service_role` solo después de aprobar todas las pruebas.
- [ ] Repetir las pruebas esenciales después de deshabilitar las claves heredadas.
- [ ] Revocar la Previous Legacy HS256 Key únicamente cuando frontend y Edge Function continúen operativos.
- [ ] Cerrar sesiones antiguas y volver a iniciar sesión después de la revocación.

## 7. Activación

Archivos:

- `src/app/registro/invitacion/[token]/page.tsx`
- `src/app/activar-cuenta/page.tsx`

- [ ] La ruta pública valida la invitación antes de mostrar el formulario.
- [ ] Solo muestra el correo enmascarado.
- [ ] No solicita correo, nombre, rol ni identificador de integrante.
- [ ] No usa `localStorage`, `sessionStorage` ni cookies para el token.
- [ ] Después de iniciar el alta, retira el token de la URL actual.
- [ ] `/activar-cuenta` extrae y retira `invitation` de la URL visible inmediatamente.
- [ ] El token permanece únicamente en memoria durante la activación.
- [ ] La página espera una sesión Auth válida.
- [ ] Comprueba `email_confirmed_at` antes de consumir la invitación.
- [ ] `consume_student_invitation` solo se invoca después de confirmar la sesión y el correo.
- [ ] La URL queda limpia al terminar, tanto en éxito como en error.

## 8. Smoke test completo

Realizar únicamente con autorización explícita, integrante de prueba controlado y correo accesible.

- [ ] Generar una invitación real para un integrante elegible.
- [ ] Abrir `/registro/invitacion/[token]` desde QR o enlace.
- [ ] Confirmar “Invitación válida” y correo enmascarado correcto.
- [ ] Establecer y confirmar una contraseña de prueba aprobada.
- [ ] Confirmar respuesta neutra y ausencia del token en la URL visible.
- [ ] Recibir el correo de confirmación; si no llega, detenerse y revisar SMTP, plantilla y límites.
- [ ] Abrir el enlace de confirmación en el mismo navegador de prueba.
- [ ] Confirmar estados “Verificando correo” y “Activando cuenta”.
- [ ] Confirmar estado final “Cuenta activada”.
- [ ] Verificar administrativamente que `members.auth_user_id` quedó asignado sin exponer el UUID en reportes compartidos.
- [ ] Verificar que `members.role = 'student'`.
- [ ] Verificar que la invitación quedó con estado `used` y `used_at` no nulo, sin consultar ni mostrar `token_hash`.
- [ ] Cerrar sesión e iniciar sesión como alumno.
- [ ] Confirmar acceso únicamente a módulos permitidos para `student`.
- [ ] Confirmar que no puede consultar otros integrantes, estados de cuenta ajenos ni acciones administrativas.
- [ ] Reabrir el enlace original y confirmar que ya no permite otra activación.

## 9. Orden exacto de ejecución

1. Corregir los bloqueos de la sección 0 y repetir validaciones estáticas.
2. Crear y verificar el commit de seguridad local; no hacer push hasta autorización.
3. Crear y validar el respaldo privado de `members`.
4. Confirmar RC-3.3.1 y congelar altas concurrentes.
5. Auditar nuevamente la migración 12 contra la sección 2.
6. Ejecutar completa la migración 12 en una sola operación.
7. Ejecutar el postflight 12 y aprobar firma, propietario, seguridad, `search_path` y grants.
8. Configurar Confirm email, registro Auth, Site URL, redirects, plantilla y SMTP.
9. Configurar el frontend y las variables `VIVACE_SUPABASE_PUBLISHABLE_KEY`, `VIVACE_SUPABASE_SECRET_KEY` y `ALLOWED_ORIGINS` sin exponer valores.
10. Ejecutar `deno check` y pruebas locales controladas.
11. Desplegar la Edge Function con `--no-verify-jwt`.
12. Ejecutar pruebas negativas de método, origen, body, contraseña e invitación.
13. Ejecutar un único smoke test completo autorizado.
14. Verificar vinculación, rol, consumo y permisos del alumno.
15. Deshabilitar las claves heredadas `anon` y `service_role` y repetir las pruebas esenciales.
16. Revocar la Previous Legacy HS256 Key, cerrar sesiones antiguas y volver a iniciar sesión.
17. Cerrar la ventana de cambio y documentar resultados sin datos sensibles.
