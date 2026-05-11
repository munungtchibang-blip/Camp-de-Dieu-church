import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Image as ImageIcon, Video, Play, Maximize2, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  category: string;
  url: string;
  title: string;
}

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMediaItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MediaItem[]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const categories = ['Tous', 'Cultes', 'Événements', 'Musique', 'Social', 'Témoignages'];

  const filteredMedia = activeCategory === 'Tous' 
    ? mediaItems 
    : mediaItems.filter(item => item.category === activeCategory);

  return (
    <div className="pt-32 pb-20 bg-church-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-church-blue/10 text-church-blue px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            Archives Visuelles
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black text-church-dark mb-4">Galerie Media</h1>
          <p className="text-slate-500 max-w-2xl mx-auto font-medium">Revivez les moments forts de notre communauté à travers ces images et vidéos inspirantes.</p>
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
                  ? "bg-church-dark text-white shadow-xl ring-4 ring-blue-50" 
                  : "bg-white text-slate-400 border border-church-border hover:bg-slate-50"
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
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Chargement de la galerie...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMedia.map((item, i) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group relative aspect-square bg-white rounded-3xl overflow-hidden shadow-sm border border-church-border cursor-pointer"
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
                <div className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                  {item.type === 'video' ? <Video size={14} /> : <ImageIcon size={14} />}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More Callout */}
        <div className="mt-20 text-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Plus de 500 souvenirs à explorer</p>
          <button className="px-12 py-5 bg-white border border-church-border text-church-dark rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:shadow-xl hover:border-church-blue transition-all">
            Charger Plus de Media
          </button>
        </div>
      </div>
    </div>
  );
}
