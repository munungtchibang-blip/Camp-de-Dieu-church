import { motion } from 'framer-motion';
import { Megaphone, Bell } from 'lucide-react';
import NewsFeed from '../components/news/NewsFeed';

export default function Announcements() {
  return (
    <div className="pt-32 pb-20 bg-church-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-16 text-center"
        >
          <div className="inline-block bg-church-blue/10 text-church-blue px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            Actualités & Communiqués
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black text-church-dark mb-4 flex items-center justify-center gap-4">
            <Megaphone className="text-church-blue hidden md:block" size={48} />
            Annonces de l'Église
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto font-medium">
            Restez informé sur la vie de notre communauté, les événements spéciaux et les messages de la direction.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-church-border pb-4">
            <Bell size={14} className="text-church-blue animate-pulse" />
            Toutes les annonces publiées
          </div>
          <NewsFeed maxItems={50} showTitle={false} />
        </div>
      </div>
    </div>
  );
}
