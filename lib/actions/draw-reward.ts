'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import type { DrawRewardResult, RewardCard } from '@/lib/types';

const demoCard: RewardCard = {
  id: 'demo-red-car',
  name: '紅色小車',
  card_no: 'CAR-001',
  rarity: 'rare',
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
  const { data, error } = await supabase!
    .from('children')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data?.id) return null;
  return data.id as string;
}

async function getActiveRewardPackId() {
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase!
    .from('reward_packs')
    .select('id')
    .eq('is_active', true)
    .or(`start_date.is.null,start_date.lte.${today}`)
    .or(`end_date.is.null,end_date.gte.${today}`)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data?.id) return null;
  return data.id as string;
}

export async function drawDailyReward(formData?: FormData): Promise<DrawRewardResult> {
  if (!supabase) {
    return {
      ok: true,
      message: '目前尚未連接 Supabase，先顯示示範卡。',
      card: demoCard,
      is_new: true,
      remaining_stock: 1,
      demo: true
    };
  }

  const childIdFromForm = formData?.get('child_id')?.toString();
  const packIdFromForm = formData?.get('reward_pack_id')?.toString();
  const practiceRecordId = formData?.get('practice_record_id')?.toString() || null;

  const childId = childIdFromForm || (await getDefaultChildId());
  if (!childId) {
    return { ok: false, message: '尚未建立孩子資料，請先到 Supabase seed 或後台新增孩子。' };
  }

  const rewardPackId = packIdFromForm || (await getActiveRewardPackId());
  if (!rewardPackId) {
    return { ok: false, message: '目前沒有啟用中的卡包，請先到後台建立並啟用卡包。' };
  }

  const { data: packItems, error: packItemsError } = await supabase
    .from('reward_pack_items')
    .select(`
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
    `)
    .eq('reward_pack_id', rewardPackId)
    .eq('is_active', true)
    .gt('stock', 0);

  if (packItemsError) {
    return { ok: false, message: `讀取卡包失敗：${packItemsError.message}` };
  }

  const availableItems = (packItems ?? []) as unknown as PackItemRow[];
  if (!availableItems.length) {
    return { ok: false, message: '這個卡包目前沒有可抽的卡片，請到後台補庫存或換卡包。' };
  }

  const picked = pickWeightedItem(availableItems);
  if (!picked?.cards) {
    return { ok: false, message: '抽到的卡片資料不完整，請檢查卡片是否仍存在。' };
  }

  const { data: existingInventory } = await supabase
    .from('child_card_inventory')
    .select('id, quantity')
    .eq('child_id', childId)
    .eq('card_id', picked.card_id)
    .maybeSingle();

  const isNew = !existingInventory;

  if (existingInventory?.id) {
    const { error: updateInventoryError } = await supabase
      .from('child_card_inventory')
      .update({
        quantity: Number(existingInventory.quantity ?? 1) + 1,
        obtained_at: new Date().toISOString(),
        obtained_from_pack_id: rewardPackId,
        obtained_from_practice_record_id: practiceRecordId
      })
      .eq('id', existingInventory.id);

    if (updateInventoryError) {
      return { ok: false, message: `更新收納包失敗：${updateInventoryError.message}` };
    }
  } else {
    const { error: insertInventoryError } = await supabase
      .from('child_card_inventory')
      .insert({
        child_id: childId,
        card_id: picked.card_id,
        quantity: 1,
        obtained_from_pack_id: rewardPackId,
        obtained_from_practice_record_id: practiceRecordId
      });

    if (insertInventoryError) {
      return { ok: false, message: `新增收納包失敗：${insertInventoryError.message}` };
    }
  }

  const nextStock = Math.max(0, Number(picked.stock ?? 0) - 1);
  const { error: stockError } = await supabase
    .from('reward_pack_items')
    .update({ stock: nextStock })
    .eq('id', picked.id);

  if (stockError) {
    return { ok: false, message: `更新卡包庫存失敗：${stockError.message}` };
  }

  const { error: logError } = await supabase
    .from('reward_draw_logs')
    .insert({
      child_id: childId,
      reward_pack_id: rewardPackId,
      card_id: picked.card_id,
      practice_record_id: practiceRecordId
    });

  if (logError) {
    return { ok: false, message: `寫入抽卡紀錄失敗：${logError.message}` };
  }

  if (practiceRecordId) {
    await supabase.from('practice_records').update({ reward_claimed: true }).eq('id', practiceRecordId);
  }

  revalidatePath('/');
  revalidatePath('/collection');
  revalidatePath('/reward');
  revalidatePath('/parent/dashboard');
  revalidatePath('/parent/cards');

  return {
    ok: true,
    message: isNew ? '你獲得新卡！已放進收納包。' : '你又抽到一張收藏卡，數量已增加。',
    card: picked.cards,
    is_new: isNew,
    remaining_stock: nextStock
  };
}
