import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini AI client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Prioritized Gemini models pool: Uses official supported models
const MODELS_TO_TRY = [
  "gemini-3.7-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
];

async function generateWithRetryAndFallback(
  ai: GoogleGenAI,
  params: {
    contents: Array<{ role: string; parts: Array<{ text: string }> }>;
    config: any;
  }
) {
  let lastError: any = null;

  for (const model of MODELS_TO_TRY) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });

      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      lastError = err;
      const isQuotaOrBusy =
        err?.status === 429 ||
        err?.status === 503 ||
        err?.message?.includes("429") ||
        err?.message?.includes("503") ||
        err?.message?.includes("high demand") ||
        err?.message?.includes("RESOURCE_EXHAUSTED") ||
        err?.message?.includes("Quota exceeded");

      console.warn(
        `[Gemini Fallback] Model ${model} unavailable (${isQuotaOrBusy ? (err?.status ? `Status ${err.status}` : "High Demand/Busy") : err?.message?.slice(0, 80)}). Trying next candidate...`
      );
      // Brief pause before trying next candidate model
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }

  // Fallback with relaxed JSON generation on flash lite
  for (const fallbackModel of ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.7-flash"]) {
    try {
      const simplifiedResponse = await ai.models.generateContent({
        model: fallbackModel,
        contents: params.contents,
        config: {
          systemInstruction: params.config.systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });
      if (simplifiedResponse && simplifiedResponse.text) {
        return simplifiedResponse;
      }
    } catch (simplifiedErr: any) {
      lastError = simplifiedErr;
    }
  }

  throw lastError;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "VT English IA Server" });
});

