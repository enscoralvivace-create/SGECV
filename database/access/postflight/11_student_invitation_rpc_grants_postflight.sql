-- SCRIPT DE DIAGNOSTICO DE SOLO LECTURA - NO MODIFICA DATOS
-- Verifica la matriz exacta de EXECUTE de las RPC de invitaciones.

WITH expected_grants(function_signature, function_name, grantee, expected_execute) AS (
  VALUES
    ('public.create_student_invitation(bigint,interval)', 'create_student_invitation', 'PUBLIC', false),
    ('public.create_student_invitation(bigint,interval)', 'create_student_invitation', 'anon', false),
    ('public.create_student_invitation(bigint,interval)', 'create_student_invitation', 'authenticated', true),
    ('public.list_student_invitations(bigint)', 'list_student_invitations', 'PUBLIC', false),
    ('public.list_student_invitations(bigint)', 'list_student_invitations', 'anon', false),
    ('public.list_student_invitations(bigint)', 'list_student_invitations', 'authenticated', true),
    ('public.validate_student_invitation(text)', 'validate_student_invitation', 'PUBLIC', false),
    ('public.validate_student_invitation(text)', 'validate_student_invitation', 'anon', true),
    ('public.validate_student_invitation(text)', 'validate_student_invitation', 'authenticated', true),
    ('public.consume_student_invitation(text)', 'consume_student_invitation', 'PUBLIC', false),
    ('public.consume_student_invitation(text)', 'consume_student_invitation', 'anon', false),
    ('public.consume_student_invitation(text)', 'consume_student_invitation', 'authenticated', true),
    ('public.revoke_student_invitation(uuid)', 'revoke_student_invitation', 'PUBLIC', false),
    ('public.revoke_student_invitation(uuid)', 'revoke_student_invitation', 'anon', false),
    ('public.revoke_student_invitation(uuid)', 'revoke_student_invitation', 'authenticated', true)
),
invitation_functions AS (
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
  SELECT 'PUBLIC'::text AS grantee, 0::oid AS grantee_oid
  UNION ALL
  SELECT roles.rolname, roles.oid
  FROM pg_catalog.pg_roles AS roles
  WHERE roles.rolname IN ('anon', 'authenticated')
),
execute_privileges AS (
  SELECT
    invitation_functions.oid AS function_oid,
    privileges.grantee,
    bool_or(privileges.privilege_type = 'EXECUTE') AS has_execute
  FROM invitation_functions
  CROSS JOIN LATERAL aclexplode(
    COALESCE(
      invitation_functions.proacl,
      acldefault('f', invitation_functions.proowner)
    )
  ) AS privileges
  GROUP BY invitation_functions.oid, privileges.grantee
)
SELECT
  '11_student_invitation_rpc_grants' AS postflight_section,
  expected_grants.function_name,
  expected_grants.function_signature,
  expected_grants.grantee,
  expected_grants.expected_execute,
  COALESCE(execute_privileges.has_execute, false) AS actual_execute,
  invitation_functions.oid IS NOT NULL AS function_exists,
  invitation_functions.oid IS NOT NULL
    AND COALESCE(execute_privileges.has_execute, false)
      = expected_grants.expected_execute AS matches_expected
FROM expected_grants
LEFT JOIN invitation_functions
  ON invitation_functions.oid
    = to_regprocedure(expected_grants.function_signature)::oid
LEFT JOIN target_roles
  ON target_roles.grantee = expected_grants.grantee
LEFT JOIN execute_privileges
  ON execute_privileges.function_oid = invitation_functions.oid
 AND execute_privileges.grantee = target_roles.grantee_oid
ORDER BY expected_grants.function_name, expected_grants.grantee;
