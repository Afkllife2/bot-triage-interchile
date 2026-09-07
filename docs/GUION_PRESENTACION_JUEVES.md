# Guion de Presentación (Jueves) - Hacking a la Rúbrica

Este guion está diseñado para que durante tu presentación menciones explícitamente las "palabras clave" que los evaluadores (como la Prof. Sarita) tienen en su rúbrica. Hacer esto les facilita ponerte la nota máxima.

---

## Minuto 1-2: Introducción y Consistencia (Puntos 1 y 7 de la rúbrica)
- **Lo que debes decir:** "Buenos días profesores. Hoy presento el cierre de nuestro Sprint 1. Para empezar, quiero destacar la **consistencia de nuestra Meta del Sprint con los Objetivos del Proyecto**. Nuestro objetivo general es automatizar el intake comercial y técnico, por lo que la meta de este Sprint fue construir la infraestructura base y validar el motor de IA."
- **Qué mostrar:** Muestra brevemente el documento `ALINEACION_OBJETIVOS.md` o menciona que lo tienes formalmente documentado.

## Minuto 3-4: Refinamiento y Gestión del Backlog (Puntos 2, 4 y 11)
- **Lo que debes decir:** "Durante el Sprint tuvimos que hacer **Gestión de Cambios**. En nuestras reuniones de revisión con los profesores (Prof. Madrid/Sarita), detectamos que para aportar valor real al cliente debíamos incluir mensajes *Outbound* (que el bot responda). Registramos esto en nuestra acta de reuniones, modificamos el backlog y refinamos las **Historias de Usuario** usando el formato *Given-When-Then*."
- **Qué mostrar:** Muestra tu Jira. Haz énfasis en que las Historias de Usuario tienen subtareas y Criterios de Aceptación claros.

## Minuto 5-7: Demostración del Incremento y DoD (Puntos 5 y 10)
- **Lo que debes decir:** "Ahora pasaré a la **Sprint Review** del incremento. Nuestro entorno está 100% desplegado localmente usando túneles seguros. Según nuestra **Definition of Done (DoD)**, el código está versionado en GitHub y pasa las pruebas de integración."
- **Qué mostrar:** Haz la demostración EN VIVO. Manda el mensaje desde tu celular y muestra cómo llega a la consola (Backend), cómo Gemini saca el JSON y cómo se guarda en Supabase.

## Minuto 8-9: Arquitectura y Riesgos (Puntos 6 y 8)
- **Lo que debes decir:** "La arquitectura técnica que acabamos de ver responde directamente a nuestro **Diseño 4+1** que documentamos previamente. Además, este despliegue nos permitió mitigar el riesgo técnico principal de conectividad, lo cual está plasmado en nuestra **Matriz de Riesgos y Mitigaciones**, donde abordamos temas como la expiración de tokens de Meta."
- **Qué mostrar:** El código del servidor (opcional) o el documento de la Matriz de Riesgos.

## Minuto 10: Pruebas y Trazabilidad (Punto 9)
- **Lo que debes decir:** "Finalmente, quiero evidenciar la trazabilidad. La prueba que acaban de ver verifica explícitamente los Criterios de Aceptación de nuestras HU principales, garantizando que el Triage prioriza correctamente sin inventar datos, tal como lo definimos en nuestro **Plan de Pruebas**."
- **Qué mostrar:** Termina mostrando el mensaje de respuesta de WhatsApp ("El bot ya le respondió al cliente").

---
**💡 Tip de oro:** Trata de decir la palabra *"Trazabilidad"*, *"Definition of Done"*, *"Criterio de Aceptación"* y *"Mitigación de Riesgos"* de forma natural pero fuerte, para que los profes hagan un "Check" mental en su rúbrica al instante.
