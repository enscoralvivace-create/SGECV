-- SCRIPT DE DIAGNOSTICO DE SOLO LECTURA - NO MODIFICA DATOS
-- Verifica definicion y matriz de EXECUTE de la resolucion interna.

WITH target_function AS (
  SELECT
    functions.oid,
    functions.proowner,
    functions.proacl,
    namespaces.nspname AS function_schema,
    functions.proname AS function_name,
    owner_roles.rolname AS owner_name,
    pg_get_function_identity_arguments(functions.oid) AS arguments,
    pg_get_function_result(functions.oid) AS return_type,
    languages.lanname AS language,
    functions.prosecdef AS security_definer,
    CASE
      WHEN functions.prosecdef THEN 'SECURITY DEFINER'
      ELSE 'SECURITY INVOKER'
    END AS security_mode,
    functions.proconfig AS configuration
  FROM pg_catalog.pg_proc AS functions
  JOIN pg_catalog.pg_namespace AS namespaces
    ON namespaces.oid = functions.pronamespace
  JOIN pg_catalog.pg_language AS languages
    ON languages.oid = functions.prolang
  JOIN pg_catalog.pg_roles AS owner_roles
    ON owner_roles.oid = functions.proowner
  WHERE namespaces.nspname = 'public'
    AND functions.proname = 'resolve_student_invitation_for_signup'
    AND functions.prokind IN ('f', 'p')
    AND functions.oid = to_regprocedure(
      'public.resolve_student_invitation_for_signup(text)'
    )::oid
),
target_roles AS (
  SELECT 'PUBLIC'::text AS grantee, 0::oid AS grantee_oid, false AS expected_execute
  UNION ALL
  SELECT roles.rolname, roles.oid, roles.rolname = 'service_role'
  FROM pg_catalog.pg_roles AS roles
  WHERE roles.rolname IN ('anon', 'authenticated', 'service_role')
),
execute_privileges AS (
  SELECT
    target_function.oid AS function_oid,
    privileges.grantee,
    bool_or(privileges.privilege_type = 'EXECUTE') AS has_execute
  FROM target_function
  CROSS JOIN LATERAL aclexplode(
    COALESCE(
      target_function.proacl,
      acldefault('f', target_function.proowner)
    )
  ) AS privileges
  GROUP BY target_function.oid, privileges.grantee
)
SELECT
  '12_student_invitation_signup' AS postflight_section,
  target_function.function_schema,
  target_function.function_name,
  target_function.owner_name,
  target_function.owner_name IN ('postgres', 'supabase_admin')
    AS owner_is_trusted,
  target_function.arguments,
  target_function.return_type,
  target_function.language,
  target_function.security_definer,
  target_function.security_mode,
  target_function.configuration,
  target_roles.grantee,
  target_roles.expected_execute,
  COALESCE(execute_privileges.has_execute, false) AS actual_execute,
  target_function.oid IS NOT NULL
    AND target_function.owner_name IN ('postgres', 'supabase_admin')
    AND target_function.security_definer
    AND target_function.configuration @> ARRAY['search_path=""']
    AND COALESCE(execute_privileges.has_execute, false)
      = target_roles.expected_execute AS matches_expected
FROM target_roles
LEFT JOIN target_function ON true
LEFT JOIN execute_privileges
  ON execute_privileges.function_oid = target_function.oid
 AND execute_privileges.grantee = target_roles.grantee_oid
ORDER BY target_roles.grantee;
