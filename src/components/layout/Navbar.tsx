import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Church, BookOpenCheck, Tv, User, Heart, Mic2, Landmark, 
  Video, BookOpen, MessageSquare, Send, LayoutDashboard, Search, 
  Users, Sparkles, ChevronRight, Calendar, ChevronDown, 
  Info, Image, CalendarDays, Radio, Handshake, Users2, Baby, 
  HelpingHand, GraduationCap, Music3, HelpCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useSiteConfig } from '../../hooks/useSiteConfig';
import GlobalSearch from './GlobalSearch';
import ThemeToggle from './ThemeToggle';

const navigation = [
  {
    name: 'L\'Église',
    icon: Church,
    links: [
      { name: 'Accueil', href: '/', icon: Church, description: 'Bienvenue au Camp de Dieu' },
      { name: 'Notre Vision', href: '/a-propos', icon: Info, description: 'Qui nous sommes et ce que nous croyons' },
      { name: 'Calendrier', href: '/programmes', icon: CalendarDays, description: 'Cultes et événements à venir' },
      { name: 'Galerie', href: '/galerie', icon: Image, description: 'Vivez nos moments en images' },
    ]
  },
  {
    name: 'Ministères',
    href: '/ministeres',
    icon: Landmark,
    links: [
      { name: 'Tous les Ministères', href: '/ministeres', icon: Users2, description: 'Découvrez nos pôles d\'action' },
      { name: 'Jeunesse', href: '/ministeres#jeunesse', icon: GraduationCap, description: 'Bâtir la génération de demain' },
      { name: 'Louange', href: '/ministeres#louange', icon: Music3, description: 'Adorer Dieu en esprit et en vérité' },
      { name: 'Enfants', href: '/ministeres#enfants', icon: Baby, description: 'L\'Éducation chrétienne dès le bas âge' },
    ]
  },
  {
    name: 'Médias',
    icon: Video,
    links: [
      { name: 'Prédications', href: '/predications', icon: Mic2, description: 'Revivez nos messages inspirants' },
      { name: 'Plateau Direct', href: '/direct', icon: Radio, description: 'Suivez-nous en temps réel' },
      { name: 'Annonces', href: '/annonces', icon: Tv, description: 'Dernières nouvelles de la communauté' },
    ]
  },
  {
    name: 'Contact',
    icon: Send,
    links: [
      { name: 'Nous Contacter', href: '/contact', icon: Send, description: 'Informations et Localisation' },
      { name: 'Requêtes de Prière', href: '/priere', icon: HelpCircle, description: 'Nous prions avec vous' },
      { name: 'Rendez-vous', href: '/rendez-vous', icon: Calendar, description: 'Échangez avec un responsable' },
      { name: 'Soutien & Dons', href: '/dons', icon: Heart, description: 'Participez à l\'œuvre du Seigneur' },
    ]
  }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
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
        setActiveDropdown(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close dropdown and mobile menu on any location or hash change
  useEffect(() => {
    setActiveDropdown(null);
    setIsOpen(false);
  }, [location.pathname, location.search, location.hash]);

  // Lock background body scroll when mobile menu is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const churchName = config?.identity?.name || "Camp de Dieu";
  const churchDescription = config?.identity?.description || "Ministère International • Kinshasa";
  const logoText = churchName.split(' ').map(word => word[0]).join('').slice(0, 3).toUpperCase();

  return (
    <>
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <nav className={cn(
        "fixed top-0 w-full z-40 transition-all duration-500",
      scrolled || location.pathname !== '/' 
        ? "bg-white dark:bg-dark-bg border-b border-church-border dark:border-dark-border shadow-md py-2" 
        : "bg-white/10 dark:bg-black/20 backdrop-blur-md border-b border-white/10 dark:border-white/5 py-4"
    )}>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-4 lg:space-x-6 group">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
              className={cn(
              "bg-church-blue rounded-full flex items-center justify-center overflow-hidden shadow-2xl border-2 border-church-gold relative transition-all duration-700 ease-in-out",
              scrolled || location.pathname !== '/' ? "w-12 h-12 lg:w-14 lg:h-14" : "w-14 h-14 md:w-20 md:h-20 lg:w-28 lg:h-28"
            )}>
              {config?.identity?.logoUrl ? (
                <img 
                  src={config.identity.logoUrl} 
                  alt={churchName} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className={cn(
                  "text-white font-bold uppercase transition-all duration-500",
                  scrolled || location.pathname !== '/' ? "text-sm lg:text-base" : "text-lg lg:text-xl"
                )}>{logoText || "CDD"}</span>
              )}
            </motion.div>
            <div className="hidden sm:block">
              <h1 className={cn(
                "font-display font-black leading-none uppercase tracking-wider transition-all duration-500",
                scrolled || location.pathname !== '/' 
                  ? "text-base lg:text-lg text-church-dark dark:text-white" 
                  : "text-lg lg:text-2xl text-white"
              )}>
                {churchName}
              </h1>
              <p className={cn(
                "font-bold tracking-widest uppercase transition-all duration-500",
                scrolled || location.pathname !== '/' 
                  ? "text-[7px] lg:text-[9px] text-church-gold" 
                  : "text-[8px] lg:text-xs text-church-gold/80"
              )}>
                {churchDescription}
              </p>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className={cn(
                "p-2 rounded-xl transition-all flex items-center gap-2 group",
                scrolled || location.pathname !== '/' ? "text-slate-400 dark:text-slate-500 hover:text-church-blue hover:bg-slate-50 dark:hover:bg-slate-800" : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <Search size={18} />
            </button>

            <ThemeToggle scrolled={scrolled} />

            {navigation.map((section) => (
              <div 
                key={section.name}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(section.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                    activeDropdown === section.name
                      ? scrolled || location.pathname !== '/' 
                        ? "bg-slate-50 dark:bg-slate-800 text-church-blue" 
                        : "bg-white/10 text-white"
                      : scrolled || location.pathname !== '/'
                        ? "text-slate-600 dark:text-slate-300 hover:text-church-blue hover:bg-slate-50 dark:hover:bg-slate-800"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                  )}
                >
                  {section.name}
                  <ChevronDown size={14} className={cn("transition-transform duration-300", activeDropdown === section.name ? "rotate-180" : "")} />
                </button>

                <AnimatePresence>
                  {activeDropdown === section.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "absolute top-full left-0 mt-2 bg-white dark:bg-dark-card rounded-3xl border border-church-border dark:border-dark-border shadow-2xl z-50 overflow-hidden",
                        section.links.length > 3 ? "w-[600px]" : "w-72"
                      )}
                    >
                      <div className={cn(
                        "p-6",
                        section.links.length > 3 ? "grid grid-cols-2 gap-x-8 gap-y-2" : "space-y-1"
                      )}>
                        {section.links.map((link) => {
                          const isHashLink = link.href.includes('#');
                          const className = "flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group/item";
                          const content = (
                            <>
                              <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover/item:text-church-blue group-hover/item:bg-church-blue/5 transition-all">
                                <link.icon size={18} />
                              </div>
                              <div className="flex-1">
                                <p className="text-[11px] font-black text-church-dark dark:text-white uppercase tracking-tight mb-0.5">{link.name}</p>
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium leading-tight">{link.description}</p>
                              </div>
                            </>
                          );

                          return isHashLink ? (
                            <HashLink key={link.name} to={link.href} smooth className={className}>
                              {content}
                            </HashLink>
                          ) : (
                            <Link key={link.name} to={link.href} className={className}>
                              {content}
                            </Link>
                          );
                        })}
                      </div>
                      
                      {section.href && (
                        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-church-border dark:border-dark-border">
                          <Link 
                            to={section.href}
                            className="flex items-center justify-center gap-2 py-3 bg-church-blue/5 dark:bg-church-blue/10 text-church-blue text-[9px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-church-blue hover:text-white transition-all w-full"
                          >
                            Explorer la section {section.name}
                            <ChevronRight size={12} />
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            
            <div className="flex items-center gap-2 pl-4 border-l border-church-border dark:border-dark-border">
              {isModerator && (
                <Link
                  to="/admin"
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest flex items-center gap-2",
                    location.pathname.startsWith('/admin')
                      ? "bg-church-accent text-church-dark shadow-lg shadow-church-accent/20" 
                      : scrolled || location.pathname !== '/' ? "text-slate-600 dark:text-slate-300 hover:text-church-accent hover:bg-church-accent/5" : "text-white/90 hover:text-church-accent hover:bg-white/10"
                  )}
                >
                  <LayoutDashboard size={14} />
                  Admin
                </Link>
              )}

              <Link 
                to="/membre"
                className={cn(
                  "px-4 py-2 rounded-full border-2 text-[10px] font-black transition-all uppercase tracking-widest flex items-center gap-2",
                  scrolled || location.pathname !== '/'
                    ? "border-church-blue text-church-blue hover:bg-church-blue hover:text-white"
                    : "border-white text-white hover:bg-white hover:text-church-blue"
                )}
              >
                <User size={14} />
                {user ? 'Mon Profil' : 'Espace Membre'}
              </Link>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className={cn(
                "p-2",
                scrolled || location.pathname !== '/' ? "text-church-blue dark:text-white" : "text-white"
              )}
            >
              <Search size={24} />
            </button>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "p-2 rounded-xl transition-all relative overflow-hidden",
                scrolled || location.pathname !== '/' 
                  ? "text-church-blue dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800" 
                  : "text-white hover:bg-white/10"
              )}
            >
              <motion.div
                animate={isOpen ? "open" : "closed"}
                initial={false}
                className="w-7 h-7 flex flex-col justify-center items-center gap-1.5"
              >
                <motion.span
                  variants={{
                    closed: { rotate: 0, y: 0 },
                    open: { rotate: 45, y: 8 }
                  }}
                  className="w-full h-0.5 bg-current rounded-full"
                />
                <motion.span
                  variants={{
                    closed: { opacity: 1, x: 0 },
                    open: { opacity: 0, x: 20 }
                  }}
                  className="w-full h-0.5 bg-current rounded-full"
                />
                <motion.span
                  variants={{
                    closed: { rotate: 0, y: 0 },
                    open: { rotate: -45, y: -8 }
                  }}
                  className="w-full h-0.5 bg-current rounded-full"
                />
              </motion.div>
            </button>
          </div>
        </div>
      </div>
    </nav>

    {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-church-dark/60 dark:bg-black/80 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-white dark:bg-dark-bg z-50 md:hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-church-border dark:border-dark-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-church-blue rounded-lg flex items-center justify-center">
                    <Church size={16} className="text-white" />
                  </div>
                  <span className="font-display font-black text-xs uppercase tracking-widest text-church-dark dark:text-white">Navigation</span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-church-blue transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-4"
                >
                  <ThemeToggle isInsideMobileMenu />
                </motion.div>

                <div className="space-y-8">
                  {navigation.map((section, idx) => (
                    <motion.div 
                      key={section.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + idx * 0.1 }}
                    >
                      <p className="px-4 text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <section.icon size={12} className="text-church-blue" />
                        {section.name}
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {section.links.map((link) => {
                          const isHashLink = link.href.includes('#');
                          const className = cn(
                            "flex items-center gap-4 p-4 rounded-2xl transition-all border border-transparent",
                            location.pathname === link.href 
                              ? "bg-church-blue text-white shadow-lg shadow-church-blue/20" 
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-church-blue hover:border-church-border dark:hover:border-dark-border"
                          );
                          const content = (
                            <>
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                location.pathname === link.href ? "bg-white/20" : "bg-slate-50 dark:bg-slate-800"
                              )}>
                                <link.icon size={20} className={location.pathname === link.href ? "text-white" : "text-church-blue"} />
                              </div>
                              <span className="font-display font-black text-xs uppercase tracking-widest">{link.name}</span>
                            </>
                          );

                          return isHashLink ? (
                            <HashLink
                              key={link.name}
                              to={link.href}
                              smooth
                              onClick={() => setIsOpen(false)}
                              className={className}
                            >
                              {content}
                            </HashLink>
                          ) : (
                            <Link
                              key={link.name}
                              to={link.href}
                              onClick={() => setIsOpen(false)}
                              className={className}
                            >
                              {content}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="p-6 border-t border-church-border dark:border-dark-border space-y-4 bg-slate-50/50 dark:bg-slate-900/30"
              >
                {isModerator && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800"
                  >
                    <LayoutDashboard size={20} />
                    <span className="font-display font-black text-xs uppercase tracking-widest">Tableau de Bord</span>
                  </Link>
                )}
                
                <Link
                  to="/membre"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between w-full p-4 bg-church-dark dark:bg-slate-800 text-white rounded-2xl shadow-xl hover:bg-church-blue transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <User size={20} className="text-church-gold" />
                    <span className="text-xs font-black uppercase tracking-widest">{user ? 'Mon Profil' : 'Mon Espace'}</span>
                  </div>
                  <ChevronRight size={18} className="text-white/30 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
