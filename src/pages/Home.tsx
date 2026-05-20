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

interface WeeklyEvent {
  id: string;
  title: string;
  day: number;
  time: string;
  endTime?: string;
  type: string;
  location: string;
}

export default function Home() {
  const { config, loading: configLoading } = useSiteConfig();
  const [randomImage, setRandomImage] = useState<{ url: string; title: string }>({ url: '', title: '' });
  const [heroImages, setHeroImages] = useState<{ url: string; title: string }[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [weeklyPrograms, setWeeklyPrograms] = useState<WeeklyEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const now = new Date();
        const qEvents = query(
          collection(db, 'events'),
          where('start', '>=', Timestamp.fromDate(now)),
          orderBy('start', 'asc'),
          limit(3)
        );
        const snapshotEvents = await getDocs(qEvents);
        setUpcomingEvents(snapshotEvents.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Event[]);

        const qWeekly = query(collection(db, 'weekly_program'), orderBy('day', 'asc'), orderBy('time', 'asc'));
        const snapshotWeekly = await getDocs(qWeekly);
        setWeeklyPrograms(snapshotWeekly.docs.map(doc => ({ id: doc.id, ...doc.data() })) as WeeklyEvent[]);

        // Fetch Hero Images from Gallery
        const qHero = query(collection(db, 'gallery'), where('isHero', '==', true), limit(10));
        const snapshotHero = await getDocs(qHero);
        const fetchedHeros = snapshotHero.docs.map(doc => ({ 
          url: doc.data().url, 
          title: doc.data().title 
        }));
        setHeroImages(fetchedHeros);
        
        if (fetchedHeros.length > 0) {
          setRandomImage(fetchedHeros[Math.floor(Math.random() * fetchedHeros.length)]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (heroImages.length > 0) {
      // Set up interval for random auto-sliding every 60 seconds (1 minute)
      const interval = setInterval(() => {
        setRandomImage(current => {
          if (heroImages.length <= 1) return current;
          let nextIndex;
          do {
            nextIndex = Math.floor(Math.random() * heroImages.length);
          } while (heroImages[nextIndex].url === current.url);
          return heroImages[nextIndex];
        });
      }, 60000);

      return () => clearInterval(interval);
    } else if (config?.hero?.imageUrl) {
      setRandomImage({ url: config.hero.imageUrl, title: config.hero.title || 'Bannière d\'accueil' });
    } else {
      setRandomImage({
        url: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=1600&auto=format&fit=crop",
        title: "Une Demeure de Paix & Puissance"
      });
    }
  }, [heroImages, config?.hero?.imageUrl]);

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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col min-h-screen bg-church-bg dark:bg-dark-bg transition-colors duration-300"
    >
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative min-h-[700px] flex items-center group overflow-hidden" aria-label={randomImage.title}>
          <motion.div 
            key={randomImage.url || 'default'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${randomImage.url || hero.imageUrl}')` }}
            role="img"
            aria-label={randomImage.title}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-church-dark/95 via-church-dark/70 to-church-dark/30"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-20 w-full pt-48 pb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl"
            >
              <div className="bg-church-gold h-1.5 w-24 mb-8"></div>
              <h2 className="text-5xl md:text-7xl font-display font-black text-white leading-[1.05] mb-8 tracking-tighter">
                {(randomImage.title || hero.title).split('\n').map((line, i) => (
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

            {/* Verse of the Day overlaying the hero */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-16 lg:mt-0 lg:absolute lg:right-12 lg:top-[55%] lg:-translate-y-1/2 lg:w-[400px] z-20"
            >
              <VerseOfTheDay />
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
                <h3 className="text-3xl font-black text-church-dark dark:text-white uppercase tracking-tighter flex items-center gap-3">
                  <Megaphone className="text-church-blue" size={32} />
                  Annonces Récentes
                </h3>
              </div>
              <Link 
                to="/annonces" 
                className="group flex items-center gap-2 text-xs font-black text-church-blue uppercase tracking-widest hover:text-church-dark dark:hover:text-white transition-colors"
              >
                Voir toutes les annonces
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
              <NewsFeed maxItems={3} showTitle={false} />
            </div>
          </section>

          {/* Weekly Program Section */}
          <section id="programme-hebdo" className="relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: 48 }}
                  className="h-1 bg-church-blue mb-4"
                />
                <h3 className="text-3xl font-black text-church-dark dark:text-white uppercase tracking-tighter flex items-center gap-3">
                  <Clock className="text-church-blue" size={32} />
                  Nos Rendez-vous Hebdomadaires
                </h3>
                <p className="text-slate-400 dark:text-slate-500 text-xs font-medium mt-2">Rejoignez-nous lors de nos cultes et enseignements réguliers.</p>
              </div>
              <Link 
                to="/programmes" 
                className="group flex items-center gap-2 text-xs font-black text-church-blue uppercase tracking-widest hover:text-church-dark dark:hover:text-white transition-colors"
              >
                Tous les détails
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {eventsLoading ? (
                 [1, 2, 3, 4].map(i => (
                   <div key={i} className="h-40 bg-slate-50 dark:bg-slate-800 rounded-[32px] animate-pulse border border-slate-100 dark:border-slate-700" />
                 ))
              ) : weeklyPrograms.length > 0 ? (
                weeklyPrograms.slice(0, 8).map((wp, i) => (
                  <Link key={wp.id} to={`/programmes#weekly-${wp.id}`}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      viewport={{ once: true }}
                      className="bg-white dark:bg-dark-card p-6 rounded-[32px] border border-church-border dark:border-dark-border hover:shadow-xl hover:border-church-blue/30 transition-all group h-full"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-church-blue/10 text-church-blue rounded-xl flex items-center justify-center font-black text-[10px]">
                          {DAYS[wp.day].slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{DAYS[wp.day]}</span>
                      </div>
                      <h4 className="text-sm font-black text-church-dark dark:text-white uppercase tracking-tight mb-2 group-hover:text-church-blue transition-colors">{wp.title}</h4>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-church-blue/60 uppercase tracking-widest flex items-center gap-1">
                          <Clock size={10} /> {wp.time} {wp.endTime ? `- ${wp.endTime}` : ''}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                          <MapPin size={10} /> {wp.location}
                        </span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[8px] font-black text-church-blue uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Voir l'agenda →</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-slate-300 dark:text-slate-600 font-black text-[10px] uppercase tracking-widest">
                  Aucun programme standard défini
                </div>
              )}
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
                <h3 className="text-3xl font-black text-church-dark dark:text-white uppercase tracking-tighter flex items-center gap-3">
                  <Calendar className="text-church-gold" size={32} />
                  Prochains Événements
                </h3>
                <p className="text-slate-400 dark:text-slate-500 text-xs font-medium mt-2">Ne manquez aucun de nos rendez-vous spirituels cette semaine.</p>
              </div>
              <Link 
                to="/programmes" 
                className="group flex items-center gap-2 text-xs font-black text-church-gold uppercase tracking-widest hover:text-church-dark dark:hover:text-white transition-colors"
              >
                Consulter le calendrier complet
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {eventsLoading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="h-64 bg-slate-50 dark:bg-slate-800 rounded-[40px] animate-pulse border border-slate-100 dark:border-slate-700" />
                ))
              ) : upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, idx) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
                    <Link 
                      to={`/programmes#event-${event.id}`} 
                      className="group block h-full bg-white dark:bg-dark-card border border-church-border dark:border-dark-border rounded-[40px] p-8 hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] hover:border-church-gold transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-church-gold/5 rounded-bl-[100px] -mr-8 -mt-8 group-hover:scale-110 group-hover:bg-church-gold/10 transition-all duration-500" />
                      
                      <div className="flex items-start justify-between mb-8 relative z-10">
                        <div className="w-16 h-16 bg-church-gold text-white rounded-2xl flex flex-col items-center justify-center shadow-lg group-hover:rotate-3 group-hover:scale-110 transition-all duration-500">
                          <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">
                            {format(event.start.toDate(), 'MMM', { locale: fr })}
                          </span>
                          <span className="text-2xl font-black leading-none">
                            {format(event.start.toDate(), 'dd')}
                          </span>
                        </div>
                        <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-slate-100 dark:border-slate-700">
                          {event.type}
                        </span>
                      </div>

                      <h4 className="text-xl font-black text-church-dark dark:text-white uppercase tracking-tight mb-4 group-hover:text-church-gold transition-colors">
                        {event.title}
                      </h4>

                      <div className="space-y-3 relative z-10">
                        <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-white transition-colors">
                          <div className="w-6 h-6 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-church-gold/10">
                            <Clock size={12} className="text-church-gold" />
                          </div>
                          <span className="text-[11px] font-bold uppercase tracking-wider">
                            À partir de {format(event.start.toDate(), 'HH:mm')}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-white transition-colors">
                            <div className="w-6 h-6 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-church-gold/10">
                              <MapPin size={12} className="text-church-gold" />
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-wider truncate">
                              {event.location}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-8 pt-6 border-t border-slate-50 dark:border-dark-border flex items-center justify-between">
                        <span className="text-[10px] font-black text-church-gold uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                          Réserver ma place
                        </span>
                        <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:bg-church-gold group-hover:text-white group-hover:rotate-[-45deg] transition-all duration-500">
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-24 bg-slate-50 dark:bg-slate-800/50 rounded-[50px] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                  <div className="w-20 h-20 bg-white dark:bg-dark-card rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <Calendar size={32} className="opacity-20" />
                  </div>
                  <p className="text-sm font-black uppercase tracking-[0.3em]">Aucun événement annoncé</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-2 uppercase tracking-widest font-bold">Revenez bientôt pour nos prochaines dates</p>
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
        className="bg-white dark:bg-dark-card border-t border-church-border dark:border-dark-border p-8 md:p-12 overflow-x-auto transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 min-w-max md:min-w-0">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 flex-1"
          >
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm">
              <MessageSquare size={24} />
            </div>
            <div>
              <h4 className="text-xs font-black text-church-dark dark:text-white uppercase tracking-widest mb-1">Requête de Prière</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 max-w-[200px]">Besoin de soutien ? Écrivez-nous en toute confidentialité.</p>
              <Link to="/priere" className="text-[9px] font-black text-church-blue uppercase tracking-widest mt-2 block hover:underline">Accéder au formulaire →</Link>
            </div>
          </motion.div>
          
          <div className="hidden md:block h-12 w-[1px] bg-church-border dark:bg-dark-border"></div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 flex-1"
          >
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-church-blue dark:text-blue-400 shadow-sm">
              <Calendar size={24} />
            </div>
            <div>
              <h4 className="text-xs font-black text-church-dark dark:text-white uppercase tracking-widest mb-1">Prendre Rendez-vous</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 max-w-[200px]">Consultez un pasteur pour une orientation spirituelle.</p>
              <Link to="/rendez-vous" className="text-[9px] font-black text-church-blue uppercase tracking-widest mt-2 block hover:underline">Réserver un créneau →</Link>
            </div>
          </motion.div>

          <div className="hidden md:block h-12 w-[1px] bg-church-border dark:bg-dark-border"></div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="flex-1 flex flex-col items-center md:items-end"
          >
            <div className="flex gap-3">
              {config?.socials?.facebook && (
                <a href={config.socials.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-church-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-900/40">
                  <Facebook size={18} />
                </a>
              )}
              {config?.socials?.youtube && (
                <a href={config.socials.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-church-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-900/40">
                  <Youtube size={18} />
                </a>
              )}
              {config?.socials?.instagram && (
                <a href={config.socials.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-church-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-900/40">
                  <Instagram size={18} />
                </a>
              )}
            </div>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-3 uppercase font-black tracking-widest">{identity.address}</p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

