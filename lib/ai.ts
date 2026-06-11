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
  return `You are an expert sales coach. A rep just responded to an objection from a customer.

Objection: ${request.objection}
Persona: ${request.persona}
Category: ${request.category}
Response: ${request.answer}

Evaluate the response and return valid JSON with these fields:
- score: integer from 1 to 5
- comment: coaching feedback for the rep
- strengths: concise summary of what worked well
- opportunities: concise suggestions to improve the pitch

Only return a single JSON object. Do not add extra text.`;
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
