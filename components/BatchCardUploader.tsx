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

function cleanName(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, '')
    .replace(/^\d+[-_\s]*/, '')
    .replace(/[-_]+/g, ' ')
    .trim() || '新卡片';
}

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

  ctx.fillStyle = 'rgba(255,255,255,0.88)';
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
      const cardName = cleanName(file.name);
      const cardNo = `${autoPrefix}-${pad(startNumber + index)}`;
      const dataUrl = await renderCard(file, { cardName, cardNo, poolName: selectedPool.name, rarity });
      rendered.push({ id: `${file.name}-${file.size}-${index}`, fileName: file.name, cardName, cardNo, dataUrl });
    }

    setPreviews(rendered);
    setIsRendering(false);
  }

  if (pools.length === 0) {
    return (
      <div className="rounded-[2rem] bg-amber-50 p-5 text-center ring-1 ring-amber-100">
        <h3 className="text-2xl font-black text-ink">還沒有獎池</h3>
        <p className="mt-2 text-sm font-bold text-slate-500">先在上方建立一個獎池，例如「布麗狗驚喜卡包」，再回來上傳卡片。</p>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] bg-blue-50/80 p-5 ring-1 ring-blue-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black text-blue-600">補卡到獎池</p>
          <h3 className="mt-1 text-2xl font-black text-slate-900">批次上傳新卡</h3>
          <p className="mt-2 text-sm font-bold leading-relaxed text-slate-500">
            選一個獎池，一次上傳多張圖片。系統會自動命名、編號、套版，並直接放進這個獎池。
          </p>
        </div>
        <span className="rounded-2xl bg-white px-3 py-2 text-sm font-black text-blue-700 shadow-sm">
          {previews.length} 張
        </span>
      </div>

      <label className="mt-5 block">
        <span className="text-sm font-black text-slate-500">選擇要補卡的獎池</span>
        <select
          name="batch_reward_pack_id"
          value={selectedPoolId}
          onChange={(event) => {
            setSelectedPoolId(event.target.value);
            setPreviews([]);
          }}
          className="mt-2 w-full rounded-2xl border-0 bg-white px-4 py-4 text-lg font-black text-slate-900 shadow-sm"
        >
          {pools.map((item) => (
            <option key={item.packId} value={item.packId}>
              {item.name}｜剩餘 {item.stock} 張
            </option>
          ))}
        </select>
      </label>

      <input type="hidden" name="batch_series_id" value={selectedPool?.seriesId || ''} />
      <input type="hidden" name="batch_category_id" value="" />
      <input type="hidden" name="batch_prefix" value={autoPrefix} />
      <input type="hidden" name="batch_start_number" value={String(startNumber)} />

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <label className="block">
          <span className="text-sm font-black text-slate-500">稀有度</span>
          <select name="batch_rarity" value={rarity} onChange={(event) => setRarity(event.target.value)} className="mt-2 w-full rounded-2xl border-0 bg-white px-4 py-3 font-bold text-slate-900 shadow-sm">
            {rarityOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-black text-slate-500">每張庫存</span>
          <input name="batch_stock" type="number" min="0" value={stock} onChange={(event) => setStock(Number(event.target.value || 0))} className="mt-2 w-full rounded-2xl border-0 bg-white px-4 py-3 font-bold text-slate-900 shadow-sm" />
        </label>
        <label className="block">
          <span className="text-sm font-black text-slate-500">抽中權重</span>
          <input name="batch_weight" type="number" min="0" value={weight} onChange={(event) => setWeight(Number(event.target.value || 0))} className="mt-2 w-full rounded-2xl border-0 bg-white px-4 py-3 font-bold text-slate-900 shadow-sm" />
        </label>
      </div>

      <div className="mt-3 rounded-3xl bg-white/80 px-4 py-3 text-sm font-black text-blue-700 shadow-sm">
        系統會自動產生卡號：{autoPrefix}-{pad(startNumber)}、{autoPrefix}-{pad(startNumber + 1)}、{autoPrefix}-{pad(startNumber + 2)}...
      </div>

      <label className="mt-4 block rounded-[1.75rem] border-2 border-dashed border-blue-200 bg-white/80 p-5 text-center shadow-sm">
        <span className="text-base font-black text-blue-700">選擇多張圖片</span>
        <input name="batch_source_files" type="file" accept="image/*" multiple onChange={onFilesChange} className="mt-3 block w-full text-sm font-bold text-slate-600" />
      </label>

      <input type="hidden" name="batch_card_names" value={JSON.stringify(previews.map((item) => item.cardName))} />
      <input type="hidden" name="batch_card_nos" value={JSON.stringify(previews.map((item) => item.cardNo))} />
      <input type="hidden" name="batch_rendered_data_urls" value={JSON.stringify(previews.map((item) => item.dataUrl))} />

      {isRendering ? (
        <div className="mt-4 rounded-3xl bg-white p-4 text-center text-base font-black text-blue-700 shadow-sm">
          正在套版卡片中...
        </div>
      ) : null}

      {previews.length > 0 ? (
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
          {previews.map((item) => (
            <div key={item.id} className="rounded-3xl bg-white p-3 shadow-sm ring-1 ring-blue-100">
              <img src={item.dataUrl} alt={item.cardName} className="aspect-[3/4] w-full rounded-2xl object-cover" />
              <p className="mt-2 text-xs font-black text-blue-500">{item.cardNo}</p>
              <p className="text-sm font-black text-slate-900">{item.cardName}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
