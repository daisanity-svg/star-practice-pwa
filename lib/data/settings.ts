export type PracticeSettings = {
  daily_total_questions: number;
  new_item_ratio: number;
  review_item_ratio: number;
  weakness_item_ratio: number;
  daily_draw_limit: number;
  min_correct_rate_for_bonus: number;
  weakness_bonus_required: number;
};

export const demoPracticeSettings: PracticeSettings = {
  daily_total_questions: 10,
  new_item_ratio: 30,
  review_item_ratio: 40,
  weakness_item_ratio: 30,
  daily_draw_limit: 1,
  min_correct_rate_for_bonus: 90,
  weakness_bonus_required: 3
};

export async function getPracticeSettings(): Promise<PracticeSettings> {
  return demoPracticeSettings;
}
