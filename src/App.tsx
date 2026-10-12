import React, { useCallback, useEffect, useState } from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { ExploreScreen } from './screens/ExploreScreen';
import { HomeScreen } from './screens/HomeScreen';
import { MakeScreen } from './screens/MakeScreen';
import { QuizScreen } from './screens/QuizScreen';
import { RecordsScreen } from './screens/RecordsScreen';
import type { Mode } from './logic/quiz';
import { addRecord, clearRecords, loadRecords, saveRecords, type RecordEntry } from './logic/storage';
import { colors } from './theme';

type Route = 'home' | 'explore' | 'quiz' | 'make' | 'records';

export default function App() {
  const [route, setRoute] = useState<Route>('home');
  const [mode, setMode] = useState<Mode>('beginner');
  const [records, setRecords] = useState<RecordEntry[]>([]);

  useEffect(() => {
    setRecords(loadRecords());
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'TOMORI CLOCK｜アナログとけい れんしゅう';
    }
  }, []);

  const onFinish = useCallback(
    (correct: number, total: number) => {
      const entry: RecordEntry = { playedAt: new Date().toISOString(), mode, correct, total };
      setRecords((prev) => {
        const next = addRecord(prev, entry);
        saveRecords(next);
        return next;
      });
    },
    [mode],
  );

  const home = () => setRoute('home');

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" />
      {route === 'home' && <HomeScreen mode={mode} onMode={setMode} go={setRoute} />}
      {route === 'explore' && <ExploreScreen mode={mode} onBack={home} />}
      {route === 'make' && <MakeScreen mode={mode} onBack={home} />}
      {route === 'quiz' && <QuizScreen mode={mode} onFinish={onFinish} onBack={home} />}
      {route === 'records' && (
        <RecordsScreen
          records={records}
          onClear={() => {
            clearRecords();
            setRecords([]);
          }}
          onBack={home}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
