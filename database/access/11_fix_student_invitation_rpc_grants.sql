/*
 * RC-3.3.1 - Correccion de grants de las RPC de invitaciones
 *
 * Normaliza exclusivamente los privilegios EXECUTE de las cinco RPC.
 * No modifica funciones, tablas, politicas RLS ni datos.
 */

BEGIN;

REVOKE EXECUTE ON FUNCTION
  public.create_student_invitation(bigint, interval)
FROM anon;

REVOKE EXECUTE ON FUNCTION
  public.list_student_invitations(bigint)
FROM anon;

REVOKE EXECUTE ON FUNCTION
  public.consume_student_invitation(text)
FROM anon;

REVOKE EXECUTE ON FUNCTION
  public.revoke_student_invitation(uuid)
FROM anon;

REVOKE EXECUTE ON FUNCTION
  public.create_student_invitation(bigint, interval)
FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION
  public.list_student_invitations(bigint)
FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION
  public.validate_student_invitation(text)
FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION
  public.consume_student_invitation(text)
FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION
  public.revoke_student_invitation(uuid)
FROM PUBLIC;

GRANT EXECUTE ON FUNCTION
  public.create_student_invitation(bigint, interval)
TO authenticated;

GRANT EXECUTE ON FUNCTION
  public.list_student_invitations(bigint)
TO authenticated;

GRANT EXECUTE ON FUNCTION
  public.validate_student_invitation(text)
TO authenticated;

GRANT EXECUTE ON FUNCTION
  public.consume_student_invitation(text)
TO authenticated;

GRANT EXECUTE ON FUNCTION
  public.revoke_student_invitation(uuid)
TO authenticated;

GRANT EXECUTE ON FUNCTION
  public.validate_student_invitation(text)
TO anon;

COMMIT;
