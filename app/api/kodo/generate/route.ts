import { NextResponse } from "next/server";
import { generateKodoImage } from "../../../genai/kodo";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const description = typeof body?.description === "string" ? body.description.trim() : "";
    if (!description) {
      return NextResponse.json({ error: "Missing required field: description" }, { status: 400 });
    }

    const pollIntervalMs = typeof body?.pollIntervalMs === "number" && body.pollIntervalMs > 0 ? body.pollIntervalMs : undefined;
    const timeoutMs = typeof body?.timeoutMs === "number" && body.timeoutMs > 0 ? body.timeoutMs : undefined;
    const width = typeof body?.width === "number" && body.width > 0 ? body.width : undefined;
    const height = typeof body?.height === "number" && body.height > 0 ? body.height : undefined;

    // Do NOT accept apiKey/accountId/appId from the client for security; rely on server env
    const result = await generateKodoImage({ description, width, height, pollIntervalMs, timeoutMs });

    return NextResponse.json({ ok: true, result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    // Avoid leaking secrets; send generic message for 500s
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
