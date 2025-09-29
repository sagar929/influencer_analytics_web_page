import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import axios from 'axios';

function ResultPage() {
  const { handle } = useParams();
  console.log("Param handle:", handle);
  const location = useLocation();
  const username = (handle || location.state?.username || '').trim();

  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [displayReels, setDisplayReels] = useState([]);
  const [loadingReels, setLoadingReels] = useState(false);
  const [reelsError, setReelsError] = useState(null);
  const [reelsLoadedOnce, setReelsLoadedOnce] = useState(false);
  const [showReels, setShowReels] = useState(false);

  const [showAnalytics, setShowAnalytics] = useState(false);

  // 🆕 State for image analysis
  const [analyzingIndex, setAnalyzingIndex] = useState(null);
  const [analysisResults, setAnalysisResults] = useState({});

  // Load profile with analytics
  useEffect(() => {
    if (!username) {
      setError("Username missing");
      setLoading(false);
      return;
    }
    let ignore = false;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`https://influencer-analytics-web-page.vercel.app/user/${username}`, { timeout: 25000 });
        if (ignore) return;
        
        console.log("Profile response:", res.data);
        
        if (res.data?.user_data) {
          setUser(res.data.user_data);
          setAnalytics(res.data.analytics);
          
          if (res.data.analytics && !res.data.analytics.message && res.data.analytics.averageLikes >= 0) {
            setShowAnalytics(true);
          }
        } else {
          setError("User not found");
        }
      } catch (e) {
        setError("Error fetching data: " + (e.response?.status || e.message));
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchProfile();
    return () => { ignore = true; };
  }, [username]);

  // Load reels
  const loadReels = async () => {
    if (!username) return;
    if (reelsLoadedOnce) {
      setShowReels(!showReels);
      return;
    }
    setLoadingReels(true);
    setReelsError(null);
    try {
      const res = await axios.post(
        `https://influencer-analytics-web-page.vercel.app/user/${username}/reels`,
        null,
        { timeout: 30000 }
      );
      console.log("Reels raw:", res.data);

      const arr = res.data?.reels || [];

      if (!Array.isArray(arr)) {
        setReelsError("Unexpected reels response format");
        setDisplayReels([]);
      } else {
        setDisplayReels(arr.slice(0, 10));
        if (!arr.length) setReelsError("No reels returned");
        console.log(`Fetched ${arr.length} total reels, displaying first 10`);
      }
      setReelsLoadedOnce(true);
      setShowReels(true);
    } catch (e) {
      console.error("Reels fetch error:", e.response?.data || e.message);
      setReelsError("Failed to load reels");
    } finally {
      setLoadingReels(false);
    }
  };

  // 🆕 Analyze reel thumbnail with Clarifai
  const analyzeReelImage = async (reelIndex, imageUrl) => {
    if (!imageUrl) {
      alert("No image URL available for this reel");
      return;
    }

    setAnalyzingIndex(reelIndex);

    try {
      console.log("🔍 Analyzing reel", reelIndex, "with image:", imageUrl);
      
      const res = await axios.post(
        'https://influencer-analytics-web-page.vercel.app/analyze-image',
        { imageUrl },
        { timeout: 15000 }
      );

      console.log("✅ Analysis result:", res.data);

      setAnalysisResults(prev => ({
        ...prev,
        [reelIndex]: res.data
      }));

    } catch (err) {
      console.error("❌ Analysis error:", err);
      alert("Failed to analyze image: " + (err.response?.data?.error || err.message));
    } finally {
      setAnalyzingIndex(null);
    }
  };

  // Enhanced thumbnail picker
  const pickThumb = (reel) => {
    const media = reel?.node?.media || reel?.media || reel;
    const candidates = media?.image_versions2?.candidates || [];
    if (candidates.length > 0) {
      return candidates[0]?.url;
    }
    return media?.thumbnail_url || media?.display_url || media?.preview || '';
  };

  // Extract stats from the correct nested structure  
  const getReelStats = (reel) => {
    const media = reel?.node?.media || reel?.media || reel;
    return {
      likes: media?.like_count || 0,
      comments: media?.comment_count || 0,
      views: media?.play_count || media?.view_count || 0,
      code: media?.code || 'N/A',
      caption: media?.caption?.text || media?.edge_media_to_caption?.edges?.[0]?.node?.text || 'No caption available'
    };
  };

  // Format numbers
  const formatCount = (count) => {
    if (!count || count === 0) return '0';
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1013] text-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p>Loading profile & calculating analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d1013] text-red-400 gap-4">
        <p>{error || "No data"}</p>
        <Link to="/" className="text-xs text-slate-400 underline hover:text-slate-200">
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0d1013] text-slate-100 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Profile Section */}
        <div className="bg-[#10151a] border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6 mb-8">
          <div className="flex justify-center">
            <div className="w-36 h-36 rounded-full border border-slate-700/70 overflow-hidden relative bg-slate-800">
              <img
                src={`https://influencer-analytics-web-page.vercel.app/proxy-image?url=${encodeURIComponent(user.profile_pic_url)}`}
                alt={user.username}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: 'center', transform: 'scale(1.15)' }}
              />
            </div>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold">{user.full_name}</h2>
            <p className="text-slate-400">@{user.username}</p>
          </div>

          {/* Basic Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <Stat label="Followers" value={formatCount(user.follower_count)} />
            <Stat label="Following" value={formatCount(user.following_count)} />
            <Stat label="Posts" value={formatCount(user.media_count)} />
          </div>

          {/* Analytics Section */}
          {analytics && showAnalytics && (
            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-lg font-semibold mb-4 text-center text-slate-200">
                📊 Engagement & Analytics
              </h3>
              
              {analytics.message ? (
                <div className="text-center">
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                    <p className="text-yellow-400 text-sm">{analytics.message}</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    Try loading reels below for more detailed analytics
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4 text-center mb-4">
                    <div className="bg-[#0d1116] p-4 rounded-xl border border-slate-800">
                      <p className="text-lg font-semibold text-pink-400">{formatCount(analytics.averageLikes || 0)}</p>
                      <p className="text-xs text-slate-400 uppercase tracking-wide">Average Likes per Post</p>
                    </div>
                    <div className="bg-[#0d1116] p-4 rounded-xl border border-slate-800">
                      <p className="text-lg font-semibold text-cyan-400">{formatCount(analytics.averageComments || 0)}</p>
                      <p className="text-xs text-slate-400 uppercase tracking-wide">Average Comments per Post</p>
                    </div>
                    <div className="bg-[#0d1116] p-4 rounded-xl border border-slate-800">
                      <p className="text-lg font-semibold text-green-400">{analytics.engagementRate || 0}%</p>
                      <p className="text-xs text-slate-400 uppercase tracking-wide">Engagement Rate</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Button Section */}
          <div className="flex justify-center gap-3 pt-2">
            {analytics && (
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-sm font-medium flex items-center gap-2"
              >
                📊 {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
              </button>
            )}

            <button
              onClick={loadReels}
              disabled={loadingReels}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {loadingReels ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Fetching Reels...
                </>
              ) : reelsLoadedOnce ? (
                showReels ? 'Hide Reels' : 'Show Reels'
              ) : (
                'Load Recent Reels'
              )}
            </button>
          </div>

          <div className="text-center">
            <Link to="/" className="text-xs text-slate-500 hover:text-slate-300 underline">
              Back to search
            </Link>
          </div>
        </div>

        {/* Reels Section */}
        {showReels && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <span className="text-blue-400">🎬</span>
              Recent Reels ({displayReels.length})
            </h3>

            {reelsError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 text-sm">{reelsError}</p>
              </div>
            )}

            {!reelsError && displayReels.length === 0 && !loadingReels && (
              <p className="text-slate-400 text-sm">No reels available.</p>
            )}

            {!loadingReels && displayReels.length > 0 && (
              <div className="space-y-4">
                {displayReels.map((reel, i) => {
                  const thumb = pickThumb(reel);
                  const stats = getReelStats(reel);
                  const analysis = analysisResults[i];
                  const isAnalyzing = analyzingIndex === i;
                  
                  return (
                    <div key={i} className="bg-[#10151a] border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
                      <div className="flex gap-4">
                        {/* Thumbnail */}
                        <div className="flex-shrink-0 w-32 h-20 bg-slate-800 rounded-lg overflow-hidden">
                          {thumb ? (
                            <img
                              src={`https://influencer-analytics-web-page.vercel.app/proxy-image?url=${encodeURIComponent(thumb)}`}
                              alt={`Reel ${i + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-slate-500 text-xs">Failed to load</div>`;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                              No image
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-slate-200 mb-1">
                                Instagram Reel #{i + 1}
                              </h4>
                              {/* <p className="text-xs text-slate-500">
                                ID: {stats.code}
                              </p> */}
                            </div>
                            
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
                                🎬 Reel
                              </span>
                              {stats.views > 0 && (
                                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">
                                  {formatCount(stats.views)} views
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Stats */}
                          <div className="flex gap-4 text-xs text-slate-500 mb-2">
                            <div className="flex items-center gap-1">
                              <span className="text-red-400">❤️</span>
                              <span>{formatCount(stats.likes)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-blue-400">💬</span>
                              <span>{formatCount(stats.comments)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-green-400">▶️</span>
                              <span>{formatCount(stats.views)}</span>
                            </div>
                            <div className="ml-auto">
                              <a 
                                href={`https://instagram.com/p/${stats.code}/`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 text-xs"
                              >
                                View ↗
                              </a>
                            </div>
                          </div>

                          {/* 🆕 Analyze Button */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => analyzeReelImage(i, thumb)}
                              disabled={isAnalyzing || !thumb}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded text-xs font-medium flex items-center gap-1.5"
                            >
                              {isAnalyzing ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Analyzing...
                                </>
                              ) : (
                                <>
                                  🔍 Analyze Image
                                </>
                              )}
                            </button>

                            {analysis && (
                              <span className="text-xs text-purple-400">
                                ✅ {analysis.tags.length} tags found
                              </span>
                            )}
                          </div>

                          {/* 🆕 Analysis Results */}
                          {analysis && (
                            <div className="mt-3 p-3 bg-[#0d1116] border border-purple-500/30 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="text-xs font-semibold text-purple-300">
                                  Tags
                                </h5>
                                <span className="text-xs text-slate-500">
                                  Vibe: {analysis.vibe}
                                </span>
                              </div>
                              
                              <div className="flex flex-wrap gap-1.5">
                                {analysis.tags.slice(0, 8).map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                                    title={`Confidence: ${(tag.confidence * 100).toFixed(1)}%`}
                                  >
                                    {tag.name}
                                  </span>
                                ))}
                                {analysis.tags.length > 8 && (
                                  <span className="px-2 py-1 bg-slate-700 text-slate-400 rounded text-xs">
                                    +{analysis.tags.length - 8} more
                                  </span>
                                )}
                              </div>

                              {analysis.tags.length === 0 && (
                                <p className="text-xs text-slate-500">
                                  No high-confidence tags found
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-lg font-semibold">{value ?? 0}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}


export default ResultPage;
