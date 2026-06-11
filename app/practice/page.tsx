import Link from 'next/link';
import { KidButton } from '@/components/KidButton';
import { PhoneFrame } from '@/components/PhoneFrame';
import { getTodayQuestions } from '@/lib/data/learning';

export default async function PracticePage() {
  const questions = await getTodayQuestions();
  const current = questions[0];

  return (
    <PhoneFrame>
      <div className="mb-4 flex items-center justify-between">
        <Link href="/" className="rounded-full bg-white/80 px-4 py-3 text-base font-black text-slate-600 shadow-sm">
          ← 回首頁
        </Link>
        <div className="rounded-full bg-white/80 px-4 py-3 text-base font-black text-grape shadow-sm">
          第 1 / {Math.max(questions.length, 10)} 題
        </div>
      </div>

      <section className="kid-card flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-mint px-4 py-2 text-lg font-black text-emerald-900">
            {current.learning_item?.type?.includes('english') ? '英文' : '注音'}
          </span>
          <button className="flex h-14 w-14 items-center justify-center rounded-3xl bg-skysoft text-2xl shadow-sm" aria-label="播放聲音">
            🔊
          </button>
        </div>

        <div className="mt-8 rounded-[32px] bg-white p-6 text-center shadow-sm">
          <p className="text-3xl font-black leading-tight text-ink">{current.question_text}</p>
          <p className="mt-4 text-lg font-bold leading-relaxed text-slate-500">
            {current.memory_hook?.sentence ?? '聽一聽，再找出正確的朋友'}
          </p>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-4">
          {current.options.map((option) => (
            <button key={option} className="flex h-24 items-center justify-center rounded-[28px] bg-mint text-5xl font-black text-emerald-800 shadow-sm active:scale-[0.98]">
              {option}
            </button>
          ))}
        </div>

        <div className="mt-auto space-y-3 pt-8">
          <KidButton tone="butter">聽提示</KidButton>
          <KidButton href="/reward" tone="white">完成今日練習，去拿獎勵</KidButton>
        </div>
      </section>
    </PhoneFrame>
  );
}
