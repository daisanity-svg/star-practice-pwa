import type {
  StoryChapterMeta,
  StoryDialog,
  DailyLoginDialog,
  PetInteractionDialog,
  BossEncounter,
} from './types';

export const CHAPTERS: StoryChapterMeta[] = [
  {
    id: 'ch1',
    world: 'forest',
    title: '森林王國的星光種子',
    description: '在神秘森林中尋找第一顆星光種子',
    requiredStars: 0,
    order: 1,
  },
  {
    id: 'ch2',
    world: 'mountain',
    title: '高山之城的回聲',
    description: '穿越迷霧山脉，抵達高山之城',
    requiredStars: 3,
    order: 2,
  },
  {
    id: 'ch3',
    world: 'sky',
    title: '天空島的守護者',
    description: '登上天空島，成為真正的星光守護者',
    requiredStars: 6,
    order: 3,
  },
  {
    id: 'ch4',
    world: 'forest',
    title: '迷霧熊王的試煉',
    description: '在森林深處接受迷霧熊王的考驗',
    requiredStars: 9,
    order: 4,
  },
  {
    id: 'ch5',
    world: 'sky',
    title: '黑雲龍的最終決戰',
    description: '與回聲巨鷹一起对抗黑雲龍',
    requiredStars: 12,
    order: 5,
  },
];

export const DIALOGS: StoryDialog[] = [
  // Chapter 1: Forest Kingdom
  {
    id: 'ch1_intro',
    chapter: 'ch1',
    world: 'forest',
    speaker: 'narrator',
    text: '在遙遠的森林王國裡，有一顆閃爍的星光種子等待发芽...',
    next: 'ch1_lumi_1',
  },
  {
    id: 'ch1_lumi_1',
    chapter: 'ch1',
    world: 'forest',
    speaker: 'lumi',
    text: '你好！我是露米，星光守護者的一員。你願意幫助我尋找小光獸嗎？',
    next: 'ch1_lumi_2',
  },
  {
    id: 'ch1_lumi_2',
    chapter: 'ch1',
    world: 'forest',
    speaker: 'lumi',
    text: '小光獸是森林王國的守護精灵，牠們散發著溫柔的光芒。',
    next: 'ch1_narrator',
  },
  {
    id: 'ch1_narrator',
    chapter: 'ch1',
    world: 'forest',
    speaker: 'narrator',
    text: '露米指著前方的光點，那正是可愛的小光獸！',
    next: 'ch1_end',
  },
  {
    id: 'ch1_end',
    chapter: 'ch1',
    world: 'forest',
    speaker: 'lumi',
    text: '太棒了！你成功找到了小光獸，森林王國的星光种籽正在發芽！',
  },

  // Chapter 2: Mountain City
  {
    id: 'ch2_intro',
    chapter: 'ch2',
    world: 'mountain',
    speaker: 'narrator',
    text: '穿過迷霧籠罩的山脉，你來到了高山之城...',
    next: 'ch2_lumi_1',
  },
  {
    id: 'ch2_lumi_1',
    chapter: 'ch2',
    world: 'mountain',
    speaker: 'lumi',
    text: '這裡的回聲會告訴我們古老的秘密。仔細聽...',
    next: 'ch2_lumi_2',
  },
  {
    id: 'ch2_lumi_2',
    chapter: 'ch2',
    world: 'mountain',
    speaker: 'lumi',
    text: '回聲說：真正的勇氣，是在迷霧中依然相信光的存在。',
    next: 'ch2_end',
  },
  {
    id: 'ch2_end',
    chapter: 'ch2',
    world: 'mountain',
    speaker: 'narrator',
    text: '回聲消散，你感覺到一股溫暖的力量湧上心頭。',
  },

  // Chapter 3: Sky Island
  {
    id: 'ch3_intro',
    chapter: 'ch3',
    world: 'sky',
    speaker: 'narrator',
    text: '你飛翔到了雲端之上的天空島，那裡有一座閃爍的水晶宮殿...',
    next: 'ch3_lumi_1',
  },
  {
    id: 'ch3_lumi_1',
    chapter: 'ch3',
    world: 'sky',
    speaker: 'lumi',
    text: '歡迎來到天空島。在這裡，星光守護者接受最後的洗禮。',
    next: 'ch3_lumi_2',
  },
  {
    id: 'ch3_lumi_2',
    chapter: 'ch3',
    world: 'sky',
    speaker: 'lumi',
    text: '你看見了嗎？那道光就是我們一直守護的希望。',
    next: 'ch3_end',
  },
  {
    id: 'ch3_end',
    chapter: 'ch3',
    world: 'sky',
    speaker: 'narrator',
    text: '水晶宮殿綻放光芒，你正式成為星光守護者！',
  },

  // Chapter 4: Mist Bear King
  {
    id: 'ch4_intro',
    chapter: 'ch4',
    world: 'forest',
    speaker: 'narrator',
    text: '森林深處傳來低沉的咆哮，迷霧熊王出現了...',
    next: 'ch4_boss_pre',
  },
  {
    id: 'ch4_boss_pre',
    chapter: 'ch4',
    world: 'forest',
    speaker: 'lumi',
    text: '別擔心，迷霧熊王只是想考驗你的 kindness。對牠展示你的善良吧！',
    next: 'ch4_end',
  },
  {
    id: 'ch4_end',
    chapter: 'ch4',
    world: 'forest',
    speaker: 'narrator',
    text: '迷霧熊王點了點頭，讓開了通往更深處的道路。',
  },

  // Chapter 5: Final Boss - Black Cloud Dragon
  {
    id: 'ch5_intro',
    chapter: 'ch5',
    world: 'sky',
    speaker: 'narrator',
    text: '天空忽然暗了下來，黑雲龍席捲而來...',
    next: 'ch5_boss_pre',
  },
  {
    id: 'ch5_boss_pre',
    chapter: 'ch5',
    world: 'sky',
    speaker: 'lumi',
    text: '回聲巨鷹會幫助我們！一起發出最亮的星光吧！',
    choices: [
      { text: '發出星光', next: 'ch5_battle_1' },
      { text: '呼喚小光獸', next: 'ch5_battle_2' },
    ],
  },
  {
    id: 'ch5_battle_1',
    chapter: 'ch5',
    world: 'sky',
    speaker: 'narrator',
    text: '你與回聲巨鷹合力發出耀眼星光，黑雲龍漸漸消散...',
    next: 'ch5_end',
  },
  {
    id: 'ch5_battle_2',
    chapter: 'ch5',
    world: 'sky',
    speaker: 'narrator',
    text: '小光獸們聚集過來，溫暖的光芒驅散了所有黑暗！',
    next: 'ch5_end',
  },
  {
    id: 'ch5_end',
    chapter: 'ch5',
    world: 'sky',
    speaker: 'lumi',
    text: '你做到了！森林王國、高山之城、天空島都恢复了和平。',
    bg: 'sky-victory',
  },
];

