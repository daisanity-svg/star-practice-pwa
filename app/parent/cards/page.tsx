'use client';

import { useEffect, useState, useCallback } from 'react';
import { useActionState } from 'react';
import Link from 'next/link';
import { createCard, type CardFormState } from '@/lib/actions/rewards';
import { deleteCard, setNextRewardCard } from '@/lib/actions/cards';
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

type CardRow = {
  id: string;
  series_id: string;
  category_id?: string | null;
  name: string;
  card_no?: string | null;
  rarity?: string | null;
  source_image_url?: string | null;
  rendered_card_image_url?: string | null;
  description?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
};

type InventoryRow = {
  id: string;
  card_id: string;
  child_id: string;
  quantity: number;
  obtained_at?: string | null;
};

type DashboardChild = {
  id: string;
  name: string | null;
};

const cardShellClass = 'rounded-[28px] bg-white/75 p-5 shadow-sm';
const inputClass =
  'mt-2 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-base font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100';
const labelClass = 'text-sm font-black text-slate-700';
const primaryBtnClass =
  'inline-flex items-center justify-center rounded-[26px] bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700';
const dangerBtnClass =
  'inline-flex items-center justify-center rounded-[26px] bg-red-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-red-600';
const ghostBtnClass =
  'inline-flex items-center justify-center rounded-[26px] border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-700 transition hover:border-blue-300';
const nextActionBtnClass =
  'playful-shadow inline-flex items-center justify-center rounded-[26px] bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700';

