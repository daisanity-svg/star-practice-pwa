export const STORY_PROGRESS_KEY = 'star-game-story-progress';
export const DAILY_LOGIN_DATE_KEY = 'star-game-daily-login-date';
export const DAILY_LOGIN_INDEX_KEY = 'star-game-daily-login-index';

export type StoryProgress = {
  unlockedChapters: string[];
  currentChapter: string | null;
  currentDialogId: string | null;
  viewedDialogIds: string[];
  completedChapters: string[];
  lastLoginDate: string | null;
  dailyDialogUsed: boolean;
};

export const DEFAULT_PROGRESS: StoryProgress = {
  unlockedChapters: ['ch1'],
  currentChapter: null,
  currentDialogId: null,
  viewedDialogIds: [],
  completedChapters: [],
  lastLoginDate: null,
  dailyDialogUsed: false,
};

export function loadProgress(): StoryProgress {
  if (typeof window === 'undefined') {
    return DEFAULT_PROGRESS;
  }
  try {
    const raw = window.localStorage.getItem(STORY_PROGRESS_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as StoryProgress;
    return { ...DEFAULT_PROGRESS, ...parsed };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: StoryProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORY_PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Storage full or unavailable
  }
}

export function resetProgress(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORY_PROGRESS_KEY);
  } catch {
    // Ignore
  }
}

export function getDailyLoginIndex(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(DAILY_LOGIN_INDEX_KEY);
    return raw ? Math.max(0, parseInt(raw, 10) || 0) : 0;
  } catch {
    return 0;
  }
}

export function setDailyLoginIndex(index: number): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DAILY_LOGIN_INDEX_KEY, String(index));
  } catch {
    // Ignore
  }
}

export function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isSameDay(a: string | null, b: string): boolean {
  if (!a) return false;
  return a === b;
}
