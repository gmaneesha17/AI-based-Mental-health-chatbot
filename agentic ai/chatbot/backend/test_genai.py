import os
from dotenv import load_dotenv
import traceback

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

try:
    from google import genai
    from google.genai import types
    print("google-genai version imports successfully")

    client = genai.Client(api_key=api_key)
    print("Client initialized")

    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=["Hello!"],
        config=types.GenerateContentConfig(
            system_instruction="Be succinct.",
            temperature=0.7,
        ),
    )
    print("Response text:", response.text)
except Exception as e:
    print("Exception occurred:")
    traceback.print_exc()
