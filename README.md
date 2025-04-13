### Updated README.md
Here’s the revised README for **KeyClip**, incorporating the search fix, mobile copy fix, and API limit measures. It’s detailed, covering all aspects of the app.

```markdown
# KeyClip

**KeyClip** is an AI-powered note-taking app that simplifies your workflow by automatically summarizing notes using Google's Gemini API. Built with Next.js, MongoDB, and TypeScript, it offers a responsive interface for creating, editing, searching, and copying notes, optimized for desktop and mobile. KeyClip distills your ideas to their core, making note management effortless.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Rate Limiting](#rate-limiting)
- [Caching](#caching)
- [Search Functionality](#search-functionality)
- [Mobile Compatibility](#mobile-compatibility)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Features

- **AI Summarization**: Generates 2-3 sentence summaries using Gemini 1.5 Flash.
- **Note Management**: Create, edit, delete, and search notes with a modern UI.
- **Robust Search**: Filter notes by content or summary, handling edge cases gracefully.
- **Clipboard Support**: Copy summaries with mobile-friendly fallbacks.
- **Responsive Design**: Seamless experience on desktop and mobile, with sidebar toggle.
- **Rate Limiting**: Caps Gemini API calls at 50/minute, 1,200/day.
- **Caching**: Reuses summaries for identical notes (1-hour TTL).
- **Error Handling**: Toasts for API failures, invalid inputs, and copy errors.
- **Modal Interface**: View notes or summaries with tabbed navigation.
- **MongoDB Storage**: Persistent notes with validation.

## Tech Stack

- **Frontend**: Next.js (React, TypeScript), Tailwind CSS, Framer Motion, Lucide React, React Hot Toast.
- **Backend**: Next.js API Routes, Mongoose, Google Gemini API.
- **Libraries**: Axios, Rate-Limiter-Flexible, Node-Cache.
- **Database**: MongoDB.
- **Environment**: Node.js 18+.

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Kelvin-Amaju/keyclip.git
   cd keyclip
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```
   Key packages:
   - `@google/generative-ai`
   - `mongoose`
   - `axios`
   - `rate-limiter-flexible`
   - `node-cache`
   - `next`, `react`, `react-dom`
   - `framer-motion`, `lucide-react`, `react-hot-toast`
   - `typescript`

3. **Set Up MongoDB**:
   - Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or local MongoDB.
   - Get connection string: `mongodb+srv://user:pass@cluster0.mongodb.net/keyclip`.

