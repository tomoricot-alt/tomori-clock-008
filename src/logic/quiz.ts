// クイズの出題・判定・集計（画面に依存しない純粋関数）。
import { hourOf, minuteOf, normalize, toTotal } from './clock';

export type Mode = 'beginner' | 'challenge';
export type QuestionKind = 'read' | 'make';
export type Rng = () => number;

export const QUESTION_COUNT = 10;

export interface Question {
  id: number;
  kind: QuestionKind;
  /** 正解の時刻 (0〜719) */
  answer: number;
  /** read問題の4択 (正解を含む) */
  choices: number[];
}

export interface QuestionResult {
  question: Question;
  userAnswer: number;
  correct: boolean;
}

export type Rank = 'perfect' | 'great' | 'good' | 'try';

export interface Summary {
  total: number;
  correct: number;
  percent: number;
  rank: Rank;
  wrong: QuestionResult[];
}

export const stepOf = (mode: Mode): 1 | 5 => (mode === 'beginner' ? 5 : 1);

export const modeLabel = (mode: Mode): string =>
  mode === 'beginner' ? 'にゅうもん（5ふんたんい）' : 'チャレンジ（1ぷんたんい）';

const randInt = (rng: Rng, n: number) => Math.floor(rng() * n);

function shuffle<T>(arr: T[], rng: Rng): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(rng, i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** モードに合った時刻をランダムに作る (入門は0,5,10,...55分) */
export function randomTime(mode: Mode, rng: Rng): number {
  const hour = 1 + randInt(rng, 12);
  const minute = mode === 'beginner' ? randInt(rng, 12) * 5 : randInt(rng, 60);
  return toTotal(hour, minute);
}

/** まちがえやすい選択肢（時と分を取りちがえる・1時間ずれる・分がずれる）を含む4択を作る */
export function makeChoices(answer: number, mode: Mode, rng: Rng): number[] {
  const h = hourOf(answer);
  const m = minuteOf(answer);
  const candidates: number[] = [
    toTotal(h + 1, m),
    toTotal(h - 1, m),
    toTotal(h, m + 5),
    toTotal(h, m - 5),
  ];
  // 長針と短針を読みちがえたパターン (分が5の倍数のときだけ自然に作れる)
  if (m % 5 === 0) candidates.push(toTotal(m / 5 === 0 ? 12 : m / 5, h * 5));
  if (mode === 'challenge') candidates.push(toTotal(h, m + 1), toTotal(h, m - 1));

  const pool = shuffle(
    [...new Set(candidates.map(normalize))].filter((c) => c !== normalize(answer)),
    rng,
  );
  const picked = pool.slice(0, 3);
  while (picked.length < 3) {
    const t = randomTime(mode, rng);
    if (t !== normalize(answer) && !picked.includes(t)) picked.push(t);
  }
  return shuffle([normalize(answer), ...picked], rng);
}

export function makeQuestion(id: number, kind: QuestionKind, mode: Mode, rng: Rng, avoid: number[] = []): Question {
  let answer = randomTime(mode, rng);
  for (let i = 0; i < 50 && avoid.includes(answer); i++) answer = randomTime(mode, rng);
  return { id, kind, answer, choices: kind === 'read' ? makeChoices(answer, mode, rng) : [] };
}

/** 10問を作る。3・6・9問目は「針を動かして時刻を作る」問題、ほかは「時計を読む」問題。時刻は重ならない */
export function generateQuiz(mode: Mode, rng: Rng = Math.random, count: number = QUESTION_COUNT): Question[] {
  const questions: Question[] = [];
  const used: number[] = [];
  for (let i = 0; i < count; i++) {
    const kind: QuestionKind = i % 3 === 2 ? 'make' : 'read';
    const q = makeQuestion(i + 1, kind, mode, rng, used);
    used.push(q.answer);
    questions.push(q);
  }
  return questions;
}

/** 正解・不正解の判定。時刻が完全に一致したときだけ正解 */
export function judge(question: Question, userAnswer: number): boolean {
  return normalize(userAnswer) === normalize(question.answer);
}

export function rankOf(percent: number): Rank {
  if (percent === 100) return 'perfect';
  if (percent >= 80) return 'great';
  if (percent >= 50) return 'good';
  return 'try';
}

/** 結果の集計 */
export function summarize(results: QuestionResult[]): Summary {
  const total = results.length;
  const correct = results.filter((r) => r.correct).length;
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
  return { total, correct, percent, rank: rankOf(percent), wrong: results.filter((r) => !r.correct) };
}

export const RANK_MESSAGE: Record<Rank, string> = {
  perfect: 'ぜんぶ せいかい！ すごい！ とけいはかせ だね！',
  great: 'とても よくできました！ もうすこしで ぜんぶ せいかい！',
  good: 'いいちょうし！ まちがえた ところを もういちど みてみよう。',
  try: 'だいじょうぶ！ 「みてみよう」で はりの うごきを たしかめよう。',
};
