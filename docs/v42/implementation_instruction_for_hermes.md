# Implementation Instruction For Hermes

## 0. Guardrails
- 僅修改下列檔案：
  - `app/page.tsx`
  - `app/pet/page.tsx`
  - `app/boss/page.tsx`
  - `app/adventure/page.tsx`
  - `app/practice/page.tsx`
  - `app/reward/page.tsx`
  - `components/KidBottomNav.tsx`
  - `PracticeRunner.tsx`
  - `app/globals.css`
- 不改 lib/data/**、app/api/**
- 不使用 emoji
- 圖示使用 inline SVG
- 以繁體中文呈現

## 1. 統一 Design Tokens (globals.css)
新增 child-safe 變數：
- --kid-primary、--kid-success、--kid-danger、--kid-warn
- --kid-radius: 16px
- --kid-btn-min-h: 56px
- --kid-safe-bottom: env(safe-area-inset-bottom, 0px)
- 統一卡片陰影、間距、字級（base 18，heading 22–28）

## 2. /pet 小光獸（app/pet/page.tsx）
實作要點：
- Pet 角色具 SVG (CSS draw) 或可愛圖示區塊，預設可見
- 互動按鈕：餵食、玩耍、休息，點擊後顯示動畫回饋
- 與答題/星星幣/任務資料來源：保留最小 coupling，用 events/context 或現有 practice/reward 資料串接
- 顯示：名稱、等級、經驗條、星星幣
- 可互動：點 pet 會播放動畫

## 3. /boss 戰鬥（app/boss/page.tsx）
- 「開始戰鬥」按鈕要有 loading/disabled 狀態
- 點擊後 into battle flow（可用 modal 或 battle sheet）
- 顯示題目 → 選項 → 立即回饋（成功/失敗動畫）
- 戰鬥流程為 state machine：idle -> loading -> question -> feedback -> reward

## 4. /adventure 冒險（app/adventure/page.tsx）
- 頁面內容加 padding-bottom，至少保留 bottom nav 高度 + safe area
- 世界切換（3 tabs）+ 說書人敘述區塊
- CTA 固定在內容底側（非全站導航層）
- 與 practice/boss/reward 的關聯以「前往練習/挑戰 Boss」按鈕呈現

## 5. PracticeRunner (PracticeRunner.tsx)
強化狀態：
- 載入 skeleton
- 禁用互動（submitting 時鎖按鈕）
- 正確/錯誤提示卡片
- 觸控目標加大

## 6. KidBottomNav（components/KidBottomNav.tsx）
- height 固定 + safe area padding
- icon + label
- 當前頁高亮
- active indicator 圓角

## 7. 全站互動語態
按鈕建構：
<button disabled={loading || submitting} aria-busy={loading} className="kid-btn ...">
  {loading ? <Spinner /> : label}
</button>
