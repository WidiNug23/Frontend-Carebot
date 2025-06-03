import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
// import './PenyakitCrud.css';

function PenyakitCrud() {
  const [data, setData] = useState([]);
  const [newData, setNewData] = useState({
    nama_penyakit: '',
    deskripsi: ''
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
      const response = await axios.get('https://carebot.tifpsdku.com/backend/penyakit');
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
    if (!newData.nama_penyakit || !newData.deskripsi) {
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
      const response = await axios.post('https://carebot.tifpsdku.com/backend/penyakit', newData);
      setData((prevData) => [...prevData, response.data]);
      clearForm();
      setSuccess('Data berhasil ditambahkan.');
    } catch (error) {
      console.error('Error creating data:', error.response ? error.response.data : error);
      setError('Gagal menambahkan data. Silakan coba lagi.');
    }
  };
  
  // Edit existing data
  const handleEdit = (item) => {
    setEditId(item.id);
    setNewData({
      nama_penyakit: item.nama_penyakit,
      deskripsi: item.deskripsi
    });
    setSuccess(null);
    setError(null);
  };

  // Update data
  const handleUpdate = async () => {
    if (!validateInput()) return;

    try {
      const response = await axios.put(`https://carebot.tifpsdku.com/backend/penyakit/${editId}`, newData);
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
      const response = await axios.delete(`https://carebot.tifpsdku.com/backend/penyakit/delete/${id}`);
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
    setNewData({ nama_penyakit: '', deskripsi: '' });
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
            subtitle: "Berikut adalah daftar penyakit",
            type: "list",
            title: "Penyakit"
          },
          { type: "divider" },
          ...data.map(item => ({
            subtitle: item.deskripsi,
            type: "list",
            title: item.nama_penyakit
          }))
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
      <h2>Kelola Data Penyakit</h2>
      {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
      {success && <p className="success" style={{ color: 'green' }}>{success}</p>}

      <div className="crud-form">
        <input
          type="text"
          name="nama_penyakit"
          placeholder="Nama Penyakit"
          value={newData.nama_penyakit}
          onChange={handleInputChange}
        />
        <textarea
          name="deskripsi"
          placeholder="Deskripsi"
          value={newData.deskripsi}
          onChange={handleInputChange}
        />
        {editId ? (
          <>
            <button onClick={handleUpdate}>Perbarui Data</button>
            <button onClick={clearForm}>Batal</button>
          </>
        ) : (
          <button onClick={handleCreate}>Tambah Data</button>
        )}
      </div>

      {payload && (
        <pre style={{ background: '#f4f4f4', padding: '10px', marginTop: '10px' }}>
          {payload}
        </pre>
      )}

      <table>
        <thead>
          <tr>
            <th>Nama Penyakit</th>
            <th>Deskripsi</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.nama_penyakit}</td>
              <td>{item.deskripsi}</td>
              <td>
                <button onClick={() => handleEdit(item)}>Edit</button>
                <button onClick={() => handleDelete(item.id)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Optional: Button to generate and copy payload */}
      {/* <button onClick={generatePayload}>Generate Payload</button> */}
      {/* <button onClick={copyToClipboard} disabled={!payload}>Salin Payload</button> */}
    </div>
  );
}

export default PenyakitCrud;
