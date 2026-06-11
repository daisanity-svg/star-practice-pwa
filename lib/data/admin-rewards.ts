import { supabase } from '@/lib/supabase';

export type CardSeries = {
  id: string;
  name: string;
  cover_image_url?: string | null;
  description?: string | null;
  is_active?: boolean | null;
};

export type CardCategory = {
  id: string;
  series_id: string;
  name: string;
  description?: string | null;
};

export type Card = {
  id: string;
  series_id: string;
  category_id?: string | null;
  name: string;
  card_no?: string | null;
  rarity: string;
  source_image_url?: string | null;
  rendered_card_image_url?: string | null;
  description?: string | null;
};

export type RewardPack = {
  id: string;
  name: string;
  description?: string | null;
  draw_type: string;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean | null;
};

export type RewardPackItem = {
  id: string;
  reward_pack_id: string;
  card_id: string;
  stock: number;
  weight: number;
  card?: Pick<Card, 'name' | 'rarity' | 'card_no'> | null;
};

export const demoSeries: CardSeries[] = [
  { id: 'cars', name: '小車系列', description: 'Tomica 與交通工具收藏' },
  { id: 'dogs', name: '狗狗系列', description: '布麗狗與可愛狗狗朋友' }
];

export const demoCategories: CardCategory[] = [
  { id: 'cat-car-1', series_id: 'cars', name: '工程車' },
  { id: 'cat-car-2', series_id: 'cars', name: '消防車' },
  { id: 'cat-dog-1', series_id: 'dogs', name: '日常' }
];

export const demoCards: Card[] = [
  { id: 'card-red-car', series_id: 'cars', category_id: 'cat-car-2', name: '紅色消防車', card_no: 'CAR-001', rarity: 'common' },
  { id: 'card-blue-dog', series_id: 'dogs', category_id: 'cat-dog-1', name: '藍色狗狗', card_no: 'DOG-001', rarity: 'rare' }
];

export const demoPacks: RewardPack[] = [
  { id: 'daily-pack', name: '今日驚喜卡包', draw_type: 'daily', description: '完成每日練習後可抽' }
];

export const demoPackItems: RewardPackItem[] = [
  { id: 'pack-item-1', reward_pack_id: 'daily-pack', card_id: 'card-red-car', stock: 1, weight: 10, card: { name: '紅色消防車', rarity: 'common', card_no: 'CAR-001' } }
];

export async function getAdminRewardData() {
  if (!supabase) {
    return {
      series: demoSeries,
      categories: demoCategories,
      cards: demoCards,
      packs: demoPacks,
      packItems: demoPackItems
    };
  }

  const [seriesRes, categoriesRes, cardsRes, packsRes, packItemsRes] = await Promise.all([
    supabase.from('card_series').select('*').order('created_at', { ascending: true }),
    supabase.from('card_categories').select('*').order('created_at', { ascending: true }),
    supabase.from('cards').select('*').order('created_at', { ascending: true }),
    supabase.from('reward_packs').select('*').order('created_at', { ascending: true }),
    supabase.from('reward_pack_items').select('*, cards(name, rarity, card_no)').order('created_at', { ascending: true })
  ]);

  return {
    series: (seriesRes.data?.length ? seriesRes.data : demoSeries) as CardSeries[],
    categories: (categoriesRes.data?.length ? categoriesRes.data : demoCategories) as CardCategory[],
    cards: (cardsRes.data?.length ? cardsRes.data : demoCards) as Card[],
    packs: (packsRes.data?.length ? packsRes.data : demoPacks) as RewardPack[],
    packItems: (packItemsRes.data?.length
      ? packItemsRes.data.map((item: any) => ({ ...item, card: item.cards }))
      : demoPackItems) as RewardPackItem[]
  };
}
