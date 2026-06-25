# Sprint 3 - Hito 3 Bot Verificador X

Periodo planificado: 25-05-2026 al 12-06-2026  
Objetivo del sprint: corregir formalmente las observaciones de Hitos 1 y 2, completar el prototipo de mitigacion del riesgo tecnico principal y validar con evidencia objetiva que la mitigacion funciona.

## Riesgo tecnico principal

Falla de integracion entre X, el backend del Bot Verificador y el servicio NLP/IA.

Este riesgo cubre problemas de credenciales, cambios de contrato de APIs, timeouts, respuestas invalidas del servicio IA/NLP, fallas de red, errores al publicar respuesta en X y falta de trazabilidad entre entrada, analisis, respuesta y metrica.

## Definition of Done del Sprint 3

- Cada observacion relevante de Hitos 1 y 2 queda registrada en una matriz de correcciones con evidencia del cambio.
- El prototipo tiene diseño documentado y alineado explicitamente con el riesgo tecnico principal.
- El prototipo demuestra flujo completo con mocks controlados o adaptadores desacoplados para X y NLP/IA.
- Existen pruebas automatizadas o documentadas para exito, error, timeout y respuesta invalida.
- Se registran evidencias tecnicas: capturas, resultados de pruebas, diagramas actualizados, configuracion y repositorio.
- El informe Hito 3 referencia figuras, tablas, anexos, resultados y tickets Jira.
- No se afirma integracion productiva real si solo existe simulacion o mock.

## Epica sugerida

### IABV-H3 - Hito 3: Prototipo de mitigacion y validacion

Descripcion: consolidar el proyecto a partir de las correcciones de Hitos 1 y 2, desarrollar el prototipo de mitigacion del riesgo tecnico de integracion X-backend-NLP/IA y validar objetivamente sus resultados.

## Tickets del Sprint 3

| Codigo | Tipo | Resumen | Prioridad | Inicio | Termino | Criterio rubrica |
| --- | --- | --- | --- | --- | --- | --- |
| H3-01 | Tarea | Crear matriz de correcciones Hitos 1 y 2 con evidencia | Alta | 25-05-2026 | 26-05-2026 | 1.1, 1.2 |
| H3-02 | Tarea | Aplicar correcciones criticas del Hito 2 en informe base | Alta | 26-05-2026 | 28-05-2026 | 1.1, 1.2 |
| H3-03 | Tarea | Actualizar diagramas tecnicos alineados al riesgo de integracion | Alta | 28-05-2026 | 30-05-2026 | 2.1, 2.3, 4.3 |
| H3-04 | Historia | Documentar diseno del prototipo de mitigacion | Alta | 30-05-2026 | 01-06-2026 | 2.1 |
| H3-05 | Historia | Refactorizar prototipo con adaptadores X y NLP/IA desacoplados | Alta | 01-06-2026 | 03-06-2026 | 2.2 |
| H3-06 | Historia | Implementar manejo de errores, timeouts y respuestas invalidas | Alta | 03-06-2026 | 04-06-2026 | 2.2, 3.1 |
| H3-07 | Tarea | Implementar trazabilidad y metricas de validacion del prototipo | Media | 04-06-2026 | 05-06-2026 | 2.3, 3.1 |
| H3-08 | Tarea | Crear pruebas de validacion para flujo exitoso y fallas controladas | Alta | 05-06-2026 | 08-06-2026 | 3.2 |
| H3-09 | Tarea | Ejecutar pruebas y registrar resultados objetivos | Alta | 08-06-2026 | 09-06-2026 | 3.2, 3.3 |
| H3-10 | Tarea | Analizar resultados y demostrar mitigacion del riesgo tecnico | Alta | 09-06-2026 | 10-06-2026 | 3.3 |
| H3-11 | Tarea | Redactar informe Hito 3 con evidencias y referencias internas | Alta | 10-06-2026 | 11-06-2026 | 4.1, 4.2, 4.3 |
| H3-12 | Tarea | Revision final contra rubrica y checklist de entrega | Alta | 11-06-2026 | 12-06-2026 | 1.1-4.3 |

## Detalle de tickets

### H3-01 - Crear matriz de correcciones Hitos 1 y 2 con evidencia

Descripcion: construir una tabla de trazabilidad que liste observacion recibida, correccion aplicada, ubicacion en el documento y evidencia asociada.

Criterios de aceptacion:
- Incluye observaciones de Hito 2 y, si estan disponibles, observaciones de Hito 1.
- Cada correccion tiene evidencia concreta y ubicacion en el informe.
- No se inventan observaciones que no esten respaldadas.

### H3-02 - Aplicar correcciones criticas del Hito 2 en informe base

