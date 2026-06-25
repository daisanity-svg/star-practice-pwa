'use client';

import { useEffect, useState, useCallback } from 'react';
import { useActionState } from 'react';
import Link from 'next/link';
import { createCard, type CardFormState } from '@/lib/actions/rewards';
import { getCardSeries } from '@/lib/data/admin-rewards';
import { CompanionBar } from '@/components/CompanionBar';
import { supabase } from '@/lib/supabase';

type CardSeries = {
  id: string;
  name: string;
  cover_image_url?: string | null;
  description?: string | null;
  is_active?: boolean | null;
};

type RecentCard = {
  id: string;
  name: string;
  card_no: string | null;
  created_at: string;
  source_image_url: string | null;
  rendered_card_image_url: string | null;
};

const cardShellClass = 'rounded-[28px] bg-white/75 p-5 shadow-sm';
const inputClass =
  'mt-2 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-base font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100';
const labelClass = 'text-sm font-black text-slate-700';

export default function ParentCardsPage() {
  const [series, setSeries] = useState<CardSeries[]>([]);
  const [seriesLoading, setSeriesLoading] = useState(true);
  const [recentCards, setRecentCards] = useState<RecentCard[]>([]);
  const [formState, formAction, isSubmitting] = useActionState<CardFormState, FormData>(createCard, null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getCardSeries();
        if (!cancelled) {
          setSeries(data);
        }
      } catch (e) {
        console.error('fetch series failed', e);
      } finally {
        if (!cancelled) {
          setSeriesLoading(false);
        }
      }

      if (!cancelled && supabase) {
        try {
          const { data } = await supabase
            .from('cards')
            .select('id, name, card_no, created_at, source_image_url, rendered_card_image_url')
            .order('created_at', { ascending: false })
            .limit(8);
          if (!cancelled && data?.length) {
            setRecentCards(data);
          }
        } catch (e) {
          console.error('fetch recent cards failed', e);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const resetForm = () => {
    const form = document.getElementById('create-card-form') as HTMLFormElement | null;
    form?.reset();
  };

  return (
    <main className="admin-shell safe-screen">
      <CompanionBar title="卡片管理" backHref="/" backLabel="小孩端" />

      <section className={`kid-card p-5`}>
        <p className="text-sm font-black text-[#5f6f89]">Cards</p>
        <h1 className="mt-2 text-[30px] font-black leading-tight text-ink">卡片管理</h1>
        <p className="mt-2 text-sm font-bold leading-relaxed text-slate-500">
          上傳單張卡片圖片，系統會自動加入唯一卡池。
        </p>
      </section>

      <section className={`mt-5 ${cardShellClass}`}>
        <h2 className="text-xl font-black text-ink">新增卡片</h2>
        <form
          id="create-card-form"
          action={formAction}
          className="mt-4 space-y-4"
          encType="multipart/form-data"
          onSubmit={() => {
            if (formState?.ok) {
              resetForm();
              window.location.reload();
            }
          }}
        >
          <div>
            <span className={labelClass}>所屬系列</span>
            <select
              name="series_id"
              className={inputClass}
              defaultValue={series[0]?.id || ''}
              disabled={seriesLoading || isSubmitting}
            >
              {series.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className={labelClass}>卡片名稱</span>
            <input name="name" className={inputClass} placeholder="紅色消防車" required disabled={isSubmitting} />
          </div>

          <div>
            <span className={labelClass}>卡號（可選）</span>
            <input name="card_no" className={inputClass} placeholder="CAR-001" disabled={isSubmitting} />
          </div>

          <div>
            <span className={labelClass}>上傳圖片</span>
            <input
              name="source_image_file"
              type="file"
              accept="image/*"
              className={inputClass}
              required
              disabled={isSubmitting}
            />
          </div>

          {formState && (
            <div
              className={`mt-3 rounded-2xl p-4 text-sm font-black ${
                formState.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {formState.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex min-h-[54px] w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-4 text-base font-black text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60"
          >
            {isSubmitting ? '建立中...' : '建立單張卡片'}
          </button>
        </form>
      </section>

      {recentCards.length > 0 && (
        <section className={`mt-5 ${cardShellClass}`}>
          <h2 className="text-xl font-black text-ink">最近建立</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {recentCards.map((card) => (
              <div key={card.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                  {card.source_image_url || card.rendered_card_image_url ? (
                    <img
                      src={card.source_image_url || card.rendered_card_image_url || ''}
                      alt={card.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs font-black text-slate-400">無圖片</span>
                  )}
                </div>
                <p className="mt-2 truncate text-sm font-black text-ink">{card.name}</p>
                <p className="text-xs font-bold text-slate-500">{card.card_no || '未設定卡號'}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-5">
        <Link href="/parent/dashboard" className="inline-flex rounded-full bg-white/80 px-4 py-3 text-sm font-black text-slate-600 shadow-sm">
          ← 返回家長後台
        </Link>
      </section>
    </main>
  );
}
