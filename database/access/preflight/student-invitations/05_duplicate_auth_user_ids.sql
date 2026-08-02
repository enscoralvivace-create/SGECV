/*
 * RC-3.3.1 - PREFLIGHT DE SOLO LECTURA
 * No modifica datos ni consulta filas de auth.users.
 */

-- 05. Duplicados de auth_user_id, solo como conteos; no devuelve UUID.
WITH duplicate_auth_links AS (
  SELECT count(*) AS linked_member_count
  FROM public.members AS members
  WHERE members.auth_user_id IS NOT NULL
  GROUP BY members.auth_user_id
  HAVING count(*) > 1
)
SELECT
  '05_duplicate_auth_user_ids' AS diagnostic_section,
  count(*) AS duplicate_auth_user_group_count,
  COALESCE(sum(linked_member_count), 0) AS affected_member_count
FROM duplicate_auth_links;

