import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Book, RefreshCw } from 'lucide-react';
import { generateAIContent } from '../../services/aiService';

export default function VerseOfTheDay() {
  const [verse, setVerse] = useState<{ text: string, reference: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVerse = async () => {
    setLoading(true);
    try {
      const response = await generateAIContent(
        "Génère un verset biblique inspirant pour aujourd'hui (en français). Réponds AU FORMAT JSON STRICT: { \"text\": \"verset\", \"reference\": \"référence\" }. N'ajoute aucun texte avant ou après le JSON.",
        "Tu es un assistant biblique spirituel."
      );
      
      const cleanJson = response.replace(/```json\n?|\n?```/g, '').trim();
      const data = JSON.parse(cleanJson);
      setVerse(data);
    } catch (error) {
      console.error("Error fetching AI verse:", error);
      setVerse({
        text: "Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance.",
        reference: "Jérémie 29:11"
      });
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
