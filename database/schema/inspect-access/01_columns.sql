/*
 * SCRIPT DE DIAGNÓSTICO DE SOLO LECTURA — NO MODIFICA DATOS
 */

-- A. Columnas
SELECT
  columns.table_schema,
  columns.table_name,
  columns.ordinal_position,
  columns.column_name,
  columns.data_type,
  columns.udt_name,
  columns.is_nullable,
  columns.column_default,
  columns.identity_generation
FROM information_schema.columns AS columns
WHERE columns.table_schema = 'public'
  AND columns.table_name IN ('members', 'member_permission_overrides')
ORDER BY columns.table_name, columns.ordinal_position;

