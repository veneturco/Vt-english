export interface LessonOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface LessonQuestion {
  id: string;
  type: "translation_multiple_choice";
  instruction: string;
  englishPrompt: string;
  pronunciationHint?: string;
  options: LessonOption[];
  explanation?: string;
}

export const LESSON_QUESTION_BANK: Record<string, LessonQuestion[]> = {
  // UNIT 1: Primeros Pasos en la Oficina (A1)
  "u1-n1": [
    {
      id: "u1n1-q1",
      type: "translation_multiple_choice",
      instruction: "Selecciona la forma correcta de presentarte profesionalmente",
      englishPrompt: "Hello, my name is Alex and I'm a software engineer.",
      pronunciationHint: "je-lóu, mai néim is á-leks and aim a sóft-wer en-yi-níir",
      options: [
        { id: "opt-1", text: "Hola, mi nombre es Alex y soy ingeniero de software.", isCorrect: true },
        { id: "opt-2", text: "Hola, me llamo Alex y busco un nuevo empleo técnico.", isCorrect: false },
        { id: "opt-3", text: "Hola, Alex es mi supervisor de ingeniería informática.", isCorrect: false },
      ],
      explanation: "'I'm a software engineer' utiliza el artículo 'a' antes de profesiones que inician con consonante.",
    },
    {
      id: "u1n1-q2",
      type: "translation_multiple_choice",
      instruction: "¿Cuál es el significado de este saludo corporativo?",
      englishPrompt: "It's a pleasure to meet you. Welcome to our team!",
      pronunciationHint: "its a plé-zher tu miit yu. wél-kam tu áur tiim",
      options: [
        { id: "opt-1", text: "¿Podemos reunirnos mañana por la mañana?", isCorrect: false },
        { id: "opt-2", text: "Es un placer conocerte. ¡Bienvenido a nuestro equipo!", isCorrect: true },
        { id: "opt-3", text: "Fue un gusto hablar contigo en la entrevista de trabajo.", isCorrect: false },
      ],
      explanation: "'It's a pleasure to meet you' es la fórmula más educada y estándar al conocer a un colega.",
    },
    {
      id: "u1n1-q3",
      type: "translation_multiple_choice",
      instruction: "Traduce cómo decir de dónde eres y tu ubicación",
      englishPrompt: "I'm based in Madrid, but I work remotely with the US branch.",
      pronunciationHint: "aim béist in ma-dríd, bat ai werk ri-móut-li wid da iu-és branch",
      options: [
        { id: "opt-1", text: "Vivo en Madrid pero trabajo en remoto con la sucursal de EE. UU.", isCorrect: true },
        { id: "opt-2", text: "Viajo frecuentemente a Madrid para visitar la sede de EE. UU.", isCorrect: false },
        { id: "opt-3", text: "Estoy buscando mudarme a Madrid el próximo mes de trabajo.", isCorrect: false },
      ],
      explanation: "'To be based in' se usa en el mundo profesional para indicar tu ciudad de residencia habitual.",
    },
    {
      id: "u1n1-q4",
      type: "translation_multiple_choice",
      instruction: "Identifica la respuesta para presentarte con entusiasmo",
      englishPrompt: "I'm really excited to collaborate with everyone on this project.",
      pronunciationHint: "aim rí-li ek-sái-ted tu ko-lá-bo-reit wid é-vri-wan on dis pró-yekt",
      options: [
        { id: "opt-1", text: "Tengo dudas sobre el presupuesto asignado a este proyecto.", isCorrect: false },
        { id: "opt-2", text: "Estoy muy emocionado de colaborar con todos en este proyecto.", isCorrect: true },
        { id: "opt-3", text: "Prefiero trabajar de forma independiente en esta iniciativa.", isCorrect: false },
      ],
      explanation: "'Excited to collaborate' es una expresión clave para transmitir proactividad y trabajo en equipo.",
    },
  ],

  "u1-n2": [
    {
      id: "u1n2-q1",
      type: "translation_multiple_choice",
      instruction: "¿Cómo pedirías un café con leche vegetal en la cafetería?",
      englishPrompt: "Could I please get a medium latte with oat milk?",
      pronunciationHint: "kud ai pliiz get a míi-di-om lá-tei wid óut milk",
      options: [
        { id: "opt-1", text: "¿Podría pedir un latte mediano con leche de avena, por favor?", isCorrect: true },
        { id: "opt-2", text: "¿Tienen mesas disponibles para tomar un café rápido?", isCorrect: false },
        { id: "opt-3", text: "¿El café americano incluye azúcar y leche desnatada?", isCorrect: false },
      ],
      explanation: "'Could I please get...' es la forma más natural y cortés en cafeterías de EE. UU. y Reino Unido.",
    },
    {
      id: "u1n2-q2",
      type: "translation_multiple_choice",
      instruction: "Traduce la pregunta habitual del barista",
      englishPrompt: "Is that for here or to go?",
      pronunciationHint: "is dat for jíir or tu gou",
      options: [
        { id: "opt-1", text: "¿Prefieres café caliente o café helado?", isCorrect: false },
        { id: "opt-2", text: "¿Deseas pagar con tarjeta de crédito o efectivo?", isCorrect: false },
        { id: "opt-3", text: "¿Es para tomar aquí o para llevar?", isCorrect: true },
      ],
      explanation: "'To go' (en inglés americano) o 'takeaway' (en británico) significa para llevar.",
    },
    {
      id: "u1n2-q3",
      type: "translation_multiple_choice",
      instruction: "¿Cómo pides el ticket o recibo de tu compra?",
      englishPrompt: "May I have the receipt for my company expense report?",
      pronunciationHint: "méi ai jav da ri-síit for mai kóm-pa-ni eks-péns ri-pórt",
      options: [
        { id: "opt-1", text: "¿Me das el recibo para mi reporte de gastos de la empresa?", isCorrect: true },
        { id: "opt-2", text: "¿Puedo pagar la cuenta de todo el equipo hoy?", isCorrect: false },
        { id: "opt-3", text: "¿Tienen descuento corporativo para empleados?", isCorrect: false },
      ],
      explanation: "En 'receipt' la letra 'p' es muda: se pronuncia exactamente /ri-síit/.",
    },
    {
      id: "u1n2-q4",
      type: "translation_multiple_choice",
      instruction: "Expresión para invitar un café a tu compañero de trabajo",
      englishPrompt: "Don't worry about it, this coffee is on me today!",
      pronunciationHint: "dount wó-ri a-báut it, dis kó-fi is on mi tu-déi",
      options: [
        { id: "opt-1", text: "Se me olvidó la billetera en la oficina.", isCorrect: false },
        { id: "opt-2", text: "No te preocupes, ¡este café va por mi cuenta hoy!", isCorrect: true },
        { id: "opt-3", text: "Creo que nos cobraron un café de más en la cuenta.", isCorrect: false },
      ],
      explanation: "'It's on me' es el modismo nativo más popular para decir 'yo invito / corre por mi cuenta'.",
    },
  ],

  "u1-n3": [
    {
      id: "u1n3-q1",
      type: "translation_multiple_choice",
      instruction: "Traduce cómo consultar disponibilidad para una llamada",
      englishPrompt: "Are you free for a quick 15-minute sync tomorrow afternoon?",
      pronunciationHint: "ar yu frii for a kuík fíf-tiin mí-nit sink tu-mó-rou af-ter-núun",
      options: [
        { id: "opt-1", text: "¿Estás libre para una breve coordinación de 15 minutos mañana por la tarde?", isCorrect: true },
        { id: "opt-2", text: "¿Puedes enviar la grabación de la reunión de ayer por la tarde?", isCorrect: false },
        { id: "opt-3", text: "¿Cuándo es la fecha límite para entregar el informe del proyecto?", isCorrect: false },
      ],
      explanation: "'Quick sync' es la expresión profesional estándar para una llamada breve de sincronización.",
    },
    {
      id: "u1n3-q2",
      type: "translation_multiple_choice",
      instruction: "Selecciona cómo proponer un horario específico",
      englishPrompt: "Does 3:00 PM Eastern Time work for your schedule?",
      pronunciationHint: "das zrii pi-ém íis-tern táim werk for yor ské-dyul",
      options: [
        { id: "opt-1", text: "¿A qué hora termina tu jornada laboral los viernes?", isCorrect: false },
        { id: "opt-2", text: "¿Te viene bien a las 3:00 PM hora del este en tu agenda?", isCorrect: true },
        { id: "opt-3", text: "¿Prefieres hacer la llamada por Zoom o por Google Meet?", isCorrect: false },
      ],
      explanation: "'Does [time] work for you?' es la estructura más natural para consultar compatibilidad horaria.",
    },
    {
      id: "u1n3-q3",
      type: "translation_multiple_choice",
      instruction: "¿Cómo confirmas el envío de una invitación de calendario?",
      englishPrompt: "Great! I just sent a Google Meet invite to your corporate email.",
      pronunciationHint: "greit! ai dyast sent a gú-gol miit in-váit tu yor kór-po-reit í-meil",
      options: [
        { id: "opt-1", text: "¡Genial! Acabo de enviar una invitación de Google Meet a tu correo corporativo.", isCorrect: true },
        { id: "opt-2", text: "Revisé tu correo pero no encontré los archivos adjuntos necesarios.", isCorrect: false },
        { id: "opt-3", text: "Por favor confirma si recibiste el mensaje de texto de confirmación.", isCorrect: false },
      ],
      explanation: "'Calendar invite' o simplemente 'invite' se refiere a la convocatoria de calendario con enlace.",
    },
  ],

  "u1-boss": [
    {
      id: "u1boss-q1",
      type: "translation_multiple_choice",
      instruction: "Rompe el hielo con tu supervisor en tu primer día de trabajo",
      englishPrompt: "Thank you for the warm welcome. What are our top priorities for this week?",
      pronunciationHint: "zenk yu for da worm wél-kam. wat ar áur tap prai-ó-ri-tiis for dis wiik",
      options: [
        { id: "opt-1", text: "Gracias por la cálida bienvenida. ¿Cuáles son nuestras principales prioridades para esta semana?", isCorrect: true },
        { id: "opt-2", text: "Gracias por la información. ¿A qué hora son las pausas de almuerzo?", isCorrect: false },
        { id: "opt-3", text: "Ya instalé todos los programas en mi computadora personal.", isCorrect: false },
      ],
      explanation: "Preguntar por 'top priorities' demuestra alineación estratégica desde el primer día.",
    },
    {
      id: "u1boss-q2",
      type: "translation_multiple_choice",
      instruction: "Cómo responder cuando te presentan a tu compañero mentor",
      englishPrompt: "Nice to meet you! I'm looking forward to learning from your experience.",
      pronunciationHint: "náis tu miit yu! aim lú-king fór-ward tu lér-ning from yor eks-píi-ri-ens",
      options: [
        { id: "opt-1", text: "¡Mucho gusto! Espero aprender mucho de tu experiencia.", isCorrect: true },
        { id: "opt-2", text: "¡Hola! ¿Puedes enviarme las claves de acceso a los servidores?", isCorrect: false },
        { id: "opt-3", text: "Mucho gusto, ya conozco todos los procesos del departamento.", isCorrect: false },
      ],
      explanation: "'Looking forward to + verbo -ing' significa esperar con entusiasmo y respeto.",
    },
  ],

  // UNIT 2: Reuniones & Correos Profesionales (A2)
  "u2-n1": [
    {
      id: "u2n1-q1",
      type: "translation_multiple_choice",
      instruction: "¿Cuál es el asunto (Subject Line) más claro y profesional?",
      englishPrompt: "Action Required: Please review Q3 budget spreadsheet by Friday",
      pronunciationHint: "ák-shon ri-kuái-erd: pliiz ri-viú kiu-zrii bád-dyet spréd-shiit bai frái-dei",
      options: [
        { id: "opt-1", text: "Acción requerida: Por favor revisar hoja de presupuesto del 3er trimestre antes del viernes", isCorrect: true },
        { id: "opt-2", text: "Noticia urgente: Cancelación de la reunión trimestral de finanzas", isCorrect: false },
        { id: "opt-3", text: "Información general: Nuevas políticas contables para todos los empleados", isCorrect: false },
      ],
      explanation: "'Action Required' al inicio del asunto aumenta la tasa de apertura y respuesta rápida.",
    },
    {
      id: "u2n1-q2",
      type: "translation_multiple_choice",
      instruction: "¿Cómo avisas formalmente que adjuntaste un archivo?",
      englishPrompt: "Please find the requested proposal attached for your review.",
      pronunciationHint: "pliiz faind da ri-kués-ted pro-póu-sal a-tácht for yor ri-viú",
      options: [
        { id: "opt-1", text: "Te adjunto la propuesta solicitada para tu revisión.", isCorrect: true },
        { id: "opt-2", text: "Descargué la propuesta del enlace que me enviaste antes.", isCorrect: false },
        { id: "opt-3", text: "No pude abrir el archivo adjunto que venía en tu correo.", isCorrect: false },
      ],
      explanation: "'Please find attached' es la fórmula por excelencia en correspondencia corporativa en inglés.",
    },
    {
      id: "u2n1-q3",
      type: "translation_multiple_choice",
      instruction: "Cierre formal y educado para un correo de negocios",
      englishPrompt: "Please let me know if you have any questions or feedback. Best regards,",
      pronunciationHint: "pliiz let mi nou if yu jav é-ni kués-chons or fíid-bak. best ri-gárds",
      options: [
        { id: "opt-1", text: "Avísame si tienes preguntas o comentarios. Saludos cordiales,", isCorrect: true },
        { id: "opt-2", text: "Espero tu respuesta inmediata antes del cierre de oficina. Adiós,", isCorrect: false },
        { id: "opt-3", text: "Quedo a la espera de saber si el cliente aprobó la cotización.", isCorrect: false },
      ],
      explanation: "'Best regards' es el cierre universal para correos de negocios y relación con clientes.",
    },
  ],

  "u2-n2": [
    {
      id: "u2n2-q1",
      type: "translation_multiple_choice",
      instruction: "¿Cómo reportas lo que completaste ayer en la reunión Daily?",
      englishPrompt: "Yesterday, I finished the API integration and deployed it to staging.",
      pronunciationHint: "yés-ter-dei, ai fí-nisht di éi-pi-ái in-te-gréi-shon and di-plóid it tu stéi-dying",
      options: [
        { id: "opt-1", text: "Ayer terminé la integración de la API y la desplegué en el entorno de pruebas.", isCorrect: true },
        { id: "opt-2", text: "Ayer detecté un fallo grave en los servidores de producción.", isCorrect: false },
        { id: "opt-3", text: "Hoy planeo comenzar el diseño de la nueva interfaz de usuario.", isCorrect: false },
      ],
      explanation: "En la metodología ágil, se reporta pasado simple conciso de tareas terminadas.",
    },
    {
      id: "u2n2-q2",
      type: "translation_multiple_choice",
      instruction: "¿Cómo comunicas tu objetivo del día?",
      englishPrompt: "Today, my main focus is writing unit tests and reviewing pull requests.",
      pronunciationHint: "tu-déi, mai méin fóu-kas is rái-ting iú-nit tests and ri-viú-wing pul ri-kuésts",
      options: [
        { id: "opt-1", text: "Hoy mi foco principal es escribir pruebas unitarias y revisar solicitudes de código.", isCorrect: true },
        { id: "opt-2", text: "Hoy pasaré la mayor parte del tiempo en llamadas con clientes externos.", isCorrect: false },
        { id: "opt-3", text: "El equipo necesita posponer el lanzamiento de la nueva versión.", isCorrect: false },
      ],
      explanation: "'My main focus is [verb + ing]' comunica claridad y prioridad de trabajo.",
    },
  ],

  "u2-n3": [
    {
      id: "u2n3-q1",
      type: "translation_multiple_choice",
      instruction: "¿Cómo dices que no tienes bloqueos en la reunión?",
      englishPrompt: "I don't have any blockers on my side, everything is running smoothly.",
      pronunciationHint: "ai dount jav é-ni bló-kers on mai said, é-vri-zing is rá-ning smúuz-li",
      options: [
        { id: "opt-1", text: "No tengo ningún bloqueo de mi lado, todo va sobre ruedas.", isCorrect: true },
        { id: "opt-2", text: "Estoy esperando que el equipo de diseño me entregue los recursos.", isCorrect: false },
        { id: "opt-3", text: "Necesito pedir ayuda urgente con un error en la base de datos.", isCorrect: false },
      ],
      explanation: "'No blockers' es la frase canónica en standups de empresas de tecnología en todo el mundo.",
    },
    {
      id: "u2n3-q2",
      type: "translation_multiple_choice",
      instruction: "¿Cómo pides asistencia si estás bloqueado por permisos?",
      englishPrompt: "I'm currently blocked waiting for database credentials from the DevOps team.",
      pronunciationHint: "aim kú-rrent-li blakt wéi-ting for dé-ta-beis kre-dén-shals from da dev-áps tiim",
      options: [
        { id: "opt-1", text: "Actualmente estoy bloqueado esperando credenciales de base de datos del equipo DevOps.", isCorrect: true },
        { id: "opt-2", text: "Ya recibí los accesos de seguridad y puedo continuar sin retrasos.", isCorrect: false },
        { id: "opt-3", text: "El equipo de DevOps solicitó una reunión para cambiar las contraseñas.", isCorrect: false },
      ],
      explanation: "'I'm blocked waiting for...' identifica la causa raíz del bloqueo con precisión.",
    },
  ],

  "u2-boss": [
    {
      id: "u2boss-q1",
      type: "translation_multiple_choice",
      instruction: "Presenta el avance del sprint a tu manager",
      englishPrompt: "We are currently on track to deliver all milestone features ahead of deadline.",
      pronunciationHint: "wi ar kú-rrent-li on trak tu di-lí-ver ol máil-stoun fíi-churs a-jéd ov déd-lain",
      options: [
        { id: "opt-1", text: "Vamos a tiempo para entregar todas las funciones clave antes de la fecha límite.", isCorrect: true },
        { id: "opt-2", text: "Tenemos un retraso de dos semanas en la entrega de las funciones acordadas.", isCorrect: false },
        { id: "opt-3", text: "El cliente solicitó cambios importantes que requieren más presupuesto.", isCorrect: false },
      ],
      explanation: "'On track' significa según lo planeado / a tiempo.",
    },
  ],

  // UNIT 3: Negociaciones & Entrevistas de Trabajo (B1)
  "u3-n1": [
    {
      id: "u3n1-q1",
      type: "translation_multiple_choice",
      instruction: "¿Cómo inicias tu 'Elevator Pitch' en una entrevista?",
      englishPrompt: "Over the past four years, I've specialized in scaling cloud architectures.",
      pronunciationHint: "óu-ver da past for yíirs, aiv spe-sha-láizd in skéi-ling klaud ár-ki-tek-churs",
      options: [
        { id: "opt-1", text: "Durante los últimos cuatro años, me he especializado en escalar arquitecturas en la nube.", isCorrect: true },
        { id: "opt-2", text: "Comencé a estudiar informática hace cuatro años en la universidad.", isCorrect: false },
        { id: "opt-3", text: "Hace cuatro años dejé mi empleo anterior para emprender un negocio.", isCorrect: false },
      ],
      explanation: "'Over the past X years, I've specialized in...' demuestra trayectoria y madurez profesional.",
    },
    {
      id: "u3n1-q2",
      type: "translation_multiple_choice",
      instruction: "Destaca tu mayor fortaleza técnica con impacto",
      englishPrompt: "My biggest strength is translating complex technical requirements into user-friendly solutions.",
      pronunciationHint: "mai bí-guest strengz is trans-léi-ting kóm-pleks ték-ni-kal ri-kuáir-ments ín-tu yú-zer frénd-li so-lú-shons",
      options: [
        { id: "opt-1", text: "Mi mayor fortaleza es traducir requerimientos técnicos complejos en soluciones fáciles de usar.", isCorrect: true },
        { id: "opt-2", text: "Prefiero trabajar en proyectos pequeños donde las decisiones sean rápidas.", isCorrect: false },
        { id: "opt-3", text: "Me cuesta delegar responsabilidades técnicas a los miembros más nuevos del equipo.", isCorrect: false },
      ],
      explanation: "Vincular técnica con valor para el usuario final es el factor número uno valorado por reclutadores.",
    },
  ],

  "u3-n2": [
    {
      id: "u3n2-q1",
      type: "translation_multiple_choice",
      instruction: "Estructura STAR: Identifica la parte del 'Resultado' (Result)",
      englishPrompt: "As a result, we reduced server latency by 45% and saved $30,000 annually.",
      pronunciationHint: "as a ri-zált, wi ri-diúst sér-ver léi-ten-si bai fórti-faiv per-sént and seivd zér-ti záu-sand an-yua-li",
      options: [
        { id: "opt-1", text: "Como resultado, redujimos la latencia del servidor un 45% y ahorramos $30,000 al año.", isCorrect: true },
        { id: "opt-2", text: "El objetivo era migrar los servidores antes de que finalizara el año fiscal.", isCorrect: false },
        { id: "opt-3", text: "Tuvimos un problema con los costos de infraestructura en la nube.", isCorrect: false },
      ],
      explanation: "El método STAR exige métricas cuantificables (% y $) en la fase de Resultado.",
    },
  ],

  "u3-boss": [
    {
      id: "u3boss-q1",
      type: "translation_multiple_choice",
      instruction: "Pregunta estratégica para hacerle al entrevistador al final",
      englishPrompt: "What does success look like for this position in the first 90 days?",
      pronunciationHint: "wat das sak-sés luk laik for dis po-sí-shon in da ferst náin-ti deis",
      options: [
        { id: "opt-1", text: "¿Cómo se define el éxito para este puesto en los primeros 90 días?", isCorrect: true },
        { id: "opt-2", text: "¿Cuántos días de vacaciones tengo disponibles en el primer año?", isCorrect: false },
        { id: "opt-3", text: "¿Cuándo me informarán si fui seleccionado para el puesto?", isCorrect: false },
      ],
      explanation: "Esta pregunta demuestra visión de impacto inmediato y mentalidad de alto rendimiento.",
    },
  ],

  // UNIT 4: Liderazgo & Fluidez Ejecutiva (B2)
  "u4-n1": [
    {
      id: "u4n1-q1",
      type: "translation_multiple_choice",
      instruction: "Manejo diplomático de una objeción de negocio",
      englishPrompt: "I understand your budget constraints; however, investing in automation will yield immediate ROI.",
      pronunciationHint: "ai an-der-stánd yor bád-dyet kon-stréints; jau-é-ver, in-vés-ting in o-to-méi-shon wil yiild i-mí-di-at ar-ou-ái",
      options: [
        { id: "opt-1", text: "Entiendo sus limitaciones presupuestarias; sin embargo, invertir en automatización generará retorno inmediato.", isCorrect: true },
        { id: "opt-2", text: "No podemos reducir los precios porque nuestros costos operativos son muy elevados.", isCorrect: false },
        { id: "opt-3", text: "Si no aceptan esta propuesta, tendremos que posponer el proyecto indefinidamente.", isCorrect: false },
      ],
      explanation: "'I understand..., however...' valida la postura de la contraparte antes de reencuadrar el valor.",
    },
  ],

  "u4-boss": [
    {
      id: "u4boss-q1",
      type: "translation_multiple_choice",
      instruction: "Cierre estratégico de un acuerdo comercial de alto nivel",
      englishPrompt: "If we agree on these SLA terms today, we can expedite onboarding by next Monday.",
      pronunciationHint: "if wi a-gríi on diis es-el-éi terms tu-déi, wi kan éks-pe-dait on-bór-ding bai nekst mán-dei",
      options: [
        { id: "opt-1", text: "Si acordamos estos términos de SLA hoy, podemos agilizar la incorporación para el próximo lunes.", isCorrect: true },
        { id: "opt-2", text: "Necesitamos revisar los contratos legales una vez más antes de firmar cualquier acuerdo.", isCorrect: false },
        { id: "opt-3", text: "El equipo legal de la empresa no está disponible hasta la próxima semana.", isCorrect: false },
      ],
      explanation: "Ofrecer un incentivo de velocidad ('expedite onboarding') es una técnica de cierre ejecutiva.",
    },
  ],
};

