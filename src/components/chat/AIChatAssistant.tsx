import React, { useEffect, useRef, useState } from 'react';
import { Bot, Send, Trash2, AlertTriangle, User, Globe, Sparkles, BookOpen, HelpCircle } from 'lucide-react';
import { useApp } from '../../context/useApp';
import { getAssistantReply, getAssistantReplyWithFallback } from '../../lib/eczemaAssistant';
import type { ChatMessage } from '../../types';

const SOURCE_BADGES: Record<string, { label: string; icon: typeof Sparkles }> = {
  gemini: { label: 'Gemini AI', icon: Sparkles },
  kb: { label: 'Yerel Bilgi Bankası', icon: BookOpen },
  online: { label: 'Wikipedia', icon: Globe },
  none: { label: 'Yanıt Bulunamadı', icon: HelpCircle }
};

const SUGGESTED_QUESTIONS = [
  'Dupixent nasıl etki eder?',
  'Cibinqo (JAK inhibitörü) yan etkileri nelerdir?',
  'Islak sargı tedavisi nedir?',
  'Alevlenme sırasında ne yapmalıyım?',
  'Nemlendirme rutini nasıl olmalı?',
  'Cilt bariyeri nasıl onarılır?'
];

export const AIChatAssistant: React.FC = () => {
  const { chatMessages, addChatMessage, clearChatMessages, t } = useApp();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatMessages, isTyping, isSearchingOnline]);

  const sendMessage = async (text: string) => {
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

    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 300));

    // Selamlama/teşekkür dışındaki HER gerçek soru için (yerel bilgi tabanında eşleşse bile)
    // önce Gemini AI'ya danışılır; yalnızca hızlı selamlama/teşekkür yolları tamamen yerelde kalır.
    const quickCheck = getAssistantReply(trimmed);
    let reply = quickCheck;
    if (quickCheck.source !== 'greeting' && quickCheck.source !== 'thanks') {
      setIsSearchingOnline(true);
      reply = await getAssistantReplyWithFallback(trimmed);
      setIsSearchingOnline(false);
    }

    const assistantMessage: ChatMessage = {
      id: `chat-${Date.now()}-a`,
      role: 'assistant',
      text: reply.text,
      timestamp: new Date().toLocaleString('tr-TR'),
      urgent: reply.urgent,
      source: reply.source
    };
    addChatMessage(assistantMessage);
    setIsTyping(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const showSuggestions = chatMessages.length <= 1;

  return (
    <div className="space-y-6">
      {/* Üst Şerit */}
      <div className="bg-neutral-900/60 p-6 rounded-3xl border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-neutral-800 text-neutral-300 border border-neutral-700">
              <Bot className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-semibold text-white tracking-tight">
              {t('title.chat')}
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Egzama, cilt bakımı ve tedaviler hakkında sorularını yanıtlar.
          </p>
        </div>

        <button
          onClick={clearChatMessages}
          className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 text-xs font-semibold flex items-center gap-1.5 shrink-0"
        >
          <Trash2 className="w-4 h-4" />
          Sohbeti Temizle
        </button>
      </div>

      {/* Sohbet Penceresi */}
      <div className="bg-neutral-900/60 rounded-3xl border border-neutral-800 flex flex-col h-[560px]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {chatMessages.map(msg => (
            <div key={msg.id} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <span className="w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-neutral-300" />
                </span>
              )}

              <div
                className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-white text-neutral-950 rounded-br-sm'
                    : msg.urgent
                      ? 'bg-rose-950/50 border border-rose-500/50 text-rose-100 rounded-bl-sm'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-200 rounded-bl-sm'
                }`}
              >
                {msg.urgent && (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-rose-300 uppercase mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Dikkat Gerektiren Konu
                  </span>
                )}
                <p className="whitespace-pre-line">{msg.text}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[9px] text-neutral-500">{msg.timestamp}</span>
                  {msg.role === 'assistant' && msg.source && SOURCE_BADGES[msg.source] && (
                    <span className="text-[9px] font-semibold text-neutral-500 flex items-center gap-1">
                      {(() => {
                        const Icon = SOURCE_BADGES[msg.source].icon;
                        return <Icon className="w-2.5 h-2.5" />;
                      })()}
                      {SOURCE_BADGES[msg.source].label}
                    </span>
                  )}
                </div>
              </div>

              {msg.role === 'user' && (
                <span className="w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-neutral-300" />
                </span>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-end gap-2 justify-start">
              <span className="w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-neutral-300" />
              </span>
              <div className="p-3.5 rounded-2xl rounded-bl-sm bg-neutral-950 border border-neutral-800 flex items-center gap-2">
                {isSearchingOnline ? (
                  <span className="text-[10px] text-neutral-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '2s' }} />
                    Gemini AI'ya danışılıyor...
                  </span>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 motion-safe:animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 motion-safe:animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 motion-safe:animate-bounce" />
                  </>
                )}
              </div>
            </div>
          )}

          {showSuggestions && (
            <div className="pt-2 space-y-2">
              <p className="text-[10px] uppercase font-bold text-neutral-500">Örnek Sorular</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[11px] border border-neutral-700 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Girdi Alanı */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-neutral-800 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Sorunuzu yazın..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2.5 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              aria-label="Gönder"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-neutral-600 px-1">
            Bu asistan tanı koymaz; ciddi veya kalıcı belirtilerde hekiminize danışın.
          </p>
        </form>
      </div>
    </div>
  );
};
