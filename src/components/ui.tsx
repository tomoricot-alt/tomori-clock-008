import React from 'react';
import {
  Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions,
  type StyleProp, type ViewStyle,
} from 'react-native';
import { colors, MAX_WIDTH } from '../theme';

type Variant = 'primary' | 'accent' | 'ghost' | 'good';

const variantStyle: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.blue, fg: '#FFFFFF', border: colors.blueDark },
  accent: { bg: colors.orange, fg: '#FFFFFF', border: colors.orangeDark },
  good: { bg: colors.good, fg: '#FFFFFF', border: '#1F7342' },
  ghost: { bg: '#FFFFFF', fg: colors.blueDark, border: colors.blue },
};

interface BigButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  sub?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** 画面読み上げ用 */
  a11yLabel?: string;
}

/** 指で押しやすい大きなボタン (高さ60以上) */
export function BigButton({ label, onPress, variant = 'primary', sub, disabled, style, a11yLabel }: BigButtonProps) {
  const v = variantStyle[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel ?? label}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: v.bg, borderColor: v.border, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      <Text style={[styles.buttonText, { color: v.fg }]}>{label}</Text>
      {sub ? <Text style={[styles.buttonSub, { color: v.fg }]}>{sub}</Text> : null}
    </Pressable>
  );
}

/** 画面全体のかたち。PCでは中央にそろえ、最大幅をおさえる */
export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.inner}>{children}</View>
    </ScrollView>
  );
}

export function Card({ children, tone = 'blue', style }: { children: React.ReactNode; tone?: 'blue' | 'orange' | 'good' | 'bad'; style?: StyleProp<ViewStyle> }) {
  const bg = { blue: colors.panel, orange: colors.orangeLight, good: colors.goodLight, bad: colors.badLight }[tone];
  const border = { blue: colors.line, orange: colors.orange, good: colors.good, bad: colors.bad }[tone];
  return <View style={[styles.card, { backgroundColor: bg, borderColor: border }, style]}>{children}</View>;
}

export function Heading({ children }: { children: React.ReactNode }) {
  return <Text style={styles.heading} accessibilityRole="header">{children}</Text>;
}

/** 画面の幅・高さに合わせた時計の大きさ */
export function useClockSize(): number {
  const { width, height } = useWindowDimensions();
  const byWidth = Math.min(width, MAX_WIDTH) - 32;
  const byHeight = Math.max(240, height * 0.5);
  return Math.floor(Math.max(220, Math.min(byWidth, byHeight, 400)));
}

const styles = StyleSheet.create({
  button: {
    minHeight: 64,
    borderRadius: 18,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer', userSelect: 'none' } as object) : {}),
  },
  buttonText: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  buttonSub: { fontSize: 14, marginTop: 2, textAlign: 'center' },
  screen: { flex: 1, backgroundColor: colors.bg },
  screenContent: { alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 },
  inner: { width: '100%', maxWidth: MAX_WIDTH, alignItems: 'center', gap: 14 },
  card: { width: '100%', borderRadius: 18, borderWidth: 2, padding: 14, gap: 8, alignItems: 'center' },
  heading: { fontSize: 26, fontWeight: '900', color: colors.blueDark, textAlign: 'center' },
});
