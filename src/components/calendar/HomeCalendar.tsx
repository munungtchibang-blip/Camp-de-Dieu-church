import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Timestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  start: Timestamp;
  type: string;
  location?: string;
  description?: string;
}

export default function HomeCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchMonthEvents = async () => {
      setLoading(true);
      try {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);

        const q = query(
          collection(db, 'events'),
          where('start', '>=', Timestamp.fromDate(start)),
          where('start', '<=', Timestamp.fromDate(end))
        );
        const snapshot = await getDocs(q);
        const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Event[];
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching calendar events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMonthEvents();
  }, [currentDate]);

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Get events for the selected date
  const selectedDateEvents = events.filter(e => isSameDay(e.start.toDate(), selectedDate));

  // Determine starting weekday offset for empty grid cells
  const offset = startOfMonth(currentDate).getDay(); // 0 is Sunday
  // Adjust so Monday is 0: (offset + 6) % 7
  const startOffset = (offset + 6) % 7;
  const blanks = Array.from({ length: startOffset });

  return (
    <div className="bg-white dark:bg-dark-card rounded-[32px] overflow-hidden border border-church-border dark:border-dark-border shadow-2xl flex flex-col md:flex-row">
      <div className="p-8 flex-1 md:border-r border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black uppercase text-church-dark dark:text-white flex items-center gap-2">
            <CalendarIcon className="text-church-blue" size={24} />
            <span className="capitalize">{format(currentDate, 'MMMM yyyy', { locale: fr })}</span>
          </h3>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-church-blue transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextMonth} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-church-blue transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
            <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {blanks.map((_, i) => (
            <div key={`blank-${i}`} className="aspect-square opacity-0"></div>
          ))}
          {days.map((day, i) => {
            const hasEvent = events.some(e => isSameDay(e.start.toDate(), day));
            const isSelected = isSameDay(selectedDate, day);
            const isToday = isSameDay(new Date(), day);

            return (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(day)}
                className={`relative aspect-square flex items-center justify-center rounded-2xl text-sm font-black transition-all
                  ${isSelected ? 'bg-church-blue text-white shadow-lg shadow-church-blue/30' : 
                    isToday ? 'bg-church-blue/10 text-church-blue dark:bg-blue-900/30' : 
                    hasEvent ? 'bg-slate-50 text-slate-900 dark:bg-slate-800 dark:text-white border border-church-blue/20' : 
                    'bg-slate-50/50 text-slate-500 hover:bg-slate-100 dark:bg-slate-800/30 dark:text-slate-400 dark:hover:bg-slate-800'}
                `}
              >
                {format(day, 'd')}
                {hasEvent && !isSelected && (
                  <span className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-church-accent"></span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
      
      <div className="w-full md:w-96 bg-slate-50 dark:bg-slate-800/50 p-8 flex flex-col">
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6 flex items-center gap-2">
          {isSameDay(selectedDate, new Date()) ? "Aujourd'hui" : format(selectedDate, 'EEEE d MMMM', { locale: fr })}
        </h4>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
          {loading ? (
            <div className="animate-pulse flex space-x-4"><div className="rounded-2xl bg-slate-200 dark:bg-slate-700 h-20 w-full"></div></div>
          ) : selectedDateEvents.length > 0 ? (
            selectedDateEvents.map(event => (
              <div key={event.id} className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-church-blue"></div>
                <h5 className="font-bold text-church-dark dark:text-white mb-2 ml-2 leading-tight">
                  {event.title}
                </h5>
                <div className="space-y-1.5 ml-2">
                 <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                   <Clock size={12} className="text-church-blue/70" />
                   {format(event.start.toDate(), 'HH:mm')}
                 </div>
                 {event.location && (
                   <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                     <MapPin size={12} className="text-church-blue/70" />
                     {event.location}
                   </div>
                 )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 mx-auto flex items-center justify-center">
                <CalendarIcon className="text-slate-300 dark:text-slate-600" size={24} />
              </div>
              <p className="text-sm font-bold text-slate-400 dark:text-slate-500">Aucun événement prévu</p>
            </div>
          )}
        </div>
        
        <Link to="/programmes" className="mt-6 w-full py-4 text-center rounded-xl bg-church-blue/10 text-church-blue font-bold text-xs uppercase tracking-widest hover:bg-church-blue hover:text-white transition-all">
          Voir tout le calendrier
        </Link>
      </div>
    </div>
  );
}
