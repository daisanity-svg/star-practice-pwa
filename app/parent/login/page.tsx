import Link from 'next/link';
import { KidButton } from '@/components/KidButton';
import { CompanionBar } from '@/components/CompanionBar';

export default function ParentLoginPage() {
  return (
    <main className="admin-shell safe-screen">
      <CompanionBar title="家長登入" backHref="/" backLabel="小孩端" />
      <section className="kid-card flex flex-1 flex-col p-6">
        <Link href="/" className="mb-6 w-fit rounded-full bg-white/80 px-4 py-3 text-base font-black text-slate-600 shadow-sm">
          ← 回小孩端
        </Link>

        <div>
          <p className="text-base font-bold text-grape">家長後台</p>
          <h1 className="mt-2 text-4xl font-black leading-tight text-ink">管理練習內容與卡包</h1>
          <p className="mt-3 text-lg font-semibold leading-relaxed text-slate-500">
            第一版先建立登入畫面。正式串接 Supabase Auth 前，可作為後台入口原型。
          </p>
        </div>

        <form className="mt-8 space-y-4">
          <label className="block">
            <span className="text-base font-black text-slate-600">Email</span>
            <input className="mt-2 h-16 w-full rounded-3xl border border-slate-200 bg-white px-5 text-lg font-bold outline-none focus:border-grape" placeholder="parent@example.com" type="email" />
          </label>
          <label className="block">
            <span className="text-base font-black text-slate-600">密碼</span>
            <input className="mt-2 h-16 w-full rounded-3xl border border-slate-200 bg-white px-5 text-lg font-bold outline-none focus:border-grape" placeholder="輸入密碼" type="password" />
          </label>
        </form>

        <div className="mt-auto space-y-3 pt-8">
          <KidButton href="/parent/dashboard">進入後台 Dashboard</KidButton>
          <p className="text-center text-sm font-semibold text-slate-500">目前為前端原型，尚未啟用真實登入。</p>
        </div>
      </section>
    </main>
  );
}
