import 'server-only';

/**
 * Minimal Kodo image generation client (Realmverse Kodo API)
 *
 * Responsibilities:
 * - Create a text-to-image (tti-v1) generation job for a manga panel description
 * - Poll the job until it completes and return the image URL
 * - Read credentials from env vars:
 *   - KODO_API_KEY (required)
 *   - KODO_ACCOUNT_ID (required)
 *   - KODO_APP_ID (optional, defaults to "kodo")
 *
 * Usage:
 *   const { url } = await generateKodoImage({ description: "hero leaps across rooftops" });
 */

export type KodoCreateJobResponse = {
  id: string;
  status: string; // pending | running | completed | failed | canceled | ...
  statusMessage?: string;
  type: string;
  results: Array<{
    type: string;
    name?: string;
    url?: string;
  }>;
  createdTimestamp?: number;
  statusTimestamp?: number;
  params?: Record<string, any>;
  metadata?: Record<string, any>;
};

export type KodoGetJobResponse = KodoCreateJobResponse;

export type GenerateKodoImageParams = {
  description: string;
  width?: number; // Image width in pixels
  height?: number; // Image height in pixels
  // Polling options
  pollIntervalMs?: number; // default 1500
  timeoutMs?: number; // default 90_000
  // Advanced: override env-provided values
  apiKey?: string;
  accountId?: string;
  appId?: string; // default "kodo"
  baseUrl?: string; // default "https://api.realmverse.gg"
};

export type GenerateKodoImageResult = {
  aigenId: string;
  status: string;
  url?: string;
  rawCreate?: KodoCreateJobResponse;
  rawFinal?: KodoGetJobResponse;
};

function envOrThrow(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required env var ${name}. Set it in your environment (e.g., .env.local).`);
  }
  return value;
}

async function kodoFetch(
  url: string,
  init: RequestInit & { apiKey: string }
): Promise<Response> {
  const { apiKey, headers, ...rest } = init;
  const res = await fetch(url, {
    ...rest,
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(headers || {}),
    },
  });
  return res;
}

export async function generateKodoImage(
  params: GenerateKodoImageParams
): Promise<GenerateKodoImageResult> {
  const apiKey = params.apiKey ?? envOrThrow("KODO_API_KEY", process.env.KODO_API_KEY);
  const accountId = params.accountId ?? envOrThrow("KODO_ACCOUNT_ID", process.env.KODO_ACCOUNT_ID);
  const appId = params.appId ?? process.env.KODO_APP_ID ?? "kodo";
  const baseUrl = params.baseUrl ?? process.env.KODO_BASE_URL ?? "https://api.realmverse.gg";

  const pollIntervalMs = params.pollIntervalMs ?? 1500;
  const timeoutMs = params.timeoutMs ?? 180_000;
  const started = Date.now();

  // 1) Create job
  const createUrl = `${baseUrl}/app/${encodeURIComponent(appId)}/accounts/${encodeURIComponent(accountId)}/aigens`;
  const createBody = {
    type: "tti-v1",
    params: {
      positive: params.description,
      ...(params.width && { width: params.width }),
      ...(params.height && { height: params.height }),
    },
  };

  const createRes = await kodoFetch(createUrl, {
    method: "POST",
    apiKey,
    body: JSON.stringify(createBody),
  });

  if (!createRes.ok) {
    const text = await safeReadText(createRes);
    throw new Error(`Kodo create job failed: ${createRes.status} ${createRes.statusText} — ${text}`);
  }

  const createJson = (await createRes.json()) as KodoCreateJobResponse;
  const aigenId = createJson.id;
  if (!aigenId) {
    throw new Error("Kodo create job response missing id");
  }

  // 2) Poll until completed
  const getUrl = `${baseUrl}/app/${encodeURIComponent(appId)}/accounts/${encodeURIComponent(accountId)}/aigens/${encodeURIComponent(aigenId)}`;
  let lastJson: KodoGetJobResponse | undefined = undefined;

  const maxAttempts = 10000; // safeguard to prevent infinite loop
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (Date.now() - started > timeoutMs) {
      return {
        aigenId,
        status: lastJson?.status ?? createJson.status ?? "timeout",
        url: extractFirstUrl(lastJson ?? createJson),
        rawCreate: createJson,
        rawFinal: lastJson,
      };
    }

    const getRes = await kodoFetch(getUrl, { method: "GET", apiKey });
    if (!getRes.ok) {
      const text = await safeReadText(getRes);
      throw new Error(`Kodo poll failed: ${getRes.status} ${getRes.statusText} — ${text}`);
    }

    lastJson = (await getRes.json()) as KodoGetJobResponse;
    const status = (lastJson.status || "").toLowerCase();

    if (status === "completed") {
      return {
        aigenId,
        status: lastJson.status,
        url: extractFirstUrl(lastJson),
        rawCreate: createJson,
        rawFinal: lastJson,
      };
    }

    if (status === "failed" || status === "canceled" || status === "cancelled" || status === "error") {
      // Return early with failure info but do not throw to let callers decide UX flow
      return {
        aigenId,
        status: lastJson.status,
        url: extractFirstUrl(lastJson),
        rawCreate: createJson,
        rawFinal: lastJson,
      };
    }

    await delay(pollIntervalMs);
  }

  throw new Error("Kodo polling exceeded maximum attempts");
}

function extractFirstUrl(resp: KodoCreateJobResponse | KodoGetJobResponse | undefined): string | undefined {
  const list = resp?.results ?? [];
  const first = list.find(r => typeof r.url === "string" && r.url.length > 0);
  return first?.url;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeReadText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "<unreadable body>";
  }
}
