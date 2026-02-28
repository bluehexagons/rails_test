# rails_test

Rails + React stack for learning Ruby. Users create accounts, log in, and click a button to track day/month/year streaks.

## Setup

### Backend

```bash
bundle install
bin/rails db:create db:migrate
bin/rails s
```

API: `http://localhost:3000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## Authentication

Uses JWT with refresh tokens:
- Login returns `token` (1 hour) and `refresh_token` (60 days)
- Store `refresh_token` securely (HttpOnly cookie recommended)
- To refresh: `POST /auth/refresh` with `{ "refresh_token": "..." }`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /users | Create account |
| POST | /auth/login | Login |
| POST | /auth/refresh | Refresh token |
| POST | /auth/logout | Logout |
| GET | /me | Current user |
| POST | /entities/increment | Increment clicks |
| GET | /entities/current | Get clicks & streaks |

## Security

- JWT + refresh tokens, bcrypt password hashing, rate limiting

## License

MIT
