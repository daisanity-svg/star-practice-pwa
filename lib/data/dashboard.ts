import { supabase } from '@/lib/supabase';
import { isPracticeTestModeAsync } from '@/lib/config/app-mode';

export type DashboardStatus = {
  todayPracticeDone: boolean;
  todayDrawn: boolean;
  pendingDrawCount: number;
  inventoryCount: number;
  totalCards: number;
  isTestMode: boolean;
  childId: string | null;
};

export async function getDashboardStatus(childId?: string): Promise<DashboardStatus> {
  const client = supabase;
  if (!client) {
    return {
      todayPracticeDone: false,
      todayDrawn: false,
      pendingDrawCount: 0,
      inventoryCount: 0,
      totalCards: 0,
      isTestMode: false,
      childId: null,
    };
  }

  const isTestMode = await isPracticeTestModeAsync();

  let targetChildId: string | null = childId ?? null;
  if (!targetChildId) {
    const { data: childRow } = await client
      .from('children')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    targetChildId = childRow?.id ? String(childRow.id) : null;
  }

  if (!targetChildId) {
    return {
      todayPracticeDone: false,
      todayDrawn: false,
      pendingDrawCount: 0,
      inventoryCount: 0,
      totalCards: 0,
      isTestMode,
      childId: null,
    };
  }

  const today = new Date().toISOString().slice(0, 10);

  const [{ data: todayPlan }, { data: todayPractice }, { count: totalCardsCount }, { count: inventoryCount }, { data: appSetting }] = await Promise.all([
    client
      .from('daily_learning_plan')
      .select('id')
      .eq('child_id', targetChildId)
      .eq('plan_date', today)
      .maybeSingle(),
    client
      .from('practice_records')
      .select('id')
      .eq('child_id', targetChildId)
      .eq('completed', true)
      .gte('created_at', `${today}T00:00:00Z`)
      .limit(1)
      .maybeSingle(),
    client
      .from('cards')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
    client
      .from('child_card_inventory')
      .select('*', { count: 'exact', head: true })
      .eq('child_id', targetChildId)
      .gt('quantity', 0),
    client
      .from('app_settings')
      .select('value')
      .eq('key', 'next_reward_card_id')
      .maybeSingle(),
  ]);

  const pendingDrawCount = isTestMode
    ? 1
    : Math.max(0, Number(totalCardsCount ?? 0) - Number(inventoryCount ?? 0));

  return {
    todayPracticeDone: Boolean(todayPractice?.id),
    todayDrawn: Boolean(todayPlan?.id),
    pendingDrawCount,
    inventoryCount: Number(inventoryCount ?? 0),
    totalCards: Number(totalCardsCount ?? 0),
    isTestMode,
    childId: targetChildId,
  };
}
