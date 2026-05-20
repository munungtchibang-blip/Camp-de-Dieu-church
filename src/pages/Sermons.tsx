import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Mic2, Download, FileText, Search, Play, Filter, Calendar as CalendarIcon, User, Loader2, Share2, Facebook, Twitter, Mail, Copy, Check, Video, Sparkles } from 'lucide-react';
import { collection, query, orderBy, where, getDocs, onSnapshot, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AudioPlayer from '../components/AudioPlayer';
import VideoPlayer from '../components/sermons/VideoPlayer';

interface Sermon {
  id: string;
  title: string;
  preacher: string;
  date: any;
  category: string;
  description?: string;
  passages?: string;
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
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [selectedSermonDetail, setSelectedSermonDetail] = useState<Sermon | null>(null);
  const [generatingSubtitles, setGeneratingSubtitles] = useState(false);
  const [subtitles, setSubtitles] = useState<string | null>(null);
  const [sharingSermon, setSharingSermon] = useState<Sermon | null>(null);
  const [copied, setCopied] = useState(false);

  const generateSubtitles = async (sermon: Sermon) => {
    setGeneratingSubtitles(true);
    setSubtitles(null);
    try {
      const response = await fetch('/api/ai/subtitles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: sermon.title,
          preacher: sermon.preacher,
          description: sermon.description,
          passages: sermon.passages
        }),
      });
      const data = await response.json();
      if (data.text) {
        setSubtitles(data.text);
      }
    } catch (error) {
      console.error("Error generating subtitles:", error);
    } finally {
      setGeneratingSubtitles(false);
    }
  };

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

  // Lock background scroll when detail modal or sharing dialog is open
  useEffect(() => {
    if (selectedSermonDetail || sharingSermon) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedSermonDetail, sharingSermon]);

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
    <div className="pt-32 pb-20 bg-church-bg dark:bg-dark-bg min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="inline-block bg-church-blue/10 text-church-blue px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            Parole & Enseignement
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-church-dark dark:text-white mb-4">Bibliothèque de Prédications</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl font-medium">Édifiez votre foi avec notre collection exhaustive de messages inspirés par le Saint-Esprit.</p>
        </motion.div>
        
        {/* Filters & Tools */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-[32px] shadow-sm border border-church-border dark:border-dark-border mb-12 flex flex-col lg:flex-row gap-6 items-center">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par titre ou pasteur..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-church-blue dark:text-white transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            {/* Preacher Filter */}
            <div className="flex flex-col gap-1.5 min-w-[140px]">
              <label className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Prédicateur</label>
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 w-full">
                <User size={16} className="text-slate-400" />
                <select 
                  value={selectedPreacher}
                  onChange={(e) => setSelectedPreacher(e.target.value)}
                  className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none appearance-none pr-6 w-full dark:text-white"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '12px' }}
                >
                  {preachers.map(p => <option key={p} value={p} className="dark:bg-dark-card">{p === "Tous" ? "TOUS" : p.toUpperCase()}</option>)}
                </select>
              </div>
            </div>

            {/* Year Filter */}
            <div className="flex flex-col gap-1.5 min-w-[100px]">
              <label className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Année</label>
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <CalendarIcon size={16} className="text-slate-400" />
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none appearance-none pr-6 w-full dark:text-white"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '12px' }}
                >
                  {years.map(y => <option key={y} value={y} className="dark:bg-dark-card">{y === "Tous" ? "TOUTES" : y}</option>)}
                </select>
              </div>
            </div>

            {/* Month Filter */}
            <div className="flex flex-col gap-1.5 min-w-[130px]">
              <label className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Mois</label>
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <Filter size={16} className="text-slate-400" />
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none appearance-none pr-6 w-full dark:text-white"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '12px' }}
                >
                  {months.map(m => <option key={m.value} value={m.value} className="dark:bg-dark-card">{m.label}</option>)}
                </select>
              </div>
            </div>

            {/* Sort Filter */}
            <div className="flex flex-col gap-1.5 min-w-[120px]">
              <label className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Ordre</label>
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-100/50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none appearance-none pr-6 dark:text-white w-full"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '12px' }}
                >
                  {sortingOptions.map(opt => <option key={opt.id} value={opt.id} className="dark:bg-dark-card">{opt.label.toUpperCase()}</option>)}
                </select>
              </div>
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
            <AnimatePresence mode="popLayout">
              {categories.map(c => (
                <motion.button
                  layout
                  key={c}
                  onClick={() => setActiveTab(c)}
                  className={cn(
                    "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap",
                    activeTab === c 
                      ? "bg-church-dark dark:bg-church-blue text-white shadow-xl ring-4 ring-blue-50 dark:ring-blue-900/20" 
                      : "bg-white dark:bg-dark-card text-slate-400 border border-church-border dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  {c}
                </motion.button>
              ))}
            </AnimatePresence>
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
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-dark-card rounded-[40px] border border-church-border dark:border-dark-border shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-500"
              >
                <div className="aspect-video bg-slate-100 dark:bg-slate-900 relative overflow-hidden">
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
                    <div className="flex gap-2">
                      {sermon.videoUrl && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActiveVideo(activeVideo === sermon.id ? null : sermon.id); }}
                          className={cn(
                            "p-2 backdrop-blur-md rounded-lg transition-all",
                            activeVideo === sermon.id ? "bg-church-gold text-church-dark" : "bg-white/20 text-white hover:bg-church-gold hover:text-church-dark"
                          )}
                        >
                          <Video size={14} />
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleShare(sermon); }}
                        className="p-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-church-gold hover:text-church-dark transition-all"
                      >
                        <Share2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-church-blue">
                      <User size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-church-dark dark:text-white uppercase tracking-wide">{sermon.preacher}</p>
                      <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 dark:text-slate-500">
                        <CalendarIcon size={10} />
                        <span>{sermon.date?.toDate ? format(sermon.date.toDate(), 'dd MMMM yyyy', { locale: fr }) : sermon.date}</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-church-dark dark:text-white mb-2 leading-tight line-clamp-2 uppercase tracking-tight group-hover:text-church-blue transition-colors">
                    {sermon.title}
                  </h3>

                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={() => {
                        setSelectedSermonDetail(sermon);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full py-4 bg-church-blue/10 text-church-blue hover:bg-church-blue hover:text-white rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-church-blue/20"
                    >
                      Voir les Détails & Étude
                      <Search size={14} />
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {sermon.audioUrl && (
                        <button 
                          onClick={() => setActiveAudio(activeAudio === sermon.id ? null : sermon.id)}
                          className={cn(
                            "flex items-center justify-center gap-2 py-3 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest shadow-sm",
                            activeAudio === sermon.id ? "bg-church-dark dark:bg-church-blue text-white ring-4 ring-slate-100 dark:ring-slate-900/40" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-church-blue hover:text-white"
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
                          className="flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl hover:bg-church-blue hover:text-white transition-all text-[10px] font-black uppercase tracking-widest shadow-sm"
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
          <div className="py-32 text-center bg-white dark:bg-dark-card rounded-[40px] border-2 border-dashed border-slate-100 dark:border-dark-border">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 dark:text-slate-600 mx-auto mb-6">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-black text-church-dark dark:text-white mb-2">Aucune prédication trouvée</h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">Essayez d'ajuster vos filtres ou votre recherche.</p>
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

      {/* Sermon Detail View */}
      <AnimatePresence>
        {selectedSermonDetail && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-[150] bg-church-bg dark:bg-dark-bg overflow-y-auto"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <button 
                onClick={() => { setSelectedSermonDetail(null); setSubtitles(null); }}
                className="mb-8 flex items-center gap-2 text-slate-400 hover:text-church-blue transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-church-blue group-hover:text-white transition-all">
                  <Mic2 size={20} className="rotate-180" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest">Retour à la bibliothèque</span>
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white dark:bg-dark-card rounded-[48px] overflow-hidden border border-church-border dark:border-dark-border shadow-2xl">
                    {selectedSermonDetail.videoUrl ? (
                      <VideoPlayer videoUrl={selectedSermonDetail.videoUrl} title={selectedSermonDetail.title} className="aspect-video" />
                    ) : (
                      <div className="aspect-video bg-slate-100 dark:bg-slate-900 flex items-center justify-center relative">
                        <img 
                          src={selectedSermonDetail.imageUrl} 
                          alt="" 
                          className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm"
                        />
                        <Mic2 size={64} className="text-slate-300 dark:text-slate-700 relative z-10" />
                      </div>
                    )}

                    <div className="p-8 lg:p-12">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="px-4 py-1.5 bg-church-accent/10 text-church-accent text-[10px] font-black uppercase tracking-widest rounded-full">
                              {selectedSermonDetail.category}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {selectedSermonDetail.date?.toDate ? format(selectedSermonDetail.date.toDate(), 'dd MMMM yyyy', { locale: fr }) : selectedSermonDetail.date}
                            </span>
                          </div>
                          <h2 className="text-3xl lg:text-4xl font-display font-black text-church-dark dark:text-white leading-tight uppercase tracking-tight">
                            {selectedSermonDetail.title}
                          </h2>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => handleShare(selectedSermonDetail)}
                            className="p-4 bg-church-blue text-white rounded-2xl hover:bg-church-dark transition-all shadow-xl shadow-church-blue/20"
                          >
                            <Share2 size={24} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-6 bg-slate-50 dark:bg-slate-800 rounded-[32px] mb-12 border border-slate-100 dark:border-slate-700">
                        <div className="w-16 h-16 rounded-2xl bg-church-blue flex items-center justify-center text-white shadow-lg">
                          <User size={32} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Prédicateur</p>
                          <p className="text-xl font-black text-church-dark dark:text-white uppercase">{selectedSermonDetail.preacher}</p>
                        </div>
                      </div>

                      {selectedSermonDetail.passages && (
                        <div className="mb-12">
                          <h4 className="text-[10px] font-black text-church-accent uppercase tracking-widest mb-4 flex items-center gap-2">
                             <FileText size={16} /> Versets Clés
                          </h4>
                          <p className="text-2xl font-serif italic text-church-dark dark:text-slate-300 border-l-4 border-church-gold pl-6 py-2 leading-relaxed">
                            "{selectedSermonDetail.passages}"
                          </p>
                        </div>
                      )}

                      <div className="prose dark:prose-invert max-w-none">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Résumé du message</h4>
                        <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed text-lg">
                          {selectedSermonDetail.description || "Ce puissant message nous invite à approfondir notre relation avec Dieu et à marcher par la foi. Un enseignement vital pour cette saison de l'église."}
                        </p>
                      </div>

                      {/* AI Subtitles / Transcript Toggle */}
                      <div className="mt-12 pt-12 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-6">
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600">
                               <Sparkles size={20} />
                             </div>
                             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessibilité & IA</h4>
                           </div>
                           {!subtitles && (
                             <button 
                               onClick={() => generateSubtitles(selectedSermonDetail)}
                               disabled={generatingSubtitles}
                               className="px-6 py-3 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 disabled:opacity-50 transition-all flex items-center gap-2"
                             >
                               {generatingSubtitles ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                               {generatingSubtitles ? 'Génération en cours...' : 'Générer Sous-titres IA'}
                             </button>
                           )}
                        </div>

                        {subtitles && (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-900 rounded-[32px] p-8 text-white/90 font-medium space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Transcription IA Interactive</span>
                              <button onClick={() => setSubtitles(null)} className="text-[8px] font-black uppercase tracking-widest opacity-50 hover:opacity-100">Effacer</button>
                            </div>
                            <div className="whitespace-pre-wrap leading-relaxed text-sm">
                              {subtitles}
                            </div>
                          </motion.div>
                        )}
                        <p className="text-[9px] text-slate-400 font-medium mt-4">
                          Note: La transcription automatique par IA aide à l'accessibilité pour les personnes malentendantes et permet une étude textuelle approfondie du message.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar - Similar Sermons */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Mic2 size={20} className="text-church-blue" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-church-dark dark:text-white">Sermons Similaires</h3>
                  </div>

                  <div className="space-y-6">
                    {sermons
                      .filter(s => s.id !== selectedSermonDetail.id && (s.category === selectedSermonDetail.category || s.preacher === selectedSermonDetail.preacher))
                      .slice(0, 4)
                      .map(s => (
                        <button 
                          key={s.id}
                          onClick={() => { setSelectedSermonDetail(s); setSubtitles(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="flex gap-4 p-4 bg-white dark:bg-dark-card rounded-[28px] border border-church-border dark:border-dark-border hover:shadow-xl transition-all text-left w-full group"
                        >
                          <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                            <img 
                              src={s.imageUrl || `https://images.unsplash.com/photo-1544717305-27a734ef41v4?auto=format&fit=crop&q=80&w=300`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              alt=""
                            />
                          </div>
                          <div>
                            <span className="text-[8px] font-black text-church-blue uppercase tracking-widest mb-1 block">{s.category}</span>
                            <h4 className="text-sm font-black text-church-dark dark:text-white line-clamp-2 uppercase leading-tight mb-1">{s.title}</h4>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.preacher}</p>
                          </div>
                        </button>
                      ))}
                    
                    {sermons.filter(s => s.id !== selectedSermonDetail.id && (s.category === selectedSermonDetail.category || s.preacher === selectedSermonDetail.preacher)).length === 0 && (
                      <p className="text-xs text-slate-400 italic">Aucun autre sermon similaire trouvé pour le moment.</p>
                    )}
                  </div>

                  <div className="p-8 bg-church-dark rounded-[40px] text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-church-gold/20 rounded-full blur-3xl -mr-16 -mt-16" />
                    <h4 className="text-xl font-display font-black mb-4 relative z-10">Plus de messages ?</h4>
                    <p className="text-white/60 text-xs mb-6 relative z-10">Explorez notre collection complète ornée de plus de 10 ans d'archives prophétiques.</p>
                    <button 
                      onClick={() => { setSelectedSermonDetail(null); setSubtitles(null); }}
                      className="px-6 py-3 bg-church-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-church-blue transition-all relative z-10"
                    >
                      Explorer Tout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="bg-white dark:bg-dark-card rounded-[40px] w-full max-w-sm overflow-hidden shadow-2xl border dark:border-dark-border"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-church-dark dark:text-white uppercase tracking-tight">Partager</h3>
                  <button onClick={() => setSharingSermon(null)} className="text-slate-400 hover:text-church-dark dark:hover:text-white transition-colors">
                    <Check size={24} />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                  >
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                      <Facebook size={20} />
                    </div>
                    <span className="text-xs font-black text-church-dark dark:text-white uppercase tracking-widest">Facebook</span>
                  </a>

                  <a 
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Écoutez "${sharingSermon.title}" par ${sharingSermon.preacher}`)}&url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group"
                  >
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
                      <Twitter size={20} />
                    </div>
                    <span className="text-xs font-black text-church-dark dark:text-white uppercase tracking-widest">X (Twitter)</span>
                  </a>

                  <a 
                    href={`mailto:?subject=${encodeURIComponent(sharingSermon.title)}&body=${encodeURIComponent(`Voici un sermon inspirant à écouter : ${window.location.href}`)}`}
                    className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group"
                  >
                    <div className="w-10 h-10 bg-slate-400 rounded-xl flex items-center justify-center text-white">
                      <Mail size={20} />
                    </div>
                    <span className="text-xs font-black text-church-dark dark:text-white uppercase tracking-widest">Email</span>
                  </a>

                  <button 
                    onClick={() => copyToClipboard(window.location.href)}
                    className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-church-blue/10 transition-all group w-full text-left"
                  >
                    <div className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-church-blue">
                      {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                    </div>
                    <span className="text-xs font-black text-church-dark dark:text-white uppercase tracking-widest">
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
