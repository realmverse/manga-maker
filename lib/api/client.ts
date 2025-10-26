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
 *   const res = await llm.call({ model: "gpt-4o-mini", system: "You are...", input: "..." });
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

export class LlmClient {
  constructor(private basePath = "/api/llm") {}

  /**
   * Calls the OpenAI Responses API via our server route.
   */
  async call<TJson = unknown>(req: CallLLMRequest): Promise<CallLLMResponse<TJson>> {
    console.log("LLM call request", JSON.stringify(req));
    const res = await fetch(`${this.basePath}/call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    const data = (await res.json()) as ApiResult<CallLLMResponse<TJson>>;
    console.log("LLM call result", JSON.stringify(data));
    if (!res.ok) {
      throw new Error(res.statusText || "LLM call failed");
    }
    if (!data) {
      throw new Error("Unknown error");
    }
    if (!data.ok) {
      throw new Error(data.error || "LLM call failed");
    }
    const result = data.result;
    console.log("LLM call result", JSON.stringify(result));
    console.log("LLM call result text", result.text);
    if (result?.text?.length) {
      result.json = JSON.parse(data.result.text)
    }
    return result;
  }
}
