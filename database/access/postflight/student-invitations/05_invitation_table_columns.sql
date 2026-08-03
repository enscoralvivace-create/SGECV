/*
 * RC-3.3.1 - POSTFLIGHT DE SOLO LECTURA
 * No modifica datos ni consulta filas de auth.users.
 */

-- 05. Columnas, tipos, nulabilidad, defaults e identidad.
SELECT
  '05_invitation_columns' AS postflight_section,
  columns.ordinal_position,
  columns.column_name,
  columns.data_type,
  columns.udt_name,
  columns.is_nullable,
  columns.column_default,
  columns.identity_generation
FROM information_schema.columns AS columns
WHERE columns.table_schema = 'public'
  AND columns.table_name = 'student_account_invitations'
ORDER BY columns.ordinal_position;
