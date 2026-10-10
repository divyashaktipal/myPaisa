# myPaisa — Real-Time Indian Market Terminal

**myPaisa** is an advanced, high-performance financial analytics and market intelligence terminal for Indian equities (NSE & BSE). Built with Next.js 15, React 19, and Tailwind CSS, it delivers real-time market data, interactive charting, algorithmic 52-week low/high breakout signals, sector treemap heatmaps, and AI-powered news summaries.

---

## Key Features

- ** Live Market Overview & Indices**: Real-time tracking of NIFTY 50, SENSEX, and top index movers with intraday trend curves.
- ** Sector Treemap Heatmap**: Interactive market capitalization and turnover visualizer powered by D3 layout algorithms across the Nifty 200.
- ** Breakout & Momentum Signals**: Dedicated 52-week highs, 52-week lows, volume surges, and oversold bounce alerts.
- ** Gemini 3.8 Flash AI News Summaries**: Instant, factual financial synthesis of breaking market headlines powered by the official `@google/genai` SDK with batching and LRU caching.
- ** Multi-Engine Chart Terminal**: Switch seamlessly between TanStack interactive charts and custom SVG Japanese Candlestick views across multiple windows (`1D`, `5D`, `1M`, `6M`, `YTD`, `1Y`, `5Y`, `MAX`).
- ** Personalized Watchlist**: Cloud-synced user watchlists persisted in MongoDB with instant add/remove toggles.
- ** Enterprise-Grade Authentication & Edge Security**: Powered by NextAuth v5 (Auth.js) and Next.js Edge Middleware. Complete privacy architecture ensures zero client-side PII exposure.

---

## Complete Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Framework & Core** | **Next.js 15.5** (App Router, Server Components, Route Handlers), **React 19.1**, **TypeScript 5.9** |
| **Package Manager** | **pnpm** (v10.33+) |
| **Styling & Design** | **Tailwind CSS v4**, **Motion** (Framer Motion), Custom Glassmorphic Dark UI |
| **Data Fetching & Cache** | **TanStack React Query v5** (`@tanstack/react-query`) with custom stale-time policies |
| **Data Visualization** | **TanStack Charts** (`@tanstack/react-charts`), **D3-Scale**, Custom SVG Candlestick Engine |
| **Authentication** | **NextAuth.js v5 Beta** (`auth.js`), Google OAuth 2.0, JWT Session Strategy |
| **Database** | **MongoDB** (native driver `mongodb` v7), `@auth/mongodb-adapter` |
| **Artificial Intelligence** | **Google GenAI SDK** (`@google/genai` v2.28) with **`gemini-3.8-flash`** model |
| **Market Intelligence** | **SerpApi** (Google Finance Engine), **Yahoo Finance** (`yahoo-finance2`) |

---

## 🔍 How SerpApi is Used

**myPaisa** integrates **SerpApi's Google Finance Engine** as a core upstream market data provider. It powers deep company intelligence and historical price curves without relying on fragile web scraping.

### 1. Unified Google Finance Integration (`lib/serpapi.ts`)
We communicate directly with SerpApi's endpoint:
```http
GET https://serpapi.com/search.json?engine=google_finance&q={SYMBOL}&api_key={SERPAPI_KEY}
```

### 2. Multi-Window Historical & Intraday Charts (`/api/finance`)
- **Intraday & Historical Points**: Fetches structured point arrays (`time`, `price`, `volume`) across `1D`, `5D`, `1M`, `6M`, `YTD`, `1Y`, `5Y`, and `MAX`.
- **Price Movements & Percentage**: Normalizes daily net change, direction (`Up` / `Down`), and relative delta.

### 3. Knowledge Graph & Key Financial Statistics
SerpApi extracts rich corporate metadata displayed on our Company Details page:
- **Fundamental Ratios**: Market Capitalization, P/E Ratio, Dividend Yield, Average Volume, 52-Week High, 52-Week Low, Beta.
- **Company Profiles**: Official corporate descriptions, CEO/headquarters info, and exchange listings (NSE/BSE).

### 4. Market Newsroom & Real-Time Discovery
- Google Finance financial news results are parsed from SerpApi and automatically routed through our Gemini AI summarization engine.
- Ticker associations and discovered market counters are linked dynamically.

### 5. High-Efficiency In-Memory Caching & Quota Protection
To conserve API quota and ensure ultra-low latency (<50ms for cached responses):
- In-memory cache layer (`Map<string, CacheEntry<T>>`) stores SerpApi responses with a default 120-second TTL.
- **Dedicated Quota Monitor (`/api/quota`)**: Connects to `https://serpapi.com/account` to provide real-time visibility into remaining API credits.

---

## Google Gemini AI Summaries (`lib/gemini.ts`)

Instead of generic or hardcoded mock text, market headlines are synthesized using Google's latest **`gemini-3.8-flash`** model via the official `@google/genai` SDK:

- **Single Round-Trip Batching**: Headlines are batched into a single prompt (`batchGenerateGeminiSummaries`), saving quota and preventing free-tier rate limits (5 RPM).
- **15-Minute In-Memory LRU Cache**: Avoids duplicate queries for trending news.
- **Graceful Quota Fallback**: If upstream rate limits occur, the terminal gracefully defaults to the publisher's direct news snippet.

---

## Security & Client-Side Privacy

- **Edge Middleware (`middleware.ts`)**: Requests to `/dashboard/*`, `/overview`, `/live`, `/news`, and `/chart` are validated at the edge before rendering. Unauthenticated visits redirect to `/login?callbackUrl=...`.
- **Zero Client PII Exposure**: User email addresses and internal database IDs are strictly stripped on the server (`email: null`). The client DOM only renders user avatars and anonymous membership badges (`Verified Member`).
- **Protected APIs**: Internal API routes (`/api/watchlist`, `/api/news`, `/api/finance`, `/api/market/heatmap`, `/api/market/signals`, `/api/quota`) enforce session checks and return `401 Unauthorized` for anonymous requests.

---

##  Environment Variables Setup

Create a `.env.local` file in the root directory:

```env
# NextAuth Authentication (Generate with: openssl rand -base64 32)
AUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_SECRET=your_nextauth_secret_here
AUTH_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000

# Google OAuth 2.0 Credentials (from Google Cloud Console)
AUTH_GOOGLE_ID=your_google_client_id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=your_google_client_secret

# MongoDB Connection String
MONGODB_URI=mongodb://127.0.0.1:27017/myPaisa

# SerpApi API Key (https://serpapi.com)
SERPAPI_KEY=your_serpapi_key_here

# Google Gemini API Key & Configuration (https://ai.google.dev)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
GEMINI_API_ENDPOINT=https://generativelanguage.googleapis.com/v1beta/models

# Optional Analytics
GA_ID=G-XXXXXXXXXX
CLARITY_ID=your_clarity_project_id
```

---

## Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/myPaisa.git
cd myPaisa
pnpm install
```

### 2. Run the Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
pnpm build
pnpm start
```

---

## Disclaimer

*myPaisa is an independent personal software project and market interface. It is **not** a SEBI-registered investment advisor or research analyst entity. All market quotes, signals, and AI summaries are provided strictly for educational and informational purposes.*
