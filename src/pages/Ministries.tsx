import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Users, Heart, Baby, Shield, Music, Star, ArrowRight, Loader2, X, Calendar as CalendarIcon, Clock, ChevronRight, MapPin } from 'lucide-react';

interface Activity {
  title: string;
  time: string;
  description: string;
}

interface Ministry {
  id: string;
  name: string;
  description: string;
  leader?: string;
  imageUrl?: string;
  iconName?: string;
  activities?: Activity[];
}

interface WeeklyProgram {
  id: string;
  title: string;
  day: number;
  time: string;
  endTime?: string;
  type: string;
  location: string;
  ministryId: string;
}

const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const iconMap: Record<string, any> = {
  Users,
  Heart,
  Baby,
  Shield,
  Music,
  Star
};

export default function Ministries() {
  const location = useLocation();
  const navigate = useNavigate();
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [weeklyPrograms, setWeeklyPrograms] = useState<WeeklyProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMinistry, setSelectedMinistry] = useState<Ministry | null>(null);

  const closeModal = () => {
    setSelectedMinistry(null);
    if (location.hash) {
      navigate('/ministeres', { replace: true });
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'ministries'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMinistries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ministry));
      setMinistries(fetchedMinistries);
      
      // Auto-select based on hash after data is loaded
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash && fetchedMinistries.length > 0) {
        const found = fetchedMinistries.find(m => 
          m.name.toLowerCase().includes(hash) || 
          hash.includes(m.name.toLowerCase())
        );
        if (found) setSelectedMinistry(found);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'ministries');
    });

    const qProg = query(collection(db, 'weekly_program'), orderBy('day', 'asc'), orderBy('time', 'asc'));
    const unsubProg = onSnapshot(qProg, (snapshot) => {
      setWeeklyPrograms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WeeklyProgram)));
      setLoading(false);
    });

    return () => {
      unsubscribe();
      unsubProg();
    };
  }, []);

  // Update selection if hash changes
  useEffect(() => {
    const hash = location.hash.replace('#', '').toLowerCase();
    if (hash && ministries.length > 0) {
      const found = ministries.find(m => 
        m.name.toLowerCase().includes(hash) || 
        hash.includes(m.name.toLowerCase())
      );
      if (found) {
        setSelectedMinistry(found);
      } else if (hash === '') {
        setSelectedMinistry(null);
      }
    } else if (!hash) {
      setSelectedMinistry(null);
    }
  }, [location.hash, ministries]);

  return (
    <div className="pt-32 pb-20 bg-church-bg dark:bg-dark-bg min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-church-gold/10 text-church-gold px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            Servir & S'engager
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black text-church-dark dark:text-white mb-6">Nos Ministères</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium text-lg">
            Découvrez les différentes manières de servir au sein de notre communauté et trouvez votre place pour grandir spirituellement.
          </p>
        </motion.div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="animate-spin text-church-blue mx-auto mb-4" size={48} />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Ouverture des portes des ministères...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ministries.map((ministry, i) => {
              const Icon = iconMap[ministry.iconName || 'Users'] || Users;
              return (
                <motion.div
                  key={ministry.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative bg-white dark:bg-dark-card rounded-[48px] overflow-hidden border border-church-border dark:border-dark-border shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer"
                  onClick={() => setSelectedMinistry(ministry)}
                >
                  <div className="aspect-[4/3] relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img 
                      src={ministry.imageUrl || `https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800`} 
                      alt={ministry.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-church-dark/80 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-3 group-hover:bg-church-gold group-hover:text-church-dark transition-all duration-500">
                        <Icon size={24} />
                      </div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight">{ministry.name}</h3>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3 font-medium">
                      {ministry.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-dark-border">
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-1">Responsable</p>
                        <p className="text-xs font-bold text-church-dark dark:text-white">{ministry.leader || 'Direction de l\'Évêché'}</p>
                      </div>
                      <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl group-hover:bg-church-dark group-hover:dark:bg-church-blue group-hover:text-white transition-all duration-500">
                        <ArrowRight size={20} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <AnimatePresence>
          {selectedMinistry && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-y-auto pt-20 pb-10">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={closeModal} 
                className="fixed inset-0 bg-church-dark/95 backdrop-blur-md" 
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 50 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 50 }} 
                className="relative w-full max-w-5xl bg-white dark:bg-dark-card rounded-[48px] overflow-hidden shadow-2xl flex flex-col transition-colors duration-300"
              >
                <button 
                  onClick={closeModal} 
                  className="absolute top-8 right-8 z-30 w-12 h-12 bg-white/10 backdrop-blur-md text-white rounded-2xl flex items-center justify-center hover:bg-church-gold hover:text-church-dark transition-all border border-white/20"
                >
                  <X size={24} />
                </button>

                <div className="h-[350px] relative flex-shrink-0">
                  <img 
                    src={selectedMinistry.imageUrl || `https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800`} 
                    alt={selectedMinistry.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-church-dark/30" />
                  <div className="absolute bottom-10 left-12 right-12 z-20">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-church-gold text-church-dark rounded-3xl flex items-center justify-center shadow-2xl">
                        {React.createElement(iconMap[selectedMinistry.iconName || 'Users'] || Users, { size: 40 })}
                      </div>
                      <div>
                        <div className="inline-block bg-church-gold/20 backdrop-blur-md text-church-gold px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-2 border border-church-gold/30">Département Officiel</div>
                        <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight drop-shadow-xl">{selectedMinistry.name}</h2>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-white dark:bg-dark-card">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div>
                      <div className="inline-block bg-church-blue/10 text-church-blue px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-4">Vision & Impact</div>
                      <p className="text-slate-600 dark:text-slate-300 text-lg md:text-xl leading-relaxed font-semibold mb-10">
                        {selectedMinistry.description}
                      </p>
                      
                      <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[40px] border border-slate-100 dark:border-dark-border flex items-center gap-6">
                        <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center text-church-blue shadow-sm border border-slate-50 dark:border-slate-600 flex-shrink-0">
                          <Star size={32} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] mb-1">Direction du Ministère</p>
                          <p className="text-xl font-black text-church-dark dark:text-white uppercase tracking-tight">{selectedMinistry.leader || 'Servant de l\'Éternel'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Responsable Principal</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="inline-block bg-church-gold/10 text-church-gold px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-4">Agenda des Activités</div>
                      <div className="space-y-8">
                        {weeklyPrograms.filter(p => p.ministryId === selectedMinistry.id).length > 0 ? (
                          weeklyPrograms.filter(p => p.ministryId === selectedMinistry.id).map((program, idx) => (
                            <div key={idx} className="flex gap-8 group">
                              <div className="flex-shrink-0 flex flex-col items-center">
                                <div className="w-3 h-3 bg-church-gold rounded-full group-hover:scale-150 transition-transform duration-500" />
                                <div className="w-px flex-1 bg-slate-100 my-2" />
                              </div>
              <div className="pb-8 border-b border-slate-50 w-full group-hover:pl-4 transition-all duration-500">
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                  <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center gap-2">
                                    <CalendarIcon size={12} className="text-church-blue" />
                                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{DAYS[program.day]}</span>
                                  </div>
                                  <div className="px-3 py-1 bg-church-blue/5 dark:bg-church-blue/10 rounded-full flex items-center gap-2">
                                    <Clock size={12} className="text-church-blue" />
                                    <span className="text-[10px] font-black text-church-blue uppercase tracking-widest">{program.time} {program.endTime ? `- ${program.endTime}` : ''}</span>
                                  </div>
                                  <div className="px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-dark-border rounded-full flex items-center gap-2">
                                    <MapPin size={12} className="text-slate-400" />
                                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{program.location}</span>
                                  </div>
                                </div>
                                <h4 className="text-xl font-black text-church-dark dark:text-white uppercase tracking-tight mb-3 flex items-center gap-3">
                                  {program.title}
                                  <ChevronRight size={20} className="text-slate-200 group-hover:text-church-gold group-hover:translate-x-2 transition-all" />
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-lg mb-2">Rejoignez-nous pour ce moment de communion intense et de croissance spirituelle.</p>
                              </div>
                            </div>
                          ))
                        ) : (selectedMinistry.activities && selectedMinistry.activities.length > 0) ? (
                          selectedMinistry.activities.map((activity, idx) => (
                            <div key={idx} className="flex gap-8 group">
                              <div className="flex-shrink-0 flex flex-col items-center">
                                <div className="w-3 h-3 bg-church-gold rounded-full group-hover:scale-150 transition-transform duration-500" />
                                <div className="w-px flex-1 bg-slate-100 my-2" />
                              </div>
                              <div className="pb-8 border-b border-slate-50 w-full group-hover:pl-4 transition-all duration-500">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="px-3 py-1 bg-slate-100 rounded-full flex items-center gap-2">
                                    <Clock size={12} className="text-church-blue" />
                                    <span className="text-[10px] font-black text-church-blue uppercase tracking-widest">{activity.time}</span>
                                  </div>
                                </div>
                                <h4 className="text-xl font-black text-church-dark uppercase tracking-tight mb-3 flex items-center gap-3">
                                  {activity.title}
                                  <ChevronRight size={20} className="text-slate-200 group-hover:text-church-gold group-hover:translate-x-2 transition-all" />
                                </h4>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-md">{activity.description}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-16 text-center rounded-[48px] border-2 border-dashed border-slate-100 bg-slate-25">
                            <CalendarIcon size={48} className="text-slate-200 mx-auto mb-6" />
                            <p className="text-sm font-black uppercase text-slate-300 tracking-[0.2em]">Calendrier en cours de mise à jour</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Call to Action Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 relative bg-church-dark rounded-[64px] p-12 md:p-20 overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-church-blue/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-church-gold/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block bg-church-gold/20 text-church-gold px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-church-gold/30">
                Prêt à servir ?
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white leading-[1.1] mb-8">
                Chaque don de soi enrichit le Royaume.
              </h2>
              <p className="text-xl text-blue-50/70 font-medium leading-relaxed mb-10 max-w-lg">
                Dieu vous a donné des talents uniques. Rejoignez l'un de nos ministères pour mettre ces dons au service de la communauté et grandir dans votre foi.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/contact" 
                  className="px-10 py-5 bg-church-gold text-church-dark rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-xl shadow-church-gold/20"
                >
                  Contacter un responsable
                </Link>
                <Link 
                  to="/rendez-vous" 
                  className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all"
                >
                  Signaler un talent
                </Link>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-10">
                <div className="h-64 rounded-[40px] overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1544427928-c49cdfebf193?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                </div>
                <div className="h-48 rounded-[40px] bg-church-blue/40 backdrop-blur-sm border border-white/10 flex flex-col items-center justify-center p-8 text-center">
                   <p className="text-3xl font-black text-white mb-1">20+</p>
                   <p className="text-[10px] font-black text-church-gold uppercase tracking-[0.2em]">Pôles d'Action</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-48 rounded-[40px] bg-church-gold/90 p-8 flex flex-col justify-end">
                   <Heart className="text-church-dark mb-4" size={32} />
                   <p className="text-sm font-black text-church-dark leading-tight uppercase tracking-tight">Servir avec Amour et Excellence</p>
                </div>
                <div className="h-64 rounded-[40px] overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1523240715639-9945415714f3?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
