# BYOK Studio - Bring Your Own Key Video Platform

A premium video generation platform with **Glassmorphism UI**, multi-modal input system, and AI-powered video creation using Veo 3.1 API.

## ✨ Features

### 🎨 **Premium Glassmorphism UI**
- Dark mode with gradient backgrounds
- Frosted glass panels with backdrop blur
- Smooth animations and micro-interactions
- Responsive and modern design

### 🎬 **Three Generation Modes**
1. **Text-to-Video (T2V)**: Generate videos from text prompts
2. **Image-to-Video (I2V)**: Add motion to static images
3. **Ingredients**: Reusable assets with @ tag system for character consistency

### 📝 **Asset Management**
- Ingredient vault for characters, objects, styles
- @ tag system for prompt references
- Reference image uploads
- Consistent character/object generation

### 🎞️ **Linear Sequencer**
- Horizontal timeline for clip management
- Drag-and-drop reordering
- Multi-clip export with stitching
- Preview and thumbnails

### ⚡ **Real-time Status**
- Live generation progress
- Status indicators: "Dreaming", "Rendering", "Polishing"
- Automatic clip addition to sequencer
- Error handling and retry

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Python** 3.9+
- **Google Cloud Platform** account with:
  - Vertex AI API enabled
  - Cloud Storage bucket
  - Service account credentials
- (Optional) **FFmpeg** for local video stitching

### Frontend Setup

```bash
# Navigate to the project root (if not already there)
cd bringYourKey

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Update .env.local with your values:
# VITE_API_URL=http://localhost:8000/api
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
python -m pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Update .env with your GCP credentials:
# GCP_PROJECT_ID=your-project-id
# GCS_BUCKET_NAME=byok-videos
# GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# Run the server
python main.py
```

Backend runs on `http://localhost:8000`

---

## 📁 Project Structure

```
bringYourKey/
├── src/
│   ├── components/           # React components
│   │   ├── WorkspaceCanvas.tsx   # 16:9 video player
│   │   ├── MultiModalSidebar.tsx # Tabbed input system
│   │   ├── TextTab.tsx           # T2V generation
│   │   ├── ImageTab.tsx          # I2V generation
│   │   ├── IngredientsTab.tsx    # Asset library
│   │   └── LinearSequencer.tsx   # Timeline & export
│   ├── store/                # Zustand state management
│   │   ├── videoStore.ts         # Generation state
│   │   ├── sequencerStore.ts     # Timeline clips
│   │   └── ingredientStore.ts    # Asset vault
│   ├── services/             # API integration
│   │   └── api.ts                # Backend API calls
│   ├── utils/                # Utilities
│   │   └── tagParser.ts          # @ tag parsing
│   ├── lib/                  # Shared libraries
│   └── index.css             # Glassmorphism styles
│
├── backend/
│   ├── routers/              # API routes
│   │   └── generation.py         # Video generation endpoints
│   ├── services/             # Business logic
│   │   ├── veo_service.py        # Veo 3.1 integration
│   │   ├── gcs_service.py        # Cloud Storage
│   │   └── ffmpeg_service.py     # Video stitching
│   ├── models/               # Data models
│   │   └── schemas.py            # Pydantic schemas
│   ├── main.py               # FastAPI app
│   └── requirements.txt      # Python dependencies
```

---

## 🎨 UI Components

### Workspace Canvas
- Centered 16:9 video player
- Glassmorphism frame with glow effect
- Generation status overlay
- Custom video controls

### Multi-Modal Sidebar
**Three Tabs:**

1. **Text Tab**
   - Prompt input (500 char limit)
   - @ tag autocomplete
   - Aspect ratio selector (16:9, 9:16, 1:1)
   - Audio prompt toggle
   - Generate button

2. **Image Tab**
   - Drag-and-drop upload
   - Image preview
   - Motion intensity slider (0-10)
   - Aspect ratio selector

3. **Ingredients Tab**
   - Asset grid view
   - Add new ingredient
   - Tag assignment (@Hero, @CityStreet)
   - Reference image upload
   - Type categorization

### Linear Sequencer
- Horizontal clip scrolling
- Drag-to-reorder
- Clip thumbnails
- Duration indicators
- Export button

