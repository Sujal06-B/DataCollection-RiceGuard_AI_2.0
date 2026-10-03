# 🌾 Rice Guard AI — Intelligent Field Crop Pathology & Village Data Collection

> **An open, serverless agricultural AI platform designed to collect rice crop pathology field photos, automatically catalog them into Google Drive folders by village name, and provide ResNet50V2 Grad-CAM visual disease attention.**

Hosted seamlessly and freely on **GitHub Pages** (Frontend) and backed by **Google Apps Script** (Serverless Backend).

---

## 📸 Key Features & Architecture

```
                    ┌────────────────────────────────────────┐
                    │          FIELD SURVEYORS               │
                    │  (Mobile Cameras / Gallery Uploads)    │
                    └───────────────────┬────────────────────┘
                                        │
                                        ▼
             ┌─────────────────────────────────────────────────────┐
             │       GitHub Pages Frontend (index.html)            │
             │  • Village Name Selector & Quick-Chips              │
             │  • Dual Input: "Upload Leaf Image" & "Take Live"   │
             │  • Client-side 1600px HD Optimization (Canvas)      │
             │  • Sequential Recursive Base64 Fetch Engine         │
             │  • Grad-CAM Heatmap Viewer (Side-by-Side/Solo)      │
             └──────────────────────────┬──────────────────────────┘
                                        │  POST (text/plain;charset=utf-8)
                                        │  [No CORS Preflight Blockers]
                                        ▼
             ┌─────────────────────────────────────────────────────┐
             │    Google Apps Script Web App (Code.gs)             │
             │  • Parses JSON payload (base64, villageName)        │
             │  • Checks/creates Village Folder in Master Folder   │
             │  • Decodes blob & writes file with metadata         │
             │  • Returns fileId, URL & folder confirmation        │
             └──────────────────────────┬──────────────────────────┘
                                        │
                                        ▼
             ┌─────────────────────────────────────────────────────┐
             │                 Google Drive                        │
             │  📁 [Master: Rice Guard AI Data Collection]         │
             │     ├── 📁 Rampur                                   │
             │     │   ├── 📷 rice_leaf_1727823901.jpg             │
             │     │   └── 📷 rice_leaf_1727823905.jpg             │
             │     ├── 📁 Sonipat                                  │
             │     └── 📁 Greenfield                               │
             └─────────────────────────────────────────────────────┘
```

1. **🌾 Automated Village-Level Folder Organization**: Photos uploaded with a village name (e.g., *Rampur*, *Karnal*) are automatically filed into their respective village folders inside your Google Drive. If the folder doesn't exist, Google Apps Script creates it on the fly.
2. **📸 Dual Field Capture**:
   - **Upload Leaf Image**: Multi-file picker with drag-and-drop support.
   - **Take Live Photo**: Activates native smartphone rear camera directly (`capture="environment"`).
3. **⚡ High-Speed Rural Optimization**: Built-in client-side canvas compressor optimizes multi-megabyte 4K smartphone photos to crisp 1600px HD before base64 encoding, preventing Google Apps Script timeouts and uploading 20x faster over rural 3G/4G networks.
4. **🔥 Interactive ResNet50V2 Grad-CAM Heatmap Viewer**:
   - Interactive switcher for **Side-by-Side**, **Heatmap Only**, and **Original Only** modes.
   - Highlights lesion pathology regions for diseases such as *Sheath Blight*, *Brown Spot*, and *Bacterial Leaf Blight*.
5. **📱 Mobile Field QR Code**: Built-in QR code generator so field workers and students can scan a code with their phones and start surveying instantly.
6. **⚙️ In-App Backend Configuration**: Test, verify latency, and configure the Google Apps Script Web App URL directly from the UI without touching code.

---

## 🚀 Quick Setup & Deployment Guide

