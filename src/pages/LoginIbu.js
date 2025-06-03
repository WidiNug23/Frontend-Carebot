import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import CustomAlert from "../components/CustomAlert";
import "./LoginIbu.css";

function LoginIbu() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertData, setAlertData] = useState({ show: false, message: "", type: "alert", onConfirm: null });

  const navigate = useNavigate();
  const location = useLocation();

  // Ambil URL tujuan setelah login
  const redirectTo = new URLSearchParams(location.search).get("redirect") || "/";

  // Handle perubahan input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Toggle visibilitas password
  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  // Fungsi menampilkan custom alert
  const showAlert = (message, type = "alert", onConfirm = null) => {
    setAlertData({ show: true, message, type, onConfirm });
  };

  // Tutup alert
  const closeAlert = () => {
    setAlertData({ ...alertData, show: false });
  };

  // Handle submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validasi input
    if (!formData.email || !formData.password) {
      showAlert("Email dan password harus diisi!", "alert");
      return;
    }

    setLoading(true); // Tampilkan loading

    try {
      const response = await axios.post("https://carebot.tifpsdku.com/backend/ibu/login", formData, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("Login Response:", response.data);

      if (response.data.message === "Login successful") {
        localStorage.setItem(
          "loggedInUser",
          JSON.stringify({
            id: response.data.ibu.id,
            nama: response.data.ibu.nama,
            email: response.data.ibu.email,
            kategori: response.data.ibu.kategori,
            gender: response.data.ibu.gender,
            umur: response.data.ibu.umur,
            trimester: response.data.ibu.trimester,
            umurMenyusui: response.data.ibu.umurMenyusui,
            riwayatPenyakit: response.data.ibu.riwayatPenyakit,
            tanggal_signup: response.data.ibu.tanggal_signup,
          })
        );

        showAlert("Berhasil Login!", "alert", () => {
          navigate(redirectTo);
          window.location.reload();
        });
      }
    } catch (err) {
      console.error("Error:", err.response || err);
      setError(err.response?.data?.message || "Gagal login, coba lagi.");
      showAlert(err.response?.data?.message || "Gagal login, coba lagi.", "alert");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <CustomAlert show={alertData.show} message={alertData.message} type={alertData.type} onClose={closeAlert} onConfirm={alertData.onConfirm} />

      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" onChange={handleInputChange} value={formData.email} required />

        <div className="input-container">
          <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" onChange={handleInputChange} value={formData.password} required />
          <span className="show-password" onClick={togglePasswordVisibility}>
            {showPassword ? "🔓" : "🔒"}
          </span>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Login"}
        </button>
      </form>

<div className="signup-link">
  <p>
    <Link to="/forgot-password">Lupa Password?</Link>
  </p>
</div>
<div className="signup-link">
  <p>
    Don't have an account? <Link to="/signup">Sign up here</Link>
  </p>
</div>
    </div>
  );
}

export default LoginIbu;