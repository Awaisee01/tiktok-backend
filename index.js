// const express = require("express");
// const fetch = (...args) => import("node-fetch").then((mod) => mod.default(...args)); // Dynamic import for node-fetch 3.x
// const fs = require("fs");
// const path = require("path");
// const { Headers } = require("node-fetch");
// const cors = require("cors");

// const app = express();
// const PORT = process.env.PORT || 3000;
// const API_KEY = "1234"; // CHANGE THIS TO YOUR OWN API KEY!

// // Set up download directory
// const DOWNLOAD_DIR = path.join(__dirname, "downloads");
// if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);

// const headers = new Headers();

// // Function to extract video ID from URL
// const getIdVideo = async (url) => {
//   if (url.includes("/t/")) {
//     const redirected = await new Promise((resolve) => {
//       require("follow-redirects").https.get(url, function (res) {
//         return resolve(res.responseUrl);
//       });
//     });
//     url = redirected;
//   }

//   const match = url.match(/\/(video|photo)\/(\d{19})/);
//   if (!match) throw new Error("Invalid TikTok URL");

//   return match[2];
// };

// // Function to get video data from TikTok API
// const getVideoData = async (url) => {
//   const idVideo = await getIdVideo(url);
//   const api = `https://api22-normal-c-alisg.tiktokv.com/aweme/v1/feed/?aweme_id=${idVideo}`;

//   const res = await fetch(api, { method: "OPTIONS", headers });
//   const body = await res.text();

//   let data;
//   try {
//     data = JSON.parse(body);
//   } catch (err) {
//     throw new Error("Failed to parse API response");
//   }

//   const video = data?.aweme_list?.[0]?.video;
//   const videoUrl = video?.play_addr?.url_list?.[0] || video?.download_addr?.url_list?.[0];
//   if (!videoUrl) throw new Error("Video URL not found");

//   return { id: idVideo, url: videoUrl };
// };

// // Function to download the video file
// const downloadVideo = async (videoUrl, id) => {
//   const filePath = path.join(DOWNLOAD_DIR, `${id}.mp4`);
//   if (fs.existsSync(filePath)) return filePath;

//   const res = await fetch(videoUrl);
//   const fileStream = fs.createWriteStream(filePath);
//   await new Promise((resolve, reject) => {
//     res.body.pipe(fileStream);
//     res.body.on("error", reject);
//     fileStream.on("finish", resolve);
//   });

//   return filePath;
// };

// // Set up CORS to allow frontend to call this API
// app.use(cors());

// // Endpoint to handle video download
// app.get("/", async (req, res) => {
//   const { url, apikey } = req.query;

//   // Check if URL and API key are provided
//   if (!url || !apikey) {
//     return res.status(400).json({ status: "error", message: "Missing URL or API key" });
//   }

//   if (apikey !== API_KEY) {
//     return res.status(403).json({ status: "error", message: "Invalid API key" });
//   }

//   try {
//     // Fetch video data and download the video
//     const video = await getVideoData(url);
//     const filePath = await downloadVideo(video.url, video.id);

//     // Create the download link
//     const fileUrl = `${req.protocol}://${req.get("host")}/downloads/${path.basename(filePath)}`;

//     res.json({ status: "success", file: fileUrl });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ status: "error", message: err.message });
//   }
// });

// // Serve downloaded files via /downloads route
// app.use("/downloads", express.static(DOWNLOAD_DIR));

// // Start server on port 3000
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });



const express = require("express");
const fetch = (...args) => import("node-fetch").then((mod) => mod.default(...args)); // Dynamic import for node-fetch 3.x
const fs = require("fs");
const path = require("path");
const { Headers } = require("node-fetch");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = "1234"; // CHANGE THIS TO YOUR OWN API KEY!

// Set up download directory
const DOWNLOAD_DIR = path.join(__dirname, "downloads");
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);

const headers = new Headers();

// Function to extract video ID from URL
const getIdVideo = async (url) => {
  if (url.includes("/t/")) {
    const redirected = await new Promise((resolve) => {
      require("follow-redirects").https.get(url, function (res) {
        return resolve(res.responseUrl);
      });
    });
    url = redirected;
  }

  const match = url.match(/\/(video|photo)\/(\d{19})/);
  if (!match) throw new Error("Invalid TikTok URL");

  return match[2];
};

// Function to get video data from TikTok API
const getVideoData = async (url) => {
  const idVideo = await getIdVideo(url);
  const api = `https://api22-normal-c-alisg.tiktokv.com/aweme/v1/feed/?aweme_id=${idVideo}`;

  const res = await fetch(api, { method: "OPTIONS", headers });
  const body = await res.text();

  let data;
  try {
    data = JSON.parse(body);
  } catch (err) {
    throw new Error("Failed to parse API response");
  }

  const video = data?.aweme_list?.[0]?.video;
  const videoUrl = video?.play_addr?.url_list?.[0] || video?.download_addr?.url_list?.[0];
  if (!videoUrl) throw new Error("Video URL not found");

  return { id: idVideo, url: videoUrl };
};

// Function to download the video file
const downloadVideo = async (videoUrl, id) => {
  const filePath = path.join(DOWNLOAD_DIR, `${id}.mp4`);
  if (fs.existsSync(filePath)) return filePath;

  const res = await fetch(videoUrl);
  const fileStream = fs.createWriteStream(filePath);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);
    fileStream.on("finish", resolve);
  });

  // Delete the file after 1 minute (60000ms)
  setTimeout(() => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      } else {
        console.log(`File ${filePath} deleted after 1 minute.`);
      }
    });
  }, 60000); // 1 minute = 60000 ms

  return filePath;
};

// Set up CORS to allow frontend to call this API
app.use(cors());

// Endpoint to handle video download
app.get("/", async (req, res) => {
  const { url, apikey } = req.query;

  // Check if URL and API key are provided
  if (!url || !apikey) {
    return res.status(400).json({ status: "error", message: "Missing URL or API key" });
  }

  if (apikey !== API_KEY) {
    return res.status(403).json({ status: "error", message: "Invalid API key" });
  }

  try {
    // Fetch video data and download the video
    const video = await getVideoData(url);
    const filePath = await downloadVideo(video.url, video.id);

    // Create the download link
    const fileUrl = `${req.protocol}://${req.get("host")}/downloads/${path.basename(filePath)}`;

    res.json({ status: "success", file: fileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Serve downloaded files via /downloads route
app.use("/downloads", express.static(DOWNLOAD_DIR));

// Start server on port 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
