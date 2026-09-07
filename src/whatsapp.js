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
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${META_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`✅ Mensaje enviado exitosamente a [${telefonoDestino}]`);
        } else {
            console.error('❌ Error al enviar mensaje de WhatsApp:', data);
        }
    } catch (error) {
        console.error('❌ Excepción al intentar enviar WhatsApp:', error);
    }
}

module.exports = { enviarMensajeWhatsApp };
