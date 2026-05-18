import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Youtube, Video, MessageCircle, Activity, Calendar, Clock, MapPin, Share2, Tv, Bell, CheckCircle2, Loader2 } from 'lucide-react';
import { collection, query, where, onSnapshot, Timestamp, addDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useSiteConfig } from '../hooks/useSiteConfig';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Event {
  id: string;
  title: string;
  start: Timestamp;
  end: Timestamp;
  type: string;
  location?: string;
}

export default function Live() {
  const { config } = useSiteConfig();
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Notification form state
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      await addDoc(collection(db, 'live_subscriptions'), {
        email,
        createdAt: Timestamp.now()
      });
      setSubmitted(true);
      setEmail('');
    } catch (err) {
      console.error("Subscription error:", err);
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, 'events'),
      where('start', '>=', Timestamp.fromDate(new Date(new Date().setHours(0,0,0,0))))
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Event[];
      const now = new Date();
      
      // Find currently active event
      const current = allEvents.find(event => {
        const start = event.start.toDate();
        const end = event.end ? event.end.toDate() : new Date(start.getTime() + 2 * 60 * 60 * 1000); // Default 2h
        return now >= start && now <= end;
      });

      setActiveEvent(current || null);

      // Future events (today or later)
      const future = allEvents
        .filter(event => event.start.toDate() > now)
        .sort((a, b) => a.start.toMillis() - b.start.toMillis())
        .slice(0, 3);
      
      setUpcomingEvents(future);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'events');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="pt-32 pb-20 bg-slate-950 min-h-screen text-white overflow-hidden relative">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-church-blue/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-church-gold/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                <div className={`w-2 h-2 rounded-full ${activeEvent ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
                  {activeEvent ? 'En Direct' : 'Hors Ligne'}
                </span>
              </div>
              {activeEvent && (
                <div className="px-3 py-1 bg-church-blue/10 border border-church-blue/20 rounded-full">
                  <span className="text-[10px] font-black uppercase tracking-widest text-church-blue">
                    {activeEvent.type}
                  </span>
                </div>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black text-white mb-4">
              {activeEvent ? activeEvent.title : 'Espace Multimédia'}
            </h1>
            <p className="text-white/50 max-w-2xl font-medium">
              Vivez l'atmosphère de la présence de Dieu depuis chez vous. Rejoignez notre communauté mondiale en direct.
            </p>
          </div>

          <div className="flex gap-4">
            <button className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-white/60 hover:text-white">
              <Share2 size={20} />
            </button>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          <div className="w-full lg:w-[68%]">
            <div className="relative aspect-video bg-black rounded-[40px] overflow-hidden shadow-2xl border border-white/5 group">
              {config?.socials.liveUrl ? (
                <iframe 
                  className="w-full h-full"
                  src={config.socials.liveUrl}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe> 
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 bg-gradient-to-br from-slate-900 to-black p-12 text-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-church-gold/20 rounded-full blur-2xl animate-pulse" />
                    <Video size={80} className="text-church-gold relative z-10" />
                  </div>
                  <div className="max-w-md">
                    <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">
                      {config?.socials.nextLiveTitle || "Le Direct reprendra bientôt"}
                    </h2>
                    {config?.socials.nextLiveDate && (
                      <div className="flex flex-col items-center gap-1 mb-6">
                        <span className="text-[10px] font-black text-church-gold uppercase tracking-[0.3em]">Prochain rendez-vous</span>
                        <p className="text-white text-lg font-black uppercase tracking-tight">
                          {format(new Date(config.socials.nextLiveDate), "eeee d MMMM 'à' HH:mm", { locale: fr })}
                        </p>
                      </div>
                    )}
                    <p className="text-white/40 text-sm leading-relaxed mb-8">
                      Nous ne sommes pas en direct pour le moment. Rejoignez nos plateformes officielles pour recevoir une notification dès le début.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {config?.socials.youtube && (
                      <a 
                        href={config.socials.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl shadow-red-600/20"
                      >
                        <Youtube size={16} />
                        S'abonner sur YouTube
                      </a>
                    )}
                    {config?.socials.facebook && (
                      <a 
                        href={config.socials.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl shadow-blue-600/20"
                      >
                        <Video size={16} />
                        Suivre sur Facebook
                      </a>
                    )}
                  </div>
                </div>
              )}
              
              {/* Overlay Badge */}
              {activeEvent && (
                <div className="absolute top-6 left-6 pointer-events-none">
                  <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-2xl">
                    <Activity size={12} className="animate-bounce" />
                    Live
                  </div>
                </div>
              )}
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-white/5 border border-white/5 rounded-[32px] backdrop-blur-sm">
                <h3 className="text-[10px] font-black text-church-blue uppercase tracking-[0.3em] mb-6">Plateformes Officielles</h3>
                <div className="space-y-4">
                  {config?.socials.youtube && (
                    <a 
                      href={config.socials.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500 transition-all rounded-2xl border border-red-500/20"
                    >
                      <div className="flex items-center gap-3">
                        <Youtube className="text-red-500 group-hover:text-white" size={24} />
                        <span className="text-xs font-black uppercase tracking-widest group-hover:text-white">YouTube Live</span>
                      </div>
                      <Tv size={16} className="text-white/20 group-hover:text-white" />
                    </a>
                  )}
                  {config?.socials.facebook && (
                    <a 
                      href={config.socials.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-4 bg-blue-500/10 hover:bg-blue-500 transition-all rounded-2xl border border-blue-500/20"
                    >
                      <div className="flex items-center gap-3">
                        <Video className="text-blue-500 group-hover:text-white" size={24} />
                        <span className="text-xs font-black uppercase tracking-widest group-hover:text-white">Facebook Live</span>
                      </div>
                      <Tv size={16} className="text-white/20 group-hover:text-white" />
                    </a>
                  )}
                </div>
              </div>

              <div className="p-8 bg-white/5 border border-white/5 rounded-[32px] backdrop-blur-sm">
                <h3 className="text-[10px] font-black text-church-gold uppercase tracking-[0.3em] mb-6">Prochains Directs</h3>
                <div className="space-y-4">
                  {upcomingEvents.length > 0 ? upcomingEvents.map((event, idx) => (
                    <div key={event.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="w-12 h-12 bg-white/5 rounded-xl flex flex-col items-center justify-center text-center">
                        <span className="text-[8px] font-black text-church-gold uppercase">{format(event.start.toDate(), 'MMM', { locale: fr })}</span>
                        <span className="text-lg font-black leading-none">{format(event.start.toDate(), 'dd', { locale: fr })}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold truncate max-w-[150px]">{event.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                          <Clock size={10} />
                          <span>{format(event.start.toDate(), 'HH:mm')}</span>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-2xl">
                       <Calendar size={24} className="text-white/10 mx-auto mb-2" />
                       <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Aucun évènement planifié</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Notification Subscription Section */}
              <div className="md:col-span-2 p-10 bg-gradient-to-br from-church-blue/10 to-transparent border border-white/5 rounded-[40px] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Bell size={120} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                  <div className="max-w-md">
                    <div className="w-12 h-12 bg-church-blue/20 rounded-2xl flex items-center justify-center text-church-blue mb-4">
                      <Bell size={24} />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Alertes Directs</h3>
                    <p className="text-white/50 text-sm font-medium leading-relaxed">
                      Ne manquez plus aucun moment de gloire. Laissez votre email pour être alerté dès qu'un nouveau direct commence.
                    </p>
                  </div>
                  
                  <div className="flex-1 w-full">
                    {submitted ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-green-500/10 border border-green-500/20 p-8 rounded-3xl flex flex-col items-center text-center"
                      >
                        <CheckCircle2 size={48} className="text-green-500 mb-4" />
                        <h4 className="text-lg font-black text-white mb-1 uppercase tracking-tight">Inscription Réussie</h4>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Vous recevrez désormais nos alertes.</p>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleSubscribe} className="space-y-4">
                        <div className="relative">
                          <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="votre.email@exemple.com"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-church-blue transition-all"
                          />
                          <button 
                            type="submit"
                            disabled={submitting}
                            className="absolute right-2 top-2 bottom-2 px-8 bg-church-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-church-dark transition-all disabled:opacity-50 flex items-center gap-2"
                          >
                            {submitting ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              'S\'abonner'
                            )}
                          </button>
                        </div>
                        {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>}
                        <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.2em] text-center">
                          Nous respectons votre vie privée • Désabonnement en un clic
                        </p>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-[32%] flex flex-col gap-6">
            <div className="flex-1 bg-white/5 p-8 rounded-[40px] border border-white/5 flex flex-col backdrop-blur-md">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3 text-church-gold">
                  <div className="w-10 h-10 bg-church-gold/10 rounded-xl flex items-center justify-center">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-[0.2em] text-xs">Direct Chat</h3>
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Temps réel</p>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar min-h-[300px]">
                <div className="py-20 text-center px-4">
                   <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                     <MessageCircle size={24} className="text-white/20" />
                   </div>
                   <p className="text-sm text-white/40 font-medium leading-relaxed">
                     Connectez-vous pour participer au chat en direct et partager vos témoignages avec la communauté.
                   </p>
                </div>
              </div>

              <div className="mt-8 relative gap-2 flex flex-col">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Écrire un message..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-church-gold transition-all"
                  />
                  <button className="p-4 bg-church-gold text-church-dark rounded-2xl hover:scale-105 active:scale-95 transition-all">
                    <Share2 size={20} />
                  </button>
                </div>
                <p className="text-[9px] text-center text-white/20 font-bold uppercase tracking-widest mt-2">
                  Respectez les règles de la communauté
                </p>
              </div>
            </div>

            <div className="p-8 bg-gradient-to-br from-church-blue/20 to-transparent border border-church-blue/20 rounded-[40px]">
              <h4 className="text-sm font-black text-church-blue uppercase tracking-widest mb-4">Besoin de Prière ?</h4>
              <p className="text-xs text-white/50 leading-relaxed mb-6 font-medium">
                Si vous avez été touché par le message en cours, nos pasteurs sont disponibles pour prier avec vous.
              </p>
              <Link to="/priere" className="w-full">
                <button className="w-full py-4 bg-church-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-church-blue/20 hover:scale-105 transition-all">
                  Demander un soutien
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
