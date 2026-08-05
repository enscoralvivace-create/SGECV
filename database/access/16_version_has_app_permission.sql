/*
 * Versiona la definicion remota canonica de has_app_permission(text).
 * Esta funcion es una dependencia critica de RLS y RPC SECURITY DEFINER.
 */

BEGIN;

CREATE OR REPLACE FUNCTION public.has_app_permission(
  requested_permission text
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  override_value boolean;
BEGIN
  IF NOT public.current_member_is_active() THEN
    RETURN false;
  END IF;

  SELECT
    mpo.is_granted
  INTO
    override_value
  FROM public.member_permission_overrides AS mpo
  WHERE mpo.auth_user_id = auth.uid()
    AND mpo.permission = requested_permission
  LIMIT 1;

  IF FOUND THEN
    RETURN override_value;
  END IF;

  RETURN public.role_has_permission(
    requested_permission
  );
END;
$function$;

ALTER FUNCTION public.has_app_permission(text)
  OWNER TO postgres;

REVOKE ALL ON FUNCTION public.has_app_permission(text)
FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.has_app_permission(text)
TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.has_app_permission(text) IS
  'Resuelve permisos de aplicacion para el integrante activo: prioriza overrides individuales y despues permisos por rol.';

COMMIT;

/*
 * ROLLBACK MANUAL - REVISAR ANTES DE EJECUTAR
 *
 * La funcion remota anterior no estaba versionada y su comportamiento es el
 * mismo que esta migracion. Ante una divergencia futura, restaurar desde una
 * captura verificada de pg_get_functiondef(), owner, proconfig y ACL. No hacer
 * DROP: politicas RLS y varias RPC dependen de esta firma.
 */
