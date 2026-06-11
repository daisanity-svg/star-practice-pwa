import { supabase } from '@/lib/supabase';
import type { CardCollectionSummary } from '@/lib/types';

export const demoCollections: CardCollectionSummary[] = [
  { id: 'cars', name: '小車系列', owned: 5, total: 12 },
  { id: 'dogs', name: '狗狗系列', owned: 2, total: 8 },
  { id: 'plants', name: '植物朋友', owned: 1, total: 10 }
];

export async function getCollectionSummary(): Promise<CardCollectionSummary[]> {
  if (!supabase) return demoCollections;

  const { data: series, error: seriesError } = await supabase
    .from('card_series')
    .select('id, name, cover_image_url')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (seriesError || !series?.length) return demoCollections;

  const summaries = await Promise.all(
    series.map(async (item) => {
      const [{ count: total }, { count: owned }] = await Promise.all([
        supabase
          .from('cards')
          .select('id', { count: 'exact', head: true })
          .eq('series_id', item.id)
          .eq('is_active', true),
        supabase
          .from('child_card_inventory')
          .select('cards!inner(id)', { count: 'exact', head: true })
          .eq('cards.series_id', item.id)
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
