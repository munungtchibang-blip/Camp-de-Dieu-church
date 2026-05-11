import { motion } from 'framer-motion';
import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Heart, Users, MapPin, Smartphone, Copy, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSiteConfig } from '../hooks/useSiteConfig';

export default function Donations() {
  const { config } = useSiteConfig();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const paymentMethods = [
    { 
      id: 'orange', 
      name: 'Orange Money', 
      icon: 'https://seeklogo.com/images/O/orange-money-logo-344408A681-seeklogo.com.png', 
      color: 'bg-orange-500', 
      number: config?.mobileMoney.orangeMoney 
    },
    { 
      id: 'airtel', 
      name: 'Airtel Money', 
      icon: 'https://th.bing.com/th/id/R.5e9b72b8d00062b1093126bebe14edc4?rik=yY9Eow8K%2fK25lQ&pid=ImgRaw&r=0', 
      color: 'bg-red-600', 
      number: config?.mobileMoney.airtelMoney 
    },
    { 
      id: 'mpesa', 
      name: 'M-Pesa / Vodacom', 
      icon: 'https://th.bing.com/th/id/R.4385966453000df870f074d6c4a63580?rik=yY9Eow8K%2fK25lQ&pid=ImgRaw&r=0', 
      color: 'bg-green-600', 
      number: config?.mobileMoney.mpesa 
    },
  ].filter(m => m.number);

  const handleCopy = (num: string, id: string) => {
    navigator.clipboard.writeText(num);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="pt-32 pb-20 bg-church-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Campaign/Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="inline-block bg-church-blue/10 text-church-blue px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4">
              Générosité & Soutien
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black text-church-dark mb-8">Soutenir l'Œuvre de Dieu</h1>
            <p className="text-slate-500 text-lg mb-12 font-medium">
              Chaque don, petit ou grand, contribue à propager l'Évangile, à soutenir nos départements et à aider les plus démunis de notre communauté. Vos offrandes font une différence éternelle.
            </p>
            
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[32px] border border-church-border shadow-sm">
                <div className="flex items-center space-x-3 text-church-blue mb-4">
                  <Heart size={24} className="fill-current" />
                  <h3 className="font-black text-lg uppercase tracking-tight">Offrande Générale</h3>
                </div>
                <p className="text-sm text-slate-500 mb-6 font-medium">Pour le fonctionnement quotidien de l'église et les besoins courants.</p>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-church-gold w-3/4"></div>
                </div>
              </div>

              <div className="bg-church-dark p-8 rounded-[32px] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="flex items-center space-x-3 text-church-gold mb-4 relative z-10">
                  <Users size={24} />
                  <h3 className="font-black text-lg uppercase tracking-tight">Projet Construction</h3>
                </div>
                <p className="text-sm text-white/60 mb-6 font-medium relative z-10">Aidez-nous à bâtir notre nouveau sanctuaire pour la gloire de Dieu.</p>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 relative z-10">
                  <span>Progression</span>
                  <span>45%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden relative z-10">
                  <div className="h-full bg-church-blue w-[45%]"></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Donation Form */}
          <motion.div
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="bg-white border border-church-border rounded-[40px] shadow-2xl p-8 md:p-12"
          >
             <h2 className="text-2xl font-black text-church-dark mb-8 flex items-center space-x-3 uppercase tracking-tight">
               <Smartphone className="text-church-blue" />
               <span>Dons Directs (Mobile)</span>
             </h2>

             <p className="text-xs text-slate-400 font-bold mb-8 leading-relaxed uppercase tracking-widest">
               Sélectionnez un opérateur pour voir le numéro et effectuer votre transfert direct.
             </p>

             <div className="space-y-6">
                {paymentMethods.length > 0 ? (
                  paymentMethods.map(m => (
                    <div 
                      key={m.id}
                      className={cn(
                        "group p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden",
                        selectedMethod === m.id ? "border-church-blue bg-blue-50" : "border-slate-50 bg-slate-50 hover:border-slate-100"
                      )}
                      onClick={() => setSelectedMethod(m.id)}
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 bg-white rounded-2xl shadow-sm p-3 flex items-center justify-center border border-slate-100">
                             <img src={m.icon} alt={m.name} className="max-w-full max-h-full object-contain" />
                          </div>
                          <div>
                            <span className="block font-black text-church-dark uppercase tracking-tight">{m.name}</span>
                            <span className="text-xs text-slate-400 font-bold">{m.id === 'mpesa' ? 'Vodacom' : 'RDC'}</span>
                          </div>
                        </div>
                        <div className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                          selectedMethod === m.id ? "border-church-blue bg-white" : "border-slate-300"
                        )}>
                          {selectedMethod === m.id && <div className="w-2.5 h-2.5 rounded-full bg-church-blue"></div>}
                        </div>
                      </div>

                      {selectedMethod === m.id && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-6 pt-6 border-t border-church-blue/10"
                        >
                          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-church-blue/20">
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Numéro du Bénéficiaire</p>
                              <p className="text-lg font-black text-church-blue font-mono">{m.number}</p>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(m.number || '', m.id);
                              }}
                              className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-church-blue hover:bg-church-blue hover:text-white transition-all"
                            >
                              {copied === m.id ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                            </button>
                          </div>
                          <p className="text-[9px] font-black text-church-blue mt-4 uppercase tracking-[0.2em] text-center">
                            Merci pour votre fidélité & votre soutien
                          </p>
                        </motion.div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                    <p className="text-xs font-black text-slate-300 uppercase tracking-widest">
                      Aucune méthode de paiement configurée
                    </p>
                  </div>
                )}
             </div>
             
             <div className="mt-12 p-6 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <CheckCircle2 size={12} />
                  Information de Sécurité
                </p>
                <p className="text-xs text-amber-900/60 font-medium leading-relaxed">
                  Vérifiez toujours le nom qui s'affiche lors de la transaction pour vous assurer que vous envoyez au bon compte CDD.
                </p>
             </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
