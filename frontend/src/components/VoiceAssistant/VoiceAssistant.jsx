import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../Context/CartContext";
import { Mic, MicOff, Send, Sparkles, Volume2, X } from "lucide-react";
import "./VoiceAssistant.css";

function VoiceAssistant({ menu = [] }) {
  const {
    cart: cartItems,
    addMultipleToCart,
    decreaseQuantity,
    clearCart,
  } = useCart();

  const navigate = useNavigate();

  // ==========================================
  // LATEST CART REF
  // ==========================================

  const cartRef = useRef(cartItems);

  useEffect(() => {
    cartRef.current = cartItems;
  }, [cartItems]);

  // ==========================================
  // STATES
  // ==========================================

  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [command, setCommand] = useState("");

  const recognitionRef = useRef(null);
  const listeningTimeoutRef = useRef(null);
  const receivedSpeechRef = useRef(false);
  const finalSpeechRef = useRef(false);
  const recognitionErrorRef = useRef(false);
  const cancelledListeningRef = useRef(false);

  // ==========================================
  // QUANTITY WORD → NUMBER
  // ==========================================

  const quantityWords = {
    one: 1,
    won: 1,

    two: 2,

    three: 3,

    four: 4,

    five: 5,
    six: 6,
    seven: 7,

    eight: 8,

    nine: 9,
    ten: 10,
  };

  // ==========================================
  // FIND QUANTITY
  // ==========================================

  const getQuantity = (text) => {
    const words = text.toLowerCase().split(/\s+/);

    // Number like "2"
    for (const word of words) {
      if (/^\d+$/.test(word)) {
        return Number(word);
      }
    }

    // Number word
    for (const word of words) {
      if (quantityWords[word]) {
        return quantityWords[word];
      }
    }

    return 1;
  };

  // ==========================================
  // NORMALIZE TEXT
  // ==========================================

  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .replace(/[.,!?]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  // ==========================================
  // FIND FOOD FROM MENU
  // ==========================================

  const findFood = (text) => {
    const normalized = normalizeText(text);

    // Exact food name
    const exactMatch = menu.find((food) => {
      const foodName = normalizeText(food.name);

      return normalized.includes(foodName);
    });

    if (exactMatch) {
      return exactMatch;
    }

    // Partial word matching
    const words = normalized.split(" ");

    let bestMatch = null;
    let bestScore = 0;

    menu.forEach((food) => {
      const foodWords = normalizeText(food.name).split(" ");

      let score = 0;

      foodWords.forEach((foodWord) => {
        words.forEach((word) => {
          if (
            word === foodWord ||
            word.includes(foodWord) ||
            foodWord.includes(word)
          ) {
            if (foodWord.length >= 3) {
              score++;
            }
          }
        });
      });

      if (score > bestScore) {
        bestScore = score;
        bestMatch = food;
      }
    });

    return bestMatch;
  };

  // ==========================================
  // LOCAL ADD TO CART
  // ==========================================

  const localAddToCart = (message) => {
    const text = normalizeText(message);
    const hasAddIntent = /\b(add|want|give|get|buy|order|put|like|need)\b/.test(text);
    const isMenuQuestion = /\b(what|which|show|recommend|suggest|price|cost|how|available|have|menu)\b/.test(text);
    const hasQuantity = /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b/.test(text);
    const matchedFood = findFood(text);

    if (!hasAddIntent && (isMenuQuestion || !matchedFood || !hasQuantity)) {
      return false;
    }

    const addedItems = [];
    const rejectedItems = [];
    const requestedFoods = menu.filter((food) =>
      text.includes(normalizeText(food.name))
    );

    if (requestedFoods.length === 0) {
      if (matchedFood) requestedFoods.push(matchedFood);
    }

    requestedFoods.forEach((food) => {
      const foodName = normalizeText(food.name);
      const exactIndex = text.indexOf(foodName);
      const partialName = foodName
        .split(" ")
        .find((word) => text.includes(word));
      const index = exactIndex >= 0
        ? exactIndex
        : Math.max(0, text.indexOf(partialName || ""));

      const beforeFood = text.substring(
        Math.max(0, index - 25),
        index
      );

      const quantity = getQuantity(beforeFood);
      const stock = Number(food.stock ?? 0);
      const foodId = String(food._id || food.id);
      const currentQuantity = Number(
        cartRef.current.find(
          (item) => String(item.id || item._id) === foodId
        )?.quantity || 0
      );

      if (food.isAvailable === false || stock <= 0) {
        rejectedItems.push(`${food.name} is currently unavailable.`);
        return;
      }

      if (currentQuantity + quantity > stock) {
        rejectedItems.push(`${food.name} has ${Math.max(0, stock - currentQuantity)} available.`);
        return;
      }

      addMultipleToCart(food, quantity);

      addedItems.push({
        name: food.name,
        quantity,
      });
    });

    if (addedItems.length === 0) {
      if (rejectedItems.length > 0) {
        setAiResponse(rejectedItems[0]);
        return true;
      }
      return false;
    }

    const response = addedItems
      .map(
        (item) =>
          `${item.quantity} ${item.name}`
      )
      .join(" and ");

    setAiResponse(
      `Added ${response} to your cart.`
    );

    setTimeout(() => {
      navigate("/cart");
    }, 700);

    return true;
  };

  // ==========================================
  // LOCAL REMOVE FROM CART
  // ==========================================

  const localRemoveFromCart = (message) => {
    const text = normalizeText(message);

    if (!/\b(remove|delete|take out|cancel)\b/.test(text)) {
      return false;
    }

    // IMPORTANT:
    // Always use latest cart
    const latestCart = cartRef.current;

    let removedSomething = false;

    menu.forEach((food) => {
      const foodName = normalizeText(food.name);

      if (!text.includes(foodName)) {
        return;
      }

      const cartItem = latestCart.find(
        (item) =>
          normalizeText(item.name) === foodName
      );

      if (!cartItem) {
        return;
      }

      const index = text.indexOf(foodName);

      const beforeFood = text.substring(
        Math.max(0, index - 25),
        index
      );

      const quantity = getQuantity(beforeFood);

      const removeCount = Math.min(
        quantity,
        Number(cartItem.quantity)
      );

      for (let i = 0; i < removeCount; i++) {
          decreaseQuantity(cartItem.id || cartItem._id);
      }

      removedSomething = true;
    });

    if (!removedSomething) {
      setAiResponse(
        "That item is not in your cart."
      );

      return true;
    }

    setAiResponse(
      "The item has been removed from your cart."
    );

    return true;
  };

  // ==========================================
  // LOCAL CART COMMANDS
  // ==========================================

  const handleLocalCommand = (message) => {
    const text = normalizeText(message);

    if (/\b(recommend|suggest|what should i eat|what do you recommend)\b/.test(text)) {
      const availableFoods = menu.filter(
        (food) => food.isAvailable !== false && Number(food.stock) > 0
      );
      const recommendation = availableFoods[0];

      setAiResponse(
        recommendation
          ? `I recommend ${recommendation.name} for ₹${recommendation.price}. ${recommendation.stock} portions are available.`
          : "There are no available dishes to recommend right now."
      );
      return true;
    }

    // ========================================
    // SHOW CART
    // ========================================

    if (
      text.includes("show my cart") ||
      text.includes("show cart") ||
      text.includes("what is in my cart") ||
      text.includes("whats in my cart") ||
      text.includes("what's in my cart") ||
      text.includes("cart items") ||
      text.includes("view cart")
    ) {
      // IMPORTANT:
      // Get latest cart
      const latestCart = cartRef.current;

      if (!latestCart || latestCart.length === 0) {
        setAiResponse("Your cart is empty.");
        return true;
      }

      const itemsText = latestCart
        .map(
          (item) =>
            `${item.name} × ${item.quantity}`
        )
        .join(", ");

      setAiResponse(
        `Your cart has: ${itemsText}.`
      );

      return true;
    }

    // ========================================
    // TOTAL
    // ========================================

    if (
      text.includes("cart total") ||
      text.includes("total price") ||
      text.includes("how much") ||
      text.includes("total amount") ||
      text === "total" ||
      text.includes("what is the total")
    ) {
      const latestCart = cartRef.current;

      const latestTotal = latestCart.reduce(
        (total, item) =>
          total +
          Number(item.price) *
            Number(item.quantity || 0),
        0
      );

      setAiResponse(
        `Your current cart total is ₹${latestTotal.toFixed(
          0
        )}.`
      );

      return true;
    }

    // ========================================
    // CLEAR CART
    // ========================================

    if (
      text.includes("clear my cart") ||
      text.includes("empty my cart") ||
      text.includes("clear cart") ||
      text.includes("remove everything")
    ) {
      const latestCart = cartRef.current;

      if (
        !latestCart ||
        latestCart.length === 0
      ) {
        setAiResponse(
          "Your cart is already empty."
        );

        return true;
      }

      clearCart();

      setAiResponse(
        "Your cart has been cleared."
      );

      return true;
    }

    const requestedFood = findFood(text);
    const isMenuQuestion =
      text === "menu" ||
      /\b(menu|available|what food|what snacks|what drinks|do you have|price|cost|how much)\b/.test(text);

    if (isMenuQuestion) {
      const availableFoods = menu.filter(
        (food) => food.isAvailable !== false && Number(food.stock) > 0
      );

      if (requestedFood) {
        const available = requestedFood.isAvailable !== false && Number(requestedFood.stock) > 0;
        setAiResponse(
          `${requestedFood.name} costs ₹${requestedFood.price} and is ${available ? `available (${requestedFood.stock} portions)` : "currently unavailable"}.`
        );
      } else if (availableFoods.length > 0) {
        const menuSummary = availableFoods
          .slice(0, 6)
          .map((food) => `${food.name} (₹${food.price})`)
          .join(", ");
        setAiResponse(`Available now: ${menuSummary}${availableFoods.length > 6 ? ", and more" : ""}.`);
      } else {
        setAiResponse("There are no dishes available to order right now.");
      }

      return true;
    }

    // ========================================
    // REMOVE
    // ========================================

    if (localRemoveFromCart(message)) {
      return true;
    }

    // ========================================
    // ADD
    // ========================================

    if (localAddToCart(message)) {
      return true;
    }

    return false;
  };

  // ==========================================
  // START VOICE RECOGNITION
  // ==========================================

  const startListening = () => {
    setIsOpen(true);
    setUserText("");
    setAiResponse("");

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setAiResponse(
        "Voice recognition is not supported in this browser."
      );

      return;
    }

    let recognition;
    try {
      recognition = new SpeechRecognition();
    } catch {
      setAiResponse("Couldn't start voice input. Check microphone permissions, or type a command below.");
      return;
    }

    receivedSpeechRef.current = false;
    finalSpeechRef.current = false;
    recognitionErrorRef.current = false;
    cancelledListeningRef.current = false;

    recognition.lang = "en-IN";

    recognition.continuous = false;

    recognition.interimResults = true;

    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setListening(true);
      listeningTimeoutRef.current = window.setTimeout(() => {
        if (recognitionRef.current === recognition) {
          setAiResponse("I didn't hear anything. Type a command below.");
          recognition.stop();
        }
      }, 10000);
    };

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();

      if (!text) {
        return;
      }

      receivedSpeechRef.current = true;
      setUserText(text);
      const latestResult = event.results[event.results.length - 1];
      if (!latestResult?.isFinal) {
        setAiResponse("");
        return;
      }

      finalSpeechRef.current = true;
      window.clearTimeout(listeningTimeoutRef.current);
      setListening(false);
      void sendToAI(text);
    };

    recognition.onerror = (event) => {
      recognitionErrorRef.current = true;
      window.clearTimeout(listeningTimeoutRef.current);
      console.error(
        "Speech recognition error:",
        event.error
      );

      setListening(false);

      const messages = {
        "not-allowed": "Allow microphone access in your browser, or type a command below.",
        "service-not-allowed": "Speech recognition is blocked by this browser. You can type a command instead.",
        "no-speech": "I didn't hear anything. Try again or type a command.",
        network: "Speech recognition needs a network connection. You can type a command below.",
      };
      setAiResponse(messages[event.error] || "Voice input failed. Try again or type a command.");
    };

    recognition.onend = () => {
      window.clearTimeout(listeningTimeoutRef.current);
      setListening(false);
      if (!receivedSpeechRef.current && !recognitionErrorRef.current) {
        setAiResponse(
          cancelledListeningRef.current
            ? "Voice input stopped. Type a command below."
            : "No speech detected. Type a command below."
        );
      } else if (receivedSpeechRef.current && !finalSpeechRef.current) {
        setAiResponse("I heard part of that. Please try again or send it using the text field.");
      }
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      window.clearTimeout(listeningTimeoutRef.current);
      recognitionRef.current = null;
      setListening(false);
      setAiResponse("Couldn't start the microphone. Try again or type a command.");
    }
  };

  const stopListening = () => {
    cancelledListeningRef.current = true;
    window.clearTimeout(listeningTimeoutRef.current);
    recognitionRef.current?.stop();
    setListening(false);
    setAiResponse("Voice input stopped. Type a command below.");
  };

  // ==========================================
  // SEND COMMAND TO GEMINI
  // ==========================================

  const sendToAI = async (message) => {
    const normalizedMessage = message.trim();
    if (!normalizedMessage) return;

    setIsOpen(true);
    setUserText(normalizedMessage);

    if (handleLocalCommand(normalizedMessage)) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10000);

    try {
      setAiResponse("🤖 Thinking...");

      const response = await fetch(
        "http://localhost:5000/api/ai/assistant",
        {
          method: "POST",
          signal: controller.signal,

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            message: normalizedMessage,
            menu,
          }),
        }
      );

      const data = await response.json();

      // ======================================
      // GEMINI QUOTA EXCEEDED
      // ======================================

      if (response.status === 429) {
        console.warn(
          "⚠️ Gemini quota exceeded. Using local parser."
        );

        setAiResponse("AI service is busy. Please try again in a moment.");
        return;
      }

      // ======================================
      // API ERROR
      // ======================================

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "AI request failed"
        );
      }

      const result = data.result;

      console.log(
        "🤖 Gemini result:",
        result
      );

      await handleAIResult(result);
    } catch (error) {
      console.error(
        "AI error:",
        error
      );
      if (handleLocalCommand(normalizedMessage)) {
        return;
      }
      setAiResponse(
        error.name === "AbortError"
          ? "That took too long. Please try again."
          : error instanceof TypeError
          ? "I couldn't reach the assistant service. Check your connection and try again."
          : error.message || "I couldn't process that command. Please try again."
      );
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  const handleTextCommand = (event) => {
    event.preventDefault();
    const text = command.trim();
    if (!text || isThinking) return;
    setCommand("");
    void sendToAI(text);
  };

  const readResponseAloud = () => {
    if (!aiResponse || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(aiResponse);
    utterance.lang = "en-IN";
    window.speechSynthesis.speak(utterance);
  };

  // ==========================================
  // HANDLE GEMINI RESULT
  // ==========================================

  const handleAIResult = async (result) => {
    if (
      !result ||
      !result.intent
    ) {
      setAiResponse(
        "Sorry, I couldn't understand that."
      );

      return;
    }

    // ========================================
    // ADD TO CART
    // ========================================

    if (
      result.intent ===
      "ADD_TO_CART"
    ) {
      let addedSomething = false;

      for (
        const item of result.items || []
      ) {
        const food = menu.find(
          (foodItem) =>
            String(
              foodItem._id ||
                foodItem.id
            ) ===
            String(item.foodId)
        );

        if (!food) {
          continue;
        }

        const quantity =
          Number(item.quantity) || 1;

        const stock = Number(food.stock ?? 0);
        if (food.isAvailable === false || stock <= 0) {
          continue;
        }

        const foodId = String(food._id || food.id);
        const currentQuantity = Number(
          cartRef.current.find(
            (cartFood) => String(cartFood.id || cartFood._id) === foodId
          )?.quantity || 0
        );

        if (currentQuantity + quantity > stock) {
          setAiResponse(
            `${food.name} only has ${Math.max(0, stock - currentQuantity)} available.`
          );

          continue;
        }

        addMultipleToCart(
          food,
          quantity
        );

        addedSomething = true;
      }

      if (addedSomething) {
        setAiResponse(
          result.response ||
            "Added items to your cart."
        );

        setTimeout(() => {
          navigate("/cart");
        }, 700);
      } else {
        setAiResponse(
          "Sorry, those items are currently unavailable."
        );
      }

      return;
    }

    // ========================================
    // REMOVE FROM CART
    // ========================================

    if (
      result.intent ===
      "REMOVE_FROM_CART"
    ) {
      // IMPORTANT:
      // Always use latest cart
      const latestCart =
        cartRef.current;

      let removedSomething =
        false;

      for (
        const item of result.items || []
      ) {
        const foodId =
          String(item.foodId);

        const quantity =
          Number(item.quantity) || 1;

        const cartItem =
          latestCart.find(
            (cartFood) =>
              String(
                cartFood.id
              ) === foodId ||
              String(
                cartFood._id
              ) === foodId
          );

        if (!cartItem) {
          continue;
        }

        const removeCount =
          Math.min(
            quantity,
            Number(
              cartItem.quantity
            )
          );

        for (
          let i = 0;
          i < removeCount;
          i++
        ) {
          decreaseQuantity(
            cartItem.id
          );
        }

        removedSomething =
          true;
      }

      setAiResponse(
        removedSomething
          ? result.response ||
              "Item removed from your cart."
          : "That item is not in your cart."
      );
      setTimeout(() => {
          navigate("/cart");
        }, 700)

      return;
    }

    // ========================================
    // SHOW CART
    // ========================================

    if (
      result.intent ===
      "SHOW_CART"
    ) {
      // IMPORTANT:
      // Use latest cart state
      const latestCart =
        cartRef.current;

      if (
        !latestCart ||
        latestCart.length === 0
      ) {
        setAiResponse(
          "Your cart is empty."
        );

        return;
      }

      const itemsText =
        latestCart
          .map(
            (item) =>
              `${item.name} × ${item.quantity}`
          )
          .join(", ");
      setTimeout(() => {
          navigate("/cart");
        }, 700)

      setAiResponse(
        `Your cart has: ${itemsText}.`
      );

      return;
    }

    // ========================================
    // CLEAR CART
    // ========================================

    if (
      result.intent ===
      "CLEAR_CART"
    ) {
      const latestCart =
        cartRef.current;

      if (
        !latestCart ||
        latestCart.length === 0
      ) {
        setAiResponse(
          "Your cart is already empty."
        );
        setTimeout(() => {
          navigate("/cart");
        }, 700)

        return;
      }

      clearCart();

      setAiResponse(
        result.response ||
          "Your cart has been cleared."
      );

      return;
    }

    // ========================================
    // GET TOTAL
    // ========================================

    if (
      result.intent ===
      "GET_TOTAL"
    ) {
      const latestCart =
        cartRef.current;

      const latestTotal =
        latestCart.reduce(
          (total, item) =>
            total +
            Number(item.price) *
              Number(
                item.quantity || 0
              ),
          0
        );

      setAiResponse(
        `Your current cart total is ₹${latestTotal.toFixed(
          0
        )}.`
      );

      return;
    }

    // ========================================
    // MENU QUERY
    // ========================================

    if (
      result.intent ===
      "MENU_QUERY"
    ) {
      setAiResponse(
        result.response ||
          "Here are the available items on today's menu."
      );

      return;
    }

    // ========================================
    // RECOMMEND
    // ========================================

    if (
      result.intent ===
      "RECOMMEND"
    ) {
      setAiResponse(
        result.response ||
          "I recommend something currently available from today's menu."
      );

      return;
    }

    // ========================================
    // UNKNOWN
    // ========================================

    setAiResponse(
      result.response ||
        "Sorry, I couldn't understand that."
    );
  };

  // ==========================================
  // UI
  // UI PRESENTATION LOGIC
  // ==========================================

  const isThinking = aiResponse === "🤖 Thinking...";
  const isSuccess =
    aiResponse &&
    (aiResponse.toLowerCase().includes("added") ||
      aiResponse.toLowerCase().includes("removed") ||
      aiResponse.toLowerCase().includes("cleared"));
  const isWarningOrError =
    aiResponse &&
    (aiResponse.toLowerCase().includes("only has") ||
      aiResponse.toLowerCase().includes("unavailable") ||
      aiResponse.toLowerCase().includes("couldn't") ||
      aiResponse.toLowerCase().includes("sorry") ||
      aiResponse.toLowerCase().includes("not in your cart") ||
      aiResponse.toLowerCase().includes("limit reached"));
  const suggestionFood = menu.find(
    (food) => food.isAvailable !== false && Number(food.stock) > 0
  );

  return (
    <aside className="voice-assistant-root" aria-label="AI Voice Ordering Assistant">
      {/* FLOATING DIALOGUE CARD */}
      {isOpen && (
        <div className="voice-dialogue-card" role="dialog" aria-live="polite">
          <div className="dialogue-header">
            <div className="dialogue-brand">
              <span className="ai-sparkle-badge"><Sparkles size={16} aria-hidden="true" /></span>
              <div>
                <strong>canteenX Voice Assistant</strong>
                <small className="dialogue-status-text">
                  {listening
                    ? "Listening..."
                    : isThinking
                    ? "Thinking..."
                    : "Ready when you are"}
                </small>
              </div>
            </div>

            <button
              type="button"
              className="dialogue-close-btn"
              onClick={() => {
                if (listening) stopListening();
                setIsOpen(false);
              }}
              title="Close Voice Assistant"
              aria-label="Close Voice Assistant"
            >
              <X size={17} aria-hidden="true" />
            </button>
          </div>

          <div className="dialogue-body">
            {/* LIVE EQUALIZER ANIMATION WHEN LISTENING */}
            {listening && (
              <div className="voice-equalizer-wrap">
                <div className="equalizer-bar bar-1"></div>
                <div className="equalizer-bar bar-2"></div>
                <div className="equalizer-bar bar-3"></div>
                <div className="equalizer-bar bar-4"></div>
                <div className="equalizer-bar bar-5"></div>
                <span className="listening-prompt">Speak a command, or type it below.</span>
              </div>
            )}

            {/* USER SPEECH TRANSCRIPT */}
            {userText && (
              <div className="transcript-bubble user-bubble">
                <span className="bubble-label">You said:</span>
                <p className="bubble-text">"{userText}"</p>
              </div>
            )}

            {/* AI THINKING STATE */}
            {isThinking && (
              <div className="ai-thinking-state">
                <div className="thinking-spinner"></div>
                <span>Processing your voice command...</span>
              </div>
            )}

            {/* AI RESPONSE */}
            {aiResponse && !isThinking && (
              <div
                className={`transcript-bubble ai-bubble ${
                  isSuccess
                    ? "response-success"
                    : isWarningOrError
                    ? "response-warning"
                    : ""
                }`}
              >
                <div className="ai-bubble-header">
                  <span className="bubble-label"><Sparkles size={14} aria-hidden="true" /> canteenX Assistant</span>
                  {isSuccess && <span className="status-indicator-tag success">✓ Success</span>}
                  {isWarningOrError && <span className="status-indicator-tag warning">Notice</span>}
                </div>
                <p className="bubble-text">{aiResponse}</p>
                <button
                  type="button"
                  className="voice-read-button"
                  onClick={readResponseAloud}
                  title="Read response aloud"
                  aria-label="Read response aloud"
                >
                  <Volume2 size={15} aria-hidden="true" />
                  Read aloud
                </button>
              </div>
            )}

            {/* HELPFUL SUGGESTION HINTS */}
            {!listening && !isThinking && (
              <div className="voice-hints">
                <span className="hints-title">Try a command</span>
                <div className="hints-chips">
                  {suggestionFood && (
                    <button
                      type="button"
                      className="hint-chip"
                      onClick={() => void sendToAI(`Add 1 ${suggestionFood.name}`)}
                    >
                      Add 1 {suggestionFood.name}
                    </button>
                  )}
                  <button
                    type="button"
                    className="hint-chip"
                    onClick={() => void sendToAI("Show my cart")}
                  >
                    Show my cart
                  </button>
                </div>
              </div>
            )}

            <form className="voice-command-form" onSubmit={handleTextCommand}>
              <input
                type="text"
                value={command}
                onChange={(event) => setCommand(event.target.value)}
                placeholder="Type a food or cart command"
                aria-label="Type a canteen command"
              />
              <button
                type="submit"
                disabled={!command.trim() || isThinking}
                title="Send command"
                aria-label="Send command"
              >
                <Send size={16} aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FLOATING ACTION BUTTON WITH PULSE WAVES */}
      <div className="voice-fab-container">
        {listening && (
          <>
            <div className="soundwave-ring ring-1"></div>
            <div className="soundwave-ring ring-2"></div>
            <div className="soundwave-ring ring-3"></div>
          </>
        )}

        <button
          type="button"
          className={`voice-fab ${listening ? "is-listening" : ""} ${
            isThinking ? "is-thinking" : ""
          }`}
          onClick={() => listening ? stopListening() : startListening()}
          title={listening ? "Stop listening" : "Start a voice command"}
          aria-label={listening ? "Stop listening" : "Start a voice command"}
        >
          <span className="fab-icon">
            {listening ? <MicOff size={17} aria-hidden="true" /> : <Mic size={17} aria-hidden="true" />}
          </span>
          <span className="fab-label">
            {listening ? "Stop listening" : "Voice or text"}
          </span>
        </button>
      </div>
    </aside>
  );
}

export default VoiceAssistant;