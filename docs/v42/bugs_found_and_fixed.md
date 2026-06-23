# Bugs Found and Fixed

## Bug 1：/boss 勝利後 localStorage 未更新
- **檔案**：`app/boss/page.tsx`
- **原因**：`finishBattle` 內呼叫 `addStars(5)`、`addStarlight(2)`、`addBossWin()`，這些函式內部皆已呼叫 `saveGameState`。但隨後又呼叫一次 `saveGameState(updated)`，其中 `updated` 來自 `addStars(5)` 的回傳值（較舊的快照），覆寫了星星幣、星光碎片、Boss 勝場等新狀態。
- **修復**：移除此多餘的 `saveGameState(updated)` 呼叫，讓後續 mutators 各自持久化。
- **驗證**：擊敗 Boss 後重新整理頁面，localStorage 內有正確的星星幣、星光碎片、bossWins 變化。

## Bug 2：/pet 互動後 localStorage 未更新
- **檔案**：`app/pet/page.tsx`
- **原因**：`handleFeed` 內呼叫 `addStars(-5)`、`addPetExp(5)`、`setPetMood('happy')` 後，又呼叫 `saveGameState({ ...updated })`。`updated` 是 `addStars(-5)` 的返回值，不包含 petExp 與 petMood 的新值，導致 petExp 與 mood 的更新被覆蓋。
- **修復**：移除此多餘的 `saveGameState({ ...updated })` 呼叫。
- **驗證**：點擊「玩耍」按鈕後，localStorage 內正確記錄 petEnergy=2、petIntimacy=3、petExp=2、petMood="excited"。

## Bug 3：/practice 完成後 localStorage 未更新（PracticeRunner）
- **檔案**：`components/PracticeRunner.tsx`
- **原因**：完成練習後呼叫 `addStars`、`addStarlight`、`addPetExp`、`incrementPracticeCount` 後，又呼叫 `saveGameState(updatedStars)`，以僅含星星幣變動的舊快照覆寫完整狀態。
- **修復**：移除此多餘的呼叫。
- **驗證**：完成練習流程後，localStorage 內正確記錄星星幣、星光碎片、petExp、todayPracticeCount。

## 根因
演化比相容的花費（破窗）。

## 核心開發原則
所有變更必須確保系統穩定運行，且程式碼易於後續優化與修改。

## 脈絡
V4.2 在發佈前驗收中發現這三處共享同一錯誤模式：在 state mutators 之後再用舊快照 `saveGameState`。修復後 UI 互動能正確反映到 localStorage。