Descripcion: asegurar que el informe base corregido contenga arquitectura, diagramas, pruebas, configuracion, gestion de cambios, riesgo tecnico y numeracion de paginas corregidos.

Criterios de aceptacion:
- El riesgo principal se formula como integracion X-backend-NLP/IA.
- Los diagramas se nombran formalmente y coinciden con su tipo.
- El informe diferencia claramente prototipo local/mock de integracion productiva.

### H3-03 - Actualizar diagramas tecnicos alineados al riesgo de integracion

Descripcion: actualizar o crear diagramas de contexto, componentes, despliegue y flujo de validacion, todos alineados con el prototipo y el riesgo principal.

Criterios de aceptacion:
- Diagrama de contexto muestra usuario, X, bot, NLP/IA y persistencia.
- Diagrama de componentes muestra adaptadores, servicios, repositorios y responsabilidades.
- Diagrama de despliegue distingue ambiente local/MVP y despliegue proyectado.

### H3-04 - Documentar diseno del prototipo de mitigacion

Descripcion: describir objetivo, alcance, arquitectura, componentes, tecnologias, contratos de entrada/salida y criterios de exito del prototipo.

Criterios de aceptacion:
- El diseno explica directamente como mitiga el riesgo tecnico.
- Incluye criterios medibles: disponibilidad, respuesta estructurada, manejo de error y trazabilidad.
- La descripcion coincide con lo implementado.

### H3-05 - Refactorizar prototipo con adaptadores X y NLP/IA desacoplados

Descripcion: separar la logica de integracion en modulos/adaptadores para permitir mock, simulacion y reemplazo futuro por servicios reales.

Criterios de aceptacion:
- Existe un adaptador para entrada/salida de X.
- Existe un adaptador para servicio NLP/IA.
- La logica de verificacion no depende directamente de Express ni de proveedores externos.

### H3-06 - Implementar manejo de errores, timeouts y respuestas invalidas

Descripcion: agregar rutas de fallo controladas para errores de API, timeout del servicio NLP/IA y respuestas no estructuradas.

Criterios de aceptacion:
- Ante timeout se entrega respuesta segura y se registra metrica.
- Ante respuesta invalida del NLP/IA se evita publicar veredicto categorico.
- Los errores quedan trazables para analisis posterior.

### H3-07 - Implementar trazabilidad y metricas de validacion del prototipo

Descripcion: registrar datos minimos de ejecucion para validar la mitigacion: timestamp, source, userId, verdict, confidence, latency, status y errorType cuando corresponda.

Criterios de aceptacion:
- Las metricas permiten comparar flujo exitoso y fallido.
- El endpoint de metricas refleja los resultados de pruebas.
- La evidencia puede insertarse como tabla/captura en el informe.

### H3-08 - Crear pruebas de validacion para flujo exitoso y fallas controladas

Descripcion: definir y automatizar/documentar pruebas de validacion para los escenarios principales del prototipo.

Criterios de aceptacion:
- Incluye prueba de health check.
- Incluye prueba de verificacion exitosa.
- Incluye prueba de webhook desde X mock.
- Incluye prueba de timeout o error NLP/IA.
- Incluye prueba de respuesta invalida o incompleta.

### H3-09 - Ejecutar pruebas y registrar resultados objetivos

Descripcion: ejecutar las pruebas del prototipo y guardar resultados, capturas o salidas de consola como evidencia.

Criterios de aceptacion:
- Se documenta fecha, comando ejecutado, resultado y evidencia.
- Se registran capturas de endpoints clave.
- Los resultados son coherentes con los criterios de validacion.

### H3-10 - Analizar resultados y demostrar mitigacion del riesgo tecnico

Descripcion: comparar los resultados obtenidos con los criterios definidos y concluir si el riesgo fue mitigado total o significativamente.

Criterios de aceptacion:
- El analisis no se limita a decir "funciona"; interpreta evidencia.
- Identifica limitaciones reales del prototipo.
- Explica que queda pendiente para produccion.

### H3-11 - Redactar informe Hito 3 con evidencias y referencias internas

Descripcion: integrar correcciones, diseno, implementacion, validacion y analisis en el documento final.

Criterios de aceptacion:
- Incluye portada, indice, numeracion, referencias y anexos.
- Cada figura, tabla y captura esta identificada y explicada.
- La redaccion usa terminologia tecnica consistente.

### H3-12 - Revision final contra rubrica y checklist de entrega

Descripcion: revisar el documento final punto por punto contra la rubrica antes de exportar y entregar.

Criterios de aceptacion:
- Cada criterio de la rubrica tiene evidencia localizada.
- No hay afirmaciones sin respaldo.
- El documento esta listo para exportar en PDF.
