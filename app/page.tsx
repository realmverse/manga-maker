"use client";

import { useEffect, useState } from "react";
import TitleScreen from "./components/TitleScreen";
import TutorialScreen from "./components/TutorialScreen";
import GameScreen from "./components/GameScreen";
import { TMangaContract } from "@/app/gameloop/manga-contract-generator";
import { generateMangaContracts } from "@/app/gameloop/manga-contract-generator";

type Screen = "title" | "tutorial" | "game";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("title");
  const [preloadedContracts, setPreloadedContracts] = useState<TMangaContract[] | null>(null);

  // Start loading contracts as soon as we hit the tutorial (loading) screen
  useEffect(() => {
    let mounted = true;
    if (currentScreen === "tutorial" && !preloadedContracts) {
      generateMangaContracts("easy")
        .then((list) => {
          if (!mounted) return;
          setPreloadedContracts((list && list.length ? list : []).slice(0, 3));
        })
        .catch(() => {
          if (!mounted) return;
          // Leave as null; GameScreen will fetch as fallback
          setPreloadedContracts(null);
        });
    }
    return () => {
      mounted = false;
    };
  }, [currentScreen, preloadedContracts]);

  // Reset preloaded contracts when returning to title for a fresh session
  const handleRestartToTitle = () => {
    setPreloadedContracts(null);
    setCurrentScreen("title");
  };

  return (
    <div className="flex min-h-screen items-center justify-center relative">
      {/* Pattern grid with its own gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, #FACAD8, #B2CDD4)",
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
          <GameScreen onRestart={handleRestartToTitle} preloadedContracts={preloadedContracts || undefined} />
        )}
      </div>
    </div>
  );
}
