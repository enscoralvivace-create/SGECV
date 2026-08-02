/*
 * SCRIPT DE DIAGNÓSTICO DE SOLO LECTURA — NO MODIFICA DATOS
 */

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

