export const STORAGE_KEY = 'star-map-progress';

export type MapProgress = {
  current: number;
  completed: number[];
  bossHp: Record<number, number>;
};

export type MapConfig = {
  nodeCount: number;
  bossNodeCount?: number;
};

export const DEFAULT_NODE_COUNT = 5;
export const DEFAULT_BOSS_NODE_COUNT = 0;

export function getMapProgress(config?: MapConfig): MapProgress {
  const defaultProgress: MapProgress = { current: 0, completed: [], bossHp: {} };
  if (typeof window === 'undefined') return defaultProgress;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MapProgress;
      // Migrate legacy bigger progress arrays down to current visible node count
      const maxIndex = (config?.nodeCount ?? DEFAULT_NODE_COUNT) - 1;
      return {
        current: Math.min(parsed.current, maxIndex),
        completed: parsed.completed.filter((idx) => idx <= maxIndex),
        bossHp: Object.fromEntries(
          Object.entries(parsed.bossHp).filter(([key]) => Number(key) <= maxIndex)
        ),
      };
    }
  } catch {
    // ignore
  }
  return defaultProgress;
}

export function setMapProgress(progress: MapProgress) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function completeAdventureNode(nodeIndex: number, config?: MapConfig): MapProgress {
  const progress = getMapProgress(config);
  if (!progress.completed.includes(nodeIndex)) {
    progress.completed = [...progress.completed, nodeIndex];
  }
  const nodeCount = (config?.nodeCount ?? DEFAULT_NODE_COUNT) - 1;
  const next = nodeIndex + 1;
  if (next <= nodeCount && !progress.completed.includes(next)) {
    progress.current = next;
  } else {
    progress.current = nodeIndex;
  }
  setMapProgress(progress);
  return progress;
}

export function completeBossNode(nodeIndex: number): MapProgress {
  const progress = getMapProgress();
  if (!progress.completed.includes(nodeIndex)) {
    progress.completed = [...progress.completed, nodeIndex];
  }
  delete progress.bossHp[nodeIndex];
  progress.current = nodeIndex;
  setMapProgress(progress);
  return progress;
}

export function damageBoss(nodeIndex: number, amount: number): number {
  const progress = getMapProgress();
  const current = progress.bossHp[nodeIndex] ?? 100;
  const next = Math.max(0, current - amount);
  progress.bossHp[nodeIndex] = next;
  setMapProgress(progress);
  return next;
}

export function resetMapProgress(): MapProgress {
  const defaultProgress: MapProgress = { current: 0, completed: [], bossHp: {} };
  setMapProgress(defaultProgress);
  return defaultProgress;
}
