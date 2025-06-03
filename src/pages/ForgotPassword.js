import axios from "axios";
import { useState } from "react";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // State untuk loading

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true); // Aktifkan loading saat tombol ditekan

    try {
      const response = await axios.post(
        "https://carebot.tifpsdku.com/backend/forgot-password",
        JSON.stringify({ email }),
        { headers: { "Content-Type": "application/json" } }
      );

      setMessage(response.data.message);
    } catch (error) {
      console.error("Error response:", error.response);
      setError(error.response?.data?.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false); // Matikan loading setelah proses selesai
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Lupa Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <input
            type="email"
            placeholder="Masukkan email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Mengirim..." : "Kirim Reset Link"}
        </button>
      </form>
      <p className="info-text">
        Apabila Pesan Masuk Ke Spam, Pilih <b>'Laporkan Bukan Phising'</b>
      </p>
      {message && <p className="message success">{message}</p>}
      {error && <p className="message error">{error}</p>}
    </div>
  );
}

export default ForgotPassword;
