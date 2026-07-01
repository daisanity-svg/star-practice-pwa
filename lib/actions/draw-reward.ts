'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import type { RewardDrawResult, RewardCard, SaveRewardResult } from '@/lib/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isPracticeTestModeAsync } from '@/lib/config/app-mode';
import { getDailyOverrideCardId } from '@/lib/data/admin-rewards';
import { getTaipeiTodayString } from '@/lib/utils/timezone';

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

type PackItemRow = {
  id: string;
  stock: number;
  weight: number;
  reward_pack_id: string;
  card_id: string;
  cards: RewardCard | null;
};

type ScheduledRewardRow = {
  id: string;
  card_id: string;
  reward_pack_id: string | null;
  reason: string | null;
  cards: RewardCard | null;
};

type DrawLogRow = {
  id: string;
  child_id: string;
  reward_pack_id: string | null;
  card_id: string;
  practice_record_id: string | null;
  cards: RewardCard | null;
};

function pickWeightedItem(items: PackItemRow[]) {
  const totalWeight = items.reduce((sum, item) => sum + Math.max(item.weight, 0), 0);
  if (totalWeight <= 0) return items[0];
  let cursor = Math.random() * totalWeight;
  for (const item of items) {
    cursor -= Math.max(item.weight, 0);
    if (cursor <= 0) return item;
  }
  return items[items.length - 1];
}

async function getDefaultChildId() {
  const client = supabase;
  if (!client) return null;
  const { data, error } = await client
    .from('children')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error || !data?.id) return null;
  return data.id as string;
}

async function getActiveRewardPackIdWithStock() {
  const client = supabase;
  if (!client) return null;
  const today = getTaipeiTodayString();
  const { data, error } = await client
    .from('reward_packs')
    .select('id, created_at')
    .eq('is_active', true)
    .or(`start_date.is.null,start_date.lte.${today}`)
    .or(`end_date.is.null,end_date.gte.${today}`)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error || !data?.id) return null;
  return data.id as string;
}

async function buildPendingCardIdFilter(client: SupabaseClient, childId: string) {
  const { data: ownedRows } = await client
    .from('child_card_inventory')
    .select('card_id')
    .eq('child_id', childId);
  const ids = (ownedRows ?? []).map((row: { card_id?: string | null }) => row.card_id).filter((id: string | null | undefined): id is string => Boolean(id));
  return ids.join(',');
}

function pickRandomCard(cards: Array<Pick<RewardCard, 'id' | 'name' | 'card_no' | 'rarity' | 'source_image_url' | 'rendered_card_image_url' | 'description' | 'series' | 'category'>>) {
  if (!cards.length) return null;
  const index = Math.floor(Math.random() * cards.length);
  return cards[index];
}

async function addCardToInventory(params: { childId: string; cardId: string; rewardPackId: string | null; practiceRecordId: string | null }) {
  const client = supabase;
  if (!client) return { ok: false as const, isNew: false, message: 'Supabase 尚未連線。' };
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
      .update({ quantity: Number(existingInventory.quantity ?? 1) + 1, obtained_at: new Date().toISOString(), obtained_from_pack_id: rewardPackId, obtained_from_practice_record_id: practiceRecordId })
      .eq('id', existingInventory.id);
    if (updateInventoryError) return { ok: false as const, isNew, message: `更新收納包失敗：${updateInventoryError.message}` };
  } else {
    const { error: insertInventoryError } = await client.from('child_card_inventory').insert({ child_id: childId, card_id: cardId, quantity: 1, obtained_from_pack_id: rewardPackId, obtained_from_practice_record_id: practiceRecordId });
    if (insertInventoryError) return { ok: false as const, isNew, message: `新增收納包失敗：${insertInventoryError.message}` };
  }
  return { ok: true as const, isNew };
}

