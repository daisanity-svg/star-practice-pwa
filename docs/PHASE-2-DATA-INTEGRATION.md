# Phase 2｜資料接線與示範資料回退

本階段目標是讓前台與後台開始接上 Supabase 資料，同時保留 demo fallback，避免尚未建立 Supabase 時畫面空白。

## 已完成

### 前台

- `/` 首頁改由 `getCollectionSummary()` 讀取收納包系列進度。
- `/practice` 今日練習頁改由 `getTodayQuestions()` 讀取題目。
- `/collection` 新增小孩端收納包頁。

### 後台

- `/parent/dashboard` 後台入口改為可點擊功能卡。
- `/parent/learning` 新增學習項目與記憶詞總覽。
- `/parent/progress` 新增熟練度與弱點進度頁。

### Data Layer

- `lib/types.ts`：共用型別。
- `lib/data/learning.ts`：學習項目、記憶詞、今日題目、進度資料。
- `lib/data/rewards.ts`：卡片系列與收納包進度。

## 設計原則

1. 若 `.env.local` 尚未設定 Supabase，會自動使用 demo data。
2. 若 Supabase 已設定，但資料表尚無資料，也會回退 demo data。
3. 小孩端只顯示簡單文字、圖片與大按鈕。
4. 家長端才顯示熟練度、弱點、題庫等資訊。

## 下一步

Phase 3 建議實作：

1. 後台新增學習項目表單。
2. 後台新增記憶詞表單。
3. 題型模板種子資料調整。
4. 每日自動生成 `generated_questions`。
5. 小孩端答題後寫入 `practice_attempts`。
6. 答題後更新 `child_learning_progress`。
