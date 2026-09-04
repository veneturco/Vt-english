import { CEFRLevel } from "../types";
import { ADULT_UNITS } from "../components/AdultLearningPath";

const STORAGE_KEY = "vt_learning_path_progress_v2";

export interface LearningPathProgress {
  completedNodeIds: string[];
  currentNodeId: string;
  unlockedUnitIds: string[];
  highestLevelUnlocked: CEFRLevel;
  lastUpdated: number;
}

// Ordered node sequence across all units
export const ALL_NODE_SEQUENCE: string[] = [
  "u1-n1",
  "u1-n2",
  "u1-n3",
  "u1-boss",
  "u2-n1",
  "u2-n2",
  "u2-n3",
  "u2-boss",
  "u3-n1",
  "u3-n2",
  "u3-boss",
  "u4-n1",
  "u4-boss",
];

// Mapping of unit unlocks when boss nodes are completed
export const BOSS_TO_NEXT_UNIT: Record<string, string> = {
  "u1-boss": "unit-2",
  "u2-boss": "unit-3",
  "u3-boss": "unit-4",
};

// Initial state: Node 1 completed, Node 2 is current, Unit 1 unlocked
const DEFAULT_PROGRESS: LearningPathProgress = {
  completedNodeIds: ["u1-n1"],
  currentNodeId: "u1-n2",
  unlockedUnitIds: ["unit-1"],
  highestLevelUnlocked: "A1",
  lastUpdated: Date.now(),
};

export function getStoredLearningPathProgress(currentCefrLevel?: CEFRLevel): LearningPathProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      if (currentCefrLevel && currentCefrLevel !== "A1") {
        return syncProgressWithCefrLevel(currentCefrLevel);
      }
      return DEFAULT_PROGRESS;
    }
    const parsed = JSON.parse(raw) as LearningPathProgress;
    if (parsed && Array.isArray(parsed.completedNodeIds) && parsed.currentNodeId) {
      // If currentCefrLevel demands higher unit unlock, ensure it's synced
      if (currentCefrLevel && currentCefrLevel !== "A1") {
        return syncProgressWithCefrLevel(currentCefrLevel, parsed);
      }
      return parsed;
    }
    return DEFAULT_PROGRESS;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveStoredLearningPathProgress(progress: LearningPathProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...progress, lastUpdated: Date.now() }));
  } catch (err) {
    console.error("Failed to save learning path progress", err);
  }
}

export interface MarkNodeResult {
  updatedProgress: LearningPathProgress;
  isNewCompletion: boolean;
  newlyUnlockedNodeId: string | null;
  newlyUnlockedUnitId: string | null;
}

export function markNodeCompleted(nodeId: string): MarkNodeResult {
  const current = getStoredLearningPathProgress();
  const isAlreadyCompleted = current.completedNodeIds.includes(nodeId);

  const updatedCompleted = isAlreadyCompleted
    ? current.completedNodeIds
    : [...current.completedNodeIds, nodeId];

  // Find index in overall sequence to determine next node
  const currentIndex = ALL_NODE_SEQUENCE.indexOf(nodeId);
  let nextNodeId: string = current.currentNodeId;
  let newlyUnlockedNodeId: string | null = null;
  let newlyUnlockedUnitId: string | null = null;

  if (currentIndex !== -1 && currentIndex + 1 < ALL_NODE_SEQUENCE.length) {
    const candidateNext = ALL_NODE_SEQUENCE[currentIndex + 1];
    // If the next node wasn't completed, it becomes the new current node
    if (!updatedCompleted.includes(candidateNext)) {
      nextNodeId = candidateNext;
      newlyUnlockedNodeId = candidateNext;
    }
  }

  // Check if this was a boss node that unlocks the next unit
  const updatedUnits = [...current.unlockedUnitIds];
  if (BOSS_TO_NEXT_UNIT[nodeId]) {
    const nextUnit = BOSS_TO_NEXT_UNIT[nodeId];
    if (!updatedUnits.includes(nextUnit)) {
      updatedUnits.push(nextUnit);
      newlyUnlockedUnitId = nextUnit;
    }
  }

  const updatedProgress: LearningPathProgress = {
    ...current,
    completedNodeIds: updatedCompleted,
    currentNodeId: nextNodeId,
    unlockedUnitIds: updatedUnits,
    lastUpdated: Date.now(),
  };

  saveStoredLearningPathProgress(updatedProgress);

  return {
    updatedProgress,
    isNewCompletion: !isAlreadyCompleted,
    newlyUnlockedNodeId,
    newlyUnlockedUnitId,
  };
}

// Automatically unlocks units and nodes corresponding to a placement test level
export function syncProgressWithCefrLevel(
  level: CEFRLevel,
  baseProgress?: LearningPathProgress
): LearningPathProgress {
  const current = baseProgress || getStoredLearningPathProgress();
  const unlockedUnits = new Set(current.unlockedUnitIds);
  unlockedUnits.add("unit-1");

  const completed = new Set(current.completedNodeIds);

  if (level === "A2") {
    unlockedUnits.add("unit-2");
    completed.add("u1-n1");
    completed.add("u1-n2");
    completed.add("u1-n3");
    completed.add("u1-boss");
  } else if (level === "B1") {
    unlockedUnits.add("unit-2");
    unlockedUnits.add("unit-3");
    completed.add("u1-n1");
    completed.add("u1-n2");
    completed.add("u1-n3");
    completed.add("u1-boss");
    completed.add("u2-n1");
    completed.add("u2-n2");
    completed.add("u2-n3");
    completed.add("u2-boss");
  } else if (level === "B2" || level === "C1") {
    unlockedUnits.add("unit-2");
    unlockedUnits.add("unit-3");
    unlockedUnits.add("unit-4");
    completed.add("u1-n1");
    completed.add("u1-n2");
    completed.add("u1-n3");
    completed.add("u1-boss");
    completed.add("u2-n1");
    completed.add("u2-n2");
    completed.add("u2-n3");
    completed.add("u2-boss");
    completed.add("u3-n1");
    completed.add("u3-n2");
    completed.add("u3-boss");
  }

  // Find first uncompleted node in sequence to make current
  let newCurrent = ALL_NODE_SEQUENCE[0];
  for (const nId of ALL_NODE_SEQUENCE) {
    if (!completed.has(nId)) {
      newCurrent = nId;
      break;
    }
  }

  const updated: LearningPathProgress = {
    ...current,
    completedNodeIds: Array.from(completed),
    currentNodeId: newCurrent,
    unlockedUnitIds: Array.from(unlockedUnits),
    highestLevelUnlocked: level,
    lastUpdated: Date.now(),
  };

  saveStoredLearningPathProgress(updated);
  return updated;
}

export function resetLearningPathProgress(): LearningPathProgress {
  saveStoredLearningPathProgress(DEFAULT_PROGRESS);
  return DEFAULT_PROGRESS;
}
