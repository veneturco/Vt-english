// src/utils/pronunciationMatcher.ts
// Comprehensive, scientific phonetic and string approximation engine for ESL learning

export interface WordAccuracyResult {
  word: string;
  score: number;
  isTarget: boolean;
  matchedSpokenWord?: string;
}

export interface PhrasePronunciationResult {
  overallScore: number;
  wordAccuracies: WordAccuracyResult[];
  isApproved: boolean;
  spokenNormalized: string;
  targetNormalized: string;
  feedback: string;
}

export interface PhoneticDrillResult {
  score: number;
  passed: boolean;
  detectedWord: string;
  isCloserToConfusable: boolean;
  feedback: string;
  targetWord: string;
  confusableWord?: string;
}

// 1. Homophones & ASR Recognizer Equivalents
const HOMOPHONES_MAP: Record<string, string[]> = {
  to: ["too", "two", "2"],
  too: ["to", "two", "2"],
  two: ["to", "too", "2"],
  for: ["four", "fore", "4"],
  four: ["for", "fore", "4"],
  one: ["won", "1"],
  won: ["one", "1"],
  right: ["write", "rite"],
  write: ["right", "rite"],
  sun: ["son"],
  son: ["sun"],
  sea: ["see"],
  see: ["sea"],
  here: ["hear"],
  hear: ["here"],
  know: ["no"],
  no: ["know"],
  by: ["buy", "bye"],
  buy: ["by", "bye"],
  bye: ["by", "buy"],
  there: ["their", "theyre", "they're"],
  their: ["there", "theyre", "they're"],
  "they're": ["there", "their", "theyre"],
  wood: ["would"],
  would: ["wood"],
  wear: ["where"],
  where: ["wear"],
  break: ["brake"],
  brake: ["break"],
  peace: ["piece"],
  piece: ["peace"],
  flower: ["flour"],
  flour: ["flower"],
  ate: ["eight", "8"],
  eight: ["ate", "8"],
  bear: ["bare"],
  bare: ["bear"],
  read: ["red"],
  red: ["read"],
  meet: ["meat"],
  meat: ["meet"],
  hour: ["our"],
  our: ["hour"],
  be: ["bee"],
  bee: ["be"],
  hi: ["high"],
  high: ["hi"],
  weather: ["whether"],
  whether: ["weather"],
  pair: ["pear"],
  pear: ["pair"],
};

// Contractions Normalization Map
const CONTRACTIONS_MAP: Record<string, string> = {
  "i'm": "i am",
  "im": "i am",
  "you're": "you are",
  "youre": "you are",
  "he's": "he is",
  "she's": "she is",
  "it's": "it is",
  "its": "it is",
  "we're": "we are",
  "were": "we are",
  "they're": "they are",
  "theyre": "they are",
  "don't": "do not",
  "dont": "do not",
  "doesn't": "does not",
  "doesnt": "does not",
  "didn't": "did not",
  "didnt": "did not",
  "can't": "cannot",
  "cant": "cannot",
  "won't": "will not",
  "wont": "will not",
  "i've": "i have",
  "ive": "i have",
  "i'll": "i will",
  "ill": "i will",
  "you'll": "you will",
  "we'll": "we will",
  "that's": "that is",
  "whats": "what is",
  "what's": "what is",
  "let's": "let us",
  "lets": "let us",
};

// Number words to digits
const NUMBER_WORDS: Record<string, string> = {
  zero: "0",
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
  ten: "10",
};

/**
 * Normalizes text for audio comparison: removes punctuation, expands contractions, trims whitespace.
 */
export function normalizeSpokenText(text: string): string {
  if (!text) return "";
  let clean = text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Expand contractions and normalize number words
  const words = clean.split(" ");
  const expanded = words.map((w) => {
    if (CONTRACTIONS_MAP[w]) return CONTRACTIONS_MAP[w];
    if (NUMBER_WORDS[w]) return NUMBER_WORDS[w];
    return w;
  });

  return expanded.join(" ");
}

/**
 * Transforms an English word into a phonetic approximation token.
 * Enables sound-alike comparisons (e.g., 'f' ~ 'ph', 'k' ~ 'ck'/'c', 'sh', 'th').
 */
