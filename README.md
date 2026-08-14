# 🎥 Zoom Workplace Clone - Real-Time Video Conferencing Platform

[![Live App on Vercel](https://img.shields.io/badge/Live%20Demo-Vercel%20Production-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://zoom-workplace-rishabh.vercel.app)
[![Backend API on Render](https://img.shields.io/badge/Backend%20API-Render%20Cloud-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://zoom-clone-l5ro.onrender.com)
[![WebSocket Server](https://img.shields.io/badge/WebSocket-wss%3A%2F%2Fzoom--clone--l5ro.onrender.com-0E71EB?style=for-the-badge&logo=socket.io&logoColor=white)](https://zoom-clone-l5ro.onrender.com)

---

## 🌐 Quick Access Live Links

| Service | Role | Direct URL |
| :--- | :--- | :--- |
| **🚀 Production Web App** | Frontend Web Application (Next.js 14, WebRTC UI) | **[https://zoom-workplace-rishabh.vercel.app](https://zoom-workplace-rishabh.vercel.app)** |
| **⚡ Backend API & Signaling** | Node/Express Signaling Server + SQLite DB on Render | **[https://zoom-clone-l5ro.onrender.com](https://zoom-clone-l5ro.onrender.com)** |
| **📦 GitHub Repository** | Public Source Code Repository | **[https://github.com/Rishabh-Raj11/Zoom-Clone](https://github.com/Rishabh-Raj11/Zoom-Clone)** |

---

A modern, production-grade video conferencing web application replicating Zoom’s user experience, design system, and core meeting workflows. Built with **Next.js (React / TypeScript)** on the frontend, **Node.js (Express / TypeScript)** on the backend, **SQLite** for relational persistence, and **WebRTC + WebSockets** for real-time video, audio, in-meeting chat, and collaborative tools.

---

## 🌟 Key Features

### 1. 🖥️ Authentic Zoom Landing Dashboard (`/`)
- **Zoom Design System**: Pixel-perfect dark theme, typography, pill badges, and signature Zoom icons.
- **Dynamic Hero Clock**: Live digital clock with seconds, date, personalized dynamic greeting ("Good afternoon, Alex"), and imminent meeting countdown card.
- **4 Core Zoom Action Cards**:
  - 🟠 **New Meeting** (Orange gradient): 1-click instant meeting creation with video toggle and Personal Meeting ID (PMI) copy options.
  - 🔵 **Join** (Blue): Join via 10-digit Meeting ID or invite URL with pre-join preferences (mute audio / disable video).
  - 🔵 **Schedule** (Blue): Comprehensive scheduling modal with date/time pickers, duration, 6-digit passcode, waiting room, and video defaults.
  - 🔵 **Share Screen** (Blue): Jump directly into a meeting with screen share active.
- **Meeting Management Tabs**:
  - **Upcoming Meetings**: Live list with countdown, "Start", "Copy Invitation", and "Delete" actions.
  - **Recent Meetings**: Historical log of completed meetings with duration.
  - **Cloud Recordings**: Library of saved meeting recordings with embedded MP4 playback modal.

### 2. 🚪 Pre-Join Green Room Lobby (`/join/[meetingId]`)
- Live local webcam preview and dynamic **audio volume level meter** reacting to speech in real-time.
- Camera and microphone toggles with instant preview.
- Custom display name configuration before entering.
- Meeting validation badge verifying meeting status and waiting room configuration.

### 3. 👥 Full Zoom Meeting Room (`/meeting/[meetingId]`)
- **Multi-Peer WebRTC Conferencing**:
  - Auto-responsive **Gallery View** grid (1x1, 2x2, 3x3, 4x4) & **Speaker Focus View**.
  - Active speaker detection with glowing border and audio indicators.
  - Name badges, host indicators, camera off avatar bubbles.
  - **AI / Mock Peers Toggle**: Allows solo testers to spawn simulated participants (`Sarah Jenkins`, `Marcus Vance`, `Elena Rostova`) to experience the full multi-user grid and test host controls!
- **Real-Time In-Meeting Chat**:
  - Broadcast messages to "Everyone" or private direct messaging to specific participants.
  - Formatted chat bubbles with timestamps and auto-scroll.
  - Persistent message history stored in SQLite.
- **Participants Management & Host Controls**:
  - Searchable participant roster.
  - **Mute All** host broadcast.
  - Individual participant controls: Mute participant, Remove/Kick from meeting.
  - Copy formatted invite link to clipboard.
- **Interactive Collaborative Whiteboard**:
  - Multi-user drawing canvas with Pen, Highlighter, Eraser, color palette, line width, Clear all, and PNG download.
  - Real-time stroke synchronization across all connected peers.
- **Screen Sharing**:
  - Native browser screen sharing via `navigator.mediaDevices.getDisplayMedia`.
- **Floating Reactions & Celebrations**:
  - Emoji floaters (`👍 👏 ❤️ 🎉 😮 😂 🔥 🚀`) floating up the screen.
  - Confetti burst animations for celebratory reactions.
  - "Raise Hand" / "Lower Hand" queue.
- **Cloud Recording Simulation**:
  - Red blinking recording badge with live elapsed timer.
  - Auto-saves recording entry with file size and duration to SQLite database upon completion.
- **Security Menu**:
  - Lock/Unlock meeting, enable waiting room, toggle permissions for chat, screen sharing, renaming, and unmuting.
- **Leave / End Modal**:
  - Differentiates "End Meeting for All" (host only) vs "Leave Meeting".

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Frontend [Next.js App Router]
        Dashboard["Landing Dashboard (/)"]
        GreenRoom["Green Room (/join/[id])"]
        MeetingRoom["Meeting Room (/meeting/[id])"]
        MediaHooks["useMediaStream & useWebRTC Hooks"]
    end

    subgraph Backend [Node.js + Express API]
        REST["REST API Endpoints (/api/*)"]
        WSHub["WebSocket Signaling Hub (/ws)"]
    end

    subgraph Database [SQLite (zoom_clone.db)]
        UsersTable[(users)]
        MeetingsTable[(meetings)]
        ParticipantsTable[(participants)]
        ChatTable[(chat_messages)]
        RecordingsTable[(recordings)]
    end

    Dashboard -->|REST API| REST
    GreenRoom -->|Validate Meeting| REST
    MeetingRoom -->|Signaling & Chat| WSHub
    MeetingRoom <-->|WebRTC Peer-to-Peer| MediaHooks
    REST --> Database
    WSHub --> Database
```

---

## 🗄️ Database Schema Design (SQLite)

### 1. `users` Table
| Column | Type | Description |
|---|---|---|
| `id` | TEXT PK | Unique user identifier (e.g. `usr_alex_morgan`) |
| `name` | TEXT | Display name |
| `email` | TEXT UNIQUE | User email |
| `avatar_url` | TEXT | Profile picture URL |
| `created_at` | DATETIME | Account creation timestamp |

### 2. `meetings` Table
| Column | Type | Description |
|---|---|---|
| `id` | TEXT PK | Internal UUID |
| `meeting_id` | TEXT UNIQUE | Formatted 10-digit Meeting ID (e.g. `942 581 4920`) |
| `title` | TEXT | Meeting title / topic |
| `description` | TEXT | Agenda or description |
| `host_id` | TEXT FK | Foreign key referencing `users(id)` |
| `scheduled_start` | DATETIME | Scheduled start time |
| `duration_minutes` | INTEGER | Duration in minutes (default 30) |
| `status` | TEXT | `upcoming` \| `in_progress` \| `ended` |
| `passcode` | TEXT | 6-digit numeric passcode |
| `join_url` | TEXT | Shareable join URL |
| `is_instant` | BOOLEAN | 1 if instant meeting, 0 if scheduled |
| `require_waiting_room` | BOOLEAN | Waiting room security flag |
| `allow_screen_share` | BOOLEAN | Screen sharing permission |
| `host_video_default` | BOOLEAN | Default host camera state |
| `participant_video_default` | BOOLEAN | Default participant camera state |
| `created_at` / `updated_at` | DATETIME | Timestamps |

### 3. `participants` Table
| Column | Type | Description |
|---|---|---|
| `id` | TEXT PK | Unique participant record UUID |
| `meeting_id` | TEXT FK | Associated meeting ID |
| `user_id` | TEXT FK | User ID if authenticated |
| `display_name` | TEXT | Participant display name |
| `role` | TEXT | `host` \| `co-host` \| `participant` |
| `joined_at` / `left_at` | DATETIME | Session duration timestamps |
| `is_muted` | BOOLEAN | Audio state |
| `is_video_off` | BOOLEAN | Video state |
| `is_hand_raised` | BOOLEAN | Hand raise queue state |
| `avatar_url` | TEXT | Profile avatar |

### 4. `chat_messages` Table
| Column | Type | Description |
|---|---|---|
| `id` | TEXT PK | Message UUID |
| `meeting_id` | TEXT FK | Associated meeting |
| `sender_id` | TEXT | Sender user/participant ID |
| `sender_name` | TEXT | Sender display name |
| `message` | TEXT | Chat message content |
| `timestamp` | DATETIME | Sent timestamp |
| `is_direct` | BOOLEAN | 1 if private DM, 0 if sent to Everyone |
| `recipient_id` | TEXT | Target participant ID if direct message |

### 5. `recordings` Table
| Column | Type | Description |
|---|---|---|
| `id` | TEXT PK | Recording UUID |
| `meeting_id` | TEXT FK | Associated meeting |
| `meeting_title` | TEXT | Title of the meeting |
| `duration_seconds` | INTEGER | Total recorded duration in seconds |
| `file_size_mb` | REAL | File size in MB |
| `video_url` | TEXT | Cloud MP4 video playback URL |
| `created_at` | DATETIME | Timestamp of recording |

---

## 🚀 Quickstart & Setup Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (`v22` recommended)
- **npm**: v9.0.0 or higher

### 1. Installation
Clone the repository and install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Start the Backend API & Signaling Server
```bash
cd backend
npm run dev
```
- **HTTP API**: `http://localhost:5000/api`
- **WebSocket Signaling**: `ws://localhost:5000/ws`
- The SQLite database `zoom_clone.db` is initialized and automatically seeded with sample upcoming meetings, history, and recordings.

### 3. Start the Next.js Frontend
In a new terminal:
```bash
cd frontend
npm run dev
```
- Open **`http://localhost:3000`** in your browser.

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/meetings` | List all meetings (optional `?status=upcoming` or `?status=ended`) |
| `GET` | `/api/meetings/:id` | Get meeting details by UUID or 10-digit Meeting ID |
| `POST` | `/api/meetings/instant` | Launch an instant meeting with generated ID & passcode |
| `POST` | `/api/meetings/schedule` | Schedule a future meeting |
| `POST` | `/api/meetings/:id/validate` | Validate meeting existence, status, and passcode |
| `PATCH` | `/api/meetings/:id/status` | Update meeting status (`upcoming`, `in_progress`, `ended`) |
| `DELETE` | `/api/meetings/:id` | Delete/cancel a meeting |
| `GET` | `/api/users/me` | Fetch current logged-in user profile |
| `GET` | `/api/recordings` | List all saved cloud recordings |
| `POST` | `/api/recordings` | Save a new cloud recording record |

---

## 🌐 Real-Time WebSocket Protocol (`/ws`)

| Event Type | Direction | Payload | Description |
|---|---|---|---|
| `join-room` | Client ➔ Server | `{ role, isMuted, isVideoOff }` | Join a meeting room |
| `existing-participants` | Server ➔ Client | `{ participants, yourRole }` | Initial roster upon joining |
| `user-joined` | Server ➔ Client | `{ role, isMuted, isVideoOff }` | Broadcast when new peer enters |
| `user-left` | Server ➔ Client | `{ userId, userName }` | Broadcast when peer leaves |
| `offer` / `answer` | Peer ➔ Peer | `{ sdp }` | WebRTC session descriptions |
| `ice-candidate` | Peer ➔ Peer | `{ candidate }` | WebRTC ICE candidate routing |
| `chat-message` | Client ➔ Room | `{ text, isDirect, recipientId }` | Live in-meeting chat message |
| `user-state-change` | Client ➔ Room | `{ isMuted, isVideoOff, isHandRaised }` | Sync mic, camera, hand status |
| `reaction` | Client ➔ Room | `{ emoji }` | Floating emoji reaction & confetti |
| `host-mute-all` | Host ➔ Room | `{}` | Host mutes all non-host participants |
| `host-kick-user` | Host ➔ Peer | `{}` | Host kicks a specific participant |
| `host-lock-room` | Host ➔ Room | `{ locked }` | Host locks meeting to prevent new joins |
| `whiteboard-draw` | Peer ➔ Room | `{ x, y, color, size }` | Real-time whiteboard drawing sync |
| `whiteboard-clear` | Peer ➔ Room | `{}` | Clears whiteboard for all participants |

---

## 🚢 Deployment Guide

### Deploying the Frontend (Vercel)
1. Push repository to GitHub.
2. Import project into [Vercel](https://vercel.com).
3. Set **Root Directory** to `frontend`.
4. Set Environment Variables:
   - `NEXT_PUBLIC_API_BASE_URL`: `https://your-backend-service.onrender.com/api`
   - `NEXT_PUBLIC_WS_HOST`: `your-backend-service.onrender.com`
5. Click **Deploy**.

### Deploying the Backend (Render / Railway)
1. In [Render](https://render.com) or [Railway](https://railway.app), create a new **Web Service**.
2. Set **Root Directory** to `backend`.
3. Build Command: `npm install && npm run build`
4. Start Command: `npm run start`
5. Set Environment Variable: `PORT=5000`.

---

## 📝 Assumptions & Notes
- **Default User**: Per assignment specifications, user authentication defaults to `Alex Morgan` (`usr_alex_morgan`).
- **WebRTC Peer Discovery**: Mesh peer connections operate via STUN servers (`stun:stun.l.google.com:19302`) and WebSocket signaling.
- **AI / Mock Peers Toggle**: A dedicated `AI Peers` button in the toolbar allows seamless solo evaluation of multi-participant video grid layouts, chat, and host mute/kick controls.
