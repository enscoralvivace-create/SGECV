/*
 * RC-3.3.1 - POSTFLIGHT DE SOLO LECTURA
 * No modifica datos ni consulta filas de auth.users.
 */

-- 06. Primary key, foreign key y checks de la tabla.
SELECT
  '06_invitation_constraints' AS postflight_section,
  constraints.conname AS constraint_name,
  CASE constraints.contype
    WHEN 'p' THEN 'PRIMARY KEY'
    WHEN 'u' THEN 'UNIQUE'
    WHEN 'f' THEN 'FOREIGN KEY'
    WHEN 'c' THEN 'CHECK'
  END AS constraint_type,
  constraints.convalidated AS is_validated,
  referenced_namespaces.nspname AS referenced_schema,
  referenced_tables.relname AS referenced_table,
  pg_get_constraintdef(constraints.oid, true) AS definition
FROM pg_catalog.pg_constraint AS constraints
JOIN pg_catalog.pg_class AS tables
  ON tables.oid = constraints.conrelid
JOIN pg_catalog.pg_namespace AS namespaces
  ON namespaces.oid = tables.relnamespace
LEFT JOIN pg_catalog.pg_class AS referenced_tables
  ON referenced_tables.oid = constraints.confrelid
LEFT JOIN pg_catalog.pg_namespace AS referenced_namespaces
  ON referenced_namespaces.oid = referenced_tables.relnamespace
WHERE namespaces.nspname = 'public'
  AND tables.relname = 'student_account_invitations'
  AND constraints.contype IN ('p', 'u', 'f', 'c')
ORDER BY constraint_type, constraints.conname;
