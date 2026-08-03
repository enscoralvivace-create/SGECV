/*
 * RC-3.4 - Resolucion interna del estado Auth de una invitacion
 *
 * MIGRACION NO EJECUTADA.
 * La funcion devuelve el correo completo y el estado de la cuenta
 * exclusivamente a service_role.
 * No consume invitaciones, no crea usuarios y no modifica integrantes.
 */

BEGIN;

CREATE OR REPLACE FUNCTION public.resolve_student_invitation_account_state(
  plain_token text
)
RETURNS TABLE (
  email_normalized text,
  account_state text
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
  matching_invitation_count bigint;
  auth_user_count bigint;
  auth_email_confirmed_at timestamptz;
  resolved_account_state text;
BEGIN
  IF plain_token IS NULL
    OR btrim(plain_token) = ''
    OR plain_token !~ '^[A-Za-z0-9_-]{40,}$'
  THEN
    RETURN;
  END IF;

  SELECT count(*)
  INTO matching_invitation_count
  FROM public.student_account_invitations AS invitations
  WHERE invitations.token_hash = encode(
    extensions.digest(plain_token, 'sha256'),
    'hex'
  );

  IF matching_invitation_count <> 1 THEN
    RETURN;
  END IF;

  SELECT invitations.*
  INTO invitation_record
  FROM public.student_account_invitations AS invitations
  WHERE invitations.token_hash = encode(
    extensions.digest(plain_token, 'sha256'),
    'hex'
  );

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

  SELECT count(*)
  INTO auth_user_count
  FROM auth.users AS users
  WHERE users.email IS NOT NULL
    AND lower(btrim(users.email)) = normalized_email;

  IF auth_user_count > 1 THEN
    RETURN;
  END IF;

  IF auth_user_count = 0 THEN
    resolved_account_state := 'absent';
  ELSE
    SELECT users.email_confirmed_at
    INTO auth_email_confirmed_at
    FROM auth.users AS users
    WHERE users.email IS NOT NULL
      AND lower(btrim(users.email)) = normalized_email;

    IF auth_email_confirmed_at IS NULL THEN
      resolved_account_state := 'unconfirmed';
    ELSE
      resolved_account_state := 'confirmed';
    END IF;
  END IF;

  RETURN QUERY SELECT normalized_email, resolved_account_state;
END;
$function$;

ALTER FUNCTION public.resolve_student_invitation_account_state(text)
  OWNER TO postgres;

REVOKE ALL ON FUNCTION
  public.resolve_student_invitation_account_state(text)
FROM PUBLIC;

REVOKE ALL ON FUNCTION
  public.resolve_student_invitation_account_state(text)
FROM anon;

REVOKE ALL ON FUNCTION
  public.resolve_student_invitation_account_state(text)
FROM authenticated;

GRANT EXECUTE ON FUNCTION
  public.resolve_student_invitation_account_state(text)
TO service_role;

COMMENT ON FUNCTION public.resolve_student_invitation_account_state(text) IS
  'Resuelve internamente el correo y el estado Auth de una invitacion valida; solo service_role puede ejecutarla.';

COMMIT;

/*
 * ROLLBACK MANUAL (revisar antes de ejecutar):
 *
 * BEGIN;
 * REVOKE ALL ON FUNCTION
 *   public.resolve_student_invitation_account_state(text)
 * FROM service_role;
 * DROP FUNCTION IF EXISTS
 *   public.resolve_student_invitation_account_state(text);
 * COMMIT;
 */
