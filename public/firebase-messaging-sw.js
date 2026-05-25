importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCOpdGBB3aUje04RFQEPybyrzfOcA2HZmg",
  authDomain: "gen-lang-client-0207415067.firebaseapp.com",
  projectId: "gen-lang-client-0207415067",
  storageBucket: "gen-lang-client-0207415067.firebasestorage.app",
  messagingSenderId: "636533503535",
  appId: "1:636533503535:web:3a083cc04a28f76d2a78da"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
