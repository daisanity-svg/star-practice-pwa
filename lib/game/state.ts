export const GAME_STATE_KEY = 'star-game-v5-state';

export type PetMood = 'happy' | 'curious' | 'sleepy' | 'excited';

export type GameState = {
  stateVersion: number;
  stars: number;
  energy: number;
  growthLevel: number;
  intimacyLevel: number;
  intimacyPoints: number;
  petMood: PetMood;
  todayPracticeCount: number;
  bossWins: number;
  unlockedWorlds: string[];
  lastPracticeDate: string | null;
  lastDrawDate: string | null;
  feedCount: number;
  playCount: number;
};

export const DEFAULT_GAME_STATE: GameState = {
  stateVersion: 5,
  stars: 0,
  energy: 0,
  growthLevel: 1,
  intimacyLevel: 1,
  intimacyPoints: 0,
  petMood: 'happy',
  todayPracticeCount: 0,
  bossWins: 0,
  unlockedWorlds: ['forest'],
  lastPracticeDate: null,
  lastDrawDate: null,
  feedCount: 0,
  playCount: 0,
};

export function getNextGrowthNeed(level: number): number {
  return 10;
}

export function getNextIntimacyNeed(level: number): number {
  return 10;
}

export function migrateGameState(raw: unknown): GameState {
  try {
    const parsed = (typeof raw === 'string' ? JSON.parse(raw) : raw) as Partial<GameState>;
    if (!parsed || parsed.stateVersion !== 5) {
      return { ...DEFAULT_GAME_STATE };
    }
    return {
      ...DEFAULT_GAME_STATE,
      ...parsed,
      feedCount: parsed.feedCount ?? 0,
      playCount: parsed.playCount ?? 0,
    };
  } catch {
    return { ...DEFAULT_GAME_STATE };
  }
}

export function loadGameState(): GameState {
  if (typeof window === 'undefined') return DEFAULT_GAME_STATE;
  try {
    const raw = window.localStorage.getItem(GAME_STATE_KEY);
    if (!raw) return DEFAULT_GAME_STATE;
    return migrateGameState(raw);
  } catch {
    return DEFAULT_GAME_STATE;
  }
}

export function saveGameState(state: GameState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GAME_STATE_KEY, JSON.stringify({ ...state, stateVersion: 5 }));
  } catch {
    // ignore
  }
}

export function addStars(amount: number): GameState {
  const state = loadGameState();
  const updated = { ...state, stars: Math.max(0, state.stars + amount) };
  saveGameState(updated);
  return updated;
}

export function addEnergy(amount: number): GameState {
  const state = loadGameState();
  const updated = { ...state, energy: Math.max(0, state.energy + amount) };
  saveGameState(updated);
  return updated;
}

export function consumeEnergy(amount: number): GameState {
  const state = loadGameState();
  const updated = { ...state, energy: Math.max(0, state.energy - amount) };
  saveGameState(updated);
  return updated;
}

export function addIntimacyPoints(amount: number): GameState {
  const state = loadGameState();
  let newPoints = state.intimacyPoints + amount;
  let newLevel = state.intimacyLevel;
  while (newPoints >= getNextIntimacyNeed(newLevel)) {
    newPoints -= getNextIntimacyNeed(newLevel);
    newLevel += 1;
  }
  const updated = { ...state, intimacyPoints: newPoints, intimacyLevel: newLevel };
  saveGameState(updated);
  return updated;
}

export function setPetMood(mood: PetMood): GameState {
  const state = loadGameState();
  const updated = { ...state, petMood: mood };
  saveGameState(updated);
  return updated;
}

export function addBossWin(): GameState {
  const state = loadGameState();
  const updated = { ...state, bossWins: state.bossWins + 1 };
  saveGameState(updated);
  return updated;
}

export function unlockWorld(worldId: string): GameState {
  const state = loadGameState();
  if (state.unlockedWorlds.includes(worldId)) return state;
  const updated = { ...state, unlockedWorlds: [...state.unlockedWorlds, worldId] };
  saveGameState(updated);
  return updated;
}

export function incrementPracticeCount(): GameState {
  const state = loadGameState();
  const today = new Date().toISOString().slice(0, 10);
  const updated =
    state.lastPracticeDate === today
      ? { ...state, todayPracticeCount: state.todayPracticeCount + 1 }
      : {
          ...state,
          todayPracticeCount: 1,
          lastPracticeDate: today,
        };
  saveGameState(updated);
  return updated;
}

export function tryGrowPet(): GameState {
  const state = loadGameState();
  const need = getNextGrowthNeed(state.growthLevel);
  if (state.energy < need) return state;
  const updated = {
    ...state,
    growthLevel: state.growthLevel + 1,
    energy: state.energy - need,
  };
  saveGameState(updated);
  return updated;
}

export function feedPet(): GameState {
  const state = loadGameState();
  if (state.energy < 2) return state;
  const newFeedCount = state.feedCount + 1;
  let newGrowthLevel = state.growthLevel;
  let remaining = newFeedCount;
  if (newFeedCount >= getNextGrowthNeed(newGrowthLevel)) {
    newGrowthLevel += 1;
    remaining = newFeedCount - getNextGrowthNeed(newGrowthLevel - 1);
  }
  const updated = {
    ...state,
    energy: state.energy - 2,
    feedCount: remaining,
    growthLevel: newGrowthLevel,
  };
  saveGameState(updated);
  return updated;
}

export function playWithPet(): GameState {
  const state = loadGameState();
  if (state.stars < 1) return state;
  const newPlayCount = state.playCount + 1;
  let newIntimacyLevel = state.intimacyLevel;
  let remaining = newPlayCount;
  if (newPlayCount >= getNextIntimacyNeed(newIntimacyLevel)) {
    newIntimacyLevel += 1;
    remaining = newPlayCount - getNextIntimacyNeed(newIntimacyLevel - 1);
  }
  const updated = {
    ...state,
    stars: state.stars - 1,
    playCount: remaining,
    intimacyLevel: newIntimacyLevel,
  };
  saveGameState(updated);
  return updated;
}

export function recordDraw(): GameState {
  const state = loadGameState();
  const updated = { ...state, lastDrawDate: new Date().toISOString().slice(0, 10) };
  saveGameState(updated);
  return updated;
}

export function canDrawToday(state: GameState): boolean {
  if (!state.lastDrawDate) return true;
  const today = new Date().toISOString().slice(0, 10);
  return state.lastDrawDate !== today;
}

export function resetGameState(): GameState {
  saveGameState(DEFAULT_GAME_STATE);
  return DEFAULT_GAME_STATE;
}
