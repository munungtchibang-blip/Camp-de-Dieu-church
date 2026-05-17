import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Church, BookOpenCheck, Tv, User, Heart, Mic2, Landmark, Video, BookOpen, MessageSquare, Send, LayoutDashboard, Search, Users, Sparkles } from 'lucide-react';
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
            <div className="w-12 h-12 bg-church-blue rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-church-gold uppercase">
              {logoText || "CDD"}
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

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <link.icon size={20} className="text-church-blue" />
                  <span className="font-medium">{link.name}</span>
                </Link>
              ))}
              
              {isModerator && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 p-3 rounded-lg text-church-accent hover:bg-amber-50 transition-colors"
                >
                  <LayoutDashboard size={20} />
                  <span className="font-medium">Administration</span>
                </Link>
              )}

              <Link
                to="/membre"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 p-3 rounded-lg bg-church-blue text-white"
              >
                <User size={20} />
                <span className="font-medium">{user ? 'Mon Espace' : 'Espace Membre'}</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
