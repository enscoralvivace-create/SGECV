/*
 * Modo Ensayo - Registro atomico de asistencia mediante codigo QR
 *
 * MIGRACION NO EJECUTADA.
 * La funcion obtiene del servidor la identidad, la sesion, la hora y
 * la clasificacion. El cliente proporciona exclusivamente el token QR.
 * No crea ausencias, no modifica sesiones y no cambia politicas RLS.
 */

BEGIN;

CREATE OR REPLACE FUNCTION public.register_attendance_by_qr(
  qr_token text
)
RETURNS TABLE (
  success boolean,
  result_code text,
  attendance_status text,
  checked_in_at timestamptz,
  session_title text,
  member_display_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  current_user_id uuid := auth.uid();
  parsed_qr_token uuid;
  check_in_time timestamptz := now();
  matching_member_count bigint;
  target_member public.members%ROWTYPE;
  target_session public.attendance_sessions%ROWTYPE;
  attendance_record public.attendance_records%ROWTYPE;
  calculated_status text;
BEGIN
  IF current_user_id IS NULL THEN
    RETURN QUERY SELECT
      false,
      'authentication_required',
      NULL::text,
      NULL::timestamptz,
      NULL::text,
      NULL::text;
    RETURN;
  END IF;

  SELECT count(*)
  INTO matching_member_count
  FROM public.members AS members
  WHERE members.auth_user_id = current_user_id;

  IF matching_member_count <> 1 THEN
    RETURN QUERY SELECT
      false,
      'member_unavailable',
      NULL::text,
      NULL::timestamptz,
      NULL::text,
      NULL::text;
    RETURN;
  END IF;

  SELECT members.*
  INTO target_member
  FROM public.members AS members
  WHERE members.auth_user_id = current_user_id
  FOR SHARE;

  IF NOT FOUND
    OR lower(btrim(target_member.status)) <> 'activo'
  THEN
    RETURN QUERY SELECT
      false,
      'member_unavailable',
      NULL::text,
      NULL::timestamptz,
      NULL::text,
      NULL::text;
    RETURN;
  END IF;

  IF NOT (
    public.has_app_permission('attendance.viewOwn')
    OR public.has_app_permission('attendance.viewAll')
    OR public.has_app_permission('attendance.manage')
  ) THEN
    RETURN QUERY SELECT
      false,
      'permission_denied',
      NULL::text,
      NULL::timestamptz,
      NULL::text,
      NULL::text;
    RETURN;
  END IF;

  IF qr_token IS NULL OR btrim(qr_token) = '' THEN
    RETURN QUERY SELECT
      false,
      'session_unavailable',
      NULL::text,
      NULL::timestamptz,
      NULL::text,
      NULL::text;
    RETURN;
  END IF;

  BEGIN
    parsed_qr_token := btrim(qr_token)::uuid;
  EXCEPTION
    WHEN invalid_text_representation THEN
      RETURN QUERY SELECT
        false,
        'session_unavailable',
        NULL::text,
        NULL::timestamptz,
        NULL::text,
        NULL::text;
      RETURN;
  END;

  SELECT sessions.*
  INTO target_session
  FROM public.attendance_sessions AS sessions
  WHERE sessions.qr_token = parsed_qr_token
  FOR SHARE;

  IF NOT FOUND OR NOT target_session.is_active THEN
    RETURN QUERY SELECT
      false,
      'session_unavailable',
      NULL::text,
      NULL::timestamptz,
      NULL::text,
      NULL::text;
    RETURN;
  END IF;

  IF check_in_time < target_session.starts_at THEN
    RETURN QUERY SELECT
      false,
      'not_started',
      NULL::text,
      NULL::timestamptz,
      NULL::text,
      NULL::text;
    RETURN;
  END IF;

  IF check_in_time > target_session.late_until THEN
    RETURN QUERY SELECT
      false,
      'registration_closed',
      NULL::text,
      NULL::timestamptz,
      NULL::text,
      NULL::text;
    RETURN;
  END IF;

  IF check_in_time <= target_session.present_until THEN
    calculated_status := 'present';
  ELSE
    calculated_status := 'late';
  END IF;

  INSERT INTO public.attendance_records (
    session_id,
    member_id,
    status,
    check_in_method,
    checked_in_at
  )
  VALUES (
    target_session.id,
    target_member.id,
    calculated_status,
    'qr',
    check_in_time
  )
  ON CONFLICT (session_id, member_id) DO NOTHING
  RETURNING *
  INTO attendance_record;

  IF FOUND THEN
    RETURN QUERY SELECT
      true,
      'registered',
      attendance_record.status,
      attendance_record.checked_in_at,
      target_session.title,
      concat_ws(
        ' ',
        target_member.name,
        target_member.last_name
      );
    RETURN;
  END IF;

  SELECT records.*
  INTO attendance_record
  FROM public.attendance_records AS records
  WHERE records.session_id = target_session.id
    AND records.member_id = target_member.id;

  IF FOUND THEN
    RETURN QUERY SELECT
      true,
      'already_registered',
      attendance_record.status,
      attendance_record.checked_in_at,
      target_session.title,
      concat_ws(
        ' ',
        target_member.name,
        target_member.last_name
      );
    RETURN;
  END IF;

  RETURN QUERY SELECT
    false,
    'temporarily_unavailable',
    NULL::text,
    NULL::timestamptz,
    NULL::text,
    NULL::text;
END;
$function$;

ALTER FUNCTION public.register_attendance_by_qr(text)
  OWNER TO postgres;

REVOKE ALL ON FUNCTION
  public.register_attendance_by_qr(text)
FROM PUBLIC;

REVOKE ALL ON FUNCTION
  public.register_attendance_by_qr(text)
FROM anon;

REVOKE ALL ON FUNCTION
  public.register_attendance_by_qr(text)
FROM authenticated;

GRANT EXECUTE ON FUNCTION
  public.register_attendance_by_qr(text)
TO authenticated;

COMMENT ON FUNCTION public.register_attendance_by_qr(text) IS
  'Registra atomicamente la asistencia QR del integrante autenticado usando exclusivamente la hora y clasificacion del servidor.';

COMMIT;

/*
 * ROLLBACK MANUAL (revisar antes de ejecutar):
 *
 * BEGIN;
 * REVOKE ALL ON FUNCTION
 *   public.register_attendance_by_qr(text)
 * FROM authenticated;
 * DROP FUNCTION IF EXISTS
 *   public.register_attendance_by_qr(text);
 * COMMIT;
 */
