'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import type { PracticeCompletionResult, SubmittedPracticeAnswer } from '@/lib/types';
import { isPracticeTestModeAsync } from '@/lib/config/app-mode';

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

async function resolvePlanAndPack(validAnswers: SubmittedPracticeAnswer[]) {
  const explicitPlanId = validAnswers.find((answer) => answer.daily_learning_plan_id)?.daily_learning_plan_id ?? null;
  let dailyLearningPlanId = explicitPlanId;
  let rewardPackId: string | null = null;

  if (!dailyLearningPlanId) {
    const questionIds = validAnswers.map((answer) => answer.generated_question_id).filter(Boolean) as string[];
    if (questionIds.length) {
      const { data: firstQuestion } = await supabase!
        .from('generated_questions')
        .select('daily_learning_plan_id')
        .eq('id', questionIds[0])
        .maybeSingle();

      dailyLearningPlanId = firstQuestion?.daily_learning_plan_id ?? null;
    }
  }

  if (dailyLearningPlanId) {
    const { data: planData } = await supabase!
      .from('daily_learning_plan')
      .select('reward_pack_id')
      .eq('id', dailyLearningPlanId)
      .maybeSingle();

    rewardPackId = planData?.reward_pack_id ?? null;
  }

  return { dailyLearningPlanId, rewardPackId };
}

async function insertPracticeRecord(params: {
  childId: string;
  dailyLearningPlanId: string | null;
  rewardPackId: string | null;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
}) {
  const basePayload = {
    child_id: params.childId,
    practice_type: 'daily',
    total_questions: params.totalQuestions,
    correct_count: params.correctCount,
    wrong_count: params.wrongCount,
    completed: true,
    completed_at: new Date().toISOString(),
    reward_claimed: false
  };

  const extendedPayload = {
    ...basePayload,
    daily_learning_plan_id: params.dailyLearningPlanId,
    reward_pack_id: params.rewardPackId
  };

  const extendedResult = await supabase!
    .from('practice_records')
    .insert(extendedPayload)
    .select('id')
    .single();

  if (!extendedResult.error && extendedResult.data?.id) {
    return { record: extendedResult.data, error: null };
  }

  const shouldFallback = extendedResult.error?.message?.includes('daily_learning_plan_id') || extendedResult.error?.message?.includes('reward_pack_id');
  if (!shouldFallback) {
    return { record: null, error: extendedResult.error };
  }

  const fallbackResult = await supabase!
    .from('practice_records')
    .insert(basePayload)
    .select('id')
    .single();

  return { record: fallbackResult.data, error: fallbackResult.error };
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
      message: '示範模式已完成練習，可以前往領取獎勵。',
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

  const testMode = await isPracticeTestModeAsync();
  const correctCount = validAnswers.filter((answer) => answer.is_correct).length;
  const wrongCount = validAnswers.length - correctCount;
  const { dailyLearningPlanId, rewardPackId } = await resolvePlanAndPack(validAnswers);

  const { record, error: recordError } = await insertPracticeRecord({
    childId,
    dailyLearningPlanId,
    rewardPackId,
    totalQuestions: validAnswers.length,
    correctCount,
    wrongCount
  });

  if (recordError || !record?.id) {
    return { ok: false, message: `建立練習總紀錄失敗：${recordError?.message ?? '未知錯誤'}` };
  }

  const questionIds = validAnswers.map((answer) => answer.generated_question_id).filter(Boolean) as string[];
  const existingQuestionIds = new Set<string>();
  if (questionIds.length) {
    const { data: existingQuestions } = await supabase
      .from('generated_questions')
      .select('id')
      .in('id', questionIds);

    existingQuestions?.forEach((question) => {
      if (question.id) existingQuestionIds.add(question.id as string);
    });
  }

  const attempts = validAnswers.map((answer) => {
    const generatedQuestionId = answer.generated_question_id && existingQuestionIds.has(answer.generated_question_id)
      ? answer.generated_question_id
      : null;

    return {
      child_id: childId,
      learning_item_id: answer.learning_item_id,
      memory_hook_id: answer.memory_hook_id || null,
      practice_record_id: record.id,
      generated_question_id: generatedQuestionId,
      practice_mode: normalizePracticeMode(answer.practice_mode),
      is_correct: answer.is_correct,
      score: answer.score ?? (answer.is_correct ? 100 : 0),
      time_spent_seconds: Math.max(0, Math.round(answer.time_spent_seconds ?? 0)),
      mistake_type: answer.is_correct ? null : answer.mistake_type || 'wrong_choice'
    };
  });

  const { error: attemptsError } = await supabase.from('practice_attempts').insert(attempts);
  if (attemptsError) {
    return { ok: false, message: `寫入作答紀錄失敗：${attemptsError.message}` };
  }

  if (existingQuestionIds.size) {
    await supabase.from('generated_questions').update({ status: 'completed' }).in('id', Array.from(existingQuestionIds));
  }

  if (!testMode) {
    await markDailyPlanComplete(dailyLearningPlanId);
  }

  revalidatePath('/');
  revalidatePath('/practice');
  revalidatePath('/reward');
  revalidatePath('/parent/dashboard');
  revalidatePath('/parent/progress');

  return {
    ok: true,
    message: rewardPackId ? '練習完成，可以打開今天的卡包。' : '練習完成，可以前往領取獎勵。',
    practice_record_id: record.id,
    total_questions: validAnswers.length,
    correct_count: correctCount,
    wrong_count: wrongCount,
    reward_available: true
  };
}
