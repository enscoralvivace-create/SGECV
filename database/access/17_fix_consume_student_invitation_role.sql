/* Conserva el rol member/student al consumir una invitación individual. */

BEGIN;

DO $precondition$
BEGIN
  IF pg_catalog.to_regprocedure('public.consume_student_invitation(text)') IS NULL
    OR pg_catalog.to_regclass('public.student_account_invitations') IS NULL
    OR pg_catalog.to_regclass('public.members') IS NULL
  THEN
    RAISE EXCEPTION 'Falta el flujo de invitaciones individuales requerido.';
  END IF;
END;
$precondition$;

CREATE OR REPLACE FUNCTION public.consume_student_invitation(plain_token text)
RETURNS TABLE (success boolean, result_code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  current_user_id uuid := auth.uid();
  authenticated_email text;
  authenticated_email_confirmed_at timestamptz;
  normalized_authenticated_email text;
  invitation_member_id bigint;
  invitation_record public.student_account_invitations%ROWTYPE;
  target_member public.members%ROWTYPE;
BEGIN
  IF current_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'authentication_required'; RETURN;
  END IF;
  IF plain_token IS NULL OR btrim(plain_token) = '' THEN
    RETURN QUERY SELECT false, 'invalid'; RETURN;
  END IF;

  SELECT users.email, users.email_confirmed_at
  INTO authenticated_email, authenticated_email_confirmed_at
  FROM auth.users AS users WHERE users.id = current_user_id;
  IF NOT FOUND OR authenticated_email IS NULL THEN
    RETURN QUERY SELECT false, 'authentication_required'; RETURN;
  END IF;
  IF authenticated_email_confirmed_at IS NULL THEN
    RETURN QUERY SELECT false, 'email_confirmation_required'; RETURN;
  END IF;
  normalized_authenticated_email := lower(btrim(authenticated_email));

  SELECT invitations.member_id INTO invitation_member_id
  FROM public.student_account_invitations AS invitations
  WHERE invitations.token_hash = encode(extensions.digest(plain_token, 'sha256'), 'hex');
  IF NOT FOUND THEN RETURN QUERY SELECT false, 'invalid'; RETURN; END IF;

  /* Conserva el orden de bloqueo: members antes de invitations. */
  SELECT members.* INTO target_member
  FROM public.members AS members
  WHERE members.id = invitation_member_id FOR UPDATE;
  IF NOT FOUND THEN RETURN QUERY SELECT false, 'unavailable'; RETURN; END IF;

  SELECT invitations.* INTO invitation_record
  FROM public.student_account_invitations AS invitations
  WHERE invitations.token_hash = encode(extensions.digest(plain_token, 'sha256'), 'hex')
    AND invitations.member_id = invitation_member_id
  FOR UPDATE;
  IF NOT FOUND THEN RETURN QUERY SELECT false, 'invalid'; RETURN; END IF;

  IF invitation_record.used_at IS NOT NULL THEN
    IF target_member.auth_user_id = current_user_id
      AND target_member.role IN ('member', 'student')
      AND target_member.email IS NOT NULL
      AND lower(btrim(target_member.email)) = invitation_record.email_normalized
      AND normalized_authenticated_email = invitation_record.email_normalized
    THEN RETURN QUERY SELECT true, 'already_activated';
    ELSE RETURN QUERY SELECT false, 'used';
    END IF;
    RETURN;
  END IF;
  IF invitation_record.revoked_at IS NOT NULL THEN RETURN QUERY SELECT false, 'revoked'; RETURN; END IF;
  IF invitation_record.expires_at <= now() THEN RETURN QUERY SELECT false, 'expired'; RETURN; END IF;
  IF normalized_authenticated_email <> invitation_record.email_normalized THEN
    RETURN QUERY SELECT false, 'email_mismatch'; RETURN;
  END IF;
  IF lower(btrim(target_member.status)) <> 'activo' THEN
    RETURN QUERY SELECT false, 'member_inactive'; RETURN;
  END IF;
  IF target_member.email IS NULL
    OR lower(btrim(target_member.email)) <> invitation_record.email_normalized
  THEN RETURN QUERY SELECT false, 'unavailable'; RETURN; END IF;
  IF target_member.auth_user_id IS NOT NULL THEN
    RETURN QUERY SELECT false, 'already_linked'; RETURN;
  END IF;
  IF target_member.role NOT IN ('member', 'student') THEN
    RETURN QUERY SELECT false, 'role_not_eligible'; RETURN;
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.members AS linked_members
    WHERE linked_members.auth_user_id = current_user_id
      AND linked_members.id <> target_member.id
  ) THEN RETURN QUERY SELECT false, 'already_linked'; RETURN; END IF;

  UPDATE public.members AS members
  SET auth_user_id = current_user_id
  WHERE members.id = target_member.id;

  UPDATE public.student_account_invitations AS invitations
  SET used_at = now(), updated_at = now()
  WHERE invitations.id = invitation_record.id;

  RETURN QUERY SELECT true, 'activated';
END;
$function$;

ALTER FUNCTION public.consume_student_invitation(text) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.consume_student_invitation(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_student_invitation(text) TO authenticated;

COMMENT ON FUNCTION public.consume_student_invitation(text) IS
  'Consume atómicamente una invitación y vincula auth.uid() conservando el rol member o student aprobado.';

COMMIT;
