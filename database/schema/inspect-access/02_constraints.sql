/*
 * SCRIPT DE DIAGNÓSTICO DE SOLO LECTURA — NO MODIFICA DATOS
 */

-- B. Constraints: PK, UNIQUE, FK y CHECK
SELECT
  table_namespace.nspname AS table_schema,
  table_class.relname AS table_name,
  constraint_definition.conname AS constraint_name,
  CASE constraint_definition.contype
    WHEN 'p' THEN 'PRIMARY KEY'
    WHEN 'u' THEN 'UNIQUE'
    WHEN 'f' THEN 'FOREIGN KEY'
    WHEN 'c' THEN 'CHECK'
  END AS constraint_type,
  referenced_namespace.nspname AS referenced_schema,
  referenced_class.relname AS referenced_table,
  pg_get_constraintdef(constraint_definition.oid, true) AS definition
FROM pg_catalog.pg_constraint AS constraint_definition
JOIN pg_catalog.pg_class AS table_class
  ON table_class.oid = constraint_definition.conrelid
JOIN pg_catalog.pg_namespace AS table_namespace
  ON table_namespace.oid = table_class.relnamespace
LEFT JOIN pg_catalog.pg_class AS referenced_class
  ON referenced_class.oid = constraint_definition.confrelid
LEFT JOIN pg_catalog.pg_namespace AS referenced_namespace
  ON referenced_namespace.oid = referenced_class.relnamespace
WHERE table_namespace.nspname = 'public'
  AND table_class.relname IN ('members', 'member_permission_overrides')
  AND constraint_definition.contype IN ('p', 'u', 'f', 'c')
ORDER BY table_class.relname, constraint_type, constraint_definition.conname;

