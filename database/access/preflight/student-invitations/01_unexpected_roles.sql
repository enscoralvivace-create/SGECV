/*
 * RC-3.3.1 - PREFLIGHT DE SOLO LECTURA
 * No modifica datos ni consulta filas de auth.users.
 */

-- 01. Roles fuera del conjunto permitido. Debe devolver cero filas.
SELECT
  '01_unexpected_roles' AS diagnostic_section,
  members.role,
  count(*) AS member_count
FROM public.members AS members
WHERE members.role NOT IN ('admin', 'teacher', 'member', 'student')
GROUP BY members.role
ORDER BY members.role;

