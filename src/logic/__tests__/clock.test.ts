import { describe, expect, it } from 'vitest';
import {
  addHours, addMinutes, angleFromPoint, dragHourHand, dragMinuteHand, formatDigital,
  hourHandAngle, hourOf, minuteFromAngle, minuteHandAngle, minuteOf, normalize,
  readMinuteJa, readTimeJa, toTotal,
} from '../clock';

describe('長針と短針の角度計算', () => {
  it('3:00 は 短針90度・長針0度', () => {
    expect(hourHandAngle(toTotal(3, 0))).toBe(90);
    expect(minuteHandAngle(toTotal(3, 0))).toBe(0);
  });
  it('6:30 は 短針195度（6と7のまんなか）・長針180度', () => {
    expect(hourHandAngle(toTotal(6, 30))).toBe(195);
    expect(minuteHandAngle(toTotal(6, 30))).toBe(180);
  });
  it('短針は分に合わせて少しずつ動く (1分=0.5度)', () => {
    expect(hourHandAngle(toTotal(3, 1)) - hourHandAngle(toTotal(3, 0))).toBeCloseTo(0.5);
    expect(hourHandAngle(toTotal(3, 20))).toBe(100);
    expect(hourHandAngle(toTotal(9, 45))).toBe(292.5);
  });
  it('12:00 は 両方0度', () => {
    expect(hourHandAngle(toTotal(12, 0))).toBe(0);
    expect(minuteHandAngle(toTotal(12, 0))).toBe(0);
  });
  it('すべての時刻で 長針 = 分×6度、短針 = 経過分×0.5度', () => {
    for (let t = 0; t < 720; t++) {
      expect(minuteHandAngle(t)).toBe((t % 60) * 6);
      expect(hourHandAngle(t)).toBe(t * 0.5);
      expect(hourHandAngle(t)).toBeLessThan(360);
    }
  });
});

describe('5分単位・1分単位の時計表示', () => {
  it('5分単位: 5の倍数の分は長針が30度きざみ', () => {
    for (let m = 0; m < 60; m += 5) expect(minuteHandAngle(toTotal(4, m))).toBe(m * 6);
    expect(minuteHandAngle(toTotal(4, 5))).toBe(30);
    expect(minuteHandAngle(toTotal(4, 55))).toBe(330);
  });
  it('1分単位: 長針が6度きざみ', () => {
    expect(minuteHandAngle(toTotal(4, 1))).toBe(6);
    expect(minuteHandAngle(toTotal(4, 59))).toBe(354);
    expect(minuteHandAngle(toTotal(4, 37))).toBe(222);
  });
  it('デジタル表示と読み方', () => {
    expect(formatDigital(toTotal(3, 5))).toBe('3:05');
    expect(formatDigital(toTotal(12, 0))).toBe('12:00');
    expect(formatDigital(toTotal(9, 45))).toBe('9:45');
    expect(readTimeJa(toTotal(4, 0))).toBe('よじ ちょうど');
    expect(readTimeJa(toTotal(7, 20))).toBe('しちじ にじゅっぷん');
    expect(readTimeJa(toTotal(9, 1))).toBe('くじ いっぷん');
    expect(readMinuteJa(toTotal(1, 15))).toBe('じゅうごふん');
    expect(readMinuteJa(toTotal(1, 8))).toBe('はっぷん');
    expect(readMinuteJa(toTotal(1, 33))).toBe('さんじゅうさんぷん');
    expect(readMinuteJa(toTotal(1, 56))).toBe('ごじゅうろっぷん');
  });
});

describe('12時をまたぐ時刻', () => {
  it('11:59 の1分後は 12:00', () => {
    const t = toTotal(11, 59);
    expect(formatDigital(addMinutes(t, 1))).toBe('12:00');
    expect(addMinutes(t, 1)).toBe(0);
  });
  it('12:00 の1分前は 11:59', () => {
    expect(formatDigital(addMinutes(toTotal(12, 0), -1))).toBe('11:59');
  });
  it('11:59 では短針が12のすぐ手前、12:00 でぴったり0度', () => {
    expect(hourHandAngle(toTotal(11, 59))).toBe(359.5);
    expect(hourHandAngle(addMinutes(toTotal(11, 59), 1))).toBe(0);
  });
  it('12時は 1時の前、時間ボタンで 12→1 / 1→12', () => {
    expect(hourOf(addHours(toTotal(12, 30), 1))).toBe(1);
    expect(hourOf(addHours(toTotal(1, 30), -1))).toBe(12);
    expect(minuteOf(addHours(toTotal(12, 30), 1))).toBe(30);
  });
  it('分ボタンで 12:55 → 1:00 と時も進む', () => {
    expect(formatDigital(addMinutes(toTotal(12, 55), 5))).toBe('1:00');
    expect(formatDigital(addMinutes(toTotal(1, 0), -5))).toBe('12:55');
  });
  it('normalize は負の数や大きな数も 0〜719 に直す', () => {
    expect(normalize(-1)).toBe(719);
    expect(normalize(720)).toBe(0);
    expect(normalize(1500)).toBe(60);
  });
});

describe('針のドラッグ', () => {
  it('点の位置から角度 (12時=0度, 時計回り)', () => {
    expect(angleFromPoint(0, -10)).toBe(0);
    expect(angleFromPoint(10, 0)).toBe(90);
    expect(angleFromPoint(0, 10)).toBe(180);
    expect(angleFromPoint(-10, 0)).toBe(270);
  });
  it('角度から分。5分きざみにもそろえられる', () => {
    expect(minuteFromAngle(90)).toBe(15);
    expect(minuteFromAngle(359)).toBe(0);
    expect(minuteFromAngle(100, 5)).toBe(15);
    expect(minuteFromAngle(104, 5)).toBe(15);
    expect(minuteFromAngle(106, 5)).toBe(20);
  });
  it('長針を 59→0 に動かすと時が進む / 0→59 で戻る', () => {
    expect(formatDigital(dragMinuteHand(toTotal(11, 59), 0))).toBe('12:00');
    expect(formatDigital(dragMinuteHand(toTotal(12, 0), 354))).toBe('11:59');
    expect(formatDigital(dragMinuteHand(toTotal(3, 55), 2, 5))).toBe('4:00');
  });
  it('長針を同じ時間内で動かしても時は変わらない', () => {
    expect(formatDigital(dragMinuteHand(toTotal(3, 10), 180))).toBe('3:30');
  });
  it('短針を動かすと、分はそのままで時だけが変わる', () => {
    const t = toTotal(3, 20);
    expect(formatDigital(dragHourHand(t, 160))).toBe('5:20');
    expect(formatDigital(dragHourHand(t, 100))).toBe('3:20');
    expect(formatDigital(dragHourHand(toTotal(12, 0), 359))).toBe('12:00');
    expect(formatDigital(dragHourHand(toTotal(1, 0), 345))).toBe('12:00');
  });
});
