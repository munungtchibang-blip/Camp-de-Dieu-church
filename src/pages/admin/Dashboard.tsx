import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';
import { 
  Plus, 
  Loader2, 
  LayoutDashboard,
  Megaphone,
  Mic2,
  Calendar,
  Settings,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Users,
  CalendarDays,
  Inbox,
  Heart,
  Baby,
  Shield,
  Music,
  Star,
  Video,
  BookOpen,
  MessageSquare,
  Phone,
  Cross
} from 'lucide-react';

const allIcons = [
  { name: 'LayoutDashboard', icon: LayoutDashboard },
  { name: 'Megaphone', icon: Megaphone },
  { name: 'Mic2', icon: Mic2 },
  { name: 'Calendar', icon: Calendar },
  { name: 'Settings', icon: Settings },
  { name: 'ShieldCheck', icon: ShieldCheck },
  { name: 'Users', icon: Users },
  { name: 'Heart', icon: Heart },
  { name: 'Baby', icon: Baby },
  { name: 'Shield', icon: Shield },
  { name: 'Music', icon: Music },
  { name: 'Star', icon: Star },
  { name: 'Video', icon: Video },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'MessageSquare', icon: MessageSquare },
  { name: 'Phone', icon: Phone },
  { name: 'Cross', icon: Cross }
];
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  onSnapshot,
  query,
  where,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import NewsFeed from '../../components/news/NewsFeed';
import SermonManager from './SermonManager';
import EventManager from './EventManager';
import SiteSettings from './SiteSettings';
import TeamManager from './TeamManager';
import AppointmentManager from './AppointmentManager';
import ContactManager from './ContactManager';
import PrayerRequestManager from './PrayerRequestManager';
import GalleryManager from './GalleryManager';
import PastorBoard from './PastorBoard';
import MinistryManager from './MinistryManager';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { startOfMonth } from 'date-fns';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';

type TabType = 'overview' | 'announcements' | 'sermons' | 'programs' | 'team' | 'appointments' | 'messages' | 'prayers' | 'gallery' | 'pastor' | 'ministries' | 'settings';

