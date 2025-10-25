'use client';

import { useState } from 'react';
import TitleScreen from './components/TitleScreen';
import TutorialScreen from './components/TutorialScreen';
import GameScreen from './components/GameScreen';

type Screen = 'title' | 'tutorial' | 'game';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('title');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      {currentScreen === 'title' && (
        <TitleScreen onStart={() => setCurrentScreen('tutorial')} />
      )}
      {currentScreen === 'tutorial' && (
        <TutorialScreen onContinue={() => setCurrentScreen('game')} />
      )}
      {currentScreen === 'game' && (
        <GameScreen onRestart={() => setCurrentScreen('title')} />
      )}
    </div>
  );
}
