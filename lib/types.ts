export type LearningItemType =
  | 'english_uppercase'
  | 'english_lowercase'
  | 'english_word'
  | 'bopomofo_initial'
  | 'bopomofo_final'
  | 'bopomofo_compound'
  | 'bopomofo_tone'
  | 'bopomofo_combo';

export type PracticeMode = 'intro' | 'choice' | 'listening' | 'tracing' | 'recall' | 'classification' | 'sorting';

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
  child_id?: string | null;
  learning_item_id?: string | null;
  memory_hook_id?: string | null;
  question_template_id?: string | null;
  question_text: string;
  options: string[];
  correct_answer: string[];
  order_index: number;
  practice_mode?: PracticeMode | string;
  learning_item?: Pick<LearningItem, 'id' | 'content' | 'display_text' | 'type'> | null;
  memory_hook?: Pick<MemoryHook, 'id' | 'keyword' | 'sentence' | 'image_url'> | null;
};

export type SubmittedPracticeAnswer = {
  child_id?: string | null;
  generated_question_id?: string | null;
  learning_item_id?: string | null;
  memory_hook_id?: string | null;
  practice_mode?: PracticeMode | string;
  selected_answer?: string | string[] | null;
  correct_answer?: string[];
  is_correct: boolean;
  score?: number;
  time_spent_seconds?: number;
  mistake_type?: string | null;
};

export type PracticeCompletionResult = {
  ok: boolean;
  message: string;
  practice_record_id?: string;
  total_questions?: number;
  correct_count?: number;
  wrong_count?: number;
  reward_available?: boolean;
  demo?: boolean;
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

export type RewardCard = {
  id: string;
  name: string;
  card_no?: string | null;
  rarity: 'common' | 'rare' | 'super_rare' | 'legendary' | string;
  source_image_url?: string | null;
  rendered_card_image_url?: string | null;
  description?: string | null;
  series?: {
    id: string;
    name: string;
  } | null;
  category?: {
    id: string;
    name: string;
  } | null;
};

export type ChildCardInventoryItem = {
  id: string;
  quantity: number;
  obtained_at: string;
  card: RewardCard | null;
};

export type DrawRewardResult = {
  ok: boolean;
  message: string;
  card?: RewardCard;
  is_new?: boolean;
  remaining_stock?: number;
  demo?: boolean;
};
