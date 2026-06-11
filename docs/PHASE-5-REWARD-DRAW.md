# Phase 5｜完成練習後觸發抽卡

本階段目標是完成 PRD v1.0 中的核心閉環：

> 完成練習 → 打開卡包 → 隨機獲得卡片 → 進入收納包 → 卡包庫存 -1

## 已完成內容

### 1. 抽卡 Server Action

新增：

```txt
lib/actions/draw-reward.ts
```

功能：

1. 讀取第一位孩子資料。
2. 讀取目前啟用中的卡包。
3. 從 `reward_pack_items` 中取得仍有庫存的卡片。
4. 依 `weight` 權重隨機抽出一張卡。
5. 將卡片寫入 `child_card_inventory`。
6. 若已擁有同卡，更新 `quantity + 1`。
7. 將 `reward_pack_items.stock - 1`。
8. 寫入 `reward_draw_logs`。
9. 若有 practice_record_id，標記該次練習 `reward_claimed = true`。

### 2. 小孩端獎勵頁

新增：

```txt
app/reward/page.tsx
```

頁面流程：

1. `/reward` 顯示今日驚喜卡包。
2. 點擊「打開卡包」後進入 `/reward?draw=1`。
3. 系統執行抽卡。
4. 顯示抽到的卡片。
5. 可前往 `/collection` 查看收納包。

### 3. 今日練習頁接到獎勵頁

更新：

```txt
app/practice/page.tsx
```

完成示範題後，按鈕改為：

```txt
完成今日練習，去拿獎勵
```

導向：

```txt
/reward
```

### 4. 收納包顯示已獲得卡片

更新：

```txt
app/collection/page.tsx
lib/data/rewards.ts
```

收納包現在除了顯示系列完成度，也會顯示：

1. 已獲得卡片。
2. 卡片圖片。
3. 系列名稱。
4. 稀有度。
5. 持有數量。

### 5. Demo fallback

若尚未設定 Supabase，抽卡頁仍會顯示示範卡：

```txt
紅色小車
```

這樣可以先測 UI，不會因資料庫尚未建立而中斷。

## 測試流程

### 尚未連接 Supabase

```bash
npm run dev
```

打開：

```txt
/practice
```

流程：

1. 點「完成今日練習，去拿獎勵」。
2. 到 `/reward`。
3. 點「打開卡包」。
4. 顯示示範卡。
5. 點「放進收納包」。
6. 到 `/collection`。

### 已連接 Supabase

請先確認資料庫有：

1. `children` 至少一筆孩子資料。
2. `card_series` 至少一筆系列。
3. `cards` 至少一張卡。
4. `reward_packs` 至少一個啟用卡包。
5. `reward_pack_items` 至少一筆有庫存卡片。

再測：

```txt
/reward
```

若抽卡成功，資料會寫入：

```txt
child_card_inventory
reward_draw_logs
```

並且：

```txt
reward_pack_items.stock
```

會自動減 1。

## 注意事項

1. 目前抽卡頁是第一版流程，尚未限制「每天只能抽一次」。
2. 目前練習完成仍為示範模式，尚未建立真正 practice_record。
3. 下一階段應建立正式練習完成紀錄，並以 reward_rules 控制是否可抽卡。

## 下一步建議

Phase 6 建議處理：

1. 建立真實作答流程。
2. 每題答題後寫入 `practice_attempts`。
3. 產生 `practice_records`。
4. 今日任務完成後才允許抽卡。
5. 避免同一天重複抽同一個每日卡包。
6. 後台顯示抽卡紀錄。
