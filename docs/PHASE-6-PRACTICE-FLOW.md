# Phase 6｜真實作答流程與每日任務完成判斷

本階段把小孩端練習從「展示題目」推進到「可作答、可記錄、可完成、可領獎」的閉環。

## 已完成

1. 新增 `components/PracticeRunner.tsx`
   - 一題一頁互動流程
   - 選擇題可點選答案
   - 描寫題可用「我描好了」作為第一版完成判斷
   - 答對／答錯即時回饋
   - 支援瀏覽器 TTS 播放題目
   - 完成全部題目後送出練習紀錄

2. 新增 `lib/actions/practice.ts`
   - 建立 `practice_records`
   - 寫入每一題 `practice_attempts`
   - Supabase trigger 會更新 `child_learning_progress`
   - 完成後回傳 `practice_record_id`

3. 更新 `/practice`
   - 改為互動式今日練習流程
   - 完成後導向 `/reward?practice_record_id=...`

4. 更新 `/reward`
   - 支援接收 `practice_record_id`
   - 抽卡時會檢查該練習是否完成
   - 已領過獎勵的練習不可重複領卡

5. 更新 `drawDailyReward`
   - 有 `practice_record_id` 時必須檢查：
     - 練習紀錄存在
     - 練習已完成
     - 尚未領過獎勵
   - 抽卡成功後會將 `practice_records.reward_claimed` 設為 true

## 目前流程

```text
/practice
→ 一題一頁作答
→ 完成全部題目
→ 寫入 practice_records
→ 寫入 practice_attempts
→ trigger 更新 child_learning_progress
→ 回傳 practice_record_id
→ /reward?practice_record_id=xxx
→ 打開卡包
→ 寫入 child_card_inventory
→ reward_pack_items.stock - 1
→ reward_draw_logs 新增一筆
→ practice_records.reward_claimed = true
```

## 目前限制

1. 描寫題第一版只用「我描好了」判斷完成，尚未做筆跡精準判斷。
2. 今日任務仍以 `generated_questions` 現有資料為主，尚未自動建立每日任務。
3. 尚未正式做每日只能完成一次的嚴格限制。
4. 若尚未設定 Supabase，會使用 demo mode 測試 UI。

## 下一步建議

Phase 7 建議做「每日自動產生題目」。

目標：

1. 自動建立 `daily_learning_plan`
2. 從新題、到期複習題、弱點題中組合每日題目
3. 根據 `question_templates` 自動產生 `generated_questions`
4. 若今天已有未完成任務，繼續使用原任務
5. 若今天已完成且已領獎，提示明天再來
