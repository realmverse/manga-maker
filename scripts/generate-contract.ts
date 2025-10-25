import {generateMangaContract} from "@/app/gameloop/manga-contract-generator";

async function main() {

    const contract = await generateMangaContract("hard");

    console.log(JSON.stringify(contract, null, 2))
}
main().catch((err) => {
    console.error("Error in generate-contract script:", err);
});