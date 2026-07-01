'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PhoneFrame } from '@/components/PhoneFrame';
import { KidBottomNav } from '@/components/KidBottomNav';
import { CompanionBar } from '@/components/CompanionBar';
import { BossBattle } from '@/components/BossBattle';

function BossContent() {
  const searchParams = useSearchParams();
  const nodeIndex = Number(searchParams.get('nodeIndex') ?? '2');
  const practiceRecordId = searchParams.get('practice_record_id') ?? undefined;
  const returnTo = practiceRecordId ? `/reward?practice_record_id=${practiceRecordId}` : '/reward';

  return (
    <PhoneFrame>
      <CompanionBar title="Boss 挑戰" backHref="/adventure" backLabel="地圖" rightLabel="5 秒挑戰" />
      <BossBattle nodeIndex={nodeIndex} returnTo={returnTo} />
      <KidBottomNav />
    </PhoneFrame>
  );
}

export default function BossPage() {
  return (
    <Suspense fallback={<div>...</div>}>
      <BossContent />
    </Suspense>
  );
}
