"use client";

import { useState } from "react";
import { KodoClient } from "@/lib/api/client";
import { generateMangaContract, TMangaContract } from "@/app/gameloop/manga-contract-generator";

export default function DebugPage() {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [contract, setContract] = useState<TMangaContract | null>(null);
  const [contractError, setContractError] = useState<string | null>(null);
  const [loadingContract, setLoadingContract] = useState(false);

  const [desc, setDesc] = useState("A plucky courier races through neon alleys in a rainy cyberpunk city");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [imageError, setImageError] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);

  async function onGenerateContract() {
    setLoadingContract(true);
    setContractError(null);
    setContract(null);
    try {
      const c = await generateMangaContract(difficulty, "gpt-5-mini");
      setContract(c);
    } catch (e: any) {
      setContractError(e?.message || String(e));
    } finally {
      setLoadingContract(false);
    }
  }

  async function onGenerateImage() {
    setLoadingImage(true);
    setImageError(null);
    setImageUrl(undefined);
    try {
      const kodo = new KodoClient();
      const r = await kodo.generate({ description: desc });
      setImageUrl(r.url);
    } catch (e: any) {
      setImageError(e?.message || String(e));
    } finally {
      setLoadingImage(false);
    }
  }

  return (
    <main style={{ padding: 20, fontFamily: "ui-sans-serif, system-ui, -apple-system" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Manga Factory — Debug</h1>
      <p style={{ marginTop: 8, color: "#555" }}>
        Quick debug page to try contract generation and Kodo image generation via server APIs.
      </p>

      <section style={{ marginTop: 24, padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Contract Generator</h2>
        <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
          <label>Difficulty:</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
            style={{ padding: 6, borderRadius: 6, border: "1px solid #d1d5db" }}
          >
            <option value="easy">easy</option>
            <option value="medium">medium</option>
            <option value="hard">hard</option>
          </select>
          <button
            onClick={onGenerateContract}
            disabled={loadingContract}
            style={{ padding: "8px 12px", borderRadius: 6, background: "#111827", color: "white" }}
          >
            {loadingContract ? "Generating..." : "Generate Contract"}
          </button>
        </div>
        {contractError && (
          <div style={{ marginTop: 12, color: "#b91c1c" }}>Error: {contractError}</div>
        )}
        {contract && (
          <pre style={{ marginTop: 12, whiteSpace: "pre-wrap", background: "#f9fafb", padding: 12, borderRadius: 6 }}>
            {JSON.stringify(contract, null, 2)}
          </pre>
        )}
      </section>

      <section style={{ marginTop: 24, padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Kodo Image</h2>
        <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Describe a panel"
            style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #d1d5db" }}
          />
          <button
            onClick={onGenerateImage}
            disabled={loadingImage}
            style={{ padding: "8px 12px", borderRadius: 6, background: "#111827", color: "white" }}
          >
            {loadingImage ? "Generating..." : "Generate Image"}
          </button>
        </div>
        {imageError && (
          <div style={{ marginTop: 12, color: "#b91c1c" }}>Error: {imageError}</div>
        )}
        {imageUrl && (
          <div style={{ marginTop: 12 }}>
            <img src={imageUrl} alt="Generated panel" style={{ maxWidth: "100%", borderRadius: 8 }} />
            <div style={{ marginTop: 6, color: "#6b7280" }}>{imageUrl}</div>
          </div>
        )}
      </section>
    </main>
  );
}
