'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import type { RewardDrawResult, RewardCard, SaveRewardResult } from '@/lib/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isPracticeTestModeAsync } from '@/lib/config/app-mode';
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

type DrawLogRow = {
  id: string;
  child_id: string;
  reward_pack_id: string | null;
  card_id: string;
  practice_record_id: string | null;
  cards: RewardCard | null;
};

function pickRandomCard(cards: any[]) {
  if (!cards.length) return null;
  const index = Math.floor(Math.random() * cards.length);
  return cards[index];
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
  let childId = formData?.get('child_id')?.toString() || null;

  if (practiceRecordId) {
    const { data: record, error } = await client
      .from('practice_records')
      .select('id, child_id, completed, reward_claimed')
      .eq('id', practiceRecordId)
      .maybeSingle();

    if (error || !record?.id) return { ok: false, message: '找不到這次練習紀錄，請先完成今日練習。' };
    if (!record.completed) return { ok: false, message: '今日練習尚未完成，完成後才能打開卡包。' };
    if (record.reward_claimed) return { ok: false, message: '這次練習已經打開過卡包了，可以到「今日獎勵」回看。' };

    childId = record.child_id;
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

  // Check for pre-selected card from settings
  const { data: settingRow } = await client
    .from('app_settings')
    .select('value')
    .eq('key', 'next_reward_card_id')
    .maybeSingle();

  const nextRewardCardId = settingRow?.value ? String(settingRow.value) : null;

  // Fetch all active cards and owned cards in parallel
  const [{ data: allCardsRaw }, { data: ownedRows }] = await Promise.all([
    client
      .from('cards')
      .select('id, name, card_no, rarity, source_image_url, rendered_card_image_url, description, series:card_series(id, name), category:card_categories(id, name)')
      .eq('is_active', true),
    client
      .from('child_card_inventory')
      .select('card_id')
      .eq('child_id', childIdSafe)
  ]);

  const allCards: RewardCard[] = ((allCardsRaw ?? []) as any[]).map((row) => ({
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    card_no: row.card_no ?? null,
    rarity: String(row.rarity ?? 'common'),
    source_image_url: row.source_image_url ?? null,
    rendered_card_image_url: row.rendered_card_image_url ?? null,
    description: row.description ?? null,
    series: Array.isArray(row.series) && row.series.length ? { id: String(row.series[0].id), name: String(row.series[0].name) } : null,
    category: Array.isArray(row.category) && row.category.length ? { id: String(row.category[0].id), name: String(row.category[0].name) } : null
  }));

  const ownedCardIds = new Set(
    (ownedRows ?? [])
      .map((row) => row.card_id)
      .filter((id): id is string => Boolean(id))
  );

  let selectedCard: RewardCard | null = null;

  if (nextRewardCardId) {
    // Try to draw the pre-selected card if it exists and is still pending
    const selectedFromAll = allCards.find((card) => card.id === nextRewardCardId);
    if (selectedFromAll && !ownedCardIds.has(nextRewardCardId)) {
      selectedCard = selectedFromAll;
    }
    // Always clear the setting after checking
    await client.from('app_settings').delete().eq('key', 'next_reward_card_id');
  }

  if (!selectedCard) {
    // Pick random from pending cards: cards - child_card_inventory
    const pendingCards = allCards.filter((card) => !ownedCardIds.has(card.id));
    if (!pendingCards.length) {
      return { ok: false, message: '目前沒有待抽卡，請家長先新增卡片。' };
    }
    selectedCard = pickRandomCard(pendingCards) ?? null;
  }

  if (!selectedCard?.id) {
    return { ok: false, message: '抽卡失敗，請稍後再試。' };
  }

  const selectedCardId = selectedCard.id;

  // Write draw log
  let drawLogId: string;
  try {
    const { data, error } = await client
      .from('reward_draw_logs')
      .insert({
        child_id: childIdSafe,
        reward_pack_id: null,
        card_id: selectedCardId,
        practice_record_id: practiceRecordId
      })
      .select('id')
      .single();

    if (error || !data?.id) throw new Error(error?.message ?? '寫入抽卡紀錄失敗');
    drawLogId = data.id as string;
  } catch (error) {
    console.error('[drawDailyReward] 寫入抽卡紀錄失敗', { childId: childIdSafe, cardId: selectedCardId, error });
    return { ok: false, message: '抽卡失敗，請稍後再試。' };
  }

  // Add to inventory
  const inventoryResult = await addCardToInventory({
    childId: childIdSafe,
    cardId: selectedCardId,
    rewardPackId: null,
    practiceRecordId
  });

  if (practiceRecordId) {
    await client.from('practice_records').update({ reward_claimed: true }).eq('id', practiceRecordId);
  }

  try { revalidatePath('/parent/dashboard'); } catch (e) { console.error('[drawDailyReward] revalidatePath /parent/dashboard failed', e); }
  try { revalidatePath('/parent/cards'); } catch (e) { console.error('[drawDailyReward] revalidatePath /parent/cards failed', e); }
  try { revalidatePath('/collection'); } catch (e) { console.error('[drawDailyReward] revalidatePath /collection failed', e); }
  try { revalidatePath('/reward'); } catch (e) { console.error('[drawDailyReward] revalidatePath /reward failed', e); }

  return {
    ok: true,
    message: inventoryResult.ok ? '你找到新朋友了！已放進你的圖鑑。' : '你抽到一張新卡！圖鑑暫時儲存失敗，請再試一次。',
    card: selectedCard,
    draw_log_id: drawLogId,
    is_new: true,
    remaining_stock: null,
    saved_to_inventory: Boolean(inventoryResult.ok),
    drawn_now: true
  };
}
