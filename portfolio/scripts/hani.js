// HANI AI Assistant Controller
class HANIController {
    constructor() {
        this.isAIMode = false;
        this.isResearchMode = false;
        this.conversationHistory = [];
        this.isProcessing = false;
        this.init();
    }

    init() {
        const aiModeToggle = document.getElementById('aiModeToggle');
        const aiCloseBtn = document.getElementById('aiCloseBtn');
        const aiInput = document.getElementById('aiInput');
        const aiSendBtn = document.getElementById('aiSendBtn');
        const aiBody = document.getElementById('aiBody');

        // Toggle AI mode
        aiModeToggle.addEventListener('click', () => {
            this.toggleAIMode();
        });

        // Close AI mode
        aiCloseBtn.addEventListener('click', () => {
            this.toggleAIMode();
        });

        // Send message on Enter
        aiInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Send message on button click
        aiSendBtn.addEventListener('click', () => {
            this.sendMessage();
        });

        // Focus input when clicking on chat body
        aiBody.addEventListener('click', () => {
            aiInput.focus();
        });

        // Research mode toggle
        const researchModeToggle = document.getElementById('researchModeToggle');
        researchModeToggle.addEventListener('click', () => {
            this.toggleResearchMode();
        });

        // Initialize UI state
        this.updateResearchModeUI();
    }

    toggleAIMode() {
        this.isAIMode = !this.isAIMode;
        document.body.classList.toggle('ai-mode', this.isAIMode);
        
        if (this.isAIMode) {
            const aiInput = document.getElementById('aiInput');
            setTimeout(() => aiInput.focus(), 100);
        } else {
            // Reset conversation and research mode when closing
            this.conversationHistory = [];
            this.isResearchMode = false;
            this.updateResearchModeUI();
        }
    }

    toggleResearchMode() {
        this.isResearchMode = !this.isResearchMode;
        this.updateResearchModeUI();
        
        // Clear conversation history when switching modes
        this.conversationHistory = [];
        
        // Update welcome message
        this.updateWelcomeMessage();
        
        // Update placeholder
        const aiInput = document.getElementById('aiInput');
        if (this.isResearchMode) {
            aiInput.placeholder = "Ask HANI about Tech, AI, or Dhananjay's resume...";
        } else {
            aiInput.placeholder = "Ask HANI about Dhananjay's resume...";
        }
    }

    updateResearchModeUI() {
        const toggle = document.getElementById('researchModeToggle');
        const subtitle = document.getElementById('aiSubtitle');
        
        if (this.isResearchMode) {
            toggle.classList.add('active');
            subtitle.textContent = 'Research Mode - Tech & AI';
        } else {
            toggle.classList.remove('active');
            subtitle.textContent = 'Resume Mode';
        }
    }

