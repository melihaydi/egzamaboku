import React, { useEffect, useRef, useState } from 'react';
import { Bot, Send, Trash2, AlertTriangle, HelpCircle, User } from 'lucide-react';
import { useApp } from '../../context/useApp';
import { getAssistantReply } from '../../lib/eczemaAssistant';
import type { ChatMessage } from '../../types';

const SUGGESTED_QUESTIONS = [
  'Dupixent nasıl etki eder?',
  'Cibinqo (JAK inhibitörü) yan etkileri nelerdir?',
  'Islak sargı tedavisi nedir?',
  'Alevlenme sırasında ne yapmalıyım?',
  'Nemlendirme rutini nasıl olmalı?',
  'Egzama ile sedef hastalığı farkı nedir?'
];

export const AIChatAssistant: React.FC = () => {
  const { chatMessages, addChatMessage, clearChatMessages } = useApp();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMessage: ChatMessage = {
      id: `chat-${Date.now()}-u`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleString('tr-TR')
    };
    addChatMessage(userMessage);
    setInput('');
    setIsTyping(true);

    const delay = 500 + Math.random() * 500;
    setTimeout(() => {
      const reply = getAssistantReply(trimmed);
      const assistantMessage: ChatMessage = {
        id: `chat-${Date.now()}-a`,
        role: 'assistant',
        text: reply.text,
        timestamp: new Date().toLocaleString('tr-TR'),
        urgent: reply.urgent
      };
      addChatMessage(assistantMessage);
      setIsTyping(false);
    }, delay);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const showSuggestions = chatMessages.length <= 1;

  return (
    <div className="space-y-6">
      {/* Üst Şerit */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Bot className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              AI Egzama & Dermatoloji Sohbet Asistanı
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Kürasyonu yapılmış, kanıta dayalı bir bilgi tabanından eczama, cilt bakımı ve tedaviler hakkında sorularınızı yanıtlar.
          </p>
        </div>

        <button
          onClick={clearChatMessages}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 shrink-0"
        >
          <Trash2 className="w-4 h-4" />
          Sohbeti Temizle
        </button>
      </div>

      {/* Şeffaflık Notu */}
      <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
        <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
        <p className="leading-relaxed">
          Bu asistan, internete bağlı canlı bir yapay zeka modeli değildir; tarayıcınızda yerel olarak çalışan, kürasyonu yapılmış bir egzama/dermatoloji bilgi bankasından eşleştirilmiş yanıtlar sunar. Tanı koymaz, tedavi önermez ve hekim muayenesinin yerine geçmez.
        </p>
      </div>

      {/* Sohbet Penceresi */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 flex flex-col h-[560px]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {chatMessages.map(msg => (
            <div key={msg.id} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <span className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-indigo-400" />
                </span>
              )}

              <div
                className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-br-sm'
                    : msg.urgent
                      ? 'bg-rose-950/50 border border-rose-500/50 text-rose-100 rounded-bl-sm'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-sm'
                }`}
              >
                {msg.urgent && (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-rose-300 uppercase mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Dikkat Gerektiren Konu
                  </span>
                )}
                <p className="whitespace-pre-line">{msg.text}</p>
                <span className={`text-[9px] block mt-1.5 ${msg.role === 'user' ? 'text-sky-100/70' : 'text-slate-500'}`}>
                  {msg.timestamp}
                </span>
              </div>

              {msg.role === 'user' && (
                <span className="w-7 h-7 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-sky-400" />
                </span>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-end gap-2 justify-start">
              <span className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-indigo-400" />
              </span>
              <div className="p-3.5 rounded-2xl rounded-bl-sm bg-slate-950 border border-slate-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 motion-safe:animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 motion-safe:animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 motion-safe:animate-bounce" />
              </div>
            </div>
          )}

          {showSuggestions && (
            <div className="pt-2 space-y-2">
              <p className="text-[10px] uppercase font-bold text-slate-500">Örnek Sorular</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-300 text-[11px] border border-slate-700 hover:border-indigo-500/40 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Girdi Alanı */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Egzama, tedaviler veya cilt bakımı hakkında sorunuzu yazın..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 text-white disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            aria-label="Gönder"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
