/*
 * RC-3.3.1 - PREFLIGHT DE SOLO LECTURA
 * No modifica datos ni consulta filas de auth.users.
 */

-- 03. Correos con espacios exteriores. No devuelve el correo.
SELECT
  '03_emails_with_outer_spaces' AS diagnostic_section,
  members.id AS member_id,
  members.email <> ltrim(members.email) AS has_leading_spaces,
  members.email <> rtrim(members.email) AS has_trailing_spaces
FROM public.members AS members
WHERE members.email IS NOT NULL
  AND members.email <> btrim(members.email)
ORDER BY members.id;

