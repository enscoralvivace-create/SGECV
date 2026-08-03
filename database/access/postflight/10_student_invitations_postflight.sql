/*
 * RC-3.3.1 - POSTFLIGHT DE SOLO LECTURA
 *
 * No modifica datos, no consulta auth.users y no devuelve correos, nombres,
 * tokens, hashes ni UUID de autenticación.
 */

-- 01. Constraint de roles: existencia, validación y definición exacta.
SELECT
  '01_members_role_constraint' AS postflight_section,
  constraints.conname AS constraint_name,
  constraints.contype AS constraint_type,
  constraints.convalidated AS is_validated,
  pg_get_constraintdef(constraints.oid, true) AS definition
FROM pg_catalog.pg_constraint AS constraints
JOIN pg_catalog.pg_class AS tables
  ON tables.oid = constraints.conrelid
JOIN pg_catalog.pg_namespace AS namespaces
  ON namespaces.oid = tables.relnamespace
WHERE namespaces.nspname = 'public'
  AND tables.relname = 'members'
  AND constraints.conname = 'members_role_check';

-- 02. El trigger histórico debe estar ausente. Debe devolver false.
SELECT
  '02_historical_trigger_absence' AS postflight_section,
  EXISTS (
    SELECT 1
    FROM pg_catalog.pg_trigger AS triggers
    JOIN pg_catalog.pg_class AS tables
      ON tables.oid = triggers.tgrelid
    JOIN pg_catalog.pg_namespace AS namespaces
      ON namespaces.oid = tables.relnamespace
    WHERE namespaces.nspname = 'auth'
      AND tables.relname = 'users'
      AND triggers.tgname = 'on_auth_user_created_create_member'
      AND NOT triggers.tgisinternal
  ) AS historical_trigger_exists;

-- 03. La función histórica debe permanecer; comparar hash/DDL con preflight.
SELECT
  '03_historical_function_preserved' AS postflight_section,
  namespaces.nspname AS function_schema,
  functions.proname AS function_name,
  pg_get_function_identity_arguments(functions.oid) AS arguments,
  pg_get_userbyid(functions.proowner) AS owner_name,
  CASE
    WHEN functions.prosecdef THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END AS security_mode,
  md5(pg_get_functiondef(functions.oid)) AS definition_md5,
  pg_get_functiondef(functions.oid) AS definition
FROM pg_catalog.pg_proc AS functions
JOIN pg_catalog.pg_namespace AS namespaces
  ON namespaces.oid = functions.pronamespace
WHERE namespaces.nspname = 'public'
  AND functions.proname = 'handle_new_member_user'
  AND functions.prokind IN ('f', 'p')
ORDER BY arguments;

-- 04. Existencia de la tabla de invitaciones. Debe devolver true.
SELECT
  '04_invitation_table_existence' AS postflight_section,
  to_regclass('public.student_account_invitations') IS NOT NULL AS table_exists,
  to_regclass('public.student_account_invitations')::text AS qualified_table_name;

-- 05. Columnas, tipos, nulabilidad, defaults e identidad.
SELECT
  '05_invitation_columns' AS postflight_section,
  columns.ordinal_position,
  columns.column_name,
  columns.data_type,
  columns.udt_name,
  columns.is_nullable,
  columns.column_default,
  columns.identity_generation
FROM information_schema.columns AS columns
WHERE columns.table_schema = 'public'
  AND columns.table_name = 'student_account_invitations'
ORDER BY columns.ordinal_position;

-- 06. Primary key, foreign key y checks de la tabla.
SELECT
  '06_invitation_constraints' AS postflight_section,
  constraints.conname AS constraint_name,
  CASE constraints.contype
    WHEN 'p' THEN 'PRIMARY KEY'
    WHEN 'u' THEN 'UNIQUE'
    WHEN 'f' THEN 'FOREIGN KEY'
    WHEN 'c' THEN 'CHECK'
  END AS constraint_type,
  constraints.convalidated AS is_validated,
  referenced_namespaces.nspname AS referenced_schema,
  referenced_tables.relname AS referenced_table,
  pg_get_constraintdef(constraints.oid, true) AS definition
FROM pg_catalog.pg_constraint AS constraints
JOIN pg_catalog.pg_class AS tables
  ON tables.oid = constraints.conrelid
JOIN pg_catalog.pg_namespace AS namespaces
  ON namespaces.oid = tables.relnamespace
LEFT JOIN pg_catalog.pg_class AS referenced_tables
  ON referenced_tables.oid = constraints.confrelid
LEFT JOIN pg_catalog.pg_namespace AS referenced_namespaces
  ON referenced_namespaces.oid = referenced_tables.relnamespace
WHERE namespaces.nspname = 'public'
  AND tables.relname = 'student_account_invitations'
  AND constraints.contype IN ('p', 'u', 'f', 'c')
