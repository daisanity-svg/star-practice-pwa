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

async function markDailyPlanComplete(planId: string | null) {
  if (!planId) return;

  await supabase!
    .from('daily_learning_plan')
    .update({ is_completed: true, completed_at: new Date().toISOString() })
    .eq('id', planId);
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

  // 獲取 daily_learning_plan_id 與 reward_pack_id
  let dailyLearningPlanId: string | null = null;
  let rewardPackId: string | null = null;

  const explicitPlanId = validAnswers.find((answer) => answer.daily_learning_plan_id)?.daily_learning_plan_id ?? null;
  if (explicitPlanId) {
    dailyLearningPlanId = explicitPlanId;
    // 從 daily_learning_plan 取 reward_pack_id
    const { data: planData } = await supabase
      .from('daily_learning_plan')
      .select('reward_pack_id')
      .eq('id', explicitPlanId)
      .maybeSingle();
    rewardPackId = planData?.reward_pack_id ?? null;
  } else {
    const questionIds = validAnswers.map((answer) => answer.generated_question_id).filter(Boolean) as string[];
    if (questionIds.length) {
      const { data: firstQuestion } = await supabase
        .from('generated_questions')
        .select('daily_learning_plan_id')
        .eq('id', questionIds[0])
        .maybeSingle();
      dailyLearningPlanId = firstQuestion?.daily_learning_plan_id ?? null;

      if (dailyLearningPlanId) {
        const { data: planData } = await supabase
          .from('daily_learning_plan')
          .select('reward_pack_id')
          .eq('id', dailyLearningPlanId)
          .maybeSingle();
        rewardPackId = planData?.reward_pack_id ?? null;
      }
    }
  }

  const { data: record, error: recordError } = await supabase
    .from('practice_records')
    .insert({
      child_id: childId,
      daily_learning_plan_id: dailyLearningPlanId,
      reward_pack_id: rewardPackId,
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

  if (explicitPlanId) {
    await markDailyPlanComplete(explicitPlanId);
  } else if (questionIds.length && dailyLearningPlanId) {
    await markDailyPlanComplete(dailyLearningPlanId);
  }

  revalidatePath('/');
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
