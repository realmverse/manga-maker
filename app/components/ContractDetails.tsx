"use client";

import { TMangaContract } from "@/app/gameloop/manga-contract-generator";
import Label from "@/app/components/Label";

export default function ContractDetails({ contract }: { contract: TMangaContract }) {
  return (
      <div className="w-64 flex flex-col gap-2 bg-[#FCF6D7] rounded-3xl p-4 border-2 border-[#664950] overflow-y-auto text-black font-comic-neue">
        <h3 className="font-bold text-lg">Contract</h3>
        <div className="text-sm flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label>Genre</Label>
            <div className="text-black">{contract.genre}</div>
          </div>
          <div className="flex flex-col gap-1">
            <Label>Tone</Label>
            <div className="text-black">{contract.tone}</div>
          </div>
          <div className="flex flex-col gap-1">
            <Label>Audience</Label>
            <div className="text-black">{contract.audience}</div>
          </div>
          <div className="flex flex-col gap-1">
            <Label>Panels</Label>
            <div className="text-black">{contract.panelCount}</div>
          </div>
          <div className="flex flex-col gap-1">
            <Label>Source</Label>
            <div className="text-black">{contract.source}</div>
          </div>
          <div className="flex flex-col gap-1">
            <Label>Intro</Label>
            <div className="text-black text-xs whitespace-pre-wrap">
              &ldquo;{contract.introDialogue}&rdquo;
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Label>Constraints</Label>
            {contract.constraints && contract.constraints.length > 0 ? (
                <ul className="list-disc list-inside text-black text-xs">
                  {contract.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                  ))}
                </ul>
            ) : (
                <div className="text-black text-xs">None</div>
            )}
          </div>
        </div>
      </div>
  );
}
