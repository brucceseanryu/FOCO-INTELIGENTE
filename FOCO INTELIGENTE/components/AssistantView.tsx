import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Cpu } from 'lucide-react';
import { ChatMessage } from '../types';
import { generateElectronicsHelp } from '../services/geminiService';

export const AssistantView: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: '¡Hola! Soy tu copiloto de ingeniería. Puedo ayudarte a calibrar el KY-037, configurar Sinric Pro para Google Home o explicarte cómo aislar el cargador dentro del socket. ¿Por dónde empezamos?',
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Contexto enriquecido para el prompt
    const enhancedPrompt = `
      Contexto del Proyecto:
      - Dispositivo: Interruptor inteligente en socket de luz.
      - MCU: ESP32 (WiFi).
      - Entrada: Sensor de sonido KY-037 (Detecta patrón de doble aplauso).
      - Salida: Relay 5V activando Foco 220V.
      - Fuente: Cargador de celular 5V desarmado y conectado a red 220V.
      - Software: Arduino C++, librería SinricPro para Google Assistant.
      
      Pregunta del usuario: ${userMsg.text}
    `;

    const responseText = await generateElectronicsHelp(enhancedPrompt);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-slate-900 md:bg-transparent animate-fade-in">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Cpu size={16} />}
            </div>
            <div className={`
              max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
              ${msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
              }
            `}>
              {msg.text.split('\n').map((line, i) => (
                <p key={i} className="mb-1 last:mb-0 min-h-[1rem]">{line}</p>
              ))}
              <span className="text-[10px] opacity-50 block mt-2 text-right">
                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          </div>
        ))}
        {loading && (
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
               <Bot size={16} className="animate-pulse" />
             </div>
             <div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-700">
               <div className="flex space-x-1">
                 <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                 <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                 <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
               </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800/50">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ej: ¿Cómo conecto Sinric Pro? o ¿Por qué no detecta mis aplausos?"
            className="w-full bg-slate-800 text-slate-200 rounded-full pl-6 pr-12 py-3 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-full transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};