/*
 * SCRIPT DE DIAGNÓSTICO DE SOLO LECTURA — NO MODIFICA DATOS
 */

-- D1. Estado de RLS por tabla
SELECT
  namespaces.nspname AS table_schema,
  tables.relname AS table_name,
  tables.relrowsecurity AS rls_enabled,
  tables.relforcerowsecurity AS rls_forced
FROM pg_catalog.pg_class AS tables
JOIN pg_catalog.pg_namespace AS namespaces
  ON namespaces.oid = tables.relnamespace
WHERE namespaces.nspname = 'public'
  AND tables.relname IN ('members', 'member_permission_overrides')
  AND tables.relkind IN ('r', 'p')
ORDER BY tables.relname;

