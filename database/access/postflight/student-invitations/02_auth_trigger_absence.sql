/*
 * RC-3.3.1 - POSTFLIGHT DE SOLO LECTURA
 * No modifica datos ni consulta filas de auth.users.
 */

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
