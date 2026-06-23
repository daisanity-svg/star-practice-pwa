# V4.2 Problem Analysis

## 1. Scope Overview
V4.2 同時處理功能修復與全站 UI/UX 優化，目標受眾為 3–6 歲兒童。所有變更僅限 UI 層：`app/*/page.tsx`、`components/KidBottomNav.tsx`、`PracticeRunner.tsx`、`app/globals.css`。

## 2. Problem Map

### 2.1 /pet 小光獸
- 角色未明顯可見，互動無回饋
- 與答題進度、星星幣、每日任務無語意連動
- 養成感不足，缺乏成長表現（等級/飢餓/經驗/互動動畫）

### 2.2 /boss 戰鬥
- 「開始戰鬥」按鈕無狀態變化，使用者不清楚下一步
- 未進入戰鬥流程題目回合
- 答對/答錯回饋不清晰，也沒有視覺/語音引導

### 2.3 /adventure 冒險
- content 被 bottom nav 擋住
- 三世界與說書人內容 CTA 不夠明顯
- 與練習/Boss/劇情的關聯說明不足

### 2.4 全站 UI/UX
- 手機優先設計不足：safe area 忽視、部分元素貼邊
- 卡片樣式不一致，主 CTA 層級混亂
- 禁用狀態與載入狀態不明確，兒童難以理解
- 觸控目標偏小（建議 >= 48px）
- 字級/留白不統一，閱讀壓力大

## 3. Root Causes
- 頁面缺乏統一的 child-safe design token
- 互動元件缺少 disabled/loading/success/error 語態
- 導航內容高度固定，未處理 env(safe-area-inset-bottom)
- 狀態傳遞分散，無統一 context/state manager

## 4. V4.2 Objectives
1. 兒童友善互動回饋（動畫、聲音提示可選、成功/失敗狀態）
2. 手機優先排版與安全區域
3. 功能可用：pet 可見可互動、boss 可戰鬥、adventure 內容不被遮擋
4. 統一視覺層級：卡片、按鈕、導航
