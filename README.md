# Profile Intelligence API

A REST API that enriches names using Genderize, Agify, and Nationalize APIs, then stores and serves the results.

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- UUID v7 for IDs

## Setup

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd profile-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set environment variables

Copy `.env.example` to `.env` and fill in your MongoDB URI:

```bash
cp .env.example .env
```

Edit `.env`:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/profile-api?retryWrites=true&w=majority
PORT=3000
```

### 4. Run locally

```bash
npm run dev
```

## API Endpoints

### POST /api/profiles
Create a profile by name. Calls Genderize, Agify, and Nationalize APIs.

**Request:**
```json
{ "name": "ella" }
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": "...",
    "name": "ella",
    "gender": "female",
    "gender_probability": 0.99,
    "sample_size": 1234,
    "age": 46,
    "age_group": "adult",
    "country_id": "DRC",
    "country_probability": 0.85,
    "created_at": "2026-04-01T12:00:00.000Z"
  }
}
```

If the name already exists, returns the existing profile with `"message": "Profile already exists"`.

---

### GET /api/profiles
Get all profiles. Supports optional case-insensitive filters:

- `?gender=male`
- `?country_id=NG`
- `?age_group=adult`
- Combinable: `?gender=male&country_id=NG`

---

### GET /api/profiles/:id
Get a single profile by UUID.

---

### DELETE /api/profiles/:id
Delete a profile. Returns `204 No Content`.

---

## Error Responses

All errors follow:
```json
{ "status": "error", "message": "..." }
```

- `400` — Missing or empty name
- `422` — Name is not a string
- `404` — Profile not found
- `502` — External API returned invalid data
- `500` — Server error

## Deployment (Railway)

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add environment variable: `MONGODB_URI` (from MongoDB Atlas)
4. Railway auto-detects Node.js and runs `npm start`
5. Copy your Railway public URL — that's your API base URL
