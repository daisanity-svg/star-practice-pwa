import { KidButton } from '@/components/KidButton';
import { PhoneFrame } from '@/components/PhoneFrame';
import { ProgressPill } from '@/components/ProgressPill';
import { cardCollections } from '@/lib/demo-data';

export default function HomePage() {
  return (
    <PhoneFrame>
      <section className="kid-card flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-base font-bold text-grape">星見練習本</p>
            <h1 className="mt-2 text-4xl font-black leading-tight text-ink">今天也來找字母朋友！</h1>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-butter text-3xl shadow-sm">⭐</div>
        </div>

        <div className="mt-6 rounded-[28px] bg-skysoft p-5 text-blue-950">
          <p className="text-xl font-black">完成今天練習</p>
          <p className="mt-2 text-lg font-semibold">可以打開 1 個小車驚喜卡包！</p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <ProgressPill label="今日" value="0/10" />
          <ProgressPill label="星星" value="0" />
          <ProgressPill label="連續" value="2天" />
        </div>

        <div className="mt-6 space-y-3">
          <KidButton href="/practice">開始今天練習</KidButton>
          <KidButton href="/parent/login" tone="white">家長後台</KidButton>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-black text-ink">我的收納包</h2>
          <div className="mt-3 space-y-3">
            {cardCollections.map((collection) => (
              <div key={collection.name} className="flex items-center justify-between rounded-3xl bg-white/80 px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{collection.emoji}</span>
                  <span className="text-lg font-black text-ink">{collection.name}</span>
                </div>
                <span className="text-lg font-black text-grape">{collection.owned}/{collection.total}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PhoneFrame>
  );
}
