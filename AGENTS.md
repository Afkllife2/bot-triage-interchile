# Reglas Obligatorias de Metodología y Calidad — Sprint 3 (Profesora Sarita González)

> **PROPÓSITO:** Reglas incondicionales y directrices permanentes ("Anzuelos / Hooks") para el desarrollo del **Sprint 3 (Cierre de Titulación)**. Estas reglas se aplican de forma automática y proactiva en cada sesión, sin necesidad de que el estudiante las recuerde.

---

## 1. Definition of Done (DoD) Corta, Directa y Consecuente
- El DoD debe ser **sintético, directo al hueso y 100% consecuente** con el trabajo real realizado (evitar formulaciones abstractas o infladas).
- Condiciones esenciales:
  1. Código operativo y desplegado en Render (HTTPS/SSL).
  2. Criterios de Aceptación (CA) BDD cubiertos con casos positivos, negativos y fallbacks.
  3. Pruebas automatizadas en Jest (Unitarias + Integración) con 100% PASS.
  4. Commits semánticos en GitHub en la **rama específica de cada Historia de Usuario** y Tag formal de release al cierre.
  5. Subtareas en Jira con horas estimadas, horas reales registradas (Time Tracking) y captura de evidencia adjunta.

---

## 2. Anzuelo Obligatorio de Flujo Incremental: 1 Rama por HU + Avance Real + Tiempo Real + Screenshot por Subtarea
- **PROHIBIDO marcar todas las historias o subtareas como `Listo` de golpe** o agrupar todo el Sprint en una sola rama genérica.
- Cada Historia de Usuario / Tarea Técnica se desarrolla en su **propia rama específica en GitHub**:
  - `AAI-25` (`[INT-HU-05]`): `feat/AAI-25-HU-05-cotizacion-borrador-pdf`
  - `AAI-90` (`[INT-HU-19]`): `feat/AAI-90-HU-19-agendamiento-estados-dashboard`
  - `AAI-94` (`[INT-HU-22]`): `feat/AAI-94-HU-22-metricas-calidad-sla`
  - `AAI-102` (`[INT-HU-23]`): `feat/AAI-102-HU-23-agendamiento-reuniones-calendario`
  - `AAI-98` (`[INT-TSK-03]`): `feat/AAI-98-TSK-03-concurrencia-informe-pruebas`
- **Cada vez que trabajemos en una subtarea (Hook automático):**
  1. Movemos **solo esa subtarea** a `En curso` y trabajamos en la rama específica de su HU.
  2. Al terminarla, registramos en Jira el **tiempo real exacto** que nos tomó (ej. `1h 20m`, `45m`), detallando qué hicimos realmente y el SHA del commit de esa rama.
  3. Generamos o tomamos una **captura de pantalla real (screenshot)** del trabajo/ejecución de esa subtarea (o se la pedimos al usuario si requiere una vista específica de su pantalla) y la subimos como adjunto a esa subtarea en Jira.
  4. Recién cuando **todas** las subtareas de una HU estén realmente completadas y probadas con el usuario, se cierra la HU y se pasa a la siguiente rama.

---

## 3. Informe Técnico Formal y Separado de Pruebas
- Toda prueba debe consolidarse en un documento técnico dedicado y exclusivo al cierre de las HUs: `docs/INFORME_DE_PRUEBAS_SPRINT_3.md`.
- Debe contener la matriz de trazabilidad estricta:
  $$\text{HU} \longrightarrow \text{CA} \longrightarrow \text{Tipo de Prueba (Unitaria / Integración)} \longrightarrow \text{Archivo Test (Jest)} \longrightarrow \text{Resultado (PASS)} \longrightarrow \text{Captura con Timestamp}$$
- Las pruebas de integración deben probar explícitamente el flujo entre módulos (ej. Botón WhatsApp ➡️ Motor IA ➡️ Generación PDF ➡️ Persistencia BD ➡️ Dashboard).

---

## 4. Desglose de Tareas y Control de Horas en Jira (Time Tracking)
- Cada Historia de Usuario debe descomponerse en subtareas técnicas claras vinculadas directamente a la resolución de sus Criterios de Aceptación.
- **Obligatorio:** Cada subtarea en Jira debe incluir **tiempo estimado** (definido en la Planning) y **tiempo real dedicado** registrado únicamente a medida que se ejecuta cada subtarea.
- *"Cada paso que demos debe quedar documentado y con sus horas reales asociadas."*

---

## 5. Sprint Goal Cuantitativo, Medible y Verificable con Indicadores
- La meta del Sprint 3 incluye **4 métricas e indicadores verificables** al cierre:
  - Latencia promedio de respuesta del bot ($< 4.0\text{ s}$).
  - Tasa de efectividad anti-alucinaciones con arnés Kronos ($100\%$ interceptado).
  - Tasa de éxito en pruebas de estrés y concurrencia ($> 99\%$ sobre $N=20$ usuarios simultáneos).
  - Tasa de generación y descarga exitosa de cotizaciones en PDF ($100\%$).