4. **Get Gemini API Key**:
   - Sign up at [Google AI Studio](https://aistudio.google.com/app/apikey).
   - Generate key for Gemini 1.5 Flash or 2.0.

## Environment Variables

Create `.env.local` in the root:

```env
GEMINI_API_KEY=your-gemini-api-key
MONGODB_URI=your-mongodb-uri
```

- `GEMINI_API_KEY`: From Google AI Studio.
- `MONGODB_URI`: MongoDB connection (e.g., `mongodb+srv://.../keyclip`).

For production:
- Set in hosting platform (e.g., Vercel’s dashboard).

## Running the App

1. **Development**:
   ```bash
   npm run dev
   ```
   - Runs at `http://localhost:3000`.
   - Supports hot reloading.

2. **Production**:
   ```bash
   npm run build
   npm run start
   ```

3. **Mobile Testing**:
   - Local: Use IP (e.g., `http://192.168.1.100:3000`) on Wi-Fi.
   - HTTPS: Install [localtunnel](https://github.com/localtunnel/localtunnel):
     ```bash
     npm install -g localtunnel
     lt --port 3000
     ```

## Usage

1. **Create Notes**:
   - Enter text in the textarea.
   - Click “Summarize + Save” to generate and save a summary.

2. **View Notes**:
   - Sidebar shows note previews (content/summary truncated).
   - Click to open a modal with “Main Note” or “Summary” tabs.

3. **Edit/Delete**:
   - Edit: Pencil icon to modify and resummarize.
   - Delete: Trash icon to remove.

4. **Search**:
   - Type in the sidebar search bar to filter notes by content or summary.
   - Handles invalid data safely.

5. **Copy Summaries**:
   - In modal’s “Summary” tab, click “Copy”.
   - Works on desktop (Clipboard API) and mobile (fallback).

6. **Mobile**:
   - Toggle sidebar with menu icon.
   - Responsive modal and inputs.

## API Endpoints

- **`GET /api/notes`**:
  - Lists notes, sorted by `createdAt` (descending).
  - Response: `[{ _id, content, summary, tags, createdAt }, ...]`.
  - Filters invalid notes.

- **`POST /api/notes`**:
  - Creates note with summary.
  - Body: `{ content: string, tags?: string[] }`.
  - Response: `{ _id, content, summary, tags, createdAt }`.

- **`PUT /api/notes/:id`**:
  - Updates note and summary.
  - Body: `{ content: string }`.
  - Response: `{ message: "Note updated" }`.

- **`DELETE /api/notes/:id`**:
  - Deletes note.
  - Response: `{ message: "Note deleted" }`.

- **`POST /api/notes/summary`**:
  - Summarizes content.
  - Body: `{ content: string }`.
  - Response: `{ summary: string }`.

## Database Schema

Collection: `notes` (database: `keyclip` or per `MONGODB_URI`).

**Note Schema** (`@/models/Notes.ts`):
```typescript
import mongoose from 'mongoose';
const NoteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  summary: { type: String },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});
export default mongoose.models.Note || mongoose.model('Note', NoteSchema);
```

- `content`: Note text (required).
- `summary`: AI summary or fallback text.
- `tags`: Optional array (unused in UI).
- `createdAt`: Auto-generated.

## Rate Limiting

Prevents Gemini API overuse (60 RPM, 1,500 RPD free tier):
- **Limit**: 50 requests/minute per IP.
- **Daily Cap**: 1,200 calls/day.
- **Retries**: 3 attempts with backoff for 429 errors.
- **Logs**: Tracks usage (`API calls today: X`).

Fallbacks:
- Cached summaries.
- “Summary unavailable” if API fails.

## Caching

- **Library**: `node-cache`.
- **Key**: `summary:<content>`.
- **TTL**: 1 hour.
- **Purpose**: Reduces API calls for repeated content.
- **Production**: Consider Redis for serverless environments.

## Search Functionality

- **Frontend**: Filters notes by `content` or `summary` (case-insensitive).
- **Fixes**:
  - Handles `undefined`/`null` content/summary to prevent `TypeError`.
  - Logs invalid notes for debugging.
- **Backend**: `GET /api/notes` filters out invalid data.

**Clean Database** (if errors persist):
```bash
npx ts-node scripts/clean-notes.ts
```
- Deletes/fixes notes with missing `content`/`summary`.

## Mobile Compatibility

- **Sidebar**: Toggles on small screens.
- **Modal**: Scrollable, responsive.
- **Copy**: Uses `navigator.clipboard` (HTTPS) or `textarea` (HTTP).
- **Tested**: Chrome (Android), Safari (iOS 13.4+).

## Deployment

1. **Vercel**:
   ```bash
   vercel
   ```
   - Set env vars: `GEMINI_API_KEY`, `MONGODB_URI`.
   - Deploy: `vercel --prod`.

2. **Other Platforms**:
   - Needs Node.js 18+, HTTPS.
   - Example: Netlify, Heroku.

3. **HTTPS**:
   - Required for Clipboard API.
   - Free on Vercel.

## Troubleshooting

- **Search Errors**:
  - Error: `TypeError: Cannot read properties of undefined (reading 'toLowerCase')`.
  - Fix: Update `filteredNotes` (see code). Run `clean-notes.ts`.
  - Logs: Check `Invalid note detected`.

- **Summary Issues**:
  - Check `GEMINI_API_KEY`.
  - Logs: `Summary generation error`.

- **Copy Fails**:
  - Use HTTPS for mobile.
  - Logs: “Clipboard API unavailable” or “Fallback copy error”.

## Contributing

1. Fork repo.
2. Branch: `git checkout -b feature/your-feature`.
3. Commit: `git commit -m "Add feature"`.
4. Push: `git push origin feature/your-feature`.
5. Pull request.

**Ideas**:
- Tags UI.
- Markdown support.
- User authentication.

## License

MIT License. See [LICENSE](./LICENSE).

---

**KeyClip: Snip the Essence of Your Notes**  
Built with ❤️ by Kelvin Amaju...
```

**Changes from Previous README**:
1. **Search Section**: Added details on search functionality and the `TypeError` fix.
2. **KeyClip Branding**: Used “KeyClip” consistently.
3. **Troubleshooting**: Included search error and database cleaning steps.
4. **Minor Clarifications**: Updated usage, endpoints, and mobile sections for clarity.

---
