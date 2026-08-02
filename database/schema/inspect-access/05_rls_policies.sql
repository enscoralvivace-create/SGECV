/*
 * SCRIPT DE DIAGNÓSTICO DE SOLO LECTURA — NO MODIFICA DATOS
 */

-- D2. Políticas RLS
SELECT
  policies.schemaname AS table_schema,
  policies.tablename AS table_name,
  policies.policyname AS policy_name,
  policies.cmd AS command,
  policies.roles,
  policies.qual AS using_expression,
  policies.with_check AS with_check_expression,
  policies.permissive
FROM pg_catalog.pg_policies AS policies
WHERE policies.schemaname = 'public'
  AND policies.tablename IN ('members', 'member_permission_overrides')
ORDER BY policies.tablename, policies.policyname;

