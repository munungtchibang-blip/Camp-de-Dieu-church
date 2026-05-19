import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Image as ImageIcon, Video, Play, Maximize2, Loader2, X, Download } from 'lucide-react';
import { cn } from '../lib/utils';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  category: string;
  url: string;
  title: string;
  description?: string;
}

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayLimit, setDisplayLimit] = useState(12);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMediaItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MediaItem[]);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'gallery');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: open in new tab
      window.open(url, '_blank');
    }
  };

  const categories = ['Tous', 'Cultes', 'Événements', 'Musique', 'Social', 'Témoignages'];

  const filteredMedia = activeCategory === 'Tous' 
    ? mediaItems 
    : mediaItems.filter(item => item.category === activeCategory);

  return (
    <div className="pt-32 pb-20 bg-church-bg dark:bg-dark-bg min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-church-blue/10 text-church-blue px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            Archives Visuelles
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black text-church-dark dark:text-white mb-4">Galerie Media</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">Revivez les moments forts de notre communauté à travers ces images et vidéos inspirantes.</p>
        </motion.div>

        {/* Filter Bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                activeCategory === cat 
                  ? "bg-church-dark dark:bg-church-blue text-white shadow-xl ring-4 ring-blue-50 dark:ring-blue-900/20" 
                  : "bg-white dark:bg-dark-card text-slate-400 border border-church-border dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Media Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="animate-spin text-church-blue mx-auto mb-4" size={40} />
            <p className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-widest">Chargement de la galerie...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMedia.slice(0, displayLimit).map((item, i) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedItem(item)}
                className="group relative aspect-square bg-white dark:bg-dark-card rounded-3xl overflow-hidden shadow-sm border border-church-border dark:border-dark-border cursor-pointer"
              >
                <img 
                  src={item.url} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-church-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-black text-church-gold uppercase tracking-widest">{item.category}</span>
                      <h3 className="text-white text-xs font-black uppercase tracking-tight mt-1">{item.title}</h3>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                      {item.type === 'video' ? <Play size={14} fill="currentColor" /> : <Maximize2 size={14} />}
                    </div>
                  </div>
                </div>
                
                {/* Type Indicator Icon (Floating) */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/10 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center text-white">
                  {item.type === 'video' ? <Video size={14} /> : <ImageIcon size={14} />}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More Callout */}
        {filteredMedia.length > displayLimit && (
          <div className="mt-20 text-center">
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Plus de {mediaItems.length - displayLimit} souvenirs à explorer</p>
            <button 
              onClick={() => setDisplayLimit(prev => prev + 12)}
              className="px-12 py-5 bg-white dark:bg-dark-card border border-church-border dark:border-dark-border text-church-dark dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:shadow-xl hover:border-church-blue transition-all"
            >
              Charger Plus de Media
            </button>
          </div>
        )}

        {/* Lightbox Overlay */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-church-dark/95 backdrop-blur-md flex items-center justify-center p-4 md:p-12"
            >
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white text-white hover:text-church-dark rounded-2xl transition-all z-10"
              >
                <X size={24} />
              </button>

              <div className="max-w-7xl w-full h-full flex flex-col items-center justify-center relative">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full h-[80%] flex items-center justify-center mb-8"
                >
                  {selectedItem.type === 'video' ? (
                    <div className="aspect-video w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl relative">
                      <iframe 
                        src={selectedItem.url.includes('youtube.com') || selectedItem.url.includes('youtu.be') 
                          ? selectedItem.url.replace('watch?v=', 'embed/').split('&')[0] 
                          : selectedItem.url}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <img 
                      src={selectedItem.url} 
                      alt={selectedItem.title} 
                      className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </motion.div>

                <div className="w-full max-w-2xl text-center space-y-4">
                  <span className="text-church-gold text-[10px] font-black uppercase tracking-[0.3em]">{selectedItem.category}</span>
                  <h2 className="text-white text-2xl md:text-3xl font-display font-black uppercase tracking-tight">{selectedItem.title}</h2>
                  {selectedItem.description && (
                    <p className="text-white/60 text-sm font-medium leading-relaxed">{selectedItem.description}</p>
                  )}
                  
                  <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                    {selectedItem.type === 'image' && (
                      <button 
                        onClick={() => handleDownload(selectedItem.url, selectedItem.title)}
                        className="flex items-center gap-3 px-8 py-4 bg-white text-church-dark rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-church-gold transition-all"
                      >
                        <Download size={16} />
                        Télécharger en HD
                      </button>
                    )}
                    <button 
                      onClick={() => setSelectedItem(null)}
                      className="px-8 py-4 bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10"
                    >
                      Fermer la vue
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
