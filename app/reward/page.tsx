import { KidBottomNav } from '@/components/KidBottomNav';
import { CompanionBar } from '@/components/CompanionBar';
import { PhoneFrame } from '@/components/PhoneFrame';
import { CompanionBar } from '@/components/CompanionBar';
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
    <PhoneFrame>
      <CompanionBar title="今日獎勵" backHref="/" backLabel="地圖" rightLabel="卡片" />
      <RewardDrawPanel practiceRecordId={practiceRecordId} initialResult={todayDraw} />
      <KidBottomNav />
    </PhoneFrame>
  );
}
