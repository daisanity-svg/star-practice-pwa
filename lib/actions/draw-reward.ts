'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import type { RewardDrawResult, RewardCard, SaveRewardResult } from '@/lib/types';
import { isPracticeTestMode } from '@/lib/config/app-mode';

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

  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await client
    .from('reward_packs')
    .select(
      `
      id,
      reward_pack_items!inner(stock)
    `
    )
    .eq('is_active', true)
    .gte('reward_pack_items.stock', 1)
    .or(`start_date.is.null,start_date.lte.${today}`)
    .or(`end_date.is.null,end_date.gte.${today}`)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data?.id) return null;
  return data.id as string;
}

async function addCardToInventory(params: {
  childId: string;
  cardId: string;
  rewardPackId: string | null;
  practiceRecordId: string | null;
}) {
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

async function getScheduledReward(childId: string) {
  const client = supabase;
  if (!client) return null;

  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await client
    .from('scheduled_rewards')
    .select(
      `
      id,
      card_id,
      reward_pack_id,
      reason,
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

async function insertDrawLog(params: {
  childId: string;
  rewardPackId: string | null;
  cardId: string;
  practiceRecordId: string | null;
}) {
  const client = supabase;
  if (!client) return null;

  const { data, error } = await client
    .from('reward_draw_logs')
    .insert({
      child_id: params.childId,
      reward_pack_id: params.rewardPackId,
      card_id: params.cardId,
      practice_record_id: params.practiceRecordId
    })
    .select('id')
    .single();

  if (error || !data?.id) {
    throw new Error(error?.message ?? '寫入抽卡紀錄失敗');
  }

  return data.id as string;
}

export async function drawDailyReward(formData?: FormData): Promise<RewardDrawResult> {
  const client = supabase;

  if (!client) {
    return {
      ok: true,
      message: '你抽到一張測試卡！按下儲存後會放進收納包。',
      card: demoCard,
      draw_log_id: 'demo-draw-log',
      is_new: true,
      remaining_stock: 1,
      saved_to_inventory: false,
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

  if (!practiceRecordId && !isPracticeTestMode()) {
    return { ok: false, message: '請先完成今日練習，再打開卡包。' };
  }

  childId = childId || (await getDefaultChildId());
  if (!childId) return { ok: false, message: '尚未建立孩子資料，請先到 Supabase seed 或後台新增孩子。' };

  if (!rewardPackId) rewardPackId = await getActiveRewardPackIdWithStock();

  const scheduledReward = await getScheduledReward(childId);
  if (scheduledReward?.cards) {
    const finalRewardPackId = scheduledReward.reward_pack_id || rewardPackId;
    if (!finalRewardPackId) return { ok: false, message: '已找到指定卡，但目前沒有可記錄的卡包。請先建立一個啟用中的獎池。' };

    let drawLogId: string;
    try {
      drawLogId = (await insertDrawLog({
        childId,
        rewardPackId: finalRewardPackId,
        cardId: scheduledReward.card_id,
        practiceRecordId
      })) as string;
    } catch (error) {
      return { ok: false, message: `寫入抽卡紀錄失敗：${error instanceof Error ? error.message : '未知錯誤'}` };
    }

    await client
      .from('scheduled_rewards')
      .update({
        is_claimed: true,
        claimed_at: new Date().toISOString(),
        claimed_practice_record_id: practiceRecordId
      })
      .eq('id', scheduledReward.id);

    if (practiceRecordId) {
      await client.from('practice_records').update({ reward_claimed: true }).eq('id', practiceRecordId);
    }

    revalidatePath('/reward');
    revalidatePath('/parent/dashboard');
    revalidatePath('/parent/cards');

    return {
      ok: true,
      message: scheduledReward.reason ? `這是爸爸指定獎勵：${scheduledReward.reason}` : '你抽到爸爸指定的新卡！',
      card: scheduledReward.cards,
      draw_log_id: drawLogId,
      is_new: true,
      remaining_stock: null,
      saved_to_inventory: false
    };
  }

  if (!rewardPackId) return { ok: false, message: '目前沒有啟用中且有庫存的卡包，請先到後台建立並啟用卡包。' };

  const { data: packItems, error: packItemsError } = await client
    .from('reward_pack_items')
    .select(
      `
      id,
      stock,
      weight,
      reward_pack_id,
      card_id,
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
    .eq('reward_pack_id', rewardPackId)
    .eq('is_active', true)
    .gt('stock', 0);

  if (packItemsError) return { ok: false, message: `讀取卡包失敗：${packItemsError.message}` };

  const availableItems = (packItems ?? []) as unknown as PackItemRow[];
  if (!availableItems.length) return { ok: false, message: '這個卡包目前沒有可抽的卡片，請到後台補庫存或換卡包。' };

  const picked = pickWeightedItem(availableItems);
  if (!picked?.cards) return { ok: false, message: '抽到的卡片資料不完整，請檢查卡片是否仍存在。' };

  const nextStock = Math.max(0, Number(picked.stock ?? 0) - 1);
  const { error: stockError } = await client.from('reward_pack_items').update({ stock: nextStock }).eq('id', picked.id);
  if (stockError) return { ok: false, message: `更新卡包庫存失敗：${stockError.message}` };

  let drawLogId: string;
  try {
    drawLogId = (await insertDrawLog({ childId, rewardPackId, cardId: picked.card_id, practiceRecordId })) as string;
  } catch (error) {
    return { ok: false, message: `寫入抽卡紀錄失敗：${error instanceof Error ? error.message : '未知錯誤'}` };
  }

  if (practiceRecordId) {
    await client.from('practice_records').update({ reward_claimed: true }).eq('id', practiceRecordId);
  }

  revalidatePath('/reward');
  revalidatePath('/parent/dashboard');
  revalidatePath('/parent/cards');

  return {
    ok: true,
    message: '你抽到一張新卡！按下儲存就會放進收納包。',
    card: picked.cards,
    draw_log_id: drawLogId,
    is_new: true,
    remaining_stock: nextStock,
    saved_to_inventory: false
  };
}

export async function saveDrawnRewardToInventory(formData?: FormData): Promise<SaveRewardResult> {
  const client = supabase;
  if (!client) {
    return { ok: true, message: '測試卡已儲存到收納包。', card: demoCard, is_new: true, saved_to_inventory: true, demo: true };
  }

  const drawLogId = formData?.get('draw_log_id')?.toString() || null;
  if (!drawLogId) return { ok: false, message: '找不到抽卡紀錄，請重新打開卡包。' };

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

  if (error || !data?.id) return { ok: false, message: '找不到這次抽到的卡，請重新抽一次。' };

  const row = data as unknown as DrawLogRow;
  const inventoryResult = await addCardToInventory({
    childId: row.child_id,
    cardId: row.card_id,
    rewardPackId: row.reward_pack_id,
    practiceRecordId: row.practice_record_id
  });

  if (!inventoryResult.ok) return { ok: false, message: inventoryResult.message };

  revalidatePath('/');
  revalidatePath('/collection');
  revalidatePath('/reward');
  revalidatePath('/parent/dashboard');

  return {
    ok: true,
    message: inventoryResult.isNew ? '已儲存到收納包！之後可以隨時回來看。' : '收納包裡又多了一張同款卡！',
    card: row.cards ?? undefined,
    is_new: inventoryResult.isNew,
    saved_to_inventory: true
  };
}
