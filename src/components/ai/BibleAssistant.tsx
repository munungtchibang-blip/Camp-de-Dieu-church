import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Book, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { generateAIContent } from '../../services/aiService';

export default function BibleAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Bonjour ! Je suis votre assistant biblique CAMP DE DIEU. Comment puis-je vous aider dans votre méditation aujourd\'hui ?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await generateAIContent(
        userMsg,
        "Tu es un assistant biblique sage et bienveillant pour l'église CAMP DE DIEU à Kinshasa. Réponds aux questions spirituelles en te basant sur la Bible, avec un ton encourageant et respectueux. Ta réponse doit être en français."
      );
      
      setMessages(prev => [...prev, { role: 'ai', text: response || 'Je m\'excuse, je n\'ai pas pu traiter votre demande.' }]);
    } catch (error: any) {
      console.error("AI Error:", error);
      const errorMsg = error.message || 'Désolé, j\'ai une petite difficulté technique.';
      setMessages(prev => [...prev, { role: 'ai', text: `${errorMsg} Que la paix du Seigneur soit avec vous.` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-church-blue text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center border-2 border-church-gold/30"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && (
          <span className="absolute -top-2 -right-2 bg-church-gold text-church-blue text-[10px] font-black px-2 py-1 rounded-full shadow-sm blink">
            IA
          </span>
        )}
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 z-50 w-[350px] md:w-[400px] bg-white dark:bg-dark-card rounded-3xl shadow-2xl border border-gray-100 dark:border-dark-border overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-church-blue p-6 text-white flex items-center space-x-3">
              <div className="bg-church-gold p-2 rounded-xl">
                <Book size={20} className="text-church-blue" />
              </div>
              <div>
                <h3 className="font-bold">Assistant Biblique</h3>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-[10px] opacity-70 font-medium uppercase tracking-widest text-green-400">Propulsé par IA</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-grow p-6 space-y-4 max-h-[400px] overflow-y-auto bg-gray-50/50 dark:bg-slate-900/50"
            >
              {messages.map((m, i) => (
                <motion.div
                  initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "p-3 rounded-2xl text-sm leading-relaxed",
                    m.role === 'user' 
                      ? "bg-church-blue text-white rounded-tr-none" 
                      : "bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-700 dark:text-slate-200 shadow-sm rounded-tl-none"
                  )}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex items-center space-x-2 text-gray-400">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-slate-600 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-slate-600 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-slate-600 rounded-full animate-bounce delay-150"></div>
                  </div>
                  <span className="text-[10px] italic">L'assistant réfléchit...</span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-dark-card border-t border-gray-100 dark:border-dark-border">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Posez votre question biblique..."
                  className="w-full bg-gray-100 dark:bg-slate-800 border-none rounded-2xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-church-gold transition-all dark:text-white dark:placeholder:text-slate-500"
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-church-blue hover:text-church-gold transition-colors disabled:opacity-30"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
