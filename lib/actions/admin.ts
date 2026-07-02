'use server';

import { revalidatePath } from 'next/cache';

export async function resetTodayRecord(): Promise<{ ok: boolean; message: string }> {
  try {
    revalidatePath('/practice');
    revalidatePath('/adventure');
    revalidatePath('/reward');
    return { ok: true, message: '伺服器側紀錄已要求重新整理。客户端 localStorage 請由 Settings 頁面重置。' };
  } catch (error) {
    return { ok: false, message: `重置今日紀錄失敗：${(error as Error).message}` };
  }
}

export async function resetCardRecord(): Promise<{ ok: boolean; message: string }> {
  try {
    revalidatePath('/collection');
    revalidatePath('/reward');
    revalidatePath('/');
    return { ok: true, message: '伺服器側已要求重新整理。客户端 localStorage 請由 Settings 頁面清除。' };
  } catch (error) {
    return { ok: false, message: `重置卡片紀錄失敗：${(error as Error).message}` };
  }
}

export async function resetGlobal(): Promise<{ ok: boolean; message: string }> {
  try {
    revalidatePath('/');
    revalidatePath('/pet');
    revalidatePath('/practice');
    revalidatePath('/adventure');
    revalidatePath('/boss');
    revalidatePath('/reward');
    revalidatePath('/collection');
    return { ok: true, message: '伺服器側已要求重新整理。客户端 localStorage 請由 Settings 頁面重置。' };
  } catch (error) {
    return { ok: false, message: `全域重置失敗：${(error as Error).message}` };
  }
}
