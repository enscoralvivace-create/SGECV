const PRODUCTION_APP_ORIGIN = "https://sgecv.vercel.app";

function getInvitationOrigin(): string {
  if (typeof window === "undefined") {
    return PRODUCTION_APP_ORIGIN;
  }

  const { hostname, origin } = window.location;

  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]"
  ) {
    return origin;
  }

  return PRODUCTION_APP_ORIGIN;
}

export function buildStudentInvitationUrl(
  plainToken: string,
): string {
  return new URL(
    `/registro/invitacion/${encodeURIComponent(plainToken)}`,
    getInvitationOrigin(),
  ).toString();
}

export function buildIntakeWindowUrl(plainToken: string): string {
  return new URL(
    `/registro/incorporacion/${encodeURIComponent(plainToken)}`,
    getInvitationOrigin(),
  ).toString();
}

export function buildIntakeWindowMessage(
  intakeUrl: string,
  windowName: string,
): string {
  return `Te invitamos a solicitar tu incorporación al Ensamble Coral Vivace.

Jornada: ${windowName}

Abre este enlace desde tu teléfono:
${intakeUrl}

Enviar la solicitud no crea una cuenta. La administración revisará tus datos y, si la aprueba, te compartirá una invitación personal.`;
}

export function buildStudentInvitationMessage(
  invitationUrl: string,
  invitedName?: string,
): string {
  const greeting = invitedName?.trim()
    ? `Hola, ${invitedName.trim()}.`
    : "Hola.";

  return `${greeting}

Te invitamos a crear tu cuenta en Vivace Suite, la aplicación del Ensamble Coral Vivace.

Abre este enlace desde tu teléfono:
${invitationUrl}

Desde ahí podrás instalar la aplicación y completar tu registro.

Este enlace es personal y no debe compartirse con otras personas.`;
}
