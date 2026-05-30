import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Send, Bot, User, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchKnowledge } from '@/features/chatbot/api/use-knowledge';

interface Message {
  role: 'bot' | 'user';
  text: string;
}

const DEFAULT_RESPONSE =
  "I'm not sure about that. Try asking about: reports, community, map, shop, points, profile, or leaderboard.";

const SUGGESTIONS = [
  'How do I report an issue?',
  'How do points work?',
  'What is the leaderboard?',
];

export const ChatPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: "Hi! I'm your GMC assistant. Ask me about reporting issues, the community, points, or anything about Gelephu!",
    },
  ]);
  const [input, setInput] = useState('');
  const [pendingQuery, setPendingQuery] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const processedRef = useRef<string>('');

  const { data: knowledgeResult, isFetching } = useSearchKnowledge(pendingQuery);

  const addBotResponse = useCallback((text: string) => {
    setMessages((prev) => [...prev, { role: 'bot', text }]);
  }, []);

  useEffect(() => {
    if (!pendingQuery || isFetching) return;
    if (processedRef.current === pendingQuery) return;

    processedRef.current = pendingQuery;
    const response = knowledgeResult?.answer ?? DEFAULT_RESPONSE;
    addBotResponse(response);
    setPendingQuery('');
  }, [pendingQuery, isFetching, knowledgeResult, addBotResponse]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isFetching]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isFetching) return;

      const userText = input.trim();
      setInput('');
      setMessages((prev) => [...prev, { role: 'user', text: userText }]);
      setPendingQuery(userText);
    },
    [input, isFetching],
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex h-14 items-center gap-3 border-b border-border/50 px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-green shadow-sm">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">GMC Assistant</h1>
            <p className="text-[10px] text-muted-foreground">AI-powered help</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 py-3">
        <div className="flex-1 space-y-3 overflow-y-auto">
          {messages.length === 1 && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Quick suggestions
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setMessages((prev) => [...prev, { role: 'user', text: s }]);
                      setPendingQuery(s);
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-border/50 bg-card px-3 py-2 text-xs font-medium text-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5"
                  >
                    <Sparkles className="h-3 w-3 text-primary" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-slide-up`}
              style={{ animationDelay: '0s' }}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                  msg.role === 'bot'
                    ? 'gradient-green shadow-sm'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {msg.role === 'bot' ? (
                  <Bot className="h-4 w-4 text-white" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'bot'
                    ? 'rounded-tl-sm bg-card text-foreground'
                    : 'rounded-tr-sm gradient-green text-white'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isFetching && (
            <div className="flex items-start gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl gradient-green shadow-sm">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-card px-4 py-2.5 shadow-sm">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0s' }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0.1s' }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-3 flex items-center gap-2 rounded-2xl border border-border/50 bg-card p-1.5 shadow-sm"
        >
          <Input
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={500}
            className="h-10 flex-1 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50"
          />
          <Button
            type="submit"
            size="icon-xs"
            disabled={!input.trim() || isFetching}
            className="gradient-green rounded-xl text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
