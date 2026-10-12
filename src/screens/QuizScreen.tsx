import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { QuestionView } from '../components/QuestionView';
import { BigButton, Card, Heading, Screen } from '../components/ui';
import { formatDigital } from '../logic/clock';
import {
  generateQuiz, modeLabel, QUESTION_COUNT, RANK_MESSAGE, summarize,
  type Mode, type QuestionResult,
} from '../logic/quiz';
import { colors } from '../theme';

interface Props {
  mode: Mode;
  onFinish: (correct: number, total: number) => void;
  onBack: () => void;
}

/** 10もんクイズ。終わると結果を集計し、onFinish で端末内に保存する */
export function QuizScreen({ mode, onFinish, onBack }: Props) {
  const [round, setRound] = useState(0);
  const questions = useMemo(() => generateQuiz(mode), [mode, round]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const pending = useRef<QuestionResult | null>(null);
  const finished = results.length === QUESTION_COUNT;

  // 最後の1問を終えたときに、1回だけ保存する
  const savedRound = useRef(-1);
  useEffect(() => {
    if (finished && savedRound.current !== round) {
      savedRound.current = round;
      const s = summarize(results);
      onFinish(s.correct, s.total);
    }
  }, [finished, results, round, onFinish]);

  if (finished) {
    const s = summarize(results);
    return (
      <Screen>
        <Heading>🎉 けっか</Heading>
        <Card tone="orange">
          <Text style={styles.big} accessibilityLabel={`${s.total}もんちゅう ${s.correct}もん せいかい`}>
            {s.correct} / {s.total}
          </Text>
          <Text style={styles.percent}>せいかいりつ {s.percent}%</Text>
          <Text style={styles.message}>{RANK_MESSAGE[s.rank]}</Text>
        </Card>
        {s.wrong.length > 0 && (
          <Card tone="bad">
            <Text style={styles.wrongTitle}>まちがえた もんだい</Text>
            {s.wrong.map((r) => (
              <Text key={r.question.id} style={styles.wrongRow}>
                {r.question.id}もんめ： せいかい {formatDigital(r.question.answer)} ／ あなた {formatDigital(r.userAnswer)}
              </Text>
            ))}
          </Card>
        )}
        <Text style={styles.saved}>けっかは この たんまつの なかに ほぞんしました</Text>
        <BigButton
          label="もういちど ちょうせん"
          variant="accent"
          style={styles.full}
          onPress={() => {
            setResults([]);
            setIndex(0);
            setRound((r) => r + 1);
          }}
        />
        <BigButton label="ホームへ もどる" variant="primary" style={styles.full} onPress={onBack} />
      </Screen>
    );
  }

  const question = questions[index];
  const isLast = index === QUESTION_COUNT - 1;

  return (
    <Screen>
      <Heading>❓ クイズ {index + 1} / {QUESTION_COUNT}</Heading>
      <Text style={styles.sub}>
        {modeLabel(mode)} ／ せいかい {results.filter((r) => r.correct).length}
      </Text>
      <View style={styles.bar} accessibilityLabel={`${index + 1}もんめ`}>
        <View style={[styles.barFill, { width: `${(index / QUESTION_COUNT) * 100}%` }]} />
      </View>
      <QuestionView
        key={`${round}-${question.id}`}
        question={question}
        mode={mode}
        onAnswered={(userAnswer, correct) => {
          pending.current = { question, userAnswer, correct };
        }}
        onNext={() => {
          if (pending.current) setResults((prev) => [...prev, pending.current as QuestionResult]);
          pending.current = null;
          setIndex((i) => Math.min(i + 1, QUESTION_COUNT - 1));
        }}
        nextLabel={isLast ? 'けっかを みる' : 'つぎへ'}
      />
      <BigButton label="やめて ホームへ" variant="ghost" style={styles.full} onPress={onBack} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sub: { fontSize: 16, color: colors.muted, fontWeight: '700' },
  bar: { width: '100%', height: 12, borderRadius: 6, backgroundColor: colors.blueLight, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.orange },
  full: { width: '100%' },
  big: { fontSize: 64, fontWeight: '900', color: colors.blueDark },
  percent: { fontSize: 22, fontWeight: '800', color: colors.text },
  message: { fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center', lineHeight: 26 },
  wrongTitle: { fontSize: 18, fontWeight: '800', color: colors.bad },
  wrongRow: { fontSize: 17, fontWeight: '600', color: colors.text },
  saved: { fontSize: 14, color: colors.muted },
});
