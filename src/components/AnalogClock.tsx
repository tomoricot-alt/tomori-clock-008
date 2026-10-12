import React, { useMemo, useRef } from 'react';
import { PanResponder, View, type GestureResponderEvent, type ViewStyle } from 'react-native';
import Svg, { Circle, G, Line, Text as SvgText } from 'react-native-svg';
import {
  angleFromPoint, dragHourHand, dragMinuteHand, hourHandAngle, minuteHandAngle, normalize,
} from '../logic/clock';
import { colors } from '../theme';

interface Props {
  /** 時刻 (12:00からの経過分) */
  total: number;
  size: number;
  /** 5, 10, 15... の数字を外側に出す (入門モード用) */
  showMinuteNumbers?: boolean;
  /** 指定すると、針をドラッグして動かせる */
  onChange?: (total: number) => void;
  /** ドラッグ時の分のきざみ */
  step?: 1 | 5;
}

const VIEW = 200; // 内部座標。size に合わせて拡大縮小
const C = VIEW / 2;
const R = 88; // 文字盤の半径。外側の青いふち(R+10)に分の数字を出す
const HOUR_LEN = 46;
const MINUTE_LEN = 76;

const polar = (angleDeg: number, len: number) => {
  const a = (angleDeg * Math.PI) / 180;
  return { x: C + len * Math.sin(a), y: C - len * Math.cos(a) };
};

type Hand = 'hour' | 'minute';

/** 時計の絵。SVGなのでiPhone(Expo)でもWebでも同じ見た目になる */
export function AnalogClock({ total, size, showMinuteNumbers = false, onChange, step = 1 }: Props) {
  const t = normalize(total);
  const hourAngle = hourHandAngle(t);
  const minuteAngle = minuteHandAngle(t);
  const hourTip = polar(hourAngle, HOUR_LEN);
  const minuteTip = polar(minuteAngle, MINUTE_LEN);
  const interactive = !!onChange;

  // PanResponder は作り直されないので、最新の値は ref 経由で読む
  const latest = useRef({ t, step, onChange, size });
  latest.current = { t, step, onChange, size };
  const dragging = useRef<Hand | null>(null);

  const pointOf = (e: GestureResponderEvent) => {
    const s = latest.current.size;
    const k = VIEW / s;
    return { x: e.nativeEvent.locationX * k - C, y: e.nativeEvent.locationY * k - C };
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !!latest.current.onChange,
        onMoveShouldSetPanResponder: () => !!latest.current.onChange,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => {
          const { x, y } = pointOf(e);
          const cur = latest.current.t;
          const h = polar(hourHandAngle(cur), HOUR_LEN);
          const m = polar(minuteHandAngle(cur), MINUTE_LEN);
          const dh = Math.hypot(x + C - h.x, y + C - h.y);
          const dm = Math.hypot(x + C - m.x, y + C - m.y);
          dragging.current = dh < dm ? 'hour' : 'minute';
          apply(x, y);
        },
        onPanResponderMove: (e) => {
          const { x, y } = pointOf(e);
          apply(x, y);
        },
        onPanResponderRelease: () => {
          dragging.current = null;
        },
        onPanResponderTerminate: () => {
          dragging.current = null;
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  function apply(x: number, y: number) {
    const { t: cur, step: st, onChange: cb } = latest.current;
    if (!cb || !dragging.current) return;
    if (Math.hypot(x, y) < 6) return; // 中心すぎると角度が不安定
    const angle = angleFromPoint(x, y);
    const next = dragging.current === 'hour' ? dragHourHand(cur, angle) : dragMinuteHand(cur, angle, st);
    if (next !== cur) cb(next);
  }

  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const major = i % 5 === 0;
    const a = polar(i * 6, R - 2);
    const b = polar(i * 6, R - (major ? 10 : 6));
    ticks.push(
      <Line
        key={`t${i}`}
        x1={a.x} y1={a.y} x2={b.x} y2={b.y}
        stroke={major ? colors.text : colors.muted}
        strokeWidth={major ? 2 : 1}
      />,
    );
  }

  const hourNumbers = [];
  for (let n = 1; n <= 12; n++) {
    const p = polar(n * 30, R - 24);
    hourNumbers.push(
      <SvgText
        key={`h${n}`} x={p.x} y={p.y + 7.5} fontSize={22} fontWeight="bold"
        fill={colors.text} textAnchor="middle"
      >
        {n}
      </SvgText>,
    );
  }

  const minuteNumbers = [];
  if (showMinuteNumbers) {
    for (let n = 1; n <= 12; n++) {
      const p = polar(n * 30, R + 5);
      minuteNumbers.push(
        <SvgText
          key={`m${n}`} x={p.x} y={p.y + 3.5} fontSize={10} fontWeight="bold"
          fill="#FFFFFF" textAnchor="middle"
        >
          {n * 5}
        </SvgText>,
      );
    }
  }

  // touchAction: スマホで時計をなぞったときに画面がスクロールしないようにする (Web用)
  const style = {
    width: size,
    height: size,
    touchAction: 'none',
    userSelect: 'none',
    cursor: interactive ? 'pointer' : 'auto',
  } as ViewStyle;

  return (
    <View style={style} {...(interactive ? panResponder.panHandlers : {})} accessibilityRole="image"
      accessibilityLabel="アナログ時計">
      <Svg width={size} height={size} viewBox={`0 0 ${VIEW} ${VIEW}`} pointerEvents="none">
        <Circle cx={C} cy={C} r={R + 10} fill={colors.blue} />
        <Circle cx={C} cy={C} r={R} fill="#FFFFFF" />
        {ticks}
        {hourNumbers}
        {minuteNumbers}
        {/* 短針: みじかい・太い・オレンジ */}
        <Line
          x1={C} y1={C} x2={hourTip.x} y2={hourTip.y}
          stroke={colors.orange} strokeWidth={9} strokeLinecap="round"
        />
        {/* 長針: ながい・細い・あお */}
        <Line
          x1={C} y1={C} x2={minuteTip.x} y2={minuteTip.y}
          stroke={colors.blueDark} strokeWidth={5} strokeLinecap="round"
        />
        {interactive && (
          <G>
            <Circle cx={hourTip.x} cy={hourTip.y} r={7} fill="#FFFFFF" stroke={colors.orange} strokeWidth={3.5} />
            <Circle cx={minuteTip.x} cy={minuteTip.y} r={6} fill="#FFFFFF" stroke={colors.blueDark} strokeWidth={3} />
          </G>
        )}
        <Circle cx={C} cy={C} r={6} fill={colors.text} />
      </Svg>
    </View>
  );
}
