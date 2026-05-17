import React, { useState, useEffect } from 'react';
import { Save, Loader2, Globe, Phone, Mail, Instagram, Facebook, Youtube, Twitter, MapPin, Type, Image as ImageIcon, Plus, Trash, Tv } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { SiteConfig } from '../../hooks/useSiteConfig';

export default function SiteSettings() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const [config, setConfig] = useState<SiteConfig>({
    identity: { 
      name: '', description: '', address: '', phone: '', email: '', whatsapp: '', 
      aboutText: '', missionText: '', yearsOfMinistry: '',
      value1Title: '', value1Desc: '',
      value2Title: '', value2Desc: '',
      value3Title: '', value3Desc: ''
    },
    hero: { 
      title: '', 
      subtitle: '', 
      imageUrl: '',
      imageUrls: [] as string[]
    },
    socials: { facebook: '', youtube: '', instagram: '', twitter: '', liveUrl: '', nextLiveTitle: '', nextLiveDate: '' },
    mobileMoney: { orangeMoney: '', airtelMoney: '', mpesa: '' }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isHeroList = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isHeroList) {
          setConfig({ 
            ...config, 
            hero: { 
              ...config.hero, 
              imageUrls: [...(config.hero.imageUrls || []), reader.result as string] 
            }
          });
        } else {
          setConfig({ ...config, hero: { ...config.hero, imageUrl: reader.result as string }});
        }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'config', 'global');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as any;
          // Merge with defaults to avoid undefined errors
          setConfig({
            identity: { ...config.identity, ...(data.identity || data.contact || {}) },
            hero: { ...config.hero, ...(data.hero || {}) },
            socials: { ...config.socials, ...(data.socials || {}) },
            mobileMoney: { ...config.mobileMoney, ...(data.mobileMoney || {}) }
          });
        }
      } catch (error) {
        console.error("Error fetching config:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await setDoc(doc(db, 'config', 'global'), {
        ...config,
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
      <div className="bg-white p-8 rounded-[40px] shadow-xl border border-church-border">
        <h2 className="text-xl font-black text-church-dark mb-8 flex items-center gap-3 uppercase tracking-tight">
          <ImageIcon className="text-church-blue" size={24} />
          Accueil (Hero Banner)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Titre de la Bannière</label>
            <input 
              type="text"
              value={config.hero.title}
              onChange={e => setConfig({...config, hero: {...config.hero, title: e.target.value}})}
              className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm"
              placeholder="Ex: Une Demeure de Paix & Puissance"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sous-titre (Description)</label>
            <textarea 
              value={config.hero.subtitle}
              onChange={e => setConfig({...config, hero: {...config.hero, subtitle: e.target.value}})}
              className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm"
              rows={2}
            />
          </div>
          <div className="md:col-span-2 space-y-8">
            <div className="pt-4 border-t border-slate-50">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Bibliothèque d'images Hero (Aléatoire activé)</label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                {(config.hero.imageUrls || []).map((url, idx) => (
                  <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden border border-church-border group">
                    <img src={url} className="w-full h-full object-cover" alt="" />
                    <button 
                      type="button"
                      onClick={() => setConfig({
                        ...config,
                        hero: { ...config.hero, imageUrls: config.hero.imageUrls?.filter((_, i) => i !== idx) }
                      })}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash size={12} />
                    </button>
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
                
                <button 
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="aspect-video rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 hover:border-church-blue hover:text-church-blue transition-all"
                >
                  <Plus size={24} />
                  <span className="text-[8px] font-black uppercase mt-2">Ajouter Photo</span>
                </button>
                <input 
                  type="file"
                  ref={imageInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, true)}
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