async function getScheduledReward(childId: string) {
  const client = supabase;
  if (!client) return null;
  const today = getTaipeiTodayString();
  const { data, error } = await client
    .from('scheduled_rewards')
    .select(`id, card_id, reward_pack_id, reason, cards:cards(id, name, card_no, rarity, source_image_url, rendered_card_image_url, description, series:card_series(id, name), category:card_categories(id, name))`)
    .eq('is_claimed', false)
    .or(`child_id.is.null,child_id.eq.${childId}`)
    .or(`starts_on.is.null,starts_on.lte.${today}`)
    .or(`expires_on.is.null,expires_on.gte.${today}`)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error || !data?.id) return null;
  return data as unknown as ScheduledRewardRow;
}

async function insertDrawLog(params: { childId: string; rewardPackId: string | null; cardId: string; practiceRecordId: string | null }) {
  const client = supabase;
  if (!client) return null;
  const { data, error } = await client
    .from('reward_draw_logs')
    .insert({ child_id: params.childId, reward_pack_id: params.rewardPackId, card_id: params.cardId, practice_record_id: params.practiceRecordId })
    .select('id')
    .single();
  if (error || !data?.id) throw new Error(error?.message ?? '寫入抽卡紀錄失敗');
  return data.id as string;
}

export async function drawDailyReward(formData?: FormData): Promise<RewardDrawResult> {
  const client = supabase;

  if (!client) {
    return {
      ok: true,
      message: '你找到一張測試卡！已放進你的圖鑑。',
      card: demoCard,
      draw_log_id: 'demo-draw-log',
      is_new: true,
      remaining_stock: null,
      saved_to_inventory: true,
      drawn_now: true,
      demo: true
    };
  }

  const practiceRecordId = formData?.get('practice_record_id')?.toString() || null;
  let rewardPackId = formData?.get('reward_pack_id')?.toString() || null;
  let childId = formData?.get('child_id')?.toString() || null;

  if (practiceRecordId) {
    const { data: record, error } = await client
      .from('practice_records')
      .select('id, child_id, reward_pack_id, completed, reward_claimed')
      .eq('id', practiceRecordId)
      .maybeSingle();

    if (error || !record?.id) return { ok: false, message: '找不到這次練習紀錄，請先完成今日練習。' };
    if (!record.completed) return { ok: false, message: '今日練習尚未完成，完成後才能打開卡包。' };
    if (record.reward_claimed) return { ok: false, message: '這次練習已經打開過卡包了，可以到「今日獎勵」回看。' };

    childId = record.child_id;
    rewardPackId = record.reward_pack_id;
  }

  if (!practiceRecordId && !(await isPracticeTestModeAsync())) {
    return { ok: false, message: '請確保練習記錄已建立，或聯繫家長。' };
  }

  if (practiceRecordId && !childId) {
    return { ok: false, message: '找不到這次練習對應的孩子，請稍後再試。' };
  }

  childId = childId || (await getDefaultChildId());
  if (!childId) return { ok: false, message: '尚未建立孩子資料，請稍後再試。' };
  const childIdSafe = childId;

  if (!rewardPackId) rewardPackId = await getActiveRewardPackIdWithStock();

  const scheduledReward = await getScheduledReward(childIdSafe);
  if (scheduledReward?.cards) {
    const finalRewardPackId = scheduledReward.reward_pack_id || rewardPackId;
    if (!finalRewardPackId) {
      console.error('[drawDailyReward] 找不到可記錄的卡包', { scheduledReward });
      return { ok: false, message: '卡包正在準備中，請家長稍後再試。' };
    }

    let drawLogId: string;
    try {
      drawLogId = (await insertDrawLog({
        childId,
        rewardPackId: finalRewardPackId,
        cardId: scheduledReward.card_id,
        practiceRecordId
      })) as string;
    } catch (error) {
      console.error('[drawDailyReward] 寫入抽卡紀錄失敗', { childId, finalRewardPackId, cardId: scheduledReward.card_id, error });
      return { ok: false, message: '卡包正在準備中，請家長稍後再試。' };
    }

    const inventoryResult = await addCardToInventory({
      childId,
      cardId: scheduledReward.card_id,
      rewardPackId: finalRewardPackId,
      practiceRecordId
    });

    if (practiceRecordId) {
      await client.from('practice_records').update({ reward_claimed: true }).eq('id', practiceRecordId);
    }

    try { revalidatePath('/parent/dashboard'); } catch (e) { console.error('[drawDailyReward] revalidatePath /parent/dashboard failed', e); }
    try { revalidatePath('/parent/cards'); } catch (e) { console.error('[drawDailyReward] revalidatePath /parent/cards failed', e); }
    try { revalidatePath('/collection'); } catch (e) { console.error('[drawDailyReward] revalidatePath /collection failed', e); }

    return {
      ok: true,
      message: inventoryResult.ok ? '你找到新朋友了！已放進你的圖鑑。' : `你抽到爸爸指定的新卡！儲存到圖鑑失敗：${inventoryResult.message}`,
      card: scheduledReward.cards,
      draw_log_id: drawLogId,
      is_new: true,
      remaining_stock: null,
      saved_to_inventory: Boolean(inventoryResult.ok),
      drawn_now: true
    };
  }

  if (!rewardPackId) {
    return { ok: false, message: '這個練習還沒有設定獎勵卡包，請聯絡家長設定。' };
  }

  const { data: packItems, error: packItemsError } = await client
    .from('reward_pack_items')
    .select('id, stock, weight, reward_pack_id, card_id, cards:cards(id, name, card_no, rarity, source_image_url, rendered_card_image_url, description, series:card_series(id, name), category:card_categories(id, name))')
    .eq('reward_pack_id', rewardPackId)
    .eq('is_active', true);

  if (packItemsError) {
    console.error('[drawDailyReward] 讀取卡包失敗', { rewardPackId, packItemsError });
    return { ok: false, message: '卡包正在準備中，請稍後再試。' };
  }

  const availableItems = (packItems ?? []) as unknown as PackItemRow[];
  if (!availableItems.length) {
    console.error('[drawDailyReward] reward pack 沒有啟用中的卡片', { rewardPackId });
    return { ok: false, message: '卡包正在準備中，請稍後再試。' };
  }

  const picked = pickWeightedItem(availableItems);
  if (!picked?.cards) {
    console.error('[drawDailyReward] 抽到的卡片資料不完整', { picked });
    return { ok: false, message: '卡包正在準備中，請稍後再試。' };
  }

  const drawCardId = picked.card_id;
  const drawCard = picked.cards;

  const nextStock = Math.max(0, Number(picked.stock ?? 1) - 1);
  const { error: stockError } = await client
    .from('reward_pack_items')
    .update({ stock: nextStock })
    .eq('id', picked.id);

  if (stockError) {
    console.error('[drawDailyReward] 扣庫存失敗', { picked, stockError });
    return { ok: false, message: '卡包正在準備中，請稍後再試。' };
  }

  let drawLogId: string;
  try {
    drawLogId = (await insertDrawLog({
      childId,
      rewardPackId,
      cardId: drawCardId,
      practiceRecordId
    })) as string;
  } catch (error) {
    console.error('[drawDailyReward] 寫入抽卡紀錄失敗', { childId, rewardPackId, cardId: drawCardId, error });
    return { ok: false, message: '卡包正在準備中，請稍後再試。' };
  }

  const inventoryResult = await addCardToInventory({
    childId,
    cardId: drawCardId,
    rewardPackId,
    practiceRecordId
  });

  if (practiceRecordId) {
    await client.from('practice_records').update({ reward_claimed: true }).eq('id', practiceRecordId);
  }

  try { revalidatePath('/parent/dashboard'); } catch (e) { console.error('[drawDailyReward] revalidatePath /parent/dashboard failed', e); }
  try { revalidatePath('/parent/cards'); } catch (e) { console.error('[drawDailyReward] revalidatePath /parent/cards failed', e); }
  try { revalidatePath('/collection'); } catch (e) { console.error('[drawDailyReward] revalidatePath /collection failed', e); }

  return {
    ok: true,
    message: inventoryResult.ok ? '你找到新朋友了！已放進你的圖鑑。' : '你抽到一張新卡！圖鑑暫時儲存失敗，請再試一次。',
    card: drawCard,
    draw_log_id: drawLogId,
    is_new: true,
    remaining_stock: nextStock,
    saved_to_inventory: Boolean(inventoryResult.ok),
    drawn_now: true
  };
}
