import React, { useState, useEffect, useRef } from 'react';
import { Plus, Loader2, Trash2, Image as ImageIcon, Video, Play, Type, Save, Edit2 } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  category: string;
  url: string;
  title: string;
  createdAt: any;
}

export default function GalleryManager() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newItem, setNewItem] = useState({
    type: 'image' as 'image' | 'video',
    category: 'Cultes',
    url: '',
    title: ''
  });

  const categories = ['Cultes', 'Événements', 'Musique', 'Social', 'Témoignages'];

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMedia(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MediaItem[]);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'gallery');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItem({ ...newItem, url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setNewItem({
      type: 'image',
      category: 'Cultes',
      url: '',
      title: ''
    });
    setEditingId(null);
  };

  const handleEdit = (item: MediaItem) => {
    setNewItem({
      type: item.type,
      category: item.category,
      url: item.url,
      title: item.title
    });
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'gallery', editingId), {
          ...newItem,
          updatedAt: serverTimestamp()
        });
        alert("Media mis à jour !");
      } else {
        await addDoc(collection(db, 'gallery'), {
          ...newItem,
          createdAt: serverTimestamp()
        });
      }
      resetForm();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, editingId ? `gallery/${editingId}` : 'gallery');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await deleteDoc(doc(db, 'gallery', deleteConfirm.id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `gallery/${deleteConfirm.id}`);
    }
  };

  return (
    <div className="space-y-8">
      <ConfirmDeleteModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        message="Voulez-vous vraiment supprimer ce media de la galerie ?"
      />
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-church-border">
        <h2 className="text-xl font-black text-church-dark mb-6 flex items-center gap-2 uppercase tracking-tight">
          <ImageIcon className="text-church-blue" />
          {editingId ? 'Modifier Media' : 'Ajouter à la Galerie'}
        </h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Titre du Media</label>
              <input 
                type="text"
                value={newItem.title}
                onChange={e => setNewItem({...newItem, title: e.target.value})}
                className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm"
                placeholder="Ex: Culte de Célébration - Dimanche 12 Jan"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Type</label>
                <select 
                  value={newItem.type}
                  onChange={e => setNewItem({...newItem, type: e.target.value as any})}
                  className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm"
                >
                  <option value="image">Image</option>
                  <option value="video">Vidéo (Thumbnail)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Catégorie</label>
                <select 
                  value={newItem.category}
                  onChange={e => setNewItem({...newItem, category: e.target.value})}
                  className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">URL Image/Thumbnail</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newItem.url}
                  onChange={e => setNewItem({...newItem, url: e.target.value})}
                  className="flex-1 bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm"
                  placeholder="URL ou importer ->"
                  required
                />
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200"
                >
                  <ImageIcon size={18} />
                </button>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                type="submit"
                disabled={submitting}
                className="flex-1 py-4 bg-church-blue text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-church-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : (editingId ? <Save size={18} /> : <Plus size={18} />)}
                {editingId ? 'Mettre à jour' : 'Ajouter Media'}
              </button>
              {editingId && (
                <button 
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-4 bg-slate-100 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Annuler
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-church-border">
        <h2 className="text-xl font-black text-church-dark mb-8 uppercase tracking-tight">Media Grid</h2>
        
        {loading ? (
          <div className="py-12 text-center text-slate-400 uppercase font-black text-[10px] tracking-widest">
            Chargement...
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {media.map(item => (
              <div key={item.id} className="group relative aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-church-border">
                <img src={item.url} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => handleEdit(item)} className="p-2 bg-white text-church-blue rounded-lg shadow-xl hover:scale-110 transition-transform">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => setDeleteConfirm({ isOpen: true, id: item.id })} className="p-2 bg-white text-red-500 rounded-lg shadow-xl hover:scale-110 transition-transform">
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
