/*
 * SCRIPT DE DIAGNÓSTICO DE SOLO LECTURA — NO MODIFICA DATOS
 *
 * Inventario limitado a public.members, public.member_permission_overrides
 * y objetos de esquema relacionados. No consulta filas de negocio ni
 * contenido de auth.users.
 */

-- A. Columnas
SELECT
  columns.table_schema,
  columns.table_name,
  columns.ordinal_position,
  columns.column_name,
  columns.data_type,
  columns.udt_name,
  columns.is_nullable,
  columns.column_default,
  columns.identity_generation
FROM information_schema.columns AS columns
WHERE columns.table_schema = 'public'
  AND columns.table_name IN ('members', 'member_permission_overrides')
ORDER BY columns.table_name, columns.ordinal_position;

-- B. Constraints: PK, UNIQUE, FK y CHECK
SELECT
  table_namespace.nspname AS table_schema,
  table_class.relname AS table_name,
  constraint_definition.conname AS constraint_name,
  CASE constraint_definition.contype
    WHEN 'p' THEN 'PRIMARY KEY'
    WHEN 'u' THEN 'UNIQUE'
    WHEN 'f' THEN 'FOREIGN KEY'
    WHEN 'c' THEN 'CHECK'
  END AS constraint_type,
  referenced_namespace.nspname AS referenced_schema,
  referenced_class.relname AS referenced_table,
  pg_get_constraintdef(constraint_definition.oid, true) AS definition
FROM pg_catalog.pg_constraint AS constraint_definition
JOIN pg_catalog.pg_class AS table_class
  ON table_class.oid = constraint_definition.conrelid
JOIN pg_catalog.pg_namespace AS table_namespace
  ON table_namespace.oid = table_class.relnamespace
LEFT JOIN pg_catalog.pg_class AS referenced_class
  ON referenced_class.oid = constraint_definition.confrelid
LEFT JOIN pg_catalog.pg_namespace AS referenced_namespace
  ON referenced_namespace.oid = referenced_class.relnamespace
WHERE table_namespace.nspname = 'public'
  AND table_class.relname IN ('members', 'member_permission_overrides')
  AND constraint_definition.contype IN ('p', 'u', 'f', 'c')
ORDER BY table_class.relname, constraint_type, constraint_definition.conname;

-- C. Índices
SELECT
  indexes.schemaname AS table_schema,
  indexes.tablename AS table_name,
  indexes.indexname AS index_name,
  indexes.indexdef AS definition
FROM pg_catalog.pg_indexes AS indexes
WHERE indexes.schemaname = 'public'
  AND indexes.tablename IN ('members', 'member_permission_overrides')
ORDER BY indexes.tablename, indexes.indexname;

-- D1. Estado de RLS por tabla
SELECT
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

-- D2. Políticas RLS
SELECT
  policies.schemaname AS table_schema,
  policies.tablename AS table_name,
  policies.policyname AS policy_name,
  policies.cmd AS command,
  policies.roles,
  policies.qual AS using_expression,
  policies.with_check AS with_check_expression,
  policies.permissive
FROM pg_catalog.pg_policies AS policies
WHERE policies.schemaname = 'public'
  AND policies.tablename IN ('members', 'member_permission_overrides')
ORDER BY policies.tablename, policies.policyname;

-- E. Triggers y función asociada
SELECT
  table_namespace.nspname AS table_schema,
  table_class.relname AS table_name,
  trigger_definition.tgname AS trigger_name,
  CASE
    WHEN (trigger_definition.tgtype & 2) <> 0 THEN 'BEFORE'
    WHEN (trigger_definition.tgtype & 64) <> 0 THEN 'INSTEAD OF'
    ELSE 'AFTER'
  END AS timing,
  concat_ws(
    ' OR ',
    CASE WHEN (trigger_definition.tgtype & 4) <> 0 THEN 'INSERT' END,
    CASE WHEN (trigger_definition.tgtype & 8) <> 0 THEN 'DELETE' END,
    CASE WHEN (trigger_definition.tgtype & 16) <> 0 THEN 'UPDATE' END,
    CASE WHEN (trigger_definition.tgtype & 32) <> 0 THEN 'TRUNCATE' END
  ) AS events,
  function_namespace.nspname AS function_schema,
  function_definition.proname AS function_name,
  pg_get_triggerdef(trigger_definition.oid, true) AS definition
