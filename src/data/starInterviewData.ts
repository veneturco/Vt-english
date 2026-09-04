export interface StarInterviewQuestion {
  id: string;
  category: "Conflict" | "Failure & Resilience" | "Leadership" | "Tight Deadlines" | "Innovation";
  categorySpanish: string;
  question: string;
  spanishTranslation: string;
  interviewerRole: string;
  contextHint: string;
  recommendedKeywords: string[];
  modelAnswer: {
    situation: string;
    task: string;
    action: string;
    result: string;
    fullText: string;
  };
}

export const STAR_QUESTIONS_DATA: StarInterviewQuestion[] = [
  {
    id: "star_1",
    category: "Conflict",
    categorySpanish: "Resolución de Conflictos",
    question: "Tell me about a time you had a serious disagreement with a colleague or stakeholder. How did you resolve it?",
    spanishTranslation: "Cuéntame sobre una ocasión en la que tuviste un desacuerdo serio con un colega o cliente. ¿Cómo lo resolviste?",
    interviewerRole: "VP of People / Senior Director",
    contextHint: "Enfócate en escuchar activamente, basarte en datos objetivos y priorizar el objetivo del negocio sobre el ego.",
    recommendedKeywords: ["stakeholder", "disagreement", "alignment", "data-driven", "consensus", "compromise", "scheduled a one-on-one"],
    modelAnswer: {
      situation: "At my previous company, our lead designer and I had conflicting visions regarding the checkout redesign timeline.",
      task: "We needed to deliver the release within three weeks without sacrificing user experience or conversion rates.",
      action: "I scheduled a 30-minute one-on-one to understand their UX concerns, gathered A/B testing analytics from our previous cohort, and proposed a phased rollout.",
      result: "We reached consensus within 48 hours and launched on schedule, increasing checkout conversion by 18% with zero regressions.",
      fullText: "At my previous company, our lead designer and I had conflicting visions regarding the checkout redesign timeline. We needed to deliver the release within three weeks without sacrificing user experience. I scheduled a one-on-one to listen to their concerns, reviewed our user analytics together, and proposed a phased rollout. As a result, we reached consensus within 48 hours and launched on time, boosting checkout conversion by 18%.",
    },
  },
  {
    id: "star_2",
    category: "Failure & Resilience",
    categorySpanish: "Superación del Fracaso y Resiliencia",
    question: "Describe a situation where a major project or initiative failed or missed expectations. What was your takeaway?",
    spanishTranslation: "Describe una situación donde un proyecto importante falló o no cumplió las expectativas. ¿Qué aprendiste?",
    interviewerRole: "Head of Engineering / Operations",
    contextHint: "Asume responsabilidad personal sin culpar a terceros, explica la causa raíz y qué proceso creaste para que no vuelva a ocurrir.",
    recommendedKeywords: ["accountability", "root cause", "post-mortem", "mitigation", "learned", "process improvement", "safeguard"],
    modelAnswer: {
      situation: "During a major system migration last year, an unexpected database lock caused 45 minutes of downtime during peak hours.",
      task: "As the project coordinator, I had to communicate transparently with leadership and resolve the incident immediately.",
      action: "I took full ownership, coordinated the rollback team, drafted a detailed post-mortem report, and implemented automated staging canary checks.",
      result: "The subsequent migration went completely uninterrupted, and our new canary protocol became the company-wide standard.",
      fullText: "During a major system migration last year, an unexpected database lock caused 45 minutes of downtime. As project coordinator, I took full ownership, coordinated an immediate rollback, and hosted a blameless post-mortem. I implemented automated canary deployment checks. Consequently, our next migration went smoothly, and that protocol became our company-wide standard.",
    },
  },
  {
    id: "star_3",
    category: "Tight Deadlines",
    categorySpanish: "Entregas Bajo Presión y Plazos Críticos",
    question: "Can you describe a high-pressure situation where you had to meet an unrealistic deadline?",
    spanishTranslation: "¿Puedes describir una situación de alta presión donde tuviste que cumplir una fecha límite muy ajustada?",
    interviewerRole: "Client Engagement Partner",
    contextHint: "Demuestra cómo priorizas tareas críticas (triage), delegas y comunicas expectativas a tiempo.",
    recommendedKeywords: ["prioritized", "scope reduction", "critical path", "streamlined", "delivered", "milestone", "high-stakes"],
    modelAnswer: {
      situation: "A enterprise client requested an urgent security audit report with only 48 hours notice before a board meeting.",
      task: "We needed to audit 12 microservices and generate a certified compliance summary under extreme time pressure.",
      action: "I streamlined the evaluation scope to focus on top-tier vulnerabilities, divided workstreams across 3 team members, and automated script checks.",
      result: "We delivered the verified audit report 4 hours ahead of the deadline, securing a $150,000 enterprise renewal.",
      fullText: "An enterprise client requested an urgent compliance audit report with only 48 hours notice. We needed to audit 12 services under extreme pressure. I prioritized the critical path, delegated specific modules across three engineers, and automated data extraction. As a result, we delivered four hours ahead of schedule and secured a $150,000 contract renewal.",
    },
  },
  {
    id: "star_4",
    category: "Leadership",
    categorySpanish: "Liderazgo e Influencia sin Autoridad Directa",
    question: "Tell me about a time you had to persuade senior leadership or your peers to adopt an idea they initially doubted.",
    spanishTranslation: "Cuéntame sobre una ocasión en la que tuviste que convencer a directivos o a tus colegas de adoptar una idea de la que dudaban.",
    interviewerRole: "Managing Director",
    contextHint: "Muestra tu capacidad de presentar argumentos de negocio, ROI y pilotos de bajo riesgo.",
    recommendedKeywords: ["persuaded", "business case", "ROI", "pilot test", "advocated", "measurable impact", "buy-in"],
    modelAnswer: {
      situation: "Our support team was overwhelmed with repetitive onboarding tickets, but leadership hesitated to invest in an automated self-serve portal.",
      task: "My objective was to prove that investing in automation would decrease churn and reduce operational costs.",
      action: "I built a low-cost prototype over one sprint, ran a pilot with 20% of new signups, and tracked resolution time metrics.",
      result: "The pilot showed a 35% drop in support ticket volume, securing full budget approval and saving 120 support hours per month.",
      fullText: "Our support team was overwhelmed with repetitive tickets, but leadership doubted the ROI of automated onboarding. I took the initiative to build a quick prototype and tested it with 20% of new users. The data proved a 35% drop in tickets. Consequently, leadership approved the full budget, saving the company over 120 hours each month.",
    },
  },
  {
    id: "star_5",
    category: "Innovation",
    categorySpanish: "Innovación y Optimización de Procesos",
    question: "Give an example of how you improved a process or workflow in your previous role to increase efficiency.",
    spanishTranslation: "Dame un ejemplo de cómo mejoraste un proceso o flujo de trabajo en tu rol anterior para aumentar la eficiencia.",
    interviewerRole: "Director of Product & Innovation",
    contextHint: "Identifica el cuello de botella inicial, la solución implementada y el beneficio tangible para el equipo.",
    recommendedKeywords: ["bottleneck", "automated", "streamlined", "efficiency", "optimized", "time saved", "workflow"],
    modelAnswer: {
      situation: "Our weekly team reporting was manual and consumed roughly four hours per person every Monday morning.",
      task: "I wanted to eliminate this repetitive overhead so the team could focus on high-impact customer interactions.",
      action: "I designed an automated dashboard integrating our CRM directly into Slack and Google Sheets using webhook triggers.",
      result: "We eliminated manual reporting completely, saving approximately 16 hours of team bandwidth per week.",
      fullText: "Our weekly status reporting was completely manual and consumed four hours per person every Monday. I decided to streamline this by building an automated dashboard linking our CRM to Slack. As a result, we eliminated manual reporting entirely, saving 16 hours of team time every single week.",
    },
  },
];
