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

export function jsonShapeForTMangaContract(): string {
    return (
        "Return ONLY valid JSON that matches an this TypeScript type wtih exactly 3 elements (no extra commentary):\n" +
        "type TMangaContracts = {" +
        "contracts: {\n" +
        "  genre: string;\n" +
        "  tone: \"wholesome\" | \"dramatic\" | \"comedy\";\n" +
        "  audience: string;\n" +
        "  panelCount: number; // integer 3..5\n" +
        "  constraints: string[0..2];\n" +
        "  selfReview: \"well-formed\" | \"boring\" | \"complicated\";\n" +
        "  source: \"boss\" | \"client\" | \"auto\";\n" +
        "  introDialogue: string;\n" +
        "}};\n" +
        "Rules: Emit JSON only. Do not wrap in markdown fences. Ensure panelCount is 3, 4, or 5."
    );
}

export function randomizeContractSystemPrompt(): string {
    return (
        "You are Manga Factory's contract generator. Craft a concise creative contract for a manga artist.\n" +
        "Keep outputs coherent and game-ready. The contract should inspire manga creation.\n" +
        "Every string in the response should be in English and presentable to end users (well formed, starting with capital letter).\n" +
        "Sentences should be well-formed and use proper grammar and punctuation.\n" +
        "Vary tone and audience to keep things fresh. Use clear, engaging language.\n" +
        "Incorporate creative constraints to challenge and inspire the manga artist.\n" +
        "Ensure the panel count is suitable for a short manga (3 to 5 panels).\n" +
        "Content should be appropriate for all audiences even when themed for adults.\n" +
        "Genre should be simple, but composite and interesting.\n" +
        "Audience should be simple and funny.\n" +
        "Include 0 constraint array elemenets for easy difficulty, 1 for medium, 2 for hard. Constraints should be very succinct and specific simple sentences, but never prohibit dialogue.\n" +
        "Source must indicate where the contract originated in the studio pipeline:\n" +
        "- \"boss\" = explosive studio head issues a sudden brief.\n" +
        "- \"client\" = external sponsor request routed to the team.\n" +
        "- \"auto\" = overnight Auto-Dispatcher batch job.\n" +
        "IntroDialogue must be an in-world dialogue that explains the arrival of the brief, matching the source. Make it satire. \n" +
        "At the end, include a brief self-review of the contract's creativity and clarity.\n" +
        `All strings should be in ${process.env.NEXT_PUBLIC_OPENAI_OUTPUT_LANGUAGE || 'English'} language and well-formed.`
    );
}

export async function generateMangaContracts(
    difficulty: TDifficulty,
    model = "gpt-5-mini"
): Promise<TMangaContract[]> {
    const llm = new LlmClient();
    const { json, text, parseError } = await llm.call<TMangaContracts>({
        model,
        system: randomizeContractSystemPrompt(),
        output: jsonShapeForTMangaContract(),
        input: `Difficulty: ${difficulty}`,
    });
    if (!json) {
        throw new Error(
            `Failed to parse TMangaContracts JSON from model. Error: ${parseError || "unknown"}. Raw text: ${text}`
        );
    }
    return json.contracts || [];
}

export async function generateMangaContract(
    difficulty: TDifficulty,
    model = "gpt-5-mini"
): Promise<TMangaContract> {
    // We try up to 3 times if the self-review indicates the contract isn't well-formed.
    // Minimal-scope retry: only when selfReview !== "well-formed"; parse failures still throw.
    const maxAttempts = 3;
    let last: TMangaContract | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const baseInput = `Difficulty: ${difficulty}`;

        const llm = new LlmClient();
        const { json, text, parseError } = await llm.call<TMangaContracts>({
            model,
            system: randomizeContractSystemPrompt(),
            output: jsonShapeForTMangaContract(),
            input: baseInput,
        });


        if (!json) {
            // Keep prior behavior: fail fast on parse errors
            throw new Error(
                `Failed to parse TMangaContracts JSON from model. Error: ${parseError || "unknown"}. Raw text: ${text}`
            );
        }

        for (const contract of json.contracts) {
            last = contract

            if (contract.selfReview === "well-formed" || attempt === maxAttempts) {
                return contract
            }
        }
    }
    if (!last) {
        throw new Error("No TMangaContract generated from model.");
    }
    return last
}