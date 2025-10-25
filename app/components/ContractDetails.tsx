"use client";

import { TMangaContract } from "@/app/gameloop/manga-contract-generator";

export default function ContractDetails({ contract }: { contract: TMangaContract }) {
  return (
    <div className="w-64 flex flex-col gap-2 bg-black/30 backdrop-blur-md rounded-lg p-4 border border-white/20 overflow-y-auto">
      <h3 className="text-white font-bold text-lg">Contract</h3>
      <div className="text-white/90 text-sm">
        <div className="mt-1"><span className="text-white/60">Genre:</span> {contract.genre}</div>
        <div className="mt-1"><span className="text-white/60">Tone:</span> {contract.tone}</div>
        <div className="mt-1"><span className="text-white/60">Audience:</span> {contract.audience}</div>
        <div className="mt-1"><span className="text-white/60">Panels:</span> {contract.panelCount}</div>
        <div className="mt-2"><span className="text-white/60">Source:</span> {contract.source}</div>
        <div className="mt-2"><span className="text-white/60">Intro:</span>
          <div className="text-white/80 text-xs mt-1 whitespace-pre-wrap">“{contract.introDialogue}”</div>
        </div>
        <div className="mt-2"><span className="text-white/60">Constraints:</span>
          {contract.constraints && contract.constraints.length > 0 ? (
            <ul className="list-disc list-inside text-white/80 text-xs mt-1">
              {contract.constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          ) : (
            <div className="text-white/40 text-xs mt-1">None</div>
          )}
        </div>
      </div>
    </div>
  );
}
