# Quick Start Guide - BYOK Studio

## 🚀 Fast Setup (5 minutes)

### Step 1: Frontend Setup
```bash
# Navigate to the project root
cd bringYourKey

# Install dependencies (already done)
# npm install

# Start frontend
npm run dev
```

✅ Frontend should be running at `http://localhost:5173`

---

### Step 2: Backend Setup

```bash
# Open new terminal
cd bringYourKey/backend

# Create virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate

# Install dependencies
python -m pip install -r requirements.txt

# Start backend
python main.py
```

✅ Backend should be running at `http://localhost:8000`

---

### Step 3: Visit the App

Open browser and go to: `http://localhost:5173`

You should see:
- **Glassmorphism dark UI** with gradient background
- **Header** with BYOK Studio branding
- **Workspace Canvas** in the center (16:9 video player)
- **Sidebar** on the right with three tabs (Text, Image, Ingredients)
- **Sequencer** at the bottom (initially empty)

---

## 📝 Test the Features

### Test 1: Text-to-Video Mode

1. Click **"Text"** tab (should be selected by default)
2. Type a prompt: `"A cinematic shot of a hero walking through a neon city"`
3. Select aspect ratio: **16:9**
4. (Optional) Toggle audio and add prompt
5. Click **"Generate Video"** button

**Expected:** 
- Button shows loading spinner
- Workspace shows generation overlay
- Status updates: "Dreaming..." → "Rendering..." → "Polishing..." → "Complete"
- (Note: Using mock API, so it completes instantly)

### Test 2: Image-to-Video Mode

1. Click **"Image"** tab
2. Drag and drop any image OR click to upload
3. Adjust **Motion Intensity slider** (try 7/10)
4. Click **"Generate Video"**

**Expected:**
- Image preview shows in glassmorphism frame
- Generation starts with status overlay

### Test 3: Ingredients

1. Click **"Ingredients"** tab
2. Click **"+" button** to add new
3. Fill in:
   - Tag: `Hero` (will become @Hero)
   - Name: `Main Character`
   - Type: `Character`
4. Click on image upload area and select reference images
5. Click **"Save"**

**Expected:**
- New ingredient card appears in the list
- Shows @Hero tag
- Can now use @Hero in text prompts

### Test 4: Sequencer & Export

1. Generate a few videos (either T2V or I2V)
2. Check the **sequencer at bottom** - clips should appear
3. Click on a clip to select it
4. Try dragging clips to reorder (grab the grip icon)
5. Click **"Export Final Video"** button

**Expected:**
- Export progress bar animates
- Final download triggers

---

## 🎨 UI Features to Notice

### Glassmorphism Effects
- **Frosted glass panels** with backdrop blur
- **Subtle borders** (rgba white with low opacity)
- **Hover effects** on buttons and cards
- **Glow effects** on active elements

### Animations
- **Smooth transitions** on all state changes
- **Gradient text** on headings
- **Spinning loaders** during generation
- **Progress bars** with gradient fills
- **Shimmer effects** on loading states

### Responsive Details
- **Custom scrollbars** in glassmorphism style
- **Safety grid** in empty video player
- **Clip thumbnails** in sequencer
- **Status badges** on ingredients

---

## ⚙️ Configuration

### Change API URL

Edit: `bringYourKey\.env.local` (create if doesn't exist)
```env
VITE_API_URL=http://localhost:8000/api
```

### Connect to Real APIs

When ready to use actual Veo/GCS:

1. **Get GCP Credentials:**
   - Create service account in Google Cloud Console
   - Enable Vertex AI API
   - Create Cloud Storage bucket
   - Download JSON credentials

2. **Update Backend `.env`:**
```env
GCP_PROJECT_ID=your-project-id
GCS_BUCKET_NAME=your-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
```

3. **Uncomment Real API Code:**
   - In `backend/services/veo_service.py` - uncomment Vertex AI code
   - In `backend/services/gcs_service.py` - uncomment GCS upload code
   - In `backend/services/ffmpeg_service.py` - uncomment ffmpeg code

---

## 🐛 Troubleshooting

### Frontend won't start
```bash
# Make sure dependencies are installed
npm install

# Clear cache
rm -rf node_modules
npm install
```

### Backend errors
```bash
# Make sure virtual environment is activated
venv\Scripts\activate

# Reinstall dependencies
python -m pip install -r requirements.txt
```

### CORS errors
- Check backend is running on port 8000
- Check CORS origins in `backend/main.py` include your frontend URL

### Import errors in frontend
- Check all packages are in package.json
- Run `npm install` again
- Restart dev server

---

## 📱 Next Steps

### For Development:
1. Connect to real Veo 3.1 API
2. Set up actual GCS bucket
3. Test with real video generation
4. Add Supabase authentication
5. Implement video preview thumbnails

### For Production:
1. Build frontend: `npm run build`
2. Deploy to Vercel (free)
3. Deploy backend to Railway/Cloud Run
4. Set environment variables in hosting platform
5. Test end-to-end flow

---

## 🎯 Key Files to Customize

| File | Purpose | What to Change |
|------|---------|----------------|
| `src/index.css` | Design theme | Colors, gradients, fonts |
| `tailwind.config.js` | Tailwind config | Glass effect values |
| `backend/services/veo_service.py` | Video generation | Real API calls |
| `src/components/TextTab.tsx` | T2V UI | Prompt limits, options |
| `src/components/ImageTab.tsx` | I2V UI | Motion range, formats |

---

## 💡 Pro Tips

1. **Use @ tags consistently** - Define your main characters/objects once as ingredients
2. **Start with subtle motion** - Lower intensity (3-5) for realistic animations
3. **Preview before export** - Check each clip individually
4. **Export in high quality** - "High" setting for final videos
5. **Save ingredients** - Build a library for reuse across projects

---

## ✅ You're All Set!

The platform is ready to use! Explore the UI, test the features, and when ready, connect to your actual Veo API credentials to start generating real videos.

**Need help?** Check the full [README.md](file:///c:/Users/nikhil/Desktop/resume/MVO/byok/bringYourKey/README.md)

Happy video creating! 🎬✨
