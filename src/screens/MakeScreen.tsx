import React, { useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { QuestionView } from '../components/QuestionView';
import { BigButton, Heading, Screen } from '../components/ui';
import { makeQuestion, modeLabel, type Mode, type Question } from '../logic/quiz';
import { colors } from '../theme';

/** じこくを つくろう: 出された時刻になるように針を動かす練習 (何回でも、記録はしない) */
export function MakeScreen({ mode, onBack }: { mode: Mode; onBack: () => void }) {
  const counter = useRef(1);
  const [question, setQuestion] = useState<Question>(() => makeQuestion(1, 'make', mode, Math.random));
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const next = () => {
    counter.current += 1;
    setQuestion((q) => makeQuestion(counter.current, 'make', mode, Math.random, [q.answer]));
  };

  return (
    <Screen>
      <Heading>✍️ じこくを つくろう</Heading>
      <Text style={styles.sub}>{modeLabel(mode)} ／ {score.correct} / {score.total} せいかい</Text>
      <QuestionView
        key={question.id}
        question={question}
        mode={mode}
        onAnswered={(_, ok) => setScore((s) => ({ correct: s.correct + (ok ? 1 : 0), total: s.total + 1 }))}
        onNext={next}
        nextLabel="つぎの もんだい"
      />
      <BigButton label="ホームへ もどる" variant="ghost" style={styles.full} onPress={onBack} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sub: { fontSize: 16, color: colors.muted, fontWeight: '700' },
  full: { width: '100%' },
});
