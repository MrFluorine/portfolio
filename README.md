# Portfolio Website - AI Engineer

A modern, interactive portfolio website with UI mode, Terminal mode, and AI mode featuring HANI assistant.

## Features

- **UI Mode**: Beautiful, modern portfolio interface
- **Terminal Mode**: Interactive command-line interface to explore the portfolio
- **AI Mode**: Chat with HANI, an AI assistant that answers questions about the resume

## Setup Instructions

### 1. Configure Gemini API Key

1. Get your Google Gemini API key from [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Open `config.js` file
3. Replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key:

```javascript
const CONFIG = {
    GEMINI_API_KEY: 'your-actual-api-key-here',
};
```

**Important**: The `config.js` file is already in `.gitignore` to protect your API key from being committed to version control.

### 2. Run the Website

Simply open `index.html` in your web browser, or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Then open http://localhost:8000 in your browser
```

## Usage

### UI Mode (Default)
- Navigate through sections using the navigation menu
- View projects, skills, and contact information
- Download resume

### Terminal Mode
- Click the "Terminal" button in the navigation
- Type commands like:
  - `help` - Show available commands
  - `about` - Display information
  - `skills` - Show technical skills
  - `projects` - List projects
  - `contact` - Show contact info
  - `clear` - Clear terminal
  - `exit` - Exit terminal mode

### AI Mode
- Click the "AI Mode" button in the navigation
- Chat with HANI about Dhananjay's resume
- HANI can answer questions about:
  - Work experience
  - Education
  - Skills
  - Projects
  - Research
  - Contact information
- HANI will politely decline questions unrelated to the resume

## File Structure

```
portfolio/
├── index.html          # Main HTML file
├── style.css           # Styles for all modes
├── config.js           # API configuration (gitignored)
├── .gitignore          # Git ignore file
├── scripts/
│   ├── script.js       # Main JavaScript
│   ├── terminal.js     # Terminal mode controller
│   └── hani.js         # AI mode controller (HANI)
├── assets/
│   └── others/         # Images and icons
└── Dhananjay-resume-8:25.pdf  # Resume PDF
```

## Security Note

- Never commit your API key to version control
- The `config.js` file is already in `.gitignore`
- For production, consider using environment variables or a backend proxy

## Technologies Used

- HTML5
- CSS3 (with CSS Variables)
- Vanilla JavaScript
- Google Gemini API (gemini-pro)
- JetBrains Mono font (for terminal mode)

## License

Personal portfolio project.

