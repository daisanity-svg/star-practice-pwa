# Supabase 設定指南｜星見練習本

本專案第一版以 Supabase Free 作為資料庫與圖片儲存，目標是不產生額外月費。

## 1. 建立 Supabase 專案

1. 前往 Supabase。
2. 建立新專案。
3. 記下 Project URL 與 anon public key。
4. 暫時不要使用付費功能。

## 2. 建立資料表

到 Supabase 專案後台：

1. 打開 SQL Editor。
2. 複製 `supabase/schema.sql` 全部內容。
3. 執行 SQL。
4. 確認資料表建立成功。

## 3. 匯入初始資料

1. 打開 SQL Editor。
2. 複製 `supabase/seed.sql` 全部內容。
3. 執行 SQL。
4. 確認已建立星見、注音、英文、記憶詞、題型模板與示範卡包。

## 4. 設定環境變數

在本機建立 `.env.local`：

```bash
NEXT_PUBLIC_SUPABASE_URL=你的 Supabase Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 Supabase anon public key
```

如果部署到 Vercel，也要在 Vercel Project Settings > Environment Variables 放入同樣兩個變數。

## 5. Storage 設定

Phase 4 已加入卡片圖片上傳與 Canvas 套版，請先建立以下 bucket：

```txt
card-assets
```

建議設定：

1. Public bucket：開啟
2. 檔案大小上限：5MB
3. 支援格式：png、jpg、jpeg、webp

此 bucket 會存兩種檔案：

1. `source/`：家長上傳的原圖
2. `rendered/`：系統套版後的卡片圖

未來如果要再細分，也可以再建立：

1. `memory-images`：記憶詞圖片
2. `memory-audio`：記憶詞音檔

## 6. RLS 與 Storage Policy 注意事項

第一版是家庭自用 MVP。若你只在自己家使用，可先用簡單 policy 讓後台可以上傳圖片。

正式部署並公開網址後，建議：

1. 啟用 RLS。
2. 僅允許已登入家長管理後台資料。
3. 小孩端只讀取必要資料。
4. 不要把 service role key 放到前端。
5. Storage 上傳權限需限制在家長登入後才可使用。

## 7. 本機測試

```bash
npm install
npm run dev
```

測試頁面：

```txt
/parent/cards
```

測試流程：

1. 新增系列。
2. 新增分類。
3. 上傳圖片並套版成卡片。
4. 儲存卡片。
5. 建立卡包。
6. 把卡片加入卡包並設定庫存。

## 8. 下一步

完成 Supabase 設定後，下一個開發階段是 Phase 5：

1. 完成練習後觸發抽卡。
2. 從 `reward_pack_items` 加權隨機抽卡。
3. 寫入 `child_card_inventory`。
4. 寫入 `reward_draw_logs`。
5. 卡包庫存自動減 1。
