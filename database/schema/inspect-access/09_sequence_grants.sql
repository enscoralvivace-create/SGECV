/*
 * SCRIPT DE DIAGNÓSTICO DE SOLO LECTURA — NO MODIFICA DATOS
 */

-- G2. Grants de secuencias relacionadas
WITH target_tables AS (
  SELECT tables.oid
  FROM pg_catalog.pg_class AS tables
  JOIN pg_catalog.pg_namespace AS namespaces
    ON namespaces.oid = tables.relnamespace
  WHERE namespaces.nspname = 'public'
    AND tables.relname IN ('members', 'member_permission_overrides')
),
related_sequences AS (
  SELECT DISTINCT sequences.oid, sequence_namespaces.nspname, sequences.relname, sequences.relowner, sequences.relacl
  FROM pg_catalog.pg_depend AS dependencies
  JOIN target_tables
    ON target_tables.oid = dependencies.refobjid
  JOIN pg_catalog.pg_class AS sequences
    ON sequences.oid = dependencies.objid
   AND sequences.relkind = 'S'
  JOIN pg_catalog.pg_namespace AS sequence_namespaces
    ON sequence_namespaces.oid = sequences.relnamespace
)
SELECT
  related_sequences.nspname AS sequence_schema,
  related_sequences.relname AS sequence_name,
  grantee_roles.rolname AS grantee,
  privileges.privilege_type,
  privileges.is_grantable
FROM related_sequences
CROSS JOIN LATERAL aclexplode(
  COALESCE(related_sequences.relacl, acldefault('S', related_sequences.relowner))
) AS privileges
JOIN pg_catalog.pg_roles AS grantee_roles
  ON grantee_roles.oid = privileges.grantee
WHERE grantee_roles.rolname IN ('anon', 'authenticated', 'service_role')
ORDER BY related_sequences.nspname, related_sequences.relname, grantee_roles.rolname, privileges.privilege_type;

