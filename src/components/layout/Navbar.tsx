import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Church, BookOpenCheck, Tv, User, Heart, Mic2, Landmark, Video, BookOpen, MessageSquare, Send, LayoutDashboard, Search, Users, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useSiteConfig } from '../../hooks/useSiteConfig';
import GlobalSearch from './GlobalSearch';

const navLinks = [
  { name: 'Accueil', href: '/', icon: Church },
  { name: 'À Propos', href: '/a-propos', icon: BookOpenCheck },
  { name: 'Direct', href: '/direct', icon: Tv },
  { name: 'Ministères', href: '/ministeres', icon: Landmark },
  { name: 'Prédications', href: '/predications', icon: Mic2 },
  { name: 'Dons', href: '/dons', icon: Heart },
  { name: 'Contact', href: '/contact', icon: Send },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isModerator, user } = useAuth();
  const { config } = useSiteConfig();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const churchName = config?.identity?.name || "Camp de Dieu";
  const churchDescription = config?.identity?.description || "Ministère International • Kinshasa";
  const logoText = churchName.split(' ').map(word => word[0]).join('').slice(0, 3).toUpperCase();

  return (
    <nav className={cn(
      "fixed top-0 w-full z-40 transition-all duration-300",
      scrolled || location.pathname !== '/' 
        ? "bg-white border-b border-church-border shadow-sm py-3" 
        : "bg-white/10 backdrop-blur-md border-b border-white/10 py-4"
    )}>
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-church-blue rounded-full flex items-center justify-center overflow-hidden shadow-lg border-2 border-church-gold relative group">
              {config?.identity?.logoUrl ? (
                <img 
                  src={config.identity.logoUrl} 
                  alt={churchName} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-white font-bold text-xl uppercase">{logoText || "CDD"}</span>
              )}
            </div>
            <div className="hidden sm:block">
              <h1 className={cn(
                "text-lg font-display font-black leading-none uppercase tracking-wider",
                scrolled || location.pathname !== '/' ? "text-church-dark" : "text-white"
              )}>
                {churchName}
              </h1>
              <p className="text-[9px] text-church-gold font-bold tracking-widest uppercase">
                {churchDescription}
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => setIsSearchOpen(true)}
              className={cn(
                "p-2 rounded-xl transition-all flex items-center gap-2 group",
                scrolled || location.pathname !== '/' ? "text-slate-400 hover:text-church-blue hover:bg-slate-50" : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <Search size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Rechercher</span>
            </button>

            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "group relative px-4 py-2 rounded-xl transition-all duration-300",
                  location.pathname === link.href 
                    ? scrolled || location.pathname !== '/' 
                      ? "bg-church-blue text-white shadow-lg shadow-church-blue/20" 
                      : "bg-white text-church-blue shadow-lg shadow-black/10"
                    : scrolled || location.pathname !== '/'
                      ? "hover:bg-church-blue/5 text-slate-600 hover:text-church-blue"
                      : "hover:bg-white/10 text-white/90 hover:text-white"
                )}
              >
                <div className="flex items-center gap-2">
                  <link.icon 
                    size={16} 
                    className={cn(
                      "transition-all duration-300 group-hover:scale-110",
                      location.pathname === link.href 
                        ? scrolled || location.pathname !== '/' ? "text-white" : "text-church-blue"
                        : scrolled || location.pathname !== '/' ? "text-slate-400 group-hover:text-church-blue" : "text-white/60 group-hover:text-church-gold"
                    )} 
                  />
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest transition-colors",
                    location.pathname === link.href 
                      ? scrolled || location.pathname !== '/' ? "text-white" : "text-church-blue"
                      : "inherit"
                  )}>
                    {link.name}
                  </span>
                </div>
                {location.pathname === link.href && (
                  <motion.div 
                    layoutId="nav-pill"
                    className="absolute -bottom-1 left-3 right-3 h-0.5 bg-church-blue rounded-full"
                  />
                )}
              </Link>
            ))}
            
            {isModerator && (
              <Link
                to="/admin"
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-widest flex items-center gap-2",
                  location.pathname.startsWith('/admin')
                    ? scrolled || location.pathname !== '/' ? "bg-church-accent text-church-dark shadow-lg shadow-church-accent/20" : "bg-white text-church-accent shadow-lg shadow-black/10"
                    : scrolled || location.pathname !== '/' ? "text-slate-600 hover:text-church-accent hover:bg-church-accent/5" : "text-white/90 hover:text-church-accent hover:bg-white/10"
                )}
              >
                <LayoutDashboard size={14} />
                Admin
              </Link>
            )}

            <Link 
              to="/membre"
              className={cn(
                "px-5 py-2 rounded-full border-2 text-xs font-black transition-all uppercase tracking-widest flex items-center gap-2",
                scrolled || location.pathname !== '/'
                  ? "border-church-blue text-church-blue hover:bg-church-blue hover:text-white"
                  : "border-white text-white hover:bg-white hover:text-church-blue"
              )}
            >
              <User size={14} />
              {user ? 'Mon Espace' : 'Espace Membre'}
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className={cn(
                "p-2",
                scrolled || location.pathname !== '/' ? "text-church-blue" : "text-white"
              )}
            >
              <Search size={24} />
            </button>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "p-2 rounded-md",
                scrolled || location.pathname !== '/' ? "text-church-blue" : "text-white"
              )}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-church-dark/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[80%] max-w-sm bg-white z-50 md:hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-church-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-church-blue rounded-lg flex items-center justify-center">
                    <Church size={16} className="text-white" />
                  </div>
                  <span className="font-display font-black text-xs uppercase tracking-widest text-church-dark">Menu</span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-church-blue transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Search Bar Mobile */}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsSearchOpen(true);
                  }}
                  className="w-full flex items-center gap-3 p-4 bg-slate-50 border border-church-border rounded-2xl text-slate-400 hover:text-church-blue transition-all"
                >
                  <Search size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">Rechercher...</span>
                </button>

                <div className="space-y-1">
                  <p className="px-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3">Navigation Principale</p>
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center space-x-4 p-4 rounded-2xl transition-all",
                        location.pathname === link.href 
                          ? "bg-church-blue text-white shadow-lg shadow-church-blue/20" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-church-blue"
                      )}
                    >
                      <link.icon size={20} className={location.pathname === link.href ? "text-white" : "text-church-blue"} />
                      <span className="font-display font-black text-xs uppercase tracking-widest">{link.name}</span>
                    </Link>
                  ))}
                </div>
                
                {isModerator && (
                  <div className="pt-4 space-y-1">
                    <p className="px-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3">Administration</p>
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-4 p-4 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100"
                    >
                      <LayoutDashboard size={20} />
                      <span className="font-display font-black text-xs uppercase tracking-widest">Tableau de Bord</span>
                    </Link>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-church-border">
                <Link
                  to="/membre"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between w-full p-5 bg-church-dark text-white rounded-2xl shadow-xl hover:bg-church-blue transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-0.5">Espace Connecté</p>
                      <span className="text-xs font-black uppercase tracking-widest">{user ? 'Mon Profil' : 'Se Connecter'}</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-white/30 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
