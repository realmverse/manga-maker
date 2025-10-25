import { callLLM } from "@/app/llm/openai";

// Hackathon-scope: minimal contract type used for generation
export type TMangaContract = {
  genre: string;
  tone: "wholesome" | "chaotic" | "dramatic" | "comedy";
  audience: "string";
  panelCount: number; // 3..5
  constraints: string[]; // creative constraints to follow
  selfReview: string;
};

export function jsonShapeForTMangaContract(): string {
  return (
    "Return ONLY valid JSON that matches this TypeScript type (no extra commentary):\n" +
    "type TMangaContract = {\n" +
    "  genre: string;\n" +
    "  tone: \"wholesome\" | \"chaotic\" | \"dramatic\" | \"comedy\";\n" +
    "  audience: string;" +
    "  panelCount: number; // integer 3..5\n" +
    "  constraints: string[0..2];\n" +
    "  selfReview: \"well-formed\" | \"boring\" | \"complicated\" ;\n" +
    "};\n" +
    "Rules: Emit JSON only. Do not wrap in markdown fences. Ensure panelCount is 3, 4, or 5."
  );
}

export function randomizeContractSystemPrompt(): string {
  return (
    "You are Manga Factory's contract generator. Craft a concise creative contract for a manga artist.\n" +
    "Keep outputs coherent and game-ready. The contract should inspire manga creation.\n" +
    "Every string in the response should be in English and presentable to end users (well formed, starting with capital letter). \n" +
    "Sentences should be well-formed and use proper grammar and punctuation.\n" +
    "Vary tone and audience to keep things fresh. Use clear, engaging language.\n" +
    "Incorporate creative constraints to challenge and inspire the manga artist.\n" +
    "Ensure the panel count is suitable for a short manga (3 to 5 panels).\n" +
    "Content should be appropriate for all audiences even when themed for adults.\n" +
    "Genre should be simple, but composite and interesting.\n" +
    "Audience should be a single specific non-simple word.\n" +
    "Include 0 constraint for easy difficulty, 1 for medium, 2 for hard. " +
    "Constraints should be very succinct and specific simple sentences, but never prohibit dialogue.\n" +
    "At the end, include a brief self-review of the contract's creativity and clarity.\n"
  );
}

export async function generateMangaContract(difficulty: 'easy' | 'medium' | 'hard', model = "gpt-5-mini") {
  const { json, text, parseError } = await callLLM<TMangaContract>({
    model,
    system: randomizeContractSystemPrompt(),
    output: jsonShapeForTMangaContract(),
    input: `Difficulty: ${difficulty}`,
    expectJson: true,
  });

  if (!json) {
    throw new Error(
      `Failed to parse TMangaContract JSON from model. Error: ${parseError || "unknown"}. Raw text: ${text}`
    );
  }

  // Simple runtime checks for hackathon safety
  json.panelCount = Math.max(3, Math.min(5, Math.round(json.panelCount)));
  if (!Array.isArray(json.constraints)) json.constraints = [];

  return json;
}
