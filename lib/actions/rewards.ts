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

function parseJsonArray(formData: FormData, key: string) {
  const text = value(formData, key);
  if (!text) return [] as string[];
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed.map((item) => String(item || '').trim()) : [];
  } catch {
    return [];
  }
}

function safeFileName(text: string) {
  const base = text
    .replace(/\. [^.]+$/, '')
    .replace(/[^a-zA-Z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return base || 'card';
}

function safeExtension(fileName: string, fallback = 'png') {
  const ext = fileName.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
  if (!ext) return fallback;
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return ext === 'jpeg' ? 'jpg' : ext;
  return fallback;
}

function pad(num: number) {
  return String(num).padStart(3, '0');
}

function storagePath(folder: string, name: string, extension: string) {
  const id = `${Date.now()}-${crypto.randomUUID()}`;
  return `${folder}/${id}-${safeFileName(name)}.${extension}`;
}

async function uploadFileToStorage(file: File | null, folder: string) {
  if (!supabase || !file || file.size === 0) return null;

  const ext = safeExtension(file.name);
  const path = storagePath(folder, file.name, ext);
  const { error } = await supabase.storage.from('card-assets').upload(path, file, {
    contentType: file.type || `image/${ext}`,
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
  const extension = mimeType.includes('jpeg') ? 'jpg' : mimeType.includes('webp') ? 'webp' : 'png';
  const buffer = Buffer.from(base64, 'base64');
  const path = storagePath(folder, name, extension);

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

export async function createRewardPool(formData: FormData) {
  if (!supabase) return { ok: false, message: 'Supabase 尚未連線。' };

  const name = value(formData, 'pool_name');
  if (!name) return { ok: false, message: '請輸入獎池名稱。' };

  const description = nullableValue(formData, 'pool_description');

  const { data: insertedSeries, error: seriesError } = await supabase
    .from('card_series')
    .insert({
      name,
      cover_image_url: null,
      description: description || `${name} 的收藏卡系列`,
      is_active: true
    })
    .select('id')
    .single();

  if (seriesError) {
    return { ok: false, message: `建立卡片系列失敗：${seriesError.message}` };
  }

  const { error: packError } = await supabase.from('reward_packs').insert({
    name,
    description: description || `完成練習後可抽 ${name}`,
    draw_type: 'daily',
    is_active: true
  });

  if (packError) {
    return { ok: false, message: `建立獎池失敗：${packError.message}` };
  }

  revalidatePath('/parent/cards');
  revalidatePath('/parent/dashboard');
  revalidatePath('/collection');
  revalidatePath('/');
  return { ok: true, message: '獎池新增完成' };
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

export type CardFormState =
  | { ok: true; message: string }
  | { ok: false; message: string }
  | null;

export async function createCard(
  _prevState: CardFormState,
  formData: FormData
): Promise<CardFormState> {
  if (!supabase) {
    return { ok: false, message: 'Supabase 尚未連線。' };
  }

  const seriesId = value(formData, 'series_id');
  const name = value(formData, 'name');
  if (!seriesId || !name) {
    return { ok: false, message: '請選擇所屬系列並輸入卡片名稱。' };
  }

  const sourceFile = formData.get('source_image_file');
  let sourceImageUrl: string | null = null;
  if (sourceFile instanceof File && sourceFile.size > 0) {
    sourceImageUrl = await uploadFileToStorage(sourceFile, 'source');
    if (!sourceImageUrl) {
      return { ok: false, message: '原圖上傳失敗，請確認 Storage bucket 設定或稍後再試。' };
    }
  } else {
    sourceImageUrl = nullableValue(formData, 'source_image_url');
  }

  const renderedCardImageUrl = await uploadDataUrlToStorage(
    nullableValue(formData, 'rendered_card_data_url'),
    'rendered',
    `${value(formData, 'card_no') || name}-rendered`
  ) || nullableValue(formData, 'rendered_card_image_url');

  const { error } = await supabase.from('cards').insert({
    series_id: seriesId,
    category_id: nullableValue(formData, 'category_id'),
    name,
    card_no: nullableValue(formData, 'card_no'),
    rarity: value(formData, 'rarity') || 'common',
    source_image_url: sourceImageUrl,
    rendered_card_image_url: renderedCardImageUrl,
    description: nullableValue(formData, 'description'),
    is_active: true,
    created_at: new Date().toISOString()
  });

  if (error) {
    console.error('createCard insert error', error.message);
    return { ok: false, message: `新增卡片失敗：${error.message}` };
  }

  revalidatePath('/parent/cards');
  revalidatePath('/collection');
  return { ok: true, message: '卡片建立成功！' };
}

export async function createBatchCards(formData: FormData) {
  if (!supabase) return { ok: false, message: 'Supabase 尚未連線。' };

  revalidatePath('/parent/cards');
  revalidatePath('/collection');
  return { ok: true, message: '批次建立卡片功能目前尚未實作。' };
}
