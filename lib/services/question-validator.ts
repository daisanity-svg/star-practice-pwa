import type { GeneratedQuestion, LearningItem } from '@/lib/types';

type ValidationError = {
  field: string;
  message: string;
};

export type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
};

export const BOPOMOFO_POOL = [
  'ㄅ', 'ㄆ', 'ㄇ', 'ㄈ',
  'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ',
  'ㄍ', 'ㄎ', 'ㄏ',
  'ㄐ', 'ㄑ', 'ㄒ',
  'ㄓ', 'ㄔ', 'ㄕ', 'ㄖ',
  'ㄗ', 'ㄘ', 'ㄙ',
  'ㄧ', 'ㄨ', 'ㄩ'
];

export const ENGLISH_POOL = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];

export const BOPOMOFO_KEYWORDS: Record<string, string[]> = {
  ㄅ: ['爸爸', '杯子', '布丁'],
  ㄆ: ['泡泡', '蘋果', '皮球'],
  ㄇ: ['媽媽', '貓咪', '木馬'],
  ㄈ: ['飛機', '風車', '飯糰'],
  ㄉ: ['弟弟', '蛋糕', '大象'],
  ㄊ: ['兔子', '太陽', '糖果'],
  ㄋ: ['牛奶', '鳥巢', '南瓜'],
  ㄌ: ['老虎', '禮物', '蘿蔔'],
  ㄍ: ['哥哥', '狗狗', '鼓'],
  ㄎ: ['卡車', '恐龍', '口罩'],
  ㄏ: ['河馬', '花朵', '火車'],
  ㄐ: ['積木', '雞蛋', '橘子'],
  ㄑ: ['氣球', '鉛筆', '青蛙'],
  ㄒ: ['星星', '小熊', '西瓜'],
  ㄓ: ['蜘蛛', '紙張', '竹子'],
  ㄔ: ['車子', '橙子', '尺'],
  ㄕ: ['獅子', '書包', '石頭'],
  ㄖ: ['日出', '熱狗', '榕樹'],
  ㄗ: ['嘴巴', '紫色', '桌子'],
  ㄘ: ['刺蝟', '草莓', '彩虹'],
  ㄙ: ['松鼠', '傘', '三明治'],
  ㄧ: ['衣服', '椅子', '一隻魚'],
  ㄨ: ['烏龜', '屋子', '巫婆'],
  ㄩ: ['雨傘', '魚兒', '玉米']
};

export const ENGLISH_KEYWORDS: Record<string, string[]> = {
  A: ['Apple', 'Ant', 'Airplane'],
  B: ['Baby', 'Ball', 'Bear'],
  C: ['Cat', 'Car', 'Cake'],
  D: ['Dog', 'Duck', 'Door'],
  E: ['Egg', 'Elephant', 'Eye'],
  F: ['Fish', 'Flower', 'Fox'],
  G: ['Goat', 'Grape', 'Girl'],
  H: ['Hat', 'House', 'Horse'],
  I: ['Ice', 'Igloo', 'Insect'],
  J: ['Juice', 'Jam', 'Jet'],
  K: ['King', 'Kite', 'Koala'],
  L: ['Lion', 'Lemon', 'Leaf'],
  M: ['Monkey', 'Milk', 'Moon'],
  N: ['Nest', 'Nose', 'Net'],
  O: ['Orange', 'Owl', 'Octopus'],
  P: ['Pig', 'Pencil', 'Pizza'],
  Q: ['Queen', 'Quilt', 'Question'],
  R: ['Rabbit', 'Robot', 'Rainbow'],
  S: ['Sun', 'Star', 'Snake'],
  T: ['Tiger', 'Train', 'Tree'],
  U: ['Umbrella', 'Unicorn', 'Up'],
  V: ['Van', 'Violin', 'Vegetable'],
  W: ['Wolf', 'Water', 'Window'],
  X: ['X-ray', 'Xylophone', 'Xerus'],
  Y: ['Yo-yo', 'Yellow', 'Yacht'],
  Z: ['Zebra', 'Zoo', 'Zero']
};

