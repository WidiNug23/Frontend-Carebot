import React, { useState } from 'react';
import MapPangan from '../components/MapPangan';
import MapGiziBalita from '../components/MapGiziBalita';
import './Infografis.css';

const Infografis = () => {
  const [selectedMap, setSelectedMap] = useState(null);

  return (
    <div className="container">
      <h1 className="title">Infografis Peta Data</h1>
      <div className="card-container">
        <div
          className="card"
          onClick={() => setSelectedMap('pangan')}
        >
          <h3>Ketidakcukupan Konsumsi Pangan</h3>
          <p>Lihat peta provinsi yang mengalami ketidakcukupan konsumsi pangan tahun 2024.</p>
        </div>
        <div
          className="card"
          onClick={() => setSelectedMap('gizi')}
        >
          <h3>Status Gizi Balita</h3>
          <p>Lihat status gizi balita berdasarkan indeks menurut kecamatan di Kabupaten Madiun.</p>
        </div>
      </div>

      <div className="map-content">
        {selectedMap === 'pangan' && (
          <div>
            <h2>Peta Ketidakcukupan Konsumsi Pangan Tahun 2024</h2>
            <p>Data lokasi yang berkaitan dengan Ketidakcukupan Konsumsi Pangan.</p>
            <p>
              PoU/Prevalence of Undernourishment adalah proporsi populasi yang mengalami
              ketidakcukupan konsumsi energi di bawah kebutuhan minimum untuk hidup sehat dan aktif.
            </p>
            <MapPangan />
          </div>
        )}

        {selectedMap === 'gizi' && (
          <div>
            <h2>Status Gizi Balita Menurut Kecamatan</h2>
            <p>
              Dataset ini menampilkan jumlah status gizi balita berdasarkan indeks menurut kecamatan
              di Kabupaten Madiun Tahun 2020-2023.
            </p>
            <MapGiziBalita />
          </div>
        )}
      </div>
    </div>
  );
};
// Ya, ada korelasi yang kuat antara Peta Ketidakcukupan Konsumsi Pangan (PoU) dengan status gizi balita. Semakin tinggi ketidakcukupan konsumsi pangan (PoU), semakin tinggi pula risiko balita mengalami masalah gizi seperti stunting, wasting, dan underweight.

export default Infografis;
