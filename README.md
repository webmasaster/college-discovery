# College Discovery Platform API (Backend MVP)

An enterprise-grade, RESTful API built for a College Discovery Platform. This project fulfills the **Role 2: Backend Engineer (Track B)** requirements for the AI Software Engineer Internship assignment.

The architecture emphasizes strict data validation, relational database modeling, zero-trust security, and high-performance querying suitable for scale.

## 🚀 Tech Stack
- **Framework:** Next.js (App Router API Routes)
- **Runtime:** Node.js
- **Language:** TypeScript
- **Database:** PostgreSQL (Hosted on **Supabase**)
- **ORM:** Prisma
- **Security:** JSON Web Tokens (JWT), bcryptjs
- **Validation:** Zod

---

## 🧠 Architectural Highlights & Optimizations
This API goes beyond basic CRUD operations by implementing several production-level optimizations:

1. **PostgreSQL Full-Text Search (FTS):** The search engine utilizes Prisma's `search` operator to tap into PostgreSQL's native dictionary-based full-text indexing, making multi-word location searches significantly faster and smarter than standard `LIKE %` queries.
2. **Cursor-Based Pagination:** Built for modern infinite-scroll UIs. Instead of slow offset math (`skip`), the API returns a `nextCursor` to fetch the next batch of records instantly, preventing performance degradation on deep scrolling.
3. **B-Tree Database Indexing:** Frequently queried fields (`location`, `rating`, `fees`) are explicitly indexed (`@@index`) in the Prisma schema to prevent sequential database scans.
4. **Relational Prediction Engine:** The Predictor tool doesn't just check numbers; it performs nested relational queries to match the student's *Rank* strictly against the *Specific Exam* (e.g., JEE Advanced, NEET, CLAT) accepted by nested `Course` tables.
5. **Zero-Trust JWT Architecture:** Protected routes extract user identity strictly via cryptographic token decoding (`Authorization: Bearer <token>`), entirely preventing Broken Object Level Authorization (BOLA) attacks.
6. **Standardized Error Formatting:** Zod validation failures are intercepted and flattened into a predictable `[{ field, message }]` array to provide an exceptional Developer Experience (DX) for frontend consumers.

---

## 🗄️ Database Schema (ERD Overview)
- **`College`**: The core entity (id, name, location, fees, rating).
- **`Course`**: A one-to-many child of College (id, title, examAccepted, cutoffRank).
- **`User`**: Securely hashed credentials (id, email, password).
- **`SavedCollege`**: A many-to-many join table linking Users to Colleges with a strict `@@unique([userId, collegeId])` constraint to prevent duplication.
- **`SavedComparison`**: Stores user-generated comparison arrays (id, name, collegeIds[]) for quick retrieval and dashboard rendering.

---

## 🛠️ Local Setup Instructions

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure your environment variables:**
   Create a `.env` file in the root directory and add your Supabase connection string and a secret JWT key:
   ```env
   # Supabase Database URL
   DATABASE_URL="postgresql://postgres.[your-project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
   
   # JWT Secret for Auth
   JWT_SECRET="your_super_secret_key_here"
   ```

3. **Push the schema and generate the Prisma Client:**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. **Seed the database:**
   Populate the database with the provided multi-disciplinary production dataset (20 Colleges including Engineering, Medical, Law, Commerce, and Management).
   ```bash
   npx tsx prisma/seed.ts
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

---

## 📖 API Documentation & Testing Guide

You can test these endpoints using Postman or Thunder Client.

### 1. Authentication
**Register a new user:**
- **POST** `/api/auth/register`
- **Body:** `{ "email": "test@example.com", "password": "password123" }`

**Log in (Returns JWT):**
- **POST** `/api/auth/login`
- **Body:** `{ "email": "test@example.com", "password": "password123" }`
- *Save the `token` from the response to use in the Authorization headers below.*

### 2. Core Search & Discovery
**Fetch Colleges (with Search, Filter, Sort, and Cursor Pagination):**
- **GET** `/api/colleges?location=New Delhi&minRating=4.5&sortBy=fees&sortOrder=asc&limit=3`
- **Response Meta Demo:** Shows `totalItems`, `nextCursor`, and flattened Zod errors if invalid parameters are passed.

**Fetch Next Page (Infinite Scroll):**
- **GET** `/api/colleges?limit=3&cursor=<PASTE_NEXT_CURSOR_HERE>`

**Fetch Single College Details:**
- **GET** `/api/colleges/<UUID>`
- *Returns comprehensive data for a single college and its nested courses. Includes strict UUID format validation.*

### 3. Comparison & Prediction
**Compare Colleges Matrix:**
- **GET** `/api/compare?ids=<UUID_1>,<UUID_2>`
- *Returns a structured matrix comparing nested attributes side-by-side.*

**Predictor Tool:**
- **POST** `/api/predict`
- **Body:** `{ "exam": "NEET", "rank": 150 }`
- *Returns exclusively the colleges/courses where the rank qualifies for that specific exam.*

### 4. Protected Routes (Requires Header: `Authorization: Bearer <token>`)
**Save a College:**
- **POST** `/api/users/save-college`
- **Body:** `{ "collegeId": "<UUID>" }`

**Save a Comparison List:**
- **POST** `/api/users/save-comparison`
- **Body:** `{ "name": "Top Medical Choices", "collegeIds": ["<UUID_1>", "<UUID_2>"] }`

**View User's Saved Dashboard:**
- **GET** `/api/users/saved`
- *Automatically decodes the JWT to return only the current user's saved items and comparisons.*

---
*Developed for the AI Software Engineer Internship Evaluation.*