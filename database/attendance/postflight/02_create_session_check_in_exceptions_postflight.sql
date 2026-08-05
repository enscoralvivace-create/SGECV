-- SCRIPT DE DIAGNOSTICO DE SOLO LECTURA - NO MODIFICA DATOS
-- Valida invariantes fundacionales de 02; el esquema final corresponde a 05.

DO $postflight$
DECLARE
  target_table oid := pg_catalog.to_regclass(
    'public.attendance_session_check_in_exceptions'
  )::oid;
BEGIN
  IF target_table IS NULL THEN
    RAISE EXCEPTION
      'Postflight attendance 02: falta la tabla de excepciones.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class AS tables
    WHERE tables.oid = target_table
      AND tables.relkind IN ('r', 'p')
      AND tables.relrowsecurity
  ) THEN
    RAISE EXCEPTION
      'Postflight attendance 02: la tabla debe conservar RLS habilitado.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_constraint AS constraints
    JOIN pg_catalog.pg_attribute AS id_attribute
      ON id_attribute.attrelid = constraints.conrelid
      AND id_attribute.attname = 'id'
      AND id_attribute.attnum > 0
      AND NOT id_attribute.attisdropped
    WHERE constraints.conrelid = target_table
      AND constraints.contype = 'p'
      AND constraints.conkey = ARRAY[id_attribute.attnum]::smallint[]
  ) THEN
    RAISE EXCEPTION
      'Postflight attendance 02: falta la PK fundacional sobre id.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_constraint AS constraints
    JOIN pg_catalog.pg_attribute AS session_attribute
      ON session_attribute.attrelid = constraints.conrelid
      AND session_attribute.attname = 'session_id'
      AND session_attribute.attnum > 0
      AND NOT session_attribute.attisdropped
    JOIN pg_catalog.pg_attribute AS member_attribute
      ON member_attribute.attrelid = constraints.conrelid
      AND member_attribute.attname = 'member_id'
      AND member_attribute.attnum > 0
      AND NOT member_attribute.attisdropped
    WHERE constraints.conrelid = target_table
      AND constraints.contype = 'u'
      AND constraints.conkey = ARRAY[
        session_attribute.attnum,
        member_attribute.attnum
      ]::smallint[]
  ) THEN
    RAISE EXCEPTION
      'Postflight attendance 02: falta la unicidad session_id/member_id.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_constraint AS constraints
    JOIN pg_catalog.pg_attribute AS source_attribute
      ON source_attribute.attrelid = constraints.conrelid
      AND source_attribute.attname = 'session_id'
      AND source_attribute.attnum > 0
      AND NOT source_attribute.attisdropped
    JOIN pg_catalog.pg_attribute AS target_attribute
      ON target_attribute.attrelid = constraints.confrelid
      AND target_attribute.attname = 'id'
      AND target_attribute.attnum > 0
      AND NOT target_attribute.attisdropped
    WHERE constraints.conrelid = target_table
      AND constraints.contype = 'f'
      AND constraints.confrelid =
        'public.attendance_sessions'::pg_catalog.regclass
      AND constraints.conkey = ARRAY[source_attribute.attnum]::smallint[]
      AND constraints.confkey = ARRAY[target_attribute.attnum]::smallint[]
      AND constraints.confdeltype = 'c'
  ) OR NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_constraint AS constraints
    JOIN pg_catalog.pg_attribute AS source_attribute
      ON source_attribute.attrelid = constraints.conrelid
      AND source_attribute.attname = 'member_id'
      AND source_attribute.attnum > 0
      AND NOT source_attribute.attisdropped
    JOIN pg_catalog.pg_attribute AS target_attribute
      ON target_attribute.attrelid = constraints.confrelid
      AND target_attribute.attname = 'id'
      AND target_attribute.attnum > 0
      AND NOT target_attribute.attisdropped
    WHERE constraints.conrelid = target_table
      AND constraints.contype = 'f'
      AND constraints.confrelid = 'public.members'::pg_catalog.regclass
      AND constraints.conkey = ARRAY[source_attribute.attnum]::smallint[]
      AND constraints.confkey = ARRAY[target_attribute.attnum]::smallint[]
      AND constraints.confdeltype = 'c'
  ) THEN
    RAISE EXCEPTION
      'Postflight attendance 02: faltan las FKs fundacionales con cascada.';
  END IF;
END;
$postflight$;

SELECT
  '02_create_session_check_in_exceptions' AS postflight_section,
  true AS approved,
  'Postflight attendance 02 aprobado: invariantes fundacionales; ejecutar 05 para validar el esquema canonico.' AS result;
