import React, { useState, useEffect, useRef } from 'react';
import { Plus, Loader2, Trash2, Mic2, FileText, Video, Play, Calendar as CalendarIcon, User, Image as ImageIcon, Upload, Edit2, Save } from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';

interface Sermon {
  id: string;
  title: string;
  preacher: string;
  date: any;
  category: string;
  videoUrl?: string;
  audioUrl?: string;
  pdfUrl?: string;
  imageUrl?: string;
}

export default function SermonManager() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Tous");
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [newSermon, setNewSermon] = useState({
    title: '',
    preacher: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    category: 'Foi',
    videoUrl: '',
    audioUrl: '',
    pdfUrl: '',
    imageUrl: ''
  });

  const defaultCategories = ["Foi", "Famille", "Délivrance", "Jeunesse"];
  const allCategoriesForForm = Array.from(new Set([...defaultCategories, ...dbCategories])).sort();

  useEffect(() => {
    const q = query(collection(db, 'sermons'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Sermon[];
      setSermons(data);
      
      // Extract unique categories from DB
      const uniqueCats = Array.from(new Set(data.map(s => s.category))).filter(Boolean);
      setDbCategories(uniqueCats);
      
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'sermons');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'audioUrl' | 'imageUrl' | 'pdfUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewSermon({ ...newSermon, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setNewSermon({
      title: '',
      preacher: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      category: 'Foi',
      videoUrl: '',
      audioUrl: '',
      pdfUrl: '',
      imageUrl: ''
    });
    setEditingId(null);
  };

  const handleEdit = (sermon: Sermon) => {
    setNewSermon({
      title: sermon.title,
      preacher: sermon.preacher,
      date: sermon.date,
      category: sermon.category,
      videoUrl: sermon.videoUrl || '',
      audioUrl: sermon.audioUrl || '',
      pdfUrl: sermon.pdfUrl || '',
      imageUrl: sermon.imageUrl || ''
    });
    setEditingId(sermon.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'sermons', editingId), {
          ...newSermon,
          updatedAt: serverTimestamp()
        });
        alert("Prédication mise à jour !");
      } else {
        await addDoc(collection(db, 'sermons'), {
          ...newSermon,
          date: newSermon.date,
          createdAt: serverTimestamp()
        });
      }
      resetForm();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, editingId ? `sermons/${editingId}` : 'sermons');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await deleteDoc(doc(db, 'sermons', deleteConfirm.id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `sermons/${deleteConfirm.id}`);
    }
  };

  return (
    <div className="space-y-8">
      <ConfirmDeleteModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        message="Voulez-vous vraiment supprimer cette prédication ? Cette action supprimera également l'accès aux fichiers associés."
      />
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-church-border">
        <h2 className="text-xl font-black text-church-dark mb-6 flex items-center gap-2 uppercase tracking-tight">
          <Plus className="text-church-accent" />
          {editingId ? 'Modifier la Prédication' : 'Ajouter une Prédication'}
        </h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Titre du Message</label>
              <input 
                type="text"
                value={newSermon.title}
                onChange={e => setNewSermon({...newSermon, title: e.target.value})}
                className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-blue"
                placeholder="Ex: La Puissance de la Prière"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Orateur</label>
              <input 
                type="text"
                value={newSermon.preacher}
                onChange={e => setNewSermon({...newSermon, preacher: e.target.value})}
                className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-blue"
                placeholder="Ex: Pasteur Jean-Paul"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Date</label>
                <input 
                  type="date"
                  value={newSermon.date}
                  onChange={e => setNewSermon({...newSermon, date: e.target.value})}
                  className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-blue"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Catégorie</label>
                <div className="flex gap-2">
                  <select 
                    value={newSermon.category}
                    onChange={e => setNewSermon({...newSermon, category: e.target.value})}
                    className="flex-1 bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-blue"
                  >
                    {allCategoriesForForm.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button 
                    type="button" 
                    onClick={() => {
                      const custom = prompt("Nouvelle catégorie :");
                      if (custom) setNewSermon({...newSermon, category: custom});
                    }}
                    className="px-4 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all text-xs font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Image de couverture</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newSermon.imageUrl}
                  onChange={e => setNewSermon({...newSermon, imageUrl: e.target.value})}
                  className="flex-1 bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-blue"
                  placeholder="URL ou importer ->"
                />
                <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'imageUrl')} />
                <button 
                  type="button" 
                  onClick={() => imageInputRef.current?.click()}
                  className="px-4 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2"
                >
                  <ImageIcon size={18} />
                </button>
              </div>
              {newSermon.imageUrl && (
                <div className="mt-2 relative w-24 h-16 rounded overflow-hidden border border-church-border">
                  <img src={newSermon.imageUrl} className="w-full h-full object-cover" />
                  <button onClick={() => setNewSermon({...newSermon, imageUrl: ''})} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl">
                    <Trash2 size={10} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lien Vidéo (YouTube)</label>
              <input 
                type="text"
                value={newSermon.videoUrl}
                onChange={e => setNewSermon({...newSermon, videoUrl: e.target.value})}
                className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fichier Audio</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={newSermon.audioUrl}
                    onChange={e => setNewSermon({...newSermon, audioUrl: e.target.value})}
                    className="flex-1 bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm"
                    placeholder="Lien ou importer ->"
                  />
                  <input type="file" ref={audioInputRef} className="hidden" accept="audio/*" onChange={e => handleFileUpload(e, 'audioUrl')} />
                  <button 
                    type="button" 
                    onClick={() => audioInputRef.current?.click()}
                    className="px-4 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200"
                  >
                    <Mic2 size={18} />
                  </button>
                </div>
                {newSermon.audioUrl && <p className="text-[9px] font-black text-green-500 uppercase mt-1">Audio sélectionné ✅</p>}
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Document PDF</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={newSermon.pdfUrl}
                    onChange={e => setNewSermon({...newSermon, pdfUrl: e.target.value})}
                    className="flex-1 bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm"
                    placeholder="Lien ou importer ->"
                  />
                  <input type="file" ref={pdfInputRef} className="hidden" accept="application/pdf" onChange={e => handleFileUpload(e, 'pdfUrl')} />
                  <button 
                    type="button" 
                    onClick={() => pdfInputRef.current?.click()}
                    className="px-4 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200"
                  >
                    <FileText size={18} />
                  </button>
                </div>
                {newSermon.pdfUrl && <p className="text-[9px] font-black text-green-500 uppercase mt-1">PDF sélectionné ✅</p>}
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                type="submit"
                disabled={submitting}
                className="flex-1 mt-2 py-4 bg-church-blue text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-church-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : (editingId ? <Save size={18} /> : <Plus size={18} />)}
                {editingId ? 'Mettre à jour' : 'Enregistrer le Message'}
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <h2 className="text-xl font-black text-church-dark uppercase tracking-tight">Liste des Prédications</h2>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <input 
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Rechercher..."
                className="pl-4 pr-10 py-2 bg-slate-50 border border-church-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-church-blue w-48"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtrer:</span>
              <select 
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-church-border rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-church-blue"
              >
                <option value="Tous">Tous les messages</option>
                {allCategoriesForForm.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {(searchTerm || categoryFilter !== "Tous") && (
              <button 
                onClick={() => { setSearchTerm(""); setCategoryFilter("Tous"); }}
                className="px-4 py-2 bg-church-blue/10 text-church-blue rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-church-blue hover:text-white transition-all"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="py-12 text-center text-slate-400 uppercase font-black text-[10px] tracking-widest">
            Chargement...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Message</th>
                  <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Orateur</th>
                  <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sermons
                  .filter(s => {
                    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.preacher.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesCategory = categoryFilter === "Tous" || s.category === categoryFilter;
                    return matchesSearch && matchesCategory;
                  })
                  .map(sermon => (
                  <tr key={sermon.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                          {sermon.imageUrl ? <img src={sermon.imageUrl} className="w-full h-full object-cover" /> : <Play size={16} className="m-auto text-slate-300" />}
                        </div>
                        <div>
                          <p className="font-bold text-church-dark text-sm leading-tight">{sermon.title}</p>
                          <span className="text-[9px] font-black text-church-blue uppercase tracking-widest">{sermon.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm font-medium text-slate-500">{sermon.preacher}</td>
                    <td className="py-4 text-sm font-medium text-slate-500">{sermon.date}</td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        {sermon.videoUrl && <Video size={14} className="text-red-500" />}
                        {sermon.audioUrl && <Mic2 size={14} className="text-blue-500" />}
                        {sermon.pdfUrl && <FileText size={14} className="text-amber-500" />}
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(sermon)}
                          className="p-2 text-slate-300 hover:text-church-blue transition-colors"
                          title="Modifier"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm({ isOpen: true, id: sermon.id })}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
