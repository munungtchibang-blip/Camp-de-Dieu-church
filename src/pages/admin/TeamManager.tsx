import React, { useState, useEffect, useRef } from 'react';
import { Plus, Loader2, Trash2, User, Image as ImageIcon, Briefcase, Type, Mail, Phone, Facebook, Youtube, Instagram } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { compressImage } from '../../lib/imageUtils';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import toast from 'react-hot-toast';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  imageUrl: string;
  email?: string;
  phone?: string;
  facebook?: string;
  youtube?: string;
}

export default function TeamManager() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newMember, setNewMember] = useState({
    name: '',
    role: 'Pasteur',
    description: '',
    imageUrl: '',
    email: '',
    phone: '',
    facebook: '',
    youtube: ''
  });

  const roles = ["Pasteur", "Évangéliste", "Diacre", "Ancien", "Intercesseur", "Responsable"];

  useEffect(() => {
    const q = query(collection(db, 'team'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const teamList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TeamMember[];
      setMembers(teamList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'team');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedDataUrl = await compressImage(file);
        setNewMember({ ...newMember, imageUrl: compressedDataUrl });
      } catch (error) {
        console.error("Compression error:", error);
        toast.error("Erreur lors de l'optimisation de l'image.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.role) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'team'), {
        ...newMember,
        createdAt: serverTimestamp()
      });
      setNewMember({
        name: '',
        role: 'Pasteur',
        description: '',
        imageUrl: '',
        email: '',
        phone: '',
        facebook: '',
        youtube: ''
      });
      toast.success("Membre ajouté avec succès !");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'team');
      toast.error("Erreur lors de l'ajout.");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await deleteDoc(doc(db, 'team', deleteConfirm.id));
      toast.success("Membre supprimé.");
      setDeleteConfirm({ isOpen: false, id: null });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `team/${deleteConfirm.id}`);
      toast.error("Erreur lors de la suppression.");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 uppercase font-black text-[10px] tracking-widest">
        Chargement de l'équipe...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ConfirmDeleteModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        message="Voulez-vous vraiment supprimer ce membre de l'équipe ? Cette action est irréversible."
      />
      <div className="bg-white p-8 rounded-[40px] shadow-xl border border-church-border">
        <h2 className="text-xl font-black text-church-dark mb-6 flex items-center gap-2 uppercase tracking-tight">
          <User className="text-church-blue" />
          Ajouter un Membre (Pasteur/Évangéliste)
        </h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nom Complet</label>
              <input 
                type="text"
                value={newMember.name}
                onChange={e => setNewMember({...newMember, name: e.target.value})}
                className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-blue"
                placeholder="Ex: Pasteur Jean Dupont"
                required
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rôle / Titre</label>
              <select 
                value={newMember.role}
                onChange={e => setNewMember({...newMember, role: e.target.value})}
                className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm text-church-dark"
              >
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Photo de profil</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newMember.imageUrl}
                  onChange={e => setNewMember({...newMember, imageUrl: e.target.value})}
                  className="flex-1 bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm text-church-dark"
                  placeholder="URL ou importer ->"
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
                  className="px-4 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200"
                >
                  <ImageIcon size={18} />
                </button>
              </div>
              {newMember.imageUrl && (
                <div className="mt-3 relative w-32 h-32 rounded-xl overflow-hidden border-2 border-church-gold shadow-md">
                  <img src={newMember.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                  <button 
                    type="button"
                    onClick={() => setNewMember({...newMember, imageUrl: ''})}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description / Biographie</label>
              <textarea 
                value={newMember.description}
                onChange={e => setNewMember({...newMember, description: e.target.value})}
                className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm text-church-dark h-32"
                placeholder="Une brève description du ministère de cette personne..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Mail size={12} className="text-church-blue" />
                  Email
                </label>
                <input 
                  type="email"
                  value={newMember.email}
                  onChange={e => setNewMember({...newMember, email: e.target.value})}
                  className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm text-church-dark focus:outline-none focus:ring-2 focus:ring-church-blue"
                  placeholder="jean@eglise.com"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Phone size={12} className="text-church-blue" />
                  Téléphone
                </label>
                <input 
                  type="tel"
                  value={newMember.phone}
                  onChange={e => setNewMember({...newMember, phone: e.target.value})}
                  className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm text-church-dark focus:outline-none focus:ring-2 focus:ring-church-blue"
                  placeholder="+243..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Facebook size={12} className="text-church-blue" />
                  Facebook
                </label>
                <input 
                  type="url"
                  value={newMember.facebook}
                  onChange={e => setNewMember({...newMember, facebook: e.target.value})}
                  className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm text-church-dark focus:outline-none focus:ring-2 focus:ring-church-blue"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Youtube size={12} className="text-church-blue" />
                  YouTube Link
                </label>
                <input 
                  type="url"
                  value={newMember.youtube}
                  onChange={e => setNewMember({...newMember, youtube: e.target.value})}
                  className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm text-church-dark focus:outline-none focus:ring-2 focus:ring-church-blue"
                  placeholder="Dernière prédication"
                />
              </div>
            </div>
            
            <button 
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-church-dark text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-church-blue transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
              Ajouter à l'Équipe
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map(member => (
          <div key={member.id} className="bg-white p-6 rounded-3xl border border-church-border shadow-sm group hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                {member.imageUrl ? (
                  <img src={member.imageUrl} className="w-full h-full object-cover" alt={member.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <User size={30} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-black text-church-dark uppercase tracking-tight text-sm">{member.name}</h3>
                <p className="text-[10px] font-black text-church-blue uppercase tracking-widest">{member.role}</p>
              </div>
              <button 
                onClick={() => setDeleteConfirm({ isOpen: true, id: member.id })}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
              {member.description || "Aucune description fournie."}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
