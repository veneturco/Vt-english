import { CEFRLevel } from "../types";

export interface PlacementQuestion {
  id: string;
  level: CEFRLevel;
  question: string;
  audioPrompt?: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
}

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  {
    id: "q-1",
    level: "A1",
    question: "Complete the sentence: 'She _____ to work by bus every morning.'",
    options: [
      { text: "go", isCorrect: false },
      { text: "goes", isCorrect: true },
      { text: "going", isCorrect: false },
      { text: "is go", isCorrect: false },
    ],
    explanation: "Con tercera persona singular (She) en presente simple, el verbo 'go' se transforma en 'goes'.",
  },
  {
    id: "q-2",
    level: "A1",
    question: "Choose the correct phrase to order coffee politely:",
    options: [
      { text: "Give me coffee now.", isCorrect: false },
      { text: "I want coffee please.", isCorrect: false },
      { text: "Could I please get a latte?", isCorrect: true },
      { text: "I am having 20 coffees.", isCorrect: false },
    ],
    explanation: "'Could I please get...' o 'I would like...' son las formas más naturales y educadas.",
  },
  {
    id: "q-3",
    level: "A2",
    question: "'Yesterday, while they _____ lunch, the phone rang.'",
    options: [
      { text: "were having", isCorrect: true },
      { text: "had have", isCorrect: false },
      { text: "was having", isCorrect: false },
      { text: "are having", isCorrect: false },
    ],
    explanation: "Usamos el pasado continuo ('were having') para una acción en progreso interrumpida por otra ('rang').",
  },
  {
    id: "q-4",
    level: "B1",
    question: "'If I _____ more free time, I would travel around the world.'",
    options: [
      { text: "have", isCorrect: false },
      { text: "had", isCorrect: true },
      { text: "will have", isCorrect: false },
      { text: "would have", isCorrect: false },
    ],
    explanation: "En el segundo condicional hipotético, la cláusula 'if' va en pasado simple ('If I had...').",
  },
  {
    id: "q-5",
    level: "B2",
    question: "'We are really looking forward to _____ your team next month.'",
    options: [
      { text: "meet", isCorrect: false },
      { text: "meeting", isCorrect: true },
      { text: "met", isCorrect: false },
      { text: "have met", isCorrect: false },
    ],
    explanation: "La expresión 'look forward to' va seguida de gerundio ('-ing') porque 'to' es preposición.",
  },
  {
    id: "q-6",
    level: "C1",
    question: "Choose the most natural native idiom meaning 'to deal with a problem only when it arises':",
    options: [
      { text: "Cross that bridge when we come to it", isCorrect: true },
      { text: "Bite the golden apple", isCorrect: false },
      { text: "Break the ice bucket", isCorrect: false },
      { text: "Cut the cheese softly", isCorrect: false },
    ],
    explanation: "'We'll cross that bridge when we come to it' es el modismo nativo estándar para indicar que no nos preocuparemos por adelantado.",
  },
];
