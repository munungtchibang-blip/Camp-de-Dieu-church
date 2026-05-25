import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { User, ShieldCheck, Mail, ArrowRight, LogIn, LogOut, Loader2, Sparkles, Calendar, MessageSquare, Clock, CheckCircle2, Heart, HelpCircle, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function MemberSpace() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Dashboard data
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prayers, setPrayers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    setLoadingData(true);
    
    // Fetch apps
    const qAppts = query(
      collection(db, 'appointments'),
      where('userEmail', '==', user.email),
      orderBy('createdAt', 'desc')
    );
    const unsubAppts = onSnapshot(qAppts, (snap) => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Fetch prayers
    const qPrayers = query(
      collection(db, 'prayer_requests'),
      where('email', '==', user.email),
      orderBy('createdAt', 'desc')
    );
    const unsubPrayers = onSnapshot(qPrayers, (snap) => {
      setPrayers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Fetch contacts
    const qContacts = query(
      collection(db, 'contacts'),
      where('email', '==', user.email),
      orderBy('createdAt', 'desc')
    );
    const unsubContacts = onSnapshot(qContacts, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingData(false);
    });

    return () => {
      unsubAppts();
      unsubPrayers();
      unsubContacts();
    };
  }, [user]);

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    setLoginError(null);
    const provider = new GoogleAuthProvider();
    
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login failed:", error);
      if (error.code === 'auth/popup-blocked') {
        setLoginError("Le popup a été bloqué par votre navigateur. Veuillez autoriser les popups pour ce site.");
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Just reset, user likely closed the window
      } else if (error.code === 'auth/unauthorized-domain') {
        setLoginError("Ce domaine n'est pas autorisé dans la console Firebase. Veuillez ajouter votre URL Netlify aux 'Domaines autorisés' dans Authentication > Paramètres.");
      } else if (error.code === 'auth/operation-not-allowed') {
        setLoginError("La connexion Google n'est pas activée dans votre console Firebase.");
      } else {
        setLoginError(`Erreur: ${error.message || "Une erreur est survenue lors de la connexion. Veuillez réessayer."}`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-church-bg flex items-center justify-center">
        <Loader2 className="animate-spin text-church-blue" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-church-bg dark:bg-dark-bg flex items-center justify-center transition-colors duration-300">
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side: Branding & Info */}
        <div className="hidden lg:block space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-church-gold h-1.5 w-24 mb-8"></div>
            <h1 className="text-5xl font-display font-black text-church-dark dark:text-white leading-tight mb-6">
              Vivez l'expérience <br />
              <span className="text-church-blue">{user ? `Shalom, ${user.displayName}` : 'Centre Missionnaire Camp de Dieu'}</span> en ligne.
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-md">
              {user 
                ? "Heureux de vous revoir ! Accédez à vos services et gérez votre profil en toute simplicité."
                : "Accédez à vos programmes personnalisés, vos demandes de prière et gérez votre engagement au sein de la communauté."}
            </p>
          </motion.div>

          {!user && (
            <div className="space-y-6">
              {[
                { icon: ShieldCheck, title: "Communauté Sécurisée", desc: "Vos données sont protégées par les standards les plus stricts." },
                { icon: Mail, title: "Emails Personnalisés", desc: "Recevez les nouvelles directement dans votre boîte mail." },
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-4 p-6 rounded-2xl bg-white dark:bg-dark-card border border-church-border dark:border-dark-border shadow-sm">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/10 rounded-xl flex items-center justify-center text-church-blue flex-shrink-0">
                    <feature.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-church-dark dark:text-white uppercase tracking-tight">{feature.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {user && profile && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-dark-card p-8 rounded-3xl shadow-sm border border-church-border dark:border-dark-border">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Statut du Compte</h3>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-church-blue/10 rounded-2xl flex items-center justify-center text-church-blue">
                    <Sparkles size={28} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-church-dark dark:text-white uppercase tracking-tight">Rôle: {profile.role}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Membre actif de Kinshasa</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-dark-card rounded-[40px] shadow-2xl border border-church-border dark:border-dark-border p-8 md:p-12 max-w-md mx-auto w-full relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-church-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          
          <div className="text-center mb-10">
            {user ? (
              <img src={user.photoURL || ''} alt="" className="w-20 h-20 rounded-3xl mx-auto mb-6 shadow-xl border-4 border-church-gold/20 object-cover" />
            ) : (
              <div className="w-16 h-16 bg-church-blue rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-6 shadow-xl border-4 border-church-gold/20">
                CDD
              </div>
            )}
            <h2 className="text-2xl font-black text-church-dark dark:text-white uppercase tracking-tight">
              {user ? 'Votre Profil' : 'Espace Membre'}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold tracking-widest mt-2 uppercase">
              {user ? user.email : 'Identifiez-vous pour continuer'}
            </p>
          </div>

          <div className="space-y-6">
            {!user ? (
              <>
                {loginError && (
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold leading-relaxed">
                      <p className="mb-2 uppercase tracking-tight">Erreur de Connexion</p>
                      {loginError}
                    </div>
                    {loginError.includes('domaine n\'est pas autorisé') && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-church-border dark:border-dark-border rounded-xl text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                        <p className="text-church-blue uppercase mb-2">Solution pour l'administrateur :</p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Allez sur <a href="https://console.firebase.google.com" target="_blank" className="underline">console.firebase.google.com</a></li>
                          <li>Allez dans Authentification &gt; Paramètres &gt; Domaines autorisés</li>
                          <li>Ajoutez votre domaine Netlify (ex: mon-site.netlify.app)</li>
                        </ol>
                      </div>
                    )}
                  </div>
                )}
                <button 
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="w-full py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm disabled:opacity-50 dark:text-white"
                >
                  {isLoggingIn ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                  )}
                  <span>{isLoggingIn ? 'Connexion...' : 'Continuer avec Google'}</span>
                </button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                    <span className="bg-white dark:bg-dark-card px-4 text-slate-300 dark:text-slate-600">Administration</span>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed">
                    Les administrateurs peuvent se connecter via Google ci-dessus pour accéder au tableau de bord.
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-8">
                {/* Stats / Quick Links Header */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-church-border dark:border-dark-border">
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Activité</p>
                    <p className="text-xl font-black text-church-dark dark:text-white">{appointments.length + prayers.length + messages.length}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                    <p className="text-[8px] font-black uppercase text-church-blue tracking-widest mb-1">Nouv. Réponses</p>
                    <p className="text-xl font-black text-church-blue">
                      {[...appointments, ...prayers, ...messages].filter(x => x.reply && !x.read).length}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 sticky top-0 bg-white dark:bg-dark-card py-2 z-10">Dernières Interactions</h3>
                  
                  {loadingData ? (
                    <div className="py-10 text-center">
                      <Loader2 size={24} className="animate-spin text-church-blue mx-auto" />
                    </div>
                  ) : [...appointments, ...prayers, ...messages].length === 0 ? (
                    <div className="py-10 text-center bg-slate-50 dark:bg-slate-800/20 rounded-3xl border border-dashed border-church-border dark:border-dark-border">
                      <HelpCircle size={24} className="text-slate-300 dark:text-slate-800 mx-auto mb-2" />
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Aucune activité récente</p>
                    </div>
                  ) : (
                    [...appointments, ...prayers, ...messages]
                      .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
                      .map((item, idx) => (
                        <div key={item.id || idx} className="p-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl hover:border-church-blue transition-all">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-8 h-8 rounded-xl flex items-center justify-center",
                                item.subject ? "bg-blue-100 dark:bg-blue-900/30 text-church-blue" :
                                item.category ? "bg-amber-100 dark:bg-amber-900/30 text-church-gold" :
                                "bg-purple-100 dark:bg-purple-900/30 text-purple-500"
                              )}>
                                {item.subject ? <Calendar size={16} /> : item.category ? <Heart size={16} /> : <Mail size={16} />}
                              </div>
                              <div>
                                <h4 className="text-[11px] font-black text-church-dark dark:text-white uppercase tracking-tight">
                                  {item.subject || item.category || "Message de contact"}
                                </h4>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                                  {item.createdAt?.toDate ? format(item.createdAt.toDate(), 'dd MMM yyyy', { locale: fr }) : '...'}
                                </p>
                              </div>
                            </div>
                            <div className={cn(
                              "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                              item.status === 'Confirmé' || item.reply ? "bg-green-100 dark:bg-green-900/30 text-green-600" : "bg-slate-100 dark:bg-slate-700 text-slate-400"
                            )}>
                              {item.status || (item.reply ? 'Répondu' : 'En attente')}
                            </div>
                          </div>

                          {item.reply && (
                            <div className="mt-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-church-blue/10 relative">
                              <div className="absolute -top-1.5 left-4 px-1 bg-slate-50 dark:bg-slate-800 text-[6px] font-black uppercase text-church-blue tracking-widest">Réponse du Pasteur</div>
                              <p className="text-[10px] text-slate-600 dark:text-slate-400 italic leading-relaxed">"{item.reply}"</p>
                            </div>
                          )}
                        </div>
                      ))
                  )}
                </div>

                <div className="pt-6 border-t border-church-border dark:border-dark-border grid grid-cols-1 gap-2">
                  <Link to="/contact" className="w-full py-3 bg-slate-50 dark:bg-slate-800 text-church-dark dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-church-blue hover:text-white transition-all">
                    Nouveau Message
                    <ChevronRight size={14} />
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full py-3 text-slate-400 dark:text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:text-red-500 transition-all"
                  >
                    <LogOut size={14} />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}

            {!user && (
              <div className="text-center pt-6">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Besoin d'aide ?</p>
                <Link to="/contact" className="text-church-blue text-xs font-black uppercase tracking-widest hover:underline flex items-center justify-center gap-2">
                  Contacter le secrétariat
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
