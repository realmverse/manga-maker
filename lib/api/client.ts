/**
 * Frontend-safe API client classes for calling Next.js server routes.
 *
 * These classes wrap the server endpoints that proxy env-keyed services
 * (OpenAI, Kodo) so the React app can call them without touching secrets.
 *
 * Usage (client component):
 *   import { KodoClient, LlmClient } from "@/lib/api/client";
 *
 *   const kodo = new KodoClient();
 *   const { url } = await kodo.generate({ description: "hero leaps" });
 *
 *   const llm = new LlmClient();
 *   const contracts = await llm.generateContracts({ difficulty: "easy" });
 */

export type ApiResult<T> = { ok: true; result: T } | { ok: false; error: string };

export type GenerateKodoImageRequest = {
  description: string;
  width?: number;
  height?: number;
  pollIntervalMs?: number;
  timeoutMs?: number;
};

export type GenerateKodoImageResponse = {
  aigenId: string;
  status: string;
  url?: string;
};

export class KodoClient {
  constructor(private basePath = "/api/kodo") {}

  /**
   * Creates a Kodo tti-v1 job and polls until completion (server side).
   * Returns aigen id, final status, and possibly the image URL.
   */
  async generate(req: GenerateKodoImageRequest): Promise<GenerateKodoImageResponse> {
    const res = await fetch(`${this.basePath}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    const data = (await res.json()) as ApiResult<GenerateKodoImageResponse>;
    if (!res.ok) {
      throw new Error(res.statusText || "Kodo generate failed");
    }
    if (!data) {
      throw new Error("Unknown error");
    }
    if (data.ok) {
      return data.result;
    }
    throw new Error(data.error || "Kodo generate failed");
  }
}

export type CallLLMRequest<TExpectJson extends boolean | undefined = undefined> = {
  model: string;
  system: string;
  input: string;
  outputFormat?: string;
  output?: string;
  imageBase64?: string;
  expectJson?: TExpectJson;
};

export type CallLLMResponse<TJson = unknown> = {
  text: string;
  model: string;
  json?: TJson;
  parseError?: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
};

export type TDifficulty = "easy" | "medium" | "hard";

export class LlmClient {
  constructor(private basePath = "/api/llm") {}

  /**
   * Purpose-specific: generate 3 contracts server-side (prompts embedded, model locked).
   */
  async generateContracts<TJson = unknown>(params: { difficulty: TDifficulty }): Promise<TJson> {
    const res = await fetch(`${this.basePath}/call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purpose: "generate_contracts", difficulty: params.difficulty }),
    });
    const data = (await res.json()) as ApiResult<CallLLMResponse<TJson>>;
    if (!res.ok) throw new Error(res.statusText || "LLM generateContracts failed");
    if (!data || !data.ok) throw new Error((data as any)?.error || "LLM generateContracts failed");
    return data.result.json as TJson;
  }

  /**
   * Purpose-specific: grade a produced manga page (prompts embedded, model locked).
   */
  async gradePage<TJson = unknown>(params: { contract: unknown; imageBase64: string }): Promise<TJson> {
    const res = await fetch(`${this.basePath}/call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purpose: "grade_page", contract: params.contract, imageBase64: params.imageBase64 }),
    });
    const data = (await res.json()) as ApiResult<CallLLMResponse<TJson>>;
    if (!res.ok) throw new Error(res.statusText || "LLM gradePage failed");
    if (!data || !data.ok) throw new Error((data as any)?.error || "LLM gradePage failed");
    return data.result.json as TJson;
  }

  /**
   * Legacy generic call. Server now restricts usage; retained for compatibility within repo if needed.
   */
  async call<TJson = unknown>(req: Record<string, unknown>): Promise<CallLLMResponse<TJson>> {
    const res = await fetch(`${this.basePath}/call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    const data = (await res.json()) as ApiResult<CallLLMResponse<TJson>>;
    if (!res.ok) throw new Error(res.statusText || "LLM call failed");
    if (!data || !data.ok) throw new Error((data as any)?.error || "LLM call failed");
    return data.result;
  }
}
