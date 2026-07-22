export function convertTimestamps(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj.getTime();
  if (typeof obj.toMillis === 'function') return obj.toMillis();
  if (typeof obj.toDate === 'function') return obj.toDate().getTime();
  if (Array.isArray(obj)) return obj.map(convertTimestamps);
  if (obj.constructor && obj.constructor.name !== 'Object') {
    if (typeof obj.id === 'string' && typeof obj.path === 'string') return `[Ref: ${obj.path}]`;
    if (typeof obj.latitude === 'number' && typeof obj.longitude === 'number') return [obj.latitude, obj.longitude];
    try { return JSON.parse(JSON.stringify(obj)); } catch { return String(obj); }
  }
  const result: any = {};
  for (const [key, val] of Object.entries(obj)) {
    result[key] = convertTimestamps(val);
  }
  return result;
}

export function warrantyDaysLeft(expiresAt?: number): number {
  if (!expiresAt) return 0;
  const diff = expiresAt - Date.now();
  return diff > 0 ? Math.ceil(diff / 86400000) : 0;
}

export function dedupeTimeline<T extends { status: string; date: number }>(timeline: T[]): T[] {
  const latest = new Map<string, T>();
  for (const entry of timeline) {
    const existing = latest.get(entry.status);
    if (!existing || entry.date > existing.date) {
      latest.set(entry.status, entry);
    }
  }
  return Array.from(latest.values()).sort((a, b) => a.date - b.date);
}
