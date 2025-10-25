import Button from "./Button";
import MangaCanvas from "./MangaCanvas";
import { useState } from "react";
import { TMangaContract } from "@/app/gameloop/manga-contract-generator";

export default function GameScreen({ onRestart }: { onRestart: () => void }) {
  // Page-level contract (placeholder until wired to generator/flow)
  const [contract] = useState<TMangaContract>({
    genre: "Experimental Slice-of-life",
    tone: "comedy",
    audience: "interns",
    panelCount: 4,
    constraints: [],
    selfReview: "well-formed",
    source: "auto",
    introDialogue: "Auto-Dispatcher here. Don't tell the boss I queued this!",
  });

  return (
    <div className="flex flex-col items-center gap-6 p-6 w-full h-screen animate-fade-in">
      <div className="flex items-center justify-between w-full max-w-7xl px-6 py-4 border">
        <h2 className="text-3xl font-bold text-white text-outline">
          Manga Maker
        </h2>

        <Button onClick={onRestart} variant="secondary" size="medium">
          Back to Title
        </Button>
      </div>

      <div className="flex-1 w-full max-w-7xl">
        <MangaCanvas contract={contract} />
      </div>
    </div>
  );
}
