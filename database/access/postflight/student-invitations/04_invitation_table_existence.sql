/*
 * RC-3.3.1 - POSTFLIGHT DE SOLO LECTURA
 * No modifica datos ni consulta filas de auth.users.
 */

-- 04. Existencia de la tabla de invitaciones. Debe devolver true.
SELECT
  '04_invitation_table_existence' AS postflight_section,
  to_regclass('public.student_account_invitations') IS NOT NULL AS table_exists,
  to_regclass('public.student_account_invitations')::text AS qualified_table_name;
