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
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import BibleAssistant from './components/ai/BibleAssistant';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/a-propos" element={<About />} />
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
      <Router>
        <div className="min-h-screen flex flex-col bg-church-bg">
          <Navbar />
          <main className="flex-grow">
            <AnimatedRoutes />
          </main>
          <BibleAssistant />
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}


