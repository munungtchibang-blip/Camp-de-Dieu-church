import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Heart, CheckCircle2, XCircle, Trash2, ShieldCheck, User, MessageSquare, Phone, Plus, X, Mail } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, getDocs, where, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Appointment {
  id: string;
  userName: string;
  userEmail: string;
  date: string;
  time: string;
  subject: string;
  message: string;
  phone: string;
  status: string;
  reply?: string;
  createdAt: any;
}

interface PrayerRequest {
  id: string;
  name: string;
  email?: string;
  category: string;
  content: string;
  status: string;
  reply?: string;
  isAnonymous: boolean;
  createdAt: any;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  reply?: string;
  createdAt: any;
}

interface OffDay {
  id: string;
  date: string;
  reason: string;
}

export default function PastorBoard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [offDays, setOffDays] = useState<OffDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOffDayModal, setShowOffDayModal] = useState(false);
  const [newOffDay, setNewOffDay] = useState({ date: '', reason: '' });

  useEffect(() => {
    // Realtime appointments
    const qAppt = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
    const unsubAppt = onSnapshot(qAppt, (snap) => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment)));
    });

    // Realtime prayers
    const qPray = query(collection(db, 'prayer_requests'), orderBy('createdAt', 'desc'));
    const unsubPray = onSnapshot(qPray, (snap) => {
      setPrayers(snap.docs.map(d => ({ id: d.id, ...d.data() } as PrayerRequest)));
    });

    // Realtime messages
    const qMsg = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'), limit(10));
    const unsubMsg = onSnapshot(qMsg, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as ContactMessage)));
    });

    // Realtime off days
    const qOff = query(collection(db, 'pastor_off_days'), orderBy('date', 'desc'));
    const unsubOff = onSnapshot(qOff, (snap) => {
      setOffDays(snap.docs.map(d => ({ id: d.id, ...d.data() } as OffDay)));
      setLoading(false);
    });

    return () => {
      unsubAppt();
      unsubPray();
      unsubMsg();
      unsubOff();
    };
  }, []);

  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const handleReplySubmit = async (col: string, id: string) => {
    const text = replyText[id];
    if (!text?.trim()) return;
    try {
      await updateDoc(doc(db, col, id), { 
        reply: text,
        updatedAt: serverTimestamp()
      });
      toast.success("Réponse envoyée !");
      setActiveReplyId(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `${col}/${id}`);
      toast.error("Erreur d'envoi.");
    }
  };

  const handleApptStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status });
      toast.success(`Rendez-vous ${status.toLowerCase()} !`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `appointments/${id}`);
      toast.error("Erreur de mise à jour.");
    }
  };

  const handlePrayerStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'prayer_requests', id), { status });
      toast.success(`Statut mis à jour !`);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `prayer_requests/${id}`);
      toast.error("Erreur de mise à jour.");
    }
  };

  const handleAddOffDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffDay.date) return;
    try {
      await addDoc(collection(db, 'pastor_off_days'), {
        ...newOffDay,
        createdAt: serverTimestamp()
      });
      setShowOffDayModal(false);
      setNewOffDay({ date: '', reason: '' });
      toast.success("Jour libre programmé !");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'pastor_off_days');
      toast.error("Erreur d'enregistrement.");
    }
  };

  const handleRemoveOffDay = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'pastor_off_days', id));
      toast.success("Jour libre supprimé.");
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `pastor_off_days/${id}`);
      toast.error("Erreur de suppression.");
    }
  };

  if (loading) return (
    <div className="py-20 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-church-blue mx-auto mb-4"></div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Initialisation de l'espace Pasteur...</p>
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-card p-8 rounded-[40px] shadow-sm border border-church-border dark:border-dark-border flex items-center gap-6 transition-colors duration-300">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/10 rounded-3xl flex items-center justify-center text-church-blue">
            <Calendar size={32} />
          </div>
          <div>
            <h4 className="text-3xl font-black text-church-dark dark:text-white">{appointments.filter(a => a.status === 'En attente').length}</h4>
            <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">RDV à Confirmer</p>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-card p-8 rounded-[40px] shadow-sm border border-church-border dark:border-dark-border flex items-center gap-6 transition-colors duration-300">
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/10 rounded-3xl flex items-center justify-center text-church-gold">
            <Heart size={32} />
          </div>
          <div>
            <h4 className="text-3xl font-black text-church-dark dark:text-white">{prayers.filter(p => p.status === 'Reçu').length}</h4>
            <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Prières à Porter</p>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-card p-8 rounded-[40px] shadow-sm border border-church-border dark:border-dark-border flex items-center gap-6 transition-colors duration-300">
          <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/10 rounded-3xl flex items-center justify-center text-purple-500">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h4 className="text-3xl font-black text-church-dark dark:text-white">{messages.filter(m => !m.read).length}</h4>
            <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Nouveaux Messages</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Appointments Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-church-dark dark:text-white uppercase tracking-tight flex items-center gap-2">
              <Clock className="text-church-blue" />
              Rendez-vous Récents
            </h2>
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
            {appointments.map(appt => (
              <div key={appt.id} className="bg-white dark:bg-dark-card p-6 rounded-3xl border border-church-border dark:border-dark-border shadow-sm group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 uppercase font-black text-xs">
                      {appt.userName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h4 className="font-black text-church-dark dark:text-white text-sm uppercase tracking-tight">{appt.userName}</h4>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{appt.date} à {appt.time}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    appt.status === 'Confirmé' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 
                    appt.status === 'Annulé' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                  }`}>
                    {appt.status}
                  </div>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-dark-border italic">
                  "{appt.message || 'Aucun message'}"
                </div>

                {appt.reply && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl text-xs text-church-blue dark:text-blue-400 relative">
                    <span className="absolute -top-2 left-4 px-1 bg-blue-50 dark:bg-slate-800 text-[8px] font-black uppercase">Votre Réponse</span>
                    <p className="italic">"{appt.reply}"</p>
                  </div>
                )}

                {activeReplyId === appt.id ? (
                  <div className="mb-4 space-y-2">
                    <textarea 
                      value={replyText[appt.id] || ''}
                      onChange={e => setReplyText({ ...replyText, [appt.id]: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-church-border dark:border-dark-border rounded-xl p-3 text-xs text-church-dark dark:text-white outline-none focus:ring-2 focus:ring-church-blue transition-all"
                      placeholder="Votre réponse au membre..."
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setActiveReplyId(null)} className="px-3 py-1.5 text-[9px] font-black uppercase text-slate-400 dark:text-slate-500">Annuler</button>
                      <button onClick={() => handleReplySubmit('appointments', appt.id)} className="px-3 py-1.5 bg-church-blue text-white rounded-lg text-[9px] font-black uppercase">Envoyer</button>
                    </div>
                  </div>
                ) : (
                  !appt.reply && (
                    <button onClick={() => setActiveReplyId(appt.id)} className="mb-4 text-[9px] font-black uppercase text-church-blue hover:underline flex items-center gap-1">
                      <MessageSquare size={12} /> Répondre au membre
                    </button>
                  )
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Phone size={14} />
                    <span className="text-[10px] font-bold">{appt.phone}</span>
                  </div>
                  <div className="flex gap-2">
                    {appt.status === 'En attente' && (
                      <>
                        <button onClick={() => handleApptStatus(appt.id, 'Confirmé')} className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-all"><CheckCircle2 size={16}/></button>
                        <button onClick={() => handleApptStatus(appt.id, 'Annulé')} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all"><XCircle size={16}/></button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Prayer Requests Section */}
        <section className="space-y-6">
          <h2 className="text-xl font-black text-church-dark dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Heart className="text-church-gold" />
            Portefeuille de Prière
          </h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
            {prayers.map(prayer => (
              <div key={prayer.id} className="bg-white dark:bg-dark-card p-6 rounded-3xl border border-church-border dark:border-dark-border shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-church-gold mb-1 block">{prayer.category}</span>
                    <h4 className="font-black text-church-dark dark:text-white text-sm uppercase tracking-tight">
                      {prayer.isAnonymous ? 'Intercession Anonyme' : prayer.name}
                    </h4>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    prayer.status === 'Prié' ? 'bg-blue-50 dark:bg-blue-900/20 text-church-blue' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                  }`}>
                    {prayer.status === 'Prié' ? 'Consommé' : 'Nouveau'}
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{prayer.content}</p>
                
                {prayer.reply && (
                  <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl text-xs text-church-gold relative">
                    <span className="absolute -top-2 left-4 px-1 bg-amber-50 dark:bg-slate-800 text-[8px] font-black uppercase">Note Pastorale</span>
                    <p className="italic">"{prayer.reply}"</p>
                  </div>
                )}

                {activeReplyId === prayer.id ? (
                  <div className="mb-4 space-y-2">
                    <textarea 
                      value={replyText[prayer.id] || ''}
                      onChange={e => setReplyText({ ...replyText, [prayer.id]: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-church-border dark:border-dark-border rounded-xl p-3 text-xs text-church-dark dark:text-white outline-none focus:ring-2 focus:ring-church-blue transition-all"
                      placeholder="Réponse ou message d'encouragement..."
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setActiveReplyId(null)} className="px-3 py-1.5 text-[9px] font-black uppercase text-slate-400 dark:text-slate-500">Annuler</button>
                      <button onClick={() => handleReplySubmit('prayer_requests', prayer.id)} className="px-3 py-1.5 bg-church-gold text-church-dark rounded-lg text-[9px] font-black uppercase">Répondre</button>
                    </div>
                  </div>
                ) : (
                  !prayer.reply && (
                    <button onClick={() => setActiveReplyId(prayer.id)} className="mb-4 text-[9px] font-black uppercase text-church-gold hover:underline flex items-center gap-1">
                      <MessageSquare size={12} /> Ajouter une réponse
                    </button>
                  )
                )}

                <button 
                  onClick={() => handlePrayerStatus(prayer.id, prayer.status === 'Prié' ? 'Reçu' : 'Prié')}
                  className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    prayer.status === 'Prié' ? 'bg-slate-100 text-slate-400' : 'bg-church-gold text-church-dark shadow-lg shadow-church-gold/20'
                  }`}
                >
                  {prayer.status === 'Prié' ? 'Marquer comme Nouveau' : 'Confirmer le Moment de Prière'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Messages Section */}
        <section className="space-y-6 lg:col-span-2">
          <h2 className="text-xl font-black text-church-dark dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Mail className="text-church-blue" />
            Messages de Contact Récents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {messages.map(msg => (
              <div key={msg.id} className={`bg-white dark:bg-dark-card p-6 rounded-3xl border shadow-sm transition-all ${msg.read ? 'border-church-border dark:border-dark-border' : 'border-church-blue/30 dark:border-church-blue/50 shadow-church-blue/5'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/10 text-church-blue rounded-xl flex items-center justify-center font-black text-[10px]">
                      {msg.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h4 className="font-black text-church-dark dark:text-white text-[11px] uppercase truncate max-w-[120px]">{msg.name}</h4>
                      <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{msg.subject}</p>
                    </div>
                  </div>
                  {!msg.read && <div className="w-2 h-2 bg-church-blue rounded-full animate-pulse"></div>}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 italic">"{msg.message}"</p>
                
                {msg.reply && (
                  <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-dark-border rounded-xl text-[10px] text-slate-500 dark:text-slate-400 relative">
                    <span className="absolute -top-2 left-4 px-1 bg-slate-50 dark:bg-slate-800 text-[7px] font-black uppercase">Votre Réponse</span>
                    <p className="italic leading-relaxed">{msg.reply}</p>
                  </div>
                )}

                {activeReplyId === msg.id ? (
                  <div className="mb-4 space-y-2">
                    <textarea 
                      value={replyText[msg.id] || ''}
                      onChange={e => setReplyText({ ...replyText, [msg.id]: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-church-border dark:border-dark-border rounded-xl p-3 text-[10px] text-church-dark dark:text-white outline-none focus:ring-2 focus:ring-church-blue transition-all"
                      placeholder="Votre réponse..."
                      rows={2}
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setActiveReplyId(null)} className="px-2 py-1 text-[8px] font-black uppercase text-slate-400 dark:text-slate-500">Annuler</button>
                      <button onClick={() => handleReplySubmit('contacts', msg.id)} className="px-2 py-1 bg-church-blue text-white rounded-lg text-[8px] font-black uppercase">Répondre</button>
                    </div>
                  </div>
                ) : (
                  !msg.reply && (
                    <button onClick={() => setActiveReplyId(msg.id)} className="mb-4 text-[9px] font-black uppercase text-church-blue hover:underline flex items-center gap-1">
                      <MessageSquare size={12} /> Répondre
                    </button>
                  )
                )}

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 dark:border-dark-border">
                  <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                    {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'dd/MM/yyyy', { locale: fr }) : '...'}
                  </span>
                  <a href={`mailto:${msg.email}`} className="text-[8px] font-black text-church-blue uppercase tracking-widest hover:underline">Envoyer Email</a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Off Days Section */}
      <section className="bg-church-dark p-8 md:p-12 rounded-[48px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <ShieldCheck className="text-church-gold" />
              Calendrier d'Absence (Jours Libres)
            </h2>
            <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mt-2 px-1">Programmez vos temps de repos et retraites</p>
          </div>
          <button 
            onClick={() => setShowOffDayModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-church-gold text-church-dark rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-xl shadow-church-gold/20"
          >
            <Plus size={16} /> Programmer un jour libre
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {offDays.map(day => (
            <div key={day.id} className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 group relative">
              <button 
                onClick={() => handleRemoveOffDay(day.id)}
                className="absolute top-4 right-4 p-2 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
              <Calendar className="text-church-gold mb-4" size={24} />
              <h4 className="text-white font-black text-lg mb-1">{format(new Date(day.date), 'dd MMMM yyyy', { locale: fr })}</h4>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{day.reason || 'Sabbath / Repos'}</p>
            </div>
          ))}
          {offDays.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
              <p className="text-white/30 font-black uppercase text-[10px] tracking-widest">Aucun jour libre programmé</p>
            </div>
          )}
        </div>
      </section>

      {/* Modal Jours Libres */}
      <AnimatePresence>
        {showOffDayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowOffDayModal(false)}
              className="absolute inset-0 bg-church-dark/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md bg-white dark:bg-dark-card rounded-[40px] p-10 shadow-2xl border border-church-border dark:border-dark-border"
            >
              <h2 className="text-2xl font-black text-church-dark dark:text-white uppercase tracking-tight mb-8">Nouveau Jour Libre</h2>
              <form onSubmit={handleAddOffDay} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Choisir la date</label>
                  <input 
                    type="date"
                    value={newOffDay.date}
                    onChange={e => setNewOffDay({...newOffDay, date: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm text-church-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-church-blue outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Motif (Optionnel)</label>
                  <input 
                    type="text"
                    value={newOffDay.reason}
                    onChange={e => setNewOffDay({...newOffDay, reason: e.target.value})}
                    placeholder="Sabbath, Retraite..."
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm text-church-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-church-blue outline-none transition-all"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowOffDayModal(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Annuler</button>
                  <button type="submit" className="flex-1 py-4 bg-church-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-church-dark transition-all shadow-xl shadow-church-blue/20">Programmer</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
