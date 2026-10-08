# 🔑 Guía de Renovación del Token de Acceso de Meta (WhatsApp Cloud API)

> **Propósito:** Explica paso a paso cómo generar un nuevo `META_ACCESS_TOKEN` en caso de que el actual venza o sea revocado. Cualquier miembro del equipo puede seguir esta guía sin conocimientos previos de la plataforma de Meta.

---

## ¿Cuándo necesitas renovar el token?

El bot dejará de responder mensajes de WhatsApp cuando el token haya expirado. Los síntomas son:

- En los logs del servidor aparece el error: `OAuthException (code: 190) - Authentication Error`
- El bot recibe los mensajes de WhatsApp pero no responde.
- El Dashboard sigue funcionando con normalidad (usa Supabase, no Meta).

---

## Tipos de Token disponibles

| Tipo | Duración | Recomendado para |
|---|---|---|
| Token temporal de usuario | ~1 hora | Pruebas rápidas en desarrollo |
| Token de usuario extendido | ~60 días | Demos y entregas académicas ✅ |
| Token de usuario de sistema | Permanente | Producción real |

> **Para este proyecto usamos el Token de Usuario Extendido (~60 días).**

---

## Paso a Paso: Generar un Token Extendido

### Paso 1 — Ingresar al Panel de Meta for Developers

1. Abre tu navegador y ve a: **https://developers.facebook.com**
2. Inicia sesión con la cuenta de Facebook que tiene acceso a la App del bot.
3. En la esquina superior derecha, haz clic en tu foto de perfil → **"Mis Apps"**.
4. Selecciona la app del proyecto: **`Bot Triage InterChile`** (o el nombre que le hayas puesto).

---

### Paso 2 — Ir a la sección de WhatsApp

1. En el menú lateral izquierdo, haz clic en **"WhatsApp"** → **"Configuración de la API"**.
2. Verás una sección llamada **"Token de acceso temporal"**.

---

### Paso 3 — Generar el nuevo token

1. Haz clic en el botón **"Generar token de acceso"** (o "Generate access token").
2. Aparecerá un popup pidiendo permisos. Acepta todos los permisos que incluyan:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
3. Copia el token generado — **tendrás una sola oportunidad de verlo completo**.

> ⚠️ **Importante:** El token generado aquí dura ~1 hora. Para extenderlo a ~60 días, sigue el Paso 4.

---

### Paso 4 — Extender el token a 60 días (recomendado)

1. Ve a: **https://developers.facebook.com/tools/explorer**
2. En el campo **"Access Token"**, pega el token que acabas de copiar.
3. Haz clic en el ícono de información (ⓘ) al lado del token → **"Open in Access Token Tool"**.
4. Se abrirá la herramienta de tokens en: **https://developers.facebook.com/tools/debug/accesstoken**
5. Haz clic en el botón **"Extend Access Token"** (Extender Token de Acceso).
6. Copia el nuevo token extendido que aparece abajo — este dura ~60 días.

---

### Paso 5 — Actualizar el token en el proyecto

1. Abre el archivo `.env` en la raíz del proyecto:

```
c:\Users\...\bot-verificador-x-prototipo\.env
```

2. Reemplaza el valor de `META_ACCESS_TOKEN` con el token nuevo:

```env
META_ACCESS_TOKEN=EAAj... (tu nuevo token aquí)
```

3. Guarda el archivo.

---

### Paso 6 — Reiniciar el servidor

El servidor Node.js carga las variables de entorno al arrancar. Debes reiniciarlo para que tome el nuevo token:

**En PowerShell:**
```powershell
# 1. Ir al directorio del proyecto
cd "c:\Users\count\Documents\New project\bot-verificador-x-prototipo"

# 2. Reiniciar el servidor (matar el proceso anterior si corre en background y volver a lanzar)
npm run dev
```

**Verificación:** Si en los logs del servidor aparece `✅ Mensaje enviado exitosamente` al enviar el primer mensaje de prueba por WhatsApp, el nuevo token funciona correctamente.

---

## Paso 7 — Verificar que el Webhook sigue activo

Cada vez que se reinicia el servidor con cloudflared sin cuenta, **la URL pública cambia**. Después de reiniciar, verifica que la URL del Webhook en Meta for Developers esté actualizada:

1. En Meta for Developers → **WhatsApp** → **Configuración** → **Webhooks**.
2. La URL debe apuntar a la URL actual de cloudflared + `/webhooks/meta`.
3. El token de verificación es siempre: `tokendevalidacionsecreto_interchile_123`

> 💡 **Tip a futuro:** Para no tener que cambiar la URL cada vez que se reinicia, considera crear una cuenta gratuita en Cloudflare y usar un túnel con nombre fijo (Named Tunnel). Esto mantiene la URL permanente.

---

## Resumen rápido (para emergencias en demo)

```
1. developers.facebook.com → tu App → WhatsApp → Generar token
2. Copiar token → developers.facebook.com/tools/debug/accesstoken → Extender
3. Pegar token nuevo en .env (META_ACCESS_TOKEN=...)
4. Reiniciar servidor: npm run dev
5. Si cambió la URL de cloudflared → actualizar en Meta Webhooks
```

---

## Historial de tokens

| Fecha | Responsable | Motivo | Vence aprox. |
|---|---|---|---|
| 2026-10-08 | Carlos G. | Token inicial Sprint 2 | 2026-12-07 |

*Actualiza esta tabla cada vez que renueves el token.*

---

*Documento generado para el proyecto **Bot Triage InterChile** — Sprint 2*  
*Equipo: Afkllife2 / Ingeniería de Software Aplicada*
