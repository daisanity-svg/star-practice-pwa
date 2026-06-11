'use server';

import { drawDailyReward } from '@/lib/actions/draw-reward';
import type { DrawRewardResult } from '@/lib/types';

export async function drawDailyRewardFromState(
  _previousState: DrawRewardResult | null,
  formData: FormData
): Promise<DrawRewardResult> {
  return drawDailyReward(formData);
}
