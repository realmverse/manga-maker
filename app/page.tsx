'use client';

import { useState } from 'react';
import TitleScreen from './components/TitleScreen';
import TutorialScreen from './components/TutorialScreen';
import GameScreen from './components/GameScreen';

type Screen = 'title' | 'tutorial' | 'game';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('title');

  return (
    <div 
      className="flex min-h-screen items-center justify-center"
      style={{
        background: 'linear-gradient(to bottom, #FAEFED, #FBF7EB)',
        backgroundImage: 'url(/images/pattern-grid.svg)',
        backgroundSize: 'auto',
        backgroundRepeat: 'repeat',
        backgroundBlendMode: 'multiply',
      }}
    >
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
