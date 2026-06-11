export const todayPracticeItems = [
  {
    id: 'bopomofo-b',
    type: '注音',
    prompt: '爸爸的 ㄅ 在哪裡？',
    helper: 'ㄅ 是爸爸、拜拜、抱抱的好朋友',
    options: ['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ'],
    answer: 'ㄅ'
  },
  {
    id: 'english-a',
    type: '英文',
    prompt: 'Apple 的 A 在哪裡？',
    helper: 'A 是 Apple、Ant、Airplane 的第一個字母',
    options: ['A', 'B', 'C', 'D'],
    answer: 'A'
  },
  {
    id: 'bopomofo-m',
    type: '注音',
    prompt: '蜜蜂的 ㄇ 在哪裡？',
    helper: 'ㄇ 是蜜蜂、媽媽、妹妹的好朋友',
    options: ['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ'],
    answer: 'ㄇ'
  }
];

export const dashboardStats = [
  { label: '今日題數', value: '10 題' },
  { label: '弱點項目', value: '3 個' },
  { label: '卡包剩餘', value: '12 張' },
  { label: '連續天數', value: '2 天' }
];

export const cardCollections = [
  { name: '小車系列', owned: 5, total: 12, emoji: '🚗' },
  { name: '狗狗系列', owned: 2, total: 8, emoji: '🐶' },
  { name: '植物朋友', owned: 1, total: 10, emoji: '🌱' }
];
