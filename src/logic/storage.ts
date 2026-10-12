// 学習結果の端末内保存。サーバーには一切送らない。
// Webでは localStorage、使えない環境ではメモリ内だけに保持する。
import type { Mode } from './quiz';

export const STORAGE_KEY = 'tomori-clock-008:records:v1';
export const MAX_RECORDS = 30;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface RecordEntry {
  /** ISO形式の日時 */
  playedAt: string;
  mode: Mode;
  correct: number;
  total: number;
}

export function createMemoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

let memoryFallback: StorageLike | undefined;

/** localStorage が使えればそれを、使えなければメモリ保存を返す */
export function getStorage(): StorageLike {
  try {
    const ls = (globalThis as { localStorage?: StorageLike }).localStorage;
    if (ls) {
      const probe = `${STORAGE_KEY}:probe`;
      ls.setItem(probe, '1');
      ls.removeItem(probe);
      return ls;
    }
  } catch {
    // プライベートモードなどで使えない場合はメモリへ
  }
  memoryFallback ??= createMemoryStorage();
  return memoryFallback;
}

const isMode = (v: unknown): v is Mode => v === 'beginner' || v === 'challenge';

/** 保存文字列を読み取り、おかしなデータは捨てる */
export function parseRecords(raw: string | null): RecordEntry[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (e): e is RecordEntry =>
        !!e &&
        typeof e.playedAt === 'string' &&
        isMode(e.mode) &&
        Number.isInteger(e.correct) &&
        Number.isInteger(e.total) &&
        e.total > 0 &&
        e.correct >= 0 &&
        e.correct <= e.total,
    );
  } catch {
    return [];
  }
}

/** 新しい記録を先頭に追加し、古いものは MAX_RECORDS 件まで */
export function addRecord(list: RecordEntry[], entry: RecordEntry, max = MAX_RECORDS): RecordEntry[] {
  return [entry, ...list].slice(0, max);
}

/** モードごとの最高得点 (記録がなければ null) */
export function bestScores(list: RecordEntry[]): Record<Mode, number | null> {
  const best: Record<Mode, number | null> = { beginner: null, challenge: null };
  for (const r of list) {
    if (best[r.mode] === null || r.correct > (best[r.mode] as number)) best[r.mode] = r.correct;
  }
  return best;
}

export function loadRecords(storage: StorageLike = getStorage()): RecordEntry[] {
  try {
    return parseRecords(storage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

export function saveRecords(list: RecordEntry[], storage: StorageLike = getStorage()): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // 保存できなくてもアプリは続けて使える
  }
}

export function clearRecords(storage: StorageLike = getStorage()): void {
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // 無視
  }
}
