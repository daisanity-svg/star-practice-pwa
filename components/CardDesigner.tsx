'use client';

import { ChangeEvent, useMemo, useRef, useState } from 'react';

type Option = { id: string; name: string };

type Props = {
  series: Option[];
  categories: Option[];
};

const rarityOptions = [
  { value: 'common', label: '普通', badge: 'COMMON', gradient: ['#F8FAFC', '#D9F99D'], frame: '#86EFAC' },
  { value: 'rare', label: '稀有', badge: 'RARE', gradient: ['#EFF6FF', '#BFDBFE'], frame: '#60A5FA' },
  { value: 'super_rare', label: '超稀有', badge: 'SUPER', gradient: ['#FAF5FF', '#E9D5FF'], frame: '#A78BFA' },
  { value: 'legendary', label: '傳說', badge: 'LEGEND', gradient: ['#FFFBEB', '#FDE68A'], frame: '#F59E0B' }
];

function safeText(text: string, fallback: string) {
  return text.trim().length > 0 ? text.trim() : fallback;
}

export function CardDesigner({ series, categories }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [renderedDataUrl, setRenderedDataUrl] = useState('');
  const [cardName, setCardName] = useState('紅色消防車');
  const [cardNo, setCardNo] = useState('CAR-001');
  const [seriesName, setSeriesName] = useState(series[0]?.name || '小車系列');
  const [rarity, setRarity] = useState('common');

  const rarityConfig = useMemo(
    () => rarityOptions.find((item) => item.value === rarity) || rarityOptions[0],
    [rarity]
  );

  function drawCard(nextImageUrl = imageUrl) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 900;
    canvas.height = 1200;

    const gradient = ctx.createLinearGradient(0, 0, 900, 1200);
    gradient.addColorStop(0, rarityConfig.gradient[0]);
    gradient.addColorStop(1, rarityConfig.gradient[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 900, 1200);

    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    roundRect(ctx, 55, 55, 790, 1090, 58);
    ctx.fill();

    ctx.strokeStyle = rarityConfig.frame;
    ctx.lineWidth = 18;
    roundRect(ctx, 55, 55, 790, 1090, 58);
    ctx.stroke();

    ctx.fillStyle = '#334155';
    ctx.font = '900 42px sans-serif';
    ctx.fillText(safeText(seriesName, '收藏系列'), 95, 135);

    ctx.fillStyle = rarityConfig.frame;
    roundRect(ctx, 625, 82, 180, 66, 28);
    ctx.fill();
    ctx.fillStyle = '#111827';
    ctx.font = '900 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(rarityConfig.badge, 715, 125);
    ctx.textAlign = 'left';

    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, 115, 190, 670, 650, 48);
    ctx.fill();
    ctx.strokeStyle = 'rgba(15,23,42,0.08)';
    ctx.lineWidth = 6;
    roundRect(ctx, 115, 190, 670, 650, 48);
    ctx.stroke();

    const finish = () => {
      ctx.fillStyle = '#111827';
      ctx.font = '900 64px sans-serif';
      ctx.fillText(safeText(cardName, '新卡片'), 100, 965);

      ctx.fillStyle = '#64748B';
      ctx.font = '800 32px sans-serif';
      ctx.fillText(safeText(cardNo, 'CARD-001'), 100, 1030);

      ctx.fillStyle = '#FFFFFF';
      roundRect(ctx, 585, 985, 205, 62, 28);
      ctx.fill();
      ctx.fillStyle = '#334155';
      ctx.font = '900 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(rarityConfig.label, 687, 1026);
      ctx.textAlign = 'left';

      setRenderedDataUrl(canvas.toDataURL('image/png'));
    };

    if (!nextImageUrl) {
      ctx.fillStyle = '#CBD5E1';
      ctx.font = '900 72px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('上傳圖片', 450, 520);
      ctx.font = '700 30px sans-serif';
      ctx.fillText('系統會自動套成收藏卡', 450, 575);
      ctx.textAlign = 'left';
      finish();
      return;
    }

    const img = new Image();
    img.onload = () => {
      const box = { x: 145, y: 220, w: 610, h: 590 };
      const scale = Math.min(box.w / img.width, box.h / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, box.x + (box.w - w) / 2, box.y + (box.h - h) / 2, w, h);
      finish();
    };
    img.src = nextImageUrl;
  }

  function onImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setTimeout(() => drawCard(url), 0);
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-black text-slate-500">系列</span>
          <select name="series_id" className="mt-2 w-full rounded-3xl border-0 bg-white/90 px-4 py-4 text-lg font-bold text-ink shadow-sm" onChange={(event) => setSeriesName(event.target.selectedOptions[0]?.text || '')}>
            {series.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-black text-slate-500">分類</span>
          <select name="category_id" className="mt-2 w-full rounded-3xl border-0 bg-white/90 px-4 py-4 text-lg font-bold text-ink shadow-sm" defaultValue="">
            <option value="">不指定</option>
            {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-black text-slate-500">卡片名稱</span>
          <input name="name" value={cardName} onChange={(event) => setCardName(event.target.value)} onBlur={() => drawCard()} className="mt-2 w-full rounded-3xl border-0 bg-white/90 px-4 py-4 text-lg font-bold text-ink shadow-sm" required />
        </label>
        <label className="block">
          <span className="text-sm font-black text-slate-500">卡號</span>
          <input name="card_no" value={cardNo} onChange={(event) => setCardNo(event.target.value)} onBlur={() => drawCard()} className="mt-2 w-full rounded-3xl border-0 bg-white/90 px-4 py-4 text-lg font-bold text-ink shadow-sm" />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-black text-slate-500">稀有度</span>
        <select name="rarity" value={rarity} onChange={(event) => { setRarity(event.target.value); setTimeout(() => drawCard(), 0); }} className="mt-2 w-full rounded-3xl border-0 bg-white/90 px-4 py-4 text-lg font-bold text-ink shadow-sm">
          {rarityOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </label>

      <label className="block rounded-[2rem] bg-white/80 p-5 shadow-sm">
        <span className="text-sm font-black text-slate-500">上傳原圖</span>
        <input name="source_image_file" type="file" accept="image/*" onChange={onImageChange} className="mt-3 block w-full text-base font-bold text-slate-600" />
      </label>

      <input type="hidden" name="rendered_card_data_url" value={renderedDataUrl} />

      <div className="rounded-[2rem] bg-white/80 p-4 shadow-sm">
        <canvas ref={canvasRef} className="aspect-[3/4] w-full rounded-[1.5rem] bg-slate-100" />
        <button type="button" onClick={() => drawCard()} className="mt-4 w-full rounded-[2rem] bg-mint px-5 py-4 text-lg font-black text-emerald-950">
          重新套版預覽
        </button>
      </div>

      <label className="block">
        <span className="text-sm font-black text-slate-500">描述</span>
        <input name="description" className="mt-2 w-full rounded-3xl border-0 bg-white/90 px-4 py-4 text-lg font-bold text-ink shadow-sm" placeholder="可先空白" />
      </label>
    </div>
  );
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
