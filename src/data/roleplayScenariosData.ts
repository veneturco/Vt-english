import { RoleplayScenarioItem } from "../types";

export const ROLEPLAY_SCENARIOS: RoleplayScenarioItem[] = [
  {
    id: "tech_interview",
    title: "Entrevista Laboral en Silicon Valley",
    location: "Google / Meta HQ (San Francisco)",
    personaName: "Sarah Jenkins",
    personaRole: "Senior Engineering Hiring Manager",
    avatarMood: "pensativo",
    difficulty: "B2",
    bgGradient: "from-blue-950 via-slate-900 to-indigo-950",
    icon: "💼",
    objectives: [
      { id: "obj1", text: "Presenta tu experiencia previa en 2 oraciones concisas", completed: false },
      { id: "obj2", text: "Usa el método STAR (Situation, Task, Action, Result)", completed: false },
      { id: "obj3", text: "Haz una pregunta inteligente sobre la cultura del equipo", completed: false }
    ],
    initialTutorMessage: "Welcome! Thanks for taking the time to speak with me today. Could you walk me through your background and what excites you about this role?",
    targetVocab: ["leadership", "scalable architecture", "cross-functional", "deliver impact", "milestones"],
    contextPrompt: "You are Sarah Jenkins, a friendly yet sharp Silicon Valley hiring manager. Conduct a realistic job interview. Give feedback if the candidate is too vague. Encourage strong action verbs."
  },
  {
    id: "airport_customs",
    title: "Control Fronterizo en JFK Nueva York",
    location: "JFK International Airport (Terminal 4)",
    personaName: "Officer Miller",
    personaRole: "U.S. Customs & Border Protection Officer",
    avatarMood: "idle",
    difficulty: "A2",
    bgGradient: "from-slate-950 via-blue-950 to-slate-900",
    icon: "🛂",
    objectives: [
      { id: "obj1", text: "Declara el propósito exacto de tu viaje (turismo o negocios)", completed: false },
      { id: "obj2", text: "Indica la duración de tu estancia (días o semanas)", completed: false },
      { id: "obj3", text: "Menciona dónde te vas a hospedar (hotel o casa de amigos)", completed: false }
    ],
    initialTutorMessage: "Good afternoon. Passport and customs declaration form, please. What is the main purpose of your visit to the United States?",
    targetVocab: ["sightseeing", "return ticket", "accommodation", "business conference", "duration"],
    contextPrompt: "You are Officer Miller, an official CBP officer at JFK airport. Speak clearly, professionally, and ask standard immigration questions (purpose of visit, duration, hotel, cash on hand)."
  },
  {
    id: "starbucks_nyc",
    title: "Pidiendo Café en Manhattan Starbucks",
    location: "Times Square, New York City",
    personaName: "Alex Rivera",
    personaRole: "NYC Barista & Coffee Master",
    avatarMood: "alegre",
    difficulty: "A1",
    bgGradient: "from-amber-950 via-slate-900 to-emerald-950",
    icon: "☕",
    objectives: [
      { id: "obj1", text: "Pide tu café especificando tamaño (Tall, Grande, Venti)", completed: false },
      { id: "obj2", text: "Solicita un tipo de leche (Oat milk, Almond, Whole)", completed: false },
      { id: "obj3", text: "Di tu nombre y solicita el ticket o recibo", completed: false }
    ],
    initialTutorMessage: "Hey there! Welcome to Starbucks. What can I get started for you today? Hot or iced?",
    targetVocab: ["oat milk", "extra shot of espresso", "to-go", "receipt", "sugar-free vanilla"],
    contextPrompt: "You are Alex, an energetic barista in NYC. Help the student order their drink, ask if they want pastry or snacks, and clarify sizes (Tall, Grande, Venti)."
  },
  {
    id: "medical_doctor",
    title: "Consulta Médica de Urgencia",
    location: "City Health Clinic (London, UK)",
    personaName: "Dr. Alistair Finch",
    personaRole: "General Practitioner (GP)",
    avatarMood: "pensativo",
    difficulty: "B1",
    bgGradient: "from-teal-950 via-slate-900 to-cyan-950",
    icon: "🩺",
    objectives: [
      { id: "obj1", text: "Describe tus síntomas principales con intensidad y duración", completed: false },
      { id: "obj2", text: "Menciona si eres alérgico a algún medicamento (penicilina, etc.)", completed: false },
      { id: "obj3", text: "Pregunta con qué frecuencia debes tomar el tratamiento", completed: false }
    ],
    initialTutorMessage: "Hello, please have a seat. What brings you in today? Where exactly are you feeling discomfort or pain?",
    targetVocab: ["throbbing headache", "prescription", "dizziness", "allergic reaction", "dosage"],
    contextPrompt: "You are Dr. Finch, an empathetic British doctor in London. Listen to the patient's symptoms, ask follow-up questions, and explain instructions gently."
  },
  {
    id: "hotel_concierge",
    title: "Check-in y Reclamo en Hotel 5 Estrellas",
    location: "The Plaza Hotel (New York)",
    personaName: "Claire Dupont",
    personaRole: "Head of Guest Experience",
    avatarMood: "sorpresa",
    difficulty: "B1",
    bgGradient: "from-amber-950 via-stone-900 to-yellow-950",
    icon: "🛎️",
    objectives: [
      { id: "obj1", text: "Proporciona el nombre de tu reserva de habitación", completed: false },
      { id: "obj2", text: "Solicita una habitación en piso alto con buena vista", completed: false },
      { id: "obj3", text: "Pregunta el horario del desayuno y la clave del Wi-Fi", completed: false }
    ],
    initialTutorMessage: "Good evening and welcome to The Plaza. May I have your last name to look up your reservation?",
    targetVocab: ["reservation", "complimentary breakfast", "high floor", "luggage assistance", "keycard"],
    contextPrompt: "You are Claire, a polite and helpful luxury hotel concierge. Handle the check-in and assist with any special requests or room preferences."
  },
  {
    id: "startup_pitch",
    title: "Pitch a Inversionistas de Capital de Riesgo",
    location: "Sand Hill Road (Palo Alto, CA)",
    personaName: "David Sterling",
    personaRole: "Managing Partner at Horizon Ventures",
    avatarMood: "pensativo",
    difficulty: "C1",
    bgGradient: "from-indigo-950 via-slate-900 to-purple-950",
    icon: "🚀",
    objectives: [
      { id: "obj1", text: "Explica el problema central del mercado en 30 segundos", completed: false },
      { id: "obj2", text: "Detalla tu ventaja injusta (Moat / AI Tech)", completed: false },
      { id: "obj3", text: "Menciona el tamaño del mercado (TAM) y modelo de negocio", completed: false }
    ],
    initialTutorMessage: "David here. We've got 5 minutes before my next board meeting. Tell me: what problem are you solving and why now?",
    targetVocab: ["market opportunity", "customer acquisition cost", "retention rate", "defensible moat", "unit economics"],
    contextPrompt: "You are David Sterling, an experienced VC partner. You ask concise, challenging questions about business model, competition, and traction."
  }
];
