/*
 * SCRIPT DE DIAGNÓSTICO DE SOLO LECTURA — NO MODIFICA DATOS
 */

-- G1. Grants de tabla para roles de API
SELECT
  grants.table_schema,
  grants.table_name,
  grants.grantee,
  grants.privilege_type,
  grants.is_grantable
FROM information_schema.role_table_grants AS grants
WHERE grants.table_schema = 'public'
  AND grants.table_name IN ('members', 'member_permission_overrides')
  AND grants.grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY grants.table_name, grants.grantee, grants.privilege_type;

