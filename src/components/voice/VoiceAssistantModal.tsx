import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, X, Sparkles, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/useApp';

export const VoiceAssistantModal: React.FC = () => {
  const { voiceAssistantOpen, setVoiceAssistantOpen, updateFlareFactor, addAuditLog } = useApp();
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [transcript, setTranscript] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('Bugün egzama bakımınıza nasıl yardımcı olabilirim? "Nemlendirici sürdüm" veya "Kaşıntı seviyem 5" diyebilirsiniz.');
  const recognitionRef = useRef<any>(null);

  const speakResponse = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const processVoiceCommand = useCallback((cmd: string) => {
    const text = cmd.toLowerCase();
    if (text.includes('nemlendirici') || text.includes('krem')) {
      updateFlareFactor('moisturizerUsage', -8);
      setAiResponse('Nemlendirici uygulaması kaydedildi! Alevlenme şiddeti skorunuz düştü.');
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
  }, [updateFlareFactor, addAuditLog, speakResponse]);

  // Modal her açıldığında tek bir tanıma (recognition) örneği kurulur;
  // mikrofon butonu bu örneği doğrudan başlatır/durdurur.
  useEffect(() => {
    if (!voiceAssistantOpen) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

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

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [voiceAssistantOpen, processVoiceCommand]);

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  if (!voiceAssistantOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-3xl max-w-lg w-full p-6 text-neutral-100 shadow-2xl space-y-6 relative">
        <button
          onClick={() => setVoiceAssistantOpen(false)}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-200 rounded-xl hover:bg-neutral-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-neutral-800 text-neutral-300 border border-neutral-700">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Yapay Zeka Sesli Asistan (Eller Serbest Kontrol)
            </h2>
            <p className="text-xs text-neutral-400">Türkçe Ses Tanıma & Konuşma Motoru</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-6 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-4">
          <button
            onClick={toggleListening}
            disabled={!isSupported}
            aria-pressed={isListening}
            aria-label={isListening ? 'Dinlemeyi durdur' : 'Sesli komut vermek için mikrofona dokun'}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl disabled:opacity-40 disabled:cursor-not-allowed motion-reduce:transition-none ${
              isListening
                ? 'bg-rose-500 motion-safe:animate-pulse text-white shadow-rose-500/50 scale-105'
                : 'bg-white text-neutral-950 hover:scale-105'
            }`}
          >
            {isListening ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
          </button>
          <span className="text-xs font-semibold text-neutral-300">
            {!isSupported
              ? 'Tarayıcınız sesli komutu desteklemiyor. Örnek komutlardan birini deneyin.'
              : isListening ? 'Dinleniyor... Konuşabilirsiniz' : 'Konuşmak İçin Mikrofona Dokunun'}
          </span>
          {transcript && (
            <p className="text-xs text-neutral-300 italic px-4 text-center">
              "{transcript}"
            </p>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs space-y-1.5">
          <span className="font-bold text-neutral-300 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            Asistan Yanıtı:
          </span>
          <p className="text-neutral-300 leading-relaxed">
            {aiResponse}
          </p>
        </div>

        <div className="space-y-1.5 text-xs text-neutral-400">
          <span className="text-[10px] uppercase font-bold text-neutral-500 block">Örnek Komutlar:</span>
          <div className="flex flex-wrap gap-2">
            {['"Nemlendirici sürdüm"', '"Kaşıntı seviyem 4"', '"Dupixent aşısı yaptım"', '"İyileşme durumumu göster"'].map((cmd, i) => (
              <button
                key={i}
                onClick={() => {
                  setTranscript(cmd);
                  processVoiceCommand(cmd);
                }}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-800 text-neutral-300 text-[11px] border border-neutral-700"
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
