import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit2, Users, Heart, Baby, Shield, Music, Star, Loader2, Image as ImageIcon, X, Trash } from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { compressImage } from '../../lib/imageUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import toast from 'react-hot-toast';

interface Activity {
  title: string;
  time: string;
  description: string;
}

interface Ministry {
  id: string;
  name: string;
  description: string;
  leader: string;
  imageUrl: string;
  iconName: string;
  activities?: Activity[];
}

const icons = [
  { name: 'Users', icon: Users },
  { name: 'Heart', icon: Heart },
  { name: 'Baby', icon: Baby },
  { name: 'Shield', icon: Shield },
  { name: 'Music', icon: Music },
  { name: 'Star', icon: Star }
];

export default function MinistryManager() {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leader: '',
    imageUrl: '',
    iconName: 'Users',
    activities: [] as Activity[]
  });

  useEffect(() => {
    const q = query(collection(db, 'ministries'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMinistries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ministry)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'ministries');
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'ministries', editingId), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        toast.success("Ministère mis à jour !");
      } else {
        await addDoc(collection(db, 'ministries'), {
          ...formData,
          createdAt: serverTimestamp()
        });
        toast.success("Nouveau ministère créé !");
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.WRITE, 'ministries');
      toast.error("Erreur lors de l'enregistrement.");
    }
  };

  const handleEdit = (m: Ministry) => {
    setEditingId(m.id);
    setFormData({
      name: m.name,
      description: m.description,
      leader: m.leader || '',
      imageUrl: m.imageUrl || '',
      iconName: m.iconName || 'Users',
      activities: m.activities || []
    });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await deleteDoc(doc(db, 'ministries', deleteConfirm.id));
      toast.success("Ministère supprimé.");
      setDeleteConfirm({ isOpen: false, id: null });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'ministries');
      toast.error("Erreur de suppression.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      leader: '',
      imageUrl: '',
      iconName: 'Users',
      activities: []
    });
  };

  const addActivity = () => {
    setFormData({
      ...formData,
      activities: [...formData.activities, { title: '', time: '', description: '' }]
    });
  };

  const updateActivity = (index: number, field: keyof Activity, value: string) => {
    const newActivities = [...formData.activities];
    newActivities[index] = { ...newActivities[index], [field]: value };
    setFormData({ ...formData, activities: newActivities });
  };

  const removeActivity = (index: number) => {
    setFormData({
      ...formData,
      activities: formData.activities.filter((_, i) => i !== index)
    });
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setFormData({ ...formData, imageUrl: compressed });
      } catch (error) {
        console.error("Compression error:", error);
      }
    }
  };

  return (
    <div className="space-y-8">
      <ConfirmDeleteModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        message="Voulez-vous vraiment supprimer ce ministère ? Toutes les activités associées seront perdues."
      />
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-church-dark dark:text-white uppercase tracking-tight">Gestion des Ministères</h2>
          <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mt-1">Gérez les départements de l'église</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-church-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-church-dark transition-all shadow-xl shadow-church-blue/20"
        >
          <Plus size={16} /> Nouveau Ministère
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="animate-spin text-church-blue mx-auto mb-4" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ministries.map(m => (
            <div key={m.id} className="bg-white dark:bg-dark-card p-6 rounded-[32px] border border-church-border dark:border-dark-border shadow-sm group hover:border-church-blue transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-church-blue">
                  {/* Current icon */}
                  {React.createElement(icons.find(i => i.name === m.iconName)?.icon || Users, { size: 24 })}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(m)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-church-blue hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => setDeleteConfirm({ isOpen: true, id: m.id })} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-black text-church-dark dark:text-white uppercase tracking-tight mb-2">{m.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 font-medium">{m.description}</p>
              <div className="pt-4 border-t border-slate-50 dark:border-dark-border flex items-center justify-between">
                <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Responsable:</span>
                <span className="text-[9px] font-black uppercase text-church-dark dark:text-white tracking-widest">{m.leader || 'Non défini'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal icon overview/selection fix: "voir tout les icones" requested */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-church-dark/90 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-white dark:bg-dark-card rounded-[40px] p-8 md:p-12 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto border border-church-border dark:border-dark-border">
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-church-dark dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-black text-church-dark dark:text-white uppercase tracking-tight mb-8">
                {editingId ? 'Modifier le ministère' : 'Nouveau ministère'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Nom du ministère</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm text-church-dark dark:text-white outline-none focus:ring-2 focus:ring-church-blue" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Responsable</label>
                    <input type="text" value={formData.leader} onChange={e => setFormData({...formData, leader: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm text-church-dark dark:text-white outline-none focus:ring-2 focus:ring-church-blue" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Photo de Couverture du Ministère</label>
                  <div className="flex flex-col gap-4">
                    {formData.imageUrl && (
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setFormData({...formData, imageUrl: ''})}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                    <div className="flex gap-4">
                      <div className="relative flex-1">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600" size={18} />
                        <input type="url" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm text-church-dark dark:text-white outline-none focus:ring-2 focus:ring-church-blue" placeholder="Lien direct de la photo" />
                      </div>
                      <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept="image/*" />
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-church-blue hover:text-white transition-all shadow-sm"
                        title="Importer depuis l'appareil"
                      >
                        <Plus size={24} />
                      </button>
                    </div>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2 px-1">Importez une photo haute résolution pour un meilleur affichage</p>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 px-1">Choisir une Icône</label>
                  <div className="grid grid-cols-6 gap-3">
                    {icons.map(iconObj => (
                      <button
                        key={iconObj.name}
                        type="button"
                        onClick={() => setFormData({...formData, iconName: iconObj.name})}
                        className={cn(
                          "aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all",
                          formData.iconName === iconObj.name 
                            ? "border-church-blue bg-blue-50 dark:bg-blue-900/20 text-church-blue" 
                            : "border-slate-100 dark:border-slate-700 bg-white dark:bg-dark-card text-slate-400 hover:border-slate-200 dark:hover:border-slate-600"
                        )}
                      >
                        <iconObj.icon size={20} />
                        <span className="text-[8px] font-black uppercase tracking-tighter">{iconObj.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Description du ministère</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm text-church-dark dark:text-white outline-none focus:ring-2 focus:ring-church-blue min-h-[100px]" required />
                </div>

                {/* Activities Editor */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Activités & Programmes</label>
                    <button type="button" onClick={addActivity} className="flex items-center gap-1 text-[10px] font-black uppercase text-church-blue hover:underline">
                      <Plus size={14} /> Ajouter une activité
                    </button>
                  </div>
                  <div className="space-y-4">
                    {formData.activities.map((activity, idx) => (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={idx} className="p-6 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl relative group">
                        <button type="button" onClick={() => removeActivity(idx)} className="absolute top-4 right-4 p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors">
                          <Trash size={16} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <input 
                            placeholder="Titre de l'activité (ex: Répétition)" 
                            value={activity.title} 
                            onChange={e => updateActivity(idx, 'title', e.target.value)}
                            className="bg-white dark:bg-dark-card px-4 py-3 rounded-xl text-sm text-church-dark dark:text-white border border-transparent focus:border-church-blue outline-none"
                          />
                          <input 
                            placeholder="Horaire (ex: Jeudi 17h00)" 
                            value={activity.time} 
                            onChange={e => updateActivity(idx, 'time', e.target.value)}
                            className="bg-white dark:bg-dark-card px-4 py-3 rounded-xl text-sm text-church-dark dark:text-white border border-transparent focus:border-church-blue outline-none"
                          />
                        </div>
                        <textarea 
                          placeholder="Brève description..." 
                          value={activity.description} 
                          onChange={e => updateActivity(idx, 'description', e.target.value)}
                          className="w-full bg-white dark:bg-dark-card px-4 py-3 rounded-xl text-sm text-church-dark dark:text-white border border-transparent focus:border-church-blue outline-none min-h-[80px]"
                        />
                      </motion.div>
                    ))}
                    {formData.activities.length === 0 && (
                      <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] font-black uppercase text-slate-300 dark:text-slate-600 tracking-widest">Aucune activité listée pour le moment</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Annuler</button>
                  <button type="submit" className="flex-1 py-4 bg-church-blue text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-church-dark transition-all shadow-xl shadow-church-blue/20">Enregistrer les modifications</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
