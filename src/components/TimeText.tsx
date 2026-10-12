import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatDigital, readTimeJa } from '../logic/clock';
import { colors } from '../theme';

/** デジタル表示 + よみがな */
export function TimeText({ total, label, big = true }: { total: number; label?: string; big?: boolean }) {
  return (
    <View style={styles.wrap} accessibilityLabel={`${label ?? ''} ${formatDigital(total)}`}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Text style={[styles.digital, big ? styles.big : styles.small]}>{formatDigital(total)}</Text>
      <Text style={styles.reading}>{readTimeJa(total)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  label: { fontSize: 15, fontWeight: '700', color: colors.muted },
  digital: { fontWeight: '900', color: colors.blueDark, fontVariant: ['tabular-nums'] },
  big: { fontSize: 56, lineHeight: 64 },
  small: { fontSize: 36, lineHeight: 42 },
  reading: { fontSize: 18, fontWeight: '700', color: colors.text },
});
