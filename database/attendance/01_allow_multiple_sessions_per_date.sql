/*
 * Permite varias sesiones de asistencia en una misma fecha.
-
 * Antes:
 *   UNIQUE (rehearsal_date)
-
 * Ahora:
 *   UNIQUE (rehearsal_date, starts_at)
-
 * Esto permite que un ensayo regular y uno extraordinario tengan
 * sesiones de asistencia independientes el mismo día, mientras se
 * evita crear dos sesiones para la misma fecha y hora de inicio.
 */

begin;

drop index if exists
  public.attendance_sessions_rehearsal_date_unique;

create unique index if not exists
  attendance_sessions_rehearsal_date_starts_at_unique
on public.attendance_sessions (
  rehearsal_date,
  starts_at
);

commit;
