# 🚀 Run Locally

Follow these steps to run the project on your local machine.

## 📦 Prerequisites

- Node.js
- Go
- PostgreSQL

---

## 🖥️ Frontend Setup

1. Go to frontend folder  
   cd frontend

2. Install dependencies  
   npm install

3. Run the app  
   npm run dev

Frontend runs at: http://localhost:3000

---

## ⚙️ Backend Setup

1. Create a PostgreSQL database

2. Setup environment file  
   cd backend  
   touch .env

3. Fill `.env` with:
   DB_USER="your_db_user"  
   DB_HOST="localhost"  
   DB_PASSWORD="your_db_password"  
   DB_NAME="your_db_name"  
   DB_PORT=5432  
   DB_SSLMODE="disable"  
   DB_TIMEZONE="Asia/Jakarta"  
   SECRET_KEY="your_secret_key"

4. Run backend  
   go run main.go

Backend runs at: http://localhost:8080

---

## 📁 Project Structure

project-root/  
├── frontend React + Vite  
└── backend Go + GORM
