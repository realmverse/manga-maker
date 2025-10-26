"use client";

import Button from './Button';
import MangaCanvas from './MangaCanvas';
import ContractDetails from './ContractDetails';
import { useEffect, useState } from 'react';
import { TMangaContract } from '@/app/gameloop/manga-contract-generator';
import { generateMangaContracts } from '@/app/gameloop/manga-contract-generator';
import LoadingComponent from './LoadingComponent';

export default function GameScreen({ onRestart }: { onRestart: () => void }) {
  const [contracts, setContracts] = useState<TMangaContract[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selected, setSelected] = useState<TMangaContract | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    generateMangaContracts('easy')
      .then(list => {
        if (!mounted) return;
        // Fallback to empty array if undefined
        setContracts((list && list.length ? list : []).slice(0, 3));
      })
      .catch(e => {
        if (!mounted) return;
        setError(e?.message || 'Failed to load contracts');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 p-6 w-full h-screen animate-fade-in">
      <div className="flex items-center justify-between w-full max-w-7xl px-6 py-4">
        <h2 className="text-3xl font-titan-one text-white text-outline">
          Manga Maker
        </h2>

        <Button onClick={onRestart} variant="secondary" size="medium">
          Back to Title
        </Button>
      </div>

      <div className="flex-1 w-full max-w-7xl">
        {selected ? (
          <MangaCanvas contract={selected} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-start gap-4">
            <h3 className="text-white text-xl font-titan-one text-outline">Pick Your Contract</h3>
            {loading && (
              <LoadingComponent title="Loading contracts" subtitle="Studio pipeline" />
            )}
            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(contracts || []).map((c, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3">
                  <ContractDetails contract={c} />
                  <Button onClick={() => setSelected(c)} variant="primary" size="medium">
                    Select
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
