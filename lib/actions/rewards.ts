'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === 'string' ? raw.trim() : '';
}

function nullableValue(formData: FormData, key: string) {
  const text = value(formData, key);
  return text.length > 0 ? text : null;
}

export async function createCardSeries(formData: FormData) {
  if (!supabase) return;

  const name = value(formData, 'name');
  if (!name) return;

  await supabase.from('card_series').insert({
    name,
    cover_image_url: nullableValue(formData, 'cover_image_url'),
    description: nullableValue(formData, 'description'),
    is_active: true
  });

  revalidatePath('/parent/cards');
  revalidatePath('/collection');
  revalidatePath('/');
}

export async function createCardCategory(formData: FormData) {
  if (!supabase) return;

  const seriesId = value(formData, 'series_id');
  const name = value(formData, 'name');
  if (!seriesId || !name) return;

  await supabase.from('card_categories').insert({
    series_id: seriesId,
    name,
    description: nullableValue(formData, 'description')
  });

  revalidatePath('/parent/cards');
}

export async function createCard(formData: FormData) {
  if (!supabase) return;

  const seriesId = value(formData, 'series_id');
  const name = value(formData, 'name');
  if (!seriesId || !name) return;

  await supabase.from('cards').insert({
    series_id: seriesId,
    category_id: nullableValue(formData, 'category_id'),
    name,
    card_no: nullableValue(formData, 'card_no'),
    rarity: value(formData, 'rarity') || 'common',
    source_image_url: nullableValue(formData, 'source_image_url'),
    rendered_card_image_url: nullableValue(formData, 'rendered_card_image_url'),
    description: nullableValue(formData, 'description'),
    is_active: true
  });

  revalidatePath('/parent/cards');
  revalidatePath('/collection');
}

export async function createRewardPack(formData: FormData) {
  if (!supabase) return;

  const name = value(formData, 'name');
  if (!name) return;

  await supabase.from('reward_packs').insert({
    name,
    description: nullableValue(formData, 'description'),
    draw_type: value(formData, 'draw_type') || 'daily',
    start_date: nullableValue(formData, 'start_date'),
    end_date: nullableValue(formData, 'end_date'),
    is_active: true
  });

  revalidatePath('/parent/cards');
  revalidatePath('/parent/dashboard');
}

export async function addCardToPack(formData: FormData) {
  if (!supabase) return;

  const rewardPackId = value(formData, 'reward_pack_id');
  const cardId = value(formData, 'card_id');
  if (!rewardPackId || !cardId) return;

  await supabase.from('reward_pack_items').upsert(
    {
      reward_pack_id: rewardPackId,
      card_id: cardId,
      stock: Number(value(formData, 'stock') || '1'),
      weight: Number(value(formData, 'weight') || '10'),
      is_active: true
    },
    { onConflict: 'reward_pack_id,card_id' }
  );

  revalidatePath('/parent/cards');
}
