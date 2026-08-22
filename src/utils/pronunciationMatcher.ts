export interface PronunciationResult {
  score: number;
  isApproved: boolean;
  spokenNormalized: string;
  targetNormalized: string;
}

function calculateLevenshtein(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

export function validateKidsPronunciation(
  spokenText: string,
  targetWord: string,
  threshold = 70
): PronunciationResult {
  const clean = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .trim();

  const spoken = clean(spokenText);
  const target = clean(targetWord);

  if (!spoken || !target) {
    return { score: 0, isApproved: false, spokenNormalized: spoken, targetNormalized: target };
  }

  if (spoken === target || spoken.includes(target)) {
    return { score: 100, isApproved: true, spokenNormalized: spoken, targetNormalized: target };
  }

  const distance = calculateLevenshtein(spoken, target);
  const maxLength = Math.max(spoken.length, target.length);
  const similarity = Math.max(0, Math.round(((maxLength - distance) / maxLength) * 100));

  return {
    score: similarity,
    isApproved: similarity >= threshold,
    spokenNormalized: spoken,
    targetNormalized: target,
  };
}
