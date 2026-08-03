/*
 * RC-3.3.1 - POSTFLIGHT DE SOLO LECTURA
 * No modifica datos ni consulta filas de auth.users.
 */

-- 11. Firmas y seguridad de las cinco RPC.
SELECT
  '11_invitation_rpc_security' AS postflight_section,
  namespaces.nspname AS function_schema,
  functions.proname AS function_name,
  pg_get_function_identity_arguments(functions.oid) AS arguments,
  pg_get_function_result(functions.oid) AS return_type,
  pg_get_userbyid(functions.proowner) AS owner_name,
  languages.lanname AS language,
  CASE
    WHEN functions.prosecdef THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END AS security_mode,
  (
    SELECT setting
    FROM unnest(COALESCE(functions.proconfig, ARRAY[]::text[])) AS setting
    WHERE setting LIKE 'search_path=%'
    LIMIT 1
  ) AS search_path_configuration
FROM pg_catalog.pg_proc AS functions
JOIN pg_catalog.pg_namespace AS namespaces
  ON namespaces.oid = functions.pronamespace
JOIN pg_catalog.pg_language AS languages
  ON languages.oid = functions.prolang
WHERE namespaces.nspname = 'public'
  AND functions.prokind IN ('f', 'p')
  AND (
    (functions.proname = 'create_student_invitation'
      AND pg_get_function_identity_arguments(functions.oid) = 'target_member_id bigint, valid_for interval')
    OR (functions.proname = 'list_student_invitations'
      AND pg_get_function_identity_arguments(functions.oid) = 'target_member_id bigint')
    OR (functions.proname = 'validate_student_invitation'
      AND pg_get_function_identity_arguments(functions.oid) = 'plain_token text')
    OR (functions.proname = 'consume_student_invitation'
      AND pg_get_function_identity_arguments(functions.oid) = 'plain_token text')
    OR (functions.proname = 'revoke_student_invitation'
      AND pg_get_function_identity_arguments(functions.oid) = 'invitation_id uuid')
  )
ORDER BY functions.proname;
