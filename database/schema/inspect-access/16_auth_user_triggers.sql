/*
 * SCRIPT DE DIAGNÓSTICO DE SOLO LECTURA — NO MODIFICA DATOS
 */

-- Triggers de auth.users asociados a public.handle_new_member_user().
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
  pg_get_triggerdef(trigger_definition.oid, true) AS definition,
  CASE trigger_definition.tgenabled
    WHEN 'O' THEN 'ENABLED'
    WHEN 'D' THEN 'DISABLED'
    WHEN 'R' THEN 'REPLICA'
    WHEN 'A' THEN 'ALWAYS'
    ELSE trigger_definition.tgenabled::text
  END AS enabled_status
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
  AND table_namespace.nspname = 'auth'
  AND table_class.relname = 'users'
  AND (
    (
      function_namespace.nspname = 'public'
      AND function_definition.proname = 'handle_new_member_user'
    )
    OR pg_get_triggerdef(trigger_definition.oid, true) ~* 'public[.]handle_new_member_user'
  )
ORDER BY trigger_definition.tgname;
