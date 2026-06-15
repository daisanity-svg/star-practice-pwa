import { PhoneFrame } from '@/components/PhoneFrame';
import { PracticeRunner } from '@/components/PracticeRunner';
import { KidTopBar } from '@/components/KidTopBar';
import { KidBottomNav } from '@/components/KidBottomNav';
import { getTodayQuestions } from '@/lib/data/learning';
import { getPracticeMode } from '@/lib/config/app-mode';

export default async function PracticePage() {
  const questions = await getTodayQuestions();
  const practiceMode = await getPracticeMode();

  return (
    <PhoneFrame>
      <KidTopBar title="今日練習" rightLabel={`${questions.length || 0} 題`} />
      <PracticeRunner questions={questions} practiceMode={practiceMode} />
      <KidBottomNav />
    </PhoneFrame>
  );
}
