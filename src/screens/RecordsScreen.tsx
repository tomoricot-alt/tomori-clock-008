import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BigButton, Card, Heading, Screen } from '../components/ui';
import { modeLabel } from '../logic/quiz';
import { bestScores, type RecordEntry } from '../logic/storage';
import { colors } from '../theme';

const dateText = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export function RecordsScreen({ records, onClear, onBack }: { records: RecordEntry[]; onClear: () => void; onBack: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const best = bestScores(records);
  const show = (v: number | null) => (v === null ? 'まだ なし' : `${v} / 10`);

  return (
    <Screen>
      <Heading>📊 きろく</Heading>
      <Card tone="orange">
        <Text style={styles.bestTitle}>いちばん よかった てんすう</Text>
        <Text style={styles.best}>にゅうもん： {show(best.beginner)}</Text>
        <Text style={styles.best}>チャレンジ： {show(best.challenge)}</Text>
      </Card>
      <Card>
        <Text style={styles.bestTitle}>さいきんの クイズ（さいしん 10かい）</Text>
        {records.length === 0 ? (
          <Text style={styles.empty}>まだ きろくが ないよ。クイズに ちょうせんしてみよう！</Text>
        ) : (
          records.slice(0, 10).map((r, i) => (
            <View key={`${r.playedAt}-${i}`} style={styles.row}>
              <Text style={styles.rowDate}>{dateText(r.playedAt)}</Text>
              <Text style={styles.rowMode}>{modeLabel(r.mode).split('（')[0]}</Text>
              <Text style={styles.rowScore}>{r.correct} / {r.total}</Text>
            </View>
          ))
        )}
      </Card>
      <Text style={styles.note}>
        きろくは この スマホ・パソコンの ブラウザの なかだけに ほぞんされます。
        ほかの たんまつには でませんし、インターネットには おくりません。
      </Text>
      {records.length > 0 && (
        <BigButton
          label={confirm ? 'ほんとうに ぜんぶ けす？ もういちど おす' : 'きろくを けす'}
          variant={confirm ? 'accent' : 'ghost'}
          style={styles.full}
          onPress={() => {
            if (confirm) {
              onClear();
              setConfirm(false);
            } else setConfirm(true);
          }}
        />
      )}
      <BigButton label="ホームへ もどる" variant="primary" style={styles.full} onPress={onBack} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  full: { width: '100%' },
  bestTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  best: { fontSize: 24, fontWeight: '900', color: colors.blueDark },
  empty: { fontSize: 16, color: colors.muted },
  row: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  rowDate: { flex: 1.2, fontSize: 15, color: colors.muted },
  rowMode: { flex: 1.2, fontSize: 16, fontWeight: '700', color: colors.text },
  rowScore: { flex: 1, fontSize: 20, fontWeight: '900', color: colors.blueDark, textAlign: 'right' },
  note: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20 },
});
