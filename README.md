# 👥 Premium User Registry System (Go + React)

A full-stack, production-ready User Management System built with a **Clean Architecture** backend in **Go** and a high-fidelity dashboard frontend in **React**. 

Age is **never stored in the database**; it is dynamically calculated at run-time in the Go service layer using birth dates and current system time, keeping database storage minimal and always accurate.

---

## 🌟 Key Features

### Backend (Go)
- **GoFiber Router**: High-performance HTTP router engine.
- **Dynamic Age Calculation**: Date of Birth (DOB) is parsed and calculated on-demand using standard Go time parameters.
- **SQLC Queries**: Type-safe, compile-time verified database query functions.
- **Request Tracing Middlewares**: Custom Request ID generation, access logger, and execution duration tracking.
- **Uber Zap Logger**: Production-grade structured console/JSON logger.
- **Graceful Shutdown**: Intercepts OS signals (`SIGINT`/`SIGTERM`) to cleanly flush logs, stop Fiber web listeners, and close database connection pools.
- **Input Validation**: Uses `go-playground/validator` to reject malformed payloads before processing database steps.
- **CORS Middleware**: Fully configured cross-origin options.
- **Database Self-Initialization**: Automatically checks, creates, and sets up PostgreSQL databases and table structures on boot.

### Frontend (React)
- **Vite Bundler**: Hot module replacement (HMR) for instant development feedback.
- **Tailwind CSS System**: Clean, responsive dashboard grids, custom brand tokens, and interactive hover scales.
- **Dashboard Statistics (KPIs)**: Dynamic metrics summarizing Total Registrations, Average User Age, and DB Engine status.
- **Search & Pagination**: Live search filtering by username and responsive navigation page limits.
- **Dialog Validation Modals**: Custom confirmation screen blocks to prevent accidental user deletions.
- **React Hot Toast**: Real-time pop-up notification statuses (Success, Warn, Error).
- **Form Validations**: Client-side constraints preventing invalid DOB inputs or empty names.

---

## 📂 Project Structure

```txt
├── cmd/
│   └── server/
│       └── main.go         # Bootstrapper, connection pool & graceful shutdown hooks
├── config/
│   └── config.go           # Environment variables parser and connection DSN formatter
├── db/
│   ├── migrations/         # Up/Down SQL database migration scripts
│   ├── queries.sql         # SQL operation templates compiled by SQLC
│   └── sqlc/               # Compiled, type-safe database queries (db.go, models.go, queries.sql.go)
├── internal/
│   ├── handler/            # Fiber controllers executing request parsing & schema validations
│   ├── repository/         # Database transaction mapper interface and SQLC implementation
│   ├── service/            # Core business domain logic & DOB age calculators
│   ├── routes/             # Path registration bindings, trace layers & CORS configuration
│   ├── middleware/         # Custom log formatters, trace IDs, and request timers
│   ├── models/             # Standard JSON API Request and Response structs
│   └── logger/             # Zap logger configurations and log-level triggers
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx      # Sticky responsive navigation header
│   │   │   ├── UserList.jsx    # Dashboard table view with KPIs, Search, and Pagination
│   │   │   ├── UserForm.jsx    # Add and Edit user form with range checking
│   │   │   └── UserDetails.jsx # Profile inspect banner page
│   │   ├── App.jsx         # Main router layout with Toast notifications provider
│   │   ├── api.js          # Axios client instance with baseURL fallbacks
│   │   └── index.css       # Tailwind injections and custom glassmorphism utilities
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker-compose.yml     # Multi-container orchestration (Postgres + Backend + Frontend)
├── Dockerfile              # Backend build file (multi-stage compilation)
└── README.md
```

---

## 🛠️ REST API Specification

### 1. Register User
- **Endpoint**: `POST /users`
- **Request Body**:
  ```json
  {
    "name": "Alice Smith",
    "dob": "1990-05-10"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": 1,
    "name": "Alice Smith",
    "dob": "1990-05-10"
  }
  ```

### 2. Get User By ID (Includes calculated age)
- **Endpoint**: `GET /users/:id`
- **Response (200 OK)**:
  ```json
  {
    "id": 1,
    "name": "Alice Smith",
    "dob": "1990-05-10",
    "age": 36
  }
  ```

### 3. Update User Profile
- **Endpoint**: `PUT /users/:id`
- **Request Body**:
  ```json
  {
    "name": "Alice Updated",
    "dob": "1991-03-15"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "id": 1,
    "name": "Alice Updated",
    "dob": "1991-03-15",
    "age": 35
  }
  ```

### 4. Delete User
- **Endpoint**: `DELETE /users/:id`
- **Response**: `204 No Content`

### 5. List Users / Search Users
- **Endpoint**: `GET /users` or `GET /users?search=Alice`
- **Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "name": "Alice Updated",
      "dob": "1991-03-15",
      "age": 35
    }
  ]
  ```

---

## ⚙️ Environment Configurations (`.env`)

Create a `.env` file in the root workspace. Default values:

```env
PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=Vish@1724
DB_NAME=user_management
DB_SSLMODE=disable
```

---

## 🚀 Setup & Execution Guides

### Method A: Local Host (Manual Setup)

Ensure you have installed:
- **GoLang** (v1.22+)
- **Node.js** (v20+)
- **PostgreSQL** server running locally (port 5432)

#### 1. Setup & Start Backend
Navigate to the root workspace:
```bash
# Install Go dependencies
go mod tidy

# Start the Go server
go run cmd/server/main.go
```
*Note: On startup, the backend automatically creates the `user_management` database and the `users` table on your PostgreSQL server if they do not exist.*

#### 2. Setup & Start Frontend
Open a new terminal window in the `frontend` folder:
```bash
# Install NPM dependencies
npm install

# Start Vite hot development server
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

### Method B: Containerized Orchestration (Docker Compose)
Runs the database, backend, and frontend inside structured Docker environments without manual setups.

Ensure you have **Docker Desktop** installed and running, then execute:
```bash
# Build and run containers in the root folder
docker-compose up --build
```
- **Web App UI**: `http://localhost:3000`
- **Go Rest API**: `http://localhost:8080`
- **PostgreSQL DB Port**: `localhost:5432`

To tear down containers:
```bash
docker-compose down
```

---

## 🔍 Troubleshooting Notes

### 1. Terminal does not recognize the `go` command
If you recently installed Go via `winget` but your command line prints `go : The term 'go' is not recognized`, it is because your active shell session has cached environment PATH variables.
- **Solution**: Restart your VS Code, Git Bash, or Terminal application to load the new system PATH.

### 2. Disk Space Constraints on Windows C: Drive
Go's compiler builds packages inside a temporary system folder. If you encounter the error `compile: writing output: There is not enough space on the disk` because your C: drive has low storage, you can redirect the Go build directories to your F: drive (which has ample space).
- **PowerShell command to resolve**:
  ```powershell
  $env:GOTMPDIR = "F:\OneDrive\Desktop\dob_calculator\tmp"
  $env:GOCACHE = "F:\OneDrive\Desktop\dob_calculator\cache"
  go run cmd/server/main.go
  ```
