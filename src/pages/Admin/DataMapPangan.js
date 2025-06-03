import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

const DataMapPangan = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const tempMarkerRef = useRef(null); // 👉 untuk menyimpan marker sementara
  const [latitude, setLatitude] = useState(-1.5);
  const [longitude, setLongitude] = useState(117.0);
  const [provinsi, setProvinsi] = useState('');
  const [tahun, setTahun] = useState('');
  const [kode_wilayah, setKodeWilayah] = useState('');
  const [prevalensi, setPrevalensi] = useState('');
  const [jumlah_penduduk, setJumlahPenduduk] = useState('');
  const [penduduk_undernourish, setPendudukUndernourish] = useState('');
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
        const response = await axios.get('https://carebot.tifpsdku.com/backend/api/map_pangan');
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

// Tambahan useEffect agar marker berpindah saat input latitude/longitude berubah
useEffect(() => {
  if (!mapRef.current) return;

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  // Validasi angka
  if (isNaN(lat) || isNaN(lng)) return;

  // Hapus marker sebelumnya jika ada
  if (tempMarkerRef.current) {
    mapRef.current.removeLayer(tempMarkerRef.current);
  }

  // Tambahkan marker baru dan pindahkan ke koordinat
  const marker = L.marker([lat, lng], { icon: customIcon }).addTo(mapRef.current);
  tempMarkerRef.current = marker;

  // Geser tampilan peta ke lokasi baru
  mapRef.current.setView([lat, lng], mapRef.current.getZoom());
}, [latitude, longitude]); // Berjalan setiap lat/lng berubah

  

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
        response = await axios.put(`https://carebot.tifpsdku.com/backend/api/map_pangan/${editingData.id_map_pangan}`, {
          provinsi,
          tahun,
          kode_wilayah,
          prevalensi,
          jumlah_penduduk,
          penduduk_undernourish,
          latitude,
          longitude,
        });
      } else {
        response = await axios.post('https://carebot.tifpsdku.com/backend/api/map_pangan', {
            provinsi,
            tahun,
            kode_wilayah,
            prevalensi,
            jumlah_penduduk,
            penduduk_undernourish,
            latitude,
            longitude,
        });
      }

      if (response.status === 200) {
        alert('Data berhasil disimpan!');
        setProvinsi('');
        setTahun('');
        setKodeWilayah('');
        setPrevalensi('');
        setJumlahPenduduk('');
        setPendudukUndernourish('');
        setLatitude(-1.5);
        setLongitude(117.0);
        setEditingData(null);

        // Ambil data terbaru
        const fetchData = await axios.get('https://carebot.tifpsdku.com/backend/api/map_pangan');
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
    setProvinsi(data.provinsi);
    setTahun(data.tahun);
    setKodeWilayah(data.kode_wilayah);
    setPrevalensi(data.prevalensi);
    setJumlahPenduduk(data.jumlah_penduduk);
    setPendudukUndernourish(data.penduduk_undernourish);
    setLatitude(data.latitude);
    setLongitude(data.longitude);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus data ini?')) {
      try {
        const response = await axios.delete(`https://carebot.tifpsdku.com/backend/api/map_pangan/${id}`);
        if (response.status === 200) {
          alert('Data berhasil dihapus!');
          const fetchData = await axios.get('https://carebot.tifpsdku.com/backend/api/map_pangan');
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
            value={provinsi}
            onChange={(e) => setProvinsi(e.target.value)}
            placeholder="Nama Provinsi"
            required
          />
        </div>
        <div>
          <input
            type="text"
            value={tahun}
            onChange={(e) => setTahun(e.target.value)}
            placeholder="Tahun"
            required
          />
        </div>
        <div>
          <input
            type="text"
            value={kode_wilayah}
            onChange={(e) => setKodeWilayah(e.target.value)}
            placeholder="Kode Wilayah"
            required
          />
        </div>
        <div>
          <input
            type="text"
            value={prevalensi}
            onChange={(e) => setPrevalensi(e.target.value)}
            placeholder="Prevalence of Undernourishment (PoU)"
            required
          />
        </div>
        <div>
          <input
            type="text"
            value={jumlah_penduduk}
            onChange={(e) => setJumlahPenduduk(e.target.value)}
            placeholder="Jumlah Penduduk"
            required
          />
        </div>
        <div>
          <input
            type="text"
            value={penduduk_undernourish}
            onChange={(e) => setPendudukUndernourish(e.target.value)}
            placeholder="Jumlah Penduduk Undernourish"
            required
          />
        </div>
        <div>
          <input
            type="text"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="Latitude"
            required
          />
        </div>
        <div>
          <input
            type="text"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="Longitude"
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
            <li key={data.id_map_pangan}>
            {data.provinsi} - {data.tahun} - {data.kode_wilayah} - {data.prevalensi} - {data.jumlah_penduduk} - {data.penduduk_undernourish} - {data.latitude}, {data.longitude}
            <button onClick={() => handleEdit(data)}>Edit</button>
            <button onClick={() => handleDelete(data.id_map_pangan)}>Hapus</button>
          </li>          
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DataMapPangan;
