import React, { useEffect, useState } from 'react';
import './Home.css'; // Ensure the CSS for the popup is included here
import axios from 'axios';
import Kalkulator from './Kalkulator'; // Import Kalkulator component
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'; // Import komponen peta dari react-leaflet
import 'leaflet/dist/leaflet.css'; // Untuk memastikan CSS dari leaflet dimuat
import MapViewer from '../components/MapViewer';
import MapAsiEksklusif from '../components/MapAsiEksklusif';
import MapPangan from '../components/MapPangan';
const Home = () => {
  const [artikel, setArtikel] = React.useState([]);
  const [popupData, setPopupData] = React.useState(null); // State for popup data
  const [popupVisible, setPopupVisible] = React.useState(false); // State to control popup visibility
  const [currentSlide, setCurrentSlide] = React.useState(0); // State for current slide index
  const [videos, setVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [mapData, setMapData] = useState([]); // State untuk data peta yang didapat dari backend

  useEffect(() => {
    // Ambil data peta dari backend (data yang sudah diinput oleh admin)
    const fetchMapData = async () => {
      try {
        const response = await axios.get('https://carebot.tifpsdku.com/backend/api/map'); // Ganti dengan endpoint yang sesuai
        setMapData(response.data); // Simpan data peta dalam state
      } catch (error) {
        console.error('Error fetching map data:', error);
      }
    };

    fetchMapData();
  }, []);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await axios.get('https://carebot.tifpsdku.com/backend/videos');
      const videoData = response.data.map(video => ({
        id: video.id,
        youtubeUrl: video.youtube_url,
        thumbnail: getThumbnail(video.youtube_url),
        title: ''
      }));

      // Mengambil judul video dari YouTube API
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

  const closePopupVid = () => {
    setActiveVideo(null);
  };

  const togglePopupVid = (videoUrl) => {
    setActiveVideo(videoUrl);
  };

  // State for changing the title
  const [currentTitleIndex, setCurrentTitleIndex] = React.useState(0);
  const [fadeOut, setFadeOut] = React.useState(false); // State for fade-out effect
  const titles = [
    'Lengkapi Nutrisimu',
    'Penuhi Kebutuhan Harianmu',
    'Jaga Pola Makan dan Kesehatan'
  ];

  React.useEffect(() => {
    const fetchArtikel = async () => {
      try {
        const response = await axios.get('https://carebot.tifpsdku.com/backend/berita'); // Update with your endpoint
        setArtikel(response.data);
      } catch (error) {
        console.error('Error fetching article data:', error);
      }
    };

    fetchArtikel();

    // Set interval for auto sliding
    const slideInterval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % 3); // Assuming you have 3 slides
    }, 3000); // Change slide every 3 seconds

    // Set interval for changing titles
    const titleInterval = setInterval(() => {
      setFadeOut(true); // Start fade out
      setTimeout(() => {
        setCurrentTitleIndex((prevIndex) => (prevIndex + 1) % titles.length);
        setFadeOut(false); // Finish fade out
      }, 500); // Adjust with CSS transition duration
    }, 3000); // Change title every 3 seconds

    return () => {
      clearInterval(slideInterval); // Clear interval when component unmounts
      clearInterval(titleInterval); // Clear title interval
    };
  }, []);

  const openPopup = (article) => {
    setPopupData(article);
    setPopupVisible(true); // Show popup
  };

  const closePopup = () => {
    setPopupVisible(false); // Hide popup
    setTimeout(() => setPopupData(null), 300); // Clear data after animation
  };

  // Animation effect
  const [isVisible, setIsVisible] = React.useState(Array(artikel.length).fill(false));

  const observer = React.useRef(
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = entry.target.dataset.index;
          setIsVisible((prev) => {
            const newVisibility = [...prev];
            newVisibility[index] = true; // Set this article as visible
            return newVisibility;
          });
          observer.current.unobserve(entry.target); // Stop observing this article
        }
      });
    })
  );

  React.useEffect(() => {
    const elements = document.querySelectorAll('.article-container');
    elements.forEach((element, index) => {
      element.dataset.index = index; // Store index
      observer.current.observe(element); // Observe each article
    });

    return () => {
      elements.forEach((element) => {
        observer.current.unobserve(element);
      });
    };
  }, [artikel]);

  return (
    <div>
      <div className="slider-container">
        <div
          className="slider"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }} 
        >
          <div className="slide">
            <div className="image-container">
              <img src="assets/image/1.png" alt="Deskripsi gambar 1" />
            </div>
          </div>
          <div className="slide">
            <div className="image-container">
              <img src="assets/image/2.png" alt="Deskripsi gambar 2" />
            </div>
          </div>
          <div className="slide">
            <div className="image-container">
              <img src="assets/image/3.png" alt="Deskripsi gambar 3" />
            </div>
          </div>
        </div>
      </div>

      <div className="title-container">
        <h2 className={`nutrition-title ${fadeOut ? 'fade-out' : ''}`}>
          {titles[currentTitleIndex]}
        </h2>
      </div>

      <div className="menu-container">
        <div className="menu-item" onClick={() => (window.location.href = '/remaja')}>
          <img src="assets/image/teenagers.jpg" alt="Nutrisi Remaja" />
          <h3>Nutrisi Remaja</h3>
          <p>Informasi tentang nutrisi penting untuk remaja.</p>
        </div>
        <div className="menu-item" onClick={() => (window.location.href = '/lansia')}>
          <img src="assets/image/oldman.jpg" alt="Nutrisi Lansia" />
          <h3>Nutrisi Lansia</h3>
          <p>Panduan nutrisi untuk lansia agar tetap sehat.</p>
        </div>
        <div className="menu-item" onClick={() => (window.location.href = '/ibu_hamil')}>
          <img src="assets/image/pregnant.jpg" alt="Nutrisi Ibu Hamil" />
          <h3>Nutrisi Ibu Hamil</h3>
          <p>Kebutuhan nutrisi untuk ibu hamil dan menyusui.</p>
        </div>
        <div className="menu-item" onClick={() => (window.location.href = '/ibu_menyusui')}>
          <img src="assets/image/mom.jpg" alt="Nutrisi Keluarga" />
          <h3>Nutrisi Ibu Menyusui</h3>
          <p>Tips dan panduan nutrisi untuk ibu menyusui.</p>
        </div>
      </div>

      <div className="articles-container">
        <h2 className="articles-title">Artikel Remaja</h2>
        <div className="article-section">
          {artikel
            .filter((article) => article.kategori === 'remaja')
            .map((article, index) => (
              <div
                className={`article-container ${isVisible[index] ? 'animate' : ''}`}
                key={index}
                onClick={() => openPopup(article)}
              >
                <img
                  // src={`https://carebot.tifpsdku.com/backend/uploads/${article.image}`}
                  // alt={article.judul}
                  // className="article-image"
                />
                <h3 className="article-title">{article.judul}</h3>
                <p>{article.deskripsi}</p>
              </div>
            ))}
        </div>

        <h2 className="articles-title">Artikel Lansia</h2>
        <div className="article-section">
          {artikel
            .filter((article) => article.kategori === 'lansia')
            .map((article, index) => (
              <div
                className={`article-container ${
                  isVisible[index + artikel.filter((a) => a.kategori === 'remaja').length]
                    ? 'animate'
                    : ''
                }`}
                key={index}
                onClick={() => openPopup(article)}
              >
                <h3 className="article-title">{article.judul}</h3>
                <p>{article.deskripsi}</p>
              </div>
            ))}
        </div>

        <h2 className="articles-title">Artikel Ibu Hamil</h2>
        <div className="article-section">
          {artikel
            .filter((article) => article.kategori === 'ibu hamil')
            .map((article, index) => (
              <div
                className={`article-container ${
                  isVisible[
                    index +
                      artikel.filter((a) => a.kategori === 'remaja').length +
                      artikel.filter((a) => a.kategori === 'lansia').length
                  ]
                    ? 'animate'
                    : ''
                }`}
                key={index}
                onClick={() => openPopup(article)}
              >
                <h3 className="article-title">{article.judul}</h3>
                <p>{article.deskripsi}</p>
              </div>
            ))}
        </div>

        <h2 className="articles-title">Artikel Ibu Menyusui</h2>
        <div className="article-section">
          {artikel
            .filter((article) => article.kategori === 'ibu menyusui')
            .map((article, index) => (
              <div
                className={`article-container ${
                  isVisible[
                    index +
                      artikel.filter((a) => a.kategori === 'remaja').length +
                      artikel.filter((a) => a.kategori === 'lansia').length +
                      artikel.filter((a) => a.kategori === 'ibu hamil').length
                  ]
                    ? 'animate'
                    : ''
                }`}
                key={index}
                onClick={() => openPopup(article)}
              >
                <h3 className="article-title">{article.judul}</h3>
                <p>{article.deskripsi}</p>
              </div>
            ))}
        </div>
      </div>

      {/* Kalkulator Section */}
      <Kalkulator />

      <h1 className="video-heading">Video Edukasi</h1>
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

      {/* Popup for article details */}
      {popupVisible && (
  <div className={`popup ${popupVisible ? 'visible' : ''}`}>
    <div className="popup-content">
      {popupData && (
        <>
          <h3>{popupData.judul}</h3>
          <p>{popupData.isi}</p>
        </>
      )}
      <button className="close-popup" onClick={closePopup}>Tutup</button>
    </div>
  </div>
)}

