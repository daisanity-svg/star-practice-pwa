import Link from 'next/link';
import { KidBottomNav } from '@/components/KidBottomNav';
import { PhoneFrame } from '@/components/PhoneFrame';
import { CompanionBar } from '@/components/CompanionBar';
import { getCollectionSummary } from '@/lib/data/rewards';

export default async function HomePage() {
  const collections = await getCollectionSummary();
  const ownedTotal = collections.reduce((sum, item) => sum + item.owned, 0) || 0;
  const cardTotal = collections.reduce((sum, item) => sum + item.total, 0) || 1;
  const progressPercent = Math.round((ownedTotal / cardTotal) * 100);

  const quests = [
    { id: 1, label: '找朋友', status: 'done' },
    { id: 2, label: '小司機', status: 'active' },
    { id: 3, label: '恐龍', status: 'locked' },
    { id: 4, label: '植物', status: 'locked' },
    { id: 5, label: '星星章', status: 'locked' },
  ];

  return (
    <PhoneFrame>
      <CompanionBar title="今天出發" rightLabel={`${ownedTotal} 位朋友`} />
      <p className="kid-chip mt-2 text-center font-mono text-xs">V5.1 Critical Fix</p>
      <div className="kid-game-root">
        <div className="kid-sky" aria-hidden="true" />
        <div className="kid-cloud-1" aria-hidden="true" />
        <div className="kid-cloud-2" aria-hidden="true" />
        <div className="kid-cloud-3" aria-hidden="true" />

        <div className="kid-ground" aria-hidden="true" />
        <div className="kid-hill-1" aria-hidden="true" />
        <div className="kid-hill-2" aria-hidden="true" />

        <div className="kid-game-content">
          <section className="kid-hero">
            <div className="kid-status-row">
              <span className="kid-status-pill">第 3 天冒險中</span>
              <span className="kid-status-pill">{ownedTotal} 位朋友</span>
            </div>
            <h1 className="kid-hero-title">今天出發<br />找星星朋友</h1>
            <p className="kid-hero-sub">完成 5 個小任務，打開今日卡包</p>
            <div className="kid-hero-decor" aria-hidden="true">
              <span className="kid-star-badge" />
              <span className="kid-message-note">!</span>
            </div>
            <Link href="/practice" className="kid-cta">
              <span className="kid-cta-label">開始冒險</span>
            </Link>
          </section>

          <section className="kid-map">
            <div className="kid-map-header">
              <h2 className="kid-map-title">今天 5 關冒險</h2>
              <p className="kid-map-sub">跟著小徑前進，一站一站完成</p>
            </div>
            <div className="kid-map-route">
              <div className="kid-route-line" aria-hidden="true" />
              <div className="kid-quests">
                {quests.map((quest) => (
                  <div key={quest.id} className={`kid-quest ${quest.status}`}>
                    <div className="kid-quest-pin">
                      <span className="kid-quest-num">{quest.id}</span>
                    </div>
                    <span className="kid-quest-label">{quest.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="kid-reward">
            <div className="kid-chest" aria-hidden="true">
              <div className="kid-chest-top" />
              <div className="kid-chest-body" />
              <div className="kid-chest-band" />
              <div className="kid-chest-shine" />
            </div>
            <h3 className="kid-reward-title">完成後打開卡包</h3>
            <p className="kid-reward-sub">看看今天會遇見哪位新朋友</p>
            <Link href="/reward" className="kid-reward-cta">
              打開今日卡包
            </Link>
          </section>

          <section className="kid-collect">
            <div className="kid-collect-header">
              <h3 className="kid-collect-title">我的星星圖鑑</h3>
              <Link href="/collection" className="kid-collect-link">
                查看
              </Link>
            </div>
            <div className="kid-collect-row">
              <div className="kid-collect-icon" aria-hidden="true" />
              <div className="kid-collect-body">
                <div className="kid-collect-label">今天冒險完成度</div>
                <div className="kid-collect-track">
                  <div
                    className="kid-collect-fill"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <span className="kid-collect-percent">{progressPercent}%</span>
            </div>
            <p className="kid-collect-sub">已找到 {ownedTotal} 位朋友</p>
          </section>
        </div>

        <KidBottomNav />
      </div>
    </PhoneFrame>
  );
}
