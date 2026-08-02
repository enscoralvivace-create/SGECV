/*
 * RC-3.3.1 - PREFLIGHT DE SOLO LECTURA
 * No modifica datos ni consulta filas de auth.users.
 */

-- 10. Existencia previa de la tabla de invitaciones.
SELECT
  '10_invitation_table_existence' AS diagnostic_section,
  to_regclass('public.student_account_invitations') IS NOT NULL AS table_exists,
  to_regclass('public.student_account_invitations')::text AS qualified_table_name;

