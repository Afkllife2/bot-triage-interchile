const express = require('express');
const crypto = require('crypto');
const path = require('path');
const { extraerFichaTriage } = require('./brain');
const { guardarCasoTriage, getTicketsDashboard } = require('./db');
const { enviarMensajeWhatsApp } = require('./whatsapp');
require('dotenv').config();

const app = express();

// Servir archivos estáticos del Dashboard (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Middleware global para registrar TODO lo que entra
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] 🌐 PETICIÓN ENTRANTE: ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Middleware para guardar el body "crudo" para poder validar la firma HMAC
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

const PORT = process.env.PORT || 3000;
const META_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;
const META_APP_SECRET = process.env.META_APP_SECRET;

/**
 * 1. GET /webhooks/meta
 * Equivalente a verify_meta_webhook en el código de Aerandir.
 * Facebook hace un GET aquí para verificar que este servidor es tuyo.
 */
app.get('/webhooks/meta', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === META_VERIFY_TOKEN) {
    console.log('✅ Webhook de Meta verificado con éxito!');
    res.status(200).send(challenge);
  } else {
    console.error('❌ Falló la verificación del Webhook de Meta');
    res.status(403).send('Token inválido');
  }
});

/**
 * 2. POST /webhooks/meta
 * Equivalente a receive_meta_webhook en el código de Aerandir.
 * Aquí llegan los mensajes reales de WhatsApp.
 */
app.post('/webhooks/meta', async (req, res) => {
  // A. Validación de Seguridad (HMAC-SHA256) igual que Aerandir
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) {
    console.warn('⚠️ Intento de acceso sin firma. Bloqueado.');
    return res.status(401).send('Firma requerida');
  }

  const expectedSignature = 'sha256=' + crypto.createHmac('sha256', META_APP_SECRET)
    .update(req.rawBody)
    .digest('hex');

  if (signature !== expectedSignature) {
    console.warn('⚠️ Intento de acceso con firma inválida. Hackeo bloqueado.');
    return res.status(403).send('Firma inválida');
  }

  // B. Parseo del mensaje de WhatsApp
  const payload = req.body;
  console.log('📩 Payload recibido de WhatsApp:', JSON.stringify(payload, null, 2));

  try {
    // Verificamos si es un mensaje de usuario (no un estado o acuse de recibo)
    if (payload.entry && payload.entry[0].changes && payload.entry[0].changes[0].value.messages) {
      const waMessage = payload.entry[0].changes[0].value.messages[0];
      const contact = payload.entry[0].changes[0].value.contacts[0];
      
      const telefonoCliente = contact.wa_id;
      const textoCliente = waMessage.text ? waMessage.text.body : '';

      console.log(`\n🗣️ Nuevo mensaje de [${telefonoCliente}]: "${textoCliente}"`);

      // C. Conexión con el Cerebro IA (Generar Ficha)
      if (textoCliente) {
        const fichaEstructurada = await extraerFichaTriage(textoCliente);
        
        // D. Guardar Ficha en Base de Datos Supabase (Tabla Casos Triage)
        if (fichaEstructurada) {
           await guardarCasoTriage(fichaEstructurada, telefonoCliente);
           
           // E. Enviar respuesta automática por WhatsApp al cliente
           if (fichaEstructurada.respuesta_cliente) {
               console.log(`\n💬 Respondiendo al cliente: "${fichaEstructurada.respuesta_cliente}"`);
               await enviarMensajeWhatsApp(telefonoCliente, fichaEstructurada.respuesta_cliente);
           }
        }
      }
    }
    
    // Facebook exige que respondas 200 OK rápido para saber que recibiste el mensaje
    res.status(200).send('EVENT_RECEIVED');
  } catch (error) {
    console.error('❌ Error procesando el mensaje de WhatsApp:', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * 3. GET /api/tickets
 * API REST que devuelve los últimos tickets en JSON para el Dashboard.
 */
app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await getTicketsDashboard(50);
    res.status(200).json({ ok: true, data: tickets });
  } catch (error) {
    console.error('❌ Error en /api/tickets:', error);
    res.status(500).json({ ok: false, error: 'Error al obtener tickets' });
  }
});

/**
 * 4. GET /dashboard
 * Sirve el Panel de Control web para administradores.
 */
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'dashboard.html'));
});

// Arrancar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Webhook corriendo en el puerto ${PORT}`);
  console.log(`📊 Dashboard disponible en: http://localhost:${PORT}/dashboard`);
  console.log('Esperando conexiones de Meta (WhatsApp)...');
});
