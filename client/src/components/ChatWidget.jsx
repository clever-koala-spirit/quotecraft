import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { MessageCircle, X, Send, ImagePlus, Loader2, FileText } from 'lucide-react';

function extractQuoteData(text) {
  const match = text.match(/```json\s*([\s\S]*?)```/);
  if (!match) return null;
  try {
    const data = JSON.parse(match[1]);
    return data.quoteReady ? data : null;
  } catch { return null; }
}

function MessageBubble({ role, content, onCreateQuote }) {
  const quoteData = role === 'assistant' ? extractQuoteData(content) : null;
  const cleanContent = content.replace(/```json[\s\S]*?```/g, '').trim();

  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
        role === 'user'
          ? 'bg-accent text-white rounded-br-md'
          : 'bg-[#1a1b23] text-text-dim rounded-bl-md'
      }`}>
        <p className="whitespace-pre-wrap">{cleanContent}</p>
        {quoteData && (
          <button
            onClick={() => onCreateQuote(quoteData)}
            className="mt-3 w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/80 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors"
          >
            <FileText size={16} /> Create Quote
          </button>
        )}
      </div>
    </div>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [convId, setConvId] = useState(null);
  const scrollRef = useRef(null);
  const fileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const sendMessage = useCallback(async (text, images) => {
    if (!text?.trim() && !images?.length) return;
    const userMsg = text.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.chat({ message: userMsg, conversationId: convId, images });
      setConvId(res.conversationId);
      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Try again.' }]);
    } finally {
      setLoading(false);
    }
  }, [convId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    if (!files.length) return;
    const images = await Promise.all(files.map(f => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(f);
    })));
    sendMessage(input || 'Here are some photos of the job', images);
    e.target.value = '';
  };

  const handleCreateQuote = (data) => {
    const params = new URLSearchParams({ chatQuote: JSON.stringify(data) });
    navigate(`/quotes/new?${params}`);
    setOpen(false);
  };

  const startNewChat = () => {
    setMessages([]);
    setConvId(null);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent hover:bg-accent/80 text-white shadow-lg shadow-accent/25 flex items-center justify-center transition-all duration-300 ${open ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat panel */}
      <div className={`fixed z-50 transition-all duration-300 ease-out
        bottom-0 right-0 sm:bottom-6 sm:right-6
        w-full sm:w-[400px] h-[100dvh] sm:h-[600px] sm:max-h-[80vh]
        ${open ? 'translate-y-0 opacity-100' : 'translate-y-full sm:translate-y-8 opacity-0 pointer-events-none'}
      `}>
        <div className="flex flex-col h-full bg-[#0a0b0f] sm:rounded-2xl border border-border overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0f1015] border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <MessageCircle size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">QuoteCraft AI</h3>
                <p className="text-text-dim text-xs">Describe a job, get a quote</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={startNewChat} className="text-text-dim hover:text-white text-xs px-2 py-1 rounded hover:bg-white/5">New chat</button>
              <button onClick={() => setOpen(false)} className="text-text-dim hover:text-white p-1"><X size={18} /></button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1">
            {messages.length === 0 && (
              <div className="text-center text-text-dim text-sm mt-8">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle size={24} className="text-accent" />
                </div>
                <p className="font-medium text-white mb-1">G'day! 👋</p>
                <p>Tell me about the job and I'll whip up a quote for ya.</p>
                <div className="mt-4 space-y-2">
                  {['Rewire a 3 bed house in Melbourne', '6 downlights in kitchen + new switchboard', 'Paint exterior of a 2-storey house'].map(s => (
                    <button key={s} onClick={() => sendMessage(s)} className="block w-full text-left px-3 py-2 rounded-lg bg-[#1a1b23] hover:bg-[#22232e] text-text-dim text-xs transition-colors">
                      "{s}"
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <MessageBubble key={i} role={m.role} content={m.content} onCreateQuote={handleCreateQuote} />
            ))}
            {loading && (
              <div className="flex justify-start mb-3">
                <div className="bg-[#1a1b23] rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 size={16} className="animate-spin text-accent" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-border bg-[#0f1015]">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} className="text-text-dim hover:text-accent p-2 transition-colors">
                <ImagePlus size={20} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Describe the job..."
                className="flex-1 bg-[#1a1b23] text-white text-sm rounded-xl px-4 py-2.5 border border-border focus:border-accent focus:outline-none placeholder:text-text-dim/50"
                disabled={loading}
              />
              <button type="submit" disabled={loading || !input.trim()} className="bg-accent hover:bg-accent/80 disabled:opacity-30 text-white p-2.5 rounded-xl transition-colors">
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
