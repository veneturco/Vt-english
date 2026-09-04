export interface AccentJargon {
  term: string;
  equivalent: string;
  meaning: string;
  example: string;
}

export interface AccentExercise {
  id: string;
  title: string;
  situation: string;
  speakerRole: string;
  audioText: string;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  culturalTip: string;
}

export interface GlobalAccentTrack {
  id: string;
  name: string;
  shortName: string;
  countryCode: "US" | "UK" | "AU" | "IN" | "EU";
  flag: string;
  speechLang: string;
  preferredGender: "female" | "male";
  keyFeatures: string[];
  phoneticTip: string;
  jargon: AccentJargon[];
  exercises: AccentExercise[];
}

export const GLOBAL_ACCENTS_DATA: GlobalAccentTrack[] = [
  {
    id: "us_accent",
    name: "American Standard (US)",
    shortName: "Americano (US)",
    countryCode: "US",
    flag: "🇺🇸",
    speechLang: "en-US",
    preferredGender: "female",
    keyFeatures: [
      "Rótico marcado: la 'r' siempre se pronuncia claramente.",
      "Flap T: la 't' intervocálica suena como una suave 'd' ('water' -> 'wah-der').",
      "Vocales abiertas y directas con cadencia relajada.",
    ],
    phoneticTip: "Suaviza las consonantes intermedias: 'schedule' se dice 'SKED-jool', 'better' suena 'BED-er'.",
    jargon: [
      { term: "Touch base", equivalent: "Catch up", meaning: "Hacer contacto breve de seguimiento.", example: "Let's touch base before Friday's demo." },
      { term: "Ballpark figure", equivalent: "Rough estimate", meaning: "Estimación aproximada de costos.", example: "Give me a ballpark figure for Q3 budget." },
      { term: "Circle back", equivalent: "Follow up later", meaning: "Retomar el tema más adelante.", example: "I will circle back with the client tomorrow." },
    ],
    exercises: [
      {
        id: "us_1",
        title: "Seguimiento de Proyecto Ágil",
        situation: "Reunión diaria de standup con un Scrum Master de California.",
        speakerRole: "Sarah (Product Lead)",
        audioText: "Hey team, let's touch base about the quarterly deliverables. Can we circle back this afternoon with a ballpark figure for the new cloud migration?",
        question: "¿Qué solicita la líder de producto para esta tarde?",
        options: [
          { id: "a", text: "Una estimación aproximada del costo de migración a la nube.", isCorrect: true, explanation: "'Ballpark figure' significa una estimación aproximada del presupuesto o alcance." },
          { id: "b", text: "El contrato legal firmado con el proveedor.", isCorrect: false, explanation: "No mencionó contratos legales, sino estimaciones y seguimiento." },
          { id: "c", text: "La cancelación inmediata del proyecto trimestral.", isCorrect: false, explanation: "Al contrario, busca coordinar entregables y retomar el tema ('circle back')." },
          { id: "d", text: "Programar un partido de béisbol con el equipo.", isCorrect: false, explanation: "'Ballpark' en negocios es una metáfora que alude a un rango o cálculo estimado." },
        ],
        culturalTip: "En la cultura corporativa de EE. UU. las metáforas de béisbol y deportes son muy comunes ('touch base', 'ballpark figure', 'curveball').",
      },
      {
        id: "us_2",
        title: "Presupuesto y Cronograma",
        situation: "Llamada con un director financiero en Nueva York.",
        speakerRole: "David (Finance VP)",
        audioText: "Look, we need to cut through the noise. If we can't lock in this deal by Friday, we risk putting the whole Q4 rollout on the back burner.",
        question: "¿Qué ocurrirá si el acuerdo no se cierra este viernes?",
        options: [
          { id: "a", text: "El lanzamiento del cuarto trimestre se pospondrá o pasará a segundo plano.", isCorrect: true, explanation: "'Put on the back burner' significa posponer o dejar algo para después." },
          { id: "b", text: "Se contratará un nuevo equipo técnico de inmediato.", isCorrect: false, explanation: "No menciona contrataciones, sino retrasos en el despliegue." },
          { id: "c", text: "La empresa duplicará el presupuesto de marketing.", isCorrect: false, explanation: "Advierte sobre el riesgo de aplazar el proyecto ('risk putting on the back burner')." },
        ],
        culturalTip: "La expresión 'cut through the noise' es típica en EE. UU. para ir directo al grano sin rodeos.",
      },
    ],
  },
  {
    id: "uk_accent",
    name: "British RP & Corporate (UK)",
    shortName: "Británico (UK)",
    countryCode: "UK",
    flag: "🇬🇧",
    speechLang: "en-GB",
    preferredGender: "male",
    keyFeatures: [
      "No rótico: la 'r' al final de sílaba casi no se pronuncia ('car' -> /kɑː/).",
      "Glottal stop o T articulada y nítida ('water' -> /ˈwɔː.tər/).",
      "Entonación melódica y vocabulario de cortesía formal británica.",
    ],
    phoneticTip: "'Schedule' se pronuncia 'SHED-yool' (no 'sked-jool'). 'Half' y 'can't' usan vocal larga /ɑː/ ('hahf', 'cahnt').",
    jargon: [
      { term: "Fortnight", equivalent: "Two weeks", meaning: "Un período de dos semanas.", example: "The audit will conclude in a fortnight." },
      { term: "Chuffed", equivalent: "Thrilled / Pleased", meaning: "Muy satisfecho o contento con un logro.", example: "We are rather chuffed with the client's feedback." },
      { term: "Suss out", equivalent: "Figure out", meaning: "Investigar o descubrir la verdad de un asunto.", example: "Let's suss out what their key objection is." },
    ],
    exercises: [
      {
        id: "uk_1",
        title: "Revisión de Auditoría en Londres",
        situation: "Llamada de status con un director de operaciones en la City de Londres.",
        speakerRole: "Oliver (Operations Director)",
        audioText: "Right then. I've examined the proposal. Whilst there are a few snags with the timetable, I expect we can suss out a proper compromise within a fortnight.",
        question: "¿Cuál es la conclusión del director sobre el calendario de trabajo?",
        options: [
          { id: "a", text: "Hay algunos obstáculos menores pero llegarán a un acuerdo en dos semanas.", isCorrect: true, explanation: "'Snags' son pequeños problemas y 'within a fortnight' significa en un plazo de dos semanas." },
          { id: "b", text: "El proyecto queda cancelado por completo debido a fallas graves.", isCorrect: false, explanation: "Dice que espera alcanzar un compromiso adecuado ('proper compromise')." },
          { id: "c", text: "Exige una respuesta en las próximas 48 horas.", isCorrect: false, explanation: "El plazo planteado es 'within a fortnight' (dos semanas)." },
        ],
        culturalTip: "En Reino Unido la crítica suele suavizarse con diplomacia ('whilst there are a few snags' significa que hay detalles que ajustar, sin sonar agresivo).",
      },
      {
        id: "uk_2",
        title: "Presentación a Clientes",
        situation: "Comentarios tras una reunión de ventas en Edimburgo.",
        speakerRole: "Arthur (Senior Partner)",
        audioText: "I must say the board was thoroughly chuffed with your presentation. Brilliant job keeping your cool during the tough queries.",
        question: "¿Cómo reaccionó la junta directiva a la presentación?",
        options: [
          { id: "a", text: "Quedaron sumamente complacidos y satisfechos con el trabajo.", isCorrect: true, explanation: "'Thoroughly chuffed' significa completamente encantados y satisfechos." },
          { id: "b", text: "Quedaron confundidos por los datos técnicos presentados.", isCorrect: false, explanation: "'Chuffed' no es confuso ni enojado, sino muy contento." },
          { id: "c", text: "Solicitaron rehacer la presentación con otro orador.", isCorrect: false, explanation: "Elogia la compostura del presentador ('brilliant job keeping your cool')." },
        ],
        culturalTip: "'Brilliant' es uno de los adjetivos de aprobación más usados en el inglés británico profesional.",
      },
    ],
  },
  {
    id: "in_accent",
    name: "Indian Business English (IN)",
    shortName: "Inglés de la India (IN)",
    countryCode: "IN",
    flag: "🇮🇳",
    speechLang: "en-IN",
    preferredGender: "female",
    keyFeatures: [
      "Cadencia silábica (*syllable-timed*): ritmo más regular entre cada sílaba.",
      "Consonantes retroflejas: la lengua toca ligeramente el paladar en la /t/ y la /d/.",
      "Frases idiomáticas corporativas específicas muy comunes en tecnología y servicios globales.",
    ],
    phoneticTip: "Presta atención al tono ascendente al final de oraciones afirmativas y a la articulación clara de cada consonante.",
    jargon: [
      { term: "Do the needful", equivalent: "Take necessary action", meaning: "Tomar las acciones requeridas para resolver el asunto.", example: "Please review the attached invoice and do the needful." },
      { term: "Prepone", equivalent: "Move forward / advance", meaning: "Adelantar una reunión a una fecha anterior (antónimo de postpone).", example: "Can we prepone the client sync to 2 PM?" },
      { term: "Revert back", equivalent: "Reply / Respond", meaning: "Responder con la información solicitada.", example: "I will revert back once the build is deployed." },
    ],
    exercises: [
      {
        id: "in_1",
        title: "Coordinación de Entrega en Bangalore",
        situation: "Mensaje de voz de un Senior Tech Lead en Bangalore sobre un incidente de software.",
        speakerRole: "Priya (Tech Lead)",
        audioText: "Hi team, regarding the production ticket, we have patched the API. Kindly check from your end and do the needful. Also, can we prepone our sync meeting by one hour?",
        question: "¿Qué dos peticiones hace Priya al equipo?",
        options: [
          { id: "a", text: "Revisar el parche y adelantar la reunión de sincronización una hora.", isCorrect: true, explanation: "'Do the needful' es tomar la acción debida y 'prepone' es adelantar la hora de la reunión." },
          { id: "b", text: "Posponer la reunión para el día de mañana y cancelar el parche.", isCorrect: false, explanation: "'Prepone' significa adelantar, no posponer ('postpone')." },
          { id: "c", text: "Reiniciar todos los servidores de base de datos inmediatamente.", isCorrect: false, explanation: "Ya aplicaron el parche y solo piden verificar y coordinar la reunión." },
        ],
        culturalTip: "'Prepone' es una palabra estándar en el inglés de la India que ahora es ampliamente entendida en el ámbito tech internacional.",
      },
      {
        id: "in_2",
        title: "Revisión de Requerimientos de Cliente",
        situation: "Resumen de requerimientos de software en una llamada de arquitectura.",
        speakerRole: "Rajesh (Delivery Manager)",
        audioText: "I am sharing the revised functional document now. Please go through it and revert back with your confirmation by EOD.",
        question: "¿Qué espera Rajesh al final del día (EOD)?",
        options: [
          { id: "a", text: "Una respuesta con la confirmación de haber revisado el documento.", isCorrect: true, explanation: "'Revert back' se usa en India para significar 'responder o dar contestación'." },
          { id: "b", text: "Revertir el código a la versión anterior de producción.", isCorrect: false, explanation: "Aquí 'revert back' significa responder un correo o mensaje, no deshacer cambios en Git." },
          { id: "c", text: "Un informe financiero detallado del costo del proyecto.", isCorrect: false, explanation: "Se refiere al documento funcional compartido y pide confirmación." },
        ],
        culturalTip: "En la India, 'EOD' (End of Day) es la fecha límite estándar para cerrar tareas diarias.",
      },
    ],
  },
  {
    id: "au_accent",
    name: "Australian Professional (AU)",
    shortName: "Australiano (AU)",
    countryCode: "AU",
    flag: "🇦🇺",
    speechLang: "en-AU",
    preferredGender: "female",
    keyFeatures: [
      "No rótico con diptongos abiertos ('today' puede sonar cercano a 'to-die').",
      "High Rising Terminal (HRT): entonación que sube al final incluso en oraciones no interrogativas.",
      "Cultura relajada y colaborativa, pero directa en los negocios.",
    ],
    phoneticTip: "Las 'a' en palabras como 'chance' o 'plant' suelen pronunciarse abiertas (/ɑː/), y las terminaciones en '-ay' tienen una resonancia amplia.",
    jargon: [
      { term: "No worries", equivalent: "No problem / You're welcome", meaning: "De nada, o no hay ningún problema.", example: "No worries mate, we will sort it out." },
      { term: "Give it a go", equivalent: "Try it out", meaning: "Intentar o probar una solución.", example: "Let's give the new marketing strategy a go." },
      { term: "Fair dinkum", equivalent: "Genuine / Honest", meaning: "Auténtico, honesto o legítimo.", example: "Is this client's proposal fair dinkum?" },
    ],
    exercises: [
      {
        id: "au_1",
        title: "Llamada de Estrategia en Sídney",
        situation: "Reunión de marketing con una socia en Sídney.",
        speakerRole: "Chloe (Growth Director)",
        audioText: "G'day team. No worries about the minor delay this morning. I reckon we should give the pilot campaign a go this arvo and see how the market reacts.",
        question: "¿Qué propone Chloe respecto a la campaña piloto?",
        options: [
          { id: "a", text: "Probar y lanzar la campaña piloto esta misma tarde.", isCorrect: true, explanation: "'Give it a go' significa probarlo y 'this arvo' significa esta tarde ('this afternoon')." },
          { id: "b", text: "Cancelar el piloto debido al retraso de la mañana.", isCorrect: false, explanation: "Dijo 'no worries' sobre el retraso y propuso avanzar con el piloto." },
          { id: "c", text: "Pedir permiso formal a los reguladores del gobierno.", isCorrect: false, explanation: "Propone probar el piloto en el mercado hoy mismo." },
        ],
        culturalTip: "Las abreviaciones con '-o' (arvo = afternoon) son omnipresentes en el inglés australiano tanto cotidiano como profesional informal.",
      },
    ],
  },
  {
    id: "eu_accent",
    name: "Euro-English & Global Corporate (EU)",
    shortName: "Euro-English (EU)",
    countryCode: "EU",
    flag: "🇪🇺",
    speechLang: "en-GB",
    preferredGender: "female",
    keyFeatures: [
      "Pronunciación neutral, directa y muy clara para evitar malentendidos multiculturales.",
      "Uso de términos directos y evitación de modismos excesivamente locales.",
      "El inglés estándar utilizado en sedes de Fráncfort, Bruselas, Ámsterdam y Zúrich.",
    ],
    phoneticTip: "Consonantes nítidas, articulación limpia de las terminaciones '-ed' y ritmo pausado enfocado en la precisión técnica.",
    jargon: [
      { term: "Action point", equivalent: "Action item / To-do", meaning: "Tarea concreta asignada tras una reunión.", example: "Let's list the key action points before adjourning." },
      { term: "Align on", equivalent: "Agree on", meaning: "Estar alineados en los mismos objetivos.", example: "We need to align on the project scope." },
      { term: "Sign-off", equivalent: "Official approval", meaning: "Aprobación formal por escrito.", example: "We are waiting for executive sign-off." },
    ],
    exercises: [
      {
        id: "eu_1",
        title: "Comité Ejecutivo en Bruselas",
        situation: "Cierre de un comité directivo con participantes de varios países europeos.",
        speakerRole: "Elena (Program Director)",
        audioText: "To summarize: everyone is aligned on the scope. I will send the three main action points by email, and we expect formal sign-off from legal by Tuesday noon.",
        question: "¿Cuál es el siguiente paso acordado por el comité?",
        options: [
          { id: "a", text: "Enviar los 3 puntos de acción y esperar la firma formal de Legal para el martes a mediodía.", isCorrect: true, explanation: "'Action points' son tareas concretas y 'sign-off' es la aprobación formal esperada para el martes." },
          { id: "b", text: "Rediseñar el alcance del proyecto desde cero.", isCorrect: false, explanation: "Afirma que 'everyone is aligned on the scope' (todos están de acuerdo)." },
          { id: "c", text: "Suspender las comunicaciones por correo electrónico.", isCorrect: false, explanation: "Enviará los puntos de acción por correo inmediatamente." },
        ],
        culturalTip: "En las multinacionales europeas se valora la claridad ejecutiva y la precisión en fechas de entrega ('Tuesday noon').",
      },
    ],
  },
];
