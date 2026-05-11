import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User as UserIcon, Phone, MessageSquare, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const subjects = [
  "Conseil Pastoral",
  "Prière & Délivrance",
  "Baptême",
  "Mariage",
  "Entretien Particulier"
];

export default function Appointments() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    subject: 'Conseil Pastoral',
    message: '',
    phone: ''
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.date) newErrors.date = "Veuillez choisir une date";
    if (!formData.time) newErrors.time = "Veuillez choisir une heure";
    if (!formData.phone) newErrors.phone = "Numéro de téléphone requis";
    if (formData.phone && !/^\+?[0-9]{10,14}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Format de téléphone invalide";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Veuillez vous connecter pour réserver un rendez-vous.");
      return;
    }

    if (!validate()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'appointments'), {
        ...formData,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        status: 'En attente',
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
      setErrors({});
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'appointments');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-church-bg">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-12 rounded-[40px] shadow-2xl border border-church-border text-center"
        >
          <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center text-green-500 mx-auto mb-8 shadow-inner">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-display font-black text-church-dark mb-4">Demande Envoyée !</h2>
          <p className="text-slate-500 font-medium mb-8">
            Votre demande de rendez-vous a été enregistrée. Le secrétariat vous contactera prochainement pour confirmation.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="w-full py-4 bg-church-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-church-blue transition-all shadow-xl"
          >
            Prendre un autre rendez-vous
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 bg-church-bg min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="inline-block bg-church-blue/10 text-church-blue px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4">
              Service aux Membres
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black text-church-dark mb-8 leading-tight">Prendre <br /><span className="text-church-blue">Rendez-vous</span></h1>
            <p className="text-slate-500 text-lg mb-12 font-medium leading-relaxed">
              Besoin d'un conseil, d'une orientation ou d'un baptême ? Nos pasteurs et conseillers sont à votre disposition pour vous accompagner dans votre marche spirituelle.
            </p>

            <div className="space-y-6">
              {[
                { icon: Clock, title: "Disponibilité", desc: "Mar au Ven : 09h00 - 17h00" },
                { icon: MessageSquare, title: "Confidentialité", desc: "Tous les entretiens sont strictement confidentiels." },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-church-border flex items-center justify-center text-church-blue">
                    <item.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.title}</h3>
                    <p className="text-church-dark font-black text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 md:p-12 rounded-[48px] shadow-2xl border border-church-border relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-church-gold/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Date</label>
                  <div className="relative">
                    <CalendarIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="date"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      className={cn(
                        "w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-church-blue transition-all",
                        errors.date ? "border-red-500" : "border-slate-100"
                      )}
                    />
                  </div>
                  {errors.date && <p className="text-red-500 text-[9px] font-black uppercase mt-1 px-1 tracking-widest">{errors.date}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Heure</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="time"
                      value={formData.time}
                      onChange={e => setFormData({...formData, time: e.target.value})}
                      className={cn(
                        "w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-church-blue transition-all",
                        errors.time ? "border-red-500" : "border-slate-100"
                      )}
                    />
                  </div>
                  {errors.time && <p className="text-red-500 text-[9px] font-black uppercase mt-1 px-1 tracking-widest">{errors.time}</p>}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Objet du Rendez-vous</label>
                <select 
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-church-blue transition-all appearance-none outline-none"
                >
                  {subjects.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Numéro de Téléphone</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="+243 ..."
                    className={cn(
                      "w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-church-blue transition-all",
                      errors.phone ? "border-red-500" : "border-slate-100"
                    )}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-[9px] font-black uppercase mt-1 px-1 tracking-widest">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Notes Additionnelles</label>
                <textarea 
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  placeholder="Expliquez brièvement votre situation..."
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-church-blue transition-all resize-none"
                  rows={3}
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-church-dark text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-church-blue transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                {user ? 'Réserver mon Rendez-vous' : 'Connectez-vous pour continuer'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

