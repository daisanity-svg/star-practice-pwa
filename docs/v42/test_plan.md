# Test Plan V4.2

## 1. Static/QA
- 截圖對比：iPhone SE / 12 / 14
- 記錄被遮擋內容比例
- 檢查按鈕大小與顏色對比

## 2. Functional
- /pet：餵食/玩耍/休息按鈕輪流
- /boss：開啟戰鬥 -> 選擇 -> 回饋 -> 結算
- /adventure：tab 切換 -> CTA -> 流程銜接

## 3. Usability
- 單手操作：拇指可觸達所有主要 CTA
- 閱讀性：字級 16+；段落間距和諧

## 4. Browser Test Matrix
- iOS Safari (iPhone)
- Android Chrome
- Desktop（僅確認不小於手機規格）

## 5. Regression
- navigation to all pages links valid
- 沒有 console error
- API route works (database connected)

## 6. Build/Typecheck/Lint
- npm run build
- npm run lint
