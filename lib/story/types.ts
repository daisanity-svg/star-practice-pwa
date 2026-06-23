export type StoryWorld = 'forest' | 'mountain' | 'sky';
export type StoryChapter = 'ch1' | 'ch2' | 'ch3' | 'ch4' | 'ch5';

export type DialogSpeaker = 'narrator' | 'lumi' | 'pet' | 'boss';

export type StoryDialog = {
  id: string;
  chapter: StoryChapter;
  world: StoryWorld;
  speaker: DialogSpeaker;
  text: string;
  bg?: string;
  next?: string;
  choices?: { text: string; next: string }[];
};

export type StoryChapterMeta = {
  id: StoryChapter;
  world: StoryWorld;
  title: string;
  description: string;
  requiredStars: number;
  order: number;
};

export type StoryProgress = {
  unlockedChapters: StoryChapter[];
  currentChapter: StoryChapter | null;
  currentDialogId: string | null;
  viewedDialogIds: string[];
  completedChapters: StoryChapter[];
  lastLoginDate: string | null;
  dailyDialogUsed: boolean;
};

export type DailyLoginDialog = {
  id: string;
  date: string;
  speaker: DialogSpeaker;
  text: string;
};

export type PetInteractionDialog = {
  id: string;
  petId: string;
  mood: 'happy' | 'curious' | 'sleepy' | 'excited';
  trigger: string;
  text: string;
};

export type BossEncounter = {
  id: string;
  bossName: string;
  world: StoryWorld;
  chapter: StoryChapter;
  preBattleDialogId: string;
  postBattleDialogId: string;
  requiredChapterId: StoryChapter;
};
