import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, Bell, Loader2, X, Info, Share2, CalendarDays } from 'lucide-react';
import { cn } from '../lib/utils';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  description: string;
  start: string;
  end?: string;
  location: string;
  type: string;
  imageUrl?: string;
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

export default function Programs() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [weeklyPrograms, setWeeklyPrograms] = useState<WeeklyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [selectedItem, setSelectedItem] = useState<{ type: 'event' | 'weekly', data: any } | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (!loading && location.hash) {
      const hash = location.hash;
      if (hash.startsWith('#weekly-')) {
        const id = hash.replace('#weekly-', '');
        const found = weeklyPrograms.find(wp => wp.id === id);
        if (found) {
          setSelectedItem({ type: 'weekly', data: found });
        }
      } else if (hash.startsWith('#event-')) {
        const id = hash.replace('#event-', '');
        const found = events.find(e => e.id === id);
        if (found) {
          setSelectedItem({ type: 'event', data: found });
        }
      }
    }
  }, [location.hash, loading, weeklyPrograms, events]);

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('start', 'asc'));
    const unsubEvents = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Event));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'events');
    });

    const wq = query(collection(db, 'weekly_program'), orderBy('day', 'asc'), orderBy('time', 'asc'));
    const unsubWeekly = onSnapshot(wq, (snapshot) => {
      setWeeklyPrograms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as WeeklyEvent));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'weekly_program');
      setLoading(false);
    });

    return () => {
      unsubEvents();
      unsubWeekly();
    };
  }, []);

  // Lock background scroll when a program or event detail modal drawer is open
  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedItem]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const filteredEvents = events.filter(e => {
    try {
      const eventDate = parseISO(e.start);
      return isValid(eventDate) && isSameDay(eventDate, selectedDate);
    } catch (err) {
      return false;
    }
  });

  const handleShare = (title: string) => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `Découvrez cet évènement : ${title}`,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié !");
    }
  };

  const DAYS_LIST = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

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
            Calendrier Spirituel
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black text-church-dark dark:text-white mb-4">Agenda des Programmes</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">Bâtissez votre vie spirituelle en participant activement à nos différents rendez-vous.</p>
        </motion.div>

        <AnimatePresence>
          {selectedItem && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedItem(null)}
                className="absolute inset-0 bg-church-dark/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-white dark:bg-dark-card rounded-[40px] shadow-2xl overflow-hidden transition-colors duration-300"
              >
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-6 right-6 z-10 p-2 bg-white/20 backdrop-blur-lg hover:bg-white/40 text-church-dark rounded-full transition-all"
                >
                  <X size={20} />
                </button>

                {selectedItem.type === 'event' && selectedItem.data.imageUrl && (
                  <div className="h-64 w-full overflow-hidden">
                    <img 
                      src={selectedItem.data.imageUrl} 
                      alt={selectedItem.data.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-10">
                       <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] font-black text-church-accent uppercase tracking-widest block mb-2">
                        {selectedItem.data.type}
                      </span>
                      <h2 className="text-3xl font-display font-black text-church-dark dark:text-white uppercase tracking-tight">
                        {selectedItem.data.title}
                      </h2>
                    </div>
                    <button 
                      onClick={() => handleShare(selectedItem.data.title)}
                      className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-church-blue rounded-2xl transition-colors"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-slate-100 dark:border-dark-border">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-church-blue/5 dark:bg-church-blue/10 rounded-xl flex items-center justify-center text-church-blue">
                          <CalendarIcon size={20} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Date</p>
                          <p className="text-sm font-bold text-church-dark dark:text-white">
                            {selectedItem.type === 'event' 
                              ? format(parseISO(selectedItem.data.start), 'eeee d MMMM yyyy', { locale: fr })
                              : DAYS_LIST[selectedItem.data.day]}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-church-gold/5 dark:bg-church-gold/10 rounded-xl flex items-center justify-center text-church-gold">
                          <Clock size={20} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Heure</p>
                          <p className="text-sm font-bold text-church-dark dark:text-white">
                            {selectedItem.type === 'event' 
                              ? `${format(parseISO(selectedItem.data.start), "HH'h'mm")} ${selectedItem.data.end ? ` - ${format(parseISO(selectedItem.data.end), "HH'h'mm")}` : ''}`
                              : `${selectedItem.data.time}${selectedItem.data.endTime ? ` - ${selectedItem.data.endTime}` : ''}`}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-church-accent/5 dark:bg-church-accent/10 rounded-xl flex items-center justify-center text-church-accent">
                          <MapPin size={20} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Lieu</p>
                          <p className="text-sm font-bold text-church-dark dark:text-white">{selectedItem.data.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedItem.data.description && (
                    <div className="mb-0">
                      <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Info size={14} /> Description
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        {selectedItem.data.description}
                      </p>
                    </div>
                  )}

                  <button 
                    onClick={() => {
                        toast.success("Rappel activé pour cet évènement !");
                        setSelectedItem(null);
                    }}
                    className="w-full mt-10 py-5 bg-church-dark dark:bg-church-blue text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-church-blue hover:dark:bg-church-accent transition-all flex items-center justify-center gap-3"
                  >
                    <Bell size={18} />
                    M'envoyer une notification
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-church-blue mb-4" size={40} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mise à jour de l'agenda...</p>
          </div>
        ) : (
          <div>
            {/* Calendar & Panel Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start mb-20">
              {/* Visual Calendar */}
              <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-3xl shadow-xl border border-church-border dark:border-dark-border overflow-hidden transition-colors duration-300">
                <div className="p-8 flex items-center justify-between border-b border-church-border dark:border-dark-border bg-slate-50 dark:bg-slate-800">
                  <h2 className="text-xl font-black text-church-dark dark:text-white uppercase tracking-tight flex items-center gap-3">
                    <CalendarIcon className="text-church-accent" />
                    {format(currentDate, 'MMMM yyyy', { locale: fr })}
                  </h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const today = new Date();
                        setCurrentDate(today);
                        setSelectedDate(today);
                      }}
                      className="px-3 py-1 bg-white dark:bg-dark-card border border-church-border dark:border-dark-border rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-church-blue hover:border-church-blue transition-all"
                    >
                      Aujourd'hui
                    </button>
                    <button 
                      onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                      className="p-2 bg-white dark:bg-dark-card hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl border border-church-border dark:border-dark-border transition-colors text-slate-400 hover:text-church-blue"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                      onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                      className="p-2 bg-white dark:bg-dark-card hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl border border-church-border dark:border-dark-border transition-colors text-slate-400 hover:text-church-blue"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-7 gap-1">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
                    <div key={d} className="text-center py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      {d}
                    </div>
                  ))}
                  {calendarDays.map((day, i) => {
                    const dayEvents = events.filter(e => {
                      try {
                        const eventDate = parseISO(e.start);
                        return isValid(eventDate) && isSameDay(eventDate, day);
                      } catch { return false; }
                    });
                    const hasEvent = dayEvents.length > 0;
                    const isSelected = isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, monthStart);

                    return (
                      <div key={i} className="relative">
                        <button
                          onClick={() => setSelectedDate(day)}
                          onMouseEnter={() => setHoveredDate(day)}
                          onMouseLeave={() => setHoveredDate(null)}
                          className={cn(
                            "aspect-square w-full relative flex flex-col items-center justify-center rounded-2xl transition-all border",
                            !isCurrentMonth ? "opacity-20 pointer-events-none" : "hover:scale-105",
                            isSelected 
                              ? "bg-church-dark dark:bg-church-blue text-white border-church-dark dark:border-church-blue shadow-lg ring-4 ring-blue-100 dark:ring-blue-900/30" 
                              : "bg-white dark:bg-dark-card border-transparent text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800",
                            hasEvent && !isSelected ? "border-church-gold/30" : ""
                          )}
                        >
                          <span className="text-sm font-black">{format(day, 'd', { locale: fr })}</span>
                          {hasEvent && (
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full mt-1",
                              isSelected ? "bg-church-gold" : "bg-church-accent animate-pulse"
                            )}></div>
                          )}
                        </button>

                        <AnimatePresence>
                          {hoveredDate && isSameDay(hoveredDate, day) && hasEvent && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-church-border dark:border-dark-border p-4 z-50 overflow-hidden pointer-events-auto transition-colors duration-300"
                            >
                              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-50 dark:border-dark-border">
                                <CalendarIcon size={12} className="text-church-blue" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                  {format(day, 'd MMMM', { locale: fr })}
                                </span>
                              </div>
                              <div className="space-y-3">
                                {dayEvents.map(e => (
                                  <button 
                                    key={e.id} 
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setSelectedItem({ type: 'event', data: e });
                                    }}
                                    className="w-full text-left border-l-2 border-church-accent pl-3 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-r-lg"
                                  >
                                    <p className="text-[10px] font-black text-church-dark dark:text-white uppercase leading-tight line-clamp-1 mb-1">{e.title}</p>
                                    <div className="flex items-center gap-1.5 opacity-60">
                                      <Clock size={8} className="text-church-gold" />
                                      <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                                        {format(parseISO(e.start), "HH'h'mm")}
                                        {e.location && ` • ${e.location}`}
                                      </span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                                <div className="w-3 h-3 bg-white dark:bg-dark-card border-r border-b border-church-border dark:border-dark-border rotate-45" />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Event Details Panel */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-dark-card rounded-3xl shadow-xl border border-church-border dark:border-dark-border p-8 transition-colors duration-300">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-black text-church-dark dark:text-white uppercase tracking-widest text-xs">Événements du Jour</h3>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full whitespace-nowrap">
                      {format(selectedDate, 'eeee d MMMM', { locale: fr })}
                    </span>
                  </div>

                  <div className="space-y-6">
                    {filteredEvents.length > 0 ? (
                      filteredEvents.map(event => {
                        const eventDate = parseISO(event.start);
                        const isUpcoming = eventDate > new Date();
                        return (
                          <motion.div 
                            key={event.id}
                            layoutId={event.id}
                            onClick={() => setSelectedItem({ type: 'event', data: event })}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={cn(
                              "group relative p-4 rounded-2xl transition-all border cursor-pointer",
                              isUpcoming 
                                ? "bg-blue-50/30 dark:bg-blue-900/10 border-church-blue/10 hover:border-church-blue/30 shadow-sm" 
                                : "bg-slate-50/50 dark:bg-slate-800/30 border-transparent grayscale-[0.5] opacity-70"
                            )}
                          >
                            <div className="flex items-start gap-4">
                              {isUpcoming && (
                                <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-church-blue text-white rounded-lg shadow-sm">
                                  <div className="w-1 h-1 rounded-full bg-white animate-ping" />
                                  <span className="text-[7px] font-black uppercase tracking-[0.1em]">Bientôt</span>
                                </div>
                              )}
                              <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-110",
                                event.type === 'Culte' ? "bg-white dark:bg-dark-bg text-church-blue" : "bg-white dark:bg-dark-bg text-church-accent"
                              )}>
                                <Clock size={24} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black text-church-accent uppercase tracking-widest mb-1">{event.type}</p>
                                <h4 className="text-sm font-black text-church-dark dark:text-white mb-2 group-hover:text-church-blue transition-colors truncate">{event.title}</h4>
                                <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                  <div className="flex items-center gap-2">
                                    <Clock size={12} className="text-church-gold" />
                                    <span>
                                      {format(eventDate, "HH'h'mm")}
                                      {event.end && event.end !== event.start && ` - ${format(parseISO(event.end), "HH'h'mm")}`}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin size={12} className="text-church-gold" />
                                    <span className="truncate">{event.location}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="text-center py-20 opacity-30 flex flex-col items-center">
                        <Bell size={48} className="mb-4 dark:text-white" />
                        <p className="text-xs font-black uppercase tracking-widest dark:text-white">Aucun programme prévu</p>
                      </div>
                    )}
                  </div>

                  {filteredEvents.length > 0 && (
                    <button className="w-full mt-8 py-4 bg-church-dark dark:bg-church-blue text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-church-blue transition-all flex items-center justify-center gap-2">
                      <Bell size={14} />
                      M'envoyer un rappel
                    </button>
                  )}
                </div>

                <div className="bg-gradient-to-br from-church-blue to-indigo-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/10 transition-colors"></div>
                  <h4 className="text-xs font-black text-church-gold uppercase tracking-[0.2em] mb-4">Besoin d'aide ?</h4>
                  <p className="text-sm font-light leading-relaxed mb-6 opacity-80 italic">
                    "Vous souhaitez organiser un événement spécial ou réserver une salle ? Contactez notre secrétariat."
                  </p>
                  <button className="text-[10px] font-black uppercase tracking-widest border-b-2 border-church-gold pb-1 hover:text-church-gold transition-colors">
                    Contactez-nous →
                  </button>
                </div>
              </div>
            </div>

            {/* Weekly Schedule Section */}
            {weeklyPrograms.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-20"
              >
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-display font-black text-church-dark dark:text-white uppercase tracking-tight mb-2">Programme Hebdomadaire</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Nos rendez-vous fixes chaque semaine dans la présence de Dieu.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map((dayName, index) => {
                    const dayEvents = weeklyPrograms.filter(wp => wp.day === index);
                    if (dayEvents.length === 0) return null;
                    
                    return (
                      <div key={dayName} className="bg-white dark:bg-dark-card rounded-3xl border border-church-border dark:border-dark-border p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-4 border-b border-church-border dark:border-dark-border pb-3">
                          <div className="w-2 h-2 rounded-full bg-church-blue" />
                          <h3 className="font-black text-church-dark dark:text-white uppercase tracking-widest text-[11px]">{dayName}</h3>
                        </div>
                        <div className="space-y-4">
                          {dayEvents.map(wp => (
                            <button 
                              key={wp.id} 
                              onClick={() => setSelectedItem({ type: 'weekly', data: wp })}
                              className="w-full text-left relative pl-4 border-l border-slate-100 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors p-2 rounded-r-xl"
                            >
                              <p className="text-[9px] font-black text-church-accent uppercase tracking-tighter mb-0.5">
                                {wp.time} {wp.endTime ? `- ${wp.endTime}` : ''}
                              </p>
                              <h4 className="text-sm font-black text-church-dark dark:text-white leading-tight mb-1">{wp.title}</h4>
                              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">{wp.location}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* All Upcoming Events Section with Filters */}
            <UpcomingEventsList events={events} onSelect={(e) => setSelectedItem({ type: 'event', data: e })} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function UpcomingEventsList({ events, onSelect }: { events: Event[], onSelect: (event: Event) => void }) {
  const [filter, setFilter] = useState('Tous');
  const upcomingEvents = events.filter(e => {
    try {
      return parseISO(e.start) >= new Date();
    } catch { return false; }
  });

  const types = ['Tous', ...Array.from(new Set(events.map(e => e.type)))];

  const filtered = filter === 'Tous' 
    ? upcomingEvents 
    : upcomingEvents.filter(e => e.type === filter);

  return (
    <div className="mt-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-display font-black text-church-dark dark:text-white mb-2 uppercase tracking-tight">Tous nos programmes</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Parcourez tous les événements futurs de l'église.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                filter === t ? "bg-church-blue text-white shadow-lg shadow-church-blue/20" : "bg-white dark:bg-dark-card border border-church-border dark:border-dark-border text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(event => (
            <motion.div
              layout
              key={event.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => onSelect(event)}
              className="bg-white dark:bg-dark-card p-6 rounded-[32px] border border-church-border dark:border-dark-border hover:shadow-xl transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex flex-col items-center justify-center text-church-blue border border-church-border dark:border-dark-border group-hover:bg-church-blue group-hover:text-white transition-all">
                  <span className="text-[10px] font-black uppercase leading-none mb-1">{format(parseISO(event.start), 'MMM', { locale: fr })}</span>
                  <span className="text-xl font-black leading-none">{format(parseISO(event.start), 'dd')}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-church-accent uppercase tracking-[0.2em]">{event.type}</span>
                  <h4 className="text-base font-black text-church-dark dark:text-white line-clamp-1">{event.title}</h4>
                  {event.end && !isSameDay(parseISO(event.start), parseISO(event.end)) && (
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                      Du {format(parseISO(event.start), "d MMM", { locale: fr })} au {format(parseISO(event.end), "d MMM", { locale: fr })}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6 line-clamp-2">
                {event.description}
              </p>
              <div className="pt-6 border-t border-slate-50 dark:border-dark-border flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <Clock size={14} className="text-church-gold" />
                  {format(parseISO(event.start), "HH'h'mm")}
                  {event.end && event.end !== event.start && ` - ${format(parseISO(event.end), "HH'h'mm")}`}
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <MapPin size={14} className="text-church-gold" />
                  <span className="truncate max-w-[100px]">{event.location}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white dark:bg-dark-card rounded-[40px] border-2 border-dashed border-church-border dark:border-dark-border">
          <CalendarIcon size={48} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
          <p className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Aucun évènement correspondant</p>
        </div>
      )}
    </div>
  );
}
