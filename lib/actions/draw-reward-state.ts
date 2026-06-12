'use server';

import { drawDailyReward, saveDrawnRewardToInventory } from '@/lib/actions/draw-reward';
import type { RewardDrawResult, SaveRewardResult } from '@/lib/types';

export async function drawDailyRewardFromState(
  _previousState: RewardDrawResult | null,
  formData: FormData
): Promise<RewardDrawResult> {
  return drawDailyReward(formData);
}

export async function saveDrawnRewardFromState(
  _previousState: SaveRewardResult | null,
  formData: FormData
): Promise<SaveRewardResult> {
  return saveDrawnRewardToInventory(formData);
}
