import Link from 'next/link';
import { BatchCardUploader } from '@/components/BatchCardUploader';
import { createBatchCards, createRewardPool, createScheduledReward } from '@/lib/actions/rewards';
import { getAdminRewardData } from '@/lib/data/admin-rewards';

const inputClass = 'mt-2 w-full rounded-3xl border-0 bg-white/90 px-4 py-4 text-lg font-bold text-ink shadow-sm outline-none ring-2 ring-transparent focus:ring-blue-300';
const labelClass = 'text-sm font-black text-slate-500';

type AdminData = Awaited<ReturnType<typeof getAdminRewardData>>;

function normalizeName(name: string) {
  return name
    .replace(/驚喜/g, '')
    .replace(/卡包/g, '')
    .replace(/獎池/g, '')
    .replace(/系列/g, '')
    .replace(/收藏/g, '')
    .replace(/\s+/g, '')
    .trim();
}

function getPackStock(packId: string, packItems: AdminData['packItems']) {
  return packItems
    .filter((item) => item.reward_pack_id === packId)
    .reduce((sum, item) => sum + Number(item.stock || 0), 0);
}

function getSeriesForPack(packName: string, series: AdminData['series']) {
  const normalizedPack = normalizeName(packName);
  return (
    series.find((item) => item.name === packName) ||
    series.find((item) => normalizeName(item.name) === normalizedPack) ||
    series.find((item) => normalizedPack.includes(normalizeName(item.name)) || normalizeName(item.name).includes(normalizedPack)) ||
    null
  );
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export default async function ParentCardsPage() {
  const { series, cards, packs, packItems, scheduledRewards } = await getAdminRewardData();
  const today = todayString();

  const pools = packs
    .map((pack) => {
      const matchedSeries = getSeriesForPack(pack.name, series);
      const stock = getPackStock(pack.id, packItems);
      const cardCount = matchedSeries ? cards.filter((card) => card.series_id === matchedSeries.id).length : 0;
      return {
        packId: pack.id,
        seriesId: matchedSeries?.id || '',
        name: pack.name,
        description: pack.description,
        stock,
        cardCount,
        hasSeries: Boolean(matchedSeries)
      };
    })
    .sort((a, b) => Number(a.stock > 0) - Number(b.stock > 0));

  const uploadablePools = pools.filter((pool) => pool.seriesId);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 px-4 py-5 text-ink md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/parent/dashboard" className="rounded-full bg-white px-5 py-3 text-base font-black text-blue-700 shadow-sm ring-1 ring-blue-100">
            ← 回後台
          </Link>
          <div className="rounded-full bg-blue-600 px-5 py-3 text-base font-black text-white shadow-soft">
            獎池管理
          </div>
        </div>

        <section className="mt-5 rounded-[2rem] bg-white/90 p-6 shadow-soft ring-1 ring-blue-100">
          <p className="text-base font-black text-blue-600">Reward Pools</p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-ink md:text-4xl">只建立獎池，空了就補卡</h1>
          <p className="mt-3 max-w-3xl text-lg font-bold leading-relaxed text-slate-500">
            後台已簡化：你不需要再分「系列」和「分類」。想到新的主題時，直接新增一個獎池，例如「布麗狗驚喜卡包」、「端午限定卡包」、「小車驚喜卡包」。建立後點選該獎池，上傳卡片即可。
          </p>
        </section>

        <section className="mt-5 rounded-[2rem] bg-white/90 p-5 shadow-soft ring-1 ring-blue-100">
          <h2 className="text-2xl font-black text-ink">新增獎池</h2>
          <p className="mt-2 text-sm font-bold leading-relaxed text-slate-500">
            獎池就是孩子完成練習後抽卡的地方。建立獎池時，系統會同步建立同名的卡片系列，之後上傳卡片會自動放進這個獎池。
          </p>
          <form action={createRewardPool} className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label className="block">
              <span className={labelClass}>獎池名稱</span>
              <input name="pool_name" className={inputClass} placeholder="布麗狗驚喜卡包" required />
            </label>
            <label className="block">
              <span className={labelClass}>描述</span>
              <input name="pool_description" className={inputClass} placeholder="完成練習後可以抽布麗狗卡" />
            </label>
            <button className="rounded-[2rem] bg-blue-600 px-8 py-5 text-xl font-black text-white shadow-soft active:scale-[0.99]">
              新增獎池
            </button>
          </form>
        </section>

        <section className="mt-5 rounded-[2rem] bg-white/90 p-5 shadow-soft ring-1 ring-blue-100">
          <h2 className="text-2xl font-black text-ink">指定下一張獎勵卡</h2>
          <p className="mt-2 text-sm font-bold leading-relaxed text-slate-500">
            端午節、生日、今天特別喜歡某張卡，或想給他一個驚喜時，就在這裡指定。下一次完成練習後會優先拿這張卡，領完自動失效。
          </p>
          <form action={createScheduledReward} className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className={labelClass}>指定卡片</span>
              <select name="scheduled_card_id" className={inputClass} required>
                <option value="">選一張卡</option>
                {cards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.card_no ? `${card.card_no}｜` : ''}{card.name}（{card.rarity}）
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>原因</span>
              <select name="scheduled_reason" className={inputClass} defaultValue="爸爸指定獎勵">
                <option value="端午節限定獎勵">端午節限定獎勵</option>
                <option value="生日驚喜獎勵">生日驚喜獎勵</option>
                <option value="今天特別喜歡這張卡">今天特別喜歡這張卡</option>
                <option value="完成挑戰的特別獎勵">完成挑戰的特別獎勵</option>
                <option value="爸爸指定獎勵">爸爸指定獎勵</option>
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>指定所屬獎池</span>
              <select name="scheduled_reward_pack_id" className={inputClass}>
                <option value="">使用目前啟用獎池</option>
                {packs.map((pack) => (
                  <option key={pack.id} value={pack.id}>{pack.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>開始日期</span>
              <input type="date" name="scheduled_starts_on" className={inputClass} defaultValue={today} />
            </label>
            <label className="block">
              <span className={labelClass}>有效到</span>
              <input type="date" name="scheduled_expires_on" className={inputClass} defaultValue={today} />
            </label>
            <button className="md:col-span-2 w-full rounded-[2rem] bg-gradient-to-r from-amber-400 to-blue-500 px-5 py-5 text-xl font-black text-white shadow-soft active:scale-[0.99]">
              指定下一次完成練習的獎勵卡
            </button>
          </form>

          <div className="mt-5 rounded-[1.75rem] bg-blue-50/80 p-4 ring-1 ring-blue-100">
            <p className="text-sm font-black text-blue-600">目前待領指定卡</p>
            {scheduledRewards.length === 0 ? (
              <p className="mt-2 text-sm font-bold text-slate-500">目前沒有指定獎勵卡。</p>
            ) : (
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {scheduledRewards.map((reward) => (
                  <div key={reward.id} className="rounded-3xl bg-white p-4 shadow-sm">
                    <p className="text-xs font-black text-slate-400">{reward.reason}</p>
                    <h3 className="mt-1 text-lg font-black text-ink">{reward.card?.name || '指定卡片'}</h3>
                    <p className="mt-1 text-sm font-bold text-slate-500">
                      {reward.card?.card_no || '未編號'}｜{reward.pack?.name || '目前啟用獎池'}
                    </p>
                    <p className="mt-2 text-xs font-black text-blue-500">
                      {reward.starts_on || '今天'} ～ {reward.expires_on || '不限'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mt-5 rounded-[2rem] bg-white/90 p-5 shadow-soft ring-1 ring-blue-100">
          <h2 className="text-2xl font-black text-ink">獎池列表</h2>
          <p className="mt-2 text-sm font-bold leading-relaxed text-slate-500">
            看哪個獎池快空了，就在下方選該獎池批次補卡。紅色標記代表已經沒有可抽卡片。
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {pools.length === 0 ? (
              <div className="rounded-[1.75rem] bg-blue-50/80 p-5 text-center ring-1 ring-blue-100 md:col-span-3">
                <h3 className="text-xl font-black text-ink">還沒有獎池</h3>
                <p className="mt-2 text-sm font-bold text-slate-500">先新增一個獎池，之後就能上傳卡片。</p>
              </div>
            ) : pools.map((pool) => (
              <div key={pool.packId} className={`rounded-[1.75rem] p-4 ring-1 ${pool.stock <= 0 ? 'bg-red-50 ring-red-100' : 'bg-blue-50/80 ring-blue-100'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-xs font-black ${pool.stock <= 0 ? 'text-red-500' : 'text-blue-500'}`}>{pool.stock <= 0 ? '需要補卡' : '獎池'}</p>
                    <h3 className="mt-1 text-xl font-black text-ink">{pool.name}</h3>
                    {pool.description ? <p className="mt-1 text-sm font-bold text-slate-500">{pool.description}</p> : null}
                  </div>
                  <span className="rounded-2xl bg-white px-3 py-2 text-sm font-black text-blue-700 shadow-sm">
                    {pool.stock} 張
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white p-3 shadow-sm">
                    <p className="text-xs font-black text-slate-400">已建卡片</p>
                    <p className="mt-1 text-lg font-black text-ink">{pool.cardCount} 張</p>
                  </div>
                  <div className="rounded-2xl bg-white p-3 shadow-sm">
                    <p className="text-xs font-black text-slate-400">狀態</p>
                    <p className={`mt-1 text-sm font-black ${pool.hasSeries ? 'text-blue-600' : 'text-red-500'}`}>
                      {pool.hasSeries ? '可補卡' : '需重新建立'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-[2rem] bg-white/90 p-5 shadow-soft ring-1 ring-blue-100">
          <form action={createBatchCards}>
            <BatchCardUploader pools={uploadablePools} />
            <button className="mt-5 w-full rounded-[2rem] bg-blue-600 px-5 py-5 text-xl font-black text-white shadow-soft active:scale-[0.99]">
              批次加入獎池
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
