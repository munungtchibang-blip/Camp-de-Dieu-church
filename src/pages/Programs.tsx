import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, Bell, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

interface Event {
  id: string;
  title: string;
  description: string;
  start: string;
  location: string;
  type: string;
}

export default function Programs() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('start', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Event));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'events');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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

  return (
    <div className="pt-32 pb-20 bg-church-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-16 text-center"
        >
          <div className="inline-block bg-church-blue/10 text-church-blue px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            Calendrier Spirituel
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black text-church-dark mb-4">Agenda des Programmes</h1>
          <p className="text-slate-500 max-w-2xl mx-auto font-medium">Bâtissez votre vie spirituelle en participant activement à nos différents rendez-vous.</p>
        </motion.div>

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
              <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-church-border overflow-hidden">
                <div className="p-8 flex items-center justify-between border-b border-church-border bg-slate-50">
                  <h2 className="text-xl font-black text-church-dark uppercase tracking-tight flex items-center gap-3">
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
                      className="px-3 py-1 bg-white border border-church-border rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-500 hover:text-church-blue hover:border-church-blue transition-all"
                    >
                      Aujourd'hui
                    </button>
                    <button 
                      onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                      className="p-2 hover:bg-white rounded-xl border border-church-border transition-colors text-slate-400 hover:text-church-blue"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                      onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                      className="p-2 hover:bg-white rounded-xl border border-church-border transition-colors text-slate-400 hover:text-church-blue"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-7 gap-1">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
                    <div key={d} className="text-center py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
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
                            isSelected ? "bg-church-dark text-white border-church-dark shadow-lg ring-4 ring-blue-100" : "bg-white border-transparent text-slate-700 hover:bg-blue-50",
                            hasEvent && !isSelected ? "border-church-gold/30" : ""
                          )}
                        >
                          <span className="text-sm font-black">{format(day, 'd')}</span>
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
                              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-56 bg-white rounded-2xl shadow-2xl border border-church-border p-4 z-50 pointer-events-none"
                            >
                              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-50">
                                <CalendarIcon size={12} className="text-church-blue" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                  {format(day, 'd MMMM', { locale: fr })}
                                </span>
                              </div>
                              <div className="space-y-3">
                                {dayEvents.map(e => (
                                  <div key={e.id} className="border-l-2 border-church-accent pl-3 py-0.5">
                                    <p className="text-[10px] font-black text-church-dark uppercase leading-tight line-clamp-2 mb-1">{e.title}</p>
                                    <div className="flex items-center gap-1.5 opacity-60">
                                      <Clock size={8} className="text-church-gold" />
                                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">
                                        {format(parseISO(e.start), "HH'h'mm")} • {e.location}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                                <div className="w-3 h-3 bg-white border-r border-b border-church-border rotate-45" />
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
                <div className="bg-white rounded-3xl shadow-xl border border-church-border p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-black text-church-dark uppercase tracking-widest text-xs">Événements du Jour</h3>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
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
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={cn(
                                "group relative p-4 rounded-2xl transition-all border",
                                isUpcoming 
                                  ? "bg-blue-50/30 border-church-blue/10 hover:border-church-blue/30" 
                                  : "bg-slate-50/50 border-transparent grayscale-[0.5] opacity-70"
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
                                  event.type === 'Culte' ? "bg-white text-church-blue" : "bg-white text-church-accent"
                                )}>
                                  <Clock size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[9px] font-black text-church-accent uppercase tracking-widest mb-1">{event.type}</p>
                                  <h4 className="text-sm font-black text-church-dark mb-2 group-hover:text-church-blue transition-colors truncate">{event.title}</h4>
                                  <div className="space-y-1 text-[11px] text-slate-500 font-medium">
                                    <div className="flex items-center gap-2">
                                      <Clock size={12} className="text-church-gold" />
                                      <span>{format(eventDate, "HH'h'mm")}</span>
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
                        <Bell size={48} className="mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest">Aucun programme prévu</p>
                      </div>
                    )}
                  </div>

                  {filteredEvents.length > 0 && (
                    <button className="w-full mt-8 py-4 bg-church-dark text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-church-blue transition-all flex items-center justify-center gap-2">
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

            {/* All Upcoming Events Section with Filters */}
            <UpcomingEventsList events={events} />
          </div>
        )}
      </div>
    </div>
  );
}

function UpcomingEventsList({ events }: { events: Event[] }) {
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
          <h2 className="text-3xl font-display font-black text-church-dark mb-2 uppercase tracking-tight">Tous nos programmes</h2>
          <p className="text-slate-500 font-medium">Parcourez tous les événements futurs de l'église.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                filter === t ? "bg-church-blue text-white shadow-lg shadow-church-blue/20" : "bg-white border border-church-border text-slate-500 hover:bg-slate-50"
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
              className="bg-white p-6 rounded-[32px] border border-church-border hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex flex-col items-center justify-center text-church-blue border border-church-border group-hover:bg-church-blue group-hover:text-white transition-all">
                  <span className="text-[10px] font-black uppercase leading-none mb-1">{format(parseISO(event.start), 'MMM', { locale: fr })}</span>
                  <span className="text-xl font-black leading-none">{format(parseISO(event.start), 'dd')}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-church-accent uppercase tracking-[0.2em]">{event.type}</span>
                  <h4 className="text-base font-black text-church-dark">{event.title}</h4>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 line-clamp-2">
                {event.description}
              </p>
              <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Clock size={14} className="text-church-gold" />
                  {format(parseISO(event.start), "HH'h'mm")}
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <MapPin size={14} className="text-church-gold" />
                  {event.location}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-church-border">
          <CalendarIcon size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Aucun évènement correspondant</p>
        </div>
      )}
    </div>
  );
}
