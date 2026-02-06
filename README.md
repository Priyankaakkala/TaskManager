# Task Manager

This repository contains a small full-stack Task Manager app: an Express + MongoDB backend and a React frontend.

Overview
- Backend: Node.js, Express, Mongoose (MongoDB), JWT authentication, tasks CRUD.
- Frontend: React (Create React App), chart.js for simple visualizations, localStorage for auth.

Quickstart (development)

1. Start MongoDB (local or remote).
2. Backend
```powershell
cd backend
npm install
# set env vars then run
$env:MONGO_URI='mongodb://127.0.0.1:27017/task_manager'; $env:JWT_SECRET='devsecret'; npm run dev
```

3. Frontend
```bash
cd frontend
npm install
npm start
# open http://localhost:3000
```

Environment variables
- `MONGO_URI` — MongoDB connection string (default: `mongodb://127.0.0.1:27017/task_manager`)
- `JWT_SECRET` — secret for signing JWTs (default: `devsecret`)

API Endpoints
- POST `/api/auth/register` — { name, email, password }
- POST `/api/auth/login` — { email, password } → returns `{ token, user }`
- GET `/api/tasks` — requires `Authorization: Bearer <token>`
- POST `/api/tasks` — { title, description }
- PUT `/api/tasks/:id` — update task
- DELETE `/api/tasks/:id` — delete task

Database schema (summary)
- User: `{ name: String, email: String (unique), password: String (hashed) }`
- Task: `{ title: String, description: String, completed: Boolean, user: ObjectId, timestamps }`

Repository notes
- Frontend dev server proxies `/api` requests to `http://localhost:5000` (see `frontend/package.json`).
- There are small helper READMEs in `frontend/README.md` and `backend/README.md`.

Contributing
- Create a branch, make changes, and open a pull request. Run tests and linting before merging.

License
- Add your preferred license file if you plan to publish this repo publicly.
