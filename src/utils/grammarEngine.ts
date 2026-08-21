import { GrammarCorrection } from "../types";

interface GrammarRule {
  pattern: RegExp;
  praise: string;
  fix: (match: RegExpMatchArray, original: string) => string;
  explanation: string;
  nativeAlternative: string;
}

const GRAMMAR_RULES: GrammarRule[] = [
  {
    // "I have 20 years" -> "I am 20 years old"
    pattern: /\bi\s+have\s+(\d+|twenty|thirty|fourty|forty|eighteen|nineteen|twenty-five)\s+years(\s+old)?\b/i,
    praise: "¡Excelente inicio! Comunicaste tu edad con claridad.",
    fix: (m) => `I am ${m[1]} years old`,
    explanation: "En inglés no 'tenemos' los años con 'have', sino que 'somos' de esa edad usando el verbo 'To Be' (I am / You are).",
    nativeAlternative: "I'm in my twenties / I am 20.",
  },
  {
    // "I am agree" -> "I agree"
    pattern: /\bi\s+am\s+agree\b/i,
    praise: "¡Súper! Se entiende perfectamente tu acuerdo.",
    fix: () => "I agree",
    explanation: "'Agree' ya es un verbo por sí mismo en inglés. No necesita 'am'. Solo dices 'I agree' o 'I completely agree'.",
    nativeAlternative: "I totally agree with you / I'm with you on that!",
  },
  {
    // "I am agree with you"
    pattern: /\bi\s+am\s+agree\s+with\b/i,
    praise: "¡Muy buena expresión de afinidad!",
    fix: () => "I agree with",
    explanation: "'Agree' es un verbo directo. Dices 'I agree with you' sin el 'am'.",
    nativeAlternative: "I'm right there with you on that!",
  },
  {
    // "people is" -> "people are"
    pattern: /\bpeople\s+is\b/i,
    praise: "¡Bien pensado al referirte al grupo!",
    fix: () => "people are",
    explanation: "En inglés, 'people' es un sustantivo plural (plural de 'person'), por lo que siempre va con 'are' o verbos en plural.",
    nativeAlternative: "Most people are / The folks are...",
  },
  {
    // "she like / he like / it like" -> "she likes / he likes / it likes"
    pattern: /\b(he|she|it)\s+(like|want|need|go|have)\b/i,
    praise: "¡Muy bien estructurada tu idea!",
    fix: (m) => {
      const subject = m[1];
      const verb = m[2].toLowerCase();
      let fixedVerb = verb + "s";
      if (verb === "go") fixedVerb = "goes";
      if (verb === "have") fixedVerb = "has";
      return `${subject} ${fixedVerb}`;
    },
    explanation: "En presente simple con tercera persona (He, She, It), agregamos una '-s' o '-es' al verbo.",
    nativeAlternative: "She really likes it / He's a big fan of...",
  },
  {
    // "explain me" -> "explain to me"
    pattern: /\bexplain\s+me\b/i,
    praise: "¡Buena petición de aclaración!",
    fix: () => "explain to me",
    explanation: "El verbo 'explain' requiere la preposición 'to' cuando indicas a quién le explicas: 'explain to me' o 'explain this to me'.",
    nativeAlternative: "Could you walk me through this? / Can you clarify that for me?",
  },
  {
    // "I am looking forward to hear" -> "I am looking forward to hearing"
    pattern: /\blooking\s+forward\s+to\s+([a-z]+)\b/i,
    praise: "¡Una frase muy elegante y profesional!",
    fix: (m) => {
      const verb = m[1];
      if (verb.endsWith("ing")) return m[0];
      return `looking forward to ${verb}ing`;
    },
    explanation: "Después de la expresión 'look forward to', el siguiente verbo siempre termina en '-ing' porque 'to' funciona como preposición.",
    nativeAlternative: "Can't wait to hear from you!",
  },
  {
    // "depends of" -> "depends on"
    pattern: /\bdepends?\s+of\b/i,
    praise: "¡Excelente uso de condicionales!",
    fix: () => "depends on",
    explanation: "En inglés 'depender' siempre se conecta con 'on', nunca con 'of'. Decimos 'It depends on...'.",
    nativeAlternative: "That really hinges on / It depends on...",
  },
  {
    // "I am work" / "I am study" -> "I am working" / "I study"
    pattern: /\bi\s+am\s+(work|study|play|eat|drive)\b/i,
    praise: "¡Excelente intento expresando tu actividad!",
    fix: (m) => `I am ${m[1]}ing`,
    explanation: "Si estás realizando la acción ahora, agrega '-ing' al verbo ('I am working'). Si es tu hábito general, usa 'I work'.",
    nativeAlternative: "I'm currently working on / I work as...",
  },
];

export function analyzeGrammar(text: string): GrammarCorrection | null {
  if (!text || text.trim().length < 3) return null;

  for (const rule of GRAMMAR_RULES) {
    const match = text.match(rule.pattern);
    if (match) {
      const corrected = text.replace(rule.pattern, rule.fix(match, text));
      return {
        hasError: true,
        isPerfect: false,
        praise: rule.praise,
        originalSentence: text,
        correctedSentence: corrected,
        explanation: rule.explanation,
        nativeAlternative: rule.nativeAlternative,
      };
    }
  }

  // If text is clean and > 12 chars, we can reward them with positive reinforcement
  if (text.trim().split(" ").length >= 4) {
    return {
      hasError: false,
      isPerfect: true,
      praise: "¡Gramática impecable y muy natural! 🎉",
      originalSentence: text,
      correctedSentence: text,
      explanation: "Tu estructura y conjugación están totalmente correctas.",
      nativeAlternative: "You sound just like a native speaker!",
    };
  }

  return null;
}
