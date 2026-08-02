/*
 * RC-3.3.1 - PREFLIGHT DE SOLO LECTURA
 * No modifica datos ni consulta filas de auth.users.
 */

-- 02. Correos duplicados tras lower(trim()). Debe devolver cero filas.
SELECT
  '02_duplicate_normalized_emails' AS diagnostic_section,
  lower(btrim(members.email)) AS email_normalized,
  count(*) AS member_count
FROM public.members AS members
WHERE members.email IS NOT NULL
  AND btrim(members.email) <> ''
GROUP BY lower(btrim(members.email))
HAVING count(*) > 1
ORDER BY email_normalized;

