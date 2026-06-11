'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';

export type ActionState = {
  ok: boolean;
  message: string;
};

function optionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim();
  return text.length ? text : null;
}

export async function createRewardPack(formData: FormData): Promise<ActionState> {
  if (!supabase) {
    return { ok: false, message: '尚未設定 Supabase，目前只能使用示範資料。' };
  }

  const name = optionalString(formData.get('name'));
  if (!name) return { ok: false, message: '請輸入卡包名稱。' };

  const { error } = await supabase.from('reward_packs').insert({
    name,
    description: optionalString(formData.get('description')),
    draw_type: optionalString(formData.get('draw_type')) ?? 'daily',
    start_date: optionalString(formData.get('start_date')),
    end_date: optionalString(formData.get('end_date')),
    is_active: formData.get('is_active') === 'on'
  });

  if (error) return { ok: false, message: error.message };

  revalidatePath('/parent/events');
  revalidatePath('/');
  return { ok: true, message: '已新增卡包。' };
}

export async function createEvent(formData: FormData): Promise<ActionState> {
  if (!supabase) {
    return { ok: false, message: '尚未設定 Supabase，目前只能使用示範資料。' };
  }

  const name = optionalString(formData.get('name'));
  if (!name) return { ok: false, message: '請輸入活動名稱。' };

  const rewardPackId = optionalString(formData.get('reward_pack_id'));

  const { error } = await supabase.from('events').insert({
    name,
    description: optionalString(formData.get('description')),
    event_type: optionalString(formData.get('event_type')) ?? 'theme_week',
    banner_text: optionalString(formData.get('banner_text')),
    start_date: optionalString(formData.get('start_date')),
    end_date: optionalString(formData.get('end_date')),
    reward_pack_id: rewardPackId,
    is_active: formData.get('is_active') === 'on'
  });

  if (error) return { ok: false, message: error.message };

  revalidatePath('/parent/events');
  revalidatePath('/');
  return { ok: true, message: '已新增活動。' };
}
