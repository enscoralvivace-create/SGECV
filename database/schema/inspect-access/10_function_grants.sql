/*
 * SCRIPT DE DIAGNÓSTICO DE SOLO LECTURA — NO MODIFICA DATOS
 */

-- G3. Grants EXECUTE de funciones relacionadas
WITH related_functions AS (
  SELECT
    functions.oid,
    functions.proowner,
    functions.proacl,
    namespaces.nspname AS function_schema,
    functions.proname AS function_name,
    pg_get_function_identity_arguments(functions.oid) AS arguments,
    pg_get_functiondef(functions.oid) AS definition
  FROM pg_catalog.pg_proc AS functions
  JOIN pg_catalog.pg_namespace AS namespaces
    ON namespaces.oid = functions.pronamespace
  WHERE namespaces.nspname NOT IN ('pg_catalog', 'information_schema')
    AND functions.prokind IN ('f', 'p')
)
SELECT
  related_functions.function_schema,
  related_functions.function_name,
  related_functions.arguments,
  grantee_roles.rolname AS grantee,
  privileges.privilege_type,
  privileges.is_grantable
FROM related_functions
CROSS JOIN LATERAL aclexplode(
  COALESCE(related_functions.proacl, acldefault('f', related_functions.proowner))
) AS privileges
JOIN pg_catalog.pg_roles AS grantee_roles
  ON grantee_roles.oid = privileges.grantee
WHERE related_functions.definition ~* '(member_permission_overrides|auth[.]uid|auth[.]users|(^|[^a-z_])members([^a-z_]|$))'
  AND grantee_roles.rolname IN ('anon', 'authenticated', 'service_role')
  AND privileges.privilege_type = 'EXECUTE'
ORDER BY related_functions.function_schema, related_functions.function_name, related_functions.arguments, grantee_roles.rolname;

