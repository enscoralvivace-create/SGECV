-- POSTFLIGHT ESTRICTAMENTE DE SOLO LECTURA.

DO $postflight$
DECLARE
  function_oid oid := pg_catalog.to_regprocedure(
    'public.consume_student_invitation(text)'
  )::oid;
  postgres_role oid := (
    SELECT oid FROM pg_catalog.pg_roles WHERE rolname = 'postgres'
  );
  anon_role oid := (
    SELECT oid FROM pg_catalog.pg_roles WHERE rolname = 'anon'
  );
  authenticated_role oid := (
    SELECT oid FROM pg_catalog.pg_roles WHERE rolname = 'authenticated'
  );
BEGIN
  IF function_oid IS NULL THEN
    RAISE EXCEPTION 'Postflight access 17: falta consume_student_invitation(text).';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_proc AS functions
    JOIN pg_catalog.pg_language AS languages ON languages.oid = functions.prolang
    WHERE functions.oid = function_oid
      AND functions.proowner = postgres_role
      AND functions.prosecdef
      AND functions.provolatile = 'v'
      AND functions.proconfig IS NOT DISTINCT FROM ARRAY['search_path=""']::text[]
      AND languages.lanname = 'plpgsql'
      AND pg_catalog.pg_get_function_identity_arguments(functions.oid) = 'plain_token text'
      AND pg_catalog.pg_get_function_result(functions.oid)
        = 'TABLE(success boolean, result_code text)'
  ) THEN
    RAISE EXCEPTION 'Postflight access 17: metadatos o firma incorrectos.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc AS functions
    WHERE functions.oid = function_oid
      AND functions.prosrc ~ 'target_member\.role IN \(''member'', ''student''\)'
      AND functions.prosrc ~ 'target_member\.role NOT IN \(''member'', ''student''\)'
      AND functions.prosrc ~ 'SET auth_user_id = current_user_id'
      AND functions.prosrc !~ 'role[[:space:]]*=[[:space:]]*''student'''
      AND functions.prosrc ~ 'used_at = now\(\), updated_at = now\(\)'
  ) THEN
    RAISE EXCEPTION 'Postflight access 17: la función no conserva el rol o perdió el consumo atómico.';
  END IF;

  IF pg_catalog.has_function_privilege(anon_role, function_oid, 'EXECUTE')
    OR NOT pg_catalog.has_function_privilege(
      authenticated_role, function_oid, 'EXECUTE'
    )
  THEN
    RAISE EXCEPTION 'Postflight access 17: ACL de ejecución incorrecta.';
  END IF;
END;
$postflight$;

SELECT
  '17_fix_consume_student_invitation_role' AS postflight_section,
  true AS approved,
  'Postflight aprobado: firma, seguridad, rol conservado y ACL verificados.' AS result;
