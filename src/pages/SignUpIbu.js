import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./SignUpIbu.css";

function SignUpIbu() {
  const [newData, setNewData] = useState({
    nama: "",
    email: "",
    password: "",
    kategori: "",
    gender: "",
    umur: "",
    trimester: "",
    umurMenyusui: "",
    riwayatPenyakit: [],
    riwayatPenyakitLainnya: "",
  });

  const [showPassword, setShowPassword] = useState(false); // 🔹 Tambahkan state untuk lihat password
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      const updatedPenyakit = [...newData.riwayatPenyakit];
      if (checked) {
        updatedPenyakit.push(value);
      } else {
        const index = updatedPenyakit.indexOf(value);
        updatedPenyakit.splice(index, 1);
      }
      setNewData((prevData) => ({ ...prevData, riwayatPenyakit: updatedPenyakit }));
    } else {
      setNewData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const validateInput = () => {
    if (!newData.nama || !newData.email || newData.password.length < 6 || !newData.kategori) {
      setError("Silakan isi semua field dengan benar.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleCreate = async () => {
    if (!validateInput()) return;

    try {
      const formattedPenyakit = [...newData.riwayatPenyakit];
      if (newData.riwayatPenyakitLainnya) {
        formattedPenyakit.push(newData.riwayatPenyakitLainnya);
      }

      const formData = {
        ...newData,
        riwayatPenyakit: formattedPenyakit.join(", "),
        tanggal_signup: new Date().toISOString(),
      };

      const response = await axios.post("https://carebot.tifpsdku.com/backend/ibu/signup", formData, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data && response.data.message) {
        setSuccess(response.data.message);
        navigate("/login");
      } else {
        setError("Terjadi kesalahan, coba lagi.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mendaftar, coba lagi nanti.");
    }
  };

  return (
    <div className="signup-form">
      <h2>Sign Up</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreate();
        }}
      >
        <input type="text" name="nama" placeholder="Nama" onChange={handleInputChange} value={newData.nama} required />
        <input type="email" name="email" placeholder="Email" onChange={handleInputChange} value={newData.email} required />
        <div className="input-container">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            onChange={handleInputChange}
            value={newData.password}
            required
          />
          <span className="show-password" onClick={togglePasswordVisibility}>
            {showPassword ? "🔓" : "🔒"}
          </span>
        </div>

        <select name="kategori" onChange={handleInputChange} value={newData.kategori} required>
          <option value="">Pilih Kategori</option>
          <option value="Remaja">Remaja</option>
          <option value="Lansia">Lansia</option>
          <option value="Ibu Hamil">Ibu Hamil</option>
          <option value="Ibu Menyusui">Ibu Menyusui</option>
        </select>

        {newData.kategori === "Remaja" && (
          <>
            <select name="gender" onChange={handleInputChange} value={newData.gender} required>
              <option value="">Pilih Gender</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
            <select name="umur" onChange={handleInputChange} value={newData.umur} required>
              <option value="">Pilih Umur</option>
              <option value="10-12 Tahun">10-12 Tahun</option>
              <option value="13-15 Tahun">13-15 Tahun</option>
              <option value="16-18 Tahun">16-18 Tahun</option>
              <option value="19-29 Tahun">19-29 Tahun</option>
            </select>
          </>
        )}

        {newData.kategori === "Lansia" && (
          <>
            <select name="gender" onChange={handleInputChange} value={newData.gender} required>
              <option value="">Pilih Gender</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
            <select name="umur" onChange={handleInputChange} value={newData.umur} required>
              <option value="">Pilih Umur</option>
              <option value="30-49 Tahun">30-49 Tahun</option>
              <option value="50-64 Tahun">50-64 Tahun</option>
              <option value="65-80 Tahun">65-80 Tahun</option>
              <option value="80+ Tahun">80+ Tahun</option>
            </select>
          </>
        )}

        {newData.kategori === "Ibu Hamil" && (
          <select name="trimester" onChange={handleInputChange} value={newData.trimester} required>
            <option value="">Pilih Trimester</option>
            <option value="Trimester 1">Trimester 1</option>
            <option value="Trimester 2">Trimester 2</option>
            <option value="Trimester 3">Trimester 3</option>
          </select>
        )}

        {newData.kategori === "Ibu Menyusui" && (
          <select name="umurMenyusui" onChange={handleInputChange} value={newData.umurMenyusui} required>
            <option value="">Pilih Durasi Menyusui</option>
            <option value="6 Bulan Pertama">6 Bulan Pertama</option>
            <option value="6 Bulan Kedua">6 Bulan Kedua</option>
          </select>
        )}

        <div className="health-history">
          <label>Riwayat Penyakit</label>
          <label>
            <input type="checkbox" name="riwayatPenyakit" value="Diabetes" onChange={handleInputChange} /> Diabetes
          </label>
          <label>
            <input type="checkbox" name="riwayatPenyakit" value="Hipertensi" onChange={handleInputChange} /> Hipertensi
          </label>
          <label>
            <input type="checkbox" name="riwayatPenyakit" value="Kolesterol Tinggi" onChange={handleInputChange} /> Kolesterol Tinggi
          </label>
          <label>
            <input type="checkbox" name="riwayatPenyakit" value="Jantung" onChange={handleInputChange} /> Jantung
          </label>
          <input type="text" name="riwayatPenyakitLainnya" placeholder="Penyakit Lainnya" value={newData.riwayatPenyakitLainnya} onChange={handleInputChange} />
        </div>

        <button type="submit">Sign Up</button>
      </form>

      {/* 🔹 Tautan ke Login */}
      <p className="login-link">
        Sudah Punya Akun? <a href="/login">Login Di Sini</a>
      </p>
    </div>
  );
}

export default SignUpIbu;
