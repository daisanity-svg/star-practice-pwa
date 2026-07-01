'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';

export type SharedCardState =
  | { ok: true; message: string }
  | { ok: false; message: string }
  | null;

export async function deleteCard(_prevState: SharedCardState, formData: FormData): Promise<SharedCardState> {
  if (!supabase) {
    return { ok: false, message: 'Supabase 尚未連線。' };
  }

  const cardId = formData.get('card_id');
  if (!cardId || typeof cardId !== 'string') {
    return { ok: false, message: '請指定要刪除的卡片。' };
  }

  const { data: inventoryRows, error: inventoryError } = await supabase
    .from('child_card_inventory')
    .select('id, child_id, quantity')
    .eq('card_id', cardId);

  if (inventoryError) {
    return { ok: false, message: '檢查卡片收藏情形失敗。' };
  }

  const ownedRows = (inventoryRows ?? []).filter((row) => Number(row.quantity ?? 0) > 0);
  if (ownedRows.length > 0) {
    return { ok: false, message: '這張卡片已被收藏，無法刪除，請先解除收藏再刪除。' };
  }

  const { error: deleteError } = await supabase.from('cards').delete().eq('id', cardId);
  if (deleteError) {
    return { ok: false, message: `刪除卡片失敗：${deleteError.message}` };
  }

  revalidatePath('/parent/cards');
  return { ok: true, message: '卡片已刪除。' };
}

export async function setNextRewardCard(_prevState: SharedCardState, formData: FormData): Promise<SharedCardState> {
  if (!supabase) {
    return { ok: false, message: 'Supabase 尚未連線。' };
  }

  const cardId = formData.get('card_id');
  if (!cardId || typeof cardId !== 'string') {
    return { ok: false, message: '請指定要命為下一張抽卡的卡片。' };
  }

  const { data: cardRow, error: cardError } = await supabase
    .from('cards')
    .select('id, is_active')
    .eq('id', cardId)
    .maybeSingle();

  if (cardError || !cardRow?.id) {
    return { ok: false, message: '找不到這張卡片，請確認卡片是否仍存在。' };
  }

  const { data: ownedRows, error: ownedError } = await supabase
    .from('child_card_inventory')
    .select('id, quantity')
    .eq('card_id', cardId);

  if (ownedError) {
    return { ok: false, message: '檢查收藏狀態失敗。' };
  }

  const hasOwnedActive = (ownedRows ?? []).some((row) => Number(row.quantity ?? 0) > 0);
  if (hasOwnedActive) {
    return { ok: false, message: '這張卡片已被收藏，無法指定為下一張抽卡。' };
  }

  if (!(cardRow as { is_active?: boolean }).is_active) {
    return { ok: false, message: '這張卡片尚未啟用，無法指定為下一張抽卡。' };
  }

  const { error: upsertError } = await supabase
    .from('app_settings')
    .upsert({ key: 'next_reward_card_id', value: cardId, updated_at: new Date().toISOString() }, { onConflict: 'key' });

  if (upsertError) {
    return { ok: false, message: `指定下一張抽卡失敗：${upsertError.message}` };
  }

  revalidatePath('/parent/cards');
  return { ok: true, message: '指定下一張抽卡成功。' };
}