// Helper to retrieve questions for any node, with intelligent fallback
export function getQuestionsForLessonNode(nodeId?: string, fallbackTitle?: string): LessonQuestion[] {
  if (nodeId && LESSON_QUESTION_BANK[nodeId] && LESSON_QUESTION_BANK[nodeId].length > 0) {
    return LESSON_QUESTION_BANK[nodeId];
  }

  // Fallback defaults if node is not explicitly mapped
  return [
    {
      id: "default-q1",
      type: "translation_multiple_choice",
      instruction: `Práctica clave para: ${fallbackTitle || "esta lección"}`,
      englishPrompt: "Let's review the core conversational concepts and put them into practice.",
      pronunciationHint: "lets ri-viú da kor kon-ver-séi-shon-al kón-septs and put dem ín-tu prák-tis",
      options: [
        { id: "def-opt-1", text: "Repasemos los conceptos conversacionales clave y pongámoslos en práctica.", isCorrect: true },
        { id: "def-opt-2", text: "Pospondremos la revisión teórica para la próxima sesión de clase.", isCorrect: false },
        { id: "def-opt-3", text: "Tengo dudas sobre cómo pronunciar correctamente estas palabras.", isCorrect: false },
      ],
      explanation: "La práctica repetida y la inmersión activa consolidan la memoria a largo plazo.",
    },
    {
      id: "default-q2",
      type: "translation_multiple_choice",
      instruction: "Expresión de confirmación profesional",
      englishPrompt: "I completely understand and I'm ready to take the next step.",
      pronunciationHint: "ai kom-plíit-li an-der-stánd and aim ré-di tu teik da nekst step",
      options: [
        { id: "def-opt-2-1", text: "Comprendo perfectamente y estoy listo para dar el siguiente paso.", isCorrect: true },
        { id: "def-opt-2-2", text: "Prefiero esperar a que el tutor me dé más explicaciones detalladas.", isCorrect: false },
        { id: "def-opt-2-3", text: "Necesito buscar el significado en el diccionario antes de continuar.", isCorrect: false },
      ],
      explanation: "'Ready to take the next step' demuestra proactividad y confianza.",
    },
  ];
}
