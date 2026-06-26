export function toTaipeiDateString(date: Date): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === 'year');
  const month = parts.find((p) => p.type === 'month');
  const day = parts.find((p) => p.type === 'day');
  if (!year?.value || !month?.value || !day?.value) {
    return date.toISOString().slice(0, 10);
  }
  return `${year.value}-${month.value}-${day.value}`;
}

export function getTaipeiTodayString(): string {
  return toTaipeiDateString(new Date());
}

export function getTaipeiTodayRange(): { start: string; end: string } {
  const dateStr = getTaipeiTodayString();
  const start = new Date(`${dateStr}T00:00:00+08:00`);
  const end = new Date(`${dateStr}T00:00:00+08:00`);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}
