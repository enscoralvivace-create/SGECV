/*
 * RC-3.3.1 - POSTFLIGHT DE SOLO LECTURA
 * No modifica datos ni consulta filas de auth.users.
 */

-- 17. Funciones históricas de acceso que deben seguir disponibles.
SELECT
  '17_existing_access_functions' AS postflight_section,
  namespaces.nspname AS function_schema,
  functions.proname AS function_name,
  pg_get_function_identity_arguments(functions.oid) AS arguments,
  pg_get_function_result(functions.oid) AS return_type,
  CASE
    WHEN functions.prosecdef THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END AS security_mode
FROM pg_catalog.pg_proc AS functions
JOIN pg_catalog.pg_namespace AS namespaces
  ON namespaces.oid = functions.pronamespace
WHERE namespaces.nspname = 'public'
  AND functions.proname IN (
    'current_member_id',
    'current_member_is_active',
    'current_member_role',
    'role_has_permission',
    'has_app_permission'
  )
  AND functions.prokind IN ('f', 'p')
ORDER BY functions.proname, arguments;
