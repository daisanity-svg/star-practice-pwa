# Phase 3｜後台可新增資料

本階段目標是把系統從「可讀取資料」推進到「家長可管理資料」。

## 已完成

### 學習內容

- `lib/actions/learning.ts`
  - `createLearningItem`
  - `createMemoryHook`
  - `createQuestionTemplate`
- `/parent/learning`
  - 新增學習項目表單
  - 新增記憶詞表單
  - 題庫素材總覽
- `/parent/templates`
  - 新增題型模板表單
  - 題型模板列表

### 卡片與卡包

- `lib/actions/rewards.ts`
  - `createCardSeries`
  - `createCardCategory`
  - `createCard`
  - `createRewardPack`
  - `addCardToPack`
- `lib/data/admin-rewards.ts`
  - 後台卡片、系列、分類、卡包、卡包項目資料層
- `/parent/cards`
  - 新增系列
  - 新增分類
  - 新增卡片
  - 新增卡包
  - 把卡片加入卡包
  - 顯示系列卡片與卡包庫存

### 後台導覽

- `/parent/dashboard` 已連到：
  - `/parent/learning`
  - `/parent/progress`
  - `/parent/cards`
  - `/parent/templates`

## 使用方式

1. 先完成 Supabase 建置。
2. 將 `.env.local` 設定：

```bash
NEXT_PUBLIC_SUPABASE_URL=你的 Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 Supabase anon key
```

3. 啟動開發伺服器：

```bash
npm run dev
```

4. 到 `/parent/dashboard` 進入後台。

## 注意事項

目前的新增功能使用 Supabase anon key 寫入資料。這是家用開發階段的簡化做法。

若未來要公開部署給非家庭使用者，需補上：

- Supabase Auth 正式登入
- RLS policies
- 家長帳號與資料隔離
- Storage 上傳權限

## 下一階段建議

Phase 4 建議進入：

1. 後台圖片上傳到 Supabase Storage。
2. Canvas 自動套版生成卡片圖。
3. 自動產生每日題目。
4. 小孩答題後寫入 `practice_attempts`。
5. 觸發 `child_learning_progress` 熟練度更新。
