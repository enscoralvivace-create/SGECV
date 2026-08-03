/*
 * RC-3.3.3 - Resolucion interna de invitaciones para registro seguro
 *
 * MIGRACION NO EJECUTADA.
 * La funcion devuelve el correo completo exclusivamente a service_role.
 * No consume invitaciones, no crea usuarios y no modifica integrantes.
 */

BEGIN;

CREATE OR REPLACE FUNCTION public.resolve_student_invitation_for_signup(
  plain_token text
)
RETURNS TABLE (
  email_normalized text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  invitation_record public.student_account_invitations%ROWTYPE;
  target_member public.members%ROWTYPE;
  normalized_email text;
  normalized_email_count bigint;
BEGIN
  IF plain_token IS NULL
    OR btrim(plain_token) = ''
    OR plain_token !~ '^[A-Za-z0-9_-]{40,}$'
  THEN
    RETURN;
  END IF;

  SELECT invitations.*
  INTO invitation_record
  FROM public.student_account_invitations AS invitations
  WHERE invitations.token_hash = encode(
    extensions.digest(plain_token, 'sha256'),
    'hex'
  )
  LIMIT 1;

  IF NOT FOUND
    OR invitation_record.used_at IS NOT NULL
    OR invitation_record.revoked_at IS NOT NULL
    OR invitation_record.expires_at <= now()
  THEN
    RETURN;
  END IF;

  SELECT members.*
  INTO target_member
  FROM public.members AS members
  WHERE members.id = invitation_record.member_id;

  IF NOT FOUND
    OR lower(btrim(target_member.status)) <> 'activo'
    OR target_member.email IS NULL
    OR btrim(target_member.email) = ''
    OR target_member.auth_user_id IS NOT NULL
    OR target_member.role NOT IN ('member', 'student')
  THEN
    RETURN;
  END IF;

  normalized_email := lower(btrim(target_member.email));

  IF normalized_email <> invitation_record.email_normalized
    OR normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  THEN
    RETURN;
  END IF;

  SELECT count(*)
  INTO normalized_email_count
  FROM public.members AS members
  WHERE members.email IS NOT NULL
    AND lower(btrim(members.email)) = normalized_email;

  IF normalized_email_count <> 1 THEN
    RETURN;
  END IF;

  RETURN QUERY SELECT normalized_email;
END;
$function$;

REVOKE ALL ON FUNCTION
  public.resolve_student_invitation_for_signup(text)
FROM PUBLIC;

REVOKE ALL ON FUNCTION
  public.resolve_student_invitation_for_signup(text)
FROM anon;

REVOKE ALL ON FUNCTION
  public.resolve_student_invitation_for_signup(text)
FROM authenticated;

GRANT EXECUTE ON FUNCTION
  public.resolve_student_invitation_for_signup(text)
TO service_role;

COMMENT ON FUNCTION public.resolve_student_invitation_for_signup(text) IS
  'Resuelve internamente el correo de una invitacion valida para el alta Auth; solo service_role puede ejecutarla.';

COMMIT;

/*
 * ROLLBACK MANUAL (revisar antes de ejecutar):
 *
 * BEGIN;
 * REVOKE ALL ON FUNCTION
 *   public.resolve_student_invitation_for_signup(text)
 * FROM service_role;
 * DROP FUNCTION IF EXISTS
 *   public.resolve_student_invitation_for_signup(text);
 * COMMIT;
 */
