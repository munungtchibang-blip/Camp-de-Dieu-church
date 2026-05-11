import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface SiteConfig {
  identity: {
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    whatsapp: string;
    aboutText?: string;
    missionText?: string;
    yearsOfMinistry?: string;
    value1Title?: string;
    value1Desc?: string;
    value2Title?: string;
    value2Desc?: string;
    value3Title?: string;
    value3Desc?: string;
  };
  hero: {
    title: string;
    subtitle: string;
    imageUrl: string;
  };
  socials: {
    facebook: string;
    youtube: string;
    instagram: string;
    twitter: string;
    liveUrl: string;
  };
  mobileMoney: {
    orangeMoney: string;
    airtelMoney: string;
    mpesa: string;
  };
}

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'config', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setConfig({
          identity: {
            name: data.identity?.name || data.contact?.name || '',
            description: data.identity?.description || data.contact?.description || '',
            address: data.identity?.address || data.contact?.address || '',
            phone: data.identity?.phone || data.contact?.phone || '',
            email: data.identity?.email || data.contact?.email || '',
            whatsapp: data.identity?.whatsapp || data.contact?.whatsapp || '',
            aboutText: data.identity?.aboutText || '',
            missionText: data.identity?.missionText || '',
            yearsOfMinistry: data.identity?.yearsOfMinistry || '20+',
            value1Title: data.identity?.value1Title || 'Amour',
            value1Desc: data.identity?.value1Desc || "Nous plaçons l'amour au centre de chaque interaction communautaire.",
            value2Title: data.identity?.value2Title || 'Intégrité',
            value2Desc: data.identity?.value2Desc || "Une marche spirituelle basée sur la vérité et l'honnêteté devant Dieu.",
            value3Title: data.identity?.value3Title || 'Excellence',
            value3Desc: data.identity?.value3Desc || "Tout Faire pour la gloire de Dieu avec le plus haut standard possible.",
          },
          hero: {
            title: data.hero?.title || '',
            subtitle: data.hero?.subtitle || '',
            imageUrl: data.hero?.imageUrl || '',
          },
          socials: {
            facebook: data.socials?.facebook || '',
            youtube: data.socials?.youtube || '',
            instagram: data.socials?.instagram || '',
            twitter: data.socials?.twitter || '',
            liveUrl: data.socials?.liveUrl || '',
          },
          mobileMoney: {
            orangeMoney: data.mobileMoney?.orangeMoney || '',
            airtelMoney: data.mobileMoney?.airtelMoney || '',
            mpesa: data.mobileMoney?.mpesa || '',
          }
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching site config:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { config, loading };
}
