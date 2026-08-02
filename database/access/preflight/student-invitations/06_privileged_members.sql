/*
 * RC-3.3.1 - PREFLIGHT DE SOLO LECTURA
 * No modifica datos ni consulta filas de auth.users.
 */

-- 06. Roles privilegiados que nunca deben seleccionarse para invitación.
SELECT
  '06_privileged_members_not_invitable' AS diagnostic_section,
  members.id AS member_id,
  members.role,
  members.status,
  members.auth_user_id IS NOT NULL AS has_linked_account
FROM public.members AS members
WHERE members.role IN ('admin', 'teacher')
ORDER BY members.role, members.id;

