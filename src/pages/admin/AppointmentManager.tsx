import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Mail, Trash2, CheckCircle2, XCircle, Loader2, MessageSquare } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';

interface Appointment {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  date: string;
  time: string;
  subject: string;
  message: string;
  phone: string;
  status: 'En attente' | 'Confirmé' | 'Annulé';
  createdAt: any;
}

export default function AppointmentManager() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

  useEffect(() => {
    const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      setAppointments(list);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'appointments');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status: newStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await deleteDoc(doc(db, 'appointments', deleteConfirm.id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `appointments/${deleteConfirm.id}`);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 uppercase font-black text-[10px] tracking-widest">
        Chargement des rendez-vous...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ConfirmDeleteModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        message="Voulez-vous vraiment supprimer ce rendez-vous ? Cette action est irréversible."
      />
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black text-church-dark uppercase tracking-tight flex items-center gap-2">
          <Calendar className="text-church-blue" />
          Rendez-vous Membres
        </h2>
        <div className="px-4 py-2 bg-blue-50 text-church-blue rounded-full text-[10px] font-black uppercase tracking-widest">
          {appointments.length} Total
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {appointments.map((appt) => (
          <div key={appt.id} className="bg-white p-6 rounded-[32px] border border-church-border shadow-sm hover:shadow-md transition-all group">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              {/* Header Info */}
              <div className="flex-shrink-0 flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-black text-church-dark uppercase tracking-tight text-sm">{appt.userName || 'Anonyme'}</h3>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <Mail size={12} />
                    {appt.userEmail}
                  </div>
                </div>
              </div>

              {/* Appointment Content */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 py-4 lg:py-0 border-y lg:border-y-0 lg:border-x border-church-border px-0 lg:px-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Date & Heure</span>
                  <div className="flex items-center gap-2 text-church-dark font-bold text-sm">
                    <Calendar size={14} className="text-church-blue" />
                    {appt.date} à {appt.time}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Objet</span>
                  <div className="flex items-center gap-2 text-church-dark font-bold text-sm">
                    <MessageSquare size={14} className="text-church-blue" />
                    {appt.subject}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Contact</span>
                  <div className="flex items-center gap-2 text-church-dark font-bold text-sm">
                    <Phone size={14} className="text-church-blue" />
                    {appt.phone}
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center justify-between lg:justify-end gap-4 min-w-[200px]">
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  appt.status === 'Confirmé' ? 'bg-green-50 text-green-600' :
                  appt.status === 'Annulé' ? 'bg-red-50 text-red-600' :
                  'bg-amber-50 text-amber-600'
                }`}>
                  {appt.status}
                </div>
                
                <div className="flex items-center gap-2">
                  {appt.status === 'En attente' && (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate(appt.id, 'Confirmé')}
                        className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all"
                        title="Confirmer"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(appt.id, 'Annulé')}
                        className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                        title="Annuler"
                      >
                        <XCircle size={18} />
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => setDeleteConfirm({ isOpen: true, id: appt.id })}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
            
            {appt.message && (
              <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 italic">
                "{appt.message}"
              </div>
            )}
          </div>
        ))}
        {appointments.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[40px] border border-dashed border-church-border">
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Aucune demande de rendez-vous</p>
          </div>
        )}
      </div>
    </div>
  );
}
