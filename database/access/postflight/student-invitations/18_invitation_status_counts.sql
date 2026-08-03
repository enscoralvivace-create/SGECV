/*
 * RC-3.3.1 - POSTFLIGHT DE SOLO LECTURA
 * No modifica datos ni consulta filas de auth.users.
 */

-- 18. Única lectura de datos: conteos agregados por estado, sin secretos.
SELECT
  '18_invitation_counts_by_status' AS postflight_section,
  CASE
    WHEN invitations.used_at IS NOT NULL THEN 'used'
    WHEN invitations.revoked_at IS NOT NULL THEN 'revoked'
    WHEN invitations.expires_at <= now() THEN 'expired'
    ELSE 'active'
  END AS invitation_status,
  count(*) AS invitation_count
FROM public.student_account_invitations AS invitations
GROUP BY invitation_status
ORDER BY invitation_status;
