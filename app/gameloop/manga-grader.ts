import { LlmClient } from "@/lib/api/client";
import { TMangaContract } from "@/app/gameloop/manga-contract-generator";

export type JudgeGrade = { judge: string; name: string, review: string; score: number };
export type GradeResponse = { grades: JudgeGrade[] };

function gradingSystemPrompt(): string {
  return (
      "You are Manga Factory's zany review committee. Three random manga readers evaluate the submitted manga page.\n" +
    "Each judge has a playful archetype voice and gives an in-character one-paragraph review with a numeric score 0-100.\n" +
    "Consider genre, tone, audience, panelCount, and constraints from the original contract.\n" +
    "One judge should be easy to amuse (fan-type), one should be hard to please (connoisseur-type) but still doable to achieve 100 " +
      "and one should be a judge from outside of target audience group. \n" +
      "Come up with creative names for each reviewer without calling them based on archetype directly - names should be genre-related. \n" +
      "Don't mention details of the intro, unless there's something missing from it. \n" +
      "Be funny but constructive; avoid profanity; keep content safe for all audiences.\n" +
      "Scoring rubric: coherence with contract (30), dialogue fit (40), overall charm (20), visual clarity/composition (10). You can't score more than 50% without dialogues\n" +
    "Important: Return ONLY valid JSON matching the required schema. No extra commentary.\n" +
          `All strings should be in ${process.env.NEXT_PUBLIC_OPENAI_OUTPUT_LANGUAGE || 'English'} language and well-formed.`

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
  model: string = "gpt-5-mini"
): Promise<GradeResponse> {
  const simplifiedContract = {
    genre: contract.genre,
    tone: contract.tone,
    audience: contract.audience,
    panelCount: contract.panelCount,
    constraints: contract.constraints,
    intro: contract.introDialogue
  }
  const input = [
    "ORIGINAL CONTRACT:",
    JSON.stringify(simplifiedContract, null, 2),
    "\nThe attached image is the submitted manga page. Evaluate it per the rubric. Don't mention the contract details in your reviews. Reviews should be 2-3 sentences each.",
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
    grades: (json.grades || []).slice(0, 3).map((g: Partial<JudgeGrade>) => ({
      judge: String(g?.judge ?? "Mysterious Judge"),
      name: String(g?.name ?? "Anonymous"),
      review: String(g?.review ?? ""),
      score: Math.max(0, Math.min(100, Math.round(typeof g?.score === "number" ? g.score : Number(g?.score) || 0))),
    })),
  };

  while (sanitized.grades.length < 3) {
    sanitized.grades.push({ judge: "Judge", name: "Filler", review: "Beep boop—insufficient data, but charming!", score: 50 });
  }

  return sanitized;
}