---

## 🔌 API Endpoints

### Text-to-Video
```http
POST /api/generate/t2v
Content-Type: application/json

{
  "prompt": "A cinematic shot of @Hero walking...",
  "aspectRatio": "16:9",
  "audioPrompt": "Upbeat music",
  "referenceImages": ["url1", "url2"]
}

Response:
{
  "jobId": "uuid",
  "status": "pending",
  "message": "Video generation started"
}
```

### Image-to-Video
```http
POST /api/generate/i2v
Content-Type: multipart/form-data

image: <file>
motionIntensity: 7
aspectRatio: 16:9

Response:
{
  "jobId": "uuid",
  "status": "pending"
}
```

### Status Polling
```http
GET /api/generation/{jobId}/status

Response:
{
  "jobId": "uuid",
  "status": "rendering",
  "progress": 50,
  "resultUrl": null
}
```

### Export Video
```http
POST /api/export
Content-Type: application/json

{
  "clipIds": ["job1", "job2"],
  "format": "mp4",
  "quality": "high"
}

Response:
{
  "exportUrl": "https://...",
  "message": "Export complete"
}
```

---

## 🎯 How to Use

### 1. Generate a Video

**Option A: Text-to-Video**
1. Click "Text" tab
2. Enter your prompt (use @ tags for ingredients)
3. Select aspect ratio
4. (Optional) Toggle audio and add custom prompt
5. Click "Generate Video"

**Option B: Image-to-Video**
1. Click "Image" tab
2. Drag & drop or upload an image
3. Adjust motion intensity slider
4. Click "Generate Video"

### 2. Manage Ingredients

1. Click "Ingredients" tab
2. Click "+" to add new ingredient
3. Enter tag (e.g., "Hero")
4. Add reference images
5. Use @Hero in prompts to maintain consistency

### 3. Create Final Export

1. Generate multiple clips
2. Clips appear in timeline at bottom
3. Drag to reorder if needed
4. Click "Export Final Video"
5. Download stitched video

---

## 🔧 Configuration

### Glassmorphism Theme

Customize in `tailwind.config.js`:

```js
glass: {
  bg: "rgba(255, 255, 255, 0.05)",
  border: "rgba(255, 255, 255, 0.1)",
  hover: "rgba(255, 255, 255, 0.08)",
}
```

### API Integration

Update backend services in `backend/services/`:

- `veo_service.py` - Replace mock with actual Veo API calls
- `gcs_service.py` - Add real GCS upload/download
- `ffmpeg_service.py` - Implement video stitching

---

## 🚢 Deployment

### Frontend (Vercel - Free)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd bringYourKey
vercel

# Set environment variables in Vercel dashboard
```

### Backend Options

**Option 1: Railway (Free Tier)**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
cd backend
railway login
railway init
railway up
```

**Option 2: Google Cloud Run**
```bash
# Build container
gcloud builds submit --tag gcr.io/PROJECT_ID/byok-backend

# Deploy
gcloud run deploy byok-backend \
  --image gcr.io/PROJECT_ID/byok-backend \
  --platform managed \
  --region us-central1
```

---

## 🧪 Testing

### Frontend
```bash
npm run test
```

### Backend
```bash
pytest tests/
```

### Integration
```bash
npm run test:integration
```

---

## 📝 License

MIT License

---

## 🤝 Contributing

Contributions welcome! Please read the contributing guidelines first.

---

## 💡 Tips

- Use descriptive @ tags for better ingredient organization
- Start with lower motion intensity for subtle effects
- Preview clips before exporting final video
- Export in high quality for best results

---

## 🆘 Support

For issues:
1. Check the backend logs for API errors
2. Verify GCP credentials are correct
3. Ensure Vertex AI API is enabled
4. Contact support with error details

---

## 🎓 Learn More

- [Veo 3.1 Documentation](https://cloud.google.com/vertex-ai)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [React + Vite](https://vitejs.dev)
- [Zustand Guide](https://zustand-demo.pmnd.rs)

---

**Built with ❤️ using React, FastAPI, and Google Vertex AI**
