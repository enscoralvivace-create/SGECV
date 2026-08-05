/*
 * Reconciliacion canonica de attendance_session_check_in_exceptions.
 *
 * Esta migracion sucede a 02_create_session_check_in_exceptions.sql sin
 * modificarla retroactivamente. Conserva los datos de excepciones y deja las
 * escrituras completas a cargo de la RPC atomica creada en la migracion 03.
 */

BEGIN;

DO $preflight$
DECLARE
  target_table oid := pg_catalog.to_regclass(
    'public.attendance_session_check_in_exceptions'
  )::oid;
  unexpected_columns text;
BEGIN
  IF target_table IS NULL THEN
    RAISE EXCEPTION
      'Migration 05: public.attendance_session_check_in_exceptions does not exist; apply the prerequisite migration first.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class AS relations
    WHERE relations.oid = target_table
      AND relations.relkind IN ('r', 'p')
  ) THEN
    RAISE EXCEPTION
      'Migration 05: public.attendance_session_check_in_exceptions is not a table.';
  END IF;

  SELECT pg_catalog.string_agg(attributes.attname, ', ' ORDER BY attributes.attnum)
  INTO unexpected_columns
  FROM pg_catalog.pg_attribute AS attributes
  WHERE attributes.attrelid = target_table
    AND attributes.attnum > 0
    AND NOT attributes.attisdropped
    AND attributes.attname NOT IN (
      'id',
      'session_id',
      'member_id',
      'reason',
      'created_by',
      'created_at',
      'updated_at'
    );

  IF unexpected_columns IS NOT NULL THEN
    RAISE EXCEPTION
      'Migration 05: unexpected columns require manual review: %.',
      unexpected_columns;
  END IF;

  IF EXISTS (
    SELECT required.column_name
    FROM (
      VALUES
        ('id', 'bigint'::pg_catalog.regtype),
        ('session_id', 'uuid'::pg_catalog.regtype),
        ('member_id', 'bigint'::pg_catalog.regtype),
        ('reason', 'text'::pg_catalog.regtype),
        ('created_by', 'uuid'::pg_catalog.regtype),
        ('created_at', 'timestamptz'::pg_catalog.regtype)
    ) AS required(column_name, type_oid)
    LEFT JOIN pg_catalog.pg_attribute AS attributes
      ON attributes.attrelid = target_table
      AND attributes.attname = required.column_name
      AND attributes.attnum > 0
      AND NOT attributes.attisdropped
    WHERE attributes.attname IS NULL
      OR attributes.atttypid <> required.type_oid
  ) THEN
    RAISE EXCEPTION
      'Migration 05: required columns are missing or have incompatible types; no automatic type conversion was attempted.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_attribute AS attributes
    JOIN pg_catalog.pg_attrdef AS defaults
      ON defaults.adrelid = attributes.attrelid
      AND defaults.adnum = attributes.attnum
    WHERE attributes.attrelid = target_table
      AND attributes.attname = 'id'
      AND attributes.attidentity = ''
  ) THEN
    RAISE EXCEPTION
      'Migration 05: id has a non-identity default; converting that generator requires manual review.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.attendance_session_check_in_exceptions AS exceptions
    WHERE exceptions.id IS NULL
      OR exceptions.session_id IS NULL
      OR exceptions.member_id IS NULL
      OR exceptions.created_at IS NULL
  ) THEN
    RAISE EXCEPTION
      'Migration 05: required columns contain null values.';
  END IF;

  IF EXISTS (
    SELECT exceptions.id
    FROM public.attendance_session_check_in_exceptions AS exceptions
    GROUP BY exceptions.id
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Migration 05: duplicate id values prevent a safe primary key.';
  END IF;

  IF EXISTS (
    SELECT exceptions.session_id, exceptions.member_id
    FROM public.attendance_session_check_in_exceptions AS exceptions
    GROUP BY exceptions.session_id, exceptions.member_id
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Migration 05: duplicate session/member pairs prevent a safe unique constraint.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.attendance_session_check_in_exceptions AS exceptions
    WHERE exceptions.reason IS NOT NULL
      AND (
        pg_catalog.char_length(pg_catalog.btrim(exceptions.reason)) < 1
        OR pg_catalog.char_length(pg_catalog.btrim(exceptions.reason)) > 250
      )
  ) THEN
    RAISE EXCEPTION
      'Migration 05: reason contains blank or over-250-character values; normalize them manually before retrying.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.attendance_session_check_in_exceptions AS exceptions
    LEFT JOIN public.attendance_sessions AS sessions
      ON sessions.id = exceptions.session_id
    WHERE sessions.id IS NULL
  ) OR EXISTS (
    SELECT 1
    FROM public.attendance_session_check_in_exceptions AS exceptions
    LEFT JOIN public.members AS members
      ON members.id = exceptions.member_id
    WHERE members.id IS NULL
  ) OR EXISTS (
    SELECT 1
    FROM public.attendance_session_check_in_exceptions AS exceptions
    LEFT JOIN auth.users AS users
      ON users.id = exceptions.created_by
    WHERE exceptions.created_by IS NOT NULL
      AND users.id IS NULL
  ) THEN
    RAISE EXCEPTION
      'Migration 05: orphaned foreign-key values require manual reconciliation.';
  END IF;

  IF pg_catalog.to_regprocedure('public.has_app_permission(text)') IS NULL THEN
    RAISE EXCEPTION
      'Migration 05: required function public.has_app_permission(text) does not exist.';
  END IF;
