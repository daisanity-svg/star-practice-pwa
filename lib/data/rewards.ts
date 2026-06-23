import { supabase } from '@/lib/supabase';
import type { CardCollectionSummary, ChildCardInventoryItem, RewardDrawResult } from '@/lib/types';

export const demoCollections: CardCollectionSummary[] = [];

export const demoInventory: ChildCardInventoryItem[] = [];

export async function getDefaultChildId() {
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

export async function getCollectionSummary(): Promise<CardCollectionSummary[]> {
  const client = supabase;
  if (!client) return demoCollections;

  const childId = await getDefaultChildId();
  if (!childId) return demoCollections;

  const { data, error } = await client
    .from('child_card_inventory')
    .select(
      `
      quantity,
      card:cards(
        id,
        series:card_series(id, name, cover_image_url)
      )
    `
    )
    .eq('child_id', childId);

  if (error || !data?.length) return demoCollections;

  const map = new Map<string, CardCollectionSummary>();

  for (const item of data as any[]) {
    const series = item.card?.series;
    if (!series?.id) continue;
    const current = map.get(series.id) ?? {
      id: series.id,
      name: series.name,
      cover_image_url: series.cover_image_url,
      owned: 0,
      total: 0
    };
    current.owned += Number(item.quantity ?? 1);
    current.total += Number(item.quantity ?? 1);
    map.set(series.id, current);
  }

  return Array.from(map.values());
}

export async function getChildInventory(): Promise<ChildCardInventoryItem[]> {
  const client = supabase;
  if (!client) return demoInventory;

  const childId = await getDefaultChildId();
  if (!childId) return demoInventory;

  const { data, error } = await client
    .from('child_card_inventory')
    .select(`
      id,
      quantity,
      obtained_at,
      card:cards(
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
    .eq('child_id', childId)
    .order('obtained_at', { ascending: false });

  if (error || !data?.length) return demoInventory;
  return data as unknown as ChildCardInventoryItem[];
}

export async function getTodayDrawnReward(practiceRecordId?: string | null): Promise<RewardDrawResult | null> {
  const client = supabase;
  if (!client) return null;

  const childId = await getDefaultChildId();
  if (!childId) return null;

  let query = client
    .from('reward_draw_logs')
    .select(
      `
      id,
      created_at,
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
    .eq('child_id', childId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (practiceRecordId) {
    query = query.eq('practice_record_id', practiceRecordId);
  } else {
    const today = new Date().toISOString().slice(0, 10);
    query = query.gte('created_at', `${today}T00:00:00.000Z`);
  }

  const { data, error } = await query.maybeSingle();
  if (error || !data?.id || !data.cards) return null;

  const cardId = data.card_id;
  const { data: inventoryData } = await client
    .from('child_card_inventory')
    .select('id')
    .eq('child_id', childId)
    .eq('card_id', cardId)
    .maybeSingle();

  const savedToInventory = Boolean(inventoryData?.id);

  return {
    ok: true,
    message: savedToInventory ? '這是今天抽到的卡片。已放進你的圖鑑。' : '這是今天抽到的卡片。按「儲存到收納包」後，就可以在收納包裡隨時查看。',
    card: data.cards as any,
    draw_log_id: data.id as string,
    is_new: true,
    remaining_stock: null,
    saved_to_inventory: savedToInventory
  };
}
