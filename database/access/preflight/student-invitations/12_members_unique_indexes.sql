/*
 * RC-3.3.1 - PREFLIGHT DE SOLO LECTURA
 * No modifica datos ni consulta filas de auth.users.
 */

-- 12. Índices actuales relacionados con email y auth_user_id.
SELECT
  '12_members_access_indexes' AS diagnostic_section,
  indexes.schemaname AS table_schema,
  indexes.tablename AS table_name,
  indexes.indexname AS index_name,
  indexes.indexdef AS definition
FROM pg_catalog.pg_indexes AS indexes
WHERE indexes.schemaname = 'public'
  AND indexes.tablename = 'members'
  AND (
    indexes.indexdef ~* '[(][[:space:]]*lower[(][[:space:]]*email[[:space:]]*[)]'
    OR indexes.indexdef ~* 'auth_user_id'
  )
ORDER BY indexes.indexname;

