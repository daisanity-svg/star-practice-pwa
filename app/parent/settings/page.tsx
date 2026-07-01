'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CompanionBar } from '@/components/CompanionBar';
import type { PracticeSettings } from '@/lib/data/settings';
import { getPracticeSettings } from '@/lib/data/settings';

type ModeState = { ok: boolean; message: string } & { currentMode?: 'test' | 'production' };

function cn(...classes: (string | boolean | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

const MODE_BUTTON =
  'flex min-h-[54px] w-full items-center justify-center rounded-[24px] text-base font-black active:scale-[0.99] disabled:opacity-60';

function getInitialMode(): 'test' | 'production' {
  if (typeof window === 'undefined') return 'production';
  try {
    const raw = window.localStorage.getItem('star-game-v5-state');
    if (raw) {
      const parsed = JSON.parse(raw) as any;
      if (parsed.practiceMode === 'test' || parsed.practiceMode === 'production') {
        return parsed.practiceMode;
      }
    }
  } catch {}
  return 'production';
}

export default function ParentSettingsPage() {
  const [settings, setSettings] = useState<PracticeSettings | null>(null);
  const [currentMode, setCurrentMode] = useState<'test' | 'production'>(getInitialMode);
  const [modeState, setModeState] = useState<ModeState>(null as any);
  const [isPending, setIsPending] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPracticeSettings().then((s) => {
      if (!cancelled) setSettings(s);
    });
  }, []);

  const handleModeSwitch = async (mode: 'test' | 'production') => {
    setIsPending(true);
    try {
      setCurrentMode(mode);
      setModeState({ ok: true, message: `已切換為${mode === 'test' ? '測試模式' : '正式模式'}`, currentMode: mode });
      if (typeof window !== 'undefined') {
        try {
          const raw = window.localStorage.getItem('star-game-v5-state');
          const parsed = raw ? (JSON.parse(raw) as any) : {};
          window.localStorage.setItem(
            'star-game-v5-state',
            JSON.stringify({ ...parsed, practiceMode: mode, stateVersion: 5 })
          );
        } catch {}
      }
    } catch {
      setModeState({ ok: false, message: '切換模式失敗', currentMode: mode });
    } finally {
      setIsPending(false);
    }
  };

  const clearTodayFlags = () => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('star-game-v5-state');
      if (!raw) {
        setResetMsg('沒有本地遊戲資料。');
        return;
      }
      const state = JSON.parse(raw);
      const restored = {
        ...state,
        todayPracticeCount: 0,
        lastPracticeDate: null,
        lastDrawDate: null,
      };
      window.localStorage.setItem('star-game-v5-state', JSON.stringify({ ...restored, stateVersion: 5 }));
      setResetMsg('今日練習與抽卡紀錄已重置。');
    } catch {
      setResetMsg('重置失敗，請稍後再試。');
    }
  };

  const clearCardRecords = () => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem('star-game-v5-state');
      setResetMsg('本地卡片與遊戲狀態已清除。資料庫卡片紀錄請家長進資料庫手動管理。');
    } catch {
      setResetMsg('清除失敗，請稍後再試。');
    }
  };

  const clearAll = () => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem('star-game-v5-state');
      window.localStorage.removeItem('star-map-progress');
      setResetMsg('全部遊戲進度已重置。');
    } catch {
      setResetMsg('重置失敗，請稍後再試。');
    }
  };

  const modeLabel = currentMode === 'test' ? '測試模式' : '正式模式';
  const modeDescription =
    currentMode === 'test'
      ? '現在是測試模式：練習與抽卡可以重複測試，不會影響正式進度。'
      : '現在是正式模式：每日練習與抽卡會累積真實進度。';

  return (
    <main className="admin-shell safe-screen">
      <CompanionBar title="遊戲設定" backHref="/parent/dashboard" backLabel="後台" />
      <div className="mb-4 flex items-center justify-between">
        <Link href="/parent/dashboard" className="rounded-full bg-white/80 px-4 py-3 text-base font-black text-slate-600 shadow-sm">
          ← 後台
        </Link>
        <Link href="/practice" className="rounded-full bg-white/80 px-4 py-3 text-base font-black text-grape shadow-sm">
          練習
        </Link>
      </div>

      <section className="kid-card p-6">
        <p className="text-base font-bold text-grape">Game Mode</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-ink">遊戲模式</h1>
        <p className="mt-3 text-base font-bold leading-relaxed text-slate-500">
          切換正式或測試模式。切換後，首頁與練習分頁會立刻套用新規則。
        </p>
        <div className="mt-4 rounded-[22px] bg-white/80 p-4 shadow-sm">
          <p className="text-sm font-black text-slate-500">目前模式</p>
          <p className="mt-1 text-3xl font-black text-ink">{modeLabel}</p>
          <p className="mt-2 text-base font-bold leading-relaxed text-slate-500">{modeDescription}</p>
        </div>
      </section>

      <section className="mt-5 grid gap-3">
        <div className="rounded-[28px] bg-white/75 p-5 shadow-sm">
          <h2 className="text-xl font-black text-ink">切換模式</h2>
          <p className="mt-2 text-base font-bold leading-relaxed text-slate-500">
            切換後立刻生效。測試模式下練習與抽卡可重複進行。
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleModeSwitch('production')}
              disabled={currentMode === 'production'}
              className={cn(
                MODE_BUTTON,
                currentMode === 'production'
                  ? 'bg-[#1766e6] text-white shadow-sm'
                  : 'bg-white text-[#1766e6]'
              )}
            >
              正式模式
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('test')}
              disabled={currentMode === 'test'}
              className={cn(
                MODE_BUTTON,
                currentMode === 'test'
                  ? 'bg-[#ffd95a] text-[#7a4f00] shadow-sm'
                  : 'bg-white text-[#7a4f00]'
              )}
            >
              測試模式
            </button>
          </div>
          {modeState && (
            <p
              className={`mt-3 rounded-2xl p-3 text-sm font-black ${
                modeState.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {modeState.message}
            </p>
          )}
        </div>

        <div className="rounded-[28px] bg-white/75 p-5 shadow-sm">
          <h2 className="text-xl font-black text-ink">今日紀錄重置</h2>
          <p className="mt-2 text-base font-bold leading-relaxed text-slate-500">
            清除本日練習、抽卡與收納紀錄，保留星星幣與能量。
          </p>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.confirm('確定要重置今日紀錄嗎？星星幣和能量會保留。')) {
                clearTodayFlags();
              }
            }}
            className="mt-4 kid-white-button flex min-h-[54px] w-full items-center justify-center rounded-[22px] text-base font-black active:scale-[0.99]"
          >
            重置今日紀錄
          </button>
        </div>

        <div className="rounded-[28px] bg-white/75 p-5 shadow-sm">
          <h2 className="text-xl font-black text-ink">卡片紀錄重置</h2>
          <p className="mt-2 text-base font-bold leading-relaxed text-slate-500">
            清除本地卡片與遊戲狀態。資料庫的抽卡與收納紀錄請家長進資料庫手動管理。
          </p>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.confirm('確定要清除卡片紀錄嗎？此操作無法復原。')) {
                clearCardRecords();
              }
            }}
            className="mt-4 kid-white-button flex min-h-[54px] w-full items-center justify-center rounded-[22px] text-base font-black active:scale-[0.99]"
          >
            重置卡片紀錄
          </button>
        </div>

        <div className="rounded-[28px] bg-white/75 p-5 shadow-sm">
          <h2 className="text-xl font-black text-ink">全部遊戲重置</h2>
          <p className="mt-2 text-base font-bold leading-relaxed text-slate-500">
            清除所有本地進度，包含星星幣、能量、地圖冒險與小光獸。
          </p>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.confirm('確定要全部重置嗎？所有遊戲進度都會歸零。')) {
                clearAll();
              }
            }}
            className="mt-4 bg-[#fee2e2] px-5 py-4 text-base font-black text-[#991b1b] shadow-sm active:scale-[0.99]"
          >
            全部遊戲重置
          </button>
        </div>
      </section>

      {resetMsg && (
        <div className="mt-5 rounded-[24px] bg-[#f0f9ff] p-4 text-base font-black text-[#155dfc] shadow-sm">
          {resetMsg}
        </div>
      )}

      {settings && (
        <section className="mt-5 rounded-[28px] bg-white/75 p-5 shadow-sm">
          <p className="text-sm font-black text-slate-500">每日題數</p>
          <p className="mt-1 text-3xl font-black text-ink">{settings.daily_total_questions} 題</p>
          <p className="mt-2 text-sm font-black text-slate-500">出題比例</p>
          <p className="mt-1 text-xl font-black text-ink">
            新題 {settings.new_item_ratio}%｜複習 {settings.review_item_ratio}%｜弱點 {settings.weakness_item_ratio}%
          </p>
          <p className="mt-2 text-sm font-black text-slate-500">每日抽卡限制</p>
          <p className="mt-1 text-3xl font-black text-ink">{settings.daily_draw_limit} 次</p>
          <p className="mt-2 text-sm font-black text-slate-500">加碼條件</p>
          <p className="mt-1 text-xl font-black text-ink">
            正確率 {settings.min_correct_rate_for_bonus}% 或弱點答對 {settings.weakness_bonus_required} 題
          </p>
        </section>
      )}
    </main>
  );
}
