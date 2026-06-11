'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Mic, Pause, Play, Sparkles, ShieldCheck } from 'lucide-react';
import { objections, categories, personas, getRandomObjections } from '@/lib/prompts';

type SessionResult = {
  score: number;
  comment: string;
  strengths: string;
  opportunities: string;
};

const defaultResult: SessionResult = {
  score: 0,
  comment: '',
  strengths: '',
  opportunities: '',
};

export default function HomePage() {
  const [persona, setPersona] = useState(personas[0].id);
  const [category, setCategory] = useState(categories[0].id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionObjections, setSessionObjections] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [reply, setReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SessionResult | null>(null);
  const [history, setHistory] = useState<Array<{ objection: string; answer: string; result: SessionResult }>>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);

  const currentObjection = sessionObjections[currentIndex];
  const progressLabel = `${currentIndex + 1} of ${sessionObjections.length}`;

  useEffect(() => {
    setHasSpeechSupport(!!(typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)));
    setSessionId(Math.random().toString(36).slice(2));
    setSessionObjections(getRandomObjections(3));
  }, []);

  const startVoiceCapture = async () => {
    if (!hasSpeechSupport) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setReply((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.start();
  };

  const playFeedback = () => {
    if (!result?.comment || typeof window === 'undefined') return;
    const speech = new SpeechSynthesisUtterance(result.comment);
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
  };

  const handleSubmit = async () => {
    if (!reply.trim()) return;
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objection: currentObjection,
          answer: reply,
          persona,
          category,
          sessionId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Unable to score response');

      setResult(data);
      setHistory((prev) => [...prev, { objection: currentObjection, answer: reply, result: data }]);
    } catch (error) {
      console.error(error);
      setResult({
        score: 0,
        comment: 'There was an error generating feedback. Please try again.',
        strengths: '',
        opportunities: '',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    setReply('');
    setResult(null);
    setCurrentIndex((prev) => Math.min(prev + 1, sessionObjections.length - 1));
  };

  const sessionComplete = currentIndex === sessionObjections.length - 1 && result;

  const sessionObjection = useMemo(
    () => ({
      title: currentObjection,
      category: categories.find((item) => item.id === category)?.label || 'General',
      persona: personas.find((item) => item.id === persona)?.label || 'Customer',
    }),
    [category, currentObjection, persona]
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
        <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Powered by Oracle OCI Generative AI</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Sales coaching powered by Oracle Cloud AI.
            </h1>
          </div>
          <div className="rounded-3xl bg-slate-900/80 px-5 py-4 text-sm ring-1 ring-white/10 sm:text-base">
            <p className="text-slate-400">Enterprise-grade AI coaching for sales teams.</p>
            <p className="mt-1 text-slate-500">Objection practice, voice input, AI-powered feedback.</p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-6 rounded-[2rem] bg-slate-900/90 p-8 shadow-soft ring-1 ring-white/5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Session setup</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Select persona & categories</h2>
              </div>
              <div className="rounded-3xl bg-slate-950 px-4 py-3 text-sm text-slate-300 ring-1 ring-white/10">
                {progressLabel} practice prompts
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3 rounded-3xl bg-slate-950/80 p-5 ring-1 ring-white/10">
                <p className="text-sm text-slate-400">Customer persona</p>
                <div className="grid gap-3">
                  {personas.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setPersona(item.id)}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${persona === item.id ? 'border-red-600 bg-red-950/30 text-white' : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600'}`}
                    >
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-sm text-slate-500">{item.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 rounded-3xl bg-slate-950/80 p-5 ring-1 ring-white/10">
                <p className="text-sm text-slate-400">Objection category</p>
                <div className="grid gap-3">
                  {categories.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setCategory(item.id)}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${category === item.id ? 'border-red-600 bg-red-950/30 text-white' : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600'}`}
                    >
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-sm text-slate-500">{item.hint}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <article className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Current objection</p>
                  <h3 className="mt-3 text-2xl font-semibold text-white">{sessionObjection.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">Respond as if this customer is a {sessionObjection.persona} in the {sessionObjection.category} category.</p>
                </div>
                <div className="rounded-3xl bg-slate-900/90 px-4 py-3 text-sm text-slate-300 ring-1 ring-white/10">{progressLabel}</div>
              </div>

              <div className="mt-6 space-y-4">
                <textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  rows={8}
                  placeholder="Type your objection handling pitch here..."
                  className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 p-5 text-slate-100 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-950/50"
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={startVoiceCapture}
                      disabled={!hasSpeechSupport || isRecording}
                      className="inline-flex items-center gap-2 rounded-3xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Mic size={18} />
                      {isRecording ? 'Listening…' : 'Use voice'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setReply('')}
                      className="inline-flex items-center gap-2 rounded-3xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm text-slate-300 transition hover:border-slate-600 hover:text-white"
                    >
                      Clear
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !reply.trim()}
                    className="inline-flex items-center gap-2 rounded-3xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? 'Scoring...' : 'Score pitch'}
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </article>

            {result ? (
              <section className="space-y-5 rounded-[2rem] bg-slate-950/90 p-6 ring-1 ring-white/10">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">AI coaching review</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Your score: {result.score}/5</h3>
                  </div>
                  <button
                    type="button"
                    onClick={playFeedback}
                    className="inline-flex items-center gap-2 rounded-3xl bg-slate-800 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700"
                  >
                    <Play size={16} />
                    Play comment
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-3xl bg-slate-900/80 p-5">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Strengths</p>
                    <p className="mt-3 text-slate-200">{result.strengths}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/80 p-5">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Opportunities</p>
                    <p className="mt-3 text-slate-200">{result.opportunities}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/80 p-5">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Comment</p>
                    <p className="mt-3 text-slate-200">{result.comment}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p className="text-sm text-slate-500">Response recorded for this step.</p>
                  {!sessionComplete ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center gap-2 rounded-3xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                      Next objection
                      <ArrowRight size={16} />
                    </button>
                  ) : null}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-6 rounded-[2rem] bg-slate-900/90 p-8 shadow-soft ring-1 ring-white/5">
            <div className="flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
              <ShieldCheck className="text-red-600" />
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">OCI-Powered MVP</p>
                <p className="mt-1 text-slate-200">Oracle GenAI scoring, voice input, enterprise-grade UX.</p>
              </div>
            </div>

            <div className="space-y-4 rounded-3xl bg-slate-950/80 p-5 ring-1 ring-white/10">
              <h3 className="text-lg font-semibold text-white">Quick tips for practice</h3>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-start gap-3">
                  <Sparkles className="mt-1 shrink-0 text-red-600" size={18} />
                  <span>Keep your response concise and customer-focused.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="mt-1 shrink-0 text-red-600" size={18} />
                  <span>Address the objection directly, then connect to value.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Sparkles className="mt-1 shrink-0 text-red-600" size={18} />
                  <span>Use this session to build confidence quickly.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl bg-slate-950/80 p-5 ring-1 ring-white/10">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Session summary</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-3xl bg-slate-900/80 p-4">
                  <p className="text-sm text-slate-400">Persona</p>
                  <p className="mt-2 text-base font-semibold text-white">{sessionObjection.persona}</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-4">
                  <p className="text-sm text-slate-400">Category</p>
                  <p className="mt-2 text-base font-semibold text-white">{sessionObjection.category}</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-4">
                  <p className="text-sm text-slate-400">Session ID</p>
                  <p className="mt-2 text-base font-semibold text-white">{sessionId}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-950/80 p-5 ring-1 ring-white/10">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">About</p>
              <p className="mt-3 text-slate-400">hackthon is powered by Oracle Cloud Infrastructure Generative AI. Enterprise sales teams use this MVP to practice objection handling and get real-time AI coaching in a fast, scalable cloud environment.</p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
