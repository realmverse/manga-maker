import { generateKodoImage } from "@/app/genai/kodo";

async function main() {
  const args = process.argv.slice(2);
  const description = args.length > 0 ? args.join(" ") : "Energetic shonen panel: hero dashes with speed lines, dramatic lighting, inked manga style";

  console.log("Creating Kodo image job for description:\n", description, "\n");

  const result = await generateKodoImage({
    description,
    // Give the job more time by default when invoked via script
    timeoutMs: 180_000,
  });

  console.log("Kodo generation result:\n" + JSON.stringify(result, null, 2));

  if (result.status !== "completed") {
    console.warn(`Job did not complete successfully. status=${result.status}`);
    process.exitCode = 2;
  }
}

main().catch((err) => {
  console.error("Error in generate-kodo-image script:", err);
  process.exit(1);
});
