/*
 * SCRIPT DE DIAGNÓSTICO DE SOLO LECTURA — NO MODIFICA DATOS
 */

-- C. Índices
SELECT
  indexes.schemaname AS table_schema,
  indexes.tablename AS table_name,
  indexes.indexname AS index_name,
  indexes.indexdef AS definition
FROM pg_catalog.pg_indexes AS indexes
WHERE indexes.schemaname = 'public'
  AND indexes.tablename IN ('members', 'member_permission_overrides')
ORDER BY indexes.tablename, indexes.indexname;

