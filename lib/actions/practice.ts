'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import type { PracticeCompletionResult, SubmittedPracticeAnswer } from '@/lib/types';

const allowedPracticeModes = new Set(['intro', 'choice', 'listening', 'tracing', 'recall', 'sorting']);

function normalizePracticeMode(mode?: string | null) {
  if (!mode) return 'choice';
  if (mode === 'classification') return 'sorting';
  return allowedPracticeModes.has(mode) ? mode : 'choice';
}

async function getDefaultChildId() {
  const { data, error } = await supabase!
    .from('children')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data?.id) return null;
  return data.id as string;
}

export async function completePracticeSession(
  answers: SubmittedPracticeAnswer[]
): Promise<PracticeCompletionResult> {
  if (!answers.length) {
    return { ok: false, message: '目前沒有作答資料，請先完成練習。' };
  }

  if (!supabase) {
    const correctCount = answers.filter((answer) => answer.is_correct).length;
    return {
      ok: true,
      message: '示範模式已完成今日練習，可以前往領取獎勵。',
      demo: true,
      practice_record_id: 'demo-practice-record',
      total_questions: answers.length,
      correct_count: correctCount,
      wrong_count: answers.length - correctCount,
      reward_available: true
    };
  }

  const childId = answers[0]?.child_id || (await getDefaultChildId());
  if (!childId) {
    return { ok: false, message: '尚未建立孩子資料，請先到 Supabase seed 或後台新增孩子。' };
  }

  const validAnswers = answers.filter((answer) => answer.learning_item_id);
  if (!validAnswers.length) {
    return { ok: false, message: '題目資料不完整，無法寫入練習紀錄。' };
  }

  const correctCount = validAnswers.filter((answer) => answer.is_correct).length;
  const wrongCount = validAnswers.length - correctCount;

  const { data: record, error: recordError } = await supabase
    .from('practice_records')
    .insert({
      child_id: childId,
      practice_type: 'daily',
      total_questions: validAnswers.length,
      correct_count: correctCount,
      wrong_count: wrongCount,
      completed: true,
      completed_at: new Date().toISOString(),
      reward_claimed: false
    })
    .select('id')
    .single();

  if (recordError || !record?.id) {
    return { ok: false, message: `建立練習總紀錄失敗：${recordError?.message ?? '未知錯誤'}` };
  }

  const attempts = validAnswers.map((answer) => ({
    child_id: childId,
    learning_item_id: answer.learning_item_id,
    memory_hook_id: answer.memory_hook_id || null,
    practice_record_id: record.id,
    generated_question_id: answer.generated_question_id || null,
    practice_mode: normalizePracticeMode(answer.practice_mode),
    is_correct: answer.is_correct,
    score: answer.score ?? (answer.is_correct ? 100 : 0),
    time_spent_seconds: Math.max(0, Math.round(answer.time_spent_seconds ?? 0)),
    mistake_type: answer.is_correct ? null : answer.mistake_type || 'wrong_choice'
  }));

  const { error: attemptsError } = await supabase.from('practice_attempts').insert(attempts);
  if (attemptsError) {
    return { ok: false, message: `寫入作答紀錄失敗：${attemptsError.message}` };
  }

  const questionIds = validAnswers.map((answer) => answer.generated_question_id).filter(Boolean) as string[];
  if (questionIds.length) {
    await supabase.from('generated_questions').update({ status: 'completed' }).in('id', questionIds);
  }

  revalidatePath('/practice');
  revalidatePath('/reward');
  revalidatePath('/parent/dashboard');
  revalidatePath('/parent/progress');

  return {
    ok: true,
    message: '今日練習完成，可以前往領取獎勵。',
    practice_record_id: record.id,
    total_questions: validAnswers.length,
    correct_count: correctCount,
    wrong_count: wrongCount,
    reward_available: true
  };
}
