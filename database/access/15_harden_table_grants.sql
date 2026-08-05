/*
 * Minimo privilegio para tablas historicas expuestas por la API.
 *
 * RLS sigue siendo la frontera de autorizacion por fila. Esta migracion solo
 * reduce los privilegios de tabla de los roles cliente; no cambia ownership,
 * funciones, politicas ni la capacidad de postgres o service_role.
 */

BEGIN;

DO $preflight$
DECLARE
  table_name text;
  target_table regclass;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'members',
    'student_account_invitations',
    'attendance_sessions',
    'attendance_records',
    'attendance_session_check_in_exceptions',
    'member_charges',
    'payments'
  ]
  LOOP
    target_table := pg_catalog.to_regclass(
      pg_catalog.format('public.%I', table_name)
    );

    IF target_table IS NULL THEN
      RAISE EXCEPTION
        'Migration access 15: falta la tabla public.%.',
        table_name;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_catalog.pg_class AS tables
      WHERE tables.oid = target_table
        AND tables.relkind IN ('r', 'p')
        AND tables.relrowsecurity
    ) THEN
      RAISE EXCEPTION
        'Migration access 15: public.% debe ser una tabla con RLS habilitado.',
        table_name;
    END IF;
  END LOOP;
END;
$preflight$;

REVOKE ALL ON TABLE
  public.members,
  public.student_account_invitations,
  public.attendance_sessions,
  public.attendance_records,
  public.attendance_session_check_in_exceptions,
  public.member_charges,
  public.payments
FROM PUBLIC, anon, authenticated;

-- Perfil y administracion de integrantes: operaciones directas protegidas por RLS.
GRANT SELECT, INSERT, UPDATE ON TABLE public.members TO authenticated;

-- Las invitaciones se consultan y modifican solo mediante RPC SECURITY DEFINER.

-- Las sesiones se consultan, crean y activan/desactivan directamente bajo RLS.
GRANT SELECT, INSERT, UPDATE ON TABLE public.attendance_sessions TO authenticated;

-- El alta QR de registros usa register_attendance_by_qr(); el cliente solo lee.
GRANT SELECT ON TABLE public.attendance_records TO authenticated;

-- La sincronizacion de excepciones usa una RPC atomica; el cliente solo lee.
GRANT SELECT ON TABLE
  public.attendance_session_check_in_exceptions
TO authenticated;

-- Cargos y pagos se consultan y crean directamente; triggers mantienen estados.
GRANT SELECT, INSERT ON TABLE public.member_charges TO authenticated;
GRANT SELECT, INSERT ON TABLE public.payments TO authenticated;

COMMIT;

/*
 * ROLLBACK MANUAL - REVISAR ANTES DE EJECUTAR
 *
 * Esta migracion corrige privilegios excesivos y no ofrece un rollback
 * automatico que los restaure. Si una integracion heredada necesita una
 * operacion retirada, conceder solo esa operacion a su rol concreto tras
 * verificar que exista una politica RLS adecuada. No restaurar ALL, TRUNCATE,
 * REFERENCES, TRIGGER ni MAINTAIN a anon o authenticated.
 */
