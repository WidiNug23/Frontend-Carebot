import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import './RemajaCrud.css';

function RemajaCrud() {
  const [data, setData] = useState([]);
  const [newData, setNewData] = useState({
    nutrisi: '',
    sumber: '',
    jumlah: '',
    deskripsi: '',
    gender: '',
    umur: ''
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
      const response = await axios.get('https://carebot.tifpsdku.com/backend/remaja');
      setData(response.data);
      setError(null);
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
    if (!newData.nutrisi || !newData.sumber || !newData.jumlah || !newData.deskripsi || !newData.gender || !newData.umur) {
      setError('Semua bidang wajib diisi.');
      return false;
    }
    setError(null);
    return true;
  };

  // Create new data
  const handleCreate = async () => {
    if (!validateInput()) return;

    try {
      const response = await axios.post('https://carebot.tifpsdku.com/backend/remaja', newData);
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
      nutrisi: item.nutrisi,
      sumber: item.sumber,
      jumlah: item.jumlah,
      deskripsi: item.deskripsi,
      gender: item.gender,
      umur: item.umur
    });
    setSuccess(null);
    setError(null);
  };

  // Update data
  const handleUpdate = async () => {
    if (!validateInput()) return;

    try {
      const response = await axios.put(`https://carebot.tifpsdku.com/backend/remaja/${editId}`, newData);
      setData(data.map((item) => (item.id === editId ? response.data : item)));
      clearForm();
      setSuccess('Data berhasil diperbarui.');
    } catch (error) {
      console.error('Error updating data:', error);
      setError('Gagal memperbarui data. Silakan coba lagi.');
    }
  };

  // Delete data
  const handleDelete = async (id) => {
    if (!window.confirm('Anda yakin ingin menghapus data ini?')) return;

    try {
      const response = await axios.delete(`https://carebot.tifpsdku.com/backend/remaja/delete/${id}`);
      if (response.status === 200 || response.status === 204) {
        setData(data.filter((item) => item.id !== id));
        setSuccess('Data berhasil dihapus.');
      }
    } catch (error) {
      console.error('Error deleting data:', error);
      setError('Gagal menghapus data. Silakan coba lagi.');
    }
  };

  // Clear form and messages
  const clearForm = () => {
    setNewData({ nutrisi: '', sumber: '', jumlah: '', deskripsi: '', gender: '', umur: '' });
    setEditId(null);
    setError(null);
    setSuccess(null);
  };

  // Generate payload from data
  const generatePayload = () => {
    const payloadData = {
      richContent: [
        [
          {
            subtitle: "Berikut adalah informasi nutrisi yang dibutuhkan",
            type: "list",
            title: "Informasi Nutrisi"
          },
          { type: "divider" },
          ...data.map(item => ({
            subtitle: `${item.sumber} - ${item.jumlah} | Gender: ${item.gender} | Umur: ${item.umur}`,
            type: "list",
            title: item.nutrisi
          })),
        ]
      ]
    };
    setPayload(JSON.stringify(payloadData, null, 2));
  };

  // Copy payload to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(payload).then(() => {
      alert('Payload tersalin!');
    }, (err) => {
      console.error('Error copying payload:', err);
    });
  };

  return (
    <div className="crud-container">
      <h2>Kelola Data Nutrisi Remaja</h2>
      {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
      {success && <p className="success" style={{ color: 'green' }}>{success}</p>}
      
      <div className="crud-form">
        <input
          type="text"
          name="nutrisi"
          placeholder="Nutrisi"
          value={newData.nutrisi}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="sumber"
          placeholder="Sumber"
          value={newData.sumber}
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
          name="deskripsi"
          placeholder="Deskripsi"
          value={newData.deskripsi}
          onChange={handleInputChange}
        />
        <select
          name="gender"
          value={newData.gender}
          onChange={handleInputChange}
        >
          <option value="">Pilih Gender</option>
          <option value="Laki-laki">Laki-laki</option>
          <option value="Perempuan">Perempuan</option>
        </select>
        <select name="umur" value={newData.umur} onChange={handleInputChange}>
          <option value="">Pilih Umur</option>
          <option value="10 – 12 tahun">10 – 12 tahun</option>
          <option value="13 – 15 tahun">13 – 15 tahun</option>
          <option value="16 – 18 tahun">16 – 18 tahun</option>
          <option value="19 – 29 tahun">19 – 29 tahun</option>
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
      
      {/* <button onClick={generatePayload}>Generate Payload</button>
      <button onClick={copyToClipboard} disabled={!payload}>Salin Payload</button> */}
      
      {payload && (
        <pre style={{ background: '#f4f4f4', padding: '10px', marginTop: '10px' }}>
          {payload}
        </pre>
      )}

      <table>
        <thead>
          <tr>
            {/* <th>ID</th> */}
            <th>Nutrisi</th>
            <th>Sumber</th>
            <th>Jumlah</th>
            <th>Deskripsi</th>
            <th>Gender</th>
            <th>Umur</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              {/* <td>{item.id}</td> */}
              <td>{item.nutrisi}</td>
              <td>{item.sumber}</td>
              <td>{item.jumlah}</td>
              <td>{item.deskripsi}</td>
              <td>{item.gender}</td>
              <td>{item.umur}</td>
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

export default RemajaCrud;
