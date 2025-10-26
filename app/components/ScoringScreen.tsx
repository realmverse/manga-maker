"use client";

import { useEffect, useMemo, useState } from "react";
import ContractDetails from "./ContractDetails";
import LoadingComponent from "./LoadingComponent";
import Button from "./Button";
import { TMangaContract } from "@/app/gameloop/manga-contract-generator";
import { GradeResponse, gradeMangaPage } from "@/app/gameloop/manga-grader";

function toLetter(average: number): string {
  if (average >= 90) return "A";
  if (average >= 80) return "B";
  if (average >= 70) return "C";
  if (average >= 60) return "D";
  return "F";
}

export default function ScoringScreen({
  contract,
  imageDataUrl,
  onRestart,
}: {
  contract: TMangaContract;
  imageDataUrl: string;
  onRestart: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grades, setGrades] = useState<GradeResponse | null>(null);

  useEffect(() => {
    let mounted = true;

    gradeMangaPage(contract, imageDataUrl, "gpt-5-mini")
      .then((res) => {
        if (!mounted) return;
        setError(null);
        setGrades(res);
      })
      .catch((e: { message: string }) => {
        if (!mounted) return;
        setGrades(null);
        setError(e?.message || "Grading failed");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [contract, imageDataUrl]);

  const avg = useMemo(() => {
    if (!grades || !grades.grades || grades.grades.length === 0) return null;
    const sum = grades.grades.reduce((acc, g) => acc + (g.score || 0), 0);
    return Math.round(sum / grades.grades.length);
  }, [grades]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageDataUrl;
    link.download = `manga-page-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 w-full h-screen animate-fade-in">
      <div className="flex items-center justify-between w-full max-w-7xl px-6 py-4 border-2 bg-amber-200 border-black/10 rounded-2xl">
        <h2 className="text-3xl font-titan-one text-white flex items-baseline gap-4">
          <span className="text-outline">Scoring</span>
          {avg !== null && (
            <span className="text-xl font-comic-neue text-black/50 font-bold">
              Avg {avg}/100 — Grade {toLetter(avg)}
            </span>
          )}
        </h2>
        <Button onClick={handleDownload} variant="primary" size="medium">
          Download Image
        </Button>
      </div>

      <div className="flex-1 w-full max-w-7xl">
        {loading ? (
          <div className="w-full h-full flex items-start justify-center">
            <LoadingComponent
              title="Gathering critic reviews"
              subtitle="Review committee"
            />
          </div>
        ) : (
          <div className="w-full h-full grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-6">
            {/* Contract */}
            <ContractDetails contract={contract} />

            {/* Image + Summary */}
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white rounded-lg shadow-2xl overflow-hidden border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageDataUrl}
                  alt="Submitted manga page"
                  className="max-h-[70vh] object-contain"
                />
              </div>
              {error && <div className="text-red-400 text-sm">{error}</div>}
              {avg !== null && (
                <div className="text-white text-2xl font-titan-one text-outline">
                  Total Score: <span className="text-green-300">{avg}</span>/100
                  — Grade {toLetter(avg)}
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="w-80 flex flex-col bg-[#FCF6D7] rounded-3xl border-2 border-[#664950] shadow-2xl overflow-y-auto overflow-x-hidden font-comic-neue">
              <div className="bg-linear-to-b from-[#9B7EBD] to-[#B89FD4] rounded-t-[20px] px-4 py-3 border-b-2 border-[#664950]">
                <h3 className="font-titan-one text-lg text-white text-center drop-shadow-md">
                  Critic Reviews
                </h3>
              </div>
              <div className="flex flex-col gap-3 p-4">
                {grades?.grades?.map((g, i) => (
                  <div
                    key={i}
                    className="p-2 rounded bg-white border border-[#664950]/20"
                  >
                    <div className="text-black text-sm font-semibold">
                      {g.judge} — {g.score}/100
                    </div>
                    <div className="text-black/80 text-xs mt-1 whitespace-pre-wrap">
                      {g.review}
                    </div>
                  </div>
                ))}
                <div className="border-t border-[#664950]/20 pt-3 mt-1">
                  <Button onClick={onRestart} variant="primary" size="medium">
                    Back to Main Screen
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
