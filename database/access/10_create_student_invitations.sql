/*
 * RC-3.3.1 - Invitaciones seguras para cuentas de alumnos
 *
 * MIGRACIÓN NO EJECUTADA.
 *
 * Esta migración reemplaza el alta automática basada en metadatos por un
 * flujo explícito de invitaciones. No modifica cuentas ni integrantes
 * existentes. public.handle_new_member_user() se conserva para rollback.
 */

BEGIN;

/*
 * DIAGNÓSTICO PREVIO (ejecutar manualmente antes de aplicar la migración).
 * Estas consultas están comentadas intencionalmente.
 *
 * -- Correos duplicados tras normalización:
 * SELECT lower(btrim(email)) AS email_normalized, count(*)
 * FROM public.members
 * WHERE email IS NOT NULL AND btrim(email) <> ''
 * GROUP BY lower(btrim(email))
 * HAVING count(*) > 1;
 *
 * -- Correos con espacios al inicio o al final:
 * SELECT id
 * FROM public.members
 * WHERE email IS NOT NULL AND email <> btrim(email);
 *
 * -- auth_user_id duplicados:
 * SELECT auth_user_id, count(*)
 * FROM public.members
 * WHERE auth_user_id IS NOT NULL
 * GROUP BY auth_user_id
 * HAVING count(*) > 1;
 *
 * -- Integrantes activos sin correo utilizable:
 * SELECT id
 * FROM public.members
 * WHERE lower(btrim(status)) = 'activo'
 *   AND (email IS NULL OR btrim(email) = '');
 *
 * -- Roles fuera del conjunto esperado:
 * SELECT role, count(*)
 * FROM public.members
 * WHERE role NOT IN ('admin', 'teacher', 'member', 'student')
 * GROUP BY role;
 *
 * -- Integrantes con rol privilegiado que no deben recibir invitaciones:
 * SELECT id, role
 * FROM public.members
 * WHERE role IN ('admin', 'teacher');
 *
 * -- Invitaciones previas, solo si la tabla ya existe:
 * SELECT count(*) AS invitation_count
 * FROM public.student_account_invitations;
 */

DO $precondition$
BEGIN
  IF to_regnamespace('extensions') IS NULL THEN
    RAISE EXCEPTION
      'Falta el esquema extensions requerido para pgcrypto en Supabase.';
  END IF;
END;
$precondition$;

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $precondition$
DECLARE
  installed_schema text;
BEGIN
  SELECT namespaces.nspname
  INTO installed_schema
  FROM pg_catalog.pg_extension AS extensions_catalog
  JOIN pg_catalog.pg_namespace AS namespaces
    ON namespaces.oid = extensions_catalog.extnamespace
  WHERE extensions_catalog.extname = 'pgcrypto';

  IF installed_schema IS DISTINCT FROM 'extensions' THEN
    RAISE EXCEPTION
      'pgcrypto debe estar instalado en el esquema extensions; esquema actual: %.',
      COALESCE(installed_schema, '<no instalado>');
  END IF;
END;
$precondition$;

DO $precondition$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.members AS members
    WHERE members.role NOT IN ('admin', 'teacher', 'member', 'student')
  ) THEN
    RAISE EXCEPTION
      'No se puede sustituir members_role_check: existen roles incompatibles.';
  END IF;
END;
$precondition$;

-- Amplía el conjunto válido sin modificar los roles ya almacenados.
ALTER TABLE public.members
  DROP CONSTRAINT IF EXISTS members_role_check;

ALTER TABLE public.members
  ADD CONSTRAINT members_role_check
  CHECK (role IN ('admin', 'teacher', 'member', 'student'));

