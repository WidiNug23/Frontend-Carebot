import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './Kalkulator.css';
import CustomAlert from "../components/CustomAlert";

const Kalkulator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasilRef = useRef(null);

  const [alertConfig, setAlertConfig] = useState({
    show: false,
    message: "",
    type: "",
    onConfirm: null,
  });

  const [nutrisi, setNutrisi] = useState([]);
  const [formData, setFormData] = useState({
    gender: '',
    weight: '',
    height: '',
    age: '',
    activity_level: ''
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  const handleProtectedInteraction = (e) => {
    const loggedUser = localStorage.getItem("loggedInUser");
    if (!loggedUser) {
      e.preventDefault();
      setAlertConfig({
        show: true,
        message: "Anda harus login terlebih dahulu untuk mengisi form ini.",
        type: "alert",
        onConfirm: () => navigate(`/login?redirect=${location.pathname}`),
      });
      return false;
    }
    return true;
  };

  const convertToFoodPortions = (grams, dailyMeals = 3) => {
    const carbsPerPortion = 45;
    const proteinPerPortion = 30;
    const fatPerPortion = 14;
  
    return {
      carbsPortionsDay: Math.round(grams.carbs / carbsPerPortion),
      proteinPortionsDay: Math.round(grams.protein / proteinPerPortion),
      fatPortionsDay: Math.round(grams.fat / fatPerPortion),
      carbsPortionsMeal: Math.round(grams.carbs / dailyMeals / carbsPerPortion),
      proteinPortionsMeal: Math.round(grams.protein / dailyMeals / proteinPerPortion),
      fatPortionsMeal: Math.round(grams.fat / dailyMeals / fatPerPortion),
    };
  };
  

  const fetchNutrisi = async () => {
    try {
      const response = await axios.get('https://carebot.tifpsdku.com/backend/kalkulator_gizi');
      const sortedNutrisi = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setNutrisi(sortedNutrisi);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchNutrisi();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loggedUser = localStorage.getItem('loggedInUser');
    if (!loggedUser) {
      setShowAlert(true);
      return;
    }

    setLoading(true);
    setError(null);

    const ibuId = JSON.parse(loggedUser).id;
    const formDataWithIbuId = { ...formData, ibu_id: ibuId };

    try {
      const response = await axios.post(
        'https://carebot.tifpsdku.com/backend/kalkulator_gizi/calculate',
        formDataWithIbuId,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      const roundedData = {
        tdee: Math.round(response.data.tdee),
        carbs: Math.round(response.data.carbs),
        protein: Math.round(response.data.protein),
        fat: Math.round(response.data.fat),
      };
      
      const dailyMeals = 3;
      const foodPortions = convertToFoodPortions(roundedData, dailyMeals);
      setResults({ ...roundedData, ...foodPortions });
      setFormData({
        gender: '',
        weight: '',
        height: '',
        age: '',
        activity_level: ''
      });

      setTimeout(() => {
        hasilRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);

      await fetchNutrisi();
    } catch (error) {
      console.error('Error calculating data:', error);
      setError('Terjadi kesalahan saat menghitung data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="div-kalkulator">
      <h1 className="h1-kalkulator">Kalkulator Nutrisi</h1>

      <div className="kalkulator-container">
        {showAlert && (
          <div className="custom-alert-kalkulator">
            <p>Anda harus login terlebih dahulu untuk mengisi form ini.</p>
            <button onClick={() => navigate(`/login?redirect=${location.pathname}`)}>Login Sekarang</button>
            <span className="close-alert-kalkulator" onClick={() => setShowAlert(false)}>×</span>
          </div>
        )}

        <form className="form-kalkulator" onSubmit={handleSubmit}>
          <div className="flex-container">
            <div className="left-side">
              <div>
                <label className="label-kalkulator">Jenis Kelamin:</label>
                <select
                  className="select-kalkulator"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  onMouseDown={(e) => !handleProtectedInteraction(e)}
                  required
                >
                  <option value="">Pilih</option>
                  <option value="male">Laki-laki</option>
                  <option value="female">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="label-kalkulator">Berat Badan (kg):</label>
                <input
                  className="input-kalkulator"
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  onFocus={(e) => !handleProtectedInteraction(e)}
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="label-kalkulator">Tinggi Badan (cm):</label>
                <input
                  className="input-kalkulator"
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  onFocus={(e) => !handleProtectedInteraction(e)}
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="right-side">
              <div>
                <label className="label-kalkulator">Usia (tahun):</label>
                <input
                  className="input-kalkulator"
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  onFocus={(e) => !handleProtectedInteraction(e)}
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="label-kalkulator">Tingkat Aktivitas:</label>
                <select
                  className="select-kalkulator"
                  name="activity_level"
                  value={formData.activity_level}
                  onChange={handleChange}
                  onMouseDown={(e) => !handleProtectedInteraction(e)}
                  required
                >
                  <option value="">Pilih</option>
                  <option value="sedentary">Tidak Aktif (sedikit atau tidak berolahraga)</option>
                  <option value="light">Ringan (olahraga ringan 1-3 hari/minggu)</option>
                  <option value="moderate">Sedang (olahraga sedang 3-5 hari/minggu)</option>
                  <option value="active">Aktif (olahraga berat 6-7 hari/minggu)</option>
                </select>
              </div>
            </div>
          </div>

          <button className="button-kalkulator" type="submit" disabled={loading}>
            {loading ? 'Menghitung...' : 'Hitung'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {results && (
          <div ref={hasilRef} className="results-container">
            <h2 className="h2-kalkulator">Hasil</h2>
            <div className="result-item">
              <span className="result-label">Total Daily Energy Expenditure (TDEE):</span>
              <span className="result-value">{results.tdee} kkal</span>
            </div>
            <div className="result-item">
              <span className="result-label">Karbohidrat:</span>
              <span className="result-value">{results.carbs} g</span>
              <span className="result-value">{results.carbsPortionsDay} porsi nasi (per hari)</span>
              <span className="result-value">{results.carbsPortionsMeal} porsi nasi (per kali makan)</span>
            </div>
            <div className="result-item">
              <span className="result-label">Protein:</span>
              <span className="result-value">{results.protein} g</span>
              <span className="result-value">{results.proteinPortionsDay} potong dada ayam (per hari)</span>
              <span className="result-value">{results.proteinPortionsMeal} potong dada ayam (per kali makan)</span>
            </div>
            <div className="result-item">
              <span className="result-label">Lemak:</span>
              <span className="result-value">{results.fat} g</span>
              <span className="result-value">{results.fatPortionsDay} sendok makan minyak (per hari)</span>
              <span className="result-value">{results.fatPortionsMeal} sendok makan minyak (per kali makan)</span>
            </div>
          </div>
        )}
      </div>

      <CustomAlert
        show={alertConfig.show}
        message={alertConfig.message}
        onClose={() => setAlertConfig({ ...alertConfig, show: false })}
        onConfirm={alertConfig.onConfirm}
      />
    </div>
  );
};

export default Kalkulator;
