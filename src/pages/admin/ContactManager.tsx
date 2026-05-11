import React, { useState, useEffect } from 'react';
import { Mail, User, Trash2, CheckCircle2, Loader2, MessageSquare, Clock, Calendar } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: any;
}

export default function ContactManager() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

  useEffect(() => {
    const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ContactMessage[];
      setMessages(list);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'contacts');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleReadStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'contacts', id), { read: !currentStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `contacts/${id}`);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await deleteDoc(doc(db, 'contacts', deleteConfirm.id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `contacts/${deleteConfirm.id}`);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 uppercase font-black text-[10px] tracking-widest">
        Chargement des messages...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ConfirmDeleteModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        message="Voulez-vous vraiment supprimer ce message ? Cette action est irréversible."
      />
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black text-church-dark uppercase tracking-tight flex items-center gap-2">
          <Mail className="text-church-blue" />
          Messages de Contact
        </h2>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-church-border">
            {messages.length} Reçus
          </div>
          <div className="px-4 py-2 bg-blue-50 text-church-blue rounded-full text-[10px] font-black uppercase tracking-widest border border-church-blue/10">
            {messages.filter(m => !m.read).length} Nouveaux
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`p-6 rounded-[32px] border transition-all ${
              msg.read 
                ? 'bg-slate-50/50 border- church-border opacity-75' 
                : 'bg-white border-church-blue/20 shadow-lg shadow-church-blue/5'
            }`}
          >
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-shrink-0 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  msg.read ? 'bg-slate-100 text-slate-400' : 'bg-church-blue/10 text-church-blue'
                }`}>
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-black text-church-dark uppercase tracking-tight text-sm">{msg.name}</h3>
                  <a href={`mailto:${msg.email}`} className="text-[10px] font-bold text-church-blue hover:underline uppercase tracking-wider block">
                    {msg.email}
                  </a>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Calendar size={12} />
                    {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'dd MMM yyyy', { locale: fr }) : '...'}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Clock size={12} />
                    {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'HH:mm', { locale: fr }) : '...'}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white border border-church-border rounded-full text-[10px] font-black text-church-dark uppercase tracking-widest">
                    <MessageSquare size={10} className="text-church-blue" />
                    {msg.subject}
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed bg-white/50 p-4 rounded-2xl border border-church-border/50">
                  {msg.message}
                </p>
              </div>

              <div className="flex lg:flex-col items-center justify-end gap-2 min-w-[120px]">
                <button 
                  onClick={() => toggleReadStatus(msg.id, msg.read)}
                  className={`flex-1 lg:w-full py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                    msg.read 
                      ? 'bg-slate-100 text-slate-400 hover:bg-church-blue/10 hover:text-church-blue' 
                      : 'bg-church-blue text-white shadow-lg shadow-church-blue/20'
                  }`}
                >
                  <CheckCircle2 size={16} />
                  {msg.read ? 'Lu' : 'Marquer Lu'}
                </button>
                <button 
                  onClick={() => setDeleteConfirm({ isOpen: true, id: msg.id })}
                  className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all shadow-sm"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <div className="py-20 text-center bg-slate-50 rounded-[40px] border border-dashed border-church-border">
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Aucun message reçu</p>
          </div>
        )}
      </div>
    </div>
  );
}
