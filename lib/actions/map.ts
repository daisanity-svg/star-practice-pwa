export const STORAGE_KEY = 'star-map-progress';

export type MapProgress = {
  current: number;
  completed: number[];
  bossHp: Record<number, number>;
};

export function getMapProgress(): MapProgress {
  const defaultProgress: MapProgress = { current: 0, completed: [], bossHp: {} };
  if (typeof window === 'undefined') return defaultProgress;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MapProgress;
      return parsed;
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

export function completeAdventureNode(nodeIndex: number): MapProgress {
  const progress = getMapProgress();
  if (!progress.completed.includes(nodeIndex)) {
    progress.completed = [...progress.completed, nodeIndex];
  }
  const next = nodeIndex + 1;
  if (next < 10 && !progress.completed.includes(next)) {
    progress.current = next;
  } else if (next >= 10) {
    progress.current = 9;
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
  const next = nodeIndex + 1;
  if (next < 10 && !progress.completed.includes(next)) {
    progress.current = next;
  } else if (next >= 10) {
    progress.current = 9;
  }
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
