/*
 * RC-3.3.1 - PREFLIGHT DE SOLO LECTURA
 *
 * No modifica datos ni consulta filas de auth.users.
 * Ejecutar cada sección y conservar sus resultados fuera del repositorio.
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

-- 06. Roles privilegiados que nunca deben seleccionarse para invitación.
SELECT
  '06_privileged_members_not_invitable' AS diagnostic_section,
  members.id AS member_id,
  members.role,
  members.status,
  members.auth_user_id IS NOT NULL AS has_linked_account
FROM public.members AS members
WHERE members.role IN ('admin', 'teacher')
ORDER BY members.role, members.id;

-- 07. Trigger exacto de auth.users y su estado; no consulta filas.
SELECT
  '07_auth_signup_trigger' AS diagnostic_section,
  table_namespace.nspname AS table_schema,
  table_class.relname AS table_name,
  triggers.tgname AS trigger_name,
  CASE
    WHEN (triggers.tgtype & 2) <> 0 THEN 'BEFORE'
    WHEN (triggers.tgtype & 64) <> 0 THEN 'INSTEAD OF'
    ELSE 'AFTER'
  END AS timing,
  concat_ws(
    ' OR ',
    CASE WHEN (triggers.tgtype & 4) <> 0 THEN 'INSERT' END,
    CASE WHEN (triggers.tgtype & 8) <> 0 THEN 'DELETE' END,
    CASE WHEN (triggers.tgtype & 16) <> 0 THEN 'UPDATE' END,
    CASE WHEN (triggers.tgtype & 32) <> 0 THEN 'TRUNCATE' END
  ) AS events,
  function_namespace.nspname AS function_schema,
  trigger_functions.proname AS function_name,
  pg_get_triggerdef(triggers.oid, true) AS definition,
  CASE triggers.tgenabled
    WHEN 'O' THEN 'ENABLED'
    WHEN 'D' THEN 'DISABLED'
    WHEN 'R' THEN 'REPLICA'
    WHEN 'A' THEN 'ALWAYS'
    ELSE triggers.tgenabled::text
  END AS enabled_status
FROM pg_catalog.pg_trigger AS triggers
JOIN pg_catalog.pg_class AS table_class
  ON table_class.oid = triggers.tgrelid
JOIN pg_catalog.pg_namespace AS table_namespace
  ON table_namespace.oid = table_class.relnamespace
JOIN pg_catalog.pg_proc AS trigger_functions
  ON trigger_functions.oid = triggers.tgfoid
JOIN pg_catalog.pg_namespace AS function_namespace
  ON function_namespace.oid = trigger_functions.pronamespace
WHERE table_namespace.nspname = 'auth'
  AND table_class.relname = 'users'
  AND triggers.tgname = 'on_auth_user_created_create_member'
  AND NOT triggers.tgisinternal
ORDER BY triggers.tgname;

-- 08. Existencia y esquema de pgcrypto.
SELECT
  '08_pgcrypto' AS diagnostic_section,
  extensions_catalog.extname AS extension_name,
  extensions_catalog.extversion AS extension_version,
  namespaces.nspname AS extension_schema
FROM pg_catalog.pg_extension AS extensions_catalog
JOIN pg_catalog.pg_namespace AS namespaces
  ON namespaces.oid = extensions_catalog.extnamespace
WHERE extensions_catalog.extname = 'pgcrypto';

-- 09. Firmas existentes de RPC de invitaciones.
SELECT
  '09_existing_invitation_rpc_signatures' AS diagnostic_section,
  namespaces.nspname AS function_schema,
  functions.proname AS function_name,
  pg_get_function_identity_arguments(functions.oid) AS arguments,
  pg_get_function_result(functions.oid) AS return_type,
  functions.prokind
FROM pg_catalog.pg_proc AS functions
JOIN pg_catalog.pg_namespace AS namespaces
  ON namespaces.oid = functions.pronamespace
WHERE namespaces.nspname = 'public'
  AND functions.proname IN (
    'create_student_invitation',
    'list_student_invitations',
    'validate_student_invitation',
    'consume_student_invitation',
    'revoke_student_invitation'
  )
ORDER BY functions.proname, arguments;

-- 10. Existencia previa de la tabla de invitaciones.
SELECT
  '10_invitation_table_existence' AS diagnostic_section,
  to_regclass('public.student_account_invitations') IS NOT NULL AS table_exists,
  to_regclass('public.student_account_invitations')::text AS qualified_table_name;

-- 11. Definición actual de members_role_check.
SELECT
  '11_members_role_check' AS diagnostic_section,
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

-- 12. Índices actuales relacionados con email y auth_user_id.
SELECT
  '12_members_access_indexes' AS diagnostic_section,
  indexes.schemaname AS table_schema,
  indexes.tablename AS table_name,
  indexes.indexname AS index_name,
  indexes.indexdef AS definition
FROM pg_catalog.pg_indexes AS indexes
WHERE indexes.schemaname = 'public'
  AND indexes.tablename = 'members'
  AND (
    indexes.indexdef ~* '[(][[:space:]]*lower[(][[:space:]]*email[[:space:]]*[)]'
    OR indexes.indexdef ~* 'auth_user_id'
  )
ORDER BY indexes.indexname;

-- 13. Propietario, seguridad, search_path y definición de funciones críticas.
WITH critical_functions AS (
  SELECT
    functions.oid,
    namespaces.nspname AS function_schema,
    functions.proname AS function_name,
    pg_get_function_identity_arguments(functions.oid) AS arguments,
    pg_get_userbyid(functions.proowner) AS owner_name,
    functions.prosecdef,
    functions.proconfig,
    languages.lanname AS language,
    pg_get_functiondef(functions.oid) AS definition
  FROM pg_catalog.pg_proc AS functions
  JOIN pg_catalog.pg_namespace AS namespaces
    ON namespaces.oid = functions.pronamespace
  JOIN pg_catalog.pg_language AS languages
    ON languages.oid = functions.prolang
  WHERE namespaces.nspname = 'public'
    AND functions.proname IN (
      'has_app_permission',
      'current_member_role',
      'current_member_is_active',
      'handle_new_member_user'
    )
    AND functions.prokind IN ('f', 'p')
)
SELECT
  '13_critical_function_security' AS diagnostic_section,
  critical_functions.function_schema,
  critical_functions.function_name,
  critical_functions.arguments,
  critical_functions.owner_name,
  CASE
    WHEN critical_functions.prosecdef THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END AS security_mode,
  critical_functions.language,
  (
    SELECT setting
    FROM unnest(COALESCE(critical_functions.proconfig, ARRAY[]::text[])) AS setting
    WHERE setting LIKE 'search_path=%'
    LIMIT 1
  ) AS search_path_configuration,
  critical_functions.definition
FROM critical_functions
ORDER BY critical_functions.function_name, critical_functions.arguments;
