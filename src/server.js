const express = require('express');
const crypto = require('crypto');
const path = require('path');
const { extraerFichaTriage } = require('./brain');
const db = require('./db');
const { enviarMensajeWhatsApp, enviarMensajeConBotones } = require('./whatsapp');
const { aplicarArnes } = require('./arneses'); // HU-21
const { generarFichaCotizacionPDF } = require('./pdfGenerator'); // HU-05
const {
  registrarLatencia,
  registrarGeneracionPdf,
  obtenerResumenMetricas,
} = require('./metricsStore'); // HU-22
require('dotenv').config();

const app = express();

// Servir archivos estáticos del Dashboard (sin exponer tokens en HTML/JS)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Middleware de trazabilidad segura: NUNCA registra cabeceras completas, tokens ni conversaciones (KRON2-152)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] 🌐 ${req.method} ${req.path}`);
  next();
});

// Middleware para guardar el body "crudo" para poder validar la firma HMAC de Meta
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  },
}));

const PORT = process.env.PORT || 3000;

/**
 * Comparación en tiempo constante para evitar ataques de timing sobre el Bearer token.
 */
function safeCompareTokens(provided, expected) {
  if (typeof provided !== 'string' || typeof expected !== 'string') return false;
  const bufA = Buffer.from(provided, 'utf8');
  const bufB = Buffer.from(expected, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * KRON2-152: Middleware de autenticación Bearer privada para rutas `/api/*`.
 * Exige `TRIAGE_API_TOKEN` distinto de los secretos de Meta/Gemini.
 */
function requireTriageAuth(req, res, next) {
  const configuredToken = (process.env.TRIAGE_API_TOKEN || '').trim();
  if (!configuredToken) {
    return res.status(503).json({
      ok: false,
      error: 'Integración de triage no configurada en el servidor',
    });
  }

  // Asegurar que el token de integración no reutilice secretos de Meta o Gemini
  if (
    (process.env.META_VERIFY_TOKEN && configuredToken === process.env.META_VERIFY_TOKEN) ||
    (process.env.META_APP_SECRET && configuredToken === process.env.META_APP_SECRET) ||
    (process.env.GEMINI_API_KEY && configuredToken === process.env.GEMINI_API_KEY)
  ) {
    return res.status(503).json({
      ok: false,
      error: 'Configuración inválida: TRIAGE_API_TOKEN debe ser exclusivo de integración',
    });
  }

  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      ok: false,
      error: 'No autorizado: se requiere credencial Bearer de integración',
    });
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token || !safeCompareTokens(token, configuredToken)) {
    return res.status(401).json({
      ok: false,
      error: 'No autorizado: token de integración inválido',
    });
  }

  return next();
}

// Endpoint de verificación de salud para Render / monitoreo en la nube
app.get('/healthz', (req, res) => res.status(200).send('OK'));

// Redirigir la raíz al Dashboard
app.get('/', (req, res) => res.redirect('/dashboard'));

/**
 * 1. GET /webhooks/meta
 * Verificación del webhook de Meta (WhatsApp Cloud API).
 */
app.get('/webhooks/meta', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const metaVerifyToken = process.env.META_VERIFY_TOKEN;

  if (mode === 'subscribe' && metaVerifyToken && token === metaVerifyToken) {
    console.log('✅ Webhook de Meta verificado con éxito');
    res.status(200).send(challenge);
  } else {
    console.error('❌ Falló la verificación del Webhook de Meta');
    res.status(403).send('Token inválido');
  }
});

/**
 * 2. POST /webhooks/meta
 * Recepción de mensajes de WhatsApp con verificación obligatoria HMAC-SHA256.
 * No registra cabeceras completas, tokens ni contenido íntegro de conversaciones.
 */
