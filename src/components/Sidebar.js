// src/components/Sidebar.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Sidebar.css';

function Sidebar({ adminName }) {
  const { logout } = useContext(AuthContext);

  return (
    <div className="navbar">
      {/* <h2>Admin Panel</h2> */}
      {/* {adminName && <p>Selamat datang, {adminName}</p>} */}
      <ul>
        <li>
          <Link to="/admin/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/admin/remaja">Nutrisi Remaja</Link>
        </li>
        <li>
          <Link to="/admin/lansia">Nutrisi Lansia</Link>
        </li>
        <li>
          <Link to="/admin/ibu_hamil">Nutrisi Ibu Hamil</Link>
        </li>
        <li>
          <Link to="/admin/ibu_menyusui">Nutrisi Ibu Menyusui</Link>
        </li>
        <li>
          <Link to="/admin/berita">Data Artikel</Link>
        </li>
        <li>
          <Link to="/admin/data_user">Data User</Link>
        </li>
        <li>
          <Link to="/admin/penyakit">Data Penyakit</Link>
        </li>
        <li>
          <Link to="/admin/nutrisi">Data Nutrisi</Link>
        </li>
        <li>
          <Link to="/admin/video">Data Video</Link>
        </li>
        <li>
          <Link to="/admin/map">Data Map</Link>
        </li>
        <li>
          <Link to="/admin/map_asi_eksklusif">Data Map ASI Eksklusif</Link>
        </li>
        <li>
          <Link to="/admin/map_pangan">Data Map Katidakcukupan Pangan</Link>
        </li>
        <li>
          <Link to="/admin/map_gizi_balita">Data Map Katidakcukupan Gizi Balita Kab. Madiun</Link>
        </li>
        {/* <li>
          <Link to="/admin/berita_lansia">Data Berita Lansia</Link>
        </li> */}
        {/* <li>
          <Link to="/admin/kalkulator_gizi">Data Kalkulator Gizi</Link>
        </li> */}
      </ul>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Sidebar;
