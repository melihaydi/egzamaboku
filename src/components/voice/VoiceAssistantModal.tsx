import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Sparkles, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const VoiceAssistantModal: React.FC = () => {
  const { voiceAssistantOpen, setVoiceAssistantOpen, updateHabitScore, addAuditLog } = useApp();
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('Bugün egzama bakımınıza nasıl yardımcı olabilirim? "Nemlendirici sürdüm" veya "Kaşıntı seviyem 5" diyebilirsiniz.');

  useEffect(() => {
    if (!voiceAssistantOpen) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'tr-TR';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        processVoiceCommand(text);
      };
      recognition.onend = () => setIsListening(false);

      if (isListening) recognition.start();
      return () => recognition.stop();
    }
  }, [voiceAssistantOpen, isListening]);

  const processVoiceCommand = (cmd: string) => {
    const text = cmd.toLowerCase();
    if (text.includes('nemlendirici') || text.includes('krem')) {
      updateHabitScore('moisturizerConsistency', 5);
      setAiResponse('Nemlendirici uygulaması kaydedildi! Günlük İyileşme Skorunuza +5 puan eklendi.');
      speakResponse('Nemlendirici uygulaması kaydedildi.');
      addAuditLog('Sesli Asistan', 'Komut işlendi: Nemlendirici uygulaması kaydedildi.');
    } else if (text.includes('kaşıntı') || text.includes('alevlenme')) {
      setAiResponse('Belirti güncellemesi kaydedildi. Alevlenme tahmin modeli güncellendi.');
      speakResponse('Belirti kaydı alındı.');
      addAuditLog('Sesli Asistan', `Komut işlendi: Belirti kaydı "${cmd}".`);
    } else {
      setAiResponse(`Komut alındı: "${cmd}". Bakım rutini güncellendi.`);
      speakResponse(`Komut işlendi.`);
    }
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!voiceAssistantOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-sky-500/40 rounded-3xl max-w-lg w-full p-6 text-slate-100 shadow-2xl space-y-6 relative">
        <button
          onClick={() => setVoiceAssistantOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Yapay Zeka Sesli Asistan (Eller Serbest Kontrol)
            </h2>
            <p className="text-xs text-slate-400">Türkçe Ses Tanıma & Konuşma Motoru</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
          <button
            onClick={() => setIsListening(!isListening)}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${
              isListening
                ? 'bg-rose-500 animate-pulse text-white shadow-rose-500/50 scale-105'
                : 'bg-gradient-to-tr from-sky-500 to-indigo-600 text-white hover:scale-105'
            }`}
          >
            {isListening ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
          </button>
          <span className="text-xs font-semibold text-sky-400">
            {isListening ? 'Dinleniyor... Konuşabilirsiniz' : 'Konuşmak İçin Mikrofona Dokunun'}
          </span>
          {transcript && (
            <p className="text-xs text-slate-300 italic px-4 text-center">
              "{transcript}"
            </p>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
          <span className="font-bold text-sky-400 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            Asistan Yanıtı:
          </span>
          <p className="text-slate-300 leading-relaxed">
            {aiResponse}
          </p>
        </div>

        <div className="space-y-1.5 text-xs text-slate-400">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Örnek Komutlar:</span>
          <div className="flex flex-wrap gap-2">
            {['"Nemlendirici sürdüm"', '"Kaşıntı seviyem 4"', '"Dupixent aşısı yaptım"', '"İyileşme durumumu göster"'].map((cmd, i) => (
              <button
                key={i}
                onClick={() => {
                  setTranscript(cmd);
                  processVoiceCommand(cmd);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-sky-500/20 text-slate-300 text-[11px] border border-slate-700"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
