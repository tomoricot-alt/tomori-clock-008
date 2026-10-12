import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnalogClock } from './AnalogClock';
import { ClockEditor } from './ClockEditor';
import { TimeText } from './TimeText';
import { BigButton, Card, useClockSize } from './ui';
import { formatDigital, readTimeJa } from '../logic/clock';
import { judge, stepOf, type Mode, type Question } from '../logic/quiz';
import { colors } from '../theme';

interface Props {
  question: Question;
  mode: Mode;
  /** 答えたときに呼ばれる */
  onAnswered: (userAnswer: number, correct: boolean) => void;
  onNext: () => void;
  nextLabel: string;
}

/** 1問ぶんの出題。「時計を読む(4択)」と「針を動かして作る」の両方に対応 */
export function QuestionView({ question, mode, onAnswered, onNext, nextLabel }: Props) {
  const size = useClockSize();
  const step = stepOf(mode);
  // 「つくる」問題の針は、正解と同じにならない時刻から始める
  const [made, setMade] = useState(() => (question.answer === 0 ? 360 : 0));
  const [answer, setAnswer] = useState<number | null>(null);
  const done = answer !== null;
  const correct = done && judge(question, answer as number);

  const submit = (value: number) => {
    if (done) return;
    setAnswer(value);
    onAnswered(value, judge(question, value));
  };

  return (
    <View style={styles.wrap}>
      {question.kind === 'read' ? (
        <>
          <Text style={styles.prompt}>とけいを よんで、なんじ なんぷんか こたえよう</Text>
          <AnalogClock total={question.answer} size={size} showMinuteNumbers={mode === 'beginner'} />
          <View style={styles.choices}>
            {question.choices.map((c) => {
              const isAnswer = c === question.answer;
              const isPicked = answer === c;
              const variant = !done ? 'ghost' : isAnswer ? 'good' : isPicked ? 'accent' : 'ghost';
              return (
                <BigButton
                  key={c}
                  label={formatDigital(c)}
                  variant={variant}
                  disabled={done && !isAnswer && !isPicked}
                  style={styles.choice}
                  onPress={() => submit(c)}
                  a11yLabel={`${formatDigital(c)} ${readTimeJa(c)}`}
                />
              );
            })}
          </View>
        </>
      ) : (
        <>
          <Text style={styles.prompt}>この じこくに なるように、はりを うごかそう</Text>
          <Card tone="orange"><TimeText total={question.answer} /></Card>
          {done ? (
            <AnalogClock total={answer as number} size={size} showMinuteNumbers={mode === 'beginner'} />
          ) : (
            <ClockEditor total={made} onChange={setMade} step={step} showMinuteNumbers={mode === 'beginner'} />
          )}
          {!done && <BigButton label="これで こたえる" variant="accent" style={styles.full} onPress={() => submit(made)} />}
        </>
      )}

      {done && (
        <Card tone={correct ? 'good' : 'bad'}>
          <Text style={[styles.verdict, { color: correct ? colors.good : colors.bad }]}>
            {correct ? '⭕ せいかい！' : '❌ ざんねん…'}
          </Text>
          {!correct && question.kind === 'read' && (
            <Text style={styles.detail}>
              せいかいは {formatDigital(question.answer)}（{readTimeJa(question.answer)}）
            </Text>
          )}
          {!correct && question.kind === 'make' && (
            <>
              <Text style={styles.detail}>
                つくった じこくは {formatDigital(answer as number)}（{readTimeJa(answer as number)}）
              </Text>
              <Text style={styles.detail}>
                せいかいは {formatDigital(question.answer)}（{readTimeJa(question.answer)}）
              </Text>
              <Text style={styles.tip}>ただしい はりの かたち：</Text>
              <AnalogClock total={question.answer} size={Math.min(size, 240)} showMinuteNumbers={mode === 'beginner'} />
            </>
          )}
          <BigButton label={nextLabel} variant="primary" style={styles.full} onPress={onNext} />
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', alignItems: 'center', gap: 14 },
  prompt: { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center' },
  choices: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  choice: { flexGrow: 1, flexBasis: 140, minHeight: 72 },
  full: { width: '100%' },
  verdict: { fontSize: 32, fontWeight: '900' },
  detail: { fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center' },
  tip: { fontSize: 15, color: colors.muted },
});
