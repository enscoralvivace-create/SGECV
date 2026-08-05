-- DIAGNOSTICO ESTRICTAMENTE DE SOLO LECTURA. NO MODIFICA DATOS NI ESQUEMA.

DO $postflight$
DECLARE
  feedback_table oid := pg_catalog.to_regclass('public.pilot_feedback')::oid;
  feedback_sequence oid;
  submit_function oid := pg_catalog.to_regprocedure(
    'public.submit_pilot_feedback(text,text,text,text,text)'
  )::oid;
  list_function oid := pg_catalog.to_regprocedure(
    'public.list_pilot_feedback(text,integer)'
  )::oid;
  summary_function oid := pg_catalog.to_regprocedure(
    'public.get_pilot_feedback_summary()'
  )::oid;
  postgres_role oid := (
    SELECT roles.oid FROM pg_catalog.pg_roles AS roles
    WHERE roles.rolname = 'postgres'
  );
  anon_role oid := (
    SELECT roles.oid FROM pg_catalog.pg_roles AS roles
    WHERE roles.rolname = 'anon'
  );
  authenticated_role oid := (
    SELECT roles.oid FROM pg_catalog.pg_roles AS roles
    WHERE roles.rolname = 'authenticated'
  );
  service_role oid := (
    SELECT roles.oid FROM pg_catalog.pg_roles AS roles
    WHERE roles.rolname = 'service_role'
  );
  id_attnum smallint;
  auth_user_attnum smallint;
  member_attnum smallint;
  category_attnum smallint;
  created_at_attnum smallint;
  auth_users_id_attnum smallint;
  members_id_attnum smallint;
  normalized_expression text;
  target_function record;
