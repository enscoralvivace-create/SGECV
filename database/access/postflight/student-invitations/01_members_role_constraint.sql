/*
 * RC-3.3.1 - POSTFLIGHT DE SOLO LECTURA
 * No modifica datos ni consulta filas de auth.users.
 */

-- 01. Constraint de roles: existencia, validación y definición exacta.
SELECT
  '01_members_role_constraint' AS postflight_section,
  constraints.conname AS constraint_name,
  constraints.contype AS constraint_type,
  constraints.convalidated AS is_validated,
  pg_get_constraintdef(constraints.oid, true) AS definition
FROM pg_catalog.pg_constraint AS constraints
JOIN pg_catalog.pg_class AS tables
  ON tables.oid = constraints.conrelid
JOIN pg_catalog.pg_namespace AS namespaces
  ON namespaces.oid = tables.relnamespace
WHERE namespaces.nspname = 'public'
  AND tables.relname = 'members'
  AND constraints.conname = 'members_role_check';
