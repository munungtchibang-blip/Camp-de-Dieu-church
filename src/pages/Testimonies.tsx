import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { collection, addDoc, onSnapshot, query, where, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MessageSquare, Quote, Calendar, User, Clock, CheckCircle, Image as ImageIcon, Video, Music, X, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { compressImage } from '../lib/imageUtils';

interface Testimony {
  id: string;
  author: string;
  content: string;
  status: 'pending' | 'approved';
  createdAt: Timestamp;
  imageUrl?: string;
  videoUrl?: string; // YouTube link OR Base64 video
  audioUrl?: string; // Soundcloud link OR Base64 audio
}

export default function Testimonies() {
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    author: '',
    content: '',
    videoUrl: '', // For youtube link
    audioUrl: ''  // For external link
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Custom video/audio recorded directly:
  const [videoFileBase64, setVideoFileBase64] = useState<string | null>(null);
  const [audioFileBase64, setAudioFileBase64] = useState<string | null>(null);

  const [showVideoInput, setShowVideoInput] = useState(false);
  const [showAudioInput, setShowAudioInput] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'testimonies'),
      where('status', '==', 'approved'),
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image valide.');
      return;
    }

    try {
      const compressedString = await compressImage(file, 800, 800, 0.7);
      setImagePreview(compressedString);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du traitement de l'image.");
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('video/')) {
      toast.error('Veuillez sélectionner une vidéo valide.');
      return;
    }

    // Limit to 800KB due to Firestore limits
    if (file.size > 800 * 1024) {
      toast.error("Fichier trop volumineux (Max 800 Ko). Veuillez opter pour un lien YouTube.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => setVideoFileBase64(event.target?.result as string);
    reader.readAsDataURL(file);
    setShowVideoInput(false); // Hide link input if using file
    setFormData(prev => ({ ...prev, videoUrl: '' }));
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('audio/')) {
      toast.error('Veuillez sélectionner un fichier audio valide.');
      return;
    }

    // Limit to 800KB due to Firestore limits
    if (file.size > 800 * 1024) {
      toast.error("Fichier trop volumineux (Max 800 Ko). Veuillez opter pour un lien externe.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => setAudioFileBase64(event.target?.result as string);
    reader.readAsDataURL(file);
    setShowAudioInput(false); // Hide link input if using file
    setFormData(prev => ({ ...prev, audioUrl: '' }));
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11)
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  };

  const isBase64 = (str: string) => {
    return str.startsWith('data:');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.author || !formData.content) return;

    setIsSubmitting(true);
    try {
      const payload: Omit<Testimony, 'id'> = {
        author: formData.author,
        content: formData.content,
        status: 'pending',
        createdAt: serverTimestamp() as Timestamp
      };

      if (imagePreview) payload.imageUrl = imagePreview;
      
      if (videoFileBase64) {
        payload.videoUrl = videoFileBase64;
      } else if (formData.videoUrl) {
        payload.videoUrl = formData.videoUrl;
      }
      
      if (audioFileBase64) {
        payload.audioUrl = audioFileBase64;
      } else if (formData.audioUrl) {
        payload.audioUrl = formData.audioUrl;
      }

      await addDoc(collection(db, 'testimonies'), payload);
      
      setFormData({ author: '', content: '', videoUrl: '', audioUrl: '' });
      setImagePreview(null);
      setVideoFileBase64(null);
      setAudioFileBase64(null);
      setShowVideoInput(false);
      setShowAudioInput(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';
      if (audioInputRef.current) audioInputRef.current.value = '';
      
      toast.success("Votre témoignage a été soumis et sera validé par un administrateur.");
    } catch (error) {
      console.error(error);
      toast.error("Erreur, vérifiez la taille de vos fichiers (Max 1 Mo total).");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="pt-32 pb-20 bg-church-bg dark:bg-dark-bg min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <MessageSquare className="text-church-blue" size={24} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Témoignages</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-black text-church-dark dark:text-white leading-none tracking-tight uppercase mb-6"
          >
            Ce que Dieu a fait <span className="text-church-blue">pour vous</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-500 dark:text-slate-400 font-medium"
          >
            Partagez vos expériences et lisez comment Dieu agit dans la vie de nos membres.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Submission Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-dark-card rounded-3xl p-8 border border-church-border dark:border-dark-border shadow-xl sticky top-32">
              <h2 className="text-2xl font-display font-black text-church-dark dark:text-white uppercase mb-6">Soumettre</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Votre Nom</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={e => setFormData({...formData, author: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-church-border dark:border-dark-border rounded-xl px-4 py-3 text-sm text-church-dark dark:text-white transition-all outline-none focus:ring-2 focus:ring-church-blue"
                    placeholder="Ex: Jean Dupont"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Votre Témoignage</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.content}
                    onChange={e => setFormData({...formData, content: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-church-border dark:border-dark-border rounded-xl px-4 py-3 text-sm text-church-dark dark:text-white transition-all outline-none focus:ring-2 focus:ring-church-blue resize-none"
                    placeholder="Racontez-nous..."
                  />
                </div>

                {/* Media Uploads */}
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2 hover:bg-church-blue hover:text-white transition-colors"
                    >
                      <ImageIcon size={14} /> Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2 hover:bg-church-blue hover:text-white transition-colors"
                    >
                      <Video size={14} /> Vidéo
                    </button>
                    <button
                      type="button"
                      onClick={() => audioInputRef.current?.click()}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2 hover:bg-church-blue hover:text-white transition-colors"
                    >
                      <Music size={14} /> Audio
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowVideoInput(!showVideoInput); setShowAudioInput(false); }}
                      className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${showVideoInput ? 'bg-church-blue text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-church-blue hover:text-white'}`}
                      title="Lien YouTube"
                    >
                      Lien Vidéo
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowAudioInput(!showAudioInput); setShowVideoInput(false); }}
                      className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${showAudioInput ? 'bg-church-blue text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-church-blue hover:text-white'}`}
                      title="Lien audio externe"
                    >
                      Lien Audio
                    </button>
                  </div>

                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                  <input type="file" accept="video/*" ref={videoInputRef} onChange={handleVideoFileChange} className="hidden" />
                  <input type="file" accept="audio/*" ref={audioInputRef} onChange={handleAudioFileChange} className="hidden" />

                  {/* Previews */}
                  <div className="flex flex-wrap gap-2">
                    {imagePreview && (
                      <div className="relative inline-block mt-2">
                        <img src={imagePreview} alt="Preview" className="h-16 w-16 object-cover rounded-xl border border-church-border" />
                        <button type="button" onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"><X size={12} /></button>
                      </div>
                    )}
                    {videoFileBase64 && (
                      <div className="relative inline-block mt-2 bg-church-blue/10 rounded-xl p-3 flex items-center gap-2">
                        <Video size={16} className="text-church-blue" />
                        <span className="text-xs font-bold text-church-dark dark:text-white">Vidéo prête</span>
                        <button type="button" onClick={() => { setVideoFileBase64(null); if (videoInputRef.current) videoInputRef.current.value = ''; }} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"><X size={12} /></button>
                      </div>
                    )}
                    {audioFileBase64 && (
                      <div className="relative inline-block mt-2 bg-church-blue/10 rounded-xl p-3 flex items-center gap-2">
                        <Music size={16} className="text-church-blue" />
                        <span className="text-xs font-bold text-church-dark dark:text-white">Audio prêt</span>
                        <button type="button" onClick={() => { setAudioFileBase64(null); if (audioInputRef.current) audioInputRef.current.value = ''; }} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"><X size={12} /></button>
                      </div>
                    )}
                  </div>

                  {showVideoInput && !videoFileBase64 && (
                    <div className="animate-fade-in">
                      <label className="block text-xs font-medium text-slate-400 mb-1">Lien de la vidéo (YouTube)</label>
                      <input
                        type="url"
                        value={formData.videoUrl}
                        onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-church-border dark:border-dark-border rounded-xl px-4 py-2 text-sm text-church-dark dark:text-white transition-all outline-none focus:ring-2 focus:ring-church-blue"
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                  )}

                  {showAudioInput && !audioFileBase64 && (
                    <div className="animate-fade-in">
                      <label className="block text-xs font-medium text-slate-400 mb-1">Lien du fichier audio externe</label>
                      <input
                        type="url"
                        value={formData.audioUrl}
                        onChange={e => setFormData({...formData, audioUrl: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-church-border dark:border-dark-border rounded-xl px-4 py-2 text-sm text-church-dark dark:text-white transition-all outline-none focus:ring-2 focus:ring-church-blue"
                        placeholder="https://soundcloud.com/..."
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-church-blue hover:bg-church-dark text-white rounded-xl px-6 py-4 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Clock className="animate-spin" size={16} />
                  ) : (
                    <MessageSquare size={16} />
                  )}
                  {isSubmitting ? 'Envoi...' : 'Partager'}
                </button>
              </form>
            </div>
          </div>

          {/* Testimonies List */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-church-blue mx-auto"></div>
              </div>
            ) : testimonies.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-12 text-center border-2 border-dashed border-church-border dark:border-dark-border">
                <Quote className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-xl font-display font-black text-church-dark dark:text-white uppercase mb-2">Aucun témoignage</h3>
                <p className="text-slate-500 dark:text-slate-400">Soyez le premier à partager votre témoignage.</p>
              </div>
            ) : (
              testimonies.map((testimony, index) => (
                <motion.div
                  key={testimony.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-dark-card rounded-3xl overflow-hidden border border-church-border dark:border-dark-border shadow-md relative group"
                >
                  {/* Media Content */}
                  {testimony.videoUrl && !isBase64(testimony.videoUrl) && getYouTubeEmbedUrl(testimony.videoUrl) ? (
                    <div className="aspect-video w-full bg-slate-900">
                      <iframe
                        src={getYouTubeEmbedUrl(testimony.videoUrl) as string}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    </div>
                  ) : testimony.videoUrl && isBase64(testimony.videoUrl) ? (
                    <div className="w-full bg-slate-900 aspect-video relative group/video">
                      <video controls className="w-full h-full">
                        <source src={testimony.videoUrl} />
                        Votre navigateur ne supporte pas la balise vidéo.
                      </video>
                      <a href={testimony.videoUrl} download="temoignage.mp4" className="absolute top-4 right-4 bg-black/60 hover:bg-church-blue text-white p-2 rounded-xl backdrop-blur-md transition-colors opacity-0 group-hover/video:opacity-100" title="Télécharger la vidéo">
                        <Download size={18} />
                      </a>
                    </div>
                  ) : testimony.imageUrl ? (
                    <div className="w-full h-64 sm:h-80 bg-slate-100 dark:bg-slate-800 relative group/image">
                      <img src={testimony.imageUrl} alt="Témoignage" className="w-full h-full object-cover" />
                      <a href={testimony.imageUrl} download="temoignage.jpg" className="absolute top-4 right-4 bg-white/80 dark:bg-black/60 hover:bg-church-blue text-church-dark dark:text-white hover:text-white p-2 rounded-xl backdrop-blur-md transition-colors opacity-0 group-hover/image:opacity-100 shadow-sm" title="Télécharger l'image">
                        <Download size={18} />
                      </a>
                    </div>
                  ) : null}

                  <div className="p-8">
                    <Quote className="text-church-gold/20 h-10 w-10 mb-4" />
                    <p className="text-church-dark dark:text-white text-lg leading-relaxed font-medium mb-6">
                      "{testimony.content}"
                    </p>

                    {testimony.audioUrl && (
                      <div className="mb-6 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl flex items-center gap-4">
                        <audio controls className="w-full h-10 flex-1">
                          <source src={testimony.audioUrl} />
                          Votre navigateur ne supporte pas l'élément audio.
                        </audio>
                        {isBase64(testimony.audioUrl) && (
                          <a href={testimony.audioUrl} download="temoignage.mp3" className="w-10 h-10 bg-white dark:bg-dark-bg border border-church-border dark:border-dark-border rounded-xl flex items-center justify-center text-church-blue hover:bg-church-blue hover:text-white transition-colors shrink-0" title="Télécharger l'audio">
                            <Download size={18} />
                          </a>
                        )}
                        {!isBase64(testimony.audioUrl) && (
                          <a href={testimony.audioUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white dark:bg-dark-bg border border-church-border dark:border-dark-border rounded-xl flex items-center justify-center text-church-blue hover:bg-church-blue hover:text-white transition-colors shrink-0" title="Ouvrir le lien audio">
                            <Music size={18} />
                          </a>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-church-border dark:border-dark-border pt-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-church-blue/10 dark:bg-church-blue/20 rounded-full flex items-center justify-center">
                          <User className="text-church-blue" size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-church-dark dark:text-white">{testimony.author}</p>
                          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1">
                            <Calendar size={10} />
                            {testimony.createdAt?.toDate().toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
