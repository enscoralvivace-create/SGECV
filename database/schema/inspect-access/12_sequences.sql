/*
 * SCRIPT DE DIAGNÓSTICO DE SOLO LECTURA — NO MODIFICA DATOS
 */

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

