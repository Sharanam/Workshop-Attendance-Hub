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
| `POSTGRES_URL` | Vercel Postgres connection string | `postgres://...` (automatically injected by Vercel) |

---

## Database Architecture

The application operates on two main Postgres tables:

### 1. `workshop_attendees`
Maps email addresses to unique integer codes and names.
```sql
CREATE TABLE workshop_attendees (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  unique_code INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  CONSTRAINT unique_email_code UNIQUE (email, unique_code)
);
```

### 2. `workshop_attendance_logs`
Records each attendance event along with the session name, user takeaway, and rating.
```sql
CREATE TABLE workshop_attendance_logs (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  unique_code INTEGER NOT NULL,
  session_name VARCHAR(255) NOT NULL,
  takeaway TEXT,
  rating INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## Database Setup & Initialization

The repository includes a secure setup and seeding endpoint at `/api/db/init`. 

### Initializing and Seeding:
Once basic auth credentials are input, visit the URL below in your browser to verify/create the database tables and seed your email with a test code:
```
https://your-domain.vercel.app/api/db/init?secret=YOUR_BASIC_AUTH_PASSWORD&email=YOUR_GOOGLE_EMAIL@gmail.com&code=12345&name=Sharanam%20Chotai
```
*Note: Make sure `secret` matches the `BASIC_AUTH_PASSWORD` environment variable.*

---

## Technical Stack & Architecture

- **Framework**: Next.js 16 (App Router)
- **State Management**: React Server Components (RSC) and Server Actions (`app/actions.ts`)
- **Styles**: Tailwind CSS v4 & custom Neumorphism classes (`app/globals.css`)
- **Database Client**: `@vercel/postgres` (Neon pooled client)
- **Session Management**: Native Node `crypto` AES-256-CBC secure cookies (`lib/auth.ts`)
