/*
 * RC-3.3.1 - POSTFLIGHT DE SOLO LECTURA
 * No modifica datos ni consulta filas de auth.users.
 */

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
