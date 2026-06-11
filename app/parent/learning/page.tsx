import Link from 'next/link';
import { PhoneFrame } from '@/components/PhoneFrame';
import { getLearningItems, getMemoryHooks } from '@/lib/data/learning';

function typeLabel(type: string) {
  if (type.includes('english')) return '英文';
  if (type.includes('bopomofo')) return '注音';
  return '學習';
}

export default async function ParentLearningPage() {
  const [items, hooks] = await Promise.all([getLearningItems(), getMemoryHooks()]);

  return (
    <PhoneFrame>
      <div className="mb-4 flex items-center justify-between">
        <Link href="/parent/dashboard" className="rounded-full bg-white/80 px-4 py-3 text-base font-black text-slate-600 shadow-sm">
          ← 後台
        </Link>
        <div className="rounded-full bg-white/80 px-4 py-3 text-base font-black text-grape shadow-sm">
          學習項目
        </div>
      </div>

      <section className="kid-card p-6">
        <p className="text-base font-bold text-grape">Learning Items</p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-ink">題庫素材總覽</h1>
        <p className="mt-3 text-lg font-bold leading-relaxed text-slate-500">
          第一版先讀取 Supabase；尚未設定資料庫時會顯示示範素材。
        </p>
      </section>

      <section className="mt-5 space-y-4">
        {items.map((item) => {
          const itemHooks = hooks.filter((hook) => hook.learning_item_id === item.id);

          return (
            <div key={item.id} className="kid-card p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-grape">{typeLabel(item.type)}</p>
                  <h2 className="mt-1 text-4xl font-black text-ink">{item.display_text}</h2>
                </div>
                <div className="rounded-3xl bg-mint px-4 py-3 text-base font-black text-emerald-900">
                  {itemHooks.length} 個記憶詞
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {itemHooks.map((hook) => (
                  <span key={hook.id} className="rounded-full bg-white/80 px-4 py-2 text-base font-black text-slate-600 shadow-sm">
                    {hook.keyword}{hook.is_primary ? '｜主要' : ''}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </PhoneFrame>
  );
}
