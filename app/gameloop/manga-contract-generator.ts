import { LlmClient } from "@/lib/api/client";

// Hackathon-scope: minimal contract type used for generation
export type TMangaContract = {
    genre: string;
    tone: "wholesome" | "dramatic" | "comedy";
    audience: string; // single specific word
    panelCount: number; // 3..5
    constraints: string[]; // 0..2 succinct constraints
    selfReview: "well-formed" | "boring" | "complicated";
    source: "boss" | "client" | "auto";
    introDialogue: string; // one sentence diegetic line explaining where it came from
};
export type TMangaContracts = {
    contracts: TMangaContract[]
};

export type TDifficulty = "easy" | "medium" | "hard";

// Simple in-memory session cache to avoid duplicate LLM calls per difficulty during a SPA session
const _contractsPromiseCache = new Map<string, Promise<TMangaContract[]>>();
const _contractsValueCache = new Map<string, TMangaContract[]>();

export async function generateMangaContracts(
    difficulty: TDifficulty,
    // Legacy parameter kept for compatibility but ignored; model is server-locked
    _model: string = "gpt-5-mini"
): Promise<TMangaContract[]> {
    const key = `${difficulty}`;

    // Return resolved value if present
    if (_contractsValueCache.has(key)) {
        return _contractsValueCache.get(key)!;
    }
    // Return in-flight promise if already fetching
    if (_contractsPromiseCache.has(key)) {
        return _contractsPromiseCache.get(key)!;
    }

    const fetchPromise = (async () => {
        const llm = new LlmClient();
        const json = await llm.generateContracts<TMangaContracts>({ difficulty });
        const contracts = json?.contracts || [];
        _contractsValueCache.set(key, contracts);
        return contracts;
    })();

    _contractsPromiseCache.set(key, fetchPromise);

    try {
        const result = await fetchPromise;
        return result;
    } finally {
        // Clean up in-flight promise; value remains cached
        _contractsPromiseCache.delete(key);
    }
}

export async function generateMangaContract(
    difficulty: TDifficulty,
    // Legacy parameter kept for compatibility but ignored; model is server-locked
    _model: string = "gpt-5-mini"
): Promise<TMangaContract> {
    return (await generateMangaContracts(difficulty, _model))[0];
}