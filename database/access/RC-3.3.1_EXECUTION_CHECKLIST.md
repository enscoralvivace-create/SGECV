# RC-3.3.1 — Checklist de ejecución

Esta guía requiere revisión humana. La migración no debe aplicarse hasta completar y aprobar todas las verificaciones.

## A. Respaldo obligatorio

- [ ] Confirmar que el proyecto tiene PITR activo o un backup administrado reciente y restaurable.
- [ ] Registrar la hora y el identificador del punto de restauración previo al cambio.
- [ ] Obtener un volcado `schema-only` del esquema actual. No incluir datos de `auth.users`, seeds ni secretos.
- [ ] Guardar por separado la definición exacta de `auth.on_auth_user_created_create_member` y `public.handle_new_member_user()`.
- [ ] Exportar de forma protegida únicamente `members.id`, `members.auth_user_id`, `members.role` y `members.status`, para recuperar vinculaciones si fuera necesario.
- [ ] Cifrar o proteger ese respaldo porque contiene UUID de autenticación.
- [ ] Guardar respaldos y resultados sensibles fuera del repositorio y fuera de Git.
- [ ] Verificar que una restauración sea operativamente posible antes de continuar.

## B. Preflight

Ejecutar manualmente `database/access/preflight/10_student_invitations_preflight.sql`. Guardar cada resultado fuera del repositorio.

### Criterios exactos para continuar

- La sección 01 devuelve cero roles inesperados.
- La sección 02 devuelve cero correos normalizados duplicados.
- La sección 03 devuelve cero correos con espacios exteriores.
- La sección 05 reporta cero grupos y cero integrantes afectados por `auth_user_id` duplicado.
- La sección 07 devuelve exactamente un trigger habilitado llamado `on_auth_user_created_create_member`, `AFTER INSERT`, sobre `auth.users`, asociado con `public.handle_new_member_user`.
- La sección 08 muestra `pgcrypto` en el esquema `extensions`, o se confirma que el rol ejecutor puede instalarlo ahí.
- La sección 09 no muestra firmas antiguas o incompatibles de las RPC. En particular, no debe existir `create_student_invitation(bigint,text,interval)`.
- La sección 10 indica que `student_account_invitations` no existe. Si existe, su DDL y contenido deben auditarse antes de continuar.
- La sección 11 muestra la constraint histórica esperada para `admin` y `member`.
- La sección 12 confirma los índices únicos esperados de correo y `auth_user_id`.
- La sección 13 devuelve las cuatro funciones críticas y permite confirmar propietario, seguridad y `search_path`.
- Los integrantes reportados en las secciones 04 y 06 quedan identificados y excluidos de futuras invitaciones.
- El rol ejecutor puede modificar `public.members`, administrar el trigger de `auth.users`, crear funciones `SECURITY DEFINER`, administrar RLS/grants y usar `pgcrypto`.

### Criterios exactos para detenerse

- Cualquier rol fuera de `admin`, `teacher`, `member` o `student`.
- Cualquier correo duplicado después de `lower(trim(email))`.
- Cualquier correo con espacios que no haya sido revisado y corregido deliberadamente.
- Cualquier duplicado de `auth_user_id`.
- Trigger ausente, duplicado, deshabilitado o asociado a otra función/evento.
- `pgcrypto` instalado fuera de `extensions` sin un plan revisado de compatibilidad.
- Firma heredada `create_student_invitation(bigint,text,interval)` o cualquier RPC previa no auditada.
- Tabla de invitaciones preexistente sin revisión de estructura, filas, RLS y grants.
- Constraint o índices distintos a los inventariados.
- Falta de alguna función crítica o configuración de seguridad inesperada.
- Falta de backup restaurable o privilegios insuficientes.

## C. Ejecución

- [ ] Suspender temporalmente altas de usuarios y evitar operaciones administrativas concurrentes.
- [ ] Abrir `database/access/10_create_student_invitations.sql` completo en Supabase SQL Editor.
- [ ] Confirmar que el archivo comienza con `BEGIN;` y termina la parte activa con `COMMIT;`.
- [ ] Ejecutar el archivo completo como una sola operación; no ejecutar fragmentos por separado.
- [ ] Confirmar que SQL Editor informa éxito y no muestra rollback, excepción ni sentencia fallida.
- [ ] Confirmar que la transacción terminó y no quedó abierta.

