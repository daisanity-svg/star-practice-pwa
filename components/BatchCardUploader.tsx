'use client';

import { ChangeEvent, useMemo, useState } from 'react';

type PoolOption = {
  packId: string;
  seriesId: string;
  name: string;
  stock: number;
  cardCount: number;
};

type Props = {
  pools: PoolOption[];
};

const rarityOptions = [
  { value: 'common', label: '普通', badge: 'COMMON', gradient: ['#EAF6FF', '#CFE9FF'], frame: '#60A5FA' },
  { value: 'rare', label: '稀有', badge: 'RARE', gradient: ['#EEF4FF', '#BFD7FF'], frame: '#2563EB' },
  { value: 'super_rare', label: '超稀有', badge: 'SUPER', gradient: ['#F5F0FF', '#DCCBFF'], frame: '#8B5CF6' },
  { value: 'legendary', label: '傳說', badge: 'LEGEND', gradient: ['#FFF8DB', '#FFE083'], frame: '#F59E0B' }
];

type PreviewCard = {
  id: string;
  fileName: string;
  cardName: string;
  cardNo: string;
  dataUrl: string;
};

function pad(num: number) {
  return String(num).padStart(3, '0');
}

function getPoolPrefix(poolName: string) {
  const normalized = poolName.trim().toUpperCase();
  if (normalized.includes('布麗') || normalized.includes('BLUEY')) return 'BRI';
  if (normalized.includes('小車') || normalized.includes('車') || normalized.includes('CAR')) return 'CAR';
  if (normalized.includes('狗')) return 'DOG';
  if (normalized.includes('恐龍')) return 'DINO';
  if (normalized.includes('端午')) return 'DRGN';
  if (normalized.includes('生日')) return 'BDAY';
  if (normalized.includes('植物') || normalized.includes('PIK')) return 'PIK';
  return 'CARD';
}

function getPoolCardBaseName(poolName: string) {
  const name = poolName.trim();
  if (name.includes('布麗') || name.includes('狗')) return '布麗狗卡';
  if (name.includes('小車') || name.includes('車')) return '小車卡';
  if (name.includes('爸爸')) return '爸爸特製卡';
  if (name.includes('冒險')) return '冒險卡';
  if (name.includes('生日')) return '生日卡';
  if (name.includes('端午')) return '端午卡';
  if (name.includes('植物') || name.includes('皮克')) return '植物卡';

  return name
    .replace(/驚喜卡包/g, '')
    .replace(/卡包/g, '')
    .replace(/系列/g, '')
    .trim() || '神秘卡片';
}

