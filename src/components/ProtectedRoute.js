// src/components/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredCategory }) => {
  const { user } = useContext(AuthContext);

  // Jika pengguna belum login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Jika kategori pengguna tidak sesuai dengan yang dibutuhkan
  if (user.kategori !== requiredCategory) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
