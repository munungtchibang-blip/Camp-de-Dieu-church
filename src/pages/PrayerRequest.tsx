import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { MessageSquare, Send, Heart, Shield, CheckCircle2, Loader2, User as UserIcon, Phone, Mail } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export default function PrayerRequest() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    category: 'Requête Personnelle',
    content: '',
    isAnonymous: false
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.isAnonymous && !formData.name.trim()) newErrors.name = "Nom requis";
    if (!formData.content.trim()) newErrors.content = "Veuillez détailler votre requête";
    if (formData.phone && !/^\+?[0-9]{10,14}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Format de téléphone invalide";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'prayer_requests'), {
        ...formData,
        userId: user?.uid || null,
        status: 'Reçu',
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
      setErrors({});
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'prayer_requests');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "Requête Personnelle",
    "Santé & Guérison",
    "Famille & Couple",
    "Finances & Travail",
    "Délivrance",
    "Action de Grâce"
  ];

  if (submitted) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-church-bg">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-12 rounded-[40px] shadow-2xl border border-church-border text-center"
        >
          <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-church-gold mx-auto mb-8 shadow-inner">
            <Heart size={48} className="fill-current" />
          </div>
          <h2 className="text-3xl font-display font-black text-church-dark mb-4">Porté en Prière !</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            Votre requête a été transmise à notre équipe d'intercession. Nous croyons que Dieu exauce les prières ferventes.
          </p>
          <button 
            onClick={() => {
              setSubmitted(false);
              setFormData({ ...formData, content: '' });
            }}
            className="w-full py-4 bg-church-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-church-blue transition-all shadow-xl"
          >
            Envoyer une autre requête
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 bg-church-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="inline-block bg-church-gold/10 text-church-gold px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4">
              Intercession
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black text-church-dark mb-8 leading-tight">
              Demander la <br />
              <span className="text-church-gold">Prière</span>
            </h1>
            <p className="text-slate-500 text-lg mb-12 font-medium leading-relaxed">
              "Ne vous inquiétez de rien; mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications, avec des actions de grâces." - Philippiens 4:6
            </p>

            <div className="space-y-8">
              {[
                { icon: Shield, title: "Confidentialité", desc: "Vos requêtes sont traitées avec le plus grand respect du secret." },
                { icon: MessageSquare, title: "Accompagnement", desc: "Notre équipe d'intercesseurs prie quotidiennement pour chaque besoin." },
              ].map((item, i) => (
                <div key={i} className="flex gap-6">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-church-border flex items-center justify-center text-church-gold flex-shrink-0">
                    <item.icon size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-church-dark uppercase tracking-tight mb-1">{item.title}</h3>
                    <p className="text-slate-500 text-sm font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 md:p-12 rounded-[48px] shadow-2xl border border-church-border relative"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <input 
                    type="checkbox"
                    id="anonymous"
                    checked={formData.isAnonymous}
                    onChange={e => setFormData({...formData, isAnonymous: e.target.checked})}
                    className="w-4 h-4 text-church-gold border-slate-200 rounded focus:ring-church-gold"
                  />
                  <label htmlFor="anonymous" className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer">Envoyer anonymement</label>
                </div>

                {!formData.isAnonymous && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nom Complet</label>
                      <div className="relative">
                        <UserIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input 
                          type="text"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className={cn(
                            "w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all",
                            errors.name ? "border-red-500" : "border-slate-100"
                          )}
                        />
                      </div>
                      {errors.name && <p className="text-red-500 text-[9px] font-black uppercase mt-1 px-1 tracking-widest">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Téléphone</label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input 
                          type="tel"
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          className={cn(
                            "w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all",
                            errors.phone ? "border-red-500" : "border-slate-100"
                          )}
                        />
                      </div>
                      {errors.phone && <p className="text-red-500 text-[9px] font-black uppercase mt-1 px-1 tracking-widest">{errors.phone}</p>}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Catégorie du Besoin</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all outline-none"
                  >
                    {categories.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Votre Requête</label>
                  <textarea 
                    value={formData.content}
                    onChange={e => setFormData({...formData, content: e.target.value})}
                    placeholder="Écrivez ici votre sujet de prière..."
                    className={cn(
                      "w-full px-6 py-4 bg-slate-50 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all resize-none",
                      errors.content ? "border-red-500" : "border-slate-100"
                    )}
                    rows={6}
                  />
                  {errors.content && <p className="text-red-500 text-[9px] font-black uppercase mt-1 px-1 tracking-widest">{errors.content}</p>}
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-church-gold text-church-dark rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-amber-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                Envoyer ma Demande de Prière
              </button>

              <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">
                "Car là où deux ou trois sont assemblés en mon nom,<br /> je suis au milieu d'eux." - Matthieu 18:20
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

