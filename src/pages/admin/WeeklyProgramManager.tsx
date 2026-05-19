import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Trash2, Clock, Calendar as CalendarIcon, Save, Info } from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import toast from 'react-hot-toast';

interface WeeklyEvent {
  id: string;
  title: string;
  day: number; // 0=Sunday, 1=Monday...
  time: string;
  endTime?: string;
  type: string;
  location: string;
  ministryId?: string;
}

interface Ministry {
  id: string;
  name: string;
}

const DAYS = [
  { value: 0, label: 'Dimanche' },
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
];

export default function WeeklyProgramManager() {
  const [weeklyEvents, setWeeklyEvents] = useState<WeeklyEvent[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

  const [newEvent, setNewEvent] = useState({
    title: '',
    day: 0,
    time: '09:00',
    endTime: '11:00',
    type: 'Culte',
    location: 'Temple Principal',
    ministryId: 'general'
  });

  const eventTypes = ["Culte", "Enseignement", "Séminaire", "Marathon", "Nuit de prière", "Culte spécial", "Conférence", "Croisade", "Jeunesse", "Prière"];

  useEffect(() => {
    const q = query(collection(db, 'weekly_program'), orderBy('day', 'asc'), orderBy('time', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setWeeklyEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as WeeklyEvent[]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'weekly_program');
    });

    const qMin = query(collection(db, 'ministries'), orderBy('name', 'asc'));
    const unsubMin = onSnapshot(qMin, (snapshot) => {
      setMinistries(snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name } as Ministry)));
      setLoading(false);
    });

    return () => {
      unsubscribe();
      unsubMin();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'weekly_program', editingId), {
          ...newEvent,
          updatedAt: serverTimestamp()
        });
        toast.success("Programme hebdomadaire mis à jour !");
      } else {
        await addDoc(collection(db, 'weekly_program'), {
          ...newEvent,
          createdAt: serverTimestamp()
        });
        toast.success("Rendez-vous hebdomadaire ajouté !");
      }
      resetForm();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'weekly_program');
      toast.error("Erreur d'enregistrement.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewEvent({
      title: '',
      day: 0,
      time: '09:00',
      endTime: '11:00',
      type: 'Culte',
      location: 'Temple Principal',
      ministryId: 'general'
    });
    setEditingId(null);
  };

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await deleteDoc(doc(db, 'weekly_program', deleteConfirm.id));
      toast.success("Supprimé du programme standard.");
      setDeleteConfirm({ isOpen: false, id: null });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `weekly_program/${deleteConfirm.id}`);
    }
  };

  return (
    <div className="space-y-8">
      <ConfirmDeleteModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={handleDelete}
      />

      <div className="bg-white dark:bg-dark-card p-8 rounded-3xl shadow-xl border border-church-border dark:border-dark-border transition-colors duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-church-blue/10 rounded-xl flex items-center justify-center text-church-blue">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-church-dark dark:text-white uppercase tracking-tight">
              {editingId ? 'Modifier la Réunion' : 'Définir le Programme Standard'}
            </h2>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Ces rendez-vous se répètent chaque semaine</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Nom de la réunion</label>
              <input 
                type="text"
                value={newEvent.title}
                onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-church-border dark:border-dark-border rounded-xl px-4 py-3 text-sm text-church-dark dark:text-white focus:ring-2 focus:ring-church-blue"
                placeholder="Ex: Culte de Célébration"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Jour</label>
                <select 
                  value={newEvent.day}
                  onChange={e => setNewEvent({...newEvent, day: parseInt(e.target.value)})}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-church-border dark:border-dark-border rounded-xl px-4 py-3 text-sm text-church-dark dark:text-white"
                >
                  {DAYS.map(day => <option key={day.value} value={day.value} className="bg-white dark:bg-dark-card">{day.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Début</label>
                <input 
                  type="time"
                  value={newEvent.time}
                  onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-church-border dark:border-dark-border rounded-xl px-4 py-3 text-sm text-church-dark dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Fin</label>
                <input 
                  type="time"
                  value={newEvent.endTime}
                  onChange={e => setNewEvent({...newEvent, endTime: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-church-border dark:border-dark-border rounded-xl px-4 py-3 text-sm text-church-dark dark:text-white"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Type / Catégorie</label>
              <select 
                value={newEvent.type}
                onChange={e => setNewEvent({...newEvent, type: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-church-border dark:border-dark-border rounded-xl px-4 py-3 text-sm text-church-dark dark:text-white"
              >
                {eventTypes.map(t => <option key={t} value={t} className="bg-white dark:bg-dark-card">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Ministère / Pôle Rattaché</label>
              <select 
                value={newEvent.ministryId}
                onChange={e => setNewEvent({...newEvent, ministryId: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-church-border dark:border-dark-border rounded-xl px-4 py-3 text-sm text-church-dark dark:text-white"
              >
                <option value="general" className="bg-white dark:bg-dark-card">Général (Église)</option>
                {ministries.map(m => (
                  <option key={m.id} value={m.id} className="bg-white dark:bg-dark-card">{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Lieu par défaut</label>
              <input 
                type="text"
                value={newEvent.location}
                onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-church-border dark:border-dark-border rounded-xl px-4 py-3 text-sm text-church-dark dark:text-white"
                placeholder="Ex: Temple Principal"
              />
            </div>
            <div className="flex gap-4 pt-2">
              <button 
                type="submit" 
                disabled={submitting}
                className="flex-1 py-4 bg-church-blue text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-church-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {editingId ? 'Mettre à jour' : 'Enregistrer'}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="px-6 py-4 bg-slate-100 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200"
                >
                  Annuler
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-3xl shadow-xl border border-church-border dark:border-dark-border overflow-hidden transition-colors duration-300">
        <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-b border-church-border dark:border-dark-border flex items-center justify-between">
          <h3 className="font-black text-church-dark dark:text-white uppercase tracking-widest text-xs">Aperçu du Programme Hebdomadaire</h3>
          <div className="flex items-center gap-2 text-[9px] font-black text-blue-500 uppercase tracking-widest">
            <Info size={14} />
            Utilisé pour la génération automatique
          </div>
        </div>
        
        <div className="divide-y divide-slate-100 dark:divide-dark-border">
          {loading ? (
             <div className="p-20 text-center text-slate-300 dark:text-slate-600 font-black text-[10px] uppercase tracking-widest">Chargement...</div>
          ) : weeklyEvents.length === 0 ? (
             <div className="p-20 text-center text-slate-300 dark:text-slate-600 font-black text-[10px] uppercase tracking-widest">Aucun programme standard défini</div>
          ) : (
            weeklyEvents.map(event => (
              <div key={event.id} className="p-6 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-6">
                  <div className="w-24 px-4 py-2 bg-church-dark dark:bg-slate-800 rounded-xl text-center text-white flex-shrink-0 border border-transparent dark:border-dark-border">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">{DAYS.find(d => d.value === event.day)?.label.slice(0, 3)}</p>
                    <p className="text-xs font-black">{event.time} {event.endTime ? `- ${event.endTime}` : ''}</p>
                  </div>
                  <div>
                    <h4 className="font-black text-church-dark dark:text-white uppercase tracking-tight mb-1">{event.title}</h4>
                    <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Clock size={10} className="text-church-blue" /> {event.type}</span>
                      <span className="flex items-center gap-1"><Info size={10} className="text-church-gold" /> {event.location}</span>
                      {event.ministryId && event.ministryId !== 'general' && (
                        <span className="bg-church-blue/10 dark:bg-church-blue/20 text-church-blue px-2 py-0.5 rounded-full">
                          {ministries.find(m => m.id === event.ministryId)?.name || 'Ministère'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => {
                        setNewEvent({
                          title: event.title,
                          day: event.day,
                          time: event.time,
                          endTime: event.endTime || '',
                          type: event.type,
                          location: event.location,
                          ministryId: event.ministryId || 'general'
                        });
                        setEditingId(event.id);
                    }}
                    className="p-3 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl border border-slate-100 dark:border-slate-700 hover:text-church-blue hover:border-church-blue transition-all"
                  >
                    <Plus className="rotate-45" size={16} />
                  </button>
                  <button 
                    onClick={() => setDeleteConfirm({ isOpen: true, id: event.id })}
                    className="p-3 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl border border-slate-100 dark:border-slate-700 hover:text-red-500 hover:border-red-500 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