CREATE TABLE IF NOT EXISTS public.student_account_invitations (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  member_id bigint NOT NULL
    REFERENCES public.members(id)
    ON DELETE CASCADE,
  email_normalized text NOT NULL,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz NULL,
  revoked_at timestamptz NULL,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT student_account_invitations_expiration_check
    CHECK (expires_at > created_at),
  CONSTRAINT student_account_invitations_email_normalized_check
    CHECK (email_normalized = lower(btrim(email_normalized))),
  CONSTRAINT student_account_invitations_email_not_empty_check
    CHECK (btrim(email_normalized) <> ''),
  CONSTRAINT student_account_invitations_token_hash_not_empty_check
    CHECK (btrim(token_hash) <> ''),
  CONSTRAINT student_account_invitations_token_hash_format_check
    CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT student_account_invitations_terminal_state_check
    CHECK (used_at IS NULL OR revoked_at IS NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS student_account_invitations_token_hash_unique
  ON public.student_account_invitations (token_hash);

CREATE INDEX IF NOT EXISTS student_account_invitations_member_id_idx
  ON public.student_account_invitations (member_id);

CREATE INDEX IF NOT EXISTS student_account_invitations_expires_at_idx
  ON public.student_account_invitations (expires_at);

/*
 * PostgreSQL no permite now() en el predicado de un índice porque no es una
 * función IMMUTABLE. Por eso la unicidad se aplica a invitaciones abiertas:
 * no usadas y no revocadas, aunque ya hayan vencido. create_student_invitation
 * revoca primero cualquier invitación abierta anterior y después inserta la
 * nueva. La vigencia temporal se valida siempre dentro de las RPC.
 */
CREATE UNIQUE INDEX IF NOT EXISTS student_account_invitations_one_open_per_member
  ON public.student_account_invitations (member_id)
  WHERE used_at IS NULL AND revoked_at IS NULL;

ALTER TABLE public.student_account_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS student_account_invitations_admin_select
  ON public.student_account_invitations;

CREATE POLICY student_account_invitations_admin_select
  ON public.student_account_invitations
  FOR SELECT
  TO authenticated
  USING (
    public.has_app_permission('members.manage')
    OR public.has_app_permission('roles.manage')
  );

/*
 * Deja de ejecutarse el alta histórica basada en raw_user_meta_data.
 * La función se conserva sin cambios para permitir rollback manual.
 */
DO $precondition$
DECLARE
  trigger_function oid;
  expected_function oid := to_regprocedure('public.handle_new_member_user()');
  trigger_type smallint;
BEGIN
  SELECT triggers.tgfoid, triggers.tgtype
  INTO trigger_function, trigger_type
  FROM pg_catalog.pg_trigger AS triggers
  JOIN pg_catalog.pg_class AS tables
    ON tables.oid = triggers.tgrelid
  JOIN pg_catalog.pg_namespace AS namespaces
    ON namespaces.oid = tables.relnamespace
  WHERE namespaces.nspname = 'auth'
    AND tables.relname = 'users'
    AND triggers.tgname = 'on_auth_user_created_create_member'
    AND NOT triggers.tgisinternal;

  IF FOUND AND (
    expected_function IS NULL
    OR trigger_function <> expected_function
    OR trigger_type <> 5
  ) THEN
    RAISE EXCEPTION
      'El trigger auth.on_auth_user_created_create_member no coincide con el trigger esperado AFTER INSERT que ejecuta public.handle_new_member_user().';
  END IF;
END;
$precondition$;

DROP TRIGGER IF EXISTS on_auth_user_created_create_member ON auth.users;

DO $precondition$
BEGIN
  IF to_regprocedure(
    'public.create_student_invitation(bigint,text,interval)'
  ) IS NOT NULL THEN
    RAISE EXCEPTION
      'Existe la firma heredada insegura create_student_invitation(bigint,text,interval). Revísala y retírala explícitamente antes de aplicar esta migración.';
  END IF;
END;
$precondition$;

CREATE OR REPLACE FUNCTION public.create_student_invitation(
  target_member_id bigint,
  valid_for interval DEFAULT interval '7 days'
)
RETURNS TABLE (
  invitation_id uuid,
  member_id bigint,
  email_normalized text,
  expires_at timestamptz,
  plain_token text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  current_user_id uuid := auth.uid();
  target_member public.members%ROWTYPE;
  normalized_email text;
  normalized_email_count bigint;
  created_invitation public.student_account_invitations%ROWTYPE;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Se requiere una sesión autenticada.';
  END IF;

  IF NOT (
    public.has_app_permission('members.manage')
    OR public.has_app_permission('roles.manage')
  ) THEN
    RAISE EXCEPTION 'No tienes permiso para crear invitaciones.';
  END IF;

  IF valid_for IS NULL OR valid_for <= interval '0 seconds' THEN
    RAISE EXCEPTION 'La vigencia de la invitación debe ser positiva.';
  END IF;

  IF valid_for > interval '30 days' THEN
    RAISE EXCEPTION 'La vigencia de la invitación no puede superar 30 días.';
  END IF;

  SELECT members.*
  INTO target_member
  FROM public.members AS members
  WHERE members.id = target_member_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'El integrante no existe.';
  END IF;

  IF lower(btrim(target_member.status)) <> 'activo' THEN
    RAISE EXCEPTION 'El integrante no está activo.';
  END IF;

  IF target_member.email IS NULL OR btrim(target_member.email) = '' THEN
    RAISE EXCEPTION 'El integrante no tiene un correo utilizable.';
  END IF;

  IF target_member.auth_user_id IS NOT NULL THEN
    RAISE EXCEPTION 'El integrante ya tiene una cuenta vinculada.';
  END IF;

  IF target_member.role NOT IN ('member', 'student') THEN
    RAISE EXCEPTION
      'No se puede invitar como alumno a un integrante con rol privilegiado.';
  END IF;

  normalized_email := lower(btrim(target_member.email));

  SELECT count(*)
  INTO normalized_email_count
  FROM public.members AS members
  WHERE members.email IS NOT NULL
    AND lower(btrim(members.email)) = normalized_email;

  IF normalized_email_count <> 1 THEN
    RAISE EXCEPTION 'El correo normalizado no identifica a un único integrante.';
  END IF;

  UPDATE public.student_account_invitations AS invitations
  SET
    revoked_at = now(),
    updated_at = now()
  WHERE invitations.member_id = target_member.id
    AND invitations.used_at IS NULL
    AND invitations.revoked_at IS NULL;

  plain_token := translate(
    rtrim(
      encode(extensions.gen_random_bytes(32), 'base64'),
      '='
    ),
    '+/',
    '-_'
  );

  INSERT INTO public.student_account_invitations (
    member_id,
    email_normalized,
    token_hash,
    expires_at,
    created_by
  )
  VALUES (
    target_member.id,
    normalized_email,
    encode(extensions.digest(plain_token, 'sha256'), 'hex'),
    now() + valid_for,
    current_user_id
  )
  RETURNING * INTO created_invitation;

  RETURN QUERY
  SELECT
    created_invitation.id,
    created_invitation.member_id,
    created_invitation.email_normalized,
    created_invitation.expires_at,
    plain_token;
END;
$function$;

CREATE OR REPLACE FUNCTION public.list_student_invitations(
  target_member_id bigint DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  member_id bigint,
  member_full_name text,
  email_normalized text,
  expires_at timestamptz,
  used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz,
  invitation_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Se requiere una sesión autenticada.';
  END IF;

  IF NOT (
    public.has_app_permission('members.manage')
    OR public.has_app_permission('roles.manage')
  ) THEN
    RAISE EXCEPTION 'No tienes permiso para consultar invitaciones.';
  END IF;

  RETURN QUERY
  SELECT
    invitations.id,
    invitations.member_id,
    concat_ws(
      ' ',
      NULLIF(btrim(members.name), ''),
      NULLIF(btrim(members.last_name), '')
    ) AS member_full_name,
    invitations.email_normalized,
    invitations.expires_at,
    invitations.used_at,
    invitations.revoked_at,
    invitations.created_at,
    CASE
      WHEN invitations.used_at IS NOT NULL THEN 'used'
      WHEN invitations.revoked_at IS NOT NULL THEN 'revoked'
      WHEN invitations.expires_at <= now() THEN 'expired'
      ELSE 'active'
    END AS invitation_status
  FROM public.student_account_invitations AS invitations
  JOIN public.members AS members
    ON members.id = invitations.member_id
  WHERE target_member_id IS NULL
    OR invitations.member_id = target_member_id
  ORDER BY invitations.created_at DESC, invitations.id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_student_invitation(
  plain_token text
)
RETURNS TABLE (
  is_valid boolean,
  result_code text,
  expected_email_masked text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  invitation_record public.student_account_invitations%ROWTYPE;
  member_status text;
  member_email text;
  email_local_part text;
  email_domain text;
BEGIN
  IF plain_token IS NULL OR btrim(plain_token) = '' THEN
    RETURN QUERY SELECT false, 'invalid', NULL::text;
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

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'invalid', NULL::text;
    RETURN;
  END IF;

  IF invitation_record.used_at IS NOT NULL THEN
    RETURN QUERY SELECT false, 'invalid', NULL::text;
    RETURN;
  END IF;

  IF invitation_record.revoked_at IS NOT NULL THEN
    RETURN QUERY SELECT false, 'invalid', NULL::text;
    RETURN;
  END IF;

  IF invitation_record.expires_at <= now() THEN
    RETURN QUERY SELECT false, 'invalid', NULL::text;
    RETURN;
  END IF;

  SELECT members.status, members.email
  INTO member_status, member_email
  FROM public.members AS members
  WHERE members.id = invitation_record.member_id;

  IF NOT FOUND
    OR lower(btrim(member_status)) <> 'activo'
    OR member_email IS NULL
    OR lower(btrim(member_email)) <> invitation_record.email_normalized
  THEN
    RETURN QUERY SELECT false, 'invalid', NULL::text;
    RETURN;
  END IF;

  email_local_part := split_part(invitation_record.email_normalized, '@', 1);
  email_domain := split_part(invitation_record.email_normalized, '@', 2);

  RETURN QUERY
  SELECT
    true,
    'valid',
    CASE
      WHEN email_local_part = '' OR email_domain = '' THEN '***'
      ELSE left(email_local_part, 1) || '***@' || email_domain
    END;
END;
$function$;

CREATE OR REPLACE FUNCTION public.consume_student_invitation(
  plain_token text
)
RETURNS TABLE (
  success boolean,
  result_code text
)
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
    RETURN QUERY SELECT false, 'authentication_required';
    RETURN;
  END IF;

  IF plain_token IS NULL OR btrim(plain_token) = '' THEN
    RETURN QUERY SELECT false, 'invalid';
    RETURN;
  END IF;

  SELECT users.email, users.email_confirmed_at
  INTO authenticated_email, authenticated_email_confirmed_at
  FROM auth.users AS users
  WHERE users.id = current_user_id;

  IF NOT FOUND OR authenticated_email IS NULL THEN
    RETURN QUERY SELECT false, 'authentication_required';
    RETURN;
  END IF;

  IF authenticated_email_confirmed_at IS NULL THEN
    RETURN QUERY SELECT false, 'email_confirmation_required';
    RETURN;
  END IF;

  normalized_authenticated_email := lower(btrim(authenticated_email));

  SELECT invitations.member_id
  INTO invitation_member_id
  FROM public.student_account_invitations AS invitations
  WHERE invitations.token_hash = encode(
    extensions.digest(plain_token, 'sha256'),
    'hex'
  );

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'invalid';
    RETURN;
  END IF;

  /*
   * Mantiene el mismo orden de bloqueo que create_student_invitation:
   * primero members y después student_account_invitations.
   */
  SELECT members.*
  INTO target_member
  FROM public.members AS members
  WHERE members.id = invitation_member_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'unavailable';
    RETURN;
  END IF;

  SELECT invitations.*
  INTO invitation_record
  FROM public.student_account_invitations AS invitations
  WHERE invitations.token_hash = encode(
    extensions.digest(plain_token, 'sha256'),
    'hex'
  )
    AND invitations.member_id = invitation_member_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'invalid';
    RETURN;
  END IF;

  IF invitation_record.used_at IS NOT NULL THEN
    IF target_member.auth_user_id = current_user_id
      AND target_member.role = 'student'
      AND target_member.email IS NOT NULL
      AND lower(btrim(target_member.email)) = invitation_record.email_normalized
      AND normalized_authenticated_email = invitation_record.email_normalized
    THEN
      RETURN QUERY SELECT true, 'already_activated';
    ELSE
      RETURN QUERY SELECT false, 'used';
    END IF;
    RETURN;
  END IF;

  IF invitation_record.revoked_at IS NOT NULL THEN
    RETURN QUERY SELECT false, 'revoked';
    RETURN;
  END IF;

  IF invitation_record.expires_at <= now() THEN
    RETURN QUERY SELECT false, 'expired';
    RETURN;
  END IF;

  IF normalized_authenticated_email <> invitation_record.email_normalized THEN
    RETURN QUERY SELECT false, 'email_mismatch';
    RETURN;
  END IF;

  IF lower(btrim(target_member.status)) <> 'activo' THEN
    RETURN QUERY SELECT false, 'member_inactive';
    RETURN;
  END IF;

  IF target_member.email IS NULL
    OR lower(btrim(target_member.email)) <> invitation_record.email_normalized
  THEN
    RETURN QUERY SELECT false, 'unavailable';
    RETURN;
  END IF;

  IF target_member.auth_user_id IS NOT NULL THEN
    RETURN QUERY SELECT false, 'already_linked';
    RETURN;
  END IF;

  IF target_member.role NOT IN ('member', 'student') THEN
    RETURN QUERY SELECT false, 'role_not_eligible';
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.members AS linked_members
    WHERE linked_members.auth_user_id = current_user_id
      AND linked_members.id <> target_member.id
  ) THEN
    RETURN QUERY SELECT false, 'already_linked';
    RETURN;
  END IF;

  UPDATE public.members AS members
  SET
    auth_user_id = current_user_id,
    role = 'student'
  WHERE members.id = target_member.id;

  UPDATE public.student_account_invitations AS invitations
  SET
    used_at = now(),
    updated_at = now()
  WHERE invitations.id = invitation_record.id;

  RETURN QUERY SELECT true, 'activated';
END;
$function$;

CREATE OR REPLACE FUNCTION public.revoke_student_invitation(
  invitation_id uuid
)
RETURNS TABLE (
  success boolean,
  result_code text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  current_user_id uuid := auth.uid();
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Se requiere una sesión autenticada.';
  END IF;

  IF NOT (
    public.has_app_permission('members.manage')
    OR public.has_app_permission('roles.manage')
  ) THEN
    RAISE EXCEPTION 'No tienes permiso para revocar invitaciones.';
  END IF;

  UPDATE public.student_account_invitations AS invitations
  SET
    revoked_at = now(),
    updated_at = now()
  WHERE invitations.id = invitation_id
    AND invitations.used_at IS NULL
    AND invitations.revoked_at IS NULL;

  IF FOUND THEN
    RETURN QUERY SELECT true, 'revoked';
  ELSE
    RETURN QUERY SELECT false, 'not_revocable';
  END IF;
END;
$function$;

-- Defensa en profundidad: no se permite acceso directo desde clientes.
REVOKE ALL ON TABLE public.student_account_invitations FROM PUBLIC;
REVOKE ALL ON TABLE public.student_account_invitations FROM anon;
REVOKE ALL ON TABLE public.student_account_invitations FROM authenticated;

REVOKE ALL ON FUNCTION public.create_student_invitation(bigint, interval)
  FROM PUBLIC;
REVOKE ALL ON FUNCTION public.list_student_invitations(bigint)
  FROM PUBLIC;
REVOKE ALL ON FUNCTION public.validate_student_invitation(text)
  FROM PUBLIC;
REVOKE ALL ON FUNCTION public.consume_student_invitation(text)
  FROM PUBLIC;
REVOKE ALL ON FUNCTION public.revoke_student_invitation(uuid)
  FROM PUBLIC;

-- Normaliza ACL heredadas: anon solo puede validar invitaciones.
REVOKE EXECUTE ON FUNCTION public.create_student_invitation(bigint, interval)
  FROM anon;
REVOKE EXECUTE ON FUNCTION public.list_student_invitations(bigint)
  FROM anon;
REVOKE EXECUTE ON FUNCTION public.consume_student_invitation(text)
  FROM anon;
REVOKE EXECUTE ON FUNCTION public.revoke_student_invitation(uuid)
  FROM anon;

GRANT EXECUTE ON FUNCTION public.create_student_invitation(bigint, interval)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_student_invitations(bigint)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_student_invitation(text)
  TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_student_invitation(text)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_student_invitation(uuid)
  TO authenticated;

COMMENT ON TABLE public.student_account_invitations IS
  'Invitaciones de un solo uso para vincular cuentas confirmadas con integrantes alumnos.';

COMMENT ON FUNCTION public.create_student_invitation(bigint, interval) IS
  'Genera una invitación con 256 bits de entropía, devuelve el token una sola vez y almacena únicamente su hash SHA-256.';

COMMENT ON FUNCTION public.list_student_invitations(bigint) IS
  'Lista metadatos administrativos de invitaciones sin exponer tokens, hashes ni identificadores de autenticación.';

COMMENT ON FUNCTION public.validate_student_invitation(text) IS
  'Valida públicamente una invitación sin exponer identificadores ni el hash del token.';

COMMENT ON FUNCTION public.consume_student_invitation(text) IS
  'Consume atómicamente una invitación y vincula auth.uid() como student.';

COMMENT ON FUNCTION public.revoke_student_invitation(uuid) IS
  'Revoca una invitación no utilizada sin borrar su historial.';

/*
 * Las funciones SECURITY DEFINER quedan bajo el propietario que ejecute esta
 * migración. Debe ser un rol administrativo confiable del proyecto. PUBLIC no
 * conserva EXECUTE y los grants explícitos anteriores son la lista completa de
 * acceso desde la API.
 */

COMMIT;

/*
 * ROLLBACK MANUAL - NO EJECUTAR AUTOMÁTICAMENTE
 *
 * -- Restaurar el trigger histórico:
 * CREATE TRIGGER on_auth_user_created_create_member
 *   AFTER INSERT ON auth.users
 *   FOR EACH ROW
 *   EXECUTE FUNCTION public.handle_new_member_user();
 *
 * -- Retirar la infraestructura nueva:
 * REVOKE ALL ON FUNCTION public.revoke_student_invitation(uuid) FROM authenticated;
 * REVOKE ALL ON FUNCTION public.consume_student_invitation(text) FROM authenticated;
 * REVOKE ALL ON FUNCTION public.validate_student_invitation(text) FROM anon, authenticated;
 * REVOKE ALL ON FUNCTION public.list_student_invitations(bigint) FROM authenticated;
 * REVOKE ALL ON FUNCTION public.create_student_invitation(bigint, interval) FROM authenticated;
 * DROP FUNCTION IF EXISTS public.revoke_student_invitation(uuid);
 * DROP FUNCTION IF EXISTS public.consume_student_invitation(text);
 * DROP FUNCTION IF EXISTS public.validate_student_invitation(text);
 * DROP FUNCTION IF EXISTS public.list_student_invitations(bigint);
 * DROP FUNCTION IF EXISTS public.create_student_invitation(bigint, interval);
 * DROP TABLE IF EXISTS public.student_account_invitations;
 *
 * -- Solo si se desea restaurar exactamente el conjunto histórico de roles:
 * ALTER TABLE public.members DROP CONSTRAINT IF EXISTS members_role_check;
 * ALTER TABLE public.members
 *   ADD CONSTRAINT members_role_check CHECK (role IN ('admin', 'member'));
 */
