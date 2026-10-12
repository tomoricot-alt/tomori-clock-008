import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ClockEditor } from '../components/ClockEditor';
import { TimeText } from '../components/TimeText';
import { BigButton, Card, Heading, Screen } from '../components/ui';
import { hourOf, minuteOf, toTotal } from '../logic/clock';
import { stepOf, type Mode } from '../logic/quiz';
import { colors } from '../theme';

/** みてみよう: 針を動かして、デジタル表示とくらべる */
export function ExploreScreen({ mode, onBack }: { mode: Mode; onBack: () => void }) {
  const [total, setTotal] = useState(toTotal(3, 0));
  const [showMinutes, setShowMinutes] = useState(mode === 'beginner');
  const step = stepOf(mode);
  const hour = hourOf(total);
  const minute = minuteOf(total);

  return (
    <Screen>
      <Heading>🕒 みてみよう</Heading>
      <Text style={styles.lead}>はりを うごかして、デジタルと くらべてみよう</Text>
      <Card tone="orange"><TimeText total={total} label="デジタル" /></Card>
      <ClockEditor total={total} onChange={setTotal} step={step} showMinuteNumbers={showMinutes} />
      <Card>
        <View style={styles.legendRow}>
          <View style={[styles.swatch, { backgroundColor: colors.orange, height: 12 }]} />
          <Text style={styles.legendText}>
            みじかい はり（オレンジ）＝「じ」… いまは <Text style={styles.strong}>{hour}じ</Text>
          </Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.swatch, { backgroundColor: colors.blueDark, height: 6 }]} />
          <Text style={styles.legendText}>
            ながい はり（あお）＝「ふん」… いまは <Text style={styles.strong}>{minute}ふん</Text>
          </Text>
        </View>
        <Text style={styles.note}>
          ながい はりが 1めもり すすむと 1ぷん。「5」は 5ふん、「6」は 30ぷん（はん）。
          ながい はりが 1しゅう（60ぷん）すると、みじかい はりは 1じ すすむよ。
        </Text>
      </Card>
      <View style={styles.row}>
        <BigButton label="ちょうど（0ぷん）" variant="ghost" style={styles.flex}
          onPress={() => setTotal(toTotal(hour, 0))} />
        <BigButton label="はん（30ぷん）" variant="ghost" style={styles.flex}
          onPress={() => setTotal(toTotal(hour, 30))} />
      </View>
      <BigButton
        label={showMinutes ? 'ふんの すうじを かくす' : 'ふんの すうじを みせる'}
        variant="ghost"
        style={styles.full}
        onPress={() => setShowMinutes((v) => !v)}
      />
      <BigButton label="ホームへ もどる" variant="primary" style={styles.full} onPress={onBack} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: { fontSize: 17, color: colors.muted, textAlign: 'center' },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%' },
  swatch: { width: 36, borderRadius: 6 },
  legendText: { flex: 1, fontSize: 17, color: colors.text, fontWeight: '600' },
  strong: { fontWeight: '900', color: colors.blueDark },
  note: { fontSize: 15, color: colors.muted, lineHeight: 22 },
  row: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  flex: { flexGrow: 1, flexBasis: 200 },
  full: { width: '100%' },
});
