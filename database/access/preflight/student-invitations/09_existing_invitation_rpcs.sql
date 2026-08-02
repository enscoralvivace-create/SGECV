/*
 * RC-3.3.1 - PREFLIGHT DE SOLO LECTURA
 * No modifica datos ni consulta filas de auth.users.
 */

-- 09. Firmas existentes de RPC de invitaciones.
SELECT
  '09_existing_invitation_rpc_signatures' AS diagnostic_section,
  namespaces.nspname AS function_schema,
  functions.proname AS function_name,
  pg_get_function_identity_arguments(functions.oid) AS arguments,
  pg_get_function_result(functions.oid) AS return_type,
  functions.prokind
FROM pg_catalog.pg_proc AS functions
JOIN pg_catalog.pg_namespace AS namespaces
  ON namespaces.oid = functions.pronamespace
WHERE namespaces.nspname = 'public'
  AND functions.proname IN (
    'create_student_invitation',
    'list_student_invitations',
    'validate_student_invitation',
    'consume_student_invitation',
    'revoke_student_invitation'
  )
ORDER BY functions.proname, arguments;

