import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Mic2, Download, FileText, Search, Play, Filter, Calendar as CalendarIcon, User, Loader2, Share2, Facebook, Twitter, Mail, Copy, Check } from 'lucide-react';
import { collection, query, orderBy, where, getDocs, onSnapshot, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AudioPlayer from '../components/AudioPlayer';

interface Sermon {
  id: string;
  title: string;
  preacher: string;
  date: any;
  category: string;
  description?: string;
  videoUrl?: string;
  audioUrl?: string;
  pdfUrl?: string;
  imageUrl?: string;
}

const sortingOptions = [
  { id: 'newest', label: 'Plus récent' },
  { id: 'oldest', label: 'Plus ancien' },
];

export default function Sermons() {
  const [activeTab, setActiveTab] = useState("Tous");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [categories, setCategories] = useState<string[]>(["Tous"]);
  const [loading, setLoading] = useState(true);
  const [preachers, setPreachers] = useState<string[]>([]);
  const [selectedPreacher, setSelectedPreacher] = useState("Tous");
  const [selectedYear, setSelectedYear] = useState("Tous");
  const [selectedMonth, setSelectedMonth] = useState("Tous");
  const [activeAudio, setActiveAudio] = useState<string | null>(null);
  const [sharingSermon, setSharingSermon] = useState<Sermon | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = async (sermon: Sermon) => {
    const shareData = {
      title: sermon.title,
      text: `Écoutez le sermon "${sermon.title}" par ${sermon.preacher} sur CDD Kinshasa.`,
      url: window.location.href, // In a real app, this would be a deep link to the sermon
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Error sharing:", err);
        setSharingSermon(sermon);
      }
    } else {
      setSharingSermon(sermon);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const years = ["Tous", ...Array.from(new Set(sermons.map(s => {
    const d = s.date?.toDate ? s.date.toDate() : new Date(s.date);
    return d.getFullYear().toString();
  }))).sort().reverse()];

  const months = [
    { value: "Tous", label: "MOIS" },
    { value: "0", label: "JANVIER" },
    { value: "1", label: "FÉVRIER" },
    { value: "2", label: "MARS" },
    { value: "3", label: "AVRIL" },
    { value: "4", label: "MAI" },
    { value: "5", label: "JUIN" },
    { value: "6", label: "JUILLET" },
    { value: "7", label: "AOÛT" },
    { value: "8", label: "SEPTEMBRE" },
    { value: "9", label: "OCTOBRE" },
    { value: "10", label: "NOVEMBRE" },
    { value: "11", label: "DÉCEMBRE" },
  ];

  useEffect(() => {
    setLoading(true);
    let q = collection(db, 'sermons');
    
    const unsubscribe = onSnapshot(query(q, orderBy('date', sortBy === 'newest' ? 'desc' : 'asc')), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Sermon[];
      setSermons(data);
      
      // Extract unique categories dynamically
      const uniqueCategories = Array.from(new Set(data.map(s => s.category))).filter(Boolean);
      setCategories(["Tous", ...uniqueCategories]);

      // Extract unique preachers
      const uniquePreachers = Array.from(new Set(data.map(s => s.preacher))).filter(Boolean);
      setPreachers(["Tous", ...uniquePreachers]);
      
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'sermons');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sortBy]);

  const filteredSermons = sermons.filter(sermon => {
    const sermonDate = sermon.date?.toDate ? sermon.date.toDate() : new Date(sermon.date);
    const matchesSearch = sermon.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sermon.preacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeTab === "Tous" || sermon.category === activeTab;
    const matchesPreacher = selectedPreacher === "Tous" || sermon.preacher === selectedPreacher;
    const matchesYear = selectedYear === "Tous" || sermonDate.getFullYear().toString() === selectedYear;
    const matchesMonth = selectedMonth === "Tous" || sermonDate.getMonth().toString() === selectedMonth;
    
    return matchesSearch && matchesCategory && matchesPreacher && matchesYear && matchesMonth;
  });

  return (
    <div className="pt-32 pb-20 bg-church-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="inline-block bg-church-blue/10 text-church-blue px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            Parole & Enseignement
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-church-dark mb-4">Bibliothèque de Prédications</h1>
          <p className="text-slate-500 max-w-2xl font-medium">Édifiez votre foi avec notre collection exhaustive de messages inspirés par le Saint-Esprit.</p>
        </motion.div>
        
        {/* Filters & Tools */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-church-border mb-12 flex flex-col lg:flex-row gap-6 items-center">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par titre ou pasteur..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-church-blue transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            {/* Preacher Filter */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 min-w-[140px]">
              <User size={16} className="text-slate-400" />
              <select 
                value={selectedPreacher}
                onChange={(e) => setSelectedPreacher(e.target.value)}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none appearance-none pr-6 w-full"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '12px' }}
              >
                {preachers.map(p => <option key={p} value={p}>{p === "Tous" ? "PRÉDICATEUR" : p.toUpperCase()}</option>)}
              </select>
            </div>

            {/* Year Filter */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 min-w-[100px]">
              <CalendarIcon size={16} className="text-slate-400" />
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none appearance-none pr-6 w-full"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '12px' }}
              >
                {years.map(y => <option key={y} value={y}>{y === "Tous" ? "ANNÉE" : y}</option>)}
              </select>
            </div>

            {/* Month Filter */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 min-w-[130px]">
              <Filter size={16} className="text-slate-400" />
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none appearance-none pr-6 w-full"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '12px' }}
              >
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-100/50 rounded-2xl border border-slate-200">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none appearance-none pr-6"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '12px' }}
              >
                {sortingOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label.toUpperCase()}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Themes Tab Bar */}
        <div className="flex flex-col gap-4 mb-12">
          <div className="flex items-center gap-2 mb-2">
            <Filter size={16} className="text-church-blue" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Filtrer par Thème</span>
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-4 no-scrollbar">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setActiveTab(c)}
                className={cn(
                  "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap",
                  activeTab === c 
                    ? "bg-church-dark text-white shadow-xl ring-4 ring-blue-50" 
                    : "bg-white text-slate-400 border border-church-border hover:bg-slate-50"
                )}
              >
                {c === "Tous" ? "Tous les Thèmes" : c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="animate-spin text-church-blue mx-auto mb-4" size={48} />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Chargement de la bibliothèque...</p>
          </div>
        ) : filteredSermons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSermons.map((sermon, i) => (
              <motion.div 
                key={sermon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-[40px] border border-church-border shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-500"
              >
                <div className="aspect-video bg-slate-100 relative overflow-hidden">
                  <img 
                    src={sermon.imageUrl || `https://images.unsplash.com/photo-1544717305-27a734ef41v4?auto=format&fit=crop&q=80&w=800`}
                    alt={sermon.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-church-dark/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                    <div className="w-16 h-16 bg-church-gold rounded-full flex items-center justify-center text-church-dark shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                      <Play fill="currentColor" size={28} />
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 flex justify-between w-[calc(100%-32px)]">
                    <span className="px-3 py-1 bg-church-blue text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                      {sermon.category}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleShare(sermon); }}
                      className="p-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-church-gold hover:text-church-dark transition-all"
                    >
                      <Share2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-church-blue">
                      <User size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-church-dark uppercase tracking-wide">{sermon.preacher}</p>
                      <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                        <CalendarIcon size={10} />
                        <span>{sermon.date?.toDate ? format(sermon.date.toDate(), 'dd MMMM yyyy', { locale: fr }) : sermon.date}</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-church-dark mb-6 leading-tight line-clamp-2 uppercase tracking-tight group-hover:text-church-blue transition-colors">
                    {sermon.title}
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {sermon.audioUrl && (
                        <button 
                          onClick={() => setActiveAudio(activeAudio === sermon.id ? null : sermon.id)}
                          className={cn(
                            "flex items-center justify-center gap-2 py-3 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest shadow-sm",
                            activeAudio === sermon.id ? "bg-church-dark text-white ring-4 ring-slate-100" : "bg-slate-50 text-slate-600 hover:bg-church-blue hover:text-white"
                          )}
                        >
                          <Mic2 size={14} />
                          {activeAudio === sermon.id ? 'Fermer Player' : 'Audio'}
                        </button>
                      )}
                      {sermon.pdfUrl && (
                        <a 
                          href={sermon.pdfUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-church-blue hover:text-white transition-all text-[10px] font-black uppercase tracking-widest shadow-sm"
                        >
                          <FileText size={14} />
                          PDF
                        </a>
                      )}
                    </div>

                    <AnimatePresence>
                      {activeAudio === sermon.id && sermon.audioUrl && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        >
                          <AudioPlayer url={sermon.audioUrl} title={sermon.title} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-black text-church-dark mb-2">Aucune prédication trouvée</h3>
            <p className="text-slate-400 text-sm font-medium">Essayez d'ajuster vos filtres ou votre recherche.</p>
            <button 
              onClick={() => {
                setSearchTerm("");
                setActiveTab("Tous");
                setSelectedPreacher("Tous");
                setSelectedYear("Tous");
                setSelectedMonth("Tous");
              }}
              className="mt-8 px-8 py-3 bg-church-blue text-white rounded-xl font-black text-[10px] uppercase tracking-widest"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Share Modal Backdrop */}
      <AnimatePresence>
        {sharingSermon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-church-dark/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setSharingSermon(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] w-full max-w-sm overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-church-dark uppercase tracking-tight">Partager</h3>
                  <button onClick={() => setSharingSermon(null)} className="text-slate-400 hover:text-church-dark transition-colors">
                    <Check size={24} />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-blue-50 transition-all group"
                  >
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                      <Facebook size={20} />
                    </div>
                    <span className="text-xs font-black text-church-dark uppercase tracking-widest">Facebook</span>
                  </a>

                  <a 
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Écoutez "${sharingSermon.title}" par ${sharingSermon.preacher}`)}&url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all group"
                  >
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
                      <Twitter size={20} />
                    </div>
                    <span className="text-xs font-black text-church-dark uppercase tracking-widest">X (Twitter)</span>
                  </a>

                  <a 
                    href={`mailto:?subject=${encodeURIComponent(sharingSermon.title)}&body=${encodeURIComponent(`Voici un sermon inspirant à écouter : ${window.location.href}`)}`}
                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all group"
                  >
                    <div className="w-10 h-10 bg-slate-400 rounded-xl flex items-center justify-center text-white">
                      <Mail size={20} />
                    </div>
                    <span className="text-xs font-black text-church-dark uppercase tracking-widest">Email</span>
                  </a>

                  <button 
                    onClick={() => copyToClipboard(window.location.href)}
                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-church-blue/10 transition-all group w-full text-left"
                  >
                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-church-blue">
                      {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                    </div>
                    <span className="text-xs font-black text-church-dark uppercase tracking-widest">
                      {copied ? 'Lien copié !' : 'Copier le lien'}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
