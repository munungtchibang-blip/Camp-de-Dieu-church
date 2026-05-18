import React, { useState, useEffect } from 'react';
import { Save, Loader2, Globe, Phone, Mail, Instagram, Facebook, Youtube, Twitter, MapPin, Type, Image as ImageIcon, Plus, Trash, Tv } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc, deleteDoc, updateDoc, deleteField, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { SiteConfig, GalleryImage } from '../../hooks/useSiteConfig';
import { compressImage } from '../../lib/imageUtils';

export default function SiteSettings() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const [config, setConfig] = useState<SiteConfig>({
    identity: { 
      name: '', description: '', logoUrl: '', address: '', phone: '', email: '', whatsapp: '', 
      aboutText: '', missionText: '', yearsOfMinistry: '',
      value1Title: '', value1Desc: '',
      value2Title: '', value2Desc: '',
      value3Title: '', value3Desc: ''
    },
    hero: { 
      title: '', 
      subtitle: '', 
      imageUrl: '',
      galleryImages: []
    },
    socials: { facebook: '', youtube: '', instagram: '', twitter: '', liveUrl: '', nextLiveTitle: '', nextLiveDate: '' },
    mobileMoney: { orangeMoney: '', airtelMoney: '', mpesa: '' }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'hero' | 'gallery' | 'logo') => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingImage(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          // Compress based on field type
          let compressed = base64;
          if (field === 'logo') {
            compressed = await compressImage(base64, 400, 400, 0.8);
          } else {
            compressed = await compressImage(base64, 1200, 800, 0.7);
          }

          if (field === 'gallery') {
            // Save directly to collection to avoid document size limit
            await addDoc(collection(db, 'site_gallery'), {
              url: compressed,
              description: '',
              createdAt: serverTimestamp()
            });
          } else if (field === 'logo') {
            setConfig({ 
              ...config, 
              identity: { ...config.identity, logoUrl: compressed }
            });
          } else {
            setConfig({ ...config, hero: { ...config.hero, imageUrl: compressed }});
          }
        } catch (err) {
          console.error("Compression error:", err);
        } finally {
          setUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteGalleryImage = async (imageId: string) => {
    try {
      await deleteDoc(doc(db, 'site_gallery', imageId));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleUpdateGalleryDescription = async (imageId: string, description: string) => {
    try {
      await updateDoc(doc(db, 'site_gallery', imageId), { description });
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'config', 'global');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as any;
          setConfig(prev => ({
            ...prev,
            identity: { ...prev.identity, ...(data.identity || {}) },
            hero: { ...prev.hero, ...(data.hero || {}) },
            socials: { ...prev.socials, ...(data.socials || {}) },
            mobileMoney: { ...prev.mobileMoney, ...(data.mobileMoney || {}) }
          }));
        }
      } catch (error) {
        console.error("Error fetching config:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();

    // Listen to site_gallery collection for real-time updates in the list
    const unsubscribeGallery = onSnapshot(query(collection(db, 'site_gallery'), orderBy('createdAt', 'desc')), (snapshot) => {
      const galleryData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GalleryImage[];
      setConfig(prev => ({
        ...prev,
        hero: {
          ...prev.hero,
          galleryImages: galleryData
        }
      }));
    });

    return () => unsubscribeGallery();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Exclude galleryImages from the main document to stay under 1MB
      // We also explicitly set it to deleteField() to remove it from the doc in case it was there before
      const { galleryImages, ...heroWithoutGallery } = config.hero;
      
      await setDoc(doc(db, 'config', 'global'), {
        identity: config.identity,
        hero: {
          title: config.hero.title,
          subtitle: config.hero.subtitle,
          imageUrl: config.hero.imageUrl,
          galleryImages: deleteField() // Ensure the massive array is removed from the doc
        },
        socials: config.socials,
        mobileMoney: config.mobileMoney,
        updatedAt: serverTimestamp()
      }, { merge: true });
      alert("Configuration mise à jour avec succès !");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'config/global');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 uppercase font-black text-[10px] tracking-widest">
        Chargement de la configuration...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12 pb-20">
      {/* Identity & Contact */}
      <div className="bg-white p-8 rounded-[40px] shadow-xl border border-church-border">
        <h2 className="text-xl font-black text-church-dark mb-8 flex items-center gap-3 uppercase tracking-tight">
          <Globe className="text-church-blue" size={24} />
          Identité & Contact
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Logo du Site</label>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                {config.identity.logoUrl ? (
                  <img src={config.identity.logoUrl} className="w-full h-full object-contain" alt="Logo preview" />
                ) : (
                  <ImageIcon size={32} className="text-slate-200" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input 
                  type="file"
                  id="logo-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'logo')}
                />
                <button 
                  type="button"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  className="px-6 py-2 bg-church-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-church-dark transition-all"
                >
                  Choisir un Logo
                </button>
                {config.identity.logoUrl && (
                  <button 
                    type="button"
                    onClick={() => setConfig({...config, identity: {...config.identity, logoUrl: ''}})}
                    className="text-[8px] font-black text-red-500 uppercase tracking-widest hover:underline text-left"
                  >
                    Supprimer le logo
                  </button>
                )}
              </div>
            </div>
            <p className="mt-2 text-[9px] text-slate-400 font-medium italic">Format recommandé: PNG transparent, format carré ou paysage court.</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nom de l'Église / Ministère</label>
            <input 
              type="text"
              value={config.identity.name}
              onChange={e => setConfig({...config, identity: {...config.identity, name: e.target.value}})}
              className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-blue"
              placeholder="Ex: Centre de Disciples de Kinshasa"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description / Slogan</label>
            <input 
              type="text"
              value={config.identity.description}
              onChange={e => setConfig({...config, identity: {...config.identity, description: e.target.value}})}
              className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-blue"
              placeholder="Ex: Une Demeure de Paix & Puissance"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Adresse Physique</label>
            <input 
              type="text"
              value={config.identity.address}
              onChange={e => setConfig({...config, identity: {...config.identity, address: e.target.value}})}
              className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-blue"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Téléphone principal</label>
            <input 
              type="text"
              value={config.identity.phone}
              onChange={e => setConfig({...config, identity: {...config.identity, phone: e.target.value}})}
              className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-blue"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">WhatsApp Business</label>
            <input 
              type="text"
              value={config.identity.whatsapp}
              onChange={e => setConfig({...config, identity: {...config.identity, whatsapp: e.target.value}})}
              className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-blue"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">À Propos de l'Église</label>
            <textarea 
              value={config.identity.aboutText}
              onChange={e => setConfig({...config, identity: {...config.identity, aboutText: e.target.value}})}
              className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-blue"
              rows={4}
              placeholder="Description détaillée de l'église..."
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notre Mission</label>
            <textarea 
              value={config.identity.missionText}
              onChange={e => setConfig({...config, identity: {...config.identity, missionText: e.target.value}})}
              className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-blue"
              rows={4}
              placeholder="Mission et vision de l'église..."
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Années de Ministère</label>
            <input 
              type="text"
              value={config.identity.yearsOfMinistry}
              onChange={e => setConfig({...config, identity: {...config.identity, yearsOfMinistry: e.target.value}})}
              className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-blue"
              placeholder="Ex: 20+ ou Depuis 2004"
            />
          </div>

          {/* Section Valeurs */}
          <div className="md:col-span-2 pt-8 border-t border-church-border">
            <h3 className="text-sm font-black text-church-dark mb-6 uppercase tracking-widest">Nos Valeurs Core</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <input 
                  type="text"
                  value={config.identity.value1Title}
                  onChange={e => setConfig({...config, identity: {...config.identity, value1Title: e.target.value}})}
                  className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest"
                  placeholder="Titre Valeur 1"
                />
                <textarea 
                  value={config.identity.value1Desc}
                  onChange={e => setConfig({...config, identity: {...config.identity, value1Desc: e.target.value}})}
                  className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-2 text-xs"
                  rows={3}
                  placeholder="Description..."
                />
              </div>
              <div className="space-y-4">
                <input 
                  type="text"
                  value={config.identity.value2Title}
                  onChange={e => setConfig({...config, identity: {...config.identity, value2Title: e.target.value}})}
                  className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest"
                  placeholder="Titre Valeur 2"
                />
                <textarea 
                  value={config.identity.value2Desc}
                  onChange={e => setConfig({...config, identity: {...config.identity, value2Desc: e.target.value}})}
                  className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-2 text-xs"
                  rows={3}
                  placeholder="Description..."
                />
              </div>
              <div className="space-y-4">
                <input 
                  type="text"
                  value={config.identity.value3Title}
                  onChange={e => setConfig({...config, identity: {...config.identity, value3Title: e.target.value}})}
                  className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest"
                  placeholder="Titre Valeur 3"
                />
                <textarea 
                  value={config.identity.value3Desc}
                  onChange={e => setConfig({...config, identity: {...config.identity, value3Desc: e.target.value}})}
                  className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-2 text-xs"
                  rows={3}
                  placeholder="Description..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Content */}
      <div className="bg-white p-8 rounded-[40px] shadow-xl border border-church-border overflow-hidden">
        <h2 className="text-xl font-black text-church-dark mb-8 flex items-center gap-3 uppercase tracking-tight">
          <ImageIcon className="text-church-blue" size={24} />
          Accueil (Hero Banner)
        </h2>

        {/* Visual Guide / Mockup */}
        <div className="mb-12 bg-slate-50 rounded-[48px] p-10 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-4 left-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <div className="w-2 h-2 rounded-full bg-green-400" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 text-center">Plan de la Page d'Accueil (Section Hero)</p>
          
          <div className="w-full max-w-3xl mx-auto aspect-video bg-white rounded-3xl shadow-2xl border border-church-border relative overflow-hidden group">
            {/* Mockup Images Background */}
            <div className="absolute inset-0 flex">
              <div className="w-1/3 h-full bg-slate-100 border-r border-dashed border-slate-200 flex items-center justify-center">
                <ImageIcon size={24} className="text-slate-200" />
              </div>
              <div className="w-1/3 h-full bg-slate-50 border-r border-dashed border-slate-200 flex items-center justify-center">
                <ImageIcon size={24} className="text-slate-200" />
              </div>
              <div className="w-1/3 h-full bg-slate-100 flex items-center justify-center">
                <ImageIcon size={24} className="text-slate-200" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 p-12 flex flex-col items-center justify-center text-center">
              <div className="mb-6 space-y-3 w-full flex flex-col items-center">
                <div className="relative group">
                  <div className="px-6 py-4 bg-church-blue/5 border-2 border-church-blue/20 border-dashed rounded-2xl min-w-[280px]">
                    <span className="text-[10px] font-black text-church-blue uppercase tracking-widest block mb-1">TITRE PRINCIPAL</span>
                  </div>
                  <div className="absolute -top-3 -right-3 px-2 py-1 bg-church-blue text-white text-[8px] font-black rounded-lg shadow-lg">1</div>
                </div>

                <div className="relative group">
                  <div className="px-6 py-3 bg-church-dark/5 border-2 border-church-dark/20 border-dashed rounded-xl min-w-[200px]">
                    <span className="text-[10px] font-black text-church-dark uppercase tracking-widest block mb-1">SOUS-TITRE / SLOGAN</span>
                  </div>
                  <div className="absolute -top-3 -right-3 px-2 py-1 bg-church-dark text-white text-[8px] font-black rounded-lg shadow-lg">2</div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-32 h-12 bg-church-blue rounded-2xl shadow-lg border border-church-blue/20" />
                <div className="w-32 h-12 bg-white rounded-2xl shadow-md border border-church-border" />
              </div>
            </div>

            {/* Accessibility Info Tag */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-church-blue' : 'bg-slate-200'}`} />
                ))}
              </div>
              <div className="px-3 py-1.5 bg-church-accent/10 border border-church-accent/20 rounded-full flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-church-accent animate-pulse" />
                <span className="text-[8px] font-black text-church-accent uppercase tracking-[0.15em]">Slider Interactif</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-church-blue text-white text-[10px] font-black flex items-center justify-center">1</span>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Le <span className="font-bold text-church-dark">Titre</span> s'affiche en grand centre, captant l'attention immédiate des visiteurs.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-church-dark text-white text-[10px] font-black flex items-center justify-center">2</span>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Le <span className="font-bold text-church-dark">Sous-titre</span> apporte du contexte et du détail sur votre ministère.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Titre de la Bannière</label>
            <input 
              type="text"
              value={config.hero.title}
              onChange={e => setConfig({...config, hero: {...config.hero, title: e.target.value}})}
              className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-church-blue outline-none"
              placeholder="Ex: Une Demeure de Paix & Puissance"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sous-titre (Description)</label>
            <textarea 
              value={config.hero.subtitle}
              onChange={e => setConfig({...config, hero: {...config.hero, subtitle: e.target.value}})}
              className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-church-blue outline-none"
              rows={2}
            />
          </div>
          <div className="md:col-span-2 space-y-8">
            <div className="pt-4 border-t border-slate-50">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Bibliothèque d'images Hero (Slider Aléatoire)</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {(config.hero.galleryImages || []).map((img, idx) => (
                  <div key={img.id || idx} className="bg-slate-50 rounded-3xl p-4 border border-church-border group transition-all hover:bg-white hover:shadow-xl">
                    <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 bg-slate-200">
                      <img src={img.url} className="w-full h-full object-cover" alt="" />
                      <button 
                        type="button"
                        onClick={() => handleDeleteGalleryImage(img.id)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Description (Accessibilité)</label>
                      <input 
                        type="text"
                        value={img.description}
                        onChange={e => handleUpdateGalleryDescription(img.id, e.target.value)}
                        className="w-full bg-white border border-church-border rounded-lg px-3 py-2 text-[10px] focus:ring-1 focus:ring-church-blue outline-none"
                        placeholder="Décrivez l'image pour les malvoyants..."
                      />
                    </div>
                  </div>
                ))}
                
                <button 
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => imageInputRef.current?.click()}
                  className="aspect-square sm:aspect-auto rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 hover:border-church-blue hover:text-church-blue hover:bg-blue-50/30 transition-all p-8 disabled:opacity-50"
                >
                  {uploadingImage ? <Loader2 size={32} className="animate-spin" /> : <Plus size={32} />}
                  <span className="text-[10px] font-black uppercase mt-3 tracking-widest">
                    {uploadingImage ? 'Compression...' : 'Ajouter Photo'}
                  </span>
                </button>
                <input 
                  type="file"
                  ref={imageInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'gallery')}
                />
              </div>

              <div className="bg-blue-50 p-6 rounded-[24px] border border-blue-100">
                <p className="text-[10px] font-bold text-church-blue uppercase tracking-widest leading-loose">
                  💡 En ajoutant plusieurs photos ici, la bannière d'accueil changera aléatoirement à chaque chargement de la page pour offrir une expérience dynamique à vos visiteurs.
                </p>
              </div>
            </div>

            <div className="hidden">
              {/* Legacy field kept for backward compatibility if needed, but we prefer imageUrls */}
              <input 
                type="text"
                value={config.hero.imageUrl}
                onChange={e => setConfig({...config, hero: {...config.hero, imageUrl: e.target.value}})}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Socials & Live */}
      <div className="bg-white p-8 rounded-[40px] shadow-xl border border-church-border">
        <h2 className="text-xl font-black text-church-dark mb-8 flex items-center gap-3 uppercase tracking-tight">
          <Instagram className="text-rose-500" size={24} />
          Digital & Réseaux Sociaux
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Facebook</label>
              <span className="text-[8px] font-bold text-slate-300">URL complète requise</span>
            </div>
            <input 
              type="text"
              value={config.socials.facebook}
              onChange={e => setConfig({...config, socials: {...config.socials, facebook: e.target.value}})}
              className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm"
              placeholder="https://facebook.com/votrepage"
            />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">YouTube</label>
              <span className="text-[8px] font-bold text-slate-300">URL complète requise</span>
            </div>
            <input 
              type="text"
              value={config.socials.youtube}
              onChange={e => setConfig({...config, socials: {...config.socials, youtube: e.target.value}})}
              className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm"
              placeholder="https://youtube.com/@votrechaine"
            />
          </div>
          <div className="md:col-span-2 pt-6 border-t border-slate-50">
            <h3 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Tv size={14} />
              Programmer le Prochain Direct
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Titre du Direct</label>
                <input 
                  type="text"
                  value={config.socials.nextLiveTitle || ''}
                  onChange={e => setConfig({...config, socials: {...config.socials, nextLiveTitle: e.target.value}})}
                  className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm font-bold"
                  placeholder="Ex: Culte de Célébration & Action de Grâce"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Heure du Direct</label>
                <input 
                  type="datetime-local"
                  value={config.socials.nextLiveDate || ''}
                  onChange={e => setConfig({...config, socials: {...config.socials, nextLiveDate: e.target.value}})}
                  className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">URL Embed YouTube Direct (Streaming Actif)</label>
                <input 
                  type="text"
                  value={config.socials.liveUrl}
                  onChange={e => setConfig({...config, socials: {...config.socials, liveUrl: e.target.value}})}
                  className="w-full bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 text-sm"
                  placeholder="Ex: https://www.youtube.com/embed/LIVE_ID"
                />
                <p className="mt-2 text-[10px] text-slate-400 font-medium">Laissez vide si vous n'êtes pas en direct. Le titre et la date seront affichés à la place.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Money */}
      <div className="bg-white p-8 rounded-[40px] shadow-xl border border-church-border">
        <h2 className="text-xl font-black text-church-dark mb-8 flex items-center gap-3 uppercase tracking-tight">
          <Phone className="text-church-gold" size={24} />
          Mobile Money
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Orange Money</label>
            <input 
              type="text"
              value={config.mobileMoney.orangeMoney}
              onChange={e => setConfig({...config, mobileMoney: {...config.mobileMoney, orangeMoney: e.target.value}})}
              className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Airtel Money</label>
            <input 
              type="text"
              value={config.mobileMoney.airtelMoney}
              onChange={e => setConfig({...config, mobileMoney: {...config.mobileMoney, airtelMoney: e.target.value}})}
              className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">M-Pesa</label>
            <input 
              type="text"
              value={config.mobileMoney.mpesa}
              onChange={e => setConfig({...config, mobileMoney: {...config.mobileMoney, mpesa: e.target.value}})}
              className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end p-4">
        <button 
          type="submit"
          disabled={submitting}
          className="px-12 py-5 bg-church-dark text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-church-blue transition-all disabled:opacity-50 flex items-center gap-3"
        >
          {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Enregistrer Tout
        </button>
      </div>
    </form>
  );
}