<div style={{ padding: '20px' }}>
      {/* Untuk Map Viewer */}
      {/* <div style={{ marginBottom: '40px' }}>
        <h2>Peta Umum</h2>
        <p>Berikut adalah peta umum yang menampilkan lokasi-lokasi penting secara keseluruhan.</p>
        <MapViewer />
      </div> */}

      {/* Untuk Map Asi Eksklusif */}
      {/* <div>
        <h2>Peta Lokasi ASI Eksklusif</h2>
        <p>Data lokasi yang berkaitan dengan kegiatan ASI eksklusif di berbagai wilayah.</p>
        <MapAsiEksklusif />
      </div> */}

      {/* Untuk Map Asi Eksklusif */}
      {/* <div>
        <h2>Peta Jumlah Penduduk yang Mengalami Ketidakcukupan Konsumsi Pangan Provinsi Update Tahun 2024</h2>
        <p>Data lokasi yang berkaitan dengan Ketidakcukupan Konsumsi Pangan.</p>
        <p>Jumlah Penduduk adalah Banyaknya orang yang berdomisili di wilayah Negara Kesatuan Republik Indonesia selama 1 tahun atau lebih dan atau mereka yang berdomisili kurang dari 1 tahun tetapi bertujuan untuk menetap.

PoU/ Prevalence of Undernourishment/ Prevalensi Ketidakcukupan Konsumsi Pangan adalah proporsi populasi penduduk yang mengalami ketidakcukupan konsumsi energi di bawah kebutuhan minimum untuk dapat hidup sehat dan aktif terhadap populasi penduduk secara keseluruhan pada tahun tertentu.

Penduduk Undernourish/Jumlah Penduduk yang Mengalami Ketidakcukupan Konsumsi Pangan adalah Jumlah penduduk yang mengalami ketidakcukupan konsumsi energi minimum untuk hidup sehat dan aktif di suatu wilayah (nasional atau provinsi atau kab/kota) pada tahun tertentu</p>
        <MapPangan />
      </div> */}
    </div>



      </div>
      );
    };

export default Home;
