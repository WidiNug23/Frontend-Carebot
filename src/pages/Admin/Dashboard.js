// src/pages/Admin/Dashboard.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  return (
    <div className="admin-dashboard">
      <div className="dashboard-content">
        <h1>Admin Dashboard</h1>
        <div className="dashboard-links">
          <Link to="/admin/remaja">Kelola Data Remaja</Link>
          <Link to="/admin/lansia">Kelola Data Lansia</Link>
          <Link to="/admin/ibu_hamil">Kelola Data Ibu Hamil</Link>
          <Link to="/admin/ibu_menyusui">Kelola Data Ibu Menyusui</Link>
          <Link to="/admin/berita">Kelola Data Artikel</Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
