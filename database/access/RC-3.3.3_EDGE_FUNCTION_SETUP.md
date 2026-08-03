# RC-3.3.3 — Configuración de registro por invitación

Esta guía prepara la aplicación de la migración y el despliegue futuro de `register-student-invitation`. No contiene secretos y no debe usarse para guardar resultados sensibles.

## 1. Prerrequisitos obligatorios

- Confirmar que RC-3.3.1 y la corrección de grants RC-3.3.1 están aplicadas.
- Ejecutar y revisar `database/access/12_prepare_student_invitation_signup.sql` en una ventana controlada.
- Verificar después con `database/access/postflight/12_student_invitation_signup_postflight.sql`.
- Activar **Confirm email** en Supabase Dashboard → Authentication → Providers → Email. Si está desactivado, `signUp()` puede entregar una sesión antes de verificar el correo y el flujo debe considerarse mal configurado.
- Configurar un proveedor SMTP para producción en Supabase Dashboard → Authentication → Email. Sin SMTP operativo, no debe afirmarse que el correo fue entregado.
- Revisar la plantilla **Confirm signup**. Debe conservar el enlace de confirmación generado por Supabase y no registrar parámetros sensibles.

## 2. Configuración y secretos

El frontend requiere en `.env.local`:

```text
NEXT_PUBLIC_SUPABASE_URL=<project-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
```

La Edge Function conserva `SUPABASE_URL`, proporcionada por el runtime, y requiere estas variables propias:

```text
VIVACE_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
VIVACE_SUPABASE_SECRET_KEY=<secret-key>
ALLOWED_ORIGINS=https://app.ejemplo.com,https://staging.ejemplo.com
```

La Publishable API Key se usa únicamente para `auth.signUp()`. La Secret API Key se mantiene exclusivamente en la Edge Function y se usa únicamente para la RPC privilegiada. No configurar `SUPABASE_ANON_KEY` ni `SUPABASE_SERVICE_ROLE_KEY`; no existe fallback a claves heredadas.

Para desarrollo local puede añadirse el origen exacto, por ejemplo `http://localhost:3000`. No usar comodines ni incluir rutas. Nunca crear una variable `NEXT_PUBLIC_*` con una Secret API Key.

## 3. Redirects de Auth

En Supabase Dashboard → Authentication → URL Configuration:

- Configurar el **Site URL** productivo.
- Añadir cada URL permitida con la ruta `/activar-cuenta` a **Redirect URLs**.
- Incluir variantes locales únicamente para desarrollo controlado.

La Edge Function construye el redirect como:

```text
{origin}/activar-cuenta?invitation={token_codificado}
```

Supabase ignora un redirect no incluido en la configuración y utiliza el Site URL, por lo que esta comprobación es obligatoria antes de probar.

## 4. Migración y despliegue controlado

Ejecutar únicamente cuando se autorice el cambio en Supabase:

