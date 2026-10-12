import { describe, expect, it } from 'vitest';
import {
  addRecord, bestScores, clearRecords, createMemoryStorage, loadRecords, MAX_RECORDS,
  parseRecords, saveRecords, STORAGE_KEY, type RecordEntry,
} from '../storage';

const rec = (correct: number, mode: RecordEntry['mode'] = 'beginner'): RecordEntry => ({
  playedAt: '2026-01-01T00:00:00.000Z', mode, correct, total: 10,
});

describe('学習結果の端末内保存', () => {
  it('保存して読み出せる', () => {
    const s = createMemoryStorage();
    saveRecords(addRecord([], rec(7)), s);
    expect(loadRecords(s)).toEqual([rec(7)]);
  });
  it('新しい記録が先頭、最大件数をこえたら古いものから消える', () => {
    let list: RecordEntry[] = [];
    for (let i = 0; i < MAX_RECORDS + 5; i++) list = addRecord(list, rec(i % 11));
    expect(list).toHaveLength(MAX_RECORDS);
    expect(list[0].correct).toBe((MAX_RECORDS + 4) % 11);
  });
  it('モードごとの最高得点', () => {
    const list = [rec(5), rec(9), rec(6, 'challenge')];
    expect(bestScores(list)).toEqual({ beginner: 9, challenge: 6 });
    expect(bestScores([])).toEqual({ beginner: null, challenge: null });
  });
  it('こわれたデータや不正な記録は読み飛ばす', () => {
    expect(parseRecords('これはJSONではない')).toEqual([]);
    expect(parseRecords('{"a":1}')).toEqual([]);
    expect(parseRecords(null)).toEqual([]);
    expect(parseRecords(JSON.stringify([rec(3), { mode: 'x' }, { ...rec(11) }]))).toEqual([rec(3)]);
  });
  it('消去できる', () => {
    const s = createMemoryStorage();
    saveRecords([rec(1)], s);
    expect(s.getItem(STORAGE_KEY)).not.toBeNull();
    clearRecords(s);
    expect(loadRecords(s)).toEqual([]);
  });
  it('保存に失敗してもエラーにならない', () => {
    const broken = {
      getItem: () => { throw new Error('x'); },
      setItem: () => { throw new Error('x'); },
      removeItem: () => { throw new Error('x'); },
    };
    expect(() => saveRecords([rec(1)], broken)).not.toThrow();
    expect(loadRecords(broken)).toEqual([]);
    expect(() => clearRecords(broken)).not.toThrow();
  });
});
