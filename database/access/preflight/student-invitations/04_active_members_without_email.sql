/*
 * RC-3.3.1 - PREFLIGHT DE SOLO LECTURA
 * No modifica datos ni consulta filas de auth.users.
 */

-- 04. Integrantes activos sin correo utilizable.
SELECT
  '04_active_members_without_email' AS diagnostic_section,
  members.id AS member_id,
  members.role,
  members.status
FROM public.members AS members
WHERE lower(btrim(members.status)) = 'activo'
  AND (members.email IS NULL OR btrim(members.email) = '')
ORDER BY members.id;

