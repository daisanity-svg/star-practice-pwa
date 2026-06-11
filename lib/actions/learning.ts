'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === 'string' ? raw.trim() : '';
}

function nullableValue(formData: FormData, key: string) {
  const text = value(formData, key);
  return text.length > 0 ? text : null;
}

export async function createLearningItem(formData: FormData) {
  if (!supabase) return;

  const type = value(formData, 'type');
  const content = value(formData, 'content');
  const displayText = value(formData, 'display_text') || content;
  const difficulty = Number(value(formData, 'difficulty') || '1');

  if (!type || !content) return;

  await supabase.from('learning_items').insert({
    type,
    content,
    display_text: displayText,
    difficulty,
    is_active: true
  });

  revalidatePath('/parent/learning');
  revalidatePath('/practice');
}

export async function createMemoryHook(formData: FormData) {
  if (!supabase) return;

  const learningItemId = value(formData, 'learning_item_id');
  const keyword = value(formData, 'keyword');

  if (!learningItemId || !keyword) return;

  await supabase.from('learning_memory_hooks').insert({
    learning_item_id: learningItemId,
    keyword,
    sentence: nullableValue(formData, 'sentence'),
    image_url: nullableValue(formData, 'image_url'),
    audio_url: nullableValue(formData, 'audio_url'),
    is_primary: value(formData, 'is_primary') === 'on',
    difficulty_level: Number(value(formData, 'difficulty_level') || '1'),
    usage_stage: value(formData, 'usage_stage') || 'practice',
    is_active: true
  });

  revalidatePath('/parent/learning');
  revalidatePath('/practice');
}

export async function createQuestionTemplate(formData: FormData) {
  if (!supabase) return;

  const type = value(formData, 'type');
  const practiceMode = value(formData, 'practice_mode');
  const templateText = value(formData, 'template_text');

  if (!type || !practiceMode || !templateText) return;

  await supabase.from('question_templates').insert({
    type,
    practice_mode: practiceMode,
    template_text: templateText,
    instruction_audio_text: nullableValue(formData, 'instruction_audio_text'),
    answer_mode: value(formData, 'answer_mode') || 'single_choice',
    difficulty_level: Number(value(formData, 'difficulty_level') || '1'),
    is_active: true
  });

  revalidatePath('/parent/templates');
  revalidatePath('/practice');
}
