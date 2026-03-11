from openai import OpenAI
import os

client = OpenAI(
    api_key=os.getenv("TZAFON_API_KEY"), base_url="https://api.tzafon.ai/v1"
)


def check_open_ai_compatibility():
    response = client.chat.completions.create(
        model="tzafon.sm-1", messages=[{"role": "user", "content": "Hello!"}]
    )
    print(response.choices[0].message.content)
