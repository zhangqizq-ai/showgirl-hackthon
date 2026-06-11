export type ScoreRequest = {
  objection: string;
  answer: string;
  persona: string;
  category: string;
  sessionId?: string;
};

export type ScoreResponse = {
  score: number;
  comment: string;
  strengths: string;
  opportunities: string;
};

const openAiDefaultUrl = 'https://api.openai.com/v1/chat/completions';

export async function scorePitch(request: ScoreRequest): Promise<ScoreResponse> {
  const prompt = buildPrompt(request);
  const rawAi = await getAiResponse(prompt);

  return parseScoreResponse(rawAi);
}

function buildPrompt(request: ScoreRequest) {
  return `You are an expert Enterprise Cloud Sales Coach specializing in Oracle Cloud Infrastructure (OCI). Your task is to evaluate how effectively a sales representative handles customer objections.

## Core Philosophy
The best OCI objection handling never relies on defensiveness or "rip-and-replace" ultimatums. It relies on **validation**, **reframing to a multi-cloud reality**, leveraging **specific OCI differentiators** (zero-egress, bare-metal performance, ODSA, Database@AWS), and proposing **low-risk next steps**.

## Evaluation Context
- **Objection:** ${request.objection}
- **Persona:** ${request.persona}
- **Category:** ${request.category}
- **Sales Rep Response:** ${request.answer}

## The 4 Pillars of Evaluation
1. **Validation & Empathy (20%):** Did the rep acknowledge the customer's reality without getting defensive? (e.g., agreeing that a full migration off AWS is too risky).
2. **The Strategic Pivot (30%):** Did the rep reposition OCI as a tactical extension, data-gravity solution, or high-performance backend rather than a total replacement?
3. **Evidence & Differentiation (30%):** Did the rep use concrete OCI facts? (egress cost structures, bare-metal/RDMA for AI, Database@AWS, predictable pricing, or 50%+ compute savings).
4. **The Low-Risk Ask (20%):** Did the rep close with a high-probability, low-friction Call to Action? (isolating a single workload, PoC, Always Free tier).

## Scoring Rubric (1-5 Scale)
- **1 (Defensive/Tone-Deaf):** Rep argues, dismisses current investments, or demands massive migration. Fails to validate concern.
- **2 (Feature Dumping):** Acknowledges objection but responds with generic marketing. Lacks specific evidence.
- **3 (Solid but Incomplete):** Validates and attempts pivot but lacks technical/financial evidence or low-risk next step.
- **4 (Strong Professional):** Excellent validation and pivot with clear OCI differentiators and good next step. May lack slightly sharper framing.
- **5 (Masterful/Trusted Advisor):** Perfect execution. Disarms by agreeing, masterfully pivots, cites specific data (e.g., 50% savings, 10TB free egress), closes with targeted zero-risk pilot ask.

## Output Format
Return a valid JSON object with exactly these fields:
{
  "score": <integer 1-5>,
  "comment": "<1-2 sentences synthesizing the evaluation and providing a specific, actionable coaching tip>",
  "strengths": "<1-2 sentences identifying what the rep did well, referencing the 4 pillars>",
  "opportunities": "<1-2 sentences identifying primary area for improvement and a specific OCI differentiator they missed>"
}

Rules:
- Return only JSON.
- Do not wrap the JSON in markdown.
- Do not include explanatory text before or after the JSON.

Evaluate now and return only the JSON object.`;
}

function parseScoreResponse(rawAi: string): ScoreResponse {
  const parsed = parseJsonFromText(rawAi);

  if (Array.isArray(parsed) && isRecord(parsed[0])) {
    return normalizeScoreResponse(parsed[0], rawAi);
  }

  if (isRecord(parsed)) {
    return normalizeScoreResponse(parsed, rawAi);
  }

  return parseLabeledResponse(rawAi);
}

function parseJsonFromText(text: string): unknown {
  const candidates = [
    text.trim(),
    extractMarkdownJson(text),
    extractFirstJsonObject(text),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // Try the next recovery strategy.
    }
  }

  return null;
}

function extractMarkdownJson(text: string): string | null {
  const fencedBlock = text.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fencedBlock?.[1]) return fencedBlock[1].trim();

  const embeddedBlock = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return embeddedBlock?.[1]?.trim() || null;
}

function extractFirstJsonObject(text: string): string | null {
  const start = text.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\' && inString) {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === '{') depth += 1;

    if (char === '}') {
      depth -= 1;
      if (depth === 0) return text.slice(start, index + 1);
    }
  }

  return null;
}

