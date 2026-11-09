# Reglas Obligatorias de Metodología y Calidad — Sprint 3 (Profesora Sarita González)

> **PROPÓSITO:** Reglas incondicionales y directrices permanentes para el desarrollo del **Sprint 3 (Cierre de Titulación)**. Estas reglas se aplican de forma automática y proactiva en cada sesión, sin necesidad de que el estudiante las recuerde.

---

## 1. Definition of Done (DoD) Corta, Directa y Consecuente
- El DoD debe ser **sintético, directo al hueso y 100% consecuente** con el trabajo real realizado (evitar formulaciones abstractas o infladas).
- Condiciones esenciales:
  1. Código operativo y desplegado en Render (HTTPS/SSL).
  2. Criterios de Aceptación (CA) BDD cubiertos con casos positivos, negativos y fallbacks.
  3. Pruebas automatizadas en Jest (Unitarias + Integración) con 100% PASS.
  4. Commits semánticos en GitHub con ramas de feature y Tag formal de release.
  5. Subtareas en Jira con horas estimadas y registradas (Time Tracking).

---

## 2. Informe Técnico Formal y Separado de Pruebas
- Toda prueba debe consolidarse en un documento técnico dedicado y exclusivo: `docs/INFORME_DE_PRUEBAS_SPRINT_3.md`.
- Debe contener la matriz de trazabilidad estricta:
  $$\text{HU} \longrightarrow \text{CA} \longrightarrow \text{Tipo de Prueba (Unitaria / Integración)} \longrightarrow \text{Archivo Test (Jest)} \longrightarrow \text{Resultado (PASS)} \longrightarrow \text{Captura con Timestamp}$$
- Las pruebas de integración deben probar explícitamente el flujo entre módulos (ej. Botón WhatsApp ➡️ Motor IA ➡️ Generación PDF ➡️ Persistencia BD ➡️ Dashboard).

---

## 3. Desglose de Tareas y Control de Horas en Jira (Time Tracking)
- Cada Historia de Usuario debe descomponerse en subtareas técnicas claras vinculadas directamente a la resolución de sus Criterios de Aceptación.
- **Obligatorio:** Cada subtarea en Jira debe incluir **tiempo estimado** y **tiempo real dedicado** (horas/minutos), para demostrar cuantitativamente el esfuerzo de desarrollo por cada CA.
- *"Cada paso que demos debe quedar documentado y con sus horas asociadas."*

---

## 4. Sprint Goal Cuantitativo, Medible y Verificable con Indicadores
- La meta del Sprint 3 **no puede ser solo descriptiva**. Debe incluir **métricas e indicadores verificables** al cierre:
  - Latencia promedio de respuesta del bot ($< 4.0\text{ s}$).
  - Tasa de efectividad anti-alucinaciones con arnés Kronos ($100\%$ interceptado).
  - Tasa de éxito en pruebas de estrés y concurrencia ($> 99\%$ sobre $N$ usuarios simultáneos).
  - Tasa de generación y descarga exitosa de cotizaciones en PDF ($100\%$).
- Al cierre del Sprint 3, se debe emitir un reporte cuantitativo demostrando con métricas si la meta fue alcanzada.

---

## 5. Trazabilidad y Evidencias Proactivas
- Cada avance, prueba ejecutada o ajuste de código debe acompañarse inmediatamente de su evidencia visual (screenshot/log), su commit correspondiente y su actualización en Jira, evitando acumular trabajo retrospectivo para las revisiones.
