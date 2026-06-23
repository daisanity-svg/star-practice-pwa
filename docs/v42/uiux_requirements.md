# UI/UX Requirements V4.2

## 1. Kid-Safe Visual Language
- 可用色彩：溫暖主色、成功綠、警告琥珀、錯誤紅
- 圓角 16–24，避免尖角
- 陰影柔和，不用硬邊
- 字級最小 16，正文 18，標題 22–28
- 禁用裝飾性 emoji，圖示只用 SVG

## 2. Mobile First Layout
- Container：max-width 520，左右 padding 16
- Safe area：底部導航需加 env(safe-area-inset-bottom)
- 內容區 padding-bottom 需大於 bottom nav 高度
- 所有可點擊元件最小 48x48

## 3. Bottom Navigation Behavior
- height 64 + safe area
- icon 24x24、label 14
- 目前頁 active 粗體/底色
- 點擊要有觸感回饋（transform scale + transition）

## 4. Card System
統一卡片樣式：
- padding 16
- radius 16
- border 1 solid; shadow 柔和
- 內容與邊界至少保留 12

## 5. CTA Priority
- 主要 CTA：full width on mobile; min-h 56
- 次要 CTA：outline/ghost
- 危險/取消：destructive style
- disabled：降低透明度 + cursor not-allowed

## 6. Loading and Empty State
- loading：骨架或 spinner
- empty：插圖 + 鼓勵語
- error：驚嘆圖示 + 重試按鈕

## 7. Feedback
- 答對：綠色 card + 星星動畫
- 答錯：搖晃提示 + 鼓勵語（不懲罰）
- 戰鬥動畫：短暫 overlay，非長時間阻塞

## 8. Discoverability
- 頁面主標題清楚
- 次要說明以小字呈現
- CTA 懸浮或固定下方，易於拇指觸控
