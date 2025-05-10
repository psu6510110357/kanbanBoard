# 🧠 Kanban Board Backend API

A feature-rich Kanban Board backend built with **NestJS**, **Prisma**, and **PostgreSQL**.  
Designed to support task management, collaboration, drag & drop, and role-based access control.

---

## 🚀 Features

- ✅ User Authentication with JWT
- ✅ Board Management (CRUD)
- ✅ Column & Task Management with drag-and-drop support
- ✅ Tag System for tasks
- ✅ Assign members to tasks
- ✅ Role-based Authorization (`BoardOwner`, `BoardMember`)
- ✅ Prisma ORM with PostgreSQL
- ✅ Modular NestJS structure
- ✅ Dockerized for local development
- ✅ Input validation with `class-validator`
- ✅ API tested using Postman

---

## 🏗️ Tech Stack

| Technology      | Description                         |
|----------------|-------------------------------------|
| **NestJS**      | Backend framework (TypeScript)      |
| **Prisma**      | Type-safe ORM for database access   |
| **PostgreSQL**  | Relational database engine          |
| **Docker**      | Containerization and Dev environment |
| **JWT**         | Authentication with `@nestjs/jwt`   |
| **bcryptjs**    | Password hashing                    |
| **class-validator** | Validate input DTOs             |
| **ESLint / Prettier** | Code quality & formatting     |
| **Postman**     | API testing                         |

---

## 🛠 Setup & Run (Docker Compose)

```bash
# 1. Clone this repo
git clone https://github.com/your-username/kanban-board-backend.git](https://github.com/psu6510110357/kanbanBoard.git
cd kanban_board_backend

# 2. Create .env file
cp .env.example .env

DATABASE_URL="postgresql://admin:1234@localhost:5432/db"
SECRET="my_secret"

# 3. Build and start containers
docker-compose up -d --build

# 4. Run database migration
docker exec -it kanban_board_server npx prisma migrate dev

# 5. Access your API at http://localhost:3000

📄 API Documentation
https://.postman.co/workspace/My-Workspace~1a042d22-85c9-4e59-80b5-cc16c889237a/collection/24720169-56ea4c88-aaa6-4a66-bf9f-faae8479dd11?action=share&creator=24720169
Use Postman Collection to test endpoints
Protected routes require JWT token in Authorization: Bearer <token>

📊 Database ER Diagram
![Kanban_Board](https://github.com/user-attachments/assets/98e3b6a9-0b02-4ecf-9b1d-9559d5ff2bf7)


