// --- Configuration ---
const _config = {
    openAI_api: "https://alcuino-chatbot.azurewebsites.net/api/OpenAIProxy",
    openAI_model: "gpt-4o-mini",
    ai_instruction: "You are Pixel, a helpful playful AI assistant.",
    response_id: ""
};

let chatHistory = [{ role: "system", content: _config.ai_instruction }];

// DOM
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const splashRobot = document.querySelector(".splash-robot");
const chatRobot = document.querySelector(".chat-robot");

// Splash Screen Logic
document.addEventListener("DOMContentLoaded", () => {
  const getStartedBtn = document.querySelector(".get-started-btn");
  const splashScreen = document.getElementById("splash-screen");
  const mainContent = document.getElementById("main-content");

  getStartedBtn.addEventListener("click", () => {
    getStartedBtn.disabled = true;

    splashScreen.style.opacity = "0";
    splashRobot.style.opacity = "0";

    setTimeout(() => {
      splashScreen.classList.add("hidden");
      splashRobot.classList.add("hidden");   // Hide splash robot
      chatRobot.classList.remove("hidden");  //  Show chat robot
      mainContent.classList.remove("hidden");
      userInput.focus();
    }, 350);
  });
});

// Chat Functions
function addMessage(role, htmlContent) {
  const msg = document.createElement("div");
  msg.classList.add("message", role === "user" ? "user" : "bot");
  msg.innerHTML = htmlContent;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}

function markdownToHtml(text) {
  if (!text) return "";
  return text.replace(/\n/g, "<br>")
             .replace(/(\*\*|__)(.*?)\1/g, "<strong>$2</strong>")
             .replace(/(\*|_)(.*?)\1/g, "<em>$2</em>");
}

async function sendToAI(text) {
  const data = await fetch(_config.openAI_api, {
    method: "POST",
    body: JSON.stringify({
      model: _config.openAI_model,
      input: text,
      instructions: _config.ai_instruction
    })
  });

  const res = await data.json();
  return res.output[0].content[0].text;
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  userInput.value = "";
  addMessage("user", text);

  const typing = addMessage("bot",
    `<div class="typing-indicator"><span></span><span></span><span></span></div>`
  );

  userInput.disabled = true;
  sendBtn.disabled = true;

  try {
    const response = await sendToAI(text);
    typing.innerHTML = markdownToHtml(response);
  } catch {
    typing.innerHTML = `<span style="color:red;">Error</span>`;
  }

  userInput.disabled = false;
  sendBtn.disabled = false;
  userInput.focus();
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) sendMessage();
});
