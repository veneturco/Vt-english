export interface StarEvaluationResult {
  overallScore: number; // 0 - 100
  passed: boolean;
  components: {
    situation: { found: boolean; feedback: string; points: number };
    task: { found: boolean; feedback: string; points: number };
    action: { found: boolean; feedback: string; points: number };
    result: { found: boolean; feedback: string; points: number };
  };
  metricsFound: string[];
  actionVerbsFound: string[];
  wordCount: number;
  pedagogicalAdvice: string[];
  toneVerdict: string;
}

const SITUATION_TRIGGERS = [
  "at my previous",
  "at my last",
  "in my previous",
  "when i was working",
  "during a project",
  "during my time",
  "in 202",
  "in 201",
  "a few years ago",
  "recently",
  "in my role as",
  "at my company",
  "our team was",
  "we were facing",
  "one time",
];

const TASK_TRIGGERS = [
  "the goal was",
  "my task was",
  "my responsibility was",
  "the challenge was",
  "we needed to",
  "i had to",
  "the objective was",
  "deadline",
  "required to",
  "under pressure to",
  "the problem was",
];

const ACTION_VERBS = [
  "spearheaded",
  "scheduled",
  "implemented",
  "developed",
  "negotiated",
  "proposed",
  "designed",
  "analyzed",
  "streamlined",
  "coordinated",
  "automated",
  "organized",
  "built",
  "conducted",
  "prioritized",
  "resolved",
  "delegated",
  "facilitated",
  "decided",
  "initiated",
  "drafted",
  "launched",
  "monitored",
];

const RESULT_TRIGGERS = [
  "as a result",
  "consequently",
  "increased",
  "reduced",
  "decreased",
  "saved",
  "boosted",
  "generated",
  "achieved",
  "resulted in",
  "successfully",
  "on time",
  "ahead of schedule",
  "outcome was",
  "revenue",
  "hours",
  "conversion",
  "%",
  "percent",
];

export function evaluateStarAnswer(
  userText: string,
  recommendedKeywords: string[] = []
): StarEvaluationResult {
  const lower = userText.toLowerCase().trim();
  const words = lower.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Evaluate Situation (S)
  const hasSituationTrigger = SITUATION_TRIGGERS.some((t) => lower.includes(t));
  const situationPoints = hasSituationTrigger ? 25 : lower.includes("when") || lower.includes("company") || lower.includes("team") ? 18 : 10;
  const situationFeedback =
    situationPoints >= 20
      ? "Excelente delimitación del contexto, rol y momento del proyecto."
      : "Te recomendamos iniciar aclarando el contexto (ej: 'At my previous company...' o 'In my role as...').";

  // 2. Evaluate Task (T)
  const hasTaskTrigger = TASK_TRIGGERS.some((t) => lower.includes(t));
  const taskPoints = hasTaskTrigger ? 25 : lower.includes("had to") || lower.includes("needed") ? 18 : 10;
  const taskFeedback =
    taskPoints >= 20
      ? "Identificaste claramente el reto o meta que debías solucionar."
      : "Clarifica cuál era exactamente tu responsabilidad o el dilema a resolver ('My objective was to...').";

  // 3. Evaluate Action (A)
  const actionVerbsFound = ACTION_VERBS.filter((v) => lower.includes(v));
  const hasFirstPersonActions = lower.includes("i ") || lower.includes("i've") || lower.includes("my");
  let actionPoints = 10;
  if (actionVerbsFound.length >= 2 && hasFirstPersonActions) {
    actionPoints = 25;
  } else if (actionVerbsFound.length >= 1 || hasFirstPersonActions) {
    actionPoints = 18;
  }
  const actionFeedback =
    actionPoints >= 20
      ? `Gran uso de verbos de acción en primera persona (${actionVerbsFound.slice(0, 3).join(", ")}).`
      : "Usa más verbos de impacto en primera persona (ej. 'I scheduled...', 'I spearheaded...', 'I proposed...').";

  // 4. Evaluate Result (R)
  const resultTriggersFound = RESULT_TRIGGERS.filter((t) => lower.includes(t));
  const hasNumbersOrMetrics = /\d+(\.\d+)?%?|\$\d+|\b(one|two|three|four|five|six|twenty|fifty|hundred)\b/i.test(userText);
  let resultPoints = 10;
  if (resultTriggersFound.length >= 1 && hasNumbersOrMetrics) {
    resultPoints = 25;
  } else if (resultTriggersFound.length >= 1 || hasNumbersOrMetrics) {
    resultPoints = 18;
  }
  const resultFeedback =
    resultPoints >= 20
      ? "¡Brillante! Incluiste resultados cuantificables con impacto medible en el negocio."
      : "Los reclutadores aman los números. Agrega porcentajes, tiempo ahorrado o ingresos generados ('boosted by 20%', 'saved 15 hours').";

  // Total raw score
  let total = situationPoints + taskPoints + actionPoints + resultPoints;

  // Length and fluency bonus / penalty
  if (wordCount < 25) {
    total = Math.min(total, 55);
  } else if (wordCount >= 45 && wordCount <= 140) {
    total = Math.min(100, total + 5);
  }

  const passed = total >= 70;

  const pedagogicalAdvice: string[] = [];
  if (wordCount < 30) {
    pedagogicalAdvice.push("Tu respuesta fue algo breve. En entrevistas multinacionales se recomienda una extensión de entre 40 y 90 palabras por historia.");
  }
  if (!hasNumbersOrMetrics) {
    pedagogicalAdvice.push("Añade métricas concretas: '% de mejora', '$ ahorrados' o 'semanas de anticipación'.");
  }
  if (actionVerbsFound.length < 2) {
    pedagogicalAdvice.push("Incorpora verbos ejecutivos como 'streamlined', 'negotiated', 'prioritized' o 'spearheaded'.");
  }

  const toneVerdict =
    total >= 85
      ? "Nivel Ejecutivo / Multinacional (FAANG Ready)"
      : total >= 70
      ? "Sólido y Competente (Cumple Estándar STAR)"
      : "En Desarrollo (Requiere más estructura y métricas)";

  return {
    overallScore: Math.round(total),
    passed,
    components: {
      situation: { found: situationPoints >= 18, feedback: situationFeedback, points: situationPoints },
      task: { found: taskPoints >= 18, feedback: taskFeedback, points: taskPoints },
      action: { found: actionPoints >= 18, feedback: actionFeedback, points: actionPoints },
      result: { found: resultPoints >= 18, feedback: resultFeedback, points: resultPoints },
    },
    metricsFound: resultTriggersFound,
    actionVerbsFound,
    wordCount,
    pedagogicalAdvice,
    toneVerdict,
  };
}