### Objetos que deben existir después

- `public.student_account_invitations` con RLS habilitado.
- Índice único de `token_hash`.
- Índice único parcial de invitación abierta por integrante.
- Índices de `member_id` y `expires_at`.
- `public.create_student_invitation(bigint, interval)`.
- `public.list_student_invitations(bigint)`.
- `public.validate_student_invitation(text)`.
- `public.consume_student_invitation(text)`.
- `public.revoke_student_invitation(uuid)`.
- `members_role_check` permitiendo exactamente `admin`, `teacher`, `member` y `student`.

### Objetos históricos

- El trigger `auth.on_auth_user_created_create_member` debe dejar de existir.
- `public.handle_new_member_user()` debe seguir existiendo sin cambios para rollback.

## D. Smoke tests posteriores

- [ ] Cerrar y renovar la sesión administrativa para evitar permisos almacenados en caché.
- [ ] Confirmar que el administrador conserva acceso a Dashboard, Integrantes y Roles y permisos.
- [ ] Confirmar que las filas existentes de `members` conservan `auth_user_id`, rol y estado según el respaldo.
- [ ] Sin registrar usuarios, confirmar que no se crean ni modifican integrantes automáticamente.
- [ ] Invocar `validate_student_invitation` con un token inválido y confirmar una respuesta neutral: inválido, sin `member_id`, correo completo ni detalles técnicos.
- [ ] Confirmar que `anon` y `authenticated` no pueden leer directamente `student_account_invitations`.
- [ ] Confirmar que `PUBLIC` no conserva EXECUTE sobre las cinco RPC.
- [ ] Confirmar EXECUTE: creación, listado, consumo y revocación para `authenticated`; validación para `anon` y `authenticated`.
- [ ] Confirmar que un usuario sin `members.manage` ni `roles.manage` no puede crear, listar o revocar invitaciones.
- [ ] No crear una invitación real ni una cuenta hasta contar con autorización explícita.

## E. Rollback

### Cuándo considerar rollback

- Un administrador pierde acceso.
- Cambian vinculaciones, roles o estados existentes inesperadamente.
- Las RPC o grants quedan diferentes del diseño aprobado.
- La validación pública expone información no prevista.
- No es posible confirmar que el trigger histórico fue retirado de forma controlada.
- Aparece un error que impide completar los smoke tests esenciales.

### Orden exacto

1. Detener altas, invitaciones y consumos concurrentes.
2. Conservar evidencia del error y comparar vinculaciones con el respaldo.
3. Revisar, adaptar y aprobar el bloque de rollback comentado; nunca ejecutarlo a ciegas.
4. Revocar los grants EXECUTE nuevos.
5. Eliminar las RPC en orden inverso: revocación, consumo, validación, listado y creación.
6. Eliminar `student_account_invitations` sin `CASCADE`, únicamente si se aprobó perder su historial o se respaldó previamente.
7. Recrear exactamente `on_auth_user_created_create_member` como `AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_member_user()`.
8. Restaurar la constraint histórica solo si se verificó que no existen roles `teacher` o `student` que la hagan fallar.
9. Si hubo alteración de vinculaciones, restaurarlas desde el respaldo protegido mediante un procedimiento separado y aprobado.
10. Repetir las verificaciones de trigger, roles, acceso administrativo y vinculaciones.

El rollback comentado es una plantilla. Debe revisarse contra el estado real posterior al fallo antes de ejecutar cualquier sentencia.

## F. Seguridad operativa

- Nunca copiar tokens planos a logs, tickets, capturas, historial de terminal o resultados almacenados en Git.
- Mostrar el token de creación una sola vez y tratarlo como credencial temporal.
- No guardar resultados de preflight, UUID, respaldos o exportaciones sensibles en el repositorio.
- No usar service-role keys en el navegador ni en scripts compartidos.
- No ejecutar altas, invitaciones, aprobaciones o cambios de permisos simultáneos durante la ventana de migración.
- Mantener deshabilitado el registro público hasta completar frontend, configuración de Auth y pruebas controladas.
