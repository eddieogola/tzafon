import OpenAI from "openai";

// Initialize client with Tzafon API
const client = new OpenAI({
  apiKey: "sk_live_RWQM8y0zfJ9vNqE75hDc07kUyqfUBNr",
  baseURL: "https://api.tzafon.ai/v1",
});

async function main() {

const response = await client.chat.completions.create({
  model: "tzafon.northstar.cua.sft",
  messages: [
      {"role": "user", "content": "Hello!"}
  ],
  temperature: 0.7,
  max_tokens: 1024,
});

console.log(response.choices[0].message.content);
}

main();