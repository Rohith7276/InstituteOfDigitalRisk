# Institute of Digital Risk

## Overview

This project is a full-stack transaction scoring application built with:
- Backend: Node.js, Express.js
- Database: SQLite by default, PostgreSQL ready via `DATABASE_URL`
- Frontend: React + Vite
- Deployable on Render/Vercel by separating backend and frontend services

## Live Demo

- **Frontend (production):** https://institute-of-digital-risk-ten.vercel.app/

 

## Backend Structure

- `backend/server.js`: Express server setup, CORS, JSON parsing, and rate limiting
- `backend/routes.js`: API route definitions, payload validation, transaction logic, and ranking endpoints
- `backend/db.js`: SQLite schema creation, query preparation, and transactional transaction runner
- `backend/config.js`: environment-based configuration values
- `backend/services.js`: score calculation logic and scoring caps

## API Endpoints

- `POST /transaction`
  - Payload: `{ "requestId": "unique-id", "userId": "user123", "amount": 100 }`
  - Validates all fields and rejects missing or invalid values
  - Ensures `requestId` is unique and returns `409 Conflict` on duplicates
  - Rejects non-positive amounts and amounts above the configured maximum
  - Creates or updates the user, inserts the transaction, and updates totals atomically

- `GET /summary/:userId`
  - Returns user summary: `userId`, `totalTransactions`, `totalAmount`, `score`, and `rank`

- `GET /ranking`
  - Returns leaderboard sorted by `score` descending, then `totalAmount`

## Database Schema

Users
- `id`
- `user_id`
- `score`
- `total_amount`
- `total_transactions`
- `created_at`

Transactions
- `id`
- `request_id` (unique)
- `user_id`
- `amount`
- `created_at`

## Ranking Formula

Score is calculated from weighted components:
- Total transaction amount: 60%
- Number of transactions: 25%
- Consistency bonus: 15%

Consistency bonus is based on the number of distinct transaction days.

The final score uses configured caps to prevent runaway leaderboard inflation.

## Duplicate Prevention

- `requestId` is enforced as a unique field on `transactions`
- Duplicate request IDs return `409 Conflict`
- Backend rate limiting reduces repeated transaction submission from the same client IP

## Concurrency Handling

- SQLite database transactions are used to ensure atomic updates
- Insertion of the transaction and update of user totals occur within the same transaction
- Unique constraint violations are caught and translated into duplicate request errors

## Abuse Prevention

- Reject negative or zero amounts
- Reject amounts above `MAX_TRANSACTION_AMOUNT`
- Rate limit transaction creation per client IP
- Log suspiciously large transactions for further review
- Score caps prevent runaway leaderboard manipulation

## Local Setup

1. Install backend dependencies

```bash
cd backend
npm install
```

2. Run the backend

```bash
npm run dev
```

3. Install frontend dependencies

```bash
cd ../frontend
npm install
npm run dev
```

4. Access the frontend at `http://localhost:5173`  
 