END;
$preflight$;

ALTER TABLE public.attendance_session_check_in_exceptions
  ALTER COLUMN id SET NOT NULL,
  ALTER COLUMN session_id SET NOT NULL,
  ALTER COLUMN member_id SET NOT NULL,
  ALTER COLUMN reason DROP NOT NULL,
  ALTER COLUMN reason DROP DEFAULT,
  ALTER COLUMN created_by DROP NOT NULL,
  ALTER COLUMN created_by DROP DEFAULT,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT pg_catalog.now();

DO $identity$
DECLARE
  identity_kind "char";
  identity_sequence text;
  maximum_id bigint;
BEGIN
  SELECT attributes.attidentity
  INTO STRICT identity_kind
  FROM pg_catalog.pg_attribute AS attributes
  WHERE attributes.attrelid =
      'public.attendance_session_check_in_exceptions'::pg_catalog.regclass
    AND attributes.attname = 'id'
    AND attributes.attnum > 0
    AND NOT attributes.attisdropped;

  IF identity_kind = 'a' THEN
    ALTER TABLE public.attendance_session_check_in_exceptions
      ALTER COLUMN id SET GENERATED BY DEFAULT;
  ELSIF identity_kind = '' THEN
    ALTER TABLE public.attendance_session_check_in_exceptions
      ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY;
  ELSIF identity_kind <> 'd' THEN
    RAISE EXCEPTION
      'Migration 05: unsupported identity configuration for id: %.',
      identity_kind;
  END IF;

  identity_sequence := pg_catalog.pg_get_serial_sequence(
    'public.attendance_session_check_in_exceptions',
    'id'
  );

  IF identity_sequence IS NULL THEN
    RAISE EXCEPTION
      'Migration 05: the id identity sequence could not be resolved.';
  END IF;

  SELECT pg_catalog.max(exceptions.id)
  INTO maximum_id
  FROM public.attendance_session_check_in_exceptions AS exceptions;

  IF maximum_id IS NULL OR maximum_id < 1 THEN
    PERFORM pg_catalog.setval(identity_sequence::pg_catalog.regclass, 1, false);
  ELSE
    PERFORM pg_catalog.setval(
      identity_sequence::pg_catalog.regclass,
      maximum_id,
      true
    );
  END IF;
END;
$identity$;

ALTER TABLE public.attendance_session_check_in_exceptions
  DROP COLUMN IF EXISTS updated_at;

DO $constraints$
DECLARE
  constraint_record record;
