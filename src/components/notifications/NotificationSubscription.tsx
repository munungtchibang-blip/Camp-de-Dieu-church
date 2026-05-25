import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { getToken } from 'firebase/messaging';
import { messaging, db } from '../../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function NotificationSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    // Check if notifications are supported and already granted
    if (!('Notification' in window)) {
      setSupported(false);
      return;
    }
    
    if (Notification.permission === 'granted') {
      const storedToken = localStorage.getItem('fcm_token');
      if (storedToken) {
        setIsSubscribed(true);
      }
    }
  }, []);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const msg = await messaging();
        if (msg) {
          // Generally you need a VAPID key here if you send to specific web push services,
          // but defaults sometimes work on standard Chrome/Firebase setups depending on config.
          // VAPID keys should ideally be provided in options if requested.
          const token = await getToken(msg, {
            // vapidKey: 'YOUR_VAPID_KEY'
          });
          
          if (token) {
            console.log("Firebase Messaging Token:", token);
            // Save to Firestore
            await setDoc(doc(db, 'fcm_tokens', token), {
              token,
              createdAt: serverTimestamp(),
              userAgent: navigator.userAgent
            });
            localStorage.setItem('fcm_token', token);
            setIsSubscribed(true);
            alert("Abonnement aux notifications réussi !");
          }
        } else {
          alert("Les notifications Push ne sont pas supportées sur ce navigateur.");
        }
      } else {
        alert("La permission des notifications a été refusée.");
      }
    } catch (error) {
      console.error("Erreur lors de l'abonnement:", error);
      alert("Une erreur est survenue lors de l'abonnement.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!supported) return null;

  return (
    <button
      onClick={isSubscribed ? () => {
        alert("Vous êtes déjà abonné aux notifications !");
      } : handleSubscribe}
      disabled={isLoading || isSubscribed}
      className={`flex items-center gap-2 p-2 rounded-xl transition-all ${
        isSubscribed 
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-default' 
          : 'bg-church-blue/10 text-church-blue hover:bg-church-blue/20 dark:bg-blue-900/30 dark:text-blue-400'
      }`}
      title={isSubscribed ? "Notifications activées" : "S'abonner aux notifications"}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : isSubscribed ? (
        <Bell size={16} />
      ) : (
        <BellOff size={16} />
      )}
      <span className="text-sm font-medium hidden lg:inline">
        {isSubscribed ? "Abonné" : "S'alerter"}
      </span>
    </button>
  );
}