ORDER BY constraint_type, constraints.conname;

-- 07. Índices, incluida la unicidad parcial de invitaciones abiertas.
SELECT
  '07_invitation_indexes' AS postflight_section,
  indexes.indexname AS index_name,
  indexes.indexdef AS definition
FROM pg_catalog.pg_indexes AS indexes
WHERE indexes.schemaname = 'public'
  AND indexes.tablename = 'student_account_invitations'
ORDER BY indexes.indexname;

-- 08. Estado RLS de la tabla de invitaciones.
SELECT
  '08_invitation_rls_status' AS postflight_section,
  namespaces.nspname AS table_schema,
  tables.relname AS table_name,
  tables.relrowsecurity AS rls_enabled,
  tables.relforcerowsecurity AS rls_forced
FROM pg_catalog.pg_class AS tables
JOIN pg_catalog.pg_namespace AS namespaces
  ON namespaces.oid = tables.relnamespace
WHERE namespaces.nspname = 'public'
  AND tables.relname = 'student_account_invitations'
  AND tables.relkind IN ('r', 'p');

-- 09. Políticas RLS y comprobación de escrituras públicas.
SELECT
  '09_invitation_rls_policies' AS postflight_section,
  policies.policyname AS policy_name,
  policies.cmd AS command,
  policies.roles,
  policies.permissive,
  policies.qual AS using_expression,
  policies.with_check AS with_check_expression,
  (
    policies.cmd IN ('ALL', 'INSERT', 'UPDATE', 'DELETE')
    AND (
      'public' = ANY(policies.roles)
      OR 'anon' = ANY(policies.roles)
    )
  ) AS is_public_write_policy
FROM pg_catalog.pg_policies AS policies
WHERE policies.schemaname = 'public'
  AND policies.tablename = 'student_account_invitations'
ORDER BY policies.policyname;

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

-- 11. Firmas y seguridad de las cinco RPC.
SELECT
  '11_invitation_rpc_security' AS postflight_section,
  namespaces.nspname AS function_schema,
  functions.proname AS function_name,
  pg_get_function_identity_arguments(functions.oid) AS arguments,
  pg_get_function_result(functions.oid) AS return_type,
  pg_get_userbyid(functions.proowner) AS owner_name,
  languages.lanname AS language,
  CASE
    WHEN functions.prosecdef THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END AS security_mode,
  (
    SELECT setting
    FROM unnest(COALESCE(functions.proconfig, ARRAY[]::text[])) AS setting
    WHERE setting LIKE 'search_path=%'
    LIMIT 1
  ) AS search_path_configuration
FROM pg_catalog.pg_proc AS functions
JOIN pg_catalog.pg_namespace AS namespaces
  ON namespaces.oid = functions.pronamespace
JOIN pg_catalog.pg_language AS languages
  ON languages.oid = functions.prolang
WHERE namespaces.nspname = 'public'
  AND functions.prokind IN ('f', 'p')
  AND (
    (functions.proname = 'create_student_invitation'
      AND pg_get_function_identity_arguments(functions.oid) = 'target_member_id bigint, valid_for interval')
    OR (functions.proname = 'list_student_invitations'
      AND pg_get_function_identity_arguments(functions.oid) = 'target_member_id bigint')
    OR (functions.proname = 'validate_student_invitation'
      AND pg_get_function_identity_arguments(functions.oid) = 'plain_token text')
    OR (functions.proname = 'consume_student_invitation'
      AND pg_get_function_identity_arguments(functions.oid) = 'plain_token text')
    OR (functions.proname = 'revoke_student_invitation'
      AND pg_get_function_identity_arguments(functions.oid) = 'invitation_id uuid')
  )
ORDER BY functions.proname;

-- 12. Matriz de EXECUTE; permite comprobar grants y ausencia de PUBLIC.
WITH invitation_functions AS (
  SELECT
    functions.oid,
    functions.proowner,
    functions.proacl,
    functions.proname AS function_name,
    pg_get_function_identity_arguments(functions.oid) AS arguments
  FROM pg_catalog.pg_proc AS functions
  JOIN pg_catalog.pg_namespace AS namespaces
    ON namespaces.oid = functions.pronamespace
  WHERE namespaces.nspname = 'public'
    AND functions.prokind IN ('f', 'p')
    AND functions.proname IN (
      'create_student_invitation',
      'list_student_invitations',
      'validate_student_invitation',
      'consume_student_invitation',
      'revoke_student_invitation'
    )
),
target_roles AS (
  SELECT 'PUBLIC'::text AS grantee_name, 0::oid AS grantee_oid

  UNION ALL

  SELECT roles.rolname, roles.oid
  FROM pg_catalog.pg_roles AS roles
  WHERE roles.rolname IN ('anon', 'authenticated')
),
execute_privileges AS (
  SELECT
    invitation_functions.oid AS function_oid,
    privileges.grantee,
    privileges.privilege_type,
    privileges.is_grantable
  FROM invitation_functions
  CROSS JOIN LATERAL aclexplode(
    COALESCE(
      invitation_functions.proacl,
      acldefault('f', invitation_functions.proowner)
    )
  ) AS privileges
  WHERE privileges.privilege_type = 'EXECUTE'
)
SELECT
  '12_invitation_rpc_execute_grants' AS postflight_section,
  invitation_functions.function_name,
  invitation_functions.arguments,
  target_roles.grantee_name AS grantee,
  COALESCE(
    execute_privileges.privilege_type = 'EXECUTE',
    false
  ) AS has_execute,
  COALESCE(execute_privileges.is_grantable, false) AS is_grantable
