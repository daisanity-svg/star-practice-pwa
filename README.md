# 星見練習本｜Star Practice PWA

手機優先的兒童英文與注音練習 PWA。目標是家庭自用、零額外月費、不串接付費 API、不上架 App Store。

## 產品定位

這是一套給幼兒使用的英文與注音練習系統，包含：

- 小孩端手機練習介面
- 今日練習任務
- 注音與英文題目
- 家長後台
- 學習進度與弱點複習架構
- 通關後抽卡與收納包收藏系統

## 技術架構

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase 預留整合
- PWA manifest
- 手機優先 RWD

## 目前 v1.0 基礎架構

已先建立：

1. 小孩端首頁 `/`
2. 今日練習頁 `/practice`
3. 家長登入頁 `/parent/login`
4. 後台 Dashboard `/parent/dashboard`
5. PWA 設定 `/public/manifest.json`
6. 基本元件與資料夾架構

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

建立 `.env.local`，日後串接 Supabase 時使用：

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

第一版先不串接 OpenAI API，也不使用任何付費 API。

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
- 可管理卡片、系列、卡包
- 可查看學習進度
- 可持續新增內容，避免孩子太快玩膩
