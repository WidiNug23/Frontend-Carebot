// import { useEffect, useState } from "react";
// import axios from "axios";

// const API_URL = "https://carebot.tifpsdku.com/backend/api/videos"; // Sesuaikan dengan URL backend CI4

// const Videos = ({ category }) => {
//   const [videos, setVideos] = useState([]);

//   useEffect(() => {
//     fetchVideos();
//   }, [category]);

//   const fetchVideos = async () => {
//     try {
//       const response = await axios.get(API_URL);
//       setVideos(response.data.filter((video) => video.category === category));
//     } catch (error) {
//       console.error("Gagal mengambil data:", error);
//     }
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-bold mb-4">Video {category}</h2>
//       {videos.length > 0 ? (
//         videos.map((video) => {
//           const videoId = new URL(video.youtube_url).searchParams.get("v");
//           return (
//             <iframe
//               key={video.id}
//               width="560"
//               height="315"
//               src={`https://www.youtube.com/embed/${videoId}`}
//               frameBorder="0"
//               allowFullScreen
//               className="mb-4"
//             ></iframe>
//           );
//         })
//       ) : (
//         <p>Tidak ada video untuk kategori ini.</p>
//       )}
//     </div>
//   );
// };

// export default Videos;
