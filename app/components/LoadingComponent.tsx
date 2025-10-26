"use client";

import { useEffect, useMemo, useState } from "react";

// 50 manga-themed loading excuses rotating every 3 seconds
const EXCUSES: string[] = [
  "Drying ink…",
  "Assistant sharpening G-pens…",
  "Screen tones misbehaving… wrangling dots…",
  "Editor yelling about deadlines (as encouragement)…",
  "Protagonist practicing their dramatic turn…",
  "Villain perfecting menacing laugh…",
  "Chibi crew fetching more rice balls…",
  "Background artist adding 300 extra windows…",
  "Speech bubbles aligning with destiny…",
  "Onomatopoeia auditioning: BAM vs. KRAK…",
  "Panel borders negotiating real estate…",
  "Hero’s hair defying gravity to spec…",
  "Cat sidekick refusing to leave the panel…",
  "Sound effects calibrating decibels of whoosh…",
  "Screentone supply stuck in customs…",
  "Ink spilled - transforming into plot twist…",
  "Mysterious mentor stuck in a flashback…",
  "Training montage at 92% complete…",
  "Rivals agreeing on a cooler pose…",
  "Tiny sweat drops being hand-placed…",
  "Speed lines accelerating to light speed…",
  "Cliffhanger being ethically sourced…",
  "Tea ceremony with the creative director…",
  "Narrator rewriting epically long sentence…",
  "Kanban board turned into kanji board…",
  "Prop sword waiting for a +1 upgrade…",
  "Hero debating inner monologue font size…",
  "Filler episode being humanely reduced…",
  "Clouds getting extra fluff per art bible…",
  "Dramatic page turn rehearsals underway…",
  "Character bio cards fetching trivia…",
  "Editor rolling for critical feedback…",
  "Boss charging ultimate deadline attack…",
  "Fridge note says: ‘add more sparkles’…",
  "Mascot obtaining union-mandated nap…",
  "Perspective grid finding vanishing point…",
  "Ink screech - eraser squeak - harmony restored…",
  "Foreshadowing placed gently in panel 2…",
  "Cameo character stuck in traffic…",
  "Dialogue bubbles passing vibe check…",
  "Panel gutters widening for dramatic silence…",
  "Eyes getting that extra glint…",
  "Ringtone silenced: serious drawing time…",
  "Staples negotiating binding rights…",
  "Late-night ramen powering creativity…",
  "Author’s note doodle warming up…",
  "Mini-arc in QA to avoid plot holes…",
  "Ink sprites cleaning the margins…",
  "Final pose held for exactly 12 frames…",
  "Climactic sound effect: choosing best ‘DOOM’…",
];

export default function LoadingComponent({ title = "Loading contracts", subtitle = "Studio pipeline" }: { title?: string; subtitle?: string }) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const excuses = useMemo(() => EXCUSES, []);

  useEffect(() => {
    const id = setInterval(() => {
      // use random index to avoid repetition patterns
        setIndex(Math.floor(Math.random() * excuses.length));
    }, 3000);
    return () => clearInterval(id);
  }, [excuses.length]);

  // Determinate progress: +4%/s up to 60%, then +1%/s to 100%
  useEffect(() => {
    const id = setInterval(() => {
      setProgress((prev) => {
        const inc = prev < 60 ? 4 : 1;
        const next = Math.min(100, prev + inc);
        if (next >= 100) {
          clearInterval(id);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full max-w-xl bg-black/30 backdrop-blur-md border border-white/20 rounded-lg p-4 text-white shadow-2xl" aria-busy="true" aria-live="polite">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-white/60">{subtitle}</div>
      </div>
      {/* Progress bar (determinate) */}
      <div
        className="w-full h-2 bg-white/10 rounded overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label="Loading progress"
      >
        <div
          className="h-full bg-linear-to-r from-purple-500 via-indigo-500 to-green-500 rounded transition-[width] duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-3 text-sm text-white/80 min-h-6">
        {excuses[index]}
      </div>
    </div>
  );
}
