/*
 * RC-3.3.1 - PREFLIGHT DE SOLO LECTURA
 * No modifica datos ni consulta filas de auth.users.
 */

-- 07. Trigger exacto de auth.users y su estado; no consulta filas.
SELECT
  '07_auth_signup_trigger' AS diagnostic_section,
  table_namespace.nspname AS table_schema,
  table_class.relname AS table_name,
  triggers.tgname AS trigger_name,
  CASE
    WHEN (triggers.tgtype & 2) <> 0 THEN 'BEFORE'
    WHEN (triggers.tgtype & 64) <> 0 THEN 'INSTEAD OF'
    ELSE 'AFTER'
  END AS timing,
  concat_ws(
    ' OR ',
    CASE WHEN (triggers.tgtype & 4) <> 0 THEN 'INSERT' END,
    CASE WHEN (triggers.tgtype & 8) <> 0 THEN 'DELETE' END,
    CASE WHEN (triggers.tgtype & 16) <> 0 THEN 'UPDATE' END,
    CASE WHEN (triggers.tgtype & 32) <> 0 THEN 'TRUNCATE' END
  ) AS events,
  function_namespace.nspname AS function_schema,
  trigger_functions.proname AS function_name,
  pg_get_triggerdef(triggers.oid, true) AS definition,
  CASE triggers.tgenabled
    WHEN 'O' THEN 'ENABLED'
    WHEN 'D' THEN 'DISABLED'
    WHEN 'R' THEN 'REPLICA'
    WHEN 'A' THEN 'ALWAYS'
    ELSE triggers.tgenabled::text
  END AS enabled_status
FROM pg_catalog.pg_trigger AS triggers
JOIN pg_catalog.pg_class AS table_class
  ON table_class.oid = triggers.tgrelid
JOIN pg_catalog.pg_namespace AS table_namespace
  ON table_namespace.oid = table_class.relnamespace
JOIN pg_catalog.pg_proc AS trigger_functions
  ON trigger_functions.oid = triggers.tgfoid
JOIN pg_catalog.pg_namespace AS function_namespace
  ON function_namespace.oid = trigger_functions.pronamespace
WHERE table_namespace.nspname = 'auth'
  AND table_class.relname = 'users'
  AND triggers.tgname = 'on_auth_user_created_create_member'
  AND NOT triggers.tgisinternal
ORDER BY triggers.tgname;

