/*
 * Excepciones por sesion para permitir registro QR tardio hasta ends_at.
 * MIGRACION YA APLICADA MANUALMENTE EN SUPABASE.
 */

BEGIN;

CREATE TABLE IF NOT EXISTS public.attendance_session_check_in_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL
    REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
  member_id bigint NOT NULL
    REFERENCES public.members(id) ON DELETE CASCADE,
  reason text,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT attendance_session_check_in_exceptions_session_member_unique
    UNIQUE (session_id, member_id),
  CONSTRAINT attendance_session_check_in_exceptions_reason_length
    CHECK (reason IS NULL OR char_length(reason) <= 250)
);

ALTER TABLE public.attendance_session_check_in_exceptions
  ENABLE ROW LEVEL SECURITY;

DO $policies$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'attendance_session_check_in_exceptions'
      AND policyname = 'attendance exceptions select by managers'
  ) THEN
    CREATE POLICY "attendance exceptions select by managers"
    ON public.attendance_session_check_in_exceptions
    FOR SELECT
    TO authenticated
    USING (public.has_app_permission('attendance.manage'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'attendance_session_check_in_exceptions'
      AND policyname = 'attendance exceptions insert by managers'
  ) THEN
    CREATE POLICY "attendance exceptions insert by managers"
    ON public.attendance_session_check_in_exceptions
    FOR INSERT
    TO authenticated
    WITH CHECK (public.has_app_permission('attendance.manage'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'attendance_session_check_in_exceptions'
      AND policyname = 'attendance exceptions update by managers'
  ) THEN
    CREATE POLICY "attendance exceptions update by managers"
    ON public.attendance_session_check_in_exceptions
    FOR UPDATE
    TO authenticated
    USING (public.has_app_permission('attendance.manage'))
    WITH CHECK (public.has_app_permission('attendance.manage'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'attendance_session_check_in_exceptions'
      AND policyname = 'attendance exceptions delete by managers'
  ) THEN
    CREATE POLICY "attendance exceptions delete by managers"
    ON public.attendance_session_check_in_exceptions
    FOR DELETE
    TO authenticated
    USING (public.has_app_permission('attendance.manage'));
  END IF;
END;
$policies$;

REVOKE ALL ON TABLE
  public.attendance_session_check_in_exceptions
FROM PUBLIC;

REVOKE ALL ON TABLE
  public.attendance_session_check_in_exceptions
FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.attendance_session_check_in_exceptions
TO authenticated;

COMMIT;
