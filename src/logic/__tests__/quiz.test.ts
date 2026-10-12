import { describe, expect, it } from 'vitest';
import { hourOf, minuteOf, toTotal } from '../clock';
import {
  generateQuiz, judge, makeChoices, QUESTION_COUNT, randomTime, rankOf, summarize,
  type Question, type QuestionResult,
} from '../quiz';

/** 同じ結果を返す疑似乱数（テストを安定させる） */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

describe('出題', () => {
  it('入門モードは5分単位の時刻だけ', () => {
    for (let seed = 1; seed <= 50; seed++) {
      for (const q of generateQuiz('beginner', seeded(seed))) {
        expect(minuteOf(q.answer) % 5).toBe(0);
        for (const c of q.choices) expect(minuteOf(c) % 5).toBe(0);
      }
    }
  });
  it('チャレンジモードは1分単位の時刻が出る', () => {
    const minutes = new Set<number>();
    for (let seed = 1; seed <= 30; seed++) {
      for (const q of generateQuiz('challenge', seeded(seed))) minutes.add(minuteOf(q.answer) % 5);
    }
    expect([...minutes].some((m) => m !== 0)).toBe(true);
  });
  it('10問で、時刻は重ならず、3・6・9問目が「つくる」問題', () => {
    const quiz = generateQuiz('challenge', seeded(7));
    expect(quiz).toHaveLength(QUESTION_COUNT);
    expect(new Set(quiz.map((q) => q.answer)).size).toBe(10);
    expect(quiz.map((q) => q.kind)).toEqual([
      'read', 'read', 'make', 'read', 'read', 'make', 'read', 'read', 'make', 'read',
    ]);
  });
  it('4択は正解を1つだけ含み、重複しない', () => {
    for (const mode of ['beginner', 'challenge'] as const) {
      for (let seed = 1; seed <= 100; seed++) {
        const rng = seeded(seed);
        const answer = randomTime(mode, rng);
        const choices = makeChoices(answer, mode, rng);
        expect(choices).toHaveLength(4);
        expect(new Set(choices).size).toBe(4);
        expect(choices.filter((c) => c === answer)).toHaveLength(1);
      }
    }
  });
  it('12時をまたぐ時刻でも4択が作れる', () => {
    for (const t of [toTotal(12, 0), toTotal(11, 59), toTotal(12, 55), toTotal(1, 0)]) {
      const choices = makeChoices(t, 'challenge', seeded(3));
      expect(new Set(choices).size).toBe(4);
      for (const c of choices) {
        expect(hourOf(c)).toBeGreaterThanOrEqual(1);
        expect(hourOf(c)).toBeLessThanOrEqual(12);
      }
    }
  });
});

describe('正解・不正解の判定', () => {
  const q: Question = { id: 1, kind: 'make', answer: toTotal(3, 20), choices: [] };
  it('同じ時刻なら正解', () => expect(judge(q, toTotal(3, 20))).toBe(true));
  it('1分でもちがえば不正解', () => expect(judge(q, toTotal(3, 21))).toBe(false));
  it('時がちがえば不正解', () => expect(judge(q, toTotal(4, 20))).toBe(false));
  it('12:00 と 0分 は同じ時刻として扱う', () => {
    const noon: Question = { id: 2, kind: 'make', answer: toTotal(12, 0), choices: [] };
    expect(judge(noon, 0)).toBe(true);
    expect(judge(noon, 720)).toBe(true);
    expect(judge(noon, toTotal(11, 59))).toBe(false);
  });
});

describe('10問終了時の集計', () => {
  const make = (n: number, correctCount: number): QuestionResult[] =>
    Array.from({ length: n }, (_, i) => {
      const question: Question = { id: i + 1, kind: 'read', answer: toTotal(1 + (i % 12), 0), choices: [] };
      const correct = i < correctCount;
      return { question, userAnswer: correct ? question.answer : toTotal(1 + ((i + 1) % 12), 0), correct };
    });

  it('8問正解なら 8/10 で 80%・まちがいは2つ', () => {
    const s = summarize(make(10, 8));
    expect(s.total).toBe(10);
    expect(s.correct).toBe(8);
    expect(s.percent).toBe(80);
    expect(s.wrong).toHaveLength(2);
    expect(s.rank).toBe('great');
  });
  it('全問正解は perfect、0問正解は try', () => {
    expect(summarize(make(10, 10)).rank).toBe('perfect');
    expect(summarize(make(10, 10)).wrong).toHaveLength(0);
    expect(summarize(make(10, 0)).rank).toBe('try');
    expect(summarize(make(10, 0)).percent).toBe(0);
  });
  it('ランクのきまり', () => {
    expect(rankOf(100)).toBe('perfect');
    expect(rankOf(80)).toBe('great');
    expect(rankOf(50)).toBe('good');
    expect(rankOf(40)).toBe('try');
  });
  it('0問でもエラーにならない', () => {
    expect(summarize([]).percent).toBe(0);
  });
});
