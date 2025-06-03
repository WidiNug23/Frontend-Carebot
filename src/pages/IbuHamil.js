import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './IbuHamil.css';
import CustomAlert from "../components/CustomAlert";


const IbuHamil = () => {
  const navigate = useNavigate();
  const [nutrisi, setNutrisi] = useState([]);
  const [filteredNutrisi, setFilteredNutrisi] = useState([]);
  const [age, setAge] = useState(null);
  const [ages, setAges] = useState([]);
  const [articles, setArticles] = useState([]);
  const [activeArticle, setActiveArticle] = useState(null);
  const [error, setError] = useState(null);
  const [rekomendasi, setRekomendasi] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [visibleDays, setVisibleDays] = useState(8);
  const [videos, setVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [dataRekomendasi, setDataRekomendasi] = useState([]);
  const [alertConfig, setAlertConfig] = useState({
    show: false,
    message: "",
    type: "alert",
    onConfirm: null,
  });

 useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await axios.get('https://carebot.tifpsdku.com/backend/videos/category/ibu_hamil');
      const videoData = response.data.map(video => ({
        id: video.id,
        youtubeUrl: video.youtube_url,
        thumbnail: getThumbnail(video.youtube_url),
        title: ''
      }));

      const updatedVideos = await Promise.all(videoData.map(async (video) => {
        const title = await getVideoTitle(video.youtubeUrl);
        return { ...video, title };
      }));

      setVideos(updatedVideos);
    } catch (error) {
      console.error('Error fetching video data:', error);
    }
  };

  const getThumbnail = (url) => {
    const videoId = extractVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
  };

  const getVideoTitle = async (url) => {
    const videoId = extractVideoId(url);
    if (!videoId) return 'Video tidak ditemukan';

    try {
      const response = await axios.get(
        `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
      );
      return response.data.title || 'Judul tidak tersedia';
    } catch (error) {
      console.error('Gagal mengambil judul video:', error);
      return 'Judul tidak tersedia';
    }
  };

  const extractVideoId = (url) => {
    const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/);
    return match ? match[1] : null;
  };

  const togglePopupVid = (videoUrl) => {
    setActiveVideo(videoUrl);
  };

  const closePopupVid = () => {
    setActiveVideo(null);
  };

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedUser || loggedUser.kategori !== "Ibu Hamil") {
      setAlertConfig({
        show: true,
        message: "Anda harus login sebagai Ibu Hamil untuk mengakses halaman ini.",
        type: "alert",
        onConfirm: () => navigate("/login"),
      });
    } else {
      let userDiseases = [];
      try {
        userDiseases = JSON.parse(loggedUser.riwayatPenyakit);
      } catch (e) {
        userDiseases = loggedUser.riwayatPenyakit.split(",").map((item) => item.trim());
      }
      fetchFilteredRekomendasi(loggedUser.kategori, userDiseases);
    }
  }, [navigate]);

  const fetchFilteredRekomendasi = async (kategori, riwayatPenyakit) => {
    try {
      const response = await axios.get('https://carebot.tifpsdku.com/backend/nutrisi');
      const filteredRekomendasi = response.data.filter(
        item =>
          item.kategori_user === kategori &&
          riwayatPenyakit.includes(item.nama_penyakit)
      );
      setRekomendasi(filteredRekomendasi || []);
    } catch (error) {
      console.error('Error fetching rekomendasi data:', error);
    }
  };

  useEffect(() => {
    const fetchNutrisi = async () => {
      try {
        const response = await axios.get('https://carebot.tifpsdku.com/backend/ibu_hamil');
        setNutrisi(response.data);
        const uniqueAges = Array.from(new Set(response.data.map(item => item.umur)));
        setAges(uniqueAges);
      } catch (error) {
        setError('Gagal memuat data nutrisi.');
        console.error('Error fetching nutrition data:', error);
      }
    };

    const fetchArticles = async () => {
      try {
        const response = await axios.get('https://carebot.tifpsdku.com/backend/berita');
        const filteredArticles = response.data.filter(article => article.kategori === 'ibu hamil');
        setArticles(filteredArticles);
      } catch (error) {
        console.error('Error fetching articles:', error);
      }
    };

    fetchNutrisi();
    fetchArticles();
  }, []);

  const handleAgeSelect = (selectedAge) => {
    setAge(selectedAge);
    const filtered = nutrisi.filter(item => item.umur === selectedAge);
    setFilteredNutrisi(filtered);
  };

  const toggleDetails = (index) => {
    setExpandedItems(prevState => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const formatArticleContent = (content) => {
    const paragraphs = content.split(/\n\n/);
    return paragraphs.map((paragraph, index) => {
      if (paragraph.startsWith("1.")) {
        const numberedPoints = paragraph.split("\n");
        return (
          <ol key={index}>
            {numberedPoints.map((point, idx) => (
              <li key={idx}>{point.replace(/^\d+\.\s*/, '')}</li>
            ))}
          </ol>
        );
      } else if (paragraph.startsWith("-")) {
        const bulletPoints = paragraph.split("\n");
        return (
          <ul key={index}>
            {bulletPoints.map((point, idx) => (
              <li key={idx}>{point.replace(/^\-\s*/, '')}</li>
            ))}
          </ul>
        );
      } else {
        return <p key={index}>{paragraph}</p>;
      }
    });
  };

  const togglePopup = (article) => {
    setActiveArticle(article);
  };

  const closePopup = () => {
    setActiveArticle(null);
  };

  const fetchRekomendasi = async () => {
    try {
      const response = await axios.get('https://carebot.tifpsdku.com/backend/rekomendasi');
      setRekomendasi(response.data || []);
    } catch (error) {
      console.error('Error fetching rekomendasi data:', error);
    }
  };

  const groupRekomendasiByDay = rekomendasi => {
    const grouped = {};
    const totalDays = 60;
    const totalData = rekomendasi.length;

    if (totalData === 0) return grouped;

    let currentDataIndex = 0;
    const signupDate = new Date(JSON.parse(localStorage.getItem('loggedInUser')).tanggal_signup);
    
    for (let i = 0; i < totalDays; i++) {
      const dayNumber = i + 1;
      const currentDay = new Date(signupDate);
      currentDay.setDate(currentDay.getDate() + i);

      // Check if the day has passed or is today
      const isCurrentDay = new Date().toDateString() === currentDay.toDateString();
      const dayClass = isCurrentDay ? 'day-today' : '';

      if (!grouped[`Hari ${dayNumber}`]) grouped[`Hari ${dayNumber}`] = [];
      grouped[`Hari ${dayNumber}`].push({
        ...rekomendasi[currentDataIndex],
        dayClass: dayClass, // Add the class to change card color
      });
      currentDataIndex = (currentDataIndex + 1) % totalData;
    }

    return grouped;
  };

  const groupedRekomendasi = groupRekomendasiByDay(rekomendasi);
  // const visibleGroupedRekomendasi = Object.entries(groupedRekomendasi).slice(0, visibleDays); 

  

  const handleLoadMore = () => {
    setVisibleDays(prev => prev + 8);
  };

  const [startDayIndex, setStartDayIndex] = useState(0);
const daysPerPage = 8;

const visibleGroupedRekomendasi = Object.entries(groupedRekomendasi).slice(startDayIndex, startDayIndex + daysPerPage);

const handleNext = () => {
  if (startDayIndex + daysPerPage < Object.keys(groupedRekomendasi).length) {
    setStartDayIndex(prev => prev + daysPerPage);
  }
};

const handlePrev = () => {
  if (startDayIndex - daysPerPage >= 0) {
    setStartDayIndex(prev => prev - daysPerPage);
  }
};

  useEffect(() => {
    fetchRekomendasi();
  }, []);

  return (
    <div className="container-ibu-hamil">
      <h1>Informasi Nutrisi untuk Ibu Hamil</h1>
      {age ? (
        <h2 className="selected-info">
          Nutrisi untuk Ibu Hamil dengan umur {age}
        </h2>
      ) : (
        <div className="age-selection">
          {/* <h2>Pilih Umur Ibu Hamil:</h2> */}
          {ages.length > 0 ? (
            <>
              {/* <button onClick={() => handleAgeSelect('Trimester 1')} className="age-button">
                Trimester 1
              </button>
              <button onClick={() => handleAgeSelect('Trimester 2')} className="age-button">
                Trimester 2
              </button>
              <button onClick={() => handleAgeSelect('Trimester 3')} className="age-button">
                Trimester 3
              </button> */}
            </>
          ) : (
            <p>...</p>
          )}
        </div>
      )}
  
      {age && (
        <>
          <div className="nutrisi-list-ibu-hamil">
            {filteredNutrisi.length > 0 ? (
              filteredNutrisi.map((item, index) => (
                <div className="nutrisi-item-ibu-hamil" key={index}>
                  <div className="nutrisi-header">
                    <strong>{item.nutrisi} ({item.jumlah})</strong>
                  </div>
                  <button className="see-more-button" onClick={() => toggleDetails(index)}>
                    {expandedItems[index] ? 'Tutup' : 'Lihat Selengkapnya'}
                  </button>
                  {expandedItems[index] && (
                    <div className="expanded-details">
                      <p><strong>Sumber:</strong> {item.sumber}</p>
                      <p><strong>Deskripsi:</strong> {item.deskripsi}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="no-data-ibu-hamil">...</p>
            )}
          </div>
          <button onClick={() => setAge(null)} className="back-button">Pilih Umur Lagi</button>
        </>
      )}
  
  <h2 className="rekomendasi-heading">Rekomendasi Nutrisi (60 Hari)</h2>
      <div className="calendar-grid">
        {visibleGroupedRekomendasi.length > 0 ? (
          visibleGroupedRekomendasi.map(([date, items]) => (
            <div key={date} className={`calendar-day ${items[0].dayClass}`}>
              <h3>{date}</h3>
              {items.map((item, index) => (
                <div key={index} className="rekomendasi-item">
                  <h4>{item.nutrisi} ({item.jumlah})</h4>
                  <p>{item.makanan}</p>
                </div>
              ))}
            </div>
          ))
        ) : (
          <p>Tidak ada rekomendasi nutrisi yang tersedia.</p>
        )}
      </div>

      <div className="navigation-buttons">
  <button
    onClick={handlePrev}
    className="nav-button"
    disabled={startDayIndex === 0}
  >
    &#8592; {/* Panah Kiri */}
  </button>

  <button
    onClick={handleNext}
    className="nav-button"
    disabled={startDayIndex + daysPerPage >= Object.keys(groupedRekomendasi).length}
  >
    &#8594; {/* Panah Kanan */}
  </button>
</div>
  
      <h1 className="article-heading-ibu-hamil">Artikel untuk Ibu Hamil</h1>
      {articles.length > 0 ? (
        <div className="articles-list-ibu-hamil">
          {articles.map((article, index) => (
            <div className="article-container-ibu-hamil" key={index}>
              <h2 onClick={() => togglePopup(article)} className="article-title-ibu-hamil">
                {article.judul}
              </h2>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-data-ibu-hamil">Tidak ada artikel untuk ibu hamil.</p>
      )}
  
      {activeArticle && (
        <div className="popup-ibu-hamil">
          <div className="popup-content-ibu-hamil">
            <h2>{activeArticle.judul}</h2>
            <div className="popup-article-content">
              {formatArticleContent(activeArticle.isi)}
            </div>
            <button onClick={closePopup} className="close-popup-ibu-hamil">Tutup</button>
          </div>
        </div>
      )}
  
  <h1 className="video-heading-ibu-hamil">Video Edukasi untuk Ibu Hamil</h1>
      <div className="video-container">
        {videos.length > 0 ? (
          videos.map(video => (
            <div key={video.id} className="video-item">
              <img
                src={video.thumbnail}
                alt={video.title}
                onClick={() => togglePopupVid(video.youtubeUrl)}
                className="video-thumbnail"
              />
              <h4>{video.title}</h4>
            </div>
          ))
        ) : (
          <p>Tidak ada video untuk kategori ibu hamil.</p>
        )}
      </div>

      {activeVideo && (
        <div className="video-popup">
          <div className="video-popup-content">
            <span className="close-button" onClick={closePopupVid}>&times;</span>
            <iframe
              width="560"
              height="315"
              src={`https://www.youtube.com/embed/${extractVideoId(activeVideo)}?autoplay=1`}
              title="YouTube Video"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
       <CustomAlert
        show={alertConfig.show}
        message={alertConfig.message}
        onClose={() => setAlertConfig({ ...alertConfig, show: false })}
        onConfirm={alertConfig.onConfirm}
      />
    </div>
  );
};

export default IbuHamil;
