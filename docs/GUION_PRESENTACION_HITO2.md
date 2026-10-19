# Guion y Estructura de Presentación — Hito 2 (Sprint 2)

**Proyecto:** Bot Triage Comercial InterChile  
**Evaluador:** Prof. Matías Vargas Marín  
**Formato Oficial:** 20 minutos estrictos  
- ⏱️ **00:00 - 05:00 (5 min):** Requerimientos y Contexto del Negocio  
- ⏱️ **05:00 - 10:00 (5 min):** Arquitectura y Decisiones Técnicas  
- ⏱️ **10:00 - 17:00 (7 min):** Demostración en Vivo en 3 Actos (Clímax)  
- ⏱️ **17:00 - 20:00 (3 min):** Calidad, Trazabilidad, Evidencias y Cierre  

---

## 1. Mapa de Diapositivas Sugeridas y Recursos Visuales

| Nº | Título de la Diapositiva | Recurso Visual Recomendado | Mensaje Clave |
|---|---|---|---|
| **1** | Portada y Presentación | Logo InterChile + Subtítulo formal Hito 2 | Equipo, cliente real y rol del proyecto. |
| **2** | El Problema del Negocio | 4 tarjetas: Demora, Desorden, Preguntas repetitivas, Alucinación | El cuello de botella humano en WhatsApp. |
| **3** | Requerimientos y Cambio Controlado | Matriz resumida HU + Nota de feedback del dueño (Arriendo + Benjamín) | Agilidad real con requerimientos en Dado/Cuando/Entonces. |
| **4** | Arquitectura en 5 Capas | Diagrama de `docs/ARQUITECTURA_V2.md` | Flujo desacoplado: HMAC → LangChain → Arnés → Supabase → Render. |
| **5** | Decisiones Clave de Ingeniería | 3 columnas: Zod (determinismo), Flash (3 s vs 8 s), Arnés (seguridad) | Justificación técnica basada en datos y benchmarks. |
| **6** | Modelo de Datos y Estados | Diagrama ER de `docs/DISENO_DATOS_SPRINT2.md` | `clientes` (1) a `casos_triage` (N), estados `en_proceso` y `derivado`. |
| **7** | **DEMO EN VIVO (Sin diapositivas)** | Pantalla dividida: WhatsApp oficial a la izq. / Dashboard en Render a la der. | Acto 1 (Menú), Acto 2 (Derivación), Acto 3 (Arnés CoolBreeze). |
| **8** | Calidad y Pruebas Automatizadas | Captura de los **32 tests Jest en verde** + Plan de 24 CPs | Calidad comprobable unitaria y de integración HTTP. |
| **9** | Gestión Ágil y Trazabilidad | Tablero Jira (12 HU en Listo con adjuntos) + Grafo Git con ramas por HU | Trazabilidad total HU → Rama → Código → Prueba → Evidencia. |
| **10** | Conclusiones y Hito 3 | Tabla comparativa Hito 1 vs Hito 2 + Proyección a Hito 3 | Cierre transparente con visión de producto final. |

---

## 2. Guion del Expositor (Minuto a Minuto con texto sugerido)

### [00:00 - 05:00] BLOQUE 1: Requerimientos y Contexto

#### Diapositiva 1 · Portada (0:00 - 0:30)
> *"Buenos días profesor y compañeros. Hoy presentamos el cierre del Sprint 2 para InterChile, empresa líder en climatización comercial e industrial. En este sprint convertimos un prototipo inicial en un sistema de triage conversacional resiliente, desplegado 24/7 en la nube, blindado con arneses anti-alucinación y respaldado por un panel de control en tiempo real."*

#### Diapositiva 2 · Los 4 Dolores de InterChile (0:30 - 2:00)
> *"El problema de InterChile no es la demanda, sino el cuello de botella operativo en WhatsApp. Diariamente reciben decenas de mensajes con requerimientos radicalmente distintos: desde fallas críticas de aires acondicionados en clínicas o salas de servidores, hasta empresas pidiendo cotizaciones de arriendo para eventos masivos. Antes, una persona debía clasificar esto de forma manual, generando demoras, preguntas repetitivas y datos erróneos de equipos. Nuestro sistema automatiza la captura y clasificación sin perder la calidez comercial, asegurando que las fallas de prioridad Alta se atiendan en minutos."*

