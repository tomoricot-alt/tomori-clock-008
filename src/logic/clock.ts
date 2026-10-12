// 時計の計算ロジック（画面に依存しない純粋関数）。
// 時刻は「12:00からの経過分 (0〜719)」の整数 `total` で表す。
//   例) 3:20 → 200,  12:00 → 0,  11:59 → 719
// 719分の次は 0分(12:00)に戻るので、時間の切り替わりは剰余だけで正確に扱える。

export const MINUTES_PER_HOUR = 60;
export const MINUTES_PER_HALF_DAY = 720;

/** 0〜719 の範囲に直す（負の数・大きな数もOK） */
export function normalize(total: number): number {
  const n = Math.round(total) % MINUTES_PER_HALF_DAY;
  return (n + MINUTES_PER_HALF_DAY) % MINUTES_PER_HALF_DAY;
}

/** 時(1〜12)と分(0〜59)から total を作る。12時は 0時として扱う */
export function toTotal(hour: number, minute: number): number {
  return normalize((hour % 12) * MINUTES_PER_HOUR + minute);
}

/** 表示用の時 (1〜12) */
export function hourOf(total: number): number {
  const h = Math.floor(normalize(total) / MINUTES_PER_HOUR);
  return h === 0 ? 12 : h;
}

/** 分 (0〜59) */
export function minuteOf(total: number): number {
  return normalize(total) % MINUTES_PER_HOUR;
}

/** 長針の角度（12時の方向を0度として時計回り, 0〜360未満）。1分=6度 */
export function minuteHandAngle(total: number): number {
  return minuteOf(total) * 6;
}

/** 短針の角度（0〜360未満）。1時間=30度、1分=0.5度なので分に合わせて少しずつ動く */
export function hourHandAngle(total: number): number {
  return normalize(total) * 0.5;
}

export function addMinutes(total: number, delta: number): number {
  return normalize(total + delta);
}

export function addHours(total: number, delta: number): number {
  return normalize(total + delta * MINUTES_PER_HOUR);
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/** デジタル表示 例) "3:05" "12:00" */
export function formatDigital(total: number): string {
  return `${hourOf(total)}:${pad2(minuteOf(total))}`;
}

const HOUR_READING = [
  '', 'いちじ', 'にじ', 'さんじ', 'よじ', 'ごじ', 'ろくじ',
  'しちじ', 'はちじ', 'くじ', 'じゅうじ', 'じゅういちじ', 'じゅうにじ',
];
const TENS_READING = ['', 'じゅう', 'にじゅう', 'さんじゅう', 'よんじゅう', 'ごじゅう'];
// 1の位 (ふん/ぷん の使い分け込み)。10の位があるときの0は別扱い。
const ONES_READING = [
  '', 'いっぷん', 'にふん', 'さんぷん', 'よんぷん', 'ごふん',
  'ろっぷん', 'ななふん', 'はっぷん', 'きゅうふん',
];
// 10の位だけ (10,20,...50分) は「じゅっぷん」と読む
const TENS_ONLY_READING = ['', 'じゅっぷん', 'にじゅっぷん', 'さんじゅっぷん', 'よんじゅっぷん', 'ごじゅっぷん'];

/** 「〜じ」のよみがな 例) 4 → "よじ" */
export function readHourJa(total: number): string {
  return HOUR_READING[hourOf(total)];
}

/** 「〜ふん」のよみがな 例) 0 → "ちょうど", 20 → "にじゅっぷん", 21 → "にじゅういっぷん" */
export function readMinuteJa(total: number): string {
  const m = minuteOf(total);
  if (m === 0) return 'ちょうど';
  const tens = Math.floor(m / 10);
  const ones = m % 10;
  if (ones === 0) return TENS_ONLY_READING[tens];
  return TENS_READING[tens] + ONES_READING[ones];
}

/** 時刻全体のよみがな 例) 3:20 → "さんじ にじゅっぷん", 4:00 → "よじ ちょうど" */
export function readTimeJa(total: number): string {
  return `${readHourJa(total)} ${readMinuteJa(total)}`;
}

/** 時計の中心からの差 (dx, dy: 画面座標で下が+) を角度に直す。12時方向=0度, 時計回り */
export function angleFromPoint(dx: number, dy: number): number {
  const deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
  return (deg + 360) % 360;
}

/** 角度から分 (0〜59)。step=5なら5分きざみにそろえる */
export function minuteFromAngle(angle: number, step: 1 | 5 = 1): number {
  const m = Math.round(angle / 6 / step) * step;
  return ((m % 60) + 60) % 60;
}

/**
 * 長針をドラッグしたあとの時刻。
 * 59分→0分をまたいだときは時も進める（11:59 → 12:00）。戻る向きも同様。
 */
export function dragMinuteHand(prevTotal: number, angle: number, step: 1 | 5 = 1): number {
  const prevMinute = minuteOf(prevTotal);
  const newMinute = minuteFromAngle(angle, step);
  let hourIndex = Math.floor(normalize(prevTotal) / MINUTES_PER_HOUR);
  if (prevMinute >= 45 && newMinute <= 15) hourIndex += 1;
  else if (prevMinute <= 15 && newMinute >= 45) hourIndex -= 1;
  return normalize(hourIndex * MINUTES_PER_HOUR + newMinute);
}

/** 短針をドラッグしたあとの時刻。分は変えず、短針の向きから「時」だけを決める */
export function dragHourHand(prevTotal: number, angle: number): number {
  const minute = minuteOf(prevTotal);
  const hourIndex = Math.round((angle * 2 - minute) / MINUTES_PER_HOUR);
  return normalize(hourIndex * MINUTES_PER_HOUR + minute);
}
