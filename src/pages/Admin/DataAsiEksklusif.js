import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

const DataAsiEksklusif = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const tempMarkerRef = useRef(null); // 👉 untuk menyimpan marker sementara
  const [latitude, setLatitude] = useState(-1.5);
  const [longitude, setLongitude] = useState(117.0);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingData, setEditingData] = useState(null);
  const [mapData, setMapData] = useState([]);

  const customIcon = new L.Icon({
    iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
  });

  // Fetch data dari backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://carebot.tifpsdku.com/backend/api/map_asi_eksklusif');
        setMapData(response.data);
      } catch (error) {
        setError('Gagal mengambil data peta');
      }
    };

    fetchData();
  }, []);

  // Inisialisasi peta
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = new L.Map(mapContainerRef.current, {
        center: new L.LatLng(latitude, longitude),
        zoom: 5,
      });

      mapRef.current = map;

      const osmLayer = new L.TileLayer(
        'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 18,
          attribution: 'Map data © OpenStreetMap contributors',
        }
      );
      map.addLayer(osmLayer);

      // Tampilkan marker dari database
      map.whenReady(() => {
        mapData.forEach((data) => {
          L.marker([data.latitude, data.longitude], { icon: customIcon })
            .addTo(map)
            .bindPopup(`<strong>${data.location}</strong><br>${data.description}`);
        });
      });

      // Event klik di peta
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        setLatitude(lat);
        setLongitude(lng);

        // Hapus marker sebelumnya jika ada
        if (tempMarkerRef.current) {
          map.removeLayer(tempMarkerRef.current);
        }

        // Tambahkan marker baru
        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        tempMarkerRef.current = marker;
      });
    }
  }, [mapData]);

  // Tambahkan marker dari database setiap mapData berubah
useEffect(() => {
    if (!mapRef.current) return;
  
    // Bersihkan semua marker lama dari database
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker && layer !== tempMarkerRef.current) {
        mapRef.current.removeLayer(layer);
      }
    });
  
    // Tambahkan ulang marker dari database
    mapData.forEach((data) => {
        const marker = L.marker([data.latitude, data.longitude], { icon: customIcon })
          .addTo(mapRef.current)
          .bindPopup(`<strong>${data.location}</strong><br>${data.description}`) // Untuk klik
          marker.bindTooltip(
            `<strong>${data.location}</strong><br>${data.description}`,
            {
              permanent: false,
              sticky: true,
              direction: 'top',
              opacity: 0.9,
              offset: [0, -10] // Menambahkan jarak vertikal ke atas (sesuaikan nilai -10)
            }
          );
          // Untuk hover
      });      
  }, [mapData]);
  

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isNaN(latitude) || isNaN(longitude)) {
      setError('Latitude dan Longitude harus berupa angka');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let response;
      if (editingData) {
        response = await axios.put(`https://carebot.tifpsdku.com/backend/api/map_asi_eksklusif/${editingData.id_asi_eksklusif}`, {
          location,
          latitude,
          longitude,
          description,
        });
      } else {
        response = await axios.post('https://carebot.tifpsdku.com/backend/api/map_asi_eksklusif', {
          location,
          latitude,
          longitude,
          description,
        });
      }

      if (response.status === 200) {
        alert('Data berhasil disimpan!');
        setLocation('');
        setLatitude(-1.5);
        setLongitude(117.0);
        setDescription('');
        setEditingData(null);

        // Ambil data terbaru
        const fetchData = await axios.get('https://carebot.tifpsdku.com/backend/api/map_asi_eksklusif');
        setMapData(fetchData.data);

        // Hapus marker sementara
        if (tempMarkerRef.current) {
          mapRef.current.removeLayer(tempMarkerRef.current);
          tempMarkerRef.current = null;
        }
      } else {
        setError('Terjadi kesalahan saat menyimpan data. Silakan coba lagi.');
      }
    } catch (error) {
      setError('Terjadi kesalahan saat menyimpan data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (data) => {
    setEditingData(data);
    setLocation(data.location);
    setLatitude(data.latitude);
    setLongitude(data.longitude);
    setDescription(data.description);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus data ini?')) {
      try {
        const response = await axios.delete(`https://carebot.tifpsdku.com/backend/api/map_asi_eksklusif/${id}`);
        if (response.status === 200) {
          alert('Data berhasil dihapus!');
          const fetchData = await axios.get('https://carebot.tifpsdku.com/backend/api/map_asi_eksklusif');
          setMapData(fetchData.data);
        } else {
          setError('Gagal menghapus data.');
        }
      } catch (error) {
        setError('Gagal menghapus data.');
      }
    }
  };

  return (
    <div>
      <h3>{editingData ? 'Edit Lokasi' : 'Tambah Lokasi Baru'}</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Nama Lokasi"
            required
          />
        </div>
        <div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi"
            required
          />
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <div>
          <button type="submit" disabled={loading}>
            {loading ? 'Menyimpan...' : editingData ? 'Perbarui Data' : 'Tambah Data'}
          </button>
        </div>
      </form>

      <div style={{ height: '400px', width: '100%', marginTop: '20px' }} ref={mapContainerRef} />

      <div>
        <h3>Data Lokasi Tersimpan</h3>
        <ul>
          {mapData.map((data) => (
            <li key={data.id_asi_eksklusif}>
            {data.location} - {data.latitude}, {data.longitude}
            <button onClick={() => handleEdit(data)}>Edit</button>
            <button onClick={() => handleDelete(data.id_asi_eksklusif)}>Hapus</button>
          </li>          
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DataAsiEksklusif;
