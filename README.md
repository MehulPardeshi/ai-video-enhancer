# AI Video Enhancer

A modern, privacy-first video enhancement application that uses Real-ESRGAN AI models to upscale and enhance video quality directly in your browser.

## ✨ Features

- **Real AI Enhancement**: Uses Real-ESRGAN models for genuine super-resolution
- **Privacy First**: All processing happens locally or through secure APIs
- **Multiple Scales**: Support for 2x, 3x, and 4x video upscaling
- **Real-time Preview**: Compare original vs enhanced video side by side
- **Browser-based**: No software installation required
- **Production Ready**: Built with React, TypeScript, and modern web technologies

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ai-video-enhancer.git
cd ai-video-enhancer
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up API Keys

For production-quality AI enhancement, you'll need a Replicate API token:

1. Go to [Replicate.com](https://replicate.com/account/api-tokens)
2. Create an account and generate an API token
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Add your API token to `.env`:
   ```
   VITE_REPLICATE_API_TOKEN=r8_your_token_here
   ```

### 4. Start Development Server
```bash
npm start
```

Visit `http://localhost:5173` to use the application.

## 🔧 Configuration Options

### API Providers

The application supports multiple AI processing providers:

- **Replicate** (Recommended): High-quality, reliable, pay-per-use
- **Fallback Mode**: Browser-based upscaling when API is unavailable

### Environment Variables

```bash
# Required for production AI enhancement
VITE_REPLICATE_API_TOKEN=your_replicate_api_token

# Optional: Alternative providers
VITE_RUNPOD_API_TOKEN=your_runpod_token
VITE_BANANA_API_TOKEN=your_banana_token
```

## 💰 Cost Considerations

- **Replicate**: ~$0.01-$0.05 per image processed
- **Self-hosted**: Free but requires GPU infrastructure
- **Fallback**: Free basic upscaling

## 🛠️ Development

### Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Video Processing**: FFmpeg.wasm
- **AI Models**: Real-ESRGAN via Replicate API
- **Build Tool**: Vite

### Scripts

```bash
npm start      # Start development server
npm run build  # Build for production
npm run lint   # Run ESLint
npm run preview # Preview production build
```

### Architecture

```
src/
├── components/           # React components
│   ├── VideoUploader.tsx    # File upload interface
│   ├── VideoProcessor.tsx   # Main processing component
│   ├── VideoPreview.tsx     # Side-by-side comparison
│   └── EnhancementSettings.tsx # AI settings panel
├── hooks/               # Custom React hooks
│   ├── useFFmpeg.ts        # Video frame extraction
│   └── useAIEnhancer.ts    # AI model integration
└── types/               # TypeScript definitions
    └── video.ts            # Video file types
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on git push

### Docker

```bash
# Build Docker image
docker build -t ai-video-enhancer .

# Run container
docker run -p 3000:3000 -e VITE_REPLICATE_API_TOKEN=your_token ai-video-enhancer
```

### Static Hosting

```bash
npm run build
# Deploy the 'dist' folder to any static hosting service
```

## 🔒 Privacy & Security

- **Local Processing**: Video frames are processed locally when possible
- **Secure APIs**: All API communications use HTTPS
- **No Data Storage**: Videos are not stored on servers
- **Client-side Only**: No backend database or user tracking

## 📊 Performance

### Recommended System Requirements

- **Browser**: Chrome 90+, Firefox 88+, Safari 14+
- **RAM**: 4GB+ for processing large videos
- **Internet**: Stable connection for API calls

### Optimization Tips

- Use 2x scale for faster processing
- Process shorter video clips for better performance
- Ensure stable internet connection for API calls

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**"Please add VITE_REPLICATE_API_TOKEN to your .env file"**
- Solution: Set up your Replicate API key as described in setup instructions

**"API request failed: 401"**
- Solution: Check that your API token is valid and has sufficient credits

**"Processing failed"**
- Solution: Try with a smaller video file or lower scale setting

**Video upload fails**
- Solution: Ensure video file is under 100MB and in supported format (MP4, WebM, MOV)

### Performance Issues

- Try using a smaller enhancement scale (2x instead of 4x)
- Process shorter video segments
- Close other browser tabs to free up memory

## 🔗 Links

- [Real-ESRGAN Paper](https://arxiv.org/abs/2107.10833)
- [Replicate API Documentation](https://replicate.com/docs)
- [FFmpeg.wasm Documentation](https://ffmpegwasm.netlify.app/)

---

Built with ❤️ for high-quality video enhancement 