export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { channelId } = req.query;
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!channelId) {
    return res.status(400).json({ error: 'channelId is required', videos: [] });
  }
  if (!apiKey) {
    return res.status(500).json({ error: 'YOUTUBE_API_KEY not configured', videos: [] });
  }

  try {
    // 1. 채널 정보 + uploads playlist ID 가져오기
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,statistics&id=${channelId}&key=${apiKey}`
    );
    const channelData = await channelRes.json();

    if (!channelData.items?.length) {
      return res.status(404).json({ error: 'Channel not found', videos: [] });
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
    const subscriberCount = channelData.items[0].statistics?.subscriberCount;

    // 2. 최근 영상 목록 가져오기 (최대 10개)
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=10&key=${apiKey}`
    );
    const playlistData = await playlistRes.json();

    if (!playlistData.items?.length) {
      return res.json({ videos: [], subscriberCount });
    }

    const videoIds = playlistData.items
      .map(item => item.snippet.resourceId.videoId)
      .join(',');

    // 3. 영상별 조회수 + 상세 정보 가져오기
    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${apiKey}`
    );
    const statsData = await statsRes.json();

    const videos = (statsData.items || []).map(video => ({
      id: video.id,
      title: video.snippet.title,
      publishedAt: video.snippet.publishedAt,
      viewCount: parseInt(video.statistics.viewCount || '0'),
      likeCount: parseInt(video.statistics.likeCount || '0'),
      thumbnail: video.snippet.thumbnails?.medium?.url || '',
      url: `https://www.youtube.com/watch?v=${video.id}`,
    }));

    return res.json({ videos, subscriberCount });

  } catch (e) {
    console.error('YouTube API error:', e);
    return res.status(500).json({ error: e.message, videos: [] });
  }
}
