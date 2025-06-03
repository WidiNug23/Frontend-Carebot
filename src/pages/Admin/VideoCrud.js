import { useEffect, useState } from "react";
import axios from "axios";
import './VideoCrud.css'

const API_URL = "https://carebot.tifpsdku.com/backend/videos"; // Sesuaikan dengan URL backend CI4

const VideoCrud = () => {
  const [videos, setVideos] = useState([]);
  const [category, setCategory] = useState("remaja");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await axios.get(API_URL);
      const videoData = response.data.map(video => ({
        id: video.id,
        category: video.category,
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
      console.error("Error fetching video data:", error);
    }
  };

  const getThumbnail = (url) => {
    const videoId = extractVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";
  };

  const getVideoTitle = async (url) => {
    const videoId = extractVideoId(url);
    if (!videoId) return "Video tidak ditemukan";

    try {
      const response = await axios.get(
        `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
      );
      return response.data.title || "Judul tidak tersedia";
    } catch (error) {
      console.error("Gagal mengambil judul video:", error);
      return "Judul tidak tersedia";
    }
  };

  const extractVideoId = (url) => {
    const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/);
    return match ? match[1] : null;
  };

  // Tambah video baru
  const addVideo = async () => {
    try {
      await axios.post(API_URL, { category, youtube_url: youtubeUrl });
      setYoutubeUrl("");
      fetchVideos();
    } catch (error) {
      console.error("Gagal menambahkan video:", error);
    }
  };

  // Hapus video berdasarkan ID
  const deleteVideo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchVideos();
    } catch (error) {
      console.error("Gagal menghapus video:", error);
    }
  };

  return (
    <div className="video-container">
      <h2>Manajemen Video</h2>

      {/* Form Tambah Video */}
      <div className="table">
        <label>Kategori:</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2"
        >
          <option value="remaja">Remaja</option>
          <option value="lansia">Lansia</option>
          <option value="ibu_hamil">Ibu Hamil</option>
          <option value="ibu_menyusui">Ibu Menyusui</option>
        </select>

        <input
          type="text"
          placeholder="YouTube URL"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          className="border p-2 ml-2"
        />
        <button onClick={addVideo} className="bg-blue-500 text-white p-2 ml-2">
          Tambah Video
        </button>
      </div>

      {/* Tabel Video */}
      <table className="table">
        <thead>
          <tr>
            <th>Kategori</th>
            <th>Thumbnail</th>
            <th>Judul</th>
            <th>Link URL</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {videos.map((video) => (
            <tr key={video.id}>
              <td>{video.category}</td>
              <td>
                <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer">
                  <img src={video.thumbnail} alt={video.title} className="w-16 h-16 rounded" />
                </a>
              </td>
              <td>
                <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {video.title}
                </a>
              </td>
              <td>
                <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {video.youtubeUrl}
                </a>
              </td>
              <td>
                <button
                  onClick={() => deleteVideo(video.id)}
                  className="bg-red-500 text-white p-2"
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VideoCrud;
