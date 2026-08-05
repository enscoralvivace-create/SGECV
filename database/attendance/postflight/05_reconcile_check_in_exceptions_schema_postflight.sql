-- SCRIPT DE DIAGNOSTICO DE SOLO LECTURA - NO MODIFICA DATOS
-- Verifica el esquema canonico reconciliado por attendance/05.

DO $postflight$
DECLARE
  target_table oid := pg_catalog.to_regclass(
    'public.attendance_session_check_in_exceptions'
  )::oid;
  identity_sequence text;
BEGIN
  IF target_table IS NULL THEN
    RAISE EXCEPTION
      'Postflight attendance 05: falta public.attendance_session_check_in_exceptions.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class AS relations
    WHERE relations.oid = target_table
      AND relations.relkind IN ('r', 'p')
      AND relations.relrowsecurity
  ) THEN
    RAISE EXCEPTION
      'Postflight attendance 05: la tabla debe tener RLS habilitado.';
  END IF;

  IF EXISTS (
    SELECT expected.column_name
    FROM (
      VALUES
        ('id', 'bigint'::pg_catalog.regtype, true, 'd'::text),
        ('session_id', 'uuid'::pg_catalog.regtype, true, ''::text),
        ('member_id', 'bigint'::pg_catalog.regtype, true, ''::text),
        ('reason', 'text'::pg_catalog.regtype, false, ''::text),
        ('created_by', 'uuid'::pg_catalog.regtype, false, ''::text),
        ('created_at', 'timestamptz'::pg_catalog.regtype, true, ''::text)
    ) AS expected(column_name, type_oid, is_not_null, identity_kind)
    LEFT JOIN pg_catalog.pg_attribute AS attributes
      ON attributes.attrelid = target_table
      AND attributes.attname = expected.column_name
      AND attributes.attnum > 0
      AND NOT attributes.attisdropped
    WHERE attributes.attname IS NULL
      OR attributes.atttypid <> expected.type_oid
      OR attributes.attnotnull <> expected.is_not_null
      OR attributes.attidentity::text <> expected.identity_kind
  ) THEN
    RAISE EXCEPTION
      'Postflight attendance 05: columnas, tipos, nulabilidad o identity no coinciden.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_attribute AS attributes
    WHERE attributes.attrelid = target_table
      AND attributes.attnum > 0
      AND NOT attributes.attisdropped
      AND attributes.attname NOT IN (
        'id', 'session_id', 'member_id', 'reason', 'created_by', 'created_at'
      )
  ) THEN
    RAISE EXCEPTION
      'Postflight attendance 05: existen columnas fuera del esquema canonico.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_attrdef AS defaults
    JOIN pg_catalog.pg_attribute AS attributes
      ON attributes.attrelid = defaults.adrelid
      AND attributes.attnum = defaults.adnum
    WHERE defaults.adrelid = target_table
      AND attributes.attname IN ('reason', 'created_by')
  ) OR NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_attrdef AS defaults
    JOIN pg_catalog.pg_attribute AS attributes
      ON attributes.attrelid = defaults.adrelid
      AND attributes.attnum = defaults.adnum
    WHERE defaults.adrelid = target_table
      AND attributes.attname = 'created_at'
      AND pg_catalog.pg_get_expr(defaults.adbin, defaults.adrelid)
        IN ('now()', 'CURRENT_TIMESTAMP')
  ) THEN
    RAISE EXCEPTION
      'Postflight attendance 05: defaults de reason, created_by o created_at no coinciden.';
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
      AND constraints.conname = 'attendance_session_check_in_exceptions_pkey'
      AND constraints.contype = 'p'
      AND constraints.conkey = ARRAY[id_attribute.attnum]::smallint[]
  ) OR NOT EXISTS (
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
      AND constraints.conname = 'attendance_session_check_in_exceptions_session_member_key'
      AND constraints.contype = 'u'
      AND constraints.conkey = ARRAY[
        session_attribute.attnum,
        member_attribute.attnum
      ]::smallint[]
  ) THEN
    RAISE EXCEPTION
      'Postflight attendance 05: PK o restriccion unica no coinciden.';
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
      AND constraints.conname = 'attendance_session_check_in_exceptions_session_id_fkey'
      AND constraints.contype = 'f'
      AND constraints.confrelid = 'public.attendance_sessions'::pg_catalog.regclass
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
      AND constraints.conname = 'attendance_session_check_in_exceptions_member_id_fkey'
      AND constraints.contype = 'f'
      AND constraints.confrelid = 'public.members'::pg_catalog.regclass
      AND constraints.conkey = ARRAY[source_attribute.attnum]::smallint[]
      AND constraints.confkey = ARRAY[target_attribute.attnum]::smallint[]
      AND constraints.confdeltype = 'c'
  ) OR NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_constraint AS constraints
    JOIN pg_catalog.pg_attribute AS source_attribute
      ON source_attribute.attrelid = constraints.conrelid
      AND source_attribute.attname = 'created_by'
      AND source_attribute.attnum > 0
      AND NOT source_attribute.attisdropped
    JOIN pg_catalog.pg_attribute AS target_attribute
      ON target_attribute.attrelid = constraints.confrelid
      AND target_attribute.attname = 'id'
      AND target_attribute.attnum > 0
      AND NOT target_attribute.attisdropped
    WHERE constraints.conrelid = target_table
      AND constraints.conname = 'attendance_session_check_in_exceptions_created_by_fkey'
      AND constraints.contype = 'f'
      AND constraints.confrelid = 'auth.users'::pg_catalog.regclass
      AND constraints.conkey = ARRAY[source_attribute.attnum]::smallint[]
      AND constraints.confkey = ARRAY[target_attribute.attnum]::smallint[]
      AND constraints.confdeltype = 'n'
  ) THEN
    RAISE EXCEPTION
      'Postflight attendance 05: las claves foraneas canonicas no coinciden.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_constraint AS constraints
    JOIN pg_catalog.pg_attribute AS reason_attribute
      ON reason_attribute.attrelid = constraints.conrelid
      AND reason_attribute.attname = 'reason'
      AND reason_attribute.attnum > 0
      AND NOT reason_attribute.attisdropped
    WHERE constraints.conrelid = target_table
      AND constraints.conname = 'attendance_session_check_in_exceptions_reason_check'
      AND constraints.contype = 'c'
      AND constraints.conkey = ARRAY[reason_attribute.attnum]::smallint[]
      AND pg_catalog.lower(
        pg_catalog.regexp_replace(
          pg_catalog.replace(
            pg_catalog.replace(
              pg_catalog.replace(
                pg_catalog.pg_get_expr(constraints.conbin, constraints.conrelid),
                '::text',
                ''
              ),
              'pg_catalog.',
              ''
            ),
            '"',
            ''
          ),
          '[[:space:]()]',
          '',
          'g'
        )
      ) IN (
        'reasonisnullorchar_lengthbtrimreason>=1andchar_lengthbtrimreason<=250',
        'reasonisnullorchar_lengthbtrimreasonbetween1and250'
      )
  ) THEN
    RAISE EXCEPTION
      'Postflight attendance 05: falta el check canonico de reason.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_policies AS policies
    WHERE policies.schemaname = 'public'
      AND policies.tablename = 'attendance_session_check_in_exceptions'
      AND policies.cmd IN ('UPDATE', 'ALL')
  ) THEN
    RAISE EXCEPTION
      'Postflight attendance 05: no debe existir una politica UPDATE o ALL.';
  END IF;

  IF (
    SELECT count(*)
    FROM pg_catalog.pg_policies AS policies
    WHERE policies.schemaname = 'public'
      AND policies.tablename = 'attendance_session_check_in_exceptions'
  ) <> 3 OR EXISTS (
    SELECT expected.policy_name
    FROM (
      VALUES
        ('attendance_exception_managers_select', 'SELECT'),
        ('attendance_exception_managers_insert', 'INSERT'),
        ('attendance_exception_managers_delete', 'DELETE')
    ) AS expected(policy_name, command_name)
    LEFT JOIN pg_catalog.pg_policies AS policies
      ON policies.schemaname = 'public'
      AND policies.tablename = 'attendance_session_check_in_exceptions'
      AND policies.policyname = expected.policy_name
      AND policies.cmd = expected.command_name
      AND policies.roles = ARRAY['authenticated']::name[]
      AND pg_catalog.regexp_replace(
        pg_catalog.replace(
          pg_catalog.replace(
            pg_catalog.lower(
              CASE
                WHEN expected.command_name IN ('SELECT', 'DELETE')
                  THEN policies.qual::text
                WHEN expected.command_name = 'INSERT'
                  THEN policies.with_check::text
                ELSE ''::text
              END
            ),
            '::text',
            ''
          ),
          'public.',
          ''
        ),
        '[[:space:]()]',
        '',
        'g'
      ) = 'has_app_permission''attendance.manage'''
    WHERE policies.policyname IS NULL
  ) THEN
    RAISE EXCEPTION
      'Postflight attendance 05: las politicas attendance.manage no coinciden.';
  END IF;

  IF pg_catalog.has_table_privilege('anon', target_table, 'SELECT')
    OR pg_catalog.has_table_privilege('anon', target_table, 'INSERT')
    OR pg_catalog.has_table_privilege('anon', target_table, 'UPDATE')
    OR pg_catalog.has_table_privilege('anon', target_table, 'DELETE')
    OR pg_catalog.has_table_privilege('anon', target_table, 'TRUNCATE')
    OR pg_catalog.has_table_privilege('anon', target_table, 'REFERENCES')
    OR pg_catalog.has_table_privilege('anon', target_table, 'TRIGGER')
    OR pg_catalog.has_table_privilege('anon', target_table, 'MAINTAIN')
    OR NOT pg_catalog.has_table_privilege('authenticated', target_table, 'SELECT')
    OR NOT pg_catalog.has_table_privilege('authenticated', target_table, 'INSERT')
    OR NOT pg_catalog.has_table_privilege('authenticated', target_table, 'DELETE')
    OR pg_catalog.has_table_privilege('authenticated', target_table, 'UPDATE')
    OR pg_catalog.has_table_privilege('authenticated', target_table, 'TRUNCATE')
    OR pg_catalog.has_table_privilege('authenticated', target_table, 'REFERENCES')
    OR pg_catalog.has_table_privilege('authenticated', target_table, 'TRIGGER')
    OR pg_catalog.has_table_privilege('authenticated', target_table, 'MAINTAIN')
  THEN
    RAISE EXCEPTION
      'Postflight attendance 05: los grants de tabla no son minimos.';
  END IF;

  identity_sequence := pg_catalog.pg_get_serial_sequence(
    'public.attendance_session_check_in_exceptions',
    'id'
  );

  IF identity_sequence IS NULL
    OR pg_catalog.has_sequence_privilege('anon', identity_sequence, 'USAGE')
    OR pg_catalog.has_sequence_privilege('anon', identity_sequence, 'SELECT')
    OR pg_catalog.has_sequence_privilege('anon', identity_sequence, 'UPDATE')
    OR NOT pg_catalog.has_sequence_privilege('authenticated', identity_sequence, 'USAGE')
    OR pg_catalog.has_sequence_privilege('authenticated', identity_sequence, 'SELECT')
    OR pg_catalog.has_sequence_privilege('authenticated', identity_sequence, 'UPDATE')
  THEN
    RAISE EXCEPTION
      'Postflight attendance 05: los grants de la secuencia identity no son minimos.';
  END IF;
END;
$postflight$;

SELECT
  '05_reconcile_check_in_exceptions_schema' AS postflight_section,
  true AS approved,
  'Postflight attendance 05 aprobado: esquema, RLS, politicas y grants canonicos.'
    AS result;
