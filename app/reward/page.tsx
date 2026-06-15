import { KidBottomNav } from '@/components/KidBottomNav';
import { KidTopBar } from '@/components/KidTopBar';
import { PhoneFrame } from '@/components/PhoneFrame';
import { RewardDrawPanel } from '@/components/RewardDrawPanel';
import { getTodayDrawnReward } from '@/lib/data/rewards';

type RewardPageProps = {
  searchParams?: Promise<{
    practice_record_id?: string;
  }>;
};

export default async function RewardPage({ searchParams }: RewardPageProps) {
  const params = await searchParams;
  const practiceRecordId = params?.practice_record_id;
  const todayDraw = await getTodayDrawnReward(practiceRecordId);

  return (
    <PhoneFrame className="pt-[calc(env(safe-area-inset-top)+20px)] pb-[calc(env(safe-area-inset-bottom)+160px)]">
      <KidTopBar title="今日獎勵" backHref="/practice" backLabel="練習" rightLabel="🎁" />
      <RewardDrawPanel practiceRecordId={practiceRecordId} initialResult={todayDraw} />
      <KidBottomNav />
    </PhoneFrame>
  );
}
