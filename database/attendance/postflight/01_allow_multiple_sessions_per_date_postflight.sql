-- SCRIPT DE DIAGNOSTICO DE SOLO LECTURA - NO MODIFICA DATOS

DO $postflight$
DECLARE
  target_table oid := pg_catalog.to_regclass(
    'public.attendance_sessions'
  )::oid;
  rehearsal_date_attnum smallint;
  starts_at_attnum smallint;
  qr_token_attnum smallint;
BEGIN
  IF target_table IS NULL THEN
    RAISE EXCEPTION
      'Postflight attendance 01: falta public.attendance_sessions.';
  END IF;

  SELECT attributes.attnum
  INTO STRICT rehearsal_date_attnum
  FROM pg_catalog.pg_attribute AS attributes
  WHERE attributes.attrelid = target_table
    AND attributes.attname = 'rehearsal_date'
    AND attributes.attnum > 0
    AND NOT attributes.attisdropped;

  SELECT attributes.attnum
  INTO STRICT starts_at_attnum
  FROM pg_catalog.pg_attribute AS attributes
  WHERE attributes.attrelid = target_table
    AND attributes.attname = 'starts_at'
    AND attributes.attnum > 0
    AND NOT attributes.attisdropped;

  SELECT attributes.attnum
  INTO STRICT qr_token_attnum
  FROM pg_catalog.pg_attribute AS attributes
  WHERE attributes.attrelid = target_table
    AND attributes.attname = 'qr_token'
    AND attributes.attnum > 0
    AND NOT attributes.attisdropped;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_index AS indexes
    WHERE indexes.indrelid = target_table
      AND indexes.indisunique
      AND indexes.indisvalid
      AND indexes.indpred IS NULL
      AND indexes.indexprs IS NULL
      AND indexes.indnkeyatts = 1
      AND indexes.indkey[0] = rehearsal_date_attnum
  ) THEN
    RAISE EXCEPTION
      'Postflight attendance 01: persiste unicidad solo por rehearsal_date.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_index AS indexes
    WHERE indexes.indrelid = target_table
      AND indexes.indisunique
      AND indexes.indisvalid
      AND indexes.indpred IS NULL
      AND indexes.indexprs IS NULL
      AND indexes.indnkeyatts = 2
      AND indexes.indkey[0] = rehearsal_date_attnum
      AND indexes.indkey[1] = starts_at_attnum
  ) THEN
    RAISE EXCEPTION
      'Postflight attendance 01: falta unicidad por rehearsal_date y starts_at.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_index AS indexes
    WHERE indexes.indrelid = target_table
      AND indexes.indisunique
      AND indexes.indisvalid
      AND indexes.indpred IS NULL
      AND indexes.indexprs IS NULL
      AND indexes.indnkeyatts = 1
      AND indexes.indkey[0] = qr_token_attnum
  ) THEN
    RAISE EXCEPTION
      'Postflight attendance 01: falta el indice unico de qr_token.';
  END IF;

  IF EXISTS (
    SELECT sessions.rehearsal_date, sessions.starts_at
    FROM public.attendance_sessions AS sessions
    GROUP BY sessions.rehearsal_date, sessions.starts_at
    HAVING pg_catalog.count(*) > 1
  ) OR EXISTS (
    SELECT sessions.qr_token
    FROM public.attendance_sessions AS sessions
    WHERE sessions.qr_token IS NOT NULL
    GROUP BY sessions.qr_token
    HAVING pg_catalog.count(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Postflight attendance 01: existen duplicados incompatibles con los indices canonicos.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class AS tables
    WHERE tables.oid = target_table
      AND tables.relkind IN ('r', 'p')
      AND tables.relrowsecurity
  ) THEN
    RAISE EXCEPTION
      'Postflight attendance 01: attendance_sessions debe conservar RLS.';
  END IF;
END;
$postflight$;

SELECT
  '01_allow_multiple_sessions_per_date' AS postflight_section,
  true AS approved,
  'Postflight attendance 01 aprobado: indices, datos y RLS compatibles.' AS result;