export function toPhoneticRepresentation(word: string): string {
  if (!word) return "";
  let w = word.toLowerCase().trim();

  // Drop non-alpha
  w = w.replace(/[^a-z]/g, "");
  if (!w) return "";

  // Silent letters / prefix reductions
  w = w.replace(/^kn/, "n");
  w = w.replace(/^gn/, "n");
  w = w.replace(/^pn/, "n");
  w = w.replace(/^ps/, "s");
  w = w.replace(/^wr/, "r");
  w = w.replace(/^wh/, "w");

  // Digraph transformations
  w = w.replace(/ph/g, "f");
  w = w.replace(/gh/g, "f");
  w = w.replace(/ck/g, "k");
  w = w.replace(/qu/g, "kw");
  w = w.replace(/q/g, "k");
  w = w.replace(/x/g, "ks");
  w = w.replace(/tch/g, "ch");
  w = w.replace(/dge/g, "j");
  w = w.replace(/sh/g, "S");
  w = w.replace(/ch/g, "C");
  w = w.replace(/th/g, "0");

  // Soft C vs Hard C
  w = w.replace(/c(?=[eiy])/g, "s");
  w = w.replace(/c/g, "k");

  // Soft G vs Hard G
  w = w.replace(/g(?=[eiy])/g, "j");

  // Vowel groupings
  w = w.replace(/ee|ea|ey|ie/g, "E");
  w = w.replace(/oo|ou|ue|ui/g, "U");
  w = w.replace(/ai|ay/g, "A");
  w = w.replace(/oa|oe|ow/g, "O");
  w = w.replace(/oi|oy/g, "I");

  // Remove duplicate adjacent consonants
  let dedup = "";
  for (let i = 0; i < w.length; i++) {
    if (i === 0 || w[i] !== w[i - 1]) {
      dedup += w[i];
    }
  }

  return dedup;
}

/**
 * Calculates Damerau-Levenshtein distance (insertions, deletions, substitutions, transpositions).
 */
export function calculateDamerauLevenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const lenA = a.length;
  const lenB = b.length;
  const d: number[][] = [];

  for (let i = 0; i <= lenA; i++) {
    d[i] = [i];
  }
  for (let j = 0; j <= lenB; j++) {
    d[0][j] = j;
  }

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      );

      // Transposition
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }

  return d[lenA][lenB];
}

/**
 * Computes N-Gram Dice Coefficient (0.0 to 1.0) for fine substring similarity.
 */
function calculateDiceCoefficient(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  if (s1.length < 2 || s2.length < 2) return s1 === s2 ? 1.0 : 0.0;

  const getBigrams = (str: string) => {
    const bigrams = new Map<string, number>();
    for (let i = 0; i < str.length - 1; i++) {
      const bigram = str.substring(i, i + 2);
      bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
    }
    return bigrams;
  };

  const b1 = getBigrams(s1);
  const b2 = getBigrams(s2);

  let intersection = 0;
  b1.forEach((count, key) => {
    if (b2.has(key)) {
      intersection += Math.min(count, b2.get(key)!);
    }
  });

  const total = (s1.length - 1) + (s2.length - 1);
  return (2.0 * intersection) / total;
}

/**
 * Evaluates the accurate percentage similarity (0 - 100) between two individual words or short tokens.
 * Accounts for literal equality, homophones, phonetic approximation, and edit distance.
 */
