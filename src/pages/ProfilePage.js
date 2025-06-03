import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ProfilePage.css";

function ProfilePage() {
  const [ibu, setIbu] = useState(null);
  const [kalkulatorData, setKalkulatorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updatedIbu, setUpdatedIbu] = useState({});

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedUser && loggedUser.id) {
      setIbu(loggedUser);
      setUpdatedIbu(loggedUser);
      fetchKalkulatorData(loggedUser.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchKalkulatorData = async (ibuId) => {
    try {
      const response = await axios.get("https://carebot.tifpsdku.com/backend/kalkulator_gizi");
      const filteredData = response.data.filter((item) => item.ibu_id === ibuId);
      setKalkulatorData(filteredData);
    } catch (error) {
      console.error("Error fetching kalkulator data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedIbu((prevIbu) => {
      const updatedData = { ...prevIbu, [name]: value };

      // If category changes to "Ibu Hamil" or "Ibu Menyusui", remove gender and age
      if (name === "kategori" && (value === "Ibu Hamil" || value === "Ibu Menyusui")) {
        delete updatedData.gender;
        delete updatedData.umur;
        delete updatedData.trimester;
        delete updatedData.umurMenyusui;
      } else if (name === "kategori" && value !== "Ibu Hamil" && value !== "Ibu Menyusui") {
        // Reset the age and trimester/menyusui values when switching away from pregnancy categories
        updatedData.trimester = '';
        updatedData.umurMenyusui = '';
      }

      return updatedData;
    });
  };

  const handleSaveChanges = async () => {
    try {
      const response = await axios.put(
        `https://carebot.tifpsdku.com/backend/ibu/${ibu.id}`,
        updatedIbu, 
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Response update:", response.data);

      setIbu(response.data);
      localStorage.setItem("loggedInUser", JSON.stringify(response.data));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error.response?.data || error);
      alert(`Terjadi kesalahan: ${error.response?.data?.message || "Server tidak merespons"}`);
    }
  };

  // Function to determine age options based on category
  const getAgeOptions = (kategori) => {
    switch (kategori) {
      case "Remaja":
        return ["10-12 Tahun", "13-15 Tahun", "16-18 Tahun", "19-29 Tahun"];
      case "Lansia":
        return ["30-49 Tahun", "50-64 Tahun", "65-80 Tahun", "80+ Tahun"];
      case "Ibu Hamil":
        return ["Trimester 1", "Trimester 2", "Trimester 3"];
      case "Ibu Menyusui":
        return ["6 Bulan Pertama", "6 Bulan Kedua"];
      default:
        return [];
    }
  };

  // Check if gender and age selection should be hidden based on the selected category
  const isGenderHidden = updatedIbu.kategori === "Ibu Hamil" || updatedIbu.kategori === "Ibu Menyusui";
  const isTrimesterVisible = updatedIbu.kategori === "Ibu Hamil";
  const isUmurMenyusuiVisible = updatedIbu.kategori === "Ibu Menyusui";
  const isAgeVisible = updatedIbu.kategori === "Remaja" || updatedIbu.kategori === "Lansia";

  return (
    <div className="profile-page">
      <div className="profile-info">
        <h2>Informasi Profil</h2>
        {ibu ? (
          <>
            {ibu.nama && (
              <div className="profile-row">
                <div className="profile-label">Nama:</div>
                <div className="profile-value">{ibu.nama}</div>
              </div>
            )}
            {ibu.email && (
              <div className="profile-row">
                <div className="profile-label">Email:</div>
                <div className="profile-value">{ibu.email}</div>
              </div>
            )}
            {ibu.kategori && (
              <div className="profile-row">
                <div className="profile-label">Kategori:</div>
                <div className="profile-value">{ibu.kategori}</div>
              </div>
            )}
            {!isGenderHidden && ibu.gender && (
              <div className="profile-row">
                <div className="profile-label">Gender:</div>
                <div className="profile-value">{ibu.gender}</div>
              </div>
            )}
            {ibu.umur && isAgeVisible && (
              <div className="profile-row">
                <div className="profile-label">Umur:</div>
                <div className="profile-value">{ibu.umur}</div>
              </div>
            )}
            {isTrimesterVisible && ibu.trimester && (
              <div className="profile-row">
                <div className="profile-label">Trimester:</div>
                <div className="profile-value">{ibu.trimester}</div>
              </div>
            )}
            {isUmurMenyusuiVisible && ibu.umurMenyusui && (
              <div className="profile-row">
                <div className="profile-label">Umur Menyusui:</div>
                <div className="profile-value">{ibu.umurMenyusui}</div>
              </div>
            )}
            <button className="edit-button" onClick={() => setIsEditModalOpen(true)}>Edit</button>
          </>
        ) : (
          <p>Data pengguna tidak ditemukan.</p>
        )}
      </div>

{/* Edit Modal */}
{isEditModalOpen && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>Edit Profil</h3>
      {ibu.nama && (
        <>
          <label>Nama:</label>
          <input
            type="text"
            name="nama"
            value={updatedIbu.nama || ""}
            onChange={handleInputChange}
          />
        </>
      )}
      {ibu.email && (
        <>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={updatedIbu.email || ""}
            onChange={handleInputChange}
          />
        </>
      )}
      {ibu.kategori && (
        <>
          <label>Pilih Kategori:</label>
          <select name="kategori" value={updatedIbu.kategori || ""} onChange={handleInputChange}>
            <option value="" disabled selected>Pilih Kategori</option> {/* Non-selectable option */}
            <option value="Remaja">Remaja</option>
            <option value="Lansia">Lansia</option>
            <option value="Ibu Hamil">Ibu Hamil</option>
            <option value="Ibu Menyusui">Ibu Menyusui</option>
          </select>
        </>
      )}
      {!isGenderHidden && (
        <>
          <label>Gender:</label>
          <select name="gender" value={updatedIbu.gender || ""} onChange={handleInputChange}>
            <option value="" disabled selected>Pilih Gender</option> {/* Non-selectable option */}
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </>
      )}
      {isAgeVisible && (
        <>
          <label>Pilih Umur:</label>
          <select name="umur" value={updatedIbu.umur || ""} onChange={handleInputChange}>
            <option value="" disabled selected>Pilih Umur</option> {/* Non-selectable option */}
            {getAgeOptions(updatedIbu.kategori).map((age, index) => (
              <option key={index} value={age}>{age}</option>
            ))}
          </select>
        </>
      )}
      {isTrimesterVisible && (
        <>
          <label>Pilih Trimester:</label>
          <select name="trimester" value={updatedIbu.trimester || ""} onChange={handleInputChange}>
            <option value="" disabled selected>Pilih Trimester</option> {/* Non-selectable option */}
            {getAgeOptions("Ibu Hamil").map((age, index) => (
              <option key={index} value={age}>{age}</option>
            ))}
          </select>
        </>
      )}
      {isUmurMenyusuiVisible && (
        <>
          <label>Pilih Umur Menyusui:</label>
          <select name="umurMenyusui" value={updatedIbu.umurMenyusui || ""} onChange={handleInputChange}>
            <option value="" disabled selected>Pilih Umur Menyusui</option> {/* Non-selectable option */}
            {getAgeOptions("Ibu Menyusui").map((age, index) => (
              <option key={index} value={age}>{age}</option>
            ))}
          </select>
        </>
      )}
      <div className="modal-buttons">
        <button onClick={handleSaveChanges}>Simpan</button>
        <button onClick={() => setIsEditModalOpen(false)}>Tutup</button>
      </div>
    </div>
  </div>
)}



      <div className="kalkulator-results">
        <h2>Hasil Perhitungan Nutrisi</h2>
        {kalkulatorData.length > 0 ? (
          kalkulatorData.map((item, index) => (
            <div key={index} className="result-item">
              <p>
                <strong>Total Daily Energy Expenditure (TDEE):</strong> {item.tdee} kcal
              </p>
              <p className="carbs-text">
                <strong>Karbohidrat:</strong> {item.carbs} g
              </p>
              <p className="protein-text">
                <strong>Protein:</strong> {item.protein} g
              </p>
              <p className="fat-text">
                <strong>Lemak:</strong> {item.fat} g
              </p>

              <div className="stat-bar-container">
                <div className="stat-bar carbs" style={{ width: `${item.carbs}%` }}></div>
                <div className="stat-bar protein" style={{ width: `${item.protein}%` }}></div>
                <div className="stat-bar fat" style={{ width: `${item.fat}%` }}></div>
              </div>
            </div>
          ))
        ) : (
          <p>Belum ada hasil perhitungan.</p>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
