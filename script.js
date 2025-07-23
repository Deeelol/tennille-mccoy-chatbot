// ✅ INSERT YOUR HUGGING FACE TOKEN HERE
const HF_TOKEN = "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";

// ✅ BlenderBot endpoint
const MODEL_URL = "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill";

// ✅ Context with Tennille's FAQ for better answers
const TENNILLE_CONTEXT = `
You are Tennille McCoy's virtual assistant. 
Tennille McCoy is a New Jersey public official committed to community development, youth empowerment, and public service. 
Mission: improve access to resources, support education, and enhance community engagement.

FAQ:
- Who is Tennille McCoy? → She is a leader dedicated to empowering communities in New Jersey.
- What is her mission? → Strengthening local communities through education, inclusion, and public programs.
- What initiatives does she support? → Youth programs, community development, and public health awareness.
- How can I contact her office? → You can visit the official website or reach out via public contact forms.

Always answer politely and concisely. If unsure, encourage users to visit Tennille McCoy’s official page.
`;

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// ✅ Helper function to add a message to the chat
function addMessage(message, sender) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add(sender === "bot" ? "bot-message" : "user-message");
  msgDiv.textContent = message;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ✅ Send message to Hugging Face API
async function askBot(question) {
  addMessage(question, "user");

  try {
    const response = await fetch(MODEL_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: `${TENNILLE_CONTEXT}\nUser: ${question}\nAssistant:`
      })
    });

    const data = await response.json();
    console.log("HF Response:", data);

    // ✅ Handle "model is loading" case
    if (data.error && data.error.includes("loading")) {
      addMessage("⏳ The assistant is waking up… please try again in a few seconds.", "bot");
      return;
    }

    // ✅ Hugging Face returns an array of generated_text
    if (Array.isArray(data) && data[0]?.generated_text) {
      addMessage(data[0].generated_text.trim(), "bot");
    } else {
      addMessage("⚠️ Sorry, I couldn’t get a response. Please try again.", "bot");
    }

  } catch (error) {
    console.error("API error:", error);
    addMessage("❌ There was an error connecting to the assistant.", "bot");
  }
}

// ✅ Event listener for Send button
sendBtn.addEventListener("click", () => {
  const message = userInput.value.trim();
  if (message) {
    askBot(message);
    userInput.value = "";
  }
});

// ✅ Allow Enter key to send message
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});
