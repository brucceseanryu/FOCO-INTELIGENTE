import { GoogleGenAI } from "@google/genai";

// Initialize the API client
// Note: In a real production build, ensure process.env.API_KEY is defined in your environment
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const generateElectronicsHelp = async (query: string): Promise<string> => {
  if (!apiKey) {
    return "Error: API Key no configurada. Por favor verifica tu entorno.";
  }

  try {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `
      Actúa como un ingeniero experto en IoT y electrónica de potencia.
      Estás asistiendo en un proyecto DIY: "Interruptor activado por aplausos con ESP32 dentro de un socket de foco".
      
      Detalles Técnicos ACTUALIZADOS (V2 - Dashboard):
      - MCU: ESP32.
      - Firmware: Incluye API JSON local (/status, /config, /toggle).
      - Características: Calibración de ritmo vía web, Timer de auto-apagado.
      
      API Endpoints:
      - GET /status: Retorna JSON {state: bool, min: int, max: int, timer: int}.
      - GET /config?min=X&max=Y&timer=Z: Configura parámetros en RAM.
      
      Hardware:
      - Sensor: KY-037 (Micrófono) - Detecta DOBLE APLAUSO rítmico.
      - Actuador: Módulo Relay 5V.
      - Fuente: Cargador USB 5V desarmado conectado a 220V AC.
      
      Reglas de respuesta:
      1. SEGURIDAD ANTE TODO: Advierte siempre sobre los peligros del voltaje 220V.
      2. IP Local: Explica que la app necesita la IP del ESP32 para leer el JSON de estado y enviar configuraciones.
      3. Calibración Web: Si los aplausos fallan, sugiere ajustar los sliders "Min Time" y "Max Time" en la app antes de mover el tornillo del sensor.
      4. Sé conciso y usa formato Markdown.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: query,
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 0 } // Fast response needed for chat
      }
    });

    return response.text || "No pude generar una respuesta. Intenta de nuevo.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Hubo un error al conectar con el asistente. Verifica tu conexión o API Key.";
  }
};
