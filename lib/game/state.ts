export const GAME_STATE_KEY = 'star-game-v42-state';

export type PetMood = 'happy' | 'curious' | 'sleepy' | 'excited';

export type GameState = {
  stars: number;
  starlight: number;
  petIntimacy: number;
  petEnergy: number;
  petMood: PetMood;
  petLevel: number;
  petExp: number;
  todayPracticeCount: number;
  bossWins: number;
  unlockedWorlds: string[];
  lastPracticeDate: string | null;
};

export const DEFAULT_GAME_STATE: GameState = {
  stars: 0,
  starlight: 0,
  petIntimacy: 0,
  petEnergy: 3,
  petMood: 'happy',
  petLevel: 1,
  petExp: 0,
  todayPracticeCount: 0,
  bossWins: 0,
  unlockedWorlds: ['forest'],
  lastPracticeDate: null,
};

export function loadGameState(): GameState {
  if (typeof window === 'undefined') return DEFAULT_GAME_STATE;
  try {
    const raw = window.localStorage.getItem(GAME_STATE_KEY);
    if (!raw) return DEFAULT_GAME_STATE;
    const parsed = JSON.parse(raw) as Partial<GameState>;
    return { ...DEFAULT_GAME_STATE, ...parsed };
  } catch {
    return DEFAULT_GAME_STATE;
  }
}

export function saveGameState(state: GameState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function addStars(amount: number): GameState {
  const state = loadGameState();
  const updated = { ...state, stars: state.stars + amount };
  saveGameState(updated);
  return updated;
}

export function addStarlight(amount: number): GameState {
  const state = loadGameState();
  const updated = { ...state, starlight: state.starlight + amount };
  saveGameState(updated);
  return updated;
}

export function addPetIntimacy(amount: number): GameState {
  const state = loadGameState();
  const updated = { ...state, petIntimacy: state.petIntimacy + amount };
  saveGameState(updated);
  return updated;
}

export function consumePetEnergy(amount: number): GameState {
  const state = loadGameState();
  const updated = { ...state, petEnergy: Math.max(0, state.petEnergy - amount) };
  saveGameState(updated);
  return updated;
}

export function addPetExp(amount: number): GameState {
  const state = loadGameState();
  const updated = { ...state, petExp: state.petExp + amount };
  saveGameState(updated);
  return updated;
}

export function setPetMood(mood: PetMood): GameState {
  const state = loadGameState();
  const updated = { ...state, petMood: mood };
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

export function getExpForNextLevel(level: number): number {
  return level * 20;
}
