export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, scale = 2 } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    const apiKey = process.env.VITE_REPLICATE_API_TOKEN;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'API token not configured' });
    }

    // Start prediction
    const prediction = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa',
        input: {
          image: image,
          scale: scale,
          face_enhance: false
        }
      })
    });

    if (!prediction.ok) {
      throw new Error(`Replicate API error: ${prediction.status}`);
    }

    const predictionData = await prediction.json();
    
    res.status(200).json(predictionData);
  } catch (error) {
    console.error('Enhancement error:', error);
    res.status(500).json({ error: 'Enhancement failed', details: error.message });
  }
} 