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

## 5. Storage 建議

之後需要上傳卡片圖片、記憶詞圖片與音檔時，建議建立以下 bucket：

1. `memory-images`：記憶詞圖片
2. `memory-audio`：記憶詞音檔
3. `card-source-images`：原始卡片圖片
4. `rendered-cards`：套版後卡片圖片

第一版可以先只建立 `card-source-images` 與 `rendered-cards`。

## 6. RLS 注意事項

第一版家庭自用、未公開前，可以先在開發階段關閉 RLS 或使用簡單 policy。

正式部署並公開網址後，建議：

1. 啟用 RLS。
2. 僅允許已登入家長管理後台資料。
3. 小孩端只讀取必要資料。
4. 不要把 service role key 放到前端。

## 7. 下一步

完成 Supabase 設定後，下一個開發階段是：

1. 將小孩端首頁改為讀取 Supabase 的孩子資料。
2. 將今日練習頁改為讀取 `generated_questions`。
3. 建立後台學習項目管理頁。
4. 建立後台記憶詞管理頁。
