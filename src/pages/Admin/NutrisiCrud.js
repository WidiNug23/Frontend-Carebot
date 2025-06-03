import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';

function NutrisiCrud() {
  const [data, setData] = useState([]);
  const [penyakitData, setPenyakitData] = useState([]);
  const [newData, setNewData] = useState({
    penyakit_id: '',
    nutrisi: '',
    jumlah: '',
    makanan: '',
    kategori_user: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editId, setEditId] = useState(null);

  // States for sorting and filtering
  const [filterPenyakit, setFilterPenyakit] = useState('');
  const [filterKategori, setFilterKategori] = useState('');

  useEffect(() => {
    fetchData();
    fetchPenyakitData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('https://carebot.tifpsdku.com/backend/nutrisi');
      setData(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Gagal memuat data. Silakan coba lagi.');
    }
  };

  const fetchPenyakitData = async () => {
    try {
      const response = await axios.get('https://carebot.tifpsdku.com/backend/penyakit');
      setPenyakitData(response.data);
    } catch (error) {
      console.error('Error fetching penyakit data:', error);
      setError('Gagal memuat data penyakit. Silakan coba lagi.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'penyakit_filter') {
      setFilterPenyakit(value);
    } else if (name === 'kategori_filter') {
      setFilterKategori(value);
    }
  };

  const validateInput = () => {
    if (!newData.penyakit_id || !newData.nutrisi || !newData.jumlah || !newData.makanan || !newData.kategori_user) {
      setError('Semua bidang wajib diisi.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleCreate = async () => {
    if (!validateInput()) return;

    try {
      const response = await axios.post('https://carebot.tifpsdku.com/backend/nutrisi', newData);
      setData((prevData) => [...prevData, response.data]);
      clearForm();
      setSuccess('Data berhasil ditambahkan.');
    } catch (error) {
      console.error('Error creating data:', error);
      setError('Gagal menambahkan data. Silakan coba lagi.');
    }
  };

  const handleEdit = (item) => {
    const penyakit = penyakitData.find((p) => p.nama_penyakit === item.nama_penyakit);

    setEditId(item.id);
    setNewData({
      penyakit_id: item.penyakit_id || (penyakit ? penyakit.id : ''),
      nutrisi: item.nutrisi,
      jumlah: item.jumlah,
      makanan: item.makanan,
      kategori_user: item.kategori_user
    });
  };

  const handleUpdate = async () => {
    if (!validateInput()) return;

    try {
      const response = await axios.put(`https://carebot.tifpsdku.com/backend/nutrisi/${editId}`, newData);
      setData(data.map((item) => (item.id === editId ? response.data : item)));
      clearForm();
      setSuccess('Data berhasil diperbarui.');
    } catch (error) {
      console.error('Error updating data:', error);
      setError('Gagal memperbarui data.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Anda yakin ingin menghapus data ini?')) return;

    try {
      const response = await axios.delete(`https://carebot.tifpsdku.com/backend/nutrisi/delete/${id}`);
      if (response.status === 200 || response.status === 204) {
        setData(data.filter((item) => item.id !== id));
        setSuccess('Data berhasil dihapus.');
      }
    } catch (error) {
      console.error('Error deleting data:', error);
      setError('Gagal menghapus data. Silakan coba lagi.');
    }
  };

  const clearForm = () => {
    setNewData({ penyakit_id: '', nutrisi: '', jumlah: '', makanan: '', kategori_user: '' });
    setEditId(null);
    setError(null);
    setSuccess(null);
  };

  const filteredData = data.filter(item => {
    return (
      (filterPenyakit ? item.nama_penyakit === filterPenyakit : true) &&
      (filterKategori ? item.kategori_user === filterKategori : true)
    );
  });

  return (
    <div className="crud-container">
      <h2>Kelola Data Nutrisi</h2>
      {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
      {success && <p className="success" style={{ color: 'green' }}>{success}</p>}

      {/* Filter Section */}
      <div className="filters">
        <select name="penyakit_filter" value={filterPenyakit} onChange={handleFilterChange}>
        <option value="">Filter berdasarkan Penyakit</option>
          <option value="Diabetes">Diabetes</option>
          <option value="Hipertensi">Hipertensi</option>
          <option value="Kolesterol Tinggi">Kolesterol Tinggi</option>
          <option value="Jantung">Jantung</option>
        </select>

        <select name="kategori_filter" value={filterKategori} onChange={handleFilterChange}>
          <option value="">Filter berdasarkan Kategori</option>
          <option value="Remaja">Remaja</option>
          <option value="Lansia">Lansia</option>
          <option value="Ibu Hamil">Ibu Hamil</option>
          <option value="Ibu Menyusui">Ibu Menyusui</option>
        </select>
      </div>

      <div className="crud-form">
        <select name="penyakit_id" value={newData.penyakit_id} onChange={handleInputChange}>
          <option value="">Pilih Penyakit</option>
          {penyakitData.map((penyakit) => (
            <option key={penyakit.id} value={penyakit.id}>
              {penyakit.nama_penyakit}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="nutrisi"
          placeholder="Nama Nutrisi"
          value={newData.nutrisi}
          onChange={handleInputChange}
        />

        <input
          type="text"
          name="jumlah"
          placeholder="Jumlah"
          value={newData.jumlah}
          onChange={handleInputChange}
        />

        <input
          type="text"
          name="makanan"
          placeholder="Makanan"
          value={newData.makanan}
          onChange={handleInputChange}
        />

        <select name="kategori_user" value={newData.kategori_user} onChange={handleInputChange}>
          <option value="">Pilih Kategori User</option>
          <option value="Remaja">Remaja</option>
          <option value="Lansia">Lansia</option>
          <option value="Ibu Hamil">Ibu Hamil</option>
          <option value="Ibu Menyusui">Ibu Menyusui</option>
        </select>

        {editId ? (
          <>
            <button onClick={handleUpdate}>Perbarui Data</button>
            <button onClick={clearForm}>Batal</button>
          </>
        ) : (
          <button onClick={handleCreate}>Tambah Data</button>
        )}
      </div>

      <table>
        <thead>
          <tr>
            <th>Penyakit</th>
            <th>Nutrisi</th>
            <th>Jumlah</th>
            <th>Makanan</th>
            <th>Kategori User</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item) => (
            <tr key={item.id}>
              <td>{item.nama_penyakit}</td>
              <td>{item.nutrisi}</td>
              <td>{item.jumlah}</td>
              <td>{item.makanan}</td>
              <td>{item.kategori_user}</td>
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

export default NutrisiCrud;
