# Recuperación de contraseña

El flujo público usa exclusivamente el cliente Supabase con la Publishable API Key. No requiere SQL ni secretos adicionales.

## Redirect URLs autorizadas

En **Supabase Dashboard → Authentication → URL Configuration → Redirect URLs**, autorizar exactamente:

- Local: `http://localhost:3000/restablecer-contrasena`
- Producción: `https://<DOMINIO-DE-PRODUCCION>/restablecer-contrasena`

Sustituir el placeholder por el origen HTTPS real. No usar comodines salvo que exista una política documentada para previews controlados.

## Prueba funcional

1. Abrir `/login` y seleccionar **¿Olvidaste tu contraseña?**.
2. Enviar un correo existente y confirmar que la respuesta pública sea neutral.
3. Repetir con un correo inexistente y confirmar que se muestre exactamente la misma respuesta.
4. Abrir el mensaje de recuperación y comprobar que redirija a `/restablecer-contrasena`.
5. Probar contraseña menor a 8 caracteres y confirmación distinta.
6. Guardar una contraseña válida de 8 a 128 caracteres.
7. Confirmar la redirección a `/login?passwordUpdated=1`, el mensaje de éxito y el inicio de sesión con la contraseña nueva.

## Enlaces inválidos, expirados o reutilizados

- Un enlace válido puede regresar con `?code=...` para PKCE o con tokens en el fragmento `#...`. La pantalla procesa ambos formatos y también escucha el evento `PASSWORD_RECOVERY` antes de habilitar el formulario.
- Una sesión normal preexistente no habilita la actualización: debe acreditarse el intercambio PKCE, la sesión correspondiente al hash o el evento `PASSWORD_RECOVERY`.
- Un enlace expirado o inválido debe mostrar **Enlace no disponible** y permitir solicitar otro.
- Al finalizar se cierra la sesión local de recuperación. Al reutilizar el enlace, Supabase debe rechazarlo o la pantalla debe tratarlo como no disponible.
- Verificar el comportamiento real con la vigencia OTP configurada en el proyecto y con el proveedor SMTP de producción.

No ejecutar SQL ni desplegar cambios remotos para habilitar este flujo; solo se requiere autorizar las Redirect URLs y comprobar la configuración de correo de Supabase Auth.
