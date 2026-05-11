import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, Facebook, Youtube, Instagram, Twitter, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useSiteConfig } from '../hooks/useSiteConfig';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function Contact() {
  const { config } = useSiteConfig();
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const defaultCenter = { lat: -4.3382, lng: 15.3188 }; // Approx coords for Limete, Kinshasa

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.subject.trim()) newErrors.subject = 'Le sujet est requis';
    if (!formData.message.trim()) newErrors.message = 'Le message est requis';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setStatus('idle');

    try {
      await addDoc(collection(db, 'contacts'), {
        ...formData,
        createdAt: serverTimestamp(),
        read: false
      });
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setStatus('error');
      handleFirestoreError(error, OperationType.WRITE, 'contacts');
    } finally {
      setSubmitting(false);
    }
  };

  const socialLinks = [
    { icon: Facebook, href: config?.socials?.facebook },
    { icon: Youtube, href: config?.socials?.youtube },
    { icon: Instagram, href: config?.socials?.instagram },
    { icon: Twitter, href: config?.socials?.twitter },
  ].filter(link => link.href);

  return (
    <div className="pt-32 pb-20 bg-church-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-church-blue/10 text-church-blue px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            Nous Sommes à Votre Écoute
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black text-church-dark mb-4">Contactez-nous</h1>
          <p className="text-slate-500 max-w-2xl mx-auto font-medium">Une question, une suggestion ou besoin d'orientation ? Notre équipe est prête à vous répondre.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-20">
          {/* Contact Info Card */}
          <div className="space-y-6">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-church-border">
              <h2 className="text-2xl font-black text-church-dark mb-8 uppercase tracking-tight">Coordonnées</h2>
              
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-church-blue flex-shrink-0 shadow-sm">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-church-blue uppercase tracking-widest mb-1">Adresse Locale</h3>
                    <p className="text-church-dark font-bold leading-relaxed">
                      {config?.identity?.address || config?.contact?.address || 'Chaussée Kimwenza, Commune de Limete, Kinshasa, RDC'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-church-accent flex-shrink-0 shadow-sm">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-church-accent uppercase tracking-widest mb-1">Téléphone & WhatsApp</h3>
                    <p className="text-church-dark font-bold">{config?.identity?.phone || config?.contact?.phone || '+243 812 345 6789'}</p>
                    {(config?.identity?.whatsapp || config?.contact?.whatsapp) && (
                      <p className="text-church-dark font-bold text-sm">WhatsApp: {config?.identity?.whatsapp || config?.contact?.whatsapp}</p>
                    )}
                    <p className="text-slate-400 text-xs font-medium">Disponible de 08h00 à 18h00 (Lun-Ven)</p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 flex-shrink-0 shadow-sm">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">Email Officiel</h3>
                    <p className="text-church-dark font-bold">{config?.identity?.email || config?.contact?.email || 'contact@campdedieu.org'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 flex-shrink-0 shadow-sm">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Secrétariat</h3>
                    <p className="text-church-dark font-bold">Mardi - Jeudi : 09h00 - 16h30</p>
                    <p className="text-church-dark font-bold">Samedi : 10h00 - 13h00</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-12 border-t border-church-border">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Suivez-nous sur les réseaux</h3>
                <div className="flex gap-4">
                  {socialLinks.map((link, i) => (
                    <a 
                      key={i} 
                      href={link.href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-church-dark hover:text-white hover:bg-church-blue transition-all border border-church-border"
                    >
                      <link.icon size={20} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-church-dark p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            
            <h2 className="text-2xl font-black text-white mb-8 uppercase tracking-tight relative z-10">Envoyez un Message</h2>
            
            {status === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/10 border border-green-500/20 p-8 rounded-2xl text-center relative z-10"
              >
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
                  <CheckCircle2 size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Message Envoyé !</h3>
                <p className="text-white/60 text-sm font-medium mb-8">Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="px-8 py-3 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                >
                  Envoyer un autre message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Nom Complet</label>
                    <input 
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className={cn(
                        "w-full bg-white/10 border rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all",
                        errors.name ? "border-red-500" : "border-white/20"
                      )}
                      placeholder="Votre nom"
                    />
                    {errors.name && <p className="text-red-400 text-[10px] font-black mt-2 uppercase tracking-wider">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Email</label>
                    <input 
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className={cn(
                        "w-full bg-white/10 border rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all",
                        errors.email ? "border-red-500" : "border-white/20"
                      )}
                      placeholder="votre@email.com"
                    />
                    {errors.email && <p className="text-red-400 text-[10px] font-black mt-2 uppercase tracking-wider">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Sujet</label>
                  <input 
                    type="text"
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    className={cn(
                      "w-full bg-white/10 border rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all",
                      errors.subject ? "border-red-500" : "border-white/20"
                    )}
                    placeholder="Objet de votre message"
                  />
                  {errors.subject && <p className="text-red-400 text-[10px] font-black mt-2 uppercase tracking-wider">{errors.subject}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Message</label>
                  <textarea 
                    rows={5}
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    className={cn(
                      "w-full bg-white/10 border rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-church-gold transition-all",
                      errors.message ? "border-red-500" : "border-white/20"
                    )}
                    placeholder="Comment pouvons-nous vous aider ?"
                  ></textarea>
                  {errors.message && <p className="text-red-400 text-[10px] font-black mt-2 uppercase tracking-wider">{errors.message}</p>}
                </div>

                {status === 'error' && (
                  <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-100 text-xs font-bold uppercase tracking-tight">
                    <AlertCircle size={16} />
                    Une erreur est survenue. Veuillez réessayer.
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full py-5 bg-church-gold text-church-dark rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Send size={18} />
                  )}
                  {submitting ? 'Envoi en cours...' : 'Envoyer le Message'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Map Section */}
        <div className="h-[500px] bg-slate-200 rounded-[40px] shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105 opacity-40 grayscale group-hover:grayscale-0"></div>
          <div className="absolute inset-0 bg-church-dark/40 flex flex-col items-center justify-center text-center px-6">
            <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-sm">
              <h3 className="text-church-dark font-black text-lg mb-2">Retrouvez-nous Facilement</h3>
              <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed">
                Notre église est idéalement située pour toute personne habitant Limete ou transitant par cette commune centrale.
              </p>
              <a 
                href="https://www.google.com/maps/search/?api=1&query=-4.3382,15.3188" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-8 py-3 bg-church-blue text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-church-dark transition-all"
              >
                Ouvrir dans Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