function normalizeScoreResponse(parsed: Record<string, unknown>, fallbackText: string): ScoreResponse {
  return {
    score: normalizeScore(parsed.score ?? parsed.rating ?? parsed.overall_score),
    comment: cleanText(parsed.comment ?? parsed.feedback ?? parsed.coaching_comment ?? fallbackText),
    strengths: cleanText(parsed.strengths ?? parsed.strength ?? parsed.what_worked),
    opportunities: cleanText(
      parsed.opportunities ??
        parsed.opportunity ??
        parsed.improvements ??
        parsed.areas_for_improvement ??
        parsed.next_steps
    ),
  };
}

function parseLabeledResponse(rawAi: string): ScoreResponse {
  const text = cleanText(extractMarkdownJson(rawAi) || rawAi);

  return {
    score: extractScoreFromText(text),
    comment:
      extractLabeledSection(text, ['comment', 'coaching comment', 'feedback']) ||
      fallbackComment(text),
    strengths: extractLabeledSection(text, ['strengths', 'strength', 'what worked']),
    opportunities: extractLabeledSection(text, [
      'opportunities',
      'opportunity',
      'areas for improvement',
      'area for improvement',
      'improvements',
      'recommended improvement',
      'next step',
    ]),
  };
}

function extractScoreFromText(text: string): number {
  const scoreMatch = text.match(/(?:^|[\s,{])["']?score["']?\s*[:=-]\s*["']?(\d+(?:\.\d+)?)\s*(?:\/\s*5)?/i);
  if (scoreMatch?.[1]) return normalizeScore(scoreMatch[1]);

  return 0;
}

function extractLabeledSection(text: string, labels: string[]): string {
  const startPattern = labels.map(labelToPattern).join('|');
  const allLabels = [
    'score',
    'comment',
    'coaching comment',
    'feedback',
    'strengths',
    'strength',
    'what worked',
    'opportunities',
    'opportunity',
    'areas for improvement',
    'area for improvement',
    'improvements',
    'recommended improvement',
    'next step',
  ].map(labelToPattern).join('|');

  const startRegex = new RegExp(
    `(?:^|\\n)\\s*(?:[-*]\\s*)?(?:\\*\\*)?["']?(?:${startPattern})["']?(?:\\*\\*)?\\s*[:=-]\\s*`,
    'i'
  );
  const startMatch = startRegex.exec(text);
  if (!startMatch) return '';

  const sectionStart = startMatch.index + startMatch[0].length;
  const rest = text.slice(sectionStart);
  const endRegex = new RegExp(
    `\\n\\s*(?:[-*]\\s*)?(?:\\*\\*)?["']?(?:${allLabels})["']?(?:\\*\\*)?\\s*[:=-]`,
    'i'
  );
  const sectionEnd = rest.search(endRegex);

  return cleanText(sectionEnd >= 0 ? rest.slice(0, sectionEnd) : rest);
}

function labelToPattern(label: string): string {
  return label
    .trim()
    .split(/\s+/)
    .map(escapeRegex)
    .join('[\\s_-]+');
}

function normalizeScore(value: unknown): number {
  if (typeof value === 'number') return clampScore(value);

  const match = String(value ?? '').match(/\d+(?:\.\d+)?/);
  return match ? clampScore(Number(match[0])) : 0;
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(5, Math.max(1, Math.round(value)));
}

function fallbackComment(text: string): string {
  if (!text) {
    return 'AI feedback was generated, but the response format could not be parsed. Please try again.';
  }

  return text.length > 500 ? `${text.slice(0, 500).trim()}...` : text;
}

function cleanText(value: unknown): string {
  return String(value ?? '')
    .trim()
    .replace(/^["'`]+|["'`]+$/g, '')
    .trim();
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function getAiResponse(prompt: string): Promise<string> {
  if (process.env.OPENAI_API_KEY) {
    return await callOpenAiCompatible(prompt);
  }

  throw new Error('No AI provider configured. Set OPENAI_API_KEY.');
}

async function callOpenAiCompatible(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const url = process.env.OPENAI_API_URL || openAiDefaultUrl;
  const additionalHeaders: Record<string, string> = {};

  if (process.env.OCI_OPENAI_PROJECT && url.includes('oci.oraclecloud.com')) {
    additionalHeaders['OpenAI-Project'] = process.env.OCI_OPENAI_PROJECT;
  }
  if (process.env.OCI_OPC_CONVERSATION_STORE_ID && url.includes('oci.oraclecloud.com')) {
    additionalHeaders['opc-conversation-store-id'] = process.env.OCI_OPC_CONVERSATION_STORE_ID;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...additionalHeaders,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.6,
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`OpenAI-compatible API error: ${response.status} ${bodyText}`);
  }

  const data = await response.json();
  return extractAiText(data);
}

function extractAiText(data: any) {
  if (data.choices?.[0]?.message?.content) {
    return String(data.choices[0].message.content).trim();
  }

  if (data.output?.[0]?.content?.[0]?.text) {
    return String(data.output[0].content[0].text).trim();
  }

  return JSON.stringify(data);
}
