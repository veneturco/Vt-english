export interface IndustryTrack {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  tagline: string;
  description: string;
  accentColor: string;
  keyJargon: { term: string; phonetic: string; spanish: string; example: string }[];
  scenarios: { title: string; difficulty: "A2" | "B1" | "B2"; goal: string }[];
  emailTemplates: { subject: string; snippet: string }[];
}

export const INDUSTRY_TRACKS: IndustryTrack[] = [
  {
    id: "tech",
    name: "Tecnología & Startups",
    shortName: "Tech & Startups",
    icon: "💻",
    tagline: "Product management, desarrollo de software y metodologías ágiles",
    description:
      "Domina el vocabulario de sprints, dailies, code reviews, arquitectura cloud y reuniones con venture capital.",
    accentColor: "indigo",
    keyJargon: [
      {
        term: "Standup meeting",
        phonetic: "STAN-dap MEE-ting",
        spanish: "Reunión diaria de sincronización ágil",
        example: "Let's align on blockers during our morning standup meeting.",
      },
      {
        term: "Deploy to production",
        phonetic: "dih-PLOY tu proh-DUK-shun",
        spanish: "Desplegar / publicar a producción",
        example: "We plan to deploy to production right after QA approval.",
      },
      {
        term: "Technical debt",
        phonetic: "TEK-nih-kul DET",
        spanish: "Deuda técnica",
        example: "Refactoring this module will help reduce our technical debt.",
      },
      {
        term: "Feature rollout",
        phonetic: "FEE-chur ROHL-owt",
        spanish: "Lanzamiento escalonado de funcionalidad",
        example: "The feature rollout starts with 10% of beta users.",
      },
    ],
    scenarios: [
      { title: "Daily Scrum Standup", difficulty: "A2", goal: "Reportar avances de ayer, tareas de hoy e impedimentos." },
      { title: "Technical Product Demo", difficulty: "B1", goal: "Explicar la arquitectura de la API a un stakeholder no técnico." },
      { title: "Venture Capital Pitch", difficulty: "B2", goal: "Presentar tracción, retención y métricas de crecimiento (CAC & LTV)." },
    ],
    emailTemplates: [
      {
        subject: "Sprint Review & Demo Agenda",
        snippet: "Hi team, please find attached the agenda for tomorrow's sprint review. We will demo the checkout flow improvements.",
      },
    ],
  },
  {
    id: "finance",
    name: "Finanzas & Inversión",
    shortName: "Finanzas",
    icon: "💼",
    tagline: "Banca corporativa, estados contables, presupuestos y M&A",
    description:
      "Comunícate con auditores internacionales, inversores y analistas financieros con precisión numérica.",
    accentColor: "emerald",
    keyJargon: [
      {
        term: "Cash flow",
        phonetic: "KASH floh",
        spanish: "Flujo de caja / tesorería",
        example: "Maintaining healthy positive cash flow is our top priority this quarter.",
      },
      {
        term: "Break-even point",
        phonetic: "BRAYK ee-ven POYNT",
        spanish: "Punto de equilibrio",
        example: "We expect to hit our break-even point by the end of Q3.",
      },
      {
        term: "Due diligence",
        phonetic: "DOO DIL-ih-juns",
        spanish: "Auditoría previa / investigación legal",
        example: "The acquisition is currently in the due diligence phase.",
      },
      {
        term: "EBITDA margin",
        phonetic: "ee-BIT-dah MAR-jin",
        spanish: "Margen operativo antes de intereses e impuestos",
        example: "Our EBITDA margin expanded by two hundred basis points.",
      },
    ],
    scenarios: [
      { title: "Earnings Call Q&A", difficulty: "B2", goal: "Justificar desviaciones en el presupuesto ante el comité." },
      { title: "Audit Review", difficulty: "B1", goal: "Explicar asientos contables y cumplimiento tributario a auditores." },
    ],
    emailTemplates: [
      {
        subject: "Q4 Financial Performance Summary",
        snippet: "Dear Committee, attached is the consolidated EBITDA and revenue summary ahead of Thursday's executive session.",
      },
    ],
  },
  {
    id: "health",
    name: "Salud & Medicina",
    shortName: "Salud & Pharma",
    icon: "🩺",
    tagline: "Atención médica, ensayos clínicos, enfermería y farmacéutica",
    description:
      "Protocolos clínicos internacionales, anamnesis con pacientes angloparlantes y redacción de informes médicos.",
    accentColor: "rose",
    keyJargon: [
      {
        term: "Clinical trial",
        phonetic: "KLIN-ih-kul TRY-ul",
        spanish: "Ensayo clínico",
        example: "Phase III of the clinical trial showed statistically significant results.",
      },
      {
        term: "Patient history",
        phonetic: "PAY-shunt HIS-tuh-ree",
        spanish: "Historial médico / anamnesis",
        example: "Let's review the patient history before ordering bloodwork.",
      },
      {
        term: "Adverse effect",
        phonetic: "ad-VURS ih-FEKT",
        spanish: "Efecto adverso",
        example: "No severe adverse effects were documented during treatment.",
      },
    ],
    scenarios: [
      { title: "Patient Triage & Admission", difficulty: "A2", goal: "Tomar signos vitales y síntomas principales en urgencias." },
      { title: "Medical Conference Paper", difficulty: "B2", goal: "Debatir hallazgos de un estudio con colegas extranjeros." },
    ],
    emailTemplates: [
      {
        subject: "Follow-up on Patient Treatment Protocol",
        snippet: "Dear Dr. Evans, please find the updated lab panel results for review prior to the morning clinical rounds.",
      },
    ],
  },
  {
    id: "sales",
    name: "Ventas & Marketing",
    shortName: "Ventas & Growth",
    icon: "📈",
    tagline: "Negociación B2B, embudos de conversión y relaciones públicas",
    description:
      "Aprende a desarmar objeciones de clientes corporativos, calificar prospectos y cerrar contratos comerciales.",
    accentColor: "amber",
    keyJargon: [
      {
        term: "Value proposition",
        phonetic: "VAL-yoo prah-poh-ZISH-un",
        spanish: "Propuesta de valor",
        example: "Our core value proposition is cutting onboarding time in half.",
      },
      {
        term: "Customer churn",
        phonetic: "KUS-tuh-mur CHURN",
        spanish: "Tasa de cancelación / deserción de clientes",
        example: "We implemented automated health checks to reduce customer churn.",
      },
      {
        term: "Closing the deal",
        phonetic: "KLOH-zing thuh DEEL",
        spanish: "Cerrar el acuerdo comercial",
        example: "We are meeting with the CFO tomorrow to close the deal.",
      },
    ],
    scenarios: [
      { title: "Cold Discovery Call", difficulty: "B1", goal: "Identificar los dolores clave del cliente en menos de 5 minutos." },
      { title: "Handling Price Objections", difficulty: "B2", goal: "Defender el precio sin otorgar descuentos destructivos." },
    ],
    emailTemplates: [
      {
        subject: "Customized Enterprise Proposal",
        snippet: "Hi Michael, thank you for your time today. Per our discussion, here is the custom tiered proposal for your team.",
      },
    ],
  },
  {
    id: "tourism",
    name: "Turismo & Hospitalidad",
    shortName: "Hospitalidad & Viajes",
    icon: "✈️",
    tagline: "Hoteles de lujo, aviación comercial, tours y gastronomía",
    description:
      "Atención al huésped internacional, resolución de quejas con diplomacia y coordinación de eventos VIP.",
    accentColor: "sky",
    keyJargon: [
      {
        term: "Complimentary upgrade",
        phonetic: "kom-plih-MEN-tuh-ree UP-grayd",
        spanish: "Mejora de cortesía sin costo",
        example: "We are pleased to offer you a complimentary room upgrade.",
      },
      {
        term: "Dietary restrictions",
        phonetic: "DY-uh-tehr-ee ree-STRIK-shunz",
        spanish: "Restricciones alimentarias / alergias",
        example: "Does anyone in your party have specific dietary restrictions?",
      },
      {
        term: "Late check-out",
        phonetic: "LAYT CHEK-owt",
        spanish: "Salida tardía del hotel",
        example: "We have arranged a late check-out for you at 2:00 PM.",
      },
    ],
    scenarios: [
      { title: "VIP Guest Concierge", difficulty: "A2", goal: "Recomendar restaurantes y reservar transporte privado." },
      { title: "Resolving a Customer Dispute", difficulty: "B1", goal: "Calmar a un cliente insatisfecho y ofrecer compensación adecuada." },
    ],
    emailTemplates: [
      {
        subject: "Booking Confirmation & VIP Welcome",
        snippet: "Dear Mr. Davies, we look forward to welcoming you. Please let us know your arrival time for complimentary transfer.",
      },
    ],
  },
  {
    id: "general",
    name: "Corporativo General",
    shortName: "General Ejecutivo",
    icon: "🌐",
    tagline: "Liderazgo, redacción de correos formales y gestión de equipos",
    description:
      "La base indispensable para cualquier profesional que necesita comunicarse con fluidez en entornos globales.",
    accentColor: "purple",
    keyJargon: [
      {
        term: "Touch base",
        phonetic: "TUCH BAYS",
        spanish: "Ponerse en contacto brevemente",
        example: "Let's touch base next Monday to review the milestones.",
      },
      {
        term: "Action items",
        phonetic: "AK-shun EYE-tumz",
        spanish: "Puntos de acción / tareas pendientes",
        example: "I will circulate the meeting minutes with clear action items.",
      },
      {
        term: "Win-win scenario",
        phonetic: "WIN-WIN seh-NAIR-ee-oh",
        spanish: "Situación en la que ambas partes ganan",
        example: "This partnership creates a clear win-win scenario for both sides.",
      },
    ],
    scenarios: [
      { title: "Team Alignment & 1-on-1", difficulty: "A2", goal: "Dar feedback constructivo a un colaborador directo." },
      { title: "Cross-functional Strategy Meeting", difficulty: "B2", goal: "Alinear prioridades entre finanzas, operaciones y marketing." },
    ],
    emailTemplates: [
      {
        subject: "Summary of Today's Strategy Meeting",
        snippet: "Hi all, thank you for the productive session. Below is a recap of key decisions and agreed next steps.",
      },
    ],
  },
];

export const DEFAULT_INDUSTRY_TRACK = INDUSTRY_TRACKS[0];

export function getStoredIndustryTrack(): IndustryTrack {
  try {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem("vt_user_industry");
      if (saved) {
        const found = INDUSTRY_TRACKS.find((t) => t.id === saved);
        if (found) return found;
      }
    }
  } catch {}
  return DEFAULT_INDUSTRY_TRACK;
}

export function saveStoredIndustryTrack(trackOrId: string | IndustryTrack): void {
  try {
    if (typeof localStorage !== "undefined") {
      const id = typeof trackOrId === "string" ? trackOrId : trackOrId.id;
      localStorage.setItem("vt_user_industry", id);
    }
  } catch {}
}