function createCardName(poolName: string, cardNumber: number) {
  return `${getPoolCardBaseName(poolName)} ${pad(cardNumber)}`;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

async function renderCard(file: File, options: { cardName: string; cardNo: string; poolName: string; rarity: string }) {
  const rarity = rarityOptions.find((item) => item.value === options.rarity) || rarityOptions[0];
  const objectUrl = URL.createObjectURL(file);
  const image = await loadImage(objectUrl);

  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 1200;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const gradient = ctx.createLinearGradient(0, 0, 900, 1200);
  gradient.addColorStop(0, rarity.gradient[0]);
  gradient.addColorStop(1, rarity.gradient[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 900, 1200);

  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  roundRect(ctx, 50, 50, 800, 1100, 78);
  ctx.fill();

  ctx.strokeStyle = rarity.frame;
  ctx.lineWidth = 14;
  roundRect(ctx, 50, 50, 800, 1100, 78);
  ctx.stroke();

  ctx.fillStyle = '#0F3F8C';
  ctx.font = '900 42px sans-serif';
  ctx.fillText(options.poolName || '獎勵卡包', 95, 135);

  ctx.fillStyle = rarity.frame;
  roundRect(ctx, 620, 82, 190, 68, 30);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(rarity.badge, 715, 126);
  ctx.textAlign = 'left';

  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, 105, 185, 690, 700, 52);
  ctx.fill();
  ctx.strokeStyle = 'rgba(37, 99, 235, 0.16)';
  ctx.lineWidth = 6;
  roundRect(ctx, 105, 185, 690, 700, 52);
  ctx.stroke();

  const box = { x: 125, y: 205, w: 650, h: 660 };
  const scale = Math.min(box.w / image.width, box.h / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  ctx.drawImage(image, box.x + (box.w - w) / 2, box.y + (box.h - h) / 2, w, h);

  ctx.fillStyle = '#111827';
  ctx.font = '900 62px sans-serif';
  ctx.fillText(options.cardName || '新卡片', 96, 985);

  ctx.fillStyle = '#64748B';
  ctx.font = '800 32px sans-serif';
  ctx.fillText(options.cardNo || 'CARD-001', 98, 1044);

  ctx.fillStyle = '#EFF6FF';
  roundRect(ctx, 590, 988, 205, 64, 28);
  ctx.fill();
  ctx.fillStyle = '#1D4ED8';
  ctx.font = '900 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(rarity.label, 692, 1029);

  URL.revokeObjectURL(objectUrl);
  return canvas.toDataURL('image/png');
}

export function BatchCardUploader({ pools }: Props) {
  const [selectedPoolId, setSelectedPoolId] = useState(pools[0]?.packId || '');
  const [rarity, setRarity] = useState('common');
  const [stock, setStock] = useState(1);
  const [weight, setWeight] = useState(10);
  const [previews, setPreviews] = useState<PreviewCard[]>([]);
  const [isRendering, setIsRendering] = useState(false);

  const selectedPool = useMemo(
    () => pools.find((item) => item.packId === selectedPoolId) || pools[0],
    [pools, selectedPoolId]
  );

  const autoPrefix = useMemo(() => getPoolPrefix(selectedPool?.name || '獎池'), [selectedPool?.name]);
  const startNumber = (selectedPool?.cardCount || 0) + 1;

  async function onFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0 || !selectedPool) {
      setPreviews([]);
      return;
    }

    setIsRendering(true);
    const rendered: PreviewCard[] = [];

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const cardNumber = startNumber + index;
      const cardName = createCardName(selectedPool.name, cardNumber);
      const cardNo = `${autoPrefix}-${pad(cardNumber)}`;
      const dataUrl = await renderCard(file, { cardName, cardNo, poolName: selectedPool.name, rarity });
      rendered.push({ id: `${file.name}-${file.size}-${index}`, fileName: file.name, cardName, cardNo, dataUrl });
    }

    setPreviews(rendered);
    setIsRendering(false);
  }

  if (pools.length === 0) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-center">
        <h3 className="text-xl font-black text-slate-900">還沒有獎池</h3>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">先建立一個獎池，例如「布麗狗驚喜卡包」，再回來批次上傳卡片。</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-500">Batch Upload</p>
            <h3 className="mt-1 text-2xl font-black text-slate-900">批次補卡到獎池</h3>
            <p className="mt-1 text-sm font-medium leading-relaxed text-slate-600">選擇獎池後一次上傳多張圖片，系統會自動產生卡片名稱、卡號、套版並加入獎池。</p>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
            <p className="text-xs font-bold text-slate-400">本次預覽</p>
            <p className="text-2xl font-black text-blue-600">{previews.length}</p>
          </div>
        </div>
      </div>

      <label className="block">
        <span className="text-sm font-bold text-slate-600">選擇要補卡的獎池</span>
        <select
          name="batch_reward_pack_id"
          value={selectedPoolId}
          onChange={(event) => {
            setSelectedPoolId(event.target.value);
            setPreviews([]);
          }}
          className="mt-2 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-bold shadow-inner text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        >
          {pools.map((item) => (
            <option key={item.packId} value={item.packId}>
              {item.name}｜目前 {item.stock} 張關聯卡
            </option>
          ))}
        </select>
      </label>

      <input type="hidden" name="batch_series_id" value={selectedPool?.seriesId || ''} />
      <input type="hidden" name="batch_category_id" value="" />
      <input type="hidden" name="batch_prefix" value={autoPrefix} />
      <input type="hidden" name="batch_start_number" value={String(startNumber)} />

      <details className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
        <summary className="cursor-pointer text-sm font-black text-slate-700">進階設定：稀有度、庫存、抽中權重</summary>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="text-sm font-bold text-slate-600">稀有度</span>
            <select name="batch_rarity" value={rarity} onChange={(event) => setRarity(event.target.value)} className="mt-2 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-bold shadow-inner text-slate-900">
              {rarityOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-600">每張庫存</span>
            <input name="batch_stock" type="number" min="0" value={stock} onChange={(event) => setStock(Number(event.target.value || 0))} className="mt-2 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-bold shadow-inner text-slate-900" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-600">抽中權重</span>
            <input name="batch_weight" type="number" min="0" value={weight} onChange={(event) => setWeight(Number(event.target.value || 0))} className="mt-2 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-bold shadow-inner text-slate-900" />
          </label>
        </div>
      </details>

      <div className="rounded-2xl bg-white px-4 py-3 text-sm font-bold leading-relaxed text-blue-700 ring-1 ring-blue-100">
        系統會自動產生卡號：{autoPrefix}-{pad(startNumber)}、{autoPrefix}-{pad(startNumber + 1)}、{autoPrefix}-{pad(startNumber + 2)}...；卡名會顯示為「{createCardName(selectedPool?.name || '卡片', startNumber)}」這種兒童可讀名稱。
      </div>

      <label className="block rounded-3xl border-2 border-dashed border-blue-200 bg-white p-5 shadow-sm text-center transition hover:bg-blue-50/40">
        <span className="text-base font-black text-blue-700">選擇多張圖片</span>
        <p className="mt-2 text-sm font-medium text-slate-500">支援 PNG、JPG、WEBP。檔名只作為內部來源，不會顯示給孩子看。</p>
        <input name="batch_source_files" type="file" accept="image/*" multiple onChange={onFilesChange} className="mt-4 block w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600" />
      </label>

      <input type="hidden" name="batch_card_names" value={JSON.stringify(previews.map((item) => item.cardName))} />
      <input type="hidden" name="batch_card_nos" value={JSON.stringify(previews.map((item) => item.cardNo))} />
      <input type="hidden" name="batch_rendered_data_urls" value={JSON.stringify(previews.map((item) => item.dataUrl))} />

      {isRendering ? (
        <div className="rounded-3xl bg-blue-50 p-4 text-center text-base font-black text-blue-700 ring-1 ring-blue-100">
          正在套版卡片中...
        </div>
      ) : null}

      {previews.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {previews.map((item) => (
            <div key={item.id} className="rounded-3xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
              <img src={item.dataUrl} alt={item.cardName} className="aspect-[3/4] w-full rounded-2xl object-cover" />
              <p className="mt-2 text-xs font-black text-blue-500">{item.cardNo}</p>
              <p className="line-clamp-2 text-sm font-black text-slate-900">{item.cardName}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