export const SAFE_QUESTION_TEMPLATES = {
  choice: [
    '「{keyword}」的第一個聲音是哪一個？',
    '哪個注音會出現在「{keyword}」開頭？',
    '看到「{keyword}」，第一個聲音是什麼？',
    '幫「{keyword}」找到開頭聲音。',
    '{keyword} 開頭是哪個字母？',
    '{keyword} 的第一個字母是哪一個？',
    '哪個字母會出現在 {keyword} 開頭？',
    '幫 {keyword} 找到開頭字母。'
  ],
  listening: [
    '聽到「{keyword}」，請找出開頭的注音。',
    '耳朵小任務：聽「{keyword}」，選出第一個聲音。',
    '聽一聽「{keyword}」，哪個聲音先出現？',
    '聽到 {keyword}，請找出第一個字母。',
    '仔細聽 {keyword}，開頭是哪個字母？'
  ],
  tracing: [
    '手指小畫家：描一描「{keyword}」的開頭聲音。',
    '小手出發：把「{keyword}」的開頭聲音描亮。',
    '魔法筆任務：一起描出「{keyword}」的開頭。'
  ]
} as const;

export const FIXED_DISTRACTOR_POOLS = {
  bopomofo: BOPOMOFO_POOL,
  english: ENGLISH_POOL
};

const DEFAULT_KEYWORDS: Record<string, string> = Object.fromEntries([
  ...Object.entries(BOPOMOFO_KEYWORDS).map(([symbol, keywords]) => [symbol, keywords[0]]),
  ...Object.entries(ENGLISH_KEYWORDS).map(([symbol, keywords]) => [symbol, keywords[0]])
]);

function isBopomofoType(type: string | undefined | null): boolean {
  return type?.includes('bopomofo') ?? false;
}

function isEnglishType(type: string | undefined | null): boolean {
  return type?.includes('english') ?? false;
}

function getFixedDistractorPool(learningItemType: string | undefined | null): string[] {
  if (isEnglishType(learningItemType)) return FIXED_DISTRACTOR_POOLS.english;
  return FIXED_DISTRACTOR_POOLS.bopomofo;
}

function inferMode(question: GeneratedQuestion) {
  if (question.practice_mode) return question.practice_mode;
  if (question.question_text.includes('描')) return 'tracing';
  if (question.question_text.includes('聽')) return 'listening';
  return 'choice';
}

function normalize(value?: string | null) {
  return value?.trim() ?? '';
}

function isSymbolOnlyKeyword(keyword: string, symbol: string) {
  return normalize(keyword).toLowerCase() === normalize(symbol).toLowerCase();
}

function hasBannedSymbolLoop(text: string) {
  const compact = text.replace(/\s+/g, '');
  return (
    /([A-Zㄅ-ㄩ])的\1/.test(compact) ||
    /([A-Zㄅ-ㄩ])要找\1/.test(compact) ||
    /哪一個是([A-Zㄅ-ㄩ])的\1/.test(compact) ||
    /星星躲貓貓：?哪一個是([A-Zㄅ-ㄩ])的\1/.test(compact)
  );
}

function shuffleLocal<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

export function getKeywordOptions(item: Pick<LearningItem, 'content' | 'display_text' | 'type'>, keyword?: string | null) {
  const symbol = normalize(item.content);
  const keywordMap = isEnglishType(item.type) ? ENGLISH_KEYWORDS : BOPOMOFO_KEYWORDS;
  const candidates = [keyword, item.display_text, ...(keywordMap[symbol] ?? []), DEFAULT_KEYWORDS[symbol]]
    .map((value) => normalize(value))
    .filter((candidate) => candidate && !isSymbolOnlyKeyword(candidate, symbol));
  return Array.from(new Set(candidates));
}

export function getChildSafeKeyword(item: Pick<LearningItem, 'content' | 'display_text' | 'type'>, keyword?: string | null) {
  const candidates = getKeywordOptions(item, keyword);
  return shuffleLocal(candidates)[0] || '生活詞';
}

