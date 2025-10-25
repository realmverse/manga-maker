import { NextResponse } from "next/server";
import { callLLM } from "../../../llm/openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const model = typeof body?.model === "string" ? body.model.trim() : "";
    const system = typeof body?.system === "string" ? body.system : "";
    const input = typeof body?.input === "string" ? body.input : "";
    const outputFormat = typeof body?.outputFormat === "string" ? body.outputFormat : undefined;
    const output = typeof body?.output === "string" ? body.output : undefined;
    const expectJson = typeof body?.expectJson === "boolean" ? body.expectJson : false;

    if (!model) {
      return NextResponse.json({ error: "Missing required field: model" }, { status: 400 });
    }
    if (!system) {
      return NextResponse.json({ error: "Missing required field: system" }, { status: 400 });
    }
    if (!input) {
      return NextResponse.json({ error: "Missing required field: input" }, { status: 400 });
    }

    const result = await callLLM({ model, system, input, outputFormat, output, expectJson });
    // Do not expose low-level raw response by default to the client
    const { raw, ...safe } = result as any;

    return NextResponse.json({ ok: true, result: safe });
  } catch (err: any) {
    const message = err?.message || "Internal Server Error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