FROM pg_catalog.pg_trigger AS trigger_definition
JOIN pg_catalog.pg_class AS table_class
  ON table_class.oid = trigger_definition.tgrelid
JOIN pg_catalog.pg_namespace AS table_namespace
  ON table_namespace.oid = table_class.relnamespace
JOIN pg_catalog.pg_proc AS function_definition
  ON function_definition.oid = trigger_definition.tgfoid
JOIN pg_catalog.pg_namespace AS function_namespace
  ON function_namespace.oid = function_definition.pronamespace
WHERE NOT trigger_definition.tgisinternal
  AND table_namespace.nspname = 'public'
  AND table_class.relname IN ('members', 'member_permission_overrides')
ORDER BY table_class.relname, trigger_definition.tgname;

-- F. Funciones cuyo DDL menciona objetos de acceso relevantes
WITH related_functions AS (
  SELECT
    functions.oid,
    namespaces.nspname AS function_schema,
    functions.proname AS function_name,
    pg_get_function_identity_arguments(functions.oid) AS arguments,
    pg_get_function_result(functions.oid) AS return_type,
    languages.lanname AS language,
    functions.prosecdef AS security_definer,
    functions.proconfig AS configuration,
    pg_get_functiondef(functions.oid) AS definition
  FROM pg_catalog.pg_proc AS functions
  JOIN pg_catalog.pg_namespace AS namespaces
    ON namespaces.oid = functions.pronamespace
  JOIN pg_catalog.pg_language AS languages
    ON languages.oid = functions.prolang
  WHERE namespaces.nspname NOT IN ('pg_catalog', 'information_schema')
    AND functions.prokind IN ('f', 'p')
)
SELECT
  related_functions.function_schema,
  related_functions.function_name,
  related_functions.arguments,
  related_functions.return_type,
  related_functions.language,
  CASE
    WHEN related_functions.security_definer THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END AS security_mode,
  related_functions.configuration AS function_configuration,
  (
    SELECT setting
    FROM unnest(COALESCE(related_functions.configuration, ARRAY[]::text[])) AS setting
    WHERE setting LIKE 'search_path=%'
    LIMIT 1
  ) AS search_path_configuration,
  related_functions.definition
FROM related_functions
WHERE related_functions.definition ~* '(member_permission_overrides|auth[.]uid|auth[.]users|(^|[^a-z_])members([^a-z_]|$))'
ORDER BY related_functions.function_schema, related_functions.function_name, related_functions.arguments;

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

-- H. Enums y dominios usados directamente por las columnas objetivo
WITH used_types AS (
  SELECT DISTINCT attributes.atttypid AS type_oid
  FROM pg_catalog.pg_attribute AS attributes
  JOIN pg_catalog.pg_class AS tables
    ON tables.oid = attributes.attrelid
  JOIN pg_catalog.pg_namespace AS table_namespaces
    ON table_namespaces.oid = tables.relnamespace
  WHERE table_namespaces.nspname = 'public'
    AND tables.relname IN ('members', 'member_permission_overrides')
    AND attributes.attnum > 0
    AND NOT attributes.attisdropped
)
SELECT
  type_namespaces.nspname AS type_schema,
  types.typname AS type_name,
  CASE types.typtype
    WHEN 'e' THEN 'ENUM'
    WHEN 'd' THEN 'DOMAIN'
  END AS type_kind,
  CASE
    WHEN types.typtype = 'd' THEN format_type(types.typbasetype, types.typtypmod)
  END AS domain_base_type,
  domain_constraints.domain_constraints,
  enum_values.enum_values
FROM used_types
JOIN pg_catalog.pg_type AS types
  ON types.oid = used_types.type_oid
JOIN pg_catalog.pg_namespace AS type_namespaces
  ON type_namespaces.oid = types.typnamespace
LEFT JOIN LATERAL (
  SELECT array_agg(enums.enumlabel ORDER BY enums.enumsortorder) AS enum_values
  FROM pg_catalog.pg_enum AS enums
  WHERE enums.enumtypid = types.oid
) AS enum_values ON true
LEFT JOIN LATERAL (
  SELECT array_agg(pg_get_constraintdef(constraints.oid, true) ORDER BY constraints.conname) AS domain_constraints
  FROM pg_catalog.pg_constraint AS constraints
  WHERE constraints.contypid = types.oid
) AS domain_constraints ON true
WHERE types.typtype IN ('e', 'd')
ORDER BY type_namespaces.nspname, types.typname;

