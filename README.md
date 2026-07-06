# Real-Time Running Tracker — Backend

A complete REST API backend for a real-time running tracker app, built with
**Node.js, Express.js, MongoDB, and Mongoose**. Built for a college / academic
project, with clean, modular, well-commented, production-style code.

---

## Table of Contents

1. [Folder Structure](#folder-structure)
2. [Required npm Packages](#required-npm-packages)
3. [Installation Steps](#installation-steps)
4. [Environment Variables](#environment-variables)
5. [Running the Server](#running-the-server)
6. [API Documentation](#api-documentation)
7. [Postman Collection Examples](#postman-collection-examples)
8. [Testing Guide](#testing-guide)
9. [Common Errors and Fixes](#common-errors-and-fixes)
10. [Future Improvements](#future-improvements)

---

## Folder Structure

```
backend/
├── config/
│   └── db.js                  # MongoDB connection setup
├── controllers/
│   ├── authController.js      # register, login, profile, logout
│   ├── userController.js      # delete account, get user by id
│   └── runController.js       # start/stop run, GPS tracking, stats
├── middleware/
│   ├── authMiddleware.js       # JWT verification ("protect" routes)
│   ├── errorMiddleware.js      # 404 + global error handler
│   └── validateMiddleware.js   # express-validator result handler
├── models/
│   ├── User.js                 # User schema (with password hashing)
│   └── Run.js                  # Run schema (with embedded route points)
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   └── runRoutes.js
├── services/                   # reserved for future business/service layer
├── utils/
│   ├── generateToken.js        # JWT signing helper
│   ├── calculateDistance.js    # Haversine formula
│   ├── calculatePace.js        # pace + speed helpers
│   ├── calculateCalories.js    # calorie estimation (MET-based)
│   └── responseHandler.js      # consistent {success,message,data} responses
├── validators/
│   ├── authValidator.js
│   └── runValidator.js
├── uploads/                     # uploaded files (e.g. profile images)
├── logs/                        # reserved for log files
├── .env                         # your local environment variables (not committed)
├── .env.example                 # template for .env
├── .gitignore
├── package.json
├── app.js                       # Express app config (middleware + routes)
└── server.js                    # entry point (connects DB, starts server)
```

---

## Required npm Packages

| Package             | Purpose                                      |
|----------------------|-----------------------------------------------|
| express              | Web framework / routing                       |
| mongoose             | MongoDB ODM                                   |
| bcryptjs             | Password hashing                              |
| jsonwebtoken         | JWT authentication                            |
| dotenv               | Load environment variables from `.env`        |
| cors                 | Enable cross-origin requests from the frontend |
| morgan               | HTTP request logging                          |
| helmet               | Security headers                              |
| express-validator    | Input validation                              |
| cookie-parser        | Parse cookies (JWT stored in httpOnly cookie) |
| nodemon (dev only)   | Auto-restart server during development        |

---

## Installation Steps

1. **Extract the zip** and open a terminal inside the `backend/` folder.

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and replace `MONGO_URI` with your own MongoDB connection
     string (local or MongoDB Atlas), and set a strong `JWT_SECRET`.

4. **Start the server:**
   - Development mode (auto-restarts on file changes):
     ```bash
     npm run dev
     ```
   - Production mode:
     ```bash
     npm start
     ```

5. **Confirm it's running** by visiting:
   ```
   http://localhost:5000/api/health
   ```
   You should see a JSON response confirming the API is live.

---

## Environment Variables

Defined in `.env` (see `.env.example` for the template):

| Variable                 | Description                                             |
|---------------------------|-----------------------------------------------------------|
| `PORT`                    | Port the server listens on (default: 5000)               |
| `NODE_ENV`                | `development` or `production`                             |
| `MONGO_URI`               | Your MongoDB connection string **(required)**             |
| `JWT_SECRET`              | Secret key used to sign JWT tokens **(required)**          |
| `JWT_EXPIRES_IN`          | JWT expiry duration (e.g. `7d`)                            |
| `COOKIE_EXPIRES_IN_DAYS`  | How long the auth cookie stays valid                       |
| `CLIENT_URL`              | Your React frontend's URL (for CORS)                       |

> ⚠️ **You must provide your own `MONGO_URI`.** It is intentionally left as
> a placeholder — never hardcode real credentials into source code.

---

## API Documentation

All responses follow this consistent shape:
```json
{
  "success": true,
  "message": "Human readable message",
  "data": { }
}
```

### Auth Routes — `/api/auth`

| Method | Endpoint          | Access  | Description                       |
|--------|--------------------|---------|------------------------------------|
| POST   | `/register`        | Public  | Register a new user                |
| POST   | `/login`            | Public  | Login and receive a JWT             |
| GET    | `/profile`          | Private | Get the logged-in user's profile    |
| PUT    | `/profile`          | Private | Update the logged-in user's profile |
| POST   | `/logout`           | Private | Clear the auth cookie               |

**Register — body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "height": 165,
  "weight": 58,
  "age": 24,
  "gender": "female"
}
```

**Login — body:**
```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

### User Routes — `/api/users`

| Method | Endpoint    | Access  | Description                          |
|--------|-------------|---------|----------------------------------------|
| DELETE | `/me`       | Private | Delete your own account + all runs     |
| GET    | `/:id`      | Private | Get public info about any user by ID   |

### Run Routes — `/api/runs`

All run routes require authentication (`Authorization: Bearer <token>`
header OR the `token` cookie set at login).

| Method | Endpoint        | Access  | Description                                   |
|--------|-----------------|---------|-------------------------------------------------|
| POST   | `/start`        | Private | Start a new run session                         |
| POST   | `/location`     | Private | Append a GPS point to an active run             |
| POST   | `/stop`         | Private | Stop a run & calculate final stats              |
| GET    | `/statistics`   | Private | Get aggregate stats across all completed runs   |
| GET    | `/`             | Private | Get all of your runs (newest first)             |
| GET    | `/:id`          | Private | Get full details of one run                     |
| DELETE | `/:id`          | Private | Delete a run                                    |

**Start run — body:** *(none needed)*

**Add location — body:**
```json
{
  "runId": "664f1c2e5a1b2c3d4e5f6789",
  "latitude": 27.7172,
  "longitude": 85.3240,
  "timestamp": "2026-07-05T10:15:00Z"
}
```

**Stop run — body:**
```json
{
  "runId": "664f1c2e5a1b2c3d4e5f6789",
  "notes": "Felt great today!",
  "weather": "Sunny, 24°C"
}
```

**Statistics — response `data` shape:**
```json
{
  "totalRuns": 12,
  "totalDistance": 58.4,
  "totalTime": 21600,
  "longestRun": 10.2,
  "averagePace": 5.4,
  "averageSpeed": 11.1,
  "totalCalories": 3420,
  "currentMonthDistance": 15.3,
  "currentWeekDistance": 4.2
}
```

---

## Postman Collection Examples

You can manually import these as requests in Postman, or build a collection:

1. **Register**
   `POST http://localhost:5000/api/auth/register`
   Body (raw JSON): see example above.

2. **Login**
   `POST http://localhost:5000/api/auth/login`
   Body (raw JSON): see example above.
   → Copy the `token` from the response for the next requests.

3. **Get Profile**
   `GET http://localhost:5000/api/auth/profile`
   Headers: `Authorization: Bearer <token>`

4. **Start Run**
   `POST http://localhost:5000/api/runs/start`
   Headers: `Authorization: Bearer <token>`

5. **Add Location** *(repeat several times with different coordinates)*
   `POST http://localhost:5000/api/runs/location`
   Headers: `Authorization: Bearer <token>`
   Body: see example above.

6. **Stop Run**
   `POST http://localhost:5000/api/runs/stop`
   Headers: `Authorization: Bearer <token>`
   Body: `{ "runId": "<runId from step 4>" }`

7. **Get Statistics**
   `GET http://localhost:5000/api/runs/statistics`
   Headers: `Authorization: Bearer <token>`

> Tip: In Postman, you can set up an **Environment** with a `token` variable
> and a **Tests** script on the login request to auto-save it:
> ```js
> pm.environment.set("token", pm.response.json().data.token);
> ```
> Then use `{{token}}` in your Authorization headers for every other request.

---

## Testing Guide

Since this is an academic project, manual testing via **Postman** or
**Thunder Client** (VS Code extension) is recommended:

1. Start MongoDB (locally or use MongoDB Atlas).
2. Run `npm run dev`.
3. Test the flow in this order:
   - Register → Login → Get Profile → Update Profile
   - Start Run → Add Location (several times) → Stop Run
   - Get All Runs → Get Run By ID → Get Statistics → Delete Run
4. Test validation errors on purpose:
   - Register with an invalid email or short password.
   - Add a location with `latitude: 999` (should be rejected — out of range).
   - Access `/api/runs` without a token (should return 401).
5. Test error handling:
   - Request `/api/runs/000000000000000000000000` (valid format, but doesn't
     exist) → should return a clean 404, not a server crash.

---

## Common Errors and Fixes

| Error | Likely Cause | Fix |
|-------|--------------|-----|
| `MongoDB Connection Error` on startup | Invalid or missing `MONGO_URI` | Double-check your `.env` file and MongoDB Atlas IP whitelist |
| `Not authorized, no token provided` | Missing `Authorization` header or cookie | Include `Authorization: Bearer <token>` header, or ensure cookies are enabled |
| `Not authorized, token failed or expired` | JWT expired or `JWT_SECRET` changed | Login again to get a fresh token |
| `Duplicate value for field: email` | Registering with an email that already exists | Use a different email or login instead |
| `Route not found` | Wrong URL or typo in endpoint | Double-check the endpoint path and HTTP method |
| CORS error in browser console | `CLIENT_URL` doesn't match your frontend's actual origin | Update `CLIENT_URL` in `.env` to match your React app's URL |
| `Cast to ObjectId failed` | Invalid MongoDB ID format in URL param | Ensure IDs are valid 24-character MongoDB ObjectIds |

---

## Future Improvements

- Add refresh tokens for longer-lived sessions without re-login.
- Add file upload handling (e.g. `multer`) for real profile image uploads.
- Add pagination to `GET /api/runs` for users with many runs.
- Add a `Leaderboard` feature comparing stats across users.
- Add WebSocket / Socket.IO support for true real-time location broadcasting
  (e.g. live-sharing a run with friends).
- Add unit tests (Jest) and integration tests (Supertest).
- Add rate-limiting (`express-rate-limit`) to protect auth endpoints from brute force.
- Add password reset via email (nodemailer + reset tokens).
- Add weather auto-fetching from a weather API based on run's start coordinates.
