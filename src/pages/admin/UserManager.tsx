import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  query, 
  orderBy,
  where
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { 
  Users, 
  Shield, 
  ShieldAlert, 
  User as UserIcon, 
  Search,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Mail,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: 'member' | 'admin' | 'moderator';
  createdAt?: any;
  photoURL?: string;
}

export default function UserManager() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('email', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserProfile[];
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateRole = async (userId: string, newRole: 'member' | 'admin' | 'moderator') => {
    // Avoid self-demotion if you're the super-admin might be handled by rules but let's be careful
    const path = `users/${userId}`;
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole
      });
      toast.success(`Rôle mis à jour vers ${newRole}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      toast.error("Échec de la mise à jour du rôle.");
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (user.displayName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <ShieldAlert size={14} className="text-red-500" />;
      case 'moderator': return <Shield size={14} className="text-blue-500" />;
      default: return <UserIcon size={14} className="text-slate-400" />;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin': return "bg-red-50 text-red-600 border-red-100";
      case 'moderator': return "bg-blue-50 text-blue-600 border-blue-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-dark-card p-6 rounded-[32px] border border-church-border dark:border-dark-border shadow-sm flex flex-col md:flex-row gap-4 items-center transition-colors duration-300">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
          <input 
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-church-border dark:border-dark-border rounded-2xl text-sm text-church-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-church-blue transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {['all', 'admin', 'moderator', 'member'].map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex-1 md:flex-none",
                filterRole === role
                  ? "bg-church-dark dark:bg-church-blue text-white border-church-dark dark:border-church-blue shadow-lg"
                  : "bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-church-border dark:border-dark-border hover:border-church-blue hover:text-church-blue"
              )}
            >
              {role === 'all' ? 'Tous' : role}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-8 h-8 border-4 border-church-blue border-t-transparent rounded-full"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-dark-card p-6 rounded-[32px] border border-church-border dark:border-dark-border shadow-sm group hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-church-blue/10 flex items-center justify-center overflow-hidden">
                      {user.photoURL ? (
                        <img src={user.photoURL} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <UserIcon className="text-church-blue" size={24} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-church-dark dark:text-white text-sm truncate max-w-[150px]">
                        {user.displayName || 'Sans nom'}
                      </h3>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Mail size={12} />
                        <span className="truncate max-w-[150px]">{user.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5",
                    getRoleBadgeClass(user.role)
                  )}>
                    {getRoleIcon(user.role)}
                    {user.role}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                    <Calendar size={12} />
                    Inscrit le {user.createdAt ? format(user.createdAt.toDate(), 'dd MMM yyyy', { locale: fr }) : 'N/A'}
                  </div>

                  <div className="pt-4 border-t border-church-border dark:border-dark-border">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Changer le rôle</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'member', label: 'Membre' },
                        { id: 'moderator', label: 'Mod' },
                        { id: 'admin', label: 'Admin' }
                      ].map((r) => (
                        <button
                          key={r.id}
                          onClick={() => handleUpdateRole(user.id, r.id as any)}
                          className={cn(
                            "py-2 rounded-xl text-[8px] font-black uppercase tracking-tight border transition-all",
                            user.role === r.id
                              ? "bg-church-blue text-white border-church-blue"
                              : "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-transparent hover:border-church-blue hover:text-church-blue"
                          )}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {user.email === 'mushitujacques3@gmail.com' && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center gap-2 border border-amber-100 dark:border-amber-900/30">
                    <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
                    <span className="text-[8px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-tight">Super Administrateur</span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && filteredUsers.length === 0 && (
        <div className="bg-white dark:bg-dark-card p-20 rounded-[40px] border border-dashed border-church-border dark:border-dark-border text-center transition-colors duration-300">
          <Users className="mx-auto text-slate-200 dark:text-slate-800 mb-4" size={48} />
          <p className="text-slate-400 dark:text-slate-500 font-bold">Aucun utilisateur trouvé.</p>
        </div>
      )}
    </div>
  );
}
