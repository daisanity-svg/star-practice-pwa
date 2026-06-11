import type { GeneratedQuestion, LearningItem } from '@/lib/types';

/**
 * Validates a generated question for quality and completeness
 * Ensures all required fields are present and valid
 */

type ValidationError = {
  field: string;
  message: string;
};

export type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
};

/**
 * Fixed question templates - only allow choice, listening, tracing
 * These are the safe, validated sentence structures
 */
export const SAFE_QUESTION_TEMPLATES = {
  choice: '{keyword} 的 {symbol} 在哪裡？',
  listening: '聽一聽，找出 {keyword} 的 {symbol}',
  tracing: '幫 {keyword} 的 {symbol} 描一遍'
};

/**
 * Fixed distractor pools for when database doesn't have enough
 */
export const FIXED_DISTRACTOR_POOLS = {
  bopomofo: ['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ', 'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ', 'ㄍ', 'ㄎ', 'ㄏ'],
  english: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
};

function isBopomofoType(type: string | undefined | null): boolean {
  return !type || type.includes('bopomofo');
}

function isEnglishType(type: string | undefined | null): boolean {
  return type?.includes('english') ?? false;
}

function getFixedDistractorPool(learningItemType: string | undefined | null): string[] {
  if (isEnglishType(learningItemType)) {
    return FIXED_DISTRACTOR_POOLS.english;
  }
  return FIXED_DISTRACTOR_POOLS.bopomofo;
}

/**
 * Validates a question structure
 */
export function validateQuestion(question: GeneratedQuestion): ValidationResult {
  const errors: ValidationError[] = [];

  // Check question_text
  if (!question.question_text || question.question_text.trim().length === 0) {
    errors.push({ field: 'question_text', message: '題目文字不可空' });
  }

  // Check learning_item
  if (!question.learning_item || !question.learning_item.id) {
    errors.push({ field: 'learning_item', message: '學習項目不可空' });
  }

  // Check correct_answer - must have exactly 1
  if (!Array.isArray(question.correct_answer) || question.correct_answer.length !== 1) {
    errors.push({ field: 'correct_answer', message: '正確答案必須恰好 1 個' });
  }

  // Check options - must have exactly 4
  if (!Array.isArray(question.options) || question.options.length !== 4) {
    errors.push({ field: 'options', message: '選項必須恰好 4 個' });
  }

  // Check options include correct answer
  if (Array.isArray(question.options) && Array.isArray(question.correct_answer)) {
    if (question.correct_answer.length > 0 && !question.options.includes(question.correct_answer[0])) {
      errors.push({ field: 'options', message: '選項必須包含正確答案' });
    }
  }

  // Check options are unique
  if (Array.isArray(question.options)) {
    const uniqueOptions = new Set(question.options);
    if (uniqueOptions.size !== question.options.length) {
      errors.push({ field: 'options', message: '選項不可重複' });
    }
  }

  // Type-specific validation
  const itemType = question.learning_item?.type;
  if (isBopomofoType(itemType)) {
    // Bopomofo questions can only have bopomofo options
    if (Array.isArray(question.options)) {
      const hasNonBopomofo = question.options.some((opt) => /[a-zA-Z]/.test(opt));
      if (hasNonBopomofo) {
        errors.push({ field: 'options', message: '注音題只能混注音' });
      }
    }
  } else if (isEnglishType(itemType)) {
    // English questions can only have English options
    if (Array.isArray(question.options)) {
      const hasNonEnglish = question.options.some((opt) => !/^[a-zA-Z]$/.test(opt));
      if (hasNonEnglish) {
        errors.push({ field: 'options', message: '英文題只能混英文' });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Builds safe distractors with fallback to fixed pools
 */
export function buildSafeDistractors(
  correctAnswer: string,
  learningItemType: string | undefined | null,
  allItems?: LearningItem[]
): string[] {
  const fixedPool = getFixedDistractorPool(learningItemType);

  // Try to use all items from database first
  let distractors: string[] = [];

  if (allItems && allItems.length > 0) {
    // Filter to same type
    const sameType = allItems
      .filter((item) => {
        if (isEnglishType(learningItemType)) {
          return isEnglishType(item.type);
        }
        return isBopomofoType(item.type);
      })
      .map((item) => item.content)
      .filter((content) => content !== correctAnswer);

    distractors = sameType.slice(0, 3);
  }

  // Fill remaining with fixed pool
  while (distractors.length < 3) {
    const candidate = fixedPool[Math.floor(Math.random() * fixedPool.length)];
    if (!distractors.includes(candidate) && candidate !== correctAnswer) {
      distractors.push(candidate);
    }
  }

  // Build options: [correct, distractor1, distractor2, distractor3] then shuffle
  const options = [correctAnswer, ...distractors.slice(0, 3)];

  // Simple shuffle
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return options;
}

/**
 * Renders template with safe variable substitution
 */
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
