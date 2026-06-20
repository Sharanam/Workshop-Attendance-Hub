# Generic Attendance System for Workshops

A secure, modern, and beautifully designed workshop attendance portal with **Neumorphism** styling. Built with Next.js 16, React 19, Tailwind CSS v4, and Vercel Postgres.

## Core Features

1. **Dual-Layer Authentication**:
   - **HTTP Basic Authentication**: The entire site (including the landing page) is covered by HTTP Basic Auth.
   - **Google OAuth**: A secure, custom Google OAuth sign-in flow (no heavy third-party authentication packages required, avoiding React 19 peer-dependency issues).
2. **Neumorphic (Soft UI) Theme**:
   - Curated harmonious color palettes supporting light and dark modes natively.
   - Smooth gradients, soft dual-shadow components (`neu-card`, `neu-btn`), and inset-shadow input fields (`neu-inset`).
   - Micro-interactions such as button active press states and interactive star-rating selectors.
3. **Attendee Verification**:
   - Logged-in users can verify their unique integer registration codes against the Postgres database.
4. **Attendance Logging**:
   - Verified attendees can mark themselves as attended for specific sessions after providing their key takeaways and a rating.
5. **History Dashboard**:
   - An on-page history log displaying all sessions the user has successfully marked attendance for.
6. **Credits**:
   - Developed by **Sharanam Chotai** (linked to [LinkedIn](https://www.linkedin.com/in/sharanam-chotai)).

---

## Environment Variables Configuration

To run and deploy this application, set up the following environment variables (defined in `.env.example`):

| Variable Name | Description | Example Value |
| :--- | :--- | :--- |
| `BASIC_AUTH_USER` | HTTP Basic Auth username | `admin` |
| `BASIC_AUTH_PASSWORD` | HTTP Basic Auth password | `secure-password-here` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `xxx-xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `GOCSPX-xxxxxx` |
| `GOOGLE_REDIRECT_URI` | Google OAuth Redirect Callback URI | `https://your-domain.vercel.app/api/auth/callback` |
| `SESSION_SECRET` | 32-character key for session cookie encryption | `some-random-32-character-secret` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob Storage connection token | `vercel_blob_rw_...` (automatically injected by Vercel) |

---

## Datastore Architecture (Vercel Blob Storage)

Instead of a traditional relational SQL database, the application operates on two JSON files stored in Vercel Blob Storage:

### 1. `attendees.json`
Maps email addresses to unique integer codes and names.
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "unique_code": 12345,
    "name": "Attendee Name"
  }
]
```

### 2. `attendance_logs.json`
Records each attendance event along with the session name, user takeaway, rating, and creation timestamp.
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "unique_code": 12345,
    "session_name": "Session 1: Introduction to Web Architectures",
    "takeaway": "Learned about server components",
    "rating": 5,
    "created_at": "2026-06-20T04:36:20.000Z"
  }
]
```

---

## Storage Setup & Initialization

The repository includes a secure setup and seeding endpoint at `/api/db/init` to initialize files on Vercel Blob Storage.

### Setup Steps in Vercel Dashboard:
1. Go to your **Vercel Dashboard** and select your project.
2. Navigate to the **Storage** tab.
3. Click **Connect Database** or **Create Database** and select **Blob**.
4. Click **Create** to initialize a new Vercel Blob store. Vercel automatically exposes the `BLOB_READ_WRITE_TOKEN` to your project environment.

### Initializing and Seeding:
Once basic auth credentials are input, visit the URL below in your browser to write the initial attendees file and seed your Google email:
```
https://your-domain.vercel.app/api/db/init?secret=YOUR_BASIC_AUTH_PASSWORD&email=YOUR_GOOGLE_EMAIL@gmail.com&code=12345&name=Sharanam%20Chotai
```
*Note: Make sure `secret` matches the `BASIC_AUTH_PASSWORD` environment variable.*

---

## Technical Stack & Architecture

- **Framework**: Next.js 16 (App Router)
- **State Management**: React Server Components (RSC) and Server Actions (`app/actions.ts`)
- **Styles**: Tailwind CSS v4 & custom Neumorphism classes (`app/globals.css`)
- **Datastore Client**: `@vercel/blob` SDK
- **Session Management**: Native Node `crypto` AES-256-CBC secure cookies (`lib/auth.ts`)
