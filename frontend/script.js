class LegalChatbot {
    constructor() {
        this.messages = [];
        this.isUrdu = false;
        this.apiURL = "http://localhost:8000/chat"; // Update this if deployed
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadWelcomeMessage();
    }

    bindEvents() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.querySelector('.send-btn');

        sendBtn.addEventListener('click', () => this.sendMessage());
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        messageInput.addEventListener('input', this.autoResizeInput);
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        if (!message) return;

        this.addMessage(message, 'user');
        messageInput.value = '';

        this.addTypingIndicator();

        try {
            const response = await fetch(this.apiURL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: message })
            });

            const data = await response.json();
            this.removeTypingIndicator();
            this.addMessage(data.answer || "Sorry, I couldn’t understand that.", 'assistant');
        } catch (error) {
            console.error("Error fetching AI response:", error);
            this.removeTypingIndicator();
            this.addMessage("Something went wrong. Please try again later.", 'assistant');
        }
    }

    addMessage(text, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-balance-scale"></i>';

        const content = document.createElement('div');
        content.className = 'message-content';

        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.innerHTML = this.formatMessage(text);

        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = this.getCurrentTime();

        content.appendChild(messageText);
        content.appendChild(messageTime);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        chatMessages.appendChild(messageDiv);

        chatMessages.scrollTop = chatMessages.scrollHeight;

        this.messages.push({ text, sender, timestamp: new Date() });
    }

    addTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant-message typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-balance-scale"></i>
            </div>
            <div class="message-content">
                <div class="message-text"><em>Typing...</em></div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    removeTypingIndicator() {
        const typing = document.querySelector('.typing-indicator');
        if (typing) typing.remove();
    }

    formatMessage(text) {
        return text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    loadWelcomeMessage() {
        // Already exists in HTML.
    }

    autoResizeInput(e) {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    }
}

function sendQuickMessage(message) {
    const messageInput = document.getElementById('messageInput');
    messageInput.value = message;
    chatbot.sendMessage();
}

function toggleLanguage() {
    const messageInput = document.getElementById('messageInput');
    chatbot.isUrdu = !chatbot.isUrdu;
    if (chatbot.isUrdu) {
        messageInput.placeholder = 'یہاں اپنا قانونی سوال ٹائپ کریں...';
        messageInput.style.direction = 'rtl';
        messageInput.style.textAlign = 'right';
    } else {
        messageInput.placeholder = 'Type your legal question here...';
        messageInput.style.direction = 'ltr';
        messageInput.style.textAlign = 'left';
    }
}

let chatbot;
document.addEventListener('DOMContentLoaded', () => {
    chatbot = new LegalChatbot();
});
