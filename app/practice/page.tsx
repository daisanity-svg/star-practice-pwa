import Link from 'next/link';
import { PhoneFrame } from '@/components/PhoneFrame';
import { PracticeRunner } from '@/components/PracticeRunner';
import { getTodayQuestions } from '@/lib/data/learning';

export default async function PracticePage() {
  const questions = await getTodayQuestions();

  return (
    <PhoneFrame>
      <div className="mb-4 flex items-center justify-between">
        <Link href="/" className="rounded-full bg-white/80 px-4 py-3 text-base font-black text-slate-600 shadow-sm">
          ← 回首頁
        </Link>
        <div className="rounded-full bg-white/80 px-4 py-3 text-base font-black text-grape shadow-sm">
          今日練習
        </div>
      </div>

      <PracticeRunner questions={questions} />
    </PhoneFrame>
  );
}
