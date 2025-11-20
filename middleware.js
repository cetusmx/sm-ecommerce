// middleware/recaptchaValidator.js

const axios = require('axios'); // Necesitas un cliente HTTP como axios o node-fetch
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY; // ¡Configura esto en tu .env!

// Instalar axios si no lo tienes: npm install axios
// Si estás usando Node 18+, puedes usar el nativo 'fetch'

const validateRecaptcha = async (req, res, next) => {
    // 1. Obtener el token del cuerpo de la solicitud (frontend)
    const token = req.body.recaptchaToken; // Asegúrate de que el frontend envíe el token con esta clave

    if (!token) {
        // En caso de que el token no se envíe
        console.warn('reCAPTCHA: Token no encontrado en la solicitud.');
        return res.status(401).json({ error: 'Falta la verificación de reCAPTCHA.' });
    }

    // 2. Preparar los datos para la verificación de Google
    const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';

    try {
        const response = await axios.post(verificationUrl, null, {
            params: {
                secret: RECAPTCHA_SECRET_KEY,
                response: token, // el token del usuario
                remoteip: req.ip // (Opcional) IP del usuario para análisis de Google
            }
        });

        const { success, score } = response.data;

        // 3. Evaluar la respuesta de Google
        if (success) {
            // Si usas reCAPTCHA v3, puedes verificar el score (ej: score >= 0.5)
            // Si usas reCAPTCHA v2, solo necesitas 'success: true'

            if (score && score < 0.5) { 
                console.warn(`reCAPTCHA v3: Puntuación baja (${score}). Posible bot.`);
                return res.status(403).json({ error: 'Verificación fallida: Actividad sospechosa.' });
            }

            // La verificación es exitosa, pasa al siguiente middleware/controlador
            next(); 

        } else {
            console.error('reCAPTCHA: Verificación fallida.', response.data['error-codes']);
            return res.status(403).json({ error: 'Verificación fallida de reCAPTCHA.' });
        }

    } catch (error) {
        console.error('Error al comunicarse con el servicio de reCAPTCHA:', error.message);
        return res.status(500).json({ error: 'Error interno de validación.' });
    }
};

module.exports = validateRecaptcha;