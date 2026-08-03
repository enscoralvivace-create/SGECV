/*
 * RC-3.3.1 - POSTFLIGHT DE SOLO LECTURA
 * No modifica datos ni consulta filas de auth.users.
 */

-- 12. Matriz de EXECUTE; permite comprobar grants y ausencia de PUBLIC.
WITH invitation_functions AS (
  SELECT
    functions.oid,
    functions.proowner,
    functions.proacl,
    functions.proname AS function_name,
    pg_get_function_identity_arguments(functions.oid) AS arguments
  FROM pg_catalog.pg_proc AS functions
  JOIN pg_catalog.pg_namespace AS namespaces
    ON namespaces.oid = functions.pronamespace
  WHERE namespaces.nspname = 'public'
    AND functions.prokind IN ('f', 'p')
    AND functions.proname IN (
      'create_student_invitation',
      'list_student_invitations',
      'validate_student_invitation',
      'consume_student_invitation',
      'revoke_student_invitation'
    )
),
target_roles AS (
  SELECT 'PUBLIC'::text AS grantee_name, 0::oid AS grantee_oid

  UNION ALL

  SELECT roles.rolname, roles.oid
  FROM pg_catalog.pg_roles AS roles
  WHERE roles.rolname IN ('anon', 'authenticated')
),
execute_privileges AS (
  SELECT
    invitation_functions.oid AS function_oid,
    privileges.grantee,
    privileges.privilege_type,
    privileges.is_grantable
  FROM invitation_functions
  CROSS JOIN LATERAL aclexplode(
    COALESCE(
      invitation_functions.proacl,
      acldefault('f', invitation_functions.proowner)
    )
  ) AS privileges
  WHERE privileges.privilege_type = 'EXECUTE'
)
SELECT
  '12_invitation_rpc_execute_grants' AS postflight_section,
  invitation_functions.function_name,
  invitation_functions.arguments,
  target_roles.grantee_name AS grantee,
  COALESCE(
    execute_privileges.privilege_type = 'EXECUTE',
    false
  ) AS has_execute,
  COALESCE(execute_privileges.is_grantable, false) AS is_grantable
FROM invitation_functions
CROSS JOIN target_roles
LEFT JOIN execute_privileges
  ON execute_privileges.function_oid = invitation_functions.oid
 AND execute_privileges.grantee = target_roles.grantee_oid
ORDER BY invitation_functions.function_name, target_roles.grantee_name;
