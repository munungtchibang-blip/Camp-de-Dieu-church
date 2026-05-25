/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import Programs from './pages/Programs';
import Live from './pages/Live';
import Sermons from './pages/Sermons';
import PrayerRequest from './pages/PrayerRequest';
import Announcements from './pages/Announcements';
import Ministries from './pages/Ministries';
import Appointments from './pages/Appointments';
import MemberSpace from './pages/MemberSpace';
import Donations from './pages/Donations';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import AdminDashboard from './pages/admin/Dashboard';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/layout/ScrollToTop';
import BibleAssistant from './components/ai/BibleAssistant';
import HelpWidget from './components/common/HelpWidget';
import { ThemeProvider } from './context/ThemeContext';

import Testimonies from './pages/Testimonies';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/a-propos" element={<About />} />
        <Route path="/temoignages" element={<Testimonies />} />
        <Route path="/programmes" element={<Programs />} />
        <Route path="/direct" element={<Live />} />
        <Route path="/predications" element={<Sermons />} />
        <Route path="/priere" element={<PrayerRequest />} />
        <Route path="/annonces" element={<Announcements />} />
        <Route path="/ministeres" element={<Ministries />} />
        <Route path="/rendez-vous" element={<Appointments />} />
        <Route path="/membre/*" element={<MemberSpace />} />
        <Route path="/dons" element={<Donations />} />
        <Route path="/galerie" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute requireModerator>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Toaster position="top-right" />
        <Router>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col bg-church-bg dark:bg-dark-bg transition-colors duration-300">
            <Navbar />
            <main className="flex-grow">
              <AnimatedRoutes />
            </main>
            <BibleAssistant />
            <HelpWidget />
            <Footer />
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}


