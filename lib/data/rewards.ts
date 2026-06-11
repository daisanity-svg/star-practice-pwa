import { supabase } from '@/lib/supabase';
import type { CardCollectionSummary, ChildCardInventoryItem } from '@/lib/types';

export const demoCollections: CardCollectionSummary[] = [
  { id: 'cars', name: '小車系列', owned: 5, total: 12 },
  { id: 'dogs', name: '狗狗系列', owned: 2, total: 8 },
  { id: 'plants', name: '植物朋友', owned: 1, total: 10 }
];

export const demoInventory: ChildCardInventoryItem[] = [
  {
    id: 'demo-inventory-1',
    quantity: 1,
    obtained_at: new Date().toISOString(),
    card: {
      id: 'demo-red-car',
      name: '紅色小車',
      card_no: 'CAR-001',
      rarity: 'rare',
      series: { id: 'cars', name: '小車系列' },
      category: { id: 'cars-main', name: '小車' }
    }
  },
  {
    id: 'demo-inventory-2',
    quantity: 1,
    obtained_at: new Date().toISOString(),
    card: {
      id: 'demo-blue-dog',
      name: '藍色狗狗',
      card_no: 'DOG-001',
      rarity: 'common',
      series: { id: 'dogs', name: '狗狗系列' },
      category: { id: 'dogs-main', name: '日常' }
    }
  }
];

export async function getDefaultChildId() {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('children')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data?.id) return null;
  return data.id as string;
}

export async function getCollectionSummary(): Promise<CardCollectionSummary[]> {
  if (!supabase) return demoCollections;

  const { data: series, error: seriesError } = await supabase
    .from('card_series')
    .select('id, name, cover_image_url')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (seriesError || !series?.length) return demoCollections;

  const childId = await getDefaultChildId();

  const summaries = await Promise.all(
    series.map(async (item) => {
      const [{ count: total }, { count: owned }] = await Promise.all([
        supabase
          .from('cards')
          .select('id', { count: 'exact', head: true })
          .eq('series_id', item.id)
          .eq('is_active', true),
        childId
          ? supabase
              .from('child_card_inventory')
              .select('cards!inner(id)', { count: 'exact', head: true })
              .eq('child_id', childId)
              .eq('cards.series_id', item.id)
          : Promise.resolve({ count: 0 })
      ]);

      return {
        id: item.id,
        name: item.name,
        cover_image_url: item.cover_image_url,
        owned: owned ?? 0,
        total: total ?? 0
      };
    })
  );

  return summaries;
}

export async function getChildInventory(): Promise<ChildCardInventoryItem[]> {
  if (!supabase) return demoInventory;

  const childId = await getDefaultChildId();
  if (!childId) return demoInventory;

  const { data, error } = await supabase
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