#### Diapositiva 3 · Historias de Usuario y Cambio Controlado (2:00 - 5:00)
> *"Para este sprint comprometimos 6 historias de usuario principales: memoria conversacional multi-turno (HU-02), derivación inteligente con silencio post-escalamiento (HU-06), panel de control web (HU-14 y HU-19), resiliencia y timeouts (HU-16), menús interactivos de WhatsApp (HU-20) y nuestro arnés anti-alucinación contra catálogo técnico (HU-21).*  
> *Además, aplicamos agilidad real: tras una reunión con el cliente, incorporamos un cambio controlado: agregar la categoría 'Arriendo' que no estaba en el alcance original y configurar la derivación personalizada hacia el ejecutivo Benjamín Yáñez con su contacto corporativo. Todo quedó formalizado con criterios de aceptación en formato Dado/Cuando/Entonces y gestionado en Jira."*

---

### [05:00 - 10:00] BLOQUE 2: Arquitectura y Decisiones de Ingeniería

#### Diapositiva 4 · Arquitectura por Capas y Desacoplamiento (5:00 - 7:00)
> *"A nivel de diseño técnico, evitamos el error común de conectar WhatsApp directamente a un prompt de IA sin control. Implementamos una arquitectura en 5 capas:*
> 1. *Capa de Entrada: Webhook en Express alojado en Render con validación criptográfica HMAC-SHA256.*
> 2. *Capa Cognitiva: LangChain junto a Gemini 2.5 Flash, donde la salida no es texto libre sino un esquema Zod estructurado y tipado.*
> 3. *Capa de Arneses Defensivos: Antes de que cualquier dato llegue a la base de datos, el payload es interceptado y validado contra el catálogo de Kronos.*
> 4. *Capa de Persistencia: Supabase PostgreSQL con transacciones ACID e índices B-Tree específicos para ordenamiento y filtros.*
> 5. *Capa de Salida y Observabilidad: Envío a WhatsApp Cloud API y visualización en tiempo real en nuestro Dashboard."*

#### Diapositiva 5 · Decisiones Críticas y Benchmarks (7:00 - 9:00)
> *"Frente a las decisiones técnicas tomamos posturas de ingeniería justificadas:*
> - *¿Por qué Zod Structured Output? Porque elimina por completo el riesgo de que la IA responda un JSON mal formado o con campos faltantes.*
> - *¿Por qué Gemini 2.5 Flash? Realizamos benchmarks empíricos en vivo: los modelos de razonamiento profundo o versiones más pesadas tardan más de 8 segundos en resolver la ficha, lo que dispararía timeouts en WhatsApp. Gemini 2.5 Flash responde en 3.086 milisegundos con 100% de precisión y costo óptimo.*
> - *¿Por qué arneses en código y no en el prompt? Porque los modelos de lenguaje siempre son probabilísticos. Un sistema institucional jamás debe delegarle la validación de repuestos o marcas a la 'promesa' de un prompt; lo valida código determinista."*

#### Diapositiva 6 · Modelo de Datos Relacional (9:00 - 10:00)
> *"Nuestro modelo en PostgreSQL vincula clientes únicos por su número de teléfono con múltiples casos de triage. Cada caso maneja estados de ciclo de vida: nace 'en_proceso' y si el cliente requiere un ejecutivo o el triage se completa, pasa automáticamente a 'derivado' activando la bandera 'requiere_humano' que resalta en amarillo en el panel del despachador."*

---

### [10:00 - 17:00] BLOQUE 3: Demostración en Vivo (7 minutos)

*(Transición: Minimizar presentación. Proyectar WhatsApp a la izquierda y el Dashboard `https://bot-triage-interchile.onrender.com/` a la derecha).*

#### Acto 1 · Saludo y Conmutación de Menús Interactivas (10:00 - 12:00)
- **Acción:** Enviar *"Hola buenas"* a `+56 9 7235 2751`.
- **Qué decir:**
  > *"Enviamos un saludo al número oficial de InterChile. Observen que el bot responde de inmediato con el componente interactivo 'Ver opciones'. Como en este sprint incorporamos 'Arriendo', tenemos 4 opciones; el bot detecta que supera el límite de 3 botones de Meta y conmuta dinámicamente a un mensaje de lista interactiva."*