1. Copiar manualmente la Publishable API Key a `.env.local` como `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, sin compartirla ni imprimirla. Mantener `NEXT_PUBLIC_SUPABASE_URL`.
2. Introducir la Publishable API Key y la Secret API Key en variables temporales de la sesión de PowerShell mediante lectura segura; no escribir valores literales en el comando ni guardarlos en el historial:

   ```powershell
   $publishableSecure = Read-Host "Publishable API Key" -AsSecureString
   $secretSecure = Read-Host "Secret API Key" -AsSecureString
   $publishablePointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($publishableSecure)
   $secretPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secretSecure)
   try {
     $env:VIVACE_SUPABASE_PUBLISHABLE_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($publishablePointer)
     $env:VIVACE_SUPABASE_SECRET_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($secretPointer)
     supabase secrets set "VIVACE_SUPABASE_PUBLISHABLE_KEY=$env:VIVACE_SUPABASE_PUBLISHABLE_KEY" "VIVACE_SUPABASE_SECRET_KEY=$env:VIVACE_SUPABASE_SECRET_KEY" "ALLOWED_ORIGINS=http://localhost:3000"
   } finally {
     [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($publishablePointer)
     [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($secretPointer)
     Remove-Item Env:VIVACE_SUPABASE_PUBLISHABLE_KEY,Env:VIVACE_SUPABASE_SECRET_KEY -ErrorAction SilentlyContinue
   }
   ```

   No ejecutar `projects api-keys`, no usar parámetros con valores literales y no capturar la salida en archivos o tickets.
3. Desplegar la función pública:

   ```text
   supabase functions deploy register-student-invitation --no-verify-jwt
   ```

4. Probar, en orden: login; lectura normal protegida por RLS; `OPTIONS`; `POST` inválido sin alta; creación de invitación; y un único registro controlado.
5. Solo después de aprobar todas las pruebas, deshabilitar las claves heredadas `anon` y `service_role` en Supabase Dashboard → Project Settings → API Keys.
6. Repetir login, lectura RLS, `OPTIONS` y `POST` inválido para confirmar que frontend y Edge Function siguen operativos.
7. Revocar la Previous Legacy HS256 Key.
8. Cerrar las sesiones antiguas y volver a iniciar sesión.

`--no-verify-jwt` es necesario porque la invitación es el secreto de autorización previo al alta. La función valida por sí misma origen, formato, vigencia y elegibilidad mediante la RPC exclusiva de `service_role`.

## 5. Pruebas locales sin exponer secretos

- Usar un archivo de entorno local excluido de Git.
- No pegar tokens, contraseñas, correos ni claves en comandos que queden en historial o logs.
- Ejecutar la función con `SUPABASE_URL`, `VIVACE_SUPABASE_PUBLISHABLE_KEY`, `VIVACE_SUPABASE_SECRET_KEY` y `ALLOWED_ORIGINS` proporcionados mediante un entorno local excluido de Git.
- Usar una invitación de prueba autorizada y una bandeja de correo controlada.
- Confirmar que las respuestas contienen únicamente `ok` y `result_code`.
- Confirmar que la Secret API Key nunca llega al navegador ni al bundle de Next.js.
- Verificar que el token no aparece en logs de la función.

## 6. Rate limiting

La función incluye un límite básico por dirección de cliente dentro de cada instancia: cinco intentos por diez minutos. Este límite no es global ni durable. Antes de producción debe complementarse con rate limiting en el gateway, WAF o infraestructura de Supabase para impedir intentos distribuidos.

## 7. Límite del alta Auth pública

La implementación usa `auth.signUp()` dentro de la Edge Function porque es el mecanismo oficial que establece la contraseña y dispara el correo **Confirm signup**. Para que funcione, el proveedor Email debe permitir nuevas altas. Una persona que llame directamente al endpoint público de Auth podría crear una identidad Auth no vinculada, aunque no obtendrá un integrante, rol ni permisos porque el trigger histórico fue retirado y la vinculación depende de `consume_student_invitation()`.

Si el requisito futuro fuera impedir incluso identidades Auth no vinculadas, será necesario sustituir `signUp()` por creación administrativa más entrega de correo controlada (`generateLink()` y proveedor propio), o por otro mecanismo servidor equivalente. Esa ampliación requiere diseñar el proveedor de correo y su manejo transaccional.

## 8. Smoke tests posteriores

- Origen no permitido: respuesta rechazada sin CORS.
- Método distinto de `POST`: respuesta `405`.
- Body mayor a 8 KiB: respuesta `413`.
- Invitación inválida: respuesta neutra sin correo ni identificadores.
- Contraseñas distintas o fuera de longitud: rechazo sin ejecutar alta.
- Invitación válida: respuesta `confirmation_pending` y correo recibido.
- Confirmación: `/activar-cuenta` obtiene sesión y consume la invitación.
- Reutilización: no vuelve a vincular ni expone datos.
- Cuenta existente: respuesta neutra sin confirmar su existencia.

## 9. Rollback

1. Deshabilitar o eliminar la Edge Function desplegada.
2. Retirar sus orígenes y secretos específicos si ya no se utilizarán.
3. Revisar el rollback comentado en `12_prepare_student_invitation_signup.sql`.
4. Revocar `EXECUTE` de `service_role` y eliminar `resolve_student_invitation_for_signup(text)` solo después de confirmar que ningún despliegue la utiliza.
5. Restaurar una versión anterior del frontend si fuera necesario.

El rollback no debe borrar usuarios, integrantes ni invitaciones. Cualquier cuenta Auth creada durante pruebas requiere una decisión administrativa separada y respaldo previo.
