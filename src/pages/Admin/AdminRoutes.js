// src/routes/AdminRoute.js
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!user) {
    // Belum login
    return <Navigate to="/login" />;
  }

  if (user.kategori !== "Admin") {
    // Bukan admin
    return <Navigate to="/" />;
  }

  // Jika admin, render child route-nya
  return <Outlet />;
};

export default AdminRoute;
