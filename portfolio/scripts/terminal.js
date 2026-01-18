// Terminal Mode Controller
class TerminalController {
    constructor() {
        this.isTerminalMode = false;
        this.commandHistory = [];
        this.historyIndex = -1;
        this.init();
    }

    init() {
        const modeToggle = document.getElementById('modeToggle');
        const terminalContainer = document.getElementById('terminalContainer');
        const mainContent = document.getElementById('mainContent');
        const terminalInput = document.getElementById('terminalInput');
        const terminalBody = document.getElementById('terminalBody');

        // Toggle terminal mode
        modeToggle.addEventListener('click', () => {
            this.toggleTerminalMode();
        });

        // Handle terminal input
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.executeCommand(terminalInput.value.trim());
                terminalInput.value = '';
                this.historyIndex = -1;
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory('up');
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory('down');
            } else if (e.key === 'Tab') {
                e.preventDefault();
                this.autoComplete(terminalInput.value);
            }
        });

        // Focus terminal input when clicking on terminal
        terminalBody.addEventListener('click', () => {
            terminalInput.focus();
        });

        // Remove cursor from last line when typing
        terminalInput.addEventListener('input', () => {
            const lastLine = terminalBody.querySelector('.terminal-line:last-child');
            if (lastLine && lastLine.querySelector('.terminal-cursor')) {
                lastLine.querySelector('.terminal-cursor').remove();
            }
        });

        // Add cursor back when input is empty
        terminalInput.addEventListener('blur', () => {
            if (!terminalInput.value) {
                const lastLine = terminalBody.querySelector('.terminal-line:last-child');
                if (lastLine && !lastLine.querySelector('.terminal-cursor')) {
                    const cursor = document.createElement('span');
                    cursor.className = 'terminal-cursor';
                    cursor.textContent = '█';
                    lastLine.appendChild(cursor);
                }
            }
        });

        // Add close button functionality
        const closeButton = document.querySelector('.terminal-button.close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.toggleTerminalMode();
            });
        }
    }

    toggleTerminalMode() {
        this.isTerminalMode = !this.isTerminalMode;
        document.body.classList.toggle('terminal-mode', this.isTerminalMode);
        
        if (this.isTerminalMode) {
            const terminalInput = document.getElementById('terminalInput');
            setTimeout(() => terminalInput.focus(), 100);
        }
    }

    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;

        if (direction === 'up') {
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
            }
        } else {
            if (this.historyIndex > 0) {
                this.historyIndex--;
            } else {
                this.historyIndex = -1;
                document.getElementById('terminalInput').value = '';
                return;
            }
        }

        if (this.historyIndex >= 0) {
            document.getElementById('terminalInput').value = 
                this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
        }
    }

    autoComplete(input) {
        const commands = ['help', 'about', 'skills', 'projects', 'contact', 'resume', 'clear', 'exit', 'whoami', 'ls', 'cat'];
        const matches = commands.filter(cmd => cmd.startsWith(input.toLowerCase()));
        
        if (matches.length === 1) {
            document.getElementById('terminalInput').value = matches[0];
        }
    }

    executeCommand(command) {
        if (!command) {
            this.addLine('', true);
            return;
        }

        // Add command to history
        if (command !== this.commandHistory[this.commandHistory.length - 1]) {
            this.commandHistory.push(command);
            if (this.commandHistory.length > 50) {
                this.commandHistory.shift();
            }
        }

        // Display command
        this.addCommandLine(command);

        // Execute command
        const cmd = command.toLowerCase().split(' ')[0];
        const args = command.split(' ').slice(1).join(' ');

        switch (cmd) {
            case 'help':
                this.showHelp();
                break;
            case 'about':
                this.showAbout();
                break;
            case 'skills':
                this.showSkills();
                break;
            case 'projects':
                this.showProjects();
                break;
            case 'contact':
                this.showContact();
                break;
            case 'resume':
                this.downloadResume();
                break;
            case 'clear':
                this.clearTerminal();
                break;
            case 'exit':
            case 'quit':
                this.toggleTerminalMode();
                break;
            case 'whoami':
                this.showWhoami();
                break;
            case 'ls':
                this.showList();
                break;
            case 'cat':
                if (args) {
                    this.showFile(args);
                } else {
                    this.addLine('Usage: cat <filename>', 'error');
                }
                break;
            case 'echo':
                this.addLine(args || '', 'text');
                break;
            case 'date':
                this.addLine(new Date().toString(), 'text');
                break;
            case 'pwd':
                this.addLine('/home/dhananjay/portfolio', 'text');
                break;
            default:
                this.addLine(`Command not found: ${cmd}. Type 'help' for available commands.`, 'error');
        }

        this.addPrompt();
    }

    addLine(text, type = 'text', isCommand = false, isHTML = false) {
        const terminalBody = document.getElementById('terminalBody');
        const line = document.createElement('div');
        line.className = 'terminal-line';

        if (isCommand) {
            line.innerHTML = `<span class="terminal-prompt">dhananjay@portfolio:~$</span><span class="terminal-command">${this.escapeHtml(text)}</span>`;
        } else if (isHTML) {
            line.innerHTML = text;
        } else {
            const className = type === 'error' ? 'terminal-error' : 
                            type === 'success' ? 'terminal-success' : 
                            type === 'info' ? 'terminal-info' : 
                            type === 'warning' ? 'terminal-warning' : 
                            type === 'welcome' ? 'terminal-welcome' : 'terminal-text';
            line.innerHTML = `<span class="${className}">${this.escapeHtml(text)}</span>`;
        }

        terminalBody.appendChild(line);
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    addCommandLine(command) {
        const terminalBody = document.getElementById('terminalBody');
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = `<span class="terminal-prompt">dhananjay@portfolio:~$</span><span class="terminal-command">${this.escapeHtml(command)}</span>`;
        terminalBody.appendChild(line);
    }

    addPrompt() {
        const terminalBody = document.getElementById('terminalBody');
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = `<span class="terminal-prompt">dhananjay@portfolio:~$</span><span class="terminal-cursor">█</span>`;
        terminalBody.appendChild(line);
        terminalBody.scrollTop = terminalBody.scrollHeight;
        
        // Focus input after adding prompt
        setTimeout(() => {
            document.getElementById('terminalInput').focus();
        }, 10);
    }

    showHelp() {
        const helpText = `
Available commands:

  <span class="terminal-info">help</span>          - Show this help message
  <span class="terminal-info">about</span>         - Display information about me
  <span class="terminal-info">skills</span>         - Show my technical skills
  <span class="terminal-info">projects</span>      - List my featured projects
  <span class="terminal-info">contact</span>       - Show contact information
  <span class="terminal-info">resume</span>        - Download my resume
  <span class="terminal-info">whoami</span>        - Display user information
  <span class="terminal-info">ls</span>            - List available sections
  <span class="terminal-info">cat</span>           - Display file contents
  <span class="terminal-info">clear</span>         - Clear the terminal
  <span class="terminal-info">exit</span>          - Exit terminal mode
  <span class="terminal-info">echo</span>          - Echo text
  <span class="terminal-info">date</span>          - Show current date
  <span class="terminal-info">pwd</span>            - Print working directory

Use <span class="terminal-warning">Tab</span> for autocomplete and <span class="terminal-warning">↑/↓</span> for command history.
        `.trim();
        this.addLine(helpText, 'text', false, true);
    }

    showAbout() {
        const aboutText = `
<span class="terminal-section-title">About Dhananjay Agnihotri</span>

I'm an AI Engineer passionate about creating intelligent systems that solve real-world problems. 
My expertise spans Computer Vision, Retrieval-Augmented Generation (RAG), and Large Language Models (LLMs).

I love learning new technologies, documenting my journey, and collaborating with teams to build 
innovative solutions. When I'm not coding, you'll find me exploring the latest research papers 
or contributing to open-source projects.

<span class="terminal-info">Location:</span> Available for remote work
<span class="terminal-info">Focus:</span> AI/ML, Computer Vision, LLMs, RAG Systems
<span class="terminal-info">Status:</span> Open to opportunities
        `.trim();
        this.addLine(aboutText, 'text', false, true);
    }

    showSkills() {
        const skillsHTML = `
<span class="terminal-section-title">Technical Skills</span>

<span class="terminal-info">AI/ML:</span>
  • Computer Vision
  • Large Language Models (LLMs)
  • Retrieval-Augmented Generation (RAG)
  • Deep Learning
  • Neural Networks
  • Transformers

<span class="terminal-info">Programming Languages:</span>
  • Python
  • JavaScript
  • TypeScript
  • C++
  • SQL

<span class="terminal-info">Frameworks & Tools:</span>
  • PyTorch
  • TensorFlow
  • Hugging Face
  • LangChain
  • FastAPI
  • Docker
  • Git

<span class="terminal-info">Specializations:</span>
  • Model Training & Fine-tuning
  • Vector Databases
  • API Development
  • MLOps
        `.trim();
        this.addLine(skillsHTML, 'text', false, true);
    }

    showProjects() {
        const projectsHTML = `
<span class="terminal-section-title">Featured Projects</span>

<span class="terminal-info">1. RAG System</span>
   Built a Retrieval-Augmented Generation system for intelligent document Q&A using 
   vector embeddings and LLMs. Implemented semantic search with improved accuracy.
   <span class="terminal-warning">Tech:</span> Python, LangChain, OpenAI, Vector DB

<span class="terminal-info">2. Computer Vision Detection</span>
   Developed a real-time object detection system using YOLO and deep learning. 
   Optimized for performance with custom model fine-tuning.
   <span class="terminal-warning">Tech:</span> Python, PyTorch, YOLO, OpenCV

<span class="terminal-info">3. LLM Fine-tuning Pipeline</span>
   Created an end-to-end pipeline for fine-tuning large language models on custom datasets. 
   Includes data preprocessing, training, and evaluation workflows.
   <span class="terminal-warning">Tech:</span> Python, Hugging Face, PyTorch, MLflow

<span class="terminal-info">4. Smart Scheduler Agent</span>
   Built an intelligent scheduling agent using LLMs that understands natural language 
   requests and optimizes calendar management.
   <span class="terminal-warning">Tech:</span> Python, LLMs, FastAPI, React
        `.trim();
        this.addLine(projectsHTML, 'text', false, true);
    }

    showContact() {
        const contactHTML = `
<span class="terminal-section-title">Contact Information</span>

I'm always open to discussing new projects, creative ideas, or opportunities 
to be part of your vision. Let's build something amazing together!

<span class="terminal-info">LinkedIn:</span> <span class="terminal-link" onclick="window.open('https://www.linkedin.com/in/agnidhananjay/', '_blank')">https://www.linkedin.com/in/agnidhananjay/</span>
<span class="terminal-info">WhatsApp:</span> <span class="terminal-link" onclick="window.open('https://api.whatsapp.com/send/?phone=9326208014&text&type=phone_number&app_absent=0', '_blank')">+91 9326208014</span>
<span class="terminal-info">Resume:</span> Type 'resume' to download

<span class="terminal-success">Let's connect and build something amazing!</span>
        `.trim();
        this.addLine(contactHTML, 'text', false, true);
    }

    showWhoami() {
        const whoamiText = `
<span class="terminal-info">Username:</span> dhananjay
<span class="terminal-info">Full Name:</span> Dhananjay Agnihotri
<span class="terminal-info">Role:</span> AI Engineer
<span class="terminal-info">Specialization:</span> Computer Vision, RAG, LLMs
<span class="terminal-info">Location:</span> Remote
<span class="terminal-info">Status:</span> Available for opportunities
        `.trim();
        this.addLine(whoamiText, 'text', false, true);
    }

    showList() {
        const listText = `
<span class="terminal-section-title">Available Sections</span>

  about/          - About me
  skills/          - Technical skills
  projects/        - Featured projects
  contact/         - Contact information
  resume.pdf       - Download resume
  snippets/        - Code snippets
        `.trim();
        this.addLine(listText, 'text', false, true);
    }

    showFile(filename) {
        const files = {
            'about': this.showAbout.bind(this),
            'skills': this.showSkills.bind(this),
            'projects': this.showProjects.bind(this),
            'contact': this.showContact.bind(this),
            'resume.pdf': () => {
                this.addLine('Downloading resume...', 'info');
                this.downloadResume();
            },
            'snippets': () => {
                this.showSnippets();
            }
        };

        if (files[filename.toLowerCase()]) {
            files[filename.toLowerCase()]();
        } else {
            this.addLine(`cat: ${filename}: No such file or directory`, 'error');
        }
    }

    showSnippets() {
        const snippetsHTML = `
<span class="terminal-section-title">Code Snippets</span>

<span class="terminal-info">RAG Pipeline:</span>
<span class="terminal-code"><pre>from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains import RetrievalQA

# Initialize RAG pipeline
embeddings = OpenAIEmbeddings()
vectorstore = FAISS.from_documents(docs, embeddings)
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=vectorstore.as_retriever()
)</pre></span>

<span class="terminal-info">Model Fine-tuning:</span>
<span class="terminal-code"><pre>from transformers import Trainer, TrainingArguments

training_args = TrainingArguments(
    output_dir='./results',
    num_train_epochs=3,
    per_device_train_batch_size=16,
    learning_rate=2e-5
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset
)
trainer.train()</pre></span>
        `.trim();
        
        const terminalBody = document.getElementById('terminalBody');
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = snippetsHTML;
        terminalBody.appendChild(line);
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    downloadResume() {
        this.addLine('Downloading resume...', 'info');
        const link = document.createElement('a');
        link.href = 'Dhananjay-resume-8:25.pdf';
        link.download = 'Dhananjay-Agnihotri-Resume.pdf';
        link.click();
        setTimeout(() => {
            this.addLine('Resume downloaded successfully!', 'success');
        }, 500);
    }

    clearTerminal() {
        const terminalBody = document.getElementById('terminalBody');
        terminalBody.innerHTML = '';
        const welcomeLine = document.createElement('div');
        welcomeLine.className = 'terminal-line';
        welcomeLine.innerHTML = '<span class="terminal-prompt">dhananjay@portfolio:~$</span><span class="terminal-welcome">Welcome to Dhananjay\'s Portfolio Terminal</span>';
        terminalBody.appendChild(welcomeLine);
        
        const helpLine = document.createElement('div');
        helpLine.className = 'terminal-line';
        helpLine.innerHTML = '<span class="terminal-prompt">dhananjay@portfolio:~$</span><span class="terminal-text">Type \'help\' to see available commands</span>';
        terminalBody.appendChild(helpLine);
        
        this.addPrompt();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize terminal when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.terminalController = new TerminalController();
});

