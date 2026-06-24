import { PhoneFrame } from '@/components/PhoneFrame';
import { PracticeRunner } from '@/components/PracticeRunner';
import { CompanionBar } from '@/components/CompanionBar';
import { KidBottomNav } from '@/components/KidBottomNav';
import { getTodayQuestions } from '@/lib/data/learning';
import { getPracticeMode } from '@/lib/config/app-mode';

export default async function PracticePage() {
  const questions = await getTodayQuestions();
  const practiceMode = await getPracticeMode();
  const questLabel = questions.length ? '找朋友任務' : '今天練習';

  return (
    <PhoneFrame>
      <CompanionBar title={`第 1 關・${questLabel}`} backHref="/" backLabel="地圖" rightLabel={`${questions.length || 0} 題`} />
      <PracticeRunner questions={questions} practiceMode={practiceMode} />
      <KidBottomNav />
    </PhoneFrame>
  );
}
