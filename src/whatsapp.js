require('dotenv').config();

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const WABA_ID = '1264670910070069'; // Phone Number ID we extracted earlier

/**
 * Envia un mensaje de texto plano a un cliente vía WhatsApp Cloud API.
 * @param {string} telefonoDestino Número de teléfono con código de país (ej: 56912345678)
 * @param {string} texto Mensaje a enviar
 */
async function enviarMensajeWhatsApp(telefonoDestino, texto) {
    if (!META_ACCESS_TOKEN) {
        console.error('❌ Error: No hay META_ACCESS_TOKEN en el archivo .env');
        return;
    }

    const url = `https://graph.facebook.com/v25.0/${WABA_ID}/messages`;
    
    const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: telefonoDestino,
        type: "text",
        text: { 
            preview_url: false,
            body: texto
        }
    };

    try {
        // HU-16 CA-3: Timeout de 8 segundos para la API de Meta
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        clearTimeout(timer);

        const data = await response.json();

        if (response.ok) {
            console.log(`✅ Mensaje enviado exitosamente a [${telefonoDestino}]`);
        } else {
            console.error('❌ Error al enviar mensaje de WhatsApp:', data);
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('❌ [HU-16 CA-3] Timeout al enviar mensaje de texto a WhatsApp (>8s)');
        } else {
            console.error('❌ Excepción al intentar enviar WhatsApp:', error);
        }
    }
}

/**
 * HU-20: Envia un mensaje con botones interactivos (reply buttons) a un cliente.
 * Máximo 3 botones, máximo 20 caracteres por botón.
 * @param {string} telefonoDestino Número de teléfono con código de país
 * @param {string} textoEncabezado Texto que aparece arriba de los botones
 * @param {string[]} opciones Array de strings (máx 3) para los botones
 */
async function enviarMensajeConBotones(telefonoDestino, textoEncabezado, opciones) {
    if (!META_ACCESS_TOKEN) {
        console.error('❌ Error: No hay META_ACCESS_TOKEN en el archivo .env');
        return;
    }

    // Truncar a máx 3 botones y 20 caracteres cada uno (límite de WhatsApp)
    const botones = opciones.slice(0, 3).map((opcion, index) => ({
        type: 'reply',
        reply: {
            id: `btn_${index}_${opcion.toLowerCase().replace(/\s+/g, '_')}`,
            title: opcion.slice(0, 20)
        }
    }));

    const url = `https://graph.facebook.com/v25.0/${WABA_ID}/messages`;

    const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: telefonoDestino,
        type: 'interactive',
        interactive: {
            type: 'button',
            body: { text: textoEncabezado },
            action: { buttons: botones }
        }
    };

    try {
        // HU-16 CA-3: Timeout de 8 segundos para la API de Meta
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        clearTimeout(timer);

        const data = await response.json();

        if (response.ok) {
            console.log(`✅ Mensaje con botones enviado a [${telefonoDestino}]: ${opciones.join(' | ')}`);
        } else {
            console.error('❌ Error al enviar botones WhatsApp:', data);
            // Fallback: enviar como texto plano si falla
            const opcionesTexto = opciones.map((o, i) => `${i + 1}. ${o}`).join('\n');
            await enviarMensajeWhatsApp(telefonoDestino, `${textoEncabezado}\n\n${opcionesTexto}`);
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('❌ [HU-16 CA-3] Timeout al enviar botones WhatsApp (>8s)');
        } else {
            console.error('❌ Excepción al enviar botones WhatsApp:', error);
        }
    }
}

module.exports = { enviarMensajeWhatsApp, enviarMensajeConBotones };
