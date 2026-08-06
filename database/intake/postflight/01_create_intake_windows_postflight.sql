-- POSTFLIGHT ESTRICTAMENTE DE SOLO LECTURA.

DO $postflight$
DECLARE
  windows_table oid := pg_catalog.to_regclass('public.intake_windows')::oid;
  requests_table oid := pg_catalog.to_regclass('public.intake_requests')::oid;
  requests_sequence oid;
  postgres_role oid := (SELECT oid FROM pg_catalog.pg_roles WHERE rolname = 'postgres');
  anon_role oid := (SELECT oid FROM pg_catalog.pg_roles WHERE rolname = 'anon');
  authenticated_role oid := (SELECT oid FROM pg_catalog.pg_roles WHERE rolname = 'authenticated');
  target_function record;
BEGIN
  IF windows_table IS NULL OR requests_table IS NULL THEN
    RAISE EXCEPTION 'Postflight intake 01: faltan tablas.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_class AS relations
    WHERE relations.oid IN (windows_table, requests_table)
      AND (relations.relkind NOT IN ('r', 'p') OR relations.relowner <> postgres_role)
  ) OR (
    SELECT count(*) FROM pg_catalog.pg_class AS relations
    WHERE relations.oid IN (windows_table, requests_table)
  ) <> 2 THEN
    RAISE EXCEPTION 'Postflight intake 01: tipo o propietario de tablas incorrecto.';
  END IF;

  IF (
    SELECT count(*) FROM pg_catalog.pg_attribute AS attributes
    WHERE attributes.attrelid = windows_table AND attributes.attnum > 0
      AND NOT attributes.attisdropped
  ) <> 9 OR (
    SELECT count(*) FROM pg_catalog.pg_attribute AS attributes
    WHERE attributes.attrelid = requests_table AND attributes.attnum > 0
      AND NOT attributes.attisdropped
  ) <> 17 THEN
    RAISE EXCEPTION 'Postflight intake 01: cantidad de columnas incorrecta.';
  END IF;

  IF EXISTS (
    WITH expected(table_oid, column_name, type_oid, not_null, identity_kind) AS (
      VALUES
        (windows_table, 'id', 'uuid'::regtype::oid, true, ''),
        (windows_table, 'name', 'text'::regtype::oid, true, ''),
        (windows_table, 'public_token_hash', 'text'::regtype::oid, true, ''),
        (windows_table, 'status', 'text'::regtype::oid, true, ''),
        (windows_table, 'expires_at', 'timestamptz'::regtype::oid, true, ''),
        (windows_table, 'created_by', 'uuid'::regtype::oid, true, ''),
        (windows_table, 'created_at', 'timestamptz'::regtype::oid, true, ''),
        (windows_table, 'closed_at', 'timestamptz'::regtype::oid, false, ''),
        (windows_table, 'message', 'text'::regtype::oid, false, ''),
        (requests_table, 'id', 'bigint'::regtype::oid, true, 'd'),
        (requests_table, 'intake_window_id', 'uuid'::regtype::oid, true, ''),
        (requests_table, 'first_name', 'text'::regtype::oid, true, ''),
        (requests_table, 'last_name', 'text'::regtype::oid, true, ''),
        (requests_table, 'email', 'text'::regtype::oid, true, ''),
        (requests_table, 'phone', 'text'::regtype::oid, false, ''),
        (requests_table, 'requested_voice', 'text'::regtype::oid, false, ''),
        (requests_table, 'requested_role', 'text'::regtype::oid, true, ''),
        (requests_table, 'notes', 'text'::regtype::oid, false, ''),
        (requests_table, 'status', 'text'::regtype::oid, true, ''),
        (requests_table, 'reviewed_by', 'uuid'::regtype::oid, false, ''),
        (requests_table, 'reviewed_at', 'timestamptz'::regtype::oid, false, ''),
        (requests_table, 'rejection_reason', 'text'::regtype::oid, false, ''),
        (requests_table, 'member_id', 'bigint'::regtype::oid, false, ''),
        (requests_table, 'invitation_id', 'uuid'::regtype::oid, false, ''),
        (requests_table, 'invitation_delivery_status', 'text'::regtype::oid, false, ''),
        (requests_table, 'created_at', 'timestamptz'::regtype::oid, true, '')
    )
    SELECT 1 FROM expected
    LEFT JOIN pg_catalog.pg_attribute AS attributes
      ON attributes.attrelid = expected.table_oid
      AND attributes.attname = expected.column_name
      AND attributes.attnum > 0 AND NOT attributes.attisdropped
    WHERE attributes.attname IS NULL OR attributes.atttypid <> expected.type_oid
      OR attributes.atttypmod <> -1 OR attributes.attnotnull <> expected.not_null
      OR attributes.attidentity::text <> expected.identity_kind
  ) THEN
    RAISE EXCEPTION 'Postflight intake 01: contrato de columnas incorrecto.';
  END IF;

  requests_sequence := pg_catalog.to_regclass(
    pg_catalog.pg_get_serial_sequence('public.intake_requests', 'id')
  )::oid;
  IF requests_sequence IS NULL THEN
    RAISE EXCEPTION 'Postflight intake 01: falta secuencia identity.';
  END IF;

  IF (
    SELECT count(*) FROM pg_catalog.pg_constraint AS constraints
    WHERE constraints.conrelid = windows_table AND constraints.contype = 'p'
  ) <> 1 OR (
    SELECT count(*) FROM pg_catalog.pg_constraint AS constraints
    WHERE constraints.conrelid = requests_table AND constraints.contype = 'p'
  ) <> 1 OR (
    SELECT count(*) FROM pg_catalog.pg_constraint AS constraints
    WHERE constraints.conrelid = windows_table AND constraints.contype = 'f'
  ) <> 1 OR (
    SELECT count(*) FROM pg_catalog.pg_constraint AS constraints
    WHERE constraints.conrelid = requests_table AND constraints.contype = 'f'
  ) <> 4 THEN
    RAISE EXCEPTION 'Postflight intake 01: PK o cantidad de FK incorrecta.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint AS constraints
    WHERE constraints.conrelid = windows_table AND constraints.contype = 'f'
      AND constraints.confrelid = 'auth.users'::regclass AND constraints.confdeltype = 'r'
      AND pg_catalog.pg_get_constraintdef(constraints.oid) LIKE 'FOREIGN KEY (created_by) REFERENCES auth.users(id)%'
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint AS constraints
    WHERE constraints.conrelid = requests_table AND constraints.contype = 'f'
      AND constraints.confrelid = windows_table AND constraints.confdeltype = 'c'
      AND pg_catalog.pg_get_constraintdef(constraints.oid) LIKE 'FOREIGN KEY (intake_window_id)%'
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint AS constraints
    WHERE constraints.conrelid = requests_table AND constraints.contype = 'f'
      AND constraints.confrelid = 'auth.users'::regclass AND constraints.confdeltype = 'n'
      AND pg_catalog.pg_get_constraintdef(constraints.oid) LIKE 'FOREIGN KEY (reviewed_by) REFERENCES auth.users(id)%'
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint AS constraints
    WHERE constraints.conrelid = requests_table AND constraints.contype = 'f'
      AND constraints.confrelid = 'public.members'::regclass AND constraints.confdeltype = 'n'
      AND pg_catalog.pg_get_constraintdef(constraints.oid) LIKE 'FOREIGN KEY (member_id)%'
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint AS constraints
    WHERE constraints.conrelid = requests_table AND constraints.contype = 'f'
      AND constraints.confrelid = 'public.student_account_invitations'::regclass
      AND constraints.confdeltype = 'n'
      AND pg_catalog.pg_get_constraintdef(constraints.oid) LIKE 'FOREIGN KEY (invitation_id)%'
  ) THEN
    RAISE EXCEPTION 'Postflight intake 01: destinos o acciones de FK incorrectos.';
  END IF;

  IF (
    SELECT count(*) FROM pg_catalog.pg_constraint AS constraints
    WHERE constraints.conrelid = windows_table AND constraints.contype = 'c'
      AND constraints.conname IN (
        'intake_windows_name_check', 'intake_windows_token_hash_check',
        'intake_windows_status_check', 'intake_windows_message_check',
        'intake_windows_closed_state_check'
      )
  ) <> 5 OR (
    SELECT count(*) FROM pg_catalog.pg_constraint AS constraints
    WHERE constraints.conrelid = requests_table AND constraints.contype = 'c'
      AND constraints.conname IN (
        'intake_requests_first_name_check', 'intake_requests_last_name_check',
        'intake_requests_email_check', 'intake_requests_phone_check',
        'intake_requests_voice_check', 'intake_requests_requested_role_check',
        'intake_requests_notes_check',
        'intake_requests_status_check', 'intake_requests_rejection_check',
        'intake_requests_approval_check', 'intake_requests_delivery_check'
      )
  ) <> 11 THEN
    RAISE EXCEPTION 'Postflight intake 01: CHECK requeridos incompletos.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_attrdef AS defaults
    JOIN pg_catalog.pg_attribute AS attributes
      ON attributes.attrelid = defaults.adrelid AND attributes.attnum = defaults.adnum
    WHERE defaults.adrelid = requests_table
      AND attributes.attname = 'requested_role'
      AND pg_catalog.pg_get_expr(defaults.adbin, defaults.adrelid) IN (
        '''student''::text', '''student''' 
      )
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint AS constraints
    WHERE constraints.conrelid = requests_table
      AND constraints.conname = 'intake_requests_requested_role_check'
      AND constraints.contype = 'c'
      AND regexp_replace(lower(pg_catalog.pg_get_constraintdef(constraints.oid)), '\s+', '', 'g')
        IN (
          'check((requested_role=any(array[''student''::text,''member''::text])))',
          'check((requested_rolein(''student''::text,''member''::text)))'
        )
  ) THEN
    RAISE EXCEPTION 'Postflight intake 01: default o CHECK de requested_role incorrecto.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_class AS relations
    WHERE relations.oid IN (windows_table, requests_table)
      AND (NOT relations.relrowsecurity OR NOT relations.relforcerowsecurity)
  ) OR EXISTS (
    SELECT 1 FROM pg_catalog.pg_policy AS policies
    WHERE policies.polrelid IN (windows_table, requests_table)
  ) THEN
    RAISE EXCEPTION 'Postflight intake 01: RLS debe estar habilitado, forzado y sin politicas.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_class AS relations
    CROSS JOIN LATERAL pg_catalog.aclexplode(
      COALESCE(relations.relacl, pg_catalog.acldefault(
        (CASE WHEN relations.relkind = 'S' THEN 'S' ELSE 'r' END)::"char",
        relations.relowner
      ))
    ) AS privileges
    WHERE relations.oid IN (windows_table, requests_table, requests_sequence)
      AND privileges.grantee IN (0, anon_role, authenticated_role)
  ) THEN
    RAISE EXCEPTION 'Postflight intake 01: existen privilegios directos de tabla o secuencia.';
  END IF;

  IF (
    SELECT count(*) FROM pg_catalog.pg_indexes AS indexes
    WHERE indexes.schemaname = 'public'
      AND indexes.indexname IN (
        'intake_requests_pending_email_unique', 'intake_windows_created_at_idx',
        'intake_windows_status_expires_at_idx', 'intake_requests_status_created_at_idx',
        'intake_requests_window_created_at_idx'
      )
      AND indexes.indexdef ILIKE '%intake_%'
  ) <> 5 THEN
    RAISE EXCEPTION 'Postflight intake 01: indices incompletos.';
  END IF;

  FOR target_function IN
    SELECT functions.*, languages.lanname
    FROM pg_catalog.pg_proc AS functions
    JOIN pg_catalog.pg_language AS languages ON languages.oid = functions.prolang
    WHERE functions.oid IN (
      pg_catalog.to_regprocedure('public.create_intake_window(text,integer,text)'),
      pg_catalog.to_regprocedure('public.validate_intake_window(text)'),
      pg_catalog.to_regprocedure('public.submit_intake_request(text,text,text,text,text,text,text)'),
      pg_catalog.to_regprocedure('public.list_intake_windows()'),
      pg_catalog.to_regprocedure('public.close_or_revoke_intake_window(uuid,text)'),
      pg_catalog.to_regprocedure('public.list_intake_requests(text)'),
      pg_catalog.to_regprocedure('public.approve_intake_request(bigint,text)'),
      pg_catalog.to_regprocedure('public.reject_intake_request(bigint,text)')
    )
  LOOP
    IF NOT target_function.prosecdef OR target_function.proowner <> postgres_role
      OR target_function.proconfig IS DISTINCT FROM ARRAY['search_path=""']::text[]
      OR target_function.lanname <> 'plpgsql'
    THEN RAISE EXCEPTION 'Postflight intake 01: metadatos RPC incorrectos.'; END IF;
  END LOOP;

  IF NOT FOUND OR (
    SELECT count(*) FROM pg_catalog.pg_proc AS functions
    WHERE functions.oid IN (
      pg_catalog.to_regprocedure('public.create_intake_window(text,integer,text)'),
      pg_catalog.to_regprocedure('public.validate_intake_window(text)'),
      pg_catalog.to_regprocedure('public.submit_intake_request(text,text,text,text,text,text,text)'),
      pg_catalog.to_regprocedure('public.list_intake_windows()'),
      pg_catalog.to_regprocedure('public.close_or_revoke_intake_window(uuid,text)'),
      pg_catalog.to_regprocedure('public.list_intake_requests(text)'),
      pg_catalog.to_regprocedure('public.approve_intake_request(bigint,text)'),
      pg_catalog.to_regprocedure('public.reject_intake_request(bigint,text)')
    )
  ) <> 8 THEN RAISE EXCEPTION 'Postflight intake 01: faltan RPC.'; END IF;

  IF NOT pg_catalog.has_function_privilege(anon_role, 'public.validate_intake_window(text)', 'EXECUTE')
    OR NOT pg_catalog.has_function_privilege(anon_role, 'public.submit_intake_request(text,text,text,text,text,text,text)', 'EXECUTE')
    OR pg_catalog.has_function_privilege(anon_role, 'public.create_intake_window(text,integer,text)', 'EXECUTE')
    OR NOT pg_catalog.has_function_privilege(authenticated_role, 'public.create_intake_window(text,integer,text)', 'EXECUTE')
    OR NOT pg_catalog.has_function_privilege(authenticated_role, 'public.approve_intake_request(bigint,text)', 'EXECUTE')
    OR NOT pg_catalog.has_function_privilege(authenticated_role, 'public.reject_intake_request(bigint,text)', 'EXECUTE')
  THEN RAISE EXCEPTION 'Postflight intake 01: grants RPC incorrectos.'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc AS functions
    WHERE functions.oid = pg_catalog.to_regprocedure('public.approve_intake_request(bigint,text)')
      AND functions.pronargs = 2
      AND functions.pronargdefaults = 1
      AND functions.proargnames[1:2] = ARRAY['p_request_id', 'p_approved_role']::text[]
      AND pg_catalog.pg_get_function_arguments(functions.oid)
        = 'p_request_id bigint, p_approved_role text DEFAULT NULL::text'
  ) THEN
    RAISE EXCEPTION 'Postflight intake 01: parametros o default de approve incorrectos.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc AS functions
    WHERE functions.oid = pg_catalog.to_regprocedure('public.create_student_invitation(bigint,interval)')
      AND functions.prosrc ~ 'target_member\.role NOT IN \(''member'', ''student''\)'
      AND functions.prosrc ~ 'lower\(btrim\(target_member\.status\)\) <> ''activo'''
  ) THEN
    RAISE EXCEPTION 'Postflight intake 01: contrato de creacion de invitacion incorrecto.';
  END IF;
END;
$postflight$;

SELECT
  '01_create_intake_windows' AS postflight_section,
  true AS approved,
  'Postflight aprobado: tablas, constraints, RLS, ACL, indices y RPC verificados.' AS result;
