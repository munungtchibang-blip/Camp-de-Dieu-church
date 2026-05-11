import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Facebook, Youtube, Instagram, MessageSquare, Megaphone, Twitter, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import VerseOfTheDay from '../components/ai/VerseOfTheDay';
import NewsFeed from '../components/news/NewsFeed';
import { useSiteConfig } from '../hooks/useSiteConfig';

export default function Home() {
  const { config, loading } = useSiteConfig();
  const [randomImage, setRandomImage] = useState<string>('');

  useEffect(() => {
    if (config?.hero?.imageUrls && config.hero.imageUrls.length > 0) {
      const urls = config.hero.imageUrls;
      const randomIdx = Math.floor(Math.random() * urls.length);
      setRandomImage(urls[randomIdx]);
    } else if (config?.hero?.imageUrl) {
      setRandomImage(config.hero.imageUrl);
    } else {
      setRandomImage("https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=1600&auto=format&fit=crop");
    }
  }, [config]);

  // Fallback data if config is not yet loaded or doesn't exist
  const hero = config?.hero || {
    title: "Une Demeure de Paix & Puissance",
    subtitle: "Rejoignez-nous chaque dimanche pour une expérience spirituelle transformatrice au cœur de Kinshasa.",
    imageUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=1600&auto=format&fit=crop"
  };

  const identity = config?.identity || {
    name: "CDD Kinshasa",
    address: "Limete, 1ère Rue • Kinshasa, RDC",
    email: "contact@cdd-kin.org",
    phone: "+243 81 000 0000"
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Verse of the Day Bar */}
      <div className="bg-gradient-to-r from-church-dark to-blue-900 py-3 mt-[72px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-white text-xs">
          <div className="w-full">
            <VerseOfTheDay />
          </div>
        </div>
      </div>

      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Left: Hero & News Section */}
        <div className="w-full lg:w-2/3 flex flex-col">
          <div className="relative min-h-[500px] flex items-center px-6 md:px-20 group overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
              style={{ backgroundImage: `url('${randomImage || hero.imageUrl}')` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-church-dark/95 via-church-dark/50 to-transparent"></div>
            
            <div className="relative z-10 max-w-xl py-20">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="bg-church-gold h-1.5 w-24 mb-6"></div>
                <h2 className="text-4xl md:text-6xl font-display font-black text-white leading-[1.1] mb-6">
                  {hero.title.split('\n').map((line, i) => (
                    <span key={i}>{line}<br/></span>
                  ))}
                </h2>
                <p className="text-lg md:text-xl text-blue-50/80 mb-10 font-light leading-relaxed">
                  {hero.subtitle}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link 
                    to="/direct"
                    className="px-8 py-4 bg-church-accent text-church-dark font-black rounded shadow-2xl hover:bg-church-gold transition-all uppercase text-xs tracking-widest"
                  >
                    Suivre le culte en direct
                  </Link>
                  <Link 
                    to="/programmes"
                    className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-black rounded hover:bg-white/20 transition-all uppercase text-xs tracking-widest"
                  >
                    Voir le Programme
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>

          {/* News Feed Section */}
          <div className="p-8 md:p-20 bg-white border-b border-church-border">
            <div className="max-w-4xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-church-dark uppercase tracking-tight flex items-center gap-2">
                  <Megaphone className="text-church-blue" size={20} />
                  Annonces Récentes
                </h3>
                <Link to="/annonces" className="text-[10px] font-black text-church-blue uppercase tracking-widest hover:underline">Voir tout →</Link>
              </div>
              <NewsFeed maxItems={3} />
            </div>
          </div>
        </div>

        {/* Right Panel: Info & Quick Actions */}
        <div className="w-full lg:w-1/3 flex flex-col bg-white border-l border-church-border">
          {/* Worship Schedule Card */}
          <div className="p-8 md:p-12 border-b border-church-border">
            <h3 className="text-church-dark font-black text-lg mb-8 flex items-center gap-2 uppercase tracking-tight">
              <Calendar className="w-5 h-5 text-church-accent" />
              Prochainement
            </h3>
            <div className="space-y-4">
              <Link to="/programmes" className="block p-4 rounded-xl bg-blue-50 border border-blue-100 shadow-sm hover:shadow-md transition-all">
                <p className="text-[10px] font-black text-church-blue uppercase tracking-widest mb-1">Culte de Célébration</p>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold text-church-dark">Tous les Dimanches</p>
                  <p className="text-xl font-black text-church-dark">09:00</p>
                </div>
              </Link>
              <Link to="/programmes" className="block p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Intercession & Enseignement</p>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold text-slate-600">Tous les Mercredis</p>
                  <p className="text-xl font-black text-slate-300">17:30</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Donation Section */}
          <div className="flex-1 p-8 md:p-12 bg-slate-50">
            <h3 className="text-church-dark font-black text-lg mb-4 uppercase tracking-tighter">Dons & Libéralités</h3>
            <p className="text-xs text-slate-500 mb-8 leading-relaxed">
              Soutenez l'œuvre de Dieu par vos offrandes via nos partenaires locaux. Vos dons contribuent à l'expansion du Royaume.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {config?.mobileMoney?.orangeMoney && (
                <div className="bg-white border border-church-border p-5 rounded-3xl flex flex-col items-center gap-3 hover:shadow-md transition-all group overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-[#FF7900]"></div>
                  <div className="w-12 h-12 bg-[#FF7900] rounded-2xl flex items-center justify-center p-2 shadow-sm">
                    <span className="text-white font-black text-xs">OM</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Orange Money</span>
                    <span className="text-sm font-black text-church-dark">{config.mobileMoney.orangeMoney}</span>
                  </div>
                </div>
              )}
              {config?.mobileMoney?.airtelMoney && (
                <div className="bg-white border border-church-border p-5 rounded-3xl flex flex-col items-center gap-3 hover:shadow-md transition-all group overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-[#E40000]"></div>
                  <div className="w-12 h-12 bg-[#E40000] rounded-2xl flex items-center justify-center p-2 shadow-sm">
                    <span className="text-white font-black text-xs">AM</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Airtel Money</span>
                    <span className="text-sm font-black text-church-dark">{config.mobileMoney.airtelMoney}</span>
                  </div>
                </div>
              )}
              {config?.mobileMoney?.mpesa && (
                <div className="bg-white border border-church-border p-5 rounded-3xl flex flex-col items-center gap-3 hover:shadow-md transition-all group overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-[#E60000]"></div>
                  <div className="w-12 h-12 bg-[#E60000] rounded-2xl flex items-center justify-center p-2 shadow-sm">
                    <span className="text-white font-black text-xs">M-Pesa</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Vodacom M-Pesa</span>
                    <span className="text-sm font-black text-church-dark">{config.mobileMoney.mpesa}</span>
                  </div>
                </div>
              )}
            </div>
            
            <Link 
              to="/dons"
              className="w-full inline-block text-center py-5 bg-church-dark text-white rounded font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-church-blue transition-all"
            >
              Faire un don
            </Link>
          </div>
        </div>
      </main>

      {/* Features Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white border-t border-church-border p-8 md:p-12 overflow-x-auto"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 min-w-max md:min-w-0">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 flex-1"
          >
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shadow-sm">
              <MessageSquare size={24} />
            </div>
            <div>
              <h4 className="text-xs font-black text-church-dark uppercase tracking-widest mb-1">Requête de Prière</h4>
              <p className="text-[10px] text-slate-500 max-w-[200px]">Besoin de soutien ? Écrivez-nous en toute confidentialité.</p>
              <Link to="/priere" className="text-[9px] font-black text-church-blue uppercase tracking-widest mt-2 block hover:underline">Accéder au formulaire →</Link>
            </div>
          </motion.div>
          
          <div className="hidden md:block h-12 w-[1px] bg-church-border"></div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 flex-1"
          >
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-church-blue shadow-sm">
              <Calendar size={24} />
            </div>
            <div>
              <h4 className="text-xs font-black text-church-dark uppercase tracking-widest mb-1">Prendre Rendez-vous</h4>
              <p className="text-[10px] text-slate-500 max-w-[200px]">Consultez un pasteur pour une orientation spirituelle.</p>
              <Link to="/rendez-vous" className="text-[9px] font-black text-church-blue uppercase tracking-widest mt-2 block hover:underline">Réserver un créneau →</Link>
            </div>
          </motion.div>

          <div className="hidden md:block h-12 w-[1px] bg-church-border"></div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="flex-1 flex flex-col items-center md:items-end"
          >
            <div className="flex gap-3">
              {config?.socials?.facebook && (
                <a href={config.socials.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-church-blue hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100">
                  <Facebook size={18} />
                </a>
              )}
              {config?.socials?.youtube && (
                <a href={config.socials.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-church-blue hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100">
                  <Youtube size={18} />
                </a>
              )}
              {config?.socials?.instagram && (
                <a href={config.socials.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-church-blue hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100">
                  <Instagram size={18} />
                </a>
              )}
            </div>
            <p className="text-[9px] text-slate-400 mt-3 uppercase font-black tracking-widest">{identity.address}</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

