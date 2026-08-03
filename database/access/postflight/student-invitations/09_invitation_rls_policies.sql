/*
 * RC-3.3.1 - POSTFLIGHT DE SOLO LECTURA
 * No modifica datos ni consulta filas de auth.users.
 */

-- 09. Políticas RLS y comprobación de escrituras públicas.
SELECT
  '09_invitation_rls_policies' AS postflight_section,
  policies.policyname AS policy_name,
  policies.cmd AS command,
  policies.roles,
  policies.permissive,
  policies.qual AS using_expression,
  policies.with_check AS with_check_expression,
  (
    policies.cmd IN ('ALL', 'INSERT', 'UPDATE', 'DELETE')
    AND (
      'public' = ANY(policies.roles)
      OR 'anon' = ANY(policies.roles)
    )
  ) AS is_public_write_policy
FROM pg_catalog.pg_policies AS policies
WHERE policies.schemaname = 'public'
  AND policies.tablename = 'student_account_invitations'
ORDER BY policies.policyname;
