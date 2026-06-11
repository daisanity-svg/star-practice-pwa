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

function safeFileName(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5-]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'card';
}

async function uploadFileToStorage(file: File | null, folder: string) {
  if (!supabase || !file || file.size === 0) return null;

  const ext = file.name.split('.').pop() || 'png';
  const path = `${folder}/${Date.now()}-${safeFileName(file.name)}.${ext}`;
  const { error } = await supabase.storage.from('card-assets').upload(path, file, {
    cacheControl: '31536000',
    upsert: false
  });

  if (error) {
    console.error('uploadFileToStorage error', error.message);
    return null;
  }

  const { data } = supabase.storage.from('card-assets').getPublicUrl(path);
  return data.publicUrl;
}

async function uploadDataUrlToStorage(dataUrl: string | null, folder: string, name: string) {
  if (!supabase || !dataUrl) return null;
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;

  const mimeType = match[1];
  const base64 = match[2];
  const extension = mimeType.includes('jpeg') ? 'jpg' : 'png';
  const buffer = Buffer.from(base64, 'base64');
  const path = `${folder}/${Date.now()}-${safeFileName(name)}.${extension}`;

  const { error } = await supabase.storage.from('card-assets').upload(path, buffer, {
    contentType: mimeType,
    cacheControl: '31536000',
    upsert: false
  });

  if (error) {
    console.error('uploadDataUrlToStorage error', error.message);
    return null;
  }

  const { data } = supabase.storage.from('card-assets').getPublicUrl(path);
  return data.publicUrl;
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

  const sourceFile = formData.get('source_image_file');
  const sourceImageUrl = sourceFile instanceof File
    ? await uploadFileToStorage(sourceFile, 'source')
    : nullableValue(formData, 'source_image_url');

  const renderedCardImageUrl = await uploadDataUrlToStorage(
    nullableValue(formData, 'rendered_card_data_url'),
    'rendered',
    `${value(formData, 'card_no') || name}-rendered`
  ) || nullableValue(formData, 'rendered_card_image_url');

  await supabase.from('cards').insert({
    series_id: seriesId,
    category_id: nullableValue(formData, 'category_id'),
    name,
    card_no: nullableValue(formData, 'card_no'),
    rarity: value(formData, 'rarity') || 'common',
    source_image_url: sourceImageUrl,
    rendered_card_image_url: renderedCardImageUrl,
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
