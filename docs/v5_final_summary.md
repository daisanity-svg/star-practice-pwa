# V5 FINAL 收斂總結

## 1. homepage_loop_fix_summary
- 修復「今天冒險完成度 140%」問題：所有進度百分比 clamp 在 0~100%，並改為「今日進度：x/y」與「已完成 x 個任務」。
- 首頁主視覺標題改為「跟小光獸 開始今天的冒險」。
- 主 CTA 依狀態動態切換：未練習→開始練習、已練習→開始冒險、已冒險→挑戰 Boss、完成 Boss 且可抽卡→打開今日卡包。
- 首頁加入資源摘要列：星星幣、能量、成長 Lv、親密度 Lv。

## 2. resource_display_summary
- CompanionBar 固定資源列增加「親密度 Lv」晶片。
- 首頁、/pet、/adventure、/boss、/practice 完成頁均可看到資源變化或狀態摘要。
- 文案：星星幣用來互動，能量用來成長。

## 3. pet_growth_final_summary
- /pet 清楚呈現：餵食（5 星星幣，親密度 +5）、玩耍（1 能量，親密度 +3）、成長（消耗能量升級）。
- 每次操作後顯示：消耗了什麼、增加了什麼、距離下一級還差多少。
- 外觀三段明顯：Lv1 小光蛋、Lv2-3 幼年小光獸、Lv4+ 守護小光獸。
- 資源不足時按鈕 disabled 並提示如何取得資源。

## 4. adventure_final_summary
- 說書人常駐區已隱藏：adventure 頁面 CompanionBar dialogue 改為空字串，不再遮擋畫面。
- 冒險第一關為互動配對題（已內建互動題庫）。
- 完成冒險 +2 星星幣，依題數 +能量。
- 完成後回到地圖，並清楚顯示下一步。

## 5. boss_final_summary
- Boss 不再是問號 placeholder：idle 與戰鬥狀態都有正式 Boss 圖（迷霧熊王、黑雲龍等向量圖）。
- idle 狀態顯示 Boss HP 與玩家能量提示。
- 戰鬥狀態即時顯示 HP、能量與題目。
- 3 秒內答對顯示兒童友善文案「超快反應獎勵 +X 星星幣、+X 能量」。
- 勝利給 +2 星星幣，速度獎勵額外 +1 星星幣 +1 能量。

## 6. reward_pool_final_summary
- 前台已確認使用單一 pool 邏輯：後台多獎池 UI 可保留，前台 API、抽卡邏輯與 DB 查詢皆以單一 pool（daily）為主。
- 已抽過的卡不會再進候選。
- DB schema 足以支援單一 pool + 去重。

## 7. pwa_branding_summary
- 重新產生 PWA icons：icon-192.png（192x192 RGB）、icon-512.png（512x512 RGB）、apple-touch-icon.png（180x180 RGB）。
- favicon.ico 已從 512px 轉換。
- 更新 manifest.json：name=小光獸夥伴、short_name=小光獸、theme_color=#EEF7FF、background_color=#EEF7FF。
- 更新 Next.js layout.tsx metadata icons 與 appleWebApp title=小光獸、themeColor=#EEF7FF。
- /manifest.json 與 /apple-touch-icon.png 可公開讀取。

## 8. reset_sql_recommendations
後台重按鈕已可 reset localStorage。若需 DB 級 reset，建議如下 SQL，請在 Supabase dashboard 的 SQL Editor 執行：

```sql
-- 1. 歸零遊戲狀態（localStorage 已由 resetV5GameState 處理）
-- 此為 DB 備份層建議，若無獨立 player_progress 表則跳過

-- 2. 歸零抽卡 Record（視 schema 而定）
UPDATE public.draw_rewards
SET
  updated_at = now(),
  -- 視有無 last_draw_date / draw_count 欄位清空
  last_draw_date = NULL,
  draw_count = 0
WHERE is_active = true;

-- 3. 歸零練習 Record
UPDATE public.practice_records
SET
  updated_at = now(),
  -- 視情況清空
  score = NULL,
  completed_at = NULL;

-- 4. 歸零寶寶戰勝利計數（若 DB 有存）
UPDATE public.children
SET boss_wins = 0, today_practice_count = 0, last_practice_date = NULL;

-- 5. 保留 cards / card_series / child_card_inventory
-- 如欲一併洗掉玩家已擁有卡片，可執行：
-- DELETE FROM public.child_card_inventory;
```

## 9. verified_build_report
- npm run typecheck ✅
- npm run lint ✅
- npm run build ✅（Static 17 routes + dynamic /reward）
- Dev server localhost:3000 啟動 ✅
- localStorage fresh state 維持 ✅

## 10. mobile_manual_test_report
- 首頁：主標題「跟小光獸 開始今天的冒險」、主 CTA「開始練習」、資源列顯示正確、版本標記 V5 FINAL · dc269fb ✅
- /pet：三段外觀清楚、養成按鈕與消耗提示明確、資源不足 disabled ✅
- /adventure：互動配對題、說書人已收起、完成冒險 +2 星星幣 +1 能量 ✅
- /boss：Boss 圖、HP、能量顯示；戰鬥題介面正常；速度獎勵文案兒童友善 ✅
- /practice：完成頁顯示星星幣與能量獎勵 ✅
- /reward、/collection、/parent/dashboard：資源與版本標記正確 ✅

## 11. commit_and_push_result
```
commit dc269fb
fix(boss): show HP/energy on idle and keep speed reward friendly

04df9de..dc269fb  main -> main
https://github.com/daisanity-svg/star-practice-pwa/compare/04df9de..dc269fb
```

## 12. production_version_check
- 正式站：https://star-practice-pwa.vercel.app
- 首頁版本標記：V5 FINAL · dc269fb
- 家長後台版本標記：V5 FINAL · 收斂完成 ✅

## 13. final_test_url
https://star-practice-pwa.vercel.app

## 14. remaining_blockers
無已知 blocker。建議後續可擴展冒險互動題庫與 Boss 關卡多樣性。
