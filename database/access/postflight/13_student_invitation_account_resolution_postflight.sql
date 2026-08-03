-- SCRIPT DE DIAGNOSTICO DE SOLO LECTURA - NO MODIFICA DATOS
-- Valida definicion, seguridad y preservacion de RPC de la resolucion RC-3.4.

DO $postflight$
DECLARE
  target_function pg_catalog.pg_proc%ROWTYPE;
  target_function_oid oid;
  target_definition text;
  signup_function_oid oid;
  consume_function_oid oid;
BEGIN
  target_function_oid := pg_catalog.to_regprocedure(
    'public.resolve_student_invitation_account_state(text)'
  )::oid;

  IF target_function_oid IS NULL THEN
    RAISE EXCEPTION
      'Postflight 13: falta public.resolve_student_invitation_account_state(text).';
  END IF;

  SELECT functions.*
  INTO STRICT target_function
  FROM pg_catalog.pg_proc AS functions
  WHERE functions.oid = target_function_oid;

  IF pg_catalog.pg_get_function_identity_arguments(target_function.oid)
    <> 'plain_token text'
  THEN
    RAISE EXCEPTION
      'Postflight 13: la firma debe declarar exactamente plain_token text.';
  END IF;

  IF NOT target_function.proretset
    OR target_function.prorettype <> 'record'::pg_catalog.regtype
    OR target_function.proallargtypes IS DISTINCT FROM ARRAY[
      'text'::pg_catalog.regtype::oid,
      'text'::pg_catalog.regtype::oid,
      'text'::pg_catalog.regtype::oid
    ]::oid[]
    OR target_function.proargmodes IS DISTINCT FROM ARRAY[
      'i'::"char",
      't'::"char",
      't'::"char"
    ]::"char"[]
    OR target_function.proargnames IS DISTINCT FROM ARRAY[
      'plain_token',
      'email_normalized',
      'account_state'
    ]::text[]
  THEN
    RAISE EXCEPTION
      'Postflight 13: el retorno debe ser TABLE(email_normalized text, account_state text).';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_language AS languages
    WHERE languages.oid = target_function.prolang
      AND languages.lanname = 'plpgsql'
  ) THEN
    RAISE EXCEPTION
      'Postflight 13: la funcion debe usar LANGUAGE plpgsql.';
  END IF;

  IF NOT target_function.prosecdef THEN
    RAISE EXCEPTION
      'Postflight 13: la funcion debe ser SECURITY DEFINER.';
  END IF;

  IF pg_catalog.pg_get_userbyid(target_function.proowner) <> 'postgres' THEN
    RAISE EXCEPTION
      'Postflight 13: el propietario debe ser postgres.';
  END IF;

  IF NOT COALESCE(
    target_function.proconfig @> ARRAY['search_path=""']::text[],
    false
  ) THEN
    RAISE EXCEPTION
      'Postflight 13: proconfig debe contener search_path="".';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.aclexplode(
      COALESCE(
        target_function.proacl,
        pg_catalog.acldefault('f', target_function.proowner)
      )
    ) AS privileges
    WHERE privileges.grantee = 0
      AND privileges.privilege_type = 'EXECUTE'
  ) THEN
    RAISE EXCEPTION
      'Postflight 13: PUBLIC no debe tener EXECUTE.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_roles AS roles
    WHERE roles.rolname = 'anon'
  ) THEN
    RAISE EXCEPTION 'Postflight 13: no existe el rol anon.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_roles AS roles
    WHERE roles.rolname = 'authenticated'
  ) THEN
    RAISE EXCEPTION 'Postflight 13: no existe el rol authenticated.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_roles AS roles
    WHERE roles.rolname = 'service_role'
  ) THEN
    RAISE EXCEPTION 'Postflight 13: no existe el rol service_role.';
  END IF;

  IF pg_catalog.has_function_privilege(
    'anon',
    target_function.oid,
    'EXECUTE'
  ) THEN
    RAISE EXCEPTION
      'Postflight 13: anon no debe tener EXECUTE.';
  END IF;

  IF pg_catalog.has_function_privilege(
    'authenticated',
    target_function.oid,
    'EXECUTE'
  ) THEN
    RAISE EXCEPTION
      'Postflight 13: authenticated no debe tener EXECUTE.';
  END IF;

  IF NOT pg_catalog.has_function_privilege(
    'service_role',
    target_function.oid,
    'EXECUTE'
  ) THEN
    RAISE EXCEPTION
      'Postflight 13: service_role debe tener EXECUTE.';
  END IF;

  target_definition := pg_catalog.pg_get_functiondef(target_function.oid);

  IF pg_catalog.strpos(
    target_definition,
    'public.student_account_invitations'
  ) = 0 THEN
    RAISE EXCEPTION
      'Postflight 13: falta la referencia calificada public.student_account_invitations.';
  END IF;

  IF pg_catalog.strpos(target_definition, 'public.members') = 0 THEN
    RAISE EXCEPTION
      'Postflight 13: falta la referencia calificada public.members.';
  END IF;

  IF pg_catalog.strpos(target_definition, 'auth.users') = 0 THEN
    RAISE EXCEPTION
      'Postflight 13: falta la referencia calificada auth.users.';
  END IF;

  IF pg_catalog.strpos(target_definition, 'extensions.digest') = 0 THEN
    RAISE EXCEPTION
      'Postflight 13: falta la referencia calificada extensions.digest.';
  END IF;

  signup_function_oid := pg_catalog.to_regprocedure(
    'public.resolve_student_invitation_for_signup(text)'
  )::oid;

  IF signup_function_oid IS NULL THEN
    RAISE EXCEPTION
      'Postflight 13: la RPC preservada resolve_student_invitation_for_signup(text) no existe.';
  END IF;

  IF pg_catalog.pg_get_function_identity_arguments(signup_function_oid)
      <> 'plain_token text'
    OR pg_catalog.pg_get_function_result(signup_function_oid)
      <> 'TABLE(email_normalized text)'
  THEN
    RAISE EXCEPTION
      'Postflight 13: resolve_student_invitation_for_signup(text) no conserva su contrato.';
  END IF;

  consume_function_oid := pg_catalog.to_regprocedure(
    'public.consume_student_invitation(text)'
  )::oid;

  IF consume_function_oid IS NULL THEN
    RAISE EXCEPTION
      'Postflight 13: la RPC preservada consume_student_invitation(text) no existe.';
  END IF;

  IF pg_catalog.pg_get_function_identity_arguments(consume_function_oid)
      <> 'plain_token text'
    OR pg_catalog.pg_get_function_result(consume_function_oid)
      <> 'TABLE(success boolean, result_code text)'
  THEN
    RAISE EXCEPTION
      'Postflight 13: consume_student_invitation(text) no conserva su contrato.';
  END IF;
END;
$postflight$;

SELECT
  '13_student_invitation_account_resolution' AS postflight_section,
  true AS approved,
  'Postflight 13 aprobado: definicion, seguridad, referencias y RPC preservadas.'
    AS result;
