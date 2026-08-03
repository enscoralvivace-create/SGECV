/*
 * RC-3.3.1 - POSTFLIGHT DE SOLO LECTURA
 * No modifica datos ni consulta filas de auth.users.
 */

-- 14. Índices históricos de members que deben permanecer intactos.
SELECT
  '14_members_access_indexes' AS postflight_section,
  indexes.indexname AS index_name,
  indexes.indexdef AS definition
FROM pg_catalog.pg_indexes AS indexes
WHERE indexes.schemaname = 'public'
  AND indexes.tablename = 'members'
  AND indexes.indexname IN (
    'members_auth_user_id_unique',
    'members_email_unique'
  )
ORDER BY indexes.indexname;