export function validateQuestion(question: GeneratedQuestion): ValidationResult {
  const errors: ValidationError[] = [];
  const mode = inferMode(question);
  const symbol = normalize(question.correct_answer?.[0] ?? question.learning_item?.content);
  const keywordOptions = getKeywordOptions(
    question.learning_item ?? { content: symbol, display_text: symbol, type: '' },
    question.memory_hook?.keyword
  );

  if (!question.question_text || question.question_text.trim().length === 0) {
    errors.push({ field: 'question_text', message: '題目文字不可空' });
  }

  if (question.question_text && hasBannedSymbolLoop(question.question_text)) {
    errors.push({ field: 'question_text', message: '題目不可是符號互找題' });
  }

  if (symbol && question.question_text && keywordOptions.length > 0) {
    const hasChildKeyword = keywordOptions.some((keyword) => question.question_text.includes(keyword));
    if (!hasChildKeyword) {
      errors.push({ field: 'question_text', message: '題目必須使用兒童可理解的 keyword' });
    }
  }

  if (!question.learning_item || !question.learning_item.id) {
    errors.push({ field: 'learning_item', message: '學習項目不可空' });
  }

  if (!Array.isArray(question.correct_answer) || question.correct_answer.length !== 1) {
    errors.push({ field: 'correct_answer', message: '正確答案必須恰好 1 個' });
  }

  if (mode === 'tracing') {
    if (!Array.isArray(question.options) || question.options.length !== 1) {
      errors.push({ field: 'options', message: '描寫題只需要 1 個目標符號' });
    }
  } else if (!Array.isArray(question.options) || question.options.length !== 4) {
    errors.push({ field: 'options', message: '選項必須恰好 4 個' });
  }

  if (Array.isArray(question.options) && Array.isArray(question.correct_answer) && question.correct_answer.length > 0) {
    if (!question.options.includes(question.correct_answer[0])) {
      errors.push({ field: 'options', message: '選項必須包含正確答案' });
    }
  }

  if (Array.isArray(question.options)) {
    const uniqueOptions = new Set(question.options);
    if (uniqueOptions.size !== question.options.length) {
      errors.push({ field: 'options', message: '選項不可重複' });
    }
  }

  const itemType = question.learning_item?.type;
  if (mode !== 'tracing' && isBopomofoType(itemType) && Array.isArray(question.options)) {
    const hasNonBopomofo = question.options.some((opt) => /[a-zA-Z]/.test(opt));
    if (hasNonBopomofo) errors.push({ field: 'options', message: '注音題只能混注音' });
  }

  if (mode !== 'tracing' && isEnglishType(itemType) && Array.isArray(question.options)) {
    const hasNonEnglish = question.options.some((opt) => !/^[a-zA-Z]$/.test(opt));
    if (hasNonEnglish) errors.push({ field: 'options', message: '英文題只能混英文' });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function buildSafeDistractors(
  correctAnswer: string,
  learningItemType: string | undefined | null,
  allItems?: LearningItem[]
): string[] {
  const fixedPool = getFixedDistractorPool(learningItemType);
  const normalizedAnswer = correctAnswer.trim();
  const candidates: string[] = [];

  if (allItems && allItems.length > 0) {
    allItems
      .filter((item) => {
        if (isEnglishType(learningItemType)) return isEnglishType(item.type);
        return isBopomofoType(item.type);
      })
      .map((item) => item.content.trim())
      .filter((content) => content && content !== normalizedAnswer)
      .forEach((content) => candidates.push(content));
  }

  fixedPool
    .filter((content) => content !== normalizedAnswer)
    .forEach((content) => candidates.push(content));

  const uniqueDistractors = shuffleLocal(Array.from(new Set(candidates))).slice(0, 3);
  const options = [normalizedAnswer, ...uniqueDistractors];

  while (options.length < 4) {
    const candidate = fixedPool.find((item) => !options.includes(item));
    if (!candidate) break;
    options.push(candidate);
  }

  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return options.slice(0, 4);
}

export function pickTemplate(mode: keyof typeof SAFE_QUESTION_TEMPLATES, orderIndex: number): string {
  const templates = SAFE_QUESTION_TEMPLATES[mode];
  return templates[orderIndex % templates.length];
}

export function renderTemplate(
  template: string,
  item: LearningItem,
  keyword?: string | null
): string {
  const actualKeyword = getChildSafeKeyword(item, keyword);
  const symbol = item.content;

  return template
    .replaceAll('{keyword}', actualKeyword)
    .replaceAll('{symbol}', symbol)
    .replaceAll('{content}', symbol)
    .replaceAll('{letter}', symbol);
}
