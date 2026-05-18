import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Facebook, Youtube, Instagram, MessageSquare, Megaphone, Twitter, MapPin, Phone, Mail, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import VerseOfTheDay from '../components/ai/VerseOfTheDay';
import NewsFeed from '../components/news/NewsFeed';
import { useSiteConfig } from '../hooks/useSiteConfig';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Event {
  id: string;
  title: string;
  start: Timestamp;
  type: string;
  location?: string;
}

export default function Home() {
  const { config, loading: configLoading } = useSiteConfig();
  const [randomImage, setRandomImage] = useState<{ url: string; description: string }>({ url: '', description: '' });
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const now = new Date();
        const q = query(
          collection(db, 'events'),
          where('start', '>=', Timestamp.fromDate(now)),
          orderBy('start', 'asc'),
          limit(3)
        );
        const snapshot = await getDocs(q);
        const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Event[];
        setUpcomingEvents(eventsData);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (config?.hero?.galleryImages && config.hero.galleryImages.length > 0) {
      const items = config.hero.galleryImages;
      
      // Initial random image
      const randomIdx = Math.floor(Math.random() * items.length);
      setRandomImage(items[randomIdx]);

      // Set up interval for auto-sliding every 60 seconds (1 minute)
      const interval = setInterval(() => {
        setRandomImage(current => {
          const currentIndex = items.findIndex(img => img.url === current.url);
          const nextIndex = (currentIndex + 1) % items.length;
          return items[nextIndex];
        });
      }, 60000);

      return () => clearInterval(interval);
    } else if (config?.hero?.imageUrl) {
      setRandomImage({ url: config.hero.imageUrl, description: 'Bannière d\'accueil' });
    } else {
      setRandomImage({
        url: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=1600&auto=format&fit=crop",
        description: "Image d'accueil par défaut montrant une église"
      });
    }
  }, [config]);

  // Fallback data if config is not yet loaded or doesn't exist
  const hero = config?.hero || {
    title: "Une Demeure de Paix & Puissance",
    subtitle: "Rejoignez-nous chaque dimanche pour une expérience spirituelle transformatrice au cœur de Kinshasa.",
    imageUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=1600&auto=format&fit=crop"
  };

  const identity = config?.identity || {
    name: "CDD Kinshasa",
    address: "Limete, 1ère Rue • Kinshasa, RDC",
    email: "contact@cdd-kin.org",
    phone: "+243 81 000 0000"
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Verse of the Day Bar */}
      <div className="bg-gradient-to-r from-church-dark to-blue-900 py-3 mt-[72px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-white text-xs">
          <div className="w-full">
            <VerseOfTheDay />
          </div>
        </div>
      </div>

      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative min-h-[600px] flex items-center group overflow-hidden" aria-label={randomImage.description}>
          <motion.div 
            key={randomImage.url || 'default'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${randomImage.url || hero.imageUrl}')` }}
            role="img"
            aria-label={randomImage.description}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-church-dark/95 via-church-dark/70 to-church-dark/30"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-20 w-full py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl"
            >
              <div className="bg-church-gold h-1.5 w-24 mb-8"></div>
              <h2 className="text-5xl md:text-7xl font-display font-black text-white leading-[1.05] mb-8 tracking-tighter">
                {hero.title.split('\n').map((line, i) => (
                  <span key={i}>{line}<br/></span>
                ))}
              </h2>
              <p className="text-xl md:text-2xl text-blue-50/80 mb-12 font-light leading-relaxed max-w-xl">
                {hero.subtitle}
              </p>
              <div className="flex flex-wrap gap-5">
                <Link 
                  to="/direct"
                  className="px-10 py-5 bg-church-accent text-church-dark font-black rounded-lg shadow-2xl hover:bg-church-gold transition-all uppercase text-xs tracking-[0.2em]"
                >
                  Suivre en direct
                </Link>
                <Link 
                  to="/programmes"
                  className="px-10 py-5 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-black rounded-lg hover:bg-white/20 transition-all uppercase text-xs tracking-[0.2em]"
                >
                  Programmes
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* content sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-32">
          
          {/* Recent Announcements Section */}
          <section id="annonces-recentes" className="relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: 48 }}
                  className="h-1 bg-church-blue mb-4"
                />
                <h3 className="text-3xl font-black text-church-dark uppercase tracking-tighter flex items-center gap-3">
                  <Megaphone className="text-church-blue" size={32} />
                  Annonces Récentes
                </h3>
              </div>
              <Link 
                to="/annonces" 
                className="group flex items-center gap-2 text-xs font-black text-church-blue uppercase tracking-widest hover:text-church-dark transition-colors"
              >
                Voir toutes les annonces
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
              <NewsFeed maxItems={3} showTitle={false} />
            </div>
          </section>

          {/* Mini Calendar Section */}
          <section id="calendrier-interactif" className="relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: 48 }}
                  className="h-1 bg-church-gold mb-4"
                />
                <h3 className="text-3xl font-black text-church-dark uppercase tracking-tighter flex items-center gap-3">
                  <Calendar className="text-church-gold" size={32} />
                  Prochains Événements
                </h3>
              </div>
              <Link 
                to="/programmes" 
                className="group flex items-center gap-2 text-xs font-black text-church-gold uppercase tracking-widest hover:text-church-dark transition-colors"
              >
                Consulter le calendrier complet
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {eventsLoading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="h-64 bg-slate-50 rounded-[40px] animate-pulse border border-slate-100" />
                ))
              ) : upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, idx) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Link 
                      to="/programmes" 
                      className="group block h-full bg-white border border-church-border rounded-[40px] p-8 hover:shadow-2xl hover:border-church-gold transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-church-gold/5 rounded-bl-[100px] -mr-8 -mt-8 group-hover:scale-110 transition-transform" />
                      
                      <div className="flex items-start justify-between mb-8 relative z-10">
                        <div className="w-16 h-16 bg-church-gold text-white rounded-2xl flex flex-col items-center justify-center shadow-lg group-hover:rotate-3 transition-transform">
                          <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">
                            {format(event.start.toDate(), 'MMM', { locale: fr })}
                          </span>
                          <span className="text-2xl font-black leading-none">
                            {format(event.start.toDate(), 'dd')}
                          </span>
                        </div>
                        <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-slate-100">
                          {event.type}
                        </span>
                      </div>

                      <h4 className="text-xl font-black text-church-dark uppercase tracking-tight mb-4 group-hover:text-church-gold transition-colors">
                        {event.title}
                      </h4>

                      <div className="space-y-2 relative z-10">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock size={14} className="text-church-gold" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            À partir de {format(event.start.toDate(), 'HH:mm')}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-slate-400">
                            <MapPin size={14} className="text-church-gold" />
                            <span className="text-[10px] font-bold uppercase tracking-wider truncate">
                              {event.location}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[9px] font-black text-church-gold uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                          En savoir plus
                        </span>
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-church-gold group-hover:text-white transition-all">
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                  <Calendar size={48} className="opacity-10 mb-6" />
                  <p className="text-xs font-black uppercase tracking-[0.3em]">Aucun événement annoncé</p>
                </div>
              )}
            </div>
          </section>

          {/* Donations & Mobile Money */}
          <section id="dons" className="bg-church-dark rounded-[50px] p-10 md:p-20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-church-blue/10 to-transparent pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row gap-16 items-center">
              <div className="lg:w-1/2">
                <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-6 leading-none">
                  Soutenir <br/> <span className="text-church-gold">L'Œuvre de Dieu</span>
                </h3>
                <p className="text-lg text-white/50 font-light leading-relaxed mb-10 max-w-md">
                  Vos contributions permettent à notre église de rayonner davantage et d'impacter notre communauté à Kinshasa et au-delà.
                </p>
                <Link 
                  to="/dons"
                  className="inline-flex items-center gap-3 px-10 py-5 bg-church-gold text-church-dark font-black rounded-xl hover:bg-white transition-all uppercase text-xs tracking-widest shadow-2xl"
                >
                  Faire un don maintenant
                  <ChevronRight size={16} />
                </Link>
              </div>

              <div className="lg:w-1/2 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                {config?.mobileMoney?.orangeMoney && (
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl group hover:border-white/30 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-[#FF7900] rounded-xl flex items-center justify-center text-white font-black">OM</div>
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Orange Money</span>
                    </div>
                    <p className="text-xl font-black text-white">{config.mobileMoney.orangeMoney}</p>
                  </div>
                )}
                {config?.mobileMoney?.airtelMoney && (
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl group hover:border-white/30 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-[#E40000] rounded-xl flex items-center justify-center text-white font-black">AM</div>
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Airtel Money</span>
                    </div>
                    <p className="text-xl font-black text-white">{config.mobileMoney.airtelMoney}</p>
                  </div>
                )}
                {config?.mobileMoney?.mpesa && (
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl group hover:border-white/30 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-[#E60000] rounded-xl flex items-center justify-center text-white font-black">MPG</div>
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">M-Pesa</span>
                    </div>
                    <p className="text-xl font-black text-white">{config.mobileMoney.mpesa}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Features Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white border-t border-church-border p-8 md:p-12 overflow-x-auto"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 min-w-max md:min-w-0">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 flex-1"
          >
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shadow-sm">
              <MessageSquare size={24} />
            </div>
            <div>
              <h4 className="text-xs font-black text-church-dark uppercase tracking-widest mb-1">Requête de Prière</h4>
              <p className="text-[10px] text-slate-500 max-w-[200px]">Besoin de soutien ? Écrivez-nous en toute confidentialité.</p>
              <Link to="/priere" className="text-[9px] font-black text-church-blue uppercase tracking-widest mt-2 block hover:underline">Accéder au formulaire →</Link>
            </div>
          </motion.div>
          
          <div className="hidden md:block h-12 w-[1px] bg-church-border"></div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 flex-1"
          >
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-church-blue shadow-sm">
              <Calendar size={24} />
            </div>
            <div>
              <h4 className="text-xs font-black text-church-dark uppercase tracking-widest mb-1">Prendre Rendez-vous</h4>
              <p className="text-[10px] text-slate-500 max-w-[200px]">Consultez un pasteur pour une orientation spirituelle.</p>
              <Link to="/rendez-vous" className="text-[9px] font-black text-church-blue uppercase tracking-widest mt-2 block hover:underline">Réserver un créneau →</Link>
            </div>
          </motion.div>

          <div className="hidden md:block h-12 w-[1px] bg-church-border"></div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="flex-1 flex flex-col items-center md:items-end"
          >
            <div className="flex gap-3">
              {config?.socials?.facebook && (
                <a href={config.socials.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-church-blue hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100">
                  <Facebook size={18} />
                </a>
              )}
              {config?.socials?.youtube && (
                <a href={config.socials.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-church-blue hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100">
                  <Youtube size={18} />
                </a>
              )}
              {config?.socials?.instagram && (
                <a href={config.socials.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-church-blue hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100">
                  <Instagram size={18} />
                </a>
              )}
            </div>
            <p className="text-[9px] text-slate-400 mt-3 uppercase font-black tracking-widest">{identity.address}</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

