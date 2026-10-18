# Retrospectiva del Sprint 2 (Sprint Retrospective)

**Proyecto:** Bot Triage Comercial InterChile  
**Fecha:** 18 de Octubre de 2026  

---

## 1. ¿Qué salió bien? (Fortalezas del Sprint 2)
* **Puesta en Producción Real:** Logramos salir del entorno de números de prueba de Meta y dejamos el bot operando sobre el número comercial oficial de InterChile (**+56 9 7235 2751**).
* **Validación con el Dueño de la Empresa (Benjamín):** El cliente real probó el bot desde su teléfono, validó el flujo e incorporamos en tiempo real su feedback comercial (opción de **Arriendo** y entrega de sus datos directos al derivar).
* **Arquitectura de Arneses de IA (HU-21):** La separación entre la extracción semántica (`src/brain.js`) y la validación determinista contra el catálogo de Kronos (`src/arneses.js` + `src/kronos.js`) permitió alcanzar un 100% de detección de alucinaciones en las 17 pruebas unitarias con Jest.
* **Trazabilidad Completa en Jira y GitHub:** Todas las Historias de Usuario cuentan con su diagrama de flujo Mermaid/PNG adjunto en Jira ("Regla de Oro"), sus capturas de evidencia real y su rama específica o conjunta en GitHub.

## 2. ¿Qué desafíos técnicos enfrentamos y cómo se resolvieron?
* **Límite de 3 botones en Meta WhatsApp API:** Al agregar la 4ª opción comercial ("Arriendo"), la API de botones rápidos de Meta tenía un tope estricto de 3 botones. Se resolvió programando una conmutación automática en `src/whatsapp.js` y `src/server.js` hacia **Mensajes de Lista Interactiva (`list` / `list_reply`)** cuando existen entre 4 y 10 opciones.
* **Limpieza de Timers en Pruebas Automatizadas:** El helper `conTimeout(8000)` dejaba promesas de reloj pendientes al terminar los tests rápidos. Se perfeccionó con `.finally(() => clearTimeout(timer))` para lograr una ejecución de Jest limpia sin *open handles*.

## 3. Compromisos de Mejora para el Cierre Final (Hito 3)
* Mantener la cobertura del 100% en las pruebas unitarias ante cualquier ajuste futuro del prompt.
* Utilizar las evidencias reales generadas en el número de producción (+56 9 7235 2751) y el Dashboard Web como eje central de la defensa oral ante la comisión evaluadora.