app.post('/webhooks/meta', async (req, res) => {
  const startTime = Date.now();
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) {
    console.warn('⚠️ Intento de acceso a webhook sin firma HMAC. Bloqueado.');
    return res.status(401).send('Firma requerida');
  }

  const metaAppSecret = process.env.META_APP_SECRET || '';
  const rawBuffer = req.rawBody || Buffer.from(JSON.stringify(req.body || {}), 'utf8');
  const expectedSignature = 'sha256=' + crypto.createHmac('sha256', metaAppSecret)
    .update(rawBuffer)
    .digest('hex');

  if (!safeCompareTokens(signature, expectedSignature)) {
    console.warn('⚠️ Intento de acceso a webhook con firma HMAC inválida. Bloqueado.');
    return res.status(403).send('Firma inválida');
  }

  const payload = req.body;

  try {
    if (payload?.entry?.[0]?.changes?.[0]?.value?.messages) {
      const waMessage = payload.entry[0].changes[0].value.messages[0];
      const contact = payload.entry[0].changes[0].value.contacts?.[0] || {};
      const telefonoCliente = contact.wa_id;

      let textoCliente = '';
      if (waMessage.type === 'interactive') {
        if (waMessage.interactive?.button_reply) {
          textoCliente = waMessage.interactive.button_reply.title;
        } else if (waMessage.interactive?.list_reply) {
          textoCliente = waMessage.interactive.list_reply.title;
        }
      } else if (waMessage.text) {
        textoCliente = waMessage.text.body;
      }

      if (textoCliente && telefonoCliente) {
        const fichaIA = await extraerFichaTriage(textoCliente, telefonoCliente);
        const fichaEstructurada = fichaIA ? await aplicarArnes(fichaIA, telefonoCliente) : null;

        if (fichaEstructurada) {
          if (!fichaEstructurada._noPersistir) {
            await db.guardarCasoTriage(fichaEstructurada, telefonoCliente);
          }

          if (fichaEstructurada.respuesta_cliente) {
            if (fichaEstructurada.requiere_derivacion) {
              await enviarMensajeWhatsApp(telefonoCliente, fichaEstructurada.respuesta_cliente);
            } else if (fichaEstructurada.opciones_botones && fichaEstructurada.opciones_botones.length > 0) {
              await enviarMensajeConBotones(
                telefonoCliente,
                fichaEstructurada.respuesta_cliente,
                fichaEstructurada.opciones_botones
              );
            } else {
              await enviarMensajeWhatsApp(telefonoCliente, fichaEstructurada.respuesta_cliente);
            }
          }
        }
        registrarLatencia(Date.now() - startTime);
      }
    }

    res.status(200).send('EVENT_RECEIVED');
  } catch (error) {
    console.error('❌ Error procesando evento de WhatsApp:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * 3. GET /api/tickets
 * Listado paginado y autenticado de tickets normalizados (KRON2-152 + HU-14).
 * Soporta `limit` (1–50) y `cursor` estable (`updated_at+id`), devolviendo `{ ok, data, nextCursor }`.
 */
app.get('/api/tickets', requireTriageAuth, async (req, res) => {
  try {
    let limit = 50;
    if (req.query.limit !== undefined) {
      const parsed = Number(req.query.limit);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 50) {
        return res.status(400).json({
          ok: false,
          error: 'El parámetro limit debe ser un entero entre 1 y 50',
        });
      }
      limit = parsed;
    }

    const cursor = req.query.cursor ? String(req.query.cursor) : null;
    if (cursor && typeof db.decodeCursor === 'function' && !db.decodeCursor(cursor)) {
      return res.status(400).json({
        ok: false,
        error: 'El parámetro cursor tiene un formato inválido',
      });
    }

    if (typeof db.getTicketsPaginados === 'function') {
      const page = await db.getTicketsPaginados({ limit, cursor });
      return res.status(200).json({
        ok: true,
        data: page.data,
        nextCursor: page.nextCursor ?? null,
      });
    }

    const tickets = await db.getTicketsDashboard(limit);
    return res.status(200).json({
      ok: true,
      data: tickets,
      nextCursor: null,
    });
  } catch (error) {
    console.error('❌ Error en GET /api/tickets:', error.message);
    return res.status(500).json({ ok: false, error: 'Error al obtener tickets' });
  }
});

/**
 * 4. GET /api/tickets/:id
 * Detalle autenticado de un ticket normalizado (KRON2-152).
 */
app.get('/api/tickets/:id', requireTriageAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ ok: false, error: 'ID de ticket inválido' });
    }

    const ticket = await db.getTicketById(id);
    if (!ticket) {
      return res.status(404).json({ ok: false, error: 'Ticket no encontrado' });
    }

    return res.status(200).json({ ok: true, data: ticket });
  } catch (error) {
    console.error('❌ Error en GET /api/tickets/:id:', error.message);
    return res.status(500).json({ ok: false, error: 'Error al obtener el detalle del ticket' });
  }
});

