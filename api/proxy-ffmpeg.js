export default async function handler(req, res) {
  const { file } = req.query;
  
  if (!file || !['core.js', 'core.wasm'].includes(file)) {
    return res.status(400).json({ error: 'Invalid file parameter' });
  }
  
  try {
    const baseUrl = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
    const fileName = file === 'core.js' ? 'ffmpeg-core.js' : 'ffmpeg-core.wasm';
    const url = `${baseUrl}/${fileName}`;
    
    console.log(`Proxying FFmpeg file: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    
    // Set appropriate headers for FFmpeg files
    const contentType = file === 'core.js' 
      ? 'application/javascript' 
      : 'application/wasm';
    
    // Set CORS headers for cross-origin isolation
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    
    // Cache the files for better performance
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
    
    // Stream the response
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
    
  } catch (error) {
    console.error('FFmpeg proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to proxy FFmpeg file',
      details: error.message 
    });
  }
} 