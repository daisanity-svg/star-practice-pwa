# Acceptance Criteria V4.2

## AC1 Pet Page
- Pet 在 app/pet 可見且不會被導航遮擋
- 至少 1 個互動按鈕可按，並顯示動畫或狀態變化
- 可觀察星星幣數量或任務進度連結

## AC2 Boss Page
- 「開始戰鬥」按鈕 loading/disabled 狀態可辨別
- 點擊後進入題目流程（至少顯示一題）
- 答對顯示成功回饋；答錯顯示錯誤回饋
- 允許離開戰鬥回到 idle

## AC3 Adventure Page
- 世界內容不被 bottom nav 遮擋
- 可切換 3 個世界
- CTA 在拇指操作範圍內

## AC4 Mobile UX
- iPhone SE/12/14 尺寸截圖符合：
  - 無內容被 bottom safe area 吃掉
  - 觸控目標 >= 48px
  - 字級一致

## AC5 Visual Consistency
- 卡片樣式一致
- 主/次/危險 CTA 層級明確
- disabled/loading 狀態一致

## AC6 Performance
- lighthouse 效能分數 >= 80
- 無 JS console error（無 use client 問題）
- build 通過

## AC7 Interaction Feedback
- 每次互動 200ms 內有回應（spinner/active）
- 答題回饋於選項後 250ms 內顯示
