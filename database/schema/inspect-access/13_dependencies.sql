/*
 * SCRIPT DE DIAGNÓSTICO DE SOLO LECTURA — NO MODIFICA DATOS
 */

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

