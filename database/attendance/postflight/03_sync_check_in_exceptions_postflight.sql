-- SCRIPT DE DIAGNOSTICO DE SOLO LECTURA - NO MODIFICA DATOS

DO $postflight$
DECLARE
  target_function oid := pg_catalog.to_regprocedure(
    'public.sync_attendance_session_check_in_exceptions(uuid,jsonb)'
  )::oid;
  function_record record;
  definition_normalized text;
  delete_position integer;
  insert_position integer;
BEGIN
  IF target_function IS NULL THEN
    RAISE EXCEPTION
      'Postflight attendance 03: falta la firma sync...(uuid, jsonb).';
  END IF;

  SELECT
    functions.proargnames,
    functions.prorettype,
    languages.lanname,
    functions.prosecdef,
    functions.proconfig,
    pg_catalog.pg_get_userbyid(functions.proowner) AS owner_name,
    functions.prosrc
  INTO STRICT function_record
  FROM pg_catalog.pg_proc AS functions
  JOIN pg_catalog.pg_language AS languages
    ON languages.oid = functions.prolang
  WHERE functions.oid = target_function;

  IF function_record.proargnames IS DISTINCT FROM
      ARRAY['p_session_id', 'p_exceptions']::text[]
    OR function_record.prorettype <> 'void'::pg_catalog.regtype
    OR function_record.lanname <> 'plpgsql'
    OR NOT function_record.prosecdef
    OR function_record.proconfig IS DISTINCT FROM
      ARRAY['search_path=""']::text[]
    OR function_record.owner_name <> 'postgres'
  THEN
    RAISE EXCEPTION
      'Postflight attendance 03: firma, seguridad, owner o configuracion no coinciden.';
  END IF;

  IF pg_catalog.has_function_privilege('anon', target_function, 'EXECUTE')
    OR NOT pg_catalog.has_function_privilege(
      'authenticated', target_function, 'EXECUTE'
    )
    OR NOT pg_catalog.has_function_privilege(
      'postgres', target_function, 'EXECUTE'
    )
    OR EXISTS (
      SELECT 1
      FROM pg_catalog.pg_proc AS functions
      CROSS JOIN LATERAL pg_catalog.aclexplode(
        COALESCE(
          functions.proacl,
          pg_catalog.acldefault('f', functions.proowner)
        )
      ) AS grants
      WHERE functions.oid = target_function
        AND grants.grantee = 0
        AND grants.privilege_type = 'EXECUTE'
    )
  THEN
    RAISE EXCEPTION
      'Postflight attendance 03: grants EXECUTE no coinciden.';
  END IF;

  definition_normalized := pg_catalog.regexp_replace(
    pg_catalog.lower(function_record.prosrc),
    '[[:space:]]+',
    ' ',
    'g'
  );

  delete_position := pg_catalog.strpos(
    definition_normalized,
    'delete from public.attendance_session_check_in_exceptions'
  );
  insert_position := pg_catalog.strpos(
    definition_normalized,
    'insert into public.attendance_session_check_in_exceptions'
  );

  IF pg_catalog.strpos(
      definition_normalized,
      'public.has_app_permission(''attendance.manage'')'
    ) = 0
    OR pg_catalog.strpos(
      definition_normalized,
      'from public.attendance_sessions as sessions'
    ) = 0
    OR pg_catalog.strpos(definition_normalized, 'for update') = 0
    OR pg_catalog.strpos(
      definition_normalized,
      'create temp table selected_exceptions'
    ) = 0
    OR pg_catalog.strpos(
      definition_normalized,
      'member_id bigint primary key'
    ) = 0
    OR pg_catalog.strpos(definition_normalized, 'unique_violation') = 0
    OR pg_catalog.strpos(
      definition_normalized,
      'left join public.members as members'
    ) = 0
    OR pg_catalog.strpos(
      definition_normalized,
      'lower(btrim(members.status)) = ''activo'''
    ) = 0
    OR pg_catalog.strpos(
      definition_normalized,
      'char_length(selected.reason) > 250'
    ) = 0
    OR delete_position = 0
    OR insert_position = 0
    OR delete_position >= insert_position
  THEN
    RAISE EXCEPTION
      'Postflight attendance 03: validaciones o sincronizacion atomica no coinciden.';
  END IF;
END;
$postflight$;

SELECT
  '03_sync_check_in_exceptions' AS postflight_section,
  true AS approved,
  'Postflight attendance 03 aprobado: RPC segura, validada y atomica.' AS result;
