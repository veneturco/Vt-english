import { BenchmarkAppAnalysis } from "../types";

export const BENCHMARKS_DATA: BenchmarkAppAnalysis[] = [
  {
    id: "duolingo",
    name: "Duolingo & Duolingo Max",
    category: "EdTech Idiomas",
    company: "Duolingo Inc.",
    coreHook: "Gamificación adictiva combinada con GPT-4 en Duolingo Max para 'Roleplay' y 'Explica mi Respuesta'.",
    winningFeatures: [
      "Árbol de aprendizaje ramificado con caminos progresivos (Learning Path).",
      "Duolingo Max: 'Roleplay' con personajes de la historia y 'Explain My Answer'.",
      "Mascota icónica (Duo el Búho) con animaciones reactivas a aciertos/fallos.",
      "Ligas semanales competitivas (Bronce a Diamante) con ascensos/descensos.",
      "Rachas (Streaks) con protección de racha y widgets en pantalla de inicio."
    ],
    aiCapabilities: [
      "GPT-4o para simulación de diálogos abiertos con contexto pedagógico.",
      "Algoritmo Birdbrain para ajuste adaptativo de dificultad en tiempo real.",
      "Generación de explicaciones gramaticales contextualizadas al error cometido."
    ],
    uxDesignPatterns: [
      "Micro-lecciones de 3-5 minutos con zero fricción cognitiva.",
      "Botón gigante de acción primario con retroalimentación háptica y auditiva.",
      "Jerarquía de color contrastada con paleta lúdica y tipografía geométrica (Feather)."
    ],
    animationsAndKinematics: [
      "Animaciones 2D vectoriales con Rive/Lottie de expresiones emocionales exageradas.",
      "Partículas de confeti al completar rachas o lecciones perfectas.",
      "Barras de progreso elásticas con interpolación de rebote (spring physics)."
    ],
    retentionMechanics: [
      "Notificaciones push personalizadas y sarcásticas/emocionales de la mascota.",
      "Congeladores de racha (Streak Freeze) y apuestas de gemas en rachas de 7 días.",
      "Misiones de amigos colaborativas y desafíos mensuales de medalla."
    ],
    gamificationAndEconomy: [
      "Economía dual: Gemas / Lingots para comprar skins, recargas y potenciadores.",
      "Vidas (Hearts) que penalizan el error en modo gratuito, impulsando la suscripción.",
      "Multiplicadores de XP (Doble XP por 15 minutos en madrugadas/noches)."
    ],
    voiceAndAvatarTech: [
      "Banco de voces sintéticas con diferentes acentos y personalidades por personaje.",
      "Avatares 2D animados en Rive sin lip-sync 3D en tiempo real (oportunidad de superarlo con 3D)."
    ],
    keyTakeawaysForUs: [
      "Combinar la adicción de la racha y ligas de Duolingo con un Avatar 3D que realmente tiene gesticulación y habla vocal.",
      "Reemplazar las preguntas de opción múltiple repetitivas con práctica de habla activa e inmersión."
    ],
    rating: 9.6
  },
  {
    id: "elsa_speak",
    name: "ELSA Speak",
    category: "EdTech Idiomas",
    company: "ELSA Corp",
    coreHook: "Reconocimiento fonético milimétrico a nivel de fonema con feedback en código de colores.",
    winningFeatures: [
      "Feedback fonético tricolor (Verde: >80%, Amarillo: 50-79%, Rojo: <50%).",
      "Detección precisa del Alfabeto Fonético Internacional (IPA) por sílaba.",
      "Simulador de entrevistas laborales y preparación para IELTS/TOEFL.",
      "Análisis de entonación, ritmo, fluidez y estrés silábico."
    ],
    aiCapabilities: [
      "Modelos acústicos de Deep Learning entrenados con millones de horas de hablantes no nativos.",
      "ELSA AI: Agente de conversación libre con transcripción en tiempo real y corrección posterior."
    ],
    uxDesignPatterns: [
      "Visualización gráfica de boca y posición de lengua para corrección fonética.",
      "Modo de prueba diagnóstica inicial que entrega un puntaje global de competencia."
    ],
    animationsAndKinematics: [
      "Ondas de sonido dinámicas y medidores radiales de precisión de pronunciación.",
      "Transiciones sutiles con foco en el micrófono central."
    ],
    retentionMechanics: [
      "Plan diario personalizado de 10 minutos adaptado a los fonemas débiles del usuario.",
      "Gráfico de evolución del 'Score de Natividad'."
    ],
    gamificationAndEconomy: [
      "Puntos de pronunciación acumulados, insignias por pares mínimos dominados.",
      "Modelo freemium con lecciones diarias limitadas."
    ],
    voiceAndAvatarTech: [
      "TTS de alta fidelidad con control de velocidad (0.5x, 0.8x, 1x).",
      "No cuenta con avatar 3D expresivo (su interfaz es predominantemente estática)."
    ],
    keyTakeawaysForUs: [
      "Integrar el feedback de color fonema por fonema dentro de la propia burbuja de diálogo del avatar 3D.",
      "Proveer un laboratorio fonético con pares mínimos (b/v, sh/ch, th/s) integrado."
    ],
    rating: 9.4
  },
  {
    id: "chatgpt",
    name: "ChatGPT (GPT-4o Voice Mode)",
    category: "LLM Conversacional",
    company: "OpenAI",
    coreHook: "Conversación por voz de ultrabaja latencia (<300ms) con interrupciones naturales y modulación emocional.",
    winningFeatures: [
      "Advanced Voice Mode: Interrupción natural, cambio de tono y detección de risas/suspiros.",
      "Memoria contextual continua entre sesiones con preferencias de usuario.",
      "Capacidad multimodal para ver imágenes o documentos en tiempo real mientras se habla."
    ],
    aiCapabilities: [
      "Modelo omnimodal GPT-4o nativo de audio a audio sin pasar por STT y TTS intermedio.",
      "Inferencia de prosodia y adaptación inmediata del nivel lingüístico."
    ],
    uxDesignPatterns: [
      "Modo de voz de pantalla completa con orbe fluido y minimalista que responde al habla.",
      "Cero distracciones visuales cuando la prioridad es la escucha y el habla activa."
    ],
    animationsAndKinematics: [
      "Animación de orbe orgánico con shaders matemáticos y física de fluidos que reacciona a la amplitud."
    ],
    retentionMechanics: [
      "Alta utilidad diaria, historial sincronizado entre dispositivos, modo manos libres para caminar."
    ],
    gamificationAndEconomy: [
      "Suscripción ChatGPT Plus ($20/mes) con límites de tiempo en voz avanzada."
    ],
    voiceAndAvatarTech: [
      "Voces sintéticas de ultra alta fidelidad (Sol, Vale, Cove, etc.) con respiración natural.",
      "No incluye avatar 3D o corporización antropomórfica (orbe abstracto)."
    ],
    keyTakeawaysForUs: [
      "El modo manos libres (Hands-Free) continuo es vital para aprender idiomas sin tocar la pantalla.",
      "Un avatar 3D añade el componente no verbal (ojos, pico, mirada) que el orbe de ChatGPT no tiene."
    ],
    rating: 9.8
  },
  {
    id: "character_ai",
    name: "Character.AI",
    category: "IA Acompañante / Avatares",
    company: "Character Technologies",
    coreHook: "Apego emocional profundo con personajes personalizados con personalidad, tono y backstory.",
    winningFeatures: [
      "Biblioteca masiva de personalidades creadas por la comunidad.",
      "Llamadas de voz en tiempo real con la voz característica del personaje.",
      "Memoria de 'Rooms' y conversaciones grupales con múltiples IAs."
    ],
    aiCapabilities: [
      "LLMs propietarios optimizados para consistencia de rol (Roleplay), emoción y diálogo informal.",
      "Clonación de voz y síntesis de estilos vocales distintivos."
    ],
    uxDesignPatterns: [
      "Tarjetas de personajes estilizadas con estadísticas de interacción.",
      "Interfaz de chat directo con citas en cursiva para acciones teatrales *sonríe con complicidad*."
    ],
    animationsAndKinematics: [
      "Avatares 2D con efectos de pulso durante el habla y transiciones sutiles."
    ],
    retentionMechanics: [
      "Tiempo de permanencia promedio récord en la industria (>2 horas diarias por usuario activo).",
      "Vínculo parasocial con el tutor / personaje favorito."
    ],
    gamificationAndEconomy: [
      "C.AI+ para saltarse filas de espera y acceso prioritario a nuevos modelos."
    ],
    voiceAndAvatarTech: [
      "Voces con modulación de edad, acento y tono emocional.",
      "Avatares estáticos con overlays de audio."
    ],
    keyTakeawaysForUs: [
      "Darle al Avatar Profesor (ej. Búho o Colibrí) una personalidad pedagógica entrañable con historia y humor.",
      "Permitir alternar entre personalidades: 'Coach estricto', 'Amigo relajado', 'Profesor erudito'."
    ],
    rating: 9.3
  },
  {
    id: "khanmigo",
    name: "Khanmigo",
    category: "EdTech Idiomas",
    company: "Khan Academy",
    coreHook: "Tutoría socrática impulsada por IA: nunca da la respuesta directa, guía al estudiante con preguntas.",
    winningFeatures: [
      "Pedagogía Socrática: Induce al estudiante a deducir la regla gramatical por sí mismo.",
      "Integración profunda con mapas de conocimiento y estándares educativos.",
      "Modo co-escritor de ensayos y debates interactivos."
    ],
    aiCapabilities: [
      "Prompts de sistema diseñados pedagógicamente para evitar el 'efecto trampa'.",
      "Evaluación formativa continua sin calificar solo con correcto/incorrecto."
    ],
    uxDesignPatterns: [
      "Panel lateral integrado con el contenido educativo.",
      "Pistas escalonadas (Hint 1 -> Hint 2 -> Solución guiada)."
    ],
    animationsAndKinematics: [
      "Indicadores de pensamiento reflexivo ('Khanmigo está formulando una pregunta...')."
    ],
    retentionMechanics: [
      "Seguimiento para padres y maestros con dashboards de progreso real."
    ],
    gamificationAndEconomy: [
      "Insignias de maestría de conceptos (Mastery Points) de Khan Academy."
    ],
    voiceAndAvatarTech: [
      "Principalmente basado en texto y audio estándar."
    ],
    keyTakeawaysForUs: [
      "El modo de enseñanza socrático es ideal para niveles intermedios y avanzados (B1-C1).",
      "Proveer pistas pedagógicas y explicaciones gramaticales sin abrumar."
    ],
    rating: 9.1
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs (Reader & Conversational AI)",
    category: "Generación de Voz / Audio",
    company: "ElevenLabs",
    coreHook: "La síntesis de voz neuronal más realista del mundo con emoción, cadencia y prosodia humana.",
    winningFeatures: [
      "Conversational AI SDK con latencia <400ms para agentes interactivos.",
      "Clonación de voz instantánea con 30 segundos de muestra de audio.",
      "Modelos multilingües con preservación de acento nativo."
    ],
    aiCapabilities: [
      "Modelos generativos de audio end-to-end con control de estabilidad, claridad y estilo.",
      "Detección y generación de pausas para respiración natural."
    ],
    uxDesignPatterns: [
      "Sliders de afinación de voz (Estabilidad vs. Variabilidad emocional).",
      "Visores de ondas de audio y widgets embebibles de conversación."
    ],
    animationsAndKinematics: [
      "Ondas de sonido estilizadas con gradientes y transiciones fluidas."
    ],
    retentionMechanics: [
      "APIs robustas para creadores y experiencia auditiva de alta inmersión."
    ],
    gamificationAndEconomy: [
      "Planes por créditos de caracteres y suscripciones mensuales."
    ],
    voiceAndAvatarTech: [
      "El estándar de oro en voces para avatares virtuales y doblaje con IA."
    ],
    keyTakeawaysForUs: [
      "Permitir conmutar entre ElevenLabs (calidad de estudio ultra realista) y Web Speech API (gratis y offline)."
    ],
    rating: 9.7
  },
  {
    id: "perplexity",
    name: "Perplexity AI",
    category: "Productividad / Búsqueda",
    company: "Perplexity Inc.",
    coreHook: "Respuestas con fuentes citadas en tiempo real y preguntas de seguimiento inteligentes (Pro Search).",
    winningFeatures: [
      "Búsqueda guiada paso a paso con desglose de fuentes.",
      "Colecciones temáticas (Spaces) para organizar el aprendizaje.",
      "Preguntas sugeridas de seguimiento con un solo clic."
    ],
    aiCapabilities: [
      "Enrutamiento dinámico entre modelos (Claude 3.5 Sonnet, GPT-4o, Sonar).",
      "Generación de resúmenes estructurados con fuentes verificables."
    ],
    uxDesignPatterns: [
      "Chips de preguntas relacionadas al final de cada respuesta.",
      "Tarjetas de fuentes desplegables con vista previa."
    ],
    animationsAndKinematics: [
      "Efecto de revelado progresivo de texto con estados de carga claros."
    ],
    retentionMechanics: [
      "Widgets de escritorio y móviles para búsquedas rápidas diarias."
    ],
    gamificationAndEconomy: [
      "Perplexity Pro con acceso ilimitado a modelos avanzados."
    ],
    voiceAndAvatarTech: [
      "Lectura en voz alta de resúmenes con síntesis fluida."
    ],
    keyTakeawaysForUs: [
      "Añadir chips interactivos de respuestas rápidas (Quick Chips) en cada turno para que el alumno nunca se quede sin saber qué decir."
    ],
    rating: 9.5
  },
  {
    id: "grammarly",
    name: "Grammarly & GrammarlyGO",
    category: "EdTech Idiomas",
    company: "Grammarly Inc.",
    coreHook: "Corrección contextual no invasiva con explicaciones claras del tono, claridad y gramática.",
    winningFeatures: [
      "Correcciones con tarjetas desplegables que explican el 'por qué' del error.",
      "Detector de tono (Formal, Amigable, Seguro, Académico).",
      "Reescritura de oraciones completas para mayor fluidez nativa."
    ],
    aiCapabilities: [
      "Modelos de NLP especializados en sintaxis, colocaciones y modismos en inglés."
    ],
    uxDesignPatterns: [
      "Subrayado de errores en colores según categoría (Rojo: Gramática, Azul: Claridad, Verde: Vocabulario).",
      "Un solo clic para aceptar la sugerencia."
    ],
    animationsAndKinematics: [
      "Micro-animaciones de check verde al aplicar una corrección."
    ],
    retentionMechanics: [
      "Informes semanales de correo con métricas de productividad y precisión gramatical."
    ],
    gamificationAndEconomy: [
      "Puntaje de documento (0 a 100) en tiempo real."
    ],
    voiceAndAvatarTech: [
      "Principalmente texto integrado en el teclado/navegador."
    ],
    keyTakeawaysForUs: [
      "Nuestro motor de corrección gramatical en tiempo real debe categorizar el error (Sintaxis, Preposiciones, Tiempos verbales) con la corrección visible al instante."
    ],
    rating: 9.2
  },
  {
    id: "notebooklm",
    name: "NotebookLM",
    category: "Productividad / Búsqueda",
    company: "Google",
    coreHook: "Audio Overviews: podcasts generados por dos anfitriones de IA que debaten y explican cualquier documento.",
    winningFeatures: [
      "Generación de podcasts conversacionales con interjecciones, risas y química natural.",
      "Grounding estricto sobre las fuentes proporcionadas por el usuario.",
      "Guías de estudio automáticas, glosarios y preguntas frecuentes."
    ],
    aiCapabilities: [
      "Gemini 1.5 Pro con ventana de contexto de 1 millón de tokens y síntesis de prosodia avanzada."
    ],
    uxDesignPatterns: [
      "Reproductor de podcast integrado con control de velocidad y transcripción interactiva."
    ],
    animationsAndKinematics: [
      "Visualizador de ondas de radio y avatares de audio duales durante la conversación."
    ],
    retentionMechanics: [
      "Transforma material denso en audio entretenido para escuchar en trayectos diarios."
    ],
    gamificationAndEconomy: [
      "Herramienta gratuita integrada en el ecosistema de Google."
    ],
    voiceAndAvatarTech: [
      "Dúo conversacional con sincronización de turnos de habla magistral."
    ],
    keyTakeawaysForUs: [
      "Integrar un modo 'Resumen en Podcast' de las lecciones del día con dos avatares comentando los progresos del alumno."
    ],
    rating: 9.6
  },
  {
    id: "cursor_lovable_bolt",
    name: "Cursor / Lovable / Bolt",
    category: "Herramientas de Código / Flow",
    company: "Anysphere / Lovable / StackBlitz",
    coreHook: "Estado de Flow absoluto con feedback instantáneo y previsualización en vivo sin fricción.",
    winningFeatures: [
      "Preview inmediato de resultados con un solo clic.",
      "Modo 'Composer' y agentes autónomos que ejecutan planes complejos en paralelo.",
      "Control por voz y comandos rápidos en lenguaje natural."
    ],
    aiCapabilities: [
      "Inferencia ultrarrápida con Claude 3.5 Sonnet y Gemini 2.5 Flash.",
      "Context-aware codebase indexing."
    ],
    uxDesignPatterns: [
      "Layouts bento-grid con panel de chat a un lado y lienzo interactivo al otro.",
      "Difs visuales claros entre lo anterior y lo nuevo."
    ],
    animationsAndKinematics: [
      "Transiciones de estado instantáneas con spinners e indicadores de progreso discretos."
    ],
    retentionMechanics: [
      "Velocidad de ejecución que elimina el tiempo de espera cognitivo."
    ],
    gamificationAndEconomy: [
      "Límites de peticiones rápidas y planes Pro con uso intensivo."
    ],
    voiceAndAvatarTech: [
      "Enfocado en terminales y código."
    ],
    keyTakeawaysForUs: [
      "La interfaz debe responder en milisegundos y permitir ver el progreso de pronunciación sin interrumpir el flujo de conversación."
    ],
    rating: 9.8
  },
  {
    id: "replika",
    name: "Replika",
    category: "IA Acompañante / Avatares",
    company: "Luka Inc.",
    coreHook: "Compañero virtual 3D completamente personalizable con habitaciones 3D, vestimenta y vínculo diario.",
    winningFeatures: [
      "Avatar 3D que vive en una habitación interactiva personalizable.",
      "Modo llamadas telefónicas y realidad aumentada (AR).",
      "Diario personal compartido donde la IA escribe reflexiones sobre el usuario."
    ],
    aiCapabilities: [
      "Modelos de memoria afectiva a largo plazo y empatía conversacional."
    ],
    uxDesignPatterns: [
      "Render 3D en pantalla completa con controles de personalización de ropa y estética."
    ],
    animationsAndKinematics: [
      "Animaciones de gesticulación de manos, miradas afectivas y cambios de postura en tiempo real."
    ],
    retentionMechanics: [
      "Subida de niveles de amistad / relación con puntos por cada mensaje enviado.",
      "Recompensas diarias por inicio de sesión (Gemas y Monedas para la tienda)."
    ],
    gamificationAndEconomy: [
      "Tienda 3D de ropa, accesorios, personalidad y muebles para la habitación."
    ],
    voiceAndAvatarTech: [
      "Llamadas de voz en tiempo real con lip-sync en el avatar 3D."
    ],
    keyTakeawaysForUs: [
      "El personalizador 3D de avatar (ropa, sombreros, colores, voz) aumenta dramáticamente el engagement y el sentido de propiedad."
    ],
    rating: 9.0
  }
];
