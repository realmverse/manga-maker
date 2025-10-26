import { LlmClient } from "@/lib/api/client";
import { TMangaContract } from "@/app/gameloop/manga-contract-generator";

export type JudgeGrade = { judge: string; name: string, review: string; score: number };
export type GradeResponse = { grades: JudgeGrade[] };

export async function gradeMangaPage(
  contract: TMangaContract,
  imageBase64: string
): Promise<GradeResponse> {
  const llm = new LlmClient();
  const json = await llm.gradePage<GradeResponse>({ contract, imageBase64 });

  if (!json) {
    throw new Error("Failed to parse grade JSON");
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
