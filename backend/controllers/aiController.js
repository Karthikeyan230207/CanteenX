import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY, GEMINI_MODEL } from "../config/env.js";

const ai = GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: GEMINI_API_KEY })
  : null;

export const processVoiceCommand = async (req, res) => {
  try {
    const { message, menu } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Voice command is required",
      });
    }

    if (!ai) {
      return res.status(503).json({
        success: false,
        message: "AI assistant is not configured. Basic voice cart commands are still available.",
      });
    }

    const menuData = (menu || []).map((food) => ({
      id: food._id || food.id,
      name: food.name,
      category: food.category,
      price: food.price,
      stock: food.stock,
      isAvailable: food.isAvailable,
    }));

    const prompt = `
You are an AI voice assistant for a canteen ordering website.

USER COMMAND:
"${message}"

CURRENT CANTEEN MENU:
${JSON.stringify(menuData)}

Your job is to understand the user's command and return ONLY valid JSON.

AVAILABLE INTENTS:

1. ADD_TO_CART
2. REMOVE_FROM_CART
3. SHOW_CART
4. CLEAR_CART
5. GET_TOTAL
6. MENU_QUERY
7. RECOMMEND
8. UNKNOWN

========================================
ADD_TO_CART
========================================

Examples:

"Add one cake"
"Give me two samosas"
"I want one cake and one egg puff"
"Put 3 samosas in my cart"

Return:

{
  "intent": "ADD_TO_CART",
  "items": [
    {
      "foodId": "EXACT_MENU_ID",
      "quantity": 1
    }
  ],
  "response": "Added 1 cake to your cart."
}

Rules:
- Match food ONLY from the current menu.
- Use the exact food ID from the menu.
- If quantity is not mentioned, use 1.
- Multiple foods must be returned as multiple items.
- Never invent food IDs.

========================================
REMOVE_FROM_CART
========================================

Examples:

"Remove one cake"
"Remove 2 samosas"
"Take one puff out of my cart"

Return:

{
  "intent": "REMOVE_FROM_CART",
  "items": [
    {
      "foodId": "EXACT_MENU_ID",
      "quantity": 1
    }
  ],
  "response": "Removed 1 cake from your cart."
}

========================================
SHOW_CART
========================================

Examples:

"Show my cart"
"What is in my cart?"
"Tell me my cart items"

Return:

{
  "intent": "SHOW_CART",
  "response": "Here are the items in your cart."
}

========================================
CLEAR_CART
========================================

Examples:

"Clear my cart"
"Remove everything"
"Empty my cart"

Return:

{
  "intent": "CLEAR_CART",
  "response": "Your cart has been cleared."
}

========================================
GET_TOTAL
========================================

Examples:

"What's my total?"
"How much do I have to pay?"
"What's the price of my cart?"

Return:

{
  "intent": "GET_TOTAL",
  "response": "Let me check your cart total."
}

========================================
MENU_QUERY
========================================

Examples:

"What food is available?"
"What snacks do you have?"
"Show me the drinks"
"Do you have cake?"
"How much is the cake?"

Return:

{
  "intent": "MENU_QUERY",
  "response": "We currently have cake, samosa and other items available."
}

IMPORTANT:
Only mention food that exists in the provided menu.

========================================
RECOMMEND
========================================

Examples:

"What do you recommend?"
"Suggest something"
"What should I eat?"
"Give me a snack recommendation"

Return:

{
  "intent": "RECOMMEND",
  "response": "I recommend the samosa because it is currently available."
}

Only recommend food that exists in the menu and is available.

========================================
UNKNOWN
========================================

If the command cannot be understood:

{
  "intent": "UNKNOWN",
  "response": "Sorry, I couldn't understand that command."
}

========================================
IMPORTANT RULES
========================================

- Return ONLY JSON.
- Do not use markdown.
- Do not use code fences.
- Never invent food.
- Use exact menu IDs.
- Respect food availability.
- Understand natural language.
- Understand numbers such as one, two, three, four, five, etc.
- Understand Indian English speech variations.
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL || "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;

    let result;

    try {
      result = JSON.parse(text);
    } catch (parseError) {
      console.error("Invalid Gemini JSON:", text);

      return res.status(500).json({
        success: false,
        message: "AI returned an invalid response",
      });
    }

    return res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Gemini AI request failed:", error.name, error.status);

    const status = Number(error.status || error.statusCode);
    const message = status === 429
      ? "AI service is busy. Basic voice cart commands are still available."
      : status === 401 || status === 403
      ? "AI service credentials need to be checked. Basic voice cart commands are still available."
      : "AI processing failed. Basic voice cart commands are still available.";

    return res.status(status === 429 ? 429 : status === 401 || status === 403 ? 503 : 500).json({
      success: false,
      message,
    });
  }
};