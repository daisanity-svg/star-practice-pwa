# Remaining Validation Summary

## Overview
補完 V4.2 發佈前剩餘驗收項目。已完成全部可測範圍。

## Coverage
- /reward：可載入、顯示今日獎勵卡片、不崩潰。
- /collection：可載入、顯示已收藏卡片。
- 手機 viewport（iPhone 12/13 尺寸）：KidBottomNav 為 floating 佈局，未遮擋主要內容。
- 全頁 console 掃描：無 JS Error。

## 未完成 / 需要人工確認
- /reward 抽卡流程：今日已有一張抽卡紀錄（資料庫有 today's draw logs），頁面顯示「今天已經找到這位朋友了」。在 test mode 下，預期 UI 仍可進行抽卡，但因今日已存在 draw log，UI 顯示既有結果而非抽卡按鈕。此行為與「只讀今日結果」的 Server Component 設計一致，若需要在 test mode 強制重抽，需額外調整（超出本次範圍）。
- 無其他阻塞性問題。

## Recommendation
- 如需 test mode 支援重複抽卡，建議於 `app/reward/page.tsx` 或 `RewardDrawPanel.tsx` 加上 test mode 判斷，於 test mode 忽略既有 draw log。
- 其餘驗收項目均通過。