FROM invitation_functions
CROSS JOIN target_roles
LEFT JOIN execute_privileges
  ON execute_privileges.function_oid = invitation_functions.oid
 AND execute_privileges.grantee = target_roles.grantee_oid
ORDER BY invitation_functions.function_name, target_roles.grantee_name;

-- 13. pgcrypto debe permanecer instalado en extensions.
SELECT
  '13_pgcrypto_schema' AS postflight_section,
  extensions_catalog.extname AS extension_name,
  extensions_catalog.extversion AS extension_version,
  namespaces.nspname AS extension_schema
FROM pg_catalog.pg_extension AS extensions_catalog
JOIN pg_catalog.pg_namespace AS namespaces
  ON namespaces.oid = extensions_catalog.extnamespace
WHERE extensions_catalog.extname = 'pgcrypto';

-- 14. Índices históricos de members que deben permanecer intactos.
SELECT
  '14_members_access_indexes' AS postflight_section,
  indexes.indexname AS index_name,
  indexes.indexdef AS definition
FROM pg_catalog.pg_indexes AS indexes
WHERE indexes.schemaname = 'public'
  AND indexes.tablename = 'members'
  AND indexes.indexname IN (
    'members_auth_user_id_unique',
    'members_email_unique'
  )
ORDER BY indexes.indexname;

-- 15. RLS histórico de members y member_permission_overrides.
SELECT
  '15_existing_access_rls_status' AS postflight_section,
  namespaces.nspname AS table_schema,
  tables.relname AS table_name,
  tables.relrowsecurity AS rls_enabled,
  tables.relforcerowsecurity AS rls_forced
FROM pg_catalog.pg_class AS tables
JOIN pg_catalog.pg_namespace AS namespaces
  ON namespaces.oid = tables.relnamespace
WHERE namespaces.nspname = 'public'
  AND tables.relname IN ('members', 'member_permission_overrides')
  AND tables.relkind IN ('r', 'p')
ORDER BY tables.relname;

-- 16. Políticas históricas que deben permanecer presentes.
SELECT
  '16_existing_access_rls_policies' AS postflight_section,
  policies.tablename AS table_name,
  policies.policyname AS policy_name,
  policies.cmd AS command,
  policies.roles,
  policies.permissive,
  policies.qual AS using_expression,
  policies.with_check AS with_check_expression
FROM pg_catalog.pg_policies AS policies
WHERE policies.schemaname = 'public'
  AND policies.tablename IN ('members', 'member_permission_overrides')
ORDER BY policies.tablename, policies.policyname;

-- 17. Funciones históricas de acceso que deben seguir disponibles.
SELECT
  '17_existing_access_functions' AS postflight_section,
  namespaces.nspname AS function_schema,
  functions.proname AS function_name,
  pg_get_function_identity_arguments(functions.oid) AS arguments,
  pg_get_function_result(functions.oid) AS return_type,
  CASE
    WHEN functions.prosecdef THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END AS security_mode
FROM pg_catalog.pg_proc AS functions
JOIN pg_catalog.pg_namespace AS namespaces
  ON namespaces.oid = functions.pronamespace
WHERE namespaces.nspname = 'public'
  AND functions.proname IN (
    'current_member_id',
    'current_member_is_active',
    'current_member_role',
    'role_has_permission',
    'has_app_permission'
  )
  AND functions.prokind IN ('f', 'p')
ORDER BY functions.proname, arguments;

-- 18. Única lectura de datos: conteos agregados por estado, sin secretos.
SELECT
  '18_invitation_counts_by_status' AS postflight_section,
  CASE
    WHEN invitations.used_at IS NOT NULL THEN 'used'
    WHEN invitations.revoked_at IS NOT NULL THEN 'revoked'
    WHEN invitations.expires_at <= now() THEN 'expired'
    ELSE 'active'
  END AS invitation_status,
  count(*) AS invitation_count
FROM public.student_account_invitations AS invitations
GROUP BY invitation_status
ORDER BY invitation_status;
