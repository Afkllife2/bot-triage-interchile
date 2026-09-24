# Definition of Done (DoD) — Bot Triage Comercial InterChile

**Proyecto:** Bot Triage Comercial InterChile
**Versión:** 2.0 (actualizado para Sprint 2)
**Última actualización:** 24 de Septiembre 2026

> Este documento define las condiciones mínimas que deben cumplirse para declarar
> una Historia de Usuario o el incremento completo del Sprint como **TERMINADO (Done)**.
> Aplica a todos los Sprints del proyecto, con condiciones adicionales por Sprint cuando corresponda.

---

## Sección 1: Condiciones Universales (Todos los Sprints)

Estas condiciones aplican a **cada Historia de Usuario** sin excepción:

### 1.1 Código
- [ ] El código está implementado y cumple la funcionalidad descrita en la HU
- [ ] El código está en una rama `feature/` separada, nunca en `main` ni `develop` directamente
- [ ] La rama fue mergeada a `develop` al completarse
- [ ] No existen `console.log` de debugging sin propósito en producción
- [ ] Las credenciales y tokens están en `.env`, nunca hardcodeadas en el código

### 1.2 Pruebas
- [ ] Todos los Criterios de Aceptación (CA) de la HU fueron probados manualmente
- [ ] Los resultados de las pruebas están registrados en el Plan de Pruebas del Sprint
- [ ] Se adjuntó evidencia (captura de pantalla o log) por cada CA verificado
- [ ] No hay casos de prueba en estado "Fallido" sin documentar la causa

### 1.3 Base de Datos
- [ ] Los datos generados por la HU se persisten correctamente en Supabase
- [ ] No se producen registros duplicados (se valida antes de insertar)
- [ ] Los campos críticos no quedan en NULL cuando deben tener valor

### 1.4 Documentación y Trazabilidad
- [ ] La HU está marcada como "Listo" en Jira
- [ ] La Matriz de Trazabilidad refleja el estado actualizado de la HU y sus CPs
- [ ] El commit asociado referencia el ID del ticket de Jira (ej: `feat(HU-14): ...`)

---

## Sección 2: Condiciones del Incremento Completo (Por Sprint)

Estas condiciones aplican al **cierre total del Sprint**, no a HUs individuales:

### 2.1 Sprint 1 — Hito 1 (MVP Intake) ✅ COMPLETADO

| Condición | Estado |
|---|---|
| Sistema desplegado localmente con túnel Cloudflared activo | ✅ Done |
| Webhook de Meta verificado y recibiendo mensajes reales | ✅ Done |
| Base de datos Supabase con tablas `clientes` y `casos_triage` operativas | ✅ Done |
| IA (Gemini) extrae correctamente: comuna, marca, falla, prioridad | ✅ Done |
| Bot responde automáticamente al cliente por WhatsApp | ✅ Done |
| Acta de Review firmada/documentada | ✅ Done |
| Retrospectiva documentada | ✅ Done |

**Velocidad Sprint 1:** 24 Story Points

---

### 2.2 Sprint 2 — Hito 2 (Integración y Diagnóstico Dinámico)

Además de las condiciones universales, el Sprint 2 estará **Done** cuando:

#### Funcionalidad
- [ ] El bot puede sostener conversaciones multi-turno sin repetir preguntas ya respondidas
- [ ] Los datos del diagnóstico son validados contra el sistema Kronos antes de guardarlos
- [ ] Los casos críticos quedan marcados `requiere_humano: true` en Supabase automáticamente
- [ ] El Dashboard web muestra tickets en tiempo real con filtros y alertas visuales
- [ ] El bot envía botones interactivos de WhatsApp en al menos 1 punto del flujo

#### Infraestructura
- [ ] El token de Meta API es permanente (System User) — no vence en 24h
- [ ] El servidor maneja errores de Gemini y Supabase sin crashear
- [ ] El historial de conversación se persiste en BD y expira tras 60 minutos de inactividad
- [ ] Cualquier número de teléfono puede escribirle al bot (modo producción activo)

#### Integración con Sprint 1
- [ ] Las HUs del Sprint 2 no rompen ninguna funcionalidad del Sprint 1
- [ ] Al menos 1 prueba de integración documenta que el flujo completo (Sprint 1 + Sprint 2) funciona end-to-end
- [ ] El diagrama de arquitectura refleja los nuevos componentes añadidos en Sprint 2

#### Metodología Académica
- [ ] Story Points asignados a todas las HUs del Sprint en Jira
- [ ] Plan de Pruebas Sprint 2 con todas las evidencias completadas
- [ ] Matriz de Trazabilidad Sprint 2 actualizada al 100%
- [ ] Acta de Review Sprint 2 documentada
- [ ] Retrospectiva Sprint 2 documentada

**Velocidad Sprint 2 estimada:** 39 Story Points

---

## Historial de Versiones

| Versión | Fecha | Cambio |
|---|---|---|
| 1.0 | Agosto 2026 | Creación inicial para Sprint 1 |
| 2.0 | 24 Sep 2026 | Actualización para Sprint 2: condiciones de integración, velocidad, Dashboard y producción Meta |
