import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { MessageSquare, CheckCircle, Clock, Eye, Trash2, Image as ImageIcon, Video, Music } from 'lucide-react';
import toast from 'react-hot-toast';

interface Testimony {
  id: string;
  author: string;
  content: string;
  status: 'pending' | 'approved';
  createdAt: Timestamp;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
}

export default function TestimonyManager() {
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'testimonies'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const texts: Testimony[] = [];
      snapshot.forEach((doc) => {
        texts.push({ id: doc.id, ...doc.data() } as Testimony);
      });
      setTestimonies(texts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'pending' | 'approved') => {
    try {
      await updateDoc(doc(db, 'testimonies', id), { status });
      toast.success(status === 'approved' ? 'Témoignage approuvé' : 'Témoignage masqué');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce témoignage ?")) return;
    try {
      await deleteDoc(doc(db, 'testimonies', id));
      toast.success('Témoignage supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div className="bg-white dark:bg-dark-card rounded-3xl p-8 border border-church-border dark:border-dark-border shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-display font-black text-church-dark dark:text-white uppercase">Modération Témoignages</h2>
          <p className="text-sm text-slate-500 mt-1">Gérez les témoignages soumis par les membres</p>
        </div>
        <div className="bg-church-blue/10 dark:bg-church-blue/20 p-3 rounded-2xl">
          <MessageSquare className="text-church-blue" size={24} />
        </div>
      </div>

      <div className="space-y-6">
        {testimonies.length === 0 ? (
          <div className="text-center py-12 text-slate-500">Aucun témoignage soumis.</div>
        ) : (
          testimonies.map((testimony) => (
            <div key={testimony.id} className="border border-church-border dark:border-dark-border rounded-2xl p-6 transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-church-dark dark:text-white">{testimony.author}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                    testimony.status === 'approved' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {testimony.status === 'approved' ? <CheckCircle size={12} /> : <Clock size={12} />}
                    {testimony.status === 'approved' ? 'Approuvé' : 'En attente'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  {testimony.createdAt?.toDate().toLocaleString('fr-FR')}
                </div>
              </div>
              
              <div className="flex items-start gap-4 mb-6">
                {testimony.imageUrl && (
                  <div className="shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-church-border dark:border-dark-border">
                    <img src={testimony.imageUrl} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-sm leading-relaxed text-church-dark dark:text-gray-300">
                  "{testimony.content}"
                  
                  <div className="mt-4 flex flex-col gap-2">
                    {testimony.videoUrl && (
                      <a 
                        href={testimony.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        download={testimony.videoUrl.startsWith('data:') ? 'video.mp4' : undefined}
                        className="flex items-center gap-2 text-xs text-church-blue hover:underline"
                      >
                        <Video size={14} /> Voir la vidéo
                      </a>
                    )}
                    {testimony.audioUrl && (
                      <a 
                        href={testimony.audioUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        download={testimony.audioUrl.startsWith('data:') ? 'audio.mp3' : undefined}
                        className="flex items-center gap-2 text-xs text-church-blue hover:underline"
                      >
                        <Music size={14} /> Écouter l'audio
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 border-t border-church-border dark:border-dark-border pt-4">
                {testimony.status === 'pending' ? (
                  <button
                    onClick={() => handleUpdateStatus(testimony.id, 'approved')}
                    className="flex items-center gap-2 text-sm font-bold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-xl transition-colors"
                  >
                    <CheckCircle size={16} /> Approuver
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(testimony.id, 'pending')}
                    className="flex items-center gap-2 text-sm font-bold text-yellow-600 hover:text-yellow-700 bg-yellow-50 hover:bg-yellow-100 px-4 py-2 rounded-xl transition-colors"
                  >
                    <Eye size={16} /> Masquer
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete(testimony.id)}
                  className="flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors ml-auto"
                >
                  <Trash2 size={16} /> Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
