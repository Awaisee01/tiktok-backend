const fetch = (...args) => import("node-fetch").then((mod) => mod.default(...args));
const { Headers } = require("node-fetch");

module.exports = async (req, res) => {
  const { url, apikey } = req.query;
  const API_KEY = "1234";  // Replace with your own API Key.

  // Validate the URL and API key
  if (!url || !apikey) {
    return res.status(400).json({ status: "error", message: "Missing URL or API key" });
  }

  if (apikey !== API_KEY) {
    return res.status(403).json({ status: "error", message: "Invalid API key" });
  }

  try {
    // Extract TikTok video ID from the URL
    const getIdVideo = async (url) => {
      const match = url.match(/\/(video|photo)\/(\d{19})/);
      if (!match) throw new Error("Invalid TikTok URL");
      return match[2];
    };

    const idVideo = await getIdVideo(url);

    // Fetch video data from TikTok API
    const api = `https://api22-normal-c-alisg.tiktokv.com/aweme/v1/feed/?aweme_id=${idVideo}`;
    const headers = new Headers();
    const tiktokRes = await fetch(api, { method: "OPTIONS", headers });
    const text = await tiktokRes.text();
    const data = JSON.parse(text);

    const video = data?.aweme_list?.[0]?.video;
    const videoUrl = video?.play_addr?.url_list?.[0] || video?.download_addr?.url_list?.[0];
    if (!videoUrl) throw new Error("Video URL not found");

    // Respond with the video URL
    res.status(200).json({ status: "success", file: videoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};
