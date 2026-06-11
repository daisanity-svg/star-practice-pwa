import { supabase } from '@/lib/supabase';
import type { GeneratedQuestion } from '@/lib/types';

const DEFAULT_CHILD_NAME = '星見';
const TOTAL_QUESTIONS = 10;
const DEFAULT_COUNTS = {
  new_item_count: 3,
  review_item_count: 4,
  weakness_item_count: 3
};

type LearningItemRow = {
  id: string;
  type: string;
  content: string;
  display_text: string;
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

type QuestionTemplateRow = {
  id: string;
  type: string;
  practice_mode: string;
  template_text: string;
  instruction_audio_text: string | null;
  answer_mode: string;
  difficulty_level: number | null;
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

function renderTemplate(template: string, item: LearningItemRow, hook?: MemoryHookRow | null) {
  return template
    .replaceAll('{content}', item.content)
    .replaceAll('{letter}', item.content)
    .replaceAll('{symbol}', item.content)
    .replaceAll('{keyword}', hook?.keyword ?? item.display_text);
}

function isEnglishType(type: string) {
  return type.includes('english');
}

function buildDistractors(item: LearningItemRow, allItems: LearningItemRow[]) {
  const pool = allItems
    .filter((candidate) => candidate.id !== item.id)
    .filter((candidate) => isEnglishType(candidate.type) === isEnglishType(item.type))
    .map((candidate) => candidate.content);

  return shuffle([item.content, ...shuffle(pool).slice(0, 3)]).slice(0, 4);
}

function selectTemplate(templates: QuestionTemplateRow[], masteryLevel: number) {
  const allowedModes = masteryLevel <= 1
    ? ['choice', 'intro']
    : masteryLevel <= 3
      ? ['choice', 'listening', 'tracing']
      : ['choice', 'listening', 'tracing', 'recall'];

  const candidates = templates.filter((template) => allowedModes.includes(template.practice_mode));
  return shuffle(candidates.length ? candidates : templates)[0];
}

function selectHook(item: LearningItemRow, hooks: MemoryHookRow[], masteryLevel: number) {
  const itemHooks = hooks.filter((hook) => hook.learning_item_id === item.id);
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

async function getActiveRewardPackId() {
  const today = todayKey();
  const { data } = await supabase!
    .from('reward_packs')
    .select('id')
    .eq('is_active', true)
    .or(`start_date.is.null,start_date.lte.${today}`)
    .or(`end_date.is.null,end_date.gte.${today}`)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  return data?.id ?? null;
}

async function getOrCreateTodayPlan(childId: string) {
  const today = todayKey();
  const { data: existing } = await supabase!
    .from('daily_learning_plan')
    .select('*')
    .eq('child_id', childId)
    .eq('date', today)
    .maybeSingle();

  if (existing?.id) return existing;

  const rewardPackId = await getActiveRewardPackId();
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
      question_templates(practice_mode),
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
    practice_mode: row.question_templates?.practice_mode ?? 'choice',
    learning_item: row.learning_items ?? null,
    memory_hook: row.learning_memory_hooks ?? null
  }));
}

async function fetchGenerationSource(childId: string) {
  const now = new Date().toISOString();
  const [itemsResult, hooksResult, templatesResult, progressResult] = await Promise.all([
    supabase!.from('learning_items').select('id, type, content, display_text, difficulty').eq('is_active', true).order('created_at', { ascending: true }),
    supabase!.from('learning_memory_hooks').select('id, learning_item_id, keyword, sentence, is_primary, difficulty_level, usage_stage, image_url').eq('is_active', true),
    supabase!.from('question_templates').select('id, type, practice_mode, template_text, instruction_audio_text, answer_mode, difficulty_level').eq('is_active', true),
    supabase!.from('child_learning_progress').select('learning_item_id, mastery_level, is_weakness, next_review_at').eq('child_id', childId)
  ]);

  const items = (itemsResult.data ?? []) as LearningItemRow[];
  const hooks = (hooksResult.data ?? []) as MemoryHookRow[];
  const templates = (templatesResult.data ?? []) as QuestionTemplateRow[];
  const progress = (progressResult.data ?? []) as ProgressRow[];

  const progressByItem = new Map(progress.map((item) => [item.learning_item_id, item]));
  const weaknessItems = items.filter((item) => progressByItem.get(item.id)?.is_weakness);
  const reviewItems = items.filter((item) => {
    const itemProgress = progressByItem.get(item.id);
    return itemProgress?.next_review_at && itemProgress.next_review_at <= now && !itemProgress.is_weakness;
  });
  const newItems = items.filter((item) => !progressByItem.has(item.id));
  const fallbackItems = items.filter((item) => !weaknessItems.includes(item) && !reviewItems.includes(item) && !newItems.includes(item));

  return { items, hooks, templates, progressByItem, weaknessItems, reviewItems, newItems, fallbackItems };
}

function buildQuestionRows(params: {
  childId: string;
  planId: string;
  selectedItems: LearningItemRow[];
  hooks: MemoryHookRow[];
  templates: QuestionTemplateRow[];
  allItems: LearningItemRow[];
  progressByItem: Map<string, ProgressRow>;
}) {
  return params.selectedItems.map((item, index) => {
    const masteryLevel = params.progressByItem.get(item.id)?.mastery_level ?? 0;
    const hook = selectHook(item, params.hooks, masteryLevel);
    const template = selectTemplate(params.templates, masteryLevel);
    const practiceMode = template?.practice_mode ?? 'choice';
    const questionText = template
      ? renderTemplate(template.template_text, item, hook)
      : `${hook?.keyword ?? item.display_text} 的 ${item.content} 在哪裡？`;

    const options = practiceMode === 'tracing' || practiceMode === 'intro'
      ? [item.content]
      : buildDistractors(item, params.allItems);

    return {
      daily_learning_plan_id: params.planId,
      child_id: params.childId,
      learning_item_id: item.id,
      memory_hook_id: hook?.id ?? null,
      question_template_id: template?.id ?? null,
      question_text: questionText,
      options,
      correct_answer: [item.content],
      order_index: index + 1,
      status: 'pending'
    };
  });
}

export async function ensureTodayQuestions(): Promise<GeneratedQuestion[]> {
  if (!supabase) return [];

  const childId = await ensureDefaultChild();
  const plan = await getOrCreateTodayPlan(childId);
  if (plan.is_completed) return [];

  const existingQuestions = await getPendingQuestions(plan.id);
  if (existingQuestions.length) return existingQuestions;

  const source = await fetchGenerationSource(childId);
  if (!source.items.length || !source.templates.length) return [];

  const selected = uniqueById([
    ...shuffle(source.weaknessItems).slice(0, plan.weakness_item_count ?? DEFAULT_COUNTS.weakness_item_count),
    ...shuffle(source.reviewItems).slice(0, plan.review_item_count ?? DEFAULT_COUNTS.review_item_count),
    ...shuffle(source.newItems).slice(0, plan.new_item_count ?? DEFAULT_COUNTS.new_item_count),
    ...shuffle(source.fallbackItems),
    ...shuffle(source.items)
  ]).slice(0, plan.total_required_questions ?? TOTAL_QUESTIONS);

  const rows = buildQuestionRows({
    childId,
    planId: plan.id,
    selectedItems: selected,
    hooks: source.hooks,
    templates: source.templates,
    allItems: source.items,
    progressByItem: source.progressByItem
  });

  if (!rows.length) return [];

  const { error } = await supabase!.from('generated_questions').insert(rows);
  if (error) throw new Error(error.message);

  return getPendingQuestions(plan.id);
}