function formatDate(value?: string | null) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value ?? '--';
  return date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ParentCardsPage() {
  const [series, setSeries] = useState<CardSeries[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('');
  const [allCards, setAllCards] = useState<CardRow[]>([]);
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [children, setChildren] = useState<DashboardChild[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [formState, formAction, isSubmitting] = useActionState<CardFormState, FormData>(createCard, null);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');

  const canSave = Boolean(selectedSeriesId) && !isSubmitting && !saving;
  const childParam = selectedChildId || null;

  const wrappedDeleteCard = async (formData: FormData) => {
    setSaving(true);
    await deleteCard(null, formData);
    setSaving(false);
  };
  const wrappedSetNextRewardCard = async (formData: FormData) => {
    setSaving(true);
    await setNextRewardCard(null, formData);
    setSaving(false);
  };

  const refresh = useCallback(async () => {
    setLoading(true);
    const nextSeries = await getCardSeries();
    setSeries(nextSeries);
    if (nextSeries.length && !selectedSeriesId) {
      setSelectedSeriesId(nextSeries[0].id);
    }

    if (!supabase) {
      setLoading(false);
      return;
    }

    const [
      { data: cardsData },
      { data: inventoryData },
      { data: childrenData }
    ] = await Promise.all([
      supabase.from('cards').select('*').order('created_at', { ascending: true }),
      supabase.from('child_card_inventory').select('id, card_id, child_id, quantity, obtained_at'),
      supabase.from('children').select('id, name').order('created_at', { ascending: true })
    ]);

    setAllCards((cardsData as CardRow[] | null) ?? []);
    setInventory((inventoryData as InventoryRow[] | null) ?? []);
    setChildren((childrenData as DashboardChild[] | null) ?? []);
    if (!selectedChildId && (childrenData?.length ?? 0) > 0) {
      setSelectedChildId((childrenData as DashboardChild[])[0].id);
    }
    setLoading(false);
  }, [selectedSeriesId, selectedChildId]);

  const pendingCards = allCards.filter((card) => {
    const matchesSeries = !selectedSeriesId || card.series_id === selectedSeriesId;
    const matchesQuery = !query || card.name.toLowerCase().includes(query.toLowerCase());
    const matchesChild = !childParam || !inventory.some((row) => row.card_id === card.id && row.child_id === childParam);
    return matchesSeries && matchesQuery && matchesChild;
  });

  const ownedCards = allCards.filter((card) => {
    const matchesSeries = !selectedSeriesId || card.series_id === selectedSeriesId;
    const matchesQuery = !query || card.name.toLowerCase().includes(query.toLowerCase());
    const matchesChild = !childParam || inventory.some((row) => row.card_id === card.id && row.child_id === childParam);
    return matchesSeries && matchesQuery && matchesChild;
  });

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#e0ecff,white_55%,#f7fbff)] px-4 pb-12">
      <CompanionBar />
      <section className={`mx-auto mt-8 max-w-3xl ${cardShellClass}`}>
        <header className="space-y-2">
          <p className="text-sm font-semibold text-slate-500">家長專區</p>
          <h1 className="text-3xl font-black text-slate-900">卡片管理</h1>
          <p className="text-base text-slate-600">在這裡新增卡片、管理待抽卡，並設定下一張要抽到的卡。</p>
        </header>

        <form action={formAction} className="mt-6 space-y-4 rounded-[28px] border border-blue-100 bg-white/80 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={`${labelClass} block`}>
              所屬系列 *
              <select name="series_id" defaultValue={selectedSeriesId} className={inputClass}>
                {series.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className={`${labelClass} block`}>
              卡號
              <input name="card_no" className={inputClass} placeholder="CAR-001" />
            </label>

            <label className={`${labelClass} block`}>
              卡片名稱 *
              <input name="name" className={inputClass} placeholder="紅色小車" />
            </label>

            <label className={`${labelClass} block`}>
              稀有度
              <input name="rarity" className={inputClass} placeholder="common" />
            </label>

            <label className={`${labelClass} block`}>
              原圖連結
              <input name="source_image_url" className={inputClass} placeholder="https://..." />
            </label>
          </div>

          <label className={`${labelClass} block`}>
            圖片
            <input name="source_image_file" type="file" accept="image/*" className="mt-2 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-base text-slate-900" />
          </label>

          <button type="submit" className={`${primaryBtnClass} w-full`} disabled={!canSave || isSubmitting}>
            {isSubmitting ? '建立中...' : '新增卡片'}
          </button>

          {formState && formState.ok && <p className="text-sm font-semibold text-emerald-600">{formState.message}</p>}
          {formState && !formState.ok && <p className="text-sm font-semibold text-red-500">{formState.message}</p>}
        </form>
      </section>

      <section className={`mx-auto mt-8 max-w-3xl ${cardShellClass}`}>
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">卡片列表</h2>
            <p className="text-sm text-slate-500">搜尋或快速跳轉到指定系列。</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className={inputClass}
              placeholder="搜尋卡片"
            />
            <select value={selectedSeriesId} onChange={(event) => setSelectedSeriesId(event.target.value)} className={inputClass}>
              {series.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <select
              value={selectedChildId}
              onChange={(event) => setSelectedChildId(event.target.value)}
              disabled={(children?.length ?? 0) === 0}
              className={inputClass}
            >
              {children.length === 0 && <option value="">尚無孩子</option>}
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name || '未命名孩子'}
                </option>
              ))}
            </select>
          </div>
        </header>

        {loading ? (
          <p className="mt-4 text-sm font-semibold text-slate-500">載入卡片資料中...</p>
        ) : (
          <div className="mt-5 space-y-10">
            <section className="space-y-4">
              <h3 className="text-lg font-black text-slate-900">待抽卡</h3>
              {pendingCards.length === 0 ? (
                <p className="rounded-[28px] bg-white/80 p-4 text-sm font-semibold text-slate-500">目前沒有待抽卡，請家長先新增卡片。</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {pendingCards.map((card) => (
                    <article key={`pending-${card.id}`} className="rounded-[28px] border border-blue-100 bg-white/80 p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        {card.rendered_card_image_url ? (
                          <img src={card.rendered_card_image_url} alt={card.name} className="h-16 w-16 rounded-2xl object-cover" />
                        ) : card.source_image_url ? (
                          <img src={card.source_image_url} alt={card.name} className="h-16 w-16 rounded-2xl object-cover" />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-sm font-black text-blue-500">{card.card_no ?? '--'}</div>
                        )}
                        <div className="space-y-1">
                          <p className="text-sm font-black text-slate-900">{card.name}</p>
                          <p className="text-xs font-semibold text-slate-500">卡號：{card.card_no ?? '--'}</p>
                          <p className="text-xs font-semibold text-slate-500">建立：{formatDate(card.created_at)}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <form action={wrappedDeleteCard} className="contents">
                          <input type="hidden" name="card_id" value={card.id} readOnly />
                          <button type="submit" className={`${dangerBtnClass} flex-1`} disabled={saving}>
                            刪除
                          </button>
                        </form>
                        <form action={wrappedSetNextRewardCard} className="contents">
                          <input type="hidden" name="card_id" value={card.id} readOnly />
                          <button type="submit" className={`${nextActionBtnClass} flex-1`} disabled={saving}>
                            指定下一張抽卡
                          </button>
                        </form>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-black text-slate-900">已收藏</h3>
              {ownedCards.length === 0 ? (
                <p className="rounded-[28px] bg-white/80 p-4 text-sm font-semibold text-slate-500">還沒有已收藏卡片。</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {ownedCards.map((card) => {
                    const inventoryRow = inventory.find((row) => row.card_id === card.id && row.child_id === childParam);
                    return (
                      <article key={`owned-${card.id}`} className="rounded-[28px] border border-blue-100 bg-white/80 p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          {card.rendered_card_image_url ? (
                            <img src={card.rendered_card_image_url} alt={card.name} className="h-16 w-16 rounded-2xl object-cover" />
                          ) : card.source_image_url ? (
                            <img src={card.source_image_url} alt={card.name} className="h-16 w-16 rounded-2xl object-cover" />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-sm font-black text-blue-500">{card.card_no ?? '--'}</div>
                          )}
                          <div className="space-y-1">
                            <p className="text-sm font-black text-slate-900">{card.name}</p>
                            <p className="text-xs font-semibold text-slate-500">卡號：{card.card_no ?? '--'}</p>
                            <p className="text-xs font-semibold text-slate-500">{inventoryRow ? `收藏：${formatDate(inventoryRow.obtained_at)}` : '收藏日期：--'}</p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </section>

      <section className={`mx-auto mt-8 max-w-3xl ${cardShellClass}`}>
        <h2 className="text-lg font-black text-slate-900">快速連結</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/parent/dashboard" className={`${ghostBtnClass}`}>
            家長 Dashboard
          </Link>
          <Link href="/parent/settings" className={`${ghostBtnClass}`}>
            家長設定
          </Link>
          <Link href="/collection" className={`${ghostBtnClass}`}>
            孩子圖鑑
          </Link>
          <Link href="/reward" className={`${ghostBtnClass}`}>
            今日獎勵
          </Link>
          <Link href="/practice" className={`${ghostBtnClass}`}>
            每日練習
          </Link>
        </div>
      </section>
    </main>
  );
}
