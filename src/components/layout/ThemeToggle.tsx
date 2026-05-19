import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ThemeToggleProps {
  className?: string;
  scrolled?: boolean;
  isInsideMobileMenu?: boolean;
}

export default function ThemeToggle({ className, scrolled, isInsideMobileMenu }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative p-2 rounded-xl transition-all duration-300 overflow-hidden group border",
        isInsideMobileMenu 
          ? "w-full flex items-center justify-between px-4 py-4 bg-slate-50 dark:bg-slate-800 border-church-border dark:border-dark-border text-church-dark dark:text-white"
          : scrolled 
            ? "border-church-border dark:border-dark-border bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-church-blue dark:hover:text-blue-400 hover:border-church-blue dark:hover:border-blue-400" 
            : "border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10",
        className
      )}
      aria-label="Changer le thème"
    >
      <div className="flex items-center gap-3">
        <div className="relative w-5 h-5">
          <motion.div
            initial={false}
            animate={{ 
              y: theme === 'light' ? 0 : -30,
              opacity: theme === 'light' ? 1 : 0
            }}
            className="absolute inset-0"
          >
            <Sun size={20} />
          </motion.div>
          <motion.div
            initial={false}
            animate={{ 
              y: theme === 'dark' ? 0 : 30,
              opacity: theme === 'dark' ? 1 : 0
            }}
            className="absolute inset-0"
          >
            <Moon size={20} />
          </motion.div>
        </div>
        {isInsideMobileMenu && (
          <span className="text-xs font-black uppercase tracking-widest">
            {theme === 'light' ? 'Mode Sombre' : 'Mode Clair'}
          </span>
        )}
      </div>
      
      {!isInsideMobileMenu && (
        <span className="sr-only">Toggle theme</span>
      )}
      
      {isInsideMobileMenu && (
        <div className={cn(
          "w-10 h-5 rounded-full relative transition-colors duration-300",
          theme === 'dark' ? "bg-church-blue" : "bg-slate-300"
        )}>
          <motion.div 
            animate={{ x: theme === 'dark' ? 20 : 0 }}
            className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm"
          />
        </div>
      )}
    </button>
  );
}