    updateWelcomeMessage() {
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage) {
            if (this.isResearchMode) {
                welcomeMessage.querySelector('.ai-message-text').innerHTML = `
                    Hello! I'm <strong>HANI</strong>, Dhananjay's AI assistant.
                    <br><br>
                    <strong>Mode: Research</strong> - I can now answer questions about:
                    <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                        <li>Technology and AI topics</li>
                        <li>Dhananjay's resume, experience, skills, and projects</li>
                    </ul>
                    <br>
                    Ask me anything about Tech, AI, or Dhananjay's professional background!
                `;
            } else {
                welcomeMessage.querySelector('.ai-message-text').innerHTML = `
                    Hello! I'm <strong>HANI</strong>, Dhananjay's AI assistant. I can answer questions about Dhananjay's resume, experience, skills, projects, and background.
                    <br><br>
                    <strong>Mode: Resume Only</strong> - Ask me anything related to his professional profile!
                    <br><br>
                    Toggle <strong>Research Mode</strong> to also discuss Tech and AI topics.
                `;
            }
        }
    }

    async sendMessage() {
        const aiInput = document.getElementById('aiInput');
        const message = aiInput.value.trim();

        if (!message || this.isProcessing) return;

        // Check if API key is configured
        if (!CONFIG.GEMINI_API_KEY || CONFIG.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            this.addMessage('error', 'Please configure your Gemini API key in config.js file. Get your API key from https://aistudio.google.com/app/apikey');
            return;
        }

        // Add user message
        this.addMessage('user', message);
        aiInput.value = '';
        this.isProcessing = true;
        this.updateSendButton(true);

        // Add loading indicator
        const loadingId = this.addLoadingMessage();

        try {
            // Check if question is allowed based on current mode
            const isAllowed = this.isQuestionAllowed(message);
            
            if (!isAllowed) {
                this.removeMessage(loadingId);
                if (this.isResearchMode) {
                    this.addMessage('assistant', "I'm sorry, but I can only answer questions related to Technology, AI, or Dhananjay's resume, experience, skills, projects, and professional background. Please ask me something about Tech, AI, or his work.");
                } else {
                    this.addMessage('assistant', "I'm sorry, but I can only answer questions related to Dhananjay's resume, experience, skills, projects, and professional background. Please ask me something about his work or qualifications. Toggle Research Mode to discuss Tech and AI topics.");
                }
                this.isProcessing = false;
                this.updateSendButton(false);
                return;
            }

            // Call Gemini API
            const response = await this.callGemini(message);
            this.removeMessage(loadingId);
            this.addMessage('assistant', response);
        } catch (error) {
            this.removeMessage(loadingId);
            console.error('Error calling Gemini:', error);
            this.addMessage('error', `Sorry, I encountered an error: ${error.message}. Please check your API key and try again.`);
        } finally {
            this.isProcessing = false;
            this.updateSendButton(false);
            aiInput.focus();
        }
    }

    isQuestionAllowed(message) {
        const lowerMessage = message.toLowerCase();
        
        // Resume-related keywords (always allowed)
        const resumeKeywords = [
            'dhananjay', 'resume', 'cv', 'experience', 'work', 'job', 'position', 'role',
            'education', 'degree', 'iit', 'bombay', 'skills', 'projects', 'project',
            'doaz', 'team rakshak', 'ai engineer', 'engineer', 'geotechnical', 'metadraw',
            'qualification', 'background', 'expertise', 'specialization', 'research',
            'inscanner', 'paper', 'publication', 'linkedin', 'contact', 'email',
            'whatsapp', 'location', 'delhi', 'south korea', 'seoul', 'mumbai',
            'certification', 'course', 'training', 'mentor', 'team', 'lead',
            'achievement', 'accomplishment', 'responsibility', 'duty', 'task'
        ];

        // Tech and AI keywords (only allowed in research mode)
        const techAIKeywords = [
            'ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning',
            'neural network', 'transformer', 'llm', 'large language model', 'gpt',
            'computer vision', 'nlp', 'natural language processing', 'rag',
            'retrieval augmented generation', 'yolo', 'pytorch', 'tensorflow',
            'python', 'programming', 'coding', 'algorithm', 'data structure',
            'software engineering', 'technology', 'tech', 'innovation',
            'model training', 'fine-tuning', 'embedding', 'vector database',
            'api', 'framework', 'library', 'open source', 'github',
            'cloud computing', 'aws', 'docker', 'kubernetes', 'devops',
            'data science', 'analytics', 'big data', 'database', 'sql',
            'frontend', 'backend', 'full stack', 'web development',
            'architecture', 'system design', 'scalability', 'performance',
            'optimization', 'best practice', 'tutorial', 'guide', 'how to',
            'explain', 'what is', 'difference between', 'compare', 'vs',
            'trend', 'future', 'latest', 'new', 'update', 'version'
        ];

        // Check if message is resume-related
        const isResumeRelated = resumeKeywords.some(keyword => lowerMessage.includes(keyword));
        
        // If in research mode, also allow tech/AI questions
        if (this.isResearchMode) {
            const isTechAIRelated = techAIKeywords.some(keyword => lowerMessage.includes(keyword));
            return isResumeRelated || isTechAIRelated;
        }
        
        // In normal mode, only resume-related questions are allowed
        return isResumeRelated;
    }

    async callGemini(userMessage) {
        let systemInstruction;
        
        if (this.isResearchMode) {
            systemInstruction = `You are HANI, Dhananjay Agnihotri's AI assistant. You are currently in RESEARCH MODE.

YOUR CAPABILITIES:
1. Answer questions about Technology and AI topics (machine learning, deep learning, computer vision, LLMs, programming, software engineering, etc.)
2. Answer questions about Dhananjay's resume, professional experience, skills, projects, education, and background
3. Provide technical explanations, comparisons, and insights related to Tech and AI

IMPORTANT RULES:
1. You can discuss Technology and AI topics in general
2. You can discuss Dhananjay's professional information
3. If asked about anything unrelated to Tech, AI, or Dhananjay's resume, politely decline and say "I can only answer questions related to Technology, AI, or Dhananjay's resume, experience, skills, projects, and professional background."
4. Be friendly, professional, and concise
5. When discussing Tech/AI topics, provide accurate and helpful information
6. Use the following resume information when answering questions about Dhananjay:

${RESUME_CONTEXT}

Remember: You are HANI in Research Mode. You can discuss Tech, AI, and Dhananjay's professional information.`;
        } else {
            systemInstruction = `You are HANI, Dhananjay Agnihotri's AI assistant. You are currently in RESUME MODE.

YOUR CAPABILITIES:
1. Answer questions ONLY about Dhananjay's resume, professional experience, skills, projects, education, and background

IMPORTANT RULES:
1. You MUST only answer questions related to Dhananjay's resume and professional profile
2. If asked about anything unrelated to Dhananjay's resume (including general Tech/AI topics), politely decline and say "I can only answer questions related to Dhananjay's resume, experience, skills, projects, and professional background. Toggle Research Mode to discuss Tech and AI topics."
3. Be friendly, professional, and concise
4. Use the following resume information to answer questions:

${RESUME_CONTEXT}

Remember: You are HANI in Resume Mode. You only discuss Dhananjay's professional information.`;
        }

        // Build conversation for Gemini
        // Gemini uses a different format - we build the full prompt with system instruction and conversation history
        let conversationText = '';
        if (this.conversationHistory.length > 0) {
            conversationText = '\n\nPrevious conversation:\n' + 
                this.conversationHistory.map(m => 
                    `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
                ).join('\n\n');
        }

        const fullPrompt = `${systemInstruction}${conversationText}\n\nUser: ${userMessage}\n\nAssistant:`;

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: fullPrompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 500,
                    topP: 0.8,
                    topK: 40
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error?.message || `API error: ${response.status}`;
            throw new Error(errorMessage);
        }

        const data = await response.json();
        
        // Extract the response text from Gemini's response format
        let assistantMessage;
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            assistantMessage = data.candidates[0].content.parts[0].text.trim();
        } else if (data.candidates && data.candidates[0] && data.candidates[0].finishReason) {
            // Handle cases where response might be blocked
            if (data.candidates[0].finishReason === 'SAFETY') {
                throw new Error('Response was blocked by safety filters. Please try rephrasing your question.');
            }
            throw new Error('Unexpected response format from Gemini API');
        } else {
            throw new Error('Unexpected response format from Gemini API');
        }

        // Update conversation history
        this.conversationHistory.push({ role: 'user', content: userMessage });
        this.conversationHistory.push({ role: 'assistant', content: assistantMessage });

        // Keep conversation history manageable (last 10 messages)
        if (this.conversationHistory.length > 10) {
            this.conversationHistory = this.conversationHistory.slice(-10);
        }

        return assistantMessage;
    }

    addMessage(type, text) {
        const aiBody = document.getElementById('aiBody');
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ai-${type}`;
        
        if (type === 'user') {
            messageDiv.innerHTML = `
                <div class="ai-message-content">
                    <div class="ai-message-text">${this.escapeHtml(text)}</div>
                </div>
            `;
        } else if (type === 'assistant') {
            messageDiv.innerHTML = `
                <div class="ai-message-avatar">🤖</div>
                <div class="ai-message-content">
                    <div class="ai-message-text">${this.formatMessage(text)}</div>
                </div>
            `;
        } else if (type === 'error') {
            messageDiv.innerHTML = `
                <div class="ai-message-avatar">⚠️</div>
                <div class="ai-message-content">
                    <div class="ai-message-text ai-error">${this.escapeHtml(text)}</div>
                </div>
            `;
        }

        aiBody.appendChild(messageDiv);
        aiBody.scrollTop = aiBody.scrollHeight;
        
        return messageDiv;
    }

    addLoadingMessage() {
        const aiBody = document.getElementById('aiBody');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'ai-message ai-assistant ai-loading';
        messageDiv.id = 'ai-loading-message';
        messageDiv.innerHTML = `
            <div class="ai-message-avatar">🤖</div>
            <div class="ai-message-content">
                <div class="ai-message-text">
                    <span class="ai-typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </div>
            </div>
        `;
        aiBody.appendChild(messageDiv);
        aiBody.scrollTop = aiBody.scrollHeight;
        return 'ai-loading-message';
    }

    removeMessage(id) {
        const message = document.getElementById(id);
        if (message) {
            message.remove();
        }
    }

    formatMessage(text) {
        // Convert markdown-like formatting to HTML
        let formatted = this.escapeHtml(text);
        
        // Bold text **text**
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic text *text*
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Links [text](url)
        formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="ai-link">$1</a>');
        
        // Line breaks
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateSendButton(disabled) {
        const sendBtn = document.getElementById('aiSendBtn');
        if (disabled) {
            sendBtn.disabled = true;
            sendBtn.style.opacity = '0.5';
            sendBtn.style.cursor = 'not-allowed';
        } else {
            sendBtn.disabled = false;
            sendBtn.style.opacity = '1';
            sendBtn.style.cursor = 'pointer';
        }
    }
}

// Initialize HANI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.haniController = new HANIController();
});

