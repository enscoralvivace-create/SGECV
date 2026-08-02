/*
 * SCRIPT DE DIAGNÓSTICO DE SOLO LECTURA — NO MODIFICA DATOS
 */

-- E. Triggers y función asociada
SELECT
  table_namespace.nspname AS table_schema,
  table_class.relname AS table_name,
  trigger_definition.tgname AS trigger_name,
  CASE
    WHEN (trigger_definition.tgtype & 2) <> 0 THEN 'BEFORE'
    WHEN (trigger_definition.tgtype & 64) <> 0 THEN 'INSTEAD OF'
    ELSE 'AFTER'
  END AS timing,
  concat_ws(
    ' OR ',
    CASE WHEN (trigger_definition.tgtype & 4) <> 0 THEN 'INSERT' END,
    CASE WHEN (trigger_definition.tgtype & 8) <> 0 THEN 'DELETE' END,
    CASE WHEN (trigger_definition.tgtype & 16) <> 0 THEN 'UPDATE' END,
    CASE WHEN (trigger_definition.tgtype & 32) <> 0 THEN 'TRUNCATE' END
  ) AS events,
  function_namespace.nspname AS function_schema,
  function_definition.proname AS function_name,
  pg_get_triggerdef(trigger_definition.oid, true) AS definition
FROM pg_catalog.pg_trigger AS trigger_definition
JOIN pg_catalog.pg_class AS table_class
  ON table_class.oid = trigger_definition.tgrelid
JOIN pg_catalog.pg_namespace AS table_namespace
  ON table_namespace.oid = table_class.relnamespace
JOIN pg_catalog.pg_proc AS function_definition
  ON function_definition.oid = trigger_definition.tgfoid
JOIN pg_catalog.pg_namespace AS function_namespace
  ON function_namespace.oid = function_definition.pronamespace
WHERE NOT trigger_definition.tgisinternal
  AND table_namespace.nspname = 'public'
  AND table_class.relname IN ('members', 'member_permission_overrides')
ORDER BY table_class.relname, trigger_definition.tgname;

