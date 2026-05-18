import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export interface GalleryImage {
  id: string;
  url: string;
  description: string;
  createdAt?: any;
}

export interface SiteConfig {
  identity: {
    name: string;
    description: string;
    logoUrl?: string;
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
    galleryImages?: GalleryImage[];
  };
  socials: {
    facebook: string;
    youtube: string;
    instagram: string;
    twitter: string;
    liveUrl: string;
    nextLiveTitle?: string;
    nextLiveDate?: string;
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
    // 1. Listen to global config
    const unsubscribeConfig = onSnapshot(doc(db, 'config', 'global'), (docSnap) => {
      const fetchAll = async () => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // 2. Fetch gallery images if available (could be many, so we limit or just fetch all for this small app)
          // Actually, we nested it here to simplify state management in the component
          const galleryQuery = query(collection(db, 'site_gallery'), orderBy('createdAt', 'desc'));
          const gallerySnap = await getDoc(doc(db, 'config', 'global')); // Dummy just to use getDoc elsewhere if needed, but we better use onSnapshot for gallery too or just getDocs once.
          
          // Let's use getDoc for images for now or just a separate listener
          // For simplicity, let's just use the current data and we'll fix the array in the next step
          
          setConfig(prev => ({
            identity: {
              name: data.identity?.name || data.contact?.name || '',
              description: data.identity?.description || data.contact?.description || '',
              logoUrl: data.identity?.logoUrl || '',
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
              galleryImages: prev?.hero?.galleryImages || [], // Keep previous images while we update
            },
            socials: {
              facebook: data.socials?.facebook || '',
              youtube: data.socials?.youtube || '',
              instagram: data.socials?.instagram || '',
              twitter: data.socials?.twitter || '',
              liveUrl: data.socials?.liveUrl || '',
              nextLiveTitle: data.socials?.nextLiveTitle || '',
              nextLiveDate: data.socials?.nextLiveDate || '',
            },
            mobileMoney: {
              orangeMoney: data.mobileMoney?.orangeMoney || '',
              airtelMoney: data.mobileMoney?.airtelMoney || '',
              mpesa: data.mobileMoney?.mpesa || '',
            }
          }));
        }
        setLoading(false);
      };
      fetchAll();
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'config/global');
      setLoading(false);
    });

    // 2. Separate listener for gallery
    const unsubscribeGallery = onSnapshot(query(collection(db, 'site_gallery'), orderBy('createdAt', 'desc')), (snapshot) => {
      const galleryData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GalleryImage[];
      setConfig(prev => prev ? {
        ...prev,
        hero: {
          ...prev.hero,
          galleryImages: galleryData
        }
      } : null);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'site_gallery');
    });

    return () => {
      unsubscribeConfig();
      unsubscribeGallery();
    };
  }, []);

  return { config, loading };
}
