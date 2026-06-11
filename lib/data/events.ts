import { supabase } from '@/lib/supabase';

export type ActiveEventSummary = {
  id: string;
  name: string;
  description?: string | null;
  event_type: string;
  banner_text?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  reward_pack?: {
    id: string;
    name: string;
    description?: string | null;
  } | null;
};

export type RewardPackSummary = {
  id: string;
  name: string;
  description?: string | null;
  draw_type?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean | null;
  card_count: number;
  remaining_stock: number;
};

export const demoActiveEvent: ActiveEventSummary = {
  id: 'demo-event-car-week',
  name: '小車週',
  event_type: 'theme_week',
  banner_text: '這週是小車週！完成練習可以抽小車卡包！',
  description: '用孩子最近喜歡的主題卡包維持新鮮感。',
  reward_pack: {
    id: 'demo-pack-cars',
    name: '小車驚喜卡包',
    description: '完成今日任務後可抽 1 張。'
  }
};

export const demoRewardPacks: RewardPackSummary[] = [
  {
    id: 'demo-pack-cars',
    name: '小車驚喜卡包',
    description: '每日完成練習後抽取。',
    draw_type: 'daily',
    is_active: true,
    card_count: 3,
    remaining_stock: 8
  },
  {
    id: 'demo-pack-weakness',
    name: '弱點挑戰卡包',
    description: '完成容易忘的朋友後加碼。',
    draw_type: 'weakness',
    is_active: true,
    card_count: 2,
    remaining_stock: 4
  }
];

export async function getActiveEvent(): Promise<ActiveEventSummary | null> {
  if (!supabase) return demoActiveEvent;

  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('events')
    .select(`
      id,
      name,
      description,
      event_type,
      banner_text,
      start_date,
      end_date,
      reward_pack:reward_packs(id, name, description)
    `)
    .eq('is_active', true)
    .or(`start_date.is.null,start_date.lte.${today}`)
    .or(`end_date.is.null,end_date.gte.${today}`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as ActiveEventSummary;
}

export async function getRewardPackSummaries(): Promise<RewardPackSummary[]> {
  if (!supabase) return demoRewardPacks;

  const { data: packs, error } = await supabase
    .from('reward_packs')
    .select('id, name, description, draw_type, start_date, end_date, is_active')
    .order('created_at', { ascending: false });

  if (error || !packs?.length) return demoRewardPacks;

  const summaries = await Promise.all(
    packs.map(async (pack) => {
      const { data: items } = await supabase
        .from('reward_pack_items')
        .select('stock')
        .eq('reward_pack_id', pack.id)
        .eq('is_active', true);

      const cardCount = items?.length ?? 0;
      const remainingStock = items?.reduce((sum, item) => sum + Number(item.stock ?? 0), 0) ?? 0;

      return {
        ...pack,
        card_count: cardCount,
        remaining_stock: remainingStock
      };
    })
  );

  return summaries;
}
