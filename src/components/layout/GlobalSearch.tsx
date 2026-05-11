import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Mic2, Megaphone, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { collection, query, getDocs, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Link } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  type: 'sermon' | 'announcement' | 'event';
  url: string;
  date?: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setSearchTerm('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (searchTerm.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const foundResults: SearchResult[] = [];
        
        // Search Sermons
        const sermonsSnap = await getDocs(query(collection(db, 'sermons'), limit(5)));
        sermonsSnap.docs.forEach(doc => {
          const data = doc.data();
          if (data.title.toLowerCase().includes(searchTerm.toLowerCase())) {
            foundResults.push({
              id: doc.id,
              title: data.title,
              type: 'sermon',
              url: '/predications',
              date: data.date
            });
          }
        });

        // Search Announcements
        const annSnap = await getDocs(query(collection(db, 'announcements'), limit(5)));
        annSnap.docs.forEach(doc => {
          const data = doc.data();
          if (data.title.toLowerCase().includes(searchTerm.toLowerCase())) {
            foundResults.push({
              id: doc.id,
              title: data.title,
              type: 'announcement',
              url: '/',
            });
          }
        });

        // Search Events
        const eventsSnap = await getDocs(query(collection(db, 'events'), limit(5)));
        eventsSnap.docs.forEach(doc => {
          const data = doc.data();
          if (data.title.toLowerCase().includes(searchTerm.toLowerCase())) {
            foundResults.push({
              id: doc.id,
              title: data.title,
              type: 'event',
              url: '/programmes',
              date: data.start
            });
          }
        });

        setResults(foundResults);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const typeIcons = {
    sermon: <Mic2 size={16} className="text-church-blue" />,
    announcement: <Megaphone size={16} className="text-church-accent" />,
    event: <Calendar size={16} className="text-church-gold" />
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-church-dark/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20"
          >
            <div className="p-6 border-b border-slate-100 flex items-center gap-4">
              <Search className="text-slate-400" size={24} />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une prédication, un événement..."
                className="flex-1 bg-transparent border-none outline-none text-lg font-medium text-church-dark placeholder:text-slate-300"
              />
              <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                <X className="text-slate-400" size={20} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
              {loading && (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <Loader2 className="animate-spin" size={32} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Recherche en cours...</p>
                </div>
              )}

              {!loading && results.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">Résultats</p>
                  {results.map((result) => (
                    <Link
                      key={`${result.type}-${result.id}`}
                      to={result.url}
                      onClick={onClose}
                      className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all group border border-transparent hover:border-slate-100"
                    >
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        {typeIcons[result.type]}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-black text-church-dark uppercase tracking-tight line-clamp-1">{result.title}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{result.type}</p>
                      </div>
                      <ArrowRight size={18} className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              )}

              {!loading && searchTerm.length >= 2 && results.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Aucun résultat pour "{searchTerm}"</p>
                </div>
              )}

              {searchTerm.length < 2 && !loading && (
                <div className="py-20 text-center flex flex-col items-center">
                  <Search size={40} className="text-slate-100 mb-4" />
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Entrez au moins 2 caractères</p>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <div className="flex gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-church-blue rounded-full"></div>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Prédications</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-church-accent rounded-full"></div>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Annonces</span>
                </div>
              </div>
              <p className="text-[9px] font-bold text-slate-300">ESC pour fermer</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
