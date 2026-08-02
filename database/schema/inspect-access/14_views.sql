/*
 * SCRIPT DE DIAGNÓSTICO DE SOLO LECTURA — NO MODIFICA DATOS
 */

-- J2. Vistas cuya definición referencia las tablas objetivo
SELECT
  views.schemaname AS view_schema,
  views.viewname AS view_name,
  views.definition
FROM pg_catalog.pg_views AS views
WHERE views.schemaname NOT IN ('pg_catalog', 'information_schema')
  AND views.definition ~* '(member_permission_overrides|(^|[^a-z_])members([^a-z_]|$))'
ORDER BY views.schemaname, views.viewname;

