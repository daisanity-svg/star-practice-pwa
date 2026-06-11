import { PhoneFrame } from '@/components/PhoneFrame';
import { PracticeRunner } from '@/components/PracticeRunner';
import { KidTopBar } from '@/components/KidTopBar';
import { KidBottomNav } from '@/components/KidBottomNav';
import { getTodayQuestions } from '@/lib/data/learning';

export default async function PracticePage() {
  const questions = await getTodayQuestions();

  return (
    <PhoneFrame>
      <KidTopBar title="今日練習" rightLabel={`${questions.length || 0} 題`} />
      <PracticeRunner questions={questions} />
      <KidBottomNav />
    </PhoneFrame>
  );
}
