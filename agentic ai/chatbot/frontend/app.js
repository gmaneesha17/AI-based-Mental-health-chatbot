document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("clarity_token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const chatForm = document.getElementById("chat-form");
    const userInput = document.getElementById("user-input");
    const chatBox = document.getElementById("chat-box");
    const typingIndicator = document.getElementById("typing-indicator");
    const modal = document.getElementById("escalation-modal");
    const closeModalBtn = document.getElementById("close-modal");
    const chatContainer = document.querySelector(".chat-container");
    const logoutBtn = document.getElementById("logout-btn");

    const API_URL = "http://localhost:8000/chat";
    
    let conversationHistory = []; // In-memory session history

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("clarity_token");
            window.location.href = "index.html";
        });
    }

    function appendMessage(sender, text) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", sender);
        
        const contentDiv = document.createElement("div");
        contentDiv.classList.add("message-content");
        contentDiv.textContent = text;
        
        messageDiv.appendChild(contentDiv);
        chatBox.appendChild(messageDiv);
        
        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    async function sendMessage(message) {
        try {
            typingIndicator.classList.remove("hidden");
            chatContainer.scrollTop = chatContainer.scrollHeight;
            
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ message: message, history: conversationHistory })
            });

            if (response.status === 401) {
                localStorage.removeItem("clarity_token");
                window.location.href = "login.html";
                return;
            }

            if (!response.ok) {
                throw new Error("API network error");
            }
            
            const data = await response.json();
            
            // Push user and model to history strictly after successful transmit
            conversationHistory.push({ role: "user", content: message });
            conversationHistory.push({ role: "bot", content: data.reply });
            
            typingIndicator.classList.add("hidden");
            appendMessage("bot", data.reply);
            
            if (data.is_escalated) {
                setTimeout(() => {
                    modal.classList.remove("hidden");
                }, 1000);
            }
        } catch (error) {
            typingIndicator.classList.add("hidden");
            appendMessage("bot", "I'm having trouble connecting to my servers right now. Please try again later. If this is an emergency, please call your local emergency services.");
            console.error("Error:", error);
        }
    }

    chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = userInput.value.trim();
        if (!text) return;
        
        appendMessage("user", text);
        userInput.value = "";
        
        // Small delay to make it feel natural
        setTimeout(() => sendMessage(text), 500);
    });

    closeModalBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
    });
});
