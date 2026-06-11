# Phase 4｜圖片上傳與卡片套版

本階段完成家長後台的「上傳圖片 → Canvas 套版 → 儲存卡片」流程。

## 已完成

- 新增 `components/CardDesigner.tsx`
- 更新 `/parent/cards`
- 更新 `lib/actions/rewards.ts`
- 支援上傳原圖欄位 `source_image_file`
- 支援 Canvas 產生 3:4 卡面圖
- 送出後將原圖與套版卡圖寫入 Supabase Storage
- 卡片資料仍寫入 `cards` table

## 使用路徑

```txt
/parent/cards
```

## 操作流程

1. 先建立卡片系列。
2. 建立卡片分類。
3. 在「上傳圖片並套版成卡片」區塊上傳圖片。
4. 輸入卡片名稱、卡號、稀有度。
5. 按「重新套版預覽」。
6. 確認預覽後按「儲存套版卡片」。
7. 再到「把卡片放進卡包」設定庫存與權重。

## Supabase Storage 設定

需要在 Supabase 建立一個 bucket：

```txt
card-assets
```

建議設定：

- Public bucket：開啟
- 檔案大小上限：5MB
- 支援格式：png、jpg、jpeg、webp

第一版是家庭自用 MVP。若未來要公開使用，需改成登入後才能上傳，並收緊 Storage policy。

## 注意事項

- 第一版卡片套版在瀏覽器 Canvas 完成，不使用付費 API。
- 圖片太大會增加 Supabase Storage 空間使用量，建議上傳前先壓縮。
- 目前卡片版型固定為 900 × 1200 px，比例 3:4。
- 若沒有設定 Supabase，頁面仍可顯示 demo 資料，但無法真正儲存上傳圖片。

## 下一步

Phase 5 建議進入：

- 完成練習後觸發抽卡
- 從卡包庫存中加權隨機抽卡
- 寫入 `child_card_inventory`
- 寫入 `reward_draw_logs`
- 卡包庫存自動減 1
