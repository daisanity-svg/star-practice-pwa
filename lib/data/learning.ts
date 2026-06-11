import { supabase } from '@/lib/supabase';
import type { GeneratedQuestion, LearningItem, LearningProgress, MemoryHook } from '@/lib/types';

export const demoLearningItems: LearningItem[] = [
  { id: 'demo-b', type: 'bopomofo_initial', content: 'ㄅ', display_text: 'ㄅ', difficulty: 1, is_active: true },
  { id: 'demo-m', type: 'bopomofo_initial', content: 'ㄇ', display_text: 'ㄇ', difficulty: 1, is_active: true },
  { id: 'demo-a', type: 'english_uppercase', content: 'A', display_text: 'A', difficulty: 1, is_active: true }
];

export const demoMemoryHooks: MemoryHook[] = [
  { id: 'hook-b-1', learning_item_id: 'demo-b', keyword: '爸爸', sentence: '爸爸的 ㄅ', is_primary: true, usage_stage: 'intro' },
  { id: 'hook-b-2', learning_item_id: 'demo-b', keyword: '拜拜', sentence: '拜拜也有 ㄅ', is_primary: false, usage_stage: 'practice' },
  { id: 'hook-b-3', learning_item_id: 'demo-b', keyword: '抱抱', sentence: '抱抱也有 ㄅ', is_primary: false, usage_stage: 'review' },
  { id: 'hook-m-1', learning_item_id: 'demo-m', keyword: '蜜蜂', sentence: '蜜蜂的 ㄇ', is_primary: true, usage_stage: 'intro' },
  { id: 'hook-a-1', learning_item_id: 'demo-a', keyword: 'Apple', sentence: 'A is for Apple', is_primary: true, usage_stage: 'intro' }
];

export const demoGeneratedQuestions: GeneratedQuestion[] = [
  {
    id: 'q-b-choice',
    question_text: '爸爸的 ㄅ 在哪裡？',
    options: ['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ'],
    correct_answer: ['ㄅ'],
    order_index: 1,
    practice_mode: 'choice',
    learning_item: { content: 'ㄅ', display_text: 'ㄅ', type: 'bopomofo_initial' },
    memory_hook: { keyword: '爸爸', sentence: '爸爸的 ㄅ' }
  },
  {
    id: 'q-a-choice',
    question_text: 'Apple 的 A 在哪裡？',
    options: ['A', 'B', 'C', 'D'],
    correct_answer: ['A'],
    order_index: 2,
    practice_mode: 'choice',
    learning_item: { content: 'A', display_text: 'A', type: 'english_uppercase' },
    memory_hook: { keyword: 'Apple', sentence: 'A is for Apple' }
  },
  {
    id: 'q-m-choice',
    question_text: '蜜蜂的 ㄇ 在哪裡？',
    options: ['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ'],
    correct_answer: ['ㄇ'],
    order_index: 3,
    practice_mode: 'choice',
    learning_item: { content: 'ㄇ', display_text: 'ㄇ', type: 'bopomofo_initial' },
    memory_hook: { keyword: '蜜蜂', sentence: '蜜蜂的 ㄇ' }
  }
];

export const demoProgress: LearningProgress[] = [
  {
    id: 'progress-b',
    child_id: 'demo-child',
    learning_item_id: 'demo-b',
    total_attempts: 6,
    correct_attempts: 5,
    wrong_attempts: 1,
    accuracy_rate: 83,
    mastery_level: 3,
    consecutive_correct: 2,
    consecutive_wrong: 0,
    is_weakness: false,
    learning_item: { content: 'ㄅ', display_text: 'ㄅ', type: 'bopomofo_initial' }
  },
  {
    id: 'progress-m',
    child_id: 'demo-child',
    learning_item_id: 'demo-m',
    total_attempts: 5,
    correct_attempts: 2,
    wrong_attempts: 3,
    accuracy_rate: 40,
    mastery_level: 1,
    consecutive_correct: 0,
    consecutive_wrong: 2,
    is_weakness: true,
    learning_item: { content: 'ㄇ', display_text: 'ㄇ', type: 'bopomofo_initial' }
  }
];

export async function getLearningItems(): Promise<LearningItem[]> {
  if (!supabase) return demoLearningItems;

  const { data, error } = await supabase
    .from('learning_items')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error || !data?.length) return demoLearningItems;
  return data as LearningItem[];
}

export async function getMemoryHooks(): Promise<MemoryHook[]> {
  if (!supabase) return demoMemoryHooks;

  const { data, error } = await supabase
    .from('learning_memory_hooks')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error || !data?.length) return demoMemoryHooks;
  return data as MemoryHook[];
}

export async function getTodayQuestions(): Promise<GeneratedQuestion[]> {
  if (!supabase) return demoGeneratedQuestions;

  const { data, error } = await supabase
    .from('generated_questions')
    .select(`
      id,
      question_text,
      options,
      correct_answer,
      order_index,
      question_templates(practice_mode),
      learning_items(content, display_text, type),
      learning_memory_hooks(keyword, sentence, image_url)
    `)
    .order('order_index', { ascending: true })
    .limit(10);

  if (error || !data?.length) return demoGeneratedQuestions;

  return data.map((row: any) => ({
    id: row.id,
    question_text: row.question_text,
    options: Array.isArray(row.options) ? row.options : [],
    correct_answer: Array.isArray(row.correct_answer) ? row.correct_answer : [],
    order_index: row.order_index,
    practice_mode: row.question_templates?.practice_mode ?? 'choice',
    learning_item: row.learning_items ?? null,
    memory_hook: row.learning_memory_hooks ?? null
  }));
}

export async function getLearningProgress(): Promise<LearningProgress[]> {
  if (!supabase) return demoProgress;

  const { data, error } = await supabase
    .from('child_learning_progress')
    .select('*, learning_items(content, display_text, type)')
    .order('is_weakness', { ascending: false })
    .order('mastery_level', { ascending: true });

  if (error || !data?.length) return demoProgress;
  return data.map((row: any) => ({ ...row, learning_item: row.learning_items })) as LearningProgress[];
}