// Chat endpoint for VT English IA Tutor
app.post("/api/chat", async (req, res) => {
  try {
    const {
      message,
      history = [],
      level = "B1",
      topic = "General Conversation",
      targetAccent = "en-US",
      teachingMode = "bilingual_coach",
      teacherName = "Prof. Sarah Miller",
    } = req.body;

    const ai = getGeminiClient();

    const systemInstruction = `Eres ${teacherName}, tutora de inglés en "VT English IA". Utilizas la metodología de Duolingo y Speak.com: las reglas y la empatía se dan en español, pero la inmersión hablada es estrictamente en inglés.

REGLA DE ORO DE SEPARACIÓN DE IDIOMAS (CRÍTICO PARA EL MOTOR DE VOZ):
- Campo "teacherCommentary": DEBE SER 100% EN ESPAÑOL. Aquí explicas el error con empatía, das el truco de pronunciación y motivas al alumno. NUNCA pongas inglés aquí.
- Campo "tutorSpeech": DEBE SER 100% EN INGLÉS NATIVO. Esta es la respuesta conversacional que el avatar dirá en voz alta. Cero español. Adapta el vocabulario al nivel ${level}.

ESTRUCTURA DEL TURNO:
1. Analiza lo que dijo el usuario. Si hay error, corrígelo amigablemente.
2. Genera el "teacherCommentary" (Español) explicando la regla o felicitando.
3. Genera el "tutorSpeech" (Inglés) continuando la conversación y haciendo una pregunta abierta para que el usuario responda.
4. Genera la "targetEnglishPhrase", que es la frase exacta del "tutorSpeech" en la que quieres que el alumno se enfoque.
5. Genera 3 a 4 "quickChips" (100% en inglés) para que el alumno tenga opciones de respuesta rápida.

CONTEXTO ACTUAL:
- Tema: "${topic}"
- Nivel: "${level}"
- Modo: "${teachingMode}"`;

    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-6); // Solo los últimos 6 mensajes para ahorrar tokens
      for (const msg of recentHistory) {
        contents.push({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      }
    }

    contents.push({
      role: "user",
      parts: [
        { text: message && message.trim().length > 0 ? message : "Hello!" },
      ],
    });

    const response = await generateWithRetryAndFallback(ai, {
      contents,
      config: {
        systemInstruction,
        temperature: 0.6,
        maxOutputTokens: 2500, // Espacio suficiente para JSON completo sin truncado
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            teacherCommentary: {
              type: Type.STRING,
              description: "Explicación, corrección y guía motivadora 100% en español.",
            },
            targetEnglishPhrase: {
              type: Type.STRING,
              description: "La oración clave del turno en inglés.",
            },
            phoneticGuide: {
              type: Type.STRING,
              description: "Guía de pronunciación para hispanohablantes (ej. 'wud-laik').",
            },
            nativeLinkingTrick: {
              type: Type.STRING,
              description: "Truco de fluidez en español.",
            },
            tutorSpeech: {
              type: Type.STRING,
              description: "100% INGLÉS. Lo que el avatar habla. Continúa el roleplay y haz una pregunta.",
            },
            spanishTranslation: {
              type: Type.STRING,
              description: "Traducción al español del tutorSpeech.",
            },
            correction: {
              type: Type.OBJECT,
              properties: {
                hasError: { type: Type.BOOLEAN },
                praise: { type: Type.STRING },
                originalSentence: { type: Type.STRING },
                correctedSentence: { type: Type.STRING },
                explanation: { type: Type.STRING },
                nativeAlternative: { type: Type.STRING },
              },
              required: ["hasError"],
            },
            quickChips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 opciones de respuesta en inglés.",
            },
            vocabularyNotes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  ipa: { type: Type.STRING },
                  phoneticSpanish: { type: Type.STRING },
                  meaning: { type: Type.STRING },
                  example: { type: Type.STRING },
                },
                required: ["word", "meaning"],
              },
            },
            pedagogicalTip: { type: Type.STRING },
            animationState: {
              type: Type.STRING,
              description: "Estado de animación para el avatar: 'speaking', 'loving' (para elogios destacados, alta racha o pronunciación sobresaliente con corazones), 'celebrating'/'alegre' (felicitaciones), 'pensativo' (preguntas) o 'sorpresa' (curiosidades).",
            },
          },
          required: [
            "teacherCommentary",
            "tutorSpeech",
            "targetEnglishPhrase",
            "spanishTranslation",
            "correction",
            "quickChips",
          ],
        },
      },
    });

    const textOutput = (response.text || "").trim();
    let parsedData: any = null;

    try {
      parsedData = JSON.parse(textOutput);
    } catch {
      // Intento de extracción de bloque JSON si vino envuelto en markdown o con prefijos
      const jsonMatch = textOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedData = JSON.parse(jsonMatch[0]);
        } catch {
          // Intentar corregir JSON truncado
          try {
            const repaired = jsonMatch[0] + '"}';
            parsedData = JSON.parse(repaired);
          } catch {
            parsedData = null;
          }
        }
      }
    }

    if (!parsedData || !parsedData.tutorSpeech) {
      // Si la respuesta no es JSON válido, construir objeto a partir del texto bruto
      if (textOutput && textOutput.length > 10) {
        parsedData = {
          teacherCommentary: "¡Muy buen trabajo! Sigamos practicando juntos.",
          targetEnglishPhrase: "Let's keep practicing English conversation.",
          phoneticGuide: "lets kiːp ˈpræk.tɪ.sɪŋ ˈɪŋ.ɡlɪʃ",
          nativeLinkingTrick: "Pronuncia las palabras de forma continua.",
          tutorSpeech: textOutput.replace(/[{}\[\]"]/g, " ").trim().slice(0, 250),
          spanishTranslation: "Sigamos practicando la conversación en inglés.",
          correction: { hasError: false, praise: "¡Buen esfuerzo en tu respuesta!" },
          quickChips: [
            "I want to continue the practice.",
            "Can we practice everyday phrases?",
            "Tell me more about this topic.",
          ],
          vocabularyNotes: [],
          pedagogicalTip: "La práctica constante es la clave para la fluidez.",
        };
      } else {
        throw new Error("Invalid or incomplete response received from AI model");
      }
    }

    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("Error in /api/chat (Quota or Network):", error);
    
    // Provide a rich contextual fallback so the user can continue their lesson smoothly
    const currentTopic = req.body?.topic || "General Conversation";
    const userMsg = req.body?.message || "";

    const fallbackResponse = {
      teacherCommentary:
        "¡Excelente esfuerzo! Estoy aquí para guiarte en tu práctica. Vamos a enfocarnos en esta frase clave para seguir desarrollando tu fluidez oral.",
      targetEnglishPhrase: "I would like to keep practicing my English speaking skills.",
      phoneticGuide: "aɪ wʊd laɪk tuː kiːp ˈpræk.tɪ.sɪŋ maɪ ˈɪŋ.ɡlɪʃ (Suena: ai-wud-laik tu kip præk-ti-sing mai ing-glish)",
      nativeLinkingTrick: "Une 'would like to' como 'wud-laik-tu' de un solo tirón sin hacer pausas intermedias.",
      tutorSpeech: `You are doing a fantastic job with your practice on ${currentTopic}! Tell me, what would you like to focus on next?`,
      spanishTranslation: `¡Estás haciendo un trabajo fantástico practicando ${currentTopic}! Dime, ¿en qué te gustaría enfocarte ahora?`,
      correction: {
        hasError: false,
        praise: userMsg ? "¡Gran trabajo al comunicarte en inglés!" : "¡Excelente inicio de sesión!",
      },
      quickChips: [
        "I want to practice real-life everyday conversation.",
        "Could you teach me useful phrases for travel?",
        "I'm ready for the next speaking challenge!",
      ],
      vocabularyNotes: [
        {
          word: "practice",
          ipa: "/ˈpræk.tɪs/",
          phoneticSpanish: "præk-tis",
          meaning: "Práctica / Ejercicio continuo",
          example: "Daily speaking practice makes a huge difference.",
        },
      ],
      pedagogicalTip: "Recuerda que la constancia y hablar en voz alta todos los días es el secreto de la fluidez.",
    };

    res.json({ success: true, data: fallbackResponse });
  }
});

