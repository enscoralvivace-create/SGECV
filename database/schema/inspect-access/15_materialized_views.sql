/*
 * SCRIPT DE DIAGNÓSTICO DE SOLO LECTURA — NO MODIFICA DATOS
 */

-- J3. Vistas materializadas cuya definición referencia las tablas objetivo
SELECT
  views.schemaname AS view_schema,
  views.matviewname AS view_name,
  views.definition
FROM pg_catalog.pg_matviews AS views
WHERE views.schemaname NOT IN ('pg_catalog', 'information_schema')
  AND views.definition ~* '(member_permission_overrides|(^|[^a-z_])members([^a-z_]|$))'
ORDER BY views.schemaname, views.matviewname;

