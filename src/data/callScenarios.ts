export interface CallScenario {
  id: string;
  title: string;
  description: string;
  emoji: string;
  ambientSound: "cafe" | "airport" | "rain" | "office" | "off";
  starterPrompt: string;
  suggestions: Array<{
    en: string;
    es: string;
  }>;
  keyVocabulary: Array<{
    word: string;
    ipa: string;
    meaning: string;
    phoneticSpanish: string;
    example: string;
  }>;
}

export const CALL_SCENARIOS: CallScenario[] = [
  {
    id: "cafe",
    title: "Ordering at a Café",
    description: "Pide café, bebidas personalizadas y comida con soltura.",
    emoji: "☕",
    ambientSound: "cafe",
    starterPrompt: "Welcome to Starbucks! What can I get started for you today?",
    suggestions: [
      {
        en: "I'd like a large iced latte with oat milk, please.",
        es: "Me gustaría un café con leche helado grande con leche de avena, por favor.",
      },
      {
        en: "Do you have any fresh blueberry muffins today?",
        es: "¿Tienen muffins de arándanos frescos hoy?",
      },
      {
        en: "Could I get this to go, and can I pay with card?",
        es: "¿Podría pedir esto para llevar y pagar con tarjeta?",
      },
      {
        en: "How much is the total with tax included?",
        es: "¿Cuánto es el total con impuestos incluidos?",
      },
    ],
    keyVocabulary: [
      {
        word: "to go",
        ipa: "/tə ɡoʊ/",
        meaning: "Para llevar (comida o bebida)",
        phoneticSpanish: "tu-góu",
        example: "Can I get this coffee to go, please?",
      },
      {
        word: "oat milk",
        ipa: "/oʊt mɪlk/",
        meaning: "Leche de avena",
        phoneticSpanish: "óut-milk",
        example: "I prefer iced lattes with oat milk.",
      },
      {
        word: "receipt",
        ipa: "/rɪˈsiːt/",
        meaning: "Recibo / Comprobante de pago",
        phoneticSpanish: "ri-síit",
        example: "Would you like your receipt in the bag?",
      },
    ],
  },
  {
    id: "airport",
    title: "Airport Check-in & Gate",
    description: "Resuelve dudas de equipaje, puertas de embarque y vuelos.",
    emoji: "✈️",
    ambientSound: "airport",
    starterPrompt: "Hello, passport and ticket please. How many bags are you checking today?",
    suggestions: [
      {
        en: "I only have one carry-on suitcase and a backpack.",
        es: "Solo tengo una maleta de mano y una mochila.",
      },
      {
        en: "Which gate is flight 402 to Miami boarding from?",
        es: "¿Por cuál puerta está abordando el vuelo 402 a Miami?",
      },
      {
        en: "Is there any delay due to the weather conditions?",
        es: "¿Hay algún retraso debido a las condiciones del clima?",
      },
      {
        en: "Could I request a window seat if one is available?",
        es: "¿Podría solicitar un asiento junto a la ventana si hay alguno disponible?",
      },
    ],
    keyVocabulary: [
      {
        word: "carry-on",
        ipa: "/ˈkæri.ɑːn/",
        meaning: "Equipaje de mano permitido en cabina",
        phoneticSpanish: "kéri-on",
        example: "Please place your carry-on in the overhead bin.",
      },
      {
        word: "boarding pass",
        ipa: "/ˈbɔːr.dɪŋ pæs/",
        meaning: "Pase de abordar / Tarjeta de embarque",
        phoneticSpanish: "bóor-ding pas",
        example: "Have your boarding pass ready at the gate.",
      },
      {
        word: "layover",
        ipa: "/ˈleɪˌoʊ.vɚ/",
        meaning: "Escala / Parada intermedia de vuelo",
        phoneticSpanish: "léi-ou-ver",
        example: "I have a two-hour layover in Atlanta.",
      },
    ],
  },
  {
    id: "interview",
    title: "Job Interview Warmup",
    description: "Practica cómo hablar de tus fortalezas y trayectoria profesional.",
    emoji: "💼",
    ambientSound: "office",
    starterPrompt: "Welcome! Thank you for joining today. Could you start by telling me a little about yourself?",
    suggestions: [
      {
        en: "I have over three years of experience building web applications.",
        es: "Tengo más de tres años de experiencia construyendo aplicaciones web.",
      },
      {
        en: "I consider myself proactive, detail-oriented, and a great team player.",
        es: "Me considero proactivo, orientado al detalle y buen compañero de equipo.",
      },
      {
        en: "What does a typical day look like in this role?",
        es: "¿Cómo es un día típico en este puesto de trabajo?",
      },
      {
        en: "I'm looking for a position where I can grow and take on new challenges.",
        es: "Busco una posición donde pueda crecer y asumir nuevos retos.",
      },
    ],
    keyVocabulary: [
      {
        word: "strengths",
        ipa: "/strɛŋkθs/",
        meaning: "Fortalezas / Habilidades clave",
        phoneticSpanish: "stréngks",
        example: "One of my greatest strengths is problem-solving under pressure.",
      },
      {
        word: "fast-paced",
        ipa: "/ˌfæstˈpeɪst/",
        meaning: "Dinámico / De ritmo acelerado",
        phoneticSpanish: "fast-péist",
        example: "I enjoy working in fast-paced agile environments.",
      },
      {
        word: "milestone",
        ipa: "/ˈmaɪl.stoʊn/",
        meaning: "Hito / Logro significativo",
        phoneticSpanish: "máil-stoun",
        example: "We reached every project milestone on time.",
      },
    ],
  },
  {
    id: "hotel",
    title: "Hotel Check-in & Concierge",
    description: "Gestiona tu estancia, peticiones y recomendaciones turísticas.",
    emoji: "🏨",
    ambientSound: "office",
    starterPrompt: "Good evening! Welcome to the Grand Hyatt. How may I assist you today?",
    suggestions: [
      {
        en: "Hello, I have a reservation for three nights under the name Carlos.",
        es: "Hola, tengo una reserva por tres noches a nombre de Carlos.",
      },
      {
        en: "What time is breakfast served in the morning?",
        es: "¿A qué hora se sirve el desayuno por la mañana?",
      },
      {
        en: "Could we request extra towels and two extra pillows, please?",
        es: "¿Podríamos pedir toallas adicionales y dos almohadas extra, por favor?",
      },
      {
        en: "Is it possible to arrange a late checkout at 1 PM?",
        es: "¿Es posible coordinar un late check-out a la 1:00 PM?",
      },
    ],
    keyVocabulary: [
      {
        word: "amenities",
        ipa: "/əˈmen.ə.t̬iz/",
        meaning: "Comodidades / Servicios del hotel (piscina, wifi, gimnasio)",
        phoneticSpanish: "a-mén-i-tis",
        example: "All guests have free access to the hotel amenities.",
      },
      {
        word: "late check-out",
        ipa: "/leɪt ˈtʃek.aʊt/",
        meaning: "Salida tardía de la habitación",
        phoneticSpanish: "leit-chék-aut",
        example: "Can I request a complimentary late check-out?",
      },
      {
        word: "housekeeping",
        ipa: "/ˈhaʊsˌkiː.pɪŋ/",
        meaning: "Servicio de limpieza de habitaciones",
        phoneticSpanish: "jáus-ki-ping",
        example: "Please call housekeeping if you need fresh sheets.",
      },
    ],
  },
  {
    id: "restaurant",
    title: "Dining Out & Restaurant",
    description: "Pregunta por platos del día, ingredientes y la cuenta.",
    emoji: "🍽️",
    ambientSound: "cafe",
    starterPrompt: "Good evening! Table for two? Follow me this way. What would you like to drink to start?",
    suggestions: [
      {
        en: "Could you tell us what the chef's daily special is?",
        es: "¿Podría decirnos cuál es la especialidad del chef de hoy?",
      },
      {
        en: "I'm allergic to nuts. Does this dressing contain any allergens?",
        es: "Soy alérgico a los frutos secos. ¿Este aderezo contiene alérgenos?",
      },
      {
        en: "Everything was delicious! Could we have the bill, please?",
        es: "¡Todo estuvo delicioso! ¿Nos trae la cuenta, por favor?",
      },
      {
        en: "Can we split the payment evenly between two credit cards?",
        es: "¿Podemos dividir el pago en partes iguales entre dos tarjetas?",
      },
    ],
    keyVocabulary: [
      {
        word: "daily special",
        ipa: "/ˈdeɪli ˈspɛʃəl/",
        meaning: "Plato del día / Especialidad sugerida",
        phoneticSpanish: "déili-spé-shal",
        example: "The daily special is grilled Atlantic salmon.",
      },
      {
        word: "split the bill",
        ipa: "/splɪt ðə bɪl/",
        meaning: "Dividir o repartir la cuenta",
        phoneticSpanish: "split-de-bil",
        example: "Let's split the bill evenly among all of us.",
      },
      {
        word: "dressing",
        ipa: "/ˈdrɛs.ɪŋ/",
        meaning: "Aderezo / Salsa para ensalada",
        phoneticSpanish: "dré-sing",
        example: "Would you like ranch or balsamic dressing on the side?",
      },
    ],
  },
  {
    id: "daily",
    title: "Casual Conversation & Hobbies",
    description: "Charla abierta y fluida sobre tu día, planes y pasatiempos.",
    emoji: "💬",
    ambientSound: "rain",
    starterPrompt: "Hey there! How has your day been so far? Tell me what you've been up to!",
    suggestions: [
      {
        en: "I've been busy practicing my English listening skills today.",
        es: "He estado ocupado practicando mi comprensión auditiva en inglés hoy.",
      },
      {
        en: "I really enjoy listening to podcasts and going for outdoor walks.",
        es: "Realmente disfruto escuchar podcasts y salir a caminar al aire libre.",
      },
      {
        en: "What are some of your favorite places to visit in the summer?",
        es: "¿Cuáles son algunos de tus lugares favoritos para visitar en verano?",
      },
      {
        en: "Could you recommend an interesting movie or TV show to watch?",
        es: "¿Podrías recomendarme una película o serie interesante para ver?",
      },
    ],
    keyVocabulary: [
      {
        word: "catch up",
        ipa: "/kætʃ ʌp/",
        meaning: "Ponerse al día (conversar tras tiempo sin verse)",
        phoneticSpanish: "kach-ap",
        example: "It's so great to catch up with you today!",
      },
      {
        word: "chill out",
        ipa: "/tʃɪl aʊt/",
        meaning: "Relajarse / Descansar con calma",
        phoneticSpanish: "chil-aut",
        example: "I usually chill out on Sunday evenings with some music.",
      },
      {
        word: "hobby",
        ipa: "/ˈhɑː.bi/",
        meaning: "Pasatiempo o afición favorita",
        phoneticSpanish: "já-bi",
        example: "Learning languages has become my favorite hobby.",
      },
    ],
  },
];
