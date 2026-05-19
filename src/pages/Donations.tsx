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
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Airtel_logo.svg/1024px-Airtel_logo.svg.png', 
      color: 'bg-red-600', 
      number: config?.mobileMoney.airtelMoney 
    },
    { 
      id: 'mpesa', 
      name: 'M-Pesa / Vodacom', 
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/M-Pesa_Logo.svg/1200px-M-Pesa_Logo.svg.png', 
      color: 'bg-green-600', 
      number: config?.mobileMoney.mpesa 
    },
    { 
      id: 'moneygram', 
      name: 'MoneyGram', 
      icon: 'https://seeklogo.com/images/M/moneygram-logo-F1B3E0A5B7-seeklogo.com.png', 
      color: 'bg-red-700', 
      number: config?.mobileMoney.moneygram 
    },
    { 
      id: 'western', 
      name: 'Western Union', 
      icon: 'https://seeklogo.com/images/W/western-union-logo-4D04C06F95-seeklogo.com.png', 
      color: 'bg-yellow-500', 
      number: config?.mobileMoney.westernUnion 
    },
  ].filter(m => m.number);

  const handleCopy = (num: string, id: string) => {
    navigator.clipboard.writeText(num);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="pt-32 pb-20 bg-church-bg dark:bg-dark-bg min-h-screen transition-colors duration-300">
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
            <h1 className="text-4xl md:text-6xl font-display font-black text-church-dark dark:text-white mb-8">Soutenir l'Œuvre de Dieu</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg mb-12 font-medium">
              Chaque don, petit ou grand, contribue à propager l'Évangile, à soutenir nos départements et à aider les plus démunis de notre communauté. Vos offrandes font une différence éternelle.
            </p>
            
            <div className="space-y-6">
              <div className="bg-white dark:bg-dark-card p-8 rounded-[32px] border border-church-border dark:border-dark-border shadow-sm">
                <div className="flex items-center space-x-3 text-church-blue mb-4">
                  <Heart size={24} className="fill-current" />
                  <h3 className="font-black text-lg uppercase tracking-tight dark:text-white">Offrande Générale</h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">Pour le fonctionnement quotidien de l'église et les besoins courants.</p>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-church-gold w-3/4"></div>
                </div>
              </div>

              <div className="bg-church-dark dark:bg-dark-card p-8 rounded-[32px] shadow-xl relative overflow-hidden border dark:border-dark-border">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="flex items-center space-x-3 text-church-gold mb-4 relative z-10">
                  <Users size={24} />
                  <h3 className="font-black text-lg uppercase tracking-tight">Projet Construction</h3>
                </div>
                <p className="text-sm text-white/60 dark:text-slate-400 mb-6 font-medium relative z-10">Aidez-nous à bâtir notre nouveau sanctuaire pour la gloire de Dieu.</p>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 relative z-10">
                  <span>Progression</span>
                  <span>45%</span>
                </div>
                <div className="h-2 bg-white/10 dark:bg-slate-800 rounded-full overflow-hidden relative z-10">
                  <div className="h-full bg-church-blue w-[45%]"></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Donation Form */}
          <motion.div
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="bg-white dark:bg-dark-card border border-church-border dark:border-dark-border rounded-[40px] shadow-2xl p-8 md:p-12"
          >
             <h2 className="text-2xl font-black text-church-dark dark:text-white mb-8 flex items-center space-x-3 uppercase tracking-tight">
               <Smartphone className="text-church-blue" />
               <span>Dons Directs (Mobile)</span>
             </h2>

             <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mb-8 leading-relaxed uppercase tracking-widest">
               Sélectionnez un opérateur pour voir le numéro et effectuer votre transfert direct.
             </p>

             <div className="space-y-6">
                {paymentMethods.length > 0 ? (
                  paymentMethods.map(m => (
                    <div 
                      key={m.id}
                      className={cn(
                        "group p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden",
                        selectedMethod === m.id ? "border-church-blue bg-blue-50 dark:bg-blue-900/10" : "border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-100 dark:hover:border-slate-700"
                      )}
                      onClick={() => setSelectedMethod(m.id)}
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-3 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                             <img src={m.icon} alt={m.name} className="max-w-full max-h-full object-contain" />
                          </div>
                          <div>
                            <span className="block font-black text-church-dark dark:text-white uppercase tracking-tight">{m.name}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">{m.id === 'mpesa' ? 'Vodacom' : 'RDC'}</span>
                          </div>
                        </div>
                        <div className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                          selectedMethod === m.id ? "border-church-blue bg-white dark:bg-dark-card" : "border-slate-300 dark:border-slate-700"
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
                          <div className="flex items-center justify-between bg-white dark:bg-dark-bg p-4 rounded-xl border border-church-blue/20">
                            <div>
                              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Numéro du Bénéficiaire</p>
                              <p className="text-lg font-black text-church-blue font-mono">{m.number}</p>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(m.number || '', m.id);
                              }}
                              className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-church-blue hover:bg-church-blue hover:text-white transition-all"
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
                  <div className="p-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                    <p className="text-xs font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">
                      Aucune méthode de paiement configurée
                    </p>
                  </div>
                )}
             </div>
             
             <div className="mt-12 p-8 bg-slate-50 dark:bg-slate-800/50 border border-church-border dark:border-dark-border rounded-[40px]">
                <h2 className="text-2xl font-black text-church-dark dark:text-white mb-8 flex items-center space-x-3 uppercase tracking-tight">
                  <Heart className="text-church-blue" />
                  <span>Virement Bancaire</span>
                </h2>
                {config?.banking?.accountNumber ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-border">
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Banque</p>
                        <p className="font-black text-church-dark dark:text-white">{config.banking.bankName}</p>
                      </div>
                      <div className="p-4 bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-border">
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Nom du compte</p>
                        <p className="font-black text-church-dark dark:text-white">{config.banking.accountName}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-border flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Numéro de compte</p>
                        <p className="font-mono font-black text-church-blue text-lg">{config.banking.accountNumber}</p>
                      </div>
                      <button onClick={() => handleCopy(config.banking?.accountNumber || '', 'bank')} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-church-blue hover:bg-church-blue hover:text-white transition-all">
                        {copied === 'bank' ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                    {config.banking.iban && (
                       <div className="p-4 bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-border flex justify-between items-center">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">IBAN</p>
                          <p className="font-mono font-black text-church-dark dark:text-white text-sm">{config.banking.iban}</p>
                        </div>
                        <button onClick={() => handleCopy(config.banking?.iban || '', 'iban')} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-church-blue hover:bg-church-blue hover:text-white transition-all">
                          {copied === 'iban' ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                        </button>
                      </div>
                    )}
                    {config.banking.swift && (
                       <div className="p-4 bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-border flex justify-between items-center">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">SWIFT / BIC</p>
                          <p className="font-mono font-black text-church-dark dark:text-white text-sm">{config.banking.swift}</p>
                        </div>
                        <button onClick={() => handleCopy(config.banking?.swift || '', 'swift')} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-church-blue hover:bg-church-blue hover:text-white transition-all">
                          {copied === 'swift' ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-xs font-bold text-slate-400 dark:text-slate-500 py-6 uppercase tracking-widest">Coordonnées bancaires bientôt disponible</p>
                )}
             </div>

             <div className="mt-12 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                <p className="text-[10px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <CheckCircle2 size={12} />
                  Information de Sécurité
                </p>
                <p className="text-xs text-amber-900/60 dark:text-amber-500/60 font-medium leading-relaxed">
                  Vérifiez toujours le nom qui s'affiche lors de la transaction pour vous assurer que vous envoyez au bon compte CDD.
                </p>
             </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
