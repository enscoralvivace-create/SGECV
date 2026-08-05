-- SCRIPT DE DIAGNOSTICO DE SOLO LECTURA - NO MODIFICA DATOS
-- Verifica metadatos, ACL y orden funcional de has_app_permission(text).

DO $postflight$
DECLARE
  target_function oid := pg_catalog.to_regprocedure(
    'public.has_app_permission(text)'
  )::oid;
  function_record record;
  definition_normalized text;
  active_check_position integer;
  inactive_return_position integer;
  override_query_position integer;
  override_return_position integer;
  role_fallback_position integer;
BEGIN
  IF target_function IS NULL THEN
    RAISE EXCEPTION
      'Postflight access 16: falta public.has_app_permission(text).';
  END IF;

  SELECT
    functions.proargnames,
    functions.prorettype,
    languages.lanname,
    functions.provolatile,
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
      ARRAY['requested_permission']::text[]
    OR function_record.prorettype <> 'boolean'::pg_catalog.regtype
    OR function_record.lanname <> 'plpgsql'
    OR function_record.provolatile <> 's'
    OR NOT function_record.prosecdef
    OR function_record.proconfig IS DISTINCT FROM
      ARRAY['search_path=""']::text[]
    OR function_record.owner_name <> 'postgres'
  THEN
    RAISE EXCEPTION
      'Postflight access 16: firma o metadatos de la funcion no coinciden.';
  END IF;

  IF pg_catalog.to_regprocedure(
      'public.current_member_is_active()'
    ) IS NULL
    OR pg_catalog.to_regprocedure(
      'public.role_has_permission(text)'
    ) IS NULL
    OR pg_catalog.to_regclass(
      'public.member_permission_overrides'
    ) IS NULL
  THEN
    RAISE EXCEPTION
      'Postflight access 16: faltan dependencias funcionales requeridas.';
  END IF;

  definition_normalized := pg_catalog.regexp_replace(
    pg_catalog.lower(function_record.prosrc),
    '[[:space:]]+',
    ' ',
    'g'
  );

  active_check_position := pg_catalog.strpos(
    definition_normalized,
    'public.current_member_is_active()'
  );
  inactive_return_position := pg_catalog.strpos(
    definition_normalized,
    'return false'
  );
  override_query_position := pg_catalog.strpos(
    definition_normalized,
    'from public.member_permission_overrides'
  );
  override_return_position := pg_catalog.strpos(
    definition_normalized,
    'if found then return override_value'
  );
  role_fallback_position := pg_catalog.strpos(
    definition_normalized,
    'return public.role_has_permission'
  );

  IF active_check_position = 0
    OR inactive_return_position = 0
    OR override_query_position = 0
    OR pg_catalog.strpos(definition_normalized, 'mpo.is_granted') = 0
    OR pg_catalog.strpos(
      definition_normalized,
      'mpo.auth_user_id = auth.uid()'
    ) = 0
    OR pg_catalog.strpos(
      definition_normalized,
      'mpo.permission = requested_permission'
    ) = 0
    OR pg_catalog.strpos(definition_normalized, 'limit 1') = 0
    OR override_return_position = 0
    OR role_fallback_position = 0
    OR NOT (
      active_check_position < inactive_return_position
      AND inactive_return_position < override_query_position
      AND override_query_position < override_return_position
      AND override_return_position < role_fallback_position
    )
  THEN
    RAISE EXCEPTION
      'Postflight access 16: comportamiento u orden de evaluacion no coinciden.';
  END IF;

  IF NOT pg_catalog.has_function_privilege(
      'anon', target_function, 'EXECUTE'
    )
    OR NOT pg_catalog.has_function_privilege(
      'authenticated', target_function, 'EXECUTE'
    )
    OR NOT pg_catalog.has_function_privilege(
      'postgres', target_function, 'EXECUTE'
    )
    OR NOT pg_catalog.has_function_privilege(
      'service_role', target_function, 'EXECUTE'
    )
  THEN
    RAISE EXCEPTION
      'Postflight access 16: faltan grants EXECUTE o PUBLIC conserva acceso.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_proc AS functions
    CROSS JOIN LATERAL pg_catalog.aclexplode(
      COALESCE(
        functions.proacl,
        pg_catalog.acldefault('f', functions.proowner)
      )
    ) AS grants
    WHERE functions.oid = target_function
      AND grants.privilege_type = 'EXECUTE'
      AND grants.grantee NOT IN (
        SELECT roles.oid
        FROM pg_catalog.pg_roles AS roles
        WHERE roles.rolname IN (
          'anon', 'authenticated', 'postgres', 'service_role'
        )
      )
  ) OR EXISTS (
    SELECT 1
    FROM pg_catalog.pg_proc AS functions
    CROSS JOIN LATERAL pg_catalog.aclexplode(
      COALESCE(
        functions.proacl,
        pg_catalog.acldefault('f', functions.proowner)
      )
    ) AS grants
    JOIN pg_catalog.pg_roles AS roles
      ON roles.oid = grants.grantee
    WHERE functions.oid = target_function
      AND grants.privilege_type = 'EXECUTE'
      AND roles.rolname IN ('anon', 'authenticated', 'service_role')
      AND grants.is_grantable
  ) THEN
    RAISE EXCEPTION
      'Postflight access 16: los ACL EXECUTE no coinciden exactamente.';
  END IF;
END;
$postflight$;

SELECT
  '16_version_has_app_permission' AS postflight_section,
  true AS approved,
  'Postflight access 16 aprobado: definicion, metadatos y grants canonicos.'
    AS result;
