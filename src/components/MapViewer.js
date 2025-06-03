import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

const MapViewer = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapData, setMapData] = useState([]);
  const [error, setError] = useState('');

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
        const response = await axios.get('https://carebot.tifpsdku.com/backend/api/map');
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
        center: new L.LatLng(-1.5, 117.0), // Koordinat default
        zoom: 5,
      });

      mapRef.current = map;

      const osmLayer = new L.TileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
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
            .bindPopup(`<strong>${data.name}</strong><br>${data.description}`);
        });
      });
    }
  }, [mapData]);

  // Tambahkan marker dari database setiap mapData berubah
  useEffect(() => {
    if (!mapRef.current) return;

    // Bersihkan semua marker lama dari database
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current.removeLayer(layer);
      }
    });

    // Tambahkan ulang marker dari database
    mapData.forEach((data) => {
      const marker = L.marker([data.latitude, data.longitude], { icon: customIcon })
        .addTo(mapRef.current)
        .bindPopup(`<strong>${data.name}</strong><br>${data.description}`)
        .bindTooltip(
          `<strong>${data.name}</strong><br>${data.description}`,
          {
            permanent: false,
            sticky: true,
            direction: 'top',
            opacity: 0.9,
            offset: [0, -10],
          }
        );
    });
  }, [mapData]);

  return (
    <div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div
  ref={mapContainerRef}
  style={{
    height: '50vh',
    width: '100%',
    position: 'relative', // posisi relatif agar bisa ditumpuki elemen lain
    zIndex: 1 // 👈 ini kuncinya! biar maps tidak di atas chatbot
  }}
/>

    </div>
  );
};

export default MapViewer;