/**
 * 5. PATCH /api/tickets/:id
 * Actualización autenticada de estado y fecha_visita con control de concurrencia (KRON2-152 + HU-19).
 */
app.patch('/api/tickets/:id', requireTriageAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ ok: false, error: 'ID de ticket inválido' });
    }

    const {
      estado,
      fecha_visita,
      expected_updated_at,
      expectedUpdatedAt,
      updated_at,
    } = req.body || {};

    const resultado = await db.actualizarEstadoTicket(id, {
      estado,
      fecha_visita,
      expected_updated_at: expected_updated_at || expectedUpdatedAt || updated_at,
    });

    if (!resultado.ok) {
      return res.status(resultado.status || 400).json({
        ok: false,
        error: resultado.message,
        code: resultado.error,
        ...(resultado.current ? { current: resultado.current } : {}),
      });
    }

    return res.status(200).json({ ok: true, data: resultado.data });
  } catch (error) {
    console.error('❌ Error en PATCH /api/tickets/:id:', error.message);
    return res.status(500).json({ ok: false, error: 'Error al actualizar el ticket' });
  }
});

/**
 * 6. GET /api/tickets/:id/pdf
 * Descarga autenticada de Ficha Técnica y Borrador de Cotización en PDF (HU-05 + HU-19).
 */
app.get('/api/tickets/:id/pdf', requireTriageAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ ok: false, error: 'ID de ticket inválido' });
    }

    const ticket = await db.getTicketById(id);
    if (!ticket) {
      return res.status(404).json({ ok: false, error: 'Ticket no encontrado' });
    }

    const pdfBuffer = generarFichaCotizacionPDF(ticket);
    registrarGeneracionPdf(true);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ficha-triage-${ticket.id}.pdf"`);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    registrarGeneracionPdf(false);
    console.error('❌ Error en GET /api/tickets/:id/pdf:', error.message);
    return res.status(500).json({ ok: false, error: 'Error al generar el PDF del ticket' });
  }
});

/**
 * 7. GET /api/metricas
 * Endpoint autenticado de métricas de calidad, latencia SLA y efectividad del arnés (HU-22).
 */
app.get('/api/metricas', requireTriageAuth, async (req, res) => {
  try {
    const tickets = typeof db.getTicketsDashboard === 'function'
      ? await db.getTicketsDashboard(50)
      : [];
    const resumen = obtenerResumenMetricas(tickets);
    return res.status(200).json({ ok: true, data: resumen });
  } catch (error) {
    console.error('❌ Error en GET /api/metricas:', error.message);
    return res.status(500).json({ ok: false, error: 'Error al obtener métricas' });
  }
});

/**
 * 8. GET /dashboard
 * Sirve el Panel de Control web para demostración académica (exige token en memoria del operador, sin token embebido).
 */
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'dashboard.html'));
});

/**
 * HU-16 CA-4: Manejador global de errores de Express.
 */
app.use((err, req, res, next) => {
  console.error('🛑 [HU-16 CA-4] Error global capturado:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    message: err.message,
  });

  if (res.headersSent) return next(err);

  if (req.path === '/webhooks/meta') {
    return res.status(200).send('EVENT_RECEIVED');
  }
  return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor Webhook corriendo en el puerto ${PORT}`);
    console.log(`📊 Dashboard disponible en: http://localhost:${PORT}/dashboard`);
  });
}

module.exports = app;
