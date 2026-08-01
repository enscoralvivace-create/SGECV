import type {
  AppPermission,
} from "@/types/accessControl";

export interface PermissionDefinition {
  permission: AppPermission;
  label: string;
  description: string;
  group: string;
}

export const PERMISSION_DEFINITIONS:
PermissionDefinition[] = [
  {
    permission: "dashboard.view",
    label: "Ver dashboard",
    description:
      "Permite acceder al panel principal.",
    group: "General",
  },
  {
    permission: "members.view",
    label: "Consultar integrantes",
    description:
      "Permite consultar el directorio de integrantes.",
    group: "Integrantes",
  },
  {
    permission: "members.manage",
    label: "Administrar integrantes",
    description:
      "Permite crear, editar, aprobar y dar de baja integrantes.",
    group: "Integrantes",
  },
  {
    permission: "events.view",
    label: "Consultar eventos",
    description:
      "Permite consultar ensayos, conciertos y actividades.",
    group: "Eventos",
  },
  {
    permission: "events.manage",
    label: "Administrar eventos",
    description:
      "Permite crear, editar y eliminar eventos.",
    group: "Eventos",
  },
  {
    permission: "attendance.viewOwn",
    label: "Consultar asistencia propia",
    description:
      "Permite consultar las estadísticas personales de asistencia.",
    group: "Asistencia",
  },
  {
    permission: "attendance.viewAll",
    label: "Consultar asistencia general",
    description:
      "Permite consultar la asistencia de todos los integrantes.",
    group: "Asistencia",
  },
  {
    permission: "attendance.manage",
    label: "Administrar asistencia",
    description:
      "Permite crear sesiones y registrar o corregir asistencias.",
    group: "Asistencia",
  },
  {
    permission: "repertoire.view",
    label: "Consultar repertorio",
    description:
      "Permite consultar obras y recursos musicales.",
    group: "Repertorio",
  },
  {
    permission: "repertoire.manage",
    label: "Administrar repertorio",
    description:
      "Permite crear, editar y archivar obras y recursos.",
    group: "Repertorio",
  },
  {
    permission: "fees.viewOwn",
    label: "Consultar cuotas propias",
    description:
      "Permite consultar cargos y pagos personales.",
    group: "Cuotas",
  },
  {
    permission: "fees.viewAll",
    label: "Consultar todas las cuotas",
    description:
      "Permite consultar cargos y pagos de todos los integrantes.",
    group: "Cuotas",
  },
  {
    permission: "fees.manage",
    label: "Administrar cuotas",
    description:
      "Permite generar cargos y registrar pagos.",
    group: "Cuotas",
  },
  {
    permission: "trips.viewOwn",
    label: "Consultar viajes propios",
    description:
      "Permite consultar viajes donde la persona participa.",
    group: "Viajes",
  },
  {
    permission: "trips.viewAll",
    label: "Consultar todos los viajes",
    description:
      "Permite consultar todos los viajes registrados.",
    group: "Viajes",
  },
  {
    permission: "trips.manage",
    label: "Administrar viajes",
    description:
      "Permite administrar viajes, participantes, presupuesto y recibos.",
    group: "Viajes",
  },
  {
    permission: "reports.view",
    label: "Consultar reportes",
    description:
      "Permite acceder a reportes administrativos.",
    group: "Administración",
  },
  {
    permission: "settings.manage",
    label: "Administrar configuración",
    description:
      "Permite modificar la configuración general.",
    group: "Administración",
  },
  {
    permission: "roles.manage",
    label: "Administrar roles y permisos",
    description:
      "Permite conceder o revocar permisos individuales.",
    group: "Administración",
  },
  {
    permission: "classes.viewOwn",
    label: "Consultar clases propias",
    description:
      "Permite consultar clases en las que participa.",
    group: "Formación",
  },
  {
    permission: "classes.viewAssigned",
    label: "Consultar clases asignadas",
    description:
      "Permite consultar grupos y clases asignados.",
    group: "Formación",
  },
  {
    permission: "classes.manage",
    label: "Administrar clases",
    description:
      "Permite administrar clases y grupos.",
    group: "Formación",
  },
  {
    permission: "progress.viewOwn",
    label: "Consultar progreso propio",
    description:
      "Permite consultar el progreso académico personal.",
    group: "Formación",
  },
  {
    permission: "progress.viewAssigned",
    label: "Consultar progreso asignado",
    description:
      "Permite consultar el progreso de alumnos asignados.",
    group: "Formación",
  },
  {
    permission: "progress.manage",
    label: "Administrar progreso",
    description:
      "Permite registrar y modificar evaluaciones de progreso.",
    group: "Formación",
  },
];

export const PERMISSION_GROUPS =
  Array.from(
    new Set(
      PERMISSION_DEFINITIONS.map(
        (definition) =>
          definition.group,
      ),
    ),
  );
