// src/App.js
import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Remaja from './pages/Remaja';
import Lansia from './pages/Lansia';
import IbuHamil from './pages/IbuHamil';
import IbuMenyusui from './pages/IbuMenyusui';
import Kalkulator from './pages/Kalkulator';
import Login from './pages/Admin/Login';
import Dashboard from './pages/Admin/Dashboard';
import RemajaCrud from './pages/Admin/RemajaCrud';
import LansiaCrud from './pages/Admin/LansiaCrud';
import IbuHamilCrud from './pages/Admin/IbuHamilCrud';
import IbuMenyusuiCrud from './pages/Admin/IbuMenyusuiCrud';
import KalkulatorCrud from './pages/Admin/KalkulatorCrud';
import BeritaCrud from './pages/Admin/BeritaCrud';
import DataUser from './pages/Admin/DataUser';
import ScrollToTopButton from './components/ScrollToTopButton.js';
import Videos from './pages/Videos.js';
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import MapViewer from './components/MapViewer.js';
import DataAsiEksklusif from './pages/Admin/DataAsiEksklusif.js';
import DataMapPangan from './pages/Admin/DataMapPangan.js';
import Infografis from './pages/Infografis.js';
import DataMapGiziBalita from './pages/Admin/DataMapGiziBalita.js';

// Import new components for Ibu SignUp, Login, and Profile
import SignUpIbu from './pages/SignUpIbu';
import LoginIbu from './pages/LoginIbu';
import ProfilePage from './pages/ProfilePage';  // Import ProfilePage component
import PenyakitCrud from './pages/Admin/PenyakitCrud';
import NutrisiCrud from './pages/Admin/NutrisiCrud';
import VideoCrud from './pages/Admin/VideoCrud.js';
import AdminRoute from './pages/Admin/AdminRoutes.js';
import AddMapDataForm from './pages/Admin/AddMapDataForm.js';


// Component for protecting routes
const ProtectedRoute = ({ children }) => {
  const { admin } = useContext(AuthContext);
  if (!admin) {
    return <Navigate to="/admin/login" />;
  }
  return children;
};

function Layout() {
  const location = useLocation();
  const { admin } = useContext(AuthContext);

  // Check if the current path is an admin page
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {/* Show Navbar for user routes, Sidebar for admin routes */}
      {!isAdminRoute && <Navbar />}
      {isAdminRoute && <Sidebar adminName={admin?.name} />}
      
      {/* Add a 'content' class to ensure content has padding-top */}
      <div className="content">
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/remaja" element={<Remaja />} />
          <Route path="/lansia" element={<Lansia />} />
          <Route path="/ibu_hamil" element={<IbuHamil />} />
          <Route path="/ibu_menyusui" element={<IbuMenyusui />} />
          <Route path="/kalkulator" element={<Kalkulator />} />
          <Route path="/signup" element={<SignUpIbu />} />  {/* New SignUp Route */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/login" element={<LoginIbu />} />   {/* New Login Route */}
          <Route path="/profile/:ibuId" element={<ProfilePage />} />  {/* New Profile Route */}
          <Route path="/video" element={<Videos />} />
          <Route path="/infografis" element={<Infografis />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/remaja" element={<ProtectedRoute><RemajaCrud /></ProtectedRoute>} />
          <Route path="/admin/lansia" element={<ProtectedRoute><LansiaCrud /></ProtectedRoute>} />
          <Route path="/admin/ibu_hamil" element={<ProtectedRoute><IbuHamilCrud /></ProtectedRoute>} />
          <Route path="/admin/ibu_menyusui" element={<ProtectedRoute><IbuMenyusuiCrud /></ProtectedRoute>} />
          <Route path="/admin/berita" element={<ProtectedRoute><BeritaCrud /></ProtectedRoute>} />
          <Route path="/admin/data_user" element={<ProtectedRoute><DataUser /></ProtectedRoute>} />
          <Route path="/admin/penyakit" element={<ProtectedRoute><PenyakitCrud /></ProtectedRoute>} />
          <Route path="/admin/nutrisi" element={<ProtectedRoute><NutrisiCrud /></ProtectedRoute>} />
          <Route path="/admin/video" element={<ProtectedRoute><VideoCrud /></ProtectedRoute>} />
          <Route path="/admin/map" element={<ProtectedRoute><AddMapDataForm /></ProtectedRoute>} />
          <Route path="/admin/map_asi_eksklusif" element={<ProtectedRoute><DataAsiEksklusif /></ProtectedRoute>} />
          <Route path="/admin/map_pangan" element={<ProtectedRoute><DataMapPangan /></ProtectedRoute>} />
          <Route path="/admin/map_gizi_balita" element={<ProtectedRoute><DataMapGiziBalita /></ProtectedRoute>} />




          {/* <Route path="/admin/kalkulator_gizi" element={<ProtectedRoute><KalkulatorCrud /></ProtectedRoute>} /> */}
        </Routes>
      </div>

      {/* Footer only appears on user pages */}
      {!isAdminRoute && <Footer />}
      {/* Include Scroll to Top Button */}
      <ScrollToTopButton />
    </>
  );
}

function App() {
  const location = useLocation();

  // Check if the current path is an admin page
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {/* Chatbot only appears on user pages */}
      {!isAdminRoute && <Chatbot />}
      <Layout />
    </>
  );
}

function RootApp() {
  return (
    <AuthProvider>
      <Router>
        <App />
      </Router>
    </AuthProvider>
  );
}

export default RootApp;