export const BOSS_ENCOUNTERS: BossEncounter[] = [
  {
    id: 'mist_bear_king',
    bossName: '迷霧熊王',
    world: 'forest',
    chapter: 'ch4',
    preBattleDialogId: 'ch4_boss_pre',
    postBattleDialogId: 'ch4_end',
    requiredChapterId: 'ch3',
  },
  {
    id: 'black_cloud_dragon',
    bossName: '黑雲龍',
    world: 'sky',
    chapter: 'ch5',
    preBattleDialogId: 'ch5_boss_pre',
    postBattleDialogId: 'ch5_end',
    requiredChapterId: 'ch4',
  },
];

export const DAILY_LOGIN_DIALOGS: DailyLoginDialog[] = [
  {
    id: 'daily_1',
    date: 'day1',
    speaker: 'lumi',
    text: '早安！今天又是充滿星光的一天呢！',
  },
  {
    id: 'daily_2',
    date: 'day2',
    speaker: 'pet',
    text: '小光獸跳過來，蹭了蹭你的手！',
  },
  {
    id: 'daily_3',
    date: 'day3',
    speaker: 'lumi',
    text: '昨天的冒險真精彩，今天要去哪裡呢？',
  },
  {
    id: 'daily_4',
    date: 'day4',
    speaker: 'narrator',
    text: '森林王國傳來陣陣花香，小光獸在樹梢跳舞。',
  },
  {
    id: 'daily_5',
    date: 'day5',
    speaker: 'pet',
    text: '小光獸發出了閃閃亮亮的光芒，好像在說謝謝你！',
  },
  {
    id: 'daily_6',
    date: 'day6',
    speaker: 'lumi',
    text: '你看見了嗎？天空中有星星在對你眨眼睛！',
  },
  {
    id: 'daily_7',
    date: 'day7',
    speaker: 'narrator',
    text: '一整週的冒險結束了，你收集了好多星光回憶！',
  },
];

export const PET_INTERACTIONS: PetInteractionDialog[] = [
  {
    id: 'pet_happy_1',
    petId: 'light_beetle',
    mood: 'happy',
    trigger: 'tap_head',
    text: '小光獸開心地搖了搖尾巴，發出溫柔的光芒！',
  },
  {
    id: 'pet_happy_2',
    petId: 'light_beetle',
    mood: 'happy',
    trigger: 'tap_belly',
    text: '牠開心得翻了个身，露出了胖嘟嘟的肚子！',
  },
  {
    id: 'pet_curious_1',
    petId: 'light_beetle',
    mood: 'curious',
    trigger: 'tap_ear',
    text: '小光獸歪著頭，好像在問：今天要去哪裡冒險呢？',
  },
  {
    id: 'pet_sleepy_1',
    petId: 'light_beetle',
    mood: 'sleepy',
    trigger: 'tap_back',
    text: '小光獸打了個小哈欠，慢慢閉上了閃亮的眼睛。',
  },
  {
    id: 'pet_excited_1',
    petId: 'light_beetle',
    mood: 'excited',
    trigger: 'tap_wing',
    text: '小光獸興奮地拍動翅膀，發出閃閃亮的星光！',
  },
];

export function getChapterById(id: string): StoryChapterMeta | undefined {
  return CHAPTERS.find((c) => c.id === id);
}

export function getDialogsForChapter(chapterId: string): StoryDialog[] {
  return DIALOGS.filter((d) => d.chapter === chapterId);
}

export function getDialogById(id: string): StoryDialog | undefined {
  return DIALOGS.find((d) => d.id === id);
}

export function getDailyLoginDialog(dayIndex: number): DailyLoginDialog {
  const safeIndex = Math.max(0, Math.min(dayIndex, DAILY_LOGIN_DIALOGS.length - 1));
  return DAILY_LOGIN_DIALOGS[safeIndex];
}

export function getPetInteractions(): PetInteractionDialog[] {
  return PET_INTERACTIONS;
}
