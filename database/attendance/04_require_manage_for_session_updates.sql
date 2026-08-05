/*
 * Defensa en profundidad para mutaciones de attendance_sessions.
 * Solo attendance.manage puede actualizar una sesion.
 * MIGRACION NO EJECUTADA.
 */

BEGIN;

ALTER TABLE public.attendance_sessions
  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS
  "attendance sessions update by managers"
ON public.attendance_sessions;

CREATE POLICY "attendance sessions update by managers"
ON public.attendance_sessions
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (public.has_app_permission('attendance.manage'))
WITH CHECK (public.has_app_permission('attendance.manage'));

DROP POLICY IF EXISTS
  "attendance sessions update requires manage"
ON public.attendance_sessions;

CREATE POLICY "attendance sessions update requires manage"
ON public.attendance_sessions
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (public.has_app_permission('attendance.manage'))
WITH CHECK (public.has_app_permission('attendance.manage'));

REVOKE UPDATE ON TABLE public.attendance_sessions
FROM PUBLIC;

REVOKE UPDATE ON TABLE public.attendance_sessions
FROM anon;

GRANT UPDATE ON TABLE public.attendance_sessions
TO authenticated;

COMMIT;
