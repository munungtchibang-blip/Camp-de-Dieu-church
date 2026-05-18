import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useSiteConfig } from '../hooks/useSiteConfig';
import { User, Target, Heart, Shield } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  imageUrl: string;
}

export default function About() {
  const { config } = useSiteConfig();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'team'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const teamList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TeamMember[];
      setTeam(teamList);
      setLoadingTeam(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'team');
      setLoadingTeam(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="pt-32 pb-20 bg-church-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-24"
        >
          <div className="text-center mb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-church-blue mb-4 block">Notre Identité</span>
            <h1 className="text-5xl md:text-7xl font-display font-black text-church-dark leading-none tracking-tighter mb-6 uppercase">
              À Propos de <span className="text-church-blue">l'Église</span>
            </h1>
            <div className="w-20 h-1 bg-church-gold mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="p-8 bg-white rounded-[40px] shadow-sm border border-church-border">
                <h2 className="text-2xl font-black text-church-dark uppercase tracking-tight mb-4 flex items-center gap-3">
                  <Shield className="text-church-blue" />
                  Qui sommes-nous ?
                </h2>
                <div className="text-slate-600 leading-relaxed font-medium">
                  {config?.identity?.aboutText ? (
                    <p className="whitespace-pre-wrap">{config.identity.aboutText}</p>
                  ) : (
                    <p>
                      L'église CAMP DE DIEU est une communauté chrétienne dynamique basée à Kinshasa, 
                      dédiée à l'enseignement de la saine doctrine et à la transformation des vies par 
                      la puissance authentique du Saint-Esprit.
                    </p>
                  )}
                </div>
              </div>

              <div className="p-8 bg-church-dark text-white rounded-[40px] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-church-blue/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3 relative z-10">
                  <Target className="text-church-gold" />
                  Notre Mission
                </h2>
                <div className="text-slate-300 leading-relaxed font-medium relative z-10">
                  {config?.identity?.missionText ? (
                    <p className="whitespace-pre-wrap">{config.identity.missionText}</p>
                  ) : (
                    <p>Rétablir le règne de Dieu dans les cœurs et les familles à travers la manifestation de Sa puissance et de Son amour, en équipant des disciples conscients de leur héritage céleste.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/5] rounded-[60px] overflow-hidden border-8 border-white shadow-2xl rotate-2">
                <img 
                  src={config?.hero?.imageUrl || "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1024"} 
                  alt="Vision" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-church-gold p-8 rounded-[40px] shadow-xl border-4 border-white -rotate-3 text-church-dark">
                <p className="font-black text-4xl leading-none">{config?.identity?.yearsOfMinistry || '20+'}</p>
                <p className="text-[10px] font-black uppercase tracking-widest mt-1">Années de Ministère</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Values Section */}
        <div className="mb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Heart, title: config?.identity?.value1Title || "Amour", desc: config?.identity?.value1Desc || "Nous plaçons l'amour au centre de chaque interaction communautaire." },
              { icon: Shield, title: config?.identity?.value2Title || "Intégrité", desc: config?.identity?.value2Desc || "Une marche spirituelle basée sur la vérité et l'honnêteté devant Dieu." },
              { icon: Target, title: config?.identity?.value3Title || "Excellence", desc: config?.identity?.value3Desc || "Tout Faire pour la gloire de Dieu avec le plus haut standard possible." }
            ].map((v, i) => (
              <div key={i} className="p-8 bg-white rounded-3xl border border-church-border hover:border-church-blue transition-all group">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-church-blue mb-6 group-hover:bg-church-blue group-hover:text-white transition-all">
                  <v.icon size={24} />
                </div>
                <h3 className="text-xl font-black text-church-dark uppercase tracking-tight mb-2">{v.title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <section id="team">
          <div className="text-center mb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-church-blue mb-4 block">Notre Leadership</span>
            <h2 className="text-5xl font-display font-black text-church-dark leading-none tracking-tighter uppercase mb-6">
              Bergers & <span className="text-church-blue">Ministres</span>
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium">Les hommes et femmes dédiés au service de Dieu et de la communauté du Camp de Dieu.</p>
          </div>

          {loadingTeam ? (
            <div className="flex justify-center p-20">
              <div className="w-8 h-8 border-4 border-church-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {team.map((member, i) => (
                <motion.div 
                  key={member.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div className="relative mb-6">
                    <div className="aspect-[3/4] rounded-[50px] overflow-hidden border-4 border-white shadow-xl transition-all group-hover:rotate-2 group-hover:scale-[1.02]">
                      {member.imageUrl ? (
                        <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover transition-all group-hover:scale-110" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                          <User size={80} />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-4 -right-4 bg-church-gold px-6 py-2 rounded-2xl shadow-lg border-2 border-white">
                      <span className="text-[10px] font-black uppercase tracking-widest text-church-dark">{member.role}</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-church-dark uppercase tracking-tight mb-2 text-center group-hover:text-church-blue transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed text-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 max-w-xs mx-auto">
                    {member.description}
                  </p>
                </motion.div>
              ))}
              {team.length === 0 && (
                <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">L'équipe sera bientôt mise à jour</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
