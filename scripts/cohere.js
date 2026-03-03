import { CohereClientV2 } from 'cohere-ai';
import 'dotenv/config';

const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY
});

export async function generateAIDescription(originalText) {
  const cleanText = originalText
    .replace(/https?:\/\/[^\s]+/g, '')
    .trim()
    .slice(0, 1000);

  try {
    console.time("Creando descripción con Cohere");
    const response = await cohere.chat({
      messages: [
        {
          role: "system",
          content: `Eres un redactor SEO especializado en podcasts. Reescribe descripciones para evitar contenido duplicado en Google, usando sinónimos y estructuras de frase distintas al original, pero conservando exactamente el mismo significado, tono y palabras clave principales. 

Reglas:
- Máximo 180 caracteres
- No uses las mismas palabras del original salvo términos técnicos o nombres propios
- No añadas información que no esté en el original
- Responde ÚNICAMENTE con la descripción reescrita, sin comillas, sin explicaciones`
        },
        {
          role: "user",
          content: cleanText
        }
      ],
      model: "command-r7b-12-2024",
      temperature: 0.6,
      maxTokens: 80,
    });

    console.timeEnd("Creando descripción con Cohere");
    return response.message.content[0].text;
  } catch (error) {
    console.error("Error con el SDK de Cohere:", error);
    return "Análisis profundo y conversación sin filtros en este nuevo episodio.";
  }
}