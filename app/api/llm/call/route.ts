import { NextResponse } from "next/server";
import { callLLM } from "../../../llm/openai";

export const runtime = "nodejs";

// Hardcoded model to prevent generic proxying
const MODEL = "gpt-5-mini";

function contractSystemPrompt(): string {
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
    '- "boss" = explosive studio head issues a sudden brief.\n' +
    '- "client" = external sponsor request routed to the team.\n' +
    '- "auto" = overnight Auto-Dispatcher batch job.\n' +
    "IntroDialogue must be an in-world dialogue that explains the arrival of the brief, matching the source. Make it satire. \n" +
    "At the end, include a brief self-review of the contract's creativity and clarity.\n" +
    `All strings should be in ${process.env.NEXT_PUBLIC_OPENAI_OUTPUT_LANGUAGE || 'English'} language and well-formed.`
  );
}

function contractOutputShape(): string {
  return (
    "Return ONLY valid JSON that matches an this TypeScript type wtih exactly 3 elements (no extra commentary):\n" +
    "type TMangaContracts = {" +
    "contracts: [{\n" +
    "  genre: string;\n" +
    "  tone: \"wholesome\" | \"dramatic\" | \"comedy\";\n" +
    "  audience: string;\n" +
    "  panelCount: number; // integer 3..5\n" +
    "  constraints: string[0..2];\n" +
    "  selfReview: \"well-formed\" | \"boring\" | \"complicated\";\n" +
    "  source: \"boss\" | \"client\" | \"auto\";\n" +
    "  introDialogue: string;\n" +
    "}]};\n" +
    "Rules: Emit JSON only. Do not wrap in markdown fences. Ensure panelCount is 3, 4, or 5."
  );
}

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

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const purpose = typeof body?.purpose === "string" ? body.purpose : "";

    if (!purpose) {
      return NextResponse.json({ error: "Missing required field: purpose" }, { status: 400 });
    }

    if (purpose === "generate_contracts") {
      const difficulty = body?.difficulty;
      if (difficulty !== "easy" && difficulty !== "medium" && difficulty !== "hard") {
        return NextResponse.json({ error: "Invalid or missing difficulty" }, { status: 400 });
      }

      const input = `Difficulty: ${difficulty}`;
      const result = await callLLM({
        model: MODEL,
        system: contractSystemPrompt(),
        outputFormat: contractOutputShape(),
        input,
        expectJson: true,
      });

      const { text, model: usedModel, json, parseError, usage } = result;
      return NextResponse.json({ ok: true, result: { text, model: usedModel, json, parseError, usage } });
    }

    if (purpose === "grade_page") {
      const contract = body?.contract;
      const imageBase64 = typeof body?.imageBase64 === "string" ? body.imageBase64 : undefined;
      if (!contract || !imageBase64) {
        return NextResponse.json({ error: "Missing required fields: contract, imageBase64" }, { status: 400 });
      }
      const simplifiedContract = {
        genre: contract.genre,
        tone: contract.tone,
        audience: contract.audience,
        panelCount: contract.panelCount,
        constraints: contract.constraints,
        intro: contract.introDialogue,
      };
      const input = [
        "ORIGINAL CONTRACT:",
        JSON.stringify(simplifiedContract, null, 2),
        "\nThe attached image is the submitted manga page. Evaluate it per the rubric. Don't mention the contract details in your reviews. Reviews should be 2-3 sentences each.",
      ].join("\n");

      const result = await callLLM({
        model: MODEL,
        system: gradingSystemPrompt(),
        outputFormat: gradingOutputShape(),
        input,
        imageBase64,
        expectJson: true,
      });

      const { text, model: usedModel, json, parseError, usage } = result;
      return NextResponse.json({ ok: true, result: { text, model: usedModel, json, parseError, usage } });
    }

    return NextResponse.json({ error: "Unsupported purpose" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