// Text-to-Speech endpoint powered by ElevenLabs & Google Cloud Text-to-Speech
app.post(["/api/tts", "/api/elevenlabs"], async (req, res) => {
  try {
    const { text, gender, voiceId: customVoiceId, speakingRate = 1.0 } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'text' field" });
    }

    const isMale = gender === "male";
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY || process.env.VITE_ELEVENLABS_API_KEY;

    // 1. Intentar con ElevenLabs de forma segura desde el servidor
    if (elevenLabsApiKey) {
      try {
        const voiceId = customVoiceId || (isMale ? "JBFqnCBsd6RMkjVDRZzb" : "21m00Tcm4TlvDq8ikWAM");
        const elResponse = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=3`,
          {
            method: "POST",
            headers: {
              Accept: "audio/mpeg",
              "Content-Type": "application/json",
              "xi-api-key": elevenLabsApiKey,
            },
            body: JSON.stringify({
              text,
              model_id: "eleven_turbo_v2_5",
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.85,
                style: 0.0,
                use_speaker_boost: true,
              },
            }),
          }
        );

        if (elResponse.ok) {
          const arrayBuffer = await elResponse.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          res.setHeader("Content-Type", "audio/mpeg");
          res.setHeader("Content-Length", buffer.length);
          return res.send(buffer);
        }
      } catch (err) {
        // Si falla ElevenLabs, el servidor pasa al fallback nativo o error controlado
      }
    }

    res.status(500).json({
      error: "ElevenLabs unavailable or missing API key on server",
      fallbackToWebSpeech: true,
    });
  } catch (error: any) {
    res.status(500).json({
      error: error?.message || "Failed to synthesize speech",
      fallbackToWebSpeech: true,
    });
  }
});

// Start server with Vite middleware in dev mode
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VT English IA Server running on http://localhost:${PORT}`);
  });
}

startServer();
