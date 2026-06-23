'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import type { RewardCard, SaveRewardResult } from '@/lib/types';

const demoCard: RewardCard = {
  id: 'demo-red-car',
  name: '紅色小車',
  card_no: 'CAR-001',
  rarity: 'rare',
  source_image_url: null,
  rendered_card_image_url: null,
  series: { id: 'cars', name: '小車系列' },
  category: { id: 'cars-main', name: '小車' }
};

type DrawLogRow = {
  id: string;
  child_id: string;
  reward_pack_id: string | null;
  card_id: string;
  practice_record_id: string | null;
  cards: RewardCard | null;
};

async function addCardToInventory(params: {
  childId: string;
  cardId: string;
  rewardPackId: string | null;
  practiceRecordId: string | null;
}) {
  const client = supabase;
  if (!client) {
    return { ok: false as const, isNew: false, message: 'Supabase 尚未連線。' };
  }

  const { childId, cardId, rewardPackId, practiceRecordId } = params;

  const { data: existingInventory } = await client
    .from('child_card_inventory')
    .select('id, quantity')
    .eq('child_id', childId)
    .eq('card_id', cardId)
    .maybeSingle();

  const isNew = !existingInventory;

  if (existingInventory?.id) {
    const { error: updateInventoryError } = await client
      .from('child_card_inventory')
      .update({
        quantity: Number(existingInventory.quantity ?? 1) + 1,
        obtained_at: new Date().toISOString(),
        obtained_from_pack_id: rewardPackId,
        obtained_from_practice_record_id: practiceRecordId
      })
      .eq('id', existingInventory.id);

    if (updateInventoryError) {
      return { ok: false as const, isNew, message: `更新收納包失敗：${updateInventoryError.message}` };
    }
  } else {
    const { error: insertInventoryError } = await client.from('child_card_inventory').insert({
      child_id: childId,
      card_id: cardId,
      quantity: 1,
      obtained_from_pack_id: rewardPackId,
      obtained_from_practice_record_id: practiceRecordId
    });

    if (insertInventoryError) {
      return { ok: false as const, isNew, message: `新增收納包失敗：${insertInventoryError.message}` };
    }
  }

  return { ok: true as const, isNew };
}

export async function saveDrawnRewardToInventory(formData?: FormData): Promise<SaveRewardResult> {
  try {
    const client = supabase;
    if (!client) {
      return {
        ok: true,
        message: '測試卡已儲存到收納包。',
        card: demoCard,
        is_new: true,
        saved_to_inventory: true,
        demo: true
      };
    }

    const drawLogId = formData?.get('draw_log_id')?.toString() || null;
    if (!drawLogId) {
      return { ok: false, message: '找不到抽卡紀錄，請重新打開卡包。' };
    }

    const { data, error } = await client
      .from('reward_draw_logs')
      .select(
        `
        id,
        child_id,
        reward_pack_id,
        card_id,
        practice_record_id,
        cards:cards(
          id,
          name,
          card_no,
          rarity,
          source_image_url,
          rendered_card_image_url,
          description,
          series:card_series(id, name),
          category:card_categories(id, name)
        )
      `
      )
      .eq('id', drawLogId)
      .maybeSingle();

    if (error || !data?.id) {
      return { ok: false, message: '找不到這次抽到的卡，請重新抽一次。' };
    }

    const row = data as unknown as DrawLogRow;
    const inventoryResult = await addCardToInventory({
      childId: row.child_id,
      cardId: row.card_id,
      rewardPackId: row.reward_pack_id,
      practiceRecordId: row.practice_record_id
    });

    if (!inventoryResult.ok) {
      console.error('[saveDrawnRewardToInventory] 儲存到收納包失敗', { drawLogId, inventoryResult });
      return { ok: false, message: '儲存到圖鑑失敗，請再試一次。' };
    }

    try { revalidatePath('/collection'); } catch (e) { console.error('[saveDrawnRewardToInventory] revalidatePath /collection failed', e); }
    try { revalidatePath('/'); } catch (e) { console.error('[saveDrawnRewardToInventory] revalidatePath / failed', e); }
    try { revalidatePath('/parent/dashboard'); } catch (e) { console.error('[saveDrawnRewardToInventory] revalidatePath /parent/dashboard failed', e); }

    return {
      ok: true,
      message: inventoryResult.isNew ? '已儲存到收納包！之後可以隨時回來看。' : '收納包裡又多了一張同款卡！',
      card: row.cards ?? undefined,
      is_new: inventoryResult.isNew,
      saved_to_inventory: true
    };
  } catch (error) {
    console.error('[saveDrawnRewardToInventory] 未預期錯誤', error);
    return { ok: false, message: '儲存到圖鑑時發生未預期錯誤，請再試一次。' };
  }
}
