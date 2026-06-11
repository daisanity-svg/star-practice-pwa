import { supabase } from '@/lib/supabase';
import type { GeneratedQuestion, LearningItem } from '@/lib/types';
import { isPracticeTestMode } from '@/lib/config/app-mode';
import {
  SAFE_QUESTION_TEMPLATES,
  buildSafeDistractors,
  pickTemplate,
  renderTemplate,
  validateQuestion
} from '@/lib/services/question-validator';

const DEFAULT_CHILD_NAME = '星見';
const TOTAL_QUESTIONS = 5;
const DEFAULT_COUNTS = {
  new_item_count: 2,
  review_item_count: 2,
  weakness_item_count: 1
};

type SafePracticeMode = keyof typeof SAFE_QUESTION_TEMPLATES;

type LearningItemRow = LearningItem & {
  difficulty: number | null;
};

type MemoryHookRow = {
  id: string;
  learning_item_id: string;
  keyword: string;
  sentence: string | null;
  is_primary: boolean | null;
  difficulty_level: number | null;
  usage_stage: string | null;
  image_url?: string | null;
};

type ProgressRow = {
  learning_item_id: string;
  mastery_level: number;
  is_weakness: boolean;
  next_review_at: string | null;
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function uniqueById<T extends { id: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function isEnglishType(type: string) {
  return type.includes('english');
}

function isBopomofoType(type: string) {
  return type.includes('bopomofo');
}

function inferModeFromText(questionText: string): SafePracticeMode {
  if (questionText.includes('描') || questionText.includes('畫')) return 'tracing';
  if (questionText.includes('聽') || questionText.includes('耳朵') || questionText.includes('聲音')) return 'listening';
  return 'choice';
}

function selectPracticeMode(index: number, masteryLevel: number): SafePracticeMode {
  if (index === 0 || masteryLevel <= 1) return 'choice';
  if (index % 5 === 4) return 'tracing';
  if (index % 3 === 1) return 'listening';
  return 'choice';
}

function selectHook(item: LearningItemRow, hooks: MemoryHookRow[], masteryLevel: number) {
  const itemHooks = hooks.filter((hook) => hook.learning_item_id === item.id && hook.keyword?.trim());
  if (!itemHooks.length) return null;

  if (masteryLevel <= 1) {
    return itemHooks.find((hook) => hook.is_primary) ?? itemHooks[0];
  }

  return shuffle(itemHooks)[0];
}

async function ensureDefaultChild() {
  const { data: existing } = await supabase!
    .from('children')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing?.id) return existing.id as string;

  const { data: created, error } = await supabase!
    .from('children')
    .insert({ name: DEFAULT_CHILD_NAME })
    .select('id')
    .single();

  if (error || !created?.id) throw new Error(error?.message ?? '無法建立預設孩子資料');
  return created.id as string;
}

async function getActiveRewardPackIdWithStock() {
  const today = todayKey();
  const { data: packs, error } = await supabase!
    .from('reward_packs')
    .select('id, created_at')
    .eq('is_active', true)
    .or(`start_date.is.null,start_date.lte.${today}`)
    .or(`end_date.is.null,end_date.gte.${today}`)
    .order('created_at', { ascending: false });

  if (error || !packs?.length) return null;

  for (const pack of packs) {
    const { count } = await supabase!
      .from('reward_pack_items')
      .select('id', { count: 'exact', head: true })
      .eq('reward_pack_id', pack.id)
      .eq('is_active', true)
      .gt('stock', 0);

    if ((count ?? 0) > 0) return pack.id as string;
  }

  return null;
}

async function getOrCreateTodayPlan(childId: string) {
  const today = todayKey();
  const { data: existing } = await supabase!
    .from('daily_learning_plan')
    .select('*')
    .eq('child_id', childId)
    .eq('date', today)
    .maybeSingle();

  const rewardPackId = await getActiveRewardPackIdWithStock();

  if (existing?.id) {
    const updatePayload: Record<string, unknown> = {};

    if (isPracticeTestMode() && existing.is_completed) {
      updatePayload.is_completed = false;
      updatePayload.completed_at = null;
    }

    if (!existing.reward_pack_id && rewardPackId) {
      updatePayload.reward_pack_id = rewardPackId;
    }

    if (Object.keys(updatePayload).length) {
      const { data: updated } = await supabase!
        .from('daily_learning_plan')
        .update(updatePayload)
        .eq('id', existing.id)
        .select('*')
        .single();

      return updated ?? existing;
    }

    return existing;
  }

  const { data: created, error } = await supabase!
    .from('daily_learning_plan')
    .insert({
      child_id: childId,
      date: today,
      ...DEFAULT_COUNTS,
      total_required_questions: TOTAL_QUESTIONS,
      reward_pack_id: rewardPackId
    })
    .select('*')
    .single();

  if (error || !created?.id) throw new Error(error?.message ?? '無法建立今日任務');
  return created;
}

async function getPendingQuestions(planId: string): Promise<GeneratedQuestion[]> {
  const { data, error } = await supabase!
    .from('generated_questions')
    .select(`
      id,
      daily_learning_plan_id,
      child_id,
      learning_item_id,
      memory_hook_id,
      question_template_id,
      question_text,
      options,
      correct_answer,
      order_index,
      status,
      learning_items(id, content, display_text, type),
      learning_memory_hooks(id, keyword, sentence, image_url)
    `)
    .eq('daily_learning_plan_id', planId)
    .neq('status', 'completed')
    .order('order_index', { ascending: true });

  if (error) return [];

  return (data ?? []).map((row: any) => ({
    id: row.id,
    daily_learning_plan_id: row.daily_learning_plan_id,
    child_id: row.child_id,
    learning_item_id: row.learning_item_id,
    memory_hook_id: row.memory_hook_id,
    question_template_id: row.question_template_id,
    question_text: row.question_text,
    options: Array.isArray(row.options) ? row.options : [],
    correct_answer: Array.isArray(row.correct_answer) ? row.correct_answer : [],
    order_index: row.order_index,
    practice_mode: inferModeFromText(row.question_text),
    learning_item: row.learning_items ?? null,
    memory_hook: row.learning_memory_hooks ?? null
  }));
}

async function fetchGenerationSource(childId: string) {
  const now = new Date().toISOString();
  const [itemsResult, hooksResult, progressResult] = await Promise.all([
    supabase!.from('learning_items').select('id, type, content, display_text, difficulty').eq('is_active', true).order('created_at', { ascending: true }),
    supabase!.from('learning_memory_hooks').select('id, learning_item_id, keyword, sentence, is_primary, difficulty_level, usage_stage, image_url').eq('is_active', true),
    supabase!.from('child_learning_progress').select('learning_item_id, mastery_level, is_weakness, next_review_at').eq('child_id', childId)
  ]);

  const items = ((itemsResult.data ?? []) as LearningItemRow[])
    .filter((item) => item.content?.trim())
    .filter((item) => isEnglishType(item.type) || isBopomofoType(item.type));
  const hooks = (hooksResult.data ?? []) as MemoryHookRow[];
  const progress = (progressResult.data ?? []) as ProgressRow[];

  const progressByItem = new Map(progress.map((item) => [item.learning_item_id, item]));
  const weaknessItems = items.filter((item) => progressByItem.get(item.id)?.is_weakness);
  const reviewItems = items.filter((item) => {
    const itemProgress = progressByItem.get(item.id);
    return itemProgress?.next_review_at && itemProgress.next_review_at <= now && !itemProgress.is_weakness;
  });
  const newItems = items.filter((item) => !progressByItem.has(item.id));
  const fallbackItems = items.filter((item) => !weaknessItems.includes(item) && !reviewItems.includes(item) && !newItems.includes(item));

  return { items, hooks, progressByItem, weaknessItems, reviewItems, newItems, fallbackItems };
}

async function getNextOrderIndex(planId: string) {
  const { data } = await supabase!
    .from('generated_questions')
    .select('order_index')
    .eq('daily_learning_plan_id', planId)
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle();

  return Number(data?.order_index ?? 0) + 1;
}

function buildQuestionRows(params: {
  childId: string;
  planId: string;
  selectedItems: LearningItemRow[];
  hooks: MemoryHookRow[];
  allItems: LearningItemRow[];
  progressByItem: Map<string, ProgressRow>;
  firstOrderIndex: number;
}) {
  return params.selectedItems
    .map((item, index) => {
      const masteryLevel = params.progressByItem.get(item.id)?.mastery_level ?? 0;
      const hook = selectHook(item, params.hooks, masteryLevel);
      const practiceMode = selectPracticeMode(index, masteryLevel);
      const orderIndex = params.firstOrderIndex + index;
      const template = pickTemplate(practiceMode, orderIndex);
      const questionText = renderTemplate(template, item, hook?.keyword);
      const options = practiceMode === 'tracing' ? [item.content] : buildSafeDistractors(item.content, item.type, params.allItems);

      const question: GeneratedQuestion = {
        id: `pending-${item.id}-${index}`,
        daily_learning_plan_id: params.planId,
        child_id: params.childId,
        learning_item_id: item.id,
        memory_hook_id: hook?.id ?? null,
        question_template_id: null,
        question_text: questionText,
        options,
        correct_answer: [item.content],
        order_index: orderIndex,
        practice_mode: practiceMode,
        learning_item: { id: item.id, content: item.content, display_text: item.display_text, type: item.type },
        memory_hook: hook ? { id: hook.id, keyword: hook.keyword, sentence: hook.sentence, image_url: hook.image_url } : null
      };

      const validation = validateQuestion(question);
      if (!validation.valid) return null;

      return {
        daily_learning_plan_id: params.planId,
        child_id: params.childId,
        learning_item_id: item.id,
        memory_hook_id: hook?.id ?? null,
        question_template_id: null,
        question_text: questionText,
        options,
        correct_answer: [item.content],
        order_index: orderIndex,
        status: 'pending'
      };
    })
    .filter((q): q is NonNullable<typeof q> => q !== null);
}

export async function ensureTodayQuestions(): Promise<GeneratedQuestion[]> {
  if (!supabase) return [];

  const childId = await ensureDefaultChild();
  const plan = await getOrCreateTodayPlan(childId);

  if (plan.is_completed && !isPracticeTestMode()) return [];

  if (!isPracticeTestMode()) {
    const existingQuestions = await getPendingQuestions(plan.id);
    if (existingQuestions.length) return existingQuestions.slice(0, Math.min(plan.total_required_questions ?? TOTAL_QUESTIONS, TOTAL_QUESTIONS));
  }

  if (isPracticeTestMode()) {
    await supabase!.from('generated_questions').delete().eq('daily_learning_plan_id', plan.id).eq('status', 'pending');
  }

  const source = await fetchGenerationSource(childId);
  if (!source.items.length) return [];

  const selected = uniqueById([
    ...shuffle(source.weaknessItems).slice(0, plan.weakness_item_count ?? DEFAULT_COUNTS.weakness_item_count),
    ...shuffle(source.reviewItems).slice(0, plan.review_item_count ?? DEFAULT_COUNTS.review_item_count),
    ...shuffle(source.newItems).slice(0, plan.new_item_count ?? DEFAULT_COUNTS.new_item_count),
    ...shuffle(source.fallbackItems),
    ...shuffle(source.items)
  ]).slice(0, Math.min(plan.total_required_questions ?? TOTAL_QUESTIONS, TOTAL_QUESTIONS));

  const rows = buildQuestionRows({
    childId,
    planId: plan.id,
    selectedItems: selected,
    hooks: source.hooks,
    allItems: source.items,
    progressByItem: source.progressByItem,
    firstOrderIndex: await getNextOrderIndex(plan.id)
  });

  if (!rows.length) return [];

  const { error } = await supabase!.from('generated_questions').insert(rows);

  if (error) {
    console.error('Failed to auto-generate daily questions', error);
    return [];
  }

  return getPendingQuestions(plan.id);
}