-- I. Secuencias vinculadas a columnas de las tablas objetivo
WITH target_tables AS (
  SELECT tables.oid
  FROM pg_catalog.pg_class AS tables
  JOIN pg_catalog.pg_namespace AS namespaces
    ON namespaces.oid = tables.relnamespace
  WHERE namespaces.nspname = 'public'
    AND tables.relname IN ('members', 'member_permission_overrides')
)
SELECT DISTINCT
  sequence_namespaces.nspname AS sequence_schema,
  sequences.relname AS sequence_name,
  table_namespaces.nspname AS table_schema,
  tables.relname AS table_name,
  attributes.attname AS column_name,
  pg_get_expr(defaults.adbin, defaults.adrelid) AS column_default,
  sequence_properties.seqstart AS start_value,
  sequence_properties.seqincrement AS increment_by,
  sequence_properties.seqmin AS minimum_value,
  sequence_properties.seqmax AS maximum_value,
  sequence_properties.seqcache AS cache_size,
  sequence_properties.seqcycle AS cycles
FROM pg_catalog.pg_depend AS dependencies
JOIN target_tables
  ON target_tables.oid = dependencies.refobjid
JOIN pg_catalog.pg_class AS sequences
  ON sequences.oid = dependencies.objid
 AND sequences.relkind = 'S'
JOIN pg_catalog.pg_namespace AS sequence_namespaces
  ON sequence_namespaces.oid = sequences.relnamespace
JOIN pg_catalog.pg_class AS tables
  ON tables.oid = dependencies.refobjid
JOIN pg_catalog.pg_namespace AS table_namespaces
  ON table_namespaces.oid = tables.relnamespace
LEFT JOIN pg_catalog.pg_attribute AS attributes
  ON attributes.attrelid = tables.oid
 AND attributes.attnum = dependencies.refobjsubid
LEFT JOIN pg_catalog.pg_attrdef AS defaults
  ON defaults.adrelid = attributes.attrelid
 AND defaults.adnum = attributes.attnum
LEFT JOIN pg_catalog.pg_sequence AS sequence_properties
  ON sequence_properties.seqrelid = sequences.oid
ORDER BY table_namespaces.nspname, tables.relname, attributes.attname, sequence_namespaces.nspname, sequences.relname;

-- J1. Dependencias registradas por PostgreSQL sobre las tablas objetivo
WITH target_relations AS (
  SELECT tables.oid, namespaces.nspname AS table_schema, tables.relname AS table_name
  FROM pg_catalog.pg_class AS tables
  JOIN pg_catalog.pg_namespace AS namespaces
    ON namespaces.oid = tables.relnamespace
  WHERE namespaces.nspname = 'public'
    AND tables.relname IN ('members', 'member_permission_overrides')
)
SELECT DISTINCT
  target_relations.table_schema,
  target_relations.table_name,
  dependencies.deptype AS dependency_type,
  pg_describe_object(dependencies.classid, dependencies.objid, dependencies.objsubid) AS dependent_object
FROM pg_catalog.pg_depend AS dependencies
JOIN target_relations
  ON target_relations.oid = dependencies.refobjid
WHERE dependencies.objid <> target_relations.oid
ORDER BY target_relations.table_name, dependent_object;

-- J2. Vistas cuya definición referencia las tablas objetivo
SELECT
  views.schemaname AS view_schema,
  views.viewname AS view_name,
  views.definition
FROM pg_catalog.pg_views AS views
WHERE views.schemaname NOT IN ('pg_catalog', 'information_schema')
  AND views.definition ~* '(member_permission_overrides|(^|[^a-z_])members([^a-z_]|$))'
ORDER BY views.schemaname, views.viewname;

-- J3. Vistas materializadas cuya definición referencia las tablas objetivo
SELECT
  views.schemaname AS view_schema,
  views.matviewname AS view_name,
  views.definition
FROM pg_catalog.pg_matviews AS views
WHERE views.schemaname NOT IN ('pg_catalog', 'information_schema')
  AND views.definition ~* '(member_permission_overrides|(^|[^a-z_])members([^a-z_]|$))'
ORDER BY views.schemaname, views.matviewname;
