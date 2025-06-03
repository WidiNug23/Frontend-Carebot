import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

const DataMapGiziBalita = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const tempMarkerRef = useRef(null);

  // State form input
  const [latitude, setLatitude] = useState(-1.5);
  const [longitude, setLongitude] = useState(117.0);
  const [tahun, setTahun] = useState('');
  const [kodeKecamatan, setKodeKecamatan] = useState('');
  const [namaKecamatan, setNamaKecamatan] = useState('');
  const [beratBalitaKurang, setBeratBalitaKurang] = useState('');
  const [balitaPendek, setBalitaPendek] = useState('');
  const [giziKurang, setGiziKurang] = useState('');
  const [geojsonFile, setGeojsonFile] = useState(null); // file geojson

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingData, setEditingData] = useState(null);

  // Data map dari backend
  const [mapData, setMapData] = useState([]);

  const customIcon = new L.Icon({
    iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
  });

  const getColorByGiziKurang = (value) => {
    const val = parseInt(value);
    if (val <= 100) return 'green';
    if (val <= 200) return 'yellow';
    return 'red';
  };

  // Ambil data map dari backend
  const fetchMapData = async () => {
    try {
      const response = await axios.get('https://carebot.tifpsdku.com/backend/api/map_gizi_balita');
      if (response.data.status === 'success') {
        setMapData(response.data.data);
      } else {
        setError('Gagal mengambil data peta: ' + response.data.message);
      }
    } catch {
      setError('Gagal mengambil data peta');
    }
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  // Inisialisasi map dan render ulang tiap mapData berubah
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView([latitude, longitude], 5);
      mapRef.current = map;

      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data © OpenStreetMap contributors',
      }).addTo(map);

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        setLatitude(lat);
        setLongitude(lng);

        if (tempMarkerRef.current) map.removeLayer(tempMarkerRef.current);

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        tempMarkerRef.current = marker;
      });
    } else if (mapRef.current) {
      // Bersihkan layer geojson dan marker sebelumnya
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.GeoJSON || (layer instanceof L.Marker && layer !== tempMarkerRef.current)) {
          mapRef.current.removeLayer(layer);
        }
      });

      // Render ulang semua layer dari mapData
      mapData.forEach((data) => {
        if (data.latitude && data.longitude) {
          L.marker([data.latitude, data.longitude], { icon: customIcon })
            .addTo(mapRef.current)
            .bindPopup(`<strong>${data.nama_kecamatan}</strong><br>Tahun: ${data.tahun}`);
        }

        if (data.geojson) {
          const color = getColorByGiziKurang(data.gizi_kurang);

          const geoLayer = L.geoJSON(data.geojson, {
            style: {
              color: color,
              weight: 2,
              fillOpacity: 0.5,
            },
            onEachFeature: (feature, layer) => {
              layer.bindPopup(`<strong>${data.nama_kecamatan}</strong><br>Gizi Kurang: ${data.gizi_kurang}`);
            }
          });

          geoLayer.addTo(mapRef.current);
        }
      });
    }
  }, [mapData]);

  // Update marker posisi saat latitude/longitude berubah (input manual / klik map)
  useEffect(() => {
    if (!mapRef.current) return;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) return;

    if (tempMarkerRef.current) {
      mapRef.current.removeLayer(tempMarkerRef.current);
    }

    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(mapRef.current);
    tempMarkerRef.current = marker;
    mapRef.current.setView([lat, lng], mapRef.current.getZoom());
  }, [latitude, longitude]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isNaN(latitude) || isNaN(longitude)) {
      setError('Latitude dan Longitude harus berupa angka');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('tahun', tahun);
    formData.append('kode_kecamatan', kodeKecamatan);
    formData.append('nama_kecamatan', namaKecamatan);
    formData.append('berat_balita_kurang', beratBalitaKurang);
    formData.append('balita_pendek', balitaPendek);
    formData.append('gizi_kurang', giziKurang);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);

    if (geojsonFile) {
      formData.append('geojson', geojsonFile);
    }

    try {
      let response;

      if (editingData) {
        // Pakai POST dengan override _method=PUT untuk mengatasi axios.put multipart di PHP
        formData.append('_method', 'PUT');

        response = await axios.post(
          `https://carebot.tifpsdku.com/backend/api/map_gizi_balita/${editingData.id_map_balita}`, 
          formData, 
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      } else {
        response = await axios.post(
          'https://carebot.tifpsdku.com/backend/api/map_gizi_balita', 
          formData, 
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }

      if (response.status === 200) {
        alert('Data berhasil disimpan!');
        resetForm();
        await fetchMapData();
      } else {
        setError('Gagal menyimpan data: ' + (response.data.message || ''));
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form dan editing state
  const resetForm = () => {
    setTahun('');
    setKodeKecamatan('');
    setNamaKecamatan('');
    setBeratBalitaKurang('');
    setBalitaPendek('');
    setGiziKurang('');
    setLatitude(-1.5);
    setLongitude(117.0);
    setGeojsonFile(null);
    setEditingData(null);
    if (tempMarkerRef.current) {
      mapRef.current.removeLayer(tempMarkerRef.current);
      tempMarkerRef.current = null;
    }
  };

  // Saat tombol edit diklik
  const handleEdit = (data) => {
    setEditingData(data);
    setTahun(data.tahun || '');
    setKodeKecamatan(data.kode_kecamatan || '');
    setNamaKecamatan(data.nama_kecamatan || '');
    setBeratBalitaKurang(data.berat_balita_kurang || '');
    setBalitaPendek(data.balita_pendek || '');
    setGiziKurang(data.gizi_kurang || '');
    setLatitude(parseFloat(data.latitude) || -1.5);
    setLongitude(parseFloat(data.longitude) || 117.0);
    setGeojsonFile(null); // reset file karena tidak bisa set nilai file input
  };

  // Hapus data
  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus data ini?')) {
      try {
        const response = await axios.delete(`https://carebot.tifpsdku.com/backend/api/map_gizi_balita/${id}`);
        if (response.status === 200) {
          alert('Data berhasil dihapus!');
          await fetchMapData();
        }
      } catch {
        setError('Gagal menghapus data.');
      }
    }
  };

  return (
    <div>
      <h3>{editingData ? 'Edit Lokasi Balita' : 'Tambah Lokasi Baru Balita'}</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" value={tahun} onChange={e => setTahun(e.target.value)} placeholder="Tahun" required />
        <input type="text" value={kodeKecamatan} onChange={e => setKodeKecamatan(e.target.value)} placeholder="Kode Kecamatan" required />
        <input type="text" value={namaKecamatan} onChange={e => setNamaKecamatan(e.target.value)} placeholder="Nama Kecamatan" required />
        <input type="number" value={beratBalitaKurang} onChange={e => setBeratBalitaKurang(e.target.value)} placeholder="Berat Balita Kurang" required />
        <input type="number" value={balitaPendek} onChange={e => setBalitaPendek(e.target.value)} placeholder="Balita Pendek" required />
        <input type="number" value={giziKurang} onChange={e => setGiziKurang(e.target.value)} placeholder="Gizi Kurang" required />
        <input type="number" value={latitude} onChange={e => setLatitude(e.target.value)} placeholder="Latitude" step="any" required />
        <input type="number" value={longitude} onChange={e => setLongitude(e.target.value)} placeholder="Longitude" step="any" required />
        <input type="file" accept=".geojson,application/json" onChange={e => setGeojsonFile(e.target.files[0])} />
        <button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : (editingData ? 'Update Data' : 'Tambah Data')}</button>
        {editingData && <button type="button" onClick={resetForm}>Batal Edit</button>}
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div ref={mapContainerRef} style={{ height: '400px', marginTop: '20px' }} />

      <h4>Daftar Data</h4>
      <ul>
        {mapData.map((item) => (
          <li key={item.id_map_balita}>
            {item.nama_kecamatan} - Tahun {item.tahun} - Gizi Kurang: {item.gizi_kurang}
            <button onClick={() => handleEdit(item)}>Edit</button>
            <button onClick={() => handleDelete(item.id_map_balita)}>Hapus</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DataMapGiziBalita;
