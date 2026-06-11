export type LearningItemType =
  | 'english_uppercase'
  | 'english_lowercase'
  | 'english_word'
  | 'bopomofo_initial'
  | 'bopomofo_final'
  | 'bopomofo_compound'
  | 'bopomofo_tone'
  | 'bopomofo_combo';

export type PracticeMode = 'intro' | 'choice' | 'listening' | 'tracing' | 'recall' | 'classification';

export type LearningItem = {
  id: string;
  type: LearningItemType | string;
  content: string;
  display_text: string;
  audio_url?: string | null;
  trace_image_url?: string | null;
  difficulty?: number | null;
  is_active?: boolean | null;
};

export type MemoryHook = {
  id: string;
  learning_item_id: string;
  keyword: string;
  sentence?: string | null;
  image_url?: string | null;
  audio_url?: string | null;
  is_primary?: boolean | null;
  difficulty_level?: number | null;
  usage_stage?: string | null;
  is_active?: boolean | null;
};

export type GeneratedQuestion = {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string[];
  order_index: number;
  practice_mode?: PracticeMode | string;
  learning_item?: Pick<LearningItem, 'content' | 'display_text' | 'type'> | null;
  memory_hook?: Pick<MemoryHook, 'keyword' | 'sentence' | 'image_url'> | null;
};

export type LearningProgress = {
  id: string;
  child_id: string;
  learning_item_id: string;
  total_attempts: number;
  correct_attempts: number;
  wrong_attempts: number;
  accuracy_rate: number;
  mastery_level: number;
  consecutive_correct: number;
  consecutive_wrong: number;
  next_review_at?: string | null;
  is_weakness: boolean;
  learning_item?: Pick<LearningItem, 'content' | 'display_text' | 'type'> | null;
};

export type CardCollectionSummary = {
  id: string;
  name: string;
  cover_image_url?: string | null;
  owned: number;
  total: number;
};