#### Acto 2 · Derivación Ejecutiva y Silencio Post-Escalamiento (12:00 - 14:00)
- **Acción:** Seleccionar *"Proyecto Comercial"*. Luego escribir *"¿Aló?"*.
- **Qué decir:**
  > *"Al seleccionar Proyecto Comercial, la IA identifica que un proyecto de climatización requiere planos y cubicación de ingeniería. Deriva al cliente entregando el correo y WhatsApp oficial de Benjamín. Y fíjense en la fila del Dashboard: el caso #71 apareció automáticamente en estado 'derivado' con la alerta 'Requiere Humano'.*  
  > *Ahora, si el cliente vuelve a escribir '¿Aló?', se activa el Arnés de Silencio (HU-06 CA-3): la IA se apaga para esta conversación y el servidor devuelve una respuesta estática, protegiendo al negocio de contradicciones y ahorrando tokens."*

#### Acto 3 · La Prueba de Oro: Arnés Anti-Alucinación (14:00 - 17:00)
- **Acción:** Enviar desde otro número:
  *"Hola, tengo un equipo marca CoolBreeze Pro X9000 con falla en la turbina hiperbárica en Las Condes"*.
  Completar con nombre *"Benjamín Yáñez, Ramón Polanco 1250"* y disponibilidad *"8 a 8"*.
- **Qué decir:**
  > *"Ahora simulamos un cliente que introduce términos técnicos ficticios: una marca inexistente ('CoolBreeze Pro X9000') y un repuesto inventado ('turbina hiperbárica').*  
  > *En el chat de WhatsApp, el bot responde cordialmente para no generar fricción comercial ni incomodar al cliente. Pero observemos qué ocurrió en la base de datos y en el Dashboard:*  
  > *Miren la fila #75: en la columna EQUIPO se registró automáticamente: `[dato por confirmar] - [dato por confirmar]`. Nuestro arnés HU-21 interceptó el intento de alucinación contra el catálogo de Kronos y sanitizó el dato antes de persistir, alertando al despachador en el panel superior que dice: '5 ticket(s) requieren atención humana urgente'. Esto demuestra ingeniería de software defensiva."*

---

### [17:00 - 20:00] BLOQUE 4: Calidad, Trazabilidad y Cierre

#### Diapositiva 8 · Validación y Suite de Pruebas (17:00 - 18:00)
> *"Para garantizar que nada de esto falle en producción, creamos una suite automatizada en Jest con 32 pruebas que pasan al 100%: 17 pruebas unitarias sobre los arneses de inmutabilidad y reglas de negocio, y 15 pruebas de integración HTTP con supertest que validan la seguridad HMAC, los payloads de botones y listas, y el comportamiento del dashboard ante excepciones de red."*

#### Diapositiva 9 · Trazabilidad en Jira y Control de Versiones (18:00 - 19:00)
> *"En gestión del proyecto, mantuvimos una trazabilidad total: las 12 historias de usuario del Sprint 2 están en estado 'Listo' en Jira, cada una con su diagrama de flujo bajo la Regla de Oro, capturas de evidencia y justificaciones. En GitHub, cada HU se desarrolló en su propia rama individual con commits semánticos y merges formales sin fast-forward hacia develop y main."*

#### Diapositiva 10 · Autocrítica y Proyección al Hito 3 (19:00 - 20:00)
> *"Como balance técnico honesto, reconocemos los límites actuales de este prototipo: el catálogo Kronos corre sobre una interfaz simulada y la memoria reside en RAM. Para el Hito 3 conectaremos Kronos al ERP real de InterChile y persistiremos la sesión en Supabase.*  
> *Hoy dejamos un producto 100% operativo en la nube, con token permanente de Meta, validado con clientes reales y con una arquitectura sólida y extensible. Quedamos a su disposición para sus preguntas. Muchas gracias."*

---

## 3. Respuestas Rápidas para la Ronda de Preguntas

- **P: ¿Por qué no usar directamente ChatGPT o Claude?**  
  *R:* Porque Gemini 2.5 Flash nos ofrece la mejor relación costo-latencia (< 3.1 s) integrado de forma nativa con LangChain y structured outputs con Zod, lo cual es vital para cumplir con el SLA de WhatsApp de 8 segundos.

- **P: ¿Qué pasa si se cae Supabase o la base de datos se satura?**  
  *R:* El código en `src/db.js` y `src/server.js` aísla los fallos de persistencia en bloques try/catch transaccionales con rollback; el error se audita en `logs/error.log` y a Meta siempre le devolvemos HTTP 200 con una respuesta comercial al cliente para no congelar la experiencia del usuario.

- **P: ¿Por qué separaron los arneses de la IA?**  
  *R:* Porque un LLM es un modelo estocástico. La única manera de garantizar consistencia de datos de grado empresarial es desacoplar la extracción semántica de la validación sintáctica y de catálogo mediante código determinista inmutable.
