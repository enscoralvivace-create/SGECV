-- SCRIPT DE DIAGNOSTICO DE SOLO LECTURA - NO MODIFICA DATOS

DO $postflight$
DECLARE
  target_table oid := pg_catalog.to_regclass(
    'public.attendance_sessions'
  )::oid;
BEGIN
  IF target_table IS NULL OR NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class AS tables
    WHERE tables.oid = target_table
      AND tables.relkind IN ('r', 'p')
      AND tables.relrowsecurity
  ) THEN
    RAISE EXCEPTION
      'Postflight attendance 04: attendance_sessions debe existir con RLS.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_policies AS policies
    WHERE policies.schemaname = 'public'
      AND policies.tablename = 'attendance_sessions'
      AND policies.policyname = 'attendance sessions update requires manage'
      AND policies.cmd = 'UPDATE'
      AND policies.permissive = 'RESTRICTIVE'
      AND policies.roles = ARRAY['authenticated']::name[]
      AND pg_catalog.regexp_replace(
        pg_catalog.replace(
          pg_catalog.lower(policies.qual::text),
          '::text',
          ''
        ),
        'public\.|[[:space:]()]',
        '',
        'g'
      ) = 'has_app_permission''attendance.manage'''
      AND pg_catalog.regexp_replace(
        pg_catalog.replace(
          pg_catalog.lower(policies.with_check::text),
          '::text',
          ''
        ),
        'public\.|[[:space:]()]',
        '',
        'g'
      ) = 'has_app_permission''attendance.manage'''
  ) THEN
    RAISE EXCEPTION
      'Postflight attendance 04: falta la politica restrictiva attendance.manage.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_policies AS policies
    WHERE policies.schemaname = 'public'
      AND policies.tablename = 'attendance_sessions'
      AND policies.policyname = 'attendance sessions update by managers'
      AND policies.cmd = 'UPDATE'
      AND policies.permissive = 'PERMISSIVE'
      AND policies.roles = ARRAY['authenticated']::name[]
      AND pg_catalog.regexp_replace(
        pg_catalog.replace(
          pg_catalog.lower(policies.qual::text),
          '::text',
          ''
        ),
        'public\.|[[:space:]()]',
        '',
        'g'
      ) = 'has_app_permission''attendance.manage'''
      AND pg_catalog.regexp_replace(
        pg_catalog.replace(
          pg_catalog.lower(policies.with_check::text),
          '::text',
          ''
        ),
        'public\.|[[:space:]()]',
        '',
        'g'
      ) = 'has_app_permission''attendance.manage'''
  ) THEN
    RAISE EXCEPTION
      'Postflight attendance 04: la politica permisiva de UPDATE no coincide.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_policies AS policies
    WHERE policies.schemaname = 'public'
      AND policies.tablename = 'attendance_sessions'
      AND policies.cmd IN ('UPDATE', 'ALL')
      AND (
        pg_catalog.lower(COALESCE(policies.qual::text, '')) LIKE
          '%attendance.viewall%'
        OR pg_catalog.lower(COALESCE(policies.with_check::text, '')) LIKE
          '%attendance.viewall%'
      )
  ) THEN
    RAISE EXCEPTION
      'Postflight attendance 04: attendance.viewAll no debe autorizar UPDATE.';
  END IF;

  IF pg_catalog.has_table_privilege('anon', target_table, 'UPDATE')
    OR NOT pg_catalog.has_table_privilege(
      'authenticated', target_table, 'UPDATE'
    )
  THEN
    RAISE EXCEPTION
      'Postflight attendance 04: los grants UPDATE no coinciden.';
  END IF;
END;
$postflight$;

SELECT
  '04_require_manage_for_session_updates' AS postflight_section,
  true AS approved,
  'Postflight attendance 04 aprobado: UPDATE requiere attendance.manage.' AS result;
