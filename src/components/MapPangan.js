import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const MapPangan = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapData, setMapData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showTable, setShowTable] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const grouped = mapData.reduce((acc, item) => {
      if (!acc[item.tahun]) acc[item.tahun] = [];
      acc[item.tahun].push(parseFloat(item.prevalensi));
      return acc;
    }, {});

    const result = Object.entries(grouped).map(([tahun, values]) => ({
      tahun,
      rataRataPrevalensi: (
        values.reduce((a, b) => a + b, 0) / values.length
      ).toFixed(2),
    }));

    result.sort((a, b) => parseInt(a.tahun) - parseInt(b.tahun));
    setChartData(result);
  }, [mapData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://carebot.tifpsdku.com/backend/api/map_pangan');
        setMapData(response.data);
        setFilteredData(response.data);
      } catch (error) {
        setError('Gagal mengambil data peta');
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = new L.Map(mapContainerRef.current, {
        center: new L.LatLng(-1.5, 117.0),
        zoom: 5,
      });

      mapRef.current = map;

      const legend = L.control({ position: 'bottomright' });

      legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        const grades = [
          { label: 'Sangat Baik (PoU < 5%)', color: '#2ECC71' },
          { label: 'Sedang (PoU < 10%)', color: '#F1C40F' },
          { label: 'Buruk (PoU ≥ 10%)', color: '#E74C3C' },
        ];

        div.style.background = 'white';
        div.style.padding = '10px';
        div.style.borderRadius = '8px';
        div.style.boxShadow = '0 0 6px rgba(0,0,0,0.2)';
        div.style.fontSize = '13px';

        grades.forEach((item) => {
          div.innerHTML += `
            <div style="display: flex; align-items: center; margin-bottom: 6px;">
              <div style="width: 16px; height: 16px; background:${item.color}; margin-right: 8px; border-radius: 50%; border: 1px solid #ccc;"></div>
              ${item.label}
            </div>
          `;
        });

        return div;
      };

      legend.addTo(map);

      const osmLayer = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data © OpenStreetMap contributors',
      });

      map.addLayer(osmLayer);
    }
  }, []);

  const getColorByPrevalensi = (prevalensi) => {
    if (prevalensi < 5) return '#2ECC71';
    if (prevalensi < 10) return '#F1C40F';
    if (prevalensi < 20) return '#E67E22';
    return '#E74C3C';
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Hapus layer marker dan circle sebelumnya agar tidak menumpuk
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Circle || layer instanceof L.Marker) {
        mapRef.current.removeLayer(layer);
      }
    });

    filteredData.forEach((data) => {
      const prevalensi = parseFloat(data.prevalensi);
      const color = getColorByPrevalensi(prevalensi);

      const popupContent = `
        <strong>Provinsi:</strong> ${data.provinsi}<br/>
        <strong>Tahun:</strong> ${data.tahun}<br/>
        <strong>Kode Wilayah:</strong> ${data.kode_wilayah}<br/>
        <strong>Jumlah Penduduk:</strong> ${data.jumlah_penduduk}<br/>
        <strong>Penduduk Undernourish:</strong> ${data.penduduk_undernourish}<br/>
        <strong>Prevalensi:</strong> ${data.prevalensi}%
      `;

      L.circle([data.latitude, data.longitude], {
        radius: 90000,
        color: color,
        fillColor: color,
        weight: 1,
        fillOpacity: 0.5,
      }).addTo(mapRef.current)
        .bindPopup(popupContent)
        .bindTooltip(popupContent, {
          permanent: false,
          sticky: true,
          direction: 'top',
          opacity: 0.9,
          offset: [0, -10],
        });

      const coloredIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="
            background-color: ${color};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 4px rgba(0,0,0,0.5);
          "></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker([data.latitude, data.longitude], { icon: coloredIcon })
        .addTo(mapRef.current)
        .bindPopup(popupContent)
        .bindTooltip(popupContent, {
          permanent: false,
          sticky: true,
          direction: 'top',
          opacity: 0.9,
          offset: [0, -10],
        });
    });
  }, [filteredData]);

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);

    const sorted = [...filteredData].sort((a, b) => {
      const valA = parseFloat(a[field]);
      const valB = parseFloat(b[field]);
      return order === 'asc' ? valA - valB : valB - valA;
    });

    setFilteredData(sorted);
  };

  const handleRowClick = (data) => {
    if (!mapRef.current) return;

    const popupContent = `
      <strong>Provinsi:</strong> ${data.provinsi}<br/>
      <strong>Tahun:</strong> ${data.tahun}<br/>
      <strong>Kode Wilayah:</strong> ${data.kode_wilayah}<br/>
      <strong>Jumlah Penduduk:</strong> ${data.jumlah_penduduk}<br/>
      <strong>Penduduk Undernourish:</strong> ${data.penduduk_undernourish}<br/>
      <strong>Prevalensi:</strong> ${data.prevalensi}%
    `;

    const color = getColorByPrevalensi(parseFloat(data.prevalensi));

    L.marker([data.latitude, data.longitude], {
      icon: L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="
            background-color: ${color};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 4px rgba(0,0,0,0.5);
          "></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      })
    }).addTo(mapRef.current)
      .bindPopup(popupContent)
      .openPopup();

    const latlng = L.latLng(data.latitude, data.longitude);
    const map = mapRef.current;

    const point = map.latLngToContainerPoint(latlng);
    const offsetPoint = L.point(point.x - -20, point.y - 10);
    const targetLatLng = map.containerPointToLatLng(offsetPoint);

    map.setView(targetLatLng, 8);
  };

  const handleYearChange = (event) => {
    const selectedYear = event.target.value;
    setSelectedYear(selectedYear);

    if (selectedYear === '') {
      setFilteredData(mapData);
    } else {
      const filtered = mapData.filter((data) => data.tahun === selectedYear);
      setFilteredData(filtered);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h3 style={{ marginBottom: '10px' }}>Grafik Rata-rata Prevalensi per Tahun</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="tahun" />
          <YAxis label={{ value: 'Prevalensi (%)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Line type="monotone" dataKey="rataRataPrevalensi" stroke="#E74C3C" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>

      <label htmlFor="yearFilter" style={{ marginRight: '8px' }}>Pilih Tahun: </label>
      <select
        id="yearFilter"
        value={selectedYear}
        onChange={handleYearChange}
        style={{
          padding: '8px',
          fontSize: '14px',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        <option value="">Semua Tahun</option>
        {[2018, 2019, 2020, 2021, 2022, 2023, 2024].map((year) => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>

      <div
        ref={mapContainerRef}
        style={{
          height: '500px',
          marginTop: '20px',
          borderRadius: '8px',
          boxShadow: '0 0 10px rgba(0,0,0,0.15)',
          zIndex: 2
        }}
      />

      <button
        onClick={() => setShowTable(!showTable)}
        style={{
          marginTop: '20px',
          padding: '12px 24px',
          backgroundColor: '#3498DB',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '16px',
        }}
      >
        {showTable ? 'Sembunyikan Tabel Data' : 'Tampilkan Tabel Data'}
      </button>

      {showTable && (
        <div
          style={{
            marginTop: '20px',
            maxHeight: '400px',
            overflowY: 'auto',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            borderRadius: '8px',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#3498DB', color: 'white' }}>
                <th
                  style={{ padding: '12px', cursor: 'pointer' }}
                  onClick={() => handleSort('provinsi')}
                >
                  Provinsi
                </th>
                <th
                  style={{ padding: '12px', cursor: 'pointer' }}
                  onClick={() => handleSort('tahun')}
                >
                  Tahun
                </th>
                <th style={{ padding: '12px' }}>Kode Wilayah</th>
                <th
                  style={{ padding: '12px', cursor: 'pointer' }}
                  onClick={() => handleSort('jumlah_penduduk')}
                >
                  Jumlah Penduduk
                </th>
                <th
                  style={{ padding: '12px', cursor: 'pointer' }}
                  onClick={() => handleSort('penduduk_undernourish')}
                >
                  Penduduk Undernourish
                </th>
                <th
                  style={{ padding: '12px', cursor: 'pointer' }}
                  onClick={() => handleSort('prevalensi')}
                >
                  Prevalensi (%)
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr
                  key={index}
                  onClick={() => handleRowClick(item)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white',
                  }}
                >
                  <td style={{ padding: '8px' }}>{item.provinsi}</td>
                  <td style={{ padding: '8px' }}>{item.tahun}</td>
                  <td style={{ padding: '8px' }}>{item.kode_wilayah}</td>
                  <td style={{ padding: '8px' }}>{item.jumlah_penduduk}</td>
                  <td style={{ padding: '8px' }}>{item.penduduk_undernourish}</td>
                  <td style={{ padding: '8px' }}>{item.prevalensi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '20px', color: 'red' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default MapPangan;
