# Submission - Full Stack Task Manager

## Run locally

- Backend

  - Install and run MongoDB locally or point `MONGO_URI` to a MongoDB Atlas cluster.
  - In `backend` run:

```
cd backend
npm install
set MONGO_URI=mongodb://127.0.0.1:27017/task_manager
set JWT_SECRET=your_secret
npm run dev
```

- Frontend

```
cd frontend
npm install
npm start
```

Frontend is configured to proxy `/api` requests to `http://localhost:5000` during development.

## API Endpoints

- `POST /api/auth/register` - register { name, email, password } → { token, user }
- `POST /api/auth/login` - login { email, password } → { token, user }
- `GET /api/tasks` - get user's tasks (Authorization: Bearer <token>)
- `POST /api/tasks` - create task { title, description } (Auth)
- `PUT /api/tasks/:id` - update task fields (Auth)
- `DELETE /api/tasks/:id` - delete task (Auth)

## Database Schema

- `User` collection
  - `name`: String
  - `email`: String (unique)
  - `password`: String (bcrypt hash)

- `Task` collection
  - `title`: String
  - `description`: String
  - `completed`: Boolean (default false)
  - `user`: ObjectId -> `User` (owner)

## Frontend screenshots

- Use the running frontend to take screenshots of:
  - Login/Register page
  - Task list / dashboard with tasks

## GitHub repo

- Create a new repository and push the project root. Include this `SUBMISSION.md`.
