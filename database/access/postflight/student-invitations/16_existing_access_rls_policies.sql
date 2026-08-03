/*
 * RC-3.3.1 - POSTFLIGHT DE SOLO LECTURA
 * No modifica datos ni consulta filas de auth.users.
 */

-- 16. Políticas históricas que deben permanecer presentes.
SELECT
  '16_existing_access_rls_policies' AS postflight_section,
  policies.tablename AS table_name,
  policies.policyname AS policy_name,
  policies.cmd AS command,
  policies.roles,
  policies.permissive,
  policies.qual AS using_expression,
  policies.with_check AS with_check_expression
FROM pg_catalog.pg_policies AS policies
WHERE policies.schemaname = 'public'
  AND policies.tablename IN ('members', 'member_permission_overrides')
ORDER BY policies.tablename, policies.policyname;
