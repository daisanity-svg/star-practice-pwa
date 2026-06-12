import type { GeneratedQuestion, LearningItem } from '@/lib/types';

type ValidationError = {
  field: string;
  message: string;
};

export type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
};

export const SAFE_QUESTION_TEMPLATES = {
  choice: [
    '「{keyword}」的第一個聲音是哪一個？',
    '幫「{keyword}」找到它的朋友 {symbol}。',
    '小偵探任務：看到「{keyword}」，請找出 {symbol}。',
    '星星任務：哪一個是「{keyword}」的開頭朋友？'
  ],
  listening: [
    '聽一聽，請找出「{keyword}」的 {symbol}。',
    '耳朵小任務：聽到「{keyword}」，找到 {symbol}。',
    '聲音小雷達：「{keyword}」的開頭朋友是哪一個？',
    '叮咚！請幫「{keyword}」找到正確聲音。'
  ],
  tracing: [
    '手指小畫家：描一描「{keyword}」的 {symbol}。',
    '星星軌道：跟著線走，寫出 {symbol}。',
    '小手出發：把「{keyword}」的 {symbol} 描亮。',
    '魔法筆任務：一起把 {symbol} 畫出來。'
  ]
} as const;

export const FIXED_DISTRACTOR_POOLS = {
  bopomofo: ['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ', 'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ', 'ㄍ', 'ㄎ', 'ㄏ'],
  english: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
};

const DEFAULT_KEYWORDS: Record<string, string> = {
  ㄅ: '爸爸',
  ㄆ: '泡泡',
  ㄇ: '媽媽',
  ㄈ: '飛機',
  ㄉ: '弟弟',
  ㄊ: '兔子',
  ㄋ: '牛奶',
  ㄌ: '藍天',
  ㄍ: '哥哥',
  ㄎ: '恐龍',
  ㄏ: '河馬',
  A: 'Apple',
  B: 'Baby',
  C: 'Cat',
  D: 'Dog',
  E: 'Egg',
  F: 'Fish',
  G: 'Gift',
  H: 'Hat',
  I: 'Ice',
  J: 'Juice'
};

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
    /([A-Zㄅ-ㄧ])的\1/.test(compact) ||
    /([A-Zㄅ-ㄧ])要找\1/.test(compact) ||
    /哪一個是([A-Zㄅ-ㄧ])的\1/.test(compact)
  );
}

export function getChildSafeKeyword(item: Pick<LearningItem, 'content' | 'display_text' | 'type'>, keyword?: string | null) {
  const symbol = normalize(item.content);
  const candidates = [keyword, item.display_text, DEFAULT_KEYWORDS[symbol]].map((value) => normalize(value));
  const safe = candidates.find((candidate) => candidate && !isSymbolOnlyKeyword(candidate, symbol));
  return safe || DEFAULT_KEYWORDS[symbol] || '聲音朋友';
}

export function validateQuestion(question: GeneratedQuestion): ValidationResult {
  const errors: ValidationError[] = [];
  const mode = inferMode(question);
  const symbol = normalize(question.correct_answer?.[0] ?? question.learning_item?.content);
  const keyword = getChildSafeKeyword(
    question.learning_item ?? { content: symbol, display_text: symbol, type: '' },
    question.memory_hook?.keyword
  );

  if (!question.question_text || question.question_text.trim().length === 0) {
    errors.push({ field: 'question_text', message: '題目文字不可空' });
  }

  if (question.question_text && hasBannedSymbolLoop(question.question_text)) {
    errors.push({ field: 'question_text', message: '題目不可是符號互找題' });
  }

  if (symbol && question.question_text && !question.question_text.includes(keyword) && !question.question_text.includes('聽一聽')) {
    errors.push({ field: 'question_text', message: '題目必須使用兒童可理解的 keyword' });
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

  const uniqueDistractors = Array.from(new Set(candidates)).slice(0, 3);
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
