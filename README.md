# Task Management System — Backend (Java + Spring Boot)

## Live Deployed Links

| Part      | Link |
|-----------|------|
| Frontend  | _Not yet deployed — add your Vercel URL here once deployed_ |
| Backend   | _Not yet deployed — add your Render/Railway URL here once deployed_ |

> Currently this project runs locally. See **Setup & Installation** below to run it on your own machine.

---

## Project Overview

This is the backend for a full-stack **Task Management System**, built as a REST API that handles user authentication and task CRUD operations. It's designed as a drop-in replacement for the Node.js/Express version of this backend — it exposes the **exact same API contract** (`http://localhost:5000/api/...`) so the existing React + Vite frontend works with either one, unchanged.

**Key features:**
- User signup/login with hashed passwords and JWT-based session authentication
- Full CRUD (Create, Read, Update, Delete) for tasks, scoped per logged-in user
- Filtering/search on tasks by status, priority, and keyword
- REST API integration between frontend and backend over JSON

**Tech stack:**
- Java 17, Spring Boot 3.3
- Spring Web, Spring Data JPA, Spring Security
- PostgreSQL database
- JWT auth (jjwt library) + BCrypt password hashing

---

## Setup & Installation

### Prerequisites
- Java 17+ (`java -version`)
- Maven 3.8+ (`mvn -version`) — or use an IDE (IntelliJ/Eclipse/VS Code) that runs Maven for you
- PostgreSQL running locally (or reachable), or via Docker:
```bash
  docker run --name taskmanager-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

### 1. Create the database
```bash
psql -U postgres -h localhost -c "CREATE DATABASE taskmanager;"
```
(Using the Docker container above instead? Run:
`docker exec -it taskmanager-pg psql -U postgres -c "CREATE DATABASE taskmanager;"`)

### 2. Configure environment variables
See the **Environment Variables** section below, then export them in your terminal (or set them in your IDE's run configuration).

### 3. Run the application
```bash
cd task-management-backend-java
mvn spring-boot:run
```

Or build and run a jar:
```bash
mvn clean package
java -jar target/task-management-backend-1.0.0.jar
```

The API starts on **http://localhost:5000**. The `users` and `tasks` tables are created automatically on first run (`spring.jpa.hibernate.ddl-auto=update`) — no manual schema scripts needed.

### 4. Connect the frontend
No frontend code changes are required — just make sure this backend is running on port 5000 while the Vite dev server runs on port 5173 (`npm run dev` in the `frontend` folder). CORS is already configured to allow `http://localhost:5173`.

---

## Environment Variables

All variables are optional — each has a working local default — but should be overridden for any real/shared deployment.

| Variable      | Purpose                              | Default (local dev)                              |
|---------------|----------------------------------------|----------------------------------------------------|
| `DB_URL`      | JDBC connection string to PostgreSQL   | `jdbc:postgresql://localhost:5432/taskmanager`     |
| `DB_USERNAME` | PostgreSQL login username              | `postgres`                                          |
| `DB_PASSWORD` | PostgreSQL login password              | `postgres`                                          |
| `JWT_SECRET`  | Secret key used to sign/verify JWTs    | A placeholder string — **must** be changed before deploying |

Example (Mac/Linux):
```bash
export DB_URL="jdbc:postgresql://localhost:5432/taskmanager"
export DB_USERNAME="username"
export DB_PASSWORD="password"
export JWT_SECRET="a-long-random-string-at-least-32-characters"
```

Example (Windows PowerShell):
```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/taskmanager"
$env:DB_USERNAME="username"
$env:DB_PASSWORD="password"
$env:JWT_SECRET="a-long-random-string-at-least-32-characters"
```

These map directly to `src/main/resources/application.properties`:
```properties
spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/taskmanager}
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD:postgres}
jwt.secret=${JWT_SECRET:change_this_to_a_long_random_secret_change_this_to_a_long_random_secret}
```

---

## API Endpoints Documentation

Base URL: `http://localhost:5000/api`

### Auth

| Method | Endpoint         | Auth | Body                                   | Description               |
|--------|------------------|------|-----------------------------------------|-----------------------------|
| POST   | `/auth/signup`   | No   | `{ "name", "email", "password" }`       | Register a new user, returns JWT |
| POST   | `/auth/login`    | No   | `{ "email", "password" }`               | Log in, returns JWT              |

**Response shape (both):**
```json
{
  "message": "Login successful.",
  "token": "<jwt>",
  "user": { "id": 1, "name": "Jane Doe", "email": "jane@example.com" }
}
```

### Tasks
All task endpoints require header: `Authorization: Bearer <token>`

| Method | Endpoint          | Body                                                          | Description                                |
|--------|-------------------|-----------------------------------------------------------------|----------------------------------------------|
| GET    | `/tasks`          | —                                                                | List current user's tasks. Optional query params: `?status=&priority=&search=` |
| GET    | `/tasks/{id}`     | —                                                                | Get one task by id                            |
| POST   | `/tasks`          | `{ "title", "description", "status", "priority", "due_date" }`  | Create a task                                 |
| PUT    | `/tasks/{id}`     | Any subset of the same fields                                    | Update a task (partial updates supported)     |
| DELETE | `/tasks/{id}`     | —                                                                | Delete a task                                 |

**Task object shape (response):**
```json
{
  "id": 1,
  "user_id": 3,
  "title": "Finish README",
  "description": "Add missing sections",
  "status": "in-progress",
  "priority": "high",
  "due_date": "2026-09-20",
  "created_at": "2026-09-12T10:00:00",
  "updated_at": "2026-09-12T11:30:00"
}
```
`status` values: `pending` | `in-progress` | `completed`
`priority` values: `low` | `medium` | `high`

### Health
| Method | Endpoint      | Auth | Description   |
|--------|---------------|------|----------------|
| GET    | `/health`     | No   | Health check   |

---

## Project Structure

```
src/main/java/com/taskmanager/
├── TaskManagementApplication.java   # main entry point
├── config/
│   └── SecurityConfig.java          # JWT filter chain + CORS
├── controller/
│   ├── AuthController.java          # signup / login
│   ├── TaskController.java          # task CRUD
│   └── HealthController.java
├── dto/                             # request/response shapes
├── exception/                       # ApiException + global JSON error handler
├── model/                           # User, Task JPA entities
├── repository/                      # Spring Data JPA repositories + Specifications
└── security/                        # JwtUtil, JwtAuthFilter, AuthPrincipal
```

---

## Swapping to MySQL instead of PostgreSQL

Replace the `org.postgresql:postgresql` dependency in `pom.xml` with `mysql-connector-j`, then update the datasource block in `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/taskmanager
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.username=root
spring.datasource.password=yourpassword
```
The entity classes (`User`, `Task`) and all repository/controller code stay exactly the same — Spring Data JPA + Hibernate handle the SQL dialect differences for you.

---

## Security Notes
- Passwords are hashed with BCrypt — never stored in plain text.
- JWTs expire after 7 days (`jwt.expiration-ms` in `application.properties`).
- Change `JWT_SECRET` to a real random value before any deployment.
- CORS currently allows only `localhost:5173` — add your production frontend origin in `SecurityConfig.corsConfigurationSource()` before deploying.