import Link from 'next/link';
import { BatchCardUploader } from '@/components/BatchCardUploader';
import { createBatchCards, createRewardPool, createScheduledReward, deleteCard, deleteRewardPool, setPracticeMode } from '@/lib/actions/rewards';
import { getAdminRewardData } from '@/lib/data/admin-rewards';
import { getPracticeMode } from '@/lib/config/app-mode';
import { AdminActionForm } from '@/components/AdminActionForm';

const inputClass = 'mt-2 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-inner outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 sm:text-base';
const labelClass = 'text-sm font-black text-slate-600';
const cardClass = 'rounded-3xl border border-blue-100 bg-white p-4 shadow-[0_16px_40px_rgba(37,99,235,0.08)] sm:p-5';

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
  const practiceMode = await getPracticeMode();
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
  const totalStock = pools.reduce((sum, pool) => sum + pool.stock, 0);
  const emptyPoolCount = pools.filter((pool) => pool.stock <= 0).length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-slate-50 to-white px-4 pb-[calc(env(safe-area-inset-bottom)+112px)] pt-[calc(env(safe-area-inset-top)+20px)] text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="flex flex-col gap-4 rounded-3xl border border-blue-100 bg-white p-4 shadow-[0_16px_40px_rgba(37,99,235,0.08)] sm:p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/parent/dashboard" className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200">
              ← 回後台
            </Link>
            <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-blue-500">Reward Pool Admin</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">獎池管理</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
              這裡只管理「獎池」。想到新的主題時直接新增一個獎池；獎池快空了，就點選該獎池批次上傳卡片補進去。
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:w-[300px]">
            <div className="rounded-2xl bg-blue-50 p-3 text-center">
              <p className="text-xs font-bold text-blue-500">獎池</p>
              <p className="mt-1 text-2xl font-black text-blue-700">{pools.length}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3 text-center">
              <p className="text-xs font-bold text-amber-600">庫存</p>
              <p className="mt-1 text-2xl font-black text-amber-700">{totalStock}</p>
            </div>
            <div className="rounded-2xl bg-red-50 p-3 text-center">
              <p className="text-xs font-bold text-red-500">待補</p>
              <p className="mt-1 text-2xl font-black text-red-600">{emptyPoolCount}</p>
            </div>
          </div>
        </header>


        <section className={cardClass}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-purple-500">Practice Mode</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">目前模式：{practiceMode === 'test' ? '測試模式' : '正式模式'}</h2>
              <p className="mt-2 text-sm font-medium text-slate-500">測試模式可重複產生題目與測抽卡；正式模式會保留今日進度並完成後前往打開小禮物。</p>
            </div>
            <div className="grid gap-2 sm:w-56">
              <AdminActionForm action={setPracticeMode}>
                <input type="hidden" name="practice_mode" value={practiceMode === 'test' ? 'production' : 'test'} />
                <button className="w-full rounded-2xl bg-purple-600 px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] text-base font-black text-white shadow-sm transition hover:bg-purple-700 disabled:opacity-60">
                  {practiceMode === 'test' ? '切換為正式模式' : '切換為測試模式'}
                </button>
              </AdminActionForm>
            </div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
          <aside className="space-y-5">
            <section className={cardClass}>
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-xl text-white">＋</div>
                <div>
                  <h2 className="text-xl font-black text-slate-950">新增獎池</h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">例如：布麗狗驚喜卡包、小車卡包、端午限定卡包。</p>
                </div>
              </div>
              <AdminActionForm action={createRewardPool} successReset className="mt-5 space-y-4">
                <label className="block">
                  <span className={labelClass}>獎池名稱</span>
                  <input name="pool_name" className={inputClass} placeholder="布麗狗驚喜卡包" required />
                </label>
                <label className="block">
                  <span className={labelClass}>描述</span>
                  <textarea name="pool_description" rows={3} className={inputClass} placeholder="完成練習後可以抽布麗狗卡" />
                </label>
                <button className="w-full rounded-2xl bg-blue-600 px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] text-base font-black text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60">
                  建立獎池／提交中會鎖定
                </button>
              </AdminActionForm>
            </section>

            <section className={cardClass}>
              <h2 className="text-xl font-black text-slate-950">指定下一張獎勵卡</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">端午、生日或今天想給特別驚喜時使用。孩子下一次完成練習會優先拿這張卡，領完自動失效。</p>
              <AdminActionForm action={createScheduledReward} successReset className="mt-5 space-y-4">
                <label className="block">
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
                  <span className={labelClass}>所屬獎池</span>
                  <select name="scheduled_reward_pack_id" className={inputClass}>
                    <option value="">使用目前啟用獎池</option>
                    {packs.map((pack) => (
                      <option key={pack.id} value={pack.id}>{pack.name}</option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className={labelClass}>開始</span>
                    <input type="date" name="scheduled_starts_on" className={inputClass} defaultValue={today} />
                  </label>
                  <label className="block">
                    <span className={labelClass}>有效到</span>
                    <input type="date" name="scheduled_expires_on" className={inputClass} defaultValue={today} />
                  </label>
                </div>
                <button className="w-full rounded-full bg-blue-500 px-5 py-3 text-sm min-h-[48px] text-white font-black shadow-sm transition hover:bg-blue-600 active:scale-[0.99]">
                  指定下一次獎勵
                </button>
              </AdminActionForm>

              <div className="mt-5 rounded-2xl bg-blue-50/60 p-4">
                <p className="text-sm font-black text-slate-700">目前待領</p>
                {scheduledRewards.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500">目前沒有指定獎勵卡。</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {scheduledRewards.map((reward) => (
                      <div key={reward.id} className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                        <p className="text-xs font-bold text-blue-500">{reward.reason}</p>
                        <p className="mt-1 font-black text-slate-900">{reward.card?.name || '指定卡片'}</p>
                        <p className="mt-1 text-xs font-medium text-slate-500">{reward.card?.card_no || '未編號'}｜{reward.pack?.name || '目前啟用獎池'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </aside>

          <div className="space-y-5">
            <section className={cardClass}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-950">獎池列表</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">紅色代表已經沒有可抽卡片。看到空了，就到下方批次補卡。</p>
                </div>
                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">共 {pools.length} 個獎池</span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {pools.length === 0 ? (
                  <div className="rounded-3xl bg-slate-50 p-6 text-center ring-1 ring-slate-200 sm:col-span-2 xl:col-span-3">
                    <h3 className="text-xl font-black text-slate-900">還沒有獎池</h3>
                    <p className="mt-2 text-sm text-slate-500">先在左側新增一個獎池。</p>
                  </div>
                ) : pools.map((pool) => (
                  <div key={pool.packId} className={`rounded-3xl border p-4 shadow-sm ${pool.stock <= 0 ? 'border-red-200 bg-red-50' : 'border-blue-100 bg-blue-50/60'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`text-xs font-black ${pool.stock <= 0 ? 'text-red-500' : 'text-blue-500'}`}>{pool.stock <= 0 ? '需要補卡' : '可抽卡'}</p>
                        <h3 className="mt-1 truncate text-lg font-black text-slate-950">{pool.name}</h3>
                        {pool.description ? <p className="mt-1 line-clamp-2 text-sm text-slate-500">{pool.description}</p> : null}
                      </div>
                      <span className="shrink-0 rounded-2xl bg-white px-3 py-2 text-sm font-black text-slate-900 shadow-sm">{pool.stock} 張</span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-2xl bg-white p-3">
                        <p className="text-xs font-bold text-slate-400">已建卡片</p>
                        <p className="mt-1 text-lg font-black text-slate-900">{pool.cardCount} 張</p>
                      </div>
                      <div className="rounded-2xl bg-white p-3">
                        <p className="text-xs font-bold text-slate-400">狀態</p>
                        <p className={`mt-1 text-sm font-black ${pool.hasSeries ? 'text-blue-600' : 'text-red-500'}`}>{pool.hasSeries ? '可補卡' : '需重建'}</p>
                      </div>
                    </div>
                    <AdminActionForm action={deleteRewardPool} confirmMessage="確定要刪除這個獎池嗎？獎池內的卡片關聯也會移除。" className="mt-3">
                      <input type="hidden" name="reward_pack_id" value={pool.packId} />
                      <button className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-red-600 ring-1 ring-red-100 transition hover:bg-red-50 disabled:opacity-60">刪除獎池</button>
                    </AdminActionForm>
                  </div>
                ))}
              </div>
            </section>


            <section className={cardClass}>
              <h2 className="text-2xl font-black text-slate-950">卡片列表</h2>
              <p className="mt-2 text-sm text-slate-500">多餘或測試用卡片可在這裡刪除；刪除會同步移除獎池、收納包、抽卡紀錄與指定獎勵關聯。</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {cards.map((card) => (
                  <div key={card.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-black text-blue-500">{card.card_no || '未編號'}｜{card.rarity}</p>
                    <h3 className="mt-1 line-clamp-2 text-lg font-black text-slate-950">{card.name}</h3>
                    <AdminActionForm action={deleteCard} confirmMessage="確定要刪除這張卡片嗎？收納包與抽卡紀錄中的關聯也會移除。" className="mt-3">
                      <input type="hidden" name="card_id" value={card.id} />
                      <button className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-red-600 ring-1 ring-red-100 transition hover:bg-red-50 disabled:opacity-60">刪除卡片</button>
                    </AdminActionForm>
                  </div>
                ))}
              </div>
            </section>

            <section className={cardClass}>
              <AdminActionForm action={createBatchCards} className="pb-[calc(env(safe-area-inset-bottom)+96px)]">
                <BatchCardUploader pools={uploadablePools} />
                <button className="mt-5 w-full rounded-2xl bg-blue-600 px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] text-base font-black text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60">
                  批次加入獎池／提交中會鎖定
                </button>
              </AdminActionForm>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
