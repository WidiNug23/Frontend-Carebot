import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DataUser() {
  const [data, setData] = useState([]);
  const [newData, setNewData] = useState({
    nama: '',           // Mengubah dari nutrisi ke nama
    email: '',          // Menambah email
    password: '',       // Menambah password
    kategori: '',       // Menambah kategori
    gender: '',         // Menambah gender
    umur: '',           // Menambah umur
    trimester: '',      // Menambah trimester
    umurMenyusui: '',    // Menambah umur menyusui
    riwayatPenyakit: '',
    tanggal_signup:''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editId, setEditId] = useState(null);
  const [payload, setPayload] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch data function
  const fetchData = async () => {
    try {
      const response = await axios.get('https://carebot.tifpsdku.com/backend/datauser');
      setData(response.data);
      setError(null); // Clear any previous error
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Gagal memuat data. Silakan coba lagi.');
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Validate data input
  const validateInput = () => {
    if (!newData.nama || !newData.email || !newData.password || !newData.kategori 
      // || !newData.gender || !newData.umur || !newData.trimester || !newData.umurMenyusui || !newData.riwayatPenyakit
    ) {
      setError('Semua bidang wajib diisi.');
      return false;
    }
    setError(null); // Clear error if validation passes
    return true;
  };

  // Create new data
  const handleCreate = async () => {
    const minimalData = {
      nama: newData.nama,
      email: newData.email,
      password: newData.password,
      kategori: newData.kategori,
    };
  
    try {
      const response = await axios.post('https://carebot.tifpsdku.com/backend/datauser', minimalData);
      setData((prevData) => [...prevData, response.data]);
      clearForm();
      setSuccess('Data berhasil ditambahkan.');
    } catch (error) {
      console.error('Error creating data:', error);
      setError('Gagal menambahkan data. Silakan coba lagi.');
    }
  };
  

  // Edit existing data
  const handleEdit = (item) => {
    setEditId(item.id);
    setNewData({
      nama: item.nama,
      email: item.email,
      password: item.password,
      kategori: item.kategori,
      gender: item.gender,
      umur: item.umur,
      trimester: item.trimester,
      umurMenyusui: item.umurMenyusui,
      riwayatPenyakit: item.riwayatPenyakit
    });
    setSuccess(null);
    setError(null);
  };

  // Update data
  // Update handler functions
const handleUpdate = async () => {
    if (!validateInput()) return;
  
    try {
      const response = await axios.post(`https://carebot.tifpsdku.com/backend/datauser/${editId}`, newData);
      setData((prevData) =>
        prevData.map((item) => (item.id === editId ? response.data : item))
      );
      clearForm();
      setSuccess('Data berhasil diperbarui.');
    } catch (error) {
      console.error('Error updating data:', error);
      setError('Gagal memperbarui data. Silakan coba lagi.');
    }
  };
  
  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm('Anda yakin ingin menghapus data ini?')) return;
  
    try {
      await axios.delete(`https://carebot.tifpsdku.com/backend/datauser/delete/${id}`);
      setData((prevData) => prevData.filter((item) => item.id !== id));
      setSuccess('Data berhasil dihapus.');
    } catch (error) {
      console.error('Error deleting data:', error);
      setError('Gagal menghapus data. Silakan coba lagi.');
    }
  };
  

  // Clear form and messages
  const clearForm = () => {
    setNewData({
      nama: '', email: '', password: '', kategori: '', gender: '', umur: '', trimester: '', umurMenyusui: '', riwayatPenyakit: ''
    });
    setEditId(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="crud-container">
      <h2>Kelola Data User</h2>
      {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
      {success && <p className="success" style={{ color: 'green' }}>{success}</p>}
      
      <div className="crud-form">
        <input
          type="text"
          name="nama"
          placeholder="Nama"
          value={newData.nama}
          onChange={handleInputChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={newData.email}
          onChange={handleInputChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={newData.password}
          onChange={handleInputChange}
        />
        <input
          type="kategori"
          name="kategori"
          placeholder="Kategori"
          value={newData.kategori}
          onChange={handleInputChange}
        />
        {/* <input
          type="text"
          name="gender"
          placeholder="Gender"
          value={newData.gender}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="umur"
          placeholder="Umur"
          value={newData.umur}
          onChange={handleInputChange}
        />
        <select
          name="trimester"
          value={newData.trimester}
          onChange={handleInputChange}
        >
          <option value="">Pilih Trimester</option>
          <option value="Trimester 1">Trimester 1</option>
          <option value="Trimester 2">Trimester 2</option>
          <option value="Trimester 3">Trimester 3</option>
        </select>
        <input
          type="json"
          name="riwayatPenyakit"
          placeholder="Riwayat Penyakit"
          value={newData.riwayatPenyakit}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="umurMenyusui"
          placeholder="Umur Menyusui"
          value={newData.umurMenyusui}
          onChange={handleInputChange}
        /> */}

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
            <th>Nama</th>
            <th>Email</th>
            <th>Kategori</th>
            <th>Gender</th>
            <th>Umur</th>
            <th>Trimester</th>
            <th>Umur Menyusui</th>
            <th>Riwayat Penyakit</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.nama}</td>
              <td>{item.email}</td>
              <td>{item.kategori}</td>
              <td>{item.gender}</td>
              <td>{item.umur}</td>
              <td>{item.trimester}</td>
              <td>{item.umurMenyusui}</td>
              <td>{item.riwayatPenyakit}</td>
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

export default DataUser;
