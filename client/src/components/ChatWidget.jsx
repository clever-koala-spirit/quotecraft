import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { MessageCircle, X, Send, ImagePlus, Loader2, FileText, Mic } from 'lucide-react';

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
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const scrollRef = useRef(null);
  const fileRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const navigate = useNavigate();

  // Speech recognition setup
  const hasSpeechAPI = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  const stopRecording = useCallback(() => {
    setRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (recording) { stopRecording(); return; }
    setRecording(true);

    if (hasSpeechAPI) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SR();
      recognition.lang = 'en-AU';
      recognition.interimResults = true;
      recognition.continuous = true;
      let silenceTimer = null;
      let finalTranscript = '';

      recognition.onresult = (e) => {
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            finalTranscript += e.results[i][0].transcript;
          } else {
            interim += e.results[i][0].transcript;
          }
        }
        setInput(finalTranscript + interim);
        clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => { recognition.stop(); }, 2000);
      };
      recognition.onend = () => { setRecording(false); recognitionRef.current = null; };
      recognition.onerror = () => { setRecording(false); recognitionRef.current = null; };
      recognitionRef.current = recognition;
      recognition.start();
    } else {
      // Fallback: MediaRecorder + Whisper
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4' });
        const chunks = [];
        mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        mr.onstop = async () => {
          stream.getTracks().forEach(t => t.stop());
          setRecording(false);
          setTranscribing(true);
          try {
            const blob = new Blob(chunks, { type: mr.mimeType });
            const result = await api.transcribe(blob);
            if (result.text) setInput(prev => prev + result.text);
          } catch (err) {
            console.error('Transcription failed:', err);
          } finally {
            setTranscribing(false);
          }
        };
        mediaRecorderRef.current = mr;
        mr.start();
        // Auto-stop after 30s
        setTimeout(() => { if (mr.state === 'recording') mr.stop(); }, 30000);
      } catch (err) {
        console.error('Mic access denied:', err);
        setRecording(false);
      }
    }
  }, [recording, hasSpeechAPI, stopRecording]);

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
            {recording && (
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-400 text-xs font-medium">Listening...</span>
              </div>
            )}
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
              <button
                type="button"
                onClick={startRecording}
                disabled={loading || transcribing}
                className={`p-2.5 rounded-xl transition-all ${
                  recording
                    ? 'bg-red-500 text-white animate-pulse'
                    : transcribing
                      ? 'bg-[#1a1b23] text-accent'
                      : 'bg-[#1a1b23] text-text-dim hover:text-accent'
                } disabled:opacity-30`}
                title={recording ? 'Stop recording' : 'Voice input'}
              >
                {transcribing ? <Loader2 size={16} className="animate-spin" /> : <Mic size={16} />}
              </button>
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
