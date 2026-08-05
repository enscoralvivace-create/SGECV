/*
 * Sincroniza atomicamente las excepciones de registro tardio de una sesion.
 * MIGRACION NO EJECUTADA.
 */

BEGIN;

CREATE OR REPLACE FUNCTION public.sync_attendance_session_check_in_exceptions(
  p_session_id uuid,
  p_exceptions jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  invalid_member_count bigint;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication_required'
      USING ERRCODE = '42501';
  END IF;

  IF NOT public.has_app_permission('attendance.manage') THEN
    RAISE EXCEPTION 'permission_denied'
      USING ERRCODE = '42501';
  END IF;

  IF p_session_id IS NULL OR p_exceptions IS NULL
    OR jsonb_typeof(p_exceptions) <> 'array'
  THEN
    RAISE EXCEPTION 'invalid_arguments'
      USING ERRCODE = '22023';
  END IF;

  PERFORM 1
  FROM public.attendance_sessions AS sessions
  WHERE sessions.id = p_session_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'session_not_found'
      USING ERRCODE = 'P0002';
  END IF;

  CREATE TEMP TABLE selected_exceptions (
    member_id bigint PRIMARY KEY,
    reason text
  ) ON COMMIT DROP;

  BEGIN
    INSERT INTO selected_exceptions (member_id, reason)
    SELECT
      items.member_id,
      NULLIF(btrim(items.reason), '')
    FROM jsonb_to_recordset(p_exceptions) AS items(
      member_id bigint,
      reason text
    );
  EXCEPTION
    WHEN unique_violation OR invalid_text_representation THEN
      RAISE EXCEPTION 'invalid_exceptions'
        USING ERRCODE = '22023';
  END;

  IF EXISTS (
    SELECT 1
    FROM selected_exceptions AS selected
    WHERE selected.member_id IS NULL
      OR char_length(selected.reason) > 250
  ) THEN
    RAISE EXCEPTION 'invalid_exceptions'
      USING ERRCODE = '22023';
  END IF;

  SELECT count(*)
  INTO invalid_member_count
  FROM selected_exceptions AS selected
  LEFT JOIN public.members AS members
    ON members.id = selected.member_id
    AND lower(btrim(members.status)) = 'activo'
  WHERE members.id IS NULL;

  IF invalid_member_count > 0 THEN
    RAISE EXCEPTION 'inactive_or_unknown_member'
      USING ERRCODE = '22023';
  END IF;

  DELETE FROM public.attendance_session_check_in_exceptions AS exceptions
  WHERE exceptions.session_id = p_session_id;

  INSERT INTO public.attendance_session_check_in_exceptions (
    session_id,
    member_id,
    reason
  )
  SELECT
    p_session_id,
    selected.member_id,
    selected.reason
  FROM selected_exceptions AS selected;
END;
$function$;

ALTER FUNCTION public.sync_attendance_session_check_in_exceptions(uuid, jsonb)
  OWNER TO postgres;

REVOKE ALL ON FUNCTION
  public.sync_attendance_session_check_in_exceptions(uuid, jsonb)
FROM PUBLIC;

REVOKE ALL ON FUNCTION
  public.sync_attendance_session_check_in_exceptions(uuid, jsonb)
FROM anon;

REVOKE ALL ON FUNCTION
  public.sync_attendance_session_check_in_exceptions(uuid, jsonb)
FROM authenticated;

GRANT EXECUTE ON FUNCTION
  public.sync_attendance_session_check_in_exceptions(uuid, jsonb)
TO authenticated;

COMMENT ON FUNCTION public.sync_attendance_session_check_in_exceptions(uuid, jsonb) IS
  'Reemplaza atomicamente la seleccion completa de excepciones tardias de una sesion; requiere attendance.manage.';

COMMIT;
