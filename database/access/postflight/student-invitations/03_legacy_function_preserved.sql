/*
 * RC-3.3.1 - POSTFLIGHT DE SOLO LECTURA
 * No modifica datos ni consulta filas de auth.users.
 */

-- 03. La función histórica debe permanecer; comparar hash/DDL con preflight.
SELECT
  '03_historical_function_preserved' AS postflight_section,
  namespaces.nspname AS function_schema,
  functions.proname AS function_name,
  pg_get_function_identity_arguments(functions.oid) AS arguments,
  pg_get_userbyid(functions.proowner) AS owner_name,
  CASE
    WHEN functions.prosecdef THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END AS security_mode,
  md5(pg_get_functiondef(functions.oid)) AS definition_md5,
  pg_get_functiondef(functions.oid) AS definition
FROM pg_catalog.pg_proc AS functions
JOIN pg_catalog.pg_namespace AS namespaces
  ON namespaces.oid = functions.pronamespace
WHERE namespaces.nspname = 'public'
  AND functions.proname = 'handle_new_member_user'
  AND functions.prokind IN ('f', 'p')
ORDER BY arguments;
