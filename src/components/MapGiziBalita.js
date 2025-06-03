import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import './MapGiziBalita.css';

const MapGiziBalita = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const getColorByGiziKurang = (jumlah) => {
    const val = Number(jumlah);
    if (isNaN(val)) return '#999999';
    if (val <= 100) return '#2ECC71';
    if (val <= 200) return '#F1C40F';
    return '#E74C3C';
  };

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView([-7.6301, 111.5236], 11);
      mapRef.current = map;

            // Buat pane baru untuk geojson dan beri zIndex lebih rendah
      map.createPane('geojsonPane');
      map.getPane('geojsonPane').style.zIndex = 399; // Lebih rendah dari default overlay pane (zIndex 400)


      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data © OpenStreetMap contributors',
      }).addTo(map);

      const legend = L.control({ position: 'bottomright' });
      legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.background = 'white';
        div.style.padding = '10px';
        div.style.borderRadius = '8px';
        div.style.boxShadow = '0 0 6px rgba(0,0,0,0.2)';
        div.style.fontSize = '13px';

        const grades = [
          { label: 'Gizi Kurang ≤ 100 (Baik)', color: '#2ECC71' },
          { label: 'Gizi Kurang 101-200 (Sedang)', color: '#F1C40F' },
          { label: 'Gizi Kurang ≥ 201 (Buruk)', color: '#E74C3C' },
        ];

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
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://carebot.tifpsdku.com/backend/api/map_gizi_balita/');
        const apiData = response.data;

        if (apiData.status === 'success' && Array.isArray(apiData.data) && apiData.data.length > 0) {
          setAllData(apiData.data);
          const uniqueYears = Array.from(new Set(apiData.data.map(item => item.tahun))).sort();
          setYears(uniqueYears);
          setSelectedYear('');
          setError('');
        } else {
          setError('Data API tidak valid atau kosong');
          setAllData([]);
          setYears([]);
          setSelectedYear('');
        }
      } catch (error) {
        setError('Gagal mengambil data peta');
        setAllData([]);
        setYears([]);
        setSelectedYear('');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!allData || allData.length === 0) {
      setFilteredData([]);
      setGeoJsonData(null);
      return;
    }

    const filteredApiData = selectedYear
      ? allData.filter(item => item.tahun === selectedYear)
      : allData;

    const allFeatures = filteredApiData.flatMap(item => {
      const geojson = item.geojson;
      if (
        geojson &&
        geojson.type === 'FeatureCollection' &&
        Array.isArray(geojson.features)
      ) {
        return geojson.features.map(feature => ({
          ...feature,
          properties: {
            ...feature.properties,
            gizi_kurang: item.gizi_kurang,
            berat_balita_kurang: item.berat_balita_kurang,
            balita_pendek: item.balita_pendek,
            tahun: item.tahun,
            kode_kecamatan: item.kode_kecamatan,
            nama_kecamatan: item.nama_kecamatan
          }
        }));
      } else {
        return [];
      }
    });

    const mergedGeoJson = {
      type: 'FeatureCollection',
      features: allFeatures
    };

    setGeoJsonData(mergedGeoJson);

    const tableData = filteredApiData.map(item => ({
      tahun: item.tahun,
      kode_kecamatan: item.kode_kecamatan,
      nama_kecamatan: item.nama_kecamatan,
      berat_balita_kurang: item.berat_balita_kurang,
      balita_pendek: item.balita_pendek,
      gizi_kurang: item.gizi_kurang
    }));

    setFilteredData(tableData);
  }, [allData, selectedYear]);

  useEffect(() => {
    if (!mapRef.current || !geoJsonData) return;

    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.GeoJSON) {
        mapRef.current.removeLayer(layer);
      }
    });

    const styleFeature = (feature) => {
      const jumlah = Number(feature.properties?.gizi_kurang);
      const fillColor = getColorByGiziKurang(jumlah);
      return {
        color: 'white',
        weight: 1,
        fillColor,
        fillOpacity: 0.7,
      };
    };

    const onEachFeature = (feature, layer) => {
      const props = feature.properties || {};
      const popupContent = `
        <strong>${props.nama_kecamatan || 'Kecamatan'}</strong><br/>
        <strong>Tahun:</strong> ${props.tahun || '-'}<br/>
        <strong>Kode Kecamatan:</strong> ${props.kode_kecamatan || '-'}<br/>
        <strong>Balita Gizi Kurang:</strong> ${props.gizi_kurang || '-'}<br/>
        <strong>Balita Pendek:</strong> ${props.balita_pendek || '-'}<br/>
        <strong>Berat Badan Kurang:</strong> ${props.berat_balita_kurang || '-'}
      `;
      layer.bindPopup(popupContent);
      layer.bindTooltip(props.nama_kecamatan, {
        permanent: false,
        sticky: true,
        direction: 'top',
        offset: [0, -10],
      });
    };

    L.geoJSON(geoJsonData, {
      style: styleFeature,
      onEachFeature,
      pane: 'geojsonPane'
    }).addTo(mapRef.current);

    if (geoJsonData.features.length > 0) {
      mapRef.current.fitBounds(L.geoJSON(geoJsonData).getBounds());
    }
  }, [geoJsonData]);

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);

    const sorted = [...filteredData].sort((a, b) => {
      let valA = a[field];
      let valB = b[field];

      if (valA === undefined || valA === null) valA = order === 'asc' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
      if (valB === undefined || valB === null) valB = order === 'asc' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

      const numA = parseFloat(valA);
      const numB = parseFloat(valB);

      if (!isNaN(numA) && !isNaN(numB)) {
        return order === 'asc' ? numA - numB : numB - numA;
      } else {
        return order === 'asc'
          ? valA.toString().localeCompare(valB.toString())
          : valB.toString().localeCompare(valA.toString());
      }
    });

    setFilteredData(sorted);
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Peta Gizi Balita</h2>
      {loading && <p>Loading data...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="filterYear" style={{ marginRight: '10px' }}>
          Filter Tahun:
        </label>
        <select
          id="filterYear"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          style={{ padding: '5px 10px' }}
        >
          <option value="">Semua Tahun</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div
        ref={mapContainerRef}
        style={{ height: '500px', marginBottom: '30px', border: '1px solid #ddd',  zIndex: 2 }}
      ></div>

      <div style={{ marginBottom: '10px' }}>
        <label>Tampilkan </label>
        <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select> entri per halaman
      </div>

      <table border="1" cellPadding="8" cellSpacing="0" width="100%">
        <thead>
          <tr>
            <th onClick={() => handleSort('tahun')}>Tahun</th>
            <th onClick={() => handleSort('kode_kecamatan')}>Kode</th>
            <th onClick={() => handleSort('nama_kecamatan')}>Kecamatan</th>
            <th onClick={() => handleSort('berat_balita_kurang')}>Berat Kurang</th>
            <th onClick={() => handleSort('balita_pendek')}>Balita Pendek</th>
            <th onClick={() => handleSort('gizi_kurang')}>Gizi Kurang</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((item, index) => (
            <tr key={`${item.kode_kecamatan}-${index}`}>
              <td>{item.tahun}</td>
              <td>{item.kode_kecamatan}</td>
              <td>{item.nama_kecamatan}</td>
              <td>{item.berat_balita_kurang}</td>
              <td>{item.balita_pendek}</td>
              <td>{item.gizi_kurang}</td>
            </tr>
          ))}
        </tbody>
      </table>

          <div className="pagination-controls">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="page-button"
            >
              Sebelumnya
            </button>
            <span>
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="page-button"
            >
              Berikutnya
            </button>
          </div>

    </div>
  );
};

export default MapGiziBalita;

