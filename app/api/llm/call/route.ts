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
    const imageBase64 = typeof body?.imageBase64 === "string" ? body.imageBase64 : undefined;

    if (!model) {
      return NextResponse.json({ error: "Missing required field: model" }, { status: 400 });
    }
    if (!system) {
      return NextResponse.json({ error: "Missing required field: system" }, { status: 400 });
    }
    if (!input) {
      return NextResponse.json({ error: "Missing required field: input" }, { status: 400 });
    }

    const result = await callLLM({ model, system, input, outputFormat, output, expectJson, imageBase64 });
    // Remove raw field for client safety
    const { text, model: usedModel, json, parseError, usage } = result;
    const safe = { text, model: usedModel, json, parseError, usage };

    return NextResponse.json({ ok: true, result: safe });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
