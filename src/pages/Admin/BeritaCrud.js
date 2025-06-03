import React, { useState, useEffect } from 'react';
import axios from 'axios';

function BeritaCrud() {
  const [data, setData] = useState([]);
  const [newData, setNewData] = useState({
    id: null,
    judul: '',
    isi: '',
    kategori: '',
    image: null,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('https://carebot.tifpsdku.com/backend/berita');
      setData(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Gagal memuat data. Silakan coba lagi.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setNewData((prevData) => ({ ...prevData, image: e.target.files[0] }));
    }
  };

  const validateInput = () => {
    if (!newData.judul || !newData.isi || !newData.kategori) {
      setError('Semua bidang wajib diisi.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleCreateOrUpdate = async () => {
    if (!validateInput()) return;

    const formData = new FormData();
    formData.append('judul', newData.judul);
    formData.append('isi', newData.isi);
    formData.append('kategori', newData.kategori);
    if (newData.image) {
      formData.append('image', newData.image);
    }

    try {
      let response;
      if (newData.id) {
        // Update existing data
        response = await axios.put(`https://carebot.tifpsdku.com/backend/berita/${newData.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setData(data.map((item) => (item.id === newData.id ? response.data : item)));
        setSuccess('Data berhasil diperbarui.');
      } else {
        // Create new data
        response = await axios.post('https://carebot.tifpsdku.com/backend/berita', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setData((prevData) => [...prevData, response.data]);
        setSuccess('Data berhasil ditambahkan.');
      }
      clearForm();
    } catch (error) {
      console.error('Error creating or updating data:', error);
      setError('Gagal menyimpan data. Silakan coba lagi.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Anda yakin ingin menghapus data ini?')) return;

    try {
      await axios.delete(`https://carebot.tifpsdku.com/backend/berita/${id}`);
      setData(data.filter((item) => item.id !== id));
      setSuccess('Data berhasil dihapus.');
    } catch (error) {
      console.error('Error deleting data:', error);
      setError('Gagal menghapus data. Silakan coba lagi.');
    }
  };

  const clearForm = () => {
    setNewData({ id: null, judul: '', isi: '', kategori: '', image: null });
    setError(null);
    setSuccess(null);
  };

  const handleEdit = (item) => {
    setNewData({
      id: item.id,
      judul: item.judul,
      isi: item.isi,
      kategori: item.kategori,
      image: null, // Optional: If you want to handle image update separately
    });
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const filteredData = data
    .filter((item) => (filter ? item.kategori === filter : true))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const truncateText = (text, length) => {
    if (typeof text !== 'string') return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  return (
    <div className="crud-container">
      <h2>Kelola Data Artikel</h2>
      {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
      {success && <p className="success" style={{ color: 'green' }}>{success}</p>}

      <div className="crud-form">
        <input
          type="text"
          name="judul"
          placeholder="Judul"
          value={newData.judul}
          onChange={handleInputChange}
        />
        <textarea
          name="isi"
          placeholder="Isi"
          value={newData.isi}
          onChange={handleInputChange}
        />
        <select
          name="kategori"
          value={newData.kategori}
          onChange={handleInputChange}
        >
          <option value="">Pilih Kategori</option>
          <option value="remaja">Remaja</option>
          <option value="lansia">Lansia</option>
          <option value="ibu hamil">Ibu Hamil</option>
          <option value="ibu menyusui">Ibu Menyusui</option>
        </select>
        {/* <input type="file" name="image" onChange={handleFileChange} /> */}
        <button onClick={handleCreateOrUpdate}>
          {newData.id ? 'Update Data' : 'Tambah Data'}
        </button>
      </div>

      <div className="filter-section">
        <label htmlFor="filter">Filter Kategori:</label>
        <select id="filter" value={filter} onChange={handleFilterChange}>
          <option value="">Semua</option>
          <option value="remaja">Remaja</option>
          <option value="lansia">Lansia</option>
          <option value="ibu hamil">Ibu Hamil</option>
          <option value="ibu menyusui">Ibu Menyusui</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Judul</th>
            <th>Isi</th>
            <th>Kategori</th>
            {/* <th>Gambar</th> */}
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.judul}</td>
              <td>{truncateText(item.isi, 100)}</td>
              <td>{item.kategori}</td>
              {/* <td>
                {item.image ? (
                  <img
                    src={`https://carebot.tifpsdku.com/backend/uploads/${item.image}`}
                    alt={item.judul}
                    style={{ width: '100px', height: 'auto' }}
                  />
                ) : (
                  'Tidak ada gambar'
                )}
              </td> */}
              <td>
                <button onClick={() => handleEdit(item)}>Edit</button>
                <button onClick={() => handleDelete(item.id)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BeritaCrud;
