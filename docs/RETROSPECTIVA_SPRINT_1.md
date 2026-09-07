# Retrospectiva Individual y Cierre - Sprint 1

**Proyecto:** Bot Triage Comercial InterChile  
**Fecha:** Septiembre 2026  

---

## 1. Cierre Formal del Sprint
De acuerdo a la metodología ágil, se declara el cierre oficial del Sprint 1 con los siguientes resultados:
- **Sprint Goal:** ALCANZADO de forma exitosa. Se logró el MVP del Triage automatizado por WhatsApp.
- **Estado de las Historias de Usuario (HU):**
  - HU-01 (Webhooks): Done
  - HU-03 (BD Supabase): Done
  - HU-04 (Triage IA Gemini): Done
  - HU-07 (Gestión de Riesgos): Done
  - HU-08 (Pruebas y Trazabilidad): Done
  - HU-NEW (Mensajería Outbound): Done
- **Trabajo que continúa:** Todas las HU seleccionadas quedaron en estado *Done*. El trabajo que pasa al Sprint 2 se centrará en la integración del sistema con el ERP Legacy (Kronos) y mejoras de infraestructura de tokens.

---

## 2. Análisis Crítico: Resultados del Producto vs Problemas del Proceso

### 2.1 Resultados del Producto (Lo técnico)
- **Qué salió bien:** El motor de IA (Gemini) demostró ser extremadamente rápido y preciso para extraer entidades (comuna, marca, falla) sin incurrir en alucinaciones, gracias a un System Prompt muy restrictivo. La conexión con Supabase es robusta.
- **Qué salió mal:** La API de WhatsApp Cloud resultó ser estricta con el formato de los payloads, lo que generó un par de errores 400 (Bad Request) iniciales al enviar plantillas incorrectas.

### 2.2 Problemas del Proceso (Lo metodológico)
- **Qué salió mal:** Al principio del proyecto hubo una desviación metodológica; se intentó planificar funcionalidades sin haber hecho un levantamiento real con el Stakeholder. Además, dependimos de túneles inestables (Ngrok) que causaron caídas de los webhooks locales.
- **Qué salió bien:** Se aplicó una excelente **Gestión del Cambio**. Se detuvo la planificación teórica, se levantaron requerimientos reales con InterChile y se ajustaron los objetivos del proyecto. Se reemplazó Ngrok por Cloudflared logrando estabilidad.

---

## 3. Mejora Continua y Acciones para el Sprint 2

| Análisis | Descripción | Acciones Concretas y Verificables (Sprint 2) |
| :--- | :--- | :--- |
| **Aspectos a Mantener** | La adaptabilidad ágil y la documentación inmediata de cada hallazgo y reunión (Actas). | Seguir documentando la trazabilidad (HU -> Prueba -> Evidencia) de forma estricta. |
| **Aspectos a Mejorar (Causas)** | La configuración de credenciales manuales (Tokens temporales) quita tiempo de desarrollo. | Automatizar la renovación de tokens o configurar un *System User Token* permanente en Meta for Developers. |
| **Aprendizajes Clave** | Leer la documentación oficial de las APIs externas (Meta/Supabase) antes de codificar ahorra horas de debugging. | Para la integración con Kronos, solicitar manuales de API o acceso a sandbox antes de crear las HU. |