export default function Dashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    category: 'Général',
    imageUrl: ''
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Stats State
  const [stats, setStats] = useState({
    members: 0,
    donations: 0,
    appointments: 0,
    messages: 0,
    activeEvents: 0
  });

  const categories = ['Général', 'Culte', 'Événement', 'Urgent', 'Jeunesse'];

  React.useEffect(() => {
    if (activeTab !== 'overview') return;

    // Fetch real stats
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setStats(prev => ({ ...prev, members: snap.size }));
    });

    const monthStart = startOfMonth(new Date());
    const donationsQuery = query(
      collection(db, 'donations'),
      where('status', '==', 'Completed'),
      where('createdAt', '>=', Timestamp.fromDate(monthStart))
    );
    const unsubDonations = onSnapshot(donationsQuery, (snap) => {
      const total = snap.docs.reduce((acc, doc) => acc + (doc.data().amount || 0), 0);
      setStats(prev => ({ ...prev, donations: total }));
    });

    const unsubAppts = onSnapshot(collection(db, 'appointments'), (snap) => {
      setStats(prev => ({ ...prev, appointments: snap.size }));
    });

    const unsubMessages = onSnapshot(collection(db, 'contacts'), (snap) => {
      setStats(prev => ({ ...prev, messages: snap.size }));
    });

    const unsubEvents = onSnapshot(collection(db, 'events'), (snap) => {
      setStats(prev => ({ ...prev, activeEvents: snap.size }));
    });

    return () => {
      unsubUsers();
      unsubDonations();
      unsubAppts();
      unsubMessages();
      unsubEvents();
    };
  }, [activeTab]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAnnouncement({ ...newAnnouncement, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) return;

    setSubmitting(true);
    const path = 'announcements';
    try {
      await addDoc(collection(db, path), {
        ...newAnnouncement,
        createdAt: serverTimestamp()
      });
      setNewAnnouncement({ title: '', content: '', category: 'Général', imageUrl: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteAnnouncement = async () => {
    if (!deleteConfirm.id) return;
    
    const path = `announcements/${deleteConfirm.id}`;
    try {
      await deleteDoc(doc(db, 'announcements', deleteConfirm.id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Aperçu', icon: LayoutDashboard },
    { id: 'pastor', label: 'Espace Pasteur', icon: ShieldCheck },
    { id: 'announcements', label: 'Annonces', icon: Megaphone },
    { id: 'ministries', label: 'Ministères', icon: Users },
    { id: 'sermons', label: 'Prédications', icon: Mic2 },
    { id: 'programs', label: 'Programme', icon: Calendar },
    { id: 'team', label: 'Équipe', icon: Users },
    { id: 'appointments', label: 'Rendez-vous', icon: CalendarDays },
    { id: 'messages', label: 'Messages', icon: Inbox },
    { id: 'prayers', label: 'Prières', icon: Heart },
    { id: 'gallery', label: 'Galerie', icon: ImageIcon },
    { id: 'settings', label: 'Configuration', icon: Settings },
  ];

  return (
    <div className="pt-32 pb-20 bg-church-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ConfirmDeleteModal 
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
          onConfirm={confirmDeleteAnnouncement}
          message="Voulez-vous vraiment supprimer cette annonce ? Cette action est irréversible."
        />
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="text-church-blue" size={24} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Administration Système</span>
            </div>
            <h1 className="text-5xl font-display font-black text-church-dark leading-tight">
              Bienvenue, <br />
              <span className="text-church-blue">{profile?.displayName?.split(' ')[0]}</span>
            </h1>
          </div>

          <div className="flex bg-white p-2 rounded-2xl border border-church-border shadow-sm overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  activeTab === tab.id 
                    ? "bg-church-dark text-white shadow-lg" 
                    : "text-slate-400 hover:text-church-blue"
                )}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-12">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Fidèles Enregistrés', value: stats.members.toLocaleString(), color: 'bg-white', text: 'text-church-dark', trend: 'Total Membres' },
                    { label: 'Dons du Mois', value: `${stats.donations.toLocaleString()} $`, color: 'bg-church-gold', text: 'text-church-dark', trend: 'Période en cours' },
                    { label: 'Demandes de RDV', value: stats.appointments.toString(), color: 'bg-church-dark', text: 'text-white', trend: 'Total demandes' },
                    { label: 'Messages Reçus', value: stats.messages.toString(), color: 'bg-church-blue', text: 'text-white', trend: 'Boîte de réception' },
                  ].map((stat, i) => (
                    <div 
                      key={i}
                      className={cn(stat.color, "p-8 rounded-[40px] shadow-sm border border-church-border relative overflow-hidden group")}
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <LayoutDashboard size={80} />
                      </div>
                      <span className={cn("text-[10px] font-black uppercase tracking-widest opacity-50", stat.text)}>{stat.label}</span>
                      <p className={cn("text-4xl font-black mt-2", stat.text)}>{stat.value}</p>
                      <div className="mt-4 flex items-center gap-2">
                        <span className={cn("text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest", 
                          stat.color === 'bg-white' ? "bg-green-50 text-green-600" : "bg-white/20 text-white"
                        )}>
                          {stat.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Accuracy verification notice */}
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-church-blue flex-shrink-0 shadow-sm">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-church-dark uppercase tracking-tight mb-1">Intégrité des Données</h3>
                    <p className="text-xs text-slate-500 font-medium">Toutes les statistiques ci-dessus proviennent en temps réel de votre base de données sécurisée. Aucune donnée n'est simulée.</p>
                  </div>
                </div>

                {/* Quick Actions & Recent Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="bg-white p-8 rounded-[40px] border border-church-border shadow-sm">
                    <h2 className="text-xl font-black text-church-dark mb-6 uppercase tracking-tight flex items-center gap-2">
                      <CheckCircle2 className="text-green-500" />
                      Actions de Gestion
                    </h2>
                    <div className="space-y-4">
                      <button onClick={() => setActiveTab('pastor')} className="w-full p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-church-blue transition-all flex items-center justify-between group">
                        <span className="text-sm font-bold text-slate-600 group-hover:text-church-blue transition-colors">
                          Gérer les rendez-vous pastoraux
                        </span>
                        <ArrowRight size={18} className="text-slate-300 group-hover:translate-x-1 group-hover:text-church-blue transition-all" />
                      </button>
                      <button onClick={() => setActiveTab('prayers')} className="w-full p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-church-blue transition-all flex items-center justify-between group">
                        <span className="text-sm font-bold text-slate-600 group-hover:text-church-blue transition-colors">
                          Consulter les {stats.messages} nouvelles requêtes
                        </span>
                        <ArrowRight size={18} className="text-slate-300 group-hover:translate-x-1 group-hover:text-church-blue transition-all" />
                      </button>
                      <button onClick={() => setActiveTab('programs')} className="w-full p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-church-blue transition-all flex items-center justify-between group">
                        <span className="text-sm font-bold text-slate-600 group-hover:text-church-blue transition-colors">
                          Mettre à jour le calendrier des événements
                        </span>
                        <ArrowRight size={18} className="text-slate-300 group-hover:translate-x-1 group-hover:text-church-blue transition-all" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-church-dark p-8 rounded-[40px] shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-church-blue/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <h2 className="text-xl font-black text-white mb-6 uppercase tracking-tight flex items-center gap-2 relative z-10">
                      <AlertCircle className="text-church-gold" />
                      Rappel de Service
                    </h2>
                    <div className="space-y-4 relative z-10">
                      <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-xs font-black text-church-gold uppercase tracking-widest mb-1">Fidèles</p>
                        <p className="text-white/60 text-xs font-medium">{stats.members} personnes font actuellement partie de la communauté en ligne.</p>
                      </div>
                      <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-xs font-black text-church-gold uppercase tracking-widest mb-1">Activités</p>
                        <p className="text-white/60 text-xs font-medium">{stats.activeEvents} événements sont programmés à venir.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Icon Library Preview */}
                <div className="bg-white p-8 rounded-[40px] border border-church-border shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-xl font-black text-church-dark uppercase tracking-tight flex items-center gap-2">
                        <Star className="text-church-gold" />
                        Bibliothèque d'Icônes
                      </h2>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Utilisez ces noms d'icônes dans vos configurations</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-4">
                    {allIcons.map((iconObj, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-3 p-4 bg-slate-50 rounded-2xl group hover:bg-church-blue hover:text-white transition-all cursor-help border border-transparent hover:border-blue-100">
                        <iconObj.icon size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[8px] font-black uppercase tracking-tighter opacity-50 group-hover:opacity-100">{iconObj.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pastor' && <PastorBoard />}

            {activeTab === 'announcements' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1">
                  <div className="bg-white p-8 rounded-3xl shadow-xl border border-church-border sticky top-32">
                    <h2 className="text-xl font-black text-church-dark mb-6 flex items-center gap-2 uppercase tracking-tight">
                      <Plus className="text-church-accent" />
                      Nouvelle Annonce
                    </h2>
                    
                    <form onSubmit={handleAnnouncementSubmit} className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Titre</label>
                        <input 
                          type="text"
                          value={newAnnouncement.title}
                          onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                          className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-blue transition-all"
                          placeholder="Ex: Séminaire de Couple"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Catégorie</label>
                        <select 
                          value={newAnnouncement.category}
                          onChange={e => setNewAnnouncement({...newAnnouncement, category: e.target.value})}
                          className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-blue appearance-none transition-all"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
      
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Image de l'annonce</label>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={newAnnouncement.imageUrl}
                            onChange={e => setNewAnnouncement({...newAnnouncement, imageUrl: e.target.value})}
                            className="flex-1 bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-blue transition-all"
                            placeholder="URL de l'image (optionnel)"
                          />
                          <input 
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                            accept="image/*"
                          />
                          <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                            title="Importer depuis l'appareil"
                          >
                            <ImageIcon size={18} />
                          </button>
                        </div>
                        {newAnnouncement.imageUrl && (
                          <div className="mt-3 relative w-full h-32 rounded-xl overflow-hidden border border-church-border">
                            <img src={newAnnouncement.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                            <button 
                              type="button"
                              onClick={() => setNewAnnouncement({...newAnnouncement, imageUrl: ''})}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow-lg"
                            >
                              <Plus className="rotate-45" size={12} />
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contenu</label>
                        <textarea 
                          value={newAnnouncement.content}
                          onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                          rows={4}
                          className="w-full bg-slate-50 border border-church-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-church-blue transition-all"
                          placeholder="Détails de l'annonce..."
                          required
                        />
                      </div>
      
                      <button 
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 bg-church-dark text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-church-blue transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {submitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                        Publier l'Annonce
                      </button>
                    </form>
                  </div>
                </div>
      
                <div className="lg:col-span-2">
                   <div className="bg-white p-8 rounded-3xl shadow-xl border border-church-border min-h-[500px]">
                    <NewsFeed 
                      adminMode={true} 
                      onDelete={(id) => setDeleteConfirm({ isOpen: true, id })} 
                      maxItems={20}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sermons' && <SermonManager />}
            {activeTab === 'programs' && <EventManager />}
            {activeTab === 'team' && <TeamManager />}
            {activeTab === 'appointments' && <AppointmentManager />}
            {activeTab === 'messages' && <ContactManager />}
            {activeTab === 'prayers' && <PrayerRequestManager />}
            {activeTab === 'gallery' && <GalleryManager />}
            {activeTab === 'ministries' && <MinistryManager />}
            {activeTab === 'settings' && <SiteSettings />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
