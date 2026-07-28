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

## Deployment with infra_tools

The repository is compatible with the `project/agentic-vms` branch of
[`bluehexagons/infra_tools`](https://github.com/bluehexagons/infra_tools). It
intentionally uses infra_tools' Rails project detection rather than an
`infra.json` manifest. That deployment path provides persistent SQLite and
Active Storage state, configures the Rails systemd service, builds `frontend/`,
and serves its Vite output through nginx with Rails available at `/api`.

Deploy the repository normally with infra_tools and a domain deployment spec.
The deployer supplies `RAILS_HOST`, `FRONTEND_URL`, and `CORS_ORIGINS`; no
secrets belong in this repository.

## Authentication

Uses JWT with refresh tokens:
- Login returns `token` (1 hour) and `refresh_token` (60 days)
- Store `refresh_token` securely (HttpOnly cookie recommended)
- To refresh: `POST /auth/refresh` with `{ "refresh_token": "..." }`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/signup | Create account |
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
