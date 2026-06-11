# User Management App (Go + React)

A full-stack user management system built with Golang (GoFiber), React (Vite + Tailwind CSS), SQLC, PostgreSQL, and Uber Zap Logger. Age is calculated dynamically on the backend using Go's time package and is never stored in the database.

## Tech Stack

- **Backend**: Golang 1.22+, GoFiber v2, SQLC, pgx/pq drivers, Uber Zap Logger, go-playground/validator
- **Frontend**: React.js 18+ (Vite), Tailwind CSS v3, Axios, React Router DOM v6, React Hot Toast
- **Database**: PostgreSQL 16+
- **Containers**: Docker & Docker Compose

---

## Folder Structure

```txt
/cmd/server/main.go         # Application Entrypoint & Graceful Shutdown
/config/config.go           # Environment variables configuration loader
/db/migrations/             # Database migration SQL files
/db/queries.sql             # SQL query declarations for SQLC
/db/sqlc/                   # Compiled SQLC type-safe database queries
/internal/
├── handler/                # GoFiber controller handlers
├── repository/             # Repository layer wrapping database operations
├── service/                # Business logic layer (contains dynamic age calculation)
├── routes/                 # Fiber routing bindings & CORS setup
├── middleware/             # Trace logging, request ID, duration middleware
├── models/                 # Request, Response and Error models
└── logger/                 # Uber Zap logger setup
/frontend/                  # React Vite application
│   ├── src/
│   │   ├── components/     # UI Dashboard, Form, details views
│   │   ├── App.jsx         # Routes setup & Toast configuration
│   │   └── api.js          # Axios configuration helper
│   ├── package.json
│   └── Dockerfile
/docker-compose.yml         # Dev/Prod Orchestrator (DB + Backend + Frontend)
/Dockerfile                 # Backend Docker build file
```

---

## Environment Variables (`.env`)

Create a `.env` file in the root directory. Example variables:

```env
PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=user_management
DB_SSLMODE=disable
```

---

## Database Setup & Migrations

If running locally without Docker:

1. Create a PostgreSQL database named `user_management`.
2. Apply the migration schema inside `/db/migrations/000001_create_users_table.up.sql`:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    dob DATE NOT NULL
);
```

---

## SQLC Setup

SQLC parses clean SQL queries and compiles them into type-safe Go code.

1. Install SQLC:
   ```bash
   go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest
   ```
2. Build queries:
   ```bash
   sqlc generate
   ```

*(Note: The database queries have already been compiled in `db/sqlc` for your convenience.)*

---

## Setup & Running Locally

### 1. Running the Backend

Ensure Go 1.22+ is installed and PostgreSQL is running.

```bash
# Navigate to the workspace root
cd dob_calculator

# Load dependencies
go mod tidy

# Run the backend server
go run cmd/server/main.go
```
The server will run on `http://localhost:8080`.

### 2. Running the Frontend

Ensure Node.js (v20+) is installed.

```bash
# Navigate to the frontend directory
cd frontend

# Install package dependencies
npm install

# Run the Vite server
npm run dev
```
The client app will launch at `http://localhost:3000`.

---

## Containerized Setup (Docker Compose)

The easiest way to run the entire stack (PostgreSQL + Go Backend + React Frontend) is using Docker Compose. Ensure Docker Desktop is active.

```bash
# Run the complete stack from the root directory
docker-compose up --build
```

- **React Web App**: `http://localhost:3000`
- **Go Rest API**: `http://localhost:8080`
- **Postgres Database**: Host `localhost`, Port `5432`

To tear down the containers and preserve database data:
```bash
docker-compose down
```
