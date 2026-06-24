'use client';

import { useState } from 'react';
import { createQuestionTemplate } from '@/lib/actions/learning';
import { getQuestionTemplates } from '@/lib/data/templates';
import { CompanionBar } from '@/components/CompanionBar';

type Topic = {
  what: string;
  want: string;
  focus: string;
  createdAt: string;
};

export default function ParentTemplatesPage() {
  const [topics, setTopics] = useState<Topic[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem('star-game-life-topics');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState({ what: '', want: '', focus: '' });

  const setTopicsAndPersist = (next: Topic[]) => {
    setTopics(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('star-game-life-topics', JSON.stringify(next));
    }
  };

  const handleAdd = () => {
    if (!form.what.trim() && !form.want.trim()) return;
    const topic: Topic = {
      what: form.what.trim(),
      want: form.want.trim(),
      focus: form.focus.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setTopicsAndPersist([topic, ...topics]);
    setForm({ what: '', want: '', focus: '' });
  };

  const handleRemove = (createdAt: string) => {
    setTopicsAndPersist(topics.filter((item) => item.createdAt !== createdAt));
  };

  return (
    <main className="admin-shell safe-screen">
      <CompanionBar title="題型模板" backHref="/" backLabel="小孩端" />
      <div className="mb-4 flex items-center justify-between">
        <a href="/parent/dashboard" className="rounded-full bg-white/80 px-4 py-3 text-base font-black text-slate-600 shadow-sm">
          ← 後台
        </a>
      </div>

      <section className="kid-card p-6">
        <p className="text-base font-bold text-grape">生活題材</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-ink">今天遇到什麼？</h1>
        <p className="mt-3 text-base font-bold leading-relaxed text-slate-500">
          輸入今天想練的主題，系統會記住這些題材，之後自動混入隨機練習。
        </p>
      </section>

      <section className="mt-5 rounded-[28px] bg-white/75 p-5 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">新增生活題材</h2>
        <p className="mt-2 text-sm font-medium text-slate-500">
          系統會自動把這些素材跟注音/英文題庫配對，組成今天的練習題。
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <span className="text-sm font-black text-slate-700">今天遇到什麼</span>
            <input
              className="mt-2 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-base font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              placeholder="例如：去公園看到很多馬路"
              value={form.what}
              onChange={(e) => setForm({ ...form, what: e.target.value })}
            />
          </div>

          <div>
            <span className="text-sm font-black text-slate-700">想練什麼</span>
            <input
              className="mt-2 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-base font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              placeholder="例如：注音 ㄇㄡ 或英文字母 M"
              value={form.want}
              onChange={(e) => setForm({ ...form, want: e.target.value })}
            />
          </div>

          <div>
            <span className="text-sm font-black text-slate-700">學習重點</span>
            <input
              className="mt-2 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-base font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              placeholder="例如：認識 ㄇ 怎麼發音"
              value={form.focus}
              onChange={(e) => setForm({ ...form, focus: e.target.value })}
            />
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!form.what.trim() && !form.want.trim()}
            className="w-full rounded-2xl bg-blue-600 px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] text-base font-black text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60"
          >
            系統自動出題
          </button>
        </div>
      </section>

      <section className="mt-5 space-y-3 pb-[calc(env(safe-area-inset-bottom)+120px)]">
        {topics.length === 0 ? (
          <p className="kid-sidenote">還沒有題材，先新增一個吧。</p>
        ) : (
          topics.map((topic, index) => (
            <div key={`${topic.createdAt}-${index}`} className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-black text-[#2f8cff]">#{index + 1} · {topic.createdAt}</p>
              <h3 className="mt-1 text-lg font-black text-slate-950">{topic.what || '今天遇到新的東西'}</h3>
              <p className="mt-1 text-sm font-medium text-slate-600">
                想練：{topic.want || '系統自動判斷'}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-600">
                重點：{topic.focus || '系統自動判斷'}
              </p>
              <button
                type="button"
                onClick={() => handleRemove(topic.createdAt)}
                className="mt-3 rounded-full bg-red-50 px-4 py-2 text-sm font-black text-red-600 transition hover:bg-red-100"
              >
                移除
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
