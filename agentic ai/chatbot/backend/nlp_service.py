import os
import google.generativeai as genai
import traceback

DISTRESS_KEYWORDS = ["suicide", "kill myself", "want to die", "end it all", "give up", "useless", "hopeless", "hurt myself", "pain", "can't go on", "terrible"]

def analyze_message(message: str, history: list) -> tuple[str, bool]:
    message_lower = message.lower()
    
    # 1. Immediate Safety Escalation Circuit Break
    for keyword in DISTRESS_KEYWORDS:
        if keyword in message_lower:
            return (
                "It sounds like you are going through a very difficult time right now. Your safety is incredibly important. "
                "I am escalating this conversation to a human expert who can help you immediately. "
                "Please hold on, or call your local emergency services (like 911 or 988) right away.",
                True
            )

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        return ("Sorry, my AI core has not been connected to Gemini yet. Please configure the API Key in the backend `.env` file! 🤖", False)

    try:
        genai.configure(api_key=api_key)
        
        system_instruction = (
            "You are Clarity, an empathetic, supportive, and active-listening AI mental health companion. "
            "Keep your responses concise (1-3 sentences max), warm, and highly conversational. "
            "Validate the user's feelings and occasionally ask open-ended questions to encourage them to explore their thoughts. "
            "Do NOT provide medical diagnoses. NEVER suggest self-harm."
        )

        model = genai.GenerativeModel(
            model_name='gemini-2.5-flash',
            system_instruction=system_instruction
        )
        
        # Build contents array with previous conversation memory
        contents = []
        for msg in history:
            role = 'user' if msg.role == 'user' else 'model'
            contents.append({"role": role, "parts": [msg.content]})
        
        # Add current user message
        contents.append({"role": "user", "parts": [message]})

        response = model.generate_content(contents)
        return (response.text, False)
    except Exception as e:
        print(f"Error calling Gemini AI: {e}")
        traceback.print_exc()
        return ("I'm currently overwhelmed and unable to process that. Please try again in a moment.", False)
