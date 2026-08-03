/*
 * RC-3.3.1 - POSTFLIGHT DE SOLO LECTURA
 * No modifica datos ni consulta filas de auth.users.
 */

-- 07. Índices, incluida la unicidad parcial de invitaciones abiertas.
SELECT
  '07_invitation_indexes' AS postflight_section,
  indexes.indexname AS index_name,
  indexes.indexdef AS definition
FROM pg_catalog.pg_indexes AS indexes
WHERE indexes.schemaname = 'public'
  AND indexes.tablename = 'student_account_invitations'
ORDER BY indexes.indexname;
