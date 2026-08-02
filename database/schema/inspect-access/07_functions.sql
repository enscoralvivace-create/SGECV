/*
 * SCRIPT DE DIAGNÓSTICO DE SOLO LECTURA — NO MODIFICA DATOS
 */

-- F. Funciones cuyo DDL menciona objetos de acceso relevantes
WITH related_functions AS (
  SELECT
    functions.oid,
    namespaces.nspname AS function_schema,
    functions.proname AS function_name,
    pg_get_function_identity_arguments(functions.oid) AS arguments,
    pg_get_function_result(functions.oid) AS return_type,
    languages.lanname AS language,
    functions.prosecdef AS security_definer,
    functions.proconfig AS configuration,
    pg_get_functiondef(functions.oid) AS definition
  FROM pg_catalog.pg_proc AS functions
  JOIN pg_catalog.pg_namespace AS namespaces
    ON namespaces.oid = functions.pronamespace
  JOIN pg_catalog.pg_language AS languages
    ON languages.oid = functions.prolang
  WHERE namespaces.nspname NOT IN ('pg_catalog', 'information_schema')
    AND functions.prokind IN ('f', 'p')
)
SELECT
  related_functions.function_schema,
  related_functions.function_name,
  related_functions.arguments,
  related_functions.return_type,
  related_functions.language,
  CASE
    WHEN related_functions.security_definer THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END AS security_mode,
  related_functions.configuration AS function_configuration,
  (
    SELECT setting
    FROM unnest(COALESCE(related_functions.configuration, ARRAY[]::text[])) AS setting
    WHERE setting LIKE 'search_path=%'
    LIMIT 1
  ) AS search_path_configuration,
  related_functions.definition
FROM related_functions
WHERE related_functions.definition ~* '(member_permission_overrides|auth[.]uid|auth[.]users|(^|[^a-z_])members([^a-z_]|$))'
ORDER BY related_functions.function_schema, related_functions.function_name, related_functions.arguments;

