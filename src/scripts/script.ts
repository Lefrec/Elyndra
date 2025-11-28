import Perplexity from '@perplexity-ai/perplexity_ai';
// import type { 
//     SearchCreateResponse, 
//     ChatCompletionCreateResponse,
//     SearchResult,
//     ChatCompletionMessage 
// } from '@perplexity-ai/perplexity_ai';

const button = document.getElementById("button");
const input = document.getElementById("input");

if (button && input) {
    console.log("button and input found")
}

const client = new Perplexity({
    apiKey: process.env.PERPLEXITY_API_KEY
})

if (button && input) {
    button.addEventListener("click", () => searchQuery(input.textContent))
}

async function searchQuery(query:string) {
    const search = await client.search.create({
        query: query,
        max_results: 1,
    });
    console.log(search)
}