import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Trash2, CheckCircle2, Clock, Calendar, Heart, ShieldAlert, Sparkles } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import toast from 'react-hot-toast';

interface PrayerRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  isUrgent: boolean;
  status: 'Reçu' | 'En prière' | 'Exaucé';
  createdAt: any;
}

export default function PrayerRequestManager() {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

  useEffect(() => {
    const q = query(collection(db, 'prayer_requests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PrayerRequest[];
      setRequests(list);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'prayer_requests');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'prayer_requests', id), { status: newStatus });
      toast.success(`Statut mis à jour: ${newStatus}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `prayer_requests/${id}`);
      toast.error("Erreur de mise à jour.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await deleteDoc(doc(db, 'prayer_requests', deleteConfirm.id));
      toast.success("Requête supprimée.");
      setDeleteConfirm({ isOpen: false, id: null });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `prayer_requests/${deleteConfirm.id}`);
      toast.error("Erreur de suppression.");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 uppercase font-black text-[10px] tracking-widest">
        Chargement des requêtes...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ConfirmDeleteModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        message="Voulez-vous vraiment supprimer cette requête de prière ? Cette action est irréversible."
      />
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black text-church-dark uppercase tracking-tight flex items-center gap-2">
          <Heart className="text-church-blue" />
          Requêtes de Prière
        </h2>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-church-border">
            {requests.length} Total
          </div>
          <div className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100 italic">
            {requests.filter(r => r.isUrgent).length} Urgents
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {requests.map((req) => (
          <div key={req.id} className="bg-white p-6 rounded-[32px] border border-church-border shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            {req.isUrgent && (
              <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
            )}
            
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Requester Info */}
              <div className="flex-shrink-0 flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-church-blue">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-black text-church-dark uppercase tracking-tight text-sm flex items-center gap-2">
                    {req.userName || 'Membre'}
                    {req.isUrgent && <ShieldAlert size={14} className="text-red-500 animate-pulse" />}
                  </h3>
                  <div className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">
                    {req.userEmail}
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-church-blue uppercase tracking-widest bg-church-blue/5 px-2 py-0.5 rounded">
                    Sujet: {req.subject}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <Calendar size={12} />
                    {req.createdAt?.toDate ? format(req.createdAt.toDate(), 'dd/MM/yyyy HH:mm', { locale: fr }) : '...'}
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  "{req.message}"
                </p>
              </div>

              {/* Actions */}
              <div className="flex lg:flex-col items-center justify-end gap-2 min-w-[200px]">
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center gap-1 w-full">
                    {(['Reçu', 'En prière'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(req.id, status)}
                        className={`flex-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-tight transition-all border ${
                          req.status === status
                            ? 'bg-church-blue text-white border-church-blue shadow-lg shadow-church-blue/20'
                            : 'bg-white text-slate-400 border-church-border hover:bg-slate-50'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handleStatusUpdate(req.id, 'Exaucé')}
                    className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${
                      req.status === 'Exaucé'
                        ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/20'
                        : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100'
                    }`}
                  >
                    <Sparkles size={12} className={req.status === 'Exaucé' ? 'animate-pulse' : ''} />
                    {req.status === 'Exaucé' ? 'Témoignage: Exaucé' : 'Marquer comme Exaucé'}
                  </button>
                </div>
                <button 
                  onClick={() => setDeleteConfirm({ isOpen: true, id: req.id })}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all self-end"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[40px] border border-dashed border-church-border">
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Aucune requête de prière</p>
          </div>
        )}
      </div>
    </div>
  );
}
