import { supabase } from '@/lib/supabase';

export type QuestionTemplate = {
  id: string;
  type: string;
  practice_mode: string;
  template_text: string;
  instruction_audio_text?: string | null;
  answer_mode: string;
  difficulty_level: number;
  is_active: boolean;
};

export const demoQuestionTemplates: QuestionTemplate[] = [
  {
    id: 'template-intro-bopomofo',
    type: 'bopomofo',
    practice_mode: 'intro',
    template_text: '{content} 是 {keyword} 的 {content}',
    instruction_audio_text: '一起認識 {keyword} 的 {content}',
    answer_mode: 'display',
    difficulty_level: 1,
    is_active: true
  },
  {
    id: 'template-choice-bopomofo',
    type: 'bopomofo',
    practice_mode: 'choice',
    template_text: '{keyword} 的 {content} 在哪裡？',
    instruction_audio_text: '找找看，{keyword} 的 {content}',
    answer_mode: 'single_choice',
    difficulty_level: 1,
    is_active: true
  },
  {
    id: 'template-tracing',
    type: 'all',
    practice_mode: 'tracing',
    template_text: '幫 {keyword} 的 {content} 描一遍',
    instruction_audio_text: '用手指描描看',
    answer_mode: 'tracing',
    difficulty_level: 2,
    is_active: true
  }
];

export async function getQuestionTemplates(): Promise<QuestionTemplate[]> {
  if (!supabase) return demoQuestionTemplates;

  const { data, error } = await supabase
    .from('question_templates')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error || !data?.length) return demoQuestionTemplates;
  return data as QuestionTemplate[];
}