BEGIN
  FOR constraint_record IN
    SELECT constraints.conname
    FROM pg_catalog.pg_constraint AS constraints
    WHERE constraints.conrelid =
      'public.attendance_session_check_in_exceptions'::pg_catalog.regclass
      AND constraints.contype IN ('p', 'u', 'f', 'c')
  LOOP
    EXECUTE pg_catalog.format(
      'ALTER TABLE public.attendance_session_check_in_exceptions DROP CONSTRAINT %I',
      constraint_record.conname
    );
  END LOOP;
END;
$constraints$;

ALTER TABLE public.attendance_session_check_in_exceptions
  ADD CONSTRAINT attendance_session_check_in_exceptions_pkey
    PRIMARY KEY (id),
  ADD CONSTRAINT attendance_session_check_in_exceptions_session_member_key
    UNIQUE (session_id, member_id),
  ADD CONSTRAINT attendance_session_check_in_exceptions_session_id_fkey
    FOREIGN KEY (session_id)
    REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
  ADD CONSTRAINT attendance_session_check_in_exceptions_member_id_fkey
    FOREIGN KEY (member_id)
    REFERENCES public.members(id) ON DELETE CASCADE,
  ADD CONSTRAINT attendance_session_check_in_exceptions_created_by_fkey
    FOREIGN KEY (created_by)
    REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD CONSTRAINT attendance_session_check_in_exceptions_reason_check
    CHECK (
      reason IS NULL
      OR pg_catalog.char_length(pg_catalog.btrim(reason)) BETWEEN 1 AND 250
    );

ALTER TABLE public.attendance_session_check_in_exceptions
  ENABLE ROW LEVEL SECURITY;

DO $policies$
DECLARE
  policy_record record;
BEGIN
  FOR policy_record IN
    SELECT policies.policyname
    FROM pg_catalog.pg_policies AS policies
    WHERE policies.schemaname = 'public'
      AND policies.tablename = 'attendance_session_check_in_exceptions'
  LOOP
    EXECUTE pg_catalog.format(
      'DROP POLICY %I ON public.attendance_session_check_in_exceptions',
      policy_record.policyname
    );
  END LOOP;
END;
$policies$;

CREATE POLICY attendance_exception_managers_select
ON public.attendance_session_check_in_exceptions
FOR SELECT
TO authenticated
USING (public.has_app_permission('attendance.manage'));

CREATE POLICY attendance_exception_managers_insert
ON public.attendance_session_check_in_exceptions
FOR INSERT
TO authenticated
WITH CHECK (public.has_app_permission('attendance.manage'));

CREATE POLICY attendance_exception_managers_delete
ON public.attendance_session_check_in_exceptions
FOR DELETE
TO authenticated
USING (public.has_app_permission('attendance.manage'));

REVOKE ALL ON TABLE
  public.attendance_session_check_in_exceptions
FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, DELETE ON TABLE
  public.attendance_session_check_in_exceptions
TO authenticated;

DO $identity_sequence$
DECLARE
  identity_sequence text := pg_catalog.pg_get_serial_sequence(
    'public.attendance_session_check_in_exceptions',
    'id'
  );
BEGIN
  IF identity_sequence IS NULL THEN
    RAISE EXCEPTION
      'Migration 05: the id identity sequence could not be resolved.';
  END IF;

  EXECUTE pg_catalog.format(
    'REVOKE ALL ON SEQUENCE %s FROM PUBLIC, anon, authenticated',
    identity_sequence
  );
  EXECUTE pg_catalog.format(
    'GRANT USAGE ON SEQUENCE %s TO authenticated',
    identity_sequence
  );
END;
$identity_sequence$;

COMMENT ON TABLE public.attendance_session_check_in_exceptions IS
  'Canonical schema reconciled by attendance migration 05; full-state writes use sync_attendance_session_check_in_exceptions().';

COMMIT;

/*
 * ROLLBACK MANUAL - REVISAR ANTES DE EJECUTAR
 *
 * Esta reconciliacion elimina updated_at cuando existe. Sus valores no pueden
 * restaurarse automaticamente. Un rollback debe partir de un respaldo previo y
 * reconstruir explicitamente los constraints, politicas y grants anteriores.
 * No se incluye SQL automatico porque el estado anterior puede ser 02 o una
 * variante remota y asumir uno de ellos podria debilitar RLS o perder datos.
 */
