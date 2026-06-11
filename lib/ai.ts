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

  try {
    const parsed = JSON.parse(rawAi);
    return {
      score: Number(parsed.score) || 0,
      comment: parsed.comment || String(parsed.comment || ''),
      strengths: String(parsed.strengths || ''),
      opportunities: String(parsed.opportunities || ''),
    };
  } catch (error) {
    return {
      score: 0,
      comment: rawAi,
      strengths: '',
      opportunities: '',
    };
  }
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

Evaluate now and return only the JSON object.`;
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
