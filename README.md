# 星見練習本｜Star Practice PWA

手機優先的兒童英文與注音練習 PWA。目標是家庭自用、零額外月費、不串接付費 API、不上架 App Store。

## v1 MVP 已完成的核心閉環

這個版本已具備一套可跑的家庭自用學習系統：

1. 小孩端首頁 `/`
2. 今日練習流程 `/practice`
3. 完成練習後抽卡 `/reward`
4. 我的收納包 `/collection`
5. 家長後台 `/parent/dashboard`
6. 學習項目與記憶詞 `/parent/learning`
7. 題型模板 `/parent/templates`
8. 學習進度與弱點 `/parent/progress`
9. 卡片、系列、分類、卡包 `/parent/cards`
10. 活動與主題週 `/parent/events`
11. 每日規則 `/parent/settings`
12. Supabase schema 與 seed
13. PWA manifest
14. 手機版 RWD 基礎樣式

## 技術架構

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Free 預留整合
- Supabase Storage 預留給卡片圖片
- PWA manifest
- 手機優先 RWD
- 不使用 OpenAI API
- 不使用付費 API

## 開發指令

```bash
npm install
npm run dev
```

開發伺服器預設：

```bash
http://localhost:3000
```

## 環境變數

建立 `.env.local`：

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

沒有填 Supabase 時，部分頁面會使用 demo fallback，方便先測 UI。

## Supabase 建置

1. 建立 Supabase Free 專案。
2. 到 SQL Editor 執行 `supabase/schema.sql`。
3. 再執行 `supabase/seed.sql`。
4. 建立 Public Storage bucket：`card-assets`。
5. 將 Supabase URL 與 anon key 填入 `.env.local`。
6. 重新啟動 `npm run dev`。

## 主要測試路徑

```text
/
/practice
/reward
/collection
/parent/dashboard
/parent/learning
/parent/templates
/parent/progress
/parent/cards
/parent/events
/parent/settings
```

## 產品原則

小孩端：

- 一頁只做一件事
- 大字、大圖、大按鈕
- 手機直式優先
- 不顯示後台資訊
- 答錯不挫折，答對有鼓勵

家長端：

- 可管理學習項目
- 可管理記憶詞
- 可管理題型模板
- 可管理卡片、系列、分類、卡包
- 可設定活動與主題週
- 可查看學習進度
- 可持續新增內容，避免孩子太快玩膩

## 後續可加強

- 真正高精度 Canvas 筆跡軌跡判斷
- 更完整的家長登入權限
- 更多卡片模板樣式
- 更細緻的連續天數獎勵
- 部署到 Vercel 後加入手機主畫面