export function calculateSimilarity(s1: string, s2: string): number {
  const clean1 = (s1 || "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();
  const clean2 = (s2 || "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();

  if (!clean1 && !clean2) return 100;
  if (!clean1 || !clean2) return 0;
  if (clean1 === clean2) return 100;

  // Check homophones dictionary
  if (
    (HOMOPHONES_MAP[clean1] && HOMOPHONES_MAP[clean1].includes(clean2)) ||
    (HOMOPHONES_MAP[clean2] && HOMOPHONES_MAP[clean2].includes(clean1))
  ) {
    return 100;
  }

  // 1. Literal Damerau-Levenshtein score
  const editDist = calculateDamerauLevenshtein(clean1, clean2);
  const maxLen = Math.max(clean1.length, clean2.length);
  const literalScore = Math.max(0, ((maxLen - editDist) / maxLen) * 100);

  // 2. Phonetic token comparison
  const ph1 = toPhoneticRepresentation(clean1);
  const ph2 = toPhoneticRepresentation(clean2);
  let phoneticScore = 0;

  if (ph1 && ph2) {
    if (ph1 === ph2) {
      phoneticScore = 98;
    } else {
      const phDist = calculateDamerauLevenshtein(ph1, ph2);
      const phMaxLen = Math.max(ph1.length, ph2.length);
      phoneticScore = Math.max(0, ((phMaxLen - phDist) / phMaxLen) * 100);
    }
  }

  // 3. Dice Bigram Coefficient
  const diceScore = calculateDiceCoefficient(clean1, clean2) * 100;

  // 4. Substring inclusion bonus
  let inclusionBonus = 0;
  if (clean1.length >= 3 && clean2.length >= 3) {
    if (clean1.includes(clean2) || clean2.includes(clean1)) {
      const minLen = Math.min(clean1.length, clean2.length);
      inclusionBonus = (minLen / maxLen) * 90;
    }
  }

  // Weighted fusion
  const finalScore = Math.max(
    literalScore,
    phoneticScore * 0.95,
    diceScore,
    inclusionBonus,
    literalScore * 0.6 + phoneticScore * 0.4
  );

  return Math.min(100, Math.round(finalScore));
}

/**
 * Evaluates continuous speech against a target phrase.
 * Computes individual word accuracies, matches tokens in conversational order, and returns true measured percentage.
 */
export function evaluatePhrasePronunciation(
  spokenText: string,
  targetPhrase: string,
  threshold = 75
): PhrasePronunciationResult {
  const normSpoken = normalizeSpokenText(spokenText);
  const normTarget = normalizeSpokenText(targetPhrase);

  if (!normTarget) {
    return {
      overallScore: 100,
      wordAccuracies: [],
      isApproved: true,
      spokenNormalized: normSpoken,
      targetNormalized: normTarget,
      feedback: "¡Buen trabajo!",
    };
  }

  if (!normSpoken) {
    const targetWords = normTarget.split(" ").filter(Boolean);
    return {
      overallScore: 0,
      wordAccuracies: targetWords.map((w) => ({ word: w, score: 0, isTarget: true })),
      isApproved: false,
      spokenNormalized: "",
      targetNormalized: normTarget,
      feedback: "No se detectó audio claro. Intenta hablar más cerca del micrófono.",
    };
  }

  const targetWords = normTarget.split(" ").filter(Boolean);
  const spokenWords = normSpoken.split(" ").filter(Boolean);

  // Exact full phrase match
  if (normSpoken === normTarget || normSpoken.includes(normTarget)) {
    return {
      overallScore: 100,
      wordAccuracies: targetWords.map((w) => ({
        word: w,
        score: 100,
        isTarget: true,
        matchedSpokenWord: w,
      })),
      isApproved: true,
      spokenNormalized: normSpoken,
      targetNormalized: normTarget,
      feedback: "¡Pronunciación impecable! Reconocido al 100%.",
    };
  }

  // Word-by-word alignment algorithm with sequential priority
  let lastMatchedSpokenIdx = -1;
  const wordAccuracies: WordAccuracyResult[] = targetWords.map((tWord, tIdx) => {
    let bestScore = 0;
    let bestSpokenWord = "";
    let bestSpokenIdx = -1;

    // Search window centered around expected index
    for (let sIdx = 0; sIdx < spokenWords.length; sIdx++) {
      const sWord = spokenWords[sIdx];
      let sim = calculateSimilarity(sWord, tWord);

      // Positional consistency boost
      if (sIdx >= lastMatchedSpokenIdx) {
        sim = Math.min(100, sim + 3);
      }

      if (sim > bestScore) {
        bestScore = sim;
        bestSpokenWord = sWord;
        bestSpokenIdx = sIdx;
      }
    }

    if (bestScore >= 60 && bestSpokenIdx > -1) {
      lastMatchedSpokenIdx = bestSpokenIdx;
    }

    return {
      word: tWord,
      score: bestScore,
      isTarget: true,
      matchedSpokenWord: bestSpokenWord,
    };
  });

  // Calculate overall weighted score
  const totalScore = wordAccuracies.reduce((acc, curr) => acc + curr.score, 0);
  const avgWordScore = Math.max(0, Math.min(100, Math.round(totalScore / (wordAccuracies.length || 1))));

  // Global phrase edit distance to catch overall phrase rhythm
  const wholePhraseSim = Math.max(0, Math.min(100, calculateSimilarity(normSpoken, normTarget)));
  const overallScore = Math.max(0, Math.min(100, Math.round(avgWordScore * 0.75 + wholePhraseSim * 0.25)));

  const isApproved = overallScore >= threshold;

  // Generate actionable feedback
  let feedback = "";
  if (overallScore >= 90) {
    feedback = "¡Excelente pronunciación! Tu entonación y claridad son muy naturales.";
  } else if (overallScore >= 75) {
    feedback = "¡Muy buen intento! La mayoría de los sonidos fueron claros y entendibles.";
  } else if (overallScore >= 50) {
    const lowestWord = [...wordAccuracies].sort((a, b) => a.score - b.score)[0];
    feedback = lowestWord
      ? `Buen esfuerzo. Practica la articulación de la palabra "${lowestWord.word}".`
      : "Buen intento. Trata de hablar con un ritmo constante y vocalizar cada sílaba.";
  } else {
    feedback = `Se detectó: "${spokenText}". Escucha la pronunciación del tutor y repite a ritmo pausado.`;
  }

  return {
    overallScore,
    wordAccuracies,
    isApproved,
    spokenNormalized: normSpoken,
    targetNormalized: normTarget,
    feedback,
  };
}

/**
 * Validates pronunciation for Kids Mode with child-adapted acoustic thresholds.
 */
export function validateKidsPronunciation(
  spokenText: string,
  targetWord: string,
  threshold = 65
): PhrasePronunciationResult {
  return evaluatePhrasePronunciation(spokenText, targetWord, threshold);
}

/**
 * Evaluates a minimal pair drill (e.g. 'think' vs 'sink', 'ship' vs 'sheep', 'very' vs 'berry').
 * Accurately detects whether the learner pronounced the intended target or fell into the confusable trap.
 */
export function evaluatePhoneticDrill(
  spokenText: string,
  targetWord: string,
  confusableWord?: string,
  targetSentence?: string
): PhoneticDrillResult {
  const normSpoken = normalizeSpokenText(spokenText);
  const normTarget = normalizeSpokenText(targetWord);
  const normConfusable = confusableWord ? normalizeSpokenText(confusableWord) : "";

  if (!normSpoken) {
    return {
      score: 0,
      passed: false,
      detectedWord: "",
      isCloserToConfusable: false,
      feedback: "No se detectó audio. Por favor intenta hablar más claro.",
      targetWord,
      confusableWord,
    };
  }

  // Tokenize spoken words
  const spokenTokens = normSpoken.split(" ");

  // Find best match for target word
  let bestTargetSim = 0;
  let matchedToken = "";
  for (const token of spokenTokens) {
    const sim = calculateSimilarity(token, normTarget);
    if (sim > bestTargetSim) {
      bestTargetSim = sim;
      matchedToken = token;
    }
  }

  // If sentence was spoken, check phrase similarity
  if (targetSentence) {
    const phraseEval = evaluatePhrasePronunciation(spokenText, targetSentence, 70);
    bestTargetSim = Math.max(bestTargetSim, phraseEval.overallScore);
  }

  // Check confusable word similarity
  let bestConfusableSim = 0;
  if (normConfusable) {
    for (const token of spokenTokens) {
      const sim = calculateSimilarity(token, normConfusable);
      if (sim > bestConfusableSim) {
        bestConfusableSim = sim;
      }
    }
  }

  const isCloserToConfusable = normConfusable ? (bestConfusableSim > bestTargetSim && bestConfusableSim >= 70) : false;
  let finalScore = bestTargetSim;

  if (isCloserToConfusable) {
    // Penalty if they pronounced the confusable trap (e.g., said "sink" instead of "think")
    finalScore = Math.min(finalScore, 48);
  }

  const passed = finalScore >= 75;

  let feedback = "";
  if (passed) {
    feedback = `¡Excelente! Has articulado "${targetWord}" con gran fidelidad fonética.`;
  } else if (isCloserToConfusable && confusableWord) {
    feedback = `Parece que dijiste "${confusableWord}" en lugar de "${targetWord}". Recuerda ajustar la posición de la boca/lengua.`;
  } else {
    feedback = `Se detectó "${spokenText}". Intenta exagerar un poco el sonido clave de "${targetWord}".`;
  }

  return {
    score: finalScore,
    passed,
    detectedWord: matchedToken || spokenTokens[0],
    isCloserToConfusable,
    feedback,
    targetWord,
    confusableWord,
  };
}
