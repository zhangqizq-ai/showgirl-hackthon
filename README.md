# Showgirl Systems Sales Coach

AI-powered objection-handling practice for OCI sales teams.

## Project Snapshot

```yaml
project_name: Showgirl Systems Sales Coach
project_type: Hackathon MVP
live_demo: https://showgirl-hackthon.vercel.app/
primary_user: Oracle Cloud Infrastructure sales representatives
secondary_users:
  - Sales enablement teams
  - Sales managers
  - Solution engineers preparing for customer conversations
core_problem: Sales reps need realistic, repeatable practice for hard OCI objections before they are in front of customers.
core_solution: A browser-based AI coach that gives reps objection prompts, scores their pitch, and returns concrete coaching feedback.
proof_to_open:
  - Live Vercel demo
  - app/page.tsx
  - app/api/score/route.ts
  - lib/ai.ts
  - lib/prompts.ts
```

## What We Built

Showgirl Systems Sales Coach is a hackathon MVP that helps cloud sales reps practice difficult customer objections in a short, repeatable session.

The app lets a rep choose:

- A customer persona, such as a technical buyer, economic buyer, or end user
- An objection category, such as multi-cloud friction, Oracle ecosystem fit, market perception, or agentic AI value
- A realistic objection prompt based on common OCI sales conversations

The rep then types or speaks their answer. The app sends the answer to an AI scoring endpoint and returns:

- A score from 1 to 5
- A short coaching comment
- Strengths in the response
- Opportunities to improve
- Spoken feedback using browser speech synthesis

The goal is not to replace sales training. The goal is to give every rep a private, fast, low-pressure way to practice before the real customer meeting.

## Who Has This Problem?

The main user is an OCI sales representative preparing for enterprise customer conversations.

Today, that rep may be handling objections like:

- "We are already committed to AWS, Azure, or GCP."
- "Oracle is only useful for Oracle databases."
- "We do not want a multi-cloud headache."
- "Oracle does not have the same developer momentum."
- "Agentic AI sounds interesting, but we already have automation elsewhere."

Without this app, practice usually depends on scheduled roleplays, manager availability, static training docs, or learning through real customer calls. That is slow and inconsistent. It can also be uncomfortable for newer reps, because they have to practice difficult answers in front of teammates before they have built confidence.

This problem also applies to sales enablement teams and sales managers. They need a way to scale coaching across many reps without running every practice session manually.

## Why It Matters

Enterprise cloud sales is high-stakes. A single weak objection response can turn a promising customer conversation into a dead end.

OCI reps need to avoid defensive answers and generic feature dumps. They need to validate the customer's reality, reframe OCI as a practical multi-cloud extension, use specific differentiators, and close with a low-risk next step.

That is exactly the behavior this app trains.

## How The App Solves It

After using the app, a rep can practice a hard objection in minutes instead of waiting for a manager-led roleplay.

The most important demo workflow is:

1. Open the live app: https://showgirl-hackthon.vercel.app/
2. Select a customer persona.
3. Select an objection category.
4. Read the generated objection.
5. Type a response or use voice input.
6. Click **Score pitch**.
7. Review the AI score, strengths, opportunities, and coaching comment.
8. Continue to the next objection and improve the answer.

The key change is speed. A rep gets immediate feedback while the practice moment is still fresh.

## How We Built It

The MVP is a Next.js app deployed publicly on Vercel.

```yaml
frontend:
  framework: Next.js 14
  ui: React
  styling: Tailwind CSS
  icons: lucide-react
  browser_features:
    - SpeechRecognition / webkitSpeechRecognition for voice input
    - speechSynthesis for spoken feedback
backend:
  runtime: Next.js API route
  endpoint: /api/score
  ai_adapter: OpenAI-compatible chat completion API
  deployment: Vercel
ai_prompting:
  rubric:
    - Validation and empathy
    - Strategic pivot to multi-cloud reality
    - Evidence and OCI differentiation
    - Low-risk next step
  output_format: JSON with score, comment, strengths, and opportunities
```

Important files:

- `app/page.tsx` contains the full interactive practice experience.
- `app/api/score/route.ts` receives the rep answer and returns AI coaching feedback.
- `lib/ai.ts` builds the sales-coaching prompt and calls the AI provider.
- `lib/prompts.ts` stores personas, objection categories, and sample objections.

## AI Scoring Rubric

The scoring prompt evaluates each response on four pillars:

- **Validation & Empathy:** Did the rep acknowledge the customer's concern without sounding defensive?
- **Strategic Pivot:** Did the rep position OCI as a practical extension or targeted workload solution instead of a rip-and-replace migration?
- **Evidence & Differentiation:** Did the rep include concrete OCI value, such as egress economics, performance, predictable pricing, Database@AWS, or low-friction deployment?
- **Low-Risk Ask:** Did the rep suggest a small next step, such as isolating one workload or running a proof of concept?

Scores range from 1 to 5:

- **1:** Defensive or tone-deaf
- **2:** Generic feature dumping
- **3:** Solid but incomplete
- **4:** Strong professional response
- **5:** Trusted-advisor quality response

## Demo Proof Points

Judges can verify the MVP by opening the public demo and completing one scoring flow.

```text
Live app:
https://showgirl-hackthon.vercel.app/

Suggested demo answer:
"That makes sense. I would not suggest replacing your current cloud footprint just to test OCI. A better first step is to pick one workload where OCI has a clear advantage, such as high-performance database, AI infrastructure, or predictable egress costs. We can run a focused proof of concept and compare performance, cost, and operational effort before you commit to anything broader."
```

Expected result:

- The app accepts the response.
- The backend scores it through the AI adapter.
- The UI displays score, strengths, opportunities, and a coaching comment.
- The user can play the spoken feedback and move to the next objection.

## Local Development

Install dependencies:

```bash
npm install
```

Create environment variables:

```bash
cp .env.sample .env
```

Required AI configuration:

```bash
OPENAI_API_KEY=your-api-key
OPENAI_API_URL=https://api.openai.com/v1/chat/completions
OPENAI_MODEL=gpt-4o-mini
```

Run locally:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Deployment

The app is deployed on Vercel with public access:

```text
https://showgirl-hackthon.vercel.app/
```

Set the same AI environment variables in Vercel before deploying.

## Future Improvements

- Save session history by user or team
- Add manager dashboards for coaching trends
- Add more OCI objection libraries by industry
- Add side-by-side before/after answer comparison
- Add team scorecards for sales enablement programs
