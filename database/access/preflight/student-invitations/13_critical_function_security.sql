/*
 * RC-3.3.1 - PREFLIGHT DE SOLO LECTURA
 * No modifica datos ni consulta filas de auth.users.
 */

-- 13. Propietario, seguridad, search_path y definición de funciones críticas.
WITH critical_functions AS (
  SELECT
    functions.oid,
    namespaces.nspname AS function_schema,
    functions.proname AS function_name,
    pg_get_function_identity_arguments(functions.oid) AS arguments,
    pg_get_userbyid(functions.proowner) AS owner_name,
    functions.prosecdef,
    functions.proconfig,
    languages.lanname AS language,
    pg_get_functiondef(functions.oid) AS definition
  FROM pg_catalog.pg_proc AS functions
  JOIN pg_catalog.pg_namespace AS namespaces
    ON namespaces.oid = functions.pronamespace
  JOIN pg_catalog.pg_language AS languages
    ON languages.oid = functions.prolang
  WHERE namespaces.nspname = 'public'
    AND functions.proname IN (
      'has_app_permission',
      'current_member_role',
      'current_member_is_active',
      'handle_new_member_user'
    )
    AND functions.prokind IN ('f', 'p')
)
SELECT
  '13_critical_function_security' AS diagnostic_section,
  critical_functions.function_schema,
  critical_functions.function_name,
  critical_functions.arguments,
  critical_functions.owner_name,
  CASE
    WHEN critical_functions.prosecdef THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END AS security_mode,
  critical_functions.language,
  (
    SELECT setting
    FROM unnest(COALESCE(critical_functions.proconfig, ARRAY[]::text[])) AS setting
    WHERE setting LIKE 'search_path=%'
    LIMIT 1
  ) AS search_path_configuration,
  critical_functions.definition
FROM critical_functions
ORDER BY critical_functions.function_name, critical_functions.arguments;

