import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Megaphone, Clock, Tag, Loader2, AlertCircle, Bell, Trash2 } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: Timestamp;
}

interface NewsFeedProps {
  maxItems?: number;
  showTitle?: boolean;
  adminMode?: boolean;
  onDelete?: (id: string) => void;
}

export default function NewsFeed({ maxItems = 5, showTitle = true, adminMode = false, onDelete }: NewsFeedProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'announcements'), 
      orderBy('createdAt', 'desc'),
      limit(maxItems)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Announcement[];
      setAnnouncements(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'announcements');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [maxItems]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-300">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Récupération des nouvelles...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {showTitle && (
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-church-dark flex items-center gap-2 uppercase tracking-tight">
            <Megaphone className="text-church-accent" size={24} />
            Dernières Annonces
          </h2>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
            <Bell size={14} className="text-church-blue animate-pulse" />
            Direct de Kinshasa
          </div>
        </div>
      )}

      {announcements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl">
          <AlertCircle size={32} className="mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest">Aucune annonce récente</p>
        </div>
      ) : (
        <div className="space-y-6">
          {announcements.map((ann, i) => (
            <motion.div 
              key={ann.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative bg-white border border-church-border rounded-2xl p-6 hover:shadow-md transition-all hover:border-church-blue/30"
            >
              {adminMode && onDelete && (
                <button 
                  onClick={() => onDelete(ann.id)}
                  className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              )}

              <div className="flex items-center gap-3 mb-3">
                <span className="bg-blue-50 text-church-blue text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-widest">
                  {ann.category}
                </span>
                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                  <Clock size={12} />
                  {ann.createdAt ? format(ann.createdAt.toDate(), 'dd MMM yyyy', { locale: fr }) : 'À l\'instant'}
                </div>
              </div>

              <h3 className="text-sm font-black text-church-dark mb-1">{ann.title}</h3>
              <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">{ann.content}</p>
              
              <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-church-blue uppercase tracking-widest hover:underline cursor-pointer">
                Lire la suite →
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
