import { Link } from 'react-router-dom';
import { Cross, Facebook, Youtube, Instagram, Mail, MapPin, Twitter, Music } from 'lucide-react';
import { useSiteConfig } from '../../hooks/useSiteConfig';

export default function Footer() {
  const { config } = useSiteConfig();

  const churchName = config?.identity?.name || "Centre Missionnaire Camp de Dieu";
  const churchDescription = config?.identity?.description || "Ministère International • Kinshasa";
  const churchAddress = config?.identity?.address || 'Kinshasa, République Démocratique du Congo';
  const logoText = churchName.split(' ').map(word => word[0]).join('').slice(0, 3).toUpperCase();

  const socialLinks = [
    { icon: Facebook, href: config?.socials?.facebook },
    { icon: Youtube, href: config?.socials?.youtube },
    { icon: Instagram, href: config?.socials?.instagram },
    { icon: Twitter, href: config?.socials?.twitter },
    { icon: Music, href: config?.socials?.tiktok },
    { icon: Mail, href: config?.identity?.email ? `mailto:${config.identity.email}` : undefined },
  ].filter(link => link.href);

  return (
    <footer className="bg-white dark:bg-dark-card border-t border-church-border dark:border-dark-border py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-church-blue rounded-full flex items-center justify-center overflow-hidden text-white font-bold border-2 border-church-gold/20 shadow-md">
              {config?.identity?.logoUrl ? (
                <img 
                  src={config.identity.logoUrl} 
                  alt={churchName} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="uppercase">{logoText || "CDD"}</span>
              )}
            </div>
            <div>
              <p className="font-bold tracking-widest text-[9px] uppercase text-church-gold mb-0.5">Centre Missionnaire</p>
              <p className="font-display font-black text-church-dark dark:text-white uppercase tracking-widest text-base leading-none">CAMP DE DIEU</p>
            </div>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            <Link to="/a-propos" className="hover:text-church-blue transition-colors">Vision</Link>
            <Link to="/programmes" className="hover:text-church-blue transition-colors">Programmes</Link>
            <Link to="/predications" className="hover:text-church-blue transition-colors">Sermons</Link>
            <Link to="/dons" className="hover:text-church-blue transition-colors">Offrandes</Link>
            <Link to="/contact" className="hover:text-church-blue transition-colors">Localisation</Link>
          </nav>

          <div className="flex gap-3">
            {socialLinks.map((link, i) => (
              <a 
                key={i} 
                href={link.href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-church-blue transition-all border border-slate-100 dark:border-slate-700"
              >
                <link.icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-100 dark:border-dark-border text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest gap-4">
          <div className="flex items-center gap-2 text-center md:text-left">
            <MapPin size={12} className="text-church-gold" />
            <span>{churchAddress}</span>
          </div>
          <p>© {new Date().getFullYear()} {churchName.toUpperCase()} • TOUS DROITS RÉSERVÉS</p>
        </div>
      </div>
    </footer>
  );
}
