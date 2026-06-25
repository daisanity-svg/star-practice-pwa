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
    .replace(/\.[^.]+$/, '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return base || 'card';
}

function safeExtension(fileName: string, fallback = 'png') {
  const ext = fileName.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!ext) return fallback;
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return ext === 'jpeg' ? 'jpg' : ext;
  return fallback;
}

function pad(num: number) {
  return String(num).padStart(3, '0');
}

function poolBaseName(name: string) {
  if (name.includes('布麗') || name.includes('狗')) return '布麗狗卡';
  if (name.includes('小車') || name.includes('車')) return '小車卡';
  if (name.includes('爸爸')) return '爸爸特製卡';
  if (name.includes('冒險')) return '冒險卡';
  if (name.includes('生日')) return '生日卡';
  if (name.includes('端午')) return '端午卡';
  if (name.includes('植物') || name.includes('皮克')) return '植物卡';

  return name
    .replace(/驚喜卡包/g, '')
    .replace(/卡包/g, '')
    .replace(/系列/g, '')
    .trim() || '神秘卡片';
}

function fallbackCardName(formData: FormData, index: number, cardNo?: string | null) {
  const rewardPackName = value(formData, 'batch_reward_pack_name') || value(formData, 'pool_name') || '神秘卡片';
  const number = cardNo?.match(/(\d{1,4})$/)?.[1] ?? pad(index + 1);
  return `${poolBaseName(rewardPackName)} ${pad(Number(number) || index + 1)}`;
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
    is_active: true
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

  const seriesId = value(formData, 'batch_series_id');
  if (!seriesId) return { ok: false, message: '請先選擇可補卡的獎池。' };

  const files = formData.getAll('batch_source_files').filter((item): item is File => item instanceof File && item.size > 0);
  if (files.length === 0) return { ok: false, message: '請選擇至少一張圖片。' };

  const names = parseJsonArray(formData, 'batch_card_names');
  const cardNos = parseJsonArray(formData, 'batch_card_nos');
  const renderedDataUrls = parseJsonArray(formData, 'batch_rendered_data_urls');
  const categoryId = nullableValue(formData, 'batch_category_id');
  const rewardPackId = nullableValue(formData, 'batch_reward_pack_id');
  const rarity = value(formData, 'batch_rarity') || 'common';
  const stock = Number(value(formData, 'batch_stock') || '1');
  const weight = Number(value(formData, 'batch_weight') || '10');

  const cardRows = [];

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const cardNo = cardNos[index] || null;
    const name = names[index] || fallbackCardName(formData, index, cardNo);
    const sourceImageUrl = await uploadFileToStorage(file, 'source');
    if (!sourceImageUrl) {
      return { ok: false, message: `第 ${index + 1} 張原圖上傳失敗，請檢查 Supabase Storage 或重新上傳。` };
    }
    const renderedCardImageUrl = await uploadDataUrlToStorage(
      renderedDataUrls[index] || null,
      'rendered',
      `${cardNo || name}-rendered`
    );

    cardRows.push({
      series_id: seriesId,
      category_id: categoryId,
      name,
      card_no: cardNo,
      rarity,
      source_image_url: sourceImageUrl,
      rendered_card_image_url: renderedCardImageUrl,
      description: '批次上傳建立',
      is_active: true
    });
  }

  const { data: insertedCards, error } = await supabase
    .from('cards')
    .insert(cardRows)
    .select('id');

  if (error) {
    return { ok: false, message: `新增卡片失敗：${error.message}` };
  }

  if (rewardPackId && insertedCards && insertedCards.length > 0) {
    await supabase.from('reward_pack_items').upsert(
      insertedCards.map((card) => ({
        reward_pack_id: rewardPackId,
        card_id: card.id,
        stock,
        weight,
        is_active: true
      })),
      { onConflict: 'reward_pack_id,card_id' }
    );
  }

  revalidatePath('/parent/cards');
  revalidatePath('/collection');
  revalidatePath('/reward');
  return { ok: true, message: `已成功新增 ${insertedCards?.length ?? files.length} 張卡片` };
}

export async function createScheduledReward(formData: FormData) {
  if (!supabase) return;

  const cardId = value(formData, 'scheduled_card_id');
  if (!cardId) return;

  const reason = value(formData, 'scheduled_reason') || '爸爸指定獎勵';
  const rewardPackId = nullableValue(formData, 'scheduled_reward_pack_id');
  const startsOn = nullableValue(formData, 'scheduled_starts_on');
  const expiresOn = nullableValue(formData, 'scheduled_expires_on');

  const { error } = await supabase.from('scheduled_rewards').insert({
    child_id: null,
    card_id: cardId,
    reward_pack_id: rewardPackId,
    reason,
    starts_on: startsOn,
    expires_on: expiresOn,
    is_claimed: false
  });

  if (error) {
    console.error('createScheduledReward error', error.message);
    return;
  }

  revalidatePath('/parent/cards');
  revalidatePath('/parent/dashboard');
  revalidatePath('/reward');
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
  revalidatePath('/reward');
}

