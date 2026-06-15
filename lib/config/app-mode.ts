import { supabase } from '@/lib/supabase';

export type PracticeModeSetting = 'test' | 'production';

export function isPracticeTestMode(): boolean {
  const rawValue = process.env.NEXT_PUBLIC_PRACTICE_TEST_MODE ?? process.env.PRACTICE_TEST_MODE;
  return rawValue !== 'false';
}

export async function getPracticeMode(): Promise<PracticeModeSetting> {
  if (supabase) {
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'practice_mode')
      .maybeSingle();

    if (data?.value === 'test' || data?.value === 'production') return data.value;
  }

  return isPracticeTestMode() ? 'test' : 'production';
}

export async function isPracticeTestModeAsync(): Promise<boolean> {
  return (await getPracticeMode()) === 'test';
}
