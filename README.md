# Bot Verificador X - Prototipo Hito 2

Prototipo funcional para mitigar el riesgo tecnico principal del MVP: respuestas imprecisas o poco confiables del motor NLP.

## Objetivo

Validar que el backend pueda recibir texto simulado de un tuit, limpiarlo, analizarlo con un motor NLP simulado y aplicar una regla de seguridad: si la confianza es menor al 60%, el veredicto final debe ser `Impreciso`.

## Comandos

```bash
npm install
npm run dev
npm test
```

## Endpoints

```http
GET /health
```

```http
POST /verify
Content-Type: application/json

{
  "userId": "12345",
  "text": "URGENTE comparte antes que lo borren, esto es 100% real"
}
```

```http
POST /x/webhook
Content-Type: application/json

{
  "tweet": {
    "id": "1789000000000000001",
    "text": "@Agente Dicen que manana cierran todos los bancos en Chile",
    "author_id": "12345",
    "in_reply_to_tweet_id": "1788999999999999999"
  },
  "user": {
    "id": "12345",
    "username": "usuario_demo"
  }
}
```

## Respuesta esperada

```json
{
  "veredicto": "Falso",
  "confianza": 74,
  "tema": "Tema general no determinado",
  "contexto": "La publicacion utiliza recursos tipicos de contenido viral que busca provocar reaccion inmediata.",
  "senales": [
    "Uso de urgencia para incentivar difusion rapida.",
    "Lenguaje absoluto o sensacionalista.",
    "Ausencia de evidencia directa o fuente verificable dentro del texto."
  ],
  "justificacion": "El texto presenta patrones frecuentes de desinformacion viral o afirmaciones no verificadas.",
  "recomendacion": "No compartir antes de verificar la informacion en fuentes primarias.",
  "processed": {
    "originalText": "URGENTE comparte antes que lo borren, esto es 100% real",
    "cleanText": "URGENTE comparte antes que lo borren, esto es 100% real",
    "urls": []
  },
  "latencyMs": 1
}
```

## Adaptador X simulado

El endpoint `/x/webhook` representa la capa de integracion con X en modo simulado. Recibe una mencion, extrae los datos del post, ejecuta el flujo de verificacion y construye una respuesta tipo reply sin publicar aun en X.

El prototipo diferencia entre rumores genericos y afirmaciones concretas de alto impacto. Por ejemplo, una frase como `Dicen que manana cierran todos los bancos en Chile` se clasifica como `Falso` en el simulador porque corresponde a una afirmacion verificable que deberia contar con respaldo oficial o cobertura confiable si fuera real.

La integracion real queda preparada mediante variables de entorno:

```env
X_CLIENT_MODE=mock
X_BOT_HANDLE=Agente
X_BEARER_TOKEN=
X_API_KEY=
X_API_SECRET=
X_ACCESS_TOKEN=
X_ACCESS_TOKEN_SECRET=
```

Para publicar realmente en X se requiere una cuenta de desarrollador, credenciales validas y acceso habilitado a los endpoints correspondientes de X API.

## Relacion con el Hito 2

Este prototipo permite evidenciar la estrategia de mitigacion del riesgo tecnico asociado a la calidad del analisis NLP. No reemplaza aun la integracion real con X ni con un modelo NLP productivo, pero valida el flujo critico de entrada, procesamiento, analisis, umbral de confianza, respuesta simulada en hilo y registro asincrono de metricas.
