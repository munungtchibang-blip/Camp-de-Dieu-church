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
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-church-gold">
          <Book size={20} />
          <span className="font-display font-semibold uppercase tracking-wider text-xs">Verset du Jour</span>
        </div>
        <button 
          onClick={fetchVerse}
          disabled={loading}
          className="p-1 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <div className="h-4 bg-white/20 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-white/20 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-white/20 rounded w-1/2 animate-pulse mt-4"></div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white"
          >
            <p className="text-xl font-serif italic mb-4 leading-relaxed">
              "{verse?.text}"
            </p>
            <p className="text-church-gold font-bold text-right">
              — {verse?.reference}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