### Step 1: Create Master Folder in Google Drive
1. Go to [Google Drive](https://drive.google.com).
2. Click **New** > **New folder** and name it (e.g., `Rice Guard AI Master Data`).
3. Open the folder and copy the **Folder ID** from your browser address bar:
   ```
   https://drive.google.com/drive/folders/1A2b3C4D5e6F7g8H9i0J_YOUR_FOLDER_ID
   ```
   *Copy the string after `/folders/`*.

---

### Step 2: Deploy Google Apps Script (`Code.gs`)
1. Open [script.google.com](https://script.google.com) and click **+ New project**.
2. Name the project `Rice Guard AI Backend`.
3. Open `Code.gs`, erase any default code, and paste the code from [Code.gs](file:///c:/Users/Sujal/Desktop/DataCollection/Code.gs):
   ```javascript
   var MASTER_FOLDER_ID = "PASTE_YOUR_FOLDER_ID_HERE";
   ```
   Replace `PASTE_YOUR_FOLDER_ID_HERE` with your copied Google Drive Folder ID.
4. Click the blue **Deploy** button (top right) > **New deployment**.
5. Click the gear icon ⚙️ next to *Select type* and choose **Web app**.
6. Fill in the deployment details:
   - **Description**: `Rice Guard AI v2.4`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone` *(⚠️ CRITICAL: Must be Anyone so field workers and students can upload without needing your Google account login)*.
7. Click **Deploy**.
8. Click **Authorize access**, choose your Google Account, click *Advanced* > *Go to Rice Guard AI (unsafe)*, and click **Allow**.
9. Copy the generated **Web app URL** (ends in `/exec`).

---

### Step 3: Connect Frontend to Your Backend
You can connect the backend in either of two ways:

#### Option A: Inside the Web App UI (Easiest)
1. Open `index.html` in your browser.
2. Click **Settings** (top right).
3. Paste your Web App URL and click **Save & Verify Connection**.
4. Click **Test Ping** to confirm live connectivity.

#### Option B: In `index.html` Source Code
Open [index.html](file:///c:/Users/Sujal/Desktop/DataCollection/index.html) and update line 593:
```javascript
const DEFAULT_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
```

---

### Step 4: Host on GitHub Pages (Free & Fast)
1. Log in to [GitHub](https://github.com) and create a **New repository** (e.g., `rice-guard-ai`).
2. Make sure the repository visibility is **Public**.
3. Push or upload `index.html` and the `assets/` folder to the repository root.
4. Go to **Settings** > **Pages** (in the left sidebar).
5. Under **Build and deployment** > **Branch**, select `main` (or `master`) and folder `/(root)`, then click **Save**.
6. Wait 1–2 minutes. GitHub will display:
   ```
   Your site is live at https://<your-username>.github.io/rice-guard-ai/
   ```
7. Open the live site on your phone or computer!

---

## 📱 Generating Field QR Code for Students & Surveyors
1. Open your live site URL.
2. Click the **QR Code** button in the header.
3. A high-contrast QR code is automatically generated for your URL.
4. Field workers can scan this QR code with any smartphone camera to open the application directly in the field!

---

## 📂 Project Structure

```
├── Code.gs                                          # Google Apps Script serverless backend
├── index.html                                       # Single-page responsive frontend web app
├── README.md                                        # Documentation & setup instructions
├── assets/                                          # Web-optimized lightweight assets (~800KB total)
│   ├── gemini_generated_image_z7rs1xz7rs1xz7rs.webp # AI Leaf Scanner HUD artwork
│   ├── gemini_generated_image_mzdm4ymzdm4ymzdm.webp # 4-step AI diagnostic pipeline diagram
│   ├── gemini_generated_image_16q4d816q4d816q4.webp # Field inspection & pathogen reference
│   ├── gradcam_original_leaf.webp                   # Cropped original field rice leaf
│   ├── gradcam_heatmap_leaf.webp                    # Cropped ResNet50V2 Grad-CAM attention heatmap
│   ├── screenshot_2026-09-29_211556.webp            # Pathology analysis reference
│   ├── screenshot_2026-09-29_211633.webp            # Upload leaf & best practices reference
│   └── screenshot_2026-09-29_211711.webp            # Farmer community & sprout branding reference
└── [Original High-Res Images]                       # Kept for offline high-resolution archives
```

---

## 💡 Technical Highlights

- **CORS Bypass Mechanism**: Sending JSON using `headers: { "Content-Type": "text/plain;charset=utf-8" }` prevents the browser from triggering an `OPTIONS` preflight request, which Google Apps Script Web Apps do not natively support.
- **Sequential Recursive Uploads**: Photos are uploaded sequentially with a progress meter (`Uploading photo 2 of 8...`) instead of in parallel, avoiding Google Apps Script concurrent execution lockouts and quota limits.
- **Client-Side High-Quality Downscaling**: Prevents exceeding the 50MB Apps Script request payload limit while preserving lesion pathology detail for ML inspection.
