/*
 * RC-3.3.1 - POSTFLIGHT DE SOLO LECTURA
 * No modifica datos ni consulta filas de auth.users.
 */

-- 10. Privilegios directos de tabla; los tres roles deben indicar false.
WITH target_table AS (
  SELECT tables.relowner, tables.relacl
  FROM pg_catalog.pg_class AS tables
  JOIN pg_catalog.pg_namespace AS namespaces
    ON namespaces.oid = tables.relnamespace
  WHERE namespaces.nspname = 'public'
    AND tables.relname = 'student_account_invitations'
),
target_roles AS (
  SELECT 'PUBLIC'::text AS grantee_name, 0::oid AS grantee_oid

  UNION ALL

  SELECT roles.rolname, roles.oid
  FROM pg_catalog.pg_roles AS roles
  WHERE roles.rolname IN ('anon', 'authenticated')
),
table_privileges AS (
  SELECT
    privileges.grantee,
    privileges.privilege_type,
    privileges.is_grantable
  FROM target_table
  CROSS JOIN LATERAL aclexplode(
    COALESCE(target_table.relacl, acldefault('r', target_table.relowner))
  ) AS privileges
)
SELECT
  '10_direct_table_grants' AS postflight_section,
  target_roles.grantee_name AS grantee,
  count(table_privileges.privilege_type) > 0 AS has_direct_privileges,
  array_agg(table_privileges.privilege_type ORDER BY table_privileges.privilege_type)
    FILTER (WHERE table_privileges.privilege_type IS NOT NULL) AS privileges
FROM target_roles
LEFT JOIN table_privileges
  ON table_privileges.grantee = target_roles.grantee_oid
GROUP BY target_roles.grantee_name
ORDER BY target_roles.grantee_name;
