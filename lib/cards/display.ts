import type { RewardCard } from '@/lib/types';

function normalizeText(text: string) {
  return text.trim().replace(/\s+/g, ' ');
}

function stripRarityPrefix(name: string): string {
  const rarity = [
    '傳說', 'LEGENDARY', '超稀有', 'SUPER_RARE', '閃亮', 'RARE', '普通', 'COMMON',
  ];
  let cleaned = name;
  for (const token of rarity) {
    if (cleaned.startsWith(token)) {
      cleaned = cleaned.slice(token.length).trim();
    }
  }
  return cleaned;
}

export function isLikelyUploadFileName(name?: string | null) {
  if (!name) return false;
  const normalized = normalizeText(name).toLowerCase();

  return (
    normalized.includes('chatgpt image') ||
    normalized.includes('image 202') ||
    normalized.includes('img_') ||
    normalized.includes('screenshot') ||
    normalized.includes('截圖') ||
    normalized.includes('螢幕快照') ||
    /\.(png|jpg|jpeg|webp)$/i.test(normalized) ||
    /^\d{4}[-_]/.test(normalized) ||
    /^photo[-_\s]?\d+/i.test(normalized)
  );
}

function seriesBaseName(seriesName?: string | null) {
  const raw = normalizeText(seriesName || '神秘卡片');

  if (raw.includes('布麗') || raw.includes('狗')) return '布麗狗卡';
  if (raw.includes('小車') || raw.includes('車')) return '小車卡';
  if (raw.includes('爸爸')) return '爸爸特製卡';
  if (raw.includes('冒險')) return '冒險卡';
  if (raw.includes('生日')) return '生日卡';
  if (raw.includes('端午')) return '端午卡';
  if (raw.includes('植物') || raw.includes('皮克')) return '植物卡';

  return raw
    .replace(/驚喜卡包/g, '')
    .replace(/卡包/g, '')
    .replace(/系列/g, '')
    .trim() || '神秘卡片';
}

function cardNumberSuffix(cardNo?: string | null) {
  if (!cardNo) return '';
  const match = cardNo.match(/(\d{1,4})$/);
  return match ? ` ${match[1].padStart(3, '0')}` : '';
}

export function getRewardCardDisplayName(card: Pick<RewardCard, 'name' | 'card_no' | 'series'>) {
  const rawName = normalizeText(card.name || '');
  const cleanName = stripRarityPrefix(rawName);
  if (cleanName && !isLikelyUploadFileName(cleanName)) return cleanName;

  const fallback = stripRarityPrefix(seriesBaseName(card.series?.name) || '神秘卡片');
  return `${fallback}${cardNumberSuffix(card.card_no)}`;
}
