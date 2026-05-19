import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Book, RefreshCw } from 'lucide-react';
import { generateAIContent } from '../../services/aiService';

export default function VerseOfTheDay() {
  const [verse, setVerse] = useState<{ text: string, reference: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVerse = async () => {
    // Check cache first (valid for 24 hours)
    const cachedVerse = localStorage.getItem('verse_of_the_day');
    const cacheTimestamp = localStorage.getItem('verse_timestamp');
    const now = new Date().getTime();

    if (cachedVerse && cacheTimestamp) {
      const dayInMs = 24 * 60 * 60 * 1000;
      if (now - parseInt(cacheTimestamp) < dayInMs) {
        setVerse(JSON.parse(cachedVerse));
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await generateAIContent(
        "Génère un verset biblique inspirant pour aujourd'hui (en français). Réponds AU FORMAT JSON STRICT: { \"text\": \"verset\", \"reference\": \"référence\" }. N'ajoute aucun texte avant ou après le JSON.",
        "Tu es un assistant biblique spirituel."
      );
      
      const cleanJson = response.replace(/```json\n?|\n?```/g, '').trim();
      const data = JSON.parse(cleanJson);
      
      // Save to cache
      localStorage.setItem('verse_of_the_day', JSON.stringify(data));
      localStorage.setItem('verse_timestamp', now.toString());
      
      setVerse(data);
    } catch (error) {
      console.error("Error fetching AI verse:", error);
      
      const fallbacks = [
        { text: "Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance.", reference: "Jérémie 29:11" },
        { text: "L'Éternel est mon berger: je ne manquerai de rien.", reference: "Psaume 23:1" },
        { text: "Je puis tout par celui qui me fortifie.", reference: "Philippiens 4:13" },
        { text: "Ne t'ai-je pas donné cet ordre: Fortifie-toi et prends courage? Ne t'effraie point et ne t'épouvante point, car l'Éternel, ton Dieu, est avec toi dans tout ce que tu entreprendras.", reference: "Josué 1:9" }
      ];
      
      const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      setVerse(randomFallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerse();
  }, []);

  return (
    <div className="bg-church-dark/60 backdrop-blur-2xl rounded-[40px] p-8 md:p-10 border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-church-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-church-accent/10 rounded-xl flex items-center justify-center text-church-accent">
            <Book size={20} />
          </div>
          <div>
            <span className="block text-white/40 text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1">Inspirant</span>
            <span className="block font-display font-black uppercase tracking-widest text-xs text-white">Verset du Jour</span>
          </div>
        </div>
        <button 
          onClick={fetchVerse}
          disabled={loading}
          className="w-10 h-10 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-xl transition-all disabled:opacity-50 flex items-center justify-center"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-700"} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="h-3 bg-white/10 rounded-full w-full animate-pulse"></div>
            <div className="h-3 bg-white/10 rounded-full w-[90%] animate-pulse"></div>
            <div className="h-3 bg-white/10 rounded-full w-[40%] animate-pulse mt-6"></div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-white"
          >
            <p className="text-xl md:text-2xl font-serif italic mb-6 leading-relaxed text-blue-50/90 tracking-tight">
              "{verse?.text}"
            </p>
            <div className="flex items-center justify-end gap-3 text-church-accent">
              <div className="h-[1px] w-12 bg-church-accent/30"></div>
              <p className="font-black text-xs uppercase tracking-widest">
                {verse?.reference}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
