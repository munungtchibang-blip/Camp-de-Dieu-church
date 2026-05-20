import { motion } from 'framer-motion';
import { useState } from 'react';
import { Megaphone, Bell, Filter } from 'lucide-react';
import NewsFeed from '../components/news/NewsFeed';
import { cn } from '../lib/utils';

const categories = ['Tous', 'Séminaire', 'Marathon', 'Nuit de prière', 'Culte spécial', 'Général', 'Culte', 'Événement', 'Urgent', 'Jeunesse'];

export default function Announcements() {
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-32 pb-20 bg-church-bg dark:bg-dark-bg min-h-screen transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-16 text-center"
        >
          <div className="inline-block bg-church-blue/10 text-church-blue px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            Actualités & Communiqués
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black text-church-dark dark:text-white mb-4 flex items-center justify-center gap-4">
            <Megaphone className="text-church-blue hidden md:block" size={48} />
            Annonces de l'Église
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Restez informé sur la vie de notre communauté, les événements spéciaux et les messages de la direction.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Categories Tab Bar */}
          <div className="flex flex-col gap-4 mb-12">
            <div className="flex items-center gap-2 mb-2">
              <Filter size={16} className="text-church-blue" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Filtrer par Catégorie</span>
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-4 no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap",
                    selectedCategory === cat
                      ? "bg-church-dark dark:bg-church-blue text-white shadow-xl ring-4 ring-blue-50 dark:ring-blue-900/20"
                      : "bg-white dark:bg-dark-card text-slate-400 border border-church-border dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  {cat === 'Tous' ? 'Toutes les Annonces' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-8 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-church-border dark:border-dark-border pb-4">
            <Bell size={14} className="text-church-blue animate-pulse" />
            {selectedCategory === 'Tous' ? 'Toutes les annonces publiées' : `Annonces: ${selectedCategory}`}
          </div>
          <NewsFeed maxItems={50} showTitle={false} filterCategory={selectedCategory} />
        </div>
      </div>
    </motion.div>
  );
}
