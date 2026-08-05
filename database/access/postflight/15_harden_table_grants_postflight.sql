-- SCRIPT DE DIAGNOSTICO DE SOLO LECTURA - NO MODIFICA DATOS
-- Verifica la matriz exacta de privilegios cliente definida por access/15.

DO $postflight$
DECLARE
  expected record;
  privilege_name text;
  actual_privilege boolean;
  should_have_privilege boolean;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM (
      VALUES
        ('members', ARRAY['SELECT', 'INSERT', 'UPDATE']::text[]),
        ('student_account_invitations', ARRAY[]::text[]),
        ('attendance_sessions', ARRAY['SELECT', 'INSERT', 'UPDATE']::text[]),
        ('attendance_records', ARRAY['SELECT']::text[]),
        ('attendance_session_check_in_exceptions', ARRAY['SELECT']::text[]),
        ('member_charges', ARRAY['SELECT', 'INSERT']::text[]),
        ('payments', ARRAY['SELECT', 'INSERT']::text[])
    ) AS expected_tables(table_name, authenticated_privileges)
    WHERE pg_catalog.to_regclass(
      pg_catalog.format('public.%I', expected_tables.table_name)
    ) IS NULL
  ) THEN
    RAISE EXCEPTION
      'Postflight access 15: falta una o mas tablas esperadas.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM (
      VALUES
        ('members'),
        ('student_account_invitations'),
        ('attendance_sessions'),
        ('attendance_records'),
        ('attendance_session_check_in_exceptions'),
        ('member_charges'),
        ('payments')
    ) AS expected_tables(table_name)
    JOIN pg_catalog.pg_class AS tables
      ON tables.oid = pg_catalog.to_regclass(
        pg_catalog.format('public.%I', expected_tables.table_name)
      )
    WHERE tables.relkind NOT IN ('r', 'p')
      OR NOT tables.relrowsecurity
  ) THEN
    RAISE EXCEPTION
      'Postflight access 15: todas las tablas deben conservar RLS habilitado.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class AS tables
    JOIN pg_catalog.pg_namespace AS namespaces
      ON namespaces.oid = tables.relnamespace
    CROSS JOIN LATERAL pg_catalog.aclexplode(
      COALESCE(
        tables.relacl,
        pg_catalog.acldefault('r', tables.relowner)
      )
    ) AS grants
    WHERE namespaces.nspname = 'public'
      AND tables.relname IN (
        'members',
        'student_account_invitations',
        'attendance_sessions',
        'attendance_records',
        'attendance_session_check_in_exceptions',
        'member_charges',
        'payments'
      )
      AND tables.relkind IN ('r', 'p')
      AND grants.grantee = 0
  ) THEN
    RAISE EXCEPTION
      'Postflight access 15: PUBLIC conserva privilegios directos.';
  END IF;

  FOR expected IN
    SELECT matrix.table_name, matrix.role_name, matrix.expected_privileges
    FROM (
      VALUES
        ('members', 'anon', ARRAY[]::text[]),
        ('members', 'authenticated', ARRAY['SELECT', 'INSERT', 'UPDATE']::text[]),
        ('student_account_invitations', 'anon', ARRAY[]::text[]),
        ('student_account_invitations', 'authenticated', ARRAY[]::text[]),
        ('attendance_sessions', 'anon', ARRAY[]::text[]),
        ('attendance_sessions', 'authenticated', ARRAY['SELECT', 'INSERT', 'UPDATE']::text[]),
        ('attendance_records', 'anon', ARRAY[]::text[]),
        ('attendance_records', 'authenticated', ARRAY['SELECT']::text[]),
        ('attendance_session_check_in_exceptions', 'anon', ARRAY[]::text[]),
        ('attendance_session_check_in_exceptions', 'authenticated', ARRAY['SELECT']::text[]),
        ('member_charges', 'anon', ARRAY[]::text[]),
        ('member_charges', 'authenticated', ARRAY['SELECT', 'INSERT']::text[]),
        ('payments', 'anon', ARRAY[]::text[]),
        ('payments', 'authenticated', ARRAY['SELECT', 'INSERT']::text[])
    ) AS matrix(table_name, role_name, expected_privileges)
  LOOP
    FOREACH privilege_name IN ARRAY ARRAY[
      'SELECT',
      'INSERT',
      'UPDATE',
      'DELETE',
      'TRUNCATE',
      'REFERENCES',
      'TRIGGER',
      'MAINTAIN'
    ]
    LOOP
      actual_privilege := pg_catalog.has_table_privilege(
        expected.role_name,
        pg_catalog.to_regclass(
          pg_catalog.format('public.%I', expected.table_name)
        ),
        privilege_name
      );
      should_have_privilege := privilege_name = ANY(
        expected.expected_privileges
      );

      IF actual_privilege IS DISTINCT FROM should_have_privilege THEN
        RAISE EXCEPTION
          'Postflight access 15: public.% / % / %: esperado %, obtenido %.',
          expected.table_name,
          expected.role_name,
          privilege_name,
          should_have_privilege,
          actual_privilege;
      END IF;
    END LOOP;
  END LOOP;
END;
$postflight$;

SELECT
  '15_harden_table_grants' AS postflight_section,
  true AS approved,
  'Postflight access 15 aprobado: matriz minima y privilegios peligrosos ausentes.'
    AS result;
