import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnalogClock } from './AnalogClock';
import { BigButton, useClockSize } from './ui';
import { addHours, addMinutes } from '../logic/clock';
import { colors } from '../theme';

interface Props {
  total: number;
  onChange: (total: number) => void;
  step: 1 | 5;
  showMinuteNumbers?: boolean;
  disabled?: boolean;
}

/**
 * 指で針を動かす + 「じ」「ふん」を増減する大きなボタン。
 * 針のドラッグがむずかしいときはボタンだけでも時刻を作れる。
 */
export function ClockEditor({ total, onChange, step, showMinuteNumbers, disabled }: Props) {
  const size = useClockSize();
  return (
    <View style={styles.wrap}>
      <AnalogClock
        total={total}
        size={size}
        step={step}
        showMinuteNumbers={showMinuteNumbers}
        onChange={disabled ? undefined : onChange}
      />
      <Text style={styles.hint}>はりを ゆびで うごかすか、したの ボタンを おそう</Text>
      <View style={styles.row}>
        <View style={styles.group}>
          <Text style={[styles.groupLabel, { color: colors.orangeDark }]}>みじかいはり「じ」</Text>
          <View style={styles.pair}>
            <BigButton label="− 1じ" variant="accent" disabled={disabled} style={styles.half}
              onPress={() => onChange(addHours(total, -1))} a11yLabel="じを 1つ へらす" />
            <BigButton label="＋ 1じ" variant="accent" disabled={disabled} style={styles.half}
              onPress={() => onChange(addHours(total, 1))} a11yLabel="じを 1つ ふやす" />
          </View>
        </View>
        <View style={styles.group}>
          <Text style={[styles.groupLabel, { color: colors.blueDark }]}>ながいはり「ふん」</Text>
          <View style={styles.pair}>
            <BigButton label={`− ${step}ふん`} disabled={disabled} style={styles.half}
              onPress={() => onChange(addMinutes(total, -step))} a11yLabel={`ふんを ${step} へらす`} />
            <BigButton label={`＋ ${step}ふん`} disabled={disabled} style={styles.half}
              onPress={() => onChange(addMinutes(total, step))} a11yLabel={`ふんを ${step} ふやす`} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', alignItems: 'center', gap: 10 },
  hint: { fontSize: 15, color: colors.muted, textAlign: 'center' },
  row: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  group: { flexGrow: 1, flexBasis: 280, gap: 4 },
  groupLabel: { fontSize: 16, fontWeight: '800', textAlign: 'center' },
  pair: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
});
