import React, { useState } from 'react';
import { HelpCircle, X, Send, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteConfig } from '../../hooks/useSiteConfig';

export default function HelpWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { config } = useSiteConfig();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate sending email/contact
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setFormData({ name: '', email: '', message: '' });
      }, 3000);
    }, 1500);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 bg-church-blue text-white p-4 rounded-full shadow-2xl hover:bg-church-gold hover:scale-105 transition-all duration-300 flex items-center justify-center group"
      >
        <span className="absolute left-full ml-4 w-max bg-white dark:bg-dark-card text-church-dark dark:text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
          Besoin d'aide ?
        </span>
        <HelpCircle size={28} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-dark-bg rounded-[32px] overflow-hidden shadow-2xl z-10 p-8 border border-white/20 dark:border-white/5"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-church-blue transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-church-blue/10 rounded-2xl flex items-center justify-center">
                  <MessageSquare size={24} className="text-church-blue" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-church-dark dark:text-white uppercase tracking-tight">Contact Rapide</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Nous sommes à votre écoute</p>
                </div>
              </div>

              {submitted ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send size={24} />
                  </div>
                  <h4 className="text-lg font-bold text-church-dark dark:text-white mb-2">Message envoyé !</h4>
                  <p className="text-slate-500 text-sm">Nous vous répondrons dans les plus brefs délais.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Votre nom complet"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-church-blue transition-all dark:text-white"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      required
                      placeholder="Votre adresse email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-church-blue transition-all dark:text-white"
                    />
                  </div>
                  <div>
                    <textarea
                      required
                      placeholder="Comment pouvons-nous vous aider ?"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-church-blue transition-all resize-none dark:text-white custom-scrollbar"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-church-blue text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-church-gold transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">Envoi en cours...</span>
                    ) : (
                      <>
                        Envoyer le message <Send size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
