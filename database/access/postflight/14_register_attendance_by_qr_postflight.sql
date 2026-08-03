-- SCRIPT DE DIAGNOSTICO DE SOLO LECTURA - NO MODIFICA DATOS
-- Valida contrato, seguridad e integridad servidor-side de la RPC del Modo Ensayo.

DO $postflight$
DECLARE
  target_function pg_catalog.pg_proc%ROWTYPE;
  target_function_oid oid;
  target_definition text;
  target_definition_lower text;
  attendance_sessions_oid oid;
  attendance_records_oid oid;
BEGIN
  target_function_oid := pg_catalog.to_regprocedure(
    'public.register_attendance_by_qr(text)'
  )::oid;

  IF target_function_oid IS NULL THEN
    RAISE EXCEPTION
      'Postflight 14: falta public.register_attendance_by_qr(text).';
  END IF;

  SELECT functions.*
  INTO STRICT target_function
  FROM pg_catalog.pg_proc AS functions
  WHERE functions.oid = target_function_oid;

  IF pg_catalog.pg_get_function_identity_arguments(target_function.oid)
    <> 'qr_token text'
  THEN
    RAISE EXCEPTION
      'Postflight 14: la firma debe declarar exactamente qr_token text.';
  END IF;

  IF NOT target_function.proretset
    OR target_function.prorettype <> 'record'::pg_catalog.regtype
    OR target_function.proallargtypes IS DISTINCT FROM ARRAY[
      'text'::pg_catalog.regtype::oid,
      'boolean'::pg_catalog.regtype::oid,
      'text'::pg_catalog.regtype::oid,
      'text'::pg_catalog.regtype::oid,
      'timestamptz'::pg_catalog.regtype::oid,
      'text'::pg_catalog.regtype::oid,
      'text'::pg_catalog.regtype::oid
    ]::oid[]
    OR target_function.proargmodes IS DISTINCT FROM ARRAY[
      'i'::"char",
      't'::"char",
      't'::"char",
      't'::"char",
      't'::"char",
      't'::"char",
      't'::"char"
    ]::"char"[]
    OR target_function.proargnames IS DISTINCT FROM ARRAY[
      'qr_token',
      'success',
      'result_code',
      'attendance_status',
      'checked_in_at',
      'session_title',
      'member_display_name'
    ]::text[]
  THEN
    RAISE EXCEPTION
      'Postflight 14: el retorno TABLE no coincide con el contrato de seis columnas.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.unnest(
      target_function.proargnames[1:target_function.pronargs]
    ) AS input_arguments(argument_name)
    WHERE input_arguments.argument_name IN (
      'member_id',
      'session_id',
      'status',
      'checked_in_at'
    )
  ) THEN
    RAISE EXCEPTION
      'Postflight 14: la RPC recibe un parametro controlado que debe determinar el servidor.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_language AS languages
    WHERE languages.oid = target_function.prolang
      AND languages.lanname = 'plpgsql'
  ) THEN
    RAISE EXCEPTION
      'Postflight 14: la funcion debe usar LANGUAGE plpgsql.';
  END IF;

  IF NOT target_function.prosecdef THEN
    RAISE EXCEPTION
      'Postflight 14: la funcion debe ser SECURITY DEFINER.';
  END IF;

  IF pg_catalog.pg_get_userbyid(target_function.proowner) <> 'postgres' THEN
    RAISE EXCEPTION
      'Postflight 14: el propietario debe ser postgres.';
  END IF;

  IF NOT COALESCE(
    target_function.proconfig @> ARRAY['search_path=""']::text[],
    false
  ) THEN
    RAISE EXCEPTION
      'Postflight 14: proconfig debe contener search_path="".';
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
      'Postflight 14: PUBLIC no debe tener EXECUTE.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_roles AS roles
    WHERE roles.rolname = 'anon'
  ) THEN
    RAISE EXCEPTION 'Postflight 14: no existe el rol anon.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_roles AS roles
    WHERE roles.rolname = 'authenticated'
  ) THEN
    RAISE EXCEPTION 'Postflight 14: no existe el rol authenticated.';
  END IF;

  IF pg_catalog.has_function_privilege(
    'anon',
    target_function.oid,
    'EXECUTE'
  ) THEN
    RAISE EXCEPTION
      'Postflight 14: anon no debe tener EXECUTE.';
  END IF;

  IF NOT pg_catalog.has_function_privilege(
    'authenticated',
    target_function.oid,
    'EXECUTE'
  ) THEN
    RAISE EXCEPTION
      'Postflight 14: authenticated debe tener EXECUTE.';
  END IF;

  target_definition := pg_catalog.pg_get_functiondef(target_function.oid);
  target_definition_lower := pg_catalog.lower(target_definition);

  IF pg_catalog.strpos(target_definition_lower, 'auth.uid()') = 0 THEN
    RAISE EXCEPTION
      'Postflight 14: falta el uso de auth.uid().';
  END IF;

  IF pg_catalog.strpos(
    target_definition_lower,
    'public.has_app_permission'
  ) = 0 THEN
    RAISE EXCEPTION
      'Postflight 14: falta el uso de public.has_app_permission().';
  END IF;

  IF pg_catalog.strpos(target_definition_lower, 'public.members') = 0 THEN
    RAISE EXCEPTION
      'Postflight 14: falta la referencia calificada public.members.';
  END IF;

  IF pg_catalog.strpos(
    target_definition_lower,
    'public.attendance_sessions'
  ) = 0 THEN
    RAISE EXCEPTION
      'Postflight 14: falta la referencia calificada public.attendance_sessions.';
  END IF;

  IF pg_catalog.strpos(
    target_definition_lower,
    'public.attendance_records'
  ) = 0 THEN
    RAISE EXCEPTION
      'Postflight 14: falta la referencia calificada public.attendance_records.';
  END IF;

  IF pg_catalog.strpos(target_definition_lower, 'now()') = 0 THEN
    RAISE EXCEPTION
      'Postflight 14: falta el uso de now() como hora del servidor.';
  END IF;

  IF pg_catalog.strpos(target_definition_lower, 'on conflict') = 0 THEN
    RAISE EXCEPTION
      'Postflight 14: falta ON CONFLICT para resolver concurrencia.';
  END IF;

  IF pg_catalog.strpos(
    target_definition_lower,
    'calculated_status := ''present'''
  ) = 0
    OR pg_catalog.strpos(
      target_definition_lower,
      'calculated_status := ''late'''
    ) = 0
  THEN
    RAISE EXCEPTION
      'Postflight 14: status debe calcularse como present o late en el servidor.';
  END IF;

  IF target_definition_lower !~
    'check_in_time[[:space:]]+timestamptz[[:space:]]*:=[[:space:]]*now\(\)'
  THEN
    RAISE EXCEPTION
      'Postflight 14: checked_in_at debe derivarse de una hora servidor capturada con now().';
  END IF;

  IF target_definition_lower !~
    'calculated_status,[[:space:]]*''qr'',[[:space:]]*check_in_time'
  THEN
    RAISE EXCEPTION
      'Postflight 14: INSERT debe fijar status calculado, check_in_method qr y hora servidor.';
  END IF;

  IF target_definition_lower ~
    '(insert[[:space:]]+into|update|delete[[:space:]]+from|truncate([[:space:]]+table)?)[[:space:]]+public\.attendance_sessions'
  THEN
    RAISE EXCEPTION
      'Postflight 14: la funcion no debe modificar public.attendance_sessions.';
  END IF;

  IF pg_catalog.strpos(target_definition_lower, '''absent''') > 0 THEN
    RAISE EXCEPTION
      'Postflight 14: la funcion no debe crear registros absent.';
  END IF;

  IF target_definition_lower ~
    '(create|alter|drop)[[:space:]]+policy|alter[[:space:]]+table[^;]*(enable|disable|force|no[[:space:]]+force)[[:space:]]+row[[:space:]]+level[[:space:]]+security'
  THEN
    RAISE EXCEPTION
      'Postflight 14: la definicion no debe contener cambios de politicas RLS.';
  END IF;

  attendance_sessions_oid := pg_catalog.to_regclass(
    'public.attendance_sessions'
  )::oid;

  IF attendance_sessions_oid IS NULL THEN
    RAISE EXCEPTION
      'Postflight 14: falta la tabla public.attendance_sessions.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class AS relations
    WHERE relations.oid = attendance_sessions_oid
      AND relations.relkind IN ('r', 'p')
      AND relations.relrowsecurity
  ) THEN
    RAISE EXCEPTION
      'Postflight 14: public.attendance_sessions debe ser una tabla con RLS habilitado.';
  END IF;

  attendance_records_oid := pg_catalog.to_regclass(
    'public.attendance_records'
  )::oid;

  IF attendance_records_oid IS NULL THEN
    RAISE EXCEPTION
      'Postflight 14: falta la tabla public.attendance_records.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class AS relations
    WHERE relations.oid = attendance_records_oid
      AND relations.relkind IN ('r', 'p')
      AND relations.relrowsecurity
  ) THEN
    RAISE EXCEPTION
      'Postflight 14: public.attendance_records debe ser una tabla con RLS habilitado.';
  END IF;
END;
$postflight$;

SELECT
  '14_register_attendance_by_qr' AS postflight_section,
  true AS approved,
  'Postflight 14 aprobado: contrato, seguridad, integridad servidor-side y RLS preservados.'
    AS result;
