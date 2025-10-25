"use client";

import { useState } from "react";
import TitleScreen from "./components/TitleScreen";
import TutorialScreen from "./components/TutorialScreen";
import GameScreen from "./components/GameScreen";

type Screen = "title" | "tutorial" | "game";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("title");

  return (
    <div className="flex min-h-screen items-center justify-center relative">
      {/* Base background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, #FAEFED, #FBF7EB)",
        }}
      />
      {/* Pattern grid with its own gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top, #FACAD8, #FDEAC5)",
          maskImage: "url(/images/pattern-grid.svg)",
          maskSize: "auto",
          maskRepeat: "repeat",
          WebkitMaskImage: "url(/images/pattern-grid.svg)",
          WebkitMaskSize: "auto",
          WebkitMaskRepeat: "repeat",
        }}
      />
      <div className="relative z-10 w-full flex items-center justify-center">
        {currentScreen === "title" && (
          <TitleScreen onStart={() => setCurrentScreen("tutorial")} />
        )}
        {currentScreen === "tutorial" && (
          <TutorialScreen onContinue={() => setCurrentScreen("game")} />
        )}
        {currentScreen === "game" && (
          <GameScreen onRestart={() => setCurrentScreen("title")} />
        )}
      </div>
    </div>
  );
}
