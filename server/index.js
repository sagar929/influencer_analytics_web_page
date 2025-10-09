const express = require("express");
const cors = require("cors");
const app = express();
const axios = require('axios');
require('dotenv').config();

// Remove the old Clarifai import and use direct API calls
// const Clarifai = require("clarifai");
// const clarifaiApp = new Clarifai.App({ apiKey: process.env.CLARIFAI_PAT });

// Middleware
app.use(cors({
    origin: ['https://influencer-analytics-web-page-vtbc.vercel.app']
}));

// hey i m the added comment and now i want to gest pushed 
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("Backend is working ✅");
});

// User profile route with analytics
app.get("/user/:username", async (req, res) => {
  const username = req.params.username;
  
  try {
    const response = await axios({
      method: 'GET',
      baseURL: 'https://instagram-scraper-stable-api.p.rapidapi.com',
      url: '/ig_get_fb_profile_hover.php',
      params: { username_or_url: username },
      headers: {
        'X-RapidAPI-Host': process.env.RAPIDAPI_HOST,
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY
      }
    });

    const data = response.data;
    console.log("Profile API Response:", data);

    const followers = data?.user_data?.follower_count || 0;
    let analytics = null;

    try {
      console.log("Trying to fetch reels for analytics...");
      const form = new URLSearchParams();
      form.append("username_or_url", `https://www.instagram.com/${username}/`);
      form.append("amount", "10");

      const reelsResponse = await axios({
        method: "POST",
        url: "https://instagram-scraper-stable-api.p.rapidapi.com/get_ig_user_reels.php",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-RapidAPI-Host": process.env.RAPIDAPI_HOST,
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY
        },
        data: form.toString(),
        timeout: 20000
      });

      const reels = reelsResponse.data?.reels || [];
      console.log(`Found ${reels.length} reels for analytics`);

      if (Array.isArray(reels) && reels.length > 0) {
        let totalLikes = 0;
        let totalComments = 0;
        let validReels = 0;

        reels.slice(0, 10).forEach((reel, index) => {
          const media = reel?.node?.media || reel?.media || reel;
          const likes = media?.like_count || 0;
          const comments = media?.comment_count || 0;

          if (likes >= 0 && comments >= 0) {
            totalLikes += likes;
            totalComments += comments;
            validReels++;
            console.log(`Reel ${index + 1}: ${likes} likes, ${comments} comments`);
          }
        });

        if (validReels > 0) {
          const averageLikes = Math.round(totalLikes / validReels);
          const averageComments = Math.round(totalComments / validReels);
          const engagementRate = followers > 0 
            ? parseFloat(((averageLikes + averageComments) / followers * 100).toFixed(2))
            : 0;

          analytics = {
            averageLikes,
            averageComments,
            engagementRate,
            totalLikes,
            totalComments,
            postsAnalyzed: validReels,
            followerCount: followers,
            dataSource: "reels"
          };

          console.log("✅ Analytics calculated from reels:", analytics);
        }
      }
    } catch (reelsError) {
      console.log("❌ Failed to fetch reels for analytics:", reelsError.message);
    }

    res.json({
      ...data,
      analytics: analytics || {
        averageLikes: 0,
        averageComments: 0,
        engagementRate: 0,
        message: "Unable to fetch posts/reels for analytics",
        followerCount: followers
      }
    });

  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch from Instagram API',
      message: error.message,
      details: error.response?.data
    });
  }
});

// Proxied image route to handle CORS issues
app.get("/proxy-image", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send("Image URL is required");
  }

  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const contentType = response.headers["content-type"] || "image/jpeg";
    res.set("Content-Type", contentType);
    res.send(response.data);
  } catch (err) {
    console.error("Image proxy error:", err.message);
    res.status(500).send("Failed to load image");
  }
});

// Reels route
app.post("/user/:username/reels", async (req, res) => {
  const username = req.params.username;
  if (!username) return res.status(400).json({ error: "username param missing" });

  const form = new URLSearchParams();
  form.append("username_or_url", `https://www.instagram.com/${username}/`);
  form.append("amount", "200");

  try {
    console.log(`[Reels] Fetching reels for ${username}`);
    const response = await axios({
      method: "POST",
      url: "https://instagram-scraper-stable-api.p.rapidapi.com/get_ig_user_reels.php",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-RapidAPI-Host": process.env.RAPIDAPI_HOST,
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY
      },
      data: form.toString(),
      timeout: 30000
    });

    const possible =
      response.data?.reels ||
      response.data?.data?.reels ||
      response.data?.data ||
      response.data?.items ||
      [];

    console.log(`[Reels] Status ${response.status} – items: ${
      Array.isArray(possible) ? possible.length : "not array"
    }`);

    res.json({ reels: possible, total_reels: possible.length });
  } catch (err) {
    console.error("[Reels ERROR]", err.response?.status, err.message);
    res.status(err.response?.status || 500).json({
      error: "Failed to fetch reels",
      message: err.message,
      upstream: err.response?.data || err.code
    });
  }
});

// ...existing code...

// 🆕 Fixed Clarifai Image Analysis Endpoint
app.post("/analyze-image", async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: "imageUrl is required" });
  }

  try {
    console.log("🔍 Analyzing image with Clarifai:", imageUrl);
    
    // Use Clarifai's public general-image-recognition model exactly like the curl example
    const clarifaiResponse = await axios.post(
      "https://api.clarifai.com/v2/users/clarifai/apps/main/models/general-image-recognition/versions/aa7f35c01e0642fda5cf400f543e7c40/outputs",
      {
        inputs: [
          {
            data: {
              image: {
                url: imageUrl
                
              }
            }
          }
        ]
      },
      {
        headers: {
          'Authorization': `Key ${process.env.CLARIFAI_PAT}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    console.log("Clarifai API Response Status:", clarifaiResponse.status);

    if (!clarifaiResponse.data?.outputs?.[0]?.data?.concepts) {
      throw new Error("Invalid response format from Clarifai");
    }

    const concepts = clarifaiResponse.data.outputs[0].data.concepts;

    // Filter tags with confidence > 0.7 (lowered threshold)
    const tags = concepts
      .filter(c => c.value > 0.7)
      .map(c => ({ name: c.name, confidence: c.value }));

    // Detect vibe/category
    const vibeKeywords = ["luxury", "casual", "aesthetic", "energetic", "fashion", "travel", "fitness", "lifestyle", "urban", "nature", "sport", "workout", "gym"];
    const vibes = concepts
      .filter(c => vibeKeywords.includes(c.name.toLowerCase()))
      .map(c => c.name);

    console.log("✅ Clarifai analysis complete:", { 
      totalConcepts: concepts.length, 
      highConfidenceTags: tags.length 
    });

    res.json({
      tags,
      allConcepts: concepts.slice(0, 20).map(c => ({ name: c.name, confidence: c.value })), // Top 20 for reference
      vibe: vibes[0] || "general",
      quality: {
        confidence: concepts[0]?.value || null,
        totalTagsFound: concepts.length
      }
    });

  } catch (err) {
    console.error("❌ Clarifai Error:", err.message);
    console.error("Error details:", err.response?.data);
    
    res.status(500).json({ 
      error: "Failed to analyze the image",
      details: err.response?.data?.status?.description || err.message
    });
  }
});





// Start Server
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

});
