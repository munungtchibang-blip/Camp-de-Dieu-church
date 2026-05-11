import { motion } from 'framer-motion';
import { useState } from 'react';
import { User, ShieldCheck, Mail, ArrowRight, LogIn, LogOut, Loader2, Sparkles, Calendar, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

export default function MemberSpace() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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
      } else {
        setLoginError("Une erreur est survenue lors de la connexion. Veuillez réessayer.");
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
    <div className="min-h-screen pt-32 pb-20 bg-church-bg flex items-center justify-center">
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side: Branding & Info */}
        <div className="hidden lg:block space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-church-gold h-1.5 w-24 mb-8"></div>
            <h1 className="text-5xl font-display font-black text-church-dark leading-tight mb-6">
              Vivez l'expérience <br />
              <span className="text-church-blue">{user ? `Shalom, ${user.displayName}` : 'Camp de Dieu'}</span> en ligne.
            </h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md">
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
                <div key={i} className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-church-border shadow-sm">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-church-blue flex-shrink-0">
                    <feature.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-church-dark uppercase tracking-tight">{feature.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {user && profile && (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-church-border">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Statut du Compte</h3>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-church-blue/10 rounded-2xl flex items-center justify-center text-church-blue">
                    <Sparkles size={28} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-church-dark uppercase tracking-tight">Rôle: {profile.role}</p>
                    <p className="text-xs text-slate-500 font-medium">Membre actif de Kinshasa</p>
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
          className="bg-white rounded-[40px] shadow-2xl border border-church-border p-8 md:p-12 max-w-md mx-auto w-full relative overflow-hidden"
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
            <h2 className="text-2xl font-black text-church-dark uppercase tracking-tight">
              {user ? 'Votre Profil' : 'Espace Membre'}
            </h2>
            <p className="text-xs text-slate-400 font-bold tracking-widest mt-2 uppercase">
              {user ? user.email : 'Identifiez-vous pour continuer'}
            </p>
          </div>

          <div className="space-y-6">
            {!user ? (
              <>
                {loginError && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold text-center">
                    {loginError}
                  </div>
                )}
                <button 
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="w-full py-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
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
                    <div className="w-full border-t border-slate-100"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                    <span className="bg-white px-4 text-slate-300">Administration</span>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                    Les administrateurs peuvent se connecter via Google ci-dessus pour accéder au tableau de bord.
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-6 text-center">
                <div className="grid grid-cols-2 gap-4">
                  <Link to="/rendez-vous" className="p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-church-blue transition-all group">
                    <Calendar size={20} className="mx-auto mb-2 text-church-blue group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black uppercase tracking-tight">Rendez-vous</span>
                  </Link>
                  <Link to="/priere" className="p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-church-blue transition-all group">
                    <MessageSquare size={20} className="mx-auto mb-2 text-church-blue group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black uppercase tracking-tight">Requêtes</span>
                  </Link>
                </div>

                <button 
                  onClick={handleLogout}
                  className="w-full py-5 bg-church-dark text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-red-600 transition-all flex items-center justify-center gap-3"
                >
                  <LogOut size={18} />
                  Se Déconnecter
                </button>
              </div>
            )}

            {!user && (
              <div className="text-center pt-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Besoin d'aide ?</p>
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
