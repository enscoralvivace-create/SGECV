/*
 * SCRIPT DE DIAGNÓSTICO DE SOLO LECTURA — NO MODIFICA DATOS
 */

-- public.role_has_permission() y funciones de las que depende directamente.
WITH root_functions AS (
  SELECT functions.oid
  FROM pg_catalog.pg_proc AS functions
  JOIN pg_catalog.pg_namespace AS namespaces
    ON namespaces.oid = functions.pronamespace
  WHERE namespaces.nspname = 'public'
    AND functions.proname = 'role_has_permission'
    AND functions.prokind IN ('f', 'p')
),
direct_function_dependencies AS (
  SELECT DISTINCT dependencies.refobjid AS oid
  FROM pg_catalog.pg_depend AS dependencies
  JOIN root_functions
    ON root_functions.oid = dependencies.objid
  WHERE dependencies.classid = 'pg_catalog.pg_proc'::regclass
    AND dependencies.refclassid = 'pg_catalog.pg_proc'::regclass
    AND dependencies.refobjid <> dependencies.objid
),
related_function_oids AS (
  SELECT root_functions.oid, 0 AS dependency_depth
  FROM root_functions

  UNION

  SELECT direct_function_dependencies.oid, 1 AS dependency_depth
  FROM direct_function_dependencies
),
related_functions AS (
  SELECT
    related_function_oids.dependency_depth,
    functions.oid,
    namespaces.nspname AS function_schema,
    functions.proname AS function_name,
    pg_get_function_identity_arguments(functions.oid) AS arguments,
    pg_get_function_result(functions.oid) AS return_type,
    languages.lanname AS language,
    functions.prosecdef AS security_definer,
    functions.proconfig AS configuration,
    pg_get_functiondef(functions.oid) AS definition
  FROM related_function_oids
  JOIN pg_catalog.pg_proc AS functions
    ON functions.oid = related_function_oids.oid
  JOIN pg_catalog.pg_namespace AS namespaces
    ON namespaces.oid = functions.pronamespace
  JOIN pg_catalog.pg_language AS languages
    ON languages.oid = functions.prolang
  WHERE functions.prokind IN ('f', 'p')
)
SELECT
  related_functions.dependency_depth,
  related_functions.function_schema,
  related_functions.function_name,
  related_functions.arguments,
  related_functions.return_type,
  related_functions.language,
  CASE
    WHEN related_functions.security_definer THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END AS security_mode,
  (
    SELECT setting
    FROM unnest(COALESCE(related_functions.configuration, ARRAY[]::text[])) AS setting
    WHERE setting LIKE 'search_path=%'
    LIMIT 1
  ) AS search_path_configuration,
  related_functions.definition
FROM related_functions
ORDER BY
  related_functions.dependency_depth,
  related_functions.function_schema,
  related_functions.function_name,
  related_functions.arguments;
