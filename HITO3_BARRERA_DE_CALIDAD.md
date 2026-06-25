# Hito 3 - Barrera de calidad

Este archivo convierte la retroalimentacion del Hito 2 en condiciones de entrega. Ningun punto se considerara terminado solo porque este mencionado: debe contar con evidencia en el informe, en Jira, en el repositorio y, cuando aplique, en una prueba ejecutable o una captura.

## 1. Riesgo tecnico principal: integracion del bot

**Riesgo priorizado:** que la integracion entre X, el backend del Bot Verificador y el motor NLP/IA falle, entregue respuestas tardias o produzca una respuesta no interpretable para el usuario.

| Elemento | Definicion exigida |
| --- | --- |
| Causa | Credenciales o permisos incompletos, limites de tasa de X, caida o latencia del proveedor IA/NLP, cambios de contrato y errores de red. |
| Probabilidad | Media. |
| Impacto | Alto: el bot no responde, responde tarde o publica una respuesta no confiable. |
| Mitigacion | Adaptadores aislados para X y NLP, validacion de payloads, timeout, reintentos limitados, registro de errores, respuesta segura ante falla y pruebas de contrato con mocks. |
| Evidencia minima | Diagrama de secuencia, contrato de entrada/salida, prueba de exito, prueba de timeout/error y metrica de latencia/error. |
| Criterio de exito | Ante una falla simulada del proveedor, el backend no cae y entrega una respuesta controlada o deja el evento registrado para reintento. |

El riesgo de veredictos poco confiables se mantiene, pero como riesgo secundario de calidad del analisis. No debe reemplazar al riesgo de integracion tecnica.

## 2. Arquitectura que debe quedar explicita

La arquitectura propuesta es **monolito modular en capas**, desplegable como contenedor Docker. No es una arquitectura de microservicios.

| Capa o modulo | Responsabilidad | Evidencia esperada |
| --- | --- | --- |
| Adaptador X | Recibe webhook, valida evento y publica la respuesta. | Contrato del webhook y prueba con payload de X. |
| API/Aplicacion | Orquesta el caso de uso de verificacion. | Endpoint, diagrama de secuencia y prueba de integracion. |
| Dominio | Evalua fuentes, senales, confianza, contexto y veredicto. | Reglas documentadas y pruebas unitarias. |
| Adaptador NLP/IA | Encapsula el proveedor y traduce su respuesta al dominio. | Interfaz, mock de contrato y manejo de timeout/error. |
| Persistencia | Guarda solicitudes, resultados, latencia y estado operativo. | Esquema PostgreSQL, migracion y prueba de repositorio. |
| Observabilidad | Registra metricas, errores y trazabilidad por solicitud. | Endpoint/panel de metricas y capturas de ejecucion. |

Todo diagrama debe declarar su tipo y cumplir su notacion:

- Contexto C4: personas y sistemas externos; sin clases ni detalles internos.
- Contenedores/componentes: modulos internos, interfaces, dependencias y protocolos.
- Despliegue: nodos/entornos, contenedores, red, puertos, variables y servicios administrados.
- Secuencia: solicitud desde X, validacion, consulta al NLP/IA, persistencia y respuesta; incluir escenarios de error.

## 3. Pruebas: matriz obligatoria

| Nivel | Caso minimo | Resultado esperado | Evidencia |
| --- | --- | --- | --- |
| Unitario | Clasificacion de senales y calculo de confianza. | Veredicto y contexto coherentes. | Jest. |
| Unitario | Adaptador NLP con respuesta invalida. | Error traducido y sin caida del proceso. | Jest. |
| Integracion | `POST /verify` con entrada valida. | Respuesta con veredicto, contexto, fuentes y recomendacion. | Supertest. |
| Integracion | Webhook de X valido. | Evento procesado, respuesta preparada y metrica guardada. | Supertest + mock. |
| Resiliencia | Timeout/error del proveedor NLP. | Fallback controlado, log y estado recuperable. | Prueba automatizada. |
| Persistencia | Registro de analisis y metrica. | Datos consultables en PostgreSQL. | Prueba de repositorio/integracion. |
| E2E | Flujo de una mencion hasta la respuesta simulada. | Trazabilidad completa por id de solicitud. | Captura y salida de prueba. |

Cada caso debe indicar: identificador, precondicion, datos de entrada, pasos, resultado esperado, resultado obtenido, responsable y fecha de ejecucion.

## 4. Gestion de configuracion y cambios

- Ramas: `main` (estable), `develop` (integracion), `feature/IABV-XX-descripcion` y `fix/IABV-XX-descripcion`.
- Commits: formato `tipo(IABV-XX): descripcion breve`; ejemplos: `feat(IABV-31): agrega adaptador NLP` y `test(IABV-31): cubre timeout del proveedor`.
- Versionado: SemVer. Correcciones compatibles `PATCH`, funcionalidad compatible `MINOR`, cambios incompatibles `MAJOR`.
- Pull request obligatorio hacia `develop`, con pruebas ejecutadas, issue Jira enlazado y revision antes de fusionar.
- Secretos exclusivamente en `.env`; se versiona solo `.env.example`.
- Cambios controlados mediante ticket Jira: solicitud, impacto tecnico, prioridad, aprobacion, implementacion, prueba y cierre.

## 5. Evidencia documental que no se puede omitir

- Tabla inicial de observaciones del Hito 2: observacion, correccion aplicada, ubicacion en Hito 3 y evidencia.
- Numeracion de paginas, indice actualizado, figuras numeradas y citadas desde el texto.
- Referencias tecnicas completas y consistentes para X API, proveedor IA/NLP, Node/Express, PostgreSQL, Docker, AWS y herramientas de prueba.
- Descripcion tecnica del frontend, backend, base de datos, Git, testing, Docker, Jira y nube: para que se usa, por que fue elegido y como se integra al proyecto.
- Capturas legibles del prototipo, resultados de pruebas, Jira y despliegue. Una captura sin explicacion no cuenta como evidencia suficiente.

## 6. Definition of Done por ticket

Un ticket del Hito 3 solo se cierra cuando cumple todo lo siguiente:

- Tiene criterio de aceptacion verificable.
- Su rama, commit y pull request referencian el ticket Jira.
- Incluye prueba automatizada o justificacion tecnica documentada de por que no aplica.
- Tiene evidencia de ejecucion reproducible.
- La documentacion, diagramas y matriz de pruebas se actualizaron si el cambio las afecta.
- Se verifico que no expone secretos, datos personales ni credenciales.

## 7. Puerta de entrega

Antes de exportar el informe o presentar, se hara una revision final contra la rubrica. Si un criterio no puede responderse con una cita, una figura, un enlace Jira o una prueba, permanece pendiente. La meta no es solo que el proyecto "se vea completo", sino que cada afirmacion pueda demostrarse.
