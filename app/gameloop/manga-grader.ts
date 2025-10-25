import { LlmClient } from "@/lib/api/client";
import { TMangaContract } from "@/app/gameloop/manga-contract-generator";

export type JudgeGrade = { judge: string; name: string, review: string; score: number };
export type GradeResponse = { grades: JudgeGrade[] };

function gradingSystemPrompt(): string {
  return (
    "You are Manga Factory's zany review committee. Three eccentric anime studio judges evaluate a submitted manga page.\n" +
    "Each judge has a playful archetype voice and gives an in-character one-paragraph review with a numeric score 0-100.\n" +
    "Consider genre, tone, audience, panelCount, and constraints from the original contract.\n" +
    "Be funny but constructive; avoid profanity; keep content safe for all audiences.\n" +
    "Scoring rubric: coherence with contract (40), visual clarity/composition (30), dialogue fit (20), overall charm (10).\n" +
    "Important: Return ONLY valid JSON matching the required schema. No extra commentary.\n"
  );
}

function gradingOutputShape(): string {
  return (
    "Return ONLY valid JSON with this exact TypeScript shape (no extra commentary):\n" +
    "type GradeResponse = {\n" +
    "  grades: { judge: string; name: string, review: string; score: number; }[]; // exactly 3 judges\n" +
    "};\n" +
    "Rules: Emit JSON only. Provide exactly 3 items in grades. Score must be integer 0..100."
  );
}

export async function gradeMangaPage(
  contract: TMangaContract,
  imageBase64: string,
  model: string = "gpt-5"
): Promise<GradeResponse> {
  const input = [
    "ORIGINAL CONTRACT:",
    JSON.stringify(contract, null, 2),
    "\nThe attached image is the submitted manga page. Evaluate it per the rubric.",
  ].join("\n");

  const llm = new LlmClient();
  const { json, text, parseError } = await llm.call<GradeResponse>({
    model,
    system: gradingSystemPrompt(),
    output: gradingOutputShape(),
    input,
    imageBase64,
  });

  if (!json) {
    throw new Error(parseError || "Failed to parse grade JSON: " + (text || ""));
  }

  // Sanitize: exactly 3 judges, integer 0..100
  const sanitized: GradeResponse = {
    grades: (json.grades || []).slice(0, 3).map((g: any) => ({
      judge: String(g?.judge ?? "Mysterious Judge"),
      review: String(g?.review ?? ""),
      score: Math.max(0, Math.min(100, Math.round(Number(g?.score) || 0))),
    })),
  };

  while (sanitized.grades.length < 3) {
    sanitized.grades.push({ judge: "Judge", name: "Filler", review: "Beep boop—insufficient data, but charming!", score: 50 });
  }

  return sanitized;
}
