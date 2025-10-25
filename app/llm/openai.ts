import 'server-only';
import OpenAI from "openai";

/**
 * Minimal LLM framework for OpenAI
 *
 * Goals:
 * - Accept a system prompt and an expected output format description separately
 * - Allow specifying the model per request
 * - Combine system + output format into a single system message before calling the API
 * - Read API key from env (OPENAI_API_KEY)
 * - Provide a narrow, typed surface that's easy to evolve
 */

export type CallLLMParams = {
  model: string;
  system: string; // core system prompt written by the app
  outputFormat?: string; // guidance for expected output format (schema-ish description or prose)
  output?: string; // alias for outputFormat (hackathon convenience)
  input: string; // user content or task payload
  imageBase64?: string; // optional base64-encoded PNG/JPEG to send alongside the prompt
  expectJson?: boolean; // if true, attempt to parse the response into JSON and return it as `json`
};

export type CallLLMResult<TJson = unknown> = {
  text: string;
  model: string;
  json?: TJson; // when expectJson=true and parsing succeeds
  parseError?: string; // when expectJson=true but parsing fails
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
  raw?: unknown; // passthrough for debugging if needed
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function buildSystemMessage(prompt: string, outputFormat?: string): string {
  if (!outputFormat) return prompt.trim();
  return [
    prompt.trim(),
    "\n---\n",
    "OUTPUT EXPECTATIONS:\n",
    "ONLY output everything that is requested below. No extra commentary:\n\n",
    outputFormat.trim(),
  ].join("");
}

function extractJsonFromText<T = unknown>(text: string): { json?: T; error?: string } {
  if (!text) return { error: "Empty response text" };
  let body = text.trim();
  // Strip common code fences
  if (body.startsWith("```")) {
    const fenceEnd = body.lastIndexOf("```");
    if (fenceEnd > 0) {
      body = body.slice(3, fenceEnd).trim();
      // If language tag is present (e.g., ```json), strip first line tag
      const firstNewline = body.indexOf("\n");
      const firstLine = firstNewline >= 0 ? body.slice(0, firstNewline) : body;
      if (/^json/i.test(firstLine)) {
        body = firstNewline >= 0 ? body.slice(firstNewline + 1) : "";
      }
      body = body.trim();
    }
  }

  try {
    console.log("Extracted JSON:", body);
    const parsed = JSON.parse(body) as T;
    return { json: parsed };
  } catch (e: any) {
    return { error: `Failed to parse JSON: ${e?.message || String(e)}` };
  }
}

/**
 * Calls OpenAI Responses API with a single combined prompt
 *
 * We combine system + output expectations + user input into one string,
 * then call client.responses.create and read response.output_text.
 */
export async function callLLM<T = unknown>(params: CallLLMParams): Promise<CallLLMResult<T>> {
  const { model, system, outputFormat, output, input, imageBase64, expectJson } = params;

  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "Missing OPENAI_API_KEY. Set it in your environment (e.g., .env.local)."
    );
  }

  const systemMessage = buildSystemMessage(system, output || outputFormat);
  const prompt = [
    systemMessage,
    "\n\n--- INPUT ---\n",
    input.trim(),
  ].join("");

  // Build input as multimodal when imageBase64 is provided
  let inputPayload: any = prompt;
  if (imageBase64 && typeof imageBase64 === "string" && imageBase64.trim().length > 0) {
    // Support both raw base64 and data URLs
    inputPayload = [
      {
        role: "user",
        content: [
          { type: "input_text", text: prompt },
          { type: "input_image", image_url: imageBase64 },
        ],
      },
    ];
  }

  console.log("Calling OpenAI with prompt:", inputPayload);
  const response = await openai.responses.create({
    model,
    input: inputPayload,
  });

  // Prefer the convenience string, fallback to assembling from content if needed
  const text = response.output_text ?? "";

  const result: CallLLMResult<T> = {
    text,
    model,
    usage: {
      inputTokens: (response as any).usage?.input_tokens,
      outputTokens: (response as any).usage?.output_tokens,
      totalTokens: (response as any).usage?.total_tokens,
    },
    raw: response,
  };

  if (expectJson) {
    const { json, error } = extractJsonFromText<T>(text);
    if (json !== undefined) result.json = json;
    if (error) result.parseError = error;
  }

  return result;
}
