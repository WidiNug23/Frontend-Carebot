import React, { useState, useEffect } from 'react';
import axios from 'axios';

function KalkulatorCrud() {
  const [data, setData] = useState([]);
  const [newData, setNewData] = useState({ 
    gender: '', 
    weight: '', 
    height: '', 
    age: '', 
    activity_level: '' 
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('https://carebot.tifpsdku.com/backend/kalkulator_gizi');
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

  const validateInput = () => {
    const { gender, weight, height, age, activity_level } = newData;
    if (!gender || !weight || !height || !age || !activity_level) {
      setError('Semua bidang wajib diisi.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleCreate = async () => {
    if (!validateInput()) return;

    try {
      const response = await axios.post('https://carebot.tifpsdku.com/backend/kalkulator_gizi/calculate', newData);
      setData((prevData) => [...prevData, response.data]);
      clearForm();
      setSuccess('Data berhasil ditambahkan.');
    } catch (error) {
      console.error('Error creating data:', error);
      setError('Gagal menambahkan data. Silakan coba lagi.');
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setNewData({
        gender: item.gender,
        weight: item.weight,
        height: item.height,
        age: item.age,
        activity_level: item.activity_level,
    });
    setSuccess(null);
    setError(null);
};

const handleUpdate = async () => {
    if (!validateInput()) return;

    try {
        const response = await axios.put(`https://carebot.tifpsdku.com/backend/kalkulator_gizi/${editId}`, newData);
        setData((prevData) => 
            prevData.map((item) => (item.id === editId ? response.data : item))
        );
        clearForm();
        setSuccess('Data berhasil diperbarui.');
    } catch (error) {
        console.error('Error updating data:', error);
        // Provide more context in the error message
        const errorMessage = error.response?.data?.error || 'Gagal memperbarui data. Silakan coba lagi.';
        setError(errorMessage);
    }
};

  const handleDelete = async (id) => {
    if (!window.confirm('Anda yakin ingin menghapus data ini?')) return;

    try {
      await axios.delete(`https://carebot.tifpsdku.com/backend/kalkulator_gizi/delete/${id}`);
      setData(data.filter((item) => item.id !== id));
      setSuccess('Data berhasil dihapus.');
    } catch (error) {
      console.error('Error deleting data:', error);
      setError('Gagal menghapus data. Silakan coba lagi.');
    }
  };

  const clearForm = () => {
    setNewData({ gender: '', weight: '', height: '', age: '', activity_level: '' });
    setEditId(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="crud-container">
      <h2>Kelola Data Kebutuhan Gizi</h2>
      {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
      {success && <p className="success" style={{ color: 'green' }}>{success}</p>}
      
      <div className="crud-form">
        <input
          type="text"
          name="gender"
          placeholder="Gender"
          value={newData.gender}
          onChange={handleInputChange}
        />
        <input
          type="number" // Change type to 'number' for better validation
          name="weight"
          placeholder="Berat (kg)"
          value={newData.weight}
          onChange={handleInputChange}
        />
        <input
          type="number" // Change type to 'number' for better validation
          name="height"
          placeholder="Tinggi (cm)"
          value={newData.height}
          onChange={handleInputChange}
        />
        <input
          type="number" // Change type to 'number' for better validation
          name="age"
          placeholder="Usia (tahun)"
          value={newData.age}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="activity_level"
          placeholder="Tingkat Aktivitas"
          value={newData.activity_level}
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

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Gender</th>
            <th>Berat</th>
            <th>Tinggi</th>
            <th>Usia</th>
            <th>Tingkat Aktivitas</th>
            <th>TDEE</th>
            <th>Karbohidrat</th>
            <th>Protein</th>
            <th>Fat</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.gender}</td>
              <td>{item.weight}</td>
              <td>{item.height}</td>
              <td>{item.age}</td>
              <td>{item.activity_level}</td>
              <td>{item.tdee}</td>
              <td>{item.carbohydrates}</td>
              <td>{item.protein}</td>
              <td>{item.fat}</td>
              <td>
                {/* <button onClick={() => handleEdit(item)}>Edit</button> */}
                <button onClick={() => handleDelete(item.id)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default KalkulatorCrud;
