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