BEGIN
  IF feedback_table IS NULL THEN
    RAISE EXCEPTION 'Postflight feedback 01: falta public.pilot_feedback.';
  END IF;

  IF postgres_role IS NULL OR anon_role IS NULL OR authenticated_role IS NULL
    OR service_role IS NULL
  THEN
    RAISE EXCEPTION 'Postflight feedback 01: faltan roles requeridos.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class AS relations
    WHERE relations.oid = feedback_table
      AND relations.relkind IN ('r', 'p')
      AND relations.relowner = postgres_role
  ) THEN
    RAISE EXCEPTION 'Postflight feedback 01: tipo de relacion o propietario incorrecto.';
  END IF;

  IF (
    SELECT count(*)
    FROM pg_catalog.pg_attribute AS attributes
    WHERE attributes.attrelid = feedback_table
      AND attributes.attnum > 0
      AND NOT attributes.attisdropped
  ) <> 9 THEN
    RAISE EXCEPTION 'Postflight feedback 01: la tabla no tiene exactamente 9 columnas.';
  END IF;

  IF EXISTS (
    WITH expected(column_name, type_oid, is_not_null, identity_kind) AS (
      VALUES
        ('id', 'bigint'::pg_catalog.regtype::oid, true, 'd'),
        ('auth_user_id', 'uuid'::pg_catalog.regtype::oid, true, ''),
        ('member_id', 'bigint'::pg_catalog.regtype::oid, false, ''),
        ('category', 'text'::pg_catalog.regtype::oid, true, ''),
        ('message', 'text'::pg_catalog.regtype::oid, true, ''),
        ('page_path', 'text'::pg_catalog.regtype::oid, false, ''),
        ('app_version', 'text'::pg_catalog.regtype::oid, false, ''),
        ('user_agent', 'text'::pg_catalog.regtype::oid, false, ''),
        ('created_at', 'timestamptz'::pg_catalog.regtype::oid, true, '')
    )
    SELECT 1
    FROM expected
    LEFT JOIN pg_catalog.pg_attribute AS attributes
      ON attributes.attrelid = feedback_table
      AND attributes.attname = expected.column_name
      AND attributes.attnum > 0
      AND NOT attributes.attisdropped
    WHERE attributes.attname IS NULL
      OR attributes.atttypid <> expected.type_oid
      OR attributes.atttypmod <> -1
      OR attributes.attnotnull <> expected.is_not_null
      OR attributes.attidentity::text <> expected.identity_kind
  ) THEN
    RAISE EXCEPTION 'Postflight feedback 01: columnas, tipos, nulabilidad o identity incorrectos.';
  END IF;

  SELECT attributes.attnum INTO STRICT id_attnum
  FROM pg_catalog.pg_attribute AS attributes
  WHERE attributes.attrelid = feedback_table AND attributes.attname = 'id'
    AND attributes.attnum > 0 AND NOT attributes.attisdropped;

  SELECT attributes.attnum INTO STRICT auth_user_attnum
  FROM pg_catalog.pg_attribute AS attributes
  WHERE attributes.attrelid = feedback_table AND attributes.attname = 'auth_user_id'
    AND attributes.attnum > 0 AND NOT attributes.attisdropped;

  SELECT attributes.attnum INTO STRICT member_attnum
  FROM pg_catalog.pg_attribute AS attributes
  WHERE attributes.attrelid = feedback_table AND attributes.attname = 'member_id'
    AND attributes.attnum > 0 AND NOT attributes.attisdropped;

  SELECT attributes.attnum INTO STRICT category_attnum
  FROM pg_catalog.pg_attribute AS attributes
  WHERE attributes.attrelid = feedback_table AND attributes.attname = 'category'
    AND attributes.attnum > 0 AND NOT attributes.attisdropped;

  SELECT attributes.attnum INTO STRICT created_at_attnum
  FROM pg_catalog.pg_attribute AS attributes
  WHERE attributes.attrelid = feedback_table AND attributes.attname = 'created_at'
    AND attributes.attnum > 0 AND NOT attributes.attisdropped;

  IF (
    SELECT count(*)
    FROM pg_catalog.pg_constraint AS constraints
    WHERE constraints.conrelid = feedback_table AND constraints.contype = 'p'
  ) <> 1 OR NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_constraint AS constraints
    WHERE constraints.conrelid = feedback_table
      AND constraints.contype = 'p'
      AND constraints.conkey = ARRAY[id_attnum]::smallint[]
  ) THEN
    RAISE EXCEPTION 'Postflight feedback 01: la PK debe cubrir unicamente id.';
  END IF;

  feedback_sequence := pg_catalog.to_regclass(
    pg_catalog.pg_get_serial_sequence('public.pilot_feedback', 'id')
  )::oid;

  IF feedback_sequence IS NULL OR NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_class AS relations
    WHERE relations.oid = feedback_sequence AND relations.relkind = 'S'
  ) THEN
    RAISE EXCEPTION 'Postflight feedback 01: falta la secuencia identity de id.';
  END IF;

  SELECT attributes.attnum INTO STRICT auth_users_id_attnum
  FROM pg_catalog.pg_attribute AS attributes
  WHERE attributes.attrelid = 'auth.users'::pg_catalog.regclass
    AND attributes.attname = 'id' AND attributes.attnum > 0
    AND NOT attributes.attisdropped;

  SELECT attributes.attnum INTO STRICT members_id_attnum
  FROM pg_catalog.pg_attribute AS attributes
  WHERE attributes.attrelid = 'public.members'::pg_catalog.regclass
    AND attributes.attname = 'id' AND attributes.attnum > 0
    AND NOT attributes.attisdropped;

  IF (
    SELECT count(*) FROM pg_catalog.pg_constraint AS constraints
    WHERE constraints.conrelid = feedback_table AND constraints.contype = 'f'
  ) <> 2 OR NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint AS constraints
    WHERE constraints.conrelid = feedback_table
      AND constraints.contype = 'f'
      AND constraints.conkey = ARRAY[auth_user_attnum]::smallint[]
      AND constraints.confrelid = 'auth.users'::pg_catalog.regclass
      AND constraints.confkey = ARRAY[auth_users_id_attnum]::smallint[]
      AND constraints.confdeltype = 'c'
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint AS constraints
    WHERE constraints.conrelid = feedback_table
      AND constraints.contype = 'f'
      AND constraints.conkey = ARRAY[member_attnum]::smallint[]
      AND constraints.confrelid = 'public.members'::pg_catalog.regclass
      AND constraints.confkey = ARRAY[members_id_attnum]::smallint[]
      AND constraints.confdeltype = 'n'
  ) THEN
    RAISE EXCEPTION 'Postflight feedback 01: foreign keys o acciones ON DELETE incorrectas.';
  END IF;

  IF (
    SELECT count(*) FROM pg_catalog.pg_constraint AS constraints
    WHERE constraints.conrelid = feedback_table AND constraints.contype = 'c'
  ) <> 5 THEN
    RAISE EXCEPTION 'Postflight feedback 01: debe haber exactamente cinco CHECK.';
  END IF;

  FOR normalized_expression IN
    SELECT pg_catalog.lower(
      pg_catalog.regexp_replace(
        pg_catalog.replace(
          pg_catalog.replace(
            pg_catalog.pg_get_expr(constraints.conbin, constraints.conrelid),
            '::text[]', ''
          ),
          '::text', ''
        ),
        '[[:space:]()]', '', 'g'
      )
    )
    FROM pg_catalog.pg_constraint AS constraints
    WHERE constraints.conrelid = feedback_table
      AND constraints.contype = 'c'
      AND constraints.conname = 'pilot_feedback_category_check'
  LOOP
    IF normalized_expression <> 'category=anyarray[''error'',''suggestion'',''question'',''praise'']' THEN
      RAISE EXCEPTION 'Postflight feedback 01: CHECK de category incorrecto.';
    END IF;
  END LOOP;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Postflight feedback 01: falta CHECK de category.';
  END IF;

  FOR normalized_expression IN
    SELECT pg_catalog.lower(pg_catalog.regexp_replace(
      pg_catalog.pg_get_expr(constraints.conbin, constraints.conrelid),
      '[[:space:]()]', '', 'g'
    ))
    FROM pg_catalog.pg_constraint AS constraints
    WHERE constraints.conrelid = feedback_table
      AND constraints.contype = 'c'
      AND constraints.conname = 'pilot_feedback_message_length_check'
  LOOP
    IF normalized_expression <> 'char_lengthbtrimmessage>=10andchar_lengthbtrimmessage<=2000' THEN
      RAISE EXCEPTION 'Postflight feedback 01: CHECK de message incorrecto.';
    END IF;
  END LOOP;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Postflight feedback 01: falta CHECK de message.';
  END IF;

  FOR normalized_expression IN
    SELECT pg_catalog.lower(pg_catalog.regexp_replace(
      pg_catalog.pg_get_expr(constraints.conbin, constraints.conrelid),
      '[[:space:]()]', '', 'g'
    ))
    FROM pg_catalog.pg_constraint AS constraints
    WHERE constraints.conrelid = feedback_table
      AND constraints.contype = 'c'
      AND constraints.conname = 'pilot_feedback_page_path_length_check'
  LOOP
    IF normalized_expression <> 'page_pathisnullorchar_lengthpage_path<=500' THEN
      RAISE EXCEPTION 'Postflight feedback 01: CHECK de page_path incorrecto.';
    END IF;
  END LOOP;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Postflight feedback 01: falta CHECK de page_path.';
  END IF;

  FOR normalized_expression IN
    SELECT pg_catalog.lower(pg_catalog.regexp_replace(
      pg_catalog.pg_get_expr(constraints.conbin, constraints.conrelid),
      '[[:space:]()]', '', 'g'
    ))
    FROM pg_catalog.pg_constraint AS constraints
    WHERE constraints.conrelid = feedback_table
      AND constraints.contype = 'c'
      AND constraints.conname = 'pilot_feedback_app_version_length_check'
  LOOP
    IF normalized_expression <> 'app_versionisnullorchar_lengthapp_version<=100' THEN
      RAISE EXCEPTION 'Postflight feedback 01: CHECK de app_version incorrecto.';
    END IF;
  END LOOP;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Postflight feedback 01: falta CHECK de app_version.';
  END IF;

  FOR normalized_expression IN
    SELECT pg_catalog.lower(pg_catalog.regexp_replace(
      pg_catalog.pg_get_expr(constraints.conbin, constraints.conrelid),
      '[[:space:]()]', '', 'g'
    ))
    FROM pg_catalog.pg_constraint AS constraints
    WHERE constraints.conrelid = feedback_table
      AND constraints.contype = 'c'
      AND constraints.conname = 'pilot_feedback_user_agent_length_check'
  LOOP
    IF normalized_expression <> 'user_agentisnullorchar_lengthuser_agent<=1000' THEN
      RAISE EXCEPTION 'Postflight feedback 01: CHECK de user_agent incorrecto.';
    END IF;
  END LOOP;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Postflight feedback 01: falta CHECK de user_agent.';
  END IF;

  SELECT pg_catalog.lower(pg_catalog.regexp_replace(
    pg_catalog.pg_get_expr(defaults.adbin, defaults.adrelid),
    '[[:space:]]', '', 'g'
  ))
  INTO normalized_expression
  FROM pg_catalog.pg_attrdef AS defaults
  WHERE defaults.adrelid = feedback_table
    AND defaults.adnum = created_at_attnum;

  IF normalized_expression IS NULL
    OR normalized_expression NOT IN ('now()', 'current_timestamp')
  THEN
    RAISE EXCEPTION 'Postflight feedback 01: DEFAULT de created_at no equivale a now().';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_attrdef AS defaults
    WHERE defaults.adrelid = feedback_table AND defaults.adnum <> created_at_attnum
  ) THEN
    RAISE EXCEPTION 'Postflight feedback 01: existen defaults adicionales no previstos.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_class AS relations
    WHERE relations.oid = feedback_table
      AND relations.relrowsecurity
      AND relations.relforcerowsecurity
  ) OR EXISTS (
    SELECT 1 FROM pg_catalog.pg_policy AS policies
    WHERE policies.polrelid = feedback_table
  ) THEN
    RAISE EXCEPTION 'Postflight feedback 01: RLS debe estar habilitado, forzado y sin politicas.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class AS relations
    CROSS JOIN LATERAL pg_catalog.aclexplode(
      COALESCE(relations.relacl, pg_catalog.acldefault('r', relations.relowner))
    ) AS privileges
    WHERE relations.oid = feedback_table
      AND privileges.grantee IN (0, anon_role, authenticated_role)
  ) THEN
    RAISE EXCEPTION 'Postflight feedback 01: PUBLIC, anon o authenticated tienen privilegios de tabla.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class AS relations
    CROSS JOIN LATERAL pg_catalog.aclexplode(
      COALESCE(relations.relacl, pg_catalog.acldefault('S', relations.relowner))
    ) AS privileges
    WHERE relations.oid = feedback_sequence
      AND privileges.grantee IN (0, anon_role, authenticated_role)
      AND privileges.privilege_type IN ('USAGE', 'SELECT', 'UPDATE')
  ) THEN
    RAISE EXCEPTION 'Postflight feedback 01: privilegios de secuencia no permitidos.';
  END IF;

  IF submit_function IS NULL OR list_function IS NULL OR summary_function IS NULL THEN
    RAISE EXCEPTION 'Postflight feedback 01: faltan firmas RPC requeridas.';
  END IF;

  FOR target_function IN
    SELECT
      functions.oid,
      functions.proname,
      functions.proargnames,
      functions.proargtypes,
      functions.proallargtypes,
      functions.proargmodes,
      functions.pronargdefaults,
      functions.proretset,
      functions.prorettype,
      functions.provolatile,
      functions.prosecdef,
      functions.proconfig,
      functions.proowner,
      languages.lanname
    FROM pg_catalog.pg_proc AS functions
    JOIN pg_catalog.pg_language AS languages ON languages.oid = functions.prolang
    WHERE functions.oid IN (submit_function, list_function, summary_function)
  LOOP
    IF NOT target_function.prosecdef
      OR target_function.proowner <> postgres_role
      OR target_function.proconfig IS DISTINCT FROM ARRAY['search_path=""']::text[]
      OR target_function.lanname <> 'plpgsql'
    THEN
      RAISE EXCEPTION 'Postflight feedback 01: metadatos incorrectos en %.', target_function.proname;
    END IF;

    IF target_function.oid = submit_function AND (
      target_function.proargnames IS DISTINCT FROM ARRAY[
        'p_category', 'p_message', 'p_page_path', 'p_app_version', 'p_user_agent'
      ]::text[]
      OR target_function.pronargdefaults <> 3
      OR target_function.proretset
      OR target_function.prorettype <> 'bigint'::pg_catalog.regtype
      OR target_function.provolatile <> 'v'
    ) THEN
      RAISE EXCEPTION 'Postflight feedback 01: contrato de submit incorrecto.';
    END IF;

    IF target_function.oid = list_function AND (
      target_function.proargnames IS DISTINCT FROM ARRAY[
        'p_category', 'p_limit', 'id', 'member_name', 'category', 'message',
        'page_path', 'app_version', 'user_agent', 'created_at'
      ]::text[]
      OR target_function.pronargdefaults <> 2
      OR NOT target_function.proretset
      OR target_function.prorettype <> 'record'::pg_catalog.regtype
      OR target_function.provolatile <> 's'
      OR target_function.proallargtypes IS DISTINCT FROM ARRAY[
        'text'::pg_catalog.regtype::oid, 'integer'::pg_catalog.regtype::oid,
        'bigint'::pg_catalog.regtype::oid, 'text'::pg_catalog.regtype::oid,
        'text'::pg_catalog.regtype::oid, 'text'::pg_catalog.regtype::oid,
        'text'::pg_catalog.regtype::oid, 'text'::pg_catalog.regtype::oid,
        'text'::pg_catalog.regtype::oid, 'timestamptz'::pg_catalog.regtype::oid
      ]::oid[]
      OR target_function.proargmodes IS DISTINCT FROM ARRAY[
        'i'::"char", 'i'::"char", 't'::"char", 't'::"char", 't'::"char",
        't'::"char", 't'::"char", 't'::"char", 't'::"char", 't'::"char"
      ]::"char"[]
    ) THEN
      RAISE EXCEPTION 'Postflight feedback 01: contrato de list incorrecto.';
    END IF;

    IF target_function.oid = summary_function AND (
      target_function.proargnames IS DISTINCT FROM ARRAY[
        'total_count', 'error_count', 'suggestion_count', 'question_count', 'praise_count'
      ]::text[]
      OR target_function.pronargdefaults <> 0
      OR NOT target_function.proretset
      OR target_function.prorettype <> 'record'::pg_catalog.regtype
      OR target_function.provolatile <> 's'
      OR target_function.proallargtypes IS DISTINCT FROM ARRAY[
        'bigint'::pg_catalog.regtype::oid, 'bigint'::pg_catalog.regtype::oid,
        'bigint'::pg_catalog.regtype::oid, 'bigint'::pg_catalog.regtype::oid,
        'bigint'::pg_catalog.regtype::oid
      ]::oid[]
      OR target_function.proargmodes IS DISTINCT FROM ARRAY[
        't'::"char", 't'::"char", 't'::"char", 't'::"char", 't'::"char"
      ]::"char"[]
    ) THEN
      RAISE EXCEPTION 'Postflight feedback 01: contrato de summary incorrecto.';
    END IF;
  END LOOP;

  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_proc AS functions
    CROSS JOIN LATERAL pg_catalog.aclexplode(
      COALESCE(functions.proacl, pg_catalog.acldefault('f', functions.proowner))
    ) AS privileges
    WHERE functions.oid IN (submit_function, list_function, summary_function)
      AND (
        privileges.privilege_type <> 'EXECUTE'
        OR privileges.grantee NOT IN (
          postgres_role,
          authenticated_role,
          service_role
        )
        OR (privileges.grantee = authenticated_role AND privileges.is_grantable)
      )
  ) OR EXISTS (
    SELECT 1
    FROM pg_catalog.pg_proc AS functions
    WHERE functions.oid IN (submit_function, list_function, summary_function)
      AND NOT pg_catalog.has_function_privilege(
        authenticated_role, functions.oid, 'EXECUTE'
      )
  ) OR EXISTS (
    SELECT 1
    FROM pg_catalog.pg_proc AS functions
    WHERE functions.oid IN (submit_function, list_function, summary_function)
      AND pg_catalog.has_function_privilege(
        anon_role, functions.oid, 'EXECUTE'
      )
  ) THEN
    RAISE EXCEPTION 'Postflight feedback 01: ACL EXECUTE de las RPC incorrectos.';
  END IF;

  IF EXISTS (
    WITH expected(index_name, key_count, first_key, first_desc, second_key, second_desc, predicate) AS (
      VALUES
        ('pilot_feedback_created_at_idx', 1, 'created_at', true, NULL::text, false, NULL::text),
        ('pilot_feedback_category_created_at_idx', 2, 'category', false, 'created_at', true, NULL::text),
        ('pilot_feedback_auth_user_id_idx', 1, 'auth_user_id', false, NULL::text, false, NULL::text),
        ('pilot_feedback_member_id_idx', 1, 'member_id', false, NULL::text, false, 'member_idisnotnull')
    )
    SELECT 1
    FROM expected
    LEFT JOIN pg_catalog.pg_class AS index_relations
      ON index_relations.relname = expected.index_name
      AND index_relations.relnamespace = 'public'::pg_catalog.regnamespace
      AND index_relations.relkind = 'i'
    LEFT JOIN pg_catalog.pg_index AS indexes
      ON indexes.indexrelid = index_relations.oid
      AND indexes.indrelid = feedback_table
    WHERE indexes.indexrelid IS NULL
      OR NOT indexes.indisvalid
      OR NOT indexes.indisready
      OR indexes.indisunique
      OR indexes.indnkeyatts <> expected.key_count
      OR indexes.indnatts <> expected.key_count
      OR pg_catalog.lower(pg_catalog.pg_get_indexdef(indexes.indexrelid, 1, true))
        <> expected.first_key
      OR pg_catalog.pg_index_column_has_property(indexes.indexrelid, 1, 'desc')
        <> expected.first_desc
      OR (
        expected.second_key IS NOT NULL AND (
          pg_catalog.lower(pg_catalog.pg_get_indexdef(indexes.indexrelid, 2, true))
            <> expected.second_key
          OR pg_catalog.pg_index_column_has_property(indexes.indexrelid, 2, 'desc')
            <> expected.second_desc
        )
      )
      OR pg_catalog.lower(pg_catalog.regexp_replace(
        COALESCE(pg_catalog.pg_get_expr(indexes.indpred, indexes.indrelid), ''),
        '[[:space:]()]', '', 'g'
      )) <> COALESCE(expected.predicate, '')
  ) THEN
    RAISE EXCEPTION 'Postflight feedback 01: definicion de indices incorrecta.';
  END IF;
END;
$postflight$;

SELECT
  '01_create_pilot_feedback' AS postflight_section,
  true AS approved,
  'Postflight aprobado: contrato completo de tabla, constraints, RLS, ACL, RPC e indices.' AS result;