export async function deleteRewardPool(formData: FormData) {
  if (!supabase) return { ok: false, message: 'Supabase 尚未連線。' };
  const packId = value(formData, 'reward_pack_id');
  if (!packId) return { ok: false, message: '找不到要刪除的獎池。' };

  const { error: itemsError } = await supabase.from('reward_pack_items').delete().eq('reward_pack_id', packId);
  if (itemsError) return { ok: false, message: `刪除獎池卡片關聯失敗：${itemsError.message}` };

  const { error: packError } = await supabase.from('reward_packs').delete().eq('id', packId);
  if (packError) return { ok: false, message: `刪除獎池失敗：${packError.message}` };

  revalidatePath('/parent/cards');
  revalidatePath('/reward');
  revalidatePath('/collection');
  revalidatePath('/parent/dashboard');
  return { ok: true, message: '獎池已刪除' };
}

export async function deleteCard(formData: FormData) {
  if (!supabase) return { ok: false, message: 'Supabase 尚未連線。' };
  const cardId = value(formData, 'card_id');
  if (!cardId) return { ok: false, message: '找不到要刪除的卡片。' };

  const { data: cardExists } = await supabase.from('cards').select('id').eq('id', cardId).maybeSingle();
  if (!cardExists?.id) return { ok: false, message: '找不到要刪除的卡片。' };

  const timestamp = new Date().toISOString();
  const backupId = `backup-${cardId}-${Date.now()}`;

  const { error: backupError } = await supabase.from('deleted_cards_backup').insert({
    id: backupId,
    original_card_id: cardId,
    payload: { cardId, timestamp },
  });
  if (backupError) {
    return { ok: false, message: `建立備份失敗，無法安全刪除：${backupError.message}` };
  }

  const { error: packError } = await supabase
    .from('reward_pack_items')
    .delete()
    .eq('card_id', cardId);
  if (packError) {
    await supabase.from('deleted_cards_backup').delete().eq('id', backupId);
    return { ok: false, message: `刪除獎池關聯失敗：${packError.message}` };
  }

  const { error: invError } = await supabase
    .from('child_card_inventory')
    .delete()
    .eq('card_id', cardId);
  if (invError) {
    await supabase.from('deleted_cards_backup').delete().eq('id', backupId);
    return { ok: false, message: `刪除收納包失敗：${invError.message}` };
  }

  const { error: logError } = await supabase
    .from('reward_draw_logs')
    .delete()
    .eq('card_id', cardId);
  if (logError) {
    await supabase.from('deleted_cards_backup').delete().eq('id', backupId);
    return { ok: false, message: `刪除抽卡紀錄失敗：${logError.message}` };
  }

  const { error: schedError } = await supabase
    .from('scheduled_rewards')
    .delete()
    .eq('card_id', cardId);
  if (schedError) {
    await supabase.from('deleted_cards_backup').delete().eq('id', backupId);
    return { ok: false, message: `刪除指定獎勵失敗：${schedError.message}` };
  }

  const { error: cardError } = await supabase.from('cards').delete().eq('id', cardId);
  if (cardError) {
    await supabase.from('deleted_cards_backup').delete().eq('id', backupId);
    return { ok: false, message: `刪除卡片失敗：${cardError.message}` };
  }

  revalidatePath('/parent/cards');
  revalidatePath('/reward');
  revalidatePath('/collection');
  revalidatePath('/parent/dashboard');
  return { ok: true, message: '卡片已刪除' };
}

export async function setPracticeMode(formData: FormData) {
  if (!supabase) return { ok: false, message: 'Supabase 尚未連線。' };
  const mode = value(formData, 'practice_mode');
  if (mode !== 'test' && mode !== 'production') return { ok: false, message: '模式值不正確。' };

  const { error } = await supabase.from('app_settings').upsert(
    { key: 'practice_mode', value: mode, updated_at: new Date().toISOString() },
    { onConflict: 'key' }
  );
  if (error) return { ok: false, message: `切換模式失敗：${error.message}` };

  revalidatePath('/parent/cards');
  revalidatePath('/parent/dashboard');
  revalidatePath('/practice');
  revalidatePath('/reward');
  return { ok: true, message: mode === 'test' ? '已切換為測試模式' : '已切換為正式模式' };
}
