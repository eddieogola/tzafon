from openai import OpenAI

# Initialize client with Tzafon API
client = OpenAI(
    api_key="sk_live_RWQM8y0zfJ9vNqE75hDc07kUyqfUBNr",
    base_url="https://api.tzafon.ai/v1"
)

response = client.chat.completions.create(
    model="tzafon.northstar.cua.sft",
    messages=[
        {"role": "user", "content": "Hello!"}
    ],
    temperature=0.7,
    max_tokens=1024
)

print(response.choices[0].message.content)