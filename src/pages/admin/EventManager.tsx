import React, { useState, useEffect, useRef } from 'react';
import { Plus, Loader2, Trash2, Calendar as CalendarIcon, MapPin, Type, Image as ImageIcon, Sparkles, Edit2, Save } from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { format, startOfWeek, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';

interface Event {
  id: string;
  title: string;
  description: string;
  start: any;
  end?: any;
  location: string;
  type: string;
  imageUrl?: string;
}

export default function EventManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    location: '',
    type: 'Culte',
    imageUrl: ''
  });

  const eventTypes = ["Culte", "Conférence", "Séminaire", "Croisade", "Jeunesse", "Prière"];

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('start', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Event[]);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'events');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEvent({ ...newEvent, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWeeklyProgramGen = async () => {
    if (!window.confirm("Générer le programme de prière standard pour la semaine prochaine ?")) return;
    
    setSubmitting(true);
    const sunday = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 6); // Next Sunday
    
    const weeklyEvents = [
      { day: 0, title: "Culte de Célébration", type: "Culte", time: "09:00" },
      { day: 2, title: "Intercession & Enseignement", type: "Prière", time: "17:30" },
      { day: 4, title: "Veillée de Prière", type: "Prière", time: "22:00" },
      { day: 5, title: "Réunion de la Jeunesse", type: "Jeunesse", time: "15:00" },
    ];

    try {
      for (const item of weeklyEvents) {
        const eventDate = addDays(sunday, item.day);
        const [hours, minutes] = item.time.split(':');
        eventDate.setHours(parseInt(hours), parseInt(minutes));
        
        await addDoc(collection(db, 'events'), {
          title: item.title,
          type: item.type,
          start: format(eventDate, "yyyy-MM-dd'T'HH:mm"),
          description: "Programme hebdomadaire standard",
          location: "Temple Principal",
          imageUrl: '',
          createdAt: serverTimestamp()
        });
      }
      alert("Programme de la semaine généré !");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'events');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewEvent({
      title: '',
      description: '',
      start: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      location: '',
      type: 'Culte',
      imageUrl: ''
    });
    setEditingId(null);
  };

  const handleEdit = (event: Event) => {
    setNewEvent({
      title: event.title,
      description: event.description,
      start: event.start,
      location: event.location,
      type: event.type,
      imageUrl: event.imageUrl || ''
    });
    setEditingId(event.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'events', editingId), {
          ...newEvent,
          updatedAt: serverTimestamp()
        });
        alert("Événement mis à jour !");
      } else {
        await addDoc(collection(db, 'events'), {
          ...newEvent,
          createdAt: serverTimestamp()
        });
      }
      resetForm();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, editingId ? `events/${editingId}` : 'events');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await deleteDoc(doc(db, 'events', deleteConfirm.id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `events/${deleteConfirm.id}`);
    }
  };

  return (
    <div className="space-y-8">
      <ConfirmDeleteModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        message="Voulez-vous vraiment supprimer cet événement ? Cette action est irréversible."
      />
      {/* Weekly Program Generator Card */}
      <div className="bg-gradient-to-r from-church-blue to-blue-900 p-8 rounded-[40px] shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2 flex items-center justify-center md:justify-start gap-3">
              <Sparkles size={24} className="text-church-gold" />
              Programme de la Semaine
            </h2>
            <p className="text-blue-100 text-sm font-medium">Générez automatiquement les cultes et réunions de prière hebdomadaires en un clic.</p>
          </div>
          <button 
            onClick={handleWeeklyProgramGen}
            disabled={submitting}
            className="px-8 py-4 bg-church-gold text-church-dark rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-yellow-400 transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            Générer la Semaine
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-church-border">
        <h2 className="text-xl font-black text-church-dark mb-6 flex items-center gap-2 uppercase tracking-tight">
          <CalendarIcon className="text-church-blue" />
          {editingId ? 'Modifier l\'Événement' : 'Ajouter manuellement'}
        </h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Titre de l'Événement</label>
              <input 
                type="text"
                value={newEvent.title}
                onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-blue"
                placeholder="Ex: Culte de Célébration"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Type</label>
                <select 
                  value={newEvent.type}
                  onChange={e => setNewEvent({...newEvent, type: e.target.value})}
                  className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-blue"
                >
                  {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Date & Heure</label>
                <input 
                  type="datetime-local"
                  value={newEvent.start}
                  onChange={e => setNewEvent({...newEvent, start: e.target.value})}
                  className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-blue"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Image de couverture</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newEvent.imageUrl}
                  onChange={e => setNewEvent({...newEvent, imageUrl: e.target.value})}
                  className="flex-1 bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm"
                  placeholder="URL de l'image (optionnel)"
                />
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*"
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                  title="Importer depuis l'appareil"
                >
                  <ImageIcon size={18} />
                </button>
              </div>
              {newEvent.imageUrl && (
                <div className="mt-3 relative w-full h-32 rounded-xl overflow-hidden border border-church-border">
                  <img src={newEvent.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                  <button 
                    type="button"
                    onClick={() => setNewEvent({...newEvent, imageUrl: ''})}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow-lg"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lieu</label>
              <input 
                type="text"
                value={newEvent.location}
                onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm"
                placeholder="Ex: Temple principal / Zoom"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
              <textarea 
                value={newEvent.description}
                onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm"
                rows={4}
                placeholder="Brève description..."
              />
            </div>
            
            <div className="flex gap-4">
              <button 
                type="submit"
                disabled={submitting}
                className="flex-1 mt-2 py-4 bg-church-blue text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-church-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : (editingId ? <Save size={18} /> : <Plus size={18} />)}
                {editingId ? 'Mettre à jour' : 'Ajouter au Programme'}
              </button>
              {editingId && (
                <button 
                  type="button"
                  onClick={resetForm}
                  className="mt-2 px-6 py-4 bg-slate-100 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Annuler
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-church-border">
        <h2 className="text-xl font-black text-church-dark mb-8 uppercase tracking-tight">Calendrier des Activités</h2>
        
        {loading ? (
          <div className="py-12 text-center text-slate-400 uppercase font-black text-[10px] tracking-widest">
            Chargement...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map(event => (
              <div key={event.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start justify-between group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex flex-col items-center justify-center text-church-blue flex-shrink-0 shadow-sm overflow-hidden">
                    {event.imageUrl ? (
                      <img src={event.imageUrl} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <CalendarIcon size={20} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-church-dark uppercase tracking-tight text-sm mb-1">{event.title}</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                        <Type size={10} className="text-church-blue" />
                        <span>{event.type}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                        <CalendarIcon size={10} />
                        <span>{event.start.replace('T', ' à ')}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                          <MapPin size={10} />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(event)}
                    className="p-2 text-slate-300 hover:text-church-blue transition-colors"
                    title="Modifier"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => setDeleteConfirm({ isOpen: true, id: event.id })}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

