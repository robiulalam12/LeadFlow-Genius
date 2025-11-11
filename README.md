# LeadFlow Genius

LeadFlow Genius is a full‑stack SaaS application for scraping local business leads, managing them in a CRM and running AI‑powered email campaigns.  It includes a modern React frontend, a FastAPI backend with MongoDB, and integrates optional services like SendGrid and GPT‑4o for follow‑up generation.

## Features

- **Lead scraper** – search Google Maps (and other sources) for businesses, filter by reviews/email/website and export leads.
- **CRM** – manage leads with tags, notes, status updates and bulk actions.
- **Campaigns** – create email campaigns, generate subject & body with AI, schedule follow‑ups and track opens/clicks/replies.
- **AI agent settings** – customise the tone, delay and personalisation of AI‑generated follow‑ups.
- **Analytics dashboard** – view lead statistics, campaign performance and recent activity.
- **Settings** – connect Gmail/SMTP accounts, configure sending rules, export your data and update profile settings.

## Getting started

This repo is split into two parts:

| Directory    | Purpose                          |
|------------- |----------------------------------|
| `frontend/`  | React 19 app built with Tailwind, Radix UI and Recharts.  It talks to the backend via REST. |
| `backend/`   | FastAPI server that handles authentication, scraping, leads, campaigns, AI and analytics. |

### Prerequisites

* **Node.js** – version 18 or later
* **Python** – version 3.10 or later
* **MongoDB** – a running MongoDB instance (or Atlas cluster)

### Setup

1. **Clone the repo** and change into the directory:

   ```sh
   git clone https://github.com/robiulalam12/LeadFlow‑Genius.git
   cd LeadFlow‑Genius
   ```

2. **Install frontend dependencies**:

   ```sh
   cd frontend
   npm install
   # or
   yarn install
   ```

3. **Install backend dependencies**:

   ```sh
   cd ../backend
   pip install -r requirements.txt
   ```

4. **Environment variables** – copy `.env.example` to `.env` and fill in your own values:

   ```sh
   cp .env.example .env
   # Edit .env with your database URL, JWT secret, API keys, etc.
   ```

   The required variables are documented in `.env.example`.  For local development you can use separate values; in production these should be set via your deployment platform’s environment configuration.

### Running locally

Open two terminals – one for the backend and one for the frontend.

1. **Backend** (FastAPI):

   ```sh
   cd backend
   uvicorn backend.server:app --host 0.0.0.0 --port 8000 --reload
   ```

   The API will be available at `http://localhost:8000/api`.  Make sure your `.env` file points to your MongoDB.

2. **Frontend** (React):

   ```sh
   cd frontend
   npm start
   ```

   The app will run on `http://localhost:3000` and proxy API requests to the backend specified in `REACT_APP_BACKEND_URL`.

Default test credentials are provided on the login page (`robiulalamsuleman@gmail.com` / `Robi213058@Ul`).  Use them to log in and explore the features.

### Deployment

#### Frontend (Vercel)

1. Create a new Vercel project and select the `frontend` folder as the root.
2. Set the build command to `npm run build` and the output directory to `frontend/build` (this repo includes a `vercel.json` for convenience).
3. Add the environment variables from `.env` in the Vercel dashboard (`REACT_APP_BACKEND_URL`, `FRONTEND_URL`, etc.).
4. Optionally configure the `rewrites` in `vercel.json` to proxy `/api/*` calls to your deployed backend.

#### Backend (Render/Railway/other)

1. Create a new service and connect your fork of this repository.
2. Set the build command to `pip install -r backend/requirements.txt` and the start command to `uvicorn backend.server:app --host 0.0.0.0 --port 8000`.
3. Configure the environment variables from `.env` (MongoDB, JWT secret, API keys, CORS origins and frontend URL).
4. Expose port 8000.

### Known limitations

- **Real scraper** – the current implementation uses mock data.  Integrate Puppeteer/Playwright or another scraping service and ensure compliance with Terms of Service.
- **SendGrid** – sending is simulated; integrate the SendGrid API to actually send emails and handle webhooks.
- **2FA and account management** – placeholders are present; implement multi‑factor authentication and revoke JWT tokens on logout.

## License

This project is provided without warranty.  Use at your own risk.  Contributions and pull requests are welcome!
