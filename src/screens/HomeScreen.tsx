import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnalogClock } from '../components/AnalogClock';
import { BigButton, Card, Screen, useClockSize } from '../components/ui';
import { toTotal } from '../logic/clock';
import type { Mode } from '../logic/quiz';
import { colors } from '../theme';

interface Props {
  mode: Mode;
  onMode: (m: Mode) => void;
  go: (s: 'explore' | 'quiz' | 'make' | 'records') => void;
}

export function HomeScreen({ mode, onMode, go }: Props) {
  const size = Math.min(useClockSize(), 260);
  return (
    <Screen>
      <Text style={styles.brand}>TOMORI APP LAB 008</Text>
      <Text style={styles.title}>TOMORI CLOCK</Text>
      <Text style={styles.lead}>とけいを みて、じこくを よめるように なろう！</Text>
      <AnalogClock total={toTotal(10, 10)} size={size} showMinuteNumbers />

      <Card>
        <Text style={styles.label}>モードを えらぼう</Text>
        <View style={styles.modes}>
          <BigButton
            label="にゅうもん" sub="5ふん たんい"
            variant={mode === 'beginner' ? 'accent' : 'ghost'}
            style={styles.mode} onPress={() => onMode('beginner')}
          />
          <BigButton
            label="チャレンジ" sub="1ぷん たんい"
            variant={mode === 'challenge' ? 'accent' : 'ghost'}
            style={styles.mode} onPress={() => onMode('challenge')}
          />
        </View>
      </Card>

      <BigButton label="❓ クイズ 10もん" sub="とけいを よんだり、つくったり" variant="primary" style={styles.full} onPress={() => go('quiz')} />
      <BigButton label="🕒 みてみよう" sub="はりを うごかして デジタルと くらべる" variant="primary" style={styles.full} onPress={() => go('explore')} />
      <BigButton label="✍️ じこくを つくろう" sub="はりを うごかして じこくを つくる れんしゅう" variant="primary" style={styles.full} onPress={() => go('make')} />
      <BigButton label="📊 きろく" variant="ghost" style={styles.full} onPress={() => go('records')} />

      <Text style={styles.note}>
        なまえや がっこうの なまえは いりません。きろくは この たんまつの なかだけに ほぞんされます。
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { fontSize: 14, fontWeight: '800', color: colors.orangeDark, letterSpacing: 1 },
  title: { fontSize: 40, fontWeight: '900', color: colors.blueDark },
  lead: { fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center' },
  label: { fontSize: 18, fontWeight: '800', color: colors.text },
  modes: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  mode: { flexGrow: 1, flexBasis: 200 },
  full: { width: '100%' },
  note: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20 },
});
