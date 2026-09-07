# Abbey Circle

A mortgage-industry professional network — Loan Officers, Realtors, and Clients can create profiles and build connections. Built for the Abbey FullStack Engineer Challenge.

## Live Demo

- Web: https://abbey-circle.vercel.app
- API: https://abbey-circle-api.onrender.com

**Note:** the backend is hosted on Render's free tier, which spins down after ~15 minutes of inactivity. The first request after idle time may take 30-50 seconds to respond while it wakes up.

**Demo login** (any of these, password `password123`):
- sarah.loanofficer@abbeycircle.com
- mike.realtor@abbeycircle.com
- amaka.client@abbeycircle.com
- david.loanofficer@abbeycircle.com

## Features

- **Authentication** — email/password registration and login, JWT access tokens (15 min) + rotating refresh tokens stored server-side (httpOnly cookie), real logout that revokes the session in the database.
- **Accounts** — each user has a profile (name, role, company, bio, phone) they can view and update.
- **Relationships** — users can send, accept, and decline connection requests, with server-side authorization (only the recipient can accept/decline, no duplicate or self-connections).

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express, TypeScript, PostgreSQL, Prisma |
| Web Frontend | React, TypeScript, Vite, Tailwind CSS, React Query |
| Mobile | React Native (Expo) |
| Auth | JWT (access + rotating refresh tokens) |
| Hosting | Render (API + Postgres), Vercel (web) |

## Project Structure

abbey-circle/
server/ # Express API + Prisma schema
web/ # React web frontend
mobile/ # React Native app


## Running Locally

### Prerequisites
- Node.js 18+
- PostgreSQL running locally (or point `DATABASE_URL` at any Postgres instance)

### 1. Backend

```bash
cd server
npm install
# create .env — see .env.example for required variables
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Server runs on `http://localhost:4000`.

### 2. Web Frontend

```bash
cd web
npm install
npm run dev
```

Runs on `http://localhost:5173`.

### 3. Mobile

```bash
cd mobile
npm install
npx expo start
```

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | – | Create account |
| POST | `/auth/login` | – | Log in |
| POST | `/auth/refresh` | Cookie | Rotate access token |
| POST | `/auth/logout` | Cookie | Revoke session |
| GET | `/me` | Bearer | Get own profile |
| PATCH | `/me` | Bearer | Update own profile |
| GET | `/users?search=` | Bearer | Search users |
| GET | `/connections?status=` | Bearer | List my connections |
| POST | `/connections/request/:userId` | Bearer | Send connection request |
| POST | `/connections/:id/accept` | Bearer | Accept a request |
| POST | `/connections/:id/decline` | Bearer | Decline a request |

## Architecture Notes

- **Refresh tokens are rotated and stored hashed in Postgres**, not just trusted as stateless JWTs — this makes server-side logout and revocation actually possible, not just cosmetic.
- **Access tokens live in memory on the frontend**, never localStorage, to reduce XSS exposure. Session is silently restored on page load via the httpOnly refresh cookie.
- **Connections are directional but queried bidirectionally** — a unique constraint on `(requesterId, addresseeId)` combined with an OR-based existence check prevents duplicate or reversed-duplicate requests.