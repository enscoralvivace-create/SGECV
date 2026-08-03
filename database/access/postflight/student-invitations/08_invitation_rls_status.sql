/*
 * RC-3.3.1 - POSTFLIGHT DE SOLO LECTURA
 * No modifica datos ni consulta filas de auth.users.
 */

-- 08. Estado RLS de la tabla de invitaciones.
SELECT
  '08_invitation_rls_status' AS postflight_section,
  namespaces.nspname AS table_schema,
  tables.relname AS table_name,
  tables.relrowsecurity AS rls_enabled,
  tables.relforcerowsecurity AS rls_forced
FROM pg_catalog.pg_class AS tables
JOIN pg_catalog.pg_namespace AS namespaces
  ON namespaces.oid = tables.relnamespace
WHERE namespaces.nspname = 'public'
  AND tables.relname = 'student_account_invitations'
  AND tables.relkind IN ('r', 'p');
