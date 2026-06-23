# Reward & Collection Test Result

## /reward
- 頁面載入正常。
- 今日抽卡狀態：資料庫已有 3 筆今日抽卡紀錄，最新一筆為 2026-06-23 08:18:30（card_id 97873904）。
- UI 顯示：「今天已經找到這位朋友了」，符合既有 draw log 的 read 結果。
- Test mode：NEXT_PUBLIC_PRACTICE_TEST_MODE=true 已生效。
- 在 test mode 下，若今日已有抽卡紀錄，UI 仍顯示既有結果卡片而非抽卡按鈕。這屬於 Server Component 的初始 state 設計。
- 未觀察到 JS Error。

## /collection
- 頁面載入正常。
- UI 顯示已收藏卡片：Tomica、Tobot。
- 未觀察到 JS Error。

## Conclusion
/reward 與 /collection 均可正常載入。在現有 draw log 存在的情況下，/reward 顯示「今天已經找到這位朋友了」而非抽卡按鈕，屬行為層級一致性設計，非功能性故障。
