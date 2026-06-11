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
  choice: '{keyword} 的 {symbol} 在哪裡？',
  listening: '聽一聽，找出 {keyword} 的 {symbol}',
  tracing: '幫「{keyword}」的 {symbol} 描一遍'
};

export const FIXED_DISTRACTOR_POOLS = {
  bopomofo: ['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ', 'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ', 'ㄍ', 'ㄎ', 'ㄏ'],
  english: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
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
  if (question.question_text.includes('描一遍')) return 'tracing';
  if (question.question_text.includes('聽一聽')) return 'listening';
  return 'choice';
}

export function validateQuestion(question: GeneratedQuestion): ValidationResult {
  const errors: ValidationError[] = [];
  const mode = inferMode(question);

  if (!question.question_text || question.question_text.trim().length === 0) {
    errors.push({ field: 'question_text', message: '題目文字不可空' });
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

export function renderTemplate(
  template: string,
  item: LearningItem,
  keyword?: string | null
): string {
  const actualKeyword = keyword || item.display_text || item.content;
  const symbol = item.content;

  return template
    .replaceAll('{keyword}', actualKeyword)
    .replaceAll('{symbol}', symbol)
    .replaceAll('{content}', symbol)
    .replaceAll('{letter}', symbol);
}
