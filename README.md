# hackthon

A hackathon MVP for sales reps to practice objection handling and pitching with AI-powered scoring and feedback.

## Features

- AI-generated objection practice prompts
- Resumeable 3–5 objection practice sessions
- Response scoring and coaching comments
- Voice input support in modern browsers
- Spoken feedback using browser speech synthesis
- Persona and objection category mock selection
- Vercel-ready Next.js frontend with backend AI adapter

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables:

   - `OPENAI_API_KEY` – OpenAI-compatible API key (e.g., OpenAI, OpenRouter, etc.)
   - `OPENAI_API_URL` – OpenAI-compatible endpoint (default: `https://api.openai.com/v1/chat/completions`)
   - `OPENAI_MODEL` – Model identifier (e.g., `gpt-4o-mini`, `deepseek/deepseek-v4-flash`)

3. Run locally:

   ```bash
   npm run dev
   ```

## Deployment

Deploy to Vercel with the same environment variables.

## Notes

- The backend uses OpenAI-compatible API endpoints for AI scoring and feedback.
- Voice input/playback is supported in browsers that expose `SpeechRecognition` / `webkitSpeechRecognition` and `speechSynthesis`.
