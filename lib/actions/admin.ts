'use server';

import { revalidatePath } from 'next/cache';
import { resetGameState } from '@/lib/game/state';
import { resetProgress } from '@/lib/story/local-storage';

export async function resetV5GameState(): Promise<void> {
  try {
    resetGameState();
    resetProgress();
    revalidatePath('/');
    revalidatePath('/pet');
    revalidatePath('/practice');
    revalidatePath('/adventure');
    revalidatePath('/boss');
    revalidatePath('/reward');
    revalidatePath('/collection');
  } catch (error) {
    console.error('resetV5GameState failed', error);
  }
}

export async function resetTodayRecord(): Promise<{ ok: boolean; message: string }> {
  try {
    const state = resetGameState();
    const today = new Date().toISOString().slice(0, 10);
    const restored = {
      ...state,
      todayPracticeCount: 0,
      lastPracticeDate: null,
      lastDrawDate: null,
    };
    // keep stars/energy/growth/intimacy, only reset daily flags
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('star-game-v5-state', JSON.stringify({ ...restored, stateVersion: 5 }));
    }
    revalidatePath('/practice');
    revalidatePath('/adventure');
    revalidatePath('/reward');
    return { ok: true, message: '今日練習與抽卡紀錄已重置。' };
  } catch (error) {
    return { ok: false, message: `重置今日紀錄失敗：${(error as Error).message}` };
  }
}

export async function resetCardRecord(): Promise<{ ok: boolean; message: string }> {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('star-game-v5-state');
    }
    revalidatePath('/collection');
    revalidatePath('/reward');
    revalidatePath('/');
    return {
      ok: true,
      message: 'localStorage 已清除。DB 卡片紀錄（child_card_inventory、reward_draw_logs）需手動執行情境 SQL，請參閱相關建議。',
    };
  } catch (error) {
    return { ok: false, message: `重置卡片紀錄失敗：${(error as Error).message}` };
  }
}

export async function resetGlobal(): Promise<{ ok: boolean; message: string }> {
  try {
    resetGameState();
    resetProgress();
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('star-game-v5-state');
    }
    revalidatePath('/');
    revalidatePath('/pet');
    revalidatePath('/practice');
    revalidatePath('/adventure');
    revalidatePath('/boss');
    revalidatePath('/reward');
    revalidatePath('/collection');
    return { ok: true, message: '全部遊戲進度已重置。' };
  } catch (error) {
    return { ok: false, message: `全域重置失敗：${(error as Error).message}` };
  }
